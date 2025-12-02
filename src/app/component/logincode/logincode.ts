import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { userserviceapi } from '../../services/userservice';
import { ClientAlbum } from '../../model/ClientAlbum';
import {
  ClientDataService,
  LoggedInUser,
} from '../../shared/ClientDataService';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Notificationservice } from '../../services/notificationservice';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { newclientapi } from '../../services/newclient';
import { ClientLogin } from '../../model/userlogin';
import { CommonModule, isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-logincode',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './logincode.html',
  styleUrl: './logincode.css',
})
export class Logincode {
  bgImage = 'assets/users/wedding.jpg';
  loginForm: FormGroup;
  loading: boolean = false;
  userInfo: any;
  userLogin: ClientLogin = {} as ClientLogin;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: userserviceapi,
    private notify: Notificationservice,
    private fb: FormBuilder,
    private apiService: newclientapi,
    private router: Router,
    private clientService: ClientDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      passcode: ['', Validators.required],
    });
  }
  user: string | null = null;
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('clientData');
    }
    this.loading = true;
    // Subscribe to query params
    setTimeout(() => {
      this.route.queryParamMap.subscribe((params) => {
        this.user = params.get('user');

        if (!this.user || this.user.trim() === '') {
          this.loading = false;
          this.notify.error('Please enter the exact URL you received to proceed');
          return;
        }

        // Call API to validate
        this.userService.checkClientUrlInfo(this.user).subscribe({
          next: (res: any) => {
            this.userInfo = res;
            const loggedInUser: LoggedInUser = {
              clientId: this.userInfo.clientId,
              clientName: this.userInfo.clientName,
            };

            if (
              this.userInfo.loginCoverUrl &&
              this.userInfo.loginCoverUrl.trim() !== ''
            ) {
              this.bgImage = this.userInfo.loginCoverUrl;
            }

            // 1. Store user in service
            this.clientService.setCurrentUser(loggedInUser);
            this.loading = false;
          },
          error: (err) => {
            if (err.status === 400 || err.status === 404) {
              this.notify.error(err.error.message);
            }
            this.loading = false;
          },
        });
      });
    }, 100);

  }

  validateClientLogin() {
    this.loading = true;

    if (!this.user) {
      this.loading = false;
      this.notify.error('Please enter the exact url you recieved to proceed');
      return;
    }

    const passcode = this.loginForm.get('passcode')?.value;
    this.userLogin.user = this.user;
    this.userLogin.passcode = passcode;

    this.apiService.validateClientLogin(this.userLogin).subscribe({
      next: (apiResponse) => {
        this.loading = false;
        if (
          apiResponse.accessToken != null &&
          apiResponse.accessToken != undefined
        ) {
          this.router.navigate(['/userhome/startpage']);
          // this.loading = false;
        } else {
          this.loading = false;
          this.notify.error(apiResponse.message || 'Invalid passcode');
        }
      },
      error: (err) => {
        if (err.status === 400 || err.status === 404)
          this.notify.error(err.error.message || 'Invalid passcode');
        else this.notify.error('Something went wrong');
        this.loading = false;
      },
    });
  }
}
