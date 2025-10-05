import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Userlandingpage } from "./component/userlandingpage/userlandingpage";
import { NotificationComponent } from './notification/notification';
import { ClientDataService } from './shared/ClientDataService';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, NotificationComponent]
})
export class App implements OnInit {
  constructor(private clientDataService: ClientDataService) {}

  ngOnInit(): void {
    // ✅ Safe localStorage restoration after browser environment is ready
    this.clientDataService.initializeFromStorage();

    // Optional: restore logged-in user too
    this.clientDataService.restoreUserFromStorage();
  }
}
