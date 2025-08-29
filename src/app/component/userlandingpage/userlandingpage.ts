import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api';


@Component({
  selector: 'app-userlandingpage',
  imports: [CommonModule, FormsModule],
  templateUrl: './userlandingpage.html',
  styleUrl: './userlandingpage.css',
  standalone: true,
})
export class Userlandingpage implements OnInit  {

// Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  isLoading: boolean = false;


    // 1. Inject the Api service using the private property shortcut
  // or the `inject` function for standalone components/services
  private apiService = inject(Api);
  ngOnInit(): void {
    this.fetchData();
  }


  step = 0;
  coupleName = '';
  albumDate = '';
  selectedPhotoType = '';
  showThumbnails = false;
  sidebarOpen = false;

  welcomeMessageContent = {
    title: 'Welcome to Candy Express Photography',
    description:
      "Create your personalized photo album with ease. Let's get started!",
    albumText: 'Select 480 images for album',
    coupleText: 'Hey Meena Sudhan test',
    frameText: 'Select 5 images for frame',
  };

  images = [
    { name: 'Img_133.jpg', thumb: 'assets/placeholder.png', selected: false },
    { name: 'Img_134.jpg', thumb: 'assets/placeholder.png', selected: false },
    { name: 'Img_135.jpg', thumb: 'assets/placeholder.png', selected: false },
  ];
  selectedImagesCount = 0;
  showImageViewer = false;
  selectedImage: any = null;
  showTooltip = false;

  goToStep(newStep: number) {
    if (
      newStep === 2 &&
      this.coupleName.trim() === '' &&
      this.albumDate.trim() === ''
    ) {
      alert('Please enter the couple name and date before proceeding.');
      return;
    }
    this.step = newStep;
    this.showThumbnails = false;
    this.selectedPhotoType = '';
  }

  saveAlbumName() {
    this.step = 2;
  }

  selectPhotoType(type: string) {
    this.selectedPhotoType = type;
    this.showThumbnails = true;
  }

  viewImage(img: any) {
    this.selectedImage = img;
    this.showImageViewer = true;
    this.showTooltip = true;
  }

  closeViewer() {
    this.showImageViewer = false;
    this.showTooltip = false;
  }

  selectImage(img: any) {
    img.selected = !img.selected;
    this.selectedImagesCount = this.images.filter((i) => i.selected).length;
    this.showImageViewer = false;
  }

  hideTooltip() {
    this.showTooltip = false;
  }

  savePhotoSelection() {
    this.step = 3;
    this.showThumbnails = false;
  }

   fetchData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    // 2. Call the service method and subscribe to the Observable
    this.apiService.getData(1).subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.apiResponse = data; // Assign the raw response
        // **Important Note on responseType: 'text'**
        // Since your service specifies responseType: 'text',
        // `data` will be a raw string. If the API returns JSON,
        // you might need to parse it here: this.apiResponse = JSON.parse(data);
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
      },
    });
  }
}
