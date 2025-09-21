import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumSelectionItem } from '../../model/album-selection-item.model';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData } from '../../model/clientData';

@Component({
  selector: 'app-framepicturecomponent',
  imports: [CommonModule, FormsModule],
  templateUrl: './framepicturecomponent.html',
  styleUrl: './framepicturecomponent.css',
})
export class Framepicturecomponent {
  constructor(private clientDataService: ClientDataService) {}
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

    this.isPortait = isPortait;
    this.selectedFolderName = isPortait ? 'Portrait Frame' : 'Landscape Frame';

    if (gallerySection && selectionSection) {
      gallerySection.style.display = 'block';
      selectionSection.style.display = 'none'; // Show selection section
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

  baseUrl = 'https://picsum.photos/seed/';
  imageCount = 60;
  thumbW = 600;
  thumbH = 400;

  ngOnInit(): void {
    const selectedImagesSource = this.selectedImagesSource();

    // Generate sample URLs
    // for (let i = 1; i <= this.imageCount; i++) {

    //   const imgUrl = `${this.baseUrl}${i}/${this.thumbW}/${this.thumbH}`;
    //   if (selectedImagesSource.some(x => x.url === imgUrl)) {
    //     this.images.push(imgUrl);
    //   }

    //   this.images.push(`${this.baseUrl}${i}/${this.thumbW}/${this.thumbH}`);
    // }

    for (let i = 1; i <= this.imageCount; i++) {
      const imgUrl = `${this.baseUrl}${i}/${this.thumbW}/${this.thumbH}`;

      if (
        Array.isArray(selectedImagesSource) &&
        selectedImagesSource.some(
          (x) => typeof x !== 'string' && x.fileName === imgUrl
        )
      ) {
        this.images.push(imgUrl);
      }
    }

    this.loading = false;

    console.log('Initial Client Data in frameselectin source:', this.images);
  }

  selectedImagesSource() {
    const data = this.clientDataService.getData();
    const mergedArray: AlbumSelectionItem[] =
      data.tranditionalAlbumSelection.concat(data.candidAlbumSelection);

    const selectedPictureList: string[] = mergedArray.map(
      (item: AlbumSelectionItem) => item.fileName
    );
    return mergedArray;
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
      if (this.checkMaxSelectedCountReached()) {
        alert(
          `You have already selected required ${this.allowedSelectedPhotos} photos.`
        );
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
    return (
      Array.isArray(this.selectedItems) &&
      this.selectedItems.some((item) => item.type === 'portrait')
    );
  }

  get hasLandscapeType(): boolean {
    return (
      Array.isArray(this.selectedItems) &&
      this.selectedItems.some((item) => item.type === 'landscape')
    );
  }

  openPreview(imgUrl: string) {
    this.previewImage = imgUrl;
    this.previewFileName = this.fileNameFromUrl(imgUrl);
    const existing = this.selectedItems.find(
      (x) => x.fileName === this.previewFileName
    );
    this.previewComment = existing?.comment ?? '';
    this.previewLoading = true;
  }

  openPreviewFrame(inputType: string) {
    const imgUrl = this.selectedItems.find(
      (item) => item.type === inputType
    )?.url;
    if (!imgUrl) {
      alert('No landscape image selected for preview.');
      return;
    }
    this.previewImage = imgUrl;
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

  saveSelection() {
    const data: clientData = this.clientDataService.getData();

    const updated: clientData = {
      ...data,
      frameSelection: this.selectedItems,
    };

    this.clientDataService.updateData(updated);
    console.log('Saved to ClientDataService:', updated);
  }

  saveSelection2() {
    // const data: clientData = this.clientDataService.getData();
    // // const propertyToUpdate = this.isTraditional
    // //   ? 'tranditionalAlbumSelection'
    // //   : 'candidAlbumSelection';
    // const updated: clientData = {
    //   ...data,
    //   [propertyToUpdate]: [...this.selectedItems],
    // };
    // this.clientDataService.updateData(updated);
    // // this.clientDataload = updated;
    // alert('Your Selection/unselection saved successfully!');
    // console.log('Saved to ClientDataService:', updated);
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
}
