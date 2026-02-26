import { PrismaClient } from '@prisma/client';

// Realistic flatbed/heavy-haul lane pairs
const LANES = [
  { originCity: 'Houston', originState: 'TX', destCity: 'Dallas', destState: 'TX', miles: 239 },
  { originCity: 'Chicago', originState: 'IL', destCity: 'Detroit', destState: 'MI', miles: 281 },
  { originCity: 'Los Angeles', originState: 'CA', destCity: 'Phoenix', destState: 'AZ', miles: 372 },
  { originCity: 'Atlanta', originState: 'GA', destCity: 'Charlotte', destState: 'NC', miles: 245 },
  { originCity: 'Dallas', originState: 'TX', destCity: 'Oklahoma City', destState: 'OK', miles: 208 },
  { originCity: 'Denver', originState: 'CO', destCity: 'Kansas City', destState: 'MO', miles: 601 },
  { originCity: 'Memphis', originState: 'TN', destCity: 'Nashville', destState: 'TN', miles: 210 },
  { originCity: 'Seattle', originState: 'WA', destCity: 'Portland', destState: 'OR', miles: 174 },
  { originCity: 'Miami', originState: 'FL', destCity: 'Orlando', destState: 'FL', miles: 228 },
  { originCity: 'Columbus', originState: 'OH', destCity: 'Pittsburgh', destState: 'PA', miles: 185 },
  { originCity: 'San Antonio', originState: 'TX', destCity: 'El Paso', destState: 'TX', miles: 552 },
  { originCity: 'Minneapolis', originState: 'MN', destCity: 'Milwaukee', destState: 'WI', miles: 337 },
];

const EQUIPMENT_TYPES = ['flatbed', 'step_deck', 'rgn', 'lowboy', 'dry_van', 'reefer', 'hotshot'];

const CARGO_DESCRIPTIONS = [
  'Steel coils',
  'Construction equipment',
  'Lumber',
  'Agricultural machinery',
  'HVAC units',
  'Generator sets',
  'Modular building sections',
  'Crane components',
  'Excavator buckets',
  'Structural steel beams',
  'Precast concrete panels',
  'Industrial boilers',
  'Wind turbine blades',
  'Oversized transformers',
  'Palletized auto parts',
];

const CUSTOMER_NAMES = [
  { name: 'James Harrington', company: 'Atlas Steel Corp' },
  { name: 'Maria Gonzalez', company: 'SunCoast Builders' },
  { name: 'Robert Kim', company: 'Midwest Ag Solutions' },
  { name: 'Sarah Thompson', company: 'Pacific HVAC Distributors' },
  { name: 'David Chen', company: 'Great Lakes Manufacturing' },
  { name: 'Lisa Patel', company: 'Southern Precast Inc' },
  { name: 'Michael Torres', company: 'Rocky Mountain Energy' },
  { name: 'Amanda White', company: 'Southeast Crane & Rigging' },
];

const STATUSES = [
  { status: 'COMPLETED', weight: 0.50 },
  { status: 'DELIVERED', weight: 0.20 },
  { status: 'IN_TRANSIT', weight: 0.15 },
  { status: 'BOOKED', weight: 0.10 },
  { status: 'CANCELLED', weight: 0.05 },
];

function weightedStatus(): string {
  const total = STATUSES.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const { status, weight } of STATUSES) {
    if (r < weight) return status;
    r -= weight;
  }
  return 'COMPLETED';
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function seedLoadHistory(prisma: PrismaClient, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const records = [];

    for (let i = 0; i < 40; i++) {
      const lane = rand(LANES);
      const customer = rand(CUSTOMER_NAMES);
      const equipment = rand(EQUIPMENT_TYPES);
      const cargo = rand(CARGO_DESCRIPTIONS);
      const status = weightedStatus();

      // Financials — customer rate $2.50–$5.50/mile; carrier 65–82% of customer
      const customerRateCents = Math.round(lane.miles * randInt(250, 550));
      const carrierRateCents = Math.round(customerRateCents * (randInt(65, 82) / 100));
      const marginCents = customerRateCents - carrierRateCents;
      const marginPercentage = parseFloat(((marginCents / customerRateCents) * 100).toFixed(2));
      const ratePerMileCustomerCents = Math.round(customerRateCents / lane.miles);
      const ratePerMileCarrierCents = Math.round(carrierRateCents / lane.miles);

      // Dates spread over last 180 days
      const pickupDaysAgo = randInt(1, 180);
      const pickupDate = daysAgo(pickupDaysAgo);
      const deliveryDate = daysAgo(pickupDaysAgo - randInt(1, 5));

      records.push({
        tenantId,
        quoteNumber: `QH-${String(2025000 + i + total).padStart(7, '0')}`,
        customerName: customer.name,
        customerCompany: customer.company,
        originCity: lane.originCity,
        originState: lane.originState,
        destinationCity: lane.destCity,
        destinationState: lane.destState,
        totalMiles: lane.miles,
        cargoDescription: cargo,
        equipmentTypeUsed: equipment,
        customerRateCents,
        carrierRateCents,
        marginCents,
        marginPercentage,
        ratePerMileCustomerCents,
        ratePerMileCarrierCents,
        pickupDate,
        deliveryDate,
        bookedDate: daysAgo(pickupDaysAgo + randInt(1, 7)),
        status,
        isActive: true,
        isOversize: equipment === 'rgn' || equipment === 'lowboy',
        isOverweight: equipment === 'lowboy',
        customFields: {},
      });
    }

    await prisma.loadHistory.createMany({ data: records, skipDuplicates: true });
    total += records.length;
  }

  console.log(`   → ${total} load history records created`);
}
