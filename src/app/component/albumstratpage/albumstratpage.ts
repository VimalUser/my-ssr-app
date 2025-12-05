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
  adImages: string[] = [];
  currentIndex = -1;
  prevIndex = -1;
  direction: 'left' | 'right' = 'right';
  intervalId?: number;
  slideDelay = 3000; // 3 seconds
  isPaused = false;
  firstImageLoaded = false;
  imagesLoadedCount = 0;

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
    // this.clientDataService.restoreUserFromStorage();
    // this.clientDataService.resetClientDataOnly();
    this.clientDataService.triggerNextStep(0);

    // Automatically generate ad image names
    this.adImages = Array.from(
      { length: 7 },
      (_, i) => `assets/startpage-ad/ad_${i + 1}.jpg`
    );

    this.user = this.clientDataService.getCurrentUser();
    this.fetchData();
  }

  startSlider() {
    this.clearSliderInterval();
    this.intervalId = window.setInterval(() => {
      if (!this.isPaused && this.adImages.length > 1) {
        this.goNextInternal();
      }
    }, this.slideDelay);
  }

  clearSliderInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  pauseSlider() {
    this.isPaused = true;
  }

  resumeSlider() {
    this.isPaused = false;
  }

  goNext() {
    this.direction = 'right';
    this.goNextInternal();
    this.restartTimer();
  }

  goPrev() {
    this.direction = 'left';
    this.goPrevInternal();
    this.restartTimer();
  }

  goTo(index: number) {
    if (index === this.currentIndex) return;
    this.direction = index > this.currentIndex ? 'right' : 'left';
    this.prevIndex = this.currentIndex;
    this.currentIndex = index;
    this.restartTimer();
  }

  private goNextInternal() {
    this.prevIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex + 1) % this.adImages.length;
  }

  private goPrevInternal() {
    this.prevIndex = this.currentIndex;
    this.currentIndex =
      (this.currentIndex - 1 + this.adImages.length) % this.adImages.length;
  }

  private restartTimer() {
    this.isPaused = false;
    this.startSlider();
  }

  // called from template when each <img> finishes loading
  onImageLoad(index: number) {
    console.log('image loaded:', index);
    this.imagesLoadedCount++;

    // only reveal first slide after it's loaded
    if (index === 0 && !this.firstImageLoaded) {
      this.firstImageLoaded = true;
      this.prevIndex = -1; // ensure no "previous" animation
      this.currentIndex = 0; // show the first slide now
      // give the browser one paint cycle before starting autoplay / animations
      requestAnimationFrame(() => {
        // start auto sliding only after the first paint
        this.startSlider();
      });
    }
  }
  ngOnDestroy(): void {
    // preserve your existing destroy cleanup and add clear
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
      designTypeId: clientDatafromDb.designTypeId || 0,
      designType: clientDatafromDb.designType || '',
      events: clientDatafromDb.events || [],
      designTypeList: clientDatafromDb.designTypeList || [],
      clientReviewComments: clientDatafromDb.clientReviewComments || '',

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
  }

  fetchData(): void {
    this.userService
      .getClientAlbumSelectionDetails(String(this.user?.clientId))
      .subscribe({
        next: (data) => {
          // This is where you process the successful response
          this.formLatestData = data;
          console.log('Fetched client data:', data);
          this.updateClinetData(this.formLatestData);
          this.isLoading = false;
        },
        error: (error) => {
          // This is executed if the request fails (e.g., 404, 500)
          this.isLoading = false;
        },
        complete: () => {},
      });
  }
}
