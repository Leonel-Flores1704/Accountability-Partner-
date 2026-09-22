import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import axios from 'axios';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  private API_URL = environment.apiUrl;

  users: any[] = [];
  searchTerm = '';

  showForm = false;
  isEditing = false;

  formData: any = {
    id: null,
    name: '',
    email: '',
    password: '',
    role_id: 2,
  };

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getUsers();
  }



  ionViewWillEnter() {
    this.getUsers();
  }
  get filteredUsers() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  get totalUsers() {
    return this.users.length;
  }

  get totalAdmins() {
    return this.users.filter((u) => u.role_id === 1).length;
  }

  get totalRegular() {
    return this.users.filter((u) => u.role_id === 2).length;
  }

async getUsers() {
  console.log('getUsers() llamado');
  try {
    const res = await axios.get(`${this.API_URL}?resource=users`);
    console.log('Respuesta recibida:', res.data);
    this.ngZone.run(() => {
      this.users = res.data.data;
      console.log('this.users actualizado:', this.users);
      this.cdr.detectChanges();
    });
  } catch (err) {
    console.error('Error al obtener usuarios', err);
  }
}

  openAddForm() {
    this.isEditing = false;
    this.formData = { id: null, name: '', email: '', password: '', role_id: 2 };
    this.showForm = true;
  }

  editUser(user: any) {
    this.isEditing = true;
    this.formData = { ...user, password: '' };
    this.showForm = true;
  }

  resetForm() {
    this.showForm = false;
    this.formData = { id: null, name: '', email: '', password: '', role_id: 2 };
  }

  async saveUser() {
    try {
      if (this.isEditing) {
        const payload = { ...this.formData };
        if (!payload.password) delete payload.password;
        await axios.patch(`${this.API_URL}?resource=users&id=${this.formData.id}`, payload);
      } else {
        await axios.post(`${this.API_URL}?resource=users`, this.formData);
      }
      this.showForm = false;
      await this.getUsers();
    } catch (err: any) {
      console.error('Error al guardar usuario', err.response?.data ?? err);
    }
  }

  async confirmDelete(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Seguro que quieres eliminar a <b>${user.name}</b>? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteUser(user.id),
        },
      ],
    });
    await alert.present();
  }

  async deleteUser(id: number) {
    try {
      await axios.delete(`${this.API_URL}?resource=users&id=${id}`);
      await this.getUsers();
    } catch (err) {
      console.error('Error al eliminar usuario', err);
    }
  }

  async viewUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: user.name,
      message: `Correo: ${user.email}<br>Rol: ${user.role_id === 1 ? 'Administrador' : 'Usuario'}<br>Creado: ${user.created_at ?? '—'}`,
      buttons: ['Cerrar'],
    });
    await alert.present();
  }

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: () => this.logout(),
        },
      ],
    });
    await alert.present();
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    this.router.navigateByUrl('/login', { replaceUrl: true });
}
}