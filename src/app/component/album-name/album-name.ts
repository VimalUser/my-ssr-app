import { Component, OnInit } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';
import { clientData } from '../../model/clientData';

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
    private userservice: userserviceapi
  ) {}

  formData: clientData = new clientData();

  get isLightTheme() {
    return this.clientDataService.getTheme();
  }

  ngOnInit(): void {
    this.formData = this.clientDataService.getData();
    console.log('Initial Client Data in AlbumName:', this.formData);
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
    this.clientDataService.triggerPrevStep();
  }

  isValidForm(): boolean {
    return (
      this.formData.albumName.trim() !== '' &&
      this.formData.albumDate.trim() !== ''
    );
  }

  nextStep() {
    if (this.isValidForm() === false) {
      this.notify.error('Please fill in all required fields!');
      return;
    }
    this.updateFormData();
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep();
  }

  updateFormData() {
    const existingData: clientData = this.clientDataService.getData();

    const updated: clientData = {
      ...existingData,
      albumName: this.formData.albumName,
      albumDate: this.formData.albumDate,
    };

    this.clientDataService.updateData(updated);
    return updated;
  }

  onSave() {
    if (this.isValidForm() === false) {
      this.notify.error('Please fill in all required fields!');
      return;
    }
    this.apiCalltoSave(this.updateFormData());
  }

  apiCalltoSave(updateData: clientData) {
    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.notify.success('Album details saved successfully!');
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.notify.error('Failed to save album details.');
      },
    });
  }
}
