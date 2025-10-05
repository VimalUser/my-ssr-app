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
  imports: [CommonModule, FormsModule],
  templateUrl: './admindashboard.html',
  styleUrl: './admindashboard.css',
  standalone: true,
})

export class Admindashboard implements OnInit {

  isLoading: boolean = false;
  clientData?: ClientManagement;
  errorMessage = '';
  statusList: string[] = [];
  eventList: string[] = [];
  statCards: { title: string; value: number | undefined; class: string }[] = [];
  clientDataList: DashBoardDto[] = [];
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  pageSizes = [5, 10, 20, 50];

  searchText: string = '';
  selectedStatus: string = 'All Status';
  selectedEvent: string = 'All Events';
  filteredData: DashBoardDto[] = [];

  constructor(private router: Router, private apiService: newclientapi,
    private loggingService: LoggingService,
    private notify: Notificationservice) {
    // You can initialize any required services or data here

  }
  ngOnInit(): void {
    this.fetchDashboardData();
  }
 
  filteredClientDataList(): void {
    this.filteredData = this.clientDataList.filter(client => {
      const matchesSearch = this.searchText
        ? client.clientName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        client.orderNumber.toLowerCase().includes(this.searchText.toLowerCase())
        : true;

      const matchesStatus = this.selectedStatus === 'All Status'
        ? true
        : client.progress === this.selectedStatus;

      const matchesEvent = this.selectedEvent === 'All Events'
        ? true
        : client.eventType === this.selectedEvent;

      return matchesSearch && matchesStatus && matchesEvent;
    });
  }


  fetchDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getClientManagementData(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        console.log('Dashboard data fetched:', data);
        this.totalCount = data.totalClients || 0;
        this.clientData = data;
        this.clientDataList = this.clientData?.dashBoardData || [];
        this.statCards = [
          { title: 'Total Clients', value: this.clientData?.totalClients, class: '' },
          { title: 'Completed Projects', value: this.clientData?.completedProject, class: 'text-success' },
          { title: 'In Progress', value: this.clientData?.inprogressProject, class: 'text-warning' },
          { title: 'Photos Selected', value: 0, class: 'text-primary' }
        ];
        this.statusList = [...new Set(this.clientData.dashBoardData?.map(item => item.progress) || [])];
        this.eventList = [...new Set(this.clientData.dashBoardData?.map(item => item.eventType) || [])];

        // Apply filter after loading
        this.filteredClientDataList();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = this.mapError(err);
        if (this.errorMessage != '') {
          this.notify.error(this.errorMessage);
        }
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchDashboardData();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1;
    this.fetchDashboardData();
  }


  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
  getPhotoPercentage(totalPhotos: number, selectedPhotos: number): number {
    if (!totalPhotos || totalPhotos === 0) {
      return 0; // avoid divide by zero
    }
    return Math.round((selectedPhotos / totalPhotos) * 100);
  }

  onSearchChange(event: any) {
    this.searchText = event.target.value;
    this.filteredClientDataList();
  }

  onStatusChange(event: any) {
    this.selectedStatus = event.target.value;
    this.filteredClientDataList();
  }

  onEventChange(event: any) {
    this.selectedEvent = event.target.value;
    this.filteredClientDataList();
  }

  private mapError(err: any): string {
    if (err.status === 404) return 'Dashboard data not found.';
    if (err.status === 401) return 'Unauthorized: Please log in again.';
    if (err.status === 403) return 'Forbidden: You do not have permission.';
    return '';
  }


  viewClientInfo(id: number | null) {
    this.router.navigate(['admindashboard/adminactions', id?.toString()]);
  }

}


