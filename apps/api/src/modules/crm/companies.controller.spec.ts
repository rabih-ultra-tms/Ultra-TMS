import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { ContactsService } from './contacts.service';
import { OpportunitiesService } from './opportunities.service';
import { ActivitiesService } from './activities.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesService: jest.Mocked<CompaniesService>;
  let contactsService: jest.Mocked<ContactsService>;
  let opportunitiesService: jest.Mocked<OpportunitiesService>;
  let activitiesService: jest.Mocked<ActivitiesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getCompanyOrders: jest.fn(),
            syncToHubspot: jest.fn(),
            assignReps: jest.fn(),
            updateTier: jest.fn(),
          },
        },
        {
          provide: ContactsService,
          useValue: { findAll: jest.fn() },
        },
        {
          provide: OpportunitiesService,
          useValue: { findAll: jest.fn() },
        },
        {
          provide: ActivitiesService,
          useValue: { findAll: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(CompaniesController);
    companiesService = module.get(CompaniesService);
    contactsService = module.get(ContactsService);
    opportunitiesService = module.get(OpportunitiesService);
    activitiesService = module.get(ActivitiesService);
  });

  describe('findAll', () => {
    it('should call service with tenant and query', async () => {
      companiesService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });

      await controller.findAll('tenant-uuid', 1, 10, 'CUSTOMER', 'ACTIVE', 'acme', 'user-1');

      expect(companiesService.findAll).toHaveBeenCalledWith('tenant-uuid', {
        page: 1,
        limit: 10,
        companyType: 'CUSTOMER',
        status: 'ACTIVE',
        search: 'acme',
        assignedUserId: 'user-1',
      });
    });
  });

  describe('create', () => {
    it('should call service with tenant, user, and dto', async () => {
      const createDto = { name: 'Test Company' } as any;
      companiesService.create.mockResolvedValue({ id: 'company-uuid', ...createDto } as any);

      await controller.create('tenant-uuid', 'user-uuid', createDto);

      expect(companiesService.create).toHaveBeenCalledWith('tenant-uuid', 'user-uuid', createDto);
    });
  });

  describe('findOne', () => {
    it('should call service with tenant and id', async () => {
      companiesService.findOne.mockResolvedValue({ id: 'company-uuid' } as any);

      await controller.findOne('tenant-uuid', 'company-uuid');

      expect(companiesService.findOne).toHaveBeenCalledWith('tenant-uuid', 'company-uuid');
    });
  });

  describe('update', () => {
    it('should call service with tenant, id, user, and dto', async () => {
      const updateDto = { name: 'Updated' } as any;
      companiesService.update.mockResolvedValue({ id: 'company-uuid', ...updateDto } as any);

      await controller.update('tenant-uuid', 'user-uuid', 'company-uuid', updateDto);

      expect(companiesService.update).toHaveBeenCalledWith('tenant-uuid', 'company-uuid', 'user-uuid', updateDto);
    });
  });

  describe('delete', () => {
    it('should call service with tenant, id, and user', async () => {
      companiesService.delete.mockResolvedValue({ success: true } as any);

      await controller.delete('tenant-uuid', 'user-uuid', 'company-uuid');

      expect(companiesService.delete).toHaveBeenCalledWith('tenant-uuid', 'company-uuid', 'user-uuid');
    });
  });

  describe('getContacts', () => {
    it('should call contacts service with company filter', async () => {
      contactsService.findAll.mockResolvedValue({ data: [], total: 0 } as any);

      await controller.getContacts('tenant-uuid', 'company-uuid', 1, 10);

      expect(contactsService.findAll).toHaveBeenCalledWith('tenant-uuid', { companyId: 'company-uuid', page: 1, limit: 10 });
    });
  });

  describe('getOpportunities', () => {
    it('should call opportunities service with company filter', async () => {
      opportunitiesService.findAll.mockResolvedValue({ data: [], total: 0 } as any);

      await controller.getOpportunities('tenant-uuid', 'company-uuid', 2, 25);

      expect(opportunitiesService.findAll).toHaveBeenCalledWith('tenant-uuid', { companyId: 'company-uuid', page: 2, limit: 25 });
    });
  });

  describe('getActivities', () => {
    it('should call activities service with company filter', async () => {
      activitiesService.findAll.mockResolvedValue({ data: [], total: 0 } as any);

      await controller.getActivities('tenant-uuid', 'company-uuid', 3, 5);

      expect(activitiesService.findAll).toHaveBeenCalledWith('tenant-uuid', { companyId: 'company-uuid', page: 3, limit: 5 });
    });
  });

  describe('getOrders', () => {
    it('should call company orders with pagination', async () => {
      companiesService.getCompanyOrders.mockResolvedValue({ data: [], total: 0 } as any);

      await controller.getOrders('tenant-uuid', 'company-uuid', 1, 20);

      expect(companiesService.getCompanyOrders).toHaveBeenCalledWith('tenant-uuid', 'company-uuid', { page: 1, limit: 20 });
    });
  });

  describe('syncHubspot', () => {
    it('should call sync on service', async () => {
      companiesService.syncToHubspot.mockResolvedValue({ success: true } as any);

      await controller.syncHubspot('tenant-uuid', 'user-uuid', 'company-uuid');

      expect(companiesService.syncToHubspot).toHaveBeenCalledWith('tenant-uuid', 'company-uuid', 'user-uuid');
    });
  });

  describe('assignRep', () => {
    it('should call assign reps on service', async () => {
      const dto = { salesRepId: 'rep-1', opsRepId: 'ops-1' };
      companiesService.assignReps.mockResolvedValue({ id: 'company-uuid' } as any);

      await controller.assignRep('tenant-uuid', 'user-uuid', 'company-uuid', dto);

      expect(companiesService.assignReps).toHaveBeenCalledWith('tenant-uuid', 'company-uuid', 'user-uuid', dto);
    });
  });

  describe('updateTier', () => {
    it('should call update tier on service', async () => {
      companiesService.updateTier.mockResolvedValue({ id: 'company-uuid', previousTier: 'B' } as any);

      await controller.updateTier('tenant-uuid', 'user-uuid', 'company-uuid', { tier: 'A' });

      expect(companiesService.updateTier).toHaveBeenCalledWith('tenant-uuid', 'company-uuid', 'user-uuid', 'A');
    });
  });
});
