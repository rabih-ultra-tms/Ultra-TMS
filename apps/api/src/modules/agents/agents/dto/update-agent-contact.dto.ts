import { PartialType } from '@nestjs/mapped-types';
import { AgentContactDto } from './agent-contact.dto';

export class UpdateAgentContactDto extends PartialType(AgentContactDto) {}