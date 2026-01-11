export enum CarrierPortalUserRole {
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
  ACCOUNTING = 'ACCOUNTING',
  DRIVER = 'DRIVER',
}

export type CarrierPortalUserProfile = {
  id: string;
  carrierId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: CarrierPortalUserRole;
  permissions?: string[] | null;
};