import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  error = '';
  message = '';

  profileForm = this.fb.group({ name: [this.auth.session()?.name || '', Validators.required] });
  passwordForm = this.fb.group({ currentPassword: ['', Validators.required], newPassword: ['', Validators.required] });

  constructor(private fb: FormBuilder, private api: ApiService, public auth: AuthService) {}

  updateProfile(): void {
    this.error = '';
    this.message = '';
    this.api.updateMyProfile(this.profileForm.getRawValue() as any).subscribe({
      next: () => this.message = 'Perfil actualizado. Inicia sesión nuevamente para ver el nombre actualizado en el token.',
      error: err => this.error = err.message
    });
  }

  changePassword(): void {
    this.error = '';
    this.message = '';
    this.api.changePassword(this.passwordForm.getRawValue() as any).subscribe({
      next: () => { this.message = 'Contraseña actualizada correctamente'; this.passwordForm.reset(); },
      error: err => this.error = err.message
    });
  }
}
