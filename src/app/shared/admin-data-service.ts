import { Injectable } from '@angular/core';
import { AdminData } from '../model/AdminData';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private dataSubject = new BehaviorSubject<AdminData>({
    clientId: 0,
    clientName: '',
    status: '',
    albumName: '',
    albumDate: '',
    tranditionalAlbumSelection: [],
    candidAlbumSelection: [],
    portraitFrameSelection: [],
    landscapeFrameSelection: [],
    coverSelection: [],
    noOfPics: 0,
    noOfFrames: 0,
    coverPic: '',
    mobileNumber: '',
    eventTypeId: 0,
    albumSizeId: 0,
    frameSizeId: 0,
    eventType: '',
    albumSize: '',
    frameSize: '',
  });

  // Observable to subscribe to data changes
  data$ = this.dataSubject.asObservable();
  
  // Getter for current value
  getData(): any {
    return this.dataSubject.getValue();
  }
  // Update the entire data object
  updateData(data: any) {
    this.dataSubject.next(data);
  }

  patchData(patch: Partial<any>) {
    const newData = { ...this.dataSubject.value, ...patch };
    this.dataSubject.next(newData);
  }

  // Admin user name

  // Initialize with a default name (e.g., 'Dashboard')
  private adminNameSource = new BehaviorSubject<string>('Admin');
  
  // Public observable stream for components to subscribe to
  adminName$ = this.adminNameSource.asObservable();

  /**
   * Method for child components to call to update the name.
   */
  setUserName(name: string): void {
    this.adminNameSource.next(name);
  }
}
