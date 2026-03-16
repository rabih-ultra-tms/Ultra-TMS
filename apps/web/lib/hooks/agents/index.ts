export {
  useAgents,
  useAgent,
  useAgentContacts,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useActivateAgent,
  useSuspendAgent,
  useTerminateAgent,
  useAddContact,
  useUpdateContact,
  agentKeys,
  type Agent,
  type AgentContact,
  type AgentListParams,
  type CreateAgentInput,
  type UpdateAgentInput,
  type AgentContactInput,
} from './use-agents';

export {
  useAgentAgreements,
  useCreateAgreement,
  useUpdateAgreement,
  useActivateAgreement,
  useTerminateAgreement,
  useDeleteAgreement,
  type AgentAgreement,
  type CreateAgreementInput,
  type UpdateAgreementInput,
  agreementKeys,
} from './use-agent-agreements';

export {
  useAgentCustomers,
  useAssignCustomer,
  useTransferAssignment,
  useStartSunset,
  useTerminateAssignment,
  type AgentCustomerAssignment,
  type AssignCustomerInput,
} from './use-agent-assignments';

export {
  useAgentCommissions,
  useAgentPerformance,
  type AgentCommission,
  type AgentPerformance,
  type AgentCommissionParams,
} from './use-agent-commissions';
