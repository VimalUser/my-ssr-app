import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

export interface DropdownItem {
  id: number;
  name: string;
}

export interface DropdownResponse {
  eventTypes: DropdownItem[];
  albumSizes: DropdownItem[];
  frameSizes: DropdownItem[];
  albumMaterialTypes: DropdownItem[];
}

@Injectable({
  providedIn: 'root',
})
export class newclientapi {
  // private readonly apiUrl = 'https://perfectlypickedapi.azurewebsites.net/perfectlypicked';
  // private readonly apiBaseUrl = 'https://localhost:44313/Api/ClientAlbum/';
  private readonly apiBaseUrl = 'https://localhost:44313/Api/ClientAlbum/';

  private readonly loginUrl = 'https://localhost:7112/Api/Auth/';
  private readonly blobUrl = 'https://localhost:7112/Api/Blob/';

  // Inject HttpClient using the `inject` function (modern approach)
  private http = inject(HttpClient);


  // validateUserLogin(data: any): Observable<any> {
  //   var finalUrl = this.loginUrl + 'login';
  //   return this.http.post(`${finalUrl}`, data);
  // }

  // validateUserLogin(data: any): Observable<any> {
  //   var finalUrl = this.loginUrl + 'login';
  //   return this.http.post<{ accessToken: string }>(
  //     `${finalUrl}`, data,
  //     { withCredentials: true } // send HttpOnly cookie automatically
  //   );
  // }

  validateUserLogin(data: any): Observable<any> {
    var finalUrl = this.loginUrl + 'login';
    return this.http.post<{ accessToken: string }>(
      `${finalUrl}`, data,
      { withCredentials: true } // send HttpOnly cookie automatically
    ).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
      })
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post<{ message: string }>(
      'https://api.example.com/register',
      { username, email, password },
      { withCredentials: true } // in case backend sets cookies
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
  }


  getAlbumDetails(id: string): Observable<any> {
    var finalUrl = this.apiBaseUrl + 'GetAlbumDetails';
    return this.http.get(`${finalUrl}?Id=${id}`);
  }

  getAllClientDetails(): Observable<any> {
    var finalUrl = this.apiBaseUrl + 'GetAllClientAlbum';
    return this.http.get(`${finalUrl}`);
  }

  saveClientAlbumDetails(data: any): Observable<any> {
    var finalUrl = this.apiBaseUrl + 'SaveClientDetails';
    if (data.clientId != 0) {
      finalUrl = this.apiBaseUrl + 'UpdateClientAlbum';
    }
    return this.http.post(`${finalUrl}`, data, { responseType: 'text' });
  }

  generateUserlogin(id: string): Observable<any> {
    var finalUrl = this.apiBaseUrl + 'GetUserLogin';
    return this.http.get(`${finalUrl}?Id=${id}`);
  }

  getDropdowns(): Observable<DropdownResponse> {
    return this.http.get<DropdownResponse>(`${this.apiBaseUrl}dropdowns`)
      .pipe(
        catchError(this.handleError)
      );
  }

  uploadImages(formData: FormData, category: string, clientId: number): Observable<any> {
    // Construct the endpoint URL with query parameters
    const endpoint = `${this.blobUrl}uploadParallelFiles?clientId=${clientId}&photoType=${category}`;
    console.log('Uploading to endpoint:', endpoint);

    // The backend expects files in the FormData, so pass the formData object directly
    return this.http.post(endpoint, formData);
  }

  // Fetch client with folder counts
  getClientFolderCounts(clientId: number): Observable<any> {
    alert('Fetching folder counts for clientId: ' + clientId);
    return this.http.get(`${this.blobUrl}getClientFolderCount?clientId=${clientId}`);
  }

 // download pictures
  downloadpictures1(clientId: number): Observable<any> {
    alert('download clientId: ' + clientId);
    return this.http.get(`${this.blobUrl}downloadImages?clientId=${clientId}`);
  }



  

  private handleError(error: HttpErrorResponse) {
    let errorMsg = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Server Error (${error.status}): ${error.error?.message || error.message}`;
    }

    return throwError(() => new Error(errorMsg));
  }

}
