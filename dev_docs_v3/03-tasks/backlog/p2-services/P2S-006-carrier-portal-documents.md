# P2S-006: Carrier Portal Document Upload

**Priority:** P2
**Service:** Carrier Portal
**Scope:** Self-service document upload for carriers

## Current State
No carrier-facing document upload exists. Internal users can manage carrier documents via the admin interface.

## Requirements
- Upload insurance certificates, W-9, operating authority
- Upload BOL, POD, delivery receipts per load
- Document status tracking (pending review, approved, rejected)
- Expiration alerts for insurance and certifications
- Required document checklist

## Acceptance Criteria
- [ ] Document upload with type selection
- [ ] Per-load document upload (BOL, POD)
- [ ] Required document checklist with completion status
- [ ] Expiration tracking and alerts
- [ ] Document review status visible to carrier
- [ ] Mobile-friendly upload (camera capture)

## Dependencies
- P2S-004 (Carrier portal login)
- Document management (P1S-004)

## Estimated Effort
M
