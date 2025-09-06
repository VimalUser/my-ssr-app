import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' // Add this line
})

export class LoggingService {
  constructor(private router: Router) {}

  private usernameSource = new BehaviorSubject<string>('');  
  username$ = this.usernameSource.asObservable();  

    setUsername(name: string) {
    this.usernameSource.next(name);
  }

   getUsername(): string {
    return this.usernameSource.getValue();
  }


  validateLoginSuccess(apiResponse: { message: string }, isLoadingSetter: (value: boolean) => void): void {
    if (apiResponse.message === 'Log in successfully!') {
      this.router.navigate(['/admindashboard']);
      isLoadingSetter(false);
    }
  }

    validateLoginFailure(message:any): void {
    // if (message.message === 'Session expired or not authenticated.') {
    //   this.router.navigate(['/adminlogin']);     
    // }else if(message.message === 'Login failed: User not found.'){
    //  alert('Login failed, please try again.');    
    // }
  }
}