export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  business: {
    id: string;
    name: string;
  };
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
