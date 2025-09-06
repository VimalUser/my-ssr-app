import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminStateService {
  private _username: string = '';
  private _clientId: number | null = null;

  set clientId(id: number | null) {
    this._clientId = id;
  }
  set username(name: string) {
    this._username = name;
  }

  get username(): string {
    return this._username;
  }

  get clientId(): number | null {
    return this._clientId;
  }
}
