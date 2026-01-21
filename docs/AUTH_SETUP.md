# Authentication Setup Guide

## Quick Start

### 1. Get Your Tenant ID

The API requires a tenant ID for login. To get one:

**Option A: Using Prisma Studio (Easiest)**
```powershell
cd apps/api
npx prisma studio
```
- Open the `Tenant` table
- Copy any `id` value (e.g., looks like: `cm4abc123...`)

**Option B: Using Database Query**
```powershell
cd apps/api
npx prisma db execute --stdin <<< "SELECT id, name FROM Tenant LIMIT 1;"
```

### 2. Configure Frontend

Update `apps/web/.env.local`:
```env
NEXT_PUBLIC_DEFAULT_TENANT_ID=<paste-your-tenant-id-here>
```

### 3. Restart Dev Server

```powershell
# Stop the current server (Ctrl+C)
cd apps/web
pnpm dev
```

### 4. Login Credentials

Use the seeded admin account:
- **Email**: `admin1@tms.local`
- **Password**: `password123`

## Available Test Users

The seed data creates 100 users across 5 tenants:
- `admin1@tms.local` - Admin (password: `password123`)
- `user2@tms.local` through `user100@tms.local` - Various roles

All passwords are: `password123`

## Troubleshooting

### "tenantId is required" Error
- Make sure you've set `NEXT_PUBLIC_DEFAULT_TENANT_ID` in `.env.local`
- Restart the Next.js dev server after changing `.env.local`

### "Unexpected token '<'" Error
- The API server is not running
- Start it with: `cd apps/api && pnpm start:dev`

### "Invalid credentials" Error
- Check that the tenant ID matches the user's tenant
- Verify the email/password are correct
- Check that the API database has been seeded: `cd apps/api && npx prisma db seed`

## Production Setup

In production, you should:
1. Implement subdomain-based tenant resolution (e.g., `acme.your-tms.com` → Acme Freight tenant)
2. Remove the hardcoded default tenant ID
3. Add a tenant selector on the login page if needed

## API Endpoints

- **Login**: `POST /api/v1/auth/login`
  - Body: `{ email, password, tenantId }`
  - Returns: `{ accessToken, refreshToken, user }`

- **Register**: `POST /api/v1/auth/register`
  - Body: `{ email, password, firstName, lastName, companyName }`

- **Logout**: `POST /api/v1/auth/logout`
  - Requires: Bearer token

See API docs: http://localhost:3001/api-docs
