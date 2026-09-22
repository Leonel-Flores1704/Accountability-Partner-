import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  private router = inject(Router);
  private userApi = inject(UserApiService);

  credentials = {
    email: '',
    password: ''
  };

  async onLogin() {
    if (!this.credentials.email || !this.credentials.password) {
      Swal.fire('Atención', 'Por favor, llena todos los campos', 'warning');
      return;
    }

    try {
      const login = await this.userApi.login(this.credentials.email, this.credentials.password);

      localStorage.setItem('user', JSON.stringify(login.user));
      localStorage.setItem('auth_token', login.token || 'token-generico');
      await Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: `Hello ${login.user.name}`,
        showConfirmButton: false,
        timer: 1500
      });

      await this.router.navigate(['/dashboard']);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Sign-in failed',
        text: UserApiService.errorMessage(error),
        background: '#1f2937',
        color: '#fff'
      });
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
