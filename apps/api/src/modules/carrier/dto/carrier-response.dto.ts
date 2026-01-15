import { MaskedField } from '../../../common/transformers/sensitive-field.transformer';

export class CarrierResponseDto {
  @MaskedField({ mask: '••-•••', showLast: 4 })
  taxId?: string | null;

  @MaskedField({ mask: '•••••', showLast: 4 })
  bankRoutingNumber?: string | null;

  @MaskedField({ mask: '••••', showLast: 4 })
  bankAccountNumberEnc?: string | null;
}
