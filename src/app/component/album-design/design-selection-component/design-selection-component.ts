import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientDataService } from '../../../shared/ClientDataService';
import { Notificationservice } from '../../../services/notificationservice';
import { userserviceapi } from '../../../services/userservice';
import { clientData, ClientMenuItems } from '../../../model/clientData';
import { Router } from '@angular/router';

type DesignOption = {
  id: number;
  key: string; // 'Regular' | 'Elite' | 'Premium'
  displayName: string;
  pdfPath: string;
};

interface FileItem {
  path: string;
  fileName: string;
}

@Component({
  selector: 'app-design-selection-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './design-selection-component.html',
  styleUrl: './design-selection-component.css',
})
export class DesignSelectionComponent implements OnInit {
  formData: clientData = new clientData();
  isLoading = false;
  formSubmitted = false;

  constructor(
    private clientDataService: ClientDataService,
    private notify: Notificationservice,
    private userservice: userserviceapi,
    private router: Router
  ) {}

  pdfFileList: { [key: string]: string } = {
    Regular: 'design_regular_sample.pdf',
    Elite: 'design_elite_sample.pdf',
    Premium: 'design_premium_sample.pdf',
  };

  sampleFilesList: string[] = ['Elite.pdf', 'Premium.pdf', 'Regular.pdf'];

  get designList(): Array<any> {
    // defensive: ensure it's always an array
    const list = this.formData.designTypeList;
    return Array.isArray(list) ? list : [];
  }

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(ClientMenuItems.designPage); // step index, adjust as needed
    this.isLoading = true;

    const existing = this.clientDataService.getData();
    this.formData = existing;

    if (!Array.isArray(this.formData.events)) {
      this.formData.events = [];
    }

    this.formData.designTypeList = this.formData.designTypeList.filter(
      (dt) => dt && dt.designTypeId && dt.designTypeName
    );

    // ensure selectedDesignId exists
    if (!(this.formData as any).selectedDesignId) {
      (this.formData as any).selectedDesignId = '';
    }

    this.isLoading = false;
  }

  // helper: open sample pdf (assets/design/<file>)
  openSamplePdf(rowIndex: Number) {
    // default fallback name if design items don't contain a filename
    let filename = this.sampleFilesList[rowIndex as number];
    filename = filename ? filename : 'sample.pdf';
    const path = `assets/design/${filename}`;
    // open in new tab
    window.open(path, '_blank');
  }

  // validate at least one design chosen
  isValidForm(): boolean {
    return this.formData.designTypeId && this.formData.designTypeId > 0
      ? true
      : false;
  }

  updateModelWithLatestData(): clientData {
    const existingData: clientData =
      this.clientDataService.getData() || new clientData();
    const updated: clientData = {
      ...existingData,
      designTypeId: this.formData.designTypeId,
    } as clientData;

    this.clientDataService.updateData(updated);
    this.formData = updated;
    return updated;
  }

  async goBack() {
    const confirmCancelled = await this.notify.confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      return;
    }
    this.clientDataService.triggerNextStep(ClientMenuItems.startPage);
    this.router.navigate(['userhome/startpage']);
  }

  nextStep() {
    this.formSubmitted = true;
    if (!this.isValidForm()) {
      this.notify.error('Please select an album design to proceed.');
      return;
    }
    this.updateModelWithLatestData();
    this.clientDataService.triggerNextStep(ClientMenuItems.albumName); // go to next step index
  }

  onSave() {
    this.formSubmitted = true;
    if (!this.isValidForm()) {
      this.notify.error('Please select an album design before saving.');
      return;
    }
    this.apiCalltoSave(this.updateModelWithLatestData());
  }

  apiCalltoSave(updateData: clientData) {
    this.isLoading = true;

    if (!updateData.albumEventDate) {
      updateData.albumEventDate = null;
    }
    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.notify.success('Album design saved successfully!');
      },
      error: (ex) => {
        this.isLoading = false;
        this.notify.error('Failed to save album design.');
      },
    });
  }
}
