# Auth Module API Spec

**Module:** `apps/api/src/modules/auth/`
**Base path:** `/api/v1/`
**Controllers:** AuthController, ProfileController, TenantController, RolesController, SessionsController, UsersController

## Auth

Mixed patterns: AuthController uses `@Public()` for unauthenticated endpoints. All others use `@UseGuards(JwtAuthGuard)`. UsersController adds `RolesGuard` with `@Roles('ADMIN', 'SUPER_ADMIN')`.

---

## AuthController

**Path prefix:** `auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | @Public, @Throttle(5/60s) | Login with email/password |
| POST | `/auth/refresh` | @Public | Refresh access token |
| POST | `/auth/logout` | JwtAuthGuard | Logout current session |
| POST | `/auth/logout-all` | JwtAuthGuard | Logout all sessions |
| POST | `/auth/forgot-password` | @Public | Request password reset email |
| POST | `/auth/reset-password` | @Public | Reset password with token |
| GET | `/auth/verify-email/:token` | @Public | Verify email address |
| GET | `/auth/me` | JwtAuthGuard | Get current authenticated user |

**Rate limiting:** Login endpoint throttled to 5 requests per 60 seconds.

---

## ProfileController

**Path prefix:** `profile`
**Auth:** JwtAuthGuard on all endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/profile` | JWT only | Get user profile |
| PUT | `/profile` | JWT only | Update user profile |
| POST | `/profile/change-password` | JWT only | Change password |
| POST | `/profile/avatar` | JWT only | Upload profile avatar |

**Special:** Avatar upload uses `@UseInterceptors(FileInterceptor('avatar'))`.

---

## TenantController

**Path prefix:** `tenant`
**Auth:** JwtAuthGuard + RolesGuard
**Roles:** ADMIN, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/tenant` | ADMIN, SUPER_ADMIN | Get tenant details |
| PUT | `/tenant` | ADMIN, SUPER_ADMIN | Update tenant |
| GET | `/tenant/settings` | ADMIN, SUPER_ADMIN | Get tenant settings |
| PUT | `/tenant/settings` | ADMIN, SUPER_ADMIN | Update tenant settings |

---

## RolesController

**Path prefix:** `roles`
**Auth:** JwtAuthGuard + RolesGuard
**Roles:** ADMIN, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/roles` | ADMIN, SUPER_ADMIN | List roles |
| POST | `/roles` | ADMIN, SUPER_ADMIN | Create role |
| GET | `/roles/permissions` | ADMIN, SUPER_ADMIN | List available permissions |
| GET | `/roles/:id` | ADMIN, SUPER_ADMIN | Get role by ID |
| PUT | `/roles/:id` | ADMIN, SUPER_ADMIN | Update role |
| DELETE | `/roles/:id` | ADMIN, SUPER_ADMIN | Delete role |

**Note:** Manually wraps responses in `{ data: ... }` envelope.

---

## SessionsController

**Path prefix:** `sessions`
**Auth:** JwtAuthGuard (no RolesGuard -- users manage their own sessions)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/sessions` | JWT only | List active sessions for current user |
| DELETE | `/sessions/:id` | JWT only | Revoke a session |

**Note:** Uses `PrismaService` directly (no service layer). Filters by `userId`, `tenantId`, `revokedAt: null`, `expiresAt > now`.

---

## UsersController

**Path prefix:** `users`
**Auth:** JwtAuthGuard + RolesGuard
**Roles:** ADMIN, SUPER_ADMIN (controller-level)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/users` | ADMIN, SUPER_ADMIN | List users |
| POST | `/users` | ADMIN, SUPER_ADMIN | Create user |
| GET | `/users/:id` | ADMIN, SUPER_ADMIN | Get user by ID |
| PUT | `/users/:id` | ADMIN, SUPER_ADMIN | Update user |
| DELETE | `/users/:id` | ADMIN, SUPER_ADMIN | Delete user |
| POST | `/users/:id/invite` | ADMIN, SUPER_ADMIN | Send invitation email |
| POST | `/users/:id/activate` | ADMIN, SUPER_ADMIN | Activate user account |
| POST | `/users/:id/deactivate` | ADMIN, SUPER_ADMIN | Deactivate user account |
| PATCH | `/users/:id/roles` | ADMIN, SUPER_ADMIN | Assign roles to user |
| POST | `/users/:id/reset-password` | ADMIN, SUPER_ADMIN | Admin reset user password |

**Query params (GET list):** `page`, `limit`, `status`, `search`

**Note:** Manually wraps responses in `{ data: ... }` envelope. Uses `@CurrentTenant()` and `@CurrentUser('id')`.

---

## Known Issues

- SessionsController uses PrismaService directly instead of a service class
- RolesController and UsersController manually wrap responses instead of using interceptors
- Known P0 bug: localStorage token storage in `lib/api/client.ts` -- XSS risk
