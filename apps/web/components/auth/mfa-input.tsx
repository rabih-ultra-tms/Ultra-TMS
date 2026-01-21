"use client";

import { Input } from "@/components/ui/input";

interface MFAInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function MFAInput({ value, onChange }: MFAInputProps) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="123456"
      inputMode="numeric"
      maxLength={6}
    />
  );
}
