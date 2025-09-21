import { Component } from '@angular/core';
import { userserviceapi } from '../../services/userservice';
import { ClientAlbum } from '../../model/ClientAlbum';
import { ClientDataService } from '../../shared/ClientDataService';

@Component({
  selector: 'app-logincode',
  imports: [],
  templateUrl: './logincode.html',
  styleUrl: './logincode.css',
})
export class Logincode {
  couplename = 'Meena Siva Sudhan1';
  orders: ClientAlbum = new ClientAlbum();

  constructor(
    private clientDataService: ClientDataService,
    private userService: userserviceapi
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    console.log('Fetching data from API...');
    // this.isLoading = true;
    // this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.userService.getClientAlbumDetails('1').subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.orders = data;
        this.updateClinetData(this.orders);
        // this.isLoading = false;
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        // this.loggingService.validateLoginFailure(error.error);
        console.error('There was an error!', error);
        // this.errorMessage = 'Failed to load data. Check the server or network connection.';
        // this.isLoading = false;
      },
      complete: () => {
        // Optional: Executed when the Observable completes
        // console.log('Data fetching complete.');
        // console.log('orderslist ', this.orders);
      },
    });
  }

  updateClinetData(order: ClientAlbum) {
    if (order) {
      this.clientDataService.patchData({
        clientName: order.clientName || '',
        coupleName: order.coupleName || '',
        mobileNumber: order.mobileNumber || '',
        noOfPics: order.noOfPics || 0,
        noOfFrames: order.noOfFrame || 0,
      });
    }
    console.log('Initial Client Data in ImageGallery:', this.clientDataService);
  }

  validateLogin() {
    alert('Login validated!'); // Placeholder for actual validation logic
    this.fetchData();
  }
}
