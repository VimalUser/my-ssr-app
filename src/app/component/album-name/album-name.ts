import { Component, OnInit } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { ClientAlbum } from '../../model/ClientAlbum';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-album-name',
  imports: [FormsModule,CommonModule],
  templateUrl: './album-name.html',
  styleUrl: './album-name.css',
  standalone: true,
})
export class AlbumName implements OnInit {
  constructor(private clientDataService: ClientDataService) {}

  get isLightTheme() {
  return this.clientDataService.getTheme();
}

albumPageData: { AlbumName: string; AlbumDate: string } = {
  AlbumName: '',
  AlbumDate: '',
};

ngOnInit(): void {
  const data = this.clientDataService.getData();
  console.log('Initial Client Data in AlbumName:', data); 
  this.albumPageData.AlbumName = data.albumName || '';
  this.albumPageData.AlbumDate = data.albumDate || '';
}

  goBack() {
    // window.history.back();
      const confirmCancelled = confirm('Are you sure to go back? Unsaved changes will be lost.');
    if (!confirmCancelled) {
      // User pressed Cancel, stop execution here
      return;
    }
    this.clientDataService.triggerPrevStep();
  }

  nextStep() {
    if(this.isValidForm() === false) {
      alert('Please fill in all required fields.');
      return;
    }
    this.patchData();
    // Logic to proceed to the next step
    console.log('Proceeding to the next step...');
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep();
  }

  patchData() {

    this.clientDataService.patchData({
      albumName: this.albumPageData.AlbumName,
      albumDate: this.albumPageData.AlbumDate,
    });
    
  }

  isValidForm(): boolean {
    return this.albumPageData.AlbumName.trim() !== '' && this.albumPageData.AlbumDate.trim() !== '';
  }

  onSave() {

    if(this.isValidForm() === false) {
      alert('Please fill in all required fields.');
      return;
    }
    // Logic to save the current state
    this.patchData();
    console.log('Saving current state...');
  }
}
