export type OrderStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";
export type Gateway = "STRIPE" | "OMISE";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED";
export type PlanInterval = "MONTHLY" | "YEARLY" | "LIFETIME";
export type CouponType = "PERCENT" | "FIXED" | "FIRST_PURCHASE" | "REFERRAL";

export interface Order {
  id: string;
  tenantId: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  vatAmount: number;
  discount: number;
  total: number;
  currency: string;
  gateway: Gateway;
  gatewayRef?: string;
  couponId?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  courseId: string;
  price: number;
}

export interface Plan {
  id: string;
  name: string;
  stripePriceId: string;
  interval: PlanInterval;
  price: number;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  stripeSubId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  type: CouponType;
  value: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
}

export interface CouponValidation {
  valid: boolean;
  discountAmount: number;
  finalPrice: number;
  error?: string;
}

export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  thumbnail?: string;
  instructorName: string;
}
