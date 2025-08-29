import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class newclientapi {
  // private readonly apiUrl = 'https://perfectlypickedapi.azurewebsites.net/perfectlypicked';
  private readonly apiBaseUrl = 'http://localhost:5167/NewclientAlbum/';

  // Inject HttpClient using the `inject` function (modern approach)
  private http = inject(HttpClient);

  /**
   * Fetches data from the API.
   * @returns An Observable of the API response.
   */
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
    if (data.id != '') {
      finalUrl = this.apiBaseUrl +'UpdateClientAlbum';
    }
    return this.http.post(`${finalUrl}`, data);
  }
}
