# Compose Email

> Service: Communication (Service 11) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: All Users

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Form

## Description
Email composition form with recipient selection (from contacts), subject, rich text body editor, template selection, file attachments, and entity association (link to load, carrier, or customer).

## Key Design Considerations
- Template insertion with merge field auto-population reduces repetitive typing
- Entity association ensures all communications are linked to the correct TMS record for audit trail

## Dependencies
- Service 02 - CRM (customer contact lookup)
- Service 05 - Carrier (carrier contact lookup)
- Email templates within this service
- Email service provider for sending
