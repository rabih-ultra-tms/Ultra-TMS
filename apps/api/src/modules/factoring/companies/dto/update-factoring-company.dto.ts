import { PartialType } from '@nestjs/mapped-types';
import { CreateFactoringCompanyDto } from './create-factoring-company.dto';

export class UpdateFactoringCompanyDto extends PartialType(CreateFactoringCompanyDto) {}
