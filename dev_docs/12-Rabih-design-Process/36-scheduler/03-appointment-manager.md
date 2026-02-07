# Appointment Manager

> Service: Scheduler (Service 36) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Operations, Dispatch, Admin

---

## Design Status

This screen will be designed as part of a future wave.

## Screen Type
List

## Description
Appointment management interface for creating, viewing, editing, and canceling dock appointments and pickup/delivery time slots, with search, filtering, and bulk management capabilities.

## Key Design Considerations
- Appointment creation wizard with available time slot suggestions based on resource availability and constraints
- Bulk reschedule capability for handling facility closures or weather-related disruptions affecting multiple appointments

## Dependencies
- Resource Calendar (Service 36, Screen 2) for availability checking
- TMS Core for load and stop data
- Notification service for appointment confirmations and reminders
- Customer Portal for customer-initiated appointment requests
