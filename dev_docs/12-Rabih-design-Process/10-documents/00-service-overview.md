# Documents Service -- Overview

> Service: 10 - Documents | Wave: Future | Priority: P1
> Total Screens: 8 | Built: 0 | Remaining: 8
> Primary Personas: All Users, Admin
> Roles with Access: all_users, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Documents service provides centralized document management for the entire TMS platform. It handles document storage, retrieval, viewing, template management, e-signatures, and OCR scanning. This service is a foundational infrastructure service consumed by nearly every other service -- from BOLs and PODs in TMS Core, to insurance certificates in Carrier Management, to invoices in Accounting.

---

## 2. Screen Catalog (8 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Document Library | TBD | List | Not Started | `10-documents/01-document-library.md` | All Users |
| 02 | Document Viewer | TBD | Viewer | Not Started | `10-documents/02-document-viewer.md` | All Users |
| 03 | Document Upload | TBD | Form | Not Started | `10-documents/03-document-upload.md` | All Users |
| 04 | Template Manager | TBD | List | Not Started | `10-documents/04-template-manager.md` | Admin |
| 05 | Template Editor | TBD | Form | Not Started | `10-documents/05-template-editor.md` | Admin |
| 06 | E-Signature | TBD | Tool | Not Started | `10-documents/06-e-signature.md` | All Users |
| 07 | Document Scanner | TBD | Tool | Not Started | `10-documents/07-document-scanner.md` | All Users |
| 08 | Document Reports | TBD | Report | Not Started | `10-documents/08-document-reports.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 37 - Cache | Document caching for frequently accessed files | No |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 04 - TMS Core | BOL, POD, rate confirmation storage and viewing | Yes |
| Service 05 - Carrier | Insurance certificates, W-9, carrier agreements | Yes |
| Service 06 - Accounting | Invoice PDFs, payment receipts | Yes |
| Service 09 - Claims | Damage photos, claim documentation | Yes |
| Service 12 - Customer Portal | Customer-facing document access | Yes |
| Service 13 - Carrier Portal | Carrier document uploads (BOL, POD) | Yes |
| Service 14 - Contracts | Contract document storage and e-signatures | Yes |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 8 screens are pending design.

---

_Last Updated: 2026-02-06_
