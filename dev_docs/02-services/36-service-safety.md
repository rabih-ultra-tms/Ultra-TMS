# 29 - Safety Service

| Field            | Value                    |
| ---------------- | ------------------------ |
| **Service ID**   | 29                       |
| **Service Name** | Safety                   |
| **Category**     | Extended                 |
| **Module Path**  | `@modules/safety`        |
| **Phase**        | A (MVP)                  |
| **Weeks**        | 63-66                    |
| **Priority**     | P1                       |
| **Dependencies** | Auth, Carrier, Documents |

---

## Purpose

FMCSA integration and safety management service for carrier compliance verification, CSA score monitoring, driver qualification file (DQF) management, and safety incident tracking. Ensures all carriers meet federal safety standards and maintains compliance documentation required for freight brokerage operations.

---

## Features

- **FMCSA SAFER Integration** - Real-time carrier authority verification
- **CSA Score Monitoring** - Track carrier safety scores across BASICs
- **Driver Qualification Files** - DQF document management
- **Insurance Verification** - Auto-verify and track insurance certificates
- **Safety Scoring** - Internal carrier safety ratings
- **Incident Tracking** - Accidents, violations, inspections
- **Compliance Alerts** - Proactive expiration warnings
- **Authority Monitoring** - Track operating authority changes
- **Carrier Watchlist** - High-risk carrier identification
- **Audit Trail** - Complete compliance documentation
- **Batch Refresh** - Scheduled FMCSA data updates
- **Compliance Reports** - Regulatory compliance documentation

---

## Database Schema

```sql
-- FMCSA Carrier Records (SAFER data)
CREATE TABLE fmcsa_carrier_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- FMCSA Identifiers
    dot_number VARCHAR(10) NOT NULL,
    mc_number VARCHAR(10),
    mx_number VARCHAR(10),
    ff_number VARCHAR(10),

    -- Company Information
    legal_name VARCHAR(200) NOT NULL,
    dba_name VARCHAR(200),
    physical_address JSONB,
    mailing_address JSONB,
    phone VARCHAR(20),

    -- Operating Authority
    common_authority_status VARCHAR(20),       -- ACTIVE, INACTIVE, NOT_AUTH
    contract_authority_status VARCHAR(20),
    broker_authority_status VARCHAR(20),

    -- MCS-150 Data
    mcs150_date DATE,
    mcs150_mileage INTEGER,
    mcs150_mileage_year INTEGER,

    -- Fleet Information
    power_units INTEGER,
    drivers INTEGER,

    -- Operation Classification
    carrier_operation VARCHAR(50)[],           -- ['A' Interstate, 'B' Intrastate, etc.]
    operation_classification VARCHAR(50)[],   -- ['Auth For Hire', 'Exempt For Hire', etc.]
    cargo_carried VARCHAR(50)[],               -- Cargo types authorized

    -- Safety Rating
    safety_rating VARCHAR(30),                 -- SATISFACTORY, CONDITIONAL, UNSATISFACTORY
    safety_rating_date DATE,
    safety_review_date DATE,
    safety_review_type VARCHAR(50),

    -- OOS (Out of Service) Information
    oos_date DATE,
    oos_reason VARCHAR(500),

    -- Fetch Metadata
    last_fetched_at TIMESTAMPTZ NOT NULL,
    next_refresh_at TIMESTAMPTZ,
    fetch_source VARCHAR(20) DEFAULT 'SAFER',  -- SAFER, MANUAL
    raw_response JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, dot_number)
);

CREATE INDEX idx_fmcsa_records_carrier ON fmcsa_carrier_records(carrier_id);
CREATE INDEX idx_fmcsa_records_dot ON fmcsa_carrier_records(dot_number);
CREATE INDEX idx_fmcsa_records_mc ON fmcsa_carrier_records(mc_number);
CREATE INDEX idx_fmcsa_records_refresh ON fmcsa_carrier_records(next_refresh_at);

-- CSA (Compliance, Safety, Accountability) Scores
CREATE TABLE csa_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    fmcsa_record_id UUID REFERENCES fmcsa_carrier_records(id),

    -- Score Date
    score_date DATE NOT NULL,

    -- BASIC Scores (0-100, higher is worse)
    unsafe_driving_score DECIMAL(5,2),
    unsafe_driving_percentile INTEGER,
    unsafe_driving_alert BOOLEAN DEFAULT false,

    hours_of_service_score DECIMAL(5,2),
    hours_of_service_percentile INTEGER,
    hours_of_service_alert BOOLEAN DEFAULT false,

    driver_fitness_score DECIMAL(5,2),
    driver_fitness_percentile INTEGER,
    driver_fitness_alert BOOLEAN DEFAULT false,

    controlled_substances_score DECIMAL(5,2),
    controlled_substances_percentile INTEGER,
    controlled_substances_alert BOOLEAN DEFAULT false,

    vehicle_maintenance_score DECIMAL(5,2),
    vehicle_maintenance_percentile INTEGER,
    vehicle_maintenance_alert BOOLEAN DEFAULT false,

    hazmat_compliance_score DECIMAL(5,2),
    hazmat_compliance_percentile INTEGER,
    hazmat_compliance_alert BOOLEAN DEFAULT false,

    crash_indicator_score DECIMAL(5,2),
    crash_indicator_percentile INTEGER,

    -- Summary
    total_inspections INTEGER,
    total_violations INTEGER,
    total_crashes INTEGER,
    oos_rate DECIMAL(5,2),                     -- Out of Service rate %

    -- Fetch Metadata
    fetched_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(20) DEFAULT 'SMS',          -- SMS, MANUAL
    raw_response JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, carrier_id, score_date)
);

CREATE INDEX idx_csa_scores_carrier ON csa_scores(carrier_id);
CREATE INDEX idx_csa_scores_date ON csa_scores(score_date DESC);

-- Carrier Insurance Records
CREATE TABLE carrier_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Insurance Type
    insurance_type VARCHAR(50) NOT NULL,       -- AUTO_LIABILITY, CARGO, GENERAL_LIABILITY, WORKERS_COMP

    -- Policy Information
    policy_number VARCHAR(100),
    insurance_company VARCHAR(200) NOT NULL,
    insurance_company_naic VARCHAR(10),

    -- Coverage
    coverage_amount DECIMAL(15,2) NOT NULL,
    deductible DECIMAL(15,2),

    -- Dates
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,

    -- Certificate
    certificate_number VARCHAR(100),
    certificate_holder VARCHAR(200),
    additional_insured BOOLEAN DEFAULT false,

    -- Verification
    verification_status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, VERIFIED, EXPIRED, INVALID
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    verification_method VARCHAR(30),           -- FMCSA, CERTIFICATE, MANUAL
    verification_notes TEXT,

    -- FMCSA Filing
    fmcsa_required BOOLEAN DEFAULT true,
    fmcsa_filing_status VARCHAR(20),           -- ACTIVE, CANCELLED, PENDING
    fmcsa_effective_date DATE,
    fmcsa_cancellation_date DATE,

    -- Document
    document_id UUID REFERENCES documents(id),

    -- Alerts
    expiration_alert_sent BOOLEAN DEFAULT false,
    expiration_alert_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',       -- ACTIVE, EXPIRED, CANCELLED

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_carrier_insurance_carrier ON carrier_insurance(carrier_id);
CREATE INDEX idx_carrier_insurance_type ON carrier_insurance(insurance_type);
CREATE INDEX idx_carrier_insurance_expiration ON carrier_insurance(expiration_date);
CREATE INDEX idx_carrier_insurance_status ON carrier_insurance(status);

-- Driver Qualification Files (DQF)
CREATE TABLE driver_qualification_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    driver_id UUID REFERENCES carrier_drivers(id),

    -- Driver Information
    driver_first_name VARCHAR(100) NOT NULL,
    driver_last_name VARCHAR(100) NOT NULL,
    driver_license_number VARCHAR(50) NOT NULL,
    driver_license_state VARCHAR(2) NOT NULL,
    driver_license_class VARCHAR(10),          -- A, B, C
    driver_license_expiration DATE,

    -- Endorsements
    endorsements VARCHAR(10)[],                -- H, N, P, S, T, X
    restrictions VARCHAR(10)[],

    -- Employment
    hire_date DATE,
    termination_date DATE,
    employment_status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, TERMINATED, SUSPENDED

    -- Medical Certificate
    medical_card_number VARCHAR(50),
    medical_card_expiration DATE,
    medical_examiner_name VARCHAR(200),
    medical_examiner_registry_number VARCHAR(50),

    -- Drug & Alcohol
    last_drug_test_date DATE,
    drug_test_result VARCHAR(20),              -- NEGATIVE, POSITIVE, REFUSED
    drug_test_type VARCHAR(20),                -- PRE_EMPLOYMENT, RANDOM, POST_ACCIDENT
    clearinghouse_query_date DATE,
    clearinghouse_status VARCHAR(20),          -- CLEAR, VIOLATION

    -- MVR (Motor Vehicle Record)
    last_mvr_date DATE,
    mvr_status VARCHAR(20),                    -- CLEAR, VIOLATIONS, SUSPENDED
    mvr_violations INTEGER DEFAULT 0,

    -- Training
    safety_training_date DATE,
    hazmat_training_date DATE,

    -- Compliance Status
    compliance_status VARCHAR(20) DEFAULT 'INCOMPLETE',  -- COMPLETE, INCOMPLETE, EXPIRED
    missing_documents VARCHAR(50)[],
    next_review_date DATE,

    -- Documents (references to document service)
    documents JSONB DEFAULT '[]',              -- [{type, document_id, expiration_date}]

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_dqf_carrier ON driver_qualification_files(carrier_id);
CREATE INDEX idx_dqf_driver ON driver_qualification_files(driver_id);
CREATE INDEX idx_dqf_license ON driver_qualification_files(driver_license_number, driver_license_state);
CREATE INDEX idx_dqf_compliance ON driver_qualification_files(compliance_status);

-- Safety Incidents
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Related Records
    load_id UUID REFERENCES loads(id),
    driver_id UUID REFERENCES carrier_drivers(id),
    dqf_id UUID REFERENCES driver_qualification_files(id),

    -- Incident Classification
    incident_type VARCHAR(30) NOT NULL,        -- ACCIDENT, VIOLATION, INSPECTION, CARGO_DAMAGE
    incident_subtype VARCHAR(50),
    severity VARCHAR(20) NOT NULL,             -- MINOR, MODERATE, SEVERE, FATAL

    -- Incident Details
    incident_number VARCHAR(50),
    incident_date DATE NOT NULL,
    incident_time TIME,
    incident_location VARCHAR(200),
    incident_state VARCHAR(2),
    incident_description TEXT,

    -- For Accidents
    dot_recordable BOOLEAN,
    fatalities INTEGER DEFAULT 0,
    injuries INTEGER DEFAULT 0,
    tow_away BOOLEAN,
    hazmat_release BOOLEAN,

    -- For Inspections
    inspection_level INTEGER,                  -- 1-6
    roadside_inspection_number VARCHAR(50),
    inspection_result VARCHAR(20),             -- PASS, VIOLATION, OOS
    violations_count INTEGER DEFAULT 0,
    driver_oos BOOLEAN,
    vehicle_oos BOOLEAN,

    -- Investigation
    investigation_status VARCHAR(20) DEFAULT 'OPEN',  -- OPEN, IN_PROGRESS, CLOSED
    investigator_id UUID REFERENCES users(id),
    investigation_notes TEXT,
    root_cause VARCHAR(200),
    corrective_action TEXT,
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),

    -- Financial Impact
    estimated_cost DECIMAL(15,2),
    insurance_claim_number VARCHAR(100),

    -- Documents
    documents JSONB DEFAULT '[]',              -- Document references

    -- Source
    source VARCHAR(20) DEFAULT 'MANUAL',       -- FMCSA, MANUAL, ELD
    fmcsa_report_number VARCHAR(50),

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_safety_incidents_carrier ON safety_incidents(carrier_id);
CREATE INDEX idx_safety_incidents_load ON safety_incidents(load_id);
CREATE INDEX idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX idx_safety_incidents_date ON safety_incidents(incident_date DESC);
CREATE INDEX idx_safety_incidents_status ON safety_incidents(investigation_status);

-- Incident Violations (detail records)
CREATE TABLE incident_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES safety_incidents(id),

    -- Violation Details
    violation_code VARCHAR(20) NOT NULL,
    violation_group VARCHAR(50),               -- DRIVER, VEHICLE, HAZMAT
    violation_description TEXT NOT NULL,

    -- BASIC Category
    basic_category VARCHAR(50),                -- Which CSA BASIC it affects

    -- Severity
    severity_weight DECIMAL(5,2),
    time_weight DECIMAL(5,2),

    -- OOS
    oos_violation BOOLEAN DEFAULT false,
    oos_severity_weight DECIMAL(5,2),

    -- Unit
    unit_type VARCHAR(20),                     -- DRIVER, VEHICLE
    unit_number VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incident_violations_incident ON incident_violations(incident_id);

-- Carrier Safety Scores (Internal scoring)
CREATE TABLE carrier_safety_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Score Date
    score_date DATE NOT NULL,

    -- Component Scores (0-100, higher is better - internal scale)
    authority_score INTEGER,                   -- Based on FMCSA authority status
    insurance_score INTEGER,                   -- Based on insurance verification
    csa_score INTEGER,                         -- Derived from CSA BASICs
    incident_score INTEGER,                    -- Based on historical incidents
    compliance_score INTEGER,                  -- Based on DQF compliance
    performance_score INTEGER,                 -- Based on load performance

    -- Composite Score
    overall_score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL,           -- LOW, MEDIUM, HIGH, CRITICAL

    -- Factors
    scoring_factors JSONB,                     -- Detailed breakdown

    -- Thresholds Applied
    thresholds_version VARCHAR(10),

    -- Recommendations
    auto_approve BOOLEAN DEFAULT false,
    requires_review BOOLEAN DEFAULT false,
    recommendations TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, carrier_id, score_date)
);

CREATE INDEX idx_carrier_safety_scores_carrier ON carrier_safety_scores(carrier_id);
CREATE INDEX idx_carrier_safety_scores_date ON carrier_safety_scores(score_date DESC);
CREATE INDEX idx_carrier_safety_scores_risk ON carrier_safety_scores(risk_level);

-- Carrier Watchlist
CREATE TABLE carrier_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Watchlist Reason
    reason_type VARCHAR(30) NOT NULL,          -- CSA_ALERT, INSURANCE_LAPSE, AUTHORITY_ISSUE, INCIDENT, MANUAL
    reason_details TEXT NOT NULL,

    -- Risk Level
    risk_level VARCHAR(20) NOT NULL,           -- ELEVATED, HIGH, CRITICAL

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',       -- ACTIVE, RESOLVED, EXPIRED

    -- Actions
    action_required TEXT,
    restricted_from_booking BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    approval_level VARCHAR(20),                -- MANAGER, DIRECTOR, VP

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,

    -- Auto-Expiry
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_carrier_watchlist_carrier ON carrier_watchlist(carrier_id);
CREATE INDEX idx_carrier_watchlist_status ON carrier_watchlist(status);
CREATE INDEX idx_carrier_watchlist_risk ON carrier_watchlist(risk_level);

-- Compliance Alerts
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Alert Type
    alert_type VARCHAR(30) NOT NULL,           -- INSURANCE_EXPIRING, AUTHORITY_CHANGE, CSA_ALERT, DQF_EXPIRED
    alert_subtype VARCHAR(50),

    -- Related Record
    related_entity_type VARCHAR(30),           -- INSURANCE, DQF, FMCSA_RECORD
    related_entity_id UUID,

    -- Alert Details
    alert_title VARCHAR(200) NOT NULL,
    alert_message TEXT NOT NULL,

    -- Severity
    severity VARCHAR(20) NOT NULL,             -- INFO, WARNING, CRITICAL

    -- Dates
    trigger_date DATE,                         -- When the issue will occur
    days_until_trigger INTEGER,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',       -- ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED

    -- Acknowledgment
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id),

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,

    -- Notification
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    notification_recipients UUID[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_alerts_carrier ON compliance_alerts(carrier_id);
CREATE INDEX idx_compliance_alerts_type ON compliance_alerts(alert_type);
CREATE INDEX idx_compliance_alerts_status ON compliance_alerts(status);
CREATE INDEX idx_compliance_alerts_severity ON compliance_alerts(severity);
CREATE INDEX idx_compliance_alerts_trigger ON compliance_alerts(trigger_date);

-- FMCSA API Request Log
CREATE TABLE fmcsa_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Request Details
    endpoint VARCHAR(100) NOT NULL,
    request_type VARCHAR(30) NOT NULL,         -- SAFER_LOOKUP, SMS_SCORES, AUTHORITY_CHECK
    dot_number VARCHAR(10),
    mc_number VARCHAR(10),

    -- Response
    status_code INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,

    -- Timing
    requested_at TIMESTAMPTZ NOT NULL,
    response_time_ms INTEGER,

    -- Data
    response_data JSONB,

    -- Rate Limiting
    rate_limit_remaining INTEGER,
    rate_limit_reset_at TIMESTAMPTZ
) PARTITION BY RANGE (requested_at);

CREATE INDEX idx_fmcsa_api_logs_dot ON fmcsa_api_logs(dot_number);
CREATE INDEX idx_fmcsa_api_logs_requested ON fmcsa_api_logs(requested_at DESC);

-- Create partitions for API logs
CREATE TABLE fmcsa_api_logs_y2025m01 PARTITION OF fmcsa_api_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE fmcsa_api_logs_y2025m02 PARTITION OF fmcsa_api_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

---

## API Endpoints

| Method                               | Endpoint                                 | Description                     |
| ------------------------------------ | ---------------------------------------- | ------------------------------- |
| **FMCSA Lookup**                     |
| GET                                  | `/api/safety/fmcsa/lookup`               | Lookup carrier by DOT/MC number |
| POST                                 | `/api/safety/fmcsa/verify/{carrierId}`   | Verify carrier authority        |
| POST                                 | `/api/safety/fmcsa/refresh/{carrierId}`  | Refresh FMCSA data              |
| GET                                  | `/api/safety/fmcsa/records/{carrierId}`  | Get FMCSA record for carrier    |
| **CSA Scores**                       |
| GET                                  | `/api/safety/csa/{carrierId}`            | Get current CSA scores          |
| GET                                  | `/api/safety/csa/{carrierId}/history`    | Get CSA score history           |
| POST                                 | `/api/safety/csa/{carrierId}/refresh`    | Refresh CSA scores              |
| **Insurance**                        |
| GET                                  | `/api/safety/insurance`                  | List carrier insurance records  |
| POST                                 | `/api/safety/insurance`                  | Add insurance record            |
| GET                                  | `/api/safety/insurance/{id}`             | Get insurance details           |
| PUT                                  | `/api/safety/insurance/{id}`             | Update insurance record         |
| DELETE                               | `/api/safety/insurance/{id}`             | Delete insurance record         |
| POST                                 | `/api/safety/insurance/{id}/verify`      | Verify insurance                |
| GET                                  | `/api/safety/insurance/expiring`         | Get expiring insurance          |
| **DQF (Driver Qualification Files)** |
| GET                                  | `/api/safety/dqf`                        | List driver qualification files |
| POST                                 | `/api/safety/dqf`                        | Create DQF record               |
| GET                                  | `/api/safety/dqf/{id}`                   | Get DQF details                 |
| PUT                                  | `/api/safety/dqf/{id}`                   | Update DQF                      |
| DELETE                               | `/api/safety/dqf/{id}`                   | Delete DQF                      |
| GET                                  | `/api/safety/dqf/{id}/compliance`        | Check DQF compliance            |
| POST                                 | `/api/safety/dqf/{id}/documents`         | Add DQF document                |
| **Incidents**                        |
| GET                                  | `/api/safety/incidents`                  | List safety incidents           |
| POST                                 | `/api/safety/incidents`                  | Report incident                 |
| GET                                  | `/api/safety/incidents/{id}`             | Get incident details            |
| PUT                                  | `/api/safety/incidents/{id}`             | Update incident                 |
| POST                                 | `/api/safety/incidents/{id}/close`       | Close investigation             |
| GET                                  | `/api/safety/incidents/{id}/violations`  | Get incident violations         |
| **Safety Scores**                    |
| GET                                  | `/api/safety/scores/{carrierId}`         | Get carrier safety score        |
| GET                                  | `/api/safety/scores/{carrierId}/history` | Get score history               |
| POST                                 | `/api/safety/scores/calculate`           | Recalculate scores              |
| **Watchlist**                        |
| GET                                  | `/api/safety/watchlist`                  | List watchlist entries          |
| POST                                 | `/api/safety/watchlist`                  | Add to watchlist                |
| PUT                                  | `/api/safety/watchlist/{id}`             | Update watchlist entry          |
| POST                                 | `/api/safety/watchlist/{id}/resolve`     | Resolve watchlist entry         |
| **Alerts**                           |
| GET                                  | `/api/safety/alerts`                     | List compliance alerts          |
| GET                                  | `/api/safety/alerts/{id}`                | Get alert details               |
| POST                                 | `/api/safety/alerts/{id}/acknowledge`    | Acknowledge alert               |
| POST                                 | `/api/safety/alerts/{id}/dismiss`        | Dismiss alert                   |
| POST                                 | `/api/safety/alerts/{id}/resolve`        | Resolve alert                   |
| **Reports**                          |
| GET                                  | `/api/safety/reports/compliance`         | Compliance summary report       |
| GET                                  | `/api/safety/reports/incidents`          | Incident summary report         |
| GET                                  | `/api/safety/reports/expiring`           | Expiring documents report       |

---

## Events

### Published Events

| Event                           | Trigger                             | Payload                               |
| ------------------------------- | ----------------------------------- | ------------------------------------- |
| `safety.carrier.verified`       | Carrier FMCSA verification complete | carrierId, authorityStatus, details   |
| `safety.authority.changed`      | Authority status changed            | carrierId, oldStatus, newStatus       |
| `safety.csa.updated`            | CSA scores refreshed                | carrierId, scores, alerts             |
| `safety.csa.alert`              | CSA alert threshold crossed         | carrierId, basicCategory, score       |
| `safety.insurance.added`        | Insurance record added              | carrierId, insuranceId, type          |
| `safety.insurance.verified`     | Insurance verified                  | carrierId, insuranceId                |
| `safety.insurance.expiring`     | Insurance expiring soon             | carrierId, insuranceId, daysRemaining |
| `safety.insurance.expired`      | Insurance expired                   | carrierId, insuranceId                |
| `safety.dqf.created`            | DQF record created                  | carrierId, dqfId                      |
| `safety.dqf.compliance_changed` | DQF compliance status changed       | dqfId, status, missingItems           |
| `safety.incident.reported`      | Safety incident reported            | incidentId, type, severity            |
| `safety.incident.closed`        | Investigation closed                | incidentId, resolution                |
| `safety.score.updated`          | Carrier safety score updated        | carrierId, score, riskLevel           |
| `safety.watchlist.added`        | Carrier added to watchlist          | carrierId, reason, riskLevel          |
| `safety.watchlist.resolved`     | Watchlist entry resolved            | carrierId, resolution                 |
| `safety.alert.created`          | Compliance alert created            | alertId, carrierId, type              |

### Subscribed Events

| Event               | Source    | Action                      |
| ------------------- | --------- | --------------------------- |
| `carrier.created`   | Carrier   | Initiate FMCSA verification |
| `carrier.activated` | Carrier   | Verify insurance current    |
| `load.assigned`     | TMS       | Verify carrier compliance   |
| `document.uploaded` | Documents | Check if DQF document       |
| `scheduler.daily`   | Scheduler | Check expiring items        |
| `scheduler.weekly`  | Scheduler | Refresh CSA scores          |

---

## Business Rules

### FMCSA Verification

1. Verify all carriers via FMCSA SAFER before activation
2. Cache FMCSA data for 24 hours before refresh
3. Block carriers with inactive common authority
4. Alert on authority status changes
5. Log all FMCSA API calls for audit

### CSA Score Thresholds

1. Refresh CSA scores weekly for active carriers
2. Alert when any BASIC exceeds intervention threshold:
   - Unsafe Driving: >65%
   - Hours of Service: >65%
   - Driver Fitness: >80%
   - Controlled Substances: >80%
   - Vehicle Maintenance: >80%
   - Hazmat Compliance: >80%
   - Crash Indicator: >65%
3. Add to watchlist if 2+ BASICs in alert status
4. Block booking if 3+ BASICs in alert status

### Insurance Requirements

1. Require minimum coverage:
   - Auto Liability: $1,000,000
   - Cargo: $100,000 (configurable per customer)
2. Verify insurance FMCSA filing status
3. Alert 30 days before expiration
4. Suspend carrier on insurance lapse
5. Require certificate of insurance on file

### DQF Compliance

1. Required documents per FMCSA regulations:
   - CDL copy
   - Medical certificate
   - MVR (annual)
   - Employment application
   - Road test certificate
   - Drug test results
2. Alert on document expiration
3. Flag drivers with incomplete DQF

### Safety Scoring

1. Calculate composite score from:
   - Authority status (20%)
   - Insurance compliance (20%)
   - CSA scores (30%)
   - Incident history (20%)
   - Performance metrics (10%)
2. Recalculate on any component change
3. Risk levels:
   - 80-100: Low Risk
   - 60-79: Medium Risk
   - 40-59: High Risk
   - 0-39: Critical Risk
4. High/Critical risk requires manager approval for booking

### Incident Management

1. DOT-recordable accidents must be documented
2. Require investigation for all severe incidents
3. Track corrective actions
4. Factor incidents into safety score for 3 years

---

## Screens

| Screen                   | Description                          |
| ------------------------ | ------------------------------------ |
| Carrier Safety Dashboard | Overview of carrier safety metrics   |
| FMCSA Lookup             | Search and verify carriers by DOT/MC |
| FMCSA Record Detail      | View FMCSA authority and details     |
| CSA Scores View          | View carrier CSA BASIC scores        |
| CSA History Chart        | CSA score trends over time           |
| Insurance List           | List all carrier insurance records   |
| Insurance Detail         | View/edit insurance certificate      |
| Insurance Verification   | Verify insurance with FMCSA          |
| DQF List                 | List driver qualification files      |
| DQF Detail               | View/edit driver qualification file  |
| DQF Compliance Check     | Check DQF completeness               |
| Incident List            | List all safety incidents            |
| Incident Report Form     | Report new safety incident           |
| Incident Detail          | View/edit incident details           |
| Investigation Form       | Document incident investigation      |
| Safety Score Summary     | View carrier safety score breakdown  |
| Watchlist Management     | Manage carrier watchlist             |
| Compliance Alerts        | View and manage alerts               |
| Expiring Documents       | List documents expiring soon         |
| Compliance Report        | Generate compliance reports          |

---

## Configuration

### Environment Variables

```env
# FMCSA API
FMCSA_API_URL=https://mobile.fmcsa.dot.gov/qc/services
FMCSA_API_KEY=your_api_key
FMCSA_WEBKEY=your_webkey
FMCSA_RATE_LIMIT=100              # Requests per minute

# SMS (Safety Measurement System)
SMS_API_URL=https://ai.fmcsa.dot.gov/SMS
SMS_RATE_LIMIT=50

# Cache
FMCSA_CACHE_TTL_HOURS=24
CSA_CACHE_TTL_HOURS=168           # 7 days

# Alert Thresholds
INSURANCE_ALERT_DAYS=30
INSURANCE_CRITICAL_DAYS=7
DQF_ALERT_DAYS=30
```

### Default Settings

```json
{
  "safety": {
    "insuranceRequirements": {
      "autoLiability": {
        "minimum": 1000000,
        "preferred": 1000000
      },
      "cargo": {
        "minimum": 100000,
        "preferred": 100000
      }
    },
    "csaThresholds": {
      "unsafeDriving": 65,
      "hoursOfService": 65,
      "driverFitness": 80,
      "controlledSubstances": 80,
      "vehicleMaintenance": 80,
      "hazmatCompliance": 80,
      "crashIndicator": 65
    },
    "scoring": {
      "weights": {
        "authority": 0.2,
        "insurance": 0.2,
        "csa": 0.3,
        "incidents": 0.2,
        "performance": 0.1
      },
      "riskLevels": {
        "low": 80,
        "medium": 60,
        "high": 40,
        "critical": 0
      }
    },
    "incidentRetentionYears": 3,
    "dqfRequiredDocuments": [
      "CDL",
      "MEDICAL_CERTIFICATE",
      "MVR",
      "EMPLOYMENT_APPLICATION",
      "ROAD_TEST"
    ]
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] FMCSA API response parsing
- [ ] CSA score calculations
- [ ] Safety score composite calculation
- [ ] Risk level determination
- [ ] Insurance expiration detection
- [ ] DQF compliance checking
- [ ] Watchlist threshold logic

### Integration Tests

- [ ] FMCSA SAFER API integration
- [ ] SMS API integration
- [ ] Insurance verification flow
- [ ] Incident reporting workflow
- [ ] Alert generation and notification
- [ ] Carrier activation with safety check

### E2E Tests

- [ ] Complete carrier verification flow
- [ ] CSA score refresh and alert
- [ ] Insurance upload and verification
- [ ] DQF document management
- [ ] Incident report to investigation close
- [ ] Watchlist add and resolve

---

## Navigation

- **Previous:** [28 - EDI](../28-edi/README.md)
- **Next:** [30 - Fuel Cards](../30-fuel-cards/README.md)
- **Index:** [All Services](../README.md)
