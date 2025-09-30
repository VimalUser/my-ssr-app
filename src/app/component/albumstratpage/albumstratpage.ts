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
  formLatestData: clientData = new clientData();

  constructor(
    private clientDataService: ClientDataService,
    private userService: userserviceapi
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  nextStep() {
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep();
  }

  updateClinetData(clientDatafromDb: clientData) {
    // const data: clientData = this.clientDataService.getData();

    const updated: clientData = {     
      clientId: Number(clientDatafromDb.clientId) || 1,
      clientName: clientDatafromDb.clientName || '',
      status: '',
      albumName: clientDatafromDb.albumName || '',
      albumDate: clientDatafromDb.albumDate || '',
      noOfPics: Number(clientDatafromDb.noOfPics) || 0,
      noOfFrames: Number(clientDatafromDb.noOfFrames) || 0,
      coverPic: '',
      mobileNumber: clientDatafromDb.mobileNumber || '',
      eventTypeId: 0,
      albumSizeId: 0,
      frameSizeId: 0,
      eventType: '',
      albumSize: '',
      frameSize: '',
      tranditionalAlbumSelection : clientDatafromDb.tranditionalAlbumSelection || [],
      candidAlbumSelection :clientDatafromDb.candidAlbumSelection || [],
      portraitFrameSelection:clientDatafromDb.portraitFrameSelection || [],
      landscapeFrameSelection: clientDatafromDb.landscapeFrameSelection || [],
      coverSelection:  clientDatafromDb.coverSelection || []
    };

    this.clientDataService.updateData(updated);
    console.log('startpage form ClientDataService:', updated);
  }

  fetchData(): void {
    console.log('Fetching data from API...');
    this.userService.getClientAlbumSelectionDetails('1').subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.formLatestData = data;
        this.updateClinetData(this.formLatestData);
        // this.isLoading = false;
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        console.error('There was an error!', error);
      },
      complete: () => {},
    });
  }
}
