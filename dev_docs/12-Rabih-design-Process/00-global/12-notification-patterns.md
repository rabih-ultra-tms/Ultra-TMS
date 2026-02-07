# 12 - Notification Patterns

> All notification types, trigger rules, and escalation logic used across Ultra TMS.

---

## Notification Types

### 1. Toast Notifications (Sonner)

Brief, auto-dismissing messages that appear in the **bottom-right** corner of the viewport.

| Variant  | Left Border | Icon      | Auto-Dismiss | Notes                                      |
|----------|-------------|-----------|--------------|---------------------------------------------|
| Success  | Green       | Checkmark | 3 seconds    |                                             |
| Error    | Red         | X         | 5 seconds    | Persistent for critical errors              |
| Warning  | Amber       | Alert     | 5 seconds    |                                             |
| Info     | Blue        | Info      | 3 seconds    |                                             |

**With action:** Toasts may include an inline action button such as "Undo" or "View" that navigates the user to the relevant resource.

---

### 2. Banner Notifications

Full-width banners rendered at the **top of the content area** (below the header, above page content).

**Use cases:**

- System maintenance warning
- Trial expiring
- Compliance alerts (e.g., carrier insurance expiring)

**Behavior:**

- Dismissible via an X button on the right side.
- Persistent until dismissed or the underlying condition is resolved.
- Only one banner visible at a time; if multiple exist they stack or prioritize by severity.

---

### 3. Badge Notifications (Count Indicators)

Small numeric badges overlaid on UI elements to indicate pending or unread counts.

| Location                  | Example                              |
|---------------------------|--------------------------------------|
| Bell icon in header       | Unread notification count (red circle) |
| Sidebar menu items        | Pending items count, e.g., "Orders (3)" |
| Tab badges                | Items needing attention within a tab |

---

### 4. In-App Notification Center (Drawer / Panel)

A slide-out drawer or panel accessed via the bell icon in the header.

**Layout:**

- List of all notifications, newest first.
- Grouped by time period: **Today**, **Yesterday**, **This Week**, **Older**.

**Categories:**

- Operations
- Sales
- Compliance
- System

**Actions:**

- Mark as read (individual notification).
- Mark all as read.
- Click a notification to navigate to the relevant screen.
- Filter by category.

---

### 5. Browser Push Notifications

Native browser push notifications. Requires user permission.

**Scope:** Critical alerts only.

- Load exception
- Insurance expired
- Payment received

**Configuration:** Opt-in per category in user settings.

---

### 6. Email Notifications

Automated email messages sent to the user's registered email address.

| Mode       | Description                                |
|------------|--------------------------------------------|
| Digest     | Daily summary of all events                |
| Real-time  | Sent per event as it occurs                |

**Configuration:** Each notification type can be independently toggled between digest, real-time, or off in user settings.

---

## Auto-Trigger Rules

The following matrix defines which notification channels are activated for each event.

| Event                            | Toast | Banner | Badge | Push | Email |
|----------------------------------|:-----:|:------:|:-----:|:----:|:-----:|
| Load dispatched                  |  Yes  |        |  Yes  |      |       |
| Load delivered                   |  Yes  |        |  Yes  |      |  Yes  |
| Load exception (late)            |  Yes  |  Yes   |  Yes  | Yes  |  Yes  |
| Check call received              |  Yes  |        |  Yes  |      |       |
| Carrier insurance expiring (30d) |       |  Yes   |  Yes  |      |  Yes  |
| Carrier insurance expired        |       |  Yes   |  Yes  | Yes  |  Yes  |
| Quote accepted                   |  Yes  |        |  Yes  | Yes  |  Yes  |
| Quote expiring (24h)             |       |        |  Yes  |      |  Yes  |
| Payment received                 |  Yes  |        |  Yes  |      |  Yes  |
| Invoice overdue                  |       |  Yes   |  Yes  |      |  Yes  |
| New order created                |  Yes  |        |  Yes  |      |       |
| Carrier assigned                 |  Yes  |        |       |      |       |
| Rate confirmation signed         |  Yes  |        |  Yes  |      |       |
| POD uploaded                     |  Yes  |        |  Yes  |      |       |
| Driver location update           |       |        |       |      |       |
| System maintenance               |       |  Yes   |       | Yes  |  Yes  |
| User invited                     |       |        |       |      |  Yes  |
| Task assigned                    |  Yes  |        |  Yes  |      |  Yes  |
| Task overdue                     |       |        |  Yes  | Yes  |  Yes  |

---

## Escalation Rules

When a notification-worthy event remains unacknowledged, the system progressively escalates through additional channels.

| Level   | Time Elapsed | Channels                                      |
|---------|-------------|-----------------------------------------------|
| Level 1 | 0 - 30 min  | Toast + badge only                            |
| Level 2 | 30 - 60 min | Add push notification                         |
| Level 3 | 1+ hour     | Add email + banner                            |
| Level 4 | 4+ hours    | Email to manager + highlight in dashboard     |
