import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumSelectionItem } from '../../model/album-selection-item.model';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData } from '../../model/clientData';
import { userserviceapi } from '../../services/userservice';
import { Notificationservice } from '../../services/notificationservice';

@Component({
  selector: 'app-framepicturecomponent',
  imports: [CommonModule, FormsModule],
  templateUrl: './framepicturecomponent.html',
  styleUrl: './framepicturecomponent.css',
})
export class Framepicturecomponent {
  constructor(
    private clientDataService: ClientDataService,
    private userservice: userserviceapi,
    private notify: Notificationservice
  ) {}

  //folder selection logic
  folderNames: string[] = ['Traditional Photos', 'Candid Photos'];
  selectedFolderName: string = '';
  allowedSelectedPhotos = 0; // Set your limit here
  selectedImageUrl: string | null = null;
  isPortrait: boolean = true;
  showGallerySection = true;

  // Image gallery logic
  images: string[] = [];
  pageSize = 50;
  currentPage = 1;

  selectedItems: AlbumSelectionItem[] = [];

  loading = true;
  previewLoading = false;

  previewImageUrl: string | null = null;
  previewFileName = '';
  previewComment = '';
  isVisible = true;

  galleryOpen = false;
  pagelatestData: clientData = new clientData();

  apiImageResponse: any;
  showSelectedOnly: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.clientDataService.triggerNextStep(3);
    const data = this.clientDataService.getData();
    this.pagelatestData = data;
    this.loading = false;
    console.log('Initial Client Data in frameselectin source:', this.images);
  }

  resetPagination() {
    this.currentPage = 1;
  }

  showGallery(isPortrait: boolean) {
    this.loading = true;
    this.selectedItems = [];
    this.isPortrait = isPortrait;
    this.selectedFolderName = isPortrait ? 'Portrait Frame' : 'Landscape Frame';
    this.galleryOpen = true;
    this.resetPagination();

    if (isPortrait) {
      this.selectedItems = [...this.pagelatestData.portraitFrameSelection];
    } else {
      this.selectedItems = [...this.pagelatestData.landscapeFrameSelection];
    }
    if (this.images.length == 0)
      this.fetchData(this.pagelatestData.clientId.toString());
    else this.loading = false;
  }

  gobackFolderSelection() {
    const confirmCancelled = confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      return;
    }

    this.galleryOpen = false;
    this.selectedFolderName = '';
  }

  prevStep() {
    this.clientDataService.triggerNextStep(2);
  }

  nextStep() {
    if (
      this.pagelatestData.portraitFrameSelection.length +
        this.pagelatestData.landscapeFrameSelection.length <
      this.pagelatestData.noOfFrames
    ) {
      this.notify.error(
        `Please select ${this.pagelatestData.noOfFrames} picture for frame!`
      );
      return;
    }
    this.clientDataService.triggerNextStep(4);
  }

  get TotalSelectionMessage(): string {
    const noOfFrames = Number(this.pagelatestData.noOfFrames) || 0;
    const portraitCount = this.pagelatestData.portraitFrameSelection.length;
    const LandscapeCount = this.pagelatestData.landscapeFrameSelection.length;
    const addOtherTypeCount = this.isPortrait ? LandscapeCount : portraitCount;

    const difference =
      noOfFrames - (this.selectedItems.length + addOtherTypeCount);

    const message = `<span class="">Saved Photos - </span> <span class="text-white">
  Portrait: ${portraitCount} | 
  Landscape: ${LandscapeCount} | </span>
 <span class=""> Selection(s) remaining: ${difference} of ${noOfFrames}</span>`;
    return message;
  }

  getImageUrls(data: Array<{ imageUrl: string }> | null | undefined): void {
    this.apiImageResponse = data;
    this.allowedSelectedPhotos = this.pagelatestData.noOfFrames;
    this.images = data ? data.map((item) => item.imageUrl) : [];
  }

  // get totalPages(): number {
  //   return Math.max(1, Math.ceil(this.images.length / this.pageSize));
  // }

  // get paginatedImages(): string[] {
  //   const start = (this.currentPage - 1) * this.pageSize;
  //   return this.images.slice(start, start + this.pageSize);
  // }

  changePage(step: number) {
    const next = this.currentPage + step;
    if (next >= 1 && next <= this.totalPages) this.currentPage = next;
  }

  fileNameFromUrl(url: string): string {
    const filename = url.split('?')[0].split('/').pop() || '';
    return decodeURIComponent(filename);
  }

  fileTypeFromUrl(url: string): string {
    return url.split('?')[0].split('/').slice(-2, -1)[0] || '';
  }

  isSelected(imgUrl: string): boolean {
    const fileName = this.fileNameFromUrl(imgUrl);
    return this.selectedItems.some(
      (x) =>
        x.fileName === fileName &&
        this.fileTypeFromUrl(x.url) === this.fileTypeFromUrl(imgUrl)
    );
  }

  doesthisfileExistInSelection(fileName: string, image: string): number {
    const idx = this.selectedItems.findIndex(
      (x) =>
        x.fileName === fileName &&
        this.fileTypeFromUrl(x.url) === this.fileTypeFromUrl(image)
    );

    return idx;
  }

  toggleSelection(imageUrl: string) {
    const fileName = this.fileNameFromUrl(imageUrl);
    const idx = this.doesthisfileExistInSelection(fileName, imageUrl);

    if (idx >= 0) {
      this.selectedItems.splice(idx, 1); //remove
    } else {
      if (this.checkMaxSelectedCountReached()) {
        this.notify.error(
          'You have already selected required images, if you want to add more, please contact sales team.'
        );
        return;
      }

      this.selectedItems.push({
        fileName: fileName,
        comment: '',
        type: this.isPortrait ? 'portrait' : 'landscape',
        url: imageUrl,
      });
    }
    console.log('selected photos', this.selectedItems);
  }

  openPreview(imageUrl: string) {
    this.previewImageUrl = imageUrl;
    this.previewFileName = this.fileNameFromUrl(imageUrl);
    const existing = this.selectedItems.find(
      (x) =>
        x.fileName === this.previewFileName &&
        this.fileTypeFromUrl(x.url) === this.fileTypeFromUrl(imageUrl)
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
  }

  getitemfromSelection(imageUrl: string): any {
    const fileName = this.fileNameFromUrl(imageUrl);
    return this.selectedItems.find(
      (x) =>
        x.fileName === fileName &&
        this.fileTypeFromUrl(x.url) === this.fileTypeFromUrl(imageUrl)
    );
  }

  checkMaxSelectedCountReached() {
    let overAllSelectedCount = this.selectedItems.length;
    if (this.isPortrait) {
      overAllSelectedCount +=
        this.pagelatestData.landscapeFrameSelection.length;
    } else {
      overAllSelectedCount += this.pagelatestData.portraitFrameSelection.length;
    }

    return overAllSelectedCount >= this.allowedSelectedPhotos;
  }

  savePreviewComment() {
    this.loading = true;

    const imageUrl = this.previewImageUrl || '';
    let item = this.getitemfromSelection(imageUrl);

    if (!item) {
      if (this.checkMaxSelectedCountReached()) {
        this.notify.error(
          'You have already selected required images, if you want to add more, please contact sales team.'
        );
        this.loading = false;
        return;
      }
      item = {
        fileName: this.fileNameFromUrl(imageUrl),
        comment: '',
        type: this.isPortrait ? 'portrait' : 'landscape',
        url: this.previewImageUrl || '',
      };
      this.selectedItems.push(item);
    }

    item.comment = this.previewComment;
    this.loading = false;
    this.closePreview();
  }

  fetchData(clientId: string): void {
    console.log('Fetching data from API...');
    this.userservice.getSelectedImagesbyClientId(clientId).subscribe({
      next: (data) => {
        console.log('API Response:', data);
        this.getImageUrls(data);
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

  saveSelection() {
    this.loading = true;
    this.apiCalltoSave(this.updateModelWithLatestData());
  }

  updateModelWithLatestData() {
    const existingData: clientData = this.clientDataService.getData();

    const propertyToUpdate = this.isPortrait
      ? 'portraitFrameSelection'
      : 'landscapeFrameSelection';

    const updated: clientData = {
      ...existingData,
      [propertyToUpdate]: [...this.selectedItems],
      status: 'Inprogress',
    };

    this.clientDataService.updateData(updated);
    this.pagelatestData = updated;
    return updated;
    console.log('Saved to ClientDataService: frame', updated);
  }

  apiCalltoSave(updateData: clientData) {
    console.log('Payload sent to API:', JSON.stringify(updateData, null, 2));

    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.notify.success('Your Selection/unselection saved successfully!');
        this.galleryOpen = false;
        this.selectedFolderName = '';
        this.loading = false;
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.loading = false;
        this.notify.error('Failed to save your selection!');
      },

      complete: () => {
        this.loading = false;
      },
    });
  }
  // Find current index
  getCurrentImageIndex(): number {
    if (this.previewImageUrl === null) {
      return -1;
    }
    return this.paginatedImages.indexOf(this.previewImageUrl);
  }

  showNextImage(event: Event) {
    event.stopPropagation();
    let currentIndex = this.getCurrentImageIndex();
    if (currentIndex < this.paginatedImages.length - 1) {
      this.previewImageUrl = this.paginatedImages[currentIndex + 1];
      this.previewFileName = this.fileNameFromUrl(this.previewImageUrl);
    } else {
      this.notify.error('You’ve reached the last image.');
    }
  }

  showPreviousImage(event: Event) {
    event.stopPropagation();
    let currentIndex = this.getCurrentImageIndex();
    if (currentIndex > 0) {
      this.previewImageUrl = this.paginatedImages[currentIndex - 1];
      this.previewFileName = this.fileNameFromUrl(this.previewImageUrl);
    } else {
      this.notify.error('This is the first image.');
    }
  }

  // All images that should currently be visible (filtered or full)
get visibleImages(): string[] {
  if (!this.showSelectedOnly) {
    return this.images;
  }
  // only keep images that are selected
  return this.images.filter((img) => this.isSelected(img));
}

get totalPages(): number {
  return Math.max(1, Math.ceil(this.visibleImages.length / this.pageSize));
}

get paginatedImages(): string[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.visibleImages.slice(start, start + this.pageSize);
}

onShowSelectedToggle() {
  this.currentPage = 1;
}


}
