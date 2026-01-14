import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InvalidationService } from './invalidation.service';

@Injectable()
export class InvalidationListener {
  private readonly logger = new Logger(InvalidationListener.name);

  constructor(private readonly invalidation: InvalidationService) {}

  @OnEvent('*.created')
  @OnEvent('*.updated')
  @OnEvent('*.deleted')
  async handleWildcard(event: string) {
    this.logger.verbose(`Invalidation listener received event ${event}`);
    // In this stub we rely on explicit invalidation endpoints; rule-based handling can be expanded later.
  }
}
