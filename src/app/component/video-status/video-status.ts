import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { newclientapi } from '../../services/newclient';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Notificationservice } from '../../services/notificationservice';

@Component({
  selector: 'app-video-status',
  imports: [FormsModule, CommonModule],
  templateUrl: './video-status.html',
  styleUrl: './video-status.css'
})
export class VideoStatus implements OnInit  {
  videoStatuses = [
    'Video editing started',
    'Video editing completed',
    'Sent for Approval',
    'Video Approved'
  ];

  selectedStatus = '';
  isLoading: boolean = false;
  id: string = '';
  clientId: number = 0;
  apiResponse: any;
  errorMessage: string | null = null;

  private apiService = inject(newclientapi);

  constructor(private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notify: Notificationservice
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
      this.clientId = +this.id;
    });
    if (this.id != '') {
      this.fetchData();
    }
  }

  fetchData() {
    console.log('Fetching data from API...');
    this.isLoading = true;
    this.apiService.getAlbumDetails(this.id).subscribe({
      next: (data) => {
        console.log('Fetching data from API...' + data);
        // This is where you process the successful response
        this.apiResponse = data;
        this.selectedStatus = data.videoStatus;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.errorMessage =
          'Failed to load data. Check the server or network connection.';
        this.isLoading = false;
      },
      complete: () => {
        console.log('Data fetching complete.');
      },
    });
  }

  saveVideoStatus() {
    if (!this.selectedStatus) {
      alert('Please select a status before saving.');
      return;
    }
    // You can also call an API here to save
    this.isLoading = true;
    this.apiService.saveVideoStatus(this.id, this.selectedStatus).subscribe({
      next: (data) => {
        console.log('Data:', data);
        this.isLoading = false;
        this.notify.success('Video status saved successfully.');
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

  goBack() {
    history.back();
  }
}
