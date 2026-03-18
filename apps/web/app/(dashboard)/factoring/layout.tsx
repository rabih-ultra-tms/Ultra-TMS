import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/factoring', label: 'Dashboard' },
  { href: '/factoring/payments', label: 'Payments' },
  { href: '/factoring/companies', label: 'Companies' },
  { href: '/factoring/noa', label: 'NOA Records' },
];

interface FactoringLayoutProps {
  children: ReactNode;
}

export default function FactoringLayout({ children }: FactoringLayoutProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Factoring</h1>
        <p className="text-muted-foreground">
          Manage factoring companies, advances, and quick-pay relationships
        </p>
      </div>

      <nav className="flex gap-2 border-b">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors',
              'border-transparent text-muted-foreground hover:text-foreground',
              'hover:border-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
