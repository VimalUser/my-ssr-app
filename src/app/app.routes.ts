import { Routes } from '@angular/router';
import { Logincode } from './component/logincode/logincode';
import { Userlandingpage } from './component/userlandingpage/userlandingpage';
import { Adminloginpage } from './component/adminloginpage/adminloginpage';
import { Userloginpage } from './component/userloginpage/userloginpage';
import { Admindashboard } from './component/admindashboard/admindashboard';
import { Newclientalbumform } from './component/newclientalbumform/newclientalbumform';
import { Uploadalbumpics } from './component/uploadalbumpics/uploadalbumpics';
import { Adminlayout } from './component/adminlayout/adminlayout'; // Import the new layout component

export const routes: Routes = [
  // Routes for pages without the admin sidebar
  { path: '', redirectTo: 'adminlogin', pathMatch: 'full' },
 { path: 'logincode', component: Logincode },
  { path: 'userhome', component: Userlandingpage },
  { path: 'adminlogin', component: Adminloginpage },
  { path: 'userlogin', component: Userloginpage },

  // A parent route for the admin layout
  {
    path: 'admindashboard',
    component: Adminlayout, // The layout component provides the sidebar and router-outlet
    children: [
      { path: '', component: Admindashboard }, // This is the main dashboard content
      { path: 'newclient', component: Newclientalbumform },
      { path: 'newclient/:id', component: Newclientalbumform  },
      { path: 'uploadpictures/:id', component: Uploadalbumpics  },
    ]
  },

  // Redirect any unknown paths or the root to the admin login (or your default landing page)
  { path: '**', redirectTo: 'adminlogin' }
];