// shared-data.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { clientData } from '../model/clientData';
import { isPlatformBrowser } from '@angular/common';

export interface LoggedInUser {
  clientId: number | string;
  clientName: string;
}

@Injectable({ providedIn: 'root' })
export class ClientDataService {
  // 🔸 Initial BehaviorSubject (empty by default)
  private dataSubject = new BehaviorSubject<clientData>(new clientData());
  data$ = this.dataSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // ⚠️ No localStorage access here anymore to avoid routing bootstrap errors
  }

  /**
   * ✅ Safe to call after app has loaded (e.g. in AppComponent.ngOnInit)
   * Restores client data from localStorage, if available.
   */
  initializeFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('clientData');
      if (stored) {
        try {
          const parsed: clientData = JSON.parse(stored);
          this.dataSubject.next(parsed);
        } catch (e) {
          console.warn('Failed to parse stored clientData', e);
          this.dataSubject.next(new clientData());
        }
      } else {
        this.dataSubject.next(new clientData());
      }
    }
  }

  // ──────────────── Client Data Operations ────────────────

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

  getData(): clientData {
    return this.dataSubject.value;
  }

  updateData(data: clientData) {
    this.dataSubject.next(data);
    localStorage.setItem('clientData', JSON.stringify(data));
  }

  patchData(patch: Partial<clientData>) {
    const newData = { ...this.dataSubject.value, ...patch };
    this.dataSubject.next(newData);
  }

  // ──────────────── User Login State ────────────────

  private currentUserSubject = new BehaviorSubject<LoggedInUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

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

  restoreUserFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
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
  }

  // ──────────────── Theme State ────────────────

  private lightTheme = new BehaviorSubject<boolean>(true);
  isLightTheme$ = this.lightTheme.asObservable();

  setTheme(isLight: boolean) {
    this.lightTheme.next(isLight);
  }

  getTheme(): boolean {
    return this.lightTheme.value;
  }

  // ──────────────── Step Navigation ────────────────

  private nextStepSubject = new Subject<number>();
  private prevStepSubject = new Subject<number>();

  nextStep$ = this.nextStepSubject.asObservable();
  prevStep$ = this.prevStepSubject.asObservable();

  triggerNextStep(menuItem: number) {
    this.nextStepSubject.next(menuItem);
    console.log('➡️ Next step triggered in client data service');
  }

  triggerPrevStep(menuName: number) {
    this.prevStepSubject.next(menuName);
  }
}
