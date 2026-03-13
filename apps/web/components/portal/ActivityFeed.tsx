import { Card } from '@/components/ui/card';

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Recent Activity
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start space-x-4 pb-4 border-b border-slate-200 last:border-b-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {item.description}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
