import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PublicTrackingController } from './public-tracking.controller';
import { TrackingService } from './tracking.service';

describe('PublicTrackingController', () => {
  let app: INestApplication;
  let trackingService: {
    getPublicTrackingByCode: jest.Mock;
  };

  const mockTrackingData = {
    trackingNumber: 'LD-202602-00145',
    status: 'IN_TRANSIT',
    origin: { city: 'Houston', state: 'TX' },
    destination: { city: 'Dallas', state: 'TX' },
    estimatedDelivery: new Date(Date.now() + 6 * 60 * 60 * 1000),
    actualDelivery: null,
    lastKnownLocation: {
      city: 'Waco',
      state: 'TX',
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    timeline: {
      dispatchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      pickedUpAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      deliveredAt: null,
    },
    stops: [
      {
        type: 'PICKUP',
        sequence: 1,
        city: 'Houston',
        state: 'TX',
        status: 'COMPLETED',
        appointmentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        arrivedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        departedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        type: 'DELIVERY',
        sequence: 2,
        city: 'Dallas',
        state: 'TX',
        status: 'IN_PROGRESS',
        appointmentDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
        arrivedAt: null,
        departedAt: null,
      },
    ],
    statusHistory: [
      {
        fromStatus: 'PENDING',
        toStatus: 'DISPATCHED',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        fromStatus: 'DISPATCHED',
        toStatus: 'IN_TRANSIT',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
    ],
  };

  beforeAll(async () => {
    trackingService = {
      getPublicTrackingByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicTrackingController],
      providers: [{ provide: TrackingService, useValue: trackingService }],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/public/tracking/:trackingCode', () => {
    it('should return tracking data for valid tracking code', async () => {
      trackingService.getPublicTrackingByCode.mockResolvedValueOnce(
        mockTrackingData
      );

      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/tracking/LD-202602-00145'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.trackingNumber).toBe('LD-202602-00145');
      expect(response.body.data.status).toBe('IN_TRANSIT');
      expect(response.body.data).toHaveProperty('origin');
      expect(response.body.data).toHaveProperty('destination');
      expect(response.body.data).toHaveProperty('lastKnownLocation');
      expect(response.body.data).toHaveProperty('stops');
      expect(response.body.data).toHaveProperty('statusHistory');
      expect(trackingService.getPublicTrackingByCode).toHaveBeenCalledWith(
        'LD-202602-00145'
      );
    });

    it('should return 404 for non-existent tracking code', async () => {
      trackingService.getPublicTrackingByCode.mockResolvedValueOnce(null);

      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/tracking/NONEXISTENT-CODE'
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Shipment not found');
    });

    it('should include milestone history (statusHistory)', async () => {
      trackingService.getPublicTrackingByCode.mockResolvedValueOnce(
        mockTrackingData
      );

      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/tracking/LD-202602-00145'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.statusHistory).toBeDefined();
      expect(Array.isArray(response.body.data.statusHistory)).toBe(true);
      expect(response.body.data.statusHistory.length).toBeGreaterThan(0);
      expect(response.body.data.statusHistory[0]).toHaveProperty('fromStatus');
      expect(response.body.data.statusHistory[0]).toHaveProperty('toStatus');
      expect(response.body.data.statusHistory[0]).toHaveProperty('timestamp');
    });

    it('should include stops with sequence and timeline', async () => {
      trackingService.getPublicTrackingByCode.mockResolvedValueOnce(
        mockTrackingData
      );

      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/tracking/LD-202602-00145'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.stops).toBeDefined();
      expect(Array.isArray(response.body.data.stops)).toBe(true);
      expect(response.body.data.stops.length).toBe(2);

      const pickupStop = response.body.data.stops.find(
        (s: { type: string }) => s.type === 'PICKUP'
      );
      expect(pickupStop).toBeDefined();
      expect(pickupStop?.status).toBe('COMPLETED');

      const deliveryStop = response.body.data.stops.find(
        (s: { type: string }) => s.type === 'DELIVERY'
      );
      expect(deliveryStop).toBeDefined();
      expect(deliveryStop?.status).toBe('IN_PROGRESS');
    });

    it('should include timeline events (dispatched, pickup, delivery)', async () => {
      trackingService.getPublicTrackingByCode.mockResolvedValueOnce(
        mockTrackingData
      );

      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/tracking/LD-202602-00145'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.timeline).toBeDefined();
      expect(response.body.data.timeline.dispatchedAt).toBeDefined();
      expect(response.body.data.timeline.pickedUpAt).toBeDefined();
      expect(response.body.data.timeline.deliveredAt).toBeNull();
    });

    it('should include estimated and actual delivery times', async () => {
      trackingService.getPublicTrackingByCode.mockResolvedValueOnce(
        mockTrackingData
      );

      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/tracking/LD-202602-00145'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.estimatedDelivery).toBeDefined();
      expect(response.body.data.actualDelivery).toBeNull();
    });

    it('should include current location info', async () => {
      trackingService.getPublicTrackingByCode.mockResolvedValueOnce(
        mockTrackingData
      );

      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/tracking/LD-202602-00145'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.lastKnownLocation).toBeDefined();
      expect(response.body.data.lastKnownLocation.city).toBe('Waco');
      expect(response.body.data.lastKnownLocation.state).toBe('TX');
      expect(response.body.data.lastKnownLocation.updatedAt).toBeDefined();
    });
  });
});
