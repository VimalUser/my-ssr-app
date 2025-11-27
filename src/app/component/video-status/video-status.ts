import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-status',
  imports: [FormsModule, CommonModule],
  templateUrl: './video-status.html',
  styleUrl: './video-status.css'
})
export class VideoStatus {
videoStatuses = [
    'Video editing started',
    'Video editing completed',
    'Sent for Approval',
    'Video Approved'
  ];

  selectedStatus = '';
  isDone = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCurrentStatus();
  }

  loadCurrentStatus() {
    this.http.get<any>('/api/video/status/get').subscribe({
      next: (res) => {
        this.selectedStatus = res.status; // auto-selects radio
        this.isDone = res.done;           // checkbox auto selects
      },
      error: () => {
        console.log('Failed to load status');
      }
    });
  }

  saveStatus() {
    const payload = {
      status: this.selectedStatus,
      done: this.isDone
    };

    this.http.post('/api/video/status/update', payload).subscribe({
      next: () => alert('Status updated!'),
      error: () => alert('Error updating status')
    });
  }

  goBack() {
    history.back();
  }
}
