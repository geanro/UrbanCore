import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { BranchResponse } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  branches: BranchResponse[] = [];
  selectedBranchId: number | null = null;

  error = '';
  message = '';

  constructor(
      public cart: CartService,
      private api: ApiService,
      public auth: AuthService,
      private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && !this.auth.hasRole('CUSTOMER')) {
      this.router.navigate(['/sales']);
      return;
    }

    this.loadBranches();
  }

  loadBranches(): void {
    this.api.getCatalogBranches().subscribe({
      next: (data: BranchResponse[]) => {
        this.branches = data;

        if (data.length > 0) {
          this.selectedBranchId = data[0].idBranch;
        }
      },
      error: (err: any) => {
        this.error = err.error?.message || 'No se pudieron cargar las sucursales disponibles.';
      }
    });
  }

  checkout(): void {
    this.error = '';
    this.message = '';

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.auth.hasRole('CUSTOMER')) {
      this.router.navigate(['/sales']);
      return;
    }

    if (!this.selectedBranchId) {
      this.error = 'Selecciona una sucursal para confirmar la compra.';
      return;
    }

    const details = this.cart.items().map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    this.api.createSale({
      branchId: this.selectedBranchId,
      details
    }).subscribe({
      next: sale => {
        this.message = `Compra registrada correctamente. ID: ${sale.idSale}`;
        this.cart.clear();
      },
      error: err => {
        this.error = err.error?.message || 'No se pudo confirmar la compra.';
      }
    });
  }
}