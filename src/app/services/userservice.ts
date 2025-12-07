import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class userserviceapi {
  private clientAlbumUrl = environment.clientAlbumUrl;
  private blobUrl = environment.blobUrl;

  // Inject HttpClient using the `inject` function (modern approach)
  private http = inject(HttpClient);

  checkClientUrlInfo(user: string): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'getClientUrlInfo';
    return this.http.get(`${finalUrl}?user=${user}`);
  }

  getClientAlbumDetails(id: string): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'GetAlbumDetails';
    return this.http.get(`${finalUrl}?Id=${id}`);
  }

  saveUserAlbumDetails(data: any): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'createAlbum';
    return this.http.post(`${finalUrl}`, data, { responseType: 'text' });
  }

  submitAlbumDetailsAndDownloadPdf(data: any): Observable<HttpResponse<Blob>> {
    const finalUrl = this.clientAlbumUrl + 'createAlbum';

    return this.http.post(finalUrl, data, {
      responseType: 'blob',   // expecting PDF
      observe: 'response'     // to read headers (like filename)
    });
  }

  getClientDocuments(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.clientAlbumUrl}clientDocuments?clientId=${clientId}`);
  }

  downloadDocument(fileId: number): Observable<Blob> {
    return this.http.get(`${this.clientAlbumUrl}clientDocDownload?fileId=${fileId}`, {
      responseType: 'blob'
    });
  }

  getTrackingStatus(clientId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.clientAlbumUrl}getClientHistoryTracking?clientId=${clientId}`);
}

  getImagesbyType(clientId: string, photoType: string): Observable<any> {
    var finalUrl = this.blobUrl + 'listSAS';
    return this.http.get(
      `${finalUrl}?clientId=${clientId}&folderPath=${photoType}`
    );
  }

  getSelectedImagesbyClientId(clientId: string, fetchfor: string = ''): Observable<any> {
    var finalUrl = this.blobUrl + 'get-files-from-db-with-sas';
    return this.http.get(
      `${finalUrl}?clientId=${clientId}&fetchFor=${fetchfor}`
    );
  }

  getClientAlbumSelectionDetails(id: string): Observable<any> {
    var finalUrl = this.clientAlbumUrl + 'getClientInfoWithImages';
    return this.http.get(`${finalUrl}?clientId=${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Server Error (${error.status}): ${error.error?.message || error.message
        }`;
    }

    return throwError(() => new Error(errorMsg));
  }
}
