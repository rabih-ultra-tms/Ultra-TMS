import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderConfigDto } from './create-provider-config.dto';

export class UpdateProviderConfigDto extends PartialType(CreateProviderConfigDto) {}
