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

export type AdminPostVisibility = "PUBLIC" | "USER" | "GROUP";

export type AdminPostUser = {
  id: string;
  name?: string;
  email: string;
};

export type AdminPostGroup = {
  id: string;
  name: string;
};

export type AdminPostMedia = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

export type AdminPost = {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  category?: string | null;
  tags: string[];
  visibility: AdminPostVisibility;
  ownerUserId?: string | null;
  groupId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerUser?: AdminPostUser | null;
  group?: AdminPostGroup | null;
  mediaFiles?: AdminPostMedia[];
};
