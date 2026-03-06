'use client';

/**
 * Dispatch Detail Drawer — Super-User Inline Experience
 *
 * Slide-out panel showing load details with tabs + inline edit + inline tracking.
 * Everything stays inside the drawer — no navigation away from the board.
 *
 * Views: tabs (default) | edit (inline quick-edit) | tracking (inline tracking + check calls)
 * Design reference: superdesign/design_iterations/dispatch_r4_playground.html
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Pencil,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Flame,
  AlertTriangle,
  Truck,
  User,
  Clock,
  FileText,
  Upload,
  Save,
  Gauge,
  PhoneCall,
  Loader2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DispatchLoad, KanbanLane, LoadStatus, EquipmentType } from '@/lib/types/dispatch';
import { STATUS_TO_LANE, VALID_FORWARD_TRANSITIONS } from '@/lib/types/dispatch';
import { useUpdateLoadStatus } from '@/lib/hooks/tms/use-dispatch';
import { useCheckCalls, useCreateCheckCall, type CreateCheckCallData } from '@/lib/hooks/tms/use-checkcalls';
import { apiClient } from '@/lib/api-client';

// ── Status config for badge colors ──────────────────────────────────
const STATUS_COLORS: Record<KanbanLane, { bg: string; text: string; label: string }> = {
  UNASSIGNED: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Unassigned' },
  TENDERED: { bg: 'bg-violet-100', text: 'text-violet-800', label: 'Tendered' },
  DISPATCHED: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Dispatched' },
  IN_TRANSIT: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Transit' },
  DELIVERED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Delivered' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Completed' },
};

const NEXT_STATUS_LABEL: Partial<Record<LoadStatus, string>> = {
  PLANNING: 'Move to Pending',
  PENDING: 'Tender to Carrier',
  TENDERED: 'Mark Accepted',
  ACCEPTED: 'Dispatch',
  ASSIGNED: 'Dispatch',
  DISPATCHED: 'Arrived at Pickup',
  AT_PICKUP: 'Mark Picked Up',
  PICKED_UP: 'Mark In Transit',
  IN_TRANSIT: 'Arrived at Delivery',
  AT_DELIVERY: 'Mark Delivered',
  DELIVERED: 'Complete Load',
};

type DrawerTab = 'overview' | 'carrier' | 'timeline' | 'finance' | 'documents';
type DrawerView = 'tabs' | 'edit' | 'tracking';

// ── Helpers ──────────────────────────────────────────────────────────
function getStop(load: DispatchLoad, type: 'PICKUP' | 'DELIVERY') {
  return load.stops.find((s) => s.type === type);
}

function formatEquipment(eq: string) {
  const map: Record<string, string> = {
    DRY_VAN: 'Dry Van',
    REEFER: 'Reefer',
    FLATBED: 'Flatbed',
    STEP_DECK: 'Step Deck',
    OTHER: 'Other',
  };
  return map[eq] ?? eq;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function formatDateTime(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Props ────────────────────────────────────────────────────────────
interface DispatchDetailDrawerProps {
  load: DispatchLoad | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (loadId: number, newStatus: LoadStatus) => void;
}

export function DispatchDetailDrawer({
  load,
  open,
  onClose,
  onStatusChange,
}: DispatchDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [view, setView] = useState<DrawerView>('tabs');
  const updateStatus = useUpdateLoadStatus();

  // Reset view when load changes or drawer closes
  const handleClose = useCallback(() => {
    setView('tabs');
    onClose();
  }, [onClose]);

  if (!load) return null;

  const loadIdStr = String(load.id);
  const lane = STATUS_TO_LANE[load.status];
  const statusCfg = STATUS_COLORS[lane];
  const origin = getStop(load, 'PICKUP');
  const dest = getStop(load, 'DELIVERY');

  const nextStatuses = VALID_FORWARD_TRANSITIONS[load.status];
  const nextStatus = nextStatuses?.[0];
  const nextLabel = NEXT_STATUS_LABEL[load.status];

  const hasMissingDocs = (() => {
    const bolDone = ['DELIVERED', 'IN_TRANSIT', 'DISPATCHED', 'AT_PICKUP', 'PICKED_UP', 'AT_DELIVERY'].includes(load.status);
    const rateDone = !['PLANNING', 'PENDING'].includes(load.status);
    const podDone = load.status === 'DELIVERED' || load.status === 'COMPLETED';
    return !(bolDone && rateDone && podDone);
  })();

  const tabs: { key: DrawerTab; label: string; badge?: 'warning' | 'danger' }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'carrier', label: 'Carrier', badge: !load.carrier ? 'warning' : undefined },
    { key: 'timeline', label: 'Timeline' },
    { key: 'finance', label: 'Finance' },
    { key: 'documents', label: 'Documents', badge: hasMissingDocs ? 'danger' : undefined },
  ];

  function handleAdvanceStatus() {
    if (!nextStatus || !load) return;
    const currentLoadId = load.id;
    const targetStatus = nextStatus;
    updateStatus.mutate(
      { loadId: currentLoadId, newStatus: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${targetStatus.replace(/_/g, ' ')}`);
          onStatusChange?.(currentLoadId, targetStatus);
        },
        onError: (err) => {
          toast.error('Failed to update status', {
            description: err instanceof Error ? err.message : 'Unknown error',
          });
        },
      }
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/25 z-50 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 w-[600px] bg-white z-[51] flex flex-col shadow-xl transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            {/* Back button when in sub-view */}
            {view !== 'tabs' && (
              <button
                onClick={() => setView('tabs')}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mr-1"
                title="Back to overview"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-md font-bold">{load.loadNumber}</span>
                <span
                  className={cn(
                    'inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full',
                    statusCfg.bg,
                    statusCfg.text
                  )}
                >
                  {statusCfg.label}
                </span>
                {load.isHotLoad && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                    <Flame className="h-3 w-3" />
                    HOT
                  </span>
                )}
                {load.hasExceptions && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    <AlertTriangle className="h-3 w-3" />
                  </span>
                )}
                {load.priority && load.priority !== 'MEDIUM' && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                      load.priority === 'URGENT' && 'bg-red-100 text-red-700',
                      load.priority === 'HIGH' && 'bg-orange-100 text-orange-700',
                      load.priority === 'LOW' && 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {load.priority}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {view === 'edit' && 'Editing load · '}
                {view === 'tracking' && 'Tracking · '}
                {load.customer.name}
                {origin && dest && (
                  <span className="ml-1.5">
                    · {origin.city}, {origin.state} → {dest.city}, {dest.state}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons — only in tabs view */}
            {view === 'tabs' && (
              <div className="flex gap-1.5 shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setView('edit')}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {nextStatus && nextLabel && (
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAdvanceStatus}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? (
                      <span className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-r-transparent inline-block" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    )}
                    {nextLabel}
                  </Button>
                )}
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Tabs bar (only in tabs view) ───────────────────────── */}
        {view === 'tabs' && (
          <div className="flex px-5 border-b shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative py-2.5 px-3.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.key
                    ? 'text-slate-700 font-semibold border-slate-700'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {tab.label}
                {tab.badge && (
                  <span
                    className={cn(
                      'absolute top-1.5 -right-0.5 w-1.5 h-1.5 rounded-full',
                      tab.badge === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {view === 'tabs' && (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  load={load}
                  origin={origin}
                  dest={dest}
                  onEditLoad={() => setView('edit')}
                  onTrackLoad={() => setView('tracking')}
                />
              )}
              {activeTab === 'carrier' && <CarrierTab load={load} />}
              {activeTab === 'timeline' && <TimelineTab load={load} />}
              {activeTab === 'finance' && <FinanceTab load={load} />}
              {activeTab === 'documents' && <DocumentsTab load={load} loadIdStr={loadIdStr} />}
            </>
          )}

          {view === 'edit' && (
            <InlineEditView
              load={load}
              loadIdStr={loadIdStr}
              onSaved={() => {
                setView('tabs');
                onStatusChange?.(load.id, load.status); // triggers board refetch
              }}
              onCancel={() => setView('tabs')}
            />
          )}

          {view === 'tracking' && (
            <InlineTrackingView load={load} loadIdStr={loadIdStr} />
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t shrink-0 flex items-center justify-between">
          <a
            href={`/operations/loads/${loadIdStr}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open Full Page
          </a>
          <div className="text-[10px] text-muted-foreground">
            Updated {timeAgo(load.updatedAt)}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
      {children}
    </div>
  );
}

function FieldRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn('text-[11px] font-medium text-foreground', valueClass)}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// INLINE EDIT VIEW
// ═══════════════════════════════════════════════════════════════════════

function InlineEditView({
  load,
  loadIdStr,
  onSaved,
  onCancel,
}: {
  load: DispatchLoad;
  loadIdStr: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);

  // Only fields accepted by UpdateLoadDto (PUT /loads/:id)
  const [equipmentType, setEquipmentType] = useState(load.equipmentType);
  const [carrierRate, setCarrierRate] = useState(load.carrierRate?.toString() ?? '');
  const [fuelAdvance, setFuelAdvance] = useState('');
  const [accessorialCosts, setAccessorialCosts] = useState('');
  const [driverName, setDriverName] = useState(load.driver ? `${load.driver.firstName} ${load.driver.lastName}` : '');
  const [driverPhone, setDriverPhone] = useState(load.driver?.phone ?? '');
  const [truckNumber, setTruckNumber] = useState('');
  const [trailerNumber, setTrailerNumber] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  async function handleSave() {
    setSaving(true);
    try {
      // Only send fields the backend DTO accepts — no weight, commodity, specialInstructions, orderId
      const payload: Record<string, unknown> = {};

      if (equipmentType !== load.equipmentType) payload.equipmentType = equipmentType;
      if (carrierRate) payload.carrierRate = parseFloat(carrierRate);
      if (fuelAdvance) payload.fuelAdvance = parseFloat(fuelAdvance);
      if (accessorialCosts) payload.accessorialCosts = parseFloat(accessorialCosts);
      if (driverName) payload.driverName = driverName;
      if (driverPhone) payload.driverPhone = driverPhone;
      if (truckNumber) payload.truckNumber = truckNumber;
      if (trailerNumber) payload.trailerNumber = trailerNumber;
      if (dispatchNotes) payload.dispatchNotes = dispatchNotes;

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        onCancel();
        return;
      }

      await apiClient.put(`/loads/${loadIdStr}`, payload);
      toast.success('Load updated');
      onSaved();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      const apiMsg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const description = Array.isArray(apiMsg) ? apiMsg.join(', ') : apiMsg ?? errMsg;
      toast.error('Failed to update load', { description });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        <Pencil className="h-3.5 w-3.5" />
        Quick Edit — {load.loadNumber}
      </div>

      {/* Equipment */}
      <div className="space-y-1.5">
        <Label className="text-[11px]">Equipment Type</Label>
        <Select value={equipmentType} onValueChange={(v) => setEquipmentType(v as EquipmentType)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRY_VAN">Dry Van</SelectItem>
            <SelectItem value="REEFER">Reefer</SelectItem>
            <SelectItem value="FLATBED">Flatbed</SelectItem>
            <SelectItem value="STEP_DECK">Step Deck</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rates */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px]">Carrier Rate ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={carrierRate}
            onChange={(e) => setCarrierRate(e.target.value)}
            className="h-8 text-xs"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">Fuel Advance ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={fuelAdvance}
            onChange={(e) => setFuelAdvance(e.target.value)}
            className="h-8 text-xs"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">Accessorials ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={accessorialCosts}
            onChange={(e) => setAccessorialCosts(e.target.value)}
            className="h-8 text-xs"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Driver */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px]">Driver Name</Label>
          <Input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="h-8 text-xs"
            placeholder="John Smith"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">Driver Phone</Label>
          <Input
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            className="h-8 text-xs"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Truck / Trailer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px]">Truck #</Label>
          <Input
            value={truckNumber}
            onChange={(e) => setTruckNumber(e.target.value)}
            className="h-8 text-xs"
            placeholder="T-1234"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">Trailer #</Label>
          <Input
            value={trailerNumber}
            onChange={(e) => setTrailerNumber(e.target.value)}
            className="h-8 text-xs"
            placeholder="TR-5678"
          />
        </div>
      </div>

      {/* Dispatch Notes */}
      <div className="space-y-1.5">
        <Label className="text-[11px]">Dispatch Notes</Label>
        <Textarea
          value={dispatchNotes}
          onChange={(e) => setDispatchNotes(e.target.value)}
          className="text-xs min-h-[60px]"
          placeholder="Internal notes for dispatchers..."
          rows={3}
        />
      </div>

      {/* Current info (read-only) */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Load Info (read-only)
        </div>
        <FieldRow label="Customer" value={load.customer.name} />
        <FieldRow label="Status" value={load.status.replace(/_/g, ' ')} />
        <FieldRow label="Customer Rate" value={load.customerRate ? `$${load.customerRate.toLocaleString()}` : '—'} />
        {load.carrier && <FieldRow label="Carrier" value={load.carrier.name} />}
        {load.commodity && <FieldRow label="Commodity" value={load.commodity} />}
        {load.weight && <FieldRow label="Weight" value={`${load.weight.toLocaleString()} lbs`} />}
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1 h-9 text-xs">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving} className="h-9 text-xs">
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// INLINE TRACKING VIEW
// ═══════════════════════════════════════════════════════════════════════

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

function InlineTrackingView({
  load,
  loadIdStr,
}: {
  load: DispatchLoad;
  loadIdStr: string;
}) {
  const origin = getStop(load, 'PICKUP');
  const dest = getStop(load, 'DELIVERY');
  const isActive = ['DISPATCHED', 'IN_TRANSIT', 'AT_PICKUP', 'PICKED_UP', 'AT_DELIVERY'].includes(load.status);
  const eta = isActive ? new Date(Date.now() + 14 * 60 * 60 * 1000) : null;

  // Check call form state
  const [showCheckCallForm, setShowCheckCallForm] = useState(false);
  const [ccType, setCcType] = useState<CreateCheckCallData['type']>('CHECK_CALL');
  const [ccCity, setCcCity] = useState('');
  const [ccState, setCcState] = useState('');
  const [ccNotes, setCcNotes] = useState('');
  const createCheckCall = useCreateCheckCall();

  // Check call history
  const { data: checkCalls, isLoading: ccLoading } = useCheckCalls(loadIdStr);

  async function handleSubmitCheckCall(e: React.FormEvent) {
    e.preventDefault();
    if (!ccCity || !ccState) {
      toast.error('City and State are required');
      return;
    }
    try {
      await createCheckCall.mutateAsync({
        loadId: loadIdStr,
        type: ccType,
        city: ccCity,
        state: ccState,
        notes: ccNotes || undefined,
        gpsSource: 'MANUAL',
      });
      setCcCity('');
      setCcState('');
      setCcNotes('');
      setShowCheckCallForm(false);
    } catch {
      // error handled by hook
    }
  }

  function handleContactDriver() {
    if (load.driver?.phone) {
      window.location.href = `tel:${load.driver.phone}`;
    } else {
      toast.info('No driver phone on file');
    }
  }

  async function handleShareTracking() {
    const url = `${window.location.origin}/operations/loads/${loadIdStr}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Tracking link copied');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }

  return (
    <div className="space-y-4">
      {/* Map placeholder */}
      <div className="bg-muted rounded-lg border h-[160px] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-muted-foreground text-xs">
          Map Placeholder
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 20 80 Q 50 20 80 50" stroke="blue" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        </svg>
        <div className="absolute top-[45%] left-[60%] w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm z-10 animate-pulse" />
      </div>

      {/* Location + Speed */}
      <div className="flex items-start gap-3">
        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-medium">
            {origin ? `${origin.city}, ${origin.state}` : '—'}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Updated {load.lastCheckCallAt ? timeAgo(load.lastCheckCallAt) : 'Just now'}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Gauge className="h-3 w-3" /> Speed
          </div>
          <div className="text-xs font-semibold">62 mph</div>
        </div>
      </div>

      {/* ETA */}
      <div className="bg-gray-50 rounded-lg border p-3">
        <div className="text-[10px] text-muted-foreground mb-1">Estimated Arrival</div>
        {eta ? (
          <>
            <div className="text-lg font-bold">
              {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs font-medium text-blue-600">14h 22m remaining</div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground italic">
            Tracking starts when dispatched
          </div>
        )}
        <div className="text-[10px] text-muted-foreground mt-1">
          Next Stop: <span className="font-medium text-foreground">
            {dest ? `${dest.city}, ${dest.state}` : '—'}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowCheckCallForm((p) => !p)}
          className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border border-gray-200 bg-gray-50/50 hover:border-slate-700 hover:bg-slate-50 transition-colors group"
        >
          <PhoneCall className="h-4 w-4 text-muted-foreground group-hover:text-slate-700" />
          <span className="text-[9px] font-medium text-muted-foreground group-hover:text-slate-700">
            Check Call
          </span>
        </button>
        <button
          onClick={handleContactDriver}
          className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border border-gray-200 bg-gray-50/50 hover:border-slate-700 hover:bg-slate-50 transition-colors group"
        >
          <Phone className="h-4 w-4 text-muted-foreground group-hover:text-slate-700" />
          <span className="text-[9px] font-medium text-muted-foreground group-hover:text-slate-700">
            Call Driver
          </span>
        </button>
        <button
          onClick={handleShareTracking}
          className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border border-gray-200 bg-gray-50/50 hover:border-slate-700 hover:bg-slate-50 transition-colors group"
        >
          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-slate-700" />
          <span className="text-[9px] font-medium text-muted-foreground group-hover:text-slate-700">
            Share Link
          </span>
        </button>
      </div>

      {/* Driver Card */}
      {load.driver && (
        <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <User className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold">
              {load.driver.firstName} {load.driver.lastName}
            </div>
            {load.driver.phone && (
              <div className="text-[10px] text-muted-foreground">{load.driver.phone}</div>
            )}
          </div>
          {load.driver.phone && (
            <a
              href={`tel:${load.driver.phone}`}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Phone className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Inline Check Call Form */}
      {showCheckCallForm && (
        <form onSubmit={handleSubmitCheckCall} className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <PhoneCall className="h-3.5 w-3.5" />
            Add Check Call
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Type</Label>
              <Select value={ccType} onValueChange={(v) => setCcType(v as CreateCheckCallData['type'])}>
                <SelectTrigger className="h-7 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHECK_CALL">Check Call</SelectItem>
                  <SelectItem value="ARRIVAL">Arrival</SelectItem>
                  <SelectItem value="DEPARTURE">Departure</SelectItem>
                  <SelectItem value="DELAY">Delay</SelectItem>
                  <SelectItem value="ISSUE">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">City *</Label>
              <Input
                value={ccCity}
                onChange={(e) => setCcCity(e.target.value)}
                className="h-7 text-[11px]"
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">State *</Label>
              <Select value={ccState} onValueChange={setCcState}>
                <SelectTrigger className="h-7 text-[11px]">
                  <SelectValue placeholder="ST" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px]">Notes</Label>
            <Textarea
              value={ccNotes}
              onChange={(e) => setCcNotes(e.target.value)}
              className="text-[11px] min-h-[40px]"
              placeholder="Status update, ETA changes..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" className="h-7 text-xs flex-1" disabled={createCheckCall.isPending}>
              {createCheckCall.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowCheckCallForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Check Call History */}
      <div>
        <SectionLabel>Recent Check Calls</SectionLabel>
        {ccLoading && (
          <div className="text-xs text-muted-foreground italic py-2">Loading...</div>
        )}
        {!ccLoading && (!checkCalls || checkCalls.length === 0) && (
          <div className="text-xs text-muted-foreground italic py-2">
            No check calls recorded yet.
          </div>
        )}
        {checkCalls && checkCalls.length > 0 && (
          <div className="relative pl-4 space-y-0">
            <div className="absolute left-[3px] top-1 bottom-1 w-0.5 bg-gray-200" />
            {checkCalls.slice(0, 8).map((cc) => (
              <div key={cc.id} className="relative pb-3 pl-3">
                <div
                  className={cn(
                    'absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-white',
                    cc.type === 'ISSUE' || cc.type === 'DELAY'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  )}
                />
                <div className="text-[10px] text-muted-foreground">
                  {formatDateTime(cc.calledAt)} · {cc.type.replace(/_/g, ' ')}
                </div>
                <div className="text-[11px] font-medium">
                  {cc.city}, {cc.state}
                </div>
                {cc.notes && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">{cc.notes}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════════════════

function OverviewTab({
  load,
  origin,
  dest,
  onEditLoad,
  onTrackLoad,
}: {
  load: DispatchLoad;
  origin: ReturnType<typeof getStop>;
  dest: ReturnType<typeof getStop>;
  onEditLoad: () => void;
  onTrackLoad: () => void;
}) {
  const driverPhone = load.driver?.phone;

  const quickActions: {
    icon: typeof Phone;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
  }[] = [
    {
      icon: Phone,
      label: 'Call',
      onClick: driverPhone ? () => window.open(`tel:${driverPhone}`, '_self') : undefined,
      disabled: !driverPhone,
      title: driverPhone ? `Call ${driverPhone}` : 'No driver phone available',
    },
    {
      icon: Mail,
      label: 'Email',
      onClick: () =>
        window.open(
          `mailto:?subject=Load ${load.loadNumber}&body=Load ${load.loadNumber} - ${load.customer.name}`,
          '_self'
        ),
      title: 'Compose email about this load',
    },
    {
      icon: MessageSquare,
      label: 'Message',
      onClick: () => toast.info('Messaging not yet available', { description: 'Coming soon' }),
      title: 'Send a message',
    },
    {
      icon: Pencil,
      label: 'Edit',
      onClick: onEditLoad,
      title: 'Edit this load inline',
    },
    {
      icon: MapPin,
      label: 'Track',
      onClick: onTrackLoad,
      title: 'View live tracking',
    },
  ];

  const miles = load.distance ?? 0;
  const driveH = miles > 0 ? Math.round(miles / 55) : 0;
  const rpm = miles > 0 && load.customerRate ? (load.customerRate / miles).toFixed(2) : '0.00';

  return (
    <>
      {/* Quick Actions */}
      <SectionLabel>Quick Actions</SectionLabel>
      <div className="flex gap-2 mb-4">
        {quickActions.map(({ icon: Icon, label, onClick, disabled, title }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border transition-colors group',
              disabled
                ? 'border-gray-100 bg-gray-50/30 cursor-not-allowed opacity-50'
                : 'border-gray-200 bg-gray-50/50 hover:border-slate-700 hover:bg-slate-50 cursor-pointer'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                disabled ? 'text-gray-300' : 'text-muted-foreground group-hover:text-slate-700'
              )}
            />
            <span
              className={cn(
                'text-[9px] font-medium',
                disabled ? 'text-gray-300' : 'text-muted-foreground group-hover:text-slate-700'
              )}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Route Card */}
      <SectionLabel>Route</SectionLabel>
      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">
              {origin ? `${origin.city}, ${origin.state}` : '—'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {origin?.appointmentDate ? formatDate(origin.appointmentDate) : '—'}
              {origin && (
                <span
                  className={cn(
                    'ml-1.5 text-[10px] font-medium px-1 py-0.5 rounded',
                    origin.status === 'COMPLETED' && 'bg-emerald-100 text-emerald-700',
                    origin.status === 'ARRIVED' && 'bg-blue-100 text-blue-700',
                    origin.status === 'DEPARTED' && 'bg-cyan-100 text-cyan-700',
                    origin.status === 'PENDING' && 'bg-gray-100 text-gray-600'
                  )}
                >
                  {origin.status}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="w-0.5 h-5 bg-gray-200 ml-1" />
        <div className="flex items-start gap-3">
          <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">
              {dest ? `${dest.city}, ${dest.state}` : '—'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {dest?.appointmentDate ? formatDate(dest.appointmentDate) : '—'}
              {dest && (
                <span
                  className={cn(
                    'ml-1.5 text-[10px] font-medium px-1 py-0.5 rounded',
                    dest.status === 'COMPLETED' && 'bg-emerald-100 text-emerald-700',
                    dest.status === 'ARRIVED' && 'bg-blue-100 text-blue-700',
                    dest.status === 'DEPARTED' && 'bg-cyan-100 text-cyan-700',
                    dest.status === 'PENDING' && 'bg-gray-100 text-gray-600'
                  )}
                >
                  {dest.status}
                </span>
              )}
            </div>
          </div>
        </div>
        {miles > 0 && (
          <div className="text-[11px] text-muted-foreground mt-2 ml-5.5">
            {miles.toLocaleString()} miles · ~{driveH}h drive · ${rpm}/mi
          </div>
        )}
      </div>

      {/* Equipment */}
      <SectionLabel>Equipment</SectionLabel>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Type</div>
          <div className="text-[13px] font-semibold">{formatEquipment(load.equipmentType)}</div>
        </div>
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Temp Control</div>
          <div className="text-[13px] font-semibold">
            {load.equipmentType === 'REEFER' ? 'Required' : 'N/A'}
          </div>
        </div>
      </div>

      {/* Freight Details */}
      {(load.commodity || load.specialInstructions) && (
        <>
          <SectionLabel>Freight Details</SectionLabel>
          {load.commodity && <FieldRow label="Commodity" value={load.commodity} />}
          {load.specialInstructions && (
            <div className="mb-4">
              <FieldRow label="Special Instructions" value="" />
              <div className="text-[11px] text-foreground bg-amber-50 border border-amber-200 rounded-md p-2 mt-1">
                {load.specialInstructions}
              </div>
            </div>
          )}
          {!load.specialInstructions && <div className="mb-4" />}
        </>
      )}

      {/* Customer */}
      <SectionLabel>Customer</SectionLabel>
      <FieldRow label="Company" value={load.customer.name} />
      <FieldRow label="Reference" value={load.referenceNumbers?.[0] ?? '—'} />
      <FieldRow label="Weight" value={load.weight ? `${load.weight.toLocaleString()} lbs` : '—'} />

      {/* Driver */}
      {load.driver && (
        <div className="mt-4">
          <SectionLabel>Driver</SectionLabel>
          <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold">
                {load.driver.firstName} {load.driver.lastName}
              </div>
              {load.driver.phone && (
                <a href={`tel:${load.driver.phone}`} className="text-[11px] text-blue-600 hover:underline">
                  {load.driver.phone}
                </a>
              )}
            </div>
            {load.driver.phone && (
              <a
                href={`tel:${load.driver.phone}`}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                title={`Call ${load.driver.firstName}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Last Check Call */}
      {load.lastCheckCallAt && (
        <div className="mt-4">
          <SectionLabel>Last Check Call</SectionLabel>
          <div className="flex items-center gap-2 text-[11px]">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{formatDateTime(load.lastCheckCallAt)}</span>
            <span className="text-muted-foreground">({timeAgo(load.lastCheckCallAt)})</span>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: CARRIER
// ═══════════════════════════════════════════════════════════════════════

function CarrierTab({ load }: { load: DispatchLoad }) {
  if (!load.carrier) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <Truck className="h-7 w-7 text-gray-400" />
        </div>
        <div className="text-[13px] font-medium mb-1">No carrier assigned</div>
        <div className="text-[11px] mb-4">Assign a carrier to tender and dispatch this load.</div>
        <Button size="sm">Find Carrier</Button>
        <Button variant="outline" size="sm" className="mt-2 block mx-auto">
          Post to Load Board
        </Button>
      </div>
    );
  }

  return (
    <>
      <SectionLabel>Carrier Information</SectionLabel>
      <div className="p-3 border border-gray-200 rounded-lg mb-3">
        <div className="text-[15px] font-semibold mb-1">{load.carrier.name}</div>
        <div className="text-xs text-muted-foreground mb-2.5">
          {load.carrier.mcNumber ? `MC-${load.carrier.mcNumber}` : 'MC —'}
        </div>
        <FieldRow label="Safety" value="Satisfactory" />
        <FieldRow label="Insurance" value="Active" valueClass="text-emerald-600" />
      </div>

      {load.driver && (
        <>
          <SectionLabel>Driver</SectionLabel>
          <div className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold">
                {load.driver.firstName} {load.driver.lastName}
              </div>
              {load.driver.phone && (
                <div className="text-[11px] text-muted-foreground">{load.driver.phone}</div>
              )}
            </div>
            {load.driver.phone && (
              <a
                href={`tel:${load.driver.phone}`}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                title={`Call ${load.driver.firstName}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </>
      )}

      <SectionLabel>Contact</SectionLabel>
      {load.driver?.phone ? (
        <FieldRow label="Driver Phone" value={load.driver.phone} />
      ) : (
        <FieldRow label="Phone" value="—" />
      )}

      <Button variant="outline" size="sm" className="w-full mt-4 justify-center">
        Change Carrier
      </Button>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: TIMELINE
// ═══════════════════════════════════════════════════════════════════════

function TimelineTab({ load }: { load: DispatchLoad }) {
  const events = getTimelineEvents(load);

  return (
    <>
      <SectionLabel>Load Timeline</SectionLabel>
      <div className="relative pl-5">
        <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-gray-200" />
        {events.map((evt, i) => (
          <div key={i} className="relative pb-4 pl-4 last:pb-0">
            <div
              className={cn(
                'absolute -left-5 top-0.5 w-3 h-3 rounded-full border-2 border-white',
                evt.state === 'completed' && 'bg-emerald-500',
                evt.state === 'current' && 'bg-slate-700 animate-pulse',
                evt.state === 'pending' && 'bg-gray-300 border-dashed'
              )}
            />
            <div className="text-[10px] text-muted-foreground">{evt.time}</div>
            <div
              className={cn(
                'text-xs font-medium',
                evt.state === 'pending' ? 'text-muted-foreground italic' : 'text-foreground'
              )}
            >
              {evt.desc}
              {evt.label && (
                <span className="ml-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-white">
                  {evt.label}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <SectionLabel>Status History</SectionLabel>
        <FieldRow label="Created" value={formatDateTime(load.createdAt)} />
        {load.tenderedAt && <FieldRow label="Tendered" value={formatDateTime(load.tenderedAt)} />}
        <FieldRow label="Last Updated" value={formatDateTime(load.updatedAt)} />
        <FieldRow label="Status Changed" value={formatDateTime(load.statusChangedAt)} />
        {load.lastCheckCallAt && <FieldRow label="Last Check Call" value={formatDateTime(load.lastCheckCallAt)} />}
      </div>
    </>
  );
}

function getTimelineEvents(load: DispatchLoad) {
  const origin = getStop(load, 'PICKUP');
  const dest = getStop(load, 'DELIVERY');
  const pickupStr = origin?.appointmentDate ? formatDate(origin.appointmentDate) : 'TBD';
  const deliveryStr = dest?.appointmentDate ? formatDate(dest.appointmentDate) : 'TBD';
  const evts: { state: 'completed' | 'current' | 'pending'; time: string; desc: string; label?: string }[] = [];

  evts.push({ state: 'completed', time: formatDateTime(load.createdAt), desc: 'Load created' });

  if (['PLANNING', 'PENDING'].includes(load.status)) {
    evts.push({
      state: 'current',
      time: 'Now',
      desc: load.status === 'PLANNING' ? 'Planning in progress' : 'Awaiting carrier assignment',
      label: 'Current',
    });
    evts.push({ state: 'pending', time: 'Awaiting', desc: 'Dispatch' });
    evts.push({ state: 'pending', time: pickupStr, desc: 'Pickup' });
    evts.push({ state: 'pending', time: deliveryStr, desc: 'Delivery' });
    return evts;
  }

  evts.push({
    state: 'completed',
    time: load.tenderedAt ? formatDateTime(load.tenderedAt) : 'Tendered',
    desc: `Tendered to ${load.carrier?.name ?? 'carrier'}`,
  });

  if (load.status === 'TENDERED') {
    evts.push({ state: 'current', time: 'Pending', desc: 'Awaiting tender acceptance', label: 'Current' });
    evts.push({ state: 'pending', time: pickupStr, desc: 'Pickup' });
    evts.push({ state: 'pending', time: deliveryStr, desc: 'Delivery' });
    return evts;
  }

  evts.push({ state: 'completed', time: 'Dispatched', desc: 'Dispatched' });

  if (['ACCEPTED', 'ASSIGNED', 'DISPATCHED'].includes(load.status)) {
    evts.push({ state: 'current', time: 'Now', desc: 'En route to pickup', label: 'Current' });
    evts.push({ state: 'pending', time: pickupStr, desc: 'Pickup' });
    evts.push({ state: 'pending', time: deliveryStr, desc: 'Delivery' });
    return evts;
  }

  evts.push({ state: 'completed', time: pickupStr, desc: 'Picked up at origin' });

  if (['AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'AT_DELIVERY'].includes(load.status)) {
    const desc =
      load.status === 'AT_PICKUP'
        ? 'At pickup location'
        : load.status === 'AT_DELIVERY'
          ? 'Arrived at delivery'
          : 'In transit to destination';
    evts.push({ state: 'current', time: 'Now', desc, label: 'Current' });
    evts.push({ state: 'pending', time: deliveryStr, desc: 'Delivery' });
    evts.push({ state: 'pending', time: 'Awaiting', desc: 'POD upload' });
    return evts;
  }

  evts.push({ state: 'completed', time: deliveryStr, desc: 'Delivered at destination' });
  evts.push({ state: 'completed', time: 'Uploaded', desc: 'POD uploaded' });
  evts.push({ state: 'completed', time: 'Generated', desc: 'Invoice generated' });
  return evts;
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: FINANCE
// ═══════════════════════════════════════════════════════════════════════

function FinanceTab({ load }: { load: DispatchLoad }) {
  const rate = load.customerRate ?? 0;
  const lineHaul = Math.round(rate * 0.85);
  const fuel = Math.round(rate * 0.10);
  const access = rate - lineHaul - fuel;
  const carrierCost = load.carrierRate ?? Math.round(rate * 0.83);
  const margin = rate - carrierCost;
  const marginPct = rate > 0 ? ((margin / rate) * 100).toFixed(1) : '0.0';
  const pctNum = parseFloat(marginPct);
  const miles = load.distance ?? 0;
  const rpm = miles > 0 && rate > 0 ? (rate / miles).toFixed(2) : null;
  const cpm = miles > 0 && carrierCost > 0 ? (carrierCost / miles).toFixed(2) : null;

  return (
    <>
      <SectionLabel>Revenue</SectionLabel>
      <FieldRow label="Line Haul" value={`$${lineHaul.toLocaleString()}`} />
      <FieldRow label="Fuel Surcharge" value={`$${fuel.toLocaleString()}`} />
      <FieldRow label="Accessorials" value={`$${access.toLocaleString()}`} />
      <div className="flex justify-between py-1.5 border-t border-gray-300 mt-1 font-semibold">
        <span className="text-[11px] text-muted-foreground">Total Revenue</span>
        <span className="text-[11px] font-semibold">${rate.toLocaleString()}</span>
      </div>

      <div className="mt-4">
        <SectionLabel>Cost</SectionLabel>
        <FieldRow label="Carrier Pay" value={`$${carrierCost.toLocaleString()}`} />
        <FieldRow label="Fuel Advance" value={`$${Math.round(carrierCost * 0.03).toLocaleString()}`} />
      </div>

      <div
        className={cn(
          'p-3.5 rounded-lg text-center my-3',
          pctNum >= 16 ? 'bg-emerald-50' : pctNum >= 10 ? 'bg-blue-50' : 'bg-red-50'
        )}
      >
        <div
          className={cn(
            'text-2xl font-bold',
            pctNum >= 16 ? 'text-emerald-600' : pctNum >= 10 ? 'text-blue-600' : 'text-red-600'
          )}
        >
          {marginPct}%
        </div>
        <div className="text-xs font-medium text-muted-foreground mt-0.5">
          ${margin.toLocaleString()} margin
        </div>
        {pctNum < 15 && pctNum > 0 && (
          <div className="text-[10px] text-amber-600 mt-1 font-medium">Below 15% margin threshold</div>
        )}
      </div>

      {(rpm || cpm) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {rpm && (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-center">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Rev/Mile</div>
              <div className="text-[13px] font-semibold">${rpm}</div>
            </div>
          )}
          {cpm && (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-center">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Cost/Mile</div>
              <div className="text-[13px] font-semibold">${cpm}</div>
            </div>
          )}
        </div>
      )}

      <SectionLabel>Payment Status</SectionLabel>
      <FieldRow
        label="Invoice"
        value={['DELIVERED', 'COMPLETED'].includes(load.status) ? 'Invoiced' : 'Pending'}
        valueClass={['DELIVERED', 'COMPLETED'].includes(load.status) ? 'text-emerald-600' : undefined}
      />
      <FieldRow
        label="Carrier Payment"
        value={['DELIVERED', 'COMPLETED'].includes(load.status) ? 'Paid' : 'Pending'}
        valueClass={['DELIVERED', 'COMPLETED'].includes(load.status) ? 'text-emerald-600' : undefined}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════

function DocumentsTab({ load, loadIdStr }: { load: DispatchLoad; loadIdStr: string }) {
  const docs = [
    { name: 'Rate Confirmation', complete: !['PLANNING', 'PENDING'].includes(load.status) },
    { name: 'Bill of Lading (BOL)', complete: ['DELIVERED', 'COMPLETED', 'IN_TRANSIT', 'DISPATCHED', 'AT_PICKUP', 'PICKED_UP', 'AT_DELIVERY'].includes(load.status) },
    { name: 'Proof of Delivery (POD)', complete: ['DELIVERED', 'COMPLETED'].includes(load.status) },
    { name: 'Insurance Certificate', complete: !!load.carrier },
  ];

  const doneCount = docs.filter((d) => d.complete).length;
  const pct = Math.round((doneCount / docs.length) * 100);

  return (
    <>
      <SectionLabel>Documents</SectionLabel>
      {docs.map((doc) => (
        <div key={doc.name} className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 last:border-b-0">
          <div
            className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
              doc.complete ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-muted-foreground'
            )}
          >
            {doc.complete ? (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium">{doc.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {doc.complete ? 'Uploaded' : 'Pending'}
            </div>
          </div>
        </div>
      ))}

      <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-3">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-slate-700' : 'bg-red-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[11px] text-muted-foreground mt-1 mb-4">
        {doneCount} of {docs.length} documents ({pct}%)
      </div>

      <Button variant="outline" size="sm" className="w-full justify-center">
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload Document
      </Button>

      {!['PLANNING', 'PENDING'].includes(load.status) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center mt-2 text-xs"
          onClick={() => {
            window.open(`/operations/loads/${loadIdStr}/rate-con`, '_blank');
          }}
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          View Rate Confirmation
        </Button>
      )}
    </>
  );
}
