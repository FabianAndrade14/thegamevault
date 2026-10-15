import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',

    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.Login)
  },

  {
    path: 'dashboard',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.Dashboard)
  },

  {
    path: 'search',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./features/search/search.component')
        .then(m => m.SearchComponent)
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];