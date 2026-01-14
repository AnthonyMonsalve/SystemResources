import type { UserRole } from "./auth";

export type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  blockedUntil?: string | null;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminGroupMember = {
  id: string;
  groupId: string;
  userId: string;
  createdAt: string;
  user: AdminUser;
};

export type AdminGroup = {
  id: string;
  name: string;
  description?: string | null;
  members?: AdminGroupMember[];
  createdAt: string;
  updatedAt: string;
};
