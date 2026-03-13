import { Card } from '@/components/ui/card';

export interface DashboardCardData {
  activeShipments: number;
  pendingInvoices: number;
  recentAlerts: number;
}

export function DashboardCards({ data }: { data: DashboardCardData }) {
  const cards = [
    {
      title: 'Active Shipments',
      value: data.activeShipments,
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Pending Invoices',
      value: data.pendingInvoices,
      color: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'Alerts',
      value: data.recentAlerts,
      color: 'bg-red-50',
      textColor: 'text-red-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className={`p-6 ${card.color}`}>
          <p className="text-sm font-medium text-slate-600">{card.title}</p>
          <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
