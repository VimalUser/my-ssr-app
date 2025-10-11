import { Component, OnInit } from '@angular/core';
import { AdminDataService } from '../../shared/admin-data-service';
import { AdminData } from '../../model/AdminData';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-review-comments',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-review-comments.html',
  styleUrl: './admin-review-comments.css'
})
export class AdminReviewComments implements OnInit {

  constructor(
    private adminDataService :AdminDataService
  ){}
  pageLatestAdminData: AdminData = {} as AdminData;

  ngOnInit(): void {

     this.adminDataService.data$.subscribe(data => {
      if (data) {
        this.pageLatestAdminData = data;
       
        console.log("Traditional count:", this.pageLatestAdminData);
    }
    });
  }
   goBack() {
    window.history.back();
  }

  get PortraitFilename(){
   return this.pageLatestAdminData.portraitFrameSelection[0].fileName || '';
  }
  get PortraitComment(){
   return this.pageLatestAdminData.portraitFrameSelection[0].comment || '';
  }

   get LandscapeFileName(){
   return this.pageLatestAdminData.portraitFrameSelection[0].fileName || '';
  }
  get LandscapeComment(){
   return this.pageLatestAdminData.portraitFrameSelection[0].comment || '';
  }
}
