import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Also needed for common directives
import { newclientapi } from '../../services/newclient';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-uploadalbumpics',
  standalone: true, // It's good practice to declare standalone components
  imports: [
    CommonModule, // Required for ngIf, ngFor etc.
    FormsModule, // Needed for template-driven forms
    ReactiveFormsModule, // Needed for reactive forms
  ],
  templateUrl: './uploadalbumpics.html',
  styleUrl: './uploadalbumpics.css',
})
export class Uploadalbumpics implements OnInit {
  clientForm: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.clientForm = this.fb.group({
      // Define your form controls here, for example:
      albumTitle: [''],
      clientName: [''],
    });
  }

  // Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  id: string = '';

  private apiService = inject(newclientapi);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
    });
  }

  // selectedFiles: { [key: string]: File | null } = {
  //   category1: null,
  //   category2: null,
  //   category3: null,
  // };

  // onFileSelected(event: Event, category: string) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedFiles[category] = input.files[0];
  //   } else {
  //     this.selectedFiles[category] = null;
  //   }
  // }

  // uploadCategory(category: string) {
  //   const file = this.selectedFiles[category];
  //   if (!file) return;

  //   console.log(`Uploading file for ${category}`, file);

  //   // Reset after upload
  //   this.selectedFiles[category] = null;
  // }

  categories = [
  { key: 'category1', label: 'Category 1' },
  { key: 'category2', label: 'Category 2' },
  { key: 'category3', label: 'Category 3' }
]

uploadedCounts: { [key: string]: number } = {};
selectedFiles: { [key: string]: File | null } = {};

onFileSelected(event: any, category: string) {
  this.selectedFiles[category] = event.target.files[0];
}

uploadCategory(category: string) {
  // Simulate upload
  if (!this.uploadedCounts[category]) this.uploadedCounts[category] = 0;
  this.uploadedCounts[category]++;
}

  generateUserLogin() {
    // Implement your logic here
    if (this.id != '') {
      this.genertaeloginData();
    }
    console.log('Generating user login...');
  }

  genertaeloginData(): void {
    console.log('Fetching data from API...');
    this.isLoading = true;
    this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.apiService.generateUserlogin(this.id).subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.apiResponse = data; // Assign the raw response // **Important Note on responseType: 'text'** // Since your service specifies responseType: 'text', // `data` will be a raw string. If the API returns JSON, // you might need to parse it here: this.apiResponse = JSON.parse(data);
        alert('User login generated successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        console.error('There was an error!', error);
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
