# 64 - 3PL Platform

**A comprehensive multi-vertical logistics platform for freight brokerages and transportation companies.**

---

## Overview

The 3PL Platform replaces fragmented TMS, CRM, and Accounting tools with a unified, modern system. Built with a **migration-first architecture** that makes switching from legacy systems painless.

### Key Numbers

| Metric        | Value |
| ------------- | ----- |
| Services      | 38    |
| Screens       | 362   |
| Verticals     | 10    |
| Total Weeks   | 162   |
| Phase A Weeks | 78    |
| Documents     | 93    |

---

## Quick Start

**Start here:** [`00-master-development-guide.md`](./00-master-development-guide.md)

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Installation

```bash
git clone https://github.com/your-org/3pl-platform.git
cd 3pl-platform
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

---

## Documentation Structure

| Range     | Category         | Count  |
| --------- | ---------------- | ------ |
| 00        | Master Guide     | 1      |
| 01-06     | Foundation       | 6      |
| 07        | Services Index   | 1      |
| 08-45     | Service Specs    | 38     |
| 46-48     | Design & Screens | 3      |
| 49-51     | Checklists       | 3      |
| 52-57     | Roadmap          | 6      |
| 58-62     | External         | 5      |
| 63-64     | Index            | 2      |
| 65-75     | Standards        | 11     |
| 76-77     | API Registry     | 2      |
| 78-88     | Features         | 11     |
| 89-92     | AI Dev           | 4      |
| **Total** |                  | **93** |

---

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React 18, TypeScript, TailwindCSS |
| State     | React Query, Zustand              |
| Backend   | NestJS, Prisma ORM                |
| Database  | PostgreSQL 15, Redis 7            |
| Real-time | Socket.io                         |

---

## Service Categories (38 Total)

| Category   | Services | Examples                            |
| ---------- | -------- | ----------------------------------- |
| Core       | 7        | Auth, CRM, TMS, Carrier, Accounting |
| Operations | 9        | Commission, Claims, Portals, Credit |
| Platform   | 10       | Analytics, Workflow, Integrations   |
| Support    | 2        | Help Desk, Feedback                 |
| Extended   | 9        | EDI, Safety, ELD, Cross-Border      |
| Admin      | 1        | Super Admin                         |

---

## Development Phases

| Phase           | Weeks   | Focus                |
| --------------- | ------- | -------------------- |
| A - MVP         | 1-78    | Internal operations  |
| B - Enhancement | 79-104  | Mobile, integrations |
| C - SaaS        | 105-128 | Multi-tenant         |
| D - Forwarding  | 129-146 | Vertical expansion   |
| E - Specialty   | 147-162 | Marketplace          |

---

## 10 Verticals

1. 3PL Freight Broker
2. Fleet Manager
3. Trucking Company
4. Drayage/Intermodal
5. Freight Forwarder
6. Warehouse/Fulfillment
7. Household Goods
8. Final Mile
9. Auto Transport
10. Bulk/Tanker

---

_Version: 3.0.0 | January 2025_
