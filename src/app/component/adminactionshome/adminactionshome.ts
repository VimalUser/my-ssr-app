import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoggingService } from '../../shared/logging.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminDataService } from '../../shared/admin-data-service';
import { AdminData } from '../../model/AdminData';
import { userserviceapi } from '../../services/userservice';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-adminactionshome',
  imports: [RouterModule, CommonModule],
  templateUrl: './adminactionshome.html',
  styleUrl: './adminactionshome.css'
})
export class Adminactionshome implements OnInit {
  public loading: boolean = false;
  clientId: string = "";
  username: string = "";
  accessLink: string = "";
  passcode: string = "";
  clientPhone: string = "";

  constructor(private loggingService: LoggingService, private route: ActivatedRoute,
    private adminDataService: AdminDataService, private userService: userserviceapi
  ) {
    // You can initialize any required services or data here

  }

 

  ngOnInit(): void {

    this.route.paramMap.subscribe((params) => {
      this.clientId = params.get('id') ?? '';
    });
    // Initialization logic can go here
    this.loggingService.username$.subscribe(name => {
      this.username = name;
    });
    this.fetchData();
  }

  updateAdminData(adminDatafromDb: AdminData) {
    // const data: clientData = this.clientDataService.getData();

    const updated: AdminData = {
      clientId: Number(adminDatafromDb.clientId),
      clientName: adminDatafromDb.clientName || '',
      status: adminDatafromDb.status || '',
      albumName: adminDatafromDb.albumName || '',
      albumDate: adminDatafromDb.albumDate || '',
      noOfPics: Number(adminDatafromDb.noOfPics) || 0,
      noOfFrames: Number(adminDatafromDb.noOfFrames) || 0,
      coverPic: '',
      mobileNumber: adminDatafromDb.mobileNumber || '',
      eventTypeId: adminDatafromDb.eventTypeId || 0,
      albumSizeId: adminDatafromDb.albumSizeId || 0,
      frameSizeId: adminDatafromDb.frameSizeId || 0,
      eventType: adminDatafromDb.eventType || '',
      albumSize: adminDatafromDb.albumSize || '',
      frameSize: adminDatafromDb.frameSize || '',
      tranditionalAlbumSelection: adminDatafromDb.tranditionalAlbumSelection || [],
      candidAlbumSelection: adminDatafromDb.candidAlbumSelection || [],
      portraitFrameSelection: adminDatafromDb.portraitFrameSelection || [],
      landscapeFrameSelection: adminDatafromDb.landscapeFrameSelection || [],
      coverSelection: adminDatafromDb.coverSelection || []
    };

    this.adminDataService.updateData(updated);
    console.log('Admin actions from adminDataService:', updated);
  }

  fetchData(): void {
    this.loading = true;
    console.log('Fetching data from API...');
    this.userService.getClientAlbumSelectionDetails(this.clientId).subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.accessLink = data.accessLink || '';
        this.passcode = data.passCode || '';
        this.clientPhone = data.mobileNumber || '';
        this.updateAdminData(data);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        // This is executed if the request fails (e.g., 404, 500)
        console.error('There was an error!', error);
      },
      complete: () => { },
    });
  }

  sendWhatsAppMessage() {
    const message = `Hello! 
                      \n Warm welcome from CandyExpress Photography.
                      \n You can start your photos selection process using below access link and passcode.
                      \n Your access link: ${this.accessLink}
                      \n Passcode: ${this.passcode}
                      \n In case of any issues, feel free to reach out to us.`;
    const url = `https://wa.me/${this.clientPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }
}
