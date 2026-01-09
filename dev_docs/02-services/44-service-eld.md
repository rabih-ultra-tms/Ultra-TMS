# ELD Service

## Overview

| Attribute             | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| **Service ID**        | 36                                                                 |
| **Document**          | 44                                                                 |
| **Category**          | Extended Services                                                  |
| **Phase**             | B (Enhancement)                                                    |
| **Development Weeks** | 85-88                                                              |
| **Priority**          | P2 - Medium                                                        |
| **Dependencies**      | Auth/Admin (01), Carrier (05), TMS Core (04), Integration Hub (20) |

## Purpose

The ELD (Electronic Logging Device) Service integrates with third-party ELD providers to retrieve driver Hours of Service (HOS) data, vehicle locations, and compliance information. It enables dispatchers to make informed load assignments based on driver availability and ensures regulatory compliance.

## Features

### HOS Monitoring

- Real-time HOS status for drivers
- Available drive time calculation
- Break and reset tracking
- Violation alerts
- Compliance dashboard

### Vehicle Tracking

- Real-time GPS location
- Breadcrumb trail history
- Geofencing alerts
- ETA calculations
- Route deviation detection

### Driver Management

- Driver HOS profiles
- CDL verification status
- Assignment availability
- Performance metrics
- Violation history

### Compliance Reporting

- HOS violation reports
- DOT audit support
- Driver logs export
- Compliance scoring
- Inspection readiness

### Provider Integrations

- KeepTruckin/Motive
- Samsara
- Omnitracs
- PeopleNet
- BigRoad

## Database Schema

```sql
-- ELD Providers
CREATE TABLE eld_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Provider info
    provider_name VARCHAR(50) NOT NULL,
    -- KEEPTRUCKIN, SAMSARA, OMNITRACS, PEOPLENET, BIGROAD

    -- Credentials (encrypted)
    api_key_encrypted VARCHAR(500),
    api_secret_encrypted VARCHAR(500),
    access_token_encrypted VARCHAR(500),
    refresh_token_encrypted VARCHAR(500),
    token_expires_at TIMESTAMPTZ,

    -- Settings
    is_active BOOLEAN DEFAULT true,
    sync_interval_minutes INTEGER DEFAULT 15,
    last_sync_at TIMESTAMPTZ,

    -- Status
    connection_status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, CONNECTED, ERROR, DISCONNECTED
    last_error TEXT,
    error_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, provider_name)
);

-- ELD Devices
CREATE TABLE eld_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider_id UUID NOT NULL REFERENCES eld_providers(id),

    -- External IDs
    external_device_id VARCHAR(100) NOT NULL,
    external_vehicle_id VARCHAR(100),

    -- Device info
    device_serial VARCHAR(100),
    device_model VARCHAR(100),
    firmware_version VARCHAR(50),

    -- Vehicle assignment
    carrier_id UUID REFERENCES carriers(id),
    vehicle_unit_number VARCHAR(50),
    vehicle_vin VARCHAR(50),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, INACTIVE, DISCONNECTED
    last_seen_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, provider_id, external_device_id)
);

-- ELD Drivers
CREATE TABLE eld_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider_id UUID NOT NULL REFERENCES eld_providers(id),

    -- External IDs
    external_driver_id VARCHAR(100) NOT NULL,

    -- Driver info (synced from ELD)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    license_number VARCHAR(50),
    license_state VARCHAR(3),

    -- Link to our driver/carrier
    carrier_id UUID REFERENCES carriers(id),
    driver_contact_id UUID REFERENCES contacts(id),

    -- Current status
    duty_status VARCHAR(50),
    -- OFF_DUTY, SLEEPER, DRIVING, ON_DUTY
    duty_status_since TIMESTAMPTZ,

    -- Current HOS
    drive_time_remaining_minutes INTEGER,
    shift_time_remaining_minutes INTEGER,
    cycle_time_remaining_minutes INTEGER,
    break_time_remaining_minutes INTEGER,

    -- Location
    current_latitude DECIMAL(10,7),
    current_longitude DECIMAL(10,7),
    current_location_name VARCHAR(255),
    location_updated_at TIMESTAMPTZ,

    -- Compliance
    hos_violation_count_24h INTEGER DEFAULT 0,
    hos_violation_count_7d INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, provider_id, external_driver_id)
);

-- HOS Logs (synced from ELD)
CREATE TABLE eld_hos_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    eld_driver_id UUID NOT NULL REFERENCES eld_drivers(id),

    -- External reference
    external_log_id VARCHAR(100),

    -- Log entry
    log_date DATE NOT NULL,
    duty_status VARCHAR(50) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,

    -- Location
    start_latitude DECIMAL(10,7),
    start_longitude DECIMAL(10,7),
    start_location VARCHAR(255),
    end_latitude DECIMAL(10,7),
    end_longitude DECIMAL(10,7),
    end_location VARCHAR(255),

    -- Odometer
    start_odometer INTEGER,
    end_odometer INTEGER,

    -- Annotations
    notes TEXT,
    edited BOOLEAN DEFAULT false,
    edit_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOS Violations
CREATE TABLE eld_hos_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    eld_driver_id UUID NOT NULL REFERENCES eld_drivers(id),

    -- External reference
    external_violation_id VARCHAR(100),

    -- Violation details
    violation_type VARCHAR(100) NOT NULL,
    -- DRIVE_TIME_11HR, DRIVE_TIME_14HR, BREAK_30MIN, CYCLE_70HR, etc.
    violation_date DATE NOT NULL,
    violation_time TIMESTAMPTZ,

    -- Duration
    violation_minutes INTEGER,

    -- Severity
    severity VARCHAR(20), -- WARNING, MINOR, MAJOR

    -- Location
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    location_name VARCHAR(255),

    -- Resolution
    status VARCHAR(50) DEFAULT 'OPEN',
    -- OPEN, REVIEWED, RESOLVED, DISPUTED
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Locations (time-series)
CREATE TABLE eld_vehicle_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    device_id UUID NOT NULL REFERENCES eld_devices(id),

    -- Location
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    location_name VARCHAR(255),

    -- Speed/heading
    speed_mph INTEGER,
    heading INTEGER, -- 0-359 degrees

    -- Vehicle data
    odometer INTEGER,
    engine_hours DECIMAL(10,2),
    fuel_level_percent INTEGER,

    -- Timestamp
    recorded_at TIMESTAMPTZ NOT NULL,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_eld_providers_tenant ON eld_providers(tenant_id);
CREATE INDEX idx_eld_devices_tenant ON eld_devices(tenant_id);
CREATE INDEX idx_eld_devices_carrier ON eld_devices(carrier_id);
CREATE INDEX idx_eld_drivers_tenant ON eld_drivers(tenant_id);
CREATE INDEX idx_eld_drivers_carrier ON eld_drivers(carrier_id);
CREATE INDEX idx_eld_hos_logs_driver ON eld_hos_logs(eld_driver_id);
CREATE INDEX idx_eld_hos_logs_date ON eld_hos_logs(log_date);
CREATE INDEX idx_eld_violations_driver ON eld_hos_violations(eld_driver_id);
CREATE INDEX idx_eld_violations_date ON eld_hos_violations(violation_date);
CREATE INDEX idx_eld_locations_device ON eld_vehicle_locations(device_id);
CREATE INDEX idx_eld_locations_time ON eld_vehicle_locations(recorded_at);

-- Partitioning for locations (high volume)
-- Consider partitioning by month for production
```

## API Endpoints

### Provider Management

| Method | Endpoint                            | Description               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/v1/eld/providers`             | List configured providers |
| POST   | `/api/v1/eld/providers`             | Add ELD provider          |
| PATCH  | `/api/v1/eld/providers/:id`         | Update provider config    |
| DELETE | `/api/v1/eld/providers/:id`         | Remove provider           |
| POST   | `/api/v1/eld/providers/:id/connect` | Initiate OAuth connection |
| POST   | `/api/v1/eld/providers/:id/sync`    | Trigger manual sync       |
| GET    | `/api/v1/eld/providers/:id/status`  | Check connection status   |

### Driver HOS

| Method | Endpoint                               | Description              |
| ------ | -------------------------------------- | ------------------------ |
| GET    | `/api/v1/eld/drivers`                  | List ELD drivers         |
| GET    | `/api/v1/eld/drivers/:id`              | Get driver details       |
| GET    | `/api/v1/eld/drivers/:id/hos`          | Get current HOS status   |
| GET    | `/api/v1/eld/drivers/:id/logs`         | Get HOS log history      |
| GET    | `/api/v1/eld/drivers/:id/availability` | Get drive time available |
| GET    | `/api/v1/eld/drivers/available`        | Find available drivers   |

### Violations

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| GET    | `/api/v1/eld/violations`         | List all violations     |
| GET    | `/api/v1/eld/violations/:id`     | Get violation details   |
| PATCH  | `/api/v1/eld/violations/:id`     | Update violation status |
| GET    | `/api/v1/eld/violations/summary` | Violation summary stats |

### Vehicle Tracking

| Method | Endpoint                            | Description               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/v1/eld/vehicles`              | List ELD vehicles         |
| GET    | `/api/v1/eld/vehicles/:id/location` | Get current location      |
| GET    | `/api/v1/eld/vehicles/:id/history`  | Get location history      |
| GET    | `/api/v1/eld/vehicles/map`          | Get all vehicle locations |

### Dashboard & Reports

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| GET    | `/api/v1/eld/dashboard`           | ELD overview dashboard    |
| GET    | `/api/v1/eld/reports/hos`         | HOS compliance report     |
| GET    | `/api/v1/eld/reports/violations`  | Violation report          |
| GET    | `/api/v1/eld/reports/utilization` | Driver utilization report |

## Events

### Published Events

| Event                          | Trigger                  | Payload                              |
| ------------------------------ | ------------------------ | ------------------------------------ |
| `eld.driver.status.changed`    | Duty status change       | `{ driverId, oldStatus, newStatus }` |
| `eld.violation.detected`       | New violation            | `{ driverId, violationType }`        |
| `eld.driver.available`         | Driver becomes available | `{ driverId, driveTimeAvailable }`   |
| `eld.vehicle.location.updated` | Location update          | `{ vehicleId, lat, lng }`            |
| `eld.sync.completed`           | Sync finished            | `{ providerId, recordsUpdated }`     |

### Subscribed Events

| Event               | Source    | Action                |
| ------------------- | --------- | --------------------- |
| `load.assigned`     | TMS       | Track driver for load |
| `carrier.created`   | Carrier   | Prompt ELD setup      |
| `schedule.interval` | Scheduler | Trigger periodic sync |

## Business Rules

### HOS Calculations

```typescript
// Check if driver can take a load
function canDriverTakeLoad(
  driver: EldDriver,
  estimatedDriveMinutes: number
): boolean {
  const availableDrive = driver.drive_time_remaining_minutes;
  const availableShift = driver.shift_time_remaining_minutes;

  // Need 30 min buffer
  const buffer = 30;

  return (
    availableDrive >= estimatedDriveMinutes + buffer &&
    availableShift >= estimatedDriveMinutes + buffer &&
    driver.hos_violation_count_24h === 0
  );
}

// Calculate when driver will be available
function calculateNextAvailability(driver: EldDriver): Date {
  if (driver.duty_status === 'OFF_DUTY') {
    // 10 hour reset required
    const resetComplete = addHours(driver.duty_status_since, 10);
    return resetComplete > new Date() ? resetComplete : new Date();
  }

  if (driver.duty_status === 'SLEEPER') {
    // Check for 7/3 or 8/2 split
    return calculateSplitSleeperAvailability(driver);
  }

  return new Date(); // Already available
}
```

### HOS Rules Reference

| Rule             | Limit     | Description                      |
| ---------------- | --------- | -------------------------------- |
| 11-Hour Driving  | 11 hrs    | Max driving after 10 hr off-duty |
| 14-Hour Window   | 14 hrs    | Max on-duty window               |
| 30-Minute Break  | 30 min    | Required after 8 hrs driving     |
| 60/70-Hour Limit | 60/70 hrs | Max in 7/8 day period            |
| 34-Hour Restart  | 34 hrs    | Reset 60/70 hour clock           |

## Screens

| #   | Screen            | Type      | Description             | Access          |
| --- | ----------------- | --------- | ----------------------- | --------------- |
| 1   | ELD Dashboard     | dashboard | Fleet HOS overview      | Dispatch        |
| 2   | Driver HOS        | list      | Hours of service status | Dispatch        |
| 3   | Driver Detail     | detail    | Individual driver HOS   | Dispatch        |
| 4   | Violations        | list      | HOS violations          | Dispatch, Admin |
| 5   | Vehicle Locations | map       | Fleet tracking map      | Dispatch        |
| 6   | Trip History      | list      | Driver trip history     | Dispatch        |
| 7   | ELD Devices       | list      | Connected devices       | Admin           |
| 8   | Provider Setup    | config    | ELD provider config     | Admin           |

## Configuration

```yaml
# Environment variables
ELD_SYNC_INTERVAL_MINUTES: 15
ELD_LOCATION_RETENTION_DAYS: 90
ELD_LOGS_RETENTION_DAYS: 180

# Provider-specific
ELD_KEEPTRUCKIN_API_URL: 'https://api.keeptruckin.com/v1'
ELD_SAMSARA_API_URL: 'https://api.samsara.com/v1'
ELD_OMNITRACS_API_URL: 'https://api.omnitracs.com/v1'
```

## Testing Checklist

### Unit Tests

- [ ] HOS calculation logic
- [ ] Availability calculations
- [ ] Violation detection
- [ ] Split sleeper calculations

### Integration Tests

- [ ] KeepTruckin API sync
- [ ] Samsara API sync
- [ ] Location data ingestion
- [ ] Event publishing

### E2E Tests

- [ ] Provider connection flow
- [ ] Driver HOS monitoring
- [ ] Violation alerting
- [ ] Location tracking display

---

_Service Version: 1.0.0_
_Last Updated: January 2025_
