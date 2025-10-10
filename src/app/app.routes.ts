import { Routes } from '@angular/router';
import { Logincode } from './component/logincode/logincode';
import { Userlandingpage } from './component/userlandingpage/userlandingpage';
import { Adminloginpage } from './component/adminloginpage/adminloginpage';
import { Userloginpage } from './component/userloginpage/userloginpage';
import { Admindashboard } from './component/admindashboard/admindashboard';
import { Newclientalbumform } from './component/newclientalbumform/newclientalbumform';
import { Uploadalbumpics } from './component/uploadalbumpics/uploadalbumpics';
import { Adminlayout } from './component/adminlayout/adminlayout'; // Import the new layout component
import { Adminactionshome } from './component/adminactionshome/adminactionshome';
import { Albumstratpage } from './component/albumstratpage/albumstratpage';
import { AlbumName } from './component/album-name/album-name';
import { Imagegallery } from './component/imagegallery/imagegallery';
import { Framepicturecomponent } from './component/framepicturecomponent/framepicturecomponent';
import { CoverpcitureSelection } from './component/coverpciture-selection/coverpciture-selection';
import { Useralbumsubmitform } from './component/useralbumsubmitform/useralbumsubmitform';
import { AdminDownloadSelection } from './component/admin-download-selection/admin-download-selection';
import { AdminReviewComments } from './component/admin-review-comments/admin-review-comments';
import { Clientlogout } from './component/clientlogout/clientlogout';

export const routes: Routes = [
  // Routes for pages without the admin sidebar
  { path: '', component: Adminloginpage },
  { path: 'logincode', component: Logincode },
  // { path: 'userhome', component: Userlandingpage },
  { path: 'adminlogin', component: Adminloginpage },
  { path: 'userlogin', component: Userloginpage },
  {path: 'clientlogout', component: Clientlogout},

  // A parent route for the admin layout
  {
    path: 'admindashboard',
    component: Adminlayout, // The layout component provides the sidebar and router-outlet
    children: [
      { path: '', component: Admindashboard }, // This is the main dashboard content
      { path: 'newclient', component: Newclientalbumform },
      { path: 'newclient/:id', component: Newclientalbumform },
      { path: 'uploadpictures/:id', component: Uploadalbumpics },
      { path: 'adminactions/:id', component: Adminactionshome },
      {path: 'download/:id',component:AdminDownloadSelection},
      {path: 'comments/:id',component:AdminReviewComments},
      
    ],
  },

  // A parent route for the admin layout
  {
    path: 'userhome',
    component: Userlandingpage, // The layout component provides the sidebar and router-outlet
    children: [
      // { path: '', component: Albumstratpage }, // This is the main dashboard content
      { path: 'startpage', component: Albumstratpage },
      { path: 'albumname', component: AlbumName },
      { path: 'gallery', component: Imagegallery },
      { path: 'framepicture', component: Framepicturecomponent },
      {path : 'coverpicture', component: CoverpcitureSelection},
      {path : 'submitform', component: Useralbumsubmitform},
    ],
  },

  // Redirect any unknown paths or the root to the admin login (or your default landing page)
  { path: '**', redirectTo: 'adminlogin' },
];
