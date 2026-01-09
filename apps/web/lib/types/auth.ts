export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
  };
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  brandingLogo: string | null;
  brandingPrimaryColor: string;
  brandingSecondaryColor: string;
  featuresCarrierManagement: boolean;
  featuresLoadBoard: boolean;
  featuresAccounting: boolean;
  featuresAnalytics: boolean;
  notificationsEmail: boolean;
  notificationsSms: boolean;
}

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  title: string | null;
  avatarUrl: string | null;
  role: {
    id: string;
    name: string;
  };
  tenant: {
    id: string;
    name: string;
  };
}
