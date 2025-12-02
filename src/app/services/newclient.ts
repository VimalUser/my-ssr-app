import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminStatusInput, AdminStatusOutput, ClientManagement } from '../model/ClientManagement';

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
export interface ClientExpiryDate {
  ClientId: string;
  ExpiryDate: string;
}
export interface ClientVideoStatus {
  ClientId: string;
  VideoStatus: string;
}

@Injectable({
  providedIn: 'root',
})
export class newclientapi {

  private clientAlbumUrl = environment.clientAlbumUrl;
  private authUrl = environment.authUrl;
  private blobUrl = environment.blobUrl;

  // Inject HttpClient using the `inject` function (modern approach)
  private http = inject(HttpClient);


  validateClientLogin(data: any): Observable<any> {
    var finalUrl = this.authUrl + 'clientLogin';
    return this.http.post<{ accessToken: string }>(
      `${finalUrl}`, data,
      // send HttpOnly cookie automatically
    ).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
      })
    );
  }

  validateUserLogin(data: any): Observable<any> {
    var finalUrl = this.authUrl + 'login';
    return this.http.post<{ accessToken: string }>(
      `${finalUrl}`, data,
      // send HttpOnly cookie automatically
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
      // in case backend sets cookies
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
  }

  saveExpiryDate(id: string, expiryDate: string): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'saveExpiryDate';
    var data : ClientExpiryDate= { ClientId : id, ExpiryDate: expiryDate };
    return this.http.post(`${finalUrl}`, data, { responseType: 'text' });
  }

   saveVideoStatus(id: string, videoStatus: string): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'saveVideoStatus';
    var data : ClientVideoStatus= { ClientId : id, VideoStatus: videoStatus };
    return this.http.post(`${finalUrl}`, data, { responseType: 'text' });
  }

  getAlbumDetails(id: string): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'GetAlbumDetails';
    return this.http.get(`${finalUrl}?Id=${id}`);
  }

  getAllClientDetails(): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'GetAllClientAlbum';
    return this.http.get(`${finalUrl}`);
  }

  saveClientAlbumDetails(data: any): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'SaveClientDetails';
    if (data.clientId != 0) {
      finalUrl = this.clientAlbumUrl + 'UpdateClientAlbum';
    }
    return this.http.post(`${finalUrl}`, data);
  }

  generateUserlogin(id: string): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'GetUserLogin';
    return this.http.get(`${finalUrl}?Id=${id}`);
  }

  getDropdowns(): Observable<DropdownResponse> {
    return this.http.get<DropdownResponse>(`${this.clientAlbumUrl}dropdowns`)
      .pipe(
        catchError(this.handleError)
      );
  }

  uploadImages(formData: FormData, category: string, camera: string, clientId: number): Observable<any> {
    // Construct the endpoint URL with query parameters
    const endpoint = `${this.blobUrl}uploadParallelFiles?clientId=${clientId}&photoType=${category}&camera=${camera}`;

    // The backend expects files in the FormData, so pass the formData object directly
    return this.http.post(endpoint, formData);
  }

    deleteImages(category: string, clientId: number): Observable<any> {
    // Construct the endpoint URL with query parameters
    const endpoint = `${this.blobUrl}deleteOtherImages?clientId=${clientId}&folderPath=${category}`;

    // The backend expects files in the FormData, so pass the formData object directly
    return this.http.delete(endpoint);
  }

  // Fetch client with folder counts
  getClientFolderCounts(clientId: number): Observable<any> {
    return this.http.get(`${this.blobUrl}getClientFolderCount?clientId=${clientId}`);
  }

  downloadpictures1(clientId: number): Observable<Blob> {
    return this.http.get(`${this.blobUrl}downloadFromBlob?clientId=${clientId}`, {
      responseType: 'blob' // <-- Must be 'blob' for binary file
    });
  }


  getClientManagementData(pageNumber: number, pageSize: number): Observable<ClientManagement> {
    return this.http.get<ClientManagement>(this.clientAlbumUrl
      + 'getClientManagementData' + `?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }
  markAsDone(data: AdminStatusInput): Observable<boolean> {
    return this.http.put<boolean>(this.clientAlbumUrl + 'updateAdminStatus', data);
  }

    getAdminStatus(clientId :number): Observable<AdminStatusOutput> {
    return this.http.get<AdminStatusOutput>(`${this.clientAlbumUrl}getAdminStatus?clientId=${clientId}`);
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
