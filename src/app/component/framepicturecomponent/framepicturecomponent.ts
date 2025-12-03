import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData } from '../../model/clientData';
import { userserviceapi } from '../../services/userservice';
import { Notificationservice } from '../../services/notificationservice';

@Component({
  selector: 'app-framepicturecomponent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './framepicturecomponent.html',
  styleUrl: './framepicturecomponent.css',
})
export class Framepicturecomponent {
  constructor(
    private clientDataService: ClientDataService,
    private userservice: userserviceapi,
    private notify: Notificationservice
  ) { }

  // Folder selection
  folderNames: string[] = ['Portrait Frame', 'Landscape Frame'];
  selectedFolderName: string = '';
  isPortrait: boolean = true;

  // Data from clientDataService
  pagelatestData: clientData = new clientData();

  // API image source (from getSelectedImagesbyClientId)
  // Example: [{ imageUrl: 'https://.../traditional/img1.jpg' }, ...]
  apiImageResponse: Array<{ imageUrl: string }> = [];

  // Images for current folder (what we actually display)
  images: string[] = [];

  // UI / state
  loading = true;
  galleryOpen = false;

  // Preview
  previewImageUrl: string | null = null;
  previewFileName = '';
  previewLoading = false;

  // Mobile-only tap zone
  isMobileView = false;

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(3);
    const data = this.clientDataService.getData();
    this.pagelatestData = data;
    console.log('Frame Picture Component - client data:', this.pagelatestData);
    this.loading = false;

    if (typeof window !== 'undefined') {
      this.isMobileView = window.innerWidth <= 768;
    }
    // If you want to prefetch immediately (optional):
    // this.fetchData(this.pagelatestData.clientId.toString());
  }

  // Resize: update mobile flag
  @HostListener('window:resize', [])
  onWindowResize() {
    if (typeof window !== 'undefined') {
      this.isMobileView = window.innerWidth <= 768;
    }
  }

  // ---------- Navigation between steps ----------

  prevStep() {
    this.clientDataService.triggerNextStep(2);
  }

  nextStep() {
    const totalFramesSelected =
      (this.pagelatestData.portraitFrameSelection?.length || 0) +
      (this.pagelatestData.landscapeFrameSelection?.length || 0);

    if (totalFramesSelected < this.pagelatestData.noOfFrames) {
      this.notify.error(
        `Please select ${this.pagelatestData.noOfFrames} picture(s) for frame in image selection page!`
      );
      return;
    }
    this.clientDataService.triggerNextStep(4);
  }

  // ---------- Folder selection (view only) ----------

  async gobackFolderSelection() {
    const confirmed = await this.notify.confirm(
      'Go back to frame type selection screen?'
    );
    if (!confirmed) return;

    this.galleryOpen = false;
    this.selectedFolderName = '';
    this.images = [];
    this.previewImageUrl = null;
  }

  showGallery(isPortrait: boolean) {
    this.loading = true;
    this.isPortrait = isPortrait;
    this.selectedFolderName = isPortrait ? 'Portrait Frame' : 'Landscape Frame';
    this.galleryOpen = true;

    // if API images already present, build immediately
    if (this.apiImageResponse.length > 0) {
      this.rebuildImagesForCurrentFolder();
      this.loading = false;
    } else {
      // fetch from API first time
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
   * Uses apiImageResponse (api URLs) + selected frame items
   * to build the images[] for current folder (portrait or landscape).
   */
  private rebuildImagesForCurrentFolder(): void {
    if (!this.galleryOpen) return;

    const selectedItems = this.isPortrait
      ? this.pagelatestData.portraitFrameSelection || []
      : this.pagelatestData.landscapeFrameSelection || [];

    const selectedFileNames = new Set(
       selectedItems.map((x) =>this.fileNameFromUrl(x.url)?.trim() || '')
    );

    const allUrls = this.apiImageResponse.map((item) => item.imageUrl);

    // Only show URLs whose filename is in the selected file list
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

  // ---------- API (this is now IMPORTANT & USED) ----------

  fetchData(clientId: string): void {
    this.loading = true;

    this.userservice.getSelectedImagesbyClientId(clientId, 'frame').subscribe({
      next: (data) => {
        // Expecting array like [{ imageUrl: '...' }, ...]
        this.apiImageResponse = data || [];

        // Now that we have URLs, rebuild the images for the current folder
        this.rebuildImagesForCurrentFolder();
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
