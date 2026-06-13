import type { UserRole } from '@prisma/client';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env.js';

export interface AuthTokenPayload {
  sub: string;
  businessId: string;
  role: UserRole;
}

export function signAuthToken(payload: AuthTokenPayload) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
