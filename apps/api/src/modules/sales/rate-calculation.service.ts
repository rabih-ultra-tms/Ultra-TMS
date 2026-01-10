import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface RateCalculationInput {
  origin: {
    city: string;
    state: string;
    postalCode?: string;
  };
  destination: {
    city: string;
    state: string;
    postalCode?: string;
  };
  stops?: Array<{
    city: string;
    state: string;
    postalCode?: string;
  }>;
  serviceType: string;
  equipmentType: string;
  weightLbs?: number;
  pieces?: number;
  customerId?: string;
}

export interface RateCalculationResult {
  totalMiles: number;
  linehaulRate: number;
  fuelSurcharge: number;
  accessorialsTotal: number;
  totalAmount: number;
  marginAmount: number;
  marginPercent: number;
  rateSource: 'CONTRACT' | 'MARKET' | 'CALCULATED';
  marketComparison?: {
    low: number;
    avg: number;
    high: number;
  };
  breakdown: {
    baseRatePerMile: number;
    linehaul: number;
    fuel: number;
    accessorials: Array<{
      type: string;
      amount: number;
    }>;
  };
}

@Injectable()
export class RateCalculationService {
  private readonly DEFAULT_MINIMUM_MARGIN_PERCENT = 15;
  private readonly DEFAULT_FUEL_SURCHARGE_PERCENT = 15;
  private readonly BASE_RATE_PER_MILE = 3.0; // Default fallback rate

  constructor(private prisma: PrismaService) {}

  async calculateRate(
    tenantId: string,
    input: RateCalculationInput,
  ): Promise<RateCalculationResult> {
    // Calculate total miles (simplified - in production, use distance API)
    const totalMiles = this.calculateMiles(input.origin, input.destination, input.stops);

    // 1. Try to find contract rate for customer
    let ratePerMile = this.BASE_RATE_PER_MILE;
    let rateSource: 'CONTRACT' | 'MARKET' | 'CALCULATED' = 'CALCULATED';

    if (input.customerId) {
      const contractRate = await this.findContractRate(
        tenantId,
        input.customerId,
        input.origin,
        input.destination,
        input.serviceType,
        input.equipmentType,
      );

      if (contractRate) {
        ratePerMile = Number(contractRate.rateAmount);
        rateSource = 'CONTRACT';
      }
    }

    // 2. If no contract rate, use market rate (mocked for now)
    if (rateSource === 'CALCULATED') {
      const marketRate = this.getMarketRate(input.equipmentType);
      ratePerMile = marketRate.avg;
      rateSource = 'MARKET';
    }

    // 3. Calculate linehaul
    const linehaul = totalMiles * ratePerMile;

    // 4. Calculate fuel surcharge
    const fuelSurcharge = linehaul * (this.DEFAULT_FUEL_SURCHARGE_PERCENT / 100);

    // 5. Add applicable accessorials (simplified)
    const accessorials: Array<{ type: string; amount: number }> = [];
    const accessorialsTotal = accessorials.reduce((sum, acc) => sum + acc.amount, 0);

    // 6. Calculate total
    const totalAmount = linehaul + fuelSurcharge + accessorialsTotal;

    // 7. Calculate margin
    const cost = totalAmount * 0.85; // Assume 85% cost ratio
    const marginAmount = totalAmount - cost;
    const marginPercent = (marginAmount / totalAmount) * 100;

    // 8. Get market comparison for transparency
    const marketComparison = this.getMarketRate(input.equipmentType);

    return {
      totalMiles,
      linehaulRate: linehaul,
      fuelSurcharge,
      accessorialsTotal,
      totalAmount,
      marginAmount,
      marginPercent,
      rateSource,
      marketComparison,
      breakdown: {
        baseRatePerMile: ratePerMile,
        linehaul,
        fuel: fuelSurcharge,
        accessorials,
      },
    };
  }

  private calculateMiles(
    origin: { city: string; state: string },
    destination: { city: string; state: string },
    stops?: Array<{ city: string; state: string }>,
  ): number {
    // Simplified distance calculation
    // In production, use Google Maps Distance Matrix API or similar
    const baseDistance = 500 + Math.random() * 1500; // Mock: 500-2000 miles
    const additionalStops = stops ? stops.length * 100 : 0;
    return Math.round(baseDistance + additionalStops);
  }

  private async findContractRate(
    tenantId: string,
    companyId: string,
    origin: { city: string; state: string },
    destination: { city: string; state: string },
    serviceType: string,
    equipmentType: string,
  ) {
    const contract = await this.prisma.rateContract.findFirst({
      where: {
        tenantId,
        companyId,
        status: 'ACTIVE',
        effectiveDate: { lte: new Date() },
        expirationDate: { gte: new Date() },
      },
      include: {
        laneRates: {
          where: {
            OR: [
              {
                originState: origin.state,
                destinationState: destination.state,
                serviceType,
                equipmentType,
              },
              {
                originState: origin.state,
                destinationState: destination.state,
                serviceType,
                equipmentType: null,
              },
            ],
          },
          orderBy: {
            rateAmount: 'asc',
          },
          take: 1,
        },
      },
    });

    return contract?.laneRates[0] || null;
  }

  private getMarketRate(equipmentType: string): { low: number; avg: number; high: number } {
    // Mock market rates - in production, integrate with DAT/Truckstop API
    const baseRates = {
      DRY_VAN: { low: 2.5, avg: 3.0, high: 3.5 },
      REEFER: { low: 3.0, avg: 3.5, high: 4.0 },
      FLATBED: { low: 3.2, avg: 3.7, high: 4.2 },
    };

    return baseRates[equipmentType as keyof typeof baseRates] || baseRates.DRY_VAN;
  }

  async enforceMinimumMargin(
    totalAmount: number,
    minimumMarginPercent?: number,
  ): Promise<number> {
    const minMargin = minimumMarginPercent || this.DEFAULT_MINIMUM_MARGIN_PERCENT;
    const requiredAmount = totalAmount / (1 - minMargin / 100);
    return Math.max(totalAmount, requiredAmount);
  }
}
