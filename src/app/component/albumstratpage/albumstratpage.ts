import { Component, inject } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';
import { CommonModule } from '@angular/common';
import { clientData } from '../../model/clientData';

@Component({
  selector: 'app-albumstratpage',
  imports: [CommonModule],
  templateUrl: './albumstratpage.html',
  styleUrl: './albumstratpage.css',
  providers: []
})

export class Albumstratpage {

  currentData: clientData;

  constructor(private clientDataService: ClientDataService) {
    // Get current data snapshot
    this.currentData = this.clientDataService.getData();

    // Log current data to console
    console.log('Current Client Data:', this.currentData);

    // Update properties
    this.currentData.coupleName = 'John and Jane';
    this.currentData.albumDate = '2024-12-31';

    // Push updated data back to service
    // this.clientDataService.updateData(this.currentData);

    this.clientDataService.patchData({
      coupleName: 'John and Jane',
      albulDate: '2024-12-31', // corrected property name from albumDate to albulDate if matching service
    });
  }


  nextStep() {
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep();
  }
  
}
