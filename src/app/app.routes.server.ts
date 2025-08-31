import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes prerendered
  {
    path: 'admindashboard',
    renderMode: RenderMode.Prerender
  },

  // Dynamic parameter routes rendered on client only
  {
    path: 'admindashboard/newclient/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'admindashboard/uploadpictures/:id',
    renderMode: RenderMode.Client
  },

  // Root or other static pages you want prerendered (add as needed)
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'logincode',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'userhome',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'adminlogin',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'userlogin',
    renderMode: RenderMode.Prerender
  },

  // Catch-all fallback - client render
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
