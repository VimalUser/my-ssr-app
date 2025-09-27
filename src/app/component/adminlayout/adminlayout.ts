import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router  } from '@angular/router';
import { RouterOutlet,RouterModule } from '@angular/router';
import { NotificationComponent } from '../../notification/notification';

@Component({
  selector: 'app-adminlayout',
  imports: [CommonModule,RouterOutlet,RouterModule ],
  templateUrl: './adminlayout.html',
  styleUrl: './adminlayout.css',
  standalone: true,
})
export class Adminlayout {
  
  constructor(private router: Router) { }

createnew() {
    this.router.navigate(['admindashboard/newclient']);
  }
  homePage() {
    this.router.navigate(['admindashboard']);
  }
  logout() {
    localStorage.removeItem('accessToken');
    this.router.navigate(['adminlogin']);
  }
}
