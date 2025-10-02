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
    albumEventDate: '',
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
    passCode :'',
    createdBy: '',
    updatedBy:'',
    accessLink:''
  });

  

  // Observable to subscribe to data changes
  data$ = this.dataSubject.asObservable();

  resetClientDataOnly() {
  const current = this.dataSubject.getValue();
  this.dataSubject.next({
    ...current,
    albumName: '',
    albumEventDate: '',
    tranditionalAlbumSelection: [],
    candidAlbumSelection: [],
    portraitFrameSelection: [],
    landscapeFrameSelection: [],
    coverSelection: [],
    noOfPics: 0,
    noOfFrames: 0,
    coverPic: '',
  });
  console.log('🧹 Client data reset only');
}

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
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  }

  getCurrentUser(): LoggedInUser | null {
    return this.currentUserSubject.value;
  }

   clearCurrentUser() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('loggedInUser');
  }

public restoreUserFromStorage() {
  const stored = localStorage.getItem('loggedInUser');
  if (stored) {
    try {
      const user: LoggedInUser = JSON.parse(stored);
      this.currentUserSubject.next(user);
    } catch (e) {
      console.error('Failed to parse stored user', e);
      localStorage.removeItem('loggedInUser');
    }
  }
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
