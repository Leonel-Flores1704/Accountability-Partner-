import { Injectable } from '@angular/core';
import axios, { AxiosError } from 'axios';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  created_at?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password: string;
  role_id: 1 | 2;
}

export interface LoginResult {
  user: User;
  token: string;
}

interface ApiResponse<T> {
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

  async list(): Promise<User[]> {
    const response = await this.client.get<ApiResponse<{ users: User[] }>>('?action=get_users');
    return response.data.data.users;
  }

  async get(id: number): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>(`?resource=users&id=${id}`);
    return response.data.data;
  }

  async create(user: UserPayload): Promise<User> {
    const response = await this.client.post<ApiResponse<{ user: User }>>('?action=create_user', user);
    return response.data.data.user;
  }

  async replace(id: number, user: UserPayload): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(`?resource=users&id=${id}`, user);
    return response.data.data;
  }

  async update(id: number, changes: Partial<UserPayload>): Promise<User> {
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
