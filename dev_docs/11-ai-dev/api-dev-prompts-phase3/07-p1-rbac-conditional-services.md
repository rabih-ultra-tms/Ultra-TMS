# P1-3: RBAC Enhancement for Conditional Pass Services

## Priority: P1 - HIGH
## Estimated Time: 12-16 hours
## Dependencies: P0 prompts completed

---

## Context

These services passed review but have partial RBAC coverage (50-70%). They need enhancement to reach production readiness:

| Service | Current Coverage | Gap |
|---------|-----------------|-----|
| Claims | 60% | Missing on update/delete operations |
| Contracts | 55% | Rate sheets lack role protection |
| Agents | 50% | Commission access too broad |
| Factoring (Internal) | 65% | Sensitive financial operations exposed |
| Workflow | 45% | Template management unprotected |
| Search | 70% | Some index operations public |
| EDI | 60% | Trading partner credentials accessible |
| Safety | 55% | Incident reports too accessible |

---

## Service-by-Service Implementation

### 1. Claims Service Enhancement

```typescript
// apps/api/src/modules/claims/claims.controller.ts

@Controller('api/v1/claims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsController {
  
  @Get()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  findAll(@Query() query: FindClaimsDto) {
    return this.claimsService.findAll(query);
  }
  
  @Get(':id')
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id);
  }
  
  @Post()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  create(@Body() dto: CreateClaimDto) {
    return this.claimsService.create(dto);
  }
  
  // UPDATE - More restrictive
  @Patch(':id')
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER') // No DISPATCHER
  update(@Param('id') id: string, @Body() dto: UpdateClaimDto) {
    return this.claimsService.update(id, dto);
  }
  
  // DELETE - Admin only
  @Delete(':id')
  @Roles('ADMIN', 'CLAIMS_MANAGER') // Only managers can delete
  remove(@Param('id') id: string) {
    return this.claimsService.remove(id);
  }
  
  // SETTLEMENT APPROVAL - Financial authority required
  @Post(':id/approve-settlement')
  @Roles('ADMIN', 'CLAIMS_MANAGER') // High-value decision
  approveSettlement(
    @Param('id') id: string,
    @Body() dto: ApproveSettlementDto,
    @CurrentUser() user,
  ) {
    return this.claimsService.approveSettlement(id, dto, user.id);
  }
  
  // DOCUMENTS - Claim-related documents
  @Post(':id/documents')
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.claimsService.uploadDocument(id, file);
  }
}
```

### 2. Contracts Service Enhancement

```typescript
// apps/api/src/modules/contracts/contracts.controller.ts

@Controller('api/v1/contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  
  // Contract CRUD - standard access
  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS_MANAGER')
  findAll() {
    return this.contractsService.findAll();
  }
  
  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }
  
  // CONTRACT APPROVAL - Management only
  @Post(':id/approve')
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  approve(@Param('id') id: string) {
    return this.contractsService.approve(id);
  }
  
  // RATE SHEETS - Pricing authority required
  @Get(':id/rate-sheets')
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  getRateSheets(@Param('id') id: string) {
    return this.rateSheetsService.findByContract(id);
  }
  
  @Post(':id/rate-sheets')
  @Roles('ADMIN', 'SALES_MANAGER') // Only sales managers set rates
  createRateSheet(
    @Param('id') id: string,
    @Body() dto: CreateRateSheetDto,
  ) {
    return this.rateSheetsService.create(id, dto);
  }
  
  @Patch(':contractId/rate-sheets/:rateId')
  @Roles('ADMIN', 'SALES_MANAGER')
  updateRateSheet(
    @Param('contractId') contractId: string,
    @Param('rateId') rateId: string,
    @Body() dto: UpdateRateSheetDto,
  ) {
    return this.rateSheetsService.update(rateId, dto);
  }
  
  // CONFIDENTIAL TERMS - Restricted
  @Get(':id/confidential-terms')
  @Roles('ADMIN', 'SALES_MANAGER', 'LEGAL')
  getConfidentialTerms(@Param('id') id: string) {
    return this.contractsService.getConfidentialTerms(id);
  }
}
```

### 3. Agents Service Enhancement

```typescript
// apps/api/src/modules/agents/agents.controller.ts

@Controller('api/v1/agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  
  @Get()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER')
  findAll() {
    return this.agentsService.findAll();
  }
  
  @Get(':id')
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER', 'AGENT') // Agents see own profile
  findOne(@Param('id') id: string, @CurrentUser() user) {
    // Agents can only view their own profile
    if (user.role === 'AGENT' && user.agentId !== id) {
      throw new ForbiddenException('Cannot view other agent profiles');
    }
    return this.agentsService.findOne(id);
  }
  
  @Post()
  @Roles('ADMIN', 'AGENT_MANAGER')
  create(@Body() dto: CreateAgentDto) {
    return this.agentsService.create(dto);
  }
  
  @Patch(':id')
  @Roles('ADMIN', 'AGENT_MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.agentsService.update(id, dto);
  }
  
  // COMMISSION STRUCTURES - Highly restricted
  @Get(':id/commission-structure')
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING')
  getCommissionStructure(@Param('id') id: string) {
    return this.agentsService.getCommissionStructure(id);
  }
  
  @Post(':id/commission-structure')
  @Roles('ADMIN') // Only admin can set commission rates
  setCommissionStructure(
    @Param('id') id: string,
    @Body() dto: SetCommissionStructureDto,
  ) {
    return this.agentsService.setCommissionStructure(id, dto);
  }
  
  // AGENT'S OWN COMMISSIONS - Self-service
  @Get(':id/commissions')
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
  getCommissions(@Param('id') id: string, @CurrentUser() user) {
    // Agents can only view their own commissions
    if (user.role === 'AGENT' && user.agentId !== id) {
      throw new ForbiddenException('Cannot view other agent commissions');
    }
    return this.commissionsService.findByAgent(id);
  }
  
  // PAYMENT DETAILS - Sensitive
  @Get(':id/payment-info')
  @Roles('ADMIN', 'ACCOUNTING')
  getPaymentInfo(@Param('id') id: string) {
    return this.agentsService.getPaymentInfo(id);
  }
  
  @Patch(':id/payment-info')
  @Roles('ADMIN', 'ACCOUNTING')
  updatePaymentInfo(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentInfoDto,
  ) {
    return this.agentsService.updatePaymentInfo(id, dto);
  }
}
```

### 4. Factoring (Internal) Service Enhancement

```typescript
// apps/api/src/modules/factoring-internal/factoring.controller.ts

@Controller('api/v1/factoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FactoringController {
  
  // INVOICE SUBMISSION - Operations can submit
  @Post('invoices')
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING', 'BILLING')
  submitInvoice(@Body() dto: SubmitInvoiceDto) {
    return this.factoringService.submitInvoice(dto);
  }
  
  @Get('invoices')
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  listInvoices(@Query() query: FindInvoicesDto) {
    return this.factoringService.listInvoices(query);
  }
  
  // FUNDING DECISIONS - Financial authority only
  @Post('invoices/:id/approve')
  @Roles('ADMIN', 'FACTORING_MANAGER')
  approveForFunding(
    @Param('id') id: string,
    @Body() dto: ApproveFundingDto,
    @CurrentUser() user,
  ) {
    return this.factoringService.approveForFunding(id, dto, user.id);
  }
  
  @Post('invoices/:id/reject')
  @Roles('ADMIN', 'FACTORING_MANAGER')
  rejectFunding(
    @Param('id') id: string,
    @Body() dto: RejectFundingDto,
    @CurrentUser() user,
  ) {
    return this.factoringService.rejectFunding(id, dto, user.id);
  }
  
  // ADVANCE DISBURSEMENT - High security
  @Post('invoices/:id/disburse')
  @Roles('ADMIN', 'FACTORING_MANAGER')
  disburseAdvance(
    @Param('id') id: string,
    @Body() dto: DisburseAdvanceDto,
    @CurrentUser() user,
  ) {
    // Audit log for financial transactions
    return this.factoringService.disburseAdvance(id, dto, user.id);
  }
  
  // COLLECTIONS - View and manage
  @Get('collections')
  @Roles('ADMIN', 'FACTORING_MANAGER', 'COLLECTIONS_AGENT')
  listCollections(@Query() query: FindCollectionsDto) {
    return this.factoringService.listCollections(query);
  }
  
  @Post('collections/:id/record-payment')
  @Roles('ADMIN', 'FACTORING_MANAGER', 'COLLECTIONS_AGENT')
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.factoringService.recordPayment(id, dto);
  }
  
  // RESERVE MANAGEMENT - Admin only
  @Get('reserves')
  @Roles('ADMIN', 'FACTORING_MANAGER')
  listReserves() {
    return this.factoringService.listReserves();
  }
  
  @Post('reserves/:id/release')
  @Roles('ADMIN') // Only admin can release reserves
  releaseReserve(
    @Param('id') id: string,
    @Body() dto: ReleaseReserveDto,
  ) {
    return this.factoringService.releaseReserve(id, dto);
  }
  
  // REPORTS - Financial reporting
  @Get('reports/aging')
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  getAgingReport() {
    return this.factoringService.getAgingReport();
  }
  
  @Get('reports/exposure')
  @Roles('ADMIN', 'FACTORING_MANAGER')
  getExposureReport() {
    return this.factoringService.getExposureReport();
  }
}
```

### 5. Workflow Service Enhancement

```typescript
// apps/api/src/modules/workflow/workflow.controller.ts

@Controller('api/v1/workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowController {
  
  // WORKFLOW INSTANCES - Standard access
  @Get()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  findAll(@Query() query: FindWorkflowsDto) {
    return this.workflowService.findAll(query);
  }
  
  @Get(':id')
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  findOne(@Param('id') id: string) {
    return this.workflowService.findOne(id);
  }
  
  // EXECUTE STEPS - Role-based step execution
  @Post(':id/execute')
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER')
  executeStep(
    @Param('id') id: string,
    @Body() dto: ExecuteStepDto,
    @CurrentUser() user,
  ) {
    return this.workflowService.executeStep(id, dto, user);
  }
  
  // WORKFLOW TEMPLATES - Admin/management only
  @Get('templates')
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  listTemplates() {
    return this.templateService.findAll();
  }
  
  @Post('templates')
  @Roles('ADMIN') // Only admin can create templates
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.templateService.create(dto);
  }
  
  @Patch('templates/:id')
  @Roles('ADMIN')
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templateService.update(id, dto);
  }
  
  @Delete('templates/:id')
  @Roles('ADMIN')
  deleteTemplate(@Param('id') id: string) {
    return this.templateService.remove(id);
  }
  
  // TEMPLATE ACTIVATION - Separate from CRUD
  @Post('templates/:id/activate')
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  activateTemplate(@Param('id') id: string) {
    return this.templateService.activate(id);
  }
  
  @Post('templates/:id/deactivate')
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  deactivateTemplate(@Param('id') id: string) {
    return this.templateService.deactivate(id);
  }
}
```

### 6. Search Service Enhancement

```typescript
// apps/api/src/modules/search/search.controller.ts

@Controller('api/v1/search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  
  // SEARCH - All authenticated users
  @Get()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP', 
         'ACCOUNTING', 'CARRIER_MANAGER', 'AGENT')
  search(@Query() query: SearchDto, @CurrentUser() user) {
    // Filter results based on user role/permissions
    return this.searchService.search(query, user);
  }
  
  // ADVANCED SEARCH - Specific entity search
  @Post('loads')
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  searchLoads(@Body() dto: SearchLoadsDto, @CurrentUser() user) {
    return this.searchService.searchLoads(dto, user);
  }
  
  @Post('carriers')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER')
  searchCarriers(@Body() dto: SearchCarriersDto) {
    return this.searchService.searchCarriers(dto);
  }
  
  @Post('customers')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'ACCOUNTING')
  searchCustomers(@Body() dto: SearchCustomersDto) {
    return this.searchService.searchCustomers(dto);
  }
  
  // INDEX MANAGEMENT - Admin only
  @Post('index/rebuild')
  @Roles('ADMIN')
  rebuildIndex(@Body() dto: RebuildIndexDto) {
    return this.searchService.rebuildIndex(dto);
  }
  
  @Get('index/status')
  @Roles('ADMIN')
  getIndexStatus() {
    return this.searchService.getIndexStatus();
  }
  
  @Delete('index/:entity')
  @Roles('ADMIN')
  clearIndex(@Param('entity') entity: string) {
    return this.searchService.clearIndex(entity);
  }
}
```

### 7. EDI Service Enhancement

```typescript
// apps/api/src/modules/edi/edi.controller.ts

@Controller('api/v1/edi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EdiController {
  
  // TRADING PARTNERS - Management only
  @Get('trading-partners')
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  listTradingPartners() {
    return this.tradingPartnerService.findAll();
  }
  
  @Post('trading-partners')
  @Roles('ADMIN', 'EDI_MANAGER')
  createTradingPartner(@Body() dto: CreateTradingPartnerDto) {
    return this.tradingPartnerService.create(dto);
  }
  
  @Patch('trading-partners/:id')
  @Roles('ADMIN', 'EDI_MANAGER')
  updateTradingPartner(
    @Param('id') id: string,
    @Body() dto: UpdateTradingPartnerDto,
  ) {
    return this.tradingPartnerService.update(id, dto);
  }
  
  // CREDENTIALS - Admin only, never expose
  @Post('trading-partners/:id/credentials')
  @Roles('ADMIN') // Only admin can set credentials
  setCredentials(
    @Param('id') id: string,
    @Body() dto: SetCredentialsDto,
  ) {
    return this.tradingPartnerService.setCredentials(id, dto);
  }
  
  @Post('trading-partners/:id/test-connection')
  @Roles('ADMIN', 'EDI_MANAGER')
  testConnection(@Param('id') id: string) {
    return this.tradingPartnerService.testConnection(id);
  }
  
  // TRANSACTIONS - View EDI transactions
  @Get('transactions')
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  listTransactions(@Query() query: FindTransactionsDto) {
    return this.ediTransactionService.findAll(query);
  }
  
  @Get('transactions/:id')
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  getTransaction(@Param('id') id: string) {
    return this.ediTransactionService.findOne(id);
  }
  
  // MANUAL OPERATIONS - EDI management
  @Post('transactions/:id/reprocess')
  @Roles('ADMIN', 'EDI_MANAGER')
  reprocessTransaction(@Param('id') id: string) {
    return this.ediTransactionService.reprocess(id);
  }
  
  @Post('send')
  @Roles('ADMIN', 'EDI_MANAGER')
  sendEdiDocument(@Body() dto: SendEdiDto) {
    return this.ediService.sendDocument(dto);
  }
}
```

### 8. Safety Service Enhancement

```typescript
// apps/api/src/modules/safety/safety.controller.ts

@Controller('api/v1/safety')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SafetyController {
  
  // INCIDENTS - Report and view
  @Get('incidents')
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
  listIncidents(@Query() query: FindIncidentsDto) {
    return this.incidentService.findAll(query);
  }
  
  @Get('incidents/:id')
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
  getIncident(@Param('id') id: string) {
    return this.incidentService.findOne(id);
  }
  
  @Post('incidents')
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
  reportIncident(@Body() dto: ReportIncidentDto, @CurrentUser() user) {
    return this.incidentService.create(dto, user.id);
  }
  
  // INCIDENT INVESTIGATION - Safety team only
  @Post('incidents/:id/investigation')
  @Roles('ADMIN', 'SAFETY_MANAGER')
  startInvestigation(
    @Param('id') id: string,
    @Body() dto: StartInvestigationDto,
  ) {
    return this.incidentService.startInvestigation(id, dto);
  }
  
  @Patch('incidents/:id/investigation')
  @Roles('ADMIN', 'SAFETY_MANAGER')
  updateInvestigation(
    @Param('id') id: string,
    @Body() dto: UpdateInvestigationDto,
  ) {
    return this.incidentService.updateInvestigation(id, dto);
  }
  
  // DRIVER SAFETY RECORDS - Restricted
  @Get('drivers/:id/record')
  @Roles('ADMIN', 'SAFETY_MANAGER', 'CARRIER_MANAGER')
  getDriverSafetyRecord(@Param('id') id: string) {
    return this.safetyService.getDriverRecord(id);
  }
  
  // CARRIER SAFETY SCORES - Internal metrics
  @Get('carriers/:id/score')
  @Roles('ADMIN', 'SAFETY_MANAGER', 'CARRIER_MANAGER', 'DISPATCHER')
  getCarrierSafetyScore(@Param('id') id: string) {
    return this.safetyService.getCarrierScore(id);
  }
  
  // COMPLIANCE - Safety team only
  @Get('compliance/violations')
  @Roles('ADMIN', 'SAFETY_MANAGER')
  listViolations(@Query() query: FindViolationsDto) {
    return this.complianceService.listViolations(query);
  }
  
  @Post('compliance/violations')
  @Roles('ADMIN', 'SAFETY_MANAGER')
  recordViolation(@Body() dto: RecordViolationDto) {
    return this.complianceService.recordViolation(dto);
  }
  
  // REPORTS - Management
  @Get('reports/summary')
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER')
  getSafetySummary(@Query() query: ReportPeriodDto) {
    return this.safetyService.getSummaryReport(query);
  }
}
```

---

## Verification

```bash
# Test Claims - adjuster can create, only manager can delete
curl -X POST -H "Authorization: Bearer $ADJUSTER_TOKEN" \
  http://localhost:3001/api/v1/claims -d '{"loadId":"..."}' # 201

curl -X DELETE -H "Authorization: Bearer $ADJUSTER_TOKEN" \
  http://localhost:3001/api/v1/claims/123 # 403

# Test Contracts - rate sheets restricted
curl -H "Authorization: Bearer $SALES_REP_TOKEN" \
  http://localhost:3001/api/v1/contracts/123/rate-sheets # 403

# Test EDI - credentials endpoint admin only
curl -X POST -H "Authorization: Bearer $EDI_MANAGER_TOKEN" \
  http://localhost:3001/api/v1/edi/trading-partners/123/credentials # 403
```

---

## Files to Modify

### Claims
- [ ] `apps/api/src/modules/claims/claims.controller.ts`
- [ ] `apps/api/src/modules/claims/claims.service.ts`

### Contracts
- [ ] `apps/api/src/modules/contracts/contracts.controller.ts`
- [ ] `apps/api/src/modules/contracts/rate-sheets.controller.ts`

### Agents
- [ ] `apps/api/src/modules/agents/agents.controller.ts`
- [ ] `apps/api/src/modules/agents/agents.service.ts`

### Factoring
- [ ] `apps/api/src/modules/factoring-internal/factoring.controller.ts`

### Workflow
- [ ] `apps/api/src/modules/workflow/workflow.controller.ts`
- [ ] `apps/api/src/modules/workflow/templates.controller.ts`

### Search
- [ ] `apps/api/src/modules/search/search.controller.ts`

### EDI
- [ ] `apps/api/src/modules/edi/edi.controller.ts`
- [ ] `apps/api/src/modules/edi/trading-partners.controller.ts`

### Safety
- [ ] `apps/api/src/modules/safety/safety.controller.ts`
- [ ] `apps/api/src/modules/safety/incidents.controller.ts`

---

## Success Criteria

- [ ] Claims: Settlement approval restricted to managers
- [ ] Contracts: Rate sheet creation restricted to sales managers
- [ ] Agents: Commission structures admin-only, self-service for own data
- [ ] Factoring: Reserve release admin-only, financial audit trail
- [ ] Workflow: Template CRUD admin-only
- [ ] Search: Index management admin-only
- [ ] EDI: Credential management admin-only
- [ ] Safety: Investigation restricted to safety team
- [ ] All sensitive operations have audit logging
