import { Injectable } from '@nestjs/common';
import { Generate990Dto } from '../dto/generate-990.dto';

@Injectable()
export class Edi990Generator {
  generate(dto: Generate990Dto, controlNumbers: { isaControlNumber: string; gsControlNumber: string; stControlNumber: string }) {
    return JSON.stringify({
      type: '990',
      controlNumbers,
      loadId: dto.loadId,
      responseCode: dto.responseCode,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    });
  }
}
