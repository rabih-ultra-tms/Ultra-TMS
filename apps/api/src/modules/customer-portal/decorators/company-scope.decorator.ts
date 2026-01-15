import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CompanyScopeType = {
  type: 'CUSTOMER';
  id: string;
  tenantId: string;
};

export const CompanyScope = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.companyScope as CompanyScopeType | undefined;
  },
);
