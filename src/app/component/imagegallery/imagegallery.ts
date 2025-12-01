import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumSelectionItem } from '../../model/album-selection-item.model';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData } from '../../model/clientData';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';

type ViewFilter = 'all' | 'album' | 'frame' | 'cover';

@Component({
  selector: 'app-imagegallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imagegallery.html',
  styleUrl: './imagegallery.css',
})
export class Imagegallery implements OnInit {
  // Folder selection
  folderNames: string[] = ['Traditional Photos', 'Candid Photos'];
  selectedFolderName: string = '';
  isTraditional: boolean = true;

  // All images for this folder (from API)
  images: string[] = [];

  // "Load more" batching
  batchSize = 60;
  displayedImages: string[] = [];
  isLoadingMore = false;

  // Album selections for current folder
  selectedItems: AlbumSelectionItem[] = [];

  // Frame + cover selections (global, across folders)
  portraitFrameItems: AlbumSelectionItem[] = [];
  landscapeFrameItems: AlbumSelectionItem[] = [];
  coverItems: AlbumSelectionItem[] = [];

  loading = true;
  galleryOpen = false;
  previewLoading = false;

  previewImageUrl: string | null = null;
  previewFileName = '';
  previewComment = '';

  // filter bar
  viewFilter: ViewFilter = 'all';

  // frame popup state (by fileName)
  frameChoiceForFileName: string | null = null;

  clientDataload: clientData = new clientData();

  constructor(
    private clientDataService: ClientDataService,
    private userService: userserviceapi,
    private notify: Notificationservice
  ) {}

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(2);
    this.loading = false;

    const data = this.clientDataService.getData();
    this.clientDataload = data;

    this.portraitFrameItems = [...(data.portraitFrameSelection ?? [])];
    this.landscapeFrameItems = [...(data.landscapeFrameSelection ?? [])];
    this.coverItems = [...(data.coverSelection ?? [])];

    console.log('Initial Client Data in ImageGallery:', data);
  }

  // ---------- Navigation between steps ----------

  prevStep() {
    this.clientDataService.triggerNextStep(1);
  }

  nextStep() {
    const totalAlbumSelected =
      this.clientDataload.tranditionalAlbumSelection.length +
      this.clientDataload.candidAlbumSelection.length;

    if (totalAlbumSelected < this.clientDataload.noOfPics) {
      const alertMessage = `You have selected ${totalAlbumSelected} images. Please select a total of ${this.clientDataload.noOfPics} images to proceed.`;
      this.notify.error(alertMessage);
      return;
    }
    this.clientDataService.triggerNextStep(3);
  }

  // ---------- Folder selection ----------

  async gobackFolderSelection() {
    const confirmed = await this.notify.confirm(
      'Are you sure you want to go back?<br/>Any unsaved changes in this folder will be lost.'
    );
    if (!confirmed) return;

    this.galleryOpen = false;
    this.selectedFolderName = '';
  }

  showGallery(folderName: string) {
    this.loading = true;
    this.selectedFolderName = folderName;
    this.images = [];
    this.displayedImages = [];
    this.selectedItems = [];
    this.viewFilter = 'all';
    this.frameChoiceForFileName = null;

    const data = this.clientDataService.getData();
    this.clientDataload = data;

    if (folderName === this.folderNames[0]) {
      this.isTraditional = true;
      this.selectedItems = [...data.tranditionalAlbumSelection];
    } else {
      this.isTraditional = false;
      this.selectedItems = [...data.candidAlbumSelection];
    }

    this.galleryOpen = true;
    this.getImagesbyPath();
  }

  // ---------- Visible images & batching ----------

  // All images visible under current filter
  get visibleImages(): string[] {
    const base = this.images;

    switch (this.viewFilter) {
      case 'album':
        return base.filter((img) => this.isAlbumSelected(img));
      case 'frame':
        return base.filter((img) => this.isAnyFrameSelected(img));
      case 'cover':
        return base.filter((img) => this.isCoverSelected(img));
      case 'all':
      default:
        return base;
    }
  }

  private resetInfiniteScroll(): void {
    const source = this.visibleImages;
    this.displayedImages = source.slice(0, this.batchSize);
  }

  onLoadMoreClick() {
    const source = this.visibleImages;
    const alreadyShown = this.displayedImages.length;

    if (alreadyShown >= source.length || this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    // small delay so the loading state is visible
    setTimeout(() => {
      const nextChunk = source.slice(
        alreadyShown,
        alreadyShown + this.batchSize
      );
      this.displayedImages = [...this.displayedImages, ...nextChunk];
      this.isLoadingMore = false;
    }, 150);
  }

  get showingFrom(): number {
    return this.displayedImages.length > 0 ? 1 : 0;
  }

  get showingTo(): number {
    return this.displayedImages.length;
  }

  // ---------- Helpers for folder type from URL ----------

  fileTypeFromUrl(url: string): string {
    // returns "traditional" or "candid" (2nd last segment)
    return url.split('?')[0].split('/').slice(-2, -1)[0] || '';
  }

  private getCurrentFolderType(): string {
    return this.isTraditional ? 'traditional' : 'candid';
  }

  fileNameFromUrl(url: string): string {
    const filename = url.split('?')[0].split('/').pop() || '';
    return decodeURIComponent(filename);
  }

  // ---------- Summary (per current folder) ----------

  private getAlbumCountInCurrentFolder(): number {
    // selectedItems is always for current folder only
    return this.selectedItems.length;
  }

  private getFrameCountInCurrentFolder(): number {
    const currentFolderType = this.getCurrentFolderType();
    const allFrames = [
      ...(this.portraitFrameItems || []),
      ...(this.landscapeFrameItems || []),
    ];
    return allFrames.filter(
      (x) => this.fileTypeFromUrl(x.url) === currentFolderType
    ).length;
  }

  private getCoverCountInCurrentFolder(): number {
    const currentFolderType = this.getCurrentFolderType();
    return (this.coverItems || []).filter(
      (x) => this.fileTypeFromUrl(x.url) === currentFolderType
    ).length;
  }

  // public getters for template

  get albumCountInCurrentFolder(): number {
    return this.getAlbumCountInCurrentFolder();
  }

  get frameCountInCurrentFolder(): number {
    return this.getFrameCountInCurrentFolder();
  }

  get coverCountInCurrentFolder(): number {
    return this.getCoverCountInCurrentFolder();
  }

  // limits from server
  get albumLimit(): number {
    return Number(this.clientDataload.noOfPics) || 0;
  }
  get frameLimit(): number {
    return Number(this.clientDataload.noOfFrames) || 0;
  }
  get coverLimit(): number {
    return Number(this.clientDataload.noOfAlbumCover) || 0;
  }

  // overall counts (Traditional + Candid + current unsaved for this folder)
  get totalAlbumCount(): number {
    const current = this.selectedItems.length;
    const otherFolderSaved = this.isTraditional
      ? this.clientDataload.candidAlbumSelection.length
      : this.clientDataload.tranditionalAlbumSelection.length;
    return current + otherFolderSaved;
  }

  get totalFrameCount(): number {
    return (
      (this.portraitFrameItems?.length || 0) +
      (this.landscapeFrameItems?.length || 0)
    );
  }

  get totalCoverCount(): number {
    return this.coverItems?.length || 0;
  }

  get TotalSelectionMessage(): string {
    const noofPhotos = Number(this.clientDataload.noOfPics) || 0;
    const totalFramesAllowed = Number(this.clientDataload.noOfFrames) || 0;
    const totalCoversAllowed = Number(this.clientDataload.noOfAlbumCover) || 0;

    const albumFolderCount = this.getAlbumCountInCurrentFolder();
    const frameFolderCount = this.getFrameCountInCurrentFolder();
    const coverFolderCount = this.getCoverCountInCurrentFolder();

    return `
      <div class="summary-row">
        <span class="summary-label">Album (this folder):</span>
        <span class="summary-value">${albumFolderCount} / ${noofPhotos}</span>

        <span class="summary-separator">|</span>

        <span class="summary-label">Frames (this folder):</span>
        <span class="summary-value">${frameFolderCount} / ${totalFramesAllowed}</span>

        <span class="summary-separator">|</span>

        <span class="summary-label">Cover (this folder):</span>
        <span class="summary-value">${coverFolderCount} / ${totalCoversAllowed}</span>
      </div>
    `;
  }

  // ---------- Filter bar ----------

  onFilterChange(filter: ViewFilter) {
    this.viewFilter = filter;
    this.resetInfiniteScroll();
  }

  // ---------- Selection helpers ----------

  isAlbumSelected(imgUrl: string): boolean {
    const fileName = this.fileNameFromUrl(imgUrl);
    return this.selectedItems.some((x) => x.fileName === fileName);
  }

  isAnyFrameSelected(imgUrl: string): boolean {
    return (
      this.isPortraitFrameSelected(imgUrl) ||
      this.isLandscapeFrameSelected(imgUrl)
    );
  }

  isPortraitFrameSelected(imgUrl: string): boolean {
    const fileName = this.fileNameFromUrl(imgUrl);
    return this.portraitFrameItems.some((x) => x.fileName === fileName);
  }

  isLandscapeFrameSelected(imgUrl: string): boolean {
    const fileName = this.fileNameFromUrl(imgUrl);
    return this.landscapeFrameItems.some((x) => x.fileName === fileName);
  }

  isCoverSelected(imgUrl: string): boolean {
    const fileName = this.fileNameFromUrl(imgUrl);
    return this.coverItems.some((x) => x.fileName === fileName);
  }

  // ---------- Album selection ----------

  isMaximumAlbumSelected(): boolean {
    const current = this.selectedItems.length;
    const otherFolderSaved = this.isTraditional
      ? this.clientDataload.candidAlbumSelection.length
      : this.clientDataload.tranditionalAlbumSelection.length;
    const total = current + otherFolderSaved;
    return total >= this.clientDataload.noOfPics;
  }

  toggleAlbumSelection(imgUrl: string, event?: Event) {
    if (event) event.stopPropagation();

    const fileName = this.fileNameFromUrl(imgUrl);
    const idx = this.selectedItems.findIndex((x) => x.fileName === fileName);

    if (idx >= 0) {
      this.selectedItems.splice(idx, 1);
    } else {
      if (this.isMaximumAlbumSelected()) {
        this.notify.error(
          'You have already selected the maximum number of album pictures.'
        );
        return;
      }
      this.selectedItems.push(this.buildSelectionItem(imgUrl, 'album'));
    }

    if (this.viewFilter !== 'all') {
      this.resetInfiniteScroll();
    }
  }

  // ---------- Frame selection ----------

  private get totalFrameSelected(): number {
    return (
      (this.portraitFrameItems?.length || 0) +
      (this.landscapeFrameItems?.length || 0)
    );
  }

  toggleFramePopup(imgUrl: string, event: Event) {
    event.stopPropagation();
    const fileName = this.fileNameFromUrl(imgUrl);
    this.frameChoiceForFileName =
      this.frameChoiceForFileName === fileName ? null : fileName;
  }

  onFrameOrientationClick(
    event: Event,
    imgUrl: string,
    orientation: 'portrait' | 'landscape'
  ) {
    event.stopPropagation();
    this.setFrameSelection(imgUrl, orientation);
  }

  setFrameSelection(imgUrl: string, orientation: 'portrait' | 'landscape') {
    const fileName = this.fileNameFromUrl(imgUrl);
    const target =
      orientation === 'portrait'
        ? this.portraitFrameItems
        : this.landscapeFrameItems;
    const other =
      orientation === 'portrait'
        ? this.landscapeFrameItems
        : this.portraitFrameItems;

    const targetIndex = target.findIndex((x) => x.fileName === fileName);
    const otherIndex = other.findIndex((x) => x.fileName === fileName);

    // already in this orientation → unselect
    if (targetIndex >= 0) {
      target.splice(targetIndex, 1);
    } else {
      if (otherIndex >= 0) {
        const moved = other.splice(otherIndex, 1)[0];
        target.push(moved);
      } else {
        if (this.totalFrameSelected >= this.clientDataload.noOfFrames) {
          this.notify.error(
            'You have already selected the maximum number of frame pictures.'
          );
          this.frameChoiceForFileName = null;
          return;
        }
        target.push(this.buildSelectionItem(imgUrl, orientation));
      }
    }

    this.frameChoiceForFileName = null;

    if (this.viewFilter === 'frame') {
      this.resetInfiniteScroll();
    }
  }

  // ---------- Cover selection ----------

  toggleCoverSelection(imgUrl: string, event?: Event) {
    if (event) event.stopPropagation();

    const fileName = this.fileNameFromUrl(imgUrl);
    const idx = this.coverItems.findIndex((x) => x.fileName === fileName);

    if (idx >= 0) {
      this.coverItems.splice(idx, 1);
    } else {
      if (this.coverItems.length >= this.clientDataload.noOfAlbumCover) {
        this.notify.error(
          'You have already selected the maximum number of cover pictures.'
        );
        return;
      }
      this.coverItems.push(this.buildSelectionItem(imgUrl, 'cover'));
    }

    if (this.viewFilter === 'cover') {
      this.resetInfiniteScroll();
    }
  }

  // ---------- Build selection item (uses fileTypeFromUrl) ----------

  private buildSelectionItem(
    imgUrl: string,
    type: string
  ): AlbumSelectionItem {
    const folderType = this.fileTypeFromUrl(imgUrl); // "traditional" or "candid"
    const isTraditionalFlag = folderType.toLowerCase() === 'traditional';

    return {
      fileName: this.fileNameFromUrl(imgUrl),
      comment: '',
      type: type,
      url: imgUrl,
      isTraditional: isTraditionalFlag,
      // @ts-ignore if not defined in model
      sourceFolder: folderType,
    };
  }

  // ---------- Preview ----------

  openPreview(imgUrl: string) {
    this.previewImageUrl = imgUrl;
    this.previewFileName = this.fileNameFromUrl(imgUrl);
    const existing = this.selectedItems.find(
      (x) => x.fileName === this.previewFileName
    );
    this.previewComment = existing?.comment ?? '';
    this.previewLoading = true;
  }

  onPreviewImageLoad() {
    this.previewLoading = false;
  }

  closePreview() {
    this.previewImageUrl = null;
    this.previewFileName = '';
    this.previewComment = '';
    this.previewLoading = false;
    this.frameChoiceForFileName = null;
  }

  private getCurrentImageIndex(): number {
    if (!this.previewImageUrl) return -1;
    return this.visibleImages.indexOf(this.previewImageUrl);
  }

  showNextImage(event: Event) {
    event.stopPropagation();
    const list = this.visibleImages;
    const idx = this.getCurrentImageIndex();
    if (idx >= 0 && idx < list.length - 1) {
      this.previewImageUrl = list[idx + 1];
      this.previewFileName = this.fileNameFromUrl(this.previewImageUrl);
    } else {
      this.notify.error('You’ve reached the last image.');
    }
  }

  showPreviousImage(event: Event) {
    event.stopPropagation();
    const list = this.visibleImages;
    const idx = this.getCurrentImageIndex();
    if (idx > 0) {
      this.previewImageUrl = list[idx - 1];
      this.previewFileName = this.fileNameFromUrl(this.previewImageUrl);
    } else {
      this.notify.error('This is the first image.');
    }
  }

  // ---------- API & Save ----------

  getImagesbyPath() {
    const folderPath = this.isTraditional ? 'traditional' : 'candid';
    this.fetchData(this.clientDataload.clientId.toString() ?? '', folderPath);
  }

  fetchData(clientId: string, folderPath: string): void {
    this.loading = true;
    this.userService.getImagesbyType(clientId, folderPath).subscribe({
      next: (data) => {
        this.images = data;
        this.resetInfiniteScroll();
        this.loading = false;
      },
      error: (error) => {
        console.log('There was an error!', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  updateModelWithLatestData(): clientData {
    const existingData: clientData = this.clientDataService.getData();
    const propertyToUpdate = this.isTraditional
      ? 'tranditionalAlbumSelection'
      : 'candidAlbumSelection';

    const updated: clientData = {
      ...existingData,
      [propertyToUpdate]: [...this.selectedItems],
      portraitFrameSelection: [...this.portraitFrameItems],
      landscapeFrameSelection: [...this.landscapeFrameItems],
      coverSelection: [...this.coverItems],
      status: 'Inprogress',
    };

    this.clientDataService.updateData(updated);
    this.clientDataload = updated;
    return updated;
  }

  async saveSelection() {
    const payload = this.updateModelWithLatestData();
    this.apiCalltoSave(payload);
  }

  apiCalltoSave(updateData: clientData) {
    this.loading = true;

    console.log('Payload sent to API:', JSON.stringify(updateData, null, 2));

    this.userService.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.loading = false;
        this.notify.success('Your selections saved successfully!');
        this.galleryOpen = false;
        this.selectedFolderName = '';
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.loading = false;
        this.notify.error('Failed to save your selection!');
      },
    });
  }
}
