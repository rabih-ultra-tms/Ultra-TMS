import { lastValueFrom, of } from 'rxjs';
import { StreamableFile } from '@nestjs/common';
import { ResponseTransformInterceptor } from './response-transform.interceptor';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it('passes through StreamableFile', async () => {
    const file = new StreamableFile(Buffer.from('data'));
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of(file) } as any));

    expect(result).toBe(file);
  });

  it('passes through buffer', async () => {
    const buffer = Buffer.from('data');
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of(buffer) } as any));

    expect(result).toBe(buffer);
  });

  it('passes through success response', async () => {
    const response = { success: true, data: { id: 1 } };
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of(response) } as any));

    expect(result).toBe(response);
  });

  it('wraps pagination shape', async () => {
    const response = { data: [{ id: 1 }], total: 1, page: 1, limit: 10 };
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of(response) } as any));

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        data: [{ id: 1 }],
        pagination: expect.objectContaining({ total: 1, page: 1, limit: 10 }),
      }),
    );
  });

  it('wraps pagination object', async () => {
    const response = { data: [{ id: 1 }], pagination: { total: 1, page: 1, limit: 10 } };
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of(response) } as any));

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        data: [{ id: 1 }],
        pagination: expect.objectContaining({ total: 1, page: 1, limit: 10 }),
      }),
    );
  });

  it('wraps data payload with ok', async () => {
    const response = { data: { id: 1 }, message: 'ok' };
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of(response) } as any));

    expect(result).toEqual(expect.objectContaining({ success: true, data: { id: 1 }, message: 'ok' }));
  });

  it('wraps primitive payload', async () => {
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of('value') } as any));

    expect(result).toEqual(expect.objectContaining({ success: true, data: 'value' }));
  });
});
