import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude, Transform } from 'class-transformer';

export function SensitiveField() {
  return Exclude();
}

export function MaskedField(options?: { mask?: string; showLast?: number }) {
  const mask = options?.mask ?? '••••';
  const showLast = options?.showLast ?? 4;

  return Transform(({ value }) => {
    if (!value || typeof value !== 'string') return null;
    if (value.length <= showLast) return mask;
    return `${mask}${value.slice(-showLast)}`;
  });
}

export function UseSerialization() {
  return UseInterceptors(ClassSerializerInterceptor);
}
