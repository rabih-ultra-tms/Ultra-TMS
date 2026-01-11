import { Injectable } from '@nestjs/common';
import { Generate204Dto } from '../dto/generate-204.dto';

@Injectable()
export class Edi204Generator {
  generate(dto: Generate204Dto, controlNumbers: { isaControlNumber: string; gsControlNumber: string; stControlNumber: string }) {
    return JSON.stringify({
      type: '204',
      controlNumbers,
      loadId: dto.loadId,
      carrierId: dto.carrierId,
      createdAt: new Date().toISOString(),
    });
  }
}
