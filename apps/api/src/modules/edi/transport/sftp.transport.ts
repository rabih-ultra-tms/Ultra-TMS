import { Injectable } from '@nestjs/common';

@Injectable()
export class SftpTransport {
  async testConnection(config: Record<string, unknown>) {
    return { success: true, protocol: 'SFTP', config };
  }

  async send(payload: { content: string; target: Record<string, unknown> }) {
    return { success: true, protocol: 'SFTP', delivered: true, payload };
  }
}
