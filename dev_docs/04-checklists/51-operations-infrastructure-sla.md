# Operations & Infrastructure

Operational guidelines, monitoring, SLAs, disaster recovery, and infrastructure planning for the 3PL Platform.

---

## Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [Monitoring & Observability](#monitoring--observability)
3. [Service Level Agreements](#service-level-agreements)
4. [Disaster Recovery](#disaster-recovery)
5. [Security Operations](#security-operations)
6. [Incident Management](#incident-management)
7. [Capacity Planning](#capacity-planning)
8. [Cost Management](#cost-management)

---

## Infrastructure Overview

### Cloud Architecture

```
                            ┌─────────────────────────────┐
                            │      CloudFlare CDN         │
                            │   (DDoS, WAF, Edge Cache)   │
                            └─────────────┬───────────────┘
                                          │
                            ┌─────────────▼───────────────┐
                            │      AWS Load Balancer      │
                            │        (ALB / NLB)          │
                            └─────────────┬───────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
    ┌─────────▼─────────┐     ┌──────────▼──────────┐     ┌─────────▼─────────┐
    │   Web Tier (ECS)  │     │   API Tier (ECS)    │     │  Worker Tier (ECS)│
    │                   │     │                      │     │                   │
    │  React Frontend   │     │  NestJS API          │     │  Background Jobs  │
    │  Nginx            │     │  GraphQL Gateway     │     │  Queue Consumers  │
    └─────────┬─────────┘     └──────────┬──────────┘     └─────────┬─────────┘
              │                           │                           │
              └───────────────────────────┼───────────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
    ┌─────────▼─────────┐     ┌──────────▼──────────┐     ┌─────────▼─────────┐
    │    PostgreSQL     │     │       Redis          │     │   Elasticsearch   │
    │   (RDS Aurora)    │     │   (ElastiCache)      │     │   (OpenSearch)    │
    └───────────────────┘     └─────────────────────┘     └───────────────────┘
```

### AWS Services Used

| Service                   | Purpose                   | Configuration                  |
| ------------------------- | ------------------------- | ------------------------------ |
| **ECS Fargate**           | Container orchestration   | Auto-scaling, spot instances   |
| **RDS Aurora PostgreSQL** | Primary database          | Multi-AZ, read replicas        |
| **ElastiCache Redis**     | Caching, sessions, queues | Cluster mode, 3 nodes          |
| **OpenSearch**            | Full-text search          | 3 data nodes, dedicated master |
| **S3**                    | Document storage          | Versioning, lifecycle policies |
| **CloudFront**            | CDN                       | Edge caching, SSL termination  |
| **SES**                   | Transactional email       | Dedicated IPs                  |
| **SNS/SQS**               | Messaging                 | FIFO queues for ordering       |
| **Secrets Manager**       | Credentials               | Auto-rotation                  |
| **CloudWatch**            | Monitoring                | Custom metrics, alarms         |
| **X-Ray**                 | Distributed tracing       | Sampling 5%                    |

### Environment Tiers

| Environment     | Purpose             | Resources            |
| --------------- | ------------------- | -------------------- |
| **Development** | Feature development | Minimal (shared DB)  |
| **Staging**     | QA and testing      | 50% of production    |
| **Production**  | Live traffic        | Full capacity        |
| **DR**          | Disaster recovery   | Standby in us-west-2 |

---

## Monitoring & Observability

### Metrics Collection

#### Application Metrics

```typescript
// Custom metrics to track
const metrics = {
  // Business Metrics
  'loads.created': Counter,
  'loads.delivered': Counter,
  'revenue.daily': Gauge,
  'carriers.active': Gauge,

  // Performance Metrics
  'api.request.duration': Histogram,
  'api.request.count': Counter,
  'db.query.duration': Histogram,
  'cache.hit.rate': Gauge,

  // Error Metrics
  'api.errors.4xx': Counter,
  'api.errors.5xx': Counter,
  'job.failures': Counter,

  // Queue Metrics
  'queue.depth': Gauge,
  'queue.processing.time': Histogram,
  'queue.dead.letter': Counter,
};
```

#### Infrastructure Metrics

| Metric             | Warning    | Critical   |
| ------------------ | ---------- | ---------- |
| CPU Utilization    | > 70%      | > 85%      |
| Memory Utilization | > 75%      | > 90%      |
| Disk Usage         | > 70%      | > 85%      |
| DB Connections     | > 70% pool | > 85% pool |
| Queue Depth        | > 1000     | > 5000     |
| Error Rate         | > 1%       | > 5%       |
| Response Time p95  | > 500ms    | > 2000ms   |

### Logging

#### Log Levels

| Level   | Usage                                    |
| ------- | ---------------------------------------- |
| `ERROR` | Exceptions, failures requiring attention |
| `WARN`  | Degraded performance, approaching limits |
| `INFO`  | Business events, request completion      |
| `DEBUG` | Detailed diagnostic info (dev only)      |

#### Structured Logging Format

```json
{
  "timestamp": "2025-01-03T10:30:00.000Z",
  "level": "INFO",
  "service": "tms-api",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "user-789",
  "tenantId": "tenant-456",
  "message": "Load created",
  "data": {
    "loadId": "load-123",
    "origin": "Dallas, TX",
    "destination": "Chicago, IL"
  },
  "duration": 145
}
```

#### Log Retention

| Log Type    | Hot Storage | Cold Storage | Total Retention |
| ----------- | ----------- | ------------ | --------------- |
| Application | 30 days     | 1 year       | 1 year          |
| Access      | 30 days     | 90 days      | 90 days         |
| Audit       | 90 days     | 7 years      | 7 years         |
| Security    | 90 days     | 7 years      | 7 years         |

### Alerting

#### Alert Channels

| Severity    | Channel           | Response Time     |
| ----------- | ----------------- | ----------------- |
| P1 Critical | PagerDuty + SMS   | 15 minutes        |
| P2 High     | PagerDuty + Slack | 1 hour            |
| P3 Medium   | Slack + Email     | 4 hours           |
| P4 Low      | Email             | Next business day |

#### Alert Rules

```yaml
# Example alert definitions
alerts:
  - name: High Error Rate
    condition: error_rate_5xx > 5%
    duration: 5m
    severity: P1

  - name: Slow Response Time
    condition: p95_latency > 2000ms
    duration: 5m
    severity: P2

  - name: Database Connection Pool
    condition: db_connections > 85%
    duration: 2m
    severity: P1

  - name: Queue Backup
    condition: queue_depth > 5000
    duration: 10m
    severity: P2
```

### Dashboards

#### Operations Dashboard

1. **System Health**
   - Service status grid
   - Error rates by service
   - Response time trends
   - Active incidents

2. **Infrastructure**
   - CPU/Memory utilization
   - Database metrics
   - Cache hit rates
   - Queue depths

3. **Business Metrics**
   - Loads created/delivered today
   - Active users
   - Revenue (if available)
   - API usage by tenant

---

## Service Level Agreements

### Availability SLA

| Tier               | Target | Monthly Downtime |
| ------------------ | ------ | ---------------- |
| **Platform**       | 99.9%  | 43 minutes       |
| **API**            | 99.9%  | 43 minutes       |
| **Web App**        | 99.9%  | 43 minutes       |
| **Mobile Backend** | 99.5%  | 3.6 hours        |

### Performance SLA

| Metric             | Target   | Measurement            |
| ------------------ | -------- | ---------------------- |
| API Response (p95) | < 500ms  | 95th percentile        |
| API Response (p99) | < 2000ms | 99th percentile        |
| Page Load          | < 3s     | First contentful paint |
| Search Results     | < 1s     | Query to results       |
| Report Generation  | < 30s    | Standard reports       |
| Document Upload    | < 10s    | 10MB file              |

### Data SLA

| Metric                             | Target                                |
| ---------------------------------- | ------------------------------------- |
| **RPO** (Recovery Point Objective) | 5 minutes                             |
| **RTO** (Recovery Time Objective)  | 1 hour                                |
| **Backup Frequency**               | Continuous (Aurora) + Daily snapshots |
| **Backup Retention**               | 35 days                               |
| **Cross-Region Replication**       | Asynchronous, < 1 minute lag          |

### Scheduled Maintenance

- **Window**: Sundays 2:00-6:00 AM CT
- **Notification**: 72 hours advance notice
- **Duration**: Maximum 2 hours
- **Frequency**: Monthly or as needed

---

## Disaster Recovery

### DR Strategy

**Warm Standby** architecture with:

- Primary region: us-east-1 (N. Virginia)
- DR region: us-west-2 (Oregon)
- Continuous database replication
- Pre-provisioned (scaled down) infrastructure
- DNS failover via Route 53

### DR Architecture

```
        us-east-1 (Primary)                 us-west-2 (DR)
    ┌─────────────────────┐           ┌─────────────────────┐
    │                     │           │                     │
    │  ┌───────────────┐  │           │  ┌───────────────┐  │
    │  │   ECS Tasks   │  │           │  │   ECS Tasks   │  │
    │  │   (Active)    │  │           │  │   (Standby)   │  │
    │  └───────────────┘  │           │  └───────────────┘  │
    │                     │           │                     │
    │  ┌───────────────┐  │  Async    │  ┌───────────────┐  │
    │  │ Aurora Primary│──┼──Repl.───►│  │ Aurora Replica│  │
    │  └───────────────┘  │           │  └───────────────┘  │
    │                     │           │                     │
    │  ┌───────────────┐  │  Sync     │  ┌───────────────┐  │
    │  │   S3 Bucket   │──┼──Copy────►│  │   S3 Bucket   │  │
    │  └───────────────┘  │           │  └───────────────┘  │
    │                     │           │                     │
    └─────────────────────┘           └─────────────────────┘
              │                                 │
              └────────────┬────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Route 53   │
                    │  (Failover) │
                    └─────────────┘
```

### Failover Procedure

#### Automatic Failover (Database)

- Aurora automatically promotes read replica
- Connection strings via RDS Proxy remain valid
- Typical failover: 30-60 seconds

#### Manual Failover (Full DR)

1. **Detection** (0-5 min)
   - Automated health checks fail
   - On-call engineer paged

2. **Assessment** (5-15 min)
   - Confirm primary region unavailable
   - Decision to failover

3. **Execution** (15-45 min)
   - Scale up DR ECS tasks
   - Promote Aurora replica to primary
   - Update Route 53 DNS
   - Verify DR services healthy

4. **Validation** (45-60 min)
   - Run health checks
   - Test critical workflows
   - Notify stakeholders

### DR Testing

| Test Type         | Frequency | Duration |
| ----------------- | --------- | -------- |
| Backup Restore    | Monthly   | 2 hours  |
| Database Failover | Quarterly | 30 min   |
| Full DR Drill     | Annually  | 4 hours  |

---

## Security Operations

### Access Control

#### Administrative Access

| Role      | Access Level        | Approval  |
| --------- | ------------------- | --------- |
| Developer | Read logs, metrics  | Team lead |
| SRE       | Full infrastructure | Manager   |
| DBA       | Database admin      | Director  |
| Security  | All systems         | CISO      |

#### Production Access

- No direct SSH access
- All changes via CI/CD
- Break-glass procedure for emergencies
- All access logged and audited

### Secret Management

```yaml
# Secrets stored in AWS Secrets Manager
secrets:
  database:
    rotation: 30 days
    type: RDS credentials

  api_keys:
    rotation: 90 days
    type: Third-party API keys

  jwt_secret:
    rotation: 180 days
    type: Application secret

  encryption_key:
    rotation: 365 days
    type: KMS key
```

### Security Monitoring

#### Detection Rules

- Failed login attempts (> 5 in 10 min)
- Unusual API access patterns
- Data export anomalies
- Privilege escalation
- Geographic access anomalies

#### Response Playbooks

1. **Suspected Breach**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team
   - Begin forensic analysis

2. **DDoS Attack**
   - Enable CloudFlare Under Attack mode
   - Scale infrastructure
   - Block malicious IPs
   - Monitor traffic patterns

---

## Incident Management

### Severity Levels

| Level    | Definition                        | Examples                   |
| -------- | --------------------------------- | -------------------------- |
| **SEV1** | Platform down, all users affected | Complete outage, data loss |
| **SEV2** | Major feature unavailable         | Payment processing down    |
| **SEV3** | Degraded performance              | Slow response times        |
| **SEV4** | Minor issue, workaround exists    | UI bug, non-critical       |

### Incident Response Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Detect    │────►│   Triage    │────►│  Respond    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
┌─────────────┐     ┌─────────────┐            │
│   Review    │◄────│   Resolve   │◄───────────┘
└─────────────┘     └─────────────┘
```

### On-Call Rotation

- Primary and secondary on-call
- Weekly rotation
- Handoff at Monday 9 AM CT
- Escalation after 15 min no response

### Post-Incident Review

Template:

1. Incident summary
2. Timeline of events
3. Root cause analysis
4. Impact assessment
5. What went well
6. What could be improved
7. Action items with owners

---

## Capacity Planning

### Current Capacity

| Resource       | Current | Peak   | Headroom |
| -------------- | ------- | ------ | -------- |
| ECS Tasks      | 4       | 8      | 100%     |
| DB Connections | 200     | 400    | 100%     |
| Cache Memory   | 2 GB    | 6 GB   | 200%     |
| Storage        | 100 GB  | 500 GB | 400%     |

### Scaling Triggers

| Metric       | Scale Up      | Scale Down    |
| ------------ | ------------- | ------------- |
| CPU          | > 70% for 5m  | < 30% for 15m |
| Memory       | > 75% for 5m  | < 40% for 15m |
| Queue Depth  | > 1000 for 2m | < 100 for 10m |
| Request Rate | > 1000 rps    | < 200 rps     |

### Growth Projections

| Phase      | Users | Loads/Day | Storage | Cost/Month |
| ---------- | ----- | --------- | ------- | ---------- |
| MVP (A)    | 50    | 100       | 50 GB   | $500       |
| Growth (B) | 200   | 500       | 200 GB  | $2,000     |
| Scale (C)  | 1,000 | 2,000     | 1 TB    | $6,750     |
| Enterprise | 5,000 | 10,000    | 5 TB    | $25,000    |

---

## Cost Management

### Current Monthly Costs (Phase A)

| Service     | Cost      | Notes                  |
| ----------- | --------- | ---------------------- |
| ECS Fargate | $150      | 2 tasks, 0.5 vCPU each |
| RDS Aurora  | $100      | db.t3.medium           |
| ElastiCache | $50       | cache.t3.micro         |
| S3          | $20       | 100 GB                 |
| CloudFront  | $30       | CDN                    |
| Other       | $150      | Logs, secrets, etc.    |
| **Total**   | **~$500** |                        |

### Cost Optimization Strategies

1. **Reserved Instances**
   - 1-year commitment: 30% savings
   - 3-year commitment: 50% savings

2. **Spot Instances**
   - Use for worker tasks
   - Up to 70% savings

3. **Right-Sizing**
   - Monthly review of utilization
   - Downsize underutilized resources

4. **S3 Lifecycle Policies**
   - Transition to IA after 30 days
   - Glacier after 90 days

### Budget Alerts

| Threshold | Action                 |
| --------- | ---------------------- |
| 50%       | Email notification     |
| 75%       | Slack alert            |
| 90%       | Review and approve     |
| 100%      | Escalate to management |

---

## Navigation

- **Previous:** [Development](../04-development/README.md)
- **Next:** [Roadmap](../06-roadmap/README.md)
- **Index:** [Home](../README.md)
