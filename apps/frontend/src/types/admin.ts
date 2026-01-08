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
