import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { newclientapi } from '../../services/newclient';
import { UserLogin } from '../../model/userlogin';
import { LoggingService } from '../../shared/logging.service';
import { Notificationservice } from '../../services/notificationservice';
import { AdminDataService } from '../../shared/admin-data-service';

@Component({
  selector: 'app-adminloginpage',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adminloginpage.html',
  styleUrl: './adminloginpage.css'
})
export class Adminloginpage {
  loginForm;
  public loading: boolean = false;
  // Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  id: string = '';
  userLogin: UserLogin = {} as UserLogin;

  private apiService = inject(newclientapi);

  constructor(private fb: FormBuilder,
    private router: Router,
    private loggingService: LoggingService,
    private notificationService: Notificationservice,
    private adminDataService: AdminDataService) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.validateLogin(email ?? '', password ?? '');
    }
  }

  validateLogin(email: string, password: string) {
    console.log('validating login...');
    this.loading = true;
    this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.userLogin.email = email;
    this.userLogin.password = password;

    this.apiService.validateUserLogin(this.userLogin).subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.apiResponse = data; // Assign the raw response // **Important Note on responseType: 'text'** // Since your service specifies responseType: 'text', // `data` will be a raw string. If the API returns JSON, // you might need to parse it here: this.apiResponse = JSON.parse(data);
        console.log('Parsed Response:', this.apiResponse);
        this.adminDataService.setUserName(this.apiResponse.username);
        if (this.apiResponse.accessToken != null && this.apiResponse.accessToken != undefined) {
          this.router.navigate(['/admindashboard']);
          this.loading = false;
        }
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        // this.loggingService.validateLoginFailure(error.error);
        this.errorMessage =
          'Failed to load data. Check the server or network connection.';
        this.loading = false;
        this.notificationService.error(error.error || 'Login failed');
      },
      complete: () => {
        // Optional: Executed when the Observable completes
        console.log('Data fetching complete.');
      },
    });
  }
}
