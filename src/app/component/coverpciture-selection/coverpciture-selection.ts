import { Component } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumSelectionItem } from '../../model/album-selection-item.model';
import { clientData } from '../../model/clientData';
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
  ) {}

  //folder selection logic
  galleryOpen = false;

  // Image gallery logic
  images: string[] = [];
  pageSize = 50;
  currentPage = 1;

  selectedItems: AlbumSelectionItem[] = [];
  allowedSelectedPhotos = 0; // Set your limit here
  loading = true;
  previewLoading = false;

  previewImageUrl: string | null = null;
  previewFileName = '';
  previewComment = '';

  pagelatestData: clientData = new clientData();
  apiImageResponse: any;

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(4);
    this.loading = true;
    const data = this.clientDataService.getData();
    this.pagelatestData = data;
    this.loading = false;
    console.log('Initial Client Data in cover source:', this.images);
  }

  showGallery() {
    this.loading = true;
    const gallerySection = document.getElementById('gallerySection');
    const selectionSection = document.getElementById('selctionSection');
    this.selectedItems = [];
    this.galleryOpen = true;
    this.resetPagination();
    this.selectedItems = [...this.pagelatestData.coverSelection];
    if (this.images.length == 0)
      this.fetchData(this.pagelatestData.clientId.toString());
    else this.loading = false;
  }

  resetPagination() {
    this.currentPage = 1;
  }

  gobackFolderSelection() {
    const confirmCancelled = confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      return;
    }
    this.galleryOpen = false;
  }

  prevStep() {
    this.clientDataService.triggerNextStep(3);
  }

  nextStep() {
    if (
      this.pagelatestData.coverSelection.length < this.allowedSelectedPhotos
    ) {
      this.notify.error(
        `Please select ${this.allowedSelectedPhotos}  picture for album cover!`
      );
      return;
    }
    this.clientDataService.triggerNextStep(5);
  }

  getImageUrls(data: Array<{ imageUrl: string }> | null | undefined): void {
    this.apiImageResponse = data;
    this.images = data ? data.map((item) => item.imageUrl) : [];
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.images.length / this.pageSize));
  }

  get paginatedImages(): string[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.images.slice(start, start + this.pageSize);
  }

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

  get TotalSelectionMessage(): string {
    const noofCover = this.allowedSelectedPhotos;
    const CoverPictureCount = this.pagelatestData.coverSelection.length;

    const difference = noofCover - this.selectedItems.length;

    const message = `
 <span class=""> Selection(s) remaining: ${difference} of ${this.allowedSelectedPhotos}</span>
`;
    return message;
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

  toggleSelection(imgageUrl: string) {
    const fileName = this.fileNameFromUrl(imgageUrl);
    const idx = this.doesthisfileExistInSelection(fileName, imgageUrl);

    if (idx >= 0) {
      this.selectedItems.splice(idx, 1);
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
        type: 'cover',
        url: imgageUrl,
      });
    }

    console.log('selected photos', this.selectedItems);
  }

  checkMaxSelectedCountReached() {
    return this.selectedItems.length >= this.allowedSelectedPhotos;
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

  fetchData(clientId: string): void {
    this.loading = true;
    console.log('Fetching data from API...');
    this.userservice.getSelectedImagesbyClientId(clientId).subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.getImageUrls(data);
        this.loading = false;
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        console.log('There was an error!', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getitemfromSelection(imageUrl: string): any {
    const fileName = this.fileNameFromUrl(imageUrl);
    return this.selectedItems.find(
      (x) =>
        x.fileName === fileName &&
        this.fileTypeFromUrl(x.url) === this.fileTypeFromUrl(imageUrl)
    );
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
        type: 'cover',
        url: this.previewImageUrl || '',
      };

      this.selectedItems.push(item);
    }

    item.comment = this.previewComment;
    this.loading = false;
    this.closePreview();
  }

  saveSelection() {
    this.apiCalltoSave(this.updateModelWithLatestData());
  }

  updateModelWithLatestData() {
    const existingData: clientData = this.clientDataService.getData();

    const updated: clientData = {
      ...existingData,
      coverSelection: [...this.selectedItems],
      status: 'Inprogress',
    };

    this.clientDataService.updateData(updated);
    this.pagelatestData = updated;
    return updated;
    console.log('Saved to ClientDataService: cover', updated);
  }

  apiCalltoSave(updateData: clientData) {
    this.loading = true;
    console.log('Payload sent to API:', JSON.stringify(updateData, null, 2));

    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.loading = false;
        this.notify.success('Your Selection/unselection saved successfully!');
        this.galleryOpen = false;
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.loading = false;
        this.notify.error('Failed to save your selection!');
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
}
