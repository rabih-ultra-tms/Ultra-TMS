import { Test, TestingModule } from '@nestjs/testing';
import { TicketNumberService } from './ticket-number.service';
import { PrismaService } from '../../../prisma.service';

describe('TicketNumberService', () => {
  let service: TicketNumberService;
  let prisma: { supportTicket: { count: jest.Mock } };

  beforeEach(async () => {
    prisma = { supportTicket: { count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketNumberService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TicketNumberService);
  });

  it('generates ticket number with prefix and sequence', async () => {
    prisma.supportTicket.count.mockResolvedValue(4);

    const result = await service.generate('tenant-1');

    expect(result).toMatch(/TKT-\d{6}-00005/);
  });
});