import { Injectable, Logger } from '@nestjs/common';

interface EnvelopeResult {
  envelopeId: string;
  status: 'sent' | 'completed' | 'voided';
  sentAt: Date;
}

@Injectable()
export class DocuSignService {
  private readonly logger = new Logger(DocuSignService.name);

  async sendEnvelope(contractId: string, subject: string, recipients?: string[]): Promise<EnvelopeResult> {
    this.logger.log(`Stub DocuSign send for contract ${contractId} with subject ${subject}`);
    if (recipients?.length) {
      this.logger.log(`Recipients: ${recipients.join(',')}`);
    }
    const envelopeId = `env-${contractId}-${Date.now()}`;
    return { envelopeId, status: 'sent', sentAt: new Date() };
  }
}
