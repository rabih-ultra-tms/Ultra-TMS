export interface MockMessage {
  id: string;
  threadId: string;
  senderName: string;
  content: string;
  type: 'email' | 'sms' | 'in-app';
  sentAt: Date;
  attachments?: Array<{ id: string; name: string }>;
}

export interface MockTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: Date;
}

export const MOCK_MESSAGES: MockMessage[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderName: 'System',
    content: 'Load accepted by carrier',
    type: 'in-app',
    sentAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderName: 'John Carrier',
    content: 'We can pick up tomorrow morning',
    type: 'in-app',
    sentAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: 'msg-3',
    threadId: 'thread-2',
    senderName: 'System',
    content: 'Invoice created for order #1234',
    type: 'email',
    sentAt: new Date('2024-01-14T14:00:00'),
  },
];

export const MOCK_TEMPLATES: MockTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Load Accepted',
    subject: 'Your load {{loadId}} has been accepted',
    body: 'Carrier {{carrierName}} has accepted your load. Pickup scheduled for {{pickupDate}}.',
    variables: ['{{loadId}}', '{{carrierName}}', '{{pickupDate}}'],
    createdAt: new Date(),
  },
  {
    id: 'tpl-2',
    name: 'POD Received',
    subject: 'POD received for load {{loadId}}',
    body: 'Proof of delivery received for load {{loadId}}. Invoice will be generated shortly.',
    variables: ['{{loadId}}'],
    createdAt: new Date(),
  },
];
