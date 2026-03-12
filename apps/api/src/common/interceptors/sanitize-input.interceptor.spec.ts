import { SanitizeInputInterceptor } from './sanitize-input.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('SanitizeInputInterceptor', () => {
  let interceptor: SanitizeInputInterceptor;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: { body: unknown; query: unknown; params: unknown };

  beforeEach(() => {
    interceptor = new SanitizeInputInterceptor();
    mockRequest = { body: {}, query: {}, params: {} };
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
    mockCallHandler = { handle: () => of({}) };
  });

  it('should strip HTML tags from body strings', (done) => {
    mockRequest.body = {
      name: '<script>alert("xss")</script>John',
      email: 'test@example.com',
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.body).toEqual({
        name: 'alert("xss")John',
        email: 'test@example.com',
      });
      done();
    });
  });

  it('should trim whitespace from strings', (done) => {
    mockRequest.body = { name: '  John Doe  ', city: ' NYC ' };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.body).toEqual({ name: 'John Doe', city: 'NYC' });
      done();
    });
  });

  it('should handle nested objects', (done) => {
    mockRequest.body = {
      address: { street: '  <b>Main St</b>  ', city: '<i>NYC</i>' },
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.body).toEqual({
        address: { street: 'Main St', city: 'NYC' },
      });
      done();
    });
  });

  it('should handle arrays', (done) => {
    mockRequest.body = {
      tags: [
        '<script>xss</script>',
        '  valid  ',
        '<img src=x onerror=alert(1)>',
      ],
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.body).toEqual({
        tags: ['xss', 'valid', ''],
      });
      done();
    });
  });

  it('should sanitize query params', (done) => {
    mockRequest.query = { search: '<script>alert(1)</script>test' };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.query).toEqual({ search: 'alert(1)test' });
      done();
    });
  });

  it('should preserve non-string values', (done) => {
    mockRequest.body = {
      count: 42,
      active: true,
      amount: 99.99,
      data: null,
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.body).toEqual({
        count: 42,
        active: true,
        amount: 99.99,
        data: null,
      });
      done();
    });
  });

  it('should strip img tags with event handlers', (done) => {
    mockRequest.body = {
      note: 'Check <img src=x onerror=alert(document.cookie)> this',
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
      expect(mockRequest.body).toEqual({ note: 'Check  this' });
      done();
    });
  });
});
