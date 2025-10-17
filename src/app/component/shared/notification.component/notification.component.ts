import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notificationservice, Notification, Confirmation } from '../../../services/notificationservice';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  confirmation?: Confirmation;

  constructor(private notificationservice: Notificationservice) {}

  ngOnInit() {
    console.log('✅ NotificationComponent initialized');

    this.notificationservice.notifications$.subscribe((notification) => {
      console.log('🔔 notification received', notification);
      this.notifications.push(notification);

      // remove after 3s (keeps UI simple)
      setTimeout(() => {
        this.notifications.shift();
      }, 3000);
    });

    this.notificationservice.confirmations$.subscribe((confirmation) => {
      console.log('⚡ Confirmation received:', confirmation);
      this.confirmation = confirmation;
    });
  }

  // you already had respond; keep same name so template matches
  respond(confirmed: boolean) {
    this.confirmation?.resolve(confirmed);
    this.confirmation = undefined;
  }
}
