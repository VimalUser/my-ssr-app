import { Component, OnInit } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';
import { clientData } from '../../model/clientData';
import { Router } from '@angular/router';

@Component({
  selector: 'app-album-name',
  imports: [FormsModule, CommonModule],
  templateUrl: './album-name.html',
  styleUrl: './album-name.css',
  standalone: true,
})
export class AlbumName implements OnInit {
  constructor(
    private clientDataService: ClientDataService,
    private notify: Notificationservice,
    private userservice: userserviceapi,
    private router :Router
  ) {}

  formData: clientData = new clientData();
  isLoading:boolean =false;

  get isLightTheme() {
    return this.clientDataService.getTheme();
  }

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(1);
    this.isLoading = true;
    this.formData = this.clientDataService.getData();
    console.log('Initial Client Data in AlbumName:', this.formData);
    this.isLoading = false;

  }

  goBack() {
    // window.history.back();
    const confirmCancelled = confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      // User pressed Cancel, stop execution here
      return;
    }
   this.clientDataService.triggerNextStep(0);
    // this.activateMenuByName
        this.router.navigate(['userhome/startpage']);

  }

  isValidForm(): boolean {
    return (
      this.formData.albumName.trim() !== '' &&
      this.formData.albumEventDate.trim() !== ''
    );
  }

  nextStep() {
    if (this.isValidForm() === false) {
      this.notify.error('Please fill in all required fields!');
      return;
    }
    this.updateModelWithLatestData();
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep(2);
  }

  updateModelWithLatestData() {
    const existingData: clientData = this.clientDataService.getData();

    const updated: clientData = {
      ...existingData,
      albumName: this.formData.albumName,
      albumEventDate: this.formData.albumEventDate,
      status : 'Inprogress'
    };

    this.clientDataService.updateData(updated);
    return updated;
  }

  onSave() {
    if (this.isValidForm() === false) {
      this.notify.error('Please fill in all required fields!');
      return;
    }
    
    this.apiCalltoSave(this.updateModelWithLatestData());
  }

  apiCalltoSave(updateData: clientData) {
    this.isLoading = true;
    console.log('Payload sent to API album screen:', JSON.stringify(updateData, null, 2));

    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.isLoading = false;
        this.notify.success('Album details saved successfully!');
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.isLoading = false;
        this.notify.error('Failed to save album details.');
      },
    });
  }
}
