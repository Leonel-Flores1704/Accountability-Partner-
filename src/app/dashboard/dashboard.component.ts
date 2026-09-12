import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserApiService, UserPayload } from '../services/user-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private userApi = inject(UserApiService);
  
  currentUser: any = null;
  users: any[] = [];

  ngOnInit() {
    // 1. Proteger la ruta: Verificar si el usuario inició sesión
    const userStr = localStorage.getItem('user');
    if (!userStr || !localStorage.getItem('auth_token')) {
      this.router.navigate(['/login']);
      return;
    }
    
    // 2. Guardar los datos del usuario logueado (para saber si es Admin)
    this.currentUser = JSON.parse(userStr);
    
    // 3. Cargar la lista de usuarios
    this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await this.userApi.list();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire('Error', UserApiService.errorMessage(error), 'error');
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  async createUser() {
    const result = await Swal.fire({
      title: 'Nuevo usuario',
      html: `
        <input id="new-user-name" class="swal2-input" placeholder="Nombre">
        <input id="new-user-email" class="swal2-input" type="email" placeholder="Correo electrónico">
        <input id="new-user-password" class="swal2-input" type="password" placeholder="Contraseña (mínimo 8 caracteres)">
        <select id="new-user-role" class="swal2-select">
          <option value="2">Usuario</option>
          <option value="1">Administrador</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear usuario',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const popup = Swal.getPopup();
        const value = (id: string) => (popup?.querySelector(id) as HTMLInputElement | null)?.value.trim() ?? '';
        const name = value('#new-user-name');
        const email = value('#new-user-email');
        const password = value('#new-user-password');
        const roleId = Number(value('#new-user-role'));

        if (!name || !email || !password) {
          Swal.showValidationMessage('Completa todos los campos.');
          return;
        }
        if (password.length < 8) {
          Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres.');
          return;
        }
        return { name, email, password, role_id: roleId } as UserPayload;
      }
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await this.userApi.create(result.value);
      await Swal.fire('Usuario creado', 'El usuario fue registrado correctamente.', 'success');
      await this.loadUsers();
    } catch (error) {
      Swal.fire('Error', UserApiService.errorMessage(error), 'error');
    }
  }

  // Métodos vacíos por ahora para el CRUD
  editUser(user: any) {
    console.log('Editar usuario', user);
  }

  deleteUser(userId: number) {
    console.log('Eliminar usuario con ID:', userId);
  }
}
