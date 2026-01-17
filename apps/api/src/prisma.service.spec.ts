import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = Object.create(PrismaService.prototype) as PrismaService;
  });

  it('registers soft-delete middleware on init', async () => {
    const useSpy = jest.fn();
    const connectSpy = jest.fn().mockResolvedValue(undefined);

    (service as any).$use = useSpy;
    (service as any).$connect = connectSpy;

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
    expect(useSpy).toHaveBeenCalledTimes(1);
  });

  it('adds deletedAt filter for soft-delete models on findMany', async () => {
    let middleware: any;
    (service as any).$connect = jest.fn().mockResolvedValue(undefined);
    (service as any).$use = jest.fn((cb: any) => {
      middleware = cb;
    });

    await service.onModuleInit();

    const params = { model: 'Company', action: 'findMany', args: { where: {} } } as any;
    const next = jest.fn().mockResolvedValue('ok');

    const result = await middleware(params, next);

    expect(params.args.where.deletedAt).toBeNull();
    expect(next).toHaveBeenCalledWith(params);
    expect(result).toBe('ok');
  });

  it('does not add deletedAt filter for non-soft-delete models', async () => {
    let middleware: any;
    (service as any).$connect = jest.fn().mockResolvedValue(undefined);
    (service as any).$use = jest.fn((cb: any) => {
      middleware = cb;
    });

    await service.onModuleInit();

    const params = { model: 'Invoice', action: 'findFirst', args: { where: {} } } as any;
    const next = jest.fn().mockResolvedValue('ok');

    await middleware(params, next);

    expect(params.args.where.deletedAt).toBeUndefined();
    expect(next).toHaveBeenCalledWith(params);
  });

  it('converts delete to update with deletedAt', async () => {
    let middleware: any;
    (service as any).$connect = jest.fn().mockResolvedValue(undefined);
    (service as any).$use = jest.fn((cb: any) => {
      middleware = cb;
    });

    await service.onModuleInit();

    const params = { model: 'Company', action: 'delete', args: {} } as any;
    const next = jest.fn().mockResolvedValue('ok');

    await middleware(params, next);

    expect(params.action).toBe('update');
    expect(params.args.data.deletedAt).toBeInstanceOf(Date);
  });

  it('converts deleteMany to updateMany with deletedAt', async () => {
    let middleware: any;
    (service as any).$connect = jest.fn().mockResolvedValue(undefined);
    (service as any).$use = jest.fn((cb: any) => {
      middleware = cb;
    });

    await service.onModuleInit();

    const params = { model: 'Load', action: 'deleteMany', args: {} } as any;
    const next = jest.fn().mockResolvedValue('ok');

    await middleware(params, next);

    expect(params.action).toBe('updateMany');
    expect(params.args.data.deletedAt).toBeInstanceOf(Date);
  });

  it('disconnects on module destroy', async () => {
    const disconnectSpy = jest.fn().mockResolvedValue(undefined);
    (service as any).$disconnect = disconnectSpy;

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
