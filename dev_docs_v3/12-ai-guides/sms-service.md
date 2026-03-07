# SMS Service Integration Guide

> AI Dev Guide | Twilio integration, SMS notification triggers

---

## Overview

Ultra TMS uses **Twilio** for SMS notifications. SMS is optional -- the system works without it, but SMS improves driver communication and urgent alerts.

## Environment Variables

```bash
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

## SMS Triggers

### Driver Notifications

| Trigger | Message Template | Recipient |
|---------|-----------------|-----------|
| Load dispatched | "Load {loadNumber}: Pickup at {address} on {date}. Reply CONFIRM to accept." | Driver phone |
| Pickup reminder (1h before) | "Reminder: Pickup at {address} in 1 hour. Load {loadNumber}." | Driver phone |
| Delivery reminder (1h before) | "Reminder: Delivery at {address} in 1 hour. Load {loadNumber}." | Driver phone |
| Check call due | "Check call needed for load {loadNumber}. Reply with your current location." | Driver phone |

### Dispatcher Alerts

| Trigger | Message Template | Recipient |
|---------|-----------------|-----------|
| Overdue check call (4h) | "ALERT: No check call for load {loadNumber} in 4 hours. Last known: {location}." | Dispatcher phone |
| Critical delay | "CRITICAL: Load {loadNumber} will miss delivery window. ETA: {eta}." | Dispatcher phone |
| Carrier rejected load | "Carrier {carrierName} rejected load {loadNumber}. Needs reassignment." | Dispatcher phone |

### Customer Notifications (Optional)

| Trigger | Message Template | Recipient |
|---------|-----------------|-----------|
| Shipment picked up | "Your shipment {orderNumber} has been picked up. ETA: {eta}." | Customer contact |
| Shipment delivered | "Your shipment {orderNumber} has been delivered." | Customer contact |
| Delay notification | "Your shipment {orderNumber} is delayed. New ETA: {eta}." | Customer contact |

## Message Format

- Maximum 160 characters per SMS segment
- Use short, actionable language
- Include load/order number for reference
- Avoid special characters (can cause encoding issues)

## Backend Implementation

```typescript
// apps/api/src/modules/communication/
// Twilio is integrated alongside SendGrid in the communication module

await this.smsService.send({
  to: driver.phone,  // E.164 format: +15551234567
  message: `Load ${load.loadNumber}: Pickup at ${stop.address.city}, ${stop.address.state} on ${formatDate(stop.scheduledAt)}. Reply CONFIRM.`,
});
```

## Phone Number Format

All phone numbers must be in **E.164 format**:
- US: `+15551234567` (country code + 10 digits)
- Invalid formats are rejected by Twilio
- Frontend phone inputs should auto-format to E.164

## Opt-In / Opt-Out

- SMS requires opt-in consent (TCPA compliance)
- Users can opt out by replying "STOP"
- Opt-out status stored in user/carrier/customer preferences
- System respects opt-out -- never sends to opted-out numbers

## Cost Considerations

| Message Type | Cost |
|-------------|------|
| Outbound SMS (US) | $0.0079/segment |
| Inbound SMS (US) | $0.0079/segment |
| Phone number (monthly) | $1.00/month |

For a typical broker handling 100 loads/day:
- ~500 SMS/day (5 per load average)
- Monthly cost: ~$120

## Error Handling

| Error | Action |
|-------|--------|
| Invalid phone number | Log warning, skip SMS, email fallback |
| Twilio API down | Queue in Redis, retry with backoff |
| Number opted out | Skip silently, log |
| Rate limited | Queue and retry |
| Undeliverable | Log failure, notify dispatcher |

## Two-Way SMS (Future)

Planned but not yet implemented:
- Driver replies "CONFIRM" to accept dispatch
- Driver replies location for check calls
- Carrier replies to load board offers
- Webhook endpoint to receive inbound SMS
