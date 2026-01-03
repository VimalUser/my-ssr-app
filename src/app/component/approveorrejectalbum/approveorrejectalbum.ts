import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';
import { ActivatedRoute, Router } from '@angular/router';
import { newclientapi } from '../../services/newclient';

@Component({
  selector: 'app-approveorrejectalbum',
  imports: [CommonModule, FormsModule],
  templateUrl: './approveorrejectalbum.html',
  styleUrl: './approveorrejectalbum.css'
})
export class Approveorrejectalbum {

  constructor(
    private notify: Notificationservice,
    private userservice: newclientapi,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  errorMessage = "";
  apiResponse: any;
  status = "In Progress";
  count = 5;
  clientStatus = "In Progress";
  adminApproved = false;

  events: { name: string, date: Date, order: number }[] = [];

  rejectMode = false;
  buttonsDisabled = false;
  rejectComments = "";

  isLoading = false;
  clientId: number = 0;
  id: string = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
      this.clientId = +this.id;
    });
    if (this.id != '') {
      this.fetchData();
    }
  }
  goBack() {
    window.history.back();
  }

  fetchData(): void {
    this.isLoading = true;
    this.userservice.getAlbumDetails(this.id).subscribe({
      next: (data) => {
        // This is where you process the successful response
        this.apiResponse = data; // Assign the raw response // **Important Note on responseType: 'text'** // Since your service specifies responseType: 'text', // `data` will be a raw string. If the API returns JSON, // you might need to parse it here: this.apiResponse = JSON.parse(data);
        this.setClientStatus(this.apiResponse.clientStatus || "In Progress");
        this.setAdminApprovalStatus(this.apiResponse.adminApproved || false);
        if (data.eventList && data.eventList.length > 0) {
          data.eventList.forEach((evt: any, index: number) => {
            this.events.push({
              name: evt.name,
              date: evt.eventDate,
              order: evt.order
            });
          });
        }
        this.isLoading = false;

      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        this.errorMessage =
          'Failed to load data. Check the server or network connection.';
        this.isLoading = false;
      },
      complete: () => {
        // Optional: Executed when the Observable completes
      },
    });
  }

  approve() {
    this.buttonsDisabled = true;
    var result = window.confirm("Are you sure to approve this photo selection process?");
    if (!result) {
      this.buttonsDisabled = false;
      return;
    }
    const clientAlbum = {
      clientId: this.clientId,
      isAlbumApproved: true,
      adminRejectionComments: ""
    };

    this.isLoading = true;
    this.userservice.approveOrRejectClientAlbum(clientAlbum).subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.isLoading = false;
        this.notify.success('Client photo selection process approved successfully!');
        this.fetchData();
      },
      error: (error) => {
        this.notify.error('Failed to approve client photo selection process.');
        this.errorMessage = 'Failed to approve client photo selection process.';
        this.setAdminApprovalStatus(false);
        this.isLoading = false;
      },
    });
  }

  reject() {
    this.buttonsDisabled = true;

    var result = window.confirm("Are you sure to Resubmit this photo selection process?");
    if (!result) {
      this.buttonsDisabled = false;
      return;
    }
    const clientAlbum = {
      clientId: this.clientId,
      isAlbumApproved: false,
      adminRejectionComments: this.rejectComments
    };

    this.isLoading = true;
    this.userservice.approveOrRejectClientAlbum(clientAlbum).subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.isLoading = false;
        this.notify.success('Client photo selection process sent for resubmit successfully!');
        this.fetchData();
      },
      error: (error) => {
        this.notify.error('Failed to resubmit photo selection process.');
        this.errorMessage = 'Failed to resubmit photo selection process.';
        this.setClientStatus("In Progress");
        this.setAdminApprovalStatus(false);
        this.isLoading = false;
      },
    });
  }

  setAdminApprovalStatus(approved: boolean) {
    this.adminApproved = approved;
  }
  setClientStatus(status: string) {
    this.clientStatus = status;
  }

}
