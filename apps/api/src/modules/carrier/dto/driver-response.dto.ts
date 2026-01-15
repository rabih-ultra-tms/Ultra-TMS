import { Exclude, Expose, Transform } from 'class-transformer';

export class DriverResponseDto {
  @Exclude()
  ssn?: string | null;

  @Expose()
  @Transform(({ obj }) => {
    if (!obj?.ssn || typeof obj.ssn !== 'string') return null;
    return `•••-••-${obj.ssn.slice(-4)}`;
  })
  ssnMasked?: string | null;
}
