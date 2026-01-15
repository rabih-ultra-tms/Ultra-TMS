import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiStandardResponses(model?: Type<unknown>) {
  return applyDecorators(
    ApiOkResponse(model ? { type: model } : undefined),
    ApiBadRequestResponse({ description: 'Bad Request' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
    ApiNotFoundResponse({ description: 'Not Found' }),
  );
}
