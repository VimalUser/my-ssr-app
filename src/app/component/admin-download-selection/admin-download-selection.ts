import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { newclientapi } from '../../services/newclient';
import { AdminDataService } from '../../shared/admin-data-service';
import { AdminData } from '../../model/AdminData';
import { Notificationservice } from '../../services/notificationservice';
import { CommonModule } from '@angular/common';
import { AdminStatusInput } from '../../model/ClientManagement';
import { MarkAsDoneDirective } from '../../shared/mark-as-done';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin-download-selection',
  imports: [FormsModule, CommonModule, MarkAsDoneDirective],
  templateUrl: './admin-download-selection.html',
  styleUrl: './admin-download-selection.css'
})
export class AdminDownloadSelection {
  traditionalCount: any;
  candidCount: any;
  portraitFrameCount: any;
  landscapeFrameCount: any;
  coverCount: any;
  clientName: any;
  noOfPics: any;
  loading: boolean = false;
  checkboxMessage: string = '';
  isPhotoDownloadDone: boolean = false;
  progress: number = 0;

  constructor(
    private apiAdminService: newclientapi,
    private adminDataService: AdminDataService,
    private notify: Notificationservice
  ) { }

  adminData: AdminData = {} as AdminData;
  approvalComment: string = "";
  isLoading: boolean = false;
  isMarkedDone: boolean = false;

  ngOnInit(): void {

    this.adminDataService.data$.subscribe(data => {
      if (data) {
        this.adminData = data;
        this.clientName = this.adminData.clientName;
        this.traditionalCount = this.adminData.tranditionalAlbumSelection.length;
        this.candidCount = this.adminData.candidAlbumSelection.length;
        this.portraitFrameCount = this.adminData.portraitFrameSelection.length;
        this.landscapeFrameCount = this.adminData.landscapeFrameSelection.length;
        this.coverCount = this.adminData.coverSelection.length;
        this.noOfPics = this.adminData.noOfPics;
      }
    });
  }

  goBack() {
    window.history.back();
  }
  // component.ts
  download(): void {
    this.loading = true;

    this.apiAdminService.downloadpictures1(this.adminData.clientId)
      .subscribe({
        next: (blob: Blob) => {

          // Use user's local system time for filename
          const now = new Date();
          const zipFileName = `client_${this.adminData.clientName}_photos_` +
            `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_` +
            `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.zip`;

          // Create a temporary URL for the ZIP blob
          const url = window.URL.createObjectURL(blob);

          // Create a hidden <a> element to trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = zipFileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Release the object URL
          window.URL.revokeObjectURL(url);

          this.loading = false;
          this.notify.success("Download completed");
        },
        error: async (err) => {
          const errJson = await this.parseBlobError(err.error);
          this.notify.error(errJson.message);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  parseBlobError(blob: Blob): Promise<any> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(reader.result as string));
        } catch {
          resolve({ message: "Error parsing server response." });
        }
      };
      reader.readAsText(blob);
    });
  }


  async downloadnew() {
    this.loading = true;
    this.progress = 0;

    try {
      const files = await this.apiAdminService
        .getClientFiles(this.adminData.clientId)
        .toPromise();

      if (!files || files.length === 0) {
        this.notify.error('No files available for download');
        return;
      }

      const zip = new JSZip();
      const failedFiles: string[] = [];

      const MAX_PARALLEL = 5;
      let completed = 0;

      for (let i = 0; i < files.length; i += MAX_PARALLEL) {
        const batch = files.slice(i, i + MAX_PARALLEL);

        await Promise.all(
          batch.map(async (file) => {
            try {
              const response = await fetch(file.sasUrl);

              if (!response.ok) {
                console.error('Failed:', file.sasUrl, response.status);
                throw new Error(`HTTP ${response.status}`);
              }

              const blob = await response.blob();
              zip.file(file.zipPath, blob, { compression: 'STORE' });
            }
            catch (err) {
              failedFiles.push(file.zipPath);
            }

            finally {
              completed++;
              this.progress = Math.round((completed / files.length) * 100);
            }
          })
        );
      }

      // 🔹 Add failure report inside ZIP
      if (failedFiles.length > 0) {
        zip.file(
          '_failed_files.txt',
          failedFiles.join('\n')
        );
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      saveAs(zipBlob, this.buildZipFileName());

      // 🔹 User notification
      if (failedFiles.length > 0) {
        this.notify.warning(
          `Download completed with ${failedFiles.length} missing files`
        );
      } else {
        this.notify.success('Download completed successfully');
      }
    }
    catch (err) {
      this.handleApiError(err);
    }
    finally {
      this.loading = false;
    }
  }

  private buildZipFileName(): string {
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const timestamp =
      `${now.getFullYear()}` +
      `${pad(now.getMonth() + 1)}` +
      `${pad(now.getDate())}_` +
      `${pad(now.getHours())}` +
      `${pad(now.getMinutes())}` +
      `${pad(now.getSeconds())}`;

    // Optional: sanitize client name
    const clientName = (this.adminData.clientName || 'client')
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    return `client_${clientName}_photos_${timestamp}.zip`;
  }

  private handleApiError(err: any) {

    if (err.status === 404) {
      this.notify.error(err.error?.message ?? 'Client not found');
    }
    else if (err.status === 400) {
      this.notify.error(err.error?.message ?? 'Client has not submitted images');
    }
    else {
      this.notify.error('Something went wrong. Please try again.');
    }
  }

  onLoadingChange(loading: boolean) {
    this.loading = loading;
  }
  onMessageChange(msg: string) {
    this.checkboxMessage = msg;
  }
}
