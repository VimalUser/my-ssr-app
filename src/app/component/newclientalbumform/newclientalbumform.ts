import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownResponse, newclientapi } from '../../services/newclient';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Logincode } from '../logincode/logincode';

@Component({
  selector: 'app-newclientalbumform',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './newclientalbumform.html',
  styleUrl: './newclientalbumform.css',
})
export class Newclientalbumform implements OnInit {
  clientForm: ReturnType<FormBuilder['group']>;
  dropdowns: DropdownResponse | null = null;

  // Declare variables to hold the data and potential errors
  apiResponse: any;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  id: string = '';

  get f() {
    return this.clientForm.controls;
  }

  private apiService = inject(newclientapi);
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
    });
    this.loadDropdowns();
    if (this.id != '') {
      this.fetchData();
    }
    
  }

  // This is the single, combined constructor
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Logic from the FormBuilder constructor
    this.clientForm = this.fb.group({
      orderNumber: ['', Validators.required],
      clientName: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventTypeId: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]],
      albumMaterialTypeId: ['', Validators.required],
      noOfAlbums: ['', Validators.required],
      noOfSheets: ['', Validators.required],
      noOfFrame: ['', Validators.required],
      albumSizeId: ['', Validators.required],
      noOfPics: ['', Validators.required],
      frameSizeId: ['', Validators.required],
      clientId: [0],
      status: ['Yet to Start'],
      loginURL: [''],
      loginCode: [''],
    });
  }

  onSave() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched(); // highlight errors
      return;
    }
    alert('Save button clicked!');
    if (this.clientForm.valid) {
      // Implement your save logic here
      alert('Client saved!\n' + JSON.stringify(this.clientForm.value, null, 2));
      console.log(this.clientForm.value);
      this.savedetails();
    }
  }

  fetchData(): void {
    console.log('Fetching data from API...');
    this.isLoading = true;
    this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.apiService.getAlbumDetails(this.id).subscribe({
      next: (data) => {
        // This is where you process the successful response
        console.log('API Response:', data);
        this.apiResponse = data; // Assign the raw response // **Important Note on responseType: 'text'** // Since your service specifies responseType: 'text', // `data` will be a raw string. If the API returns JSON, // you might need to parse it here: this.apiResponse = JSON.parse(data);
        this.clientForm.patchValue(data);
        console.log('Form Values:', this.clientForm.value);
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

  savedetails() {
    console.log('Saving client album details...');
    if (this.clientForm.valid) {
      const clientAlbum = this.clientForm.value;
      this.isLoading = true;
      this.errorMessage = null;
      this.apiService.saveClientAlbumDetails(clientAlbum).subscribe({
        next: (response) => {
          console.log('Save Response:', response);
          this.apiResponse = response;
          this.isLoading = false;
          alert('Client album details saved successfully!');
        },
        error: (error) => {
          console.error('Save Error:', error);
          this.errorMessage = 'Failed to save client album details.';
          this.isLoading = false;
        },
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
    }
  }

  loadDropdowns() {
    this.apiService.getDropdowns().subscribe({
      next: (res) => {
        this.dropdowns = res;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    });
  }
}
