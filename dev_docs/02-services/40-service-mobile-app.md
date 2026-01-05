# 33 - Mobile App Service

| Field            | Value                                             |
| ---------------- | ------------------------------------------------- |
| **Service ID**   | 33                                                |
| **Service Name** | Mobile App                                        |
| **Category**     | Extended                                          |
| **Module Path**  | `@modules/mobile`                                 |
| **Phase**        | B (Enhancement)                                   |
| **Weeks**        | 91-98                                             |
| **Priority**     | P2                                                |
| **Dependencies** | Auth, TMS Core, Carrier, Documents, Communication |

---

## Purpose

Backend service supporting React Native mobile applications for drivers, dispatchers, and sales staff. Provides optimized APIs for mobile consumption, push notifications, offline data synchronization, location tracking, and mobile-specific workflows like digital POD capture and in-app messaging.

---

## Features

- **Mobile Authentication** - Biometric login, device management, session tokens
- **Push Notifications** - Firebase/APNs integration for real-time alerts
- **Offline Support** - Data sync for offline operation
- **Location Tracking** - Real-time GPS updates from drivers
- **POD Capture** - Camera integration for proof of delivery
- **Digital Signature** - Touch signature for delivery confirmation
- **In-App Messaging** - Driver-dispatcher chat
- **Load Board Mobile** - Mobile-optimized load listings
- **Document Scanner** - OCR for BOL and other docs
- **Driver Check Calls** - Scheduled check-in reminders
- **Turn-by-Turn** - Navigation integration (Google/Apple Maps)
- **Fuel Finder** - Truck stop and fuel price locator

---

## Database Schema

```sql
-- Mobile Devices
CREATE TABLE mobile_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Device Info
    device_id VARCHAR(200) NOT NULL,                -- Unique device identifier
    device_type VARCHAR(20) NOT NULL,               -- IOS, ANDROID
    device_model VARCHAR(100),
    os_version VARCHAR(20),
    app_version VARCHAR(20),

    -- Push Notifications
    push_token VARCHAR(500),
    push_provider VARCHAR(20),                      -- FCM, APNS
    push_enabled BOOLEAN DEFAULT true,

    -- Security
    biometric_enabled BOOLEAN DEFAULT false,
    biometric_type VARCHAR(20),                     -- FINGERPRINT, FACE_ID, TOUCH_ID
    last_biometric_auth TIMESTAMPTZ,

    -- Session
    refresh_token_hash VARCHAR(255),
    last_active_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    -- Metadata
    timezone VARCHAR(50),
    locale VARCHAR(10),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, device_id)
);

CREATE INDEX idx_mobile_devices_user ON mobile_devices(user_id);
CREATE INDEX idx_mobile_devices_push ON mobile_devices(push_token);
CREATE INDEX idx_mobile_devices_active ON mobile_devices(is_active, last_active_at);

-- Push Notification Queue
CREATE TABLE push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Target
    device_id UUID REFERENCES mobile_devices(id),
    user_id UUID REFERENCES users(id),
    topic VARCHAR(100),                             -- For topic-based broadcast

    -- Notification Content
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    subtitle VARCHAR(200),
    image_url VARCHAR(500),

    -- Data Payload
    data JSONB DEFAULT '{}',

    -- Action
    action_type VARCHAR(50),                        -- OPEN_LOAD, OPEN_MESSAGE, etc.
    action_data JSONB,

    -- Categorization
    category VARCHAR(50) NOT NULL,                  -- LOAD_UPDATE, MESSAGE, ALERT, REMINDER
    priority VARCHAR(20) DEFAULT 'NORMAL',          -- LOW, NORMAL, HIGH, CRITICAL

    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, SENT, DELIVERED, FAILED, EXPIRED
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,

    -- Provider Response
    provider_message_id VARCHAR(200),
    error_code VARCHAR(50),
    error_message TEXT,

    -- Tracking
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_push_notifications_user ON push_notifications(user_id);
CREATE INDEX idx_push_notifications_device ON push_notifications(device_id);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);
CREATE INDEX idx_push_notifications_scheduled ON push_notifications(scheduled_at);

-- Driver Location Updates
CREATE TABLE driver_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    driver_id UUID NOT NULL,                        -- References carrier_drivers or users
    device_id UUID REFERENCES mobile_devices(id),

    -- Location
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    accuracy DECIMAL(10,2),                         -- Accuracy in meters
    altitude DECIMAL(10,2),
    speed DECIMAL(8,2),                             -- Speed in mph
    heading DECIMAL(5,2),                           -- Bearing/heading degrees

    -- Context
    load_id UUID REFERENCES loads(id),
    activity_type VARCHAR(30),                      -- DRIVING, STOPPED, PICKUP, DELIVERY

    -- Address (reverse geocoded)
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(10),

    -- Battery & Network
    battery_level INTEGER,
    network_type VARCHAR(20),                       -- WIFI, 4G, 5G

    -- Timestamp
    recorded_at TIMESTAMPTZ NOT NULL,               -- Time on device
    received_at TIMESTAMPTZ DEFAULT NOW(),          -- Time received by server

    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (recorded_at);

CREATE INDEX idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_load ON driver_locations(load_id);
CREATE INDEX idx_driver_locations_recorded ON driver_locations(recorded_at DESC);
CREATE INDEX idx_driver_locations_coords ON driver_locations USING GIST (
    ST_Point(longitude, latitude)
);

-- Create partitions for locations
CREATE TABLE driver_locations_y2025m01 PARTITION OF driver_locations
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE driver_locations_y2025m02 PARTITION OF driver_locations
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Offline Sync Queue
CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    device_id UUID NOT NULL REFERENCES mobile_devices(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Sync Operation
    operation_type VARCHAR(20) NOT NULL,            -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(50) NOT NULL,               -- LOAD_STATUS, POD, SIGNATURE, etc.
    entity_id UUID,

    -- Data
    payload JSONB NOT NULL,

    -- Conflict Resolution
    client_timestamp TIMESTAMPTZ NOT NULL,          -- When action occurred on device
    server_timestamp TIMESTAMPTZ,                   -- When synced to server
    conflict_status VARCHAR(20),                    -- NONE, CONFLICT, RESOLVED
    conflict_resolution JSONB,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, SYNCED, FAILED, CONFLICT

    -- Errors
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

CREATE INDEX idx_offline_sync_device ON offline_sync_queue(device_id);
CREATE INDEX idx_offline_sync_status ON offline_sync_queue(status);

-- Mobile POD Captures
CREATE TABLE mobile_pod_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_id UUID NOT NULL REFERENCES loads(id),
    stop_id UUID REFERENCES stops(id),

    -- Capture Info
    capture_type VARCHAR(20) NOT NULL,              -- PHOTO, SIGNATURE, SCAN

    -- Device
    device_id UUID REFERENCES mobile_devices(id),
    captured_by UUID REFERENCES users(id),

    -- Location at Capture
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    capture_address VARCHAR(500),

    -- Timestamp
    captured_at TIMESTAMPTZ NOT NULL,

    -- Image/Document
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(50),
    document_id UUID REFERENCES documents(id),      -- After processing

    -- For Signatures
    signee_name VARCHAR(100),
    signee_title VARCHAR(100),
    signature_data TEXT,                            -- Base64 or vector data

    -- OCR (for scanned docs)
    ocr_status VARCHAR(20),                         -- PENDING, COMPLETED, FAILED
    ocr_text TEXT,
    ocr_confidence DECIMAL(5,2),

    -- Status
    status VARCHAR(20) DEFAULT 'CAPTURED',          -- CAPTURED, UPLOADED, PROCESSED, FAILED
    processed_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mobile_pod_load ON mobile_pod_captures(load_id);
CREATE INDEX idx_mobile_pod_stop ON mobile_pod_captures(stop_id);
CREATE INDEX idx_mobile_pod_status ON mobile_pod_captures(status);

-- In-App Messages (Driver-Dispatcher Chat)
CREATE TABLE mobile_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Conversation
    conversation_id UUID NOT NULL,

    -- Participants
    sender_id UUID NOT NULL REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL,               -- DRIVER, DISPATCHER, SYSTEM

    -- Context
    load_id UUID REFERENCES loads(id),

    -- Message
    message_type VARCHAR(20) NOT NULL,              -- TEXT, IMAGE, LOCATION, DOCUMENT, SYSTEM
    content TEXT,
    media_url VARCHAR(500),

    -- Location (for location shares)
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    -- Status
    status VARCHAR(20) DEFAULT 'SENT',              -- SENT, DELIVERED, READ
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,

    -- Push
    push_sent BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mobile_messages_conversation ON mobile_messages(conversation_id);
CREATE INDEX idx_mobile_messages_load ON mobile_messages(load_id);
CREATE INDEX idx_mobile_messages_sender ON mobile_messages(sender_id);
CREATE INDEX idx_mobile_messages_created ON mobile_messages(created_at DESC);

-- Message Conversations
CREATE TABLE mobile_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Context
    conversation_type VARCHAR(20) NOT NULL,         -- LOAD, DIRECT, GROUP
    load_id UUID REFERENCES loads(id),

    -- Participants
    participant_ids UUID[] NOT NULL,

    -- Latest Message
    last_message_id UUID REFERENCES mobile_messages(id),
    last_message_at TIMESTAMPTZ,
    last_message_preview VARCHAR(200),

    -- Read Status per Participant
    read_status JSONB DEFAULT '{}',                 -- {user_id: last_read_message_id}

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mobile_conversations_load ON mobile_conversations(load_id);
CREATE INDEX idx_mobile_conversations_participants ON mobile_conversations USING GIN(participant_ids);

-- Check Call Schedule
CREATE TABLE check_call_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_id UUID NOT NULL REFERENCES loads(id),
    driver_id UUID,

    -- Schedule
    scheduled_at TIMESTAMPTZ NOT NULL,
    check_type VARCHAR(20) NOT NULL,                -- LOCATION, STATUS, ETA, CUSTOM

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, SENT, RESPONDED, MISSED

    -- Push Notification
    notification_id UUID REFERENCES push_notifications(id),
    sent_at TIMESTAMPTZ,

    -- Response
    responded_at TIMESTAMPTZ,
    response_type VARCHAR(20),                      -- LOCATION_SHARED, MESSAGE, CALL
    response_data JSONB,

    -- Auto Responses
    auto_reminder_enabled BOOLEAN DEFAULT true,
    reminder_count INTEGER DEFAULT 0,
    max_reminders INTEGER DEFAULT 3,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_check_calls_load ON check_call_schedules(load_id);
CREATE INDEX idx_check_calls_scheduled ON check_call_schedules(scheduled_at);
CREATE INDEX idx_check_calls_status ON check_call_schedules(status);

-- App Feature Flags (mobile-specific)
CREATE TABLE mobile_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),          -- NULL = global

    -- Feature
    feature_key VARCHAR(100) NOT NULL,
    feature_name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Targeting
    platform VARCHAR(20),                           -- IOS, ANDROID, ALL
    min_app_version VARCHAR(20),
    max_app_version VARCHAR(20),

    -- Status
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 100,

    -- Configuration
    config JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, feature_key)
);

CREATE INDEX idx_mobile_features_key ON mobile_feature_flags(feature_key);

-- App Analytics Events
CREATE TABLE mobile_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    device_id UUID REFERENCES mobile_devices(id),
    user_id UUID REFERENCES users(id),

    -- Event Info
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),

    -- Context
    screen_name VARCHAR(100),
    load_id UUID,

    -- Properties
    properties JSONB DEFAULT '{}',

    -- Device Info
    app_version VARCHAR(20),
    os_version VARCHAR(20),
    device_type VARCHAR(20),

    -- Timestamp
    occurred_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (occurred_at);

CREATE INDEX idx_mobile_analytics_event ON mobile_analytics(event_name);
CREATE INDEX idx_mobile_analytics_user ON mobile_analytics(user_id);
CREATE INDEX idx_mobile_analytics_occurred ON mobile_analytics(occurred_at DESC);

-- Create partitions
CREATE TABLE mobile_analytics_y2025m01 PARTITION OF mobile_analytics
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

## API Endpoints

| Method                       | Endpoint                                 | Description              |
| ---------------------------- | ---------------------------------------- | ------------------------ |
| **Authentication**           |
| POST                         | `/api/mobile/auth/login`                 | Mobile login             |
| POST                         | `/api/mobile/auth/biometric`             | Biometric authentication |
| POST                         | `/api/mobile/auth/refresh`               | Refresh access token     |
| POST                         | `/api/mobile/auth/logout`                | Logout and clear session |
| **Device Management**        |
| POST                         | `/api/mobile/devices/register`           | Register device          |
| PUT                          | `/api/mobile/devices/{id}`               | Update device info       |
| DELETE                       | `/api/mobile/devices/{id}`               | Unregister device        |
| PUT                          | `/api/mobile/devices/{id}/push-token`    | Update push token        |
| **Push Notifications**       |
| GET                          | `/api/mobile/notifications`              | Get notification history |
| PUT                          | `/api/mobile/notifications/{id}/read`    | Mark as read             |
| PUT                          | `/api/mobile/notifications/read-all`     | Mark all read            |
| GET                          | `/api/mobile/notifications/unread-count` | Get unread count         |
| **Location Tracking**        |
| POST                         | `/api/mobile/location`                   | Submit location update   |
| POST                         | `/api/mobile/location/batch`             | Submit batch updates     |
| GET                          | `/api/mobile/location/driver/{driverId}` | Get driver location      |
| GET                          | `/api/mobile/location/load/{loadId}`     | Get load location        |
| **Offline Sync**             |
| POST                         | `/api/mobile/sync/push`                  | Push offline changes     |
| GET                          | `/api/mobile/sync/pull`                  | Pull updates since       |
| GET                          | `/api/mobile/sync/status`                | Get sync status          |
| POST                         | `/api/mobile/sync/resolve`               | Resolve conflict         |
| **POD Capture**              |
| POST                         | `/api/mobile/pod/upload`                 | Upload POD image         |
| POST                         | `/api/mobile/pod/signature`              | Submit signature         |
| POST                         | `/api/mobile/pod/scan`                   | Submit scanned doc       |
| GET                          | `/api/mobile/pod/load/{loadId}`          | Get PODs for load        |
| **Messaging**                |
| GET                          | `/api/mobile/messages/conversations`     | List conversations       |
| GET                          | `/api/mobile/messages/conversation/{id}` | Get messages             |
| POST                         | `/api/mobile/messages/send`              | Send message             |
| PUT                          | `/api/mobile/messages/{id}/read`         | Mark message read        |
| POST                         | `/api/mobile/messages/share-location`    | Share location           |
| **Check Calls**              |
| GET                          | `/api/mobile/check-calls/pending`        | Get pending check calls  |
| POST                         | `/api/mobile/check-calls/{id}/respond`   | Respond to check call    |
| **Loads (Mobile-Optimized)** |
| GET                          | `/api/mobile/loads`                      | Get driver loads         |
| GET                          | `/api/mobile/loads/{id}`                 | Get load details         |
| PUT                          | `/api/mobile/loads/{id}/status`          | Update load status       |
| GET                          | `/api/mobile/loads/available`            | Get available loads      |
| POST                         | `/api/mobile/loads/{id}/accept`          | Accept load              |
| **Fuel**                     |
| GET                          | `/api/mobile/fuel/nearby`                | Find nearby truck stops  |
| GET                          | `/api/mobile/fuel/prices`                | Get fuel prices          |
| **Navigation**               |
| POST                         | `/api/mobile/navigation/route`           | Get route                |
| GET                          | `/api/mobile/navigation/stops/{loadId}`  | Get stop addresses       |
| **Feature Flags**            |
| GET                          | `/api/mobile/features`                   | Get mobile features      |
| **Analytics**                |
| POST                         | `/api/mobile/analytics/events`           | Track events             |
| POST                         | `/api/mobile/analytics/screen`           | Track screen view        |

---

## Events

### Published Events

| Event                        | Trigger                 | Payload                   |
| ---------------------------- | ----------------------- | ------------------------- |
| `mobile.device.registered`   | New device registered   | deviceId, userId          |
| `mobile.device.updated`      | Device info updated     | deviceId                  |
| `mobile.login.success`       | Successful mobile login | userId, deviceId          |
| `mobile.login.biometric`     | Biometric login         | userId, deviceId          |
| `mobile.location.updated`    | Location received       | driverId, location        |
| `mobile.location.geofence`   | Entered/exited geofence | driverId, loadId, event   |
| `mobile.pod.captured`        | POD captured            | loadId, captureType       |
| `mobile.pod.uploaded`        | POD uploaded            | loadId, documentId        |
| `mobile.signature.captured`  | Signature captured      | loadId, stopId            |
| `mobile.message.sent`        | Chat message sent       | conversationId, messageId |
| `mobile.checkcall.responded` | Check call answered     | loadId, response          |
| `mobile.checkcall.missed`    | Check call missed       | loadId, scheduleId        |
| `mobile.sync.completed`      | Offline sync done       | deviceId, changes         |
| `mobile.sync.conflict`       | Sync conflict detected  | deviceId, entity          |

### Subscribed Events

| Event                  | Source        | Action                 |
| ---------------------- | ------------- | ---------------------- |
| `load.assigned`        | TMS           | Send push notification |
| `load.status_changed`  | TMS           | Send push notification |
| `load.eta_updated`     | TMS           | Send push notification |
| `message.received`     | Communication | Send push notification |
| `document.required`    | Documents     | Send reminder push     |
| `check_call.scheduled` | Scheduler     | Queue check call       |

---

## Business Rules

### Device Management

1. One active session per device
2. Max 5 devices per user
3. Automatically expire inactive devices (90 days)
4. Require re-authentication after device wipe
5. Push tokens refresh on app launch

### Location Tracking

1. Track every 30 seconds while driving
2. Track every 5 minutes when stopped
3. Batch uploads when offline
4. Alert if no update in 1 hour for active load
5. Geocode addresses asynchronously

### Offline Sync

1. Queue all changes with client timestamp
2. Sync on reconnection
3. Last-write-wins for most conflicts
4. Manual resolution for critical conflicts
5. Expire pending syncs after 7 days

### POD Capture

1. Require GPS coordinates with capture
2. Compress images before upload
3. Run OCR on BOL scans
4. Store original and processed versions
5. Auto-attach to correct load/stop

### Check Calls

1. Schedule based on load checkpoints
2. Send push notification at scheduled time
3. Retry up to 3 times if no response
4. Escalate to dispatcher if missed
5. Auto-log location shares as responses

### Messaging

1. Messages linked to load when applicable
2. Unread counts per conversation
3. Push for new messages
4. Support text, images, location
5. Auto-create conversation on load assign

---

## Screens

| Screen              | Description                  |
| ------------------- | ---------------------------- |
| Login               | Mobile login with biometrics |
| Dashboard           | Driver home dashboard        |
| My Loads            | List of assigned loads       |
| Load Detail         | Full load information        |
| Load Status Update  | Update load/stop status      |
| POD Capture         | Camera for POD photos        |
| Signature Capture   | Touch signature pad          |
| Document Scanner    | OCR document capture         |
| Messages            | Conversation list            |
| Chat                | Individual chat thread       |
| Check Call Response | Respond to check call        |
| Available Loads     | Browse available loads       |
| Load Accept         | Accept/decline load          |
| Navigation          | Turn-by-turn directions      |
| Fuel Finder         | Nearby truck stops           |
| Notifications       | Notification history         |
| Settings            | App settings                 |
| Profile             | Driver profile               |

---

## Configuration

### Environment Variables

```env
# Push Notifications
FCM_SERVER_KEY=your_fcm_key
FCM_PROJECT_ID=your_project
APNS_KEY_ID=your_key_id
APNS_TEAM_ID=your_team_id
APNS_BUNDLE_ID=com.your.app

# Storage (for uploads)
S3_MOBILE_BUCKET=mobile-uploads
S3_POD_BUCKET=pod-documents

# Location
LOCATION_UPDATE_INTERVAL_SECONDS=30
LOCATION_IDLE_INTERVAL_SECONDS=300
GEOFENCE_RADIUS_METERS=500

# OCR
OCR_PROVIDER=AWS_TEXTRACT
AWS_TEXTRACT_REGION=us-east-1

# Maps
GOOGLE_MAPS_API_KEY=your_key
```

### Default Settings

```json
{
  "mobile": {
    "authentication": {
      "biometricEnabled": true,
      "sessionTimeoutHours": 24,
      "maxDevicesPerUser": 5,
      "inactiveDeviceDays": 90
    },
    "location": {
      "trackingIntervalSeconds": 30,
      "idleIntervalSeconds": 300,
      "batchUploadEnabled": true,
      "batchSize": 100,
      "alertNoUpdateMinutes": 60
    },
    "sync": {
      "syncOnReconnect": true,
      "conflictResolution": "LAST_WRITE_WINS",
      "pendingExpireDays": 7
    },
    "push": {
      "defaultSound": true,
      "defaultVibrate": true,
      "quietHoursEnabled": false
    },
    "pod": {
      "imageCompressionQuality": 0.8,
      "maxImageSizeMB": 10,
      "requireGps": true,
      "ocrEnabled": true
    },
    "checkCalls": {
      "maxReminders": 3,
      "reminderIntervalMinutes": 15,
      "escalateAfterMissed": true
    }
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Token refresh logic
- [ ] Location batching
- [ ] Offline queue management
- [ ] Conflict resolution
- [ ] Push payload formatting

### Integration Tests

- [ ] Firebase Cloud Messaging
- [ ] Apple Push Notification Service
- [ ] S3 upload flow
- [ ] OCR processing
- [ ] Real-time messaging

### E2E Tests

- [ ] Complete login flow
- [ ] Load accept to POD capture
- [ ] Offline work and sync
- [ ] Check call response flow
- [ ] Chat messaging flow

---

## Navigation

- **Previous:** [32 - Load Board](../32-load-board/README.md)
- **Next:** [34 - Super Admin](../34-super-admin/README.md)
- **Index:** [All Services](../README.md)
