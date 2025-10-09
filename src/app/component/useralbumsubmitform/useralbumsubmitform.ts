import { Component, OnInit } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { clientData } from '../../model/clientData';
import { Router } from '@angular/router';
import { userserviceapi } from '../../services/userservice';
import { Notificationservice } from '../../services/notificationservice';



@Component({
  selector: 'app-useralbumsubmitform',
  imports: [RouterLink,CommonModule],
  templateUrl: './useralbumsubmitform.html',
  styleUrl: './useralbumsubmitform.css'
})
export class Useralbumsubmitform implements OnInit {

  constructor(private clientDataService: ClientDataService,
    private router: Router,
    private userservice: userserviceapi,
    private notify: Notificationservice
    
  ) {}

  clientData: clientData = new clientData();
  loading:boolean =false;


 ngOnInit(): void {
    this.clientDataService.triggerNextStep(5);

  this.loading =true;
    const data = this.clientDataService.getData();  
    this.clientData = data;
     this.loading =false;
    console.log('Initial Client Data in Useralbumsubmitform:', data);
 }

 submissionForm() {
   this.loading =false;
   const data: clientData = this.clientDataService.getData();
    const updated: clientData = {
      ...data,
      status: 'Completed',
    };

    this.clientDataService.updateData(updated);
    this.apiCalltoSave(updated);
    
    console.log('submit form ClientDataService:', updated);

   
  }

  apiCalltoSave(updateData: clientData) {
    console.log('Payload sent to API:', JSON.stringify(updateData, null, 2));

    this.userservice.saveUserAlbumDetails(updateData).subscribe({
      next: (response) => {
        console.log('Save Response:', response);
        this.notify.success('Your data saved successfully!');
        this.displaySubmittedSection();
        this.loading =false;
      },
      error: (error) => {
        console.log('Save Error:', error);
        this.notify.error('Failed to save your data!');
        this.loading =false;
      },
    });
  }

  displaySubmittedSection(){

    const submitFormSection = document.getElementById('submitFormSection');
    const submissionConfirmation = document.getElementById('submissionConfirmation'); 
    
    if (submitFormSection && submissionConfirmation) {
      submitFormSection.style.display = 'none';
      submissionConfirmation.style.display = 'block'; // Show selection section
    }

  }

  prevStep() {
    this.clientDataService.triggerNextStep(4);
  }

  nextStep() {
    this.clientDataService.triggerNextStep(4);
  }
  
  //  redirectToHome() {
  //   console.log("current user in submit form",  this.clientDataService.getCurrentUser());
  //   this.router.navigate(['/userhome/startpage']);
  // }
}
