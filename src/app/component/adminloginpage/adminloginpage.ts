import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { newclientapi } from '../../services/newclient';
import { UserLogin } from '../../model/userlogin';
import { LoggingService } from '../../shared/logging.service';

@Component({
  selector: 'app-adminloginpage',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adminloginpage.html',
  styleUrl: './adminloginpage.css'
})
export class Adminloginpage {
  loginForm;
  // Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  id: string = '';
  userLogin: UserLogin = {} as UserLogin;

  private apiService = inject(newclientapi);

  constructor(private fb: FormBuilder,
     private router: Router,
     private loggingService: LoggingService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      // alert(`Login successful!\nUsername: ${username}\nPassword: ${password}`);
      this.validateLogin(username ?? '', password ?? '');
      //  this.router.navigate(['/admindashboard']);
      // Replace alert with real login logic
    }
  }

  validateLogin(username: string, password: string) {
    console.log('validating login...');
    this.isLoading = true;
    this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.userLogin.username = username;
    this.userLogin.password = password;

    this.apiService.validateUserLogin(this.userLogin).subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.apiResponse = data; // Assign the raw response // **Important Note on responseType: 'text'** // Since your service specifies responseType: 'text', // `data` will be a raw string. If the API returns JSON, // you might need to parse it here: this.apiResponse = JSON.parse(data);

        if (this.apiResponse.message === 'Log in successfully!') {
          this.router.navigate(['/admindashboard']);
          this.isLoading = false;
        }
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        // this.loggingService.validateLoginFailure(error.error);
        this.errorMessage =
          'Failed to load data. Check the server or network connection.';
        this.isLoading = false;
      },
      complete: () => {
        // Optional: Executed when the Observable completes
        console.log('Data fetching complete.');
      },
    });
  }
}
