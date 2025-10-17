import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
}

export interface Confirmation {
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (confirmed: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class Notificationservice {
  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();

  private confirmationSubject = new Subject<Confirmation>();
  confirmations$ = this.confirmationSubject.asObservable();

  show(message: string, type: NotificationType = 'info') {
    this.notificationSubject.next({ message, type });
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  warning(message: string) { this.show(message, 'warning'); }
  info(message: string) { this.show(message, 'info'); }

  confirm(message: string, confirmText = 'Yes', cancelText = 'No'): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirmationSubject.next({ message, confirmText, cancelText, resolve });
    });
  }
}
