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

export class Admindashboard  {
 clients: Client[] = [
    { orderNo: 'PH-2024-001', name: 'Sarah & Michael Johnson', eventType: 'Wedding', totalPhotos: 450, selected: 120, percentage: 27, status: 'Completed' },
    { orderNo: 'PH-2024-002', name: 'Emily Chen', eventType: 'Engagement', totalPhotos: 280, selected: 85, percentage: 30, status: 'In Progress' },
    { orderNo: 'PH-2024-003', name: 'David & Lisa Rodriguez', eventType: 'Reception', totalPhotos: 520, selected: 0, percentage: 0, status: 'Yet to Start' },
    { orderNo: 'PH-2024-004', name: 'Jessica Thompson', eventType: 'Pre Wedding', totalPhotos: 180, selected: 60, percentage: 33, status: 'In Progress' },
    { orderNo: 'PH-2024-005', name: 'Marcus & Jennifer Davis', eventType: 'Wedding', totalPhotos: 380, selected: 95, percentage: 25, status: 'Completed' },
    { orderNo: 'PH-2024-006', name: 'Amanda Wilson', eventType: 'Baby Shower', totalPhotos: 150, selected: 45, percentage: 30, status: 'In Progress' }
  ];

  statusList = ['Completed', 'In Progress', 'Yet to Start'];
  eventList = ['Wedding', 'Engagement', 'Reception', 'Pre Wedding', 'Baby Shower'];

  statCards = [
    { title: 'Total Clients', value: this.clients.length, class: '' },
    { title: 'Completed Projects', value: this.clients.filter(c => c.status === 'Completed').length, class: 'text-success' },
    { title: 'In Progress', value: this.clients.filter(c => c.status === 'In Progress').length, class: 'text-warning' },
    { title: 'Photos Selected', value: this.clients.reduce((acc, c) => acc + c.selected, 0), class: 'text-primary' }
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
}
 
  
  // String(arg0: number | null): string | null {
  //   throw new Error('Method not implemented.');
  // }
  // activeTab: string = 'progress';

  // constructor(private router: Router, private loggingService: LoggingService) {}

  // // Declare variables to hold the data and potential errors
  // apiResponse: any;
  // errorMessage: string | null = null;
  // isLoading: boolean = false;
  // orders: ClientAlbum[] = [];

  // private apiService = inject(newclientapi);
  // ngOnInit(): void {
  //   this.fetchData();
  // }

  // tabs = [
  //   { key: 'progress', label: 'Progress', count: 124 },
  //   { key: 'completed', label: 'Completed', count: 124 },
  //   { key: 'cancelled', label: 'Cancelled', count: 124 },
  // ];

  // get filteredOrders() {
  //   switch (this.activeTab) {
  //     case 'progress':
  //       return this.orders.filter(
  //         (order) =>
  //           order.clientStatus === 'Yet to start' || order.clientStatus === 'Progressing'
  //       );
  //     case 'completed':
  //       return this.orders.filter((order) => order.clientStatus === 'Completed');
  //     case 'cancelled':
  //       return this.orders.filter((order) => order.clientStatus === 'Cancelled');
  //     default:
  //       return this.orders;
  //   }
  // }

  // createnew() {
  //   alert('Create new client album functionality to be implemented.');
  //   this.router.navigate(['/newclient']);
  // }

  // setTab(tabKey: string) {
  //   this.activeTab = tabKey;
  // }

  // fetchData(): void {
  
  //   console.log('Fetching data from API...');
  //   this.isLoading = true;
  //   this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
  //   this.apiService.getAllClientDetails().subscribe({
  //     next: (data) => {
  //       // This is where you process the successful response
  //       console.log('API Response:', data);
  //       this.orders = data;
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       // This is executed if the request fails (e.g., 404, 500)
  //       // this.loggingService.validateLoginFailure(error.error);
  //       console.error('There was an error!', error);
  //       this.errorMessage =
  //         'Failed to load data. Check the server or network connection.';
  //       this.isLoading = false;
  //     },
  //     complete: () => {
  //       // Optional: Executed when the Observable completes
  //       console.log('Data fetching complete.');
  //       console.log('orderslist ', this.orders);
  //     },
  //   });
  // }

  // vieworder(id: string | null) {
  //   alert('View order functionality to be implemented for order ID: ' + id);
  //   this.router.navigate(['admindashboard/adminactions', id]);
  // }

  // uploadpage(id: string | null) {
  //   alert(
  //     'Upload pictures functionality to be implemented for order ID: ' + id
  //   );
  //   this.router.navigate(['admindashboard/uploadpictures', id]);
  // }

