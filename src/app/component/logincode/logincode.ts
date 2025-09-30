import { Component } from '@angular/core';
import { userserviceapi } from '../../services/userservice';
import { ClientAlbum } from '../../model/ClientAlbum';
import { ClientDataService } from '../../shared/ClientDataService';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Notificationservice } from '../../services/notificationservice';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { newclientapi } from '../../services/newclient';
import { ClientLogin } from '../../model/userlogin';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logincode',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './logincode.html',
  styleUrl: './logincode.css',
})
export class Logincode {
  loginForm: FormGroup;
  loading: boolean = false;
  userInfo: any;
  userLogin: ClientLogin = {} as ClientLogin;

  constructor(private route: ActivatedRoute, private http: HttpClient,
    private userService: userserviceapi,
    private notify: Notificationservice,
    private fb: FormBuilder,
    private apiService: newclientapi,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      passcode: ['', Validators.required]
    });
  }
  user: string | null = null;
  ngOnInit() {
    this.loading = true;
    this.user = this.route.snapshot.queryParamMap.get('user');
    console.log('Login Code:', this.user);
    if (!this.user || this.user.trim() === '') {
      this.loading = false;
      this.notify.error('Please enter the exact url you recieved to proceed');
      return;
    }

    // Call API to validate
    this.userService.checkClientUrlInfo(this.user).subscribe({
      next: (res: any) => {
        this.userInfo = res; // will be undefined for errors
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 400)
          this.notify.error(err.error.message);
        else if (err.status === 404)
          this.notify.error(err.error.message);
        this.loading = false;
      }
    });

  }

  validateClientLogin() {
    this.loading = true;

    if (!this.user) {
      this.loading = false;
      this.notify.error('Please enter the exact url you recieved to proceed');
      return;
    }

    const passcode = this.loginForm.get('passcode')?.value;
    console.log('validating login...');
    this.userLogin.user = this.user;
    this.userLogin.passcode = passcode;

    this.apiService.validateClientLogin(this.userLogin).subscribe({
      next: (apiResponse) => {
        this.loading = false;
        if (apiResponse.accessToken != null && apiResponse.accessToken != undefined) {
          this.router.navigate(['/userhome/startpage']);
          // this.loading = false;
        }
        else {
          this.loading = false;
          this.notify.error(apiResponse.message || 'Invalid passcode');
        }
      },
      error: (err) => {
        if (err.status === 400 || err.status === 404)
          this.notify.error(err.error.message || 'Invalid passcode');
        else
          this.notify.error('Something went wrong');
        this.loading = false;
      }
    });
  }
}
