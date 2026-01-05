# 01 - Auth & Admin Service

**Module:** `@modules/auth`

**Category:** Core Service

**Phase:** A (Week 1-6)

---

## Purpose

Manages all authentication, authorization, user management, and tenant administration for the platform.

---

## Features

### Authentication

- Email/password login
- JWT access tokens
- Refresh token rotation
- Session management
- Password reset flow
- Email verification
- Multi-factor authentication (Phase B)
- SSO/SAML integration (Phase C)

### Authorization (RBAC)

- Role-based access control
- Permission sets
- Resource-level permissions
- Custom roles per tenant
- Role inheritance
- Field-level visibility

### User Management

- User CRUD operations
- User invitation flow
- Profile management
- Avatar upload
- User preferences
- Activity history
- Last login tracking

### Tenant Administration

- Tenant creation
- Tenant settings
- Subscription management (Phase C)
- Usage tracking
- Feature flags per tenant
- White-labeling (Phase C)

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Authentication
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  email_verified_at TIMESTAMP,

  -- Profile
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'America/Chicago',
  locale VARCHAR(10) DEFAULT 'en',

  -- Status
  status VARCHAR(20) DEFAULT 'INVITED', -- INVITED, ACTIVE, INACTIVE, LOCKED
  last_login_at TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,

  -- Role
  role_id UUID REFERENCES roles(id),

  -- Migration Support
  external_id VARCHAR(255),
  source_system VARCHAR(50),
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,

  -- Constraints
  UNIQUE(tenant_id, email)
);

-- Indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(tenant_id, email);
CREATE INDEX idx_users_external ON users(external_id, source_system);
```

### Tenants Table

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(255),

  -- Settings
  settings JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',

  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED, TRIAL
  trial_ends_at TIMESTAMP,

  -- Subscription (Phase C)
  subscription_plan VARCHAR(50),
  subscription_status VARCHAR(20),

  -- Migration Support
  external_id VARCHAR(255),
  source_system VARCHAR(50),
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Roles Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id), -- NULL for system roles

  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, name)
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  refresh_token_hash VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),

  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token_hash);
```

### Password Reset Tokens Table

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication

```yaml
# Login
POST /api/v1/auth/login
Request:
  email: string
  password: string
Response:
  accessToken: string
  refreshToken: string
  expiresAt: datetime
  user: UserDto

# Refresh Token
POST /api/v1/auth/refresh
Request:
  refreshToken: string
Response:
  accessToken: string
  refreshToken: string
  expiresAt: datetime

# Logout
POST /api/v1/auth/logout
Request:
  refreshToken: string
Response:
  success: boolean

# Logout All Sessions
POST /api/v1/auth/logout-all
Response:
  sessionsRevoked: number

# Forgot Password
POST /api/v1/auth/forgot-password
Request:
  email: string
Response:
  message: string

# Reset Password
POST /api/v1/auth/reset-password
Request:
  token: string
  newPassword: string
Response:
  success: boolean

# Verify Email
POST /api/v1/auth/verify-email
Request:
  token: string
Response:
  success: boolean

# Get Current User
GET /api/v1/auth/me
Response:
  user: UserDto
  permissions: string[]
```

### Users

```yaml
# List Users
GET /api/v1/users
Query:
  page: number
  limit: number
  search: string
  status: string
  role: string
Response:
  data: UserDto[]
  pagination: PaginationDto

# Get User
GET /api/v1/users/:id
Response:
  user: UserDto

# Create User
POST /api/v1/users
Request:
  email: string
  firstName: string
  lastName: string
  roleId: string
  phone?: string
Response:
  user: UserDto
  invitationSent: boolean

# Update User
PUT /api/v1/users/:id
Request:
  firstName?: string
  lastName?: string
  roleId?: string
  status?: string
Response:
  user: UserDto

# Delete User
DELETE /api/v1/users/:id
Response:
  success: boolean

# Invite User
POST /api/v1/users/:id/invite
Response:
  invitationSent: boolean

# Activate User
POST /api/v1/users/:id/activate
Response:
  user: UserDto

# Deactivate User
POST /api/v1/users/:id/deactivate
Response:
  user: UserDto

# Reset User Password
POST /api/v1/users/:id/reset-password
Response:
  success: boolean
```

### Roles

```yaml
# List Roles
GET /api/v1/roles
Response:
  roles: RoleDto[]

# Get Role
GET /api/v1/roles/:id
Response:
  role: RoleDto

# Create Role
POST /api/v1/roles
Request:
  name: string
  description: string
  permissions: string[]
Response:
  role: RoleDto

# Update Role
PUT /api/v1/roles/:id
Request:
  name?: string
  description?: string
  permissions?: string[]
Response:
  role: RoleDto

# Delete Role
DELETE /api/v1/roles/:id
Response:
  success: boolean

# List Permissions
GET /api/v1/permissions
Response:
  permissions: PermissionDto[]
```

### Tenant (Admin Only)

```yaml
# Get Tenant
GET /api/v1/tenant
Response:
  tenant: TenantDto

# Update Tenant
PUT /api/v1/tenant
Request:
  name?: string
  settings?: object
  branding?: object
Response:
  tenant: TenantDto

# Get Tenant Settings
GET /api/v1/tenant/settings
Response:
  settings: TenantSettingsDto

# Update Tenant Settings
PUT /api/v1/tenant/settings
Request:
  settings: object
Response:
  settings: TenantSettingsDto
```

---

## Events Published

```typescript
// User Events
UserCreatedEvent { userId, tenantId, email }
UserUpdatedEvent { userId, changes }
UserDeletedEvent { userId }
UserInvitedEvent { userId, invitedBy }
UserActivatedEvent { userId }
UserDeactivatedEvent { userId }

// Auth Events
UserLoggedInEvent { userId, ipAddress, userAgent }
UserLoggedOutEvent { userId, sessionId }
PasswordResetRequestedEvent { userId, email }
PasswordChangedEvent { userId }
EmailVerifiedEvent { userId }
LoginFailedEvent { email, ipAddress, reason }

// Role Events
RoleCreatedEvent { roleId, tenantId }
RoleUpdatedEvent { roleId, changes }
RoleDeletedEvent { roleId }
```

---

## Events Subscribed

```typescript
// From other services
None - Auth is foundational
```

---

## Default Roles

| Role                   | Permissions                     | Description         |
| ---------------------- | ------------------------------- | ------------------- |
| **Super Admin**        | All                             | Full system access  |
| **Admin**              | Manage users, settings, reports | Office manager      |
| **Operations Manager** | Orders, carriers, dispatch      | Ops lead            |
| **Dispatcher**         | Orders, loads, tracking         | Day-to-day dispatch |
| **Sales Rep**          | Quotes, CRM, customers          | Sales team          |
| **Accounting**         | Invoices, payments, reports     | Finance team        |
| **Read Only**          | View only                       | Limited access      |

---

## Permission Categories

```typescript
// User Management
users.view;
users.create;
users.edit;
users.delete;
users.invite;

// Role Management
roles.view;
roles.create;
roles.edit;
roles.delete;

// Tenant Settings
tenant.view;
tenant.edit;
tenant.settings;

// CRM
crm.companies.view;
crm.companies.create;
crm.companies.edit;
crm.companies.delete;
// ... etc for each module
```

---

## Business Rules

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase, lowercase, number
   - No common passwords
   - Cannot reuse last 5 passwords

2. **Session Management**
   - Access token expires in 15 minutes
   - Refresh token expires in 7 days
   - Refresh token rotation on use
   - Max 5 concurrent sessions per user

3. **Account Lockout**
   - Lock after 5 failed attempts
   - Lockout duration: 15 minutes
   - Reset on successful login

4. **Invitation Flow**
   - Invitation link valid for 72 hours
   - Can resend invitation
   - User sets password on first login

5. **Role Assignment**
   - Users must have exactly one role
   - Cannot delete role with active users
   - System roles cannot be modified

---

## Security Considerations

1. **Password Storage**
   - bcrypt with cost factor 12
   - Never log passwords

2. **Token Security**
   - Refresh tokens stored as hashes
   - Access tokens not stored (stateless)
   - HTTPS required

3. **Session Security**
   - IP validation (optional)
   - User agent tracking
   - Anomaly detection (Phase B)

4. **Rate Limiting**
   - Login: 5 attempts per minute
   - Password reset: 3 per hour
   - API: 100 requests per minute

---

## Screens

| Screen            | Type     | Description               |
| ----------------- | -------- | ------------------------- |
| Login             | Page     | Email/password login form |
| Forgot Password   | Page     | Password reset request    |
| Reset Password    | Page     | New password form         |
| Accept Invitation | Page     | New user registration     |
| User List         | List     | All users with filters    |
| User Detail       | Detail   | User profile and settings |
| User Create/Edit  | Form     | User management form      |
| Role List         | List     | All roles                 |
| Role Create/Edit  | Form     | Role permissions          |
| My Profile        | Detail   | Current user profile      |
| Tenant Settings   | Settings | Organization settings     |

---

## Configuration

### Environment Variables

```bash
# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Password
PASSWORD_MIN_LENGTH=8
PASSWORD_RESET_EXPIRATION=1h

# Session
MAX_SESSIONS_PER_USER=5
SESSION_LOCKOUT_DURATION=15m
SESSION_MAX_LOGIN_ATTEMPTS=5

# Email
INVITATION_EXPIRATION=72h
```

### Default Tenant Settings

```json
{
  "company": {
    "name": "",
    "address": "",
    "phone": "",
    "website": ""
  },
  "defaults": {
    "timezone": "America/Chicago",
    "dateFormat": "MM/DD/YYYY",
    "currency": "USD"
  },
  "features": {
    "multiCurrency": false,
    "advancedAnalytics": false
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Password hashing and verification
- [ ] JWT generation and validation
- [ ] Permission checking logic
- [ ] Role inheritance calculation

### Integration Tests

- [ ] Login flow (success and failure)
- [ ] Token refresh flow
- [ ] Password reset flow
- [ ] User invitation flow
- [ ] Role CRUD operations
- [ ] Permission enforcement

### E2E Tests

- [ ] Complete login journey
- [ ] Password reset journey
- [ ] User onboarding journey
- [ ] Role-based access verification

---

## Dependencies

### Internal

- None (foundational service)

### External

- SendGrid (email)
- Redis (sessions, rate limiting)

---

## Related Documentation

- [Database Schema](./DATABASE.md)
- [API Reference](./API.md)
- [Events](./EVENTS.md)
- [Screens](./SCREENS.md)
- [Business Rules](./BUSINESS-RULES.md)

---

## Navigation

- **Previous:** [Services Overview](../README.md)
- **Next:** [02 - CRM Service](../02-crm/README.md)
