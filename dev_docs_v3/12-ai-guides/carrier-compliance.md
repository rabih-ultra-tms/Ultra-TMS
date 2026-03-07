# Carrier Compliance Rules

> AI Dev Guide | FMCSA regulations, CSA scores, insurance requirements, authority types

---

## FMCSA Authority

### Authority Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Common** | Can transport regulated freight for any shipper | Most carriers |
| **Contract** | Can transport freight under specific contracts only | Private fleets |
| **Broker** | Can arrange transportation (not haul) | Freight brokers like Ultra TMS |

### Authority Status Values

| Status | Can Dispatch? | Action |
|--------|--------------|--------|
| AUTHORIZED | Yes | Normal operations |
| NOT_AUTHORIZED | No | Cannot assign loads |
| INACTIVE | No | Revoked or voluntarily ceased |
| PENDING | No | Application in progress |

### FMCSA Lookup

- Endpoint: `POST /api/v1/carriers/fmcsa/lookup` with MC# or DOT#
- Data source: FMCSA SAFER Web System
- Cache: 24 hours (don't re-query for same carrier within 24h)
- Auto-runs on carrier creation
- If FMCSA returns INACTIVE or NOT_AUTHORIZED: carrier stays PENDING, cannot activate

## Insurance Requirements

### Minimum Coverage

| Insurance Type | Minimum Amount | Required? |
|----------------|---------------|-----------|
| Auto Liability | $750,000 | Yes -- cannot activate without it |
| Cargo Insurance | $100,000 | Yes -- required for load assignment |
| General Liability | Varies | No -- recommended |
| Workers Compensation | State-specific | No -- but required in some states |

### Insurance Lifecycle

```
Upload Certificate -> Verify Coverage Amount -> Mark ACTIVE
  -> 30 days before expiry: EXPIRING_SOON (auto-email to carrier)
  -> On expiry date: EXPIRED (auto-suspend carrier)
  -> New certificate uploaded: Back to ACTIVE
```

### Auto-Suspension Rule

When ANY required insurance certificate expires:
1. Carrier status auto-changes to SUSPENDED
2. System sends notification email to carrier contact and carrier relations user
3. Active loads with this carrier trigger P1 alert
4. No new loads can be assigned until insurance is renewed

## CSA Scores

### BASIC Categories (7 total)

| Category | Full Name | Description |
|----------|-----------|-------------|
| Unsafe Driving | - | Speeding, reckless driving, improper lane change |
| HOS | Hours of Service | Logbook violations, exceeding drive time |
| Driver Fitness | - | Invalid CDL, medical certificate issues |
| Controlled Substances | - | Drug/alcohol violations |
| Vehicle Maintenance | - | Equipment defects, out-of-service orders |
| Hazmat | - | Hazardous materials handling violations |
| Crash Indicator | - | Crash involvement history |

### Score Interpretation

| Score Range | Risk Level | Action |
|-------------|-----------|--------|
| 0-49 | Low | Normal operations |
| 50-74 | Moderate | Monitor, flag for review |
| 75-100 | High | Compliance warning, consider suspension |

### Compliance Warning Triggers

A compliance warning is triggered when:
- Any CSA violation in the last 12 months
- Score above 75 in any BASIC category
- Authority status changes from AUTHORIZED
- Insurance expires or coverage drops below minimum

## Carrier Onboarding Checklist

Before a carrier can be activated (PENDING -> ACTIVE):

1. [ ] MC# or DOT# provided and validated via FMCSA
2. [ ] FMCSA authority is AUTHORIZED
3. [ ] Auto liability insurance >= $750,000 (certificate uploaded)
4. [ ] Cargo insurance >= $100,000 (certificate uploaded)
5. [ ] W-9 on file (optional but recommended before payment)
6. [ ] Primary contact information entered
7. [ ] Payment terms agreed (NET30 default)

## Compliance Monitoring

### Automated Checks

| Check | Frequency | Action on Failure |
|-------|-----------|-------------------|
| Insurance expiry scan | Daily | Mark EXPIRING_SOON at 30d, SUSPENDED at 0d |
| FMCSA authority check | Monthly (or on-demand) | Suspend if not AUTHORIZED |
| CSA score refresh | Quarterly | Flag compliance warning if high scores |

### Manual Review Triggers

- Cargo claim filed against carrier
- Driver complaint or safety incident
- Customer feedback below threshold
- Performance score drops below 50

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/carriers/fmcsa/lookup` | FMCSA SAFER lookup by MC#/DOT# |
| GET | `/api/v1/carriers/compliance/issues` | All compliance issues across carriers |
| GET | `/api/v1/carriers/insurance/expiring` | Certificates expiring in next 30 days |
| GET | `/api/v1/carriers/:id/performance` | Scorecard data for a carrier |
