import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { config } from '../config';
import { TokenPair } from '../types';
import * as emailService from './email.service';

export async function register(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      emailVerifyToken,
    },
    select: { id: true, email: true, name: true, plan: true },
  });

  const tokens = await generateTokens(user.id);

  // Send verification email (non-blocking)
  emailService.sendVerificationEmail(email, emailVerifyToken);

  return { user, ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account is deactivated'), { statusCode: 403 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const tokens = await generateTokens(user.id);

  return {
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan, avatarUrl: user.avatarUrl },
    ...tokens,
  };
}

export async function generateTokens(userId: string, userAgent?: string, ipAddress?: string): Promise<TokenPair> {
  const accessToken = jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry as any,
  });

  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry as any,
  });

  // Calculate refresh token expiry
  const decoded = jwt.decode(refreshToken) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  await prisma.userSession.create({
    data: { userId, refreshToken, userAgent, ipAddress, expiresAt },
  });

  return { accessToken, refreshToken };
}

export async function refreshToken(token: string) {
  const session = await prisma.userSession.findUnique({ where: { refreshToken: token } });
  if (!session) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  if (session.expiresAt < new Date()) {
    await prisma.userSession.delete({ where: { id: session.id } });
    throw Object.assign(new Error('Refresh token expired'), { statusCode: 401 });
  }

  try {
    jwt.verify(token, config.jwt.refreshSecret);
  } catch {
    await prisma.userSession.delete({ where: { id: session.id } });
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  // Rotate: delete old, create new
  await prisma.userSession.delete({ where: { id: session.id } });
  return generateTokens(session.userId);
}

export async function logout(token: string) {
  await prisma.userSession.deleteMany({ where: { refreshToken: token } });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Don't reveal whether email exists

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: resetToken, passwordResetExpires: expires },
  });

  emailService.sendPasswordResetEmail(email, resetToken);
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpires: null },
  });

  // Invalidate all sessions
  await prisma.userSession.deleteMany({ where: { userId: user.id } });
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) {
    throw Object.assign(new Error('Invalid verification token'), { statusCode: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, avatarUrl: true, plan: true,
      planExpiresAt: true,
      maxAccounts: true, maxWorkflowsPerAccount: true,
      maxKeywordsPerWorkflow: true, maxCreatorsPerWorkflow: true,
      maxCommentsDayPerAccount: true, maxCommentsDayGlobal: true,
      emailVerified: true, createdAt: true,
    },
  });

  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
}

export async function updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, avatarUrl: true, plan: true },
  });
}
