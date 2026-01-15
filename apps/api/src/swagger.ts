import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Ultra TMS API')
    .setDescription(`
## Transportation Management System API

This API powers the Ultra TMS platform, providing comprehensive
transportation management capabilities including:

- **Authentication & Authorization** - JWT-based auth with RBAC
- **Customer Management** - Full CRM functionality
- **Order Management** - Order lifecycle handling
- **Load Management** - Dispatch and tracking
- **Carrier Management** - Carrier onboarding and compliance
- **Accounting** - Invoicing, payments, and reporting
- **Configuration** - System settings and preferences

### Authentication

All endpoints except \`/auth/login\` and \`/auth/register\` require a valid JWT token.
Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

### Multi-Tenancy

All operations are scoped to the tenant associated with the authenticated user.
The tenant context is automatically extracted from the JWT token.

### Role-Based Access

Each endpoint documents required roles via the \`x-roles\` extension in the OpenAPI spec.
Requests missing required roles return **403 Forbidden**.

### Common Error Responses

- **401** - Missing or invalid authentication token
- **403** - Insufficient role permissions
- **404** - Resource not found
- **422** - Validation error
- **500** - Internal server error

### Response Format

All successful responses follow this format:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
\`\`\`

Paginated responses include:
\`\`\`json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
\`\`\`
    `)
    .setVersion(version || '1.0.0')
    .setContact('Ultra TMS Support', 'https://ultra-tms.com/support', 'support@ultra-tms.com')
    .addServer('http://localhost:3001', 'Development')
    .addServer('https://api.ultra-tms.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Portal user authentication',
        in: 'header',
      },
      'Portal-JWT',
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User management')
    .addTag('Customers', 'Customer/CRM management')
    .addTag('Orders', 'Order management')
    .addTag('Loads', 'Load and dispatch management')
    .addTag('Carriers', 'Carrier management')
    .addTag('Tracking', 'Real-time tracking')
    .addTag('Accounting', 'Invoicing and payments')
    .addTag('Reports', 'Financial and operational reports')
    .addTag('Audit', 'Audit logs and compliance')
    .addTag('Config', 'System configuration')
    .addTag('Documents', 'Document management')
    .addTag('Search', 'Full-text search')
    .addTag('Contracts', 'Contract management')
    .addTag('Contract Templates', 'Contract template library')
    .addTag('Contract Rates', 'Contract-specific rates')
    .addTag('Credit Applications', 'Credit application workflow')
    .addTag('Credit Limits', 'Credit limit management')
    .addTag('Credit Holds', 'Credit hold management')
    .addTag('Agents', 'Agent/broker management')
    .addTag('Agent Agreements', 'Agent agreement management')
    .addTag('Agent Commissions', 'Agent commission tracking')
    .addTag('Employees', 'Employee management')
    .addTag('Departments', 'Department management')
    .addTag('Teams', 'Team management')
    .addTag('Positions', 'Position/role definitions')
    .addTag('Workflows', 'Workflow definitions')
    .addTag('Workflow Actions', 'Workflow step actions')
    .addTag('Workflow Executions', 'Workflow execution tracking')
    .addTag('Global Search', 'Cross-entity search')
    .addTag('Entity Search', 'Entity-specific search')
    .addTag('Saved Searches', 'User saved searches')
    .addTag('Tickets', 'Help desk tickets')
    .addTag('Knowledge Base', 'Knowledge base articles')
    .addTag('FAQ', 'Frequently asked questions')
    .addTag('EDI Partners', 'EDI trading partners')
    .addTag('EDI Transactions', 'EDI transaction management')
    .addTag('EDI Documents', 'EDI document management')
    .addTag('Market Rates', 'Rate intelligence data')
    .addTag('Rate History', 'Historical rate analysis')
    .addTag('Rate Benchmarks', 'Rate benchmarking')
    .addTag('Claims', 'Cargo claims management')
    .addTag('Claim Documents', 'Claims documentation')
    .addTag('Claim Settlements', 'Claims settlement processing')
    .addTag('Factoring Requests', 'Invoice factoring')
    .addTag('NOA Management', 'Notice of assignment')
    .addTag('Quick Pay', 'Quick pay processing')
    .addTag('Safety Scores', 'Carrier safety scoring')
    .addTag('FMCSA Data', 'FMCSA/CSA compliance')
    .addTag('Insurance', 'Insurance certificate management')
    .addTag('Incidents', 'Safety incident tracking')
    .addTag('Customer Portal', 'Customer self-service portal')
    .addTag('Carrier Portal', 'Carrier self-service portal')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 2em; }
    `,
    customSiteTitle: 'Ultra TMS API Documentation',
  });

  app.getHttpAdapter().get('/api/docs/json', (_req, res) => {
    res.json(document);
  });
}
