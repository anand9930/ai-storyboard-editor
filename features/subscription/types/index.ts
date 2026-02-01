// Subscription feature types

export type BillingPeriod = 'yearly' | 'monthly';

export interface PlanFeature {
  text: string;
  highlight?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  discount: number;
  features: PlanFeature[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
