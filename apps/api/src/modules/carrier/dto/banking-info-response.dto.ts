import { Expose } from 'class-transformer';
import { MaskedField } from '../../../common/transformers/sensitive-field.transformer';

export class BankingInfoResponseDto {
  @Expose()
  bankName?: string | null;

  @Expose()
  @MaskedField({ mask: '••••', showLast: 4 })
  accountNumber?: string | null;

  @Expose()
  @MaskedField({ mask: '•••••', showLast: 4 })
  routingNumber?: string | null;

  @Expose()
  accountType?: string | null;
}
