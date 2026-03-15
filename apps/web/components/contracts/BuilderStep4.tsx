'use client';

import { useState } from 'react';
import {
  useContractBuilderStore,
  SLAFormData,
  VolumeCommitmentFormData,
} from '@/lib/stores/contractBuilderStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderStep4() {
  const {
    contractType,
    partyName,
    startDate,
    endDate,
    currency,
    value,
    rateTables,
    slas,
    volumeCommitments,
    addSLA,
    deleteSLA,
    addVolumeCommitment,
    deleteVolumeCommitment,
  } = useContractBuilderStore();

  const [showNewSLA, setShowNewSLA] = useState(false);
  const [showNewVolume, setShowNewVolume] = useState(false);

  const [newSLA, setNewSLA] = useState<SLAFormData>({
    name: '',
    description: '',
    deliveryTime: 0,
    pickupTime: 0,
    onTimePercentage: 95,
  });

  const [newVolume, setNewVolume] = useState<VolumeCommitmentFormData>({
    commitmentPeriod: 'MONTHLY',
    minVolume: 0,
    maxVolume: 0,
    volumeUnit: 'UNITS',
    discountPercentage: 0,
  });

  const handleAddSLA = () => {
    if (!newSLA.name) {
      toast.error('SLA name is required');
      return;
    }
    addSLA(newSLA);
    setNewSLA({
      name: '',
      description: '',
      deliveryTime: 0,
      pickupTime: 0,
      onTimePercentage: 95,
    });
    setShowNewSLA(false);
    toast.success('SLA added');
  };

  const handleAddVolume = () => {
    if (newVolume.minVolume === 0 || newVolume.maxVolume === 0) {
      toast.error('Volume values must be greater than 0');
      return;
    }
    addVolumeCommitment(newVolume);
    setNewVolume({
      commitmentPeriod: 'MONTHLY',
      minVolume: 0,
      maxVolume: 0,
      volumeUnit: 'UNITS',
      discountPercentage: 0,
    });
    setShowNewVolume(false);
    toast.success('Volume commitment added');
  };

  const totalLanes = rateTables.reduce((acc, table) => acc + table.lanes.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          SLAs, Volume & Review
        </h2>
        <p className="text-sm text-text-muted">
          Add service level agreements and volume commitments, then review your contract
        </p>
      </div>

      <Separator />

      {/* SLAs Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Label className="text-sm font-medium">Service Level Agreements</Label>
          {!showNewSLA && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewSLA(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              Add SLA
            </Button>
          )}
        </div>

        {showNewSLA && (
          <Card className="mb-4">
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="sla-name" className="text-sm">
                  SLA Name *
                </Label>
                <Input
                  id="sla-name"
                  value={newSLA.name}
                  onChange={(e) =>
                    setNewSLA({ ...newSLA, name: e.target.value })
                  }
                  placeholder="e.g., Delivery SLA"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sla-desc" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="sla-desc"
                  value={newSLA.description}
                  onChange={(e) =>
                    setNewSLA({ ...newSLA, description: e.target.value })
                  }
                  placeholder="SLA details"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="delivery-time" className="text-sm">
                    Delivery Time (hours)
                  </Label>
                  <Input
                    id="delivery-time"
                    type="number"
                    min="0"
                    value={newSLA.deliveryTime}
                    onChange={(e) =>
                      setNewSLA({
                        ...newSLA,
                        deliveryTime: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="pickup-time" className="text-sm">
                    Pickup Time (hours)
                  </Label>
                  <Input
                    id="pickup-time"
                    type="number"
                    min="0"
                    value={newSLA.pickupTime}
                    onChange={(e) =>
                      setNewSLA({
                        ...newSLA,
                        pickupTime: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="on-time-pct" className="text-sm">
                  On-Time Performance %
                </Label>
                <Input
                  id="on-time-pct"
                  type="number"
                  min="0"
                  max="100"
                  value={newSLA.onTimePercentage}
                  onChange={(e) =>
                    setNewSLA({
                      ...newSLA,
                      onTimePercentage: parseInt(e.target.value) || 95,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSLA}>
                  Add SLA
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewSLA(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {slas.map((sla, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3"
            >
              <div>
                <p className="font-medium">{sla.name}</p>
                <p className="text-xs text-gray-500">{sla.description}</p>
              </div>
              <button
                onClick={() => deleteSLA(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {slas.length === 0 && (
            <p className="text-sm text-text-muted">No SLAs added yet</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Volume Commitments Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Label className="text-sm font-medium">Volume Commitments</Label>
          {!showNewVolume && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewVolume(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              Add Volume
            </Button>
          )}
        </div>

        {showNewVolume && (
          <Card className="mb-4">
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="volume-min" className="text-sm">
                    Min Volume *
                  </Label>
                  <Input
                    id="volume-min"
                    type="number"
                    min="0"
                    value={newVolume.minVolume}
                    onChange={(e) =>
                      setNewVolume({
                        ...newVolume,
                        minVolume: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="volume-max" className="text-sm">
                    Max Volume *
                  </Label>
                  <Input
                    id="volume-max"
                    type="number"
                    min="0"
                    value={newVolume.maxVolume}
                    onChange={(e) =>
                      setNewVolume({
                        ...newVolume,
                        maxVolume: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discount-pct" className="text-sm">
                  Discount %
                </Label>
                <Input
                  id="discount-pct"
                  type="number"
                  min="0"
                  value={newVolume.discountPercentage}
                  onChange={(e) =>
                    setNewVolume({
                      ...newVolume,
                      discountPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddVolume}>
                  Add Volume
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewVolume(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {volumeCommitments.map((vol, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3"
            >
              <div>
                <p className="font-medium">{vol.commitmentPeriod}</p>
                <p className="text-xs text-gray-500">
                  {vol.minVolume} - {vol.maxVolume} {vol.volumeUnit}
                </p>
              </div>
              <button
                onClick={() => deleteVolumeCommitment(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {volumeCommitments.length === 0 && (
            <p className="text-sm text-text-muted">No volume commitments yet</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Contract Summary Review */}
      <div>
        <h3 className="mb-4 font-medium text-text-primary">Contract Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-text-muted">Contract Type</p>
              <p className="mt-1 font-semibold">{contractType}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-text-muted">Party</p>
              <p className="mt-1 font-semibold">{partyName}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-text-muted">Duration</p>
              <p className="mt-1 font-semibold">
                {startDate && endDate
                  ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                  : 'Not set'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-text-muted">Value</p>
              <p className="mt-1 font-semibold">
                {currency} {value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-text-muted">Rate Tables</p>
              <p className="mt-1 font-semibold">{rateTables.length} tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-text-muted">Total Lanes</p>
              <p className="mt-1 font-semibold">{totalLanes} lanes</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-900">
                Contract is ready to submit
              </p>
              <p className="mt-1 text-sm text-green-700">
                Click "Create Contract" to finalize and submit for approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
