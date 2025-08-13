import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class App {
  step = 0;
  coupleName = '';
  albumDate = '';
  selectedPhotoType = '';
  showThumbnails = false;
  sidebarOpen = false;

  welcomeMessageContent = {
    title: "Welcome to Candy Express Photography",
    description: "Create your personalized photo album with ease. Let's get started!",
    albumText:"Select 480 images for album",
    coupleText: "Hey Meena Sudhan test",
    frameText: "Select 5 images for frame"
    };


  images = [
    { name: "Img_133.jpg", thumb: "assets/placeholder.png", selected: false },
    { name: "Img_134.jpg", thumb: "assets/placeholder.png", selected: false },
    { name: "Img_135.jpg", thumb: "assets/placeholder.png", selected: false }
  ];
  selectedImagesCount = 0;
  showImageViewer = false;
  selectedImage: any = null;
  showTooltip = false;

  goToStep(newStep: number) {
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
    this.selectedImagesCount = this.images.filter(i => i.selected).length;
    this.showImageViewer = false;
  }

  hideTooltip() {
    this.showTooltip = false;
  }

  savePhotoSelection() {
    this.step = 3;
    this.showThumbnails = false;
  }
}
