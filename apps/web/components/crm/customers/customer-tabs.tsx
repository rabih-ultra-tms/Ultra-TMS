"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomerTabsProps {
  customerId: string;
}

const tabDefinitions = (id: string) => [
  { label: "Overview", value: `/companies/${id}` },
  { label: "Contacts", value: `/companies/${id}/contacts` },
  { label: "Activities", value: `/companies/${id}/activities` },
];

export function CustomerTabs({ customerId }: CustomerTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = React.useMemo(() => tabDefinitions(customerId), [customerId]);

  const current = React.useMemo(() => {
    const match = tabs.find((tab) => pathname === tab.value);
    return match?.value ?? `/companies/${customerId}`;
  }, [pathname, tabs, customerId]);

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
