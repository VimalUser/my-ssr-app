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

 
  saveClientAlbumDetails(data: any): Observable<any> {
    var finalUrl = this.apiBaseUrl + 'SaveClientDetails';
    if (data.clientId != 0) {
      finalUrl = this.apiBaseUrl +'UpdateClientAlbum';
    }
    return this.http.post(`${finalUrl}`, data, { responseType: 'text' });
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
