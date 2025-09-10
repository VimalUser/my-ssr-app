import { Component } from '@angular/core';
import { ClientDataService } from '../../shared/ClientDataService';

@Component({
  selector: 'app-album-name',
  imports: [],
  templateUrl: './album-name.html',
  styleUrl: './album-name.css',
})
export class AlbumName {
  constructor(private clientDataService: ClientDataService) {}

  goBack() {
    // window.history.back();
    this.clientDataService.triggerPrevStep();
  }

  nextStep() {
    // Logic to proceed to the next step
    console.log('Proceeding to the next step...');
    // Notify other components to move to next step
    this.clientDataService.triggerNextStep();
  }

  onSave() {
    // Logic to save the current state
    console.log('Saving current state...');
  }
}
