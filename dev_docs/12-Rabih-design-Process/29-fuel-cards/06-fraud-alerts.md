# Fraud Alerts

> Service: Fuel Cards (Service 29) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Accounting

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
Suspicious activity alerts including unusual purchase amounts, geographic anomalies, frequency patterns, off-route purchases, and non-fuel transactions on fuel-only cards.

## Key Design Considerations
- Urgency-based prioritization with one-click card suspension for confirmed fraud
- GPS vs. transaction location comparison for easy geographic verification

## Dependencies
- Fraud detection engine with configurable rules
- GPS tracking for driver location verification
- Card management API for emergency card actions
- Notification service for real-time fraud alerts
