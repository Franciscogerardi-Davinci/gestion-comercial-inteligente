import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { signAuthToken } from '../../shared/utils/jwt.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  businessId: true,
  business: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

function createSession(user: {
  id: string;
  businessId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  business: { id: string; name: string };
}) {
  const token = signAuthToken({
    sub: user.id,
    businessId: user.businessId,
    role: user.role,
  });

  return { token, user };
}

function toPublicUser(user: {
  id: string;
  businessId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  business: { id: string; name: string };
}) {
  return {
    id: user.id,
    businessId: user.businessId,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    business: user.business,
  };
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(409, 'EMAIL_IN_USE', 'El correo electronico ya esta registrado.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.$transaction(async (transaction) => {
    const business = await transaction.business.create({
      data: { name: input.businessName },
      select: { id: true },
    });

    return transaction.user.create({
      data: {
        businessId: business.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        role: UserRole.USER,
      },
      select: publicUserSelect,
    });
  });

  return createSession(user);
}

export async function login(input: LoginInput) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      ...publicUserSelect,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!userWithPassword || !(await bcrypt.compare(input.password, userWithPassword.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Correo electronico o contrasena incorrectos.');
  }

  if (!userWithPassword.isActive) {
    throw new AppError(403, 'USER_INACTIVE', 'El usuario se encuentra inactivo.');
  }

  return createSession(toPublicUser(userWithPassword));
}

export async function getAuthenticatedUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...publicUserSelect,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'INVALID_SESSION', 'La sesion ya no es valida.');
  }

  return toPublicUser(user);
}
