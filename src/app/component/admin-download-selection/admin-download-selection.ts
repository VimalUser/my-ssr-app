import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { newclientapi } from '../../services/newclient';

@Component({
  selector: 'app-admin-download-selection',
  imports: [FormsModule],
  templateUrl: './admin-download-selection.html',
  styleUrl: './admin-download-selection.css'
})
export class AdminDownloadSelection {

  constructor(
    private apiAdminService :newclientapi   
  ){}

approvalComment:string ="";


// download() {
//   this.apiAdminService.downloadpictures(1).subscribe({
//     next: (blob) => {
//       // Create a temporary URL
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'images.zip'; // Name your file as needed
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       a.remove();
//     },
//     error: (error) => {
//       console.error('Error downloading images:', error);
//     },
//     complete: () => {
//       console.log('Image download complete.');
//     },
//   });
// }



download(){
  {
    console.log('Fetching data from API...');
  
    this.apiAdminService.downloadpictures1(1).subscribe({
      next: (data) => {
       alert("download ocmpelted");
      },
      error: (error) => {
       
      },
      complete: () => {
        // Optional: Executed when the Observable completes
        console.log('Data fetching complete.');
      },
    });
  }
}
}
