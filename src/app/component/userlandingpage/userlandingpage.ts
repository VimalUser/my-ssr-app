import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { ClientDataService } from '../../shared/ClientDataService';

@Component({
  selector: 'app-userlandingpage',
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
  templateUrl: './userlandingpage.html',
  styleUrl: './userlandingpage.css',
  standalone: true,
})
export class Userlandingpage implements OnInit {
  // Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private ClientDataService: ClientDataService
  ) {} // 1. Inject the Api service using the private property shortcut // or the `inject` function for standalone components/services
  private apiService = inject(Api);

  ngOnInit(): void {
    this.ClientDataService.nextStep$.subscribe(() => {
      this.nextStep(); // call existing nextStep() method
    });

    this.ClientDataService.prevStep$.subscribe(() => {
      this.prevStep();
    });
  }

  currentStepIndex = 0; // 0-based index, first menu item enabled initially

  menuItems = [
    {
      name: 'Home',
      route: '/userhome/startpage',
      icon: 'bi-speedometer2',
      disabled: false,
    },
    {
      name: 'Album Name',
      route: '/userhome/albumname',
      icon: 'bi-pencil-square',
      disabled: true,
    },
    {
      name: 'Album Selection',
      route: '/userhome/gallery',
      icon: 'bi-calendar2-week',
      disabled: true,
    },
    {
      name: 'Frame Picture',
      route: '/userhome/framepicture',
      icon: 'bi-film',
      disabled: true,
    },
    {
      name: 'Cover Picture',
      route: '/userhome/coverpicture',
      icon: 'bi-bell',
      disabled: true,
    },
    {
      name: 'Submit Form',
      route: '/userhome/submitform',
      icon: 'bi-trophy',
      disabled: true,
    },
  ];

  // Call this when next button clicked, to move to next step and enable menu
  nextStep() {
    if (this.currentStepIndex < this.menuItems.length - 1) {
      this.currentStepIndex++;
      this.menuItems[this.currentStepIndex].disabled = false;

      // Optional: navigate to next route automatically
      const nextRoute = this.menuItems[this.currentStepIndex].route;
      this.router.navigate([nextRoute]);
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.menuItems[this.currentStepIndex].disabled = false;

      const prevRoute = this.menuItems[this.currentStepIndex].route;
      this.router.navigate([prevRoute]);
    }
  }

  isLightTheme = false; // false = dark (black) by default

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    // Optionally add body class toggling or localStorage persistence here
  }

  logout() {
    localStorage.removeItem('accessToken');
    // Implement logout logic here, e.g., clear session, redirect to login page
    console.log('User logged out');
  }
}
