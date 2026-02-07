# SMS Compose

> Service: Communication (Service 11) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Dispatch

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Form

## Description
SMS message composition form for sending text messages to carriers and drivers. Supports contact selection, template insertion, character count, and conversation view for message history.

## Key Design Considerations
- Character count and multi-message segment awareness prevents unexpected message splitting
- Bilingual template support (English/Spanish) is essential for driver communication

## Dependencies
- Service 05 - Carrier (carrier/driver phone numbers)
- SMS templates within this service
- SMS service provider (Twilio or equivalent)
