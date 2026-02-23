import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Also needed for common directives
import { newclientapi } from '../../services/newclient';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Notificationservice } from '../../services/notificationservice';
import { finalize, firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MarkAsDoneDirective } from '../../shared/mark-as-done';
import { BlockBlobClient } from '@azure/storage-blob';

@Component({
  selector: 'app-uploadalbumpics',
  standalone: true,
  imports: [
    CommonModule, // Required for ngIf, ngFor etc.
    FormsModule, // Needed for template-driven forms
    ReactiveFormsModule, // Needed for reactive forms
    MarkAsDoneDirective,
  ],
  templateUrl: './uploadalbumpics.html',
  styleUrl: './uploadalbumpics.css',
})
export class Uploadalbumpics implements OnInit {
  clientData: any;
  allowedTypes = environment.allowedImageTypes.join(',');
  allowedTypesMessage = `Only ${this.allowedTypes.toUpperCase()} formats are supported`;
  readonly MAX_FILE_SIZE_MB = 2304; // 2 GB
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_MB * 1024 * 1024;
  checkboxMessage: string = '';
  isPhotoUploadDone: boolean = false;
  uploading = false;
  fileProgress: any[] = [];
  overallProgress = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private notify: Notificationservice,
    private cdr: ChangeDetectorRef,
  ) {}

  private apiService = inject(newclientapi);

  // Data from a hypothetical API, simulating how many images are already uploaded
  public traditionalPhotosCount = 0;
  public candidPhotosCount = 0;
  public loginCoverPhotosCount = 0;
  public zipFilesCount = 0;
  // Store the selected files for each category
  public selectedTraditionalFiles: File[] = [];
  public selectedCandidFiles: File[] = [];
  public selectedLoginCoverFiles: File[] = [];
  public selectedZipFiles: File[] = [];

  clientId: string = '';
  clientIdNumber: number = 0;
  public loading: boolean = false;

  selectedCamera: any = {
    traditional: '',
    candid: '',
    loginCover: '',
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.clientId = params.get('id') ?? '';
      this.clientIdNumber = +this.clientId;
    });
    this.loadClientData();
  }

  onCameraChange(section: string) {
    // Clear previously selected files when camera changes
    if (section === 'traditional') this.selectedTraditionalFiles = [];
    if (section === 'candid') this.selectedCandidFiles = [];
  }

  goBack() {
    window.history.back();
  }

  loadClientData() {
    this.loading = true; // start loading
    this.cdr.detectChanges();
    this.apiService
      .getClientFolderCounts(+this.clientId)
      .pipe(finalize(() => (this.loading = false))) // always hide spinner after completion
      .subscribe({
        next: (res) => {
          this.clientData = res.client;
          this.traditionalPhotosCount = res.folderCounts?.traditional || 0;
          this.candidPhotosCount = res.folderCounts?.candid || 0;
          this.loginCoverPhotosCount = res.folderCounts?.logincover || 0; // updated key
          this.zipFilesCount = res.folderCounts?.zip || 0; // new key for zip files
          this.loading = false;
        },
        error: (err) => {
          this.notify.error('Error fetching folder counts');
          this.loading = false;
        },
      });
  }
  onFileSelected(event: any, category: string): void {
    const files = Array.from(event.target.files) as File[];

    const allowedExt = this.allowedTypes;

    const valid: File[] = [];
    const invalid: string[] = [];

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExt.includes(ext)) invalid.push(file.name);
      else valid.push(file);
    }

    if (invalid.length)
      this.notify.error(`Invalid formats: ${invalid.join(', ')}`);

    if (valid.length) {
      if (category === 'traditional')
        this.selectedTraditionalFiles.push(...valid);
      else if (category === 'candid') this.selectedCandidFiles.push(...valid);
      else if (category === 'loginCover')
        this.selectedLoginCoverFiles.push(...valid)
      else if (category === 'zip') this.selectedZipFiles.push(...valid);
    }

    event.target.value = '';
  }

  async onUpload(category: string, camera: string) {
    let files: File[] = [];

    if (category === 'traditional') files = this.selectedTraditionalFiles;
    else if (category === 'candid') files = this.selectedCandidFiles;
    else if (category === 'loginCover') files = this.selectedLoginCoverFiles
    else if(category === 'zip') files = this.selectedZipFiles;

    if (!files.length) {
      this.notify.warning('No files selected.');
      return;
    }

    this.loading = true;

    this.apiService.getUploadSas(+this.clientId, category, camera).subscribe({
      next: async (res: any) => {
        try {
          await this.uploadFilesDirect(res.containerSasUrl, res.prefix, files);
          this.notify.success(`Upload successful for ${category}`);
          this.clearSelection(category);
          this.loadClientData();
        } catch (err) {
          console.error(err);
          this.notify.error(`Upload failed for ${category}`);
        } finally {
          this.loading = false;
        }
      },
      error: (err) => {
        this.notify.error('Failed to create upload session');
        this.loading = false;
      },
    });
  }

  async uploadFilesDirect(
    containerSasUrl: string,
    prefix: string,
    files: File[],
  ) {
    this.uploading = true;
    this.fileProgress = files.map((f) => ({
      name: f.name,
      progress: 0,
      loaded: 0,
      total: f.size,
      status: 'uploading',
    }));

    const totalSize = files.reduce((s, f) => s + f.size, 0);
    let uploadedTotal = 0;

    const updateOverall = () => {
      this.overallProgress = (uploadedTotal / totalSize) * 100;
    };

    const concurrency = 5;
    const queue = [...files];
    const tasks = [];

    const worker = async () => {
      while (queue.length) {
        const file = queue.shift();
        if (!file) return;

        const [baseUrl, sasToken] = containerSasUrl.split('?');

        const blobUrl = `${baseUrl}/${encodeURIComponent(prefix + file.name)}?${sasToken}`;
        const blobClient = new BlockBlobClient(blobUrl);
        const pf = this.fileProgress.find((x) => x.name === file.name);

        try {
          await blobClient.uploadBrowserData(file, {
            blockSize: 4 * 1024 * 1024,
            concurrency: 4,

            onProgress: (ev) => {
              pf.loaded = ev.loadedBytes;
              pf.progress = (ev.loadedBytes / file.size) * 100;

              uploadedTotal = this.fileProgress.reduce(
                (sum, fp) => sum + fp.loaded,
                0,
              );
              updateOverall();
            },
          });

          pf.progress = 100;
          pf.status = 'completed';
        } catch (err) {
          console.error(err);
          pf.status = 'failed';
          throw err;
        }
      }
    };

    for (let i = 0; i < concurrency; i++) tasks.push(worker());

    await Promise.all(tasks);

    this.uploading = false;
  }

  // Helper method to clear selected files
  private clearSelection(category: string): void {
    switch (category) {
      case 'traditional':
        this.selectedTraditionalFiles = [];
        break;
      case 'candid':
        this.selectedCandidFiles = [];
        break;
      case 'loginCover':
        this.selectedLoginCoverFiles = [];
        break;
        case 'zip':
          this.selectedZipFiles = [];
          break;
    }
  }

  async onDeleteAll(category: string) {
    const confirmDelete = await this.notify.confirm(
      `Are you sure to delete all the ${category} images?`,
    );
    if (!confirmDelete) {
      return;
    }
    this.loading = true;
    this.apiService.deleteImages(category, +this.clientId).subscribe({
      next: (response: any) => {
        this.notify.success(`All ${category} images deleted.`);
        this.loading = false;
        this.loadClientData();
      },
      error: (error: any) => {
        this.notify.error(
          `Failed to delete ${category} images. ${error.error.message}`,
        );
        this.loading = false;
      },
    });
  }

  onLoadingChange(loading: boolean) {
    // this.loading = loading;
    this.cdr.detectChanges();
  }
  onMessageChange(msg: string) {
    this.checkboxMessage = msg;
  }
}
