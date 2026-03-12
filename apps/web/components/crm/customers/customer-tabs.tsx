'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerTabsProps {
  customerId: string;
  /** Base path for tab routes. Defaults to "/companies". */
  basePath?: string;
}

const tabDefinitions = (id: string, base: string) => [
  { label: 'Overview', value: `${base}/${id}` },
  { label: 'Contacts', value: `${base}/${id}/contacts` },
  { label: 'Activities', value: `${base}/${id}/activities` },
];

export function CustomerTabs({
  customerId,
  basePath = '/companies',
}: CustomerTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = React.useMemo(
    () => tabDefinitions(customerId, basePath),
    [customerId, basePath]
  );

  const current = React.useMemo(() => {
    const match = tabs.find((tab) => pathname === tab.value);
    return match?.value ?? `${basePath}/${customerId}`;
  }, [pathname, tabs, customerId, basePath]);

  return (
    <Tabs value={current} onValueChange={(value) => router.push(value)}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
