export type TenantPlan = "STARTER" | "GROWTH" | "ENTERPRISE";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: TenantPlan;
  settings?: TenantSettings;
  createdAt: string;
}

export interface TenantSettings {
  tenantId: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  emailFrom?: string;
  revenueShare: number;
  customCss?: string;
}

export interface TenantDomain {
  id: string;
  tenantId: string;
  domain: string;
  verified: boolean;
}
