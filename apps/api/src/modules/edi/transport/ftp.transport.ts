import { Injectable } from '@nestjs/common';

@Injectable()
export class FtpTransport {
  async testConnection(config: Record<string, unknown>) {
    return { success: true, protocol: 'FTP', config };
  }

  async send(payload: { content: string; target: Record<string, unknown> }) {
    return { success: true, protocol: 'FTP', delivered: true, payload };
  }
}
