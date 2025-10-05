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

  showGallery(isPortait: boolean) {
    const gallerySection = document.getElementById('gallerySection');
    const selectionSection = document.getElementById('selctionSection');
    this.selectedItems = [];
   this.galleryOpen =true;

    this.selectedItems = [...this.pagelatestData.coverSelection];
  }

  gobackFolderSelection() {
    const confirmCancelled = confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      // User pressed Cancel, stop execution here
      return;
    }
    this.galleryOpen =false;    
  }

  prevStep() {
    this.clientDataService.triggerNextStep(3);
  }

  nextStep() {
    if (this.pagelatestData.coverSelection.length < 1) {
      this.notify.error('Please select 1 picture for album cover!');
      return;
    }
    this.clientDataService.triggerNextStep(5);
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

  pagelatestData: clientData = new clientData();

  ngOnInit(): void {
      this.clientDataService.triggerNextStep(4);

    this.loading = true;
    const data = this.clientDataService.getData();
    this.pagelatestData = data;
    const selectedImagesSource = this.selectedImagesSource();
    this.images = this.selectedImagesSource();
    this.loading = false;

    console.log('Initial Client Data in cover source:', this.images);
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
    return url.split('?')[0].split('/').pop() || '';
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
        fileName:fileName,
        comment: '',
        type: 'cover',
        url: imgUrl,
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
        fileName:this.fileNameFromUrl(fileName),
        comment: '',
        type: 'cover',
        url: this.previewImage || '',
      };

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

    const updated: clientData = {
      ...existingData,
      coverSelection: [...this.selectedItems],
      status : 'Inprogress'
    };

    this.clientDataService.updateData(updated);
    this.pagelatestData = updated;
    return updated;
    console.log('Saved to ClientDataService: cover', updated);
  }

  apiCalltoSave(updateData: clientData) {
    this.loading =true;
    console.log('Payload sent to API:', JSON.stringify(updateData, null, 2));

    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
         this.loading =false;
        this.notify.success('Your Selection/unselection saved successfully!');
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.loading =false;
        this.notify.error('Failed to save your selection!');
      },
    });
  }
}
