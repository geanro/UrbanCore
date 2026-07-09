import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryResponse, ProductResponse } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: ProductResponse[] = [];
  categories: CategoryResponse[] = [];
  editingId: number | null = null;
  error = '';
  message = '';
  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';
  categoryFilter: number | 'ALL' = 'ALL';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    active: [true],
    imageUrl: [''],
    categoryId: [null as number | null, Validators.required]
  });

  constructor(private fb: FormBuilder, private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void { this.load(); this.loadCategories(); }

  get canManageProducts(): boolean { return this.auth.hasRole('ADMIN'); }

  get filteredProducts(): ProductResponse[] {
    const term = this.normalize(this.searchTerm);
    return this.products.filter(product => {
      const matchesTerm = !term || [product.idProduct, product.name, product.description, product.categoryName]
        .some(value => this.normalize(value).includes(term));
      const matchesStatus = this.statusFilter === 'ALL'
        || (this.statusFilter === 'ACTIVE' && product.active)
        || (this.statusFilter === 'INACTIVE' && !product.active);
      const matchesCategory = this.categoryFilter === 'ALL' || product.categoryId === Number(this.categoryFilter);
      const matchesMin = this.minPrice === null || this.minPrice === undefined || product.price >= this.minPrice;
      const matchesMax = this.maxPrice === null || this.maxPrice === undefined || product.price <= this.maxPrice;
      return matchesTerm && matchesStatus && matchesCategory && matchesMin && matchesMax;
    });
  }

  get activeCount(): number { return this.products.filter(product => product.active).length; }
  get averagePrice(): number { return this.products.length ? this.products.reduce((sum, product) => sum + Number(product.price), 0) / this.products.length : 0; }

  load(): void {
    this.clearAlerts();
    this.api.getProducts().subscribe({ next: data => this.products = data, error: err => this.error = err.message });
  }

  loadCategories(): void { this.api.getCategories().subscribe({ next: data => this.categories = data, error: err => this.error = err.message }); }

  save(): void {
    if (!this.canManageProducts) { this.error = 'Solo ADMIN puede crear o actualizar productos.'; return; }
    if (this.form.invalid) return;
    this.clearAlerts();
    const body = this.form.getRawValue() as any;
    const request = this.editingId ? this.api.updateProduct(this.editingId, body) : this.api.createProduct(body);
    request.subscribe({
      next: () => { this.message = 'Modelo guardado correctamente'; this.reset(); this.load(); },
      error: err => this.error = err.message
    });
  }

  edit(product: ProductResponse): void {
    if (!this.canManageProducts) return;
    this.editingId = product.idProduct;
    this.form.patchValue({ name: product.name, description: product.description || '', price: product.price, active: product.active, imageUrl: product.imageUrl || '', categoryId: product.categoryId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(idProduct: number): void {
    if (!this.canManageProducts) { this.error = 'Solo ADMIN puede desactivar productos.'; return; }
    if (!confirm('¿Desactivar modelo?')) return;
    this.clearAlerts();
    this.api.deleteProduct(idProduct).subscribe({ next: () => { this.message = 'Modelo desactivado'; this.load(); }, error: err => this.error = err.message });
  }

  reset(): void { this.editingId = null; this.form.reset({ name: '', description: '', price: 0, active: true, imageUrl: '', categoryId: null }); }
  clearFilters(): void { this.searchTerm = ''; this.statusFilter = 'ALL'; this.categoryFilter = 'ALL'; this.minPrice = null; this.maxPrice = null; }
  private clearAlerts(): void { this.error = ''; this.message = ''; }
  private normalize(value: unknown): string { return String(value ?? '').toLowerCase().trim(); }
}
