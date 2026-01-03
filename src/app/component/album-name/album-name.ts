import { Component, OnInit } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';
import { clientData, ClientMenuItems } from '../../model/clientData';
import { Router } from '@angular/router';



@Component({
  selector: 'app-album-name',
  imports: [FormsModule, CommonModule],
  templateUrl: './album-name.html',
  styleUrl: './album-name.css',
  standalone: true,
})
export class AlbumName implements OnInit {
  constructor(
    private clientDataService: ClientDataService,
    private notify: Notificationservice,
    private userservice: userserviceapi,
    private router: Router
  ) {}

  formData: clientData = new clientData();
  isLoading: boolean = false;
  formSubmitted: boolean = false; // tracks whether user attempted save/next (to show validation)

  get isLightTheme() {
    return this.clientDataService.getTheme();
  }

  ngOnInit(): void {
    this.clientDataService.triggerNextStep(ClientMenuItems.albumName);
    this.isLoading = true;

    // Defensive: ensure formData has the arrays we expect
    const existing = this.clientDataService.getData();
    if (existing) {
      this.formData = existing;
    } else {
      this.formData = new clientData();
    }

    if (!Array.isArray(this.formData.events)) {
      this.formData.events = [];
    }
    if (!Array.isArray((this.formData as any).designTypeList)) {
      (this.formData as any).designTypeList = [];
    }

    this.isLoading = false;
  }


  openDatePicker(event: any) {
    try {
      // use showPicker if supported (Chromium)
      event?.target?.showPicker?.();
    } catch (e) {
      // fallback: focus the input
      try {
        event?.target?.focus?.();
      } catch (err) {
        // ignore
      }
    }
  }

  async goBack() {
    if(!this.formData.isSubmitted){
    const confirmCancelled = await this.notify.confirm(
      'Are you sure to go back? Unsaved changes will be lost.'
    );
    if (!confirmCancelled) {
      // User pressed Cancel, stop execution here
      return;
    }
  }
    this.clientDataService.triggerNextStep(ClientMenuItems.designPage);
    // this.router.navigate(['userhome/startpage']);
  }
isValidForm(): boolean {
  const hasAlbumName =
    !!this.formData.albumName && this.formData.albumName.trim() !== '';

  const hasAlbumEventDate =
    !!this.formData.albumEventDate && this.formData.albumEventDate.trim() !== '';

  const hasEvents =
    Array.isArray(this.formData.events) && this.formData.events.length > 0;

  const eventsValid = !hasEvents || this.formData.events.every(ev =>
    !!ev &&
    !!ev.eventDate &&
    String(ev.eventDate).trim() !== ''
  );

  return hasAlbumName && hasAlbumEventDate && eventsValid;
}



  nextStep() {
    this.formSubmitted = true;

    if (!this.isValidForm()) {
      this.notify.error('Please fill in the album name and ALL event dates!');
      return;
    }

    this.updateModelWithLatestData();
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep(ClientMenuItems.imageSelection);
  }

  updateModelWithLatestData(): clientData {
    const existingData: clientData = this.clientDataService.getData() || new clientData();

    // merge with care, preserve any existing arrays and values
    const updated: clientData = {
      ...existingData,
      ...this.formData,
      albumName: this.formData.albumName,
      albumEventDate: this.formData.albumEventDate,
      status: 'Inprogress',
      // ensure events & designTypeList preserved as arrays
      events: Array.isArray(this.formData.events) ? this.formData.events.map(ev => ({ ...ev })) : [],
      designTypeList: Array.isArray((this.formData as any).designTypeList) ? (this.formData as any).designTypeList : []
    } as clientData;

    this.clientDataService.updateData(updated);
    // keep local reference in sync
    this.formData = updated;
    return updated;
  }

  onSave() {
    this.formSubmitted = true;

    if (!this.isValidForm()) {
      this.notify.error('Please fill in the album name and ALL event dates!');
      return;
    }

    this.apiCalltoSave(this.updateModelWithLatestData());
  }

  apiCalltoSave(updateData: clientData) {
    this.isLoading = true;

    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notify.success('Album details saved successfully!');
      },
      error: (error) => {
        this.isLoading = false;
        this.notify.error('Failed to save album details.');
      },
    });
  }
}
