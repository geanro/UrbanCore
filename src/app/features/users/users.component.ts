import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchResponse, Role, UserResponse } from '../../core/models';
import { ApiService } from '../../core/services/api.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: UserResponse[] = [];
  branches: BranchResponse[] = [];
  editingId: number | null = null;
  error = '';
  message = '';
  searchTerm = '';
  roleFilter: Role | 'ALL' = 'ALL';
  branchFilter: number | 'ALL' = 'ALL';
  statusFilter: StatusFilter = 'ALL';

  roles: Role[] = ['ADMIN', 'SUPERVISOR', 'SELLER', 'CUSTOMER'];

  form = this.fb.group({ name: ['', Validators.required], username: ['', Validators.required], password: ['', Validators.required], role: ['SELLER' as Role, Validators.required], active: [true], branchId: [null as number | null] });

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void { this.load(); this.api.getBranches().subscribe({ next: data => this.branches = data, error: err => this.error = err.message }); }

  get filteredUsers(): UserResponse[] {
    const term = this.normalize(this.searchTerm);
    return this.users.filter(user => {
      const matchesTerm = !term || [user.idUser, user.name, user.username, user.role, user.branchName]
        .some(value => this.normalize(value).includes(term));
      const matchesRole = this.roleFilter === 'ALL' || user.role === this.roleFilter;
      const matchesBranch = this.branchFilter === 'ALL' || user.branchId === Number(this.branchFilter);
      const matchesStatus = this.statusFilter === 'ALL'
        || (this.statusFilter === 'ACTIVE' && user.active)
        || (this.statusFilter === 'INACTIVE' && !user.active);
      return matchesTerm && matchesRole && matchesBranch && matchesStatus;
    });
  }

  get activeCount(): number { return this.users.filter(user => user.active).length; }
  get internalCount(): number { return this.users.filter(user => user.role !== 'CUSTOMER').length; }

  load(): void { this.clearAlerts(); this.api.getUsers().subscribe({ next: data => this.users = data, error: err => this.error = err.message }); }

  save(): void {
    if (this.form.invalid) return;
    this.clearAlerts();
    const raw = this.form.getRawValue();
    const body: any = { name: raw.name, role: raw.role, active: raw.active, branchId: raw.branchId };
    const request = this.editingId ? this.api.updateUser(this.editingId, body) : this.api.createUser({ ...raw } as any);
    request.subscribe({ next: () => { this.message = 'Usuario guardado correctamente'; this.reset(); this.load(); }, error: err => this.error = err.message });
  }

  edit(user: UserResponse): void {
    this.editingId = user.idUser;
    this.form.patchValue({ name: user.name, username: user.username, password: '********', role: user.role, active: user.active, branchId: user.branchId ?? null });
    this.form.controls.password.disable();
    this.form.controls.username.disable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(idUser: number): void {
    if (!confirm('¿Desactivar usuario?')) return;
    this.clearAlerts();
    this.api.deleteUser(idUser).subscribe({ next: () => { this.message = 'Usuario desactivado'; this.load(); }, error: err => this.error = err.message });
  }

  reset(): void {
    this.editingId = null;
    this.form.controls.password.enable();
    this.form.controls.username.enable();
    this.form.reset({ name: '', username: '', password: '', role: 'SELLER', active: true, branchId: null });
  }

  clearFilters(): void { this.searchTerm = ''; this.roleFilter = 'ALL'; this.branchFilter = 'ALL'; this.statusFilter = 'ALL'; }
  private clearAlerts(): void { this.error = ''; this.message = ''; }
  private normalize(value: unknown): string { return String(value ?? '').toLowerCase().trim(); }
}
