import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

export function ApiStandardResponse(description: string, type?: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: type
        ? {
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: `#/components/schemas/${type.name}` },
              message: { type: 'string', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
          }
        : undefined,
    }),
  );
}

export function ApiPaginatedResponse(description: string, type: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${type.name}` },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
}

export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation error',
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not Found - Resource does not exist' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  );
}

export function ApiCreate(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `Create ${entityName}` }),
    ApiBearerAuth('JWT-auth'),
    ApiBody({ type: dto }),
    ApiResponse({ status: 201, description: `${entityName} created successfully` }),
    ApiErrorResponses(),
  );
}

export function ApiList(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `List ${entityName}s` }),
    ApiBearerAuth('JWT-auth'),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiPaginatedResponse(`List of ${entityName}s`, dto),
    ApiErrorResponses(),
  );
}

export function ApiGetById(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `Get ${entityName} by ID` }),
    ApiBearerAuth('JWT-auth'),
    ApiParam({ name: 'id', description: `${entityName} ID` }),
    ApiStandardResponse(`${entityName} details`, dto),
    ApiErrorResponses(),
  );
}

export function ApiUpdate(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `Update ${entityName}` }),
    ApiBearerAuth('JWT-auth'),
    ApiParam({ name: 'id', description: `${entityName} ID` }),
    ApiBody({ type: dto }),
    ApiStandardResponse(`${entityName} updated successfully`, dto),
    ApiErrorResponses(),
  );
}

export function ApiDelete(entityName: string) {
  return applyDecorators(
    ApiOperation({ summary: `Delete ${entityName}` }),
    ApiBearerAuth('JWT-auth'),
    ApiParam({ name: 'id', description: `${entityName} ID` }),
    ApiResponse({ status: 200, description: `${entityName} deleted successfully` }),
    ApiErrorResponses(),
  );
}
