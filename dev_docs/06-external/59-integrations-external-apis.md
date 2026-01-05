# External Integrations

Comprehensive documentation for all third-party integrations in the 3PL Platform, including load boards, accounting systems, ELD providers, and compliance services.

---

## Integration Categories

| Category           | Integrations                    | Priority |
| ------------------ | ------------------------------- | -------- |
| **Load Boards**    | DAT, Truckstop, 123Loadboard    | P1       |
| **Accounting**     | QuickBooks, Xero, Sage          | P1       |
| **Compliance**     | FMCSA SAFER, FMCSA SMS          | P1       |
| **ELD/Telematics** | KeepTruckin, Samsara, Omnitracs | P2       |
| **Fuel Cards**     | Comdata, EFS, WEX               | P2       |
| **Mapping**        | Google Maps, HERE, PC Miler     | P1       |
| **Communication**  | Twilio, SendGrid, Vonage        | P1       |
| **Payment**        | Stripe, Plaid                   | P2       |
| **CRM**            | HubSpot, Salesforce             | P1       |
| **Document**       | AWS Textract, DocuSign          | P2       |

---

## Load Board Integrations

### DAT Solutions

**Purpose**: Load posting, capacity search, rate data

**API Version**: DAT API v3

**Authentication**: OAuth 2.0

```typescript
// DAT API Configuration
const datConfig = {
  baseUrl: 'https://api.dat.com/v3',
  auth: {
    tokenUrl: 'https://auth.dat.com/oauth/token',
    clientId: process.env.DAT_CLIENT_ID,
    clientSecret: process.env.DAT_CLIENT_SECRET,
    scope: 'loadboard rateview',
  },
};
```

**Available Endpoints**:

| Endpoint          | Method | Description             |
| ----------------- | ------ | ----------------------- |
| `/loads`          | POST   | Post load to DAT        |
| `/loads/{id}`     | PUT    | Update posted load      |
| `/loads/{id}`     | DELETE | Remove load posting     |
| `/trucks/search`  | GET    | Search available trucks |
| `/rates/spot`     | GET    | Get spot market rates   |
| `/rates/contract` | GET    | Get contract rates      |

**Load Posting Example**:

```typescript
async function postLoadToDAT(load: Load) {
  const datLoad = {
    origin: {
      city: load.originCity,
      state: load.originState,
      postalCode: load.originZip,
      latitude: load.originLat,
      longitude: load.originLng,
    },
    destination: {
      city: load.destinationCity,
      state: load.destinationState,
      postalCode: load.destinationZip,
    },
    pickupDate: load.pickupDate,
    deliveryDate: load.deliveryDate,
    equipmentType: mapEquipmentType(load.equipmentType),
    weight: load.weight,
    length: load.length,
    rate: load.rate,
    rateType: 'FLAT',
    commodity: load.commodity,
    comments: load.notes,
    contact: {
      name: load.contactName,
      phone: load.contactPhone,
      email: load.contactEmail,
    },
  };

  return await datClient.post('/loads', datLoad);
}
```

**Rate View Integration**:

```typescript
async function getDATRates(params: RateQuery) {
  const response = await datClient.get('/rates/spot', {
    originCity: params.originCity,
    originState: params.originState,
    destCity: params.destCity,
    destState: params.destState,
    equipmentType: params.equipmentType,
    dateRange: '30d',
  });

  return {
    lowRate: response.rates.low,
    highRate: response.rates.high,
    avgRate: response.rates.average,
    ratePerMile: response.rates.perMile,
    sampleSize: response.rates.reportCount,
  };
}
```

### Truckstop.com

**Purpose**: Load posting, carrier search, rate data

**API Version**: Truckstop API v2

```typescript
const truckstopConfig = {
  baseUrl: 'https://api.truckstop.com/v2',
  apiKey: process.env.TRUCKSTOP_API_KEY,
};
```

**Key Endpoints**:

| Endpoint         | Description           |
| ---------------- | --------------------- |
| `/posts/loads`   | Post/manage loads     |
| `/search/trucks` | Find available trucks |
| `/rates`         | Market rate data      |
| `/carriers`      | Carrier information   |

---

## Accounting Integrations

### QuickBooks Online

**Purpose**: Invoice sync, payment tracking, financial reporting

**API Version**: QuickBooks API v3

**Authentication**: OAuth 2.0 with refresh tokens

```typescript
const qboConfig = {
  baseUrl: 'https://quickbooks.api.intuit.com/v3',
  auth: {
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    clientId: process.env.QBO_CLIENT_ID,
    clientSecret: process.env.QBO_CLIENT_SECRET,
    redirectUri: process.env.QBO_REDIRECT_URI,
    scope: 'com.intuit.quickbooks.accounting',
  },
};
```

**Entity Mapping**:

| 3PL Entity         | QuickBooks Entity |
| ------------------ | ----------------- |
| Company (Customer) | Customer          |
| Company (Carrier)  | Vendor            |
| Invoice            | Invoice           |
| Carrier Payable    | Bill              |
| Payment Received   | Payment           |
| Payment Sent       | BillPayment       |

**Invoice Sync Example**:

```typescript
async function syncInvoiceToQBO(invoice: Invoice) {
  // Find or create customer
  const customer = await findOrCreateQBOCustomer(invoice.customerId);

  const qboInvoice = {
    CustomerRef: { value: customer.Id },
    TxnDate: invoice.invoiceDate,
    DueDate: invoice.dueDate,
    DocNumber: invoice.invoiceNumber,
    Line: invoice.lineItems.map((item) => ({
      Amount: item.amount,
      Description: item.description,
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: { value: item.qboItemId },
        Qty: item.quantity,
        UnitPrice: item.unitPrice,
      },
    })),
    CustomField: [
      {
        DefinitionId: '1',
        Name: 'Load Number',
        Type: 'StringType',
        StringValue: invoice.loadNumber,
      },
    ],
  };

  const result = await qboClient.createInvoice(qboInvoice);

  // Store QBO reference
  await updateInvoice(invoice.id, {
    qboInvoiceId: result.Invoice.Id,
    qboSyncedAt: new Date(),
  });

  return result;
}
```

**Webhook Handling**:

```typescript
// Handle QBO webhook events
app.post('/webhooks/quickbooks', async (req, res) => {
  const event = req.body;

  switch (event.eventNotifications[0].dataChangeEvent.entities[0].name) {
    case 'Payment':
      await handleQBOPayment(event);
      break;
    case 'Invoice':
      await handleQBOInvoiceUpdate(event);
      break;
  }

  res.status(200).send('OK');
});
```

### Xero

**Purpose**: Alternative accounting integration

**API Version**: Xero API v2

```typescript
const xeroConfig = {
  baseUrl: 'https://api.xero.com/api.xro/2.0',
  auth: {
    tokenUrl: 'https://identity.xero.com/connect/token',
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_CLIENT_SECRET,
  },
};
```

---

## Compliance Integrations

### FMCSA SAFER

**Purpose**: Carrier authority verification, safety data

**API**: FMCSA Web Services

```typescript
const fmcsaConfig = {
  saferUrl: 'https://mobile.fmcsa.dot.gov/qc/services',
  webKey: process.env.FMCSA_WEBKEY,
};
```

**Carrier Lookup**:

```typescript
async function lookupCarrierByDOT(dotNumber: string) {
  const response = await fmcsaClient.get('/carriers', {
    webKey: fmcsaConfig.webKey,
    dotNumber: dotNumber,
  });

  return {
    legalName: response.carrier.legalName,
    dbaName: response.carrier.dbaName,
    dotNumber: response.carrier.dotNumber,
    mcNumber: response.carrier.mcNumber,

    // Authority status
    commonAuthorityStatus: response.carrier.commonAuthorityStatus,
    contractAuthorityStatus: response.carrier.contractAuthorityStatus,
    brokerAuthorityStatus: response.carrier.brokerAuthorityStatus,

    // Safety rating
    safetyRating: response.carrier.safetyRating,
    safetyRatingDate: response.carrier.safetyRatingDate,

    // Fleet info
    totalPowerUnits: response.carrier.totalPowerUnits,
    totalDrivers: response.carrier.totalDrivers,

    // Insurance
    bipdInsuranceRequired: response.carrier.bipdInsuranceRequired,
    cargoInsuranceRequired: response.carrier.cargoInsuranceRequired,
    bondInsuranceRequired: response.carrier.bondInsuranceRequired,
  };
}
```

### FMCSA SMS (Safety Measurement System)

**Purpose**: CSA scores, BASIC data

```typescript
async function getCarrierCSAScores(dotNumber: string) {
  const response = await fmcsaClient.get('/sms/carrier', {
    dotNumber: dotNumber,
  });

  return {
    basics: {
      unsafeDriving: {
        score: response.unsafeDrivingScore,
        percentile: response.unsafeDrivingPercentile,
        alert: response.unsafeDrivingAlert,
      },
      hoursOfService: {
        score: response.hosScore,
        percentile: response.hosPercentile,
        alert: response.hosAlert,
      },
      driverFitness: {
        score: response.driverFitnessScore,
        percentile: response.driverFitnessPercentile,
        alert: response.driverFitnessAlert,
      },
      controlledSubstances: {
        score: response.controlledSubstancesScore,
        percentile: response.controlledSubstancesPercentile,
        alert: response.controlledSubstancesAlert,
      },
      vehicleMaintenance: {
        score: response.vehicleMaintenanceScore,
        percentile: response.vehicleMaintenancePercentile,
        alert: response.vehicleMaintenanceAlert,
      },
      hazmatCompliance: {
        score: response.hazmatScore,
        percentile: response.hazmatPercentile,
        alert: response.hazmatAlert,
      },
      crashIndicator: {
        score: response.crashIndicatorScore,
        percentile: response.crashIndicatorPercentile,
      },
    },
    inspections: response.totalInspections,
    outOfServiceRate: response.oosRate,
  };
}
```

---

## ELD/Telematics Integrations

### Samsara

**Purpose**: Real-time GPS, ELD data, vehicle diagnostics

**API Version**: Samsara API v1

```typescript
const samsaraConfig = {
  baseUrl: 'https://api.samsara.com/v1',
  apiToken: process.env.SAMSARA_API_TOKEN,
};
```

**Vehicle Location**:

```typescript
async function getVehicleLocation(vehicleId: string) {
  const response = await samsaraClient.get('/fleet/vehicles/locations', {
    vehicleIds: vehicleId,
  });

  return {
    vehicleId: response.vehicles[0].id,
    location: {
      latitude: response.vehicles[0].location.latitude,
      longitude: response.vehicles[0].location.longitude,
      heading: response.vehicles[0].location.heading,
      speed: response.vehicles[0].location.speed,
      time: response.vehicles[0].location.time,
    },
    odometer: response.vehicles[0].odometerMeters,
    engineHours: response.vehicles[0].engineHours,
  };
}
```

**HOS (Hours of Service)**:

```typescript
async function getDriverHOS(driverId: string) {
  const response = await samsaraClient.get('/fleet/drivers/hos_daily_logs', {
    driverId: driverId,
    startMs: Date.now() - 24 * 60 * 60 * 1000,
    endMs: Date.now(),
  });

  return {
    drivingTime: response.days[0].drivingMs,
    onDutyTime: response.days[0].onDutyMs,
    sleeperTime: response.days[0].sleeperMs,
    offDutyTime: response.days[0].offDutyMs,
    cycleRemaining: response.days[0].cycleTomorrowMs,
    violations: response.days[0].violations,
  };
}
```

### KeepTruckin (Motive)

**Purpose**: ELD compliance, fleet tracking

```typescript
const keepTruckinConfig = {
  baseUrl: 'https://api.keeptruckin.com/v1',
  apiKey: process.env.KEEPTRUCKIN_API_KEY,
};
```

---

## Communication Integrations

### Twilio

**Purpose**: SMS messaging, voice calls

```typescript
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
};
```

**Send SMS**:

```typescript
async function sendSMS(to: string, message: string) {
  const client = require('twilio')(
    twilioConfig.accountSid,
    twilioConfig.authToken
  );

  return await client.messages.create({
    body: message,
    from: twilioConfig.fromNumber,
    to: to,
  });
}
```

**Check Call Status Update**:

```typescript
async function sendCheckCallSMS(driver: Driver, load: Load) {
  const message = `
    Check-in request for Load ${load.loadNumber}
    Reply with your current status:
    1 - On schedule
    2 - Running late
    3 - Need assistance
    Or reply with your location
  `.trim();

  await sendSMS(driver.phone, message);
}
```

### SendGrid

**Purpose**: Transactional email

```typescript
const sendgridConfig = {
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: 'noreply@yourcompany.com',
  fromName: 'Your 3PL Platform',
};
```

**Send Email**:

```typescript
async function sendEmail(params: EmailParams) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendgridConfig.apiKey);

  return await sgMail.send({
    to: params.to,
    from: {
      email: sendgridConfig.fromEmail,
      name: sendgridConfig.fromName,
    },
    templateId: params.templateId,
    dynamicTemplateData: params.data,
  });
}
```

---

## Mapping Integrations

### Google Maps Platform

**Purpose**: Geocoding, directions, distance calculation

```typescript
const googleMapsConfig = {
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
};
```

**Geocoding**:

```typescript
async function geocodeAddress(address: string) {
  const response = await googleMapsClient.geocode({
    params: {
      address: address,
      key: googleMapsConfig.apiKey,
    },
  });

  const result = response.data.results[0];
  return {
    formattedAddress: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    placeId: result.place_id,
    components: {
      city: findComponent(result, 'locality'),
      state: findComponent(result, 'administrative_area_level_1'),
      zip: findComponent(result, 'postal_code'),
      country: findComponent(result, 'country'),
    },
  };
}
```

**Distance Matrix**:

```typescript
async function calculateDistance(origin: Location, destination: Location) {
  const response = await googleMapsClient.distancematrix({
    params: {
      origins: [`${origin.lat},${origin.lng}`],
      destinations: [`${destination.lat},${destination.lng}`],
      mode: 'driving',
      units: 'imperial',
      key: googleMapsConfig.apiKey,
    },
  });

  const element = response.data.rows[0].elements[0];
  return {
    distanceMiles: element.distance.value / 1609.34,
    durationMinutes: element.duration.value / 60,
    durationInTraffic: element.duration_in_traffic?.value / 60,
  };
}
```

### PC Miler

**Purpose**: Truck-specific routing, mileage

```typescript
const pcMilerConfig = {
  baseUrl: 'https://pcmiler.alk.com/apis/rest/v1.0',
  apiKey: process.env.PCMILER_API_KEY,
};
```

**Truck Route**:

```typescript
async function getTruckRoute(stops: Stop[]) {
  const response = await pcMilerClient.post('/Service.svc/route', {
    stops: stops.map((s) => ({
      Address: {
        City: s.city,
        State: s.state,
        Zip: s.zip,
      },
    })),
    options: {
      vehicleType: 'Truck',
      routeType: 'Practical',
      highwayOnly: false,
      hazMatType: 'None',
    },
  });

  return {
    totalMiles: response.TMiles,
    totalHours: response.THours,
    tollCost: response.TollCost,
    legs: response.Legs.map((leg) => ({
      miles: leg.LMiles,
      hours: leg.LHours,
    })),
  };
}
```

---

## CRM Integrations

### HubSpot

**Purpose**: Initial CRM integration (Phase A)

**API Version**: HubSpot API v3

```typescript
const hubspotConfig = {
  baseUrl: 'https://api.hubapi.com',
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
};
```

**Contact Sync**:

```typescript
async function syncContactToHubSpot(contact: Contact) {
  const hubspotContact = {
    properties: {
      email: contact.email,
      firstname: contact.firstName,
      lastname: contact.lastName,
      phone: contact.phone,
      company: contact.companyName,
      jobtitle: contact.title,
      // Custom properties
      contact_type: contact.type,
      external_id: contact.id,
    },
  };

  if (contact.hubspotId) {
    return await hubspotClient.patch(
      `/crm/v3/objects/contacts/${contact.hubspotId}`,
      hubspotContact
    );
  } else {
    return await hubspotClient.post('/crm/v3/objects/contacts', hubspotContact);
  }
}
```

**Deal (Opportunity) Sync**:

```typescript
async function syncOpportunityToHubSpot(opportunity: Opportunity) {
  const hubspotDeal = {
    properties: {
      dealname: opportunity.name,
      amount: opportunity.value,
      dealstage: mapStageToHubSpot(opportunity.stage),
      closedate: opportunity.expectedCloseDate,
      pipeline: 'default',
      // Custom properties
      lane: `${opportunity.originCity} to ${opportunity.destCity}`,
      equipment_type: opportunity.equipmentType,
      external_id: opportunity.id,
    },
  };

  return await hubspotClient.post('/crm/v3/objects/deals', hubspotDeal);
}
```

---

## Payment Integrations

### Stripe

**Purpose**: SaaS billing, payment processing

```typescript
const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};
```

**Subscription Management**:

```typescript
async function createSubscription(tenant: Tenant, planId: string) {
  const stripe = require('stripe')(stripeConfig.secretKey);

  // Create or get customer
  let customer = await stripe.customers.retrieve(tenant.stripeCustomerId);
  if (!customer) {
    customer = await stripe.customers.create({
      email: tenant.billingEmail,
      name: tenant.companyName,
      metadata: { tenantId: tenant.id },
    });
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: planId }],
    trial_period_days: 14,
    metadata: { tenantId: tenant.id },
  });

  return subscription;
}
```

---

## Integration Patterns

### Webhook Handler Pattern

```typescript
// Generic webhook handler
@Controller('webhooks')
export class WebhookController {
  @Post(':provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>
  ) {
    // Verify signature
    const isValid = await this.verifyWebhookSignature(
      provider,
      payload,
      headers
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Process asynchronously
    await this.webhookQueue.add({
      provider,
      payload,
      receivedAt: new Date(),
    });

    return { received: true };
  }
}
```

### Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      await sleep(delay);
    }
  }
}
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure!.getTime() > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = new Date();
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

---

## Navigation

- **Previous:** [Migrations](../07-migrations/README.md)
- **Next:** [Verticals](../09-verticals/README.md)
- **Index:** [Home](../README.md)
