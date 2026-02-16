import type { UserProfile } from './auth';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export type Subscription = {
  id: string;
  clientId: string;
  client: UserProfile;
  trainerId: string;
  trainer: UserProfile;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionsResponse = {
  items: Subscription[];
  total: number;
  page: number;
  limit: number;
};

export type CreateSubscriptionInput = {
  clientId: string;
  trainerId: string;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  status?: SubscriptionStatus;
  amount: number;
  currency?: string;
  autoRenew?: boolean;
  notes?: string;
};

export type UpdateSubscriptionInput = {
  endDate?: string;
  nextPaymentDate?: string;
  status?: SubscriptionStatus;
  amount?: number;
  currency?: string;
  autoRenew?: boolean;
  notes?: string;
};
