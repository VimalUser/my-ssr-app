import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { newclientapi } from '../../services/newclient';
import { inject } from '@angular/core';
import { ClientAlbum } from '../../model/ClientAlbum';


@Component({
  selector: 'app-admindashboard',
  imports: [CommonModule],
  templateUrl: './admindashboard.html',
  styleUrl: './admindashboard.css',
  standalone: true
})

export class Admindashboard implements OnInit {
String(arg0: number|null): string|null {
throw new Error('Method not implemented.');
}
  activeTab: string = 'progress';

  constructor(private router: Router) {}

   // Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  orders: ClientAlbum[] = [];

  private apiService = inject(newclientapi);
  ngOnInit(): void {
      this.fetchData();
       }

  tabs = [
    { key: 'progress', label: 'Progress', count: 124 },
    { key: 'completed', label: 'Completed', count: 124 },
    { key: 'cancelled', label: 'Cancelled', count: 124 }
  ];

  // orders = [
  //   {
  //     client: 'Meena siva sudhan',
  //     orderNo: 'CEP00191',
  //     eventType: 'Wedding',
  //     status: 'Yet to start'
  //   },
  //   {
  //     client: 'Saravana Venkat',
  //     orderNo: 'CEP00621',
  //     eventType: 'Wedding',
  //     status: 'Cancelled'
  //   },
  //   {
  //     client: 'Meena siva sudhan',
  //     orderNo: 'CEP00191',
  //     eventType: 'Wedding',
  //     status: 'Progressing'
  //   },
  //   {
  //     client: 'Meena siva sudhan',
  //     orderNo: 'CEP00191',
  //     eventType: 'Wedding',
  //     status: 'Completed'
  //   },
  //   {
  //     client: 'Meena siva sudhan',
  //     orderNo: 'CEP00191',
  //     eventType: 'Wedding',
  //     status: 'Completed'
  //   }
  // ];

  get filteredOrders() {
    switch (this.activeTab) {
      case 'progress':
        return this.orders.filter(order =>
          order.status === 'Yet to start' || order.status === 'Progressing'
        );
      case 'completed':
        return this.orders.filter(order => order.status === 'Completed');
      case 'cancelled':
        return this.orders.filter(order => order.status === 'Cancelled');
      default:
        return this.orders;
    }
  }

  createnew() {
    alert('Create new client album functionality to be implemented.');
      this.router.navigate(['/newclient']);
  }

  setTab(tabKey: string) {
    this.activeTab = tabKey;
  }
  
  fetchData(): void {
    console.log('Fetching data from API...');
    this.isLoading = true;
    this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.apiService.getAllClientDetails().subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
         this.orders = data; // Assign the raw response // **Important Note on responseType: 'text'** // Since your service specifies responseType: 'text', // `data` will be a raw string. If the API returns JSON, // you might need to parse it here: this.apiResponse = JSON.parse(data);
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
        console.log('orderslist ',this.orders);
      },
    });
  }

  vieworder(id: string | null) {
    alert('View order functionality to be implemented for order ID: ' + id);
      this.router.navigate(['/newclient', id]);
  }
}