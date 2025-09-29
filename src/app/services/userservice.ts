import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class userserviceapi {
  // private readonly apiUrl = 'https://perfectlypickedapi.azurewebsites.net/perfectlypicked';
  private readonly apiBaseUrl = 'https://localhost:7112/Api/ClientAlbum/';
  private readonly loginUrl = 'https://localhost:7112/Api/Auth/';
  private readonly blobUrl = 'https://localhost:7112/Api/Blob/';

  // Inject HttpClient using the `inject` function (modern approach)
  private http = inject(HttpClient);

  validateUserLogin(data: any): Observable<any> {
    var finalUrl = this.loginUrl + 'login';
    return this.http.post(`${finalUrl}`, data);
  }

  getClientAlbumDetails(id: string): Observable<any> {
    var finalUrl = this.apiBaseUrl + 'GetAlbumDetails';
    return this.http.get(`${finalUrl}?Id=${id}`);
  }

  saveUserAlbumDetails(data: any): Observable<any> {
    var finalUrl = this.apiBaseUrl + 'createAlbum';
    return this.http.post(`${finalUrl}`, data, { responseType: 'text' });
  }

  getImagesbyType(clientId: string, photoType: string): Observable<any> {
    var finalUrl = this.blobUrl + 'listSAS';
    return this.http.get(
      `${finalUrl}?clientId=${clientId}&folderPath=${photoType}`
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Server Error (${error.status}): ${
        error.error?.message || error.message
      }`;
    }

    return throwError(() => new Error(errorMsg));
  }
}
