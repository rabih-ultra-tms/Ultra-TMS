# Technology Stack

Complete specification of all technologies, packages, configurations, and infrastructure for the 3PL Platform.

---

## Stack Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  React 18 │ TypeScript │ TailwindCSS │ shadcn/ui │ React Query │ Zustand   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 BACKEND                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│   NestJS │ TypeScript │ Prisma │ Bull │ Socket.io │ Passport │ Swagger     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 DATA                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│       PostgreSQL 15 │ Redis 7 │ S3/MinIO │ OpenSearch (future)              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INFRASTRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│    Docker │ GitHub Actions │ AWS/Railway │ CloudFlare │ Sentry │ DataDog   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Package Versions

### Frontend Packages (package.json)

```json
{
  "name": "@tms/web",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",

    "@tanstack/react-query": "^5.24.0",
    "@tanstack/react-query-devtools": "^5.24.0",

    "zustand": "^4.5.0",
    "immer": "^10.0.3",

    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",

    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",

    "tailwindcss": "^3.4.1",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",

    "lucide-react": "^0.330.0",

    "mapbox-gl": "^3.1.2",
    "react-map-gl": "^7.1.7",

    "@tanstack/react-table": "^8.12.0",
    "recharts": "^2.12.0",

    "date-fns": "^3.3.1",
    "date-fns-tz": "^2.0.0",

    "axios": "^1.6.7",
    "socket.io-client": "^4.7.4",

    "react-dropzone": "^14.2.3",
    "react-pdf": "^7.7.0",
    "react-signature-canvas": "^1.0.6",

    "i18next": "^23.8.2",
    "react-i18next": "^14.0.5",

    "libphonenumber-js": "^1.10.54"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@types/node": "^20.11.16",

    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.1",

    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "@typescript-eslint/eslint-plugin": "^7.0.1",
    "@typescript-eslint/parser": "^7.0.1",

    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.5.11",

    "@testing-library/react": "^14.2.1",
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/user-event": "^14.5.2",
    "vitest": "^1.2.2",

    "@playwright/test": "^1.41.2",

    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

### Backend Packages (package.json)

```json
{
  "name": "@tms/api",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@nestjs/common": "^10.3.2",
    "@nestjs/core": "^10.3.2",
    "@nestjs/platform-express": "^10.3.2",
    "@nestjs/config": "^3.2.0",
    "@nestjs/swagger": "^7.3.0",
    "@nestjs/terminus": "^10.2.2",

    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",

    "@nestjs/bull": "^10.1.0",
    "bull": "^4.12.2",

    "@nestjs/websockets": "^10.3.2",
    "@nestjs/platform-socket.io": "^10.3.2",
    "socket.io": "^4.7.4",

    "@prisma/client": "^5.9.1",

    "ioredis": "^5.3.2",
    "cache-manager": "^5.4.0",
    "cache-manager-ioredis-yet": "^1.2.2",

    "@aws-sdk/client-s3": "^3.515.0",
    "@aws-sdk/s3-request-presigner": "^3.515.0",
    "@aws-sdk/client-ses": "^3.515.0",
    "@aws-sdk/client-textract": "^3.515.0",

    "@sendgrid/mail": "^8.1.1",
    "twilio": "^4.23.0",

    "stripe": "^14.17.0",

    "@hubspot/api-client": "^10.2.0",

    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",

    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",

    "pino": "^8.18.0",
    "pino-http": "^9.0.0",
    "nestjs-pino": "^4.0.0",

    "@sentry/node": "^7.100.1",
    "@sentry/tracing": "^7.100.1",

    "rxjs": "^7.8.1",
    "reflect-metadata": "^0.2.1",

    "uuid": "^9.0.1",
    "slugify": "^1.6.6",
    "handlebars": "^4.7.8",
    "puppeteer": "^22.0.0",
    "csv-parse": "^5.5.3",
    "xlsx": "^0.18.5",
    "xml2js": "^0.6.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.16",
    "@types/express": "^4.17.21",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "@types/bcrypt": "^5.0.2",
    "@types/uuid": "^9.0.8",

    "prisma": "^5.9.1",

    "@nestjs/cli": "^10.3.1",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.2",

    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.2",
    "supertest": "^6.3.4",
    "@types/supertest": "^6.0.2",

    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^7.0.1",
    "@typescript-eslint/parser": "^7.0.1",
    "eslint-plugin-import": "^2.29.1",

    "prettier": "^3.2.5",

    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "source-map-support": "^0.5.21"
  }
}
```

### Shared Types Package (package.json)

```json
{
  "name": "@tms/shared-types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

### Mobile App Packages (package.json)

```json
{
  "name": "@tms/mobile",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.4",

    "@react-navigation/native": "^6.1.10",
    "@react-navigation/native-stack": "^6.9.18",
    "@react-navigation/bottom-tabs": "^6.5.12",

    "react-native-screens": "^3.29.0",
    "react-native-safe-area-context": "^4.8.2",
    "react-native-gesture-handler": "^2.14.1",
    "react-native-reanimated": "^3.6.2",

    "@tanstack/react-query": "^5.24.0",
    "zustand": "^4.5.0",

    "react-native-mmkv": "^2.11.0",
    "@react-native-async-storage/async-storage": "^1.21.0",

    "react-native-maps": "^1.10.3",
    "@react-native-community/geolocation": "^3.2.1",

    "react-native-camera": "^4.2.1",
    "react-native-image-picker": "^7.1.0",
    "react-native-signature-capture": "^0.4.10",

    "@react-native-firebase/app": "^19.0.1",
    "@react-native-firebase/messaging": "^19.0.1",

    "react-native-localize": "^3.0.6",
    "i18next": "^23.8.2",
    "react-i18next": "^14.0.5",

    "react-native-offline": "^6.0.2",
    "@nozbe/watermelondb": "^0.27.1",

    "axios": "^1.6.7",
    "socket.io-client": "^4.7.4"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/react": "^18.2.55",
    "@types/react-native": "^0.73.0",

    "@babel/core": "^7.23.9",
    "@babel/preset-env": "^7.23.9",
    "@babel/runtime": "^7.23.9",
    "metro-react-native-babel-preset": "^0.77.0",

    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.3",
    "detox": "^20.18.0"
  }
}
```

---

## Environment Variables

### Backend (.env)

```bash
# ============================================
# APPLICATION
# ============================================
NODE_ENV=development                    # development | staging | production
PORT=3001                               # API server port
API_VERSION=v1                          # API version prefix
CORS_ORIGINS=http://localhost:3000      # Comma-separated allowed origins

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tms_dev?schema=public
DATABASE_POOL_MIN=2                     # Minimum pool connections
DATABASE_POOL_MAX=10                    # Maximum pool connections
DATABASE_QUERY_TIMEOUT=30000            # Query timeout in ms

# ============================================
# REDIS
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                         # Empty for local dev
REDIS_DB=0                              # Database number (0-15)
REDIS_KEY_PREFIX=tms:                   # Key prefix for namespacing

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m               # Access token expiry
JWT_REFRESH_EXPIRATION=7d               # Refresh token expiry
JWT_ISSUER=tms-platform                 # Token issuer

# Password hashing
BCRYPT_ROUNDS=12                        # Bcrypt salt rounds

# MFA
MFA_ISSUER=TMS Platform                 # OTP issuer name
MFA_WINDOW=1                            # OTP validity window (30s intervals)

# ============================================
# AWS
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3
S3_BUCKET_DOCUMENTS=tms-documents
S3_BUCKET_IMAGES=tms-images
S3_BUCKET_REPORTS=tms-reports
S3_PRESIGNED_URL_EXPIRY=3600            # Presigned URL expiry in seconds

# SES (if using instead of SendGrid)
SES_FROM_EMAIL=noreply@yourdomain.com

# ============================================
# SENDGRID
# ============================================
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=TMS Platform

# ============================================
# TWILIO
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=           # Optional: for high volume

# ============================================
# STRIPE (Phase C)
# ============================================
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
STRIPE_PRICE_ID_STARTER=price_xxxxxxxx
STRIPE_PRICE_ID_PROFESSIONAL=price_xxxxxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxx

# ============================================
# HUBSPOT
# ============================================
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_WEBHOOK_SECRET=webhook-secret

# ============================================
# DAT
# ============================================
DAT_CLIENT_ID=your-client-id
DAT_CLIENT_SECRET=your-client-secret
DAT_API_URL=https://api.dat.com/v3

# ============================================
# TRUCKSTOP
# ============================================
TRUCKSTOP_API_KEY=your-api-key
TRUCKSTOP_API_SECRET=your-api-secret
TRUCKSTOP_API_URL=https://api.truckstop.com

# ============================================
# FMCSA
# ============================================
FMCSA_WEBKEY=your-webkey               # FMCSA SAFER Web API key
FMCSA_API_URL=https://mobile.fmcsa.dot.gov/qc/services

# ============================================
# MAPBOX
# ============================================
MAPBOX_ACCESS_TOKEN=pk.xxxxxxxxxxxxxxxxxx
MAPBOX_STYLE_URL=mapbox://styles/mapbox/streets-v12

# ============================================
# GOOGLE MAPS (backup geocoding)
# ============================================
GOOGLE_MAPS_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# MONITORING
# ============================================
SENTRY_DSN=https://xxxxxxxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1          # 10% of transactions

# DataDog (optional, alternative to CloudWatch)
DD_API_KEY=your-datadog-api-key
DD_SITE=datadoghq.com

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug                         # debug | info | warn | error
LOG_FORMAT=pretty                       # pretty | json
LOG_REQUESTS=true                       # Log HTTP requests

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=60000             # 1 minute window
RATE_LIMIT_MAX_REQUESTS=100            # Max requests per window

# ============================================
# QUEUE SETTINGS
# ============================================
QUEUE_EMAIL_CONCURRENCY=5
QUEUE_NOTIFICATION_CONCURRENCY=10
QUEUE_REPORT_CONCURRENCY=2
QUEUE_MIGRATION_CONCURRENCY=1

# ============================================
# FEATURE FLAGS
# ============================================
FEATURE_MFA_ENABLED=true
FEATURE_WEBSOCKETS_ENABLED=true
FEATURE_CARRIER_PORTAL=true
FEATURE_CUSTOMER_PORTAL=true
```

### Frontend (.env)

```bash
# ============================================
# APPLICATION
# ============================================
VITE_APP_NAME=TMS Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# ============================================
# API
# ============================================
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=ws://localhost:3001

# ============================================
# MAPBOX
# ============================================
VITE_MAPBOX_ACCESS_TOKEN=pk.xxxxxxxxxxxxxxxxxx

# ============================================
# SENTRY (frontend)
# ============================================
VITE_SENTRY_DSN=https://xxxxxxxxxx@sentry.io/xxxxx

# ============================================
# FEATURE FLAGS
# ============================================
VITE_FEATURE_DARK_MODE=true
VITE_FEATURE_ANALYTICS=true
```

---

## Docker Configuration

### Dockerfile (API)

```dockerfile
# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
```

### Dockerfile (Web)

```dockerfile
# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  # ============================================
  # PostgreSQL Database
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: tms-postgres
    environment:
      POSTGRES_DB: tms_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - tms-network

  # ============================================
  # Redis Cache
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: tms-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - tms-network

  # ============================================
  # MinIO (S3-compatible storage)
  # ============================================
  minio:
    image: minio/minio:latest
    container_name: tms-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - '9000:9000'
      - '9001:9001'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - tms-network

  # ============================================
  # Mailhog (Email testing)
  # ============================================
  mailhog:
    image: mailhog/mailhog:latest
    container_name: tms-mailhog
    ports:
      - '1025:1025'
      - '8025:8025'
    networks:
      - tms-network

  # ============================================
  # API Service
  # ============================================
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: builder
    container_name: tms-api
    command: npm run start:dev
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tms_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    ports:
      - '3001:3001'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - tms-network

  # ============================================
  # Web Service
  # ============================================
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      target: builder
    container_name: tms-web
    command: npm run dev
    environment:
      - VITE_API_URL=http://localhost:3001/api/v1
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    ports:
      - '3000:3000'
    depends_on:
      - api
    networks:
      - tms-network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  tms-network:
    driver: bridge
```

---

## CI/CD Pipeline Configuration

### GitHub Actions - CI (.github/workflows/ci.yml)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20.x'

jobs:
  # ============================================
  # Lint & Type Check
  # ============================================
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

      - name: Run Prettier check
        run: npm run format:check

  # ============================================
  # Unit Tests
  # ============================================
  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  # ============================================
  # Integration Tests
  # ============================================
  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: tms_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate
        working-directory: ./apps/api

      - name: Run database migrations
        run: npx prisma migrate deploy
        working-directory: ./apps/api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tms_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tms_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

  # ============================================
  # Build
  # ============================================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test-unit]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build API
        run: npm run build:api

      - name: Build Web
        run: npm run build:web

      - name: Upload API artifact
        uses: actions/upload-artifact@v4
        with:
          name: api-build
          path: apps/api/dist

      - name: Upload Web artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: apps/web/dist
```

### GitHub Actions - Deploy (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY_API: tms-api
  ECR_REPOSITORY_WEB: tms-web
  ECS_CLUSTER: tms-cluster
  ECS_SERVICE_API: tms-api-service
  ECS_SERVICE_WEB: tms-web-service

jobs:
  # ============================================
  # Build & Push Docker Images
  # ============================================
  build-and-push:
    name: Build & Push Docker Images
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Generate image metadata
        id: meta
        run: |
          SHA_SHORT=$(git rev-parse --short HEAD)
          TIMESTAMP=$(date +%Y%m%d%H%M%S)
          echo "tags=${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY_API }}:${SHA_SHORT}-${TIMESTAMP}" >> $GITHUB_OUTPUT
          echo "sha=${SHA_SHORT}" >> $GITHUB_OUTPUT

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: true
          tags: |
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY_API }}:${{ steps.meta.outputs.sha }}
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY_API }}:latest

      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/web
          push: true
          tags: |
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY_WEB }}:${{ steps.meta.outputs.sha }}
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY_WEB }}:latest
          build-args: |
            VITE_API_URL=${{ vars.API_URL }}
            VITE_SENTRY_DSN=${{ secrets.SENTRY_DSN }}

  # ============================================
  # Deploy to ECS
  # ============================================
  deploy:
    name: Deploy to ECS
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: ${{ github.event.inputs.environment || 'staging' }}

    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Update ECS API service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE_API }} \
            --force-new-deployment

      - name: Update ECS Web service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE_WEB }} \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_SERVICE_API }} ${{ env.ECS_SERVICE_WEB }}

  # ============================================
  # Post-deployment
  # ============================================
  post-deploy:
    name: Post-deployment Tasks
    runs-on: ubuntu-latest
    needs: deploy

    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.25.0
        with:
          payload: |
            {
              "text": "Deployment successful! :rocket:",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*TMS Platform deployed*\nEnvironment: ${{ github.event.inputs.environment || 'staging' }}\nCommit: ${{ github.sha }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ vars.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ vars.SENTRY_PROJECT }}
        with:
          environment: ${{ github.event.inputs.environment || 'staging' }}
```

---

## AWS Infrastructure & Cost Estimates

### Phase A - Development/MVP (~$85-500/month)

| Service                   | Configuration              | Monthly Cost |
| ------------------------- | -------------------------- | ------------ |
| **Railway** (alternative) | Pro plan, 2 services       | ~$40         |
| **OR AWS Setup:**         |                            |              |
| EC2                       | t3.medium (2 vCPU, 4GB) x1 | $30          |
| RDS PostgreSQL            | db.t3.micro (free tier)    | $15          |
| ElastiCache Redis         | cache.t3.micro             | $12          |
| S3                        | 50GB storage + transfers   | $5           |
| CloudWatch                | Basic monitoring           | $10          |
| Route 53                  | Hosted zone + queries      | $2           |
| **Subtotal AWS**          |                            | **~$75**     |
|                           |                            |              |
| **Third-Party Services:** |                            |              |
| SendGrid                  | Free tier (100/day)        | $0           |
| Twilio                    | Pay-as-you-go (~500 SMS)   | $10          |
| Sentry                    | Free tier                  | $0           |
| GitHub                    | Free tier                  | $0           |
| CloudFlare                | Free tier                  | $0           |
| Mapbox                    | Free tier (50k loads)      | $0           |
| **Subtotal Third-Party**  |                            | **~$10**     |
|                           |                            |              |
| **TOTAL PHASE A**         |                            | **~$85**     |

### Phase B - Growth (~$350/month)

| Service                   | Configuration               | Monthly Cost |
| ------------------------- | --------------------------- | ------------ |
| **AWS:**                  |                             |              |
| ECS Fargate               | 2 tasks, 0.5 vCPU, 1GB each | $35          |
| RDS PostgreSQL            | db.t3.small (2 vCPU, 2GB)   | $30          |
| ElastiCache Redis         | cache.t3.small              | $25          |
| S3                        | 200GB storage               | $10          |
| CloudWatch                | Enhanced monitoring         | $30          |
| ALB                       | Application Load Balancer   | $20          |
| Route 53                  |                             | $3           |
| ECR                       | Container registry          | $5           |
| **Subtotal AWS**          |                             | **~$160**    |
|                           |                             |              |
| **Third-Party Services:** |                             |              |
| SendGrid                  | Essentials (50k/month)      | $20          |
| Twilio                    | ~2000 SMS                   | $40          |
| Sentry                    | Team plan                   | $26          |
| DataDog                   | Infrastructure + APM        | $50          |
| Mapbox                    | 100k loads                  | $50          |
| **Subtotal Third-Party**  |                             | **~$190**    |
|                           |                             |              |
| **TOTAL PHASE B**         |                             | **~$350**    |

### Phase C - SaaS Production (~$1,755/month for 50 tenants)

| Service                   | Configuration             | Monthly Cost |
| ------------------------- | ------------------------- | ------------ |
| **AWS:**                  |                           |              |
| ECS Fargate               | 4 tasks, 1 vCPU, 2GB each | $140         |
| RDS PostgreSQL            | db.r6g.large Multi-AZ     | $350         |
| ElastiCache Redis         | cache.r6g.large Multi-AZ  | $250         |
| S3                        | 1TB storage + CDN         | $50          |
| CloudFront                | CDN distribution          | $50          |
| CloudWatch                | Full monitoring + logs    | $100         |
| ALB                       | with WAF                  | $50          |
| Route 53                  | Multiple domains          | $10          |
| ECR                       |                           | $10          |
| Secrets Manager           |                           | $5           |
| **Subtotal AWS**          |                           | **~$1,015**  |
|                           |                           |              |
| **Third-Party Services:** |                           |              |
| SendGrid                  | Pro (100k/month)          | $90          |
| Twilio                    | ~10k SMS                  | $150         |
| Sentry                    | Business                  | $80          |
| DataDog                   | Pro                       | $150         |
| Mapbox                    | 500k loads                | $250         |
| PagerDuty                 | Starter                   | $20          |
| **Subtotal Third-Party**  |                           | **~$740**    |
|                           |                           |              |
| **TOTAL PHASE C**         |                           | **~$1,755**  |

### Phase D/E - Scale (~$4,900/month for 200 tenants)

| Service                   | Configuration            | Monthly Cost |
| ------------------------- | ------------------------ | ------------ |
| **AWS:**                  |                          |              |
| ECS Fargate               | 8 tasks, 2 vCPU, 4GB     | $560         |
| RDS PostgreSQL            | db.r6g.xlarge Multi-AZ   | $700         |
| RDS Read Replica          | db.r6g.large             | $180         |
| ElastiCache Redis         | cache.r6g.xlarge cluster | $500         |
| OpenSearch                | 2 nodes, m6g.large       | $300         |
| S3                        | 5TB + lifecycle          | $150         |
| CloudFront                | High traffic             | $200         |
| CloudWatch + X-Ray        | Full observability       | $200         |
| ALB + WAF + Shield        | Enterprise security      | $150         |
| Backup                    | Automated backups        | $50          |
| **Subtotal AWS**          |                          | **~$2,990**  |
|                           |                          |              |
| **Third-Party Services:** |                          |              |
| SendGrid                  | Premier                  | $250         |
| Twilio                    | High volume              | $400         |
| Sentry                    | Business                 | $160         |
| DataDog                   | Enterprise               | $500         |
| Mapbox                    | Enterprise               | $500         |
| PagerDuty                 | Business                 | $100         |
| **Subtotal Third-Party**  |                          | **~$1,910**  |
|                           |                          |              |
| **TOTAL PHASE D/E**       |                          | **~$4,900**  |

### Cost Per Tenant Analysis

| Phase | Tenants      | Monthly Cost | Cost/Tenant |
| ----- | ------------ | ------------ | ----------- |
| A     | 1 (internal) | $85          | N/A         |
| B     | 5-10         | $350         | $35-70      |
| C     | 50           | $1,755       | $35         |
| D/E   | 200          | $4,900       | $24.50      |

**Target SaaS Pricing:**

- Starter: $99/month → ~75% margin at scale
- Professional: $299/month → ~85% margin
- Enterprise: $999/month → ~90% margin

---

## Version Requirements

### Runtime

| Technology | Minimum | Recommended |
| ---------- | ------- | ----------- |
| Node.js    | 18.x    | 20.x LTS    |
| npm/pnpm   | 8.x     | 9.x         |
| PostgreSQL | 14      | 15          |
| Redis      | 6       | 7           |

### Browsers (Frontend)

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 90+             |
| Firefox | 90+             |
| Safari  | 14+             |
| Edge    | 90+             |

### Mobile (React Native)

| Platform | Minimum     |
| -------- | ----------- |
| iOS      | 14+         |
| Android  | 8 (API 26)+ |
