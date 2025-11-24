import {Routes} from '@angular/router';
import DashboardComponent from './features/dashboard/dashboard.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    loadComponent: () => import('./features/home/home.component')
  },
  {
    path: 'enterprise',
    title: 'Enterprise',
    loadComponent: () => import('./features/enterprise/enterprise.component')
  },
  {
    path: 'products',
    title: 'Products',
    loadComponent: () => import('./features/products/products.component')
  },
  {
    path: 'events',
    title: 'Events',
    loadComponent: () => import('./features/events/events.component')
  },
  {
    path: 'contact',
    title: 'Contact',
    loadComponent: () => import('./features/contact/contact.component')
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/authentication/authentication.component'),
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component'),
    canActivate: [authGuard],
    children: [
      {
        path: 'customers',
        title: 'Customers',
        loadComponent: () => import('./features/dashboard/customers/customers.component'),
        canActivate: [authGuard],
      },
      {
        path: 'list-products',
        children: [
          {
            path: '',
            title: 'List Products',
            loadComponent: () => import('./features/dashboard/list-products/list-products.component'),
            canActivate: [authGuard],
          },
          {
            path: 'new',
            title: 'New Product',
            loadComponent: () => import('./features/dashboard/list-products/form/form-products.component'),
            canActivate: [authGuard],
          },
          {
            path: 'line',
            title: 'Product Lines',
            loadComponent: () => import('./features/dashboard/list-products/line/line-products.component'),
            canActivate: [authGuard],
          }
        ]
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            title: 'List',
            loadComponent: () => import('./features/dashboard/order/list/list.component'),
            canActivate: [authGuard],
          },
          {
            path: 'new',
            title: 'New-Order',
            loadComponent: () => import('./features/dashboard/order/form/form.component'),
            canActivate: [authGuard],
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
