import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/core/interceptors/auth-interceptor';

bootstrapApplication(App, {
  providers: [provideRouter(routes),
  provideHttpClient(withFetch(),
  withInterceptors([AuthInterceptor])),
  ],
}).catch((err) => console.error(err));
