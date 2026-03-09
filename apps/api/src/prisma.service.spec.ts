jest.mock('./prisma-tenant.extension', () => ({
  tenantExtension: jest.fn().mockReturnValue('mock-extension'),
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = Object.create(PrismaService.prototype) as PrismaService;
  });

  it('connects on module init', async () => {
    const connectSpy = jest.fn().mockResolvedValue(undefined);
    (service as any).$connect = connectSpy;

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('disconnects on module destroy', async () => {
    const disconnectSpy = jest.fn().mockResolvedValue(undefined);
    (service as any).$disconnect = disconnectSpy;

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('forTenant calls $extends with the tenant extension', () => {
    const extendsSpy = jest.fn().mockReturnValue({});
    (service as any).$extends = extendsSpy;

    service.forTenant('test-tenant-id');

    expect(extendsSpy).toHaveBeenCalledWith('mock-extension');
  });
});
