import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronRight, Search, ListOrdered, CheckCircle2, Circle, Calendar, Target, Rocket,
  Truck, Package, Users, FileText, DollarSign, MapPin, ClipboardCheck, Building2, UserCheck,
  TestTube, Database, Activity, Shield, Globe, GraduationCap, Gauge
} from 'lucide-react';

// ============================================================================
// 3PL PLATFORM - RESTRUCTURED DEVELOPMENT ROADMAP
// PRIORITY: Internal TMS First (Weeks 1-28 = LIVE INTERNAL TMS)
// Total: 186 weeks • 5 phases • Weekly Stakeholder Meetings
// ============================================================================

const ROADMAP = {
  A: {
    name: "Phase A - Internal Operations",
    weeks: 94,
    start: 1,
    description: "Internal TMS first (Week 28 GO-LIVE), then enhancements & governance",
    icon: "🏗️",
    color: "blue",
    sections: [
      // =========================================================================
      // SECTION 1: FOUNDATION (Weeks 1-6) - Unchanged, still needed first
      // =========================================================================
      {
        id: 1,
        name: "🔴 Foundation (Critical Path)",
        weeks: [
          {
            week: 1,
            title: "Project Setup",
            tasks: [
              { name: "Initialize Turborepo monorepo", subtasks: [
                "Run `npx create-turbo@latest` to scaffold project",
                "Configure pnpm workspaces in pnpm-workspace.yaml",
                "Create packages: api, web, shared-types, config",
                "Set up turbo.json with build/dev/lint pipeline",
                "Test `turbo run build` works across packages"
              ]},
              { name: "Set up GitHub repository", subtasks: [
                "Create new private repository on GitHub",
                "Initialize with README.md and .gitignore",
                "Configure branch protection on main",
                "Create PR template and issue templates"
              ]},
              { name: "Configure code quality tools", subtasks: [
                "Install ESLint with @typescript-eslint plugin",
                "Install and configure Prettier",
                "Set up tsconfig.json with strict mode",
                "Install lint-staged and Husky for git hooks"
              ]},
              { name: "Set up Docker development environment", subtasks: [
                "Create docker-compose.yml in project root",
                "Add PostgreSQL 15 service with volume",
                "Add Redis 7 service",
                "Create .env.example with all required variables",
                "Test `docker-compose up` starts all services"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo project structure",
                "Review week's accomplishments",
                "Confirm next week's priorities",
                "Document meeting notes and action items"
              ]}
            ]
          },
          {
            week: 2,
            title: "Database & ORM",
            tasks: [
              { name: "Set up PostgreSQL", subtasks: [
                "Configure PostgreSQL in docker-compose",
                "Create development database: tms_dev",
                "Create test database: tms_test",
                "Verify connection from host"
              ]},
              { name: "Initialize Prisma ORM", subtasks: [
                "Install prisma and @prisma/client",
                "Run `npx prisma init` in api package",
                "Configure DATABASE_URL in .env",
                "Create PrismaService in NestJS"
              ]},
              { name: "Create Tenant model (migration-first)", subtasks: [
                "Add Tenant model: id, name, slug, settings",
                "Add external_id, source_system for migration",
                "Add custom_fields as Json",
                "Add createdAt, updatedAt timestamps"
              ]},
              { name: "Create User model (migration-first)", subtasks: [
                "Add User model: id, tenantId, email, passwordHash",
                "Add firstName, lastName, phone, role, status",
                "Add external_id, source_system, custom_fields",
                "Run initial migration"
              ]},
              { name: "Set up Redis & seed scripts", subtasks: [
                "Configure Redis in docker-compose",
                "Create prisma/seed.ts with default tenant and admin",
                "Test with `npx prisma db seed`"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo database setup and schema",
                "Review migration-first architecture",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 3,
            title: "NestJS Foundation",
            tasks: [
              { name: "Initialize NestJS application", subtasks: [
                "Set up NestJS in api package",
                "Configure TypeScript strict mode",
                "Set up path aliases: @modules, @common, @config",
                "Verify `npm run start:dev` works"
              ]},
              { name: "Configure module structure", subtasks: [
                "Create src/modules, src/common, src/config folders",
                "Set up barrel exports (index.ts)",
                "Create ConfigModule with validation"
              ]},
              { name: "Create exception filters & interceptors", subtasks: [
                "Create HttpExceptionFilter",
                "Create PrismaExceptionFilter",
                "Create LoggingInterceptor with correlation ID",
                "Register globally"
              ]},
              { name: "Set up Swagger/OpenAPI", subtasks: [
                "Install @nestjs/swagger",
                "Configure SwaggerModule in main.ts",
                "Verify Swagger UI at /api/docs"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo NestJS structure and Swagger",
                "Review API design patterns",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 4,
            title: "Authentication",
            tasks: [
              { name: "Create AuthModule", subtasks: [
                "Generate module with AuthService and AuthController",
                "Implement password hashing with bcrypt",
                "Configure salt rounds (12)"
              ]},
              { name: "Implement JWT tokens", subtasks: [
                "Install @nestjs/jwt and passport-jwt",
                "Configure JwtModule with secret and expiry",
                "Create generateAccessToken and generateRefreshToken",
                "Store refresh tokens in Redis"
              ]},
              { name: "Create auth endpoints", subtasks: [
                "POST /auth/register with validation",
                "POST /auth/login - verify password, return tokens",
                "POST /auth/refresh - validate and rotate tokens",
                "POST /auth/logout - remove refresh token"
              ]},
              { name: "Create JwtAuthGuard", subtasks: [
                "Create JwtStrategy with validate method",
                "Create JwtAuthGuard",
                "Create @CurrentUser decorator",
                "Apply guard globally with exclusions"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo authentication flow",
                "Review security measures",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 5,
            title: "Multi-Tenancy & RBAC",
            tasks: [
              { name: "Implement tenant context", subtasks: [
                "Add tenantId to JWT payload",
                "Create TenantContext with AsyncLocalStorage",
                "Create TenantMiddleware to set context",
                "Create @TenantId decorator"
              ]},
              { name: "Create TenantInterceptor", subtasks: [
                "Auto-add tenantId to where clauses",
                "Auto-add tenantId to create data",
                "Throw error if tenantId missing on writes"
              ]},
              { name: "Create Role and Permission models", subtasks: [
                "Add Role, Permission, RolePermission, UserRole models",
                "Create RolesGuard with @Roles decorator",
                "Create PermissionService with caching"
              ]},
              { name: "Create default roles", subtasks: [
                "Admin (all permissions)",
                "Manager, Dispatcher, Accounting, Sales, User",
                "Seed roles on tenant creation"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo tenant isolation and RBAC",
                "Review default roles",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 6,
            title: "Admin Module & CI/CD",
            tasks: [
              { name: "Build user management", subtasks: [
                "GET /admin/users with pagination and search",
                "POST/PATCH/DELETE user endpoints",
                "User invite flow with tokens"
              ]},
              { name: "Build Users list page (React)", subtasks: [
                "Set up React Query",
                "Create UsersPage with DataTable",
                "Add search and role filter",
                "Create UserFormModal"
              ]},
              { name: "Set up CI/CD", subtasks: [
                "Create GitHub Actions CI workflow",
                "Set up staging environment (Railway/Render)",
                "Configure automatic deploys from main"
              ]},
              { name: "🟢 FOUNDATION COMPLETE", subtasks: [
                "Test auth flow end-to-end",
                "Verify tenant isolation",
                "Verify RBAC permissions",
                "Test on staging environment"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo complete foundation",
                "Celebrate milestone! 🎉",
                "Plan TMS Core phase",
                "Document meeting notes"
              ]}
            ]
          }
        ]
      },
      
      // =========================================================================
      // SECTION 2: TMS CORE (Weeks 7-16) - THE PRIORITY
      // =========================================================================
      {
        id: 2,
        name: "🔴 TMS Core (Critical Path)",
        weeks: [
          {
            week: 7,
            title: "Customer Management",
            tasks: [
              { name: "Create Company model (migration-first)", subtasks: [
                "Add Company: id, tenantId, name, dba",
                "Add type enum: SHIPPER, CARRIER, BOTH, VENDOR",
                "Add phone, email, website, taxId",
                "Add external_id, source_system, custom_fields",
                "Run migration"
              ]},
              { name: "Create Address model", subtasks: [
                "Add companyId relation",
                "Add type: BILLING, SHIPPING, PHYSICAL",
                "Add street1, street2, city, state, zip, country",
                "Add lat/long for mapping"
              ]},
              { name: "Create Contact model", subtasks: [
                "Add companyId relation",
                "Add firstName, lastName, email, phone",
                "Add title, isPrimary"
              ]},
              { name: "Implement Company CRUD", subtasks: [
                "GET /companies with pagination, search, filters",
                "GET /companies/:id with addresses and contacts",
                "POST /companies",
                "PATCH /companies/:id",
                "DELETE (soft delete)"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Company API",
                "Review customer fields needed",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 8,
            title: "Customer UI",
            tasks: [
              { name: "Create API service layer", subtasks: [
                "Create axios instance with auth interceptor",
                "Create companies service with all CRUD methods",
                "Set up React Query hooks"
              ]},
              { name: "Build Companies list page", subtasks: [
                "Create CompaniesPage.tsx",
                "Create reusable DataTable component",
                "Add search, type filter, status filter",
                "Add pagination"
              ]},
              { name: "Build Company detail page", subtasks: [
                "Create CompanyDetailPage.tsx",
                "Show company info header",
                "Tabs: Overview, Contacts, Addresses, Orders"
              ]},
              { name: "Build Company forms", subtasks: [
                "Create CompanyFormModal (create/edit)",
                "Create ContactFormModal",
                "Create AddressFormModal",
                "Form validation with zod"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Customer UI",
                "Gather UX feedback",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 9,
            title: "Order Model",
            tasks: [
              { name: "Create Order model (migration-first)", subtasks: [
                "Add Order: id, tenantId, orderNumber (auto-generated)",
                "Add customerId relation",
                "Add status enum: QUOTE, BOOKED, DISPATCHED, IN_TRANSIT, DELIVERED, CANCELLED",
                "Add customerRate, carrierCost (Decimal)",
                "Add equipmentType, specialInstructions, internalNotes",
                "Add external_id, source_system, custom_fields"
              ]},
              { name: "Create Stop model", subtasks: [
                "Add orderId relation",
                "Add type enum: PICKUP, DELIVERY",
                "Add sequence number",
                "Add companyId (optional) or manual address fields",
                "Add appointmentDate, appointmentTime, appointmentType",
                "Add contactName, contactPhone",
                "Add reference, notes, status"
              ]},
              { name: "Create Commodity model", subtasks: [
                "Add orderId relation",
                "Add description, quantity, weight, weightUnit",
                "Add pieces, packagingType",
                "Add length, width, height, dimensionUnit",
                "Add isHazmat, hazmatClass, unNumber"
              ]},
              { name: "Implement order number generation", subtasks: [
                "Format: {PREFIX}-{YEAR}-{SEQUENCE}",
                "Tenant-specific prefix from settings",
                "Thread-safe sequence generation"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Order model",
                "Review order workflow",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 10,
            title: "Order API",
            tasks: [
              { name: "Implement Order CRUD endpoints", subtasks: [
                "GET /orders with pagination, search, filters",
                "GET /orders/:id with stops, commodities, customer",
                "POST /orders with stops and commodities",
                "PATCH /orders/:id",
                "DELETE /orders/:id (soft delete)"
              ]},
              { name: "Add order filters", subtasks: [
                "Filter by status (single and multiple)",
                "Filter by customerId",
                "Filter by pickup date range",
                "Filter by delivery date range",
                "Filter by origin/dest city or state"
              ]},
              { name: "Implement status transitions", subtasks: [
                "Define valid status transitions",
                "POST /orders/:id/status endpoint",
                "Validate transition is allowed",
                "Track status history"
              ]},
              { name: "Add stop endpoints", subtasks: [
                "POST /orders/:id/stops",
                "PATCH /stops/:id",
                "DELETE /stops/:id",
                "PATCH /orders/:id/stops/reorder"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Order API",
                "Test with Postman/Swagger",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 11,
            title: "Orders List UI",
            tasks: [
              { name: "Build Orders list page", subtasks: [
                "Create OrdersPage.tsx",
                "Use useQuery to fetch orders",
                "Manage filter state in URL params"
              ]},
              { name: "Create Orders DataTable", subtasks: [
                "Order number column (link to detail)",
                "Customer name column",
                "Origin city/state + date",
                "Destination city/state + date",
                "Status with color badge",
                "Customer rate (formatted currency)"
              ]},
              { name: "Add status filter tabs", subtasks: [
                "Tabs: All, Quotes, Booked, In Transit, Delivered",
                "Show count badge on each tab",
                "Sync with URL params"
              ]},
              { name: "Add search and date filters", subtasks: [
                "Search by order number, customer name",
                "Date range picker (pickup or delivery)",
                "Customer dropdown filter"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Orders list",
                "Gather filter requirements",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 12,
            title: "Order Entry Form - Part 1",
            tasks: [
              { name: "Create Order entry page", subtasks: [
                "Create OrderEntryPage.tsx",
                "Set up react-hook-form",
                "Two-column responsive layout",
                "Handle create vs edit mode"
              ]},
              { name: "Build CustomerSelector component", subtasks: [
                "Search customers as user types (debounced)",
                "Show recent customers at top",
                "Display company name, city/state in dropdown",
                "'Create New Customer' option with quick modal"
              ]},
              { name: "Build StopBuilder component", subtasks: [
                "Separate sections for Pickups and Deliveries",
                "Add Stop button for each section",
                "Display sequence numbers (P1, P2, D1, D2)",
                "Remove Stop button on each card"
              ]},
              { name: "Build StopCard component", subtasks: [
                "Location selector (existing company or manual)",
                "Address fields (with autocomplete if possible)",
                "Date/time picker for appointment",
                "Contact name and phone fields",
                "Reference and notes fields"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Order entry form (partial)",
                "Gather usability feedback",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 13,
            title: "Order Entry Form - Part 2",
            tasks: [
              { name: "Implement stop drag-and-drop", subtasks: [
                "Install @dnd-kit/core and @dnd-kit/sortable",
                "Make stop cards draggable",
                "Visual feedback during drag",
                "Update sequence numbers on drop"
              ]},
              { name: "Build CommodityBuilder component", subtasks: [
                "Table layout for line items",
                "Fields: description, qty, weight, pieces",
                "Add/Remove item buttons",
                "Auto-calculate totals"
              ]},
              { name: "Add equipment and rate fields", subtasks: [
                "Equipment type selector",
                "Customer rate input",
                "Special instructions textarea",
                "Internal notes textarea"
              ]},
              { name: "Implement form validation & save", subtasks: [
                "Create zod schema for order",
                "Validate customer is selected",
                "Validate at least one pickup and delivery",
                "Validate dates (pickup before delivery)",
                "Submit to API and redirect"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo complete Order entry form",
                "Test order creation flow",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 14,
            title: "Order Detail Page",
            tasks: [
              { name: "Create Order detail page", subtasks: [
                "Create OrderDetailPage.tsx",
                "Fetch order with all relations",
                "Handle loading and not found states"
              ]},
              { name: "Build order header", subtasks: [
                "Order number prominently displayed",
                "Status badge with color",
                "Customer name with link",
                "Origin → Destination summary",
                "Edit button"
              ]},
              { name: "Create StopTimeline component", subtasks: [
                "Vertical timeline layout",
                "Pickup icon (arrow up) / Delivery icon (arrow down)",
                "Location name and address",
                "Appointment date/time",
                "Status indicator (pending, completed)"
              ]},
              { name: "Build order tabs", subtasks: [
                "Tab: Details (stops, commodities, refs)",
                "Tab: Load (carrier info - empty for now)",
                "Tab: Documents (placeholder)",
                "Tab: History (status changes)"
              ]},
              { name: "Add quick action buttons", subtasks: [
                "Update Status dropdown",
                "Edit Order button",
                "Clone Order button",
                "Cancel Order (with confirmation)"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Order detail page",
                "Review action buttons",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 15,
            title: "Carrier Management (Basic)",
            tasks: [
              { name: "Extend Company model for carriers", subtasks: [
                "Add isCarrier boolean field",
                "Add mcNumber, dotNumber, scacCode fields",
                "Add insuranceExpiration date",
                "Add approvalStatus enum: PENDING, APPROVED, REJECTED"
              ]},
              { name: "Create carrier-specific endpoints", subtasks: [
                "GET /carriers (filter companies where isCarrier=true)",
                "GET /carriers/:id",
                "POST /carriers",
                "PATCH /carriers/:id"
              ]},
              { name: "Build Carriers list page", subtasks: [
                "Create CarriersPage.tsx",
                "DataTable with MC#, DOT#, status, insurance expiry",
                "Search by name, MC#, DOT#",
                "Filter by approval status"
              ]},
              { name: "Build Carrier form", subtasks: [
                "Basic info section (name, contact)",
                "Authority section (MC#, DOT#, SCAC)",
                "Insurance section (expiry date)",
                "Equipment types (multi-select)"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Carrier management",
                "Review carrier fields needed",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 16,
            title: "Load Model & Carrier Assignment",
            tasks: [
              { name: "Create Load model", subtasks: [
                "Add Load: id, orderId, carrierId relations",
                "Add carrierRate (Decimal)",
                "Add status enum: PENDING, DISPATCHED, IN_TRANSIT, DELIVERED",
                "Add driverName, driverPhone, truckNumber, trailerNumber",
                "Add dispatchedAt, pickedUpAt, deliveredAt timestamps"
              ]},
              { name: "Create carrier assignment endpoint", subtasks: [
                "POST /orders/:id/assign-carrier",
                "Accept carrierId, carrierRate, driver info",
                "Create Load record",
                "Update Order status to DISPATCHED"
              ]},
              { name: "Add margin calculation", subtasks: [
                "Calculate: customerRate - carrierCost",
                "Calculate margin percentage",
                "Display on order detail"
              ]},
              { name: "Build Load tab on Order detail", subtasks: [
                "Show 'Assign Carrier' button if no load",
                "CarrierAssignmentModal with carrier search",
                "Enter carrier rate, driver info",
                "Show assigned carrier info after assignment"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo carrier assignment flow",
                "Review margin display",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          }
        ]
      },
      
      // =========================================================================
      // SECTION 3: DISPATCH & TRACKING (Weeks 17-20)
      // =========================================================================
      {
        id: 3,
        name: "🔴 Dispatch & Tracking (Critical Path)",
        weeks: [
          {
            week: 17,
            title: "Dispatch Board",
            tasks: [
              { name: "Create Dispatch endpoints", subtasks: [
                "GET /dispatch/orders - orders ready for dispatch (BOOKED status)",
                "GET /dispatch/loads - active loads by status",
                "Filter by date range, equipment type"
              ]},
              { name: "Build Dispatch Board page", subtasks: [
                "Create DispatchBoardPage.tsx",
                "Kanban-style layout with columns by status",
                "Date navigation (today, tomorrow, this week)"
              ]},
              { name: "Build LoadCard component", subtasks: [
                "Order number and customer",
                "Origin → Destination with dates",
                "Equipment type badge",
                "Carrier name (if assigned)",
                "Click to open detail slideout"
              ]},
              { name: "Implement drag-and-drop (optional)", subtasks: [
                "Drag between status columns",
                "Update status on drop",
                "Or use quick action buttons instead"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Dispatch Board",
                "Gather dispatcher feedback",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 18,
            title: "Status Updates & Check Calls",
            tasks: [
              { name: "Create TrackingEvent model", subtasks: [
                "Add loadId relation",
                "Add eventType enum: DISPATCHED, AT_PICKUP, LOADED, IN_TRANSIT, AT_DELIVERY, DELIVERED",
                "Add eventTime, city, state",
                "Add notes, createdBy"
              ]},
              { name: "Create status update endpoints", subtasks: [
                "POST /loads/:id/events - add tracking event",
                "GET /loads/:id/events - get event history",
                "Auto-update Load and Order status based on event"
              ]},
              { name: "Create CheckCall model", subtasks: [
                "Add loadId relation",
                "Add callTime, location (city/state)",
                "Add currentStatus, eta",
                "Add notes, createdBy"
              ]},
              { name: "Build Status Update modal", subtasks: [
                "Event type selector",
                "Location input (city/state)",
                "Time picker (default: now)",
                "Notes field",
                "Update button"
              ]},
              { name: "Add check call entry", subtasks: [
                "Quick check call form on load detail",
                "Location, ETA, notes",
                "List recent check calls"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo status updates and check calls",
                "Review tracking workflow",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 19,
            title: "Load Detail & Tracking View",
            tasks: [
              { name: "Build Load detail slideout", subtasks: [
                "Order info header",
                "Carrier and driver info",
                "Customer rate vs carrier rate (margin)",
                "Stop timeline with status"
              ]},
              { name: "Build tracking timeline", subtasks: [
                "Chronological list of events and check calls",
                "Event type icons",
                "Timestamp and location",
                "Notes display"
              ]},
              { name: "Add quick actions on load", subtasks: [
                "Update Status button",
                "Add Check Call button",
                "Mark Delivered button",
                "View Order button"
              ]},
              { name: "Build simple tracking list page", subtasks: [
                "List all in-transit loads",
                "Show last check call / location",
                "Show ETA",
                "Filter by status, carrier"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Load detail and tracking",
                "Review tracking information needed",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 20,
            title: "Alerts & Notifications (Basic)",
            tasks: [
              { name: "Create Alert model", subtasks: [
                "Add type enum: LATE_PICKUP, LATE_DELIVERY, CHECKCALL_OVERDUE",
                "Add severity: LOW, MEDIUM, HIGH, CRITICAL",
                "Add entityType, entityId",
                "Add message, isRead, createdAt"
              ]},
              { name: "Implement alert generation", subtasks: [
                "Scheduled job to check for late pickups",
                "Scheduled job to check for late deliveries",
                "Generate alerts when conditions met"
              ]},
              { name: "Build Alerts panel", subtasks: [
                "Bell icon in header with unread count",
                "Dropdown panel with recent alerts",
                "Click to navigate to related order/load",
                "Mark as read"
              ]},
              { name: "Add alerts to dashboard", subtasks: [
                "Critical alerts widget",
                "Count by type",
                "Link to full alerts list"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Alerts system",
                "Review alert thresholds",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          }
        ]
      },
      
      // =========================================================================
      // SECTION 4: DOCUMENTS (Weeks 21-22)
      // =========================================================================
      {
        id: 4,
        name: "🔴 Documents (Critical Path)",
        weeks: [
          {
            week: 21,
            title: "Document Storage & Upload",
            tasks: [
              { name: "Set up file storage", subtasks: [
                "Configure S3 or MinIO for development",
                "Create bucket with appropriate permissions",
                "Create StorageService for upload/download"
              ]},
              { name: "Create Document model", subtasks: [
                "Add entityType (ORDER, LOAD, CARRIER, etc.)",
                "Add entityId",
                "Add docType enum: BOL, RATE_CON, POD, INVOICE, COI, OTHER",
                "Add fileName, fileSize, mimeType, storageKey",
                "Add uploadedBy, uploadedAt"
              ]},
              { name: "Create document endpoints", subtasks: [
                "POST /documents/upload (multipart)",
                "GET /documents/:id/download",
                "GET /documents?entityType=&entityId=",
                "DELETE /documents/:id"
              ]},
              { name: "Build Upload component", subtasks: [
                "Drag and drop zone",
                "Click to browse",
                "Upload progress indicator",
                "File type validation (PDF, images)"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo document upload",
                "Review document types needed",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 22,
            title: "BOL & Rate Confirmation Generation",
            tasks: [
              { name: "Set up PDF generation", subtasks: [
                "Install pdf-lib or @react-pdf/renderer",
                "Create PDF template system",
                "Variable substitution from data"
              ]},
              { name: "Create BOL template", subtasks: [
                "Design BOL layout",
                "Include shipper and consignee info",
                "Include commodity details",
                "Include special instructions",
                "Add company logo placeholder"
              ]},
              { name: "Create Rate Confirmation template", subtasks: [
                "Design rate con layout",
                "Include carrier info",
                "Include pickup/delivery details",
                "Include rate and payment terms",
                "Signature block"
              ]},
              { name: "Create generation endpoints", subtasks: [
                "POST /orders/:id/documents/bol",
                "POST /loads/:id/documents/ratecon",
                "Generate PDF, store in S3, return URL"
              ]},
              { name: "Add document generation to UI", subtasks: [
                "Generate BOL button on Order detail",
                "Generate Rate Con button on Load detail",
                "Documents tab showing generated docs"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo BOL and Rate Con generation",
                "Review template designs",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          }
        ]
      },
      
      // =========================================================================
      // SECTION 5: BASIC INVOICING (Weeks 23-26)
      // =========================================================================
      {
        id: 5,
        name: "🔴 Basic Invoicing (Critical Path)",
        weeks: [
          {
            week: 23,
            title: "Invoice Model",
            tasks: [
              { name: "Create Invoice model", subtasks: [
                "Add invoiceNumber (auto-generated)",
                "Add customerId, orderId relations",
                "Add status enum: DRAFT, SENT, PAID, PARTIAL, OVERDUE, CANCELLED",
                "Add invoiceDate, dueDate",
                "Add subtotal, tax, total (Decimal)",
                "Add notes, terms"
              ]},
              { name: "Create InvoiceLineItem model", subtasks: [
                "Add invoiceId relation",
                "Add description",
                "Add quantity, rate, amount"
              ]},
              { name: "Implement invoice number generation", subtasks: [
                "Format: INV-{YEAR}-{SEQUENCE}",
                "Tenant-specific",
                "Thread-safe"
              ]},
              { name: "Create invoice endpoints", subtasks: [
                "GET /invoices with filters",
                "GET /invoices/:id",
                "POST /invoices",
                "PATCH /invoices/:id",
                "POST /invoices/:id/send"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Invoice model",
                "Review invoice fields",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 24,
            title: "Invoice UI",
            tasks: [
              { name: "Build Invoices list page", subtasks: [
                "DataTable with invoice#, customer, amount, status, due date",
                "Status filter tabs: All, Draft, Sent, Overdue, Paid",
                "Search by invoice# or customer",
                "Date range filter"
              ]},
              { name: "Build Invoice detail page", subtasks: [
                "Invoice header with status",
                "Customer info",
                "Line items table",
                "Totals section",
                "Payment history"
              ]},
              { name: "Build Invoice form", subtasks: [
                "Customer selector",
                "Order selector (auto-populate from order)",
                "Line items editor",
                "Due date picker",
                "Notes/terms"
              ]},
              { name: "Auto-create invoice from order", subtasks: [
                "Button on delivered order: 'Create Invoice'",
                "Pre-populate from order data",
                "Customer rate as main line item"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Invoice UI",
                "Test invoice creation flow",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 25,
            title: "Invoice PDF & Payments",
            tasks: [
              { name: "Create Invoice PDF template", subtasks: [
                "Professional invoice design",
                "Company logo and info",
                "Customer bill-to info",
                "Line items with amounts",
                "Totals and payment terms"
              ]},
              { name: "Create Payment model", subtasks: [
                "Add invoiceId relation",
                "Add amount (Decimal)",
                "Add paymentDate, paymentMethod",
                "Add referenceNumber, notes"
              ]},
              { name: "Create payment endpoints", subtasks: [
                "POST /invoices/:id/payments - record payment",
                "GET /invoices/:id/payments - list payments",
                "Auto-update invoice status (PARTIAL or PAID)"
              ]},
              { name: "Build payment recording UI", subtasks: [
                "Record Payment button on invoice",
                "Payment form modal",
                "Amount, date, method, reference",
                "Handle partial payments"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo Invoice PDF and payments",
                "Review payment workflow",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 26,
            title: "Basic AR & Carrier Payments",
            tasks: [
              { name: "Build AR Aging view", subtasks: [
                "Simple aging buckets: Current, 1-30, 31-60, 61-90, 90+",
                "List invoices in each bucket",
                "Total amounts per bucket"
              ]},
              { name: "Create basic carrier settlement", subtasks: [
                "View loads ready for payment (DELIVERED, not paid)",
                "Select loads to pay",
                "Record carrier payment with total"
              ]},
              { name: "Build simple dashboard", subtasks: [
                "Today's loads count",
                "This week revenue (sum of delivered orders)",
                "Outstanding AR total",
                "Outstanding AP total"
              ]},
              { name: "Final testing and fixes", subtasks: [
                "Test complete order-to-invoice flow",
                "Fix any bugs found",
                "Performance check"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Demo AR and carrier payments",
                "Final review of MVP features",
                "Confirm next week's priorities",
                "Document meeting notes"
              ]}
            ]
          }
        ]
      },
      
      // =========================================================================
      // SECTION 6: GO-LIVE & STABILIZATION (Weeks 27-28)
      // =========================================================================
      {
        id: 6,
        name: "🟢 Go-Live & Stabilization",
        weeks: [
          {
            week: 27,
            title: "Pre-Launch & Data Migration",
            tasks: [
              { name: "Production environment setup", subtasks: [
                "Set up production database",
                "Set up production Redis",
                "Configure production environment variables",
                "Set up basic monitoring (health checks)"
              ]},
              { name: "Data migration from current system", subtasks: [
                "Export customer list from HubSpot/current system",
                "Export carrier list",
                "Import companies with external_ids",
                "Verify data integrity"
              ]},
              { name: "Team training", subtasks: [
                "Create quick start guide",
                "Walk through order entry",
                "Walk through dispatch workflow",
                "Walk through invoicing"
              ]},
              { name: "Final testing on production", subtasks: [
                "Create test order end-to-end",
                "Verify all features work",
                "Performance check",
                "Fix any critical issues"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Final review before go-live",
                "Confirm launch plan",
                "Review rollback plan",
                "Document meeting notes"
              ]}
            ]
          },
          {
            week: 28,
            title: "🟢 INTERNAL TMS GO-LIVE",
            tasks: [
              { name: "🚀 Launch internal TMS", subtasks: [
                "Switch team to using new system",
                "Enter first real orders",
                "Dispatch first loads",
                "Generate first invoices"
              ]},
              { name: "Monitor and support", subtasks: [
                "Be available for questions",
                "Monitor error logs",
                "Track usage patterns",
                "Collect feedback"
              ]},
              { name: "Quick fixes", subtasks: [
                "Address any blocking issues immediately",
                "Note non-critical issues for next week",
                "Communicate fixes to team"
              ]},
              { name: "Document lessons learned", subtasks: [
                "What worked well",
                "What needs improvement",
                "Feature requests from team"
              ]},
              { name: "🎉 CELEBRATE MILESTONE!", subtasks: [
                "Team celebration",
                "You have a working TMS!",
                "Pat yourself on the back",
                "Plan Phase A.2 enhancements"
              ]},
              { name: "📅 STAKEHOLDER MEETING", subtasks: [
                "Celebrate go-live! 🎉",
                "Review first week feedback",
                "Prioritize immediate fixes",
                "Plan enhancement phase"
              ]}
            ]
          }
        ]
      },
      
      // =========================================================================
      // SECTION 7: ENHANCEMENTS - POST GO-LIVE (Weeks 29-50)
      // =========================================================================
      {
        id: 7,
        name: "🟡 Enhancements (Post Go-Live)",
        weeks: [
          { week: 29, title: "Week 1 Fixes & Feedback", tasks: [
            { name: "Address critical feedback", subtasks: ["Triage user feedback", "Fix high-priority issues", "Deploy fixes"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review week 1 in production", "Prioritize fixes", "Document notes"] }
          ]},
          { week: 30, title: "POD Management", tasks: [
            { name: "Implement POD workflow", subtasks: ["POD upload on load", "POD status tracking", "Require POD for invoicing (optional)"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo POD workflow", "Confirm priorities", "Document notes"] }
          ]},
          { week: 31, title: "Email Integration", tasks: [
            { name: "Set up email sending", subtasks: ["Configure SendGrid/SES", "Send invoice emails", "Send rate con to carrier"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo email sending", "Confirm priorities", "Document notes"] }
          ]},
          { week: 32, title: "Quote Management", tasks: [
            { name: "Add quote workflow", subtasks: ["QUOTE status flow", "Quote validity period", "Convert quote to order"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo quotes", "Confirm priorities", "Document notes"] }
          ]},
          { week: 33, title: "Rate Tables (Basic)", tasks: [
            { name: "Create rate table model", subtasks: ["Customer-specific rates", "Lane-based rates", "Rate lookup on order"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo rate tables", "Confirm priorities", "Document notes"] }
          ]},
          { week: 34, title: "FMCSA Integration", tasks: [
            { name: "Integrate FMCSA lookup", subtasks: ["Lookup by MC/DOT", "Auto-populate carrier info", "Authority status check"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo FMCSA lookup", "Confirm priorities", "Document notes"] }
          ]},
          { week: 35, title: "Insurance & Compliance", tasks: [
            { name: "Add insurance tracking", subtasks: ["Insurance expiration dates", "Expiration alerts", "Block dispatch if expired"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo insurance tracking", "Confirm priorities", "Document notes"] }
          ]},
          { week: 36, title: "Carrier Scorecard", tasks: [
            { name: "Build carrier scorecard", subtasks: ["On-time pickup %", "On-time delivery %", "Claims count", "Display on carrier detail"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo scorecard", "Confirm priorities", "Document notes"] }
          ]},
          { week: 37, title: "Carrier Onboarding Wizard", tasks: [
            { name: "Build onboarding wizard", subtasks: ["Step-by-step carrier setup", "FMCSA lookup step", "Document upload step"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo wizard", "Confirm priorities", "Document notes"] }
          ]},
          { week: 38, title: "Commission Tracking", tasks: [
            { name: "Add commission calculation", subtasks: ["Sales rep assignment on order", "Commission rules", "Commission report"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo commissions", "Confirm priorities", "Document notes"] }
          ]},
          { week: 39, title: "Tracking Map", tasks: [
            { name: "Build tracking map", subtasks: ["Set up Mapbox", "Plot in-transit loads", "Click marker for details"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo map", "Confirm priorities", "Document notes"] }
          ]},
          { week: 40, title: "HubSpot Integration", tasks: [
            { name: "Sync with HubSpot (if still needed)", subtasks: ["Company sync", "Contact sync", "Two-way sync"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo HubSpot sync", "Confirm priorities", "Document notes"] }
          ]},
          { week: 41, title: "DAT Rate Integration", tasks: [
            { name: "Integrate DAT RateView", subtasks: ["API connection", "Show market rates on order", "Lane analysis"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo DAT rates", "Confirm priorities", "Document notes"] }
          ]},
          { week: 42, title: "Accessorials", tasks: [
            { name: "Add accessorial charges", subtasks: ["Accessorial types config", "Add to orders", "Include in invoicing"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo accessorials", "Confirm priorities", "Document notes"] }
          ]},
          { week: 43, title: "Bulk Operations", tasks: [
            { name: "Add bulk actions", subtasks: ["Bulk status update", "Bulk invoice generation", "Bulk export"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo bulk ops", "Confirm priorities", "Document notes"] }
          ]},
          { week: 44, title: "Import/Export", tasks: [
            { name: "Add data import/export", subtasks: ["CSV export for reports", "CSV import for customers/carriers", "Excel export"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo import/export", "Confirm priorities", "Document notes"] }
          ]},
          { week: 45, title: "Reporting - Part 1", tasks: [
            { name: "Build basic reports", subtasks: ["Load summary report", "Revenue report", "Customer activity report"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo reports", "Confirm priorities", "Document notes"] }
          ]},
          { week: 46, title: "Reporting - Part 2", tasks: [
            { name: "Build more reports", subtasks: ["Carrier performance report", "Lane analysis report", "AR aging report (enhanced)"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo reports", "Confirm priorities", "Document notes"] }
          ]},
          { week: 47, title: "Dashboard Enhancement", tasks: [
            { name: "Build executive dashboard", subtasks: ["KPI cards", "Charts (revenue, load count)", "Date range selector"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo dashboard", "Confirm priorities", "Document notes"] }
          ]},
          { week: 48, title: "Audit Trail", tasks: [
            { name: "Implement audit logging", subtasks: ["Log all changes to orders/loads", "Who changed what when", "Audit history view"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo audit trail", "Confirm priorities", "Document notes"] }
          ]},
          { week: 49, title: "Credit Management", tasks: [
            { name: "Add credit limits", subtasks: ["Credit limit per customer", "Credit check on order", "Block if over limit"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo credit management", "Confirm priorities", "Document notes"] }
          ]},
          { week: 50, title: "Claims Management", tasks: [
            { name: "Add claims tracking", subtasks: ["File claim on load", "Claim status workflow", "Claims report"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo claims", "Confirm priorities", "Document notes"] }
          ]}
        ]
      },
      
      // =========================================================================
      // SECTION 8: GOVERNANCE & OPERATIONS DOCS (Weeks 51-62)
      // =========================================================================
      {
        id: 8,
        name: "⚪ Governance & Operations (Deferred)",
        weeks: [
          { week: 51, title: "Testing Strategy", tasks: [
            { name: "Document and implement testing", subtasks: ["Define coverage targets (80% unit)", "Set up Jest properly", "Set up Playwright E2E", "Add to CI"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review testing strategy", "Confirm priorities", "Document notes"] }
          ]},
          { week: 52, title: "Monitoring Setup", tasks: [
            { name: "Set up monitoring", subtasks: ["Prometheus metrics", "Grafana dashboards", "Alerting rules"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo monitoring", "Confirm priorities", "Document notes"] }
          ]},
          { week: 53, title: "Error Tracking", tasks: [
            { name: "Set up Sentry", subtasks: ["Configure Sentry", "Source maps", "Alert on errors"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo Sentry", "Confirm priorities", "Document notes"] }
          ]},
          { week: 54, title: "SLA Documentation", tasks: [
            { name: "Document SLAs", subtasks: ["99.9% uptime target", "Response time targets", "Support levels"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review SLAs", "Confirm priorities", "Document notes"] }
          ]},
          { week: 55, title: "API Documentation", tasks: [
            { name: "Complete API docs", subtasks: ["Review all endpoints", "Add examples", "Publish docs"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review API docs", "Confirm priorities", "Document notes"] }
          ]},
          { week: 56, title: "ERD & Data Model Docs", tasks: [
            { name: "Document data model", subtasks: ["Generate ERD", "Document relationships", "Create data dictionary"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review data model docs", "Confirm priorities", "Document notes"] }
          ]},
          { week: 57, title: "Disaster Recovery", tasks: [
            { name: "Create DR plan", subtasks: ["Define RTO/RPO", "Backup verification", "Recovery procedures", "DR drill"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review DR plan", "Confirm priorities", "Document notes"] }
          ]},
          { week: 58, title: "Data Governance", tasks: [
            { name: "Document data governance", subtasks: ["Data classification", "Retention policies", "GDPR/CCPA compliance"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review data governance", "Confirm priorities", "Document notes"] }
          ]},
          { week: 59, title: "User Personas Documentation", tasks: [
            { name: "Document user personas", subtasks: ["Maria (Dispatcher)", "James (Sales)", "Sarah (Ops Manager)", "Carlos (Driver)", "Emily (AR)", "Mike (Customer)"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review personas", "Confirm priorities", "Document notes"] }
          ]},
          { week: 60, title: "Competitive Analysis", tasks: [
            { name: "Document competitive analysis", subtasks: ["McLeod, TMW, Rose Rocket, Aljex", "Feature comparison matrix", "Differentiation strategy"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review competitive analysis", "Confirm priorities", "Document notes"] }
          ]},
          { week: 61, title: "Cost Modeling", tasks: [
            { name: "Document cost model", subtasks: ["Infrastructure costs by phase", "COGS per tenant", "Break-even analysis"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review cost model", "Confirm priorities", "Document notes"] }
          ]},
          { week: 62, title: "Governance Complete", tasks: [
            { name: "Finalize governance docs", subtasks: ["Review all docs", "Get stakeholder sign-off", "Publish internally"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate governance complete! 🎉", "Plan portals phase", "Document notes"] }
          ]}
        ]
      },
      
      // =========================================================================
      // SECTION 9: PORTALS & ADVANCED (Weeks 63-80)
      // =========================================================================
      {
        id: 9,
        name: "⚪ Portals & Advanced (Deferred)",
        weeks: [
          { week: 63, title: "Customer Portal - Backend", tasks: [
            { name: "Build customer portal API", subtasks: ["Portal authentication", "GET /portal/shipments", "GET /portal/invoices"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo portal API", "Confirm priorities", "Document notes"] }
          ]},
          { week: 64, title: "Customer Portal - UI", tasks: [
            { name: "Build customer portal UI", subtasks: ["Portal login page", "Shipments list", "Shipment tracking", "Invoice list"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo customer portal", "Confirm priorities", "Document notes"] }
          ]},
          { week: 65, title: "Carrier Portal - Backend", tasks: [
            { name: "Build carrier portal API", subtasks: ["Carrier authentication", "Available loads", "Accept/reject loads", "Document upload"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo carrier portal API", "Confirm priorities", "Document notes"] }
          ]},
          { week: 66, title: "Carrier Portal - UI", tasks: [
            { name: "Build carrier portal UI", subtasks: ["Portal login", "Available loads list", "My loads", "Settlement history"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo carrier portal", "Confirm priorities", "Document notes"] }
          ]},
          { week: 67, title: "Driver Mobile API", tasks: [
            { name: "Build driver API", subtasks: ["Driver authentication", "GET /driver/loads", "POST /driver/check-in", "POST /driver/pod"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo driver API", "Confirm priorities", "Document notes"] }
          ]},
          { week: 68, title: "Communication Hub", tasks: [
            { name: "Build communication features", subtasks: ["Email templates", "SMS integration (Twilio)", "Message history"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo communication", "Confirm priorities", "Document notes"] }
          ]},
          { week: 69, title: "Notification System", tasks: [
            { name: "Build notifications", subtasks: ["In-app notifications", "Email notifications", "User preferences"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo notifications", "Confirm priorities", "Document notes"] }
          ]},
          { week: 70, title: "QuickBooks Integration", tasks: [
            { name: "Integrate QuickBooks", subtasks: ["OAuth connection", "Sync invoices", "Sync payments"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo QuickBooks", "Confirm priorities", "Document notes"] }
          ]},
          { week: 71, title: "EDI - Basic", tasks: [
            { name: "Basic EDI support", subtasks: ["EDI 204 tender", "EDI 214 status", "EDI 210 invoice"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo EDI", "Confirm priorities", "Document notes"] }
          ]},
          { week: 72, title: "Custom Fields Engine", tasks: [
            { name: "Build custom fields", subtasks: ["Field type definitions", "Entity configuration", "UI rendering"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo custom fields", "Confirm priorities", "Document notes"] }
          ]},
          { week: 73, title: "Workflow Automation", tasks: [
            { name: "Build workflow engine", subtasks: ["Trigger definitions", "Action execution", "Workflow builder UI"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo workflows", "Confirm priorities", "Document notes"] }
          ]},
          { week: 74, title: "Advanced Search", tasks: [
            { name: "Implement full-text search", subtasks: ["PostgreSQL FTS", "Global search bar", "Categorized results"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo search", "Confirm priorities", "Document notes"] }
          ]},
          { week: 75, title: "Accessibility - Part 1", tasks: [
            { name: "Accessibility audit", subtasks: ["Run axe-core", "Fix critical issues", "Keyboard navigation"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review accessibility", "Confirm priorities", "Document notes"] }
          ]},
          { week: 76, title: "Accessibility - Part 2", tasks: [
            { name: "Complete WCAG 2.1 AA", subtasks: ["Screen reader testing", "ARIA labels", "Focus management"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review accessibility", "Confirm priorities", "Document notes"] }
          ]},
          { week: 77, title: "i18n Setup", tasks: [
            { name: "Set up internationalization", subtasks: ["Install i18next", "Extract strings", "Multi-currency support"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo i18n setup", "Confirm priorities", "Document notes"] }
          ]},
          { week: 78, title: "Spanish Translation", tasks: [
            { name: "Translate to Spanish", subtasks: ["Core UI translation", "Driver mobile translation", "Review with native speakers"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo Spanish UI", "Confirm priorities", "Document notes"] }
          ]},
          { week: 79, title: "Training Content", tasks: [
            { name: "Create training content", subtasks: ["Video tutorials", "User guides", "In-app help tooltips"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review training content", "Confirm priorities", "Document notes"] }
          ]},
          { week: 80, title: "Onboarding Wizard", tasks: [
            { name: "Build user onboarding", subtasks: ["Welcome wizard", "Feature tours", "Contextual help"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo onboarding", "Confirm priorities", "Document notes"] }
          ]}
        ]
      },
      
      // =========================================================================
      // SECTION 10: PHASE A POLISH & COMPLETE (Weeks 81-94)
      // =========================================================================
      {
        id: 10,
        name: "⚪ Phase A Polish & Completion",
        weeks: [
          { week: 81, title: "Performance Tuning", tasks: [
            { name: "Optimize performance", subtasks: ["Profile slow queries", "Add database indexes", "Optimize N+1 queries", "Add caching"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review performance", "Confirm priorities", "Document notes"] }
          ]},
          { week: 82, title: "Security Hardening", tasks: [
            { name: "Security audit", subtasks: ["Review auth flows", "Input validation", "SQL injection check", "XSS prevention"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review security", "Confirm priorities", "Document notes"] }
          ]},
          { week: 83, title: "Test Coverage", tasks: [
            { name: "Increase test coverage", subtasks: ["Add unit tests for uncovered code", "Add E2E tests for critical paths", "Run full test suite"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review test coverage", "Confirm priorities", "Document notes"] }
          ]},
          { week: 84, title: "Documentation", tasks: [
            { name: "Complete documentation", subtasks: ["Update API docs", "Update user guides", "Admin documentation"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review docs", "Confirm priorities", "Document notes"] }
          ]},
          { week: 85, title: "Bug Fixes - Week 1", tasks: [
            { name: "Fix outstanding bugs", subtasks: ["Triage bug list", "Fix high priority", "Verify fixes"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review bug status", "Confirm priorities", "Document notes"] }
          ]},
          { week: 86, title: "Bug Fixes - Week 2", tasks: [
            { name: "Continue bug fixes", subtasks: ["Fix medium priority bugs", "Regression testing"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review bug status", "Confirm priorities", "Document notes"] }
          ]},
          { week: 87, title: "UI Polish - Part 1", tasks: [
            { name: "Polish UI", subtasks: ["Fix alignment issues", "Improve loading states", "Polish animations"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review UI polish", "Confirm priorities", "Document notes"] }
          ]},
          { week: 88, title: "UI Polish - Part 2", tasks: [
            { name: "Mobile responsiveness", subtasks: ["Test all screens on mobile", "Fix responsive issues"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review mobile", "Confirm priorities", "Document notes"] }
          ]},
          { week: 89, title: "Load Testing", tasks: [
            { name: "Performance testing", subtasks: ["Load test with k6 or similar", "Verify response times", "Check memory usage"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review load tests", "Confirm priorities", "Document notes"] }
          ]},
          { week: 90, title: "Security Scan", tasks: [
            { name: "Final security checks", subtasks: ["Run security scanner", "Verify all fixes applied", "Check SSL config"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review security scan", "Confirm priorities", "Document notes"] }
          ]},
          { week: 91, title: "Backup Verification", tasks: [
            { name: "Verify backups", subtasks: ["Test backup restore", "Verify backup schedule", "Document recovery process"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review backups", "Confirm priorities", "Document notes"] }
          ]},
          { week: 92, title: "UAT", tasks: [
            { name: "User acceptance testing", subtasks: ["Full system test", "Team testing", "Collect feedback", "Fix critical issues"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review UAT results", "Confirm priorities", "Document notes"] }
          ]},
          { week: 93, title: "Phase A Prep", tasks: [
            { name: "Prepare Phase B", subtasks: ["Review Phase B scope", "Prioritize features", "Create sprint plan"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review Phase B plan", "Confirm priorities", "Document notes"] }
          ]},
          { week: 94, title: "✅ Phase A Complete", tasks: [
            { name: "Phase A retrospective", subtasks: ["What went well", "What to improve", "Lessons learned"] },
            { name: "Celebrate Phase A! 🎉", subtasks: ["Team celebration", "Document achievements", "Prepare for Phase B"] },
            { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Phase A! 🎉", "Preview Phase B", "Document notes"] }
          ]}
        ]
      }
    ]
  },
  B: {
    name: "Phase B - Enhancement",
    weeks: 30,
    start: 95,
    description: "Built-in CRM, advanced TMS features, platform enhancement",
    icon: "🚀",
    color: "amber",
    sections: [
      {
        id: 1,
        name: "Built-in CRM (Replace HubSpot)",
        weeks: [
          { week: 95, title: "CRM Core", tasks: [{ name: "Build internal CRM", subtasks: ["Opportunity pipeline", "Lead scoring", "Activity tracking"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review CRM plans", "Document notes"] }] },
          { week: 96, title: "Pipeline UI", tasks: [{ name: "Build pipeline board", subtasks: ["Kanban layout", "Drag and drop", "Stage configuration"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo pipeline", "Document notes"] }] },
          { week: 97, title: "Sales Activities", tasks: [{ name: "Activity logging", subtasks: ["Call, email, meeting logging", "Activity timeline", "Reminders"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo activities", "Document notes"] }] },
          { week: 98, title: "Email Integration", tasks: [{ name: "Email tracking", subtasks: ["Track opens/clicks", "Email composer", "Templates"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo email", "Document notes"] }] },
          { week: 99, title: "Sales Automation", tasks: [{ name: "Automation rules", subtasks: ["Triggers and actions", "Workflow builder"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo automation", "Document notes"] }] },
          { week: 100, title: "CRM Go-Live", tasks: [{ name: "Migrate from HubSpot", subtasks: ["Export/import data", "Verify", "Switch over"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate CRM! 🎉", "Document notes"] }] }
        ]
      },
      {
        id: 2,
        name: "Advanced TMS Features",
        weeks: [
          { week: 101, title: "Multi-stop Optimization", tasks: [{ name: "Route optimization", subtasks: ["Distance calculations", "Optimal sequence", "Time windows"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo optimization", "Document notes"] }] },
          { week: 102, title: "Appointment Scheduling", tasks: [{ name: "Appointment system", subtasks: ["Slot management", "Booking rules", "Notifications"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo appointments", "Document notes"] }] },
          { week: 103, title: "Temperature Monitoring", tasks: [{ name: "Temp tracking", subtasks: ["Sensor integration", "Alerts", "Historical data"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo temp monitoring", "Document notes"] }] },
          { week: 104, title: "Load Optimization", tasks: [{ name: "Load planning", subtasks: ["Consolidation", "Backhaul matching", "Capacity planning"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo load planning", "Document notes"] }] },
          { week: 105, title: "Advanced Accessorials", tasks: [{ name: "Accessorial engine", subtasks: ["Auto-detection", "Rules engine", "Billing integration"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo accessorials", "Document notes"] }] },
          { week: 106, title: "TMS Enhancements Complete", tasks: [{ name: "TMS review", subtasks: ["Test all features", "Documentation", "Training update"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review TMS enhancements", "Document notes"] }] }
        ]
      },
      {
        id: 3,
        name: "Platform Enhancement",
        weeks: [
          { week: 107, title: "Report Builder", tasks: [{ name: "Advanced reporting", subtasks: ["Calculated fields", "Pivot tables", "Scheduling"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo reports", "Document notes"] }] },
          { week: 108, title: "Dashboard Builder", tasks: [{ name: "Custom dashboards", subtasks: ["Widget library", "Drag and drop", "User-specific"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo dashboards", "Document notes"] }] },
          { week: 109, title: "Mobile App - Part 1", tasks: [{ name: "Mobile optimization", subtasks: ["Responsive layouts", "Touch-friendly", "Offline support"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo mobile", "Document notes"] }] },
          { week: 110, title: "Mobile App - Part 2", tasks: [{ name: "Mobile features", subtasks: ["Push notifications", "Camera for POD", "GPS tracking"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo mobile features", "Document notes"] }] },
          { week: 111, title: "API Enhancements", tasks: [{ name: "Public API", subtasks: ["Additional endpoints", "Webhooks", "Rate limiting"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo API", "Document notes"] }] },
          { week: 112, title: "Integration Hub", tasks: [{ name: "Integration framework", subtasks: ["OAuth flows", "Credential management", "Marketplace UI"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo integrations", "Document notes"] }] }
        ]
      },
      {
        id: 4,
        name: "Load Board & Factoring",
        weeks: [
          { week: 113, title: "Load Board Posting", tasks: [{ name: "Load board integration", subtasks: ["DAT posting", "Truckstop posting", "Auto-refresh"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo load boards", "Document notes"] }] },
          { week: 114, title: "Load Board Search", tasks: [{ name: "Load board search", subtasks: ["Search available loads", "Carrier matching", "Rate comparison"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo search", "Document notes"] }] },
          { week: 115, title: "Factoring Integration", tasks: [{ name: "Factoring connection", subtasks: ["API integration", "Invoice submission", "Payment tracking"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo factoring", "Document notes"] }] },
          { week: 116, title: "Quick Pay", tasks: [{ name: "Quick pay for carriers", subtasks: ["Immediate payment option", "Fee calculation", "Processing"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo quick pay", "Document notes"] }] }
        ]
      },
      {
        id: 5,
        name: "Phase B Completion",
        weeks: [
          { week: 117, title: "UI/UX Polish", tasks: [{ name: "Design refinement", subtasks: ["Consistency review", "Animation polish", "Dark mode"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review polish", "Document notes"] }] },
          { week: 118, title: "Performance", tasks: [{ name: "Optimization", subtasks: ["Database tuning", "Frontend optimization", "CDN setup"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review performance", "Document notes"] }] },
          { week: 119, title: "Bug Fixes", tasks: [{ name: "Fix Phase B bugs", subtasks: ["Triage", "Fix", "Test"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review bugs", "Document notes"] }] },
          { week: 120, title: "Documentation", tasks: [{ name: "Update all docs", subtasks: ["API docs", "User guides", "Training"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review docs", "Document notes"] }] },
          { week: 121, title: "Testing", tasks: [{ name: "Full regression", subtasks: ["All features", "All integrations", "Performance"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review testing", "Document notes"] }] },
          { week: 122, title: "Deployment", tasks: [{ name: "Deploy Phase B", subtasks: ["Production deploy", "Monitor", "Fix issues"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review deployment", "Document notes"] }] },
          { week: 123, title: "Stabilization", tasks: [{ name: "Stabilize", subtasks: ["Monitor usage", "Fix issues", "Optimize"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review stability", "Document notes"] }] },
          { week: 124, title: "✅ Phase B Complete", tasks: [{ name: "Phase B complete", subtasks: ["Retrospective", "Celebrate! 🎉", "Plan Phase C"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Phase B! 🎉", "Preview Phase C", "Document notes"] }] }
        ]
      }
    ]
  },
  C: {
    name: "Phase C - SaaS + Verticals",
    weeks: 26,
    start: 125,
    description: "Multi-tenant SaaS, Fleet, Trucking, Drayage verticals",
    icon: "🌐",
    color: "green",
    sections: [
      { id: 1, name: "Multi-Tenant SaaS", weeks: [
        { week: 125, title: "Tenant Isolation", tasks: [{ name: "Strengthen isolation", subtasks: ["Row-level security", "Storage isolation"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review isolation", "Document notes"] }] },
        { week: 126, title: "Subscription Billing", tasks: [{ name: "Stripe integration", subtasks: ["Products/prices", "Checkout", "Billing portal"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo billing", "Document notes"] }] },
        { week: 127, title: "Self-Service Signup", tasks: [{ name: "Public signup", subtasks: ["Signup flow", "Plan selection", "Onboarding wizard"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo signup", "Document notes"] }] },
        { week: 128, title: "White Label", tasks: [{ name: "White label support", subtasks: ["Custom domains", "Custom branding", "Email customization"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo white label", "Document notes"] }] }
      ]},
      { id: 2, name: "Fleet Management", weeks: [
        { week: 129, title: "Asset Management", tasks: [{ name: "Asset tracking", subtasks: ["Vehicles/trailers", "Maintenance schedules", "Cost tracking"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo assets", "Document notes"] }] },
        { week: 130, title: "GPS/Telematics", tasks: [{ name: "Telematics integration", subtasks: ["Samsara/KeepTruckin", "Real-time positions", "Engine diagnostics"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo telematics", "Document notes"] }] },
        { week: 131, title: "Maintenance", tasks: [{ name: "Maintenance scheduling", subtasks: ["Service schedules", "Work orders", "Parts inventory"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo maintenance", "Document notes"] }] },
        { week: 132, title: "Fuel Management", tasks: [{ name: "Fuel tracking", subtasks: ["Fuel card import", "MPG calculations", "Cost analysis"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo fuel", "Document notes"] }] },
        { week: 133, title: "Fleet Go-Live", tasks: [{ name: "🟢 FLEET LIVE", subtasks: ["Enable for customers", "Monitor", "Iterate"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Fleet! 🎉", "Document notes"] }] }
      ]},
      { id: 3, name: "Trucking Company", weeks: [
        { week: 134, title: "Own-Fleet Dispatch", tasks: [{ name: "Driver dispatch", subtasks: ["Driver assignment", "Trip planning", "HOS awareness"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo dispatch", "Document notes"] }] },
        { week: 135, title: "Driver Settlement", tasks: [{ name: "Settlement system", subtasks: ["Pay calculations", "Deductions", "Pay stubs"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo settlement", "Document notes"] }] },
        { week: 136, title: "IFTA/IRP", tasks: [{ name: "IFTA reporting", subtasks: ["State mileage", "Tax calculations", "Filing export"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo IFTA", "Document notes"] }] },
        { week: 137, title: "HOS/ELD", tasks: [{ name: "ELD integration", subtasks: ["HOS data", "Violations", "Driver scorecards"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo HOS", "Document notes"] }] },
        { week: 138, title: "Trucking Go-Live", tasks: [{ name: "🟢 TRUCKING LIVE", subtasks: ["Enable for customers", "Monitor", "Iterate"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Trucking! 🎉", "Document notes"] }] }
      ]},
      { id: 4, name: "Drayage & Intermodal", weeks: [
        { week: 139, title: "Container Management", tasks: [{ name: "Container tracking", subtasks: ["Container lifecycle", "LFD tracking", "Demurrage"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo containers", "Document notes"] }] },
        { week: 140, title: "Port Operations", tasks: [{ name: "Port integration", subtasks: ["Appointments", "Container status", "Wait times"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo port ops", "Document notes"] }] },
        { week: 141, title: "Intermodal", tasks: [{ name: "Intermodal features", subtasks: ["Rail integration", "Free time", "Dual transactions"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo intermodal", "Document notes"] }] },
        { week: 142, title: "Drayage Go-Live", tasks: [{ name: "🟢 DRAYAGE LIVE", subtasks: ["Enable for customers", "Monitor", "Iterate"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Drayage! 🎉", "Document notes"] }] }
      ]},
      { id: 5, name: "SaaS Launch", weeks: [
        { week: 143, title: "Marketing Site", tasks: [{ name: "Build website", subtasks: ["Homepage", "Features", "Pricing"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review site", "Document notes"] }] },
        { week: 144, title: "Support Setup", tasks: [{ name: "Help desk", subtasks: ["Intercom/Zendesk", "Knowledge base", "In-app help"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo support", "Document notes"] }] },
        { week: 145, title: "Launch Prep", tasks: [{ name: "Launch preparation", subtasks: ["Load testing", "Security audit", "Backup verify"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review readiness", "Document notes"] }] },
        { week: 146, title: "Public Launch", tasks: [{ name: "🟢 SAAS LAUNCH", subtasks: ["Open signups", "Marketing campaign", "Monitor"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Launch! 🎉", "Document notes"] }] },
        { week: 147, title: "Post-Launch Week 1", tasks: [{ name: "Stabilize", subtasks: ["Monitor", "Fix issues", "Support customers"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review week 1", "Document notes"] }] },
        { week: 148, title: "Post-Launch Week 2", tasks: [{ name: "Optimize", subtasks: ["Address feedback", "Improve UX", "Performance"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review week 2", "Document notes"] }] },
        { week: 149, title: "Phase C Testing", tasks: [{ name: "Full testing", subtasks: ["All verticals", "Billing", "White label"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review testing", "Document notes"] }] },
        { week: 150, title: "✅ Phase C Complete", tasks: [{ name: "Phase C complete", subtasks: ["Retrospective", "Celebrate! 🎉", "Plan Phase D"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Phase C! 🎉", "Preview Phase D", "Document notes"] }] }
      ]}
    ]
  },
  D: {
    name: "Phase D - Forwarding + Warehouse",
    weeks: 20,
    start: 151,
    description: "Freight forwarding and warehouse management verticals",
    icon: "📦",
    color: "purple",
    sections: [
      { id: 1, name: "Freight Forwarding", weeks: [
        { week: 151, title: "Booking Management", tasks: [{ name: "Ocean/air booking", subtasks: ["Vessel/voyage", "Port pairs", "Container allocation"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo booking", "Document notes"] }] },
        { week: 152, title: "Documentation", tasks: [{ name: "Forwarding docs", subtasks: ["Bill of lading", "Commercial invoice", "Packing list"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo docs", "Document notes"] }] },
        { week: 153, title: "Customs", tasks: [{ name: "Customs integration", subtasks: ["ISF filing", "HTS classification", "Duty calculation"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo customs", "Document notes"] }] },
        { week: 154, title: "Multi-modal", tasks: [{ name: "Multi-modal", subtasks: ["Ocean + truck", "Air + ground", "Cross-dock"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo multi-modal", "Document notes"] }] },
        { week: 155, title: "Agent Network", tasks: [{ name: "Agent management", subtasks: ["Agent directory", "Commissions", "Communication"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo agents", "Document notes"] }] },
        { week: 156, title: "Forwarding Go-Live", tasks: [{ name: "🟢 FORWARDING LIVE", subtasks: ["Enable", "Monitor", "Iterate"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Forwarding! 🎉", "Document notes"] }] }
      ]},
      { id: 2, name: "Warehouse Management", weeks: [
        { week: 157, title: "Warehouse Setup", tasks: [{ name: "Warehouse model", subtasks: ["Zones", "Bin locations", "Capacity"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo warehouse", "Document notes"] }] },
        { week: 158, title: "Inventory", tasks: [{ name: "Inventory management", subtasks: ["SKUs", "Lot/serial tracking", "Stock levels"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo inventory", "Document notes"] }] },
        { week: 159, title: "Inbound", tasks: [{ name: "Receiving", subtasks: ["ASN processing", "Put-away", "Quality checks"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo receiving", "Document notes"] }] },
        { week: 160, title: "Outbound", tasks: [{ name: "Fulfillment", subtasks: ["Order allocation", "Picking", "Packing"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo fulfillment", "Document notes"] }] },
        { week: 161, title: "Returns", tasks: [{ name: "Returns processing", subtasks: ["RMA", "Inspection", "Disposition"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo returns", "Document notes"] }] },
        { week: 162, title: "Warehouse Go-Live", tasks: [{ name: "🟢 WAREHOUSE LIVE", subtasks: ["Enable", "Monitor", "Iterate"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Warehouse! 🎉", "Document notes"] }] }
      ]},
      { id: 3, name: "Phase D Completion", weeks: [
        { week: 163, title: "Cross-vertical", tasks: [{ name: "Unified visibility", subtasks: ["Single shipment view", "Multi-mode tracking"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo unified view", "Document notes"] }] },
        { week: 164, title: "Analytics", tasks: [{ name: "Cross-vertical reporting", subtasks: ["Combined dashboards", "Benchmarks"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo analytics", "Document notes"] }] },
        { week: 165, title: "Performance", tasks: [{ name: "Scale optimization", subtasks: ["Database tuning", "Caching"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review performance", "Document notes"] }] },
        { week: 166, title: "Documentation", tasks: [{ name: "Vertical docs", subtasks: ["User guides", "Videos", "Certifications"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review docs", "Document notes"] }] },
        { week: 167, title: "Bug Fixes", tasks: [{ name: "Fix all issues", subtasks: ["Triage", "Fix", "Test"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review bugs", "Document notes"] }] },
        { week: 168, title: "Testing", tasks: [{ name: "Full regression", subtasks: ["All verticals", "Integrations"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review testing", "Document notes"] }] },
        { week: 169, title: "Deployment", tasks: [{ name: "Deploy Phase D", subtasks: ["Production", "Monitor"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review deployment", "Document notes"] }] },
        { week: 170, title: "✅ Phase D Complete", tasks: [{ name: "Phase D complete", subtasks: ["Retrospective", "Celebrate! 🎉", "Plan Phase E"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Phase D! 🎉", "Preview Phase E", "Document notes"] }] }
      ]}
    ]
  },
  E: {
    name: "Phase E - Specialty + Marketplace",
    weeks: 16,
    start: 171,
    description: "Specialty logistics verticals and load marketplace",
    icon: "🏆",
    color: "teal",
    sections: [
      { id: 1, name: "Specialty Logistics", weeks: [
        { week: 171, title: "Hazmat", tasks: [{ name: "Hazmat compliance", subtasks: ["Classes", "Placards", "Routes", "Certs"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo hazmat", "Document notes"] }] },
        { week: 172, title: "Temperature-Controlled", tasks: [{ name: "Temp logistics", subtasks: ["Profiles", "Monitoring", "Alerts"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo temp", "Document notes"] }] },
        { week: 173, title: "Oversized", tasks: [{ name: "Heavy haul", subtasks: ["Permits", "Escorts", "Route surveys"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo oversized", "Document notes"] }] },
        { week: 174, title: "High-Value", tasks: [{ name: "White glove", subtasks: ["Insurance", "Signatures", "Photos"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo high-value", "Document notes"] }] },
        { week: 175, title: "Specialty Go-Live", tasks: [{ name: "🟢 SPECIALTY LIVE", subtasks: ["Enable modules", "Monitor"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Specialty! 🎉", "Document notes"] }] }
      ]},
      { id: 2, name: "Load Marketplace", weeks: [
        { week: 176, title: "Marketplace API", tasks: [{ name: "Marketplace backend", subtasks: ["Load posting", "Carrier matching", "Bidding"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo API", "Document notes"] }] },
        { week: 177, title: "Matching Engine", tasks: [{ name: "Carrier matching", subtasks: ["Lane preferences", "Equipment", "Compliance"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo matching", "Document notes"] }] },
        { week: 178, title: "Bidding System", tasks: [{ name: "Bidding workflow", subtasks: ["Real-time bids", "Counter-offers", "Auto-accept"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo bidding", "Document notes"] }] },
        { week: 179, title: "Marketplace UI", tasks: [{ name: "Marketplace interface", subtasks: ["Load board", "Carrier search", "Booking"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo UI", "Document notes"] }] },
        { week: 180, title: "Mobile", tasks: [{ name: "Mobile marketplace", subtasks: ["PWA", "Push notifications", "Offline"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo mobile", "Document notes"] }] },
        { week: 181, title: "Marketplace Go-Live", tasks: [{ name: "🟢 MARKETPLACE LIVE", subtasks: ["Launch", "Onboard carriers", "Monitor"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Celebrate Marketplace! 🎉", "Document notes"] }] }
      ]},
      { id: 3, name: "Platform Maturity", weeks: [
        { week: 182, title: "AI/ML", tasks: [{ name: "AI features", subtasks: ["Rate prediction", "Demand forecasting", "Anomaly detection"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo AI", "Document notes"] }] },
        { week: 183, title: "API Economy", tasks: [{ name: "API offerings", subtasks: ["Developer portal", "API marketplace", "Partners"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo API portal", "Document notes"] }] },
        { week: 184, title: "Enterprise", tasks: [{ name: "Enterprise tier", subtasks: ["SSO/SAML", "Advanced security", "Custom SLAs"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Demo enterprise", "Document notes"] }] },
        { week: 185, title: "Final Optimization", tasks: [{ name: "Platform optimization", subtasks: ["Performance", "Cost", "Security"] }, { name: "📅 STAKEHOLDER MEETING", subtasks: ["Review optimization", "Document notes"] }] },
        { week: 186, title: "🏆 PLATFORM COMPLETE", tasks: [{ name: "Full platform live", subtasks: ["All verticals", "Marketplace active", "Enterprise ready", "Celebrate! 🎉🎊🥳"] }, { name: "📅 FINAL MEETING", subtasks: ["Present complete platform", "Review 186-week journey", "Major celebration! 🎉🎊🥳"] }] }
      ]}
    ]
  }
};

// Calculate stats
const calculateStats = (roadmap) => {
  let totalTasks = 0;
  let totalSubtasks = 0;
  let totalMeetings = 0;
  
  Object.values(roadmap).forEach(phase => {
    phase.sections.forEach(section => {
      section.weeks.forEach(week => {
        week.tasks.forEach(task => {
          totalTasks++;
          totalSubtasks += task.subtasks.length;
          if (task.name.includes('STAKEHOLDER MEETING')) totalMeetings++;
        });
      });
    });
  });
  
  return { totalTasks, totalSubtasks, totalMeetings };
};

export default function PriorityRoadmap() {
  const [activePhase, setActivePhase] = useState('A');
  const [expandedSection, setExpandedSection] = useState(1);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedTasks, setCompletedTasks] = useState({});

  const currentPhase = ROADMAP[activePhase];
  const stats = useMemo(() => calculateStats(ROADMAP), []);

  const toggleComplete = (weekNum, taskIdx, subIdx) => {
    const key = `${weekNum}-${taskIdx}-${subIdx}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const phaseColors = {
    blue: 'from-blue-600 to-blue-500',
    amber: 'from-amber-600 to-amber-500',
    green: 'from-green-600 to-green-500',
    purple: 'from-purple-600 to-purple-500',
    teal: 'from-teal-600 to-teal-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">3PL Platform Roadmap</h1>
              <p className="text-slate-400 text-sm">Priority: Internal TMS First • Week 28 = GO LIVE 🚀</p>
            </div>
          </div>
          
          {/* Critical Path Highlight */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
            <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Internal TMS Go-Live: Week 28
            </h3>
            <p className="text-slate-300 text-sm mt-1">
              Foundation (6 wks) → TMS Core (10 wks) → Dispatch (4 wks) → Documents (2 wks) → Invoicing (4 wks) → Go-Live (2 wks)
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {['Orders', 'Customers', 'Carriers', 'Dispatch', 'Tracking', 'BOL/Rate Con', 'Invoicing'].map(item => (
                <span key={item} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
          
          {/* Phase Summary */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { label: 'TMS Go-Live', value: 'Wk 28', color: 'text-green-400', highlight: true },
              { label: 'Phase A', value: '94 wks', color: 'text-blue-400' },
              { label: 'Phase B', value: '30 wks', color: 'text-amber-400' },
              { label: 'Phase C', value: '26 wks', color: 'text-green-400' },
              { label: 'Phase D', value: '20 wks', color: 'text-purple-400' },
              { label: 'Phase E', value: '16 wks', color: 'text-teal-400' }
            ].map((stat, i) => (
              <div key={i} className={`rounded-lg p-2 text-center ${stat.highlight ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-800/50 border border-slate-700/50'}`}>
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Phase Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {Object.entries(ROADMAP).map(([key, phase]) => (
            <button
              key={key}
              onClick={() => { setActivePhase(key); setExpandedSection(phase.sections[0]?.id); setExpandedWeek(null); }}
              className={`px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition flex items-center gap-2 ${
                activePhase === key
                  ? `bg-gradient-to-r ${phaseColors[phase.color]} text-white shadow-lg`
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-lg">{phase.icon}</span>
              Phase {key}
              <span className="text-xs opacity-75 bg-black/20 px-1.5 py-0.5 rounded">{phase.weeks}w</span>
            </button>
          ))}
        </div>

        {/* Phase Info */}
        <div className={`bg-gradient-to-r ${phaseColors[currentPhase.color]}/10 border border-slate-700/50 rounded-xl p-4 mb-4`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">{currentPhase.icon}</span>
                {currentPhase.name}
              </h2>
              <p className="text-slate-400 text-sm">{currentPhase.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-white">Wks {currentPhase.start}-{currentPhase.start + currentPhase.weeks - 1}</div>
                <div className="text-slate-500 text-xs">{currentPhase.weeks} weeks total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {currentPhase.sections.map(section => (
            <div key={section.id} className="bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                    section.name.includes('🔴') ? 'bg-red-500/30' :
                    section.name.includes('🟢') ? 'bg-green-500/30' :
                    section.name.includes('🟡') ? 'bg-amber-500/30' :
                    'bg-slate-700/50'
                  }`}>
                    {section.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{section.name}</h3>
                    <p className="text-xs text-slate-500">
                      Weeks {section.weeks[0].week}-{section.weeks[section.weeks.length - 1].week} • {section.weeks.length} weeks
                    </p>
                  </div>
                </div>
                {expandedSection === section.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </button>

              {expandedSection === section.id && (
                <div className="px-4 pb-4 space-y-2">
                  {section.weeks.map(week => (
                    <div key={week.week} className={`rounded-lg border ${
                      week.title.includes('GO-LIVE') || week.title.includes('🟢') 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-slate-800/50 border-slate-700'
                    }`}>
                      <button
                        onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                        className="w-full p-3 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                            week.title.includes('GO-LIVE') || week.title.includes('🟢')
                              ? 'bg-green-500/30 text-green-300'
                              : `bg-gradient-to-br ${phaseColors[currentPhase.color]}/30 text-white`
                          }`}>
                            {week.week}
                          </span>
                          <div>
                            <h4 className="font-medium text-white">{week.title}</h4>
                            <p className="text-xs text-slate-500">{week.tasks.length} tasks</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          {expandedWeek === week.week ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {expandedWeek === week.week && (
                        <div className="p-3 pt-0 space-y-3">
                          {week.tasks.map((task, taskIdx) => {
                            const isMeeting = task.name.includes('STAKEHOLDER MEETING');
                            const isGoLive = task.name.includes('🟢') || task.name.includes('🚀') || task.name.includes('🎉');
                            return (
                              <div key={taskIdx} className={`rounded-lg p-4 border ${
                                isMeeting ? 'bg-amber-500/10 border-amber-500/30' :
                                isGoLive ? 'bg-green-500/10 border-green-500/30' :
                                'bg-slate-900 border-slate-700'
                              }`}>
                                <div className="flex items-center gap-3 mb-3">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    isMeeting ? 'bg-amber-500/30 text-amber-300' :
                                    isGoLive ? 'bg-green-500/30 text-green-300' :
                                    `bg-gradient-to-br ${phaseColors[currentPhase.color]}/40 text-white`
                                  }`}>
                                    {isMeeting ? <Calendar className="w-4 h-4" /> : taskIdx + 1}
                                  </span>
                                  <h5 className={`font-medium flex-1 ${
                                    isMeeting ? 'text-amber-300' :
                                    isGoLive ? 'text-green-300' :
                                    'text-white'
                                  }`}>
                                    {task.name}
                                  </h5>
                                </div>
                                
                                <div className="ml-11 space-y-2">
                                  {task.subtasks.map((subtask, subIdx) => {
                                    const isComplete = completedTasks[`${week.week}-${taskIdx}-${subIdx}`];
                                    return (
                                      <div
                                        key={subIdx}
                                        onClick={() => toggleComplete(week.week, taskIdx, subIdx)}
                                        className={`flex items-start gap-2 cursor-pointer group ${
                                          isComplete ? 'text-slate-500 line-through' : 'text-slate-300'
                                        }`}
                                      >
                                        {isComplete ? (
                                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0 group-hover:text-blue-400" />
                                        )}
                                        <span className="text-sm">{subtask}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 bg-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">28</div>
              <div className="text-xs text-slate-500">TMS Go-Live Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">186</div>
              <div className="text-xs text-slate-500">Total Weeks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{stats.totalTasks}</div>
              <div className="text-xs text-slate-500">Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">{stats.totalSubtasks}</div>
              <div className="text-xs text-slate-500">Subtasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{stats.totalMeetings}</div>
              <div className="text-xs text-slate-500">Meetings</div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          🔴 Critical Path (Weeks 1-28) • 🟡 Enhancements (Post Go-Live) • ⚪ Deferred (Can wait)
        </p>
      </div>
    </div>
  );
}
