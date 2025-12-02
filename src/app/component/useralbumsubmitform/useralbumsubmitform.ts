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
  styleUrl: './useralbumsubmitform.css'
})
export class Useralbumsubmitform implements OnInit {

  constructor(private clientDataService: ClientDataService,
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
    final: false
  };


  ngOnInit(): void {
    this.clientDataService.triggerNextStep(5);

    this.loading = true;
    const data = this.clientDataService.getData();
    this.clientData = data;
    this.loading = false;
    console.log('Initial Client Data in Useralbumsubmitform:', data);
  }

  submissionForm() {

    if (!this.allAcknowledged) {
      this.notify.warning('Please confirm all acknowledgments before submitting.');
      return;
    }

    this.loading = false;
    const data: clientData = this.clientDataService.getData();
    const updated: clientData = {
      ...data,
      status: 'Completed',
      isSubmitted: true,
    };

    this.clientDataService.updateData(updated);
    this.apiCalltoSave(updated);


  }



  get allAcknowledged(): boolean {
    return Object.values(this.acks).every(v => v === true);
  }


  apiCalltoSave(updateData: clientData) {
    console.log('Payload sent to API:', JSON.stringify(updateData, null, 2));

    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.notify.success('Your data saved successfully!');
        this.displaySubmittedSection();
        this.pdfDownload();
        this.loading = false;
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.notify.error('Failed to save your data!');
        this.loading = false;
      },
    });
  }

  displaySubmittedSection() {

    const submitFormSection = document.getElementById('submitFormSectionMain');
    const submissionConfirmation = document.getElementById('submissionConfirmation');

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
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  }

}
