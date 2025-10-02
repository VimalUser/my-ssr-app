import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationError,
} from '@angular/router';
import { newclientapi } from '../../services/newclient';
import { inject } from '@angular/core';
import { ClientAlbum } from '../../model/ClientAlbum';
import { LoggingService } from '../../shared/logging.service';
import { ClientManagement, DashBoardDto } from '../../model/ClientManagement';
import { Notificationservice } from '../../services/notificationservice';



interface Client {
  orderNo: string;
  name: string;
  eventType: string;
  totalPhotos: number;
  selected: number;
  percentage: number;
  status: string;
}

@Component({
  selector: 'app-admindashboard',
  imports: [CommonModule,FormsModule],
  templateUrl: './admindashboard.html',
  styleUrl: './admindashboard.css',
  standalone: true,
})

export class Admindashboard  implements OnInit {

  isLoading: boolean = false;
clientData?: ClientManagement;
errorMessage = '';
statusList: string[] = [];
eventList: string[] = [];
statCards: { title: string; value: number | undefined; class: string }[] = [];
clientDataList: DashBoardDto[] = [];
    constructor(private router: Router, private apiService: newclientapi,
    private loggingService: LoggingService, 
  private notify:Notificationservice) {
    // You can initialize any required services or data here
    
}
  ngOnInit(): void {
    this.fetchDashboardData();
  }
 clients: Client[] = [
    { orderNo: 'PH-2024-001', name: 'Sarah & Michael Johnson', eventType: 'Wedding', totalPhotos: 450, selected: 120, percentage: 27, status: 'Completed' },
    { orderNo: 'PH-2024-002', name: 'Emily Chen', eventType: 'Engagement', totalPhotos: 280, selected: 85, percentage: 30, status: 'In Progress' },
    { orderNo: 'PH-2024-003', name: 'David & Lisa Rodriguez', eventType: 'Reception', totalPhotos: 520, selected: 0, percentage: 0, status: 'Yet to Start' },
    { orderNo: 'PH-2024-004', name: 'Jessica Thompson', eventType: 'Pre Wedding', totalPhotos: 180, selected: 60, percentage: 33, status: 'In Progress' },
    { orderNo: 'PH-2024-005', name: 'Marcus & Jennifer Davis', eventType: 'Wedding', totalPhotos: 380, selected: 95, percentage: 25, status: 'Completed' },
    { orderNo: 'PH-2024-006', name: 'Amanda Wilson', eventType: 'Baby Shower', totalPhotos: 150, selected: 45, percentage: 30, status: 'In Progress' }
  ];

 

 
  searchText = '';
  selectedStatus = '';
  selectedEvent = '';

  get filteredClients(): Client[] {
    return this.clients.filter(client => {
      const matchesSearch =
        !this.searchText ||
        client.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        client.orderNo.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus =
        !this.selectedStatus || client.status === this.selectedStatus;

      const matchesEvent =
        !this.selectedEvent || client.eventType === this.selectedEvent;

      return matchesSearch && matchesStatus && matchesEvent;
    });
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getClientManagementData().subscribe({
      next: (data) => {
        console.log('Dashboard data fetched:', data);
        this.clientData = data;
        this.clientDataList = this.clientData?.dashBoardData || [];
         this.statCards = [
    { title: 'Total Clients', value: this.clientData?.totalClients, class: '' },
    { title: 'Completed Projects', value: this.clientData?.completedProject, class: 'text-success' },
    { title: 'In Progress', value: this.clientData?.inprogressProject, class: 'text-warning' },
    { title: 'Photos Selected', value: 0, class: 'text-primary' }
  ];
   this.statusList = [...new Set(this.clientData.dashBoardData?.map(item => item.progress) || [])];
this.eventList  = [...new Set(this.clientData.dashBoardData?.map(item => item.eventType) || [])];


        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = this.mapError(err);
        if (this.errorMessage != '')
        {
        this.notify.error(this.errorMessage);
        }
        this.isLoading = false;
      }
    });
  }

  getPhotoPercentage(totalPhotos: number, selectedPhotos: number): number {
  if (!totalPhotos || totalPhotos === 0) {
    return 0; // avoid divide by zero
  }
  return Math.round((selectedPhotos / totalPhotos) * 100);
}

  private mapError(err: any): string {
    if (err.status === 404)  return 'Dashboard data not found.';
    if (err.status === 401) return 'Unauthorized: Please log in again.';
    if (err.status === 403) return 'Forbidden: You do not have permission.';
    return '';
  }

  
  viewClientInfo(id: number | null) {
    alert('View order functionality to be implemented for order ID: ' + id?.toString());
    this.router.navigate(['admindashboard/adminactions', id?.toString()]);
  }

}
  

