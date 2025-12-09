import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData, ClientMenuItems } from '../../model/clientData';
import { userserviceapi } from '../../services/userservice';
import { Notificationservice } from '../../services/notificationservice';
@Component({
  selector: 'app-coverpciture-selection',
  imports: [CommonModule, FormsModule],
  templateUrl: './coverpciture-selection.html',
  styleUrl: './coverpciture-selection.css',
})
export class CoverpcitureSelection {
  constructor(
    private clientDataService: ClientDataService,
    private userservice: userserviceapi,
    private notify: Notificationservice
  ) { }

  // UI state
  loading = true;
  galleryOpen = false;
  selectedFolderName = '';

  // Data from clientDataService
  pagelatestData: clientData = new clientData();

  // API image data: [{ imageUrl: '...' }, ...]
  apiImageResponse: Array<{ imageUrl: string }> = [];

  // URLs actually shown in the grid (only selected covers)
  images: string[] = [];

  // Preview
  previewImageUrl: string | null = null;
  previewFileName = '';
  previewLoading = false;

  // mobile flag (if you want special tap zones later)
  isMobileView = false;

  ngOnInit(): void {
    // This page is step 4 in your flow (Album=2, Frame=3, Cover=4, Submit=5)
    this.clientDataService.triggerNextStep(ClientMenuItems.coverPage);

    const data = this.clientDataService.getData();
    this.pagelatestData = data;
    this.loading = false;

    if (typeof window !== 'undefined') {
      this.isMobileView = window.innerWidth <= 768;
    }

  }

  @HostListener('window:resize', [])
  onWindowResize() {
    if (typeof window !== 'undefined') {
      this.isMobileView = window.innerWidth <= 768;
    }
  }

  // ---------- Navigation between steps ----------

  prevStep() {
    // Go back to Frame selection step
    this.clientDataService.triggerNextStep(ClientMenuItems.framePage);
  }

  nextStep() {
    const requiredCovers = Number(this.pagelatestData.noOfAlbumCover) || 0;
    const selectedCovers = this.pagelatestData.coverSelection?.length || 0;

    if (requiredCovers > 0 && selectedCovers < requiredCovers) {
      this.notify.error(
        `Please select ${requiredCovers} cover picture(s) in image selection page before proceeding.`
      );
      return;
    }

    // Move to final submit step
    this.clientDataService.triggerNextStep(ClientMenuItems.submitForm);
  }

  // ---------- Folder-like open (view only) ----------

  async gobackFolderSelection() {
    const confirmed = await this.notify.confirm(
      'Go back to cover selection options screen?'
    );
    if (!confirmed) return;

    this.galleryOpen = false;
    this.selectedFolderName = '';
    this.images = [];
    this.previewImageUrl = null;
  }

  showGallery() {
    this.loading = true;
    this.galleryOpen = true;
    this.selectedFolderName = 'Album Cover';

    // If we already have API data, just rebuild the list
    if (this.apiImageResponse.length > 0) {
      this.rebuildImagesFromCoverSelection();
      this.loading = false;
    } else {
      const clientId = this.pagelatestData.clientId?.toString() || '';
      if (clientId) {
        this.fetchData(clientId);
      } else {
        this.loading = false;
      }
    }
  }

  // ---------- Helpers ----------

  fileNameFromUrl(url: string): string {
    const filename = url.split('?')[0].split('/').pop() || '';
    return decodeURIComponent(filename);
  }

  /**
   * Combine coverSelection (from clientData) + apiImageResponse (from API)
   * → build images[] that we display.
   */
  private rebuildImagesFromCoverSelection(): void {
    const coverSelection = this.pagelatestData.coverSelection || [];
    const selectedFileNames = new Set(
      coverSelection.map((x) => (this.fileNameFromUrl(x.url) || '').trim())
    );

    const allUrls = this.apiImageResponse.map((item) => item.imageUrl);

    // Keep only those URLs whose filename is in coverSelection
    this.images = allUrls.filter((url) =>
      selectedFileNames.has(this.fileNameFromUrl(url))
    );
  }

  // ---------- Preview ----------

  openPreview(imageUrl: string) {
    // Push modal state to browser history
    history.pushState({ previewOpen: true }, '');
    
    this.previewImageUrl = imageUrl;
    this.previewFileName = this.fileNameFromUrl(imageUrl);
    this.previewLoading = true;
  }

  @HostListener('window:popstate', ['$event'])
  onBackButton(event: any) {

    // If preview is open -> close it instead of routing back
    if (this.previewImageUrl) {
      this.closePreview();
    }
  }
  onPreviewImageLoad() {
    this.previewLoading = false;
  }

  closePreview() {
    this.previewImageUrl = null;
    this.previewFileName = '';
    this.previewLoading = false;

    // Remove the dummy history state
    if (history.state?.previewOpen) {
      history.back();
    }
  }

  private getCurrentImageIndex(): number {
    if (!this.previewImageUrl) return -1;
    return this.images.indexOf(this.previewImageUrl);
  }

  showNextImage(event: Event) {
    event.stopPropagation();
    const list = this.images;
    const idx = this.getCurrentImageIndex();

    if (idx >= 0 && idx < list.length - 1) {
      this.previewImageUrl = list[idx + 1];
      this.previewFileName = this.fileNameFromUrl(this.previewImageUrl);
      this.previewLoading = true;
    } else {
      this.notify.error('You’ve reached the last image.');
    }
  }

  showPreviousImage(event: Event) {
    event.stopPropagation();
    const list = this.images;
    const idx = this.getCurrentImageIndex();

    if (idx > 0) {
      this.previewImageUrl = list[idx - 1];
      this.previewFileName = this.fileNameFromUrl(this.previewImageUrl);
      this.previewLoading = true;
    } else {
      this.notify.error('This is the first image.');
    }
  }

  // ---------- API (important) ----------

  fetchData(clientId: string): void {
    this.loading = true;


    this.userservice.getSelectedImagesbyClientId(clientId, 'cover').subscribe({
      next: (data) => {
        // data expected: [{ imageUrl: '...' }, ...]
        this.apiImageResponse = data || [];
        // Now that we have URLs, rebuild the cover images
        this.rebuildImagesFromCoverSelection();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.images = [];
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}