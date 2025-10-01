// shared-data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { clientData } from '../model/clientData';

export interface LoggedInUser {
  clientId: number | string;
  clientName: string;
}


@Injectable({ providedIn: 'root' })
export class ClientDataService {
  // Initial JSON data object
  private dataSubject = new BehaviorSubject<clientData>({
    clientId: 0,
    clientName: '',
    status: 'new',
    albumName: '',
    albumDate: '',
    tranditionalAlbumSelection: [],
    candidAlbumSelection: [],
    portraitFrameSelection: [],
    landscapeFrameSelection:[],
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
    return this.dataSubject.value;
  }

  // Update the entire data object
  updateData(data: any) {
    this.dataSubject.next(data);
  }

  // Partial update for key-value pairs/properties
  patchData1(patch: Partial<any>) {
    const newData = { ...this.dataSubject.value, ...patch };
    this.dataSubject.next(newData);
  }

  patchData(patch: Partial<any>) {
    const newData = { ...this.dataSubject.value, ...patch };
    this.dataSubject.next(newData);
  }


  // Holds currently logged-in user
  private currentUserSubject = new BehaviorSubject<LoggedInUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Call this after successful login
  setCurrentUser(user: LoggedInUser) {
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): LoggedInUser | null {
    return this.currentUserSubject.value;
  }

  private lightTheme = new BehaviorSubject<boolean>(true);
  isLightTheme$ = this.lightTheme.asObservable();

  setTheme(isLight: boolean) {
    this.lightTheme.next(isLight);
  }
  getTheme(): boolean {
    return this.lightTheme.value;
  }

  private nextStepSubject = new Subject<void>();
  private prevStepSubject = new Subject<void>();

  nextStep$ = this.nextStepSubject.asObservable();
  prevStep$ = this.prevStepSubject.asObservable();

  triggerNextStep() {
    this.nextStepSubject.next();
  }

  triggerPrevStep() {
    this.prevStepSubject.next();
  }
}
