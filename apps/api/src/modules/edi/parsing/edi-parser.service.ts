import { Injectable } from '@nestjs/common';

@Injectable()
export class EdiParserService {
  parse(rawContent: string): Record<string, unknown> {
    try {
      // Basic parser stub: accept JSON payloads or key=value pairs
      if (rawContent.trim().startsWith('{')) {
        return JSON.parse(rawContent) as Record<string, unknown>;
      }

      const segments = rawContent.split('\n').filter((line) => line.includes('='));
      const payload: Record<string, string> = {};
      segments.forEach((line) => {
        const [key, ...rest] = line.split('=');
        if (key) {
          payload[key.trim()] = rest.join('=').trim();
        }
      });

      if (Object.keys(payload).length > 0) {
        return payload;
      }

      throw new Error('Unsupported EDI payload format');
    } catch (err) {
      throw new Error(`Failed to parse EDI payload: ${(err as Error).message}`);
    }
  }
}
