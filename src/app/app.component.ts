import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public auth: AuthService, public cart: CartService) {}

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  canAny(permissions: string[]): boolean {
    return this.auth.hasAnyPermission(permissions);
  }

  logout(): void {
    this.auth.logout();
  }
}
