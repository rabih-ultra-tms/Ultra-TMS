import { Injectable } from '@nestjs/common';
import { Generate997Dto } from '../dto/generate-997.dto';

@Injectable()
export class Edi997Generator {
  generate(dto: Generate997Dto, controlNumbers: { isaControlNumber: string; gsControlNumber: string; stControlNumber: string }) {
    return JSON.stringify({
      type: '997',
      controlNumbers,
      originalMessageId: dto.originalMessageId,
      ackStatus: dto.ackStatus,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    });
  }
}
