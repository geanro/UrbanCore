import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryResponse } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: CategoryResponse[] = [];
  editingId: number | null = null;
  error = '';
  message = '';
  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';

  form = this.fb.group({ name: ['', Validators.required], description: [''], active: [true] });

  constructor(private fb: FormBuilder, private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  get canManageCategories(): boolean { return this.auth.hasRole('ADMIN'); }

  get filteredCategories(): CategoryResponse[] {
    const term = this.normalize(this.searchTerm);
    return this.categories.filter(category => {
      const matchesTerm = !term || [category.idCategory, category.name, category.description]
        .some(value => this.normalize(value).includes(term));
      const matchesStatus = this.statusFilter === 'ALL'
        || (this.statusFilter === 'ACTIVE' && category.active)
        || (this.statusFilter === 'INACTIVE' && !category.active);
      return matchesTerm && matchesStatus;
    });
  }

  get activeCount(): number { return this.categories.filter(category => category.active).length; }

  load(): void {
    this.clearAlerts();
    this.api.getCategories().subscribe({ next: data => this.categories = data, error: err => this.error = err.message });
  }

  save(): void {
    if (!this.canManageCategories) { this.error = 'Solo ADMIN puede crear o actualizar categorías.'; return; }
    if (this.form.invalid) return;
    this.clearAlerts();
    const body = this.form.getRawValue() as any;
    const request = this.editingId ? this.api.updateCategory(this.editingId, body) : this.api.createCategory(body);
    request.subscribe({
      next: () => { this.message = 'Categoría guardada correctamente'; this.reset(); this.load(); },
      error: err => this.error = err.message
    });
  }

  edit(category: CategoryResponse): void {
    if (!this.canManageCategories) return;
    this.editingId = category.idCategory;
    this.form.patchValue(category as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(idCategory: number): void {
    if (!this.canManageCategories) { this.error = 'Solo ADMIN puede desactivar categorías.'; return; }
    if (!confirm('¿Desactivar categoría?')) return;
    this.clearAlerts();
    this.api.deleteCategory(idCategory).subscribe({
      next: () => { this.message = 'Categoría desactivada'; this.load(); },
      error: err => this.error = err.message
    });
  }

  reset(): void { this.editingId = null; this.form.reset({ name: '', description: '', active: true }); }
  clearFilters(): void { this.searchTerm = ''; this.statusFilter = 'ALL'; }
  private clearAlerts(): void { this.error = ''; this.message = ''; }
  private normalize(value: unknown): string { return String(value ?? '').toLowerCase().trim(); }
}
