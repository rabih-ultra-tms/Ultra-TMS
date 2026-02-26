import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const EQUIPMENT_TYPES = [
  'VAN', 'REEFER', 'FLATBED', 'STEP_DECK', 'POWER_ONLY',
  'BOX_TRUCK', 'SPRINTER', 'INTERMODAL', 'CONESTOGA',
] as const;

const TIERS = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', null, null] as const; // null = unrated (weighted)

const STATUSES = [
  'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', // 5x weight
  'PENDING', 'APPROVED',
  'INACTIVE', 'SUSPENDED', 'BLACKLISTED',
] as const;

const TRUCK_MAKES = ['Kenworth', 'Peterbilt', 'Freightliner', 'Volvo', 'Mack', 'International'];
const TRUCK_MODELS = ['T680', '579', 'Cascadia', 'VNL 860', 'Anthem', 'LT'];
const TRUCK_CATEGORIES = ['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK', 'POWER_ONLY'];

const CDL_STATES = ['TX', 'CA', 'FL', 'IL', 'OH', 'PA', 'NY', 'GA', 'NC', 'TN'];
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'SC', 'SD', 'TN',
  'TX', 'UT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

// Dates relative to today for insurance compliance testing
function insuranceDateForStatus(status: 'expired' | 'warning' | 'compliant' | 'none'): Date | null {
  const now = new Date();
  switch (status) {
    case 'expired':
      return new Date(now.getTime() - faker.number.int({ min: 1, max: 90 }) * 86400000);
    case 'warning':
      return new Date(now.getTime() + faker.number.int({ min: 1, max: 30 }) * 86400000);
    case 'compliant':
      return new Date(now.getTime() + faker.number.int({ min: 31, max: 365 }) * 86400000);
    case 'none':
      return null;
  }
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  return faker.helpers.arrayElements([...arr], n);
}

export async function seedOperationsCarriers(
  prisma: PrismaClient,
  tenantIds: string[],
): Promise<void> {
  let carrierCount = 0;
  let driverCount = 0;
  let truckCount = 0;
  let documentCount = 0;

  // 25 carriers per tenant for a realistic demo dataset
  const CARRIERS_PER_TENANT = 25;

  for (const tenantId of tenantIds) {
    for (let i = 0; i < CARRIERS_PER_TENANT; i++) {
      const status = pick(STATUSES);
      const tier = pick(TIERS);
      const carrierType = faker.helpers.arrayElement(['COMPANY', 'OWNER_OPERATOR']);

      // Performance metrics — PLATINUM carriers get better numbers
      const tierBoost = tier === 'PLATINUM' ? 10 : tier === 'GOLD' ? 5 : tier === 'SILVER' ? 0 : -5;
      const onTimeDelivery = Math.min(100, Math.max(60, faker.number.float({ min: 72, max: 99 }) + tierBoost));
      const onTimePickup = Math.min(100, Math.max(60, faker.number.float({ min: 70, max: 98 }) + tierBoost));
      const avgRating = Math.min(5, Math.max(1, faker.number.float({ min: 3.0, max: 5.0 }) + tierBoost * 0.05));
      const acceptanceRate = Math.min(100, Math.max(50, faker.number.float({ min: 60, max: 99 }) + tierBoost));
      const totalLoads = faker.number.int({ min: 0, max: 500 }) + (tier === 'PLATINUM' ? 200 : 0);
      const claimsRate = Math.max(0, faker.number.float({ min: 0, max: 5 }) - tierBoost * 0.1);
      const performanceScore = Math.min(100, Math.max(0,
        (onTimeDelivery * 0.4 + acceptanceRate * 0.3 + (avgRating / 5) * 100 * 0.3)
      ));

      // Insurance compliance distribution: ~20% expired, ~15% warning, ~50% compliant, ~15% none
      const insuranceScenario = faker.helpers.weightedArrayElement([
        { weight: 20, value: 'expired' as const },
        { weight: 15, value: 'warning' as const },
        { weight: 50, value: 'compliant' as const },
        { weight: 15, value: 'none' as const },
      ]);
      const insuranceExpiryDate = insuranceDateForStatus(insuranceScenario);

      // Equipment types: 1-3 per carrier
      const numEquipmentTypes = faker.number.int({ min: 1, max: 3 });
      const equipmentTypes = pickN(EQUIPMENT_TYPES, numEquipmentTypes);

      const carrier = await (prisma as any).operationsCarrier.create({
        data: {
          tenantId,
          carrierType,
          companyName: (carrierType === 'OWNER_OPERATOR'
            ? `${faker.person.lastName()} Transport`
            : `${faker.company.name()} Freight`).slice(0, 250),
          mcNumber: faker.helpers.maybe(() => `MC${faker.string.numeric(6)}`, { probability: 0.85 }),
          dotNumber: faker.helpers.maybe(() => faker.string.numeric(7), { probability: 0.85 }),
          einTaxId: faker.helpers.maybe(() => `${faker.string.numeric(2)}-${faker.string.numeric(7)}`, { probability: 0.7 }),
          address: faker.location.streetAddress().slice(0, 490),
          city: faker.location.city().slice(0, 95),
          state: pick(US_STATES),
          zip: faker.location.zipCode('#####'),
          phone: faker.string.numeric(3) + '-' + faker.string.numeric(3) + '-' + faker.string.numeric(4),
          phoneSecondary: faker.helpers.maybe(() => faker.string.numeric(3) + '-' + faker.string.numeric(3) + '-' + faker.string.numeric(4), { probability: 0.3 }),
          email: faker.internet.email().toLowerCase().slice(0, 250),
          website: faker.helpers.maybe(() => `https://www.${faker.internet.domainName()}`.slice(0, 250), { probability: 0.5 }),
          billingEmail: faker.internet.email().toLowerCase().slice(0, 250),
          paymentTermsDays: faker.helpers.arrayElement([15, 30, 45, 60]),
          preferredPaymentMethod: faker.helpers.arrayElement(['CHECK', 'ACH', 'WIRE', 'QUICK_PAY']),
          factoringCompanyName: faker.helpers.maybe(() => `${faker.company.name()} Factoring`.slice(0, 250), { probability: 0.25 }),
          insuranceCompany: faker.helpers.maybe(() => `${faker.company.name()} Insurance`.slice(0, 250), { probability: 0.8 }),
          insurancePolicyNumber: faker.helpers.maybe(() => `POL-${faker.string.alphanumeric(10).toUpperCase()}`, { probability: 0.8 }),
          insuranceExpiryDate,
          cargoInsuranceLimitCents: faker.helpers.maybe(
            () => faker.helpers.arrayElement([100000_00, 250000_00, 500000_00, 1000000_00]),
            { probability: 0.75 }
          ),
          status,
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
          equipmentTypes,
          truckCount: faker.number.int({ min: 1, max: 20 }),
          trailerCount: faker.number.int({ min: 0, max: 15 }),
          tier,
          onTimePickupRate: onTimePickup,
          onTimeDeliveryRate: onTimeDelivery,
          claimsRate,
          avgRating,
          acceptanceRate,
          totalLoadsCompleted: totalLoads,
          performanceScore,
          isActive: true,
          externalId: `SEED-OPS-CARRIER-${tenantId.slice(0, 8)}-${i}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      carrierCount++;

      // Drivers: 1-3 per carrier (owner-operators get exactly 1 who isOwner)
      const numDrivers = carrierType === 'OWNER_OPERATOR'
        ? 1
        : faker.number.int({ min: 1, max: 3 });

      const createdDrivers: string[] = [];

      for (let d = 0; d < numDrivers; d++) {
        const isOwner = carrierType === 'OWNER_OPERATOR' && d === 0;
        const cdlExpiry = new Date();
        cdlExpiry.setFullYear(cdlExpiry.getFullYear() + faker.number.int({ min: 1, max: 4 }));
        const medExpiry = new Date();
        medExpiry.setMonth(medExpiry.getMonth() + faker.number.int({ min: 3, max: 24 }));

        const driver = await (prisma as any).operationsCarrierDriver.create({
          data: {
            carrierId: carrier.id,
            firstName: faker.person.firstName().slice(0, 100),
            lastName: faker.person.lastName().slice(0, 100),
            nickname: faker.helpers.maybe(() => faker.word.noun().slice(0, 20), { probability: 0.2 }),
            isOwner,
            phone: faker.string.numeric(3) + '-' + faker.string.numeric(3) + '-' + faker.string.numeric(4),
            phoneSecondary: faker.helpers.maybe(() => faker.string.numeric(3) + '-' + faker.string.numeric(3) + '-' + faker.string.numeric(4), { probability: 0.2 }),
            email: faker.helpers.maybe(() => faker.internet.email().toLowerCase().slice(0, 255), { probability: 0.7 }),
            address: faker.location.streetAddress().slice(0, 255),
            city: faker.location.city().slice(0, 100),
            state: pick(US_STATES),
            zip: faker.location.zipCode('#####'),
            cdlNumber: `${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.string.numeric(8)}`,
            cdlState: pick(CDL_STATES),
            cdlClass: faker.helpers.arrayElement(['A', 'A', 'A', 'B']),
            cdlExpiry,
            cdlEndorsements: faker.helpers.maybe(
              () => faker.helpers.arrayElements(['H', 'N', 'P', 'S', 'T', 'X'], { min: 1, max: 3 }).join(''),
              { probability: 0.5 }
            ),
            medicalCardExpiry: medExpiry,
            emergencyContactName: faker.person.fullName().slice(0, 100),
            emergencyContactPhone: faker.string.numeric(3) + '-' + faker.string.numeric(3) + '-' + faker.string.numeric(4),
            status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'ON_LEAVE']),
            isActive: true,
          },
        });
        createdDrivers.push(driver.id);
        driverCount++;
      }

      // Trucks: 1-4 per carrier
      const numTrucks = faker.number.int({ min: 1, max: 4 });

      for (let t = 0; t < numTrucks; t++) {
        const regExpiry = new Date();
        regExpiry.setMonth(regExpiry.getMonth() + faker.number.int({ min: 1, max: 24 }));
        const inspDate = new Date();
        inspDate.setMonth(inspDate.getMonth() - faker.number.int({ min: 0, max: 12 }));

        const category = pick(TRUCK_CATEGORIES);
        const assignedDriverId = createdDrivers.length > 0 && t === 0 ? createdDrivers[0] : undefined;

        await (prisma as any).operationsCarrierTruck.create({
          data: {
            carrierId: carrier.id,
            unitNumber: `${faker.string.alphanumeric(3).toUpperCase()}-${faker.string.numeric(4)}`,
            vin: faker.string.alphanumeric(17).toUpperCase(),
            licensePlate: faker.string.alphanumeric(7).toUpperCase(),
            licensePlateState: pick(US_STATES),
            year: faker.number.int({ min: 2015, max: 2024 }),
            make: pick(TRUCK_MAKES),
            model: pick(TRUCK_MODELS),
            category,
            hasTarps: category === 'FLATBED' && faker.datatype.boolean(),
            hasChains: faker.datatype.boolean({ probability: 0.3 }),
            hasStraps: category === 'FLATBED' && faker.datatype.boolean(),
            coilRacks: category === 'FLATBED' && faker.datatype.boolean({ probability: 0.2 }),
            loadBars: faker.datatype.boolean({ probability: 0.4 }),
            ramps: faker.datatype.boolean({ probability: 0.2 }),
            registrationExpiry: regExpiry,
            annualInspectionDate: inspDate,
            status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'OUT_OF_SERVICE']),
            assignedDriverId,
            isActive: true,
          },
        });
        truckCount++;
      }

      // Documents: 0-2 per carrier (W9 and insurance cert are most common)
      const docTypes = ['W9', 'CARRIER_AGREEMENT', 'AUTHORITY_LETTER', 'VOID_CHECK', 'INSURANCE_CERTIFICATE', 'OTHER'];
      const numDocs = faker.number.int({ min: 0, max: 2 });

      for (let doc = 0; doc < numDocs; doc++) {
        const docType = pick(docTypes);
        const docExpiry = new Date();
        docExpiry.setFullYear(docExpiry.getFullYear() + faker.number.int({ min: 1, max: 3 }));

        await (prisma as any).operationsCarrierDocument.create({
          data: {
            carrierId: carrier.id,
            tenantId,
            documentType: docType,
            name: `${carrier.companyName} - ${docType.replace(/_/g, ' ')}`,
            description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
            expiryDate: ['INSURANCE_CERTIFICATE', 'AUTHORITY_LETTER'].includes(docType) ? docExpiry : null,
            status: faker.helpers.arrayElement(['APPROVED', 'APPROVED', 'PENDING', 'REJECTED']),
            isActive: true,
            externalId: `SEED-OPS-DOC-${carrier.id.slice(0, 8)}-${doc}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
        documentCount++;
      }
    }
  }

  console.log(`   ✓ Created ${carrierCount} operations carriers`);
  console.log(`   ✓ Created ${driverCount} drivers`);
  console.log(`   ✓ Created ${truckCount} trucks`);
  console.log(`   ✓ Created ${documentCount} documents`);
}
