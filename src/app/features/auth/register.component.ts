import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  loading = false;
  error = '';
  message = '';

  form = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';
    this.message = '';

    this.auth.register({
      name: this.form.value.name!,
      username: this.form.value.username!,
      password: this.form.value.password!
    }).subscribe({
      next: () => {
        this.message = 'Cuenta creada correctamente. Ahora inicia sesión.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: err => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
