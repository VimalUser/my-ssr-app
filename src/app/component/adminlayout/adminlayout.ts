import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router  } from '@angular/router';
import { RouterOutlet,RouterModule } from '@angular/router';
import { NotificationComponent } from '../../notification/notification';
import { map, Observable } from 'rxjs';
import { AdminDataService } from '../../shared/admin-data-service';
import { AdminData } from '../../model/AdminData';

@Component({
  selector: 'app-adminlayout',
  imports: [CommonModule,RouterOutlet,RouterModule ],
  templateUrl: './adminlayout.html',
  styleUrl: './adminlayout.css',
  standalone: true,
})
export class Adminlayout {
  // Hold the Observable stream
  currentUserName$: Observable<string>;
  constructor(private router: Router,
    private adminDataService: AdminDataService,
  ) {
    this.currentUserName$ = this.adminDataService.adminName$;
  }

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
