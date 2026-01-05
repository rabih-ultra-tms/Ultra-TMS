# 68 - Testing Strategy

**NestJS + React testing patterns for the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Testing Requirements

1. **Every API endpoint MUST have tests** for: happy path, auth (401), authorization (403), validation (400)
2. **Every critical UI flow MUST have tests**
3. **Run tests before committing**: `npm test`
4. **80% code coverage target** for services

---

## Testing Philosophy

### Test Priority (Highest ROI First)

| Priority | Type        | What to Test             | Effort | Value  |
| -------- | ----------- | ------------------------ | ------ | ------ |
| 1        | Integration | API endpoints end-to-end | Medium | High   |
| 2        | Unit        | Service business logic   | Low    | High   |
| 3        | E2E         | Critical user flows      | High   | High   |
| 4        | Unit        | Utility functions        | Low    | Medium |
| 5        | Component   | Complex UI components    | Medium | Medium |

### What to Test vs What to Skip

```
âœ… ALWAYS TEST:
- API endpoint responses
- Authentication/authorization
- Business logic in services
- Data transformations
- Error handling
- Critical user flows (login, create load, dispatch)

âš ï¸ TEST SELECTIVELY:
- Simple UI components (test complex ones)
- Database queries (covered by integration tests)
- Third-party library wrappers

âŒ DON'T TEST:
- Framework code (NestJS, React internals)
- Simple getters/setters
- Type definitions
- Constants
```

---

## NestJS Testing

### Service Unit Tests

```typescript
// carrier.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CarrierService } from './carrier.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CarrierService', () => {
  let service: CarrierService;
  let prisma: PrismaService;

  const mockPrisma = {
    carrier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const tenantId = 'tenant-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CarrierService>(CarrierService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated carriers', async () => {
      const mockCarriers = [{ id: '1', name: 'Carrier A' }];
      mockPrisma.carrier.findMany.mockResolvedValue(mockCarriers);
      mockPrisma.carrier.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 }, tenantId);

      expect(result.data).toEqual(mockCarriers);
      expect(mockPrisma.carrier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId, deletedAt: null }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.carrier.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', tenantId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('create', () => {
    it('should throw ConflictException for duplicate MC', async () => {
      mockPrisma.carrier.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create(
          { name: 'Test', mcNumber: 'MC123', dotNumber: '123' },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow(ConflictException);
    });
  });
});
```

### Controller Integration Tests

```typescript
// carrier.controller.spec.ts

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('CarrierController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => await app.close());

  describe('GET /api/v1/carriers', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/carriers').expect(401);
    });

    it('should return 200 with auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/carriers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
        });
    });
  });

  describe('POST /api/v1/carriers', () => {
    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/carriers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' })
        .expect(400);
    });

    it('should return 201 for valid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/carriers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Carrier',
          mcNumber: 'MC' + Date.now(),
          dotNumber: '' + Date.now(),
        })
        .expect(201);
    });
  });
});
```

---

## React Testing

### Component Tests

```typescript
// carrier-table.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarrierTable } from './carrier-table';

const mockCarriers = [
  { id: '1', name: 'ABC Trucking', mcNumber: 'MC123', status: 'ACTIVE' },
];

describe('CarrierTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders carrier data', () => {
    render(<CarrierTable carriers={mockCarriers} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('ABC Trucking')).toBeInTheDocument();
  });

  it('shows empty state when no carriers', () => {
    render(<CarrierTable carriers={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText(/no carriers/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit clicked', async () => {
    render(<CarrierTable carriers={mockCarriers} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /actions/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /edit/i }));

    expect(mockOnEdit).toHaveBeenCalledWith(mockCarriers[0]);
  });
});
```

### Form Tests

```typescript
// carrier-form.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarrierForm } from './carrier-form';

describe('CarrierForm', () => {
  const mockOnSubmit = jest.fn();

  it('shows validation errors for required fields', async () => {
    render(<CarrierForm onSubmit={mockOnSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits with valid data', async () => {
    render(<CarrierForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/company name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/mc number/i), 'MC123');
    await userEvent.type(screen.getByLabelText(/dot number/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
```

---

## Manual Testing Checklist

### For Every Page

```markdown
## Page: [Name]

URL: [/path]

### Load Testing

- [ ] Page loads without errors
- [ ] Loading spinner shows during fetch
- [ ] Data displays correctly
- [ ] No console errors

### Empty State

- [ ] Empty state message shows when no data
- [ ] CTA button works (if present)

### All Buttons

- [ ] [Button 1]: Click â†’ Expected action
- [ ] [Button 2]: Click â†’ Expected action

### All Dropdown Menus

- [ ] [Menu 1] > [Item 1]: Works
- [ ] [Menu 1] > [Item 2]: Works

### All Links

- [ ] [Link 1]: Goes to correct page
- [ ] [Link 2]: Goes to correct page

### Forms (if any)

- [ ] Submit with valid data: Success
- [ ] Submit with invalid data: Shows errors
- [ ] Required fields marked

### Browser Console

- [ ] No errors
- [ ] No warnings (except expected)
```

---

## Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- carrier.service.spec.ts

# Watch mode
npm test -- --watch

# E2E tests
npm run test:e2e
```

---

## Navigation

- **Previous:** [Auth & Authorization Standards](./67-auth-authorization-standards.md)
- **Next:** [Common Pitfalls Prevention](./69-common-pitfalls-prevention.md)
