import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { TestComponent } from './pages/test/test';
import { ResultComponent } from './pages/result/result';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'test',
    component: TestComponent,
    canActivate: [authGuard]
  },
  {
    path: 'result',
    component: ResultComponent,
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: '/home' }
];