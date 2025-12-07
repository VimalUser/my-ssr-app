import { Component } from '@angular/core';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-history',
  imports: [CommonModule],
  templateUrl: './client-history.html',
  styleUrl: './client-history.css'
})
export class ClientHistory {

  trackingData: { [key: string]: boolean } | null = null;
  // trackingData = {
  //   loginSent: true,
  //   selectionStarted: true,
  //   selectionCompleted: false,
  //   adminDownloaded: false,
  //   adminReviewed: false
  // };

  trackingSteps = [
    { key: 'loginSent', label: 'Login credentials sent to client' },
    { key: 'selectionStarted', label: 'Client started photo selection process' },
    { key: 'selectionCompleted', label: 'Client completed photo selection process' },
    { key: 'adminDownloaded', label: 'Admin downloaded the client submitted photos' },
    { key: 'adminReviewed', label: 'Admin reviewed client comments' }
  ];


  isLoading = false;
  clientId: number = 0;
  id: string = '';

  constructor(
    private notify: Notificationservice,
    private userService: userserviceapi,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
      this.clientId = +this.id;
    });
    if (this.id != '') {
      this.loadTrackingData();
    }
  }

  goBack() {
    window.history.back();
  }

  loadTrackingData() {
    this.isLoading = true;
    this.userService.getTrackingStatus(this.clientId).subscribe({
      next: (data : any) => {
        this.trackingData = data;  
        this.isLoading = false;
      },
      error: () => {
        this.notify.error("Unable to load tracking information.");
        this.isLoading = false;
      }
    });
  }


}
