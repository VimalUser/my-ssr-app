import { Component, OnInit } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { clientData } from '../../model/clientData';
import { Router } from '@angular/router';
import { userserviceapi } from '../../services/userservice';
import { Notificationservice } from '../../services/notificationservice';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-useralbumsubmitform',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './useralbumsubmitform.html',
  styleUrl: './useralbumsubmitform.css',
})
export class Useralbumsubmitform implements OnInit {
  constructor(
    private clientDataService: ClientDataService,
    private router: Router,
    private userservice: userserviceapi,
    private notify: Notificationservice,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  clientData: clientData = new clientData();
  loading: boolean = false;
  acks = {
    terms: false,
    privacy: false,
    final: false,
  };

  userComments = '';

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(5);
    this.loading = true;
    const data = this.clientDataService.getData();
    this.clientData = data;
    this.loading = false;
  }

  submissionForm() {
    if (!this.allAcknowledged) {
      this.notify.warning(
        'Please confirm all acknowledgments before submitting.'
      );
      return;
    }

    this.loading = false;
    const data: clientData = this.clientDataService.getData();
    const updated: clientData = {
      ...data,
      status: 'Completed',
      clientReviewComments: this.clientData.clientReviewComments,
      isSubmitted: true,

    };

    this.clientDataService.updateData(updated);
    this.apiCalltoSave(updated);
  }

  get allAcknowledged(): boolean {
    return Object.values(this.acks).every((v) => v === true);
  }

  apiCalltoSave(updateData: clientData) {
    this.loading = true;

    // -----------------------------------
    // CASE 1: COMPLETED → create PDF
    // -----------------------------------
    if (updateData.status?.toLowerCase() === 'completed') {

      this.userservice.submitAlbumDetailsAndDownloadPdf(updateData)
        .subscribe({
          next: (response) => {
            this.notify.success('Your data saved successfully!');
            this.displaySubmittedSection();

            const blob = new Blob([response.body!], { type: 'application/pdf' });
            const fileName = this.getFileNameFromResponse(response) || 'album-submission-details.pdf';

            this.downloadBlob(blob, fileName);
            this.loading = false;
          },
          error: () => {
            this.notify.error('Failed to save your data!');
            this.loading = false;
          }
        });

      return; // stop execution here
    }

    // -----------------------------------
    // CASE 2: NOT COMPLETED → save only
    // -----------------------------------
    this.userservice.saveUserAlbumDetails(updateData)
      .subscribe({
        next: (message) => {
          this.notify.success(message || 'Your data saved successfully!');
          this.displaySubmittedSection();
          this.loading = false;
        },
        error: () => {
          this.notify.error('Failed to save your data!');
          this.loading = false;
        }
      });
  }


  displaySubmittedSection() {
    const submitFormSection = document.getElementById('submitFormSectionMain');
    const submissionConfirmation = document.getElementById(
      'submissionConfirmation'
    );

    if (submitFormSection && submissionConfirmation) {
      submitFormSection.style.display = 'none';
      submissionConfirmation.style.display = 'block'; // Show selection section
    }
  }

  prevStep() {
    this.clientDataService.triggerNextStep(4);
  }

  nextStep() {
    this.clientDataService.triggerNextStep(4);
  }

  async pdfDownload() {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip PDF generation on server
    }

    const element = document.getElementById('submitFormSection');
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;

    const opt: any = {
      margin: 10,
      filename: 'album-submission-details.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  private getFileNameFromResponse(response: any): string | null {
    const contentDisposition = response.headers?.get('Content-Disposition');
    if (!contentDisposition) return null;

    const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
    return match && match[1] ? match[1] : null;
  }
}
