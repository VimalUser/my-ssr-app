import { Component, inject, OnInit } from '@angular/core';
import {
  ClientDataService,
  LoggedInUser,
} from '../../shared/ClientDataService';
import { CommonModule } from '@angular/common';
import { clientData } from '../../model/clientData';
import { userserviceapi } from '../../services/userservice';
import { ClientAlbum } from '../../model/ClientAlbum';
import { Router } from '@angular/router';
@Component({
  selector: 'app-albumstratpage',
  imports: [CommonModule],
  templateUrl: './albumstratpage.html',
  styleUrl: './albumstratpage.css',
  standalone: true,
})
export class Albumstratpage implements OnInit {
  user: LoggedInUser | null = null;
  isLoading: boolean = false;

  formLatestData: clientData = new clientData();

  constructor(
    private clientDataService: ClientDataService,
    private userService: userserviceapi,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    // this.clientDataService.resetAll();
    // this.clientDataService.triggerResetMenu();
    this.clientDataService.restoreUserFromStorage();
    this.clientDataService.resetClientDataOnly();
    this.clientDataService.triggerNextStep(0);
    // Automatically generate ad image names
    this.adImages = Array.from(
      { length: 1},
      (_, i) => `assets/startpage-ad/ad_${i + 1}.png`
    );

    // Slide every 3 seconds
    this.intervalId = window.setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.adImages.length;
    }, 3000);

    this.user = this.clientDataService.getCurrentUser();
    this.fetchData();
  }

  adImages: string[] = [];
  currentIndex = 0;
  intervalId?: number;

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  nextStep() {
    this.clientDataService.triggerNextStep(1);
    // this.router.navigate(['userhome/albumname']);
  }

  get hasSubmitted(): boolean {
    return this.formLatestData.status.toLowerCase().trim() == 'completed';
  }

  get albumCount(): number {
    return this.formLatestData?.noOfPics || 0;
  }

  get framesCount(): number {
    return this.formLatestData?.noOfFrames || 0;
  }

  get coverCount(): number {
    return this.formLatestData?.noOfAlbumCover || 0;
  }

  updateClinetData(clientDatafromDb: clientData) {
    // const data: clientData = this.clientDataService.getData();

    const updated: clientData = {
      clientId: Number(clientDatafromDb.clientId) || 1,
      clientName: clientDatafromDb.clientName || '',
      status: clientDatafromDb.status || '',
      albumName: clientDatafromDb.albumName || '',
      albumEventDate: clientDatafromDb.albumEventDate || '',
      noOfPics: Number(clientDatafromDb.noOfPics) || 0,
      noOfFrames: Number(clientDatafromDb.noOfFrames) || 0,
      noOfAlbumCover: Number(clientDatafromDb.noOfAlbumCover) || 0,
      coverPic: '',
      mobileNumber: clientDatafromDb.mobileNumber || '',
      eventTypeId: 0,
      albumSizeId: 0,
      frameSizeId: 0,
      eventType: '',
      albumSize: '',
      frameSize: '',
      designTypeId: clientDatafromDb.designTypeId || 1,
      designType: clientDatafromDb.designType || '',
      tranditionalAlbumSelection:
        clientDatafromDb.tranditionalAlbumSelection || [],
      candidAlbumSelection: clientDatafromDb.candidAlbumSelection || [],
      portraitFrameSelection: clientDatafromDb.portraitFrameSelection || [],
      landscapeFrameSelection: clientDatafromDb.landscapeFrameSelection || [],
      coverSelection: clientDatafromDb.coverSelection || [],
      passCode: '',
      createdBy: clientDatafromDb.createdBy || '',
      accessLink: '',
      updatedBy: '',
      isSubmitted: this.hasSubmitted,
    };

    this.clientDataService.updateData(updated);
    console.log('startpage form ClientDataService:', updated);
  }

  fetchData(): void {
    console.log('Fetching data from API...');
    this.userService
      .getClientAlbumSelectionDetails(String(this.user?.clientId))
      .subscribe({
        next: (data) => {
          // This is where you process the successful response
          console.log('API Response:', data);
          this.formLatestData = data;
          this.updateClinetData(this.formLatestData);
          this.isLoading = false;
        },
        error: (error) => {
          // This is executed if the request fails (e.g., 404, 500)
          console.error('There was an error!', error);
          this.isLoading = false;
        },
        complete: () => {},
      });
  }
}
