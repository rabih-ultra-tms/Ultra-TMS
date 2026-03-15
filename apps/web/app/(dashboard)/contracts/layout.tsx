import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contracts | Ultra TMS',
  description: 'Manage contracts with carriers, customers, and vendors',
};

export default function ContractsLayout({ children }: { children: ReactNode }) {
  return children;
}
