import { httpClient } from '../../api/httpClient';
import type { ApiSuccess, AuthSession, AuthUser } from '../../types/auth';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  businessName: string;
  firstName: string;
  lastName: string;
}

export async function loginRequest(input: LoginInput) {
  const response = await httpClient.post<ApiSuccess<AuthSession>>('/v1/auth/login', input);
  return response.data.data;
}

export async function registerRequest(input: RegisterInput) {
  const response = await httpClient.post<ApiSuccess<AuthSession>>('/v1/auth/register', input);
  return response.data.data;
}

export async function getMeRequest() {
  const response = await httpClient.get<ApiSuccess<{ user: AuthUser }>>('/v1/auth/me');
  return response.data.data.user;
}

export async function logoutRequest() {
  await httpClient.post('/v1/auth/logout');
}
