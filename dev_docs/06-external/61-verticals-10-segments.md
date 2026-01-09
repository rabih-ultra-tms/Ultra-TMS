# Logistics Verticals

The 3PL Platform is designed with a generic entity model supporting multiple logistics verticals from day one. This document details each vertical's specific requirements and configurations.

---

## Vertical Overview

```
                              3PL Platform Core
                                     │
        ┌────────────┬───────────────┼───────────────┬────────────┐
        │            │               │               │            │
        ▼            ▼               ▼               ▼            ▼
   ┌─────────┐ ┌─────────┐    ┌─────────┐    ┌─────────┐  ┌─────────┐
   │  3PL    │ │  Fleet  │    │Trucking │    │Drayage  │  │Freight  │
   │ Broker  │ │ Manager │    │ Company │    │ Intermod│  │Forwarder│
   └─────────┘ └─────────┘    └─────────┘    └─────────┘  └─────────┘
        │            │               │               │            │
        ▼            ▼               ▼               ▼            ▼
   ┌─────────┐ ┌─────────┐    ┌─────────┐    ┌─────────┐  ┌─────────┐
   │Household│ │ Final   │    │ Auto    │    │  Bulk   │  │ Customs │
   │ Goods   │ │  Mile   │    │Transport│    │ /Tanker │  │  Broker │
   └─────────┘ └─────────┘    └─────────┘    └─────────┘  └─────────┘
```

---

## Phase Release Schedule

| Phase       | Verticals                               | Timeline      |
| ----------- | --------------------------------------- | ------------- |
| **Phase A** | 3PL Broker                              | Weeks 1-78    |
| **Phase C** | Fleet, Trucking, Drayage                | Weeks 105-128 |
| **Phase D** | Freight Forwarder, Warehouse            | Weeks 129-146 |
| **Phase E** | Specialty (HHG, Final Mile, Auto, Bulk) | Weeks 147-162 |

---

## 1. 3PL Freight Broker

**Primary Phase**: A (MVP)

### Overview

Traditional freight brokerage connecting shippers with carriers. Acts as intermediary arranging transportation without owning assets.

### Key Characteristics

- No owned equipment
- Revenue from margin between customer rate and carrier rate
- High volume, fast-paced operations
- Focus on carrier relationships and capacity

### Specific Features

| Feature                | Description                   |
| ---------------------- | ----------------------------- |
| Load Board Integration | Post loads, search capacity   |
| Rate Management        | Spot quotes, contract rates   |
| Carrier Compliance     | FMCSA verification, insurance |
| Credit Management      | Customer credit limits        |
| Commission Tracking    | Sales/agent commission splits |
| Margin Analysis        | Per-load profitability        |

### Entity Configuration

```yaml
vertical: 3pl_broker

order_types:
  - SPOT
  - CONTRACT
  - DEDICATED

equipment_types:
  - DRY_VAN
  - REEFER
  - FLATBED
  - STEP_DECK
  - POWER_ONLY

pricing_model:
  type: MARGIN_BASED
  default_margin_percent: 15
  min_margin_percent: 8

carrier_requirements:
  insurance:
    auto_liability: 1000000
    cargo: 100000
  compliance:
    - FMCSA_AUTHORITY
    - INSURANCE_CERTIFICATE
```

### Sample Workflow

```
Customer Request → Quote → Book Order → Dispatch to Carrier
→ Track & Trace → POD → Invoice Customer → Pay Carrier
```

---

## 2. Fleet Manager

**Primary Phase**: C

### Overview

Asset-based carrier with owned trucks and drivers. Focus on maximizing asset utilization and driver management.

### Key Characteristics

- Owns trucks and trailers
- Employs or contracts drivers
- Revenue from line-haul and accessorials
- Focus on utilization and maintenance

### Specific Features

| Feature                | Description                   |
| ---------------------- | ----------------------------- |
| Asset Management       | Trucks, trailers, maintenance |
| Driver Management      | Scheduling, HOS, pay          |
| ELD Integration        | Compliance, tracking          |
| Fuel Management        | Cards, IFTA reporting         |
| Maintenance Scheduling | PM tracking, repairs          |
| Dispatch Board         | Visual load assignment        |

### Entity Configuration

```yaml
vertical: fleet_manager

asset_types:
  trucks:
    - DAY_CAB
    - SLEEPER
    - STRAIGHT_TRUCK
  trailers:
    - DRY_VAN_53
    - REEFER_53
    - FLATBED_48

driver_types:
  - COMPANY_DRIVER
  - OWNER_OPERATOR
  - TEAM_DRIVER

pricing_model:
  type: COST_PLUS
  include_fuel_surcharge: true
  detention_rate_hourly: 75

compliance:
  eld_required: true
  hos_tracking: true
  dvir_required: true
```

### Sample Workflow

```
Customer Order → Load Planning → Driver Assignment → Pre-Trip
→ Pickup → Transit (ELD) → Delivery → Post-Trip → Settlement
```

---

## 3. Trucking Company

**Primary Phase**: C

### Overview

Asset-based carrier that may use both company drivers and owner-operators. Combination of fleet management and carrier relationships.

### Key Characteristics

- Mixed fleet (owned + leased)
- Company drivers and O/Os
- May also broker overflow freight
- Regional or OTR operations

### Specific Features

| Feature                | Description                |
| ---------------------- | -------------------------- |
| Mixed Fleet Management | Company trucks + O/O units |
| O/O Settlements        | Percentage or mileage pay  |
| Broker Load Acceptance | Accept loads from brokers  |
| Carrier Portal         | Self-service for drivers   |
| IFTA Reporting         | Fuel tax by jurisdiction   |
| 2290 Tracking          | Heavy vehicle use tax      |

### Entity Configuration

```yaml
vertical: trucking_company

operation_types:
  - OTR
  - REGIONAL
  - LOCAL
  - DEDICATED

settlement_types:
  company_driver:
    pay_type: MILEAGE
    base_rate: 0.55
    accessorials: true
  owner_operator:
    pay_type: PERCENTAGE
    base_percent: 85
    deductions:
      - INSURANCE
      - ELD_FEE
      - FUEL_ADVANCE

load_sources:
  - DIRECT_CUSTOMER
  - BROKER
  - LOAD_BOARD
```

---

## 4. Drayage / Intermodal

**Primary Phase**: C

### Overview

Port/rail container movement. High volume, time-sensitive operations with unique equipment and billing.

### Key Characteristics

- Container-based operations
- Port/rail yard relationships
- Demurrage and detention critical
- Per-diem equipment charges

### Specific Features

| Feature                | Description               |
| ---------------------- | ------------------------- |
| Container Tracking     | Container numbers, status |
| Port/Rail Integration  | Terminal data feeds       |
| Chassis Management     | Pool, merchant, owned     |
| Demurrage/Detention    | Time tracking, billing    |
| Appointment Scheduling | Terminal appointments     |
| Last Free Day          | LFD tracking, alerts      |

### Entity Configuration

```yaml
vertical: drayage_intermodal

container_types:
  - 20FT
  - 40FT
  - 40FT_HC
  - 45FT_HC

move_types:
  - IMPORT_LIVE
  - IMPORT_DROP
  - EXPORT_LIVE
  - EXPORT_DROP
  - REPO

chassis_types:
  - POOL
  - MERCHANT
  - CARRIER_OWNED

billing_components:
  - LINE_HAUL
  - FUEL_SURCHARGE
  - CHASSIS_FEE
  - DEMURRAGE
  - DETENTION
  - PER_DIEM
  - PRE_PULL
  - FLIP_FEE

terminals:
  integration: TERMINAL_49
  appointment_required: true
```

### Sample Workflow

```
Import: Vessel Arrival → Port Notification → Terminal Appointment
→ Pick Container → Deliver → Return Empty → Invoice

Export: Pick Empty → Load at Shipper → Deliver to Terminal
→ Vessel Cutoff → Sailing Confirmation
```

---

## 5. Freight Forwarder

**Primary Phase**: D

### Overview

International logistics coordinator handling ocean, air, and multi-modal shipments with customs brokerage.

### Key Characteristics

- Multi-modal coordination
- International documentation
- Customs compliance
- Currency management

### Specific Features

| Feature             | Description                        |
| ------------------- | ---------------------------------- |
| Ocean Booking       | FCL/LCL bookings                   |
| Air Freight         | AWB management                     |
| Customs Filing      | ABI/AES integration                |
| Document Management | B/L, commercial invoice            |
| Multi-Currency      | Rate quotes in multiple currencies |
| Cargo Insurance     | Marine insurance                   |

### Entity Configuration

```yaml
vertical: freight_forwarder

shipment_modes:
  - OCEAN_FCL
  - OCEAN_LCL
  - AIR_FREIGHT
  - GROUND

document_types:
  - BILL_OF_LADING
  - AIRWAY_BILL
  - COMMERCIAL_INVOICE
  - PACKING_LIST
  - CERTIFICATE_ORIGIN
  - CUSTOMS_ENTRY

customs_integration:
  - ABI # Automated Broker Interface
  - AES # Automated Export System
  - ACE # Automated Commercial Environment

currencies:
  base: USD
  supported:
    - EUR
    - GBP
    - CAD
    - MXN
    - CNY
```

### Sample Workflow

```
Quote Request → Booking → Shipping Instructions → B/L Draft
→ Customs Filing → Arrival Notice → Delivery Order → Invoicing
```

---

## 6. Warehouse / 3PL Fulfillment

**Primary Phase**: D

### Overview

Warehousing and fulfillment services with inventory management and order processing.

### Key Characteristics

- Inventory management
- Pick/pack/ship operations
- Multiple customer inventory
- Space and handling billing

### Specific Features

| Feature              | Description        |
| -------------------- | ------------------ |
| Inventory Management | Lot tracking, FIFO |
| Receiving            | ASN, put-away      |
| Order Fulfillment    | Pick, pack, ship   |
| Billing              | Storage, handling  |
| Returns Processing   | RMA, restocking    |
| Reporting            | Inventory reports  |

### Entity Configuration

```yaml
vertical: warehouse_3pl

inventory_tracking:
  lot_tracking: true
  serial_tracking: optional
  expiration_tracking: true
  fifo_enforcement: true

storage_types:
  - FLOOR_STACK
  - SELECTIVE_RACK
  - DRIVE_IN
  - COLD_STORAGE

billing_types:
  storage:
    unit: PALLET_POSITION
    cycle: WEEKLY
  handling:
    inbound_per_pallet: 8.50
    outbound_per_order: 2.50
    pick_per_line: 0.35

integrations:
  - SHOPIFY
  - AMAZON_FBA
  - WALMART
```

---

## 7. Household Goods (Moving)

**Primary Phase**: E

### Overview

Residential and commercial moving services with specialized inventory and service tracking.

### Key Characteristics

- Survey-based quoting
- Inventory item tracking
- Claims-heavy industry
- Specialized crew management

### Specific Features

| Feature            | Description               |
| ------------------ | ------------------------- |
| Survey Management  | Virtual/in-person surveys |
| Inventory System   | Item-level tracking       |
| Weight Tracking    | Certified weights         |
| Claims Processing  | Item damage claims        |
| Crew Scheduling    | Moving crew management    |
| Storage-in-Transit | SIT tracking              |

### Entity Configuration

```yaml
vertical: household_goods

move_types:
  - LOCAL
  - INTRASTATE
  - INTERSTATE
  - INTERNATIONAL
  - MILITARY

services:
  - FULL_SERVICE_PACK
  - PARTIAL_PACK
  - LOADING_ONLY
  - UNLOADING_ONLY
  - STORAGE_IN_TRANSIT

pricing_model:
  local:
    type: HOURLY
    base_crew_size: 2
    min_hours: 2
  long_distance:
    type: WEIGHT_BASED
    rate_per_cwt: varies
    min_weight: 1000

inventory_categories:
  - FURNITURE
  - BOXES
  - APPLIANCES
  - FRAGILE
  - HIGH_VALUE
```

---

## 8. Final Mile Delivery

**Primary Phase**: E

### Overview

Last-mile delivery services for e-commerce, furniture, appliances with appointment scheduling.

### Key Characteristics

- High stop density
- Appointment windows
- White glove services
- POD capture critical

### Specific Features

| Feature                | Description              |
| ---------------------- | ------------------------ |
| Route Optimization     | Multi-stop routing       |
| Appointment Scheduling | Customer time windows    |
| Real-Time Tracking     | Customer visibility      |
| White Glove            | Assembly, setup          |
| Photo POD              | Multiple photos per stop |
| Customer Communication | SMS updates              |

### Entity Configuration

```yaml
vertical: final_mile

service_levels:
  - THRESHOLD
  - ROOM_OF_CHOICE
  - WHITE_GLOVE
  - ASSEMBLY

delivery_windows:
  - AM: '8:00-12:00'
  - PM: '12:00-17:00'
  - EVENING: '17:00-21:00'

pod_requirements:
  - SIGNATURE
  - PHOTO_AT_DOOR
  - PHOTO_PLACED
  - DAMAGE_PHOTOS

customer_notifications:
  - ORDER_CONFIRMED
  - OUT_FOR_DELIVERY
  - ETA_UPDATE
  - DELIVERED
```

---

## 9. Auto Transport

**Primary Phase**: E

### Overview

Vehicle transport services for dealerships, auctions, manufacturers with VIN tracking.

### Key Characteristics

- VIN-based tracking
- Condition reporting
- Multi-vehicle loads
- Dealer/auction network

### Specific Features

| Feature             | Description                |
| ------------------- | -------------------------- |
| VIN Decode          | Auto-populate vehicle info |
| Condition Report    | Damage documentation       |
| Multi-Vehicle Loads | Load planning              |
| Auction Integration | Run lists, gate passes     |
| Dealer Portal       | Self-service scheduling    |
| Title Management    | Title tracking             |

### Entity Configuration

```yaml
vertical: auto_transport

vehicle_types:
  - SEDAN
  - SUV
  - TRUCK
  - MOTORCYCLE
  - RV
  - HEAVY_EQUIPMENT

equipment_types:
  - OPEN_CARRIER
  - ENCLOSED
  - FLATBED
  - DRIVEAWAY

move_types:
  - AUCTION_TO_DEALER
  - DEALER_TO_DEALER
  - FACTORY_TO_DEALER
  - PRIVATE_PARTY

condition_areas:
  - FRONT_BUMPER
  - HOOD
  - ROOF
  - REAR
  - DRIVER_SIDE
  - PASSENGER_SIDE
  - INTERIOR
```

---

## 10. Bulk / Tanker

**Primary Phase**: E

### Overview

Specialized liquid and dry bulk transportation with hazmat compliance.

### Key Characteristics

- Product-specific equipment
- Hazmat compliance
- Tank cleaning requirements
- Weight-based billing

### Specific Features

| Feature            | Description           |
| ------------------ | --------------------- |
| Tank Tracking      | Product compatibility |
| Washout Management | Cleaning requirements |
| Hazmat Compliance  | Placard, training     |
| Weight Tickets     | Scale integration     |
| Heel/Residue       | Leftover product      |
| UN Numbers         | Hazmat classification |

### Entity Configuration

```yaml
vertical: bulk_tanker

equipment_types:
  - FOOD_GRADE_TANK
  - CHEMICAL_TANK
  - PETROLEUM_TANK
  - PNEUMATIC_DRY_BULK
  - HOPPER

product_categories:
  - FOOD_GRADE
  - HAZMAT
  - NON_HAZMAT_CHEMICAL
  - PETROLEUM
  - DRY_BULK

hazmat:
  tracking: true
  placards_required: true
  driver_endorsement: H

washout:
  kosher_available: true
  tracking_required: true
```

---

## Cross-Vertical Features

### Generic Entity Model

All verticals share the same base entities with vertical-specific extensions:

```typescript
interface BaseOrder {
  id: string;
  orderNumber: string;
  verticalType: VerticalType;
  status: OrderStatus;
  customerId: string;

  // Core fields present in all verticals
  origin: Location;
  destination: Location;
  pickupDate: Date;
  deliveryDate: Date;

  // Vertical-specific extensions
  verticalData: JsonObject; // Stores vertical-specific fields

  // Migration support
  externalId: string;
  sourceSystem: string;
  customFields: JsonObject;
}
```

### Configuration by Vertical

```typescript
// Feature flags per vertical
const verticalFeatures = {
  '3pl_broker': {
    loadBoards: true,
    carrierManagement: true,
    commissions: true,
    ownedAssets: false,
    driverManagement: false,
  },
  fleet_manager: {
    loadBoards: false,
    carrierManagement: false,
    commissions: false,
    ownedAssets: true,
    driverManagement: true,
    eldIntegration: true,
    maintenance: true,
  },
  drayage_intermodal: {
    loadBoards: true,
    carrierManagement: true,
    containerTracking: true,
    terminalIntegration: true,
    chassisManagement: true,
  },
};
```

---

## Navigation

- **Previous:** [Integrations](../08-integrations/README.md)
- **Next:** [Appendix](../10-appendix/README.md)
- **Index:** [Home](../README.md)
