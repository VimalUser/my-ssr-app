import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientDataService } from '../../shared/ClientDataService';
import { CommonModule } from '@angular/common';
import { clientData } from '../../model/clientData';

@Component({
  selector: 'app-useralbumsubmitform',
  imports: [RouterLink,CommonModule],
  templateUrl: './useralbumsubmitform.html',
  styleUrl: './useralbumsubmitform.css'
})
export class Useralbumsubmitform implements OnInit {
  constructor(private clientDataService: ClientDataService) {}

  clientData: clientData = new clientData();


 ngOnInit(): void {
    const data = this.clientDataService.getData();  
    this.clientData = data;
    console.log('Initial Client Data in Useralbumsubmitform:', data);
 }

 submissionForm() {


   const data: clientData = this.clientDataService.getData();

    const updated: clientData = {
      ...data,
      status: 'Submitted',
    };

    this.clientDataService.updateData(updated);
    console.log('submit form ClientDataService:', updated);

    const submitFormSection = document.getElementById('submitFormSection');
    const submissionConfirmation = document.getElementById('submissionConfirmation'); 
    if (submitFormSection && submissionConfirmation) {
      submitFormSection.style.display = 'none';
      submissionConfirmation.style.display = 'block'; // Show selection section
    }
  }

  prevStep() {
    this.clientDataService.triggerPrevStep();
  }
  
}
