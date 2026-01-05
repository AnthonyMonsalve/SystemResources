export type UserRole = 'client' | 'admin' | 'employee';

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};

export type AuthResponse = {
  access_token: string;
  user: UserProfile;
};
