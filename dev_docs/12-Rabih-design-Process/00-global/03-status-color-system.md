# Ultra TMS -- Global Status Color System

> **Canonical reference for every status across every entity.**
> Used on all 362+ screens to guarantee visual consistency.
> Last updated: 2026-02-06

---

## Table of Contents

1. [Quick Reference -- Color Palette Overview](#1-quick-reference----color-palette-overview)
2. [Order Statuses](#2-order-statuses)
3. [Load Statuses](#3-load-statuses)
4. [Stop Statuses](#4-stop-statuses)
5. [Stop Types](#5-stop-types)
6. [Carrier Statuses](#6-carrier-statuses)
7. [Carrier Compliance](#7-carrier-compliance)
8. [Carrier Tier](#8-carrier-tier)
9. [Insurance Status](#9-insurance-status)
10. [Document Status](#10-document-status)
11. [User Status](#11-user-status)
12. [Tenant Status](#12-tenant-status)
13. [Lead Stage](#13-lead-stage)
14. [Customer Status](#14-customer-status)
15. [Customer Credit Status](#15-customer-credit-status)
16. [Quote Status](#16-quote-status)
17. [Check Call Type](#17-check-call-type)
18. [Activity Type](#18-activity-type)
19. [Equipment Type](#19-equipment-type)
20. [Opportunity Stage](#20-opportunity-stage)
21. [Priority Levels](#21-priority-levels)
22. [Payment Terms](#22-payment-terms)
23. [Invoice Status](#23-invoice-status)
24. [Claim Status](#24-claim-status)
25. [How to Use This in Code](#25-how-to-use-this-in-code)

---

## 1. Quick Reference -- Color Palette Overview

These are the eight semantic color families used throughout the system. Every status maps to one of these families.

| Semantic Role | Color Name | Primary Hex | Background Hex | Text Hex | Tailwind Token | Badge Variant |
|---|---|---|---|---|---|---|
| Success / Positive / Complete | Green | `#10B981` | `#D1FAE5` | `#065F46` | `emerald-500` | `success` |
| Warning / Caution / Expiring | Yellow / Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `amber-500` | `warning` |
| Danger / Error / Blocked | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `red-500` | `destructive` |
| Info / Active / Default | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `blue-500` | `info` |
| Neutral / Inactive / Pending | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `gray-500` | `secondary` |
| In-Progress / Moving | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `indigo-500` | `default` |
| Pending Review / Queued | Purple / Violet | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `violet-500` | `outline` |
| Special / Highlight | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `cyan-500` | `info` |

### Extended Palette (used for entities with many statuses)

| Semantic Role | Color Name | Primary Hex | Background Hex | Text Hex | Tailwind Token |
|---|---|---|---|---|---|
| Premium / Top-tier | Sky | `#0EA5E9` | `#E0F2FE` | `#075985` | `sky-500` |
| Warm Neutral / Bronze | Orange | `#F97316` | `#FFF7ED` | `#9A3412` | `orange-500` |
| Conversion / Won | Emerald (dark) | `#059669` | `#D1FAE5` | `#064E3B` | `emerald-600` |
| Lost / Denied | Rose | `#F43F5E` | `#FFE4E6` | `#9F1239` | `rose-500` |
| Draft / Inactive | Slate | `#64748B` | `#F1F5F9` | `#334155` | `slate-500` |
| Teal accent | Teal | `#14B8A6` | `#CCFBF1` | `#115E59` | `teal-500` |
| Pink accent | Pink | `#EC4899` | `#FCE7F3` | `#9D174D` | `pink-500` |
| Lime accent | Lime | `#84CC16` | `#ECFCCB` | `#3F6212` | `lime-500` |

---

## 2. Order Statuses

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PENDING` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Clock` |
| `QUOTED` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `FileText` |
| `BOOKED` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `CalendarCheck` |
| `DISPATCHED` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `Send` |
| `IN_TRANSIT` | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `info` | `Truck` |
| `DELIVERED` | Teal | `#14B8A6` | `#CCFBF1` | `#115E59` | `success` | `PackageCheck` |
| `INVOICED` | Sky | `#0EA5E9` | `#E0F2FE` | `#075985` | `info` | `Receipt` |
| `COMPLETED` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `CANCELLED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |
| `ON_HOLD` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `PauseCircle` |
| `CONFIRMED` | Lime | `#84CC16` | `#ECFCCB` | `#3F6212` | `success` | `CheckCircle` |

---

## 3. Load Statuses

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PLANNING` | Slate | `#64748B` | `#F1F5F9` | `#334155` | `secondary` | `PenLine` |
| `PENDING` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Clock` |
| `TENDERED` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `SendHorizonal` |
| `ACCEPTED` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `ThumbsUp` |
| `DISPATCHED` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `Send` |
| `AT_PICKUP` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `MapPin` |
| `PICKED_UP` | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `info` | `PackageOpen` |
| `IN_TRANSIT` | Sky | `#0EA5E9` | `#E0F2FE` | `#075985` | `info` | `Truck` |
| `AT_DELIVERY` | Teal | `#14B8A6` | `#CCFBF1` | `#115E59` | `info` | `MapPinCheck` |
| `DELIVERED` | Lime | `#84CC16` | `#ECFCCB` | `#3F6212` | `success` | `PackageCheck` |
| `COMPLETED` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `CANCELLED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |

---

## 4. Stop Statuses

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PENDING` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Clock` |
| `EN_ROUTE` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `Navigation` |
| `ARRIVED` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `MapPin` |
| `LOADING` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `ArrowUpFromLine` |
| `UNLOADING` | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `info` | `ArrowDownToLine` |
| `COMPLETED` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `CANCELLED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |

---

## 5. Stop Types

| Type | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PICKUP` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `ArrowUpFromLine` |
| `DELIVERY` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `ArrowDownToLine` |
| `STOP` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `CircleDot` |

---

## 6. Carrier Statuses

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PENDING` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Clock` |
| `ACTIVE` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `INACTIVE` | Slate | `#64748B` | `#F1F5F9` | `#334155` | `secondary` | `CircleOff` |
| `SUSPENDED` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `ShieldAlert` |
| `BLACKLISTED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `ShieldX` |

---

## 7. Carrier Compliance

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PENDING` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Clock` |
| `COMPLIANT` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `ShieldCheck` |
| `WARNING` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `AlertTriangle` |
| `EXPIRING_SOON` | Orange | `#F97316` | `#FFF7ED` | `#9A3412` | `warning` | `CalendarClock` |
| `EXPIRED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `CalendarX` |
| `MISSING` | Slate | `#64748B` | `#F1F5F9` | `#334155` | `secondary` | `FileQuestion` |
| `PENDING_REVIEW` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `FileSearch` |
| `SUSPENDED` | Rose | `#F43F5E` | `#FFE4E6` | `#9F1239` | `destructive` | `ShieldAlert` |

---

## 8. Carrier Tier

| Tier | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PLATINUM` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `Crown` |
| `GOLD` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `Award` |
| `SILVER` | Slate | `#64748B` | `#F1F5F9` | `#334155` | `secondary` | `Medal` |
| `BRONZE` | Orange | `#F97316` | `#FFF7ED` | `#9A3412` | `warning` | `Shield` |
| `UNQUALIFIED` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `CircleOff` |

---

## 9. Insurance Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `ACTIVE` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `ShieldCheck` |
| `EXPIRING_SOON` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `CalendarClock` |
| `EXPIRED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `CalendarX` |
| `CANCELLED` | Slate | `#64748B` | `#F1F5F9` | `#334155` | `secondary` | `XCircle` |

---

## 10. Document Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PENDING` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Clock` |
| `APPROVED` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `FileCheck` |
| `REJECTED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `FileX` |
| `EXPIRED` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `CalendarX` |

---

## 11. User Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `INVITED` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `MailPlus` |
| `ACTIVE` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `INACTIVE` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `CircleOff` |
| `LOCKED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `Lock` |

---

## 12. Tenant Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `ACTIVE` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `INACTIVE` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `CircleOff` |
| `SUSPENDED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `ShieldAlert` |
| `TRIAL` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `FlaskConical` |

---

## 13. Lead Stage

| Stage | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `LEAD` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `UserPlus` |
| `QUALIFIED` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `UserCheck` |
| `PROPOSAL` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `FileText` |
| `NEGOTIATION` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `Handshake` |
| `WON` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `Trophy` |
| `LOST` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |

---

## 14. Customer Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `ACTIVE` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `INACTIVE` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `CircleOff` |
| `PROSPECT` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `UserSearch` |
| `ON_HOLD` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `PauseCircle` |

---

## 15. Customer Credit Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `PENDING` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Clock` |
| `APPROVED` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `HOLD` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `PauseCircle` |
| `COD` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `Banknote` |
| `PREPAID` | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `info` | `CreditCard` |
| `DENIED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |

---

## 16. Quote Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `DRAFT` | Slate | `#64748B` | `#F1F5F9` | `#334155` | `secondary` | `PenLine` |
| `SENT` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `Send` |
| `VIEWED` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `Eye` |
| `ACCEPTED` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `REJECTED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |
| `EXPIRED` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `CalendarX` |
| `CONVERTED` | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `info` | `ArrowRightLeft` |

---

## 17. Check Call Type

| Type | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `CHECK_CALL` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `PhoneCall` |
| `ARRIVAL` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `MapPin` |
| `DEPARTURE` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `MoveRight` |
| `DELAY` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `Timer` |
| `ISSUE` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `AlertTriangle` |

---

## 18. Activity Type

| Type | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `CALL` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `Phone` |
| `EMAIL` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `Mail` |
| `MEETING` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `Users` |
| `NOTE` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `StickyNote` |
| `TASK` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `ListChecks` |

---

## 19. Equipment Type

| Type | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `DRY_VAN` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `Container` |
| `REEFER` | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `info` | `Snowflake` |
| `FLATBED` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `RectangleHorizontal` |
| `STEP_DECK` | Orange | `#F97316` | `#FFF7ED` | `#9A3412` | `warning` | `AlignEndHorizontal` |
| `LOWBOY` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `ArrowDownWideNarrow` |
| `CONESTOGA` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `Tent` |
| `POWER_ONLY` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `Zap` |
| `SPRINTER` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `Gauge` |
| `HOTSHOT` | Rose | `#F43F5E` | `#FFE4E6` | `#9F1239` | `destructive` | `Flame` |
| `TANKER` | Teal | `#14B8A6` | `#CCFBF1` | `#115E59` | `info` | `Droplets` |
| `HOPPER` | Lime | `#84CC16` | `#ECFCCB` | `#3F6212` | `success` | `ArrowDownToLine` |
| `CONTAINER` | Sky | `#0EA5E9` | `#E0F2FE` | `#075985` | `info` | `Box` |

---

## 20. Opportunity Stage

| Stage | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `LEAD` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `UserPlus` |
| `QUALIFIED` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `UserCheck` |
| `PROPOSAL` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `FileText` |
| `NEGOTIATION` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `Handshake` |
| `WON` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `Trophy` |
| `LOST` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |

---

## 21. Priority Levels

| Priority | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `URGENT` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `AlertOctagon` |
| `HIGH` | Orange | `#F97316` | `#FFF7ED` | `#9A3412` | `warning` | `ArrowUp` |
| `MEDIUM` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `Minus` |
| `LOW` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `ArrowDown` |

---

## 22. Payment Terms

| Term | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `QUICK_PAY` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `Zap` |
| `NET15` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `Calendar` |
| `NET30` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `CalendarDays` |
| `COD` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `Banknote` |
| `PREPAID` | Cyan | `#06B6D4` | `#CFFAFE` | `#155E75` | `info` | `CreditCard` |

---

## 23. Invoice Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `DRAFT` | Slate | `#64748B` | `#F1F5F9` | `#334155` | `secondary` | `PenLine` |
| `SENT` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `Send` |
| `PARTIAL` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `CircleDashed` |
| `PAID` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `OVERDUE` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `AlertTriangle` |
| `VOID` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `Ban` |
| `DISPUTED` | Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `outline` | `Scale` |

---

## 24. Claim Status

| Status | Color | Primary Hex | Background Hex | Text Hex | Badge Variant | Icon (Lucide) |
|---|---|---|---|---|---|---|
| `OPEN` | Blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `info` | `FolderOpen` |
| `INVESTIGATING` | Indigo | `#6366F1` | `#E0E7FF` | `#3730A3` | `default` | `Search` |
| `PENDING_RESOLUTION` | Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `warning` | `Clock` |
| `RESOLVED` | Green | `#10B981` | `#D1FAE5` | `#065F46` | `success` | `CircleCheckBig` |
| `CLOSED` | Gray | `#6B7280` | `#F3F4F6` | `#374151` | `secondary` | `FolderClosed` |
| `DENIED` | Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `destructive` | `XCircle` |

---

## 25. How to Use This in Code

### 25.1 -- Core Type Definitions

```typescript
// file: src/lib/status-colors.ts

import { type LucideIcon } from "lucide-react";
import {
  Clock,
  FileText,
  CalendarCheck,
  Send,
  Truck,
  PackageCheck,
  Receipt,
  CircleCheckBig,
  XCircle,
  PauseCircle,
  CheckCircle,
  PenLine,
  SendHorizonal,
  ThumbsUp,
  MapPin,
  PackageOpen,
  MapPinCheck,
  Navigation,
  ArrowUpFromLine,
  ArrowDownToLine,
  CircleDot,
  CircleOff,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  AlertTriangle,
  CalendarClock,
  CalendarX,
  FileQuestion,
  FileSearch,
  Crown,
  Award,
  Medal,
  Shield,
  FileCheck,
  FileX,
  MailPlus,
  Lock,
  FlaskConical,
  UserPlus,
  UserCheck,
  Handshake,
  Trophy,
  UserSearch,
  Banknote,
  CreditCard,
  Eye,
  ArrowRightLeft,
  PhoneCall,
  MoveRight,
  Timer,
  Phone,
  Mail,
  Users,
  StickyNote,
  ListChecks,
  Container,
  Snowflake,
  RectangleHorizontal,
  AlignEndHorizontal,
  ArrowDownWideNarrow,
  Tent,
  Zap,
  Gauge,
  Flame,
  Droplets,
  Box,
  AlertOctagon,
  ArrowUp,
  Minus,
  ArrowDown,
  Calendar,
  CalendarDays,
  CircleDashed,
  Ban,
  Scale,
  FolderOpen,
  Search,
  FolderClosed,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info";

export interface StatusConfig {
  label: string;
  color: string;
  hex: string;
  bgHex: string;
  textHex: string;
  badgeVariant: BadgeVariant;
  icon: LucideIcon;
}

// ---------------------------------------------------------------------------
// Helper -- build a single StatusConfig entry
// ---------------------------------------------------------------------------

function s(
  label: string,
  color: string,
  hex: string,
  bgHex: string,
  textHex: string,
  badgeVariant: BadgeVariant,
  icon: LucideIcon
): StatusConfig {
  return { label, color, hex, bgHex, textHex, badgeVariant, icon };
}

// ---------------------------------------------------------------------------
// Status Maps (one per entity)
// ---------------------------------------------------------------------------

export const ORDER_STATUS = {
  PENDING:     s("Pending",     "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   Clock),
  QUOTED:      s("Quoted",      "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     FileText),
  BOOKED:      s("Booked",      "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        CalendarCheck),
  DISPATCHED:  s("Dispatched",  "Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default",     Send),
  IN_TRANSIT:  s("In Transit",  "Cyan",   "#06B6D4", "#CFFAFE", "#155E75", "info",        Truck),
  DELIVERED:   s("Delivered",   "Teal",   "#14B8A6", "#CCFBF1", "#115E59", "success",     PackageCheck),
  INVOICED:    s("Invoiced",    "Sky",    "#0EA5E9", "#E0F2FE", "#075985", "info",        Receipt),
  COMPLETED:   s("Completed",   "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  CANCELLED:   s("Cancelled",   "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
  ON_HOLD:     s("On Hold",     "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     PauseCircle),
  CONFIRMED:   s("Confirmed",   "Lime",   "#84CC16", "#ECFCCB", "#3F6212", "success",     CheckCircle),
} as const satisfies Record<string, StatusConfig>;

export const LOAD_STATUS = {
  PLANNING:    s("Planning",    "Slate",  "#64748B", "#F1F5F9", "#334155", "secondary",   PenLine),
  PENDING:     s("Pending",     "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   Clock),
  TENDERED:    s("Tendered",    "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     SendHorizonal),
  ACCEPTED:    s("Accepted",    "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        ThumbsUp),
  DISPATCHED:  s("Dispatched",  "Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default",     Send),
  AT_PICKUP:   s("At Pickup",   "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     MapPin),
  PICKED_UP:   s("Picked Up",   "Cyan",   "#06B6D4", "#CFFAFE", "#155E75", "info",        PackageOpen),
  IN_TRANSIT:  s("In Transit",  "Sky",    "#0EA5E9", "#E0F2FE", "#075985", "info",        Truck),
  AT_DELIVERY: s("At Delivery", "Teal",   "#14B8A6", "#CCFBF1", "#115E59", "info",        MapPinCheck),
  DELIVERED:   s("Delivered",   "Lime",   "#84CC16", "#ECFCCB", "#3F6212", "success",     PackageCheck),
  COMPLETED:   s("Completed",   "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  CANCELLED:   s("Cancelled",   "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
} as const satisfies Record<string, StatusConfig>;

export const STOP_STATUS = {
  PENDING:    s("Pending",    "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   Clock),
  EN_ROUTE:   s("En Route",   "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        Navigation),
  ARRIVED:    s("Arrived",    "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     MapPin),
  LOADING:    s("Loading",    "Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default",     ArrowUpFromLine),
  UNLOADING:  s("Unloading",  "Cyan",   "#06B6D4", "#CFFAFE", "#155E75", "info",        ArrowDownToLine),
  COMPLETED:  s("Completed",  "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  CANCELLED:  s("Cancelled",  "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
} as const satisfies Record<string, StatusConfig>;

export const STOP_TYPE = {
  PICKUP:   s("Pickup",   "Blue",  "#3B82F6", "#DBEAFE", "#1E40AF", "info",    ArrowUpFromLine),
  DELIVERY: s("Delivery", "Green", "#10B981", "#D1FAE5", "#065F46", "success", ArrowDownToLine),
  STOP:     s("Stop",     "Amber", "#F59E0B", "#FEF3C7", "#92400E", "warning", CircleDot),
} as const satisfies Record<string, StatusConfig>;

export const CARRIER_STATUS = {
  PENDING:     s("Pending",     "Gray",  "#6B7280", "#F3F4F6", "#374151", "secondary",   Clock),
  ACTIVE:      s("Active",      "Green", "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  INACTIVE:    s("Inactive",    "Slate", "#64748B", "#F1F5F9", "#334155", "secondary",   CircleOff),
  SUSPENDED:   s("Suspended",   "Amber", "#F59E0B", "#FEF3C7", "#92400E", "warning",     ShieldAlert),
  BLACKLISTED: s("Blacklisted", "Red",   "#EF4444", "#FEE2E2", "#991B1B", "destructive", ShieldX),
} as const satisfies Record<string, StatusConfig>;

export const CARRIER_COMPLIANCE = {
  PENDING:        s("Pending",        "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   Clock),
  COMPLIANT:      s("Compliant",      "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     ShieldCheck),
  WARNING:        s("Warning",        "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     AlertTriangle),
  EXPIRING_SOON:  s("Expiring Soon",  "Orange", "#F97316", "#FFF7ED", "#9A3412", "warning",     CalendarClock),
  EXPIRED:        s("Expired",        "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", CalendarX),
  MISSING:        s("Missing",        "Slate",  "#64748B", "#F1F5F9", "#334155", "secondary",   FileQuestion),
  PENDING_REVIEW: s("Pending Review", "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     FileSearch),
  SUSPENDED:      s("Suspended",      "Rose",   "#F43F5E", "#FFE4E6", "#9F1239", "destructive", ShieldAlert),
} as const satisfies Record<string, StatusConfig>;

export const CARRIER_TIER = {
  PLATINUM:    s("Platinum",    "Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default",   Crown),
  GOLD:        s("Gold",        "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",   Award),
  SILVER:      s("Silver",      "Slate",  "#64748B", "#F1F5F9", "#334155", "secondary", Medal),
  BRONZE:      s("Bronze",      "Orange", "#F97316", "#FFF7ED", "#9A3412", "warning",   Shield),
  UNQUALIFIED: s("Unqualified", "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary", CircleOff),
} as const satisfies Record<string, StatusConfig>;

export const INSURANCE_STATUS = {
  ACTIVE:        s("Active",        "Green", "#10B981", "#D1FAE5", "#065F46", "success",     ShieldCheck),
  EXPIRING_SOON: s("Expiring Soon", "Amber", "#F59E0B", "#FEF3C7", "#92400E", "warning",     CalendarClock),
  EXPIRED:       s("Expired",       "Red",   "#EF4444", "#FEE2E2", "#991B1B", "destructive", CalendarX),
  CANCELLED:     s("Cancelled",     "Slate", "#64748B", "#F1F5F9", "#334155", "secondary",   XCircle),
} as const satisfies Record<string, StatusConfig>;

export const DOCUMENT_STATUS = {
  PENDING:  s("Pending",  "Gray",  "#6B7280", "#F3F4F6", "#374151", "secondary",   Clock),
  APPROVED: s("Approved", "Green", "#10B981", "#D1FAE5", "#065F46", "success",     FileCheck),
  REJECTED: s("Rejected", "Red",   "#EF4444", "#FEE2E2", "#991B1B", "destructive", FileX),
  EXPIRED:  s("Expired",  "Amber", "#F59E0B", "#FEF3C7", "#92400E", "warning",     CalendarX),
} as const satisfies Record<string, StatusConfig>;

export const USER_STATUS = {
  INVITED:  s("Invited",  "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     MailPlus),
  ACTIVE:   s("Active",   "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  INACTIVE: s("Inactive", "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   CircleOff),
  LOCKED:   s("Locked",   "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", Lock),
} as const satisfies Record<string, StatusConfig>;

export const TENANT_STATUS = {
  ACTIVE:    s("Active",    "Green", "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  INACTIVE:  s("Inactive",  "Gray",  "#6B7280", "#F3F4F6", "#374151", "secondary",   CircleOff),
  SUSPENDED: s("Suspended", "Red",   "#EF4444", "#FEE2E2", "#991B1B", "destructive", ShieldAlert),
  TRIAL:     s("Trial",     "Blue",  "#3B82F6", "#DBEAFE", "#1E40AF", "info",        FlaskConical),
} as const satisfies Record<string, StatusConfig>;

export const LEAD_STAGE = {
  LEAD:        s("Lead",        "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   UserPlus),
  QUALIFIED:   s("Qualified",   "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        UserCheck),
  PROPOSAL:    s("Proposal",    "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     FileText),
  NEGOTIATION: s("Negotiation", "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     Handshake),
  WON:         s("Won",         "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     Trophy),
  LOST:        s("Lost",        "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
} as const satisfies Record<string, StatusConfig>;

export const CUSTOMER_STATUS = {
  ACTIVE:   s("Active",   "Green", "#10B981", "#D1FAE5", "#065F46", "success",   CircleCheckBig),
  INACTIVE: s("Inactive", "Gray",  "#6B7280", "#F3F4F6", "#374151", "secondary", CircleOff),
  PROSPECT: s("Prospect", "Blue",  "#3B82F6", "#DBEAFE", "#1E40AF", "info",      UserSearch),
  ON_HOLD:  s("On Hold",  "Amber", "#F59E0B", "#FEF3C7", "#92400E", "warning",   PauseCircle),
} as const satisfies Record<string, StatusConfig>;

export const CUSTOMER_CREDIT_STATUS = {
  PENDING:  s("Pending",  "Gray",  "#6B7280", "#F3F4F6", "#374151", "secondary",   Clock),
  APPROVED: s("Approved", "Green", "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  HOLD:     s("Hold",     "Amber", "#F59E0B", "#FEF3C7", "#92400E", "warning",     PauseCircle),
  COD:      s("COD",      "Blue",  "#3B82F6", "#DBEAFE", "#1E40AF", "info",        Banknote),
  PREPAID:  s("Prepaid",  "Cyan",  "#06B6D4", "#CFFAFE", "#155E75", "info",        CreditCard),
  DENIED:   s("Denied",   "Red",   "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
} as const satisfies Record<string, StatusConfig>;

export const QUOTE_STATUS = {
  DRAFT:     s("Draft",     "Slate",  "#64748B", "#F1F5F9", "#334155", "secondary",   PenLine),
  SENT:      s("Sent",      "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        Send),
  VIEWED:    s("Viewed",    "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     Eye),
  ACCEPTED:  s("Accepted",  "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  REJECTED:  s("Rejected",  "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
  EXPIRED:   s("Expired",   "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     CalendarX),
  CONVERTED: s("Converted", "Cyan",   "#06B6D4", "#CFFAFE", "#155E75", "info",        ArrowRightLeft),
} as const satisfies Record<string, StatusConfig>;

export const CHECK_CALL_TYPE = {
  CHECK_CALL: s("Check Call", "Blue",  "#3B82F6", "#DBEAFE", "#1E40AF", "info",        PhoneCall),
  ARRIVAL:    s("Arrival",    "Green", "#10B981", "#D1FAE5", "#065F46", "success",     MapPin),
  DEPARTURE:  s("Departure",  "Indigo","#6366F1", "#E0E7FF", "#3730A3", "default",     MoveRight),
  DELAY:      s("Delay",      "Amber", "#F59E0B", "#FEF3C7", "#92400E", "warning",     Timer),
  ISSUE:      s("Issue",      "Red",   "#EF4444", "#FEE2E2", "#991B1B", "destructive", AlertTriangle),
} as const satisfies Record<string, StatusConfig>;

export const ACTIVITY_TYPE = {
  CALL:    s("Call",    "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",    Phone),
  EMAIL:   s("Email",   "Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default", Mail),
  MEETING: s("Meeting", "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline", Users),
  NOTE:    s("Note",    "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning", StickyNote),
  TASK:    s("Task",    "Green",  "#10B981", "#D1FAE5", "#065F46", "success", ListChecks),
} as const satisfies Record<string, StatusConfig>;

export const EQUIPMENT_TYPE = {
  DRY_VAN:   s("Dry Van",   "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        Container),
  REEFER:    s("Reefer",    "Cyan",   "#06B6D4", "#CFFAFE", "#155E75", "info",        Snowflake),
  FLATBED:   s("Flatbed",   "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     RectangleHorizontal),
  STEP_DECK: s("Step Deck", "Orange", "#F97316", "#FFF7ED", "#9A3412", "warning",     AlignEndHorizontal),
  LOWBOY:    s("Lowboy",    "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", ArrowDownWideNarrow),
  CONESTOGA: s("Conestoga", "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     Tent),
  POWER_ONLY:s("Power Only","Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default",     Zap),
  SPRINTER:  s("Sprinter",  "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     Gauge),
  HOTSHOT:   s("Hotshot",   "Rose",   "#F43F5E", "#FFE4E6", "#9F1239", "destructive", Flame),
  TANKER:    s("Tanker",    "Teal",   "#14B8A6", "#CCFBF1", "#115E59", "info",        Droplets),
  HOPPER:    s("Hopper",    "Lime",   "#84CC16", "#ECFCCB", "#3F6212", "success",     ArrowDownToLine),
  CONTAINER: s("Container", "Sky",    "#0EA5E9", "#E0F2FE", "#075985", "info",        Box),
} as const satisfies Record<string, StatusConfig>;

export const OPPORTUNITY_STAGE = {
  LEAD:        s("Lead",        "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   UserPlus),
  QUALIFIED:   s("Qualified",   "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        UserCheck),
  PROPOSAL:    s("Proposal",    "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     FileText),
  NEGOTIATION: s("Negotiation", "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     Handshake),
  WON:         s("Won",         "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     Trophy),
  LOST:        s("Lost",        "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
} as const satisfies Record<string, StatusConfig>;

export const PRIORITY_LEVEL = {
  URGENT: s("Urgent", "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", AlertOctagon),
  HIGH:   s("High",   "Orange", "#F97316", "#FFF7ED", "#9A3412", "warning",     ArrowUp),
  MEDIUM: s("Medium", "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     Minus),
  LOW:    s("Low",    "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        ArrowDown),
} as const satisfies Record<string, StatusConfig>;

export const PAYMENT_TERMS = {
  QUICK_PAY: s("Quick Pay", "Green",  "#10B981", "#D1FAE5", "#065F46", "success", Zap),
  NET15:     s("Net 15",    "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",    Calendar),
  NET30:     s("Net 30",    "Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default", CalendarDays),
  COD:       s("COD",       "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning", Banknote),
  PREPAID:   s("Prepaid",   "Cyan",   "#06B6D4", "#CFFAFE", "#155E75", "info",    CreditCard),
} as const satisfies Record<string, StatusConfig>;

export const INVOICE_STATUS = {
  DRAFT:    s("Draft",    "Slate",  "#64748B", "#F1F5F9", "#334155", "secondary",   PenLine),
  SENT:     s("Sent",     "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        Send),
  PARTIAL:  s("Partial",  "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     CircleDashed),
  PAID:     s("Paid",     "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  OVERDUE:  s("Overdue",  "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", AlertTriangle),
  VOID:     s("Void",     "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   Ban),
  DISPUTED: s("Disputed", "Purple", "#8B5CF6", "#EDE9FE", "#5B21B6", "outline",     Scale),
} as const satisfies Record<string, StatusConfig>;

export const CLAIM_STATUS = {
  OPEN:               s("Open",               "Blue",   "#3B82F6", "#DBEAFE", "#1E40AF", "info",        FolderOpen),
  INVESTIGATING:      s("Investigating",      "Indigo", "#6366F1", "#E0E7FF", "#3730A3", "default",     Search),
  PENDING_RESOLUTION: s("Pending Resolution", "Amber",  "#F59E0B", "#FEF3C7", "#92400E", "warning",     Clock),
  RESOLVED:           s("Resolved",           "Green",  "#10B981", "#D1FAE5", "#065F46", "success",     CircleCheckBig),
  CLOSED:             s("Closed",             "Gray",   "#6B7280", "#F3F4F6", "#374151", "secondary",   FolderClosed),
  DENIED:             s("Denied",             "Red",    "#EF4444", "#FEE2E2", "#991B1B", "destructive", XCircle),
} as const satisfies Record<string, StatusConfig>;
```

### 25.2 -- Generic Lookup Helper

```typescript
// file: src/lib/get-status-config.ts

import { type StatusConfig } from "./status-colors";

/**
 * Safely retrieve a StatusConfig from any status map.
 * Returns a neutral gray fallback if the key is not found.
 */
export function getStatusConfig<T extends Record<string, StatusConfig>>(
  map: T,
  key: string | undefined | null
): StatusConfig {
  if (!key) return FALLBACK;
  return (map as Record<string, StatusConfig>)[key] ?? FALLBACK;
}

const FALLBACK: StatusConfig = {
  label: "Unknown",
  color: "Gray",
  hex: "#6B7280",
  bgHex: "#F3F4F6",
  textHex: "#374151",
  badgeVariant: "secondary",
  icon: CircleHelp, // import from lucide-react
};
```

### 25.3 -- Usage in a React Component

```tsx
// Example: rendering an order status badge

import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS, type StatusConfig } from "@/lib/status-colors";
import { getStatusConfig } from "@/lib/get-status-config";

interface StatusBadgeProps {
  entity: Record<string, StatusConfig>;
  status: string;
  showIcon?: boolean;
}

export function StatusBadge({ entity, status, showIcon = true }: StatusBadgeProps) {
  const config = getStatusConfig(entity, status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.badgeVariant}
      style={{
        backgroundColor: config.bgHex,
        color: config.textHex,
        borderColor: config.hex,
      }}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

// Usage:
// <StatusBadge entity={ORDER_STATUS} status="IN_TRANSIT" />
// <StatusBadge entity={LOAD_STATUS} status="AT_PICKUP" />
// <StatusBadge entity={CARRIER_STATUS} status="ACTIVE" showIcon={false} />
```

### 25.4 -- Usage with Tailwind CSS Classes (alternative)

If you prefer Tailwind utility classes over inline styles, you can extend the config with class name mappings:

```typescript
// Tailwind class mapping for badge backgrounds
export const STATUS_BG_CLASS: Record<string, string> = {
  "#D1FAE5": "bg-emerald-100",
  "#FEF3C7": "bg-amber-100",
  "#FEE2E2": "bg-red-100",
  "#DBEAFE": "bg-blue-100",
  "#F3F4F6": "bg-gray-100",
  "#E0E7FF": "bg-indigo-100",
  "#EDE9FE": "bg-violet-100",
  "#CFFAFE": "bg-cyan-100",
  "#E0F2FE": "bg-sky-100",
  "#FFF7ED": "bg-orange-100",
  "#FFE4E6": "bg-rose-100",
  "#F1F5F9": "bg-slate-100",
  "#CCFBF1": "bg-teal-100",
  "#FCE7F3": "bg-pink-100",
  "#ECFCCB": "bg-lime-100",
};

// Tailwind class mapping for badge text
export const STATUS_TEXT_CLASS: Record<string, string> = {
  "#065F46": "text-emerald-800",
  "#92400E": "text-amber-800",
  "#991B1B": "text-red-800",
  "#1E40AF": "text-blue-800",
  "#374151": "text-gray-700",
  "#3730A3": "text-indigo-800",
  "#5B21B6": "text-violet-800",
  "#155E75": "text-cyan-800",
  "#075985": "text-sky-800",
  "#9A3412": "text-orange-800",
  "#9F1239": "text-rose-800",
  "#334155": "text-slate-700",
  "#115E59": "text-teal-800",
  "#9D174D": "text-pink-800",
  "#3F6212": "text-lime-800",
};
```

### 25.5 -- Adding Custom Badge Variants to shadcn/ui

To support the `success`, `warning`, and `info` badge variants, extend your `Badge` component:

```tsx
// file: src/components/ui/badge.tsx  (extend the existing variants)

import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants for status system:
        success:
          "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        warning:
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

---

## Design Principles

1. **Semantic consistency** -- The same concept always maps to the same color family across entities. "PENDING" is always Gray. "CANCELLED" is always Red. "COMPLETED" is always Green.

2. **Visual distinctness within an entity** -- No two statuses within the same entity share the same primary hex, ensuring every status is distinguishable at a glance.

3. **Accessibility** -- Background/text color pairs maintain a minimum 4.5:1 contrast ratio (WCAG AA). The darker text hex values are always drawn from the 700-900 range of their respective Tailwind scales.

4. **Progressive color temperature** -- Lifecycle flows (e.g., Order or Load) move through a natural warm-to-cool progression: Gray (pending) -> Purple (queued) -> Blue (active) -> Cyan/Indigo (in-progress) -> Green (complete), with Red always reserved for terminal negative states.

5. **Single source of truth** -- All 362+ screens import from `src/lib/status-colors.ts`. No screen defines its own status colors. Any palette change propagates globally by editing one file.

---

## Cross-Reference: Shared Status Semantics

These statuses appear in multiple entities. Their color assignment is always identical regardless of which entity they belong to:

| Status | Always Maps To | Hex | Entities Using It |
|---|---|---|---|
| `PENDING` | Gray | `#6B7280` | Order, Load, Stop, Carrier, Carrier Compliance, Document, Customer Credit, Claim |
| `ACTIVE` | Green | `#10B981` | Carrier, Insurance, User, Tenant, Customer |
| `INACTIVE` | Gray/Slate | `#6B7280`/`#64748B` | Carrier, User, Tenant, Customer |
| `SUSPENDED` | Amber/Red | `#F59E0B`/`#EF4444` | Carrier (Amber), Tenant (Red), Carrier Compliance (Rose) |
| `CANCELLED` | Red | `#EF4444` | Order, Load, Stop, Insurance |
| `COMPLETED` | Green | `#10B981` | Order, Load, Stop |
| `DISPATCHED` | Indigo | `#6366F1` | Order, Load |
| `IN_TRANSIT` | Cyan/Sky | `#06B6D4`/`#0EA5E9` | Order (Cyan), Load (Sky) |
| `DELIVERED` | Teal/Lime | `#14B8A6`/`#84CC16` | Order (Teal), Load (Lime) |
| `EXPIRED` | Red/Amber | varies | Carrier Compliance (Red), Document (Amber), Insurance (Red), Quote (Amber) |
| `APPROVED` | Green | `#10B981` | Document, Customer Credit |
| `REJECTED` | Red | `#EF4444` | Document, Quote |
| `EXPIRING_SOON` | Amber/Orange | `#F59E0B`/`#F97316` | Carrier Compliance (Orange), Insurance (Amber) |
| `DRAFT` | Slate | `#64748B` | Quote, Invoice |
| `SENT` | Blue | `#3B82F6` | Quote, Invoice |

---

*End of document. This file is the single source of truth for all status colors in Ultra TMS.*
