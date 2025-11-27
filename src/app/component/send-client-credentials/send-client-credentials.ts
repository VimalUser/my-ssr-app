import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { newclientapi } from '../../services/newclient';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Notificationservice } from '../../services/notificationservice';
import { CommonModule } from '@angular/common';
import { MarkAsDoneDirective } from '../../shared/mark-as-done';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-send-client-credentials',
  imports: [CommonModule, MarkAsDoneDirective, FormsModule],
  templateUrl: './send-client-credentials.html',
  styleUrl: './send-client-credentials.css'
})
export class SendClientCredentials {

  // Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  id: string = '';
  clientId: number = 0;
  accesslink: string = '';
  passcode: string = '';
  clientPhoneNo: string = '';
  checkboxMessage: string = '';
  isLoginSentDone: boolean = false;
  expiryDate: string | null = null; // bind to date picker
  today: string = '';

  private apiService = inject(newclientapi);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
      this.clientId = +this.id;
    });
    if (this.id != '') {
      this.fetchData();
      const now = new Date();
      this.today = now.toISOString().split('T')[0]; // yyyy-MM-dd
    }
  }
  goBack() {
    window.history.back();
  }

  // This is the single, combined constructor
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notify: Notificationservice
  ) {
  }

  fetchData(): void {
    console.log('Fetching data from API...');
    this.isLoading = true;
    this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.apiService.getAlbumDetails(this.id).subscribe({
      next: (data) => {
        console.log('Fetching data from API...' + data);
        // This is where you process the successful response
        console.log('API Response:', data);
        console.log('Access Link:', data.accessLink);
        console.log('Passcode:', data.passcode);
        console.log('Mobile Number:', data.mobileNumber);
        this.accesslink = data.accessLink;
        this.passcode = data.passcode;
        this.clientPhoneNo = data.mobileNumber;
        this.expiryDate = data.expiryDate ? this.formatDate(data.expiryDate) : '';
        this.apiResponse = data;
        this.isLoading = false;

      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        console.error('There was an error!', error);
        this.errorMessage =
          'Failed to load data. Check the server or network connection.';
        this.isLoading = false;
      },
      complete: () => {
        // Optional: Executed when the Observable completes
        console.log('Data fetching complete.');
      },
    });
  }

  formatDate(dateString: any): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}


  copyToClipboard(inputControlName: string, event: MouseEvent): void {
    event.preventDefault(); // Prevent form submission/navigation if the button is inside a form
    // 1. Get the value from the form control
    const valueToCopy = inputControlName === 'accessLink' ? this.accesslink : this.passcode;

    if (valueToCopy) {
      // 2. Use the modern Clipboard API
      navigator.clipboard.writeText(valueToCopy).then(() => {
        console.log(`Copied ${inputControlName} successfully:`, valueToCopy);

        // Optional: Provide visual feedback (e.g., a toast or temporary icon change)
        const button = (event.target as HTMLElement).closest('button');
        if (button) {
          button.classList.add('btn-success');
          setTimeout(() => {
            button.classList.remove('btn-success');
          }, 1000);
        }

      }).catch(err => {
        console.error('Could not copy text: ', err);
        // Fallback or error handling
      });
    }
  }


  sendWhatsAppMessage() {
    if (!this.expiryDate) return;
    console.log('Sending credentials via WhatsApp for date:', this.expiryDate);
    const message = `Hello! 
                      \n Warm welcome from CandyExpress Photography.
                      \n You can start your photos selection process using below access link and passcode.
                      \n Your access link: ${this.accesslink}
                      \n Passcode: ${this.passcode}
                      \n Link Expiry Date: ${this.expiryDate}
                      \n In case of any issues, feel free to reach out to us.`;
    const url = `https://wa.me/${this.clientPhoneNo}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }
  onLoadingChange(loading: boolean) {
    console.log('Loading state changed:', loading);
    this.isLoading = loading;
  }
  onMessageChange(msg: string) {
    this.checkboxMessage = msg;
  }
  saveExpiryDate() {
    if (!this.expiryDate) {
      alert('Please select a date before saving.');
      return;
    }
    // You can also call an API here to save
    console.log('Saved Expiry Date:', this.expiryDate);
    this.isLoading = true;
    this.apiService.saveExpiryDate(this.id, this.expiryDate).subscribe({
      next: (data) => {
        console.log('Data:', data);
        this.isLoading = false;
        this.notify.success('Link Expiry date saved successfully.');
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        console.error('There was an error!', error);
        this.errorMessage =
          'Failed to save Link Expiry date. Check the server or network connection.';
        this.notify.error(this.errorMessage);
        this.isLoading = false;
      },
      complete: () => {
        // Optional: Executed when the Observable completes
        //console.log('Data fetching complete.');
      },
    });
  }
}
