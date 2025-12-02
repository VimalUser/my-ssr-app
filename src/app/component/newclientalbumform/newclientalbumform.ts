import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray, FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownResponse, newclientapi } from '../../services/newclient';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Notificationservice } from '../../services/notificationservice';

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
  showAccessLink = false;
  isDisableAccessLink: boolean = false;
  clientAlbumHeading: string = 'New Client Setup';
  eventCounts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  isLoadingEvents: boolean = false;

  get eventList(): FormArray<FormGroup> {
    return this.clientForm.get('eventList') as FormArray<FormGroup>;
  }



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
      this.clientAlbumHeading = 'Edit Client Details';
      this.enableEdit();
      this.fetchData();
    }

  }
  goBack() {
    window.history.back();
  }
  // This is the single, combined constructor
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notify: Notificationservice
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
      noOfAlbumCover: ['', Validators.required],
      frameSizeId: ['', Validators.required],
      clientId: [0],
      status: ['Yet to Start'],
      accessLink: [''],
      passcode: [''],
      createDate: [null],
      createdBy: [''],
      updatedDate: [null],
      updatedBy: [''],
      noOfEvents: [''],
      eventList: this.fb.array<FormControl>([])
    });
  }

  enableEdit() {
    this.showAccessLink = true;
    this.isDisableAccessLink = true;
    this.clientForm.get('orderNumber')?.disable(); // disable while editing
    this.clientForm.get('accessLink')?.disable(); // disable while editing
    this.clientForm.get('passcode')?.disable(); // disable while editing
  }

  onSave() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched(); // highlight errors
      return;
    }
    if (this.clientForm.valid) {
      // Implement your save logic here
      this.savedetails();
    }
  }

  onEventCountChange() {
    if (this.isLoadingEvents) return;

    const count = this.clientForm.get('noOfEvents')?.value;
    this.eventList.clear();

    if (!count || count <= 0) return;

    for (let i = 0; i < count; i++) {
      this.eventList.push(this.createEventControl());
    }
  }


  createEventControl(value?: any): FormGroup {
    return this.fb.group({
      order: [value?.order || 0],
      name: [
        value?.name || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(50)]
      ],
      eventDate: [value?.eventDate || null]
    });
  }


  fetchData(): void {
    this.isLoading = true;
    this.errorMessage = null; // 2. Call the service method and subscribe to the Observable
    this.apiService.getAlbumDetails(this.id).subscribe({
      next: (data) => {
        // This is where you process the successful response
        this.apiResponse = data; // Assign the raw response // **Important Note on responseType: 'text'** // Since your service specifies responseType: 'text', // `data` will be a raw string. If the API returns JSON, // you might need to parse it here: this.apiResponse = JSON.parse(data);
        this.clientForm.patchValue(data);

        this.isLoadingEvents = false;
        this.clientForm.get('noOfEvents')?.setValue(data.eventList?.length || 0);
        const eventArray = this.clientForm.get('eventList') as FormArray;
        eventArray.clear();

        if (data.eventList && data.eventList.length > 0) {
          data.eventList.forEach((evt: any, index: number) => {
            eventArray.push(this.createEventControl({
              order: evt.order,
              name: evt.name,
              eventDate: evt.eventDate
            }));
          });
        }
        this.isLoadingEvents = false;
        this.isLoading = false;

      },
      error: (error) => {
        // This is executed if the request fails (e.g., 404, 500)
        this.errorMessage =
          'Failed to load data. Check the server or network connection.';
        this.isLoading = false;
      },
      complete: () => {
        // Optional: Executed when the Observable completes
      },
    });
  }

  buildEventListPayload() {
    return this.eventList.controls.map((ctrl, index) => ({
      order: ctrl.get('order')?.value || index + 1,
      name: ctrl.get('name')?.value,
      eventDate: ctrl.get('eventDate')?.value
    }));
  }



  savedetails() {
    if (this.clientForm.valid) {

      const clientAlbum = {
        ...this.clientForm.value,
        events: this.buildEventListPayload()
      };

      this.isLoading = true;
      this.errorMessage = null;
      this.apiService.saveClientAlbumDetails(clientAlbum).subscribe({
        next: (response) => {
          this.apiResponse = response;
          this.isLoading = false;
          this.notify.success('Client album details saved successfully!');
          var clientId = this.id != '' ? this.id : response.clientId;
          this.router.navigate(['/admindashboard/uploadpictures', clientId]);
        },
        error: (error) => {
          this.notify.error('Failed to save client album details.');
          this.errorMessage = 'Failed to save client album details.';
          this.isLoading = false;
        },
      });
    } else {
      this.notify.error('Please fill all required fields correctly.');
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

  // --- NEW FUNCTION TO COPY TO CLIPBOARD ---
  copyToClipboard(inputControlName: string, event: MouseEvent): void {
    event.preventDefault(); // Prevent form submission/navigation if the button is inside a form

    // 1. Get the value from the form control
    const valueToCopy = this.clientForm.get(inputControlName)?.value;

    if (valueToCopy) {
      // 2. Use the modern Clipboard API
      navigator.clipboard.writeText(valueToCopy).then(() => {

        // Optional: Provide visual feedback (e.g., a toast or temporary icon change)
        const button = (event.target as HTMLElement).closest('button');
        if (button) {
          button.classList.add('btn-success');
          setTimeout(() => {
            button.classList.remove('btn-success');
          }, 1000);
        }

      }).catch(err => {
      });
    }
  }
}
