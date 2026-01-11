export enum NoaStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED',
}

export enum FactoringStatus {
  NONE = 'NONE',
  FACTORED = 'FACTORED',
  QUICK_PAY_ONLY = 'QUICK_PAY_ONLY',
}

export enum VerificationStatusEnum {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  PARTIAL = 'PARTIAL',
  DECLINED = 'DECLINED',
}

export enum VerificationMethodEnum {
  PHONE_CALL = 'PHONE_CALL',
  EMAIL = 'EMAIL',
  FAX = 'FAX',
  ONLINE_PORTAL = 'ONLINE_PORTAL',
  MAIL = 'MAIL',
}

export enum FactoringCompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum FactoredPaymentStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum PaymentMethodType {
  ACH = 'ACH',
  CHECK = 'CHECK',
  WIRE = 'WIRE',
  CREDIT_CARD = 'CREDIT_CARD',
}
