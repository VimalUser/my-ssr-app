import { Component, OnDestroy, OnInit } from '@angular/core';
import { Notificationservice, Notification } from '../services/notificationservice';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class NotificationComponent implements OnDestroy {
  notification: Notification | null = null;
  private sub!: Subscription;

  constructor(private service: Notificationservice) {
    // unsubscribe first if already exists
    this.sub = this.service.notifications$.subscribe(note => {
      this.notification = note; // replace previous notification
    });
  }

  close() {
    this.notification = null;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
