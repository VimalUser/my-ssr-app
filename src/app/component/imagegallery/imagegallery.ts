import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumSelectionItem } from '../../model/album-selection-item.model';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData } from '../../model/clientData';

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
  clientDataload: clientData = new clientData();

  constructor(private clientDataService: ClientDataService) {}

  ngOnInit(): void {
    // // Generate sample URLs
    // for (let i = 1; i <= this.imageCount; i++) {
    //   this.images.push(`${this.baseUrl}${i}/${this.thumbW}/${this.thumbH}`);
    // }
    this.loading = false;
    const data = this.clientDataService.getData();
    this.clientDataload = data;
    console.log('Initial Client Data in ImageGallery:', data);

    // if (data.tranditionalAlbumSelection.length > 0) {
    //   this.selectedItems = [...data.tranditionalAlbumSelection];
    // }
  }

  generateImages() {
    // Generate sample URLs
    if (this.isTraditional) {
      this.baseUrl = 'https://picsum.photos/seed/';
    } else {
      this.baseUrl = 'https://picsum.photos/seed/';
    }

    for (let i = 1; i <= this.imageCount; i++) {
      this.images.push(`${this.baseUrl}${i}/${this.thumbW}/${this.thumbH}`);
    }
  }

  showGallery(folderName: string) {
    const gallerySection = document.getElementById('gallerySection');
    const selectionSection = document.getElementById('selctionSection');
    this.selectedFolderName = folderName;
    this.images = [];
    this.selectedItems = [];
    const data = this.clientDataService.getData();
    this.clientDataload = data;

    if (gallerySection && selectionSection) {
      gallerySection.style.display = 'block';
      selectionSection.style.display = 'none'; // Hide selection section

      if (folderName === this.folderNames[0]) {
        this.isTraditional = true;
        // this.generateImages();
        this.selectedItems = [...data.tranditionalAlbumSelection];
        console.log('traditional photos', this.selectedItems);
        console.log(
          'data length',
          this.clientDataload.tranditionalAlbumSelection.length
        );
      } else {
        this.isTraditional = false;
        // this.generateImages();
        this.selectedItems = [...data.candidAlbumSelection];
        console.log('candid photos', this.selectedItems);
        console.log(
          'data length',
          this.clientDataload.candidAlbumSelection.length
        );
      }

      this.generateImages();
    }
  }

  gobackFolderSelection() {
  const confirmCancelled = confirm('Are you sure to go back? Unsaved changes will be lost.');
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
// {{clientDataload.tranditionalAlbumSelection.length + clientDataload.candidAlbumSelection.length}} /{{clientDataload.noOfPics}}
    
    // if(this.clientDataload.tranditionalAlbumSelection.length + this.clientDataload.candidAlbumSelection.length < this.clientDataload.noOfPics) {
    //   const alertMessage = `You have selected ${this.clientDataload.tranditionalAlbumSelection.length + this.clientDataload.candidAlbumSelection.length} images. Please select a total of ${this.clientDataload.noOfPics} images to proceed.`;
    //   alert(alertMessage);      
    //   return;
    // }

    // this.patchData();
    // Logic to proceed to the next step
    console.log('Proceeding to the next step...');
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep();
  }

   patchData() {

    // this.clientDataService.patchData({
    //   albumName: this.albumPageData.AlbumName,
    //   albumDate: this.albumPageData.AlbumDate,
    // });
    
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
      this.selectedItems.push({
        fileName,
        comment: '',
        type: 'image',
        url: imgUrl,
        isTraditional: this.isTraditional
      });
    }

    console.log('selected photos', this.selectedItems);
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

  onPreviewImageLoad() {
    this.previewLoading = false;
  }

  closePreview() {
    this.previewImage = null;
    this.previewFileName = '';
    this.previewComment = '';
    this.previewLoading = false;
  }

  savePreviewComment() {
    const fileName = this.previewFileName;
    let item = this.selectedItems.find((x) => x.fileName === fileName);
    if (!item) {
      item = {
        fileName,
        comment: '',
        type: 'image',
        url: this.previewImage || '',
        isTraditional: this.isTraditional
      };
      this.selectedItems.push(item);
    }
    item.comment = this.previewComment;
    this.closePreview();
  }

  saveSelection() {
    const data: clientData = this.clientDataService.getData();
    const propertyToUpdate = this.isTraditional
      ? 'tranditionalAlbumSelection'
      : 'candidAlbumSelection';

    const updated: clientData = {
      ...data,
      [propertyToUpdate]: [...this.selectedItems],
    };

    this.clientDataService.updateData(updated);
    this.clientDataload = updated;
    alert('Your Selection/unselection saved successfully!');
    console.log('Saved to ClientDataService:', updated);
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
