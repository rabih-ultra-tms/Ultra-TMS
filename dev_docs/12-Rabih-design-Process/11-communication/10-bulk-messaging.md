# Bulk Messaging

> Service: Communication (Service 11) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Admin

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Tool

## Description
Mass communication tool for sending bulk emails or SMS to selected recipient groups. Supports audience selection (by role, carrier tier, customer segment), template selection, personalization merge fields, scheduling, and delivery tracking.

## Key Design Considerations
- Recipient preview with count confirmation prevents accidental mass sends
- Delivery tracking with bounce/failure reporting ensures message reach

## Dependencies
- Email and SMS templates within this service
- Service 02 - CRM (customer segments for audience selection)
- Service 05 - Carrier (carrier groups for audience selection)
- Email/SMS service providers with bulk sending capability
