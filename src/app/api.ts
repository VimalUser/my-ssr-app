import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  
private readonly apiUrl = 'https://perfectlypickedapi.azurewebsites.net/perfectlypicked';

  // Inject HttpClient using the `inject` function (modern approach)
  private http = inject(HttpClient); 

  /**
   * Fetches data from the API.
   * @returns An Observable of the API response.
   */
  getData(): Observable<any> {
    return this.http.get(this.apiUrl,{ responseType: 'text' });
  }
}