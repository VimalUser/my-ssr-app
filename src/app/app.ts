import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Userlandingpage } from "./component/userlandingpage/userlandingpage";
import { NotificationComponent } from './notification/notification';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, NotificationComponent]
})
export class App {

}
