import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api';
import {
  Router,
  RouterOutlet,
  RouterModule,
  NavigationEnd,
} from '@angular/router';
import { ClientDataService } from '../../shared/ClientDataService';
import { filter } from 'rxjs/operators';
declare var bootstrap: any;
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
    this.ClientDataService.nextStep$.subscribe((menuItem: number) =>
      this.nextStep(menuItem)
    );
    // this.ClientDataService.nextStep$.subscribe(() => this.nextStep());

     this.ClientDataService.prevStep$.subscribe((menuItem: number) =>
      this.prevStep(menuItem)
    );
    // this.ClientDataService.prevStep$.subscribe(() => this.prevStep(''));

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/userhome/startpage') {          
          this.ClientDataService.resetClientDataOnly();
        }
      });
  }

  currentStepIndex = 0; // 0-based index, first menu item enabled initially

  menuItems = [
    {
      id: 0,
      name: 'Home',
      route: '/userhome/startpage',
      icon: 'bi-speedometer2',
      disabled: false,
    },   
    {
      id: 1,
      name: 'Album Name',
      route: '/userhome/albumname',
      icon: 'bi-pencil-square',
      disabled: true,
    },
    {
      id: 2,
      name: 'Album Selection',
      route: '/userhome/gallery',
      icon: 'bi-calendar2-week',
      disabled: true,
    },
    {
      id: 3,
      name: 'Frame Picture',
      route: '/userhome/framepicture',
      icon: 'bi-film',
      disabled: true,
    },
    {
      id: 4,
      name: 'Cover Picture',
      route: '/userhome/coverpicture',
      icon: 'bi-bell',
      disabled: true,
    },
    {
      id: 5,
      name: 'Submit Form',
      route: '/userhome/submitform',
      icon: 'bi-trophy',
      disabled: true,
    },
  ];

  nextStep(menuItem: number) {
    this.activateMenuByName(menuItem);
    // if (this.currentStepIndex < this.menuItems.length - 1) {
    //   this.currentStepIndex++;
    //   this.menuItems[this.currentStepIndex].disabled = false;
    //   this.router.navigate([this.menuItems[this.currentStepIndex].route]);
    // }
  }

  activateMenuByName(menuItemIndex: number) {
  this.currentStepIndex = menuItemIndex;
  this.menuItems.forEach(item => item.disabled = item.id > menuItemIndex);
  const activeItem = this.menuItems.find(item => item.id === menuItemIndex);
  if (activeItem) {
    this.router.navigate([activeItem.route]);
  }
}


  prevStep(menuItem: number) {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.menuItems[this.currentStepIndex].disabled = false;
      this.router.navigate([this.menuItems[this.currentStepIndex].route]);
    }
  }

  isLightTheme = false; // false = dark (black) by default
   isSidebarCollapsed = false;  // new variable for sidebar state

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    // Optionally add body class toggling or localStorage persistence here
  }

  logout() {
    localStorage.removeItem('accessToken');
  }

  
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onNavClick(item: any, event: Event) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // Auto-close mobile sidebar
    if (window.innerWidth < 992) {
      const offcanvasEl = document.getElementById('mainSidebar');
      if (offcanvasEl) {
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
        offcanvas.hide();
      }
    }
  }
}
