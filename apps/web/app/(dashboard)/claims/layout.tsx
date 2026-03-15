import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claims | Ultra TMS',
  description: 'Manage insurance claims and settlements',
};

export default function ClaimsLayout({ children }: { children: ReactNode }) {
  return children;
}
