import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Notificationservice } from '../../services/notificationservice';

const API_BASE_URL = 'https://localhost:44313/Api/Auth/';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
 const http = inject(HttpClient);  
  const router = inject(Router);
  const notify = inject(Notificationservice);
  const isRefresh = req.url.includes('/refresh');
  const isLogin = req.url.includes('/login');
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
      if (err.status === 401 && !isRefresh && !isLogin) {
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
            notify.error('Session expired. Please log in again.');
            // Decide redirect path based on current URL
            const currentUrl = router.url.toLowerCase();
            if (currentUrl.includes('/admindashboard')) {
              router.navigate(['/adminlogin']);
            } else {
              router.navigate(['/startpage']);
            }
            // return throwError(() => err);
            return EMPTY;
          })
        );
      }
      return throwError(() => err);
    })
  );
};
