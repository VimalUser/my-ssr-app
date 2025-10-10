import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 🌐 Root redirect page
  {
    path: '',
    renderMode: RenderMode.Prerender
  },

  // 📌 Public / login pages - static prerender
  {
    path: 'adminlogin',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'userlogin',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'logincode',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'clientlogout',
    renderMode: RenderMode.Prerender
  },

  // 🧭 Admin dashboard main page - prerender for fast first load
  {
    path: 'admindashboard',
    renderMode: RenderMode.Prerender
  },

  // 🧭 Admin dashboard child routes with dynamic params - client render
  {
    path: 'admindashboard/newclient',
    renderMode: RenderMode.Client
  },
  {
    path: 'admindashboard/newclient/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'admindashboard/uploadpictures/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'admindashboard/sendCredentials/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'admindashboard/adminactions/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'admindashboard/download/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'admindashboard/comments/:id',
    renderMode: RenderMode.Client
  },

  // 👤 User home base route - prerender (acts like layout)
  {
    path: 'userhome',
    renderMode: RenderMode.Prerender
  },

  // 👤 User child pages — typically dynamic navigation, so client render
  {
    path: 'userhome/startpage',
    renderMode: RenderMode.Client
  },
  {
    path: 'userhome/albumname',
    renderMode: RenderMode.Client
  },
  {
    path: 'userhome/gallery',
    renderMode: RenderMode.Client
  },
  {
    path: 'userhome/framepicture',
    renderMode: RenderMode.Client
  },
  {
    path: 'userhome/coverpicture',
    renderMode: RenderMode.Client
  },
  {
    path: 'userhome/submitform',
    renderMode: RenderMode.Client
  },

  // 🌐 Catch-all fallback for unknown routes — client only
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
