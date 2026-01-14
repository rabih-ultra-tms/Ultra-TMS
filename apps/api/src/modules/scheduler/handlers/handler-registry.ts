import { Injectable } from '@nestjs/common';

type HandlerFn = (payload: Record<string, any>) => Promise<any> | any;

@Injectable()
export class HandlerRegistry {
  private handlers = new Map<string, HandlerFn>();

  register(name: string, handler: HandlerFn) {
    this.handlers.set(name, handler);
  }

  async execute(name: string, payload: Record<string, any>) {
    const handler = this.handlers.get(name);
    if (!handler) {
      return null;
    }
    return handler(payload ?? {});
  }
}
