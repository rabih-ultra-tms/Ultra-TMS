import { PartialType } from '@nestjs/mapped-types';
import { CreateClaimNoteDto } from './create-claim-note.dto';

export class UpdateClaimNoteDto extends PartialType(CreateClaimNoteDto) {}
