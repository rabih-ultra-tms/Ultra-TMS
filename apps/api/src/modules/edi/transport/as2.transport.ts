import { Injectable } from '@nestjs/common';

@Injectable()
export class As2Transport {
  async testConnection(config: Record<string, unknown>) {
    return { success: true, protocol: 'AS2', config };
  }

  async send(payload: { content: string; target: Record<string, unknown> }) {
    return { success: true, protocol: 'AS2', delivered: true, payload };
  }
}
