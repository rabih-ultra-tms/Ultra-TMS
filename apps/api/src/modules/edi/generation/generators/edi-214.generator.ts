import { Injectable } from '@nestjs/common';
import { Generate214Dto } from '../dto/generate-214.dto';

@Injectable()
export class Edi214Generator {
  generate(dto: Generate214Dto, controlNumbers: { isaControlNumber: string; gsControlNumber: string; stControlNumber: string }) {
    return JSON.stringify({
      type: '214',
      controlNumbers,
      loadId: dto.loadId,
      statusCode: dto.statusCode,
      locationCode: dto.locationCode,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    });
  }
}
