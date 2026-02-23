import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumSelectionItem } from '../../model/album-selection-item.model';
import { ClientDataService } from '../../shared/ClientDataService';
import { clientData, ClientMenuItems } from '../../model/clientData';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';
import { HostListener } from '@angular/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


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
  batchSize = 100;
  displayedImages: string[] = [];
  isLoadingMore = false;

  // Working selections
  selectedItems: AlbumSelectionItem[] = []; // working album picks for current folder
  portraitFrameItems: AlbumSelectionItem[] = []; // working global
  landscapeFrameItems: AlbumSelectionItem[] = []; // working global
  coverItems: AlbumSelectionItem[] = []; // working global

  loading = true;
  galleryOpen = false;
  previewLoading = false;

  previewImageUrl: string | null = null;
  previewFileName = '';
  previewComment = '';
  progress: number = 0;

  // filter bar
  viewFilter: ViewFilter = 'all';

  // frame popup state uses strict identity
  frameChoiceForIdentity: string | null = null;

  clientDataload: clientData = new clientData();

  constructor(
    private clientDataService: ClientDataService,
    private userService: userserviceapi,
    private notify: Notificationservice
  ) { }

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(ClientMenuItems.imageSelection);
    this.loading = false;

    // load saved data snapshot
    const data = this.clientDataService.getData();
    this.clientDataload = JSON.parse(JSON.stringify(data ?? {})) as clientData;


    // deep-clone and ensure sourceFolder on each saved item
    this.portraitFrameItems = (
      JSON.parse(
        JSON.stringify(data?.portraitFrameSelection ?? [])
      ) as AlbumSelectionItem[]
    ).map((i) => this.ensureSourceFolderOnItem(i));
    this.landscapeFrameItems = (
      JSON.parse(
        JSON.stringify(data?.landscapeFrameSelection ?? [])
      ) as AlbumSelectionItem[]
    ).map((i) => this.ensureSourceFolderOnItem(i));
    this.coverItems = (
      JSON.parse(
        JSON.stringify(data?.coverSelection ?? [])
      ) as AlbumSelectionItem[]
    ).map((i) => this.ensureSourceFolderOnItem(i));
  }

  albumGlow = false;
  frameGlow = false;
  coverGlow = false;

  private triggerGlow(type: 'album' | 'frame' | 'cover') {
    switch (type) {
      case 'album':
        this.albumGlow = false;
        setTimeout(() => (this.albumGlow = true));
        break;

      case 'frame':
        this.frameGlow = false;
        setTimeout(() => (this.frameGlow = true));
        break;

      case 'cover':
        this.coverGlow = false;
        setTimeout(() => (this.coverGlow = true));
        break;
    }

    // remove class after animation finishes
    setTimeout(() => {
      if (type === 'album') this.albumGlow = false;
      if (type === 'frame') this.frameGlow = false;
      if (type === 'cover') this.coverGlow = false;
    }, 1400);
  }

  // ---------- Navigation ----------

  prevStep() {
    this.clientDataService.triggerNextStep(ClientMenuItems.albumName);
  }

  nextStep() {
    const totalAlbumSelected =
      (this.clientDataload.tranditionalAlbumSelection?.length || 0) +
      (this.clientDataload.candidAlbumSelection?.length || 0);

    if (totalAlbumSelected < (this.clientDataload.noOfPics || 0)) {
      const alertMessage = `You have selected ${totalAlbumSelected} images. Please select a total of ${this.clientDataload.noOfPics} images to proceed.`;
      this.notify.error(alertMessage);
      return;
    }
    this.clientDataService.triggerNextStep(ClientMenuItems.framePage);
  }

  // ---------- Folder selection ----------

  async gobackFolderSelection() {
    if (!this.clientDataload.isSubmitted) {
      const confirmed = await this.notify.confirm(
        'Are you sure you want to go back?<br/>Any unsaved changes in this folder will be lost.'
      );
      if (!confirmed) return;
    }
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
    this.frameChoiceForIdentity = null;

    // re-read fresh snapshot from service and deep clone for working edits
    const data = this.clientDataService.getData();
    this.clientDataload = JSON.parse(JSON.stringify(data ?? {})) as clientData;

    if (folderName === this.folderNames[0]) {
      this.isTraditional = true;
      this.selectedItems = (
        JSON.parse(
          JSON.stringify(data?.tranditionalAlbumSelection ?? [])
        ) as AlbumSelectionItem[]
      ).map((i) => this.ensureSourceFolderOnItem(i));
    } else {
      this.isTraditional = false;
      this.selectedItems = (
        JSON.parse(
          JSON.stringify(data?.candidAlbumSelection ?? [])
        ) as AlbumSelectionItem[]
      ).map((i) => this.ensureSourceFolderOnItem(i));
    }

    this.portraitFrameItems = (
      JSON.parse(
        JSON.stringify(data?.portraitFrameSelection ?? [])
      ) as AlbumSelectionItem[]
    ).map((i) => this.ensureSourceFolderOnItem(i));
    this.landscapeFrameItems = (
      JSON.parse(
        JSON.stringify(data?.landscapeFrameSelection ?? [])
      ) as AlbumSelectionItem[]
    ).map((i) => this.ensureSourceFolderOnItem(i));
    this.coverItems = (
      JSON.parse(
        JSON.stringify(data?.coverSelection ?? [])
      ) as AlbumSelectionItem[]
    ).map((i) => this.ensureSourceFolderOnItem(i));

    this.galleryOpen = true;
    this.getImagesbyPath();
  }

  // ---------- Visible images & batching ----------

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

  // ---------- SIMPLE URL helpers (strict -3, -2, -1) ----------
  // expects url like .../<phototype>/<cameratype>/<filename>

  // expects url like .../<phototype>/<cameratype>/<filename>
  private getFileParts(url: string) {
    const clean = (url || '').split('?')[0].split('#')[0];
    const parts = clean.split('/').filter((p) => p !== '');
    const fileName = parts.length ? parts[parts.length - 1] : '';
    const cameraFolder = parts.length >= 2 ? parts[parts.length - 2] : '';
    const photoType = parts.length >= 3 ? parts[parts.length - 3] : '';
    return { fileName, cameraFolder, photoType };
  }

  fileNameFromUrl(url: string): string {
    return this.getFileParts(url).fileName;
  }

  // camera-level segment (used to disambiguate duplicate filenames)
  fileTypeFromUrl(url: string): string {
    return this.getFileParts(url).cameraFolder;
  }

  // parent phototype (persisted sourceFolder)
  private getParentFolderFromUrl(url: string): string {
    return this.getFileParts(url).photoType;
  }

  // popup identity: photoType|camera|filename (unique per physical image)
  getImageIdentity(imgUrl: string | null): string {
    if (!imgUrl) return '';
    const p = this.getFileParts(imgUrl);
    return `${p.photoType}|${p.cameraFolder}|${p.fileName}`;
  }

  // ---------- Ensure every loaded/saved item has sourceFolder set ----------
  // (sourceFolder = phototype = segment -3). This prevents mismatch between badges and counts.

  private ensureSourceFolderOnItem(
    item: AlbumSelectionItem
  ): AlbumSelectionItem {
    if (!item) return item;
    if ((item as any)?.sourceFolder) return item;

    if (item.url) {
      const parts = this.getFileParts(item.url);
      // persist parent phototype as sourceFolder
      // @ts-ignore
      (item as any).sourceFolder =
        parts.photoType || (item.isTraditional ? 'traditional' : 'candid');
    } else {
      // fallback to isTraditional boolean
      // @ts-ignore
      (item as any).sourceFolder = item.isTraditional
        ? 'traditional'
        : 'candid';
    }
    return item;
  }

  // ---------- Matching logic (strict: fileName + cameraFolder) ----------

  private matchesUrlToItem(imgUrl: string, item: AlbumSelectionItem): boolean {
    if (!imgUrl || !item || !item.url) return false;

    const img = this.getFileParts(imgUrl);
    const it = this.getFileParts(item.url);

    // strict matching: phototype (parent) + cameraFolder + filename must all match
    const samePhotoType =
      (img.photoType || '').toString().toLowerCase() ===
      (it.photoType || '').toString().toLowerCase();
    const sameCamera =
      (img.cameraFolder || '').toString().toLowerCase() ===
      (it.cameraFolder || '').toString().toLowerCase();
    const sameFile = (img.fileName || '') === (it.fileName || '');

    return samePhotoType && sameCamera && sameFile;
  }

  private matchesItemToItem(
    a: AlbumSelectionItem,
    b: AlbumSelectionItem
  ): boolean {
    if (!a || !b || !a.url || !b.url) return false;
    const pa = this.getFileParts(a.url);
    const pb = this.getFileParts(b.url);
    return pa.fileName === pb.fileName && pa.cameraFolder === pb.cameraFolder;
  }

  // ---------- Folder membership helper (uses persisted sourceFolder) ----------

  private isItemInFolder(
    item: AlbumSelectionItem,
    folderType: string
  ): boolean {
    if (!item) return false;
    const itemSource = (item as any)?.sourceFolder
      ? (item as any).sourceFolder.toString().toLowerCase()
      : this.getParentFolderFromUrl(item.url || '')
        .toString()
        .toLowerCase();
    return (itemSource || '').toString().toLowerCase() === folderType;
  }

  // ---------- Summary (per current folder) ----------

  private getAlbumCountInCurrentFolder(): number {
    // selectedItems is always for the current folder (working copy)
    return this.selectedItems.length;
  }

  private getFrameCountInCurrentFolder(): number {
    const currentFolderType = this.getCurrentFolderType();
    const allFrames = [
      ...(this.portraitFrameItems || []),
      ...(this.landscapeFrameItems || []),
    ];

    return allFrames.filter((item) => {
      if (!item || !item.url) return false;
      const p = this.getFileParts(item.url);
      return (p.photoType || '').toString().toLowerCase() === currentFolderType;
    }).length;
  }

  private getCoverCountInCurrentFolder(): number {
    const currentFolderType = this.getCurrentFolderType();
    return (this.coverItems || []).filter((x) =>
      this.isItemInFolder(x, currentFolderType)
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
      ? this.clientDataload.candidAlbumSelection?.length || 0
      : this.clientDataload.tranditionalAlbumSelection?.length || 0;
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
    return this.selectedItems.some((item) =>
      this.matchesUrlToItem(imgUrl, item)
    );
  }

  isAnyFrameSelected(imgUrl: string): boolean {
    return (
      this.isPortraitFrameSelected(imgUrl) ||
      this.isLandscapeFrameSelected(imgUrl)
    );
  }

  isPortraitFrameSelected(imgUrl: string): boolean {
    return this.portraitFrameItems.some((item) =>
      this.matchesUrlToItem(imgUrl, item)
    );
  }

  isLandscapeFrameSelected(imgUrl: string): boolean {
    return this.landscapeFrameItems.some((item) =>
      this.matchesUrlToItem(imgUrl, item)
    );
  }

  isCoverSelected(imgUrl: string): boolean {
    return this.coverItems.some((item) => this.matchesUrlToItem(imgUrl, item));
  }

  private getCurrentFolderType(): string {
    return this.isTraditional ? 'traditional' : 'candid';
  }

  // ---------- Album selection ----------

  isMaximumAlbumSelected(): boolean {
    const current = this.selectedItems.length;
    const otherFolderSaved = this.isTraditional
      ? this.clientDataload.candidAlbumSelection?.length || 0
      : this.clientDataload.tranditionalAlbumSelection?.length || 0;
    const total = current + otherFolderSaved;
    return total >= (this.clientDataload.noOfPics || 0);
  }

  toggleAlbumSelection(imgUrl: string, event?: Event) {
    this.triggerGlow('album');

    if (event) event.stopPropagation();

    const idx = this.selectedItems.findIndex((x) =>
      this.matchesUrlToItem(imgUrl, x)
    );

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

    if (this.viewFilter !== 'all') this.resetInfiniteScroll();

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
    const id = this.getImageIdentity(imgUrl);
    this.frameChoiceForIdentity =
      this.frameChoiceForIdentity === id ? null : id;
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
    this.triggerGlow('frame');

    const target =
      orientation === 'portrait'
        ? this.portraitFrameItems
        : this.landscapeFrameItems;
    const other =
      orientation === 'portrait'
        ? this.landscapeFrameItems
        : this.portraitFrameItems;

    const targetIndex = target.findIndex((x) =>
      this.matchesUrlToItem(imgUrl, x)
    );
    const otherIndex = other.findIndex((x) => this.matchesUrlToItem(imgUrl, x));

    if (targetIndex >= 0) {
      target.splice(targetIndex, 1);
    } else {
      if (otherIndex >= 0) {
        const moved = other.splice(otherIndex, 1)[0];
        // @ts-ignore
        moved.type = orientation;
        target.push(moved);
      } else {
        if (this.totalFrameSelected >= (this.clientDataload.noOfFrames || 0)) {
          this.notify.error(
            'You have already selected the maximum number of frame pictures.'
          );
          this.frameChoiceForIdentity = null;
          return;
        }
        const item = this.buildSelectionItem(imgUrl, orientation);
        // @ts-ignore
        item.type = orientation;
        target.push(item);
      }
    }

    this.frameChoiceForIdentity = null;

    if (this.viewFilter === 'frame') this.resetInfiniteScroll();
  }

  // ---------- Cover selection ----------

  toggleCoverSelection(imgUrl: string, event?: Event) {
    this.triggerGlow('cover');

    if (event) event.stopPropagation();

    const idx = this.coverItems.findIndex((x) =>
      this.matchesUrlToItem(imgUrl, x)
    );
    if (idx >= 0) {
      this.coverItems.splice(idx, 1);
    } else {
      if (
        (this.coverItems?.length || 0) >=
        (this.clientDataload.noOfAlbumCover || 0)
      ) {
        this.notify.error(
          'You have already selected the maximum number of cover pictures.'
        );
        return;
      }
      this.coverItems.push(this.buildSelectionItem(imgUrl, 'cover'));
    }

    if (this.viewFilter === 'cover') this.resetInfiniteScroll();
  }

  // ---------- Build selection item (persist parent folder, include camera in url) ----------

  private buildSelectionItem(imgUrl: string, type: string): AlbumSelectionItem {
    const parts = this.getFileParts(imgUrl);
    const item: AlbumSelectionItem = {
      fileName: parts.fileName,
      comment: '',
      type,
      url: imgUrl,
      isTraditional: parts.photoType === 'traditional',
      // persist parent folder for counts/save
      // @ts-ignore
      sourceFolder: parts.photoType,
      // store cameraFolder for in-memory clarity (optional)
      // @ts-ignore
      cameraFolder: parts.cameraFolder,
    };
    return item;
  }

  // ---------- Preview ----------

  openPreview(imgUrl: string) {
    // Push modal state to browser history
    history.pushState({ previewOpen: true }, '');

    this.previewImageUrl = imgUrl;
    this.previewFileName = this.fileNameFromUrl(imgUrl);
    const existing = this.selectedItems.find((x) =>
      this.matchesUrlToItem(imgUrl, x)
    );
    this.previewComment = existing?.comment ?? '';
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
    this.previewComment = '';
    this.previewLoading = false;
    this.frameChoiceForIdentity = null;

    // Remove the dummy history state
    if (history.state?.previewOpen) {
      history.back();
    }
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
    this.userService.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        this.loading = false;
        this.notify.success('Your selections saved successfully!');
        this.galleryOpen = false;
        this.selectedFolderName = '';
      },
      error: (error) => {
        this.loading = false;
        this.notify.error('Failed to save your selection!');
      },
    });
  }

  // ---------- Helpers for folder selection screen counts (always read fresh from service) ----------

  get traditionalSavedCount(): number {
    return (this.clientDataService.getData().tranditionalAlbumSelection ?? [])
      .length;
  }

  get candidSavedCount(): number {
    return (this.clientDataService.getData().candidAlbumSelection ?? []).length;
  }
  // async downloadAll() {
  //   this.loading = true;
  //   this.progress = 0;

  //   try {
  //     const files = await this.userService
  //       .downloadpictures(this.clientDataload.clientId)
  //       .toPromise();

  //     if (!files || files.length === 0) {
  //       this.notify.error('No files available for download');
  //       return;
  //     }

  //     const zip = new JSZip();
  //     const failedFiles: string[] = [];

  //     const MAX_PARALLEL = 5;
  //     let completed = 0;

  //     for (let i = 0; i < files.length; i += MAX_PARALLEL) {
  //       const batch = files.slice(i, i + MAX_PARALLEL);

  //       await Promise.all(
  //         batch.map(async (file) => {
  //           try {
  //             const response = await fetch(file.sasUrl);

  //             if (!response.ok) {
  //               console.error('Failed:', file.sasUrl, response.status);
  //               throw new Error(`HTTP ${response.status}`);
  //             }

  //             const blob = await response.blob();
  //             zip.file(file.zipPath, blob, { compression: 'STORE' });
  //           }
  //           catch (err) {
  //             failedFiles.push(file.zipPath);
  //           }

  //           finally {
  //             completed++;
  //             this.progress = Math.round((completed / files.length) * 100);
  //           }
  //         })
  //       );
  //     }

  //     // 🔹 Add failure report inside ZIP
  //     if (failedFiles.length > 0) {
  //       zip.file(
  //         '_failed_files.txt',
  //         failedFiles.join('\n')
  //       );
  //     }

  //     const zipBlob = await zip.generateAsync({ type: 'blob' });

  //     saveAs(zipBlob, this.buildZipFileName());

  //     // 🔹 User notification
  //     if (failedFiles.length > 0) {
  //       this.notify.warning(
  //         `Download completed with ${failedFiles.length} missing files`
  //       );
  //     } else {
  //       this.notify.success('Download completed successfully');
  //     }
  //   }
  //   catch (err) {
  //     this.handleApiError(err);
  //   }
  //   finally {
  //     this.loading = false;
  //   }
  // }


  // private buildZipFileName(): string {
  //   const now = new Date();

  //   const pad = (n: number) => n.toString().padStart(2, '0');

  //   const timestamp =
  //     `${now.getFullYear()}` +
  //     `${pad(now.getMonth() + 1)}` +
  //     `${pad(now.getDate())}_` +
  //     `${pad(now.getHours())}` +
  //     `${pad(now.getMinutes())}` +
  //     `${pad(now.getSeconds())}`;

  //   // Optional: sanitize client name
  //   const clientName = (this.clientDataload.clientName || 'client')
  //     .replace(/[^a-zA-Z0-9_-]/g, '_');

  //   return `client_${clientName}_photos_${timestamp}.zip`;
  // }
  private handleApiError(err: any) {

    if (err.status === 404) {
      this.notify.error(err.error?.message ?? 'Client not found');
    }
    else if (err.status === 400) {
      this.notify.error(err.error?.message ?? 'Client has not submitted images');
    }
    else {
      console.error('API error:', err);
      this.notify.error('Something went wrong. Please try again.');
    }
  }


  async downloadZip() {
    this.loading = true;

    try {
      const response = await this.userService
        .downloadZip(this.clientDataload.clientId)
        .toPromise();
      if (!response?.sasUrl) {
        this.notify.error('Something went wrong. Please try again.');
        return;
      }

      window.location.href = response.sasUrl;
    }
    catch (err) {
      this.handleApiError(err);
    }
    finally {
      this.loading = false;
    }
  }


}
