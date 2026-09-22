import { Injectable } from '@angular/core';
import axios, { AxiosError } from 'axios';
import { environment } from '../../environments/environment';

// 1. Interfaz actualizada para coincidir exactamente con tu base de datos appmovil
export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number; // Usamos role_id como en MySQL
  created_at?: string;
}

// 2. Interfaz para crear/actualizar (Payload)
export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role_id: number;
}

export type UserUpdatePayload = Partial<UserPayload>;

export interface LoginResult {
  user: User;
  token?: string; // Opcional, ya que el PHP actual no genera tokens JWT
}

export interface ApiResponse<T> {
  status?: number;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly client = axios.create({
    baseURL: environment.apiUrl,
    headers: { 'Content-Type': 'application/json' }
  });

  constructor() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const response = await this.client.post<ApiResponse<LoginResult>>('?action=login', { email, password });
    return response.data.data;
  }

  async register(name: string, email: string, password: string): Promise<LoginResult> {
    const response = await this.client.post<ApiResponse<User>>('?resource=users', {
      name,
      email,
      password
    });
    return { user: response.data.data };
  }

  // 3. ¡CORREGIDO! Ahora apunta a '?resource=users' y devuelve directamente el arreglo de usuarios
  async list(): Promise<User[]> {
    const response = await this.client.get<ApiResponse<User[]>>('?resource=users');
    return response.data.data;
  }

  async get(id: number): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>(`?resource=users&id=${id}`);
    return response.data.data;
  }

  async create(user: UserPayload): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>('?resource=users', user);
    return response.data.data;
  }

  async replace(id: number, user: UserPayload): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(`?resource=users&id=${id}`, user);
    return response.data.data;
  }

  async update(id: number, changes: UserUpdatePayload): Promise<User> {
    const response = await this.client.patch<ApiResponse<User>>(`?resource=users&id=${id}`, changes);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`?resource=users&id=${id}`);
  }

  static errorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const response = error as AxiosError<{ message?: string }>;
      return response.response?.data?.message ?? 'The server could not complete the request.';
    }
    return 'An unexpected error occurred.';
  }
}
