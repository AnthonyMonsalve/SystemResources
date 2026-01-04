export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  role: UserRole;
}

export type UserProfile = Omit<User, 'passwordHash'>;
