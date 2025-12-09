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

 eventHistory: any[] = [];



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

  this.userService.getClientTrackingStatus(this.clientId).subscribe({
    next: (history: any[]) => {

      this.eventHistory = history.map(item => ({
        ...item,
        formattedOn: this.formatDate(item.actionedOn),
      }));

      this.isLoading = false;
    },
    error: () => {
      this.notify.error("Unable to load tracking information.");
      this.isLoading = false;
    }
  });
}

formatDate(dateInput: any): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).replace(",", "");
}


}
