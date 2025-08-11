import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './api'; // Assuming ApiService is the renamed version of Api  

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('my-ssr-app');
  apiData: any;
  error: string | null = null;

   private apiService = inject(Api);

  ngOnInit(): void {
    this.apiService.getData().subscribe({
      next: (data) => {
        // Success callback
        // this.apiData = data;
        console.log('API Response:', data);
      },
      error: (err) => {
        // Error callback
        this.error = 'Failed to fetch API data.';
        console.error('There was an error!', err);
      }
    });
  }
}
