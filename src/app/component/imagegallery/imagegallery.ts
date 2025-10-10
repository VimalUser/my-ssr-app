import { Component, OnInit } from '@angular/core';
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
  pageSize = 12;
  currentPage = 1;

  selectedItems: AlbumSelectionItem[] = [];

  loading = true;
  galleryOpen = false;
  previewLoading = false;

  previewImage: string | null = null;
  previewFileName = '';
  previewComment = '';

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
    console.log('Initial Client Data in ImageGallery:', data);

    // if (data.tranditionalAlbumSelection.length > 0) {
    //   this.selectedItems = [...data.tranditionalAlbumSelection];
    // }
  }
resetPagination() {
    this.currentPage = 1;
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
    this.resetPagination();
    this.galleryOpen = true;
    
    if (folderName === this.folderNames[0]) {
      this.isTraditional = true;
      this.selectedItems = [...data.tranditionalAlbumSelection];
      console.log('traditional photos', this.selectedItems);
    } else {
      this.isTraditional = false;
      this.selectedItems = [...data.candidAlbumSelection];
      console.log('candid photos', this.selectedItems);
    }

    this.getImagesbyPath();
    this.loading = false;
  }

  // Set 1: Example URLs of random images (different categories)
  traditionalImages: string[] = [
    'https://picsum.photos/id/1011/400/300',
    'https://picsum.photos/id/1012/400/300',
    'https://picsum.photos/id/1013/400/300',
    'https://picsum.photos/id/1014/400/300',
    'https://picsum.photos/id/1015/400/300',
    'https://picsum.photos/id/1016/400/300',
    'https://picsum.photos/id/1018/400/300',
    'https://picsum.photos/id/1020/400/300',
    'https://picsum.photos/id/1021/400/300',
    'https://picsum.photos/id/1022/400/300',
    'https://picsum.photos/id/1024/400/300',
    'https://picsum.photos/id/1025/400/300',
    'https://picsum.photos/id/1026/400/300',
    'https://picsum.photos/id/1027/400/300',
    'https://picsum.photos/id/1028/400/300',
    'https://picsum.photos/id/1029/400/300',
    'https://picsum.photos/id/1030/400/300',
    'https://picsum.photos/id/1031/400/300',
    'https://picsum.photos/id/1032/400/300',
    'https://picsum.photos/id/1033/400/300',
    'https://picsum.photos/id/1035/400/300',
    'https://picsum.photos/id/1036/400/300',
    'https://picsum.photos/id/1037/400/300',
    'https://picsum.photos/id/1038/400/300',
    'https://picsum.photos/id/1039/400/300',
    'https://picsum.photos/id/1040/400/300',
    'https://picsum.photos/id/1041/400/300',
    'https://picsum.photos/id/1042/400/300',
    'https://picsum.photos/id/1043/400/300',
    'https://picsum.photos/id/1044/400/300',
    'https://picsum.photos/id/1045/400/300',
    'https://picsum.photos/id/1047/400/300',
    'https://picsum.photos/id/1048/400/300',
    'https://picsum.photos/id/1049/400/300',
    'https://picsum.photos/id/1050/400/300',
    'https://picsum.photos/id/1051/400/300',
    'https://picsum.photos/id/1052/400/300',
    'https://picsum.photos/id/1053/400/300',
    'https://picsum.photos/id/1054/400/300',
    'https://picsum.photos/id/1055/400/300',
    'https://picsum.photos/id/1056/400/300',
    'https://picsum.photos/id/1057/400/300',
    'https://picsum.photos/id/1058/400/300',
    'https://picsum.photos/id/1059/400/300',
    'https://picsum.photos/id/1060/400/300',
    'https://picsum.photos/id/1061/400/300',
    'https://picsum.photos/id/1062/400/300',
    'https://picsum.photos/id/1063/400/300',
    'https://picsum.photos/id/1064/400/300',
  ];
  candidImages: string[] = [
    'https://picsum.photos/id/1/500/300',
    'https://picsum.photos/id/2/500/300',
    'https://picsum.photos/id/3/500/300',
    'https://picsum.photos/id/4/500/300',
    'https://picsum.photos/id/5/500/300',
    'https://picsum.photos/id/6/500/300',
    'https://picsum.photos/id/7/500/300',
    'https://picsum.photos/id/8/500/300',
    'https://picsum.photos/id/9/500/300',
    'https://picsum.photos/id/10/500/300',
    'https://picsum.photos/id/21/500/300',
    'https://picsum.photos/id/22/500/300',
    'https://picsum.photos/id/23/500/300',
    'https://picsum.photos/id/24/500/300',
    'https://picsum.photos/id/25/500/300',
    'https://picsum.photos/id/26/500/300',
    'https://picsum.photos/id/27/500/300',
    'https://picsum.photos/id/28/500/300',
    'https://picsum.photos/id/29/500/300',
    'https://picsum.photos/id/30/500/300',
    'https://picsum.photos/id/31/500/300',
    'https://picsum.photos/id/32/500/300',
    'https://picsum.photos/id/33/500/300',
    'https://picsum.photos/id/34/500/300',
    'https://picsum.photos/id/35/500/300',
    'https://picsum.photos/id/36/500/300',
    'https://picsum.photos/id/37/500/300',
    'https://picsum.photos/id/38/500/300',
    'https://picsum.photos/id/39/500/300',
    'https://picsum.photos/id/40/500/300',
    'https://picsum.photos/id/41/500/300',
    'https://picsum.photos/id/42/500/300',
    'https://picsum.photos/id/43/500/300',
    'https://picsum.photos/id/44/500/300',
    'https://picsum.photos/id/45/500/300',
    'https://picsum.photos/id/46/500/300',
    'https://picsum.photos/id/47/500/300',
    'https://picsum.photos/id/48/500/300',
    'https://picsum.photos/id/49/500/300',
    'https://picsum.photos/id/50/500/300',
    'https://picsum.photos/id/51/500/300',
    'https://picsum.photos/id/52/500/300',
    'https://picsum.photos/id/53/500/300',
    'https://picsum.photos/id/54/500/300',
    'https://picsum.photos/id/55/500/300',
    'https://picsum.photos/id/56/500/300',
    'https://picsum.photos/id/57/500/300',
    'https://picsum.photos/id/58/500/300',
    'https://picsum.photos/id/59/500/300',
    'https://picsum.photos/id/60/500/300',
  ];

  gobackFolderSelection() {
    const confirmCancelled = confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      // User pressed Cancel, stop execution here
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
    // Logic to proceed to the next step
    console.log('Proceeding to the next step...');
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep(3);
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
        fileName: this.fileNameFromUrl(imgUrl),
        comment: '',
        type: 'image',
        url: imgUrl,
        isTraditional: this.isTraditional,
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
        fileName: this.fileNameFromUrl(fileName),
        comment: '',
        type: 'image',
        url: this.previewImage || '',
        isTraditional: this.isTraditional,
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

  getImagesbyPath() {
    console.log('Fetching data from API...');
    let folderPath = this.isTraditional ? 'traditional' : 'candid';
    this.fetchData(this.clientDataload.clientId.toString() ?? '', folderPath);
  }

  fetchData(clientId: string, folderPath: string): void {
    this.loading = true;
    console.log('Fetching data from API...');
    this.userService.getImagesbyType(clientId, folderPath).subscribe({
      next: (data) => {    
        console.log('API Response:', data);
        this.images = data;       
        this.loading = false;
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        console.log('There was an error!', error);
        this.loading = false;
      },
      complete: () => {},
    });
  }

  saveSelection() {
    this.apiCalltoSave(this.updateModelWithLatestData());
  }

  updateModelWithLatestData() {
    const existingData: clientData = this.clientDataService.getData();
    const propertyToUpdate = this.isTraditional
      ? 'tranditionalAlbumSelection'
      : 'candidAlbumSelection';

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
}
