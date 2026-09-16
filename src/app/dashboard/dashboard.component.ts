import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { User, UserApiService, UserPayload, UserUpdatePayload } from '../services/user-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private userApi = inject(UserApiService);
  
  currentUser: User | null = null;
  users: User[] = [];

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (!userStr || !localStorage.getItem('auth_token')) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUser = JSON.parse(userStr) as User;
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response = await this.userApi.list();
      this.users = Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire({ 
        title: 'Error', 
        text: 'No se pudieron cargar los usuarios', 
        icon: 'error', 
        heightAuto: false 
      });
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  get isAdmin(): boolean {
    return this.currentUser?.role_id === 1;
  }

  async createUser() {
    const result = await Swal.fire({
      title: 'Nuevo usuario',
      heightAuto: false,
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
        if (roleId !== 1 && roleId !== 2) {
          Swal.showValidationMessage('Selecciona un rol válido.');
          return;
        }
        return { name, email, password, role_id: roleId } as UserPayload;
      }
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await this.userApi.create(result.value);
      await Swal.fire({ 
        title: 'Usuario creado', 
        text: 'El usuario fue registrado correctamente.', 
        icon: 'success', 
        heightAuto: false 
      });
      await this.loadUsers();
    } catch (error) {
      Swal.fire({ 
        title: 'Error', 
        text: UserApiService.errorMessage(error), 
        icon: 'error', 
        heightAuto: false 
      });
    }
  }

  async editUser(user: User): Promise<void> {
    const result = await Swal.fire({
      title: 'Editar usuario',
      heightAuto: false,
      html: `
        <input id="edit-user-name" class="swal2-input" placeholder="Nombre" value="${this.escapeHtml(user.name)}">
        <input id="edit-user-email" class="swal2-input" type="email" placeholder="Correo electrónico" value="${this.escapeHtml(user.email)}">
        <input id="edit-user-password" class="swal2-input" type="password" placeholder="Nueva contraseña (opcional)">
        <select id="edit-user-role" class="swal2-select">
          <option value="2" ${user.role_id === 2 ? 'selected' : ''}>Usuario</option>
          <option value="1" ${user.role_id === 1 ? 'selected' : ''}>Administrador</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const popup = Swal.getPopup();
        const value = (id: string) => (popup?.querySelector(id) as HTMLInputElement | null)?.value.trim() ?? '';
        const name = value('#edit-user-name');
        const email = value('#edit-user-email');
        const password = value('#edit-user-password');
        const roleId = Number(value('#edit-user-role'));

        if (!name || !email) {
          Swal.showValidationMessage('Nombre y correo son obligatorios.');
          return;
        }
        if (password && password.length < 8) {
          Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres.');
          return;
        }
        if (roleId !== 1 && roleId !== 2) {
          Swal.showValidationMessage('Selecciona un rol válido.');
          return;
        }

        const payload: UserUpdatePayload = { name, email, role_id: roleId };
        if (password) payload.password = password;
        return payload;
      }
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await this.userApi.update(user.id, result.value);
      await Swal.fire({ 
        title: 'Usuario actualizado', 
        text: 'Los cambios se guardaron correctamente.', 
        icon: 'success', 
        heightAuto: false 
      });
      await this.loadUsers();
    } catch (error) {
      Swal.fire({ 
        title: 'Error', 
        text: UserApiService.errorMessage(error), 
        icon: 'error', 
        heightAuto: false 
      });
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al usuario y no se puede deshacer.',
      icon: 'warning',
      heightAuto: false,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await this.userApi.delete(userId);
      await Swal.fire({ 
        title: 'Usuario eliminado', 
        text: 'El usuario fue eliminado correctamente.', 
        icon: 'success', 
        heightAuto: false 
      });
      await this.loadUsers();
    } catch (error) {
      Swal.fire({ 
        title: 'Error', 
        text: UserApiService.errorMessage(error), 
        icon: 'error', 
        heightAuto: false 
      });
    }
  }

  private escapeHtml(value: string): string {
    const element = document.createElement('div');
    element.textContent = value;
    return element.innerHTML;
  }
}