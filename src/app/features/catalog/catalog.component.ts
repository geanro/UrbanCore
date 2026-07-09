import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogProductResponse, CategoryResponse } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  products: CatalogProductResponse[] = [];
  categories: CategoryResponse[] = [];
  search = '';
  selectedCategoryId: number | 'ALL' = 'ALL';
  onlyAvailable = false;
  queryCategory = '';
  error = '';

  constructor(private api: ApiService, public cart: CartService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.load();
    this.api.getCatalogCategories().subscribe({ next: data => this.categories = data });
    this.route.queryParamMap.subscribe(params => {
      this.queryCategory = params.get('category') || '';
      this.selectedCategoryId = 'ALL';
    });
  }

  get filteredProducts(): CatalogProductResponse[] {
    const term = this.normalize(this.search);
    return this.products.filter(product => {
      const matchesTerm = !term || [product.name, product.description, product.categoryName]
        .some(value => this.normalize(value).includes(term));
      const matchesCategory = this.selectedCategoryId === 'ALL' || product.categoryId === Number(this.selectedCategoryId);
      const matchesQueryCategory = !this.queryCategory || this.normalize(product.categoryName).includes(this.normalize(this.queryCategory));
      const matchesAvailable = !this.onlyAvailable || (product.availableStock ?? 0) > 0;
      return matchesTerm && matchesCategory && matchesQueryCategory && matchesAvailable;
    });
  }

  load(): void {
    this.error = '';
    this.api.getCatalogProducts().subscribe({ next: data => this.products = data, error: err => this.error = err.message });
  }

  searchProducts(): void { /* Filtro instantáneo en cliente */ }
  clearFilters(): void { this.search = ''; this.selectedCategoryId = 'ALL'; this.queryCategory = ''; this.onlyAvailable = false; }
  private normalize(value: unknown): string { return String(value ?? '').toLowerCase().trim(); }
}
