export type UserRole = 'admin' | 'user';

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  blockedUntil?: string | null;
};

export type AuthResponse = {
  access_token: string;
  user: UserProfile;
};
