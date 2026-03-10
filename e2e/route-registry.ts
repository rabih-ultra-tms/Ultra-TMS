export interface RouteEntry {
  group: string;
  label: string;
  path: string;
  requiresAuth: boolean;
  requiresRole?: 'ADMIN' | 'SUPER_ADMIN';
}

export const DUMMY_ID = '00000000-0000-0000-0000-000000000001';

export const routes: RouteEntry[] = [
  // ── Auth (7) ──
  { group: 'Auth', label: 'Login', path: '/login', requiresAuth: false },
  { group: 'Auth', label: 'Register', path: '/register', requiresAuth: false },
  { group: 'Auth', label: 'Forgot Password', path: '/forgot-password', requiresAuth: false },
  { group: 'Auth', label: 'Reset Password', path: '/reset-password', requiresAuth: false },
  { group: 'Auth', label: 'Verify Email', path: '/verify-email', requiresAuth: false },
  { group: 'Auth', label: 'MFA', path: '/mfa', requiresAuth: false },
  { group: 'Auth', label: 'Super Admin Login', path: '/superadmin/login', requiresAuth: false },

  // ── Dashboard (1) ──
  { group: 'Dashboard', label: 'Main Dashboard', path: '/dashboard', requiresAuth: true },

  // ── Admin (12) ──
  { group: 'Admin', label: 'Users List', path: '/admin/users', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'User Create', path: '/admin/users/new', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'User Detail', path: `/admin/users/${DUMMY_ID}`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'User Edit', path: `/admin/users/${DUMMY_ID}/edit`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Roles List', path: '/admin/roles', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Role Create', path: '/admin/roles/new', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Role Detail', path: `/admin/roles/${DUMMY_ID}`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Permissions Matrix', path: '/admin/permissions', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Tenants List', path: '/admin/tenants', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Tenant Detail', path: `/admin/tenants/${DUMMY_ID}`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Audit Logs', path: '/admin/audit-logs', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Admin Settings', path: '/admin/settings', requiresAuth: true, requiresRole: 'ADMIN' },

  // ── Profile (2) ──
  { group: 'Profile', label: 'Profile', path: '/profile', requiresAuth: true },
  { group: 'Profile', label: 'Security Settings', path: '/profile/security', requiresAuth: true },

  // ── CRM — Companies (6) ──
  { group: 'CRM — Companies', label: 'Companies List', path: '/companies', requiresAuth: true },
  { group: 'CRM — Companies', label: 'Company Create', path: '/companies/new', requiresAuth: true },
  { group: 'CRM — Companies', label: 'Company Detail', path: `/companies/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM — Companies', label: 'Company Edit', path: `/companies/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'CRM — Companies', label: 'Company Activities', path: `/companies/${DUMMY_ID}/activities`, requiresAuth: true },
  { group: 'CRM — Companies', label: 'Company Contacts', path: `/companies/${DUMMY_ID}/contacts`, requiresAuth: true },

  // ── CRM — Customers (6) ──
  { group: 'CRM — Customers', label: 'Customers List', path: '/customers', requiresAuth: true },
  { group: 'CRM — Customers', label: 'Customer Create', path: '/customers/new', requiresAuth: true },
  { group: 'CRM — Customers', label: 'Customer Detail', path: `/customers/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM — Customers', label: 'Customer Edit', path: `/customers/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'CRM — Customers', label: 'Customer Activities', path: `/customers/${DUMMY_ID}/activities`, requiresAuth: true },
  { group: 'CRM — Customers', label: 'Customer Contacts', path: `/customers/${DUMMY_ID}/contacts`, requiresAuth: true },

  // ── CRM — Contacts (4) ──
  { group: 'CRM — Contacts', label: 'Contacts List', path: '/contacts', requiresAuth: true },
  { group: 'CRM — Contacts', label: 'Contact Create', path: '/contacts/new', requiresAuth: true },
  { group: 'CRM — Contacts', label: 'Contact Detail', path: `/contacts/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM — Contacts', label: 'Contact Edit', path: `/contacts/${DUMMY_ID}/edit`, requiresAuth: true },

  // ── CRM — Leads (5) ──
  { group: 'CRM — Leads', label: 'Leads List', path: '/leads', requiresAuth: true },
  { group: 'CRM — Leads', label: 'Lead Create', path: '/leads/new', requiresAuth: true },
  { group: 'CRM — Leads', label: 'Lead Detail', path: `/leads/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM — Leads', label: 'Lead Activities', path: `/leads/${DUMMY_ID}/activities`, requiresAuth: true },
  { group: 'CRM — Leads', label: 'Lead Contacts', path: `/leads/${DUMMY_ID}/contacts`, requiresAuth: true },

  // ── CRM — Activities (1) ──
  { group: 'CRM', label: 'Activities', path: '/activities', requiresAuth: true },

  // ── Sales (7) ──
  { group: 'Sales', label: 'Quotes List', path: '/quotes', requiresAuth: true },
  { group: 'Sales', label: 'Quote Create', path: '/quotes/new', requiresAuth: true },
  { group: 'Sales', label: 'Quote Detail', path: `/quotes/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Sales', label: 'Quote Edit', path: `/quotes/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Sales', label: 'Quote History', path: '/quote-history', requiresAuth: true },
  { group: 'Sales', label: 'Load Planner', path: `/load-planner/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Sales', label: 'Load Planner History', path: '/load-planner/history', requiresAuth: true },

  // ── TMS Core (12) ──
  { group: 'TMS Core', label: 'Operations Dashboard', path: '/operations', requiresAuth: true },
  { group: 'TMS Core', label: 'Orders List', path: '/operations/orders', requiresAuth: true },
  { group: 'TMS Core', label: 'Order Create', path: '/operations/orders/new', requiresAuth: true },
  { group: 'TMS Core', label: 'Order Detail', path: `/operations/orders/${DUMMY_ID}`, requiresAuth: true },
  { group: 'TMS Core', label: 'Order Edit', path: `/operations/orders/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'TMS Core', label: 'Loads List', path: '/operations/loads', requiresAuth: true },
  { group: 'TMS Core', label: 'Load Create', path: '/operations/loads/new', requiresAuth: true },
  { group: 'TMS Core', label: 'Load Detail', path: `/operations/loads/${DUMMY_ID}`, requiresAuth: true },
  { group: 'TMS Core', label: 'Load Edit', path: `/operations/loads/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'TMS Core', label: 'Rate Confirmation', path: `/operations/loads/${DUMMY_ID}/rate-con`, requiresAuth: true },
  { group: 'TMS Core', label: 'Dispatch Board', path: '/operations/dispatch', requiresAuth: true },
  { group: 'TMS Core', label: 'Tracking Map', path: '/operations/tracking', requiresAuth: true },

  // ── Carriers (7) ──
  { group: 'Carriers', label: 'Carriers List', path: '/carriers', requiresAuth: true },
  { group: 'Carriers', label: 'Carrier Detail', path: `/carriers/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Carriers', label: 'Carrier Edit', path: `/carriers/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Carriers', label: 'Carrier Scorecard', path: `/carriers/${DUMMY_ID}/scorecard`, requiresAuth: true },
  { group: 'Carriers', label: 'Load History List', path: '/load-history', requiresAuth: true },
  { group: 'Carriers', label: 'Load History Detail', path: `/load-history/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Carriers', label: 'Truck Types', path: '/truck-types', requiresAuth: true },

  // ── Accounting (10) ──
  { group: 'Accounting', label: 'Accounting Dashboard', path: '/accounting', requiresAuth: true },
  { group: 'Accounting', label: 'Invoices List', path: '/accounting/invoices', requiresAuth: true },
  { group: 'Accounting', label: 'Invoice Create', path: '/accounting/invoices/new', requiresAuth: true },
  { group: 'Accounting', label: 'Invoice Detail', path: `/accounting/invoices/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Accounting', label: 'Payables', path: '/accounting/payables', requiresAuth: true },
  { group: 'Accounting', label: 'Payments List', path: '/accounting/payments', requiresAuth: true },
  { group: 'Accounting', label: 'Payment Detail', path: `/accounting/payments/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Accounting', label: 'Settlements List', path: '/accounting/settlements', requiresAuth: true },
  { group: 'Accounting', label: 'Settlement Detail', path: `/accounting/settlements/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Accounting', label: 'Aging Report', path: '/accounting/reports/aging', requiresAuth: true },

  // ── Commission (11) ──
  { group: 'Commission', label: 'Commissions Dashboard', path: '/commissions', requiresAuth: true },
  { group: 'Commission', label: 'Plans List', path: '/commissions/plans', requiresAuth: true },
  { group: 'Commission', label: 'Plan Create', path: '/commissions/plans/new', requiresAuth: true },
  { group: 'Commission', label: 'Plan Detail', path: `/commissions/plans/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Commission', label: 'Plan Edit', path: `/commissions/plans/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Commission', label: 'Payouts List', path: '/commissions/payouts', requiresAuth: true },
  { group: 'Commission', label: 'Payout Detail', path: `/commissions/payouts/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Commission', label: 'Reports', path: '/commissions/reports', requiresAuth: true },
  { group: 'Commission', label: 'Sales Reps', path: '/commissions/reps', requiresAuth: true },
  { group: 'Commission', label: 'Sales Rep Detail', path: `/commissions/reps/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Commission', label: 'Transactions', path: '/commissions/transactions', requiresAuth: true },

  // ── Load Board (4) ──
  { group: 'Load Board', label: 'Load Board', path: '/load-board', requiresAuth: true },
  { group: 'Load Board', label: 'Post Load', path: '/load-board/post', requiresAuth: true },
  { group: 'Load Board', label: 'Posting Detail', path: `/load-board/postings/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Load Board', label: 'Load Board Search', path: '/load-board/search', requiresAuth: true },

  // ── Super Admin (1) ──
  { group: 'Super Admin', label: 'Tenant Services', path: '/superadmin/tenant-services', requiresAuth: true, requiresRole: 'SUPER_ADMIN' },

  // ── Portal (5) ──
  { group: 'Portal', label: 'Portal Login', path: '/portal/login', requiresAuth: false },
  { group: 'Portal', label: 'Portal Dashboard', path: '/portal/dashboard', requiresAuth: false },
  { group: 'Portal', label: 'Portal Documents', path: '/portal/documents', requiresAuth: false },
  { group: 'Portal', label: 'Portal Shipments', path: '/portal/shipments', requiresAuth: false },
  { group: 'Portal', label: 'Portal Shipment Detail', path: `/portal/shipments/${DUMMY_ID}`, requiresAuth: false },

  // ── Public (2) ──
  { group: 'Public', label: 'Root', path: '/', requiresAuth: false },
  { group: 'Public', label: 'Public Tracking', path: `/track/${DUMMY_ID}`, requiresAuth: false },
];
