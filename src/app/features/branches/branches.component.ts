import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchResponse } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit {
  branches: BranchResponse[] = [];
  editingId: number | null = null;
  error = '';
  message = '';
  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';

  form = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', Validators.required],
    active: [true]
  });

  constructor(private fb: FormBuilder, private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  get canManageBranches(): boolean { return this.auth.hasRole('ADMIN'); }

  get filteredBranches(): BranchResponse[] {
    const term = this.normalize(this.searchTerm);
    return this.branches.filter(branch => {
      const matchesTerm = !term || [branch.idBranch, branch.name, branch.address, branch.phone]
        .some(value => this.normalize(value).includes(term));
      const matchesStatus = this.statusFilter === 'ALL'
        || (this.statusFilter === 'ACTIVE' && branch.active)
        || (this.statusFilter === 'INACTIVE' && !branch.active);
      return matchesTerm && matchesStatus;
    });
  }

  get activeCount(): number { return this.branches.filter(branch => branch.active).length; }
  get inactiveCount(): number { return this.branches.length - this.activeCount; }

  load(): void {
    this.clearAlerts();
    this.api.getBranches().subscribe({
      next: data => this.branches = data,
      error: err => this.error = err.message
    });
  }

  save(): void {
    if (!this.canManageBranches) { this.error = 'Solo ADMIN puede crear o actualizar sucursales.'; return; }
    if (this.form.invalid) return;
    this.clearAlerts();

    const body = this.form.getRawValue() as any;
    const request = this.editingId ? this.api.updateBranch(this.editingId, body) : this.api.createBranch(body);

    request.subscribe({
      next: () => { this.message = 'Sucursal guardada correctamente'; this.reset(); this.load(); },
      error: err => this.error = err.message
    });
  }

  edit(branch: BranchResponse): void {
    if (!this.canManageBranches) return;
    this.editingId = branch.idBranch;
    this.form.patchValue(branch as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(idBranch: number): void {
    if (!this.canManageBranches) { this.error = 'Solo ADMIN puede desactivar sucursales.'; return; }
    if (!confirm('¿Desactivar sucursal?')) return;
    this.clearAlerts();

    this.api.deleteBranch(idBranch).subscribe({
      next: () => { this.message = 'Sucursal desactivada'; this.load(); },
      error: err => this.error = err.message
    });
  }

  reset(): void {
    this.editingId = null;
    this.form.reset({ name: '', address: '', phone: '', active: true });
  }

  clearFilters(): void { this.searchTerm = ''; this.statusFilter = 'ALL'; }
  private clearAlerts(): void { this.error = ''; this.message = ''; }
  private normalize(value: unknown): string { return String(value ?? '').toLowerCase().trim(); }
}
