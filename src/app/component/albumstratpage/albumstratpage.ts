import { Component, inject, OnInit } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { CommonModule } from '@angular/common';
import { clientData } from '../../model/clientData';
import { userserviceapi } from '../../services/userservice';
import { ClientAlbum } from '../../model/ClientAlbum';

@Component({
  selector: 'app-albumstratpage',
  imports: [CommonModule],
  templateUrl: './albumstratpage.html',
  styleUrl: './albumstratpage.css',
  standalone: true,
})
export class Albumstratpage implements OnInit {
  orders: ClientAlbum = new ClientAlbum();

  constructor(
    private clientDataService: ClientDataService,
    private userService: userserviceapi
  ) {  }

  ngOnInit(): void {
    this.fetchData();
  }

  nextStep() {
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep();
  }

  updateClinetData(order: ClientAlbum) {
   


   const data: clientData = this.clientDataService.getData();

    const updated: clientData = {
      ...data,
      noOfFrames: order.noOfFrame || 0,
      noOfPics: order.noOfPics || 0,
      clientName: order.clientName || '', 
      mobileNumber: order.mobileNumber || '',
      // status: 'new',
    };

    this.clientDataService.updateData(updated);
    console.log('startpage form ClientDataService:', updated);

    console.log('Initial Client Data in ImageGallery:', this.clientDataService);  
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
}
