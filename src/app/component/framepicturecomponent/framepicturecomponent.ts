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
  allowedSelectedPhotos = 2; // Set your limit here
  selectedImageUrl: string | null = null;
  isPortait: boolean = true;
  showGallerySection = true;

  showGallery(isPortait: boolean) {
    const gallerySection = document.getElementById('gallerySection');
    const selectionSection = document.getElementById('selctionSection');
    this.selectedItems = [];

    this.isPortait = isPortait;
    this.selectedFolderName = isPortait ? 'Portrait Frame' : 'Landscape Frame';

    if (gallerySection && selectionSection) {
      gallerySection.style.display = 'block';
      selectionSection.style.display = 'none'; // Show selection section
    }
    if (isPortait) {
      this.selectedItems = [...this.pagelatestData.portraitFrameSelection];
    } else {
      this.selectedItems = [...this.pagelatestData.landscapeFrameSelection];
    }
  }

  gobackFolderSelection() {
    const confirmCancelled = confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      // User pressed Cancel, stop execution here
      return;
    }

    const gallerySection = document.getElementById('gallerySection');
    const selectionSection = document.getElementById('selctionSection');

    if (gallerySection && selectionSection) {
      gallerySection.style.display = 'none';
      selectionSection.style.display = 'block'; // Show selection section
    }

    this.selectedFolderName = '';
  }

  prevStep() {
    this.clientDataService.triggerPrevStep();
  }

  nextStep() {
    if(this.pagelatestData.portraitFrameSelection.length + this.pagelatestData.landscapeFrameSelection.length < 2)
    {
      this.notify.error('Please select 1 picture for portrait/landsape frame!')
      return;
    }
    this.clientDataService.triggerNextStep();
  }

  // Image gallery logic
  images: string[] = [];
  pageSize = 12;
  currentPage = 1;

  selectedItems: AlbumSelectionItem[] = [];

  loading = true;
  previewLoading = false;

  previewImage: string | null = null;
  previewFileName = '';
  previewComment = '';
  isVisible = true;

  baseUrl = 'https://picsum.photos/seed/';
  imageCount = 60;
  thumbW = 600;
  thumbH = 400;
  pagelatestData: clientData = new clientData();

  ngOnInit(): void {
    const data = this.clientDataService.getData();
    this.pagelatestData = data;
    const selectedImagesSource = this.selectedImagesSource();
    this.images = this.selectedImagesSource();
    console.log('image source - 2', this.images);
    this.loading = false;

    console.log('Initial Client Data in frameselectin source:', this.images);
  }

  selectedImagesSource() {
    const mergedArray: AlbumSelectionItem[] =
      this.pagelatestData.tranditionalAlbumSelection.concat(
        this.pagelatestData.candidAlbumSelection
      );

    const frameimagesSource: string[] = mergedArray.map(
      (item: AlbumSelectionItem) => item.url
    );
    return frameimagesSource;
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

  public fileNameFromUrl(url: string): string {
    return url; // treat whole URL as unique
  }

  isSelected(imgUrl: string): boolean {
    const fileName = this.fileNameFromUrl(imgUrl);
    return this.selectedItems.some((x) => x.fileName === fileName);
  }

  toggleSelection(imgUrl: string) {
    const fileName = this.fileNameFromUrl(imgUrl);
    const idx = this.selectedItems.findIndex((x) => x.fileName === fileName);

    if (idx >= 0) {
      this.selectedItems.splice(idx, 1);
    } else {
      if (this.selectedItems.length >= 1) {
        this.notify.error('You have already made required selction');
        return;
      }

      this.selectedItems.push({
        fileName,
        comment: '',
        type: this.isPortait ? 'portrait' : 'landscape',
        url: imgUrl,
      });
    }

    console.log('selected photos', this.selectedItems);
  }

  get hasPortraitType(): boolean {
    return this.pagelatestData.portraitFrameSelection.length > 0;
  }

  get hasLandscapeType(): boolean {
    return this.pagelatestData.landscapeFrameSelection.length > 0;
  }

  openPreview(imgUrl: string, mainFrame: boolean) {
    this.isVisible = mainFrame;

    this.previewImage = imgUrl;
    this.previewFileName = this.fileNameFromUrl(imgUrl);
    const existing = this.selectedItems.find(
      (x) => x.fileName === this.previewFileName
    );
    this.previewComment = existing?.comment ?? '';
    this.previewLoading = true;
  }

  // openPreviewFrame(inputType: string) {
  //   let imgUrl: any;

  //   imgUrl = this.selectedItems.find((item) => item.type === inputType)?.url;
  //   if (!imgUrl) {
  //     alert('No image selected for preview.');
  //     return;
  //   }

  //   this.previewImage = imgUrl;
  //   this.previewFileName = this.fileNameFromUrl(imgUrl);
  //   const existing = this.selectedItems.find(
  //     (x) => x.fileName === this.previewFileName
  //   );
  //   this.previewComment = existing?.comment ?? '';
  //   this.previewLoading = true;
  // }

  onPreviewImageLoad() {
    this.previewLoading = false;
  }

  closePreview() {
    this.previewImage = null;
    this.previewFileName = '';
    this.previewComment = '';
    this.previewLoading = false;
  }

  checkMaxSelectedCountReached() {
    return this.selectedItems.length >= this.allowedSelectedPhotos;
  }

  savePreviewComment() {
    const fileName = this.previewFileName;
    let item = this.selectedItems.find((x) => x.fileName === fileName);

    if (!item) {
      item = {
        fileName,
        comment: '',
        type: this.isPortait ? 'portrait' : 'landscape',
        url: this.previewImage || '',
      };

      if (
        this.selectedItems.length > 0 &&
        this.selectedItems.some((item) => item.type === 'portrait')
      ) {
        alert('Portrait photo selected');
        return;
      }

      if (
        this.selectedItems.length > 0 &&
        this.selectedItems.some((item) => item.type === 'landscape')
      ) {
        alert('Landscape photo selected');
        return;
      }

      this.selectedItems.push(item);
    }
    item.comment = this.previewComment;
    this.closePreview();
  }

  private mergeByFileName(
    base: AlbumSelectionItem[],
    add: AlbumSelectionItem[]
  ) {
    const map = new Map<string, AlbumSelectionItem>();
    base.forEach((i) => map.set(i.fileName, { ...i }));
    add.forEach((i) =>
      map.set(i.fileName, {
        ...(map.get(i.fileName) || ({} as AlbumSelectionItem)),
        ...i,
      })
    );
    return Array.from(map.values());
  }

  saveSelection() {
    this.apiCalltoSave(this.updateModelWithLatestData());
  }

  updateModelWithLatestData() {
    const existingData: clientData = this.clientDataService.getData();

    const propertyToUpdate = this.isPortait
      ? 'portraitFrameSelection'
      : 'landscapeFrameSelection';

    const updated: clientData = {
      ...existingData,
      [propertyToUpdate]: [...this.selectedItems],
      status : 'Inprogress'
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
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.notify.error('Failed to save your selection!');
      },
    });
  }
}
