import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchInventoryResponse, BranchResponse, ProductResponse } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type StockFilter = 'ALL' | 'LOW' | 'OUT' | 'AVAILABLE';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  inventory: BranchInventoryResponse[] = [];
  branches: BranchResponse[] = [];
  products: ProductResponse[] = [];
  error = '';
  message = '';
  searchTerm = '';
  branchFilter: number | 'ALL' = 'ALL';
  productFilter: number | 'ALL' = 'ALL';
  stockFilter: StockFilter = 'ALL';
  currentView = 'Todo';

  form = this.fb.group({ branchId: [null as number | null, Validators.required], productId: [null as number | null, Validators.required], stock: [0, [Validators.required, Validators.min(0)]] });

  constructor(private fb: FormBuilder, private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.refresh();
    this.api.getBranches().subscribe({ next: data => this.branches = data, error: err => this.error = err.message });
    this.api.getProducts().subscribe({ next: data => this.products = data, error: err => this.error = err.message });
  }

  get canReadAllInventory(): boolean {
    return this.auth.hasPermission('READ_INVENTORY');
  }

  get canReadBranchInventory(): boolean {
    return this.auth.hasPermission('READ_BRANCH_INVENTORY') && !this.auth.hasRole('ADMIN');
  }

  get canViewLowStock(): boolean {
    return this.auth.hasAnyPermission(['READ_INVENTORY', 'READ_BRANCH_INVENTORY']);
  }

  get filteredInventory(): BranchInventoryResponse[] {
    const term = this.normalize(this.searchTerm);
    return this.inventory.filter(item => {
      const matchesTerm = !term || [item.idInventory, item.branchName, item.productName, item.stock]
        .some(value => this.normalize(value).includes(term));
      const matchesBranch = this.branchFilter === 'ALL' || item.branchId === Number(this.branchFilter);
      const matchesProduct = this.productFilter === 'ALL' || item.productId === Number(this.productFilter);
      const matchesStock = this.stockFilter === 'ALL'
        || (this.stockFilter === 'LOW' && item.stock > 0 && item.stock < 10)
        || (this.stockFilter === 'OUT' && item.stock <= 0)
        || (this.stockFilter === 'AVAILABLE' && item.stock > 0);
      return matchesTerm && matchesBranch && matchesProduct && matchesStock;
    });
  }

  get totalStock(): number { return this.inventory.reduce((sum, item) => sum + item.stock, 0); }
  get lowStockCount(): number { return this.inventory.filter(item => item.stock > 0 && item.stock < 10).length; }
  get outStockCount(): number { return this.inventory.filter(item => item.stock <= 0).length; }

  loadAll(): void {
    this.currentView = 'Todo el inventario';
    this.clearAlerts();
    this.api.getInventory().subscribe({ next: data => this.inventory = data, error: err => this.error = err.message });
  }

  loadMyBranch(): void {
    this.currentView = 'Mi sucursal';
    this.clearAlerts();
    this.api.getMyBranchInventory().subscribe({ next: data => this.inventory = data, error: err => this.error = err.message });
  }

  loadLowStock(): void {
    this.currentView = this.canReadAllInventory ? 'Stock bajo global' : 'Stock bajo de mi sucursal';
    this.clearAlerts();

    if (this.canReadAllInventory) {
      this.api.getLowStock(10).subscribe({
        next: data => this.inventory = data,
        error: err => this.error = err.message
      });
      return;
    }

    this.api.getMyBranchInventory().subscribe({
      next: data => this.inventory = data.filter(item => item.stock < 10),
      error: err => this.error = err.message
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.clearAlerts();
    this.api.createInventory(this.form.getRawValue() as any).subscribe({
      next: () => { this.message = 'Inventario creado correctamente'; this.form.reset({ branchId: null, productId: null, stock: 0 }); this.refresh(); },
      error: err => this.error = err.message
    });
  }

  updateStock(idInventory: number, stock: number): void {
    this.clearAlerts();
    this.api.updateStock(idInventory, { stock }).subscribe({
      next: () => { this.message = 'Stock actualizado'; this.refresh(); },
      error: err => this.error = err.message
    });
  }

  refresh(): void {
    if (this.canReadAllInventory) {
      this.loadAll();
      return;
    }

    this.loadMyBranch();
  }
  clearFilters(): void { this.searchTerm = ''; this.branchFilter = 'ALL'; this.productFilter = 'ALL'; this.stockFilter = 'ALL'; }
  private clearAlerts(): void { this.error = ''; this.message = ''; }
  private normalize(value: unknown): string { return String(value ?? '').toLowerCase().trim(); }
}
