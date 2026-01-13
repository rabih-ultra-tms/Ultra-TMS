export const actionLibrary = {
  'tms.update_order_status': {
    name: 'Update Order Status',
    params: ['order_id', 'status', 'notes'],
  },
  'tms.assign_carrier': {
    name: 'Assign Carrier to Load',
    params: ['load_id', 'carrier_id', 'rate'],
  },
  'comm.send_email': {
    name: 'Send Email',
    params: ['to', 'template_id', 'variables'],
  },
  'comm.create_task': {
    name: 'Create Task',
    params: ['user_id', 'title', 'due_date'],
  },
  'accounting.create_invoice': {
    name: 'Generate Invoice',
    params: ['order_id', 'customer_id'],
  },
  'system.delay': {
    name: 'Wait',
    params: ['duration_minutes'],
  },
};

export const triggerEvents = [
  'order.created',
  'order.status_changed',
  'order.delivered',
  'load.tender_accepted',
  'load.tender_rejected',
  'carrier.compliance_expiring',
  'invoice.created',
  'invoice.overdue',
  'payment.received',
  'claim.created',
];

export const triggerSchemas = [
  {
    type: 'EVENT',
    description: 'Execute when a domain event is received',
    schema: {
      properties: {
        eventName: { type: 'string', enum: triggerEvents },
        filters: { type: 'object' },
      },
      required: ['eventName'],
    },
  },
  {
    type: 'SCHEDULE',
    description: 'Execute on a cron schedule',
    schema: {
      properties: {
        cron: { type: 'string' },
        timezone: { type: 'string' },
      },
      required: ['cron'],
    },
  },
  {
    type: 'MANUAL',
    description: 'Manually executed workflows',
    schema: {
      properties: {
        notes: { type: 'string' },
      },
    },
  },
  {
    type: 'WEBHOOK',
    description: 'Execute when webhook is received',
    schema: {
      properties: {
        endpointKey: { type: 'string' },
      },
      required: ['endpointKey'],
    },
  },
];
