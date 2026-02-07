# Workflow Instances

> Service: Workflow (Service 19) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Admin

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
Running workflow instances list showing all active and recently completed workflow executions with workflow name, trigger entity, current step, assigned user, start date, elapsed time, and status.

## Key Design Considerations
- Current step visualization shows exactly where each workflow instance is in its process
- Admin override capability (skip step, reassign, cancel) handles exception cases

## Dependencies
- Workflow templates within this service
- Service 01 - Auth & Admin (user info for step assignments)
