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

@Component({
  selector: 'app-uploadalbumpics',
  standalone: true,
  imports: [
    CommonModule, // Required for ngIf, ngFor etc.
    FormsModule, // Needed for template-driven forms
    ReactiveFormsModule, // Needed for reactive forms
  ],
  templateUrl: './uploadalbumpics.html',
  styleUrl: './uploadalbumpics.css',
})
export class Uploadalbumpics implements OnInit {
  clientData: any;
  allowedTypes = environment.allowedImageTypes.join(',');
  allowedTypesMessage = `Only ${this.allowedTypes.toUpperCase()} formats are supported`;

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
  public loading: boolean = false;

  ngOnInit(): void {

    this.route.paramMap.subscribe((params) => {
      this.clientId = params.get('id') ?? '';
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

      // Separate valid and invalid files
      const validFiles = fileArray.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return allowedExtensions.includes(ext);
      });

      const invalidFiles = fileArray.filter(file => !validFiles.includes(file));

      // Show error if any invalid files
      if (invalidFiles.length > 0) {
        this.notify.error('Only JPG, JPEG, PNG formats are supported');
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

      // Reset file input to allow selecting same file again
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
}
