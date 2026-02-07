# Auto-Message Rules

> Service: Communication (Service 11) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Admin

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
Automated messaging rules configuration listing all auto-trigger rules with trigger event, message template, channel (email/SMS/notification), recipients, and active/inactive status. Examples: auto-send rate confirmation on dispatch, send check call reminder 2 hours before pickup.

## Key Design Considerations
- Rule builder must be intuitive for non-technical users with clear trigger-condition-action pattern
- Testing capability (dry run) to preview which messages would be sent before activating a rule

## Dependencies
- Email and SMS templates within this service
- Service 19 - Workflow (workflow engine for rule execution)
- Event system across all services for trigger detection
