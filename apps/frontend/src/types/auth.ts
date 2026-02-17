export type UserRole = 'admin' | 'trainer' | 'client' | 'user';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type FitnessGoal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'improve_endurance'
  | 'general_fitness'
  | 'rehabilitation';

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  blockedUntil?: string | null;
  // Trainer fields
  bio?: string;
  specialization?: string;
  certifications?: string;
  yearsExperience?: number;
  // Client fields
  weight?: number;
  height?: number;
  goal?: FitnessGoal;
  fitnessLevel?: FitnessLevel;
  trainerId?: string;
  // Subscription fields
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  subscriptionStatus?: 'active' | 'expired' | 'cancelled' | null;
};

export type AuthResponse = {
  access_token: string;
  user: UserProfile;
};
