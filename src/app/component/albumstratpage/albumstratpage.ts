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
  formLatestData: ClientAlbum = new ClientAlbum();

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

  updateClinetData(clientDatafromDb: ClientAlbum) {
    // const data: clientData = this.clientDataService.getData();

    const updated: clientData = {     
      clientId: Number(clientDatafromDb.clientId) || 1,
      clientName: clientDatafromDb.clientName || '',
      status: '',
      albumName: "vimal work",
      albumDate: '2025-10-10',
      noOfPics: Number(clientDatafromDb.noOfPics) || 0,
      noOfFrames: Number(clientDatafromDb.noOfFrame) || 0,
      coverPic: '',
      mobileNumber: '',
      eventTypeId: 0,
      albumSizeId: 0,
      frameSizeId: 0,
      eventType: '',
      albumSize: '',
      frameSize: '',
    "tranditionalAlbumSelection": [
    {
      "fileName": "https://picsum.photos/id/1011/400/300",
      "comment": "tr : boat sitting",
      "type": "image",
      "url": "https://picsum.photos/id/1011/400/300",
      "isTraditional": true
    },
    {
      "fileName": "https://picsum.photos/id/1012/400/300",
      "comment": "tr:dog sitting",
      "type": "image",
      "url": "https://picsum.photos/id/1012/400/300",
      "isTraditional": true
    },
    {
      "fileName": "https://picsum.photos/id/1013/400/300",
      "comment": "tr:marriage car",
      "type": "image",
      "url": "https://picsum.photos/id/1013/400/300",
      "isTraditional": true
    }
  ],
  "candidAlbumSelection": [
    {
      "fileName": "https://picsum.photos/id/2/500/300",
      "comment": "cd:laptop coffee",
      "type": "image",
      "url": "https://picsum.photos/id/2/500/300",
      "isTraditional": false
    },
    {
      "fileName": "https://picsum.photos/id/21/500/300",
      "comment": "cd:shoe",
      "type": "image",
      "url": "https://picsum.photos/id/21/500/300",
      "isTraditional": false
    },
    {
      "fileName": "https://picsum.photos/id/31/500/300",
      "comment": "cd:leg",
      "type": "image",
      "url": "https://picsum.photos/id/31/500/300",
      "isTraditional": false
    }
  ],
      frameSelection: [],
      coverSelection: [],
    };

    this.clientDataService.updateData(updated);
    console.log('startpage form ClientDataService:', updated);
  }

  fetchData(): void {
    console.log('Fetching data from API...');
    this.userService.getClientAlbumDetails('1').subscribe({
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
