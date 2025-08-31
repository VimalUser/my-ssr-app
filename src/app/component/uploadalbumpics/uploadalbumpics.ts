import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Also needed for common directives

@Component({
  selector: 'app-uploadalbumpics',
  standalone: true, // It's good practice to declare standalone components
  imports: [
    CommonModule, // Required for ngIf, ngFor etc.
    FormsModule, // Needed for template-driven forms
    ReactiveFormsModule // Needed for reactive forms
  ],
  templateUrl: './uploadalbumpics.html',
  styleUrl: './uploadalbumpics.css'
})
export class Uploadalbumpics {
  clientForm: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      // Define your form controls here, for example:
      albumTitle: [''],
      clientName: ['']
    });
  }


  selectedFiles: { [key: string]: File | null } = {
    category1: null,
    category2: null,
    category3: null,
  };

  onFileSelected(event: Event, category: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles[category] = input.files[0];
    } else {
      this.selectedFiles[category] = null;
    }
  }

  uploadCategory(category: string) {
    const file = this.selectedFiles[category];
    if (!file) return;

    console.log(`Uploading file for ${category}`, file);

    // Reset after upload
    this.selectedFiles[category] = null;
  }
  


 
}