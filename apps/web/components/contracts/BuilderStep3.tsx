'use client';

import { useState } from 'react';
import {
  useContractBuilderStore,
  RateTableFormData,
  RateLaneFormData,
} from '@/lib/stores/contractBuilderStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderStep3() {
  const {
    rateTables,
    selectedRateTableIndex,
    addRateTable,
    deleteRateTable,
    selectRateTable,
    addLaneToRateTable,
    deleteLaneFromRateTable,
  } = useContractBuilderStore();

  const [showNewRateTable, setShowNewRateTable] = useState(false);
  const [showNewLane, setShowNewLane] = useState(false);
  const [newTable, setNewTable] = useState<RateTableFormData>({
    name: '',
    type: 'BASE',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    baseCurrency: 'USD',
    lanes: [],
  });

  const [newLane, setNewLane] = useState<RateLaneFormData>({
    origin: '',
    destination: '',
    baseRate: 0,
  });

  const handleAddRateTable = () => {
    if (!newTable.name) {
      toast.error('Rate table name is required');
      return;
    }
    addRateTable(newTable);
    setNewTable({
      name: '',
      type: 'BASE',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      baseCurrency: 'USD',
      lanes: [],
    });
    setShowNewRateTable(false);
    toast.success('Rate table added');
  };

  const handleAddLane = () => {
    if (selectedRateTableIndex === null) {
      toast.error('Select a rate table first');
      return;
    }
    if (!newLane.origin || !newLane.destination || newLane.baseRate === 0) {
      toast.error('Please fill in all lane fields');
      return;
    }
    addLaneToRateTable(selectedRateTableIndex, newLane);
    setNewLane({
      origin: '',
      destination: '',
      baseRate: 0,
    });
    setShowNewLane(false);
    toast.success('Lane added');
  };

  const selectedTable =
    selectedRateTableIndex !== null ? rateTables[selectedRateTableIndex] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Rate Tables & Lanes
        </h2>
        <p className="text-sm text-text-muted">
          Create rate tables with origin-destination pricing
        </p>
      </div>

      <Separator />

      {/* Rate Tables List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Label className="text-sm font-medium">Rate Tables</Label>
          {!showNewRateTable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewRateTable(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              Add Rate Table
            </Button>
          )}
        </div>

        {showNewRateTable && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Rate Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="table-name" className="text-sm">
                  Table Name *
                </Label>
                <Input
                  id="table-name"
                  value={newTable.name}
                  onChange={(e) =>
                    setNewTable({ ...newTable, name: e.target.value })
                  }
                  placeholder="e.g., Standard Rates"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="table-type" className="text-sm">
                    Type
                  </Label>
                  <Select
                    value={newTable.type}
                    onValueChange={(value) =>
                      setNewTable({ ...newTable, type: value })
                    }
                  >
                    <SelectTrigger id="table-type" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASE">Base</SelectItem>
                      <SelectItem value="FUEL_SURCHARGE">Fuel Surcharge</SelectItem>
                      <SelectItem value="ACCESSORIAL">Accessorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="table-currency" className="text-sm">
                    Currency
                  </Label>
                  <Select
                    value={newTable.baseCurrency}
                    onValueChange={(value) =>
                      setNewTable({ ...newTable, baseCurrency: value })
                    }
                  >
                    <SelectTrigger id="table-currency" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddRateTable}
                >
                  Create Table
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewRateTable(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {rateTables.length > 0 ? (
          <div className="space-y-2">
            {rateTables.map((table, index) => (
              <button
                key={index}
                onClick={() => selectRateTable(index)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedRateTableIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{table.name}</p>
                    <p className="text-xs text-gray-500">
                      {table.lanes.length} lanes
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRateTable(index);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            No rate tables yet. Click "Add Rate Table" to create one.
          </p>
        )}
      </div>

      {selectedTable && (
        <>
          <Separator />

          {/* Lanes for Selected Table */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm font-medium">
                Lanes for {selectedTable.name}
              </Label>
              {!showNewLane && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewLane(true)}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  Add Lane
                </Button>
              )}
            </div>

            {showNewLane && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New Lane</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="lane-origin" className="text-sm">
                        Origin *
                      </Label>
                      <Input
                        id="lane-origin"
                        value={newLane.origin}
                        onChange={(e) =>
                          setNewLane({ ...newLane, origin: e.target.value })
                        }
                        placeholder="e.g., New York"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lane-dest" className="text-sm">
                        Destination *
                      </Label>
                      <Input
                        id="lane-dest"
                        value={newLane.destination}
                        onChange={(e) =>
                          setNewLane({ ...newLane, destination: e.target.value })
                        }
                        placeholder="e.g., Los Angeles"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="lane-rate" className="text-sm">
                      Base Rate *
                    </Label>
                    <Input
                      id="lane-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newLane.baseRate}
                      onChange={(e) =>
                        setNewLane({
                          ...newLane,
                          baseRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddLane}>
                      Add Lane
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewLane(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTable.lanes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Base Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTable.lanes.map((lane, index) => (
                    <TableRow key={index}>
                      <TableCell>{lane.origin}</TableCell>
                      <TableCell>{lane.destination}</TableCell>
                      <TableCell className="text-right">
                        ${lane.baseRate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() =>
                            deleteLaneFromRateTable(selectedRateTableIndex!, index)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-text-muted">
                No lanes yet. Click "Add Lane" to create one.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
