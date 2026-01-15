import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CarrierScopeType = {
  type: 'CARRIER';
  id: string;
  tenantId: string;
};

export const CarrierScope = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.carrierScope as CarrierScopeType | undefined;
  },
);
