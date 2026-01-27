import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const truckTypesData = [
  // FLATBED Category
  {
    name: '48\' Flatbed',
    category: 'FLATBED',
    deckLengthFt: 48.0,
    deckWidthFt: 8.5,
    deckHeightFt: 5.0,
    wellLengthFt: 0,
    maxCargoWeightLbs: 48000,
    description: 'Standard 48-foot flatbed trailer for general freight',
  },
  {
    name: '53\' Flatbed',
    category: 'FLATBED',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 8.5,
    wellLengthFt: 0,
    maxCargoWeightLbs: 48000,
    description: 'Extended 53-foot flatbed trailer for longer loads',
  },

  // STEP DECK Category
  {
    name: '48\' Step Deck',
    category: 'STEP_DECK',
    deckLengthFt: 48.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 37.0,
    maxCargoWeightLbs: 48000,
    description: 'Step deck with 11-foot well, ideal for taller loads',
  },
  {
    name: '53\' Step Deck',
    category: 'STEP_DECK',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 40.0,
    maxCargoWeightLbs: 48000,
    description: 'Extended step deck with 40-foot well',
  },

  // RGN (Removable Gooseneck) Category
  {
    name: '29\' RGN',
    category: 'RGN',
    deckLengthFt: 29.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 29.0,
    maxCargoWeightLbs: 45000,
    description: 'Removable gooseneck for heavy equipment',
  },
  {
    name: '40\' RGN',
    category: 'RGN',
    deckLengthFt: 40.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 40.0,
    maxCargoWeightLbs: 45000,
    description: 'Extended RGN for larger heavy equipment',
  },
  {
    name: '48\' RGN',
    category: 'RGN',
    deckLengthFt: 48.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 48.0,
    maxCargoWeightLbs: 45000,
    description: 'Full-length RGN trailer',
  },

  // DOUBLE DROP Category
  {
    name: '48\' Double Drop',
    category: 'DOUBLE_DROP',
    deckLengthFt: 48.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 29.0,
    maxCargoWeightLbs: 45000,
    description: 'Double drop trailer with low deck height',
  },
  {
    name: '53\' Double Drop',
    category: 'DOUBLE_DROP',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 37.0,
    maxCargoWeightLbs: 45000,
    description: 'Extended double drop trailer',
  },

  // LOWBOY Category
  {
    name: '48\' Lowboy',
    category: 'LOWBOY',
    deckLengthFt: 48.0,
    deckWidthFt: 8.5,
    deckHeightFt: 12.0,
    wellLengthFt: 24.0,
    maxCargoWeightLbs: 40000,
    description: 'Low-profile trailer for oversized equipment',
  },
  {
    name: '53\' Lowboy',
    category: 'LOWBOY',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 12.0,
    wellLengthFt: 29.0,
    maxCargoWeightLbs: 40000,
    description: 'Extended lowboy trailer',
  },

  // STRETCH RGN Category
  {
    name: '70\' Stretch RGN',
    category: 'STRETCH_RGN',
    deckLengthFt: 70.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 70.0,
    maxCargoWeightLbs: 45000,
    description: 'Extendable RGN for long loads',
  },
  {
    name: '80\' Stretch RGN',
    category: 'STRETCH_RGN',
    deckLengthFt: 80.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 80.0,
    maxCargoWeightLbs: 45000,
    description: 'Extra-long stretch RGN',
  },

  // HOTSHOT Category
  {
    name: '40\' Hotshot',
    category: 'HOTSHOT',
    deckLengthFt: 40.0,
    deckWidthFt: 8.5,
    deckHeightFt: 5.0,
    wellLengthFt: 0,
    maxCargoWeightLbs: 16500,
    description: 'Hotshot gooseneck for expedited loads',
  },
  {
    name: '32\' Hotshot',
    category: 'HOTSHOT',
    deckLengthFt: 32.0,
    deckWidthFt: 8.5,
    deckHeightFt: 5.0,
    wellLengthFt: 0,
    maxCargoWeightLbs: 14000,
    description: 'Smaller hotshot gooseneck',
  },

  // SPECIALIZED Category
  {
    name: '48\' Conestoga',
    category: 'CONESTOGA',
    deckLengthFt: 48.0,
    deckWidthFt: 8.5,
    deckHeightFt: 9.0,
    wellLengthFt: 0,
    maxCargoWeightLbs: 45000,
    description: 'Curtain-sided flatbed with rolling tarp system',
  },
  {
    name: '53\' Conestoga',
    category: 'CONESTOGA',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 9.0,
    wellLengthFt: 0,
    maxCargoWeightLbs: 45000,
    description: 'Extended curtain-sided flatbed',
  },

  // MULTI-AXLE Category
  {
    name: '9-Axle Heavy Haul',
    category: 'MULTI_AXLE',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 40.0,
    maxCargoWeightLbs: 150000,
    description: '9-axle heavy haul trailer for super heavy loads',
  },
  {
    name: '11-Axle Heavy Haul',
    category: 'MULTI_AXLE',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 40.0,
    maxCargoWeightLbs: 180000,
    description: '11-axle heavy haul trailer for extreme loads',
  },
  {
    name: '13-Axle Heavy Haul',
    category: 'MULTI_AXLE',
    deckLengthFt: 53.0,
    deckWidthFt: 8.5,
    deckHeightFt: 11.5,
    wellLengthFt: 40.0,
    maxCargoWeightLbs: 200000,
    description: '13-axle heavy haul trailer for maximum capacity',
  },
];

async function seedTruckTypes() {
  console.log('🚚 Seeding truck types...');

  for (const truck of truckTypesData) {
    await prisma.truckType.upsert({
      where: { id: truck.name }, // Use name as unique identifier for upsert
      create: truck,
      update: truck,
    });
  }

  const count = await prisma.truckType.count();
  console.log(`✅ Seeded ${count} truck types`);
}

export default seedTruckTypes;

// Run directly if this file is executed
if (require.main === module) {
  seedTruckTypes()
    .then(() => {
      console.log('✅ Truck types seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Truck types seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
