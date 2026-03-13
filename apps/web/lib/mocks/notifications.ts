export interface MockNotificationPrefs {
  userId: string;
  loadAssigned: boolean;
  loadAccepted: boolean;
  podReceived: boolean;
  invoiceCreated: boolean;
  paymentProcessed: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export const MOCK_NOTIFICATION_PREFS: MockNotificationPrefs = {
  userId: 'user-1',
  loadAssigned: true,
  loadAccepted: true,
  podReceived: true,
  invoiceCreated: true,
  paymentProcessed: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
};
