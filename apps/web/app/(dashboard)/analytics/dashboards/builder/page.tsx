'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ChartBarIcon,
  TableCellsIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const widgetTypes = [
  { id: 'KPI_CARD', name: 'KPI Card', icon: ChartBarIcon, description: 'Single KPI with trend' },
  { id: 'LINE_CHART', name: 'Line Chart', icon: ChartBarIcon, description: 'Time series data' },
  { id: 'BAR_CHART', name: 'Bar Chart', icon: ChartBarIcon, description: 'Category comparison' },
  { id: 'PIE_CHART', name: 'Pie Chart', icon: ChartBarIcon, description: 'Distribution view' },
  { id: 'TABLE', name: 'Data Table', icon: TableCellsIcon, description: 'Tabular data view' },
  { id: 'GAUGE', name: 'Gauge', icon: ChartBarIcon, description: 'Progress indicator' },
];

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, unknown>;
}

const mockWidgets: DashboardWidget[] = [
  { id: '1', type: 'KPI_CARD', title: 'Revenue MTD', x: 0, y: 0, w: 3, h: 2, config: { kpiCode: 'REVENUE_MTD' } },
  { id: '2', type: 'KPI_CARD', title: 'Loads Today', x: 3, y: 0, w: 3, h: 2, config: { kpiCode: 'LOADS_TODAY' } },
  { id: '3', type: 'KPI_CARD', title: 'On-Time %', x: 6, y: 0, w: 3, h: 2, config: { kpiCode: 'ON_TIME_DELIVERY' } },
  { id: '4', type: 'KPI_CARD', title: 'Margin %', x: 9, y: 0, w: 3, h: 2, config: { kpiCode: 'GROSS_MARGIN' } },
  { id: '5', type: 'LINE_CHART', title: 'Revenue Trend', x: 0, y: 2, w: 6, h: 4, config: { kpiCode: 'REVENUE_MTD', period: 'MTD' } },
  { id: '6', type: 'BAR_CHART', title: 'Load Volume by Mode', x: 6, y: 2, w: 6, h: 4, config: { metric: 'loads', groupBy: 'mode' } },
  { id: '7', type: 'TABLE', title: 'Top Customers', x: 0, y: 6, w: 6, h: 4, config: { dataSource: 'customers', limit: 10 } },
  { id: '8', type: 'PIE_CHART', title: 'Revenue by Region', x: 6, y: 6, w: 6, h: 4, config: { metric: 'revenue', groupBy: 'region' } },
];

export default function DashboardBuilderPage() {
  const [dashboardName, setDashboardName] = useState('New Dashboard');
  const [widgets, setWidgets] = useState(mockWidgets);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const handleAddWidget = (widgetType: string) => {
    const newWidget = {
      id: String(Date.now()),
      type: widgetType,
      title: `New ${widgetType.replace('_', ' ')}`,
      x: 0,
      y: Math.max(...widgets.map((w) => w.y + w.h), 0),
      w: widgetType === 'KPI_CARD' ? 3 : 6,
      h: widgetType === 'KPI_CARD' ? 2 : 4,
      config: {},
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetPicker(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
    setSelectedWidget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Builder"
        description="Design and customize your dashboard layout"
        actions={
          <div className="flex gap-2">
            <Link href="/analytics/dashboards">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <EyeIcon className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="primary" size="sm">
              Save Dashboard
            </Button>
          </div>
        }
      />

      {/* Dashboard Settings */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dashboard Name
            </label>
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Enter dashboard name..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowWidgetPicker(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Widget
            </Button>
            <Button variant="outline" size="sm">
              <Cog6ToothIcon className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Widget</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowWidgetPicker(false)}>
                ×
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {widgetTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAddWidget(type.id)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <type.icon className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">{type.name}</h3>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Canvas */}
      <Card className="p-6 min-h-[600px]">
        <div className="grid grid-cols-12 gap-4 auto-rows-[80px]">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`col-span-${widget.w} row-span-${widget.h} bg-gray-50 dark:bg-gray-800 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedWidget === widget.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              style={{
                gridColumn: `span ${widget.w}`,
                gridRow: `span ${widget.h}`,
              }}
              onClick={() => setSelectedWidget(widget.id)}
            >
              <div className="flex items-start justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Squares2X2Icon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">{widget.type.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
                </div>
                {selectedWidget === widget.id && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <ArrowsPointingOutIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Cog6ToothIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWidget(widget.id);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Squares2X2Icon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">No widgets yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start building your dashboard by adding widgets</p>
            <Button variant="primary" onClick={() => setShowWidgetPicker(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Your First Widget
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
