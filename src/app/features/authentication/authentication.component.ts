import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginService } from '../../core/services/LoginService/login-service.service';
import { Router } from '@angular/router';
import { User } from '../../core/models/login.model';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css',
})
export default class AuthenticationComponent {
  error: string = '';

  private loginService = inject(LoginService);
  private router = inject(Router);
  private formBuild = inject(FormBuilder);

  public formLogin: FormGroup = this.formBuild.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  logIn() {
    if (this.formLogin.invalid) {
      this.error = 'Por favor completa todos los campos correctamente';
      return;
    }

    const login: User = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password,
    };

    this.loginService.login(login).subscribe({
      next: (response) => {
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.error = '';
          this.router.navigate(['dashboard']);
        } else {
          this.error = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        if (error.status === 401) {
          this.error = 'Email o contraseña incorrectos';
        } else if (error.status === 400) {
          this.error = 'Datos inválidos. Verifica el formato del email';
        } else {
          this.error =
            error.error?.message || 'Error al conectar con el servidor';
        }
      },
    });
  }
}
