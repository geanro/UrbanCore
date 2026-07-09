import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BranchInventoryResponse,
  BranchResponse,
  ProductResponse,
  SaleResponse,
  SaleStatus,
  UserResponse
} from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {

  sales: SaleResponse[] = [];
  products: ProductResponse[] = [];
  branches: BranchResponse[] = [];

  error = '';
  message = '';

  searchTerm = '';
  statusFilter: SaleStatus | 'ALL' = 'ALL';
  branchFilter: number | 'ALL' = 'ALL';
  startDate = '';
  endDate = '';

  currentView = 'Ventas';

  assignedBranchId: number | null = null;
  assignedBranchName = '';

  statuses: SaleStatus[] = ['COMPLETED', 'CANCELLED', 'PENDING'];

  form = this.fb.group({
    branchId: [null as number | null, Validators.required],
    details: this.fb.array([])
  });

  constructor(
      private fb: FormBuilder,
      private api: ApiService,
      public auth: AuthService
  ) {}

  get details(): FormArray {
    return this.form.controls.details as FormArray;
  }

  get isBranchLocked(): boolean {
    return this.auth.hasRole('SUPERVISOR') || this.auth.hasRole('SELLER');
  }

  get canCreateSale(): boolean {
    return this.auth.hasPermission('CREATE_ONE_SALE') && !this.auth.hasRole('CUSTOMER');
  }

  filteredProductsFor(index: number): ProductResponse[] {
    const detail = this.details.at(index);
    const searchValue = detail.get('productSearch')?.value;
    const selectedProductId = detail.get('productId')?.value;

    const term = this.normalize(searchValue);

    return this.products.filter(product => {
      const isSelected = product.idProduct === Number(selectedProductId);

      const matchesSearch =
          !term ||
          this.normalize(product.name).includes(term) ||
          this.normalize(product.description).includes(term) ||
          this.normalize(product.categoryName).includes(term) ||
          this.normalize(product.idProduct).includes(term);

      return product.active && (matchesSearch || isSelected);
    });
  }

  get filteredSales(): SaleResponse[] {
    const term = this.normalize(this.searchTerm);

    return this.sales.filter(sale => {
      const matchesTerm =
          !term ||
          [
            sale.idSale,
            sale.userName,
            sale.branchName,
            sale.total,
            sale.status,
            sale.saleDate
          ].some(value => this.normalize(value).includes(term)) ||
          sale.details.some(detail => this.normalize(detail.productName).includes(term));

      const matchesStatus =
          this.statusFilter === 'ALL' || sale.status === this.statusFilter;

      const matchesBranch =
          this.branchFilter === 'ALL' || sale.branchId === Number(this.branchFilter);

      const saleDate = new Date(sale.saleDate).getTime();

      const matchesStart =
          !this.startDate || saleDate >= new Date(this.startDate + 'T00:00:00').getTime();

      const matchesEnd =
          !this.endDate || saleDate <= new Date(this.endDate + 'T23:59:59').getTime();

      return matchesTerm && matchesStatus && matchesBranch && matchesStart && matchesEnd;
    });
  }

  get totalAmount(): number {
    return this.filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  }

  get completedCount(): number {
    return this.sales.filter(sale => sale.status === 'COMPLETED').length;
  }

  get cancelledCount(): number {
    return this.sales.filter(sale => sale.status === 'CANCELLED').length;
  }

  ngOnInit(): void {
    if (this.canCreateSale) {
      this.addDetail();
      this.loadProductsForSale();

      if (this.isBranchLocked) {
        this.loadAssignedBranch();
      } else {
        this.loadBranches();
      }
    } else if (!this.auth.hasRole('CUSTOMER') && this.auth.hasPermission('READ_ALL_SALES')) {
      this.loadBranches();
    }

    this.refreshSales();
  }

  private loadProductsForSale(): void {
    this.api.getProducts().subscribe({
      next: data => {
        this.products = data;
      },
      error: err => {
        this.error = err.error?.message || 'No se pudieron cargar los productos.';
      }
    });
  }

  private loadBranches(): void {
    this.api.getBranches().subscribe({
      next: data => {
        this.branches = data;
      },
      error: err => {
        this.error = err.error?.message || 'No se pudieron cargar las sucursales.';
      }
    });
  }

  private loadAssignedBranch(): void {
    this.api.getMyProfile().subscribe({
      next: (user: UserResponse) => {
        this.setAssignedBranch(user.branchId ?? null, user.branchName ?? '');
      },
      error: () => {
        this.loadAssignedBranchFromInventory();
      }
    });
  }

  private loadAssignedBranchFromInventory(): void {
    this.api.getMyBranchInventory().subscribe({
      next: (inventory: BranchInventoryResponse[]) => {
        if (inventory.length > 0) {
          this.setAssignedBranch(inventory[0].branchId, inventory[0].branchName);
          return;
        }

        this.loadAssignedBranchFromSales();
      },
      error: () => {
        this.loadAssignedBranchFromSales();
      }
    });
  }

  private loadAssignedBranchFromSales(): void {
    this.api.getMyBranchSales().subscribe({
      next: (sales: SaleResponse[]) => {
        if (sales.length > 0) {
          this.setAssignedBranch(sales[0].branchId, sales[0].branchName);
          return;
        }

        this.error = 'No se pudo detectar tu sucursal asignada. Verifica que tu usuario tenga sucursal.';
      },
      error: () => {
        this.error = 'No se pudo detectar tu sucursal asignada. Verifica que tu usuario tenga sucursal asignada.';
      }
    });
  }

  private setAssignedBranch(idBranch: number | null, branchName: string): void {
    if (!idBranch) {
      this.error = 'Tu usuario no tiene una sucursal asignada.';
      return;
    }

    this.assignedBranchId = idBranch;
    this.assignedBranchName = branchName || 'Mi sucursal';

    this.branches = [
      {
        idBranch,
        name: this.assignedBranchName,
        address: '',
        phone: '',
        active: true
      }
    ];

    this.form.patchValue({
      branchId: idBranch
    });

    this.form.controls.branchId.disable();
  }

  refreshSales(): void {
    if (this.auth.hasPermission('READ_ALL_SALES')) {
      this.loadAll();
      return;
    }

    if (this.auth.hasPermission('READ_BRANCH_SALES')) {
      this.loadMyBranch();
      return;
    }

    this.loadMine();
  }

  loadAll(): void {
    this.currentView = 'Todas';
    this.clearAlerts();

    this.api.getSales().subscribe({
      next: data => {
        this.sales = data;
      },
      error: err => {
        this.error = err.error?.message || err.message || 'No se pudieron cargar las ventas.';
      }
    });
  }

  loadMyBranch(): void {
    this.currentView = 'Mi sucursal';
    this.clearAlerts();

    this.api.getMyBranchSales().subscribe({
      next: data => {
        this.sales = data;
      },
      error: err => {
        this.error = err.error?.message || err.message || 'No se pudieron cargar las ventas de la sucursal.';
      }
    });
  }

  loadMine(): void {
    this.currentView = this.auth.hasRole('CUSTOMER') ? 'Mis compras' : 'Mis ventas';
    this.clearAlerts();

    this.api.getMySales().subscribe({
      next: data => {
        this.sales = data;
      },
      error: err => {
        this.error = err.error?.message || err.message || 'No se pudieron cargar tus ventas.';
      }
    });
  }

  addDetail(): void {
    this.details.push(
        this.fb.group({
          productId: [null as number | null, Validators.required],
          quantity: [1, [Validators.required, Validators.min(1)]],
          productSearch: ['']
        })
    );
  }

  removeDetail(index: number): void {
    if (this.details.length > 1) {
      this.details.removeAt(index);
    }
  }

  save(): void {
    this.clearAlerts();

    if (this.isBranchLocked && !this.assignedBranchId) {
      this.error = 'No se detectó tu sucursal asignada. No puedes crear ventas.';
      return;
    }

    if (this.form.invalid) {
      this.error = 'Completa la sucursal, producto y cantidad antes de crear la venta.';
      return;
    }

    const rawBody = this.form.getRawValue() as any;

    const body = {
      branchId: this.isBranchLocked ? this.assignedBranchId : rawBody.branchId,
      details: rawBody.details.map((detail: any) => ({
        productId: detail.productId,
        quantity: detail.quantity
      }))
    };

    this.api.createSale(body).subscribe({
      next: () => {
        this.message = 'Venta creada correctamente';
        this.resetSaleForm();
        this.refreshSales();
      },
      error: err => {
        this.error = err.error?.message || err.message || 'No se pudo crear la venta.';
      }
    });
  }

  cancel(idSale: number): void {
    if (!confirm('¿Cancelar venta?')) {
      return;
    }

    this.clearAlerts();

    this.api.cancelSale(idSale).subscribe({
      next: () => {
        this.message = 'Venta cancelada';
        this.refreshSales();
      },
      error: err => {
        this.error = err.error?.message || err.message || 'No se pudo cancelar la venta.';
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.branchFilter = 'ALL';
    this.startDate = '';
    this.endDate = '';
  }

  private resetSaleForm(): void {
    const branchId = this.isBranchLocked ? this.assignedBranchId : null;

    this.form.reset({
      branchId
    });

    this.details.clear();
    this.addDetail();

    if (this.isBranchLocked) {
      this.form.controls.branchId.disable();
    } else {
      this.form.controls.branchId.enable();
    }
  }

  private clearAlerts(): void {
    this.error = '';
    this.message = '';
  }

  private normalize(value: unknown): string {
    return String(value ?? '').toLowerCase().trim();
  }
}