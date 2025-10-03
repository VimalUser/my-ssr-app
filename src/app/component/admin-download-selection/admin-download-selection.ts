import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { newclientapi } from '../../services/newclient';
import { AdminDataService } from '../../shared/admin-data-service';
import { AdminData } from '../../model/AdminData';
import { Notificationservice } from '../../services/notificationservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-download-selection',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-download-selection.html',
  styleUrl: './admin-download-selection.css'
})
export class AdminDownloadSelection {
  traditionalCount: any;
  candidCount: any;
  portraitFrameCount: any;
  landscapeFrameCount: any;
  coverCount: any;
  clientName: any;
  noOfPics: any;
  loading: boolean = false;

  constructor(
    private apiAdminService: newclientapi,
    private adminDataService: AdminDataService,
    private notify: Notificationservice
  ) { }

  adminData: AdminData = {} as AdminData;
  approvalComment: string = "";
  isLoading: boolean = false;

  ngOnInit(): void {

    this.adminDataService.data$.subscribe(data => {
      if (data) {
        this.adminData = data;
        this.clientName = this.adminData.clientName;
        this.traditionalCount = this.adminData.tranditionalAlbumSelection.length;
        this.candidCount = this.adminData.candidAlbumSelection.length;
        this.portraitFrameCount = this.adminData.portraitFrameSelection.length;
        this.landscapeFrameCount = this.adminData.landscapeFrameSelection.length;
        this.coverCount = this.adminData.coverSelection.length;
        this.noOfPics = this.adminData.noOfPics;
        console.log("Traditional count:", this.traditionalCount);
    }
    });
}

download() {
  {
    this.loading
    console.log('Fetching data from API...');
    this.apiAdminService.downloadpictures1(this.adminData.clientId).subscribe({
      next: (data) => {
        console.log('Data received from API:', data);
        this.notify.success(data.message);
        this.loading = false;
        alert("download ocmpelted");
      },
      error: (error) => {
        console.error('Error fetching data from API:', error);
        this.loading = false;
        this.notify.error(error.error.message || 'An error occurred while fetching data.');
      },
      complete: () => {
        this.loading = false;
        // Optional: Executed when the Observable completes
        console.log('Data fetching complete.');
      },
    });
  }
}
}
