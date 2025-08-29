import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-adminloginpage',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adminloginpage.html',
  styleUrl: './adminloginpage.css'
})
export class Adminloginpage {
  loginForm;
  constructor(private fb: FormBuilder,private router: Router) {
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
      alert(`Login successful!\nUsername: ${username}\nPassword: ${password}`);
       this.router.navigate(['/admindashboard']);
      // Replace alert with real login logic
    }
  }
}


