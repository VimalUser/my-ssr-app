import { Component } from '@angular/core';
import { Notificationservice } from '../../services/notificationservice';
import { userserviceapi } from '../../services/userservice';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-documents',
  imports: [CommonModule],
  templateUrl: './client-documents.html',
  styleUrl: './client-documents.css'
})
export class ClientDocuments {

  constructor(
     private notify: Notificationservice,
     private userservice: userserviceapi,
     private router: Router,
     private route: ActivatedRoute,
  ) {
  }

  documents: any[] = [];
  isLoading = false;
  clientId: number = 0;
  id: string = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
      this.clientId = +this.id;
    });
    if (this.id != '') {
      this.loadDocuments();
    }
  }
  goBack() {
    window.history.back();
  }

  loadDocuments() {
    this.isLoading = true;

    this.userservice.getClientDocuments(this.clientId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.isLoading = false;
      },
      error: () => {
        this.notify.error('Failed to load documents');
        this.isLoading = false;
      }
    });
  }

  downloadFile(fileId: number, fileName: string) {
    this.isLoading = true;

    this.userservice.downloadDocument(fileId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);

        this.isLoading = false;
      },
      error: () => {
        this.notify.error("Could not download file");
        this.isLoading = false;
      }
    });
  }
 }
