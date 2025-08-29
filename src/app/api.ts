import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  
// private readonly apiUrl = 'https://perfectlypickedapi.azurewebsites.net/perfectlypicked';
private readonly apiUrl = 'http://localhost:5167/NewclientAlbum/GetWeatherForecast';

  // Inject HttpClient using the `inject` function (modern approach)
  private http = inject(HttpClient); 

  /**
   * Fetches data from the API.
   * @returns An Observable of the API response.
   */
  getData(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}