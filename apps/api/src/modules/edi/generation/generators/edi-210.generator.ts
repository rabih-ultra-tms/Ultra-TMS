import { Injectable } from '@nestjs/common';
import { Generate210Dto } from '../dto/generate-210.dto';

@Injectable()
export class Edi210Generator {
  generate(dto: Generate210Dto, controlNumbers: { isaControlNumber: string; gsControlNumber: string; stControlNumber: string }) {
    return JSON.stringify({
      type: '210',
      controlNumbers,
      invoiceId: dto.invoiceId,
      createdAt: new Date().toISOString(),
    });
  }
}
