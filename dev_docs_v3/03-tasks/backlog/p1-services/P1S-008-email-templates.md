# P1S-008: Email Templates Management

**Priority:** P1
**Service:** Communication
**Scope:** CRUD interface for managing email templates

## Current State
No email template management exists.

## Requirements
- List page showing all email templates
- Template editor with variables support ({{customerName}}, {{loadNumber}}, etc.)
- Preview with sample data
- Template categories (rate confirmation, invoice, status update, etc.)
- Default templates per category
- Clone and customize templates

## Acceptance Criteria
- [ ] Template list page with categories
- [ ] Rich text editor for template body
- [ ] Variable insertion via dropdown
- [ ] Preview with sample data
- [ ] Clone template functionality
- [ ] Default templates cannot be deleted (only customized)

## Dependencies
- P1S-007 (Communication center)

## Estimated Effort
M
