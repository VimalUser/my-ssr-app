import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';

const API_BASE_URL = 'https://localhost:44313/Api/Auth/';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {

  const isRefresh = req.url.includes('/refresh');
  const token = localStorage.getItem('accessToken');
  console.log('Interceptor running', req.url, token);

  let authReq = req;
  if (token && !isRefresh) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && !isRefresh) {
        const http = inject(HttpClient);
        return http.post<{ accessToken: string }>(
          API_BASE_URL + 'refresh',
          {},
          { withCredentials: true }
        ).pipe(
          switchMap(res => {
            localStorage.setItem('accessToken', res.accessToken);
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            localStorage.removeItem('accessToken');
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
