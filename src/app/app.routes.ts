import { Routes } from '@angular/router';
import { Logincode } from './component/logincode/logincode';
import { Userlandingpage } from './component/userlandingpage/userlandingpage';
import { Adminloginpage } from './component/adminloginpage/adminloginpage';
import { Userloginpage } from './component/userloginpage/userloginpage';
import { Admindashboard } from './component/admindashboard/admindashboard';
import { Newclientalbumform } from './component/newclientalbumform/newclientalbumform';

export const routes: Routes = [
  { path: 'logincode', component: Logincode },
  { path: 'userhome', component: Userlandingpage },
  { path: 'adminlogin', component: Adminloginpage },
  { path: 'userlogin', component: Userloginpage },
  { path: 'admindashboard', component: Admindashboard },
  { path: 'newclient/:id', component: Newclientalbumform },
  { path: 'newclient', component: Newclientalbumform },
];
