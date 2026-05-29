export type UserRole = "SUPERADMIN" | "TENANT_ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface JWTPayload {
  sub: string;
  role: UserRole;
  tenantId: string;
  permissions: string[];
  exp: number;
}

export interface DeviceSession {
  id: string;
  userId: string;
  userAgent: string;
  lastSeen: string;
  ip: string;
}

export interface PublicInstructor {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  courseCount: number;
  studentCount: number;
  avgRating: number;
  specialties: string[];
}
