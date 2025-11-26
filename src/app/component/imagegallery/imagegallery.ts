import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumSelectionItem } from '../../model/album-selection-item.model';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData } from '../../model/clientData';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';

@Component({
  selector: 'app-imagegallery',
  imports: [CommonModule, FormsModule],
  templateUrl: './imagegallery.html',
  styleUrl: './imagegallery.css',
})
export class Imagegallery implements OnInit {
  //folder selection logic
  folderNames: string[] = ['Traditional Photos', 'Candid Photos'];
  selectedFolderName: string = '';
  isTraditional: boolean = true;

  // Image gallery logic
  images: string[] = [];
  selectedItems: AlbumSelectionItem[] = [];

  loading = true;
  galleryOpen = false;
  previewLoading = false;

  previewImageUrl: string | null = null;
  previewFileName = '';
  previewComment = '';
  showSelectedOnly: boolean = false;

  clientDataload: clientData = new clientData();
  batchSize = 30; // how many images to load per batch
  displayCount = 0; // how many images currently shown

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
    console.log('Initial Client Data in ImageGallery:', data);
  }

  showGallery(folderName: string) {
    this.loading = true;

    const gallerySection = document.getElementById('gallerySection');
    const selectionSection = document.getElementById('selctionSection');
    this.selectedFolderName = folderName;
    this.images = [];
    this.selectedItems = [];
    const data = this.clientDataService.getData();
    this.clientDataload = data;
    this.galleryOpen = true;

    if (folderName === this.folderNames[0]) {
      this.isTraditional = true;
      this.selectedItems = [...data.tranditionalAlbumSelection];
      console.log('traditional selected photos', this.selectedItems);
    } else {
      this.isTraditional = false;
      this.selectedItems = [...data.candidAlbumSelection];
      console.log('candid selected photos', this.selectedItems);
    }

    this.getImagesbyPath();
  }

  async gobackFolderSelection() {
    const confirmCancelled = await this.notify.confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      return;
    }

    this.galleryOpen = false;
    this.selectedFolderName = '';
  }

  prevStep() {
    this.clientDataService.triggerNextStep(1);
  }

  nextStep() {
    if (
      this.clientDataload.tranditionalAlbumSelection.length +
        this.clientDataload.candidAlbumSelection.length <
      this.clientDataload.noOfPics
    ) {
      const alertMessage = `You have selected ${
        this.clientDataload.tranditionalAlbumSelection.length +
        this.clientDataload.candidAlbumSelection.length
      } images. Please select a total of ${
        this.clientDataload.noOfPics
      } images to proceed.`;

      this.notify.error(alertMessage);
      return;
    }
    this.clientDataService.triggerNextStep(3);
  }

  get TotalSelectionMessage(): string {
    const noofPhotos = Number(this.clientDataload.noOfPics) || 0;
    const tradionalCount =
      this.clientDataload.tranditionalAlbumSelection.length;
    const CandidCount = this.clientDataload.candidAlbumSelection.length;
    const addOtherTypeCount = this.isTraditional ? CandidCount : tradionalCount;
    const difference =
      noofPhotos - (this.selectedItems.length + addOtherTypeCount);

    const message = `
  <span class="">Saved Photos - </span> <span class="text-white">
  Traditional: ${tradionalCount} | 
  Candid: ${CandidCount} | </span>
 <span class=""> Selection(s) remaining: ${difference} of ${noofPhotos}</span>
`;
    return message;
  }

  fileNameFromUrl(url: string): string {
    const filename = url.split('?')[0].split('/').pop() || '';
    return decodeURIComponent(filename);
  }

  isSelected(imgUrl: string): boolean {
    const fileName = this.fileNameFromUrl(imgUrl);
    return this.selectedItems.some((x) => x.fileName === fileName);
  }

  toggleSelection(imgUrl: string) {
    const fileName = this.fileNameFromUrl(imgUrl);
    const idx = this.selectedItems.findIndex((x) => x.fileName === fileName);

    if (idx >= 0) {
      this.selectedItems.splice(idx, 1); //remove that item
    } else {
      if (this.isMaximumImagesSelected()) {
        this.notify.error(
          'You have already made required selction, if you want to add more, please contact sales team.'
        );
        return;
      }
      this.selectedItems.push({
        fileName: this.fileNameFromUrl(imgUrl),
        comment: '',
        type: 'image',
        url: imgUrl,
        isTraditional: this.isTraditional,
      });
    }

    console.log('selected photos', this.selectedItems);
  }

  isMaximumImagesSelected(): boolean {
    let overAllSelectedCount = this.selectedItems.length;
    if (this.isTraditional) {
      overAllSelectedCount += this.clientDataload.candidAlbumSelection.length;
    } else {
      overAllSelectedCount +=
        this.clientDataload.tranditionalAlbumSelection.length;
    }
    return overAllSelectedCount >= this.clientDataload.noOfPics;
  }

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
  }

  savePreviewComment() {
    const fileName = this.previewFileName;
    let item = this.selectedItems.find((x) => x.fileName === fileName);

    if (!item) {
      if (this.isMaximumImagesSelected()) {
        this.notify.error(
          'You have already selected required images, if you want to add more, please contact sales team.'
        );
        return;
      }
      item = {
        fileName: this.fileNameFromUrl(fileName),
        comment: '',
        type: 'image',
        url: this.previewImageUrl || '',
        isTraditional: this.isTraditional,
      };
      this.selectedItems.push(item);
    }

    item.comment = this.previewComment;
    this.closePreview();
  }

  getImagesbyPath() {
    let folderPath = this.isTraditional ? 'traditional' : 'candid';
    this.fetchData(this.clientDataload.clientId.toString() ?? '', folderPath);
  }

  fetchData(clientId: string, folderPath: string): void {
    this.loading = true;
    console.log('Fetching data from API...');
    this.userService.getImagesbyType(clientId, folderPath).subscribe({
      next: (data) => {
        this.images = data;
        this.displayCount = Math.min(this.batchSize, this.images.length);
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

  async saveSelection() {
    // If Frame/Cover is NOT selected, save immediately.
    if (!this.isFrameOrCoverSelected()) {
      this.apiCalltoSave(this.updateModelWithLatestData());
      return;
    }

    const confirmed = await this.notify.confirm(
      'You have already selected Frame/Cover photos. Any changes will clear frame/cover selection and require you to reselect again.<br/> Do you want to proceed?'
    );

    // If the user confirms (clicks OK), proceed with saving.
    if (confirmed) {
      this.apiCalltoSave(this.updateModelWithLatestData(true));
    }

    // If the user cancels (clicks Cancel), the function returns, doing nothing.
  }

  isFrameOrCoverSelected(): boolean {
    return (
      this.clientDataload.portraitFrameSelection.length > 0 ||
      this.clientDataload.landscapeFrameSelection.length > 0 ||
      this.clientDataload.coverSelection.length > 0
    );
  }

  updateModelWithLatestData(clearFrameCover: boolean = false) {
    const existingData: clientData = this.clientDataService.getData();
    const propertyToUpdate = this.isTraditional
      ? 'tranditionalAlbumSelection'
      : 'candidAlbumSelection';

    if (clearFrameCover) {
      existingData.portraitFrameSelection = [];
      existingData.landscapeFrameSelection = [];
      existingData.coverSelection = [];
    }
    const updated: clientData = {
      ...existingData,
      [propertyToUpdate]: [...this.selectedItems],
      status: 'Inprogress',
    };

    this.clientDataService.updateData(updated);
    this.clientDataload = updated;
    return updated;
    console.log('Saved to ClientDataService:', updated);
  }

  apiCalltoSave(updateData: clientData) {
    this.loading = true;

    console.log('Payload sent to API:', JSON.stringify(updateData, null, 2));

    this.userService.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.loading = false;
        this.notify.success('Your Selection/unselection saved successfully!');
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

  // Find current index
  getCurrentImageIndex(): number {
  if (this.previewImageUrl === null) {
    return -1;
  }
  return this.viewImages.indexOf(this.previewImageUrl);
}

showNextImage(event: Event) {
  event.stopPropagation();
  const list = this.viewImages;
  const currentIndex = this.getCurrentImageIndex();

  if (currentIndex >= 0 && currentIndex < list.length - 1) {
    this.previewImageUrl = list[currentIndex + 1];
    this.previewFileName = this.fileNameFromUrl(this.previewImageUrl);
  } else {
    this.notify.error('You’ve reached the last image.');
  }
}

showPreviousImage(event: Event) {
  event.stopPropagation();
  const list = this.viewImages;
  const currentIndex = this.getCurrentImageIndex();

  if (currentIndex > 0) {
    this.previewImageUrl = list[currentIndex - 1];
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
    return this.images.filter((img) => this.isSelected(img));
  }

  get viewImages(): string[] {
    return this.visibleImages.slice(0, this.displayCount);
  }

  loadMore() {
    const remaining = this.visibleImages.length - this.displayCount;
    if (remaining > 0) {
      this.displayCount += Math.min(this.batchSize, remaining);
    }
  }

  onShowSelectedToggle() {
    // reset to first batch of whatever is now visible
    this.displayCount = Math.min(this.batchSize, this.visibleImages.length);
  }

  @HostListener('window:scroll', [])
onWindowScroll() {
  // Only apply when gallery is open
  if (!this.galleryOpen) {
    return;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return; // safety for SSR, just in case
  }

  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = 200; // px before bottom to start loading
  const pageHeight = document.body.offsetHeight;

  // Are we near the bottom of the page?
  if (scrollPosition >= pageHeight - threshold) {
    this.loadMore();
  }
}

}
