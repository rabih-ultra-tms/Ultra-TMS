# Data Sensitivity & Compliance — Ultra TMS

> **Last Updated:** 2026-03-07
> Data classification, PII handling, compliance requirements, encryption

---

## Data Classification

### Class A — Highly Sensitive (PII + Financial)

| Data Type | Examples | Storage | Access |
|---|---|---|---|
| User credentials | Password hashes, JWT secrets | Database (bcrypt), env vars | Auth service only |
| Financial records | Invoice amounts, settlement amounts, payment details | Database | ACCOUNTING role + ADMIN |
| PII — Personal | User names, emails, phone numbers | Database | Authenticated users (own data) |
| PII — Business | Customer EIN, carrier MC number, bank account info | Database | ADMIN + ACCOUNTING |
| Documents | Insurance certificates, signed contracts, POD images | S3 (future) | Role-based |

**Rules:**
- Never log Class A data (no console.log of user objects, financial records, or credentials)
- Encrypt at rest: PostgreSQL encryption for highly sensitive fields (future: column-level encryption)
- Encrypt in transit: TLS/HTTPS only (enforce in production)
- JWT tokens: HttpOnly cookies only — never localStorage (already implemented)

### Class B — Sensitive (Operational)

| Data Type | Examples | Storage | Access |
|---|---|---|---|
| Load details | Origin, destination, cargo description, weight | Database | DISPATCHER + ADMIN |
| Carrier info | DOT numbers, operating authority, safety scores | Database | DISPATCHER + ADMIN |
| Customer contact info | Company address, contact names | Database | CRM role + ADMIN |
| Rate information | Lane rates, agreed carrier rates, margin | Database | ACCOUNTING + ADMIN |

**Rules:**
- Filtered by tenantId (multi-tenant isolation)
- RBAC enforced on all endpoints
- Audit log on modifications (future)

### Class C — Internal (Non-Sensitive)

| Data Type | Examples | Storage | Access |
|---|---|---|---|
| System events | API logs, health checks | Log files | Admin only |
| UI preferences | Sidebar state, table column preferences | localStorage | User (own data) |
| Public data | Truck types list, status definitions | Database | Any authenticated user |

---

## Compliance Requirements

### SOC2 Type II (Target — pre-launch)

Required controls:
- [ ] Access control (RBAC) — DONE
- [ ] Encryption in transit (HTTPS) — needs production config
- [ ] Encryption at rest — needs database encryption config
- [ ] Audit logging (all data changes) — NOT BUILT (see backlog)
- [ ] Incident response plan — NOT BUILT
- [ ] Penetration testing — NOT DONE
- [ ] Vulnerability scanning — NOT CONFIGURED (semgrep available)
- [ ] Data backup and recovery — needs production infra
- [ ] Employee security training — N/A (2-person team)

### FMCSA Compliance (Carrier Safety Data)

- CSA safety scores are public data from FMCSA — can be displayed
- Carrier insurance certificates must be retained (7-year requirement)
- Driver qualification files must be retained per FMCSA regulations
- HOS (Hours of Service) data from ELD providers — retain per DOT requirements

### Data Retention Policy

| Data Type | Retention Period | Action After |
|---|---|---|
| Financial records (invoices, settlements) | 7 years (IRS requirement) | Archive to cold storage |
| Load records | 3 years (FMCSA) | Archive |
| Carrier safety records | 7 years | Archive |
| User accounts | Until tenant offboarded + 1 year | Soft delete → hard delete |
| Log files | 90 days | Auto-delete |
| JWT tokens | 24 hours (refresh tokens: 30 days) | Auto-expire |

**Current status:** Retention policy defined, archival jobs NOT YET BUILT. Add to P2 backlog.

---

## Security Architecture

### Authentication Security

| Control | Status |
|---|---|
| Passwords hashed (bcrypt, cost 12) | DONE |
| JWT in HttpOnly cookies (not localStorage) | DONE |
| HTTPS only in production | NEEDS PRODUCTION CONFIG |
| CORS restricted to known origins | DONE (needs env var — QS-007) |
| Rate limiting on auth endpoints | NOT BUILT |
| Account lockout after failed attempts | NOT BUILT |
| MFA (Multi-Factor Auth) | NOT BUILT (P2) |

### API Security

| Control | Status |
|---|---|
| Global JwtAuthGuard (all routes) | DONE |
| `@Public()` decorator for exempt routes | DONE |
| Input validation (ValidationPipe, class-validator) | DONE |
| SQL injection prevention (Prisma ORM) | DONE (Prisma parameterized queries) |
| XSS prevention | PARTIAL (Next.js default sanitization) |
| CSRF protection | NOT VERIFIED |
| Content Security Policy (CSP) headers | NOT CONFIGURED |
| Security headers (HSTS, X-Frame-Options, etc.) | NOT CONFIGURED |

### Data Isolation

| Control | Status |
|---|---|
| tenantId on all models | DONE |
| tenantId filter on all queries | DONE (enforce via code review) |
| SUPER_ADMIN cross-tenant access controlled | DONE |
| Customer portal JWT separate from main JWT | DONE |
| Carrier portal JWT separate from main JWT | DONE |

---

## Security Findings (March 6, 2026 Audit)

### P0 Critical (all fixed)
1. JWT secret hardcoded in code → moved to env var
2. Health endpoint public (exposed metrics) → secured
3. JWT logged to console in admin layout → removed
4. localStorage token storage → migrated to HttpOnly cookies

### P1 High (open)
1. CORS origin hardcoded (not env var) → QS-007
2. Rate limiting not implemented → backlog
3. CSP headers missing → backlog

### P2 Medium (open)
- 7 items: input sanitization, audit logging, MFA — all in backlog

Full security findings: [05-audit/security-findings.md](../05-audit/security-findings.md)
