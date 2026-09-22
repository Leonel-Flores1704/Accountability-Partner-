import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  private router = inject(Router);
  private userApi = inject(UserApiService);

  credentials = {
    name: '',
    email: '',
    password: ''
  };

  async onRegister() {
    if (!this.credentials.name || !this.credentials.email || !this.credentials.password) {
      Swal.fire('Atención', 'Por favor, llena todos los campos', 'warning');
      return;
    }

    try {
      const register = await this.userApi.register(
        this.credentials.name,
        this.credentials.email,
        this.credentials.password
      );

      localStorage.setItem('user', JSON.stringify(register.user));
      localStorage.setItem('auth_token', register.token || 'token-generico');
      await Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: `Hello ${register.user.name}`,
        showConfirmButton: false,
        timer: 1500
      });

      await this.router.navigate(['/user-home']);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration failed',
        text: UserApiService.errorMessage(error),
        background: '#1f2937',
        color: '#fff'
      });
    }
  }
}
