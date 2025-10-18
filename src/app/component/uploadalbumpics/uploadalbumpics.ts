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

@Component({
  selector: 'app-uploadalbumpics',
  standalone: true,
  imports: [
    CommonModule, // Required for ngIf, ngFor etc.
    FormsModule, // Needed for template-driven forms
    ReactiveFormsModule, // Needed for reactive forms
    MarkAsDoneDirective
  ],
  templateUrl: './uploadalbumpics.html',
  styleUrl: './uploadalbumpics.css',
})
export class Uploadalbumpics implements OnInit {
  clientData: any;
  allowedTypes = environment.allowedImageTypes.join(',');
  allowedTypesMessage = `Only ${this.allowedTypes.toUpperCase()} formats are supported`;
  readonly MAX_FILE_SIZE_MB = 500; // 500 MB
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_MB * 1024 * 1024;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private notify: Notificationservice,
    private cdr: ChangeDetectorRef
  ) {

  }


  private apiService = inject(newclientapi);

  // Data from a hypothetical API, simulating how many images are already uploaded
  public traditionalPhotosCount = 0;
  public candidPhotosCount = 0;
  public loginCoverPhotosCount = 0;

  // Store the selected files for each category
  public selectedTraditionalFiles: File[] = [];
  public selectedCandidFiles: File[] = [];
  public selectedLoginCoverFiles: File[] = [];

  clientId: string = '';
  clientIdNumber: number = 0;
  public loading: boolean = false;

  ngOnInit(): void {

    this.route.paramMap.subscribe((params) => {
      this.clientId = params.get('id') ?? '';
      this.clientIdNumber = +this.clientId;
    });
    this.loadClientData();
  }

  goBack() {
    window.history.back();
  }

  loadClientData() {
    this.loading = true; // start loading
    this.cdr.detectChanges();
    this.apiService.getClientFolderCounts(+(this.clientId))
      .pipe(finalize(() => this.loading = false)) // always hide spinner after completion
      .subscribe({
        next: res => {
          this.clientData = res.client;
          this.traditionalPhotosCount = res.folderCounts?.traditional || 0;
          this.candidPhotosCount = res.folderCounts?.candid || 0;
          this.loginCoverPhotosCount = res.folderCounts?.logincover || 0; // updated key
        },
        error: err => {
          this.notify.error('Error fetching folder counts');
          console.error('Error fetching folder counts', err);
        }
      });
  }


  // Handles file selection from the input
  onFileSelected(event: any, category: string): void {
    const files = event.target.files;

    if (files && files.length > 0) {
      const allowedExtensions = this.allowedTypes;
      const fileArray: File[] = Array.from(files);

      const validFiles: File[] = [];
      const invalidTypeFiles: string[] = [];
      const tooLargeFiles: string[] = [];

      for (const file of fileArray) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();

        // 1️⃣ Check file type
        const isTypeValid = allowedExtensions.includes(ext);

        // 2️⃣ Check file size
        const isSizeValid = file.size <= this.MAX_FILE_SIZE_BYTES;

        if (!isTypeValid) {
          invalidTypeFiles.push(file.name);
        } else if (!isSizeValid) {
          tooLargeFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        } else {
          validFiles.push(file);
        }
      }

      // 🔴 Show combined error messages
      if (invalidTypeFiles.length > 0) {
        this.notify.error(
          `Only ${allowedExtensions} formats are supported.\nInvalid: ${invalidTypeFiles.join(', ')}`
        );
      }

      if (tooLargeFiles.length > 0) {
        this.notify.error(
          `These files exceed the ${this.MAX_FILE_SIZE_MB} MB limit:\n${tooLargeFiles.join('\n')}`
        );
      }

      // ✅ Add only valid files
      if (validFiles.length > 0) {
        switch (category) {
          case 'traditional':
            this.selectedTraditionalFiles = [
              ...this.selectedTraditionalFiles,
              ...validFiles,
            ];
            break;
          case 'candid':
            this.selectedCandidFiles = [
              ...this.selectedCandidFiles,
              ...validFiles,
            ];
            break;
          case 'loginCover':
            this.selectedLoginCoverFiles = [
              ...this.selectedLoginCoverFiles,
              ...validFiles,
            ];
            break;
        }
      }

      // Reset input so user can reselect the same file again
      event.target.value = '';
    }
  }

  // Triggers the API call to upload the selected images
  onUpload(category: string): void {
    let filesToUpload: File[] = [];
    switch (category) {
      case 'traditional':
        filesToUpload = this.selectedTraditionalFiles;
        break;
      case 'candid':
        filesToUpload = this.selectedCandidFiles;
        break;
      case 'loginCover':
        filesToUpload = this.selectedLoginCoverFiles;
        break;
    }

    if (filesToUpload.length > 0) {

      // Combine all files into one array
      const allFiles = [
        ...this.selectedTraditionalFiles,
        ...this.selectedCandidFiles,
        ...this.selectedLoginCoverFiles
      ];

      // Compute total size in bytes
      const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

      if (totalSize > this.MAX_FILE_SIZE_BYTES) {
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        this.notify.error(
          `Total file size is ${totalSizeMB} MB. Maximum allowed size is ${this.MAX_FILE_SIZE_MB} MB.`
        );
        return;
      }

      this.loading = true;
      const formData = new FormData();
      for (const file of filesToUpload) {
        formData.append('files', file, file.name);
      }

      this.apiService.uploadImages(formData, category, +(this.clientId)).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.notify.success(`Upload successful for ${category}`);
          console.log(`Upload successful for ${category}:`, response);
          // Clear the selection ONLY after a successful upload
          this.clearSelection(category);
          // Optional: Re-fetch counts from the API to update the UI
          this.loadClientData();
        },
        error: (error: any) => {
          this.loading = false;
          this.notify.error(`Upload failed for ${category}`);
          console.error(`Upload failed for ${category}:`, error);
          // Do not clear the selection if the upload fails
        }
      });
    } else {
      this.loading = false;
      this.notify.warning('No files selected to upload.');
      console.warn('No files selected to upload.');
    }
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
    }
  }

  onDeleteAll(category: string): void {
    const confirmDelete = confirm(
      `Are you sure to delete all the ${category} images?`
    );
    if (!confirmDelete) {
      return;
    }
    this.loading = true;
    this.apiService.deleteImages(category, +this.clientId).subscribe({
      next: (response: any) => {
        console.log('Delete response:', response);
        this.notify.success(`All ${category} images deleted.`);
        this.loading = false;
        this.loadClientData();
      },
      error: (error: any) => {
        this.notify.error(`Failed to delete ${category} images.`);
        this.loading = false;
      }
    });

  }

   onLoadingChange(loading: boolean) {
    console.log('Loading state changed upload pics:', loading);
    this.loading = loading;
  }
}
