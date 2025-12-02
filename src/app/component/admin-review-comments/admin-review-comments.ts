import { Component, OnInit } from '@angular/core';
import { AdminDataService } from '../../shared/admin-data-service';
import { AdminData } from '../../model/AdminData';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkAsDoneDirective } from '../../shared/mark-as-done';

@Component({
  selector: 'app-admin-review-comments',
  imports: [CommonModule,FormsModule, MarkAsDoneDirective],
  templateUrl: './admin-review-comments.html',
  styleUrl: './admin-review-comments.css'
})
export class AdminReviewComments implements OnInit {
  isLoading: boolean = false;
  checkboxMessage: string = '';
  isReviewCommentsDone: boolean = false;


  constructor(
    private adminDataService :AdminDataService
  ){}
  pageLatestAdminData: AdminData = {} as AdminData;

  ngOnInit(): void {

     this.adminDataService.data$.subscribe(data => {
      if (data) {        
        this.pageLatestAdminData = data;       
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
   onLoadingChange(loading: boolean) {
    this.isLoading = loading;
  }
    onMessageChange(msg: string) {
  this.checkboxMessage = msg;
}
}
