import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'inicio', redirectTo: '', pathMatch: 'full' },
  { path: 'catalog', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'branches', canActivate: [authGuard, permissionGuard], data: { permissions: ['READ_ALL_BRANCHES'], blockedRoles: ['CUSTOMER'] }, loadComponent: () => import('./features/branches/branches.component').then(m => m.BranchesComponent) },
  { path: 'categories', canActivate: [authGuard, permissionGuard], data: { permissions: ['READ_ALL_CATEGORIES'], blockedRoles: ['CUSTOMER'] }, loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
  { path: 'products', canActivate: [authGuard, permissionGuard], data: { permissions: ['READ_ALL_PRODUCTS'], blockedRoles: ['CUSTOMER'] }, loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
  { path: 'inventory', canActivate: [authGuard, permissionGuard], data: { permissions: ['READ_INVENTORY', 'READ_BRANCH_INVENTORY'], blockedRoles: ['CUSTOMER'] }, loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent) },
  { path: 'users', canActivate: [authGuard, permissionGuard], data: { permissions: ['READ_ALL_USERS'], blockedRoles: ['CUSTOMER'] }, loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent) },
  { path: 'sales', canActivate: [authGuard, permissionGuard], data: { permissions: ['READ_ALL_SALES', 'READ_BRANCH_SALES', 'READ_MY_SALES'] }, loadComponent: () => import('./features/sales/sales.component').then(m => m.SalesComponent) },
  { path: '**', redirectTo: '' }
];
