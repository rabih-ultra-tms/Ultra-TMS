'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  useLoadPlannerQuote,
  useCreateLoadPlannerQuote,
  useUpdateLoadPlannerQuote,
  useEquipmentMakes,
  useEquipmentModels,
  useEquipmentDimensions,
  useInlandServiceTypes,
} from '@/lib/hooks/operations';
import type { InlandServiceType } from '@/lib/hooks/operations/use-inland-service-types';
import type { LoadPlannerQuote, CargoItem, LoadPlannerTruck } from '@/types/load-planner-quotes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, Trash2, User, MapPin, Package, Truck, DollarSign, FileWarning, FileText, Upload, Plus, Copy, MessageSquare, ChevronDown, ChevronUp, Layers, Download, EyeOff, Image, AlertTriangle, GitCompareArrows } from 'lucide-react';
import { toast } from 'sonner';
import { CustomerForm } from '@/components/quotes/customer-form';
import { RouteMap } from '@/components/load-planner/route-map';
import { UniversalDropzone } from '@/components/load-planner/UniversalDropzone';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { TruckSelector } from '@/components/load-planner/TruckSelector';
import { TrailerDiagram } from '@/components/load-planner/TrailerDiagram';
import { ExtractedItemsList } from '@/components/load-planner/ExtractedItemsList';
import { RouteIntelligence } from '@/components/load-planner/RouteIntelligence';
import { RouteComparisonTab } from '@/components/load-planner/RouteComparisonTab';
import { PlanComparisonPanel, type SmartPlanOption } from '@/components/load-planner/PlanComparisonPanel';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { buildLoadPlan } from '@/lib/load-planner/load-plan';
import { trucks as defaultTrucks } from '@/lib/load-planner/trucks';
import { generateSmartPlans, type ParsedLoad } from '@/lib/load-planner/legacy-smart-plans';
import type { LoadItem, LoadPlan, TrailerCategory, TruckType, DetailedRoutePermitSummary } from '@/lib/load-planner/types';
import { downloadQuotePDF } from '@/lib/pdf/quote-pdf-generator';

interface StandardCargoType {
  id: string;
  name: string;
  description?: string;
  length: number;
  width: number;
  height: number;
  weight: number;
}

const STANDARD_CARGO_TYPES: StandardCargoType[] = [
  { id: 'std-20ft-container', name: '20ft Shipping Container', length: 20, width: 8, height: 8.5, weight: 5000 },
  { id: 'std-40ft-container', name: '40ft Shipping Container', length: 40, width: 8, height: 8.5, weight: 8500 },
  { id: 'std-40ft-hc-container', name: '40ft High Cube Container', length: 40, width: 8, height: 9.5, weight: 8750 },
  { id: 'std-45ft-container', name: '45ft Shipping Container', length: 45, width: 8, height: 9.5, weight: 10500 },
  { id: 'std-mini-excavator', name: 'Mini Excavator (1-3 ton)', length: 12, width: 5, height: 7, weight: 6000 },
  { id: 'std-small-excavator', name: 'Small Excavator (5-8 ton)', length: 18, width: 7, height: 8, weight: 16000 },
  { id: 'std-medium-excavator', name: 'Medium Excavator (15-20 ton)', length: 25, width: 9, height: 10, weight: 42000 },
  { id: 'std-large-excavator', name: 'Large Excavator (30-40 ton)', length: 32, width: 10.5, height: 11, weight: 75000 },
  { id: 'std-skid-steer', name: 'Skid Steer Loader', length: 10, width: 6, height: 6.5, weight: 7500 },
  { id: 'std-compact-loader', name: 'Compact Wheel Loader', length: 16, width: 7, height: 8, weight: 12000 },
  { id: 'std-wheel-loader', name: 'Wheel Loader (3-4 yd)', length: 24, width: 9, height: 10.5, weight: 35000 },
  { id: 'std-large-wheel-loader', name: 'Large Wheel Loader (5+ yd)', length: 30, width: 10, height: 11.5, weight: 55000 },
  { id: 'std-small-dozer', name: 'Small Dozer (D3-D4)', length: 14, width: 7.5, height: 8, weight: 18000 },
  { id: 'std-medium-dozer', name: 'Medium Dozer (D5-D6)', length: 18, width: 9, height: 9, weight: 35000 },
  { id: 'std-large-dozer', name: 'Large Dozer (D7-D8)', length: 22, width: 11, height: 10.5, weight: 65000 },
  { id: 'std-warehouse-forklift', name: 'Warehouse Forklift (5000 lb)', length: 8, width: 4, height: 7, weight: 9000 },
  { id: 'std-rough-terrain-forklift', name: 'Rough Terrain Forklift', length: 14, width: 7, height: 8, weight: 18000 },
  { id: 'std-telehandler', name: 'Telehandler', length: 20, width: 8, height: 8.5, weight: 24000 },
  { id: 'std-carry-deck-crane', name: 'Carry Deck Crane (8-15 ton)', length: 20, width: 8, height: 9, weight: 28000 },
  { id: 'std-rt-crane-small', name: 'RT Crane (30-50 ton)', length: 35, width: 10, height: 11, weight: 70000 },
  { id: 'std-tractor-small', name: 'Farm Tractor (50-100 HP)', length: 12, width: 6.5, height: 8, weight: 8000 },
  { id: 'std-tractor-large', name: 'Farm Tractor (150+ HP)', length: 18, width: 8, height: 10, weight: 20000 },
  { id: 'std-combine', name: 'Combine Harvester', length: 28, width: 12, height: 13, weight: 35000 },
  { id: 'std-pickup-truck', name: 'Pickup Truck', length: 19, width: 6.5, height: 6, weight: 5500 },
  { id: 'std-suv', name: 'SUV', length: 16, width: 6.5, height: 6, weight: 5000 },
  { id: 'std-sedan', name: 'Sedan/Car', length: 15, width: 6, height: 5, weight: 3500 },
  { id: 'std-van', name: 'Cargo Van', length: 20, width: 7, height: 8, weight: 6000 },
  { id: 'std-box-truck', name: 'Box Truck (26ft)', length: 26, width: 8, height: 10, weight: 12000 },
  { id: 'std-generator-small', name: 'Generator (50-100 kW)', length: 8, width: 4, height: 5, weight: 4000 },
  { id: 'std-generator-large', name: 'Generator (500+ kW)', length: 16, width: 6, height: 8, weight: 15000 },
  { id: 'std-compressor', name: 'Air Compressor (Industrial)', length: 12, width: 6, height: 7, weight: 8000 },
  { id: 'std-transformer', name: 'Electrical Transformer', length: 10, width: 8, height: 10, weight: 25000 },
  { id: 'std-boat-small', name: 'Small Boat (16-20ft)', length: 20, width: 8, height: 6, weight: 3000 },
  { id: 'std-boat-medium', name: 'Medium Boat (24-30ft)', length: 30, width: 10, height: 9, weight: 8000 },
  { id: 'std-boat-large', name: 'Large Boat (35-45ft)', length: 45, width: 14, height: 12, weight: 20000 },
  { id: 'std-modular-office', name: 'Modular Office (12x60)', length: 60, width: 12, height: 10, weight: 20000 },
  { id: 'std-storage-container', name: 'Storage Container (8x20)', length: 20, width: 8, height: 8, weight: 4000 },
  { id: 'std-pallet', name: 'Standard Pallet', length: 4, width: 3.3, height: 4, weight: 1500 },
  { id: 'std-crate-small', name: 'Small Crate', length: 4, width: 4, height: 4, weight: 500 },
  { id: 'std-crate-large', name: 'Large Crate', length: 8, width: 6, height: 6, weight: 2000 },
];


interface ServiceItem {
  id: string;
  serviceTypeId?: string;
  name: string;
  billing_unit?: string;
  quantity: number;
  rate: number;
  total: number;
  rateInput?: string;
  notes?: string;
  showNotes?: boolean;
  truckIndex?: number;
  [key: string]: unknown;
}

interface AccessorialItem {
  id: string;
  accessorial_type_id?: string;
  name: string;
  billing_unit: AccessorialBillingUnit;
  quantity: number;
  rate: number;
  total: number;
  rateInput?: string;
  notes?: string;
}

type AccessorialBillingUnit =
  | 'flat'
  | 'hour'
  | 'day'
  | 'way'
  | 'week'
  | 'month'
  | 'stop'
  | 'mile';

const ACCESSORIAL_BILLING_UNITS: AccessorialBillingUnit[] = [
  'flat',
  'hour',
  'day',
  'way',
  'week',
  'month',
  'stop',
  'mile',
];

const DEFAULT_ACCESSORIAL_TYPES: Array<{ name: string; description?: string; default_rate: number; billing_unit: AccessorialBillingUnit }> = [
  { name: 'Detention', description: 'Waiting time at pickup/delivery', default_rate: 7500, billing_unit: 'hour' },
  { name: 'Layover', description: 'Overnight stay required', default_rate: 35000, billing_unit: 'day' },
  { name: 'TONU (Truck Ordered Not Used)', description: 'Cancellation fee', default_rate: 50000, billing_unit: 'flat' },
  { name: 'Fuel Surcharge', description: 'Variable fuel cost adjustment', default_rate: 0, billing_unit: 'flat' },
  { name: 'Tolls', description: 'Highway toll charges', default_rate: 0, billing_unit: 'way' },
  { name: 'Permits', description: 'Oversize/overweight permits', default_rate: 0, billing_unit: 'flat' },
  { name: 'Escort', description: 'Pilot car escort', default_rate: 0, billing_unit: 'way' },
  { name: 'Crane Service', description: 'Crane rental', default_rate: 0, billing_unit: 'flat' },
  { name: 'Storage', description: 'Temporary storage', default_rate: 15000, billing_unit: 'day' },
];

const mapAccessorialBillingUnitFromApi = (unit?: string): AccessorialBillingUnit => {
  switch ((unit || '').toUpperCase()) {
    case 'PER_MILE':
      return 'mile';
    case 'PER_UNIT':
      return 'way';
    case 'FLAT':
    default:
      return 'flat';
  }
};

export default function LoadPlannerEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = id !== 'new';

  const { data: quote, isLoading: isLoadingQuote } = useLoadPlannerQuote(
    isEdit && id !== 'new' ? id : ''
  );
  const createMutation = useCreateLoadPlannerQuote();
  const updateMutation = useUpdateLoadPlannerQuote(isEdit ? id : '');
  const { data: inlandServiceTypesData } = useInlandServiceTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- stable fallback, intentionally omitted from deps
  const inlandServiceTypes = inlandServiceTypesData || [];

  // Tab state
  const [activeTab, setActiveTab] = useState('customer');

  // Quote basics
  const [quoteNumber, setQuoteNumber] = useState('');
  const [tempQuoteNumber, setTempQuoteNumber] = useState('');
  const [status, setStatus] = useState<LoadPlannerQuote['status']>('DRAFT');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerZip, setCustomerZip] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Route info
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [pickupZip, setPickupZip] = useState('');
  const [pickupLat, setPickupLat] = useState(0);
  const [pickupLng, setPickupLng] = useState(0);

  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffCity, setDropoffCity] = useState('');
  const [dropoffState, setDropoffState] = useState('');
  const [dropoffZip, setDropoffZip] = useState('');
  const [dropoffLat, setDropoffLat] = useState(0);
  const [dropoffLng, setDropoffLng] = useState(0);

  const [distanceMiles, setDistanceMiles] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);

  // Cargo items
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- stable fallback, intentionally omitted from deps
  const fallbackTruck: TruckType = defaultTrucks[0] ?? ({
    id: 'fallback-truck',
    name: 'Standard Flatbed',
    category: 'FLATBED',
    description: 'Default flatbed configuration',
    deckHeight: 5,
    deckLength: 48,
    deckWidth: 8.5,
    maxCargoWeight: 48000,
    maxLegalCargoHeight: 8.5,
    maxLegalCargoWidth: 8.5,
    tareWeight: 12000,
    powerUnitWeight: 17000,
    features: [],
    bestFor: [],
    loadingMethod: 'forklift',
  } as TruckType);

  const [selectedTruck, setSelectedTruck] = useState<TruckType>(fallbackTruck);
  const [selectedPlanOption, setSelectedPlanOption] = useState<SmartPlanOption | null>(null);
  const [useSavedTruckPlan, setUseSavedTruckPlan] = useState(false);

  const mapSavedTruckToType = useCallback((truck: LoadPlannerTruck): TruckType => {
    const matching = defaultTrucks.find((item) =>
      (truck.truckTypeId && item.id === truck.truckTypeId) || item.name === truck.truckName
    );
    const base = matching || fallbackTruck;
    const deckHeight = truck.deckHeightFt ?? base.deckHeight;
    return {
      ...base,
      id: truck.truckTypeId || base.id,
      name: truck.truckName || base.name,
      category: (truck.truckCategory as TrailerCategory) || base.category,
      deckLength: truck.deckLengthFt || base.deckLength,
      deckWidth: truck.deckWidthFt || base.deckWidth,
      deckHeight,
      wellLength: truck.wellLengthFt ?? base.wellLength,
      maxCargoWeight: truck.maxCargoWeightLbs || base.maxCargoWeight,
      maxLegalCargoHeight: base.maxLegalCargoHeight || Math.max(0, 13.5 - deckHeight),
      maxLegalCargoWidth: base.maxLegalCargoWidth || 8.5,
      description: base.description || 'Custom truck configuration',
      features: base.features || [],
      bestFor: base.bestFor || [],
      loadingMethod: base.loadingMethod,
    };
  }, [fallbackTruck]);

  // Cargo entry mode
  const [cargoEntryMode, setCargoEntryMode] = useState<'ai' | 'manual'>('ai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisWarning, setAnalysisWarning] = useState<string | null>(null);
  const [parsingStatus, setParsingStatus] = useState<string>('');

  // Manual cargo entry
  const [manualDescription, setManualDescription] = useState('');
  const [manualLength, setManualLength] = useState('');
  const [manualWidth, setManualWidth] = useState('');
  const [manualHeight, setManualHeight] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [manualQuantity, setManualQuantity] = useState('1');
  const [isEquipmentMode, setIsEquipmentMode] = useState(false);
  const [selectedMakeId, setSelectedMakeId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [manualImageUrl1, setManualImageUrl1] = useState('');
  const [manualImageUrl2, setManualImageUrl2] = useState('');
  const [manualImageUrl3, setManualImageUrl3] = useState('');
  const [manualImageUrl4, setManualImageUrl4] = useState('');
  const [customCargoTypes, setCustomCargoTypes] = useState<SearchableSelectOption[]>([]);
  const [manualValidation, setManualValidation] = useState<{ description?: string; dimensions?: string; weightWarning?: string }>({});

  const { data: equipmentMakes } = useEquipmentMakes();
  const { data: equipmentModels } = useEquipmentModels(selectedMakeId);
  const { data: equipmentDimensions } = useEquipmentDimensions(selectedModelId);

  useEffect(() => {
    if (!isEquipmentMode || !equipmentDimensions) return;
    const lengthIn = typeof equipmentDimensions.length === 'number' ? equipmentDimensions.length : 0;
    const widthIn = typeof equipmentDimensions.width === 'number' ? equipmentDimensions.width : 0;
    const heightIn = typeof equipmentDimensions.height === 'number' ? equipmentDimensions.height : 0;
    const weightLbs = typeof equipmentDimensions.weight === 'number' ? equipmentDimensions.weight : 0;

    if (lengthIn) setManualLength(String(lengthIn / 12));
    if (widthIn) setManualWidth(String(widthIn / 12));
    if (heightIn) setManualHeight(String(heightIn / 12));
    if (weightLbs) setManualWeight(String(weightLbs));
  }, [equipmentDimensions, isEquipmentMode]);
  const [lengthUnit, setLengthUnit] = useState('feet');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [selectedCargoTypeId, setSelectedCargoTypeId] = useState<string | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<CargoItem | null>(null);

  const feetToLengthUnit = (feet: number): number => {
    switch (lengthUnit) {
      case 'inches':
        return feet * 12;
      case 'centimeters':
        return feet * 30.48;
      case 'millimeters':
        return feet * 304.8;
      case 'meters':
        return feet / 3.28084;
      default:
        return feet;
    }
  };

  const lbsToWeightUnit = (lbs: number): number => {
    switch (weightUnit) {
      case 'kg':
        return lbs / 2.20462;
      case 'ton':
        return lbs / 2000;
      default:
        return lbs;
    }
  };

  // Trucks
  const [trucks, setTrucks] = useState<LoadPlannerTruck[]>([]);

  // Pricing
  const [subtotalCents, setSubtotalCents] = useState(0);
  const [totalCents, setTotalCents] = useState(0);
  const [pricingPerTruck, setPricingPerTruck] = useState(false);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [accessorialItems, setAccessorialItems] = useState<AccessorialItem[]>([]);
  const [accessorialsExpanded, setAccessorialsExpanded] = useState(false);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPdfSectionsOpen, setIsPdfSectionsOpen] = useState(false);
  const [capturedPermitData, setCapturedPermitData] = useState<DetailedRoutePermitSummary | null>(null);
  const [pdfSections, setPdfSections] = useState({
    companyHeader: true,
    clientInformation: true,
    pickupDropoffLocations: true,
    routeMap: true,
    cargoDetails: true,
    loadArrangementDiagrams: true,
    loadCompliance: true,
    servicesTable: true,
    accessorialCharges: true,
    permitEscortCosts: true,
    pricingSummary: true,
    termsNotes: true,
  });
  const setAllPdfSections = (value: boolean) => {
    setPdfSections((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Array<keyof typeof next>).forEach((key) => {
        next[key] = value;
      });
      return next;
    });
  };

  // Computed totals
  const servicesTotal = serviceItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const accessorialsTotal = accessorialItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const grandTotal = servicesTotal;

  const computeAccessorialTotal = useCallback((item: AccessorialItem) => {
    const quantity = item.quantity || 1;
    if (item.billing_unit === 'mile') {
      const miles = Math.max(0, distanceMiles || 0);
      return item.rate * quantity * miles;
    }
    return item.rate * quantity;
  }, [distanceMiles]);

  const loadItems = useMemo<LoadItem[]>(() => (
    cargoItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      length: (item.lengthIn || 0) / 12,
      width: (item.widthIn || 0) / 12,
      height: (item.heightIn || 0) / 12,
      weight: item.weightLbs || 0,
      stackable: item.stackable,
      bottomOnly: item.bottomOnly,
      fragile: item.fragile,
      hazmat: item.hazmat,
      maxLayers: item.maxLayers,
      orientation: item.orientation ? Number(item.orientation) : undefined,
      geometry: (item.geometryType as LoadItem['geometry']) || 'box',
    }))
  ), [cargoItems]);

  const totalCargoWeight = useMemo(
    () => cargoItems.reduce((sum, item) => sum + (item.weightLbs || 0) * (item.quantity || 1), 0),
    [cargoItems]
  );

  const maxItemLength = useMemo(() => (
    cargoItems.length === 0 ? 0 : Math.max(...cargoItems.map(i => (i.lengthIn || 0) / 12))
  ), [cargoItems]);

  const maxItemWidth = useMemo(() => (
    cargoItems.length === 0 ? 0 : Math.max(...cargoItems.map(i => (i.widthIn || 0) / 12))
  ), [cargoItems]);

  const maxItemHeight = useMemo(() => (
    cargoItems.length === 0 ? 0 : Math.max(...cargoItems.map(i => (i.heightIn || 0) / 12))
  ), [cargoItems]);

  const loadPlan = useMemo(() => buildLoadPlan(loadItems, selectedTruck), [loadItems, selectedTruck]);
  const activePlan = useMemo<LoadPlan>(() => {
    if (useSavedTruckPlan) return loadPlan;
    return (selectedPlanOption?.plan as LoadPlan) || loadPlan;
  }, [loadPlan, selectedPlanOption, useSavedTruckPlan]);

  const getLoadPermitCount = useCallback((truck: TruckType, items: LoadItem[]) => {
    if (items.length === 0) return 0;
    const maxHeight = truck.maxLegalCargoHeight || Math.max(0, 13.5 - truck.deckHeight);
    const maxWidth = truck.maxLegalCargoWidth || 8.5;
    const totalWeight = items.reduce((sum, item) => sum + item.weight * (item.quantity || 1), 0);
    const oversize = items.some((item) =>
      item.width > maxWidth || item.height > maxHeight || item.length > truck.deckLength
    );
    const overweight = totalWeight > truck.maxCargoWeight;
    return oversize || overweight ? 1 : 0;
  }, []);

  const computeFitScore = useCallback((truck: TruckType) => {
    let score = 100;
    if (totalCargoWeight > truck.maxCargoWeight) score -= 40;
    if (maxItemLength > truck.deckLength) score -= 30;
    if (maxItemWidth > truck.deckWidth) score -= 15;
    if (maxItemHeight > truck.maxLegalCargoHeight) score -= 15;
    return Math.max(0, score);
  }, [totalCargoWeight, maxItemLength, maxItemWidth, maxItemHeight]);

  const smartPlanOptions = useMemo<SmartPlanOption[]>(() => {
    if (loadItems.length === 0) return [];

    const parsedLoad: ParsedLoad = {
      length: maxItemLength,
      width: maxItemWidth,
      height: maxItemHeight,
      weight: loadItems.length ? Math.max(...loadItems.map((item) => item.weight * (item.quantity || 1))) : 0,
      totalWeight: totalCargoWeight,
      items: loadItems,
      origin: `${pickupAddress}, ${pickupCity}, ${pickupState} ${pickupZip}`.trim(),
      destination: `${dropoffAddress}, ${dropoffCity}, ${dropoffState} ${dropoffZip}`.trim(),
      confidence: 80,
    };

    const legacyOptions = generateSmartPlans(parsedLoad, {
      routeStates: [pickupState, dropoffState].filter(Boolean),
      routeDistance: distanceMiles > 0 ? distanceMiles : 500,
    });

    const order: SmartPlanOption['strategy'][] = [
      'recommended',
      'max-safety',
      'fastest',
      'best-placement',
      'legal-only',
    ];

    const normalized = legacyOptions.map((option) => {
      const strategy = option.strategy as SmartPlanOption['strategy'];
      const perTruckCostCents = strategy === 'recommended' ? 70_000 : 250_000;
      const permitCostCents = 15_000;
      return {
        ...option,
        totalCost: option.totalTrucks * perTruckCostCents + option.permitCount * permitCostCents,
        escortRequired: false,
      };
    });

    return ([...normalized]
      .sort((a, b) => order.indexOf(a.strategy as SmartPlanOption['strategy']) - order.indexOf(b.strategy as SmartPlanOption['strategy']))
    ) as unknown as SmartPlanOption[];
  }, [
    loadItems,
    maxItemLength,
    maxItemWidth,
    maxItemHeight,
    totalCargoWeight,
    pickupAddress,
    pickupCity,
    pickupState,
    pickupZip,
    dropoffAddress,
    dropoffCity,
    dropoffState,
    dropoffZip,
    distanceMiles,
  ]);

  const handlePlanOptionSelect = useCallback((plan: SmartPlanOption) => {
    setSelectedPlanOption(plan);
    setUseSavedTruckPlan(false);
    const firstTruck = (plan.plan as LoadPlan).loads[0]?.recommendedTruck;
    if (firstTruck) {
      setSelectedTruck(firstTruck);
    }
  }, []);

  useEffect(() => {
    if (useSavedTruckPlan) return;
    if (smartPlanOptions.length === 0) {
      setSelectedPlanOption(null);
      return;
    }

    setSelectedPlanOption((current) => {
      if (!current) {
        return smartPlanOptions.find((plan) => plan.strategy === 'recommended') || smartPlanOptions[0] || null;
      }

      const stillExists = smartPlanOptions.find((plan) => plan.strategy === current.strategy);
      return stillExists || smartPlanOptions[0] || null;
    });
  }, [smartPlanOptions, useSavedTruckPlan]);

  const perTruckCargoSpecs = useMemo(() => (
    activePlan.loads.map((load, index) => {
      const weight = load.items.reduce((sum, i) => sum + (i.weight * i.quantity), 0);
      const length = load.items.length ? Math.max(...load.items.map(i => i.length)) : 0;
      const width = load.items.length ? Math.max(...load.items.map(i => i.width)) : 0;
      const height = load.items.length ? Math.max(...load.items.map(i => i.height)) : 0;
      return {
        truckIndex: index,
        truckName: load.recommendedTruck.name,
        truckId: load.recommendedTruck.id,
        length,
        width,
        height,
        grossWeight: weight,
        isOversize: width > 8.5 || height > 13.5 || length > 53,
        isOverweight: weight > 80000,
      };
    })
  ), [activePlan.loads]);

  const hasPermitRisk = useMemo(() => (
    loadItems.some((item) =>
      item.width > 8.5 || item.height > 13.5 || item.length > 53 || item.weight * item.quantity > 80000
    )
  ), [loadItems]);

  useEffect(() => {
    if (activePlan.loads.length === 0) {
      setTrucks([]);
      return;
    }

    setTrucks(activePlan.loads.map((load, index) => {
      const truck = load.recommendedTruck;
      const totalWeightLbs = load.items.reduce((sum, item) => sum + item.weight * (item.quantity || 1), 0);
      const totalItems = load.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const permitCount = getLoadPermitCount(truck, load.items);
      const isLegal = permitCount === 0;

      return {
        id: load.id,
        truckIndex: index,
        truckTypeId: truck.id,
        truckName: truck.name,
        truckCategory: truck.category,
        deckLengthFt: truck.deckLength,
        deckWidthFt: truck.deckWidth,
        deckHeightFt: truck.deckHeight,
        wellLengthFt: truck.wellLength,
        maxCargoWeightLbs: truck.maxCargoWeight,
        totalWeightLbs,
        totalItems,
        isLegal,
        permitsRequired: isLegal ? [] : ['PERMIT_REQUIRED'],
        warnings: load.warnings,
        truckScore: computeFitScore(truck),
        sortOrder: index,
      };
    }));
  }, [activePlan.loads, computeFitScore, getLoadPermitCount]);

  const handleCargoItemsChange = (items: LoadItem[]) => {
    setCargoItems(items.map((item, index) => {
      const existing = cargoItems.find(c => c.id === item.id);
      return {
        ...(existing || {}),
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        lengthIn: item.length * 12,
        widthIn: item.width * 12,
        heightIn: item.height * 12,
        weightLbs: item.weight,
        stackable: item.stackable ?? false,
        bottomOnly: item.bottomOnly ?? false,
        fragile: item.fragile ?? false,
        hazmat: item.hazmat ?? false,
        maxLayers: item.maxLayers,
        orientation: item.orientation ? String(item.orientation) : existing?.orientation,
        geometryType: item.geometry || existing?.geometryType,
        sortOrder: existing?.sortOrder ?? index,
      } as CargoItem;
    }));
  };

  // Current date for display (stable to avoid hydration issues)
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // Initialize current date on mount
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Generate temporary quote number on client side only
  useEffect(() => {
    if (!isEdit && !quoteNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000);
      setTempQuoteNumber(`IQ-${year}${random}`);
    }
  }, [isEdit, quoteNumber]);

  // Load existing quote data
  useEffect(() => {
    if (quote && isEdit) {
      setQuoteNumber(quote.quoteNumber);
      setStatus(quote.status);
      setCustomerName(quote.customerName);
      setCustomerEmail(quote.customerEmail);
      setCustomerPhone(quote.customerPhone);
      setCustomerCompany(quote.customerCompany || '');
      setCustomerAddress(quote.customerAddress || '');
      setCustomerCity(quote.customerCity || '');
      setCustomerState(quote.customerState || '');
      setCustomerZip(quote.customerZip || '');
      setInternalNotes(quote.internalNotes || '');
      
      setPickupAddress(quote.pickupAddress);
      setPickupCity(quote.pickupCity);
      setPickupState(quote.pickupState);
      setPickupZip(quote.pickupZip);
      setPickupLat(quote.pickupLat);
      setPickupLng(quote.pickupLng);
      
      setDropoffAddress(quote.dropoffAddress);
      setDropoffCity(quote.dropoffCity);
      setDropoffState(quote.dropoffState);
      setDropoffZip(quote.dropoffZip);
      setDropoffLat(quote.dropoffLat);
      setDropoffLng(quote.dropoffLng);
      
      setDistanceMiles(quote.distanceMiles);
      setDurationMinutes(quote.durationMinutes);
      
      setCargoItems(quote.cargoItems || []);
      setTrucks(quote.trucks || []);
      if (quote.trucks && quote.trucks.length > 0) {
        const firstSavedTruck = quote.trucks[0];
        if (firstSavedTruck) {
          setSelectedTruck(mapSavedTruckToType(firstSavedTruck));
        }
        setSelectedPlanOption(null);
        setUseSavedTruckPlan(true);
      } else {
        setUseSavedTruckPlan(false);
      }

      const mappedServiceItems = (quote.serviceItems || []).map((item, index) => ({
        id: item.id || `service-${Date.now()}-${index}`,
        serviceTypeId: item.serviceTypeId || undefined,
        name: item.name,
        quantity: Number(item.quantity ?? 1),
        rate: Number(item.rateCents ?? 0),
        total: Number(item.totalCents ?? 0),
        rateInput: undefined,
        truckIndex: item.truckIndex ?? undefined,
        showNotes: false,
      }));
      setServiceItems(mappedServiceItems);
      setPricingPerTruck(mappedServiceItems.some((item) => item.truckIndex !== undefined));

      const mappedAccessorialItems = (quote.accessorials || []).map((item, index) => {
        const defaultType = DEFAULT_ACCESSORIAL_TYPES.find((type) => type.name === item.name);
        return {
          id: item.id || `accessorial-${Date.now()}-${index}`,
          accessorial_type_id: item.accessorialTypeId || undefined,
          name: item.name,
          billing_unit: defaultType?.billing_unit || mapAccessorialBillingUnitFromApi(item.billingUnit),
          quantity: Number(item.quantity ?? 1),
          rate: Number(item.rateCents ?? 0),
          total: Number(item.totalCents ?? 0),
          rateInput: undefined,
          notes: item.notes || '',
        } as AccessorialItem;
      });
      setAccessorialItems(mappedAccessorialItems);
      
      setSubtotalCents(quote.subtotalCents);
      setTotalCents(quote.totalCents);
    }
  }, [quote, isEdit, mapSavedTruckToType]);

  useEffect(() => {
    setAccessorialItems((prev) => prev.map((item) => ({
      ...item,
      total: computeAccessorialTotal(item),
    })));
  }, [computeAccessorialTotal]);

  const handleAnalyzed = (result: { items: unknown[] }) => {
    setAnalysisError(null);
    setAnalysisWarning(null);
    // Convert analyzed items to CargoItem format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newCargoItems: CargoItem[] = (result.items as any[]).map((item, index) => ({
      id: item.id || `cargo-${Date.now()}-${index}`,
      description: item.description,
      quantity: item.quantity,
      lengthIn: (item.length || 0) * 12,
      widthIn: (item.width || 0) * 12,
      heightIn: (item.height || 0) * 12,
      weightLbs: item.weight,
      stackable: false,
      bottomOnly: false,
      fragile: false,
      hazmat: false,
      sortOrder: index,
    }));
    
    setCargoItems([...cargoItems, ...newCargoItems]);
  };

  // Unit conversion utilities
  const convertLengthToFeet = (value: number, unit: string): number => {
    switch (unit) {
      case 'feet':
        return value;
      case 'inches':
        return value / 12;
      case 'centimeters':
        return value / 30.48;
      case 'millimeters':
        return value / 304.8;
      case 'meters':
        return value * 3.28084;
      default:
        return value;
    }
  };

  const convertWeightToLbs = (value: number, unit: string): number => {
    switch (unit) {
      case 'lbs':
        return value;
      case 'kg':
        return value * 2.20462;
      case 'ton':
        return value * 2204.62;
      default:
        return value;
    }
  };

  const handleAddManualItem = () => {
    const rawLength = parseFloat(manualLength) || 0;
    const rawWidth = parseFloat(manualWidth) || 0;
    const rawHeight = parseFloat(manualHeight) || 0;
    const rawWeight = parseFloat(manualWeight) || 0;

    const nextValidation: { description?: string; dimensions?: string; weightWarning?: string } = {};
    if (!manualDescription.trim()) {
      nextValidation.description = 'Please enter a description.';
    }
    if (rawLength <= 0 || rawWidth <= 0 || rawHeight <= 0) {
      nextValidation.dimensions = 'Please enter valid dimensions.';
    }
    if (rawWeight <= 0) {
      nextValidation.weightWarning = 'No weight entered — automatic truck recommendations won\'t work. You can manually select a truck.';
    }

    setManualValidation(nextValidation);

    if (nextValidation.description || nextValidation.dimensions) {
      return;
    }

    // Convert units to feet/lbs for storage
    const lengthFeet = convertLengthToFeet(rawLength, lengthUnit);
    const widthFeet = convertLengthToFeet(rawWidth, lengthUnit);
    const heightFeet = convertLengthToFeet(rawHeight, lengthUnit);
    const weightLbs = convertWeightToLbs(rawWeight, weightUnit);

    const newItem: CargoItem = {
      id: `cargo-${Date.now()}`,
      description: manualDescription,
      quantity: parseInt(manualQuantity) || 1,
      lengthIn: lengthFeet * 12,
      widthIn: widthFeet * 12,
      heightIn: heightFeet * 12,
      weightLbs,
      stackable: false,
      bottomOnly: false,
      fragile: false,
      hazmat: false,
      dimensionsSource: isEquipmentMode && selectedModelId ? 'database' : 'manual',
      equipmentMakeId: isEquipmentMode && selectedMakeId ? selectedMakeId : undefined,
      equipmentModelId: isEquipmentMode && selectedModelId ? selectedModelId : undefined,
      imageUrl1: manualImageUrl1 || undefined,
      imageUrl2: manualImageUrl2 || undefined,
      imageUrl3: manualImageUrl3 || undefined,
      imageUrl4: manualImageUrl4 || undefined,
      sortOrder: cargoItems.length,
    };

    setCargoItems([...cargoItems, newItem]);
    setLastAddedItem(newItem);
    setManualValidation({});
    
    // Clear form
    setManualDescription('');
    setManualLength('');
    setManualWidth('');
    setManualHeight('');
    setManualWeight('');
    setManualQuantity('1');
    setSelectedMakeId('');
    setSelectedModelId('');
    setManualImageUrl1('');
    setManualImageUrl2('');
    setManualImageUrl3('');
    setManualImageUrl4('');
    
  };

  // Pricing helper functions
  const addServiceItem = (truckIndex?: number) => {
    const newItem = {
      id: `service-${Date.now()}`,
      name: 'Custom Service',
      quantity: 1,
      rate: 0,
      total: 0,
      rateInput: undefined,
      truckIndex: pricingPerTruck ? truckIndex : undefined,
      showNotes: false,
      notes: '',
    };
    setServiceItems([...serviceItems, newItem]);
  };

  const updateServiceItem = (index: number, field: string, value: unknown) => {
    const updated = [...serviceItems];
    if (field === 'rate') {
      const raw = typeof value === 'string' ? value : String(value ?? '');
      const cents = parseWholeDollarsToCents(raw);
      updated[index]!.rate = cents;
      updated[index]!.total = cents * updated[index]!.quantity;
      updated[index]!.rateInput = raw;
    } else if (field === 'name') {
      updated[index]!.name = String(value);
      updated[index]!.serviceTypeId = undefined;
    } else if (field === 'quantity') {
      const qty = parseInt(String(value)) || 1;
      updated[index]!.quantity = qty;
      updated[index]!.total = updated[index]!.rate * qty;
    } else {
      updated[index]![field] = value;
    }
    setServiceItems(updated);
  };

  const applyServiceTypeSelection = (index: number, serviceType?: InlandServiceType) => {
    if (!serviceType) return;
    setServiceItems((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (!current) return prev;
      const quantity = current.quantity || 1;
      const rate = serviceType.defaultRateCents ?? 0;
      updated[index] = {
        ...current,
        name: serviceType.name,
        serviceTypeId: serviceType.id,
        rate,
        total: rate * quantity,
        rateInput: undefined,
      };
      return updated;
    });
  };

  const finalizeServiceRateInput = (index: number) => {
    const updated = [...serviceItems];
    const raw = updated[index]?.rateInput;
    if (raw !== undefined) {
      const cents = parseWholeDollarsToCents(raw);
      updated[index]!.rate = cents;
      updated[index]!.total = cents * updated[index]!.quantity;
      updated[index]!.rateInput = undefined;
      setServiceItems(updated);
    }
  };

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const duplicateServiceItem = (index: number) => {
    const item = { ...serviceItems[index]!, id: `service-${Date.now()}`, rateInput: undefined };
    setServiceItems([...serviceItems, item]);
  };

  const toggleServiceNotes = (index: number) => {
    const updated = [...serviceItems];
    updated[index]!.showNotes = !updated[index]!.showNotes;
    setServiceItems(updated);
  };

  const addServiceBundle = (bundleName?: string, truckIndex?: number) => {
    const name = bundleName || SERVICE_BUNDLES[0]?.name;
    const bundle = SERVICE_BUNDLES.find((b) => b.name === name);
    if (!bundle) {
      toast.info('Select a service bundle');
      return;
    }

    const newItems = bundle.services.map((service) => ({
      id: `service-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: service.name,
      serviceTypeId: service.serviceTypeId,
      quantity: 1,
      rate: service.rate || 0,
      total: service.rate || 0,
      rateInput: undefined,
      truckIndex: pricingPerTruck ? truckIndex : undefined,
      showNotes: false,
      notes: '',
    }));

    setServiceItems([...serviceItems, ...newItems]);
  };

  const addAccessorialItem = () => {
    const defaultType = DEFAULT_ACCESSORIAL_TYPES[0];
    const newItem = {
      id: `accessorial-${Date.now()}`,
      accessorial_type_id: '',
      name: defaultType?.name || 'Detention',
      billing_unit: defaultType?.billing_unit || 'flat',
      quantity: 1,
      rate: defaultType?.default_rate || 0,
      total: defaultType?.default_rate || 0,
      rateInput: undefined,
    };
    setAccessorialItems([...accessorialItems, newItem]);
  };

  const updateAccessorialItem = (index: number, field: string, value: unknown) => {
    const updated = [...accessorialItems];
    if (field === 'rate') {
      const raw = typeof value === 'string' ? value : String(value ?? '');
      const cents = parseWholeDollarsToCents(raw);
      updated[index]!.rate = cents;
      updated[index]!.total = computeAccessorialTotal(updated[index]!);
      updated[index]!.rateInput = raw;
    } else if (field === 'name') {
      const name = String(value);
      updated[index]!.name = name;
      const matchingType = DEFAULT_ACCESSORIAL_TYPES.find((t) => t.name === name);
      if (matchingType) {
        updated[index]!.billing_unit = matchingType.billing_unit;
        updated[index]!.rate = matchingType.default_rate;
        updated[index]!.total = computeAccessorialTotal(updated[index]!);
      }
    } else if (field === 'quantity') {
      const qty = parseInt(String(value)) || 1;
      updated[index]!.quantity = qty;
      updated[index]!.total = computeAccessorialTotal(updated[index]!);
    } else if (field === 'billing_unit') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated[index]! as any)[field] = value;
      updated[index]!.total = computeAccessorialTotal(updated[index]!);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated[index]! as any)[field] = value;
    }
    setAccessorialItems(updated);
  };

  const finalizeAccessorialRateInput = (index: number) => {
    const updated = [...accessorialItems];
    const raw = updated[index]?.rateInput;
    if (raw !== undefined) {
      const cents = parseWholeDollarsToCents(raw);
      updated[index]!.rate = cents;
      updated[index]!.total = computeAccessorialTotal(updated[index]!);
      updated[index]!.rateInput = undefined;
      setAccessorialItems(updated);
    }
  };

  const removeAccessorialItem = (index: number) => {
    setAccessorialItems(accessorialItems.filter((_, i) => i !== index));
  };

  // Utility functions from utils
  const formatWholeDollars = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const parseWholeDollarsToCents = (value: string) => {
    const num = parseFloat(value) || 0;
    return Math.round(num * 100);
  };

  // Service and accessorial options
  const fallbackServiceOptions = [
    { value: 'line-haul', label: 'Line Haul' },
    { value: 'fuel-surcharge', label: 'Fuel Surcharge' },
    { value: 'loading', label: 'Loading/Unloading' },
    { value: 'tarping', label: 'Tarping' },
    { value: 'escort', label: 'Escort' },
    { value: 'permit', label: 'Permit' },
  ];

  const serviceTypeByName = useMemo(() => {
    return new Map(inlandServiceTypes.map((type) => [type.name, type]));
  }, [inlandServiceTypes]);

  const serviceOptions = useMemo(() => {
    if (inlandServiceTypes.length === 0) return fallbackServiceOptions;
    return inlandServiceTypes.map((type) => ({
      value: type.id,
      label: type.name,
      serviceType: type,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fallbackServiceOptions is stable
  }, [inlandServiceTypes]);

  const serviceOptionsWithCustom = useMemo(() => (
    [...serviceOptions, { value: 'custom', label: 'Custom Service' }]
  ), [serviceOptions]);

  const accessorialOptions = DEFAULT_ACCESSORIAL_TYPES.map((t) => ({
    value: t.name,
    label: t.name,
  }));

  const billingUnitOptions = ACCESSORIAL_BILLING_UNITS.map((unit) => ({
    value: unit,
    label: unit === 'flat' ? 'Flat Rate'
      : unit === 'hour' ? 'Per Hour'
      : unit === 'day' ? 'Per Day'
      : unit === 'way' ? 'Per Way'
      : unit === 'week' ? 'Per Week'
      : unit === 'month' ? 'Per Month'
      : unit === 'stop' ? 'Per Stop'
      : 'Per Mile',
  }));

  const SERVICE_BUNDLES = useMemo(() => {
    const bundles = [
      { name: 'Standard Flatbed', serviceNames: ['Line Haul', 'Fuel Surcharge'] },
      { name: 'Oversized Load', serviceNames: ['Line Haul', 'Fuel Surcharge', 'Permit'] },
    ];

    return bundles.map((bundle) => ({
      name: bundle.name,
      services: bundle.serviceNames.map((serviceName) => {
        const type = serviceTypeByName.get(serviceName);
        return {
          name: serviceName,
          rate: type?.defaultRateCents ?? 0,
          serviceTypeId: type?.id,
        };
      }),
    }));
  }, [serviceTypeByName]);

  const handleSaveQuote = async () => {
    const normalizeBillingUnit = (unit?: string): 'FLAT' | 'PER_MILE' | 'PER_UNIT' => {
      if (!unit) return 'FLAT';
      const normalized = unit.toLowerCase();
      if (normalized === 'mile') return 'PER_MILE';
      if (normalized === 'flat') return 'FLAT';
      return 'PER_UNIT';
    };

    const quoteData: Partial<LoadPlannerQuote> = {
      quoteNumber,
      status,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      customerAddress,
      customerCity,
      customerState,
      customerZip,
      internalNotes,
      pickupAddress,
      pickupCity,
      pickupState,
      pickupZip,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffCity,
      dropoffState,
      dropoffZip,
      dropoffLat,
      dropoffLng,
      distanceMiles,
      durationMinutes,
      cargoItems,
      trucks,
      serviceItems: serviceItems.map((item, index) => ({
        id: item.id,
        serviceTypeId: item.serviceTypeId || item.name,
        name: item.name,
        rateCents: item.rate,
        quantity: item.quantity,
        totalCents: item.total,
        truckIndex: item.truckIndex,
        sortOrder: index,
      })),
      accessorials: accessorialItems.map((item, index) => ({
        id: item.id,
        accessorialTypeId: item.accessorial_type_id || item.name,
        name: item.name,
        billingUnit: normalizeBillingUnit(item.billing_unit),
        rateCents: item.rate,
        quantity: item.quantity,
        totalCents: item.total,
        notes: item.notes,
        sortOrder: index,
      })),
      subtotalCents,
      totalCents,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(quoteData);
        toast.success('Quote updated successfully');
      } else {
        await createMutation.mutateAsync(quoteData);
        toast.success('Quote created successfully');
      }
      router.push('/quotes');
    } catch (error) {
      toast.error('Failed to save quote');
      console.error('Failed to save quote:', error);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const permitStates = (capturedPermitData?.statePermits ?? []).map((p) => ({
        stateCode: p.stateCode,
        stateName: p.stateName,
        permitFees: p.permitFees,
        escortFees: p.escortFees,
        totalCost: p.totalCost,
      }));

      downloadQuotePDF({
        quoteNumber: quoteNumber || 'DRAFT',
        quoteDate: new Date().toLocaleDateString('en-US'),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
        company: {
          name: 'Ultra TMS',
          address: '',
          email: '',
          phone: '',
        },
        customer: {
          company: customerCompany,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress ? `${customerAddress}, ${customerCity}, ${customerState} ${customerZip}`.trim() : '',
        },
        pickup: { address: pickupAddress, city: pickupCity, state: pickupState, zip: pickupZip },
        dropoff: { address: dropoffAddress, city: dropoffCity, state: dropoffState, zip: dropoffZip },
        distance: distanceMiles,
        duration: durationMinutes,
        cargoItems: cargoItems.map((item) => ({
          description: item.description || 'Cargo Item',
          quantity: item.quantity || 1,
          length: (item.lengthIn || 0) / 12,
          width: (item.widthIn || 0) / 12,
          height: (item.heightIn || 0) / 12,
          weight: item.weightLbs || 0,
        })),
        serviceItems: serviceItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total,
        })),
        accessorialItems: accessorialItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total,
        })),
        permitStates,
        servicesTotal,
        accessorialsTotal,
        grandTotal,
        notes: quoteNotes,
        sections: pdfSections,
      });
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoadingQuote && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {isEdit ? 'Edit Load Planner Quote' : 'New Load Planner Quote'}
              </h1>
              <Badge variant="secondary" className="text-xs">
                v2 with Load Planner
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Quote #{quoteNumber || tempQuoteNumber || 'New Quote'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={handleSaveQuote} disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEdit
                  ? 'Update Quote'
                  : 'Save Quote'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/quotes')}>
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex overflow-x-auto no-scrollbar">
              <TabsTrigger value="customer" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <User className="h-3 w-3 hidden sm:inline" />
                <span>Customer</span>
              </TabsTrigger>
              <TabsTrigger value="route" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3 hidden sm:inline" />
                <span>Route</span>
              </TabsTrigger>
              <TabsTrigger value="cargo" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <Package className="h-3 w-3 hidden sm:inline" />
                <span>Cargo</span>
              </TabsTrigger>
              <TabsTrigger value="trucks" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <Truck className="h-3 w-3 hidden sm:inline" />
                <span>Trucks</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <DollarSign className="h-3 w-3 hidden sm:inline" />
                <span>Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="permits" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <FileWarning className="h-3 w-3 hidden sm:inline" />
                <span>Permits</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <GitCompareArrows className="h-3 w-3 hidden sm:inline" />
                <span>Compare</span>
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex-1 min-w-[80px] flex items-center justify-center gap-1">
                <FileText className="h-3 w-3 hidden sm:inline" />
                <span>PDF</span>
              </TabsTrigger>
            </TabsList>

            {/* Customer Tab */}
            <TabsContent value="customer" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>
                    Enter customer details or select from existing companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomerForm
                    customerName={customerName}
                    customerEmail={customerEmail}
                    customerPhone={customerPhone}
                    customerCompany={customerCompany}
                    customerAddress={{
                      address: customerAddress,
                      city: customerCity,
                      state: customerState,
                      zip: customerZip,
                    }}
                    internalNotes={internalNotes}
                    onCustomerNameChange={setCustomerName}
                    onCustomerEmailChange={setCustomerEmail}
                    onCustomerPhoneChange={setCustomerPhone}
                    onCustomerCompanyChange={setCustomerCompany}
                    onCustomerAddressChange={(addr) => {
                      setCustomerAddress(addr.address);
                      setCustomerCity(addr.city);
                      setCustomerState(addr.state);
                      setCustomerZip(addr.zip);
                    }}
                    onInternalNotesChange={setInternalNotes}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button onClick={() => setActiveTab('route')} className="flex-1">
                      Continue to Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Route Tab */}
            <TabsContent value="route" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <CardTitle>Pickup Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pickupAddress">Street Address *</Label>
                    <AddressAutocomplete
                      id="pickupAddress"
                      value={pickupAddress}
                      onChange={setPickupAddress}
                      onSelect={(components) => {
                        setPickupAddress(components.address || pickupAddress);
                        setPickupCity(components.city || '');
                        setPickupState(components.state || '');
                        setPickupZip(components.zip || '');
                        setPickupLat(components.lat || 0);
                        setPickupLng(components.lng || 0);
                      }}
                      placeholder="Enter pickup address..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">City</Label>
                      <Input
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">State</Label>
                      <Input
                        value={pickupState}
                        onChange={(e) => setPickupState(e.target.value.toUpperCase())}
                        placeholder="State"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">ZIP</Label>
                      <Input
                        value={pickupZip}
                        onChange={(e) => setPickupZip(e.target.value)}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <CardTitle>Dropoff Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dropoffAddress">Street Address *</Label>
                    <AddressAutocomplete
                      id="dropoffAddress"
                      value={dropoffAddress}
                      onChange={setDropoffAddress}
                      onSelect={(components) => {
                        setDropoffAddress(components.address || dropoffAddress);
                        setDropoffCity(components.city || '');
                        setDropoffState(components.state || '');
                        setDropoffZip(components.zip || '');
                        setDropoffLat(components.lat || 0);
                        setDropoffLng(components.lng || 0);
                      }}
                      placeholder="Enter dropoff address..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">City</Label>
                      <Input
                        value={dropoffCity}
                        onChange={(e) => setDropoffCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">State</Label>
                      <Input
                        value={dropoffState}
                        onChange={(e) => setDropoffState(e.target.value.toUpperCase())}
                        placeholder="State"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">ZIP</Label>
                      <Input
                        value={dropoffZip}
                        onChange={(e) => setDropoffZip(e.target.value)}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('customer')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('cargo')} className="flex-1">
                  Continue to Cargo
                </Button>
              </div>
            </TabsContent>

            {/* Cargo Tab */}
            <TabsContent value="cargo" className="mt-4 space-y-4">
              {/* Entry Mode Toggle */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Cargo Entry Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose how to add cargo items
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          cargoEntryMode === 'ai'
                            ? 'bg-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setCargoEntryMode('ai')}
                      >
                        <Upload className="h-4 w-4 inline mr-2" />
                        AI Upload
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          cargoEntryMode === 'manual'
                            ? 'bg-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setCargoEntryMode('manual')}
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Manual Entry
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Upload Section - shown in AI mode */}
              {cargoEntryMode === 'ai' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Cargo Data
                    </CardTitle>
                    <CardDescription>
                      Drop an Excel file, image, or paste cargo info - AI will extract the details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UniversalDropzone
                      onAnalyzed={handleAnalyzed}
                      onLoading={setIsAnalyzing}
                      onError={(error) => {
                        setAnalysisError(error);
                        if (error) setAnalysisWarning(null);
                      }}
                      onWarning={(warning) => {
                        setAnalysisWarning(warning);
                        if (warning) setAnalysisError(null);
                      }}
                      onStatusChange={setParsingStatus}
                    />
                    {analysisWarning && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <AlertTriangle className="mt-0.5 h-4 w-4" />
                        <span>{analysisWarning}</span>
                      </div>
                    )}
                    {analysisError && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertTriangle className="mt-0.5 h-4 w-4" />
                        <span>{analysisError}</span>
                      </div>
                    )}
                    {/* Parsing Status Indicator */}
                    {isAnalyzing && parsingStatus && (
                      <div className="mt-4 p-4 border rounded-lg bg-muted">
                        <p className="text-sm">{parsingStatus}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Manual Entry Section - shown in Manual mode */}
              {cargoEntryMode === 'manual' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Cargo Item
                    </CardTitle>
                    <CardDescription>
                      Enter cargo details manually
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Equipment Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-muted/60 border border-border/60 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium">Equipment Mode</span>
                          <p className="text-xs text-muted-foreground">
                            Select a preset to auto-fill dimensions and weight
                          </p>
                        </div>
                      </div>
                      <Switch
                        className="bg-background/70 data-[state=checked]:bg-primary/90 shadow-inner ring-1 ring-border/60"
                        checked={isEquipmentMode}
                        onCheckedChange={(checked) => {
                          setIsEquipmentMode(checked);
                          if (!checked) {
                            setSelectedMakeId('');
                            setSelectedModelId('');
                          }
                        }}
                      />
                    </div>

                    {isEquipmentMode && (
                      <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg bg-blue-50/50">
                        <div>
                          <Label className="text-xs">Make</Label>
                          <SearchableSelect
                            value={selectedMakeId}
                            onChange={(value) => {
                              const makeId = value || '';
                              setSelectedMakeId(makeId);
                              setSelectedModelId('');
                            }}
                            options={(equipmentMakes || []).map((make) => ({
                              value: make.id,
                              label: make.name,
                            }))}
                            placeholder="Select make..."
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Model</Label>
                          <SearchableSelect
                            value={selectedModelId}
                            onChange={(value) => {
                              const modelId = value || '';
                              setSelectedModelId(modelId);
                              const model = (equipmentModels || []).find((item) => item.id === modelId);
                              if (model) {
                                setManualDescription(`${model.name}`);
                              }
                            }}
                            options={(equipmentModels || []).map((model) => ({
                              value: model.id,
                              label: model.name,
                            }))}
                            placeholder={selectedMakeId ? 'Select model...' : 'Select make first'}
                            className="w-full"
                          />
                        </div>
                        <div className="col-span-2 text-xs text-muted-foreground">
                          Auto-fills dimensions and weight. You can still adjust values below.
                        </div>
                      </div>
                    )}

                    {/* Unit System Selectors */}
                    <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📐</span>
                        <span className="text-sm font-medium">Units</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Dimensions</Label>
                          <select
                            value={lengthUnit}
                            onChange={(e) => setLengthUnit(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                          >
                            <option value="feet">Feet (ft)</option>
                            <option value="inches">Inches (in)</option>
                            <option value="centimeters">Centimeters (cm)</option>
                            <option value="millimeters">Millimeters (mm)</option>
                            <option value="meters">Meters (m)</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Weight</Label>
                          <select
                            value={weightUnit}
                            onChange={(e) => setWeightUnit(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                          >
                            <option value="lbs">Pounds (lbs)</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="ton">Tons (metric)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Cargo Type Selector */}
                    <div>
                      <Label className="text-xs font-medium">Cargo Type (with standard dimensions)</Label>
                      <SearchableSelect
                        value={selectedCargoTypeId || ''}
                        onChange={(value) => {
                          setSelectedCargoTypeId(value || null);
                          if (!value) return;

                          const stdType = STANDARD_CARGO_TYPES.find((item) => item.id === value);
                          if (stdType) {
                            setManualDescription(stdType.name);
                            setManualLength(feetToLengthUnit(stdType.length).toFixed(2));
                            setManualWidth(feetToLengthUnit(stdType.width).toFixed(2));
                            setManualHeight(feetToLengthUnit(stdType.height).toFixed(2));
                            setManualWeight(lbsToWeightUnit(stdType.weight).toFixed(0));
                            return;
                          }

                          const customType = customCargoTypes.find((item) => item.value === value);
                          if (customType) {
                            setManualDescription(customType.label);
                          }
                        }}
                        options={[
                          ...STANDARD_CARGO_TYPES.map((st) => ({
                            value: st.id,
                            label: `📦 ${st.name}`,
                            description: `${st.length}×${st.width}×${st.height} ft, ${(st.weight / 1000).toFixed(1)}k lbs`,
                          })),
                          ...customCargoTypes,
                        ]}
                        placeholder="Select cargo type for auto-fill..."
                        allowCustom={true}
                        customPlaceholder="Enter custom cargo type name..."
                        onCustomAdd={(customName) => {
                          const customId = `custom-${customName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
                          const newOption: SearchableSelectOption = {
                            value: customId,
                            label: customName,
                            description: 'Custom cargo type',
                          };
                          setCustomCargoTypes((prev) => [...prev, newOption]);
                          setSelectedCargoTypeId(customId);
                          setManualDescription(customName);
                        }}
                      />
                    </div>

                    {/* Manual Entry Form */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-medium">Description</Label>
                        <Input
                          value={manualDescription}
                          onChange={(e) => setManualDescription(e.target.value)}
                          placeholder="e.g., CAT 320 Excavator"
                        />
                        {manualValidation.description && (
                          <p className="text-xs text-red-600 mt-1">{manualValidation.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs font-medium">
                            Length ({lengthUnit === 'feet' ? 'ft' : lengthUnit === 'inches' ? 'in' : lengthUnit === 'centimeters' ? 'cm' : lengthUnit === 'millimeters' ? 'mm' : 'm'})
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={manualLength}
                            onChange={(e) => setManualLength(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Width ({lengthUnit === 'feet' ? 'ft' : lengthUnit === 'inches' ? 'in' : lengthUnit === 'centimeters' ? 'cm' : lengthUnit === 'millimeters' ? 'mm' : 'm'})
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={manualWidth}
                            onChange={(e) => setManualWidth(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Height ({lengthUnit === 'feet' ? 'ft' : lengthUnit === 'inches' ? 'in' : lengthUnit === 'centimeters' ? 'cm' : lengthUnit === 'millimeters' ? 'mm' : 'm'})
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={manualHeight}
                            onChange={(e) => setManualHeight(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Weight ({weightUnit === 'lbs' ? 'lbs' : weightUnit === 'kg' ? 'kg' : 'ton'})
                          </Label>
                          <Input
                            type="number"
                            value={manualWeight}
                            onChange={(e) => setManualWeight(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      {manualValidation.dimensions && (
                        <p className="text-xs text-red-600">{manualValidation.dimensions}</p>
                      )}
                      {manualValidation.weightWarning && (
                        <p className="text-xs text-amber-600">{manualValidation.weightWarning}</p>
                      )}

                      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Cargo Images (optional)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium">Image URL 1</Label>
                            <Input
                              value={manualImageUrl1}
                              onChange={(e) => setManualImageUrl1(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Image URL 2</Label>
                            <Input
                              value={manualImageUrl2}
                              onChange={(e) => setManualImageUrl2(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Image URL 3</Label>
                            <Input
                              value={manualImageUrl3}
                              onChange={(e) => setManualImageUrl3(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Image URL 4</Label>
                            <Input
                              value={manualImageUrl4}
                              onChange={(e) => setManualImageUrl4(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end gap-3">
                        <div className="w-24">
                          <Label className="text-xs font-medium">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={manualQuantity}
                            onChange={(e) => setManualQuantity(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleAddManualItem} className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                        {lastAddedItem && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setManualDescription(lastAddedItem.description);
                              setManualLength(String(lastAddedItem.lengthIn / 12));
                              setManualWidth(String(lastAddedItem.widthIn / 12));
                              setManualHeight(String(lastAddedItem.heightIn / 12));
                              setManualWeight(String(lastAddedItem.weightLbs));
                              setManualQuantity(String(lastAddedItem.quantity));
                            }}
                            title="Fill form with last added item"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cargo Items List - shown in both modes */}
              {cargoItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Cargo Items ({cargoItems.length})
                    </CardTitle>
                    <CardDescription>
                      Review and edit the cargo items. All dimensions are in feet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExtractedItemsList items={loadItems} onChange={handleCargoItemsChange} />
                  </CardContent>
                </Card>
              )}

              {/* Smart Truck Recommendation - Shows automatically calculated load plan */}
              {activePlan && activePlan.loads.length > 0 && (
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Truck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-green-700">
                            Smart Recommendation: {activePlan.totalTrucks} {activePlan.loads[0]?.recommendedTruck?.name || 'truck'}{activePlan.totalTrucks > 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Items: {activePlan.totalItems}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Weight: {(activePlan.totalWeight / 1000).toFixed(1)}k lbs
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('trucks')}>
                        Customize
                      </Button>
                    </div>
                    {activePlan.warnings.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activePlan.warnings.slice(0, 3).map((warning, i) => (
                          <Badge key={i} variant="outline" className="text-yellow-600 border-yellow-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {warning}
                          </Badge>
                        ))}
                        {activePlan.warnings.length > 3 && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            +{activePlan.warnings.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    {activePlan.totalTrucks > 1 && (
                      <div className="mt-2 text-xs text-slate-600">
                        Load requires {activePlan.totalTrucks} trucks to transport all items
                      </div>
                    )}
                    {hasPermitRisk && (
                      <div className="mt-2 text-xs text-orange-600">
                        Permits may be required - see Trucks tab for details
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('route')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('trucks')} className="flex-1">
                  Continue to Trucks
                </Button>
              </div>
            </TabsContent>

            {/* Trucks Tab */}
            <TabsContent value="trucks" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Load Plan & Truck Selection
                  </CardTitle>
                  <CardDescription>
                    Review recommended trucks and load placement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cargoItems.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-muted-foreground">
                      <Package className="h-12 w-12 mb-4 opacity-50" />
                      <p>Add cargo items first to see truck recommendations</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab('cargo')}>
                        Go to Cargo
                      </Button>
                    </div>
                  ) : (activePlan.loads.length) ? (
                    <div className="space-y-4">
                      {smartPlanOptions.length > 1 && (
                        <PlanComparisonPanel
                          plans={smartPlanOptions}
                          selectedPlan={selectedPlanOption}
                          onSelectPlan={handlePlanOptionSelect}
                          className="mb-4"
                        />
                      )}

                      {activePlan.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800 mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">Warnings</span>
                          </div>
                          <ul className="text-sm text-yellow-700 list-disc list-inside">
                            {activePlan.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activePlan.loads.map((load, index) => {
                        if (!load.recommendedTruck) return null
                        const permitCount = getLoadPermitCount(load.recommendedTruck, load.items)
                        const isLegal = permitCount === 0
                        const cardBorderColor = isLegal ? 'border-l-green-500' : 'border-l-orange-500'
                        const numberBgColor = isLegal ? 'bg-green-500' : 'bg-orange-500'
                        const loadWeight = load.items.reduce((sum, item) => sum + item.weight * (item.quantity || 1), 0)

                        return (
                          <Card key={load.id} className={`border-l-4 ${cardBorderColor}`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${numberBgColor} flex items-center justify-center text-white font-bold text-sm`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{load.recommendedTruck.name}</span>
                                      {isLegal ? (
                                        <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded border border-green-200">
                                          Legal Load
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded border border-orange-200">
                                          {permitCount} Permit{permitCount > 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {load.items.length} items &bull; {(loadWeight / 1000).toFixed(1)}k lbs
                                    </div>
                                  </div>
                                </div>
                                <TruckSelector
                                  currentTruck={load.recommendedTruck}
                                  onChange={(truck) => {
                                    setSelectedTruck(truck);
                                    setSelectedPlanOption(null);
                                    setUseSavedTruckPlan(false);
                                  }}
                                  itemsWeight={loadWeight}
                                  maxItemLength={Math.max(...load.items.map((item) => item.length), 0)}
                                  maxItemWidth={Math.max(...load.items.map((item) => item.width), 0)}
                                  maxItemHeight={Math.max(...load.items.map((item) => item.height), 0)}
                                  itemDescriptions={load.items.map((item) => item.description || '')}
                                />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <TrailerDiagram
                                truck={load.recommendedTruck}
                                items={load.items}
                                placements={load.placements}
                              />
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-muted-foreground">
                      <Truck className="h-12 w-12 mb-4 opacity-50" />
                      <p>No load plan available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('cargo')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('pricing')} className="flex-1">
                  Continue to Pricing
                </Button>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Services & Pricing
                      </CardTitle>
                      <CardDescription>Add services and set pricing for this quote</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="per-truck-pricing" className="text-sm">Price per truck</Label>
                      <Switch
                        id="per-truck-pricing"
                        checked={pricingPerTruck}
                        onCheckedChange={setPricingPerTruck}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!pricingPerTruck ? (
                    // Regular pricing - all services together
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Label className="text-sm font-medium">Services</Label>
                        <div className="flex items-center gap-2">
                          <SearchableSelect
                            value=""
                            onChange={(value) => addServiceBundle(value)}
                            options={SERVICE_BUNDLES.map(b => ({ value: b.name, label: b.name }))}
                            placeholder="Add Bundle"
                            className="w-[140px]"
                          />
                          <Button variant="outline" size="sm" onClick={() => addServiceItem()}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Service
                          </Button>
                        </div>
                      </div>

                      {serviceItems.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg bg-muted/30">
                          <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-muted-foreground font-medium">No services added yet</p>
                          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Add services like Line Haul, Fuel Surcharge, and other charges</p>
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => addServiceBundle('Standard Flatbed')}>
                              <Layers className="h-3 w-3 mr-1" />
                              Standard Flatbed
                            </Button>
                            <Button variant="default" size="sm" onClick={() => addServiceItem()}>
                              <Plus className="h-3 w-3 mr-1" />
                              Add Service
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {serviceItems.map((service, index) => {
                            const matchedService = service.serviceTypeId
                              ? serviceOptions.find((s) => s.value === service.serviceTypeId)
                              : serviceOptions.find((s) => s.label === service.name)
                            const dropdownValue = matchedService?.value || 'custom'
                            const isCustomService = dropdownValue === 'custom'

                            return (
                              <div key={service.id} className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2 p-2 rounded bg-muted/30">
                                  <SearchableSelect
                                    value={dropdownValue}
                                    onChange={(value) => {
                                      const selected = serviceOptionsWithCustom.find((s) => s.value === value)
                                      if (!selected || selected.value === 'custom') {
                                        updateServiceItem(index, 'name', 'Custom Service')
                                        return
                                      }
                                      const selectedType = (selected as { serviceType?: InlandServiceType }).serviceType
                                      if (selectedType) {
                                        applyServiceTypeSelection(index, selectedType)
                                      } else {
                                        updateServiceItem(index, 'name', selected.label)
                                      }
                                    }}
                                    options={serviceOptionsWithCustom.map((s): SearchableSelectOption => ({
                                      value: s.value,
                                      label: s.label,
                                    }))}
                                    placeholder="Select service"
                                    searchPlaceholder="Search services..."
                                    className="w-full sm:w-[180px]"
                                  />
                                  {isCustomService && (
                                    <Input
                                      className="flex-1 min-w-[120px]"
                                      placeholder="Enter custom service name"
                                      value={service.name === 'Custom Service' ? '' : service.name}
                                      onChange={(e) => updateServiceItem(index, 'name', e.target.value || 'Custom Service')}
                                    />
                                  )}
                                  <Input
                                    className="w-16 sm:w-20"
                                    type="number"
                                    min={1}
                                    value={service.quantity}
                                    onChange={(e) => updateServiceItem(index, 'quantity', e.target.value)}
                                    placeholder="Qty"
                                  />
                                  <div className="relative w-24 sm:w-28">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                      className="pl-5 text-right font-mono"
                                      placeholder="0"
                                      value={service.rateInput ?? formatWholeDollars(service.rate)}
                                      onChange={(e) => updateServiceItem(index, 'rate', e.target.value)}
                                      onBlur={() => finalizeServiceRateInput(index)}
                                    />
                                  </div>
                                  <span className="w-20 sm:w-24 text-right font-mono text-sm">
                                    ${formatWholeDollars(service.total)}
                                  </span>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => toggleServiceNotes(index)}
                                      className={service.notes ? 'text-blue-500' : ''}
                                      title="Add notes"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => duplicateServiceItem(index)}
                                      title="Duplicate"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeServiceItem(index)}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                {service.showNotes && (
                                  <div className="pl-2 pb-1">
                                    <Input
                                      className="text-sm"
                                      placeholder="Add notes for this service..."
                                      value={service.notes || ''}
                                      onChange={(e) => updateServiceItem(index, 'notes', e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Per-truck pricing
                    <div className="space-y-6">
                      {activePlan && activePlan.loads.length > 0 ? (
                        activePlan.loads.map((load, truckIndex) => (
                          <div key={load.id} className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                  {truckIndex + 1}
                                </div>
                                <Label className="font-medium">{load.recommendedTruck.name}</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <SearchableSelect
                                  value=""
                                  onChange={(value) => addServiceBundle(value, truckIndex)}
                                  options={SERVICE_BUNDLES.map(b => ({ value: b.name, label: b.name }))}
                                  placeholder="Bundle"
                                  className="w-[100px]"
                                />
                                <Button variant="outline" size="sm" onClick={() => addServiceItem(truckIndex)}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {serviceItems
                                .map((service, index) => ({ service, index }))
                                .filter(({ service }) => service.truckIndex === truckIndex)
                                .map(({ service, index }) => {
                                  const matchedService = service.serviceTypeId
                                    ? serviceOptions.find((s) => s.value === service.serviceTypeId)
                                    : serviceOptions.find((s) => s.label === service.name)
                                  const dropdownValue = matchedService?.value || 'custom'
                                  const isCustomService = dropdownValue === 'custom'

                                  return (
                                    <div key={service.id} className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2 p-2 rounded bg-muted/30">
                                        <SearchableSelect
                                          value={dropdownValue}
                                          onChange={(value) => {
                                            const selected = serviceOptionsWithCustom.find((s) => s.value === value)
                                            if (!selected || selected.value === 'custom') {
                                              updateServiceItem(index, 'name', 'Custom Service')
                                              return
                                            }
                                            const selectedType = (selected as { serviceType?: InlandServiceType }).serviceType
                                            if (selectedType) {
                                              applyServiceTypeSelection(index, selectedType)
                                            } else {
                                              updateServiceItem(index, 'name', selected.label)
                                            }
                                          }}
                                          options={serviceOptionsWithCustom.map((s): SearchableSelectOption => ({
                                            value: s.value,
                                            label: s.label,
                                          }))}
                                          placeholder="Select service"
                                          searchPlaceholder="Search services..."
                                          className="w-full sm:w-[180px]"
                                        />
                                        {isCustomService && (
                                          <Input
                                            className="flex-1 min-w-[120px]"
                                            placeholder="Custom service name"
                                            value={service.name === 'Custom Service' ? '' : service.name}
                                            onChange={(e) => updateServiceItem(index, 'name', e.target.value || 'Custom Service')}
                                          />
                                        )}
                                        <Input
                                          className="w-16"
                                          type="number"
                                          min={1}
                                          value={service.quantity}
                                          onChange={(e) => updateServiceItem(index, 'quantity', e.target.value)}
                                        />
                                        <div className="relative w-24">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                          <Input
                                            className="pl-5 text-right font-mono"
                                            value={service.rateInput ?? formatWholeDollars(service.rate)}
                                            onChange={(e) => updateServiceItem(index, 'rate', e.target.value)}
                                            onBlur={() => finalizeServiceRateInput(index)}
                                          />
                                        </div>
                                        <span className="w-20 text-right font-mono text-sm">
                                          ${formatWholeDollars(service.total)}
                                        </span>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleServiceNotes(index)}
                                            className={service.notes ? 'text-blue-500' : ''}
                                            title="Add notes"
                                          >
                                            <MessageSquare className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => duplicateServiceItem(index)}
                                            title="Duplicate"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeServiceItem(index)}
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      {service.showNotes && (
                                        <div className="pl-2 pb-1">
                                          <Input
                                            className="text-sm"
                                            placeholder="Add notes for this service..."
                                            value={service.notes || ''}
                                            onChange={(e) => updateServiceItem(index, 'notes', e.target.value)}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                            </div>

                            <div className="flex justify-between text-sm pt-2 border-t">
                              <span>Truck {truckIndex + 1} Total</span>
                              <span className="font-mono font-medium">
                                {formatCurrency(
                                  serviceItems
                                    .filter(s => s.truckIndex === truckIndex)
                                    .reduce((sum, s) => sum + s.total, 0)
                                )}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg bg-muted/30">
                          Add cargo and trucks first to enable per-truck pricing.
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Accessorial Charges Section - Collapsible */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setAccessorialsExpanded(!accessorialsExpanded)}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {accessorialsExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        Accessorial Charges
                        {accessorialItems.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {accessorialItems.length}
                          </Badge>
                        )}
                        {!accessorialsExpanded && accessorialItems.length > 0 && (
                          <span className="text-muted-foreground font-normal ml-2">
                            ({formatCurrency(accessorialsTotal)})
                          </span>
                        )}
                      </button>
                      <Button variant="outline" size="sm" onClick={() => { addAccessorialItem(); setAccessorialsExpanded(true); }}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Accessorial
                      </Button>
                    </div>

                    {accessorialsExpanded && (
                      <>
                        {accessorialItems.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground text-sm border rounded-lg bg-amber-50/50 border-amber-200">
                            No accessorial charges added. Add items like detention, layover, tolls, etc.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {accessorialItems.map((accessorial, index) => (
                              <div key={accessorial.id} className="flex flex-wrap items-center gap-2 p-2 rounded bg-amber-50/50 border border-amber-200">
                                <SearchableSelect
                                  value={accessorial.name}
                                  onChange={(value) => updateAccessorialItem(index, 'name', value)}
                                  options={accessorialOptions.map((a): SearchableSelectOption => ({
                                    value: a.value,
                                    label: a.label,
                                  }))}
                                  placeholder="Select type"
                                  searchPlaceholder="Search accessorials..."
                                  className="w-full sm:w-[180px]"
                                />
                                <SearchableSelect
                                  value={accessorial.billing_unit}
                                  onChange={(value) => updateAccessorialItem(index, 'billing_unit', value)}
                                  options={billingUnitOptions.map((b): SearchableSelectOption => ({
                                    value: b.value,
                                    label: b.label,
                                  }))}
                                  placeholder="Unit"
                                  className="w-[100px]"
                                />
                                <Input
                                  className="w-16 sm:w-20"
                                  type="number"
                                  min={1}
                                  value={accessorial.quantity}
                                  onChange={(e) => updateAccessorialItem(index, 'quantity', e.target.value)}
                                  placeholder="Qty"
                                />
                                <div className="relative w-24 sm:w-28">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input
                                    className="pl-5 text-right font-mono"
                                    placeholder="0"
                                    value={accessorial.rateInput ?? formatWholeDollars(accessorial.rate)}
                                    onChange={(e) => updateAccessorialItem(index, 'rate', e.target.value)}
                                    onBlur={() => finalizeAccessorialRateInput(index)}
                                  />
                                </div>
                                <span className="w-20 sm:w-24 text-right font-mono text-sm">
                                  ${formatWholeDollars(accessorial.total)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAccessorialItem(index)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {accessorialItems.length > 0 && (
                          <div className="flex justify-between text-sm pt-2">
                            <span className="text-muted-foreground">Accessorials Subtotal</span>
                            <span className="font-mono font-medium text-amber-700">
                              {formatCurrency(accessorialsTotal)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-lg font-medium">Grand Total</span>
                      {accessorialItems.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Accessorials not included in grand total
                        </div>
                      )}
                    </div>
                    <span className="text-2xl font-bold font-mono text-primary">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quote Notes (visible to customer)</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Terms, conditions, special instructions..."
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Internal Notes (not visible to customer)</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Internal notes..."
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('trucks')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('permits')} className="flex-1">
                  Continue to Permits
                </Button>
              </div>
            </TabsContent>

            {/* Permits Tab */}
            <TabsContent value="permits" className="mt-4 space-y-4">
              {!pickupAddress || !dropoffAddress ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-10 text-muted-foreground">
                    <MapPin className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-center">Enter pickup and dropoff addresses first</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('route')}>
                      Go to Route
                    </Button>
                  </CardContent>
                </Card>
              ) : cargoItems.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-10 text-muted-foreground">
                    <Package className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-center">Add cargo items to calculate permit requirements</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('cargo')}>
                      Go to Cargo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileWarning className="h-5 w-5" />
                        Permit Requirements
                      </CardTitle>
                      <CardDescription>
                        Permit calculations based on route and cargo dimensions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RouteIntelligence
                        origin={`${pickupAddress}, ${pickupCity}, ${pickupState} ${pickupZip}`.trim()}
                        destination={`${dropoffAddress}, ${dropoffCity}, ${dropoffState} ${dropoffZip}`.trim()}
                        cargoSpecs={{
                          length: maxItemLength,
                          width: maxItemWidth,
                          height: maxItemHeight,
                          grossWeight: totalCargoWeight,
                        }}
                        perTruckCargoSpecs={perTruckCargoSpecs}
                        onPermitDataCalculated={setCapturedPermitData}
                      />
                    </CardContent>
                  </Card>

                </>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('pricing')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('compare')} className="flex-1">
                  Continue to Compare
                </Button>
              </div>
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compare" className="mt-4 space-y-4">
              {!pickupAddress || !dropoffAddress ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-10 text-muted-foreground">
                    <MapPin className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-center">Enter pickup and dropoff addresses to compare routes</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('route')}>
                      Go to Route
                    </Button>
                  </CardContent>
                </Card>
              ) : cargoItems.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-10 text-muted-foreground">
                    <Package className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-center">Add cargo items to compare route and truck scenarios</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('cargo')}>
                      Go to Cargo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <RouteComparisonTab
                  pickupAddress={`${pickupAddress}, ${pickupCity}, ${pickupState} ${pickupZip}`.trim()}
                  dropoffAddress={`${dropoffAddress}, ${dropoffCity}, ${dropoffState} ${dropoffZip}`.trim()}
                  cargoItems={loadItems}
                  currentTruck={selectedTruck}
                  routeResult={null}
                  onApplyScenario={(scenario) => {
                    setSelectedTruck(scenario.truck)
                    setDistanceMiles(scenario.routeAlternative.totalDistanceMiles)
                    setDurationMinutes(scenario.routeAlternative.totalDurationMinutes)
                    toast.success('Scenario applied to quote')
                  }}
                />
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('permits')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('pdf')} className="flex-1">
                  Continue to PDF
                </Button>
              </div>
            </TabsContent>

            {/* PDF Tab */}
            <TabsContent value="pdf" className="mt-4 space-y-4">
              {/* Controls */}
              <div className="mb-6 no-print space-y-3">
                <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">Quote Preview</h3>
                    {isDownloadingPdf && (
                      <span className="text-sm text-slate-500">Generating PDF...</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setIsPdfSectionsOpen((prev) => !prev)}
                    >
                      <EyeOff className="h-4 w-4" />
                      Sections
                      {isPdfSectionsOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </div>
                </div>

                {isPdfSectionsOpen && (
                  <Card>
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-slate-900">Show / Hide PDF Sections</h4>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setAllPdfSections(true)}
                          >
                            Show All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setAllPdfSections(false)}
                          >
                            Hide All
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.companyHeader} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, companyHeader: checked }))} />
                            <span className="text-sm">Company Header</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.routeMap} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, routeMap: checked }))} />
                            <span className="text-sm">Route Map</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.loadCompliance} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, loadCompliance: checked }))} />
                            <span className="text-sm">Load Compliance (Warnings & Permits)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.permitEscortCosts} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, permitEscortCosts: checked }))} />
                            <span className="text-sm">Permit & Escort Costs</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.clientInformation} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, clientInformation: checked }))} />
                            <span className="text-sm">Client Information</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.cargoDetails} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, cargoDetails: checked }))} />
                            <span className="text-sm">Cargo Details</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.servicesTable} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, servicesTable: checked }))} />
                            <span className="text-sm">Services Table</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.pricingSummary} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, pricingSummary: checked }))} />
                            <span className="text-sm">Pricing Summary / Grand Total</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.pickupDropoffLocations} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, pickupDropoffLocations: checked }))} />
                            <span className="text-sm">Pickup / Dropoff Locations</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.loadArrangementDiagrams} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, loadArrangementDiagrams: checked }))} />
                            <span className="text-sm">Load Arrangement Diagrams</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.accessorialCharges} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, accessorialCharges: checked }))} />
                            <span className="text-sm">Accessorial Charges</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch checked={pdfSections.termsNotes} onCheckedChange={(checked) => setPdfSections((prev) => ({ ...prev, termsNotes: checked }))} />
                            <span className="text-sm">Terms & Notes</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* PDF Content */}
              <div className="bg-slate-100 rounded-lg overflow-auto" style={{ maxHeight: '70vh' }}>
                {/* Main Card */}
                <div className="max-w-5xl mx-auto px-6 py-2">
                  <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
                    {/* Header Section */}
                    {pdfSections.companyHeader && (
                      <div className="p-8 border-b border-slate-100 flex justify-between items-start" style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-extrabold tracking-tighter uppercase text-slate-900">
                              SEAHORSE EXPRESS
                            </div>
                          </div>
                          <div className="text-sm space-y-1 text-slate-500">
                            <p>110 Vintage Park Blvd, Houston, TX, 77070</p>
                            <p>Danny@seahorseexpress.com</p>
                            <p>(201) 955-1199</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <h1 className="text-3xl font-extrabold mb-2 text-blue-600">
                            QUOTATION
                          </h1>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <span className="text-slate-500 font-medium">Quote ID</span>
                            <span className="font-bold text-slate-900">#{quoteNumber || tempQuoteNumber}</span>
                            <span className="text-slate-500 font-medium">Issue Date</span>
                            <span className="text-slate-900">{currentDate ? formatDate(currentDate) : '—'}</span>
                            <span className="text-slate-500 font-medium">Valid Until</span>
                            <span className="text-slate-900">Feb 27, 2026</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Client Information */}
                    {pdfSections.clientInformation && (
                      <div className="p-8 border-b border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Client Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Company Name</p>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{customerCompany || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Contact Person</p>
                            <p className="text-sm font-bold text-slate-900">{customerName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Phone Number</p>
                            <p className="text-sm font-bold text-slate-900">{customerPhone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Email Address</p>
                            <p className="text-sm font-bold text-slate-900 break-words">{customerEmail || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Address</p>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                              {customerAddress || '-'}
                              {customerCity && customerState && <><br />{customerCity}, {customerState} {customerZip}</>}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transport Distance */}
                    {pdfSections.pickupDropoffLocations && (
                      <div className="grid grid-cols-3 gap-0 border-b border-slate-100">
                        <div className="p-8 border-r border-slate-100">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-blue-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Pick-up Location
                          </h3>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-slate-900">{pickupAddress || '-'}</p>
                            {pickupCity && pickupState && (
                              <p className="text-sm text-slate-500">{pickupCity}, {pickupState} {pickupZip}</p>
                            )}
                          </div>
                        </div>
                        <div className="p-8 border-r border-slate-100">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-blue-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Delivery Location
                          </h3>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-slate-900">{dropoffAddress || '-'}</p>
                            {dropoffCity && dropoffState && (
                              <p className="text-sm text-slate-500">{dropoffCity}, {dropoffState} {dropoffZip}</p>
                            )}
                          </div>
                        </div>
                        <div className="p-8">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-blue-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Transport Distance
                          </h3>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-slate-900">
                              {distanceMiles ? `${Math.round(distanceMiles).toLocaleString()} miles` : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Route Map */}
                    {pdfSections.routeMap && (
                      <div className="p-8 border-b border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 12.382V2.618a2 2 0 00-1.553-1.894L15 0m0 17V2" />
                          </svg>
                          Route Map
                        </h3>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <span>From: {pickupCity ? `${pickupCity}, ${pickupState}` : pickupAddress || '-'}</span>
                            <span>To: {dropoffCity ? `${dropoffCity}, ${dropoffState}` : dropoffAddress || '-'}</span>
                            <span>Distance: {distanceMiles ? `${Math.round(distanceMiles).toLocaleString()} miles` : '—'}</span>
                          </div>
                          <div className="mt-4 h-32 rounded-md border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                            Route map preview appears here
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cargo Details */}
                    {pdfSections.cargoDetails && (
                      <div className="p-8 border-b border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14l-8-4m8 4v14m-8-4V7" />
                          </svg>
                          Cargo Details
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b-2 border-slate-200">
                                <th className="text-left py-2 px-3 text-xs uppercase font-bold text-slate-500 tracking-widest">Description</th>
                                <th className="text-center py-2 px-3 text-xs uppercase font-bold text-slate-500 tracking-widest">Qty</th>
                                <th className="text-right py-2 px-3 text-xs uppercase font-bold text-slate-500 tracking-widest">Dims (ft)</th>
                                <th className="text-right py-2 px-3 text-xs uppercase font-bold text-slate-500 tracking-widest">Weight</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loadItems.length > 0 ? loadItems.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                  <td className="py-2 px-3 font-medium text-slate-900">{item.description}</td>
                                  <td className="text-center py-2 px-3 text-slate-600">{item.quantity}</td>
                                  <td className="text-right py-2 px-3 text-slate-600">
                                    {item.length.toFixed(1)} x {item.width.toFixed(1)} x {item.height.toFixed(1)}
                                  </td>
                                  <td className="text-right py-2 px-3 text-slate-600">{item.weight.toLocaleString()} lbs</td>
                                </tr>
                              )) : (
                                <tr className="border-b border-slate-100">
                                  <td className="py-3 px-3 font-medium text-slate-400" colSpan={4}>No cargo items added</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Load Arrangement Diagrams */}
                    {pdfSections.loadArrangementDiagrams && (
                      <div className="p-8 border-b border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                          </svg>
                          Load Arrangement Diagrams
                        </h3>
                        {activePlan.loads.length > 0 ? (
                          <div className="space-y-4">
                            {activePlan.loads.slice(0, 1).map((load, index) => (
                              <div key={load.id} className="border border-slate-200 rounded-lg p-4">
                                <div className="text-sm font-semibold text-slate-800 mb-3">
                                  Load {index + 1}: {load.recommendedTruck.name}
                                </div>
                                <TrailerDiagram
                                  truck={load.recommendedTruck}
                                  items={load.items}
                                  placements={load.placements}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Add cargo items to generate load diagrams.</p>
                        )}
                      </div>
                    )}

                    {/* Load Compliance (Warnings & Permits) */}
                    {pdfSections.loadCompliance && (
                      <div className="p-8 border-b border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.1 14.02A1 1 0 003.01 19h17.98a1 1 0 00.86-1.5l-8.1-14.02a1 1 0 00-1.72 0z" />
                          </svg>
                          Load Compliance (Warnings & Permits)
                        </h3>
                        <div className="space-y-2 text-sm text-slate-600">
                          <div>Max Dimensions: {maxItemLength.toFixed(1)}&apos; L × {maxItemWidth.toFixed(1)}&apos; W × {maxItemHeight.toFixed(1)}&apos; H</div>
                          <div>Total Weight: {totalCargoWeight.toLocaleString()} lbs</div>
                          {activePlan.warnings.length > 0 ? (
                            <ul className="list-disc list-inside text-amber-600">
                              {activePlan.warnings.map((warning, idx) => (
                                <li key={idx}>{warning}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-emerald-600">No compliance warnings detected.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Permit & Escort Costs */}
                    {pdfSections.permitEscortCosts && (
                      <div className="p-8 border-b border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Permit & Escort Costs
                        </h3>
                        {capturedPermitData && capturedPermitData.statePermits.length > 0 ? (
                          <div>
                            <table className="w-full text-sm border-collapse mb-4">
                              <thead>
                                <tr className="border-b-2 border-slate-200">
                                  <th className="text-left py-2 px-3 text-xs uppercase font-bold text-slate-500">State</th>
                                  <th className="text-right py-2 px-3 text-xs uppercase font-bold text-slate-500">Permit Fee</th>
                                  <th className="text-right py-2 px-3 text-xs uppercase font-bold text-slate-500">Escort Cost</th>
                                  <th className="text-right py-2 px-3 text-xs uppercase font-bold text-slate-500">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {capturedPermitData.statePermits.map((p) => (
                                  <tr key={p.stateCode} className="border-b border-slate-100">
                                    <td className="py-2 px-3 text-slate-900">{p.stateName} ({p.stateCode})</td>
                                    <td className="text-right py-2 px-3 text-slate-600">{formatCurrency(p.permitFees)}</td>
                                    <td className="text-right py-2 px-3 text-slate-600">{formatCurrency(p.escortFees)}</td>
                                    <td className="text-right py-2 px-3 font-semibold text-slate-900">{formatCurrency(p.totalCost)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-slate-300">
                                  <td className="py-3 px-3 text-right font-bold text-slate-900" colSpan={3}>Total Permit & Escort Costs</td>
                                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(capturedPermitData.totalCost)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-600">
                            No permit data available. Visit the Permits tab with route and cargo details to calculate permit costs.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Services Section */}
                    {pdfSections.servicesTable && (
                      <div className="border-b border-slate-100">
                        <div className="p-8 pb-4">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Inland Transportation Services
                          </h3>
                        </div>

                        <div className="px-8 pb-8">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b-2 border-slate-200">
                                <th className="text-left py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Service Description</th>
                                <th className="text-center py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Qty</th>
                                <th className="text-right py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Unit Rate</th>
                                <th className="text-right py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Line Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {serviceItems.length > 0 ? serviceItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                  <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                                  <td className="text-center py-3 px-4 text-slate-600">{item.quantity}</td>
                                  <td className="text-right py-3 px-4 text-slate-600">{formatCurrency(item.rate)}</td>
                                  <td className="text-right py-3 px-4 font-semibold text-slate-900">{formatCurrency(item.total)}</td>
                                </tr>
                              )) : (
                                <tr className="border-b border-slate-100">
                                  <td className="py-3 px-4 font-medium text-slate-400" colSpan={4}>No services added yet</td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 border-slate-300">
                                <td colSpan={3} className="py-4 px-4 text-right text-base font-bold text-slate-900 uppercase tracking-wide">
                                  Subtotal (Services)
                                </td>
                                <td className="py-4 px-4 text-right text-xl font-bold text-slate-900">
                                  {formatCurrency(servicesTotal)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Accessorial Charges */}
                    {pdfSections.accessorialCharges && (
                      <div className="border-b border-slate-100">
                        <div className="p-8 pb-4">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
                            </svg>
                            Accessorial Charges
                          </h3>
                        </div>
                        <div className="px-8 pb-8">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b-2 border-slate-200">
                                <th className="text-left py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Charge</th>
                                <th className="text-center py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Qty</th>
                                <th className="text-right py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Unit Rate</th>
                                <th className="text-right py-3 px-4 text-xs uppercase font-bold text-slate-500 tracking-widest">Line Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {accessorialItems.length > 0 ? accessorialItems.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                  <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                                  <td className="text-center py-3 px-4 text-slate-600">{item.quantity}</td>
                                  <td className="text-right py-3 px-4 text-slate-600">{formatCurrency(item.rate)}</td>
                                  <td className="text-right py-3 px-4 font-semibold text-slate-900">{formatCurrency(item.total)}</td>
                                </tr>
                              )) : (
                                <tr className="border-b border-slate-100">
                                  <td className="py-3 px-4 font-medium text-slate-400" colSpan={4}>No accessorial charges added</td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 border-slate-300">
                                <td colSpan={3} className="py-4 px-4 text-right text-base font-bold text-slate-900 uppercase tracking-wide">
                                  Subtotal (Accessorials)
                                </td>
                                <td className="py-4 px-4 text-right text-xl font-bold text-slate-900">
                                  {formatCurrency(accessorialsTotal)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Pricing Summary / Grand Total */}
                    {pdfSections.pricingSummary && (
                      <div className="p-8 border-b border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
                          </svg>
                          Pricing Summary / Grand Total
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="p-4 border border-slate-200 rounded-lg">
                            <div className="text-slate-500">Services</div>
                            <div className="text-lg font-semibold text-slate-900">{formatCurrency(servicesTotal)}</div>
                          </div>
                          <div className="p-4 border border-slate-200 rounded-lg">
                            <div className="text-slate-500">Accessorials</div>
                            <div className="text-lg font-semibold text-slate-900">{formatCurrency(accessorialsTotal)}</div>
                          </div>
                          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="text-slate-500">Grand Total</div>
                            <div className="text-xl font-bold text-slate-900">{formatCurrency(grandTotal)}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms & Notes */}
                    {pdfSections.termsNotes && (
                      <div className="p-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z" />
                          </svg>
                          Terms & Notes
                        </h3>
                        <div className="text-sm text-slate-600 whitespace-pre-line">
                          {quoteNotes || 'No additional terms or notes provided.'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('compare')}>
                  Back to Compare
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Quote Summary */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Route Summary */}
              {(pickupAddress || dropoffAddress) && (
                <div className="space-y-2">
                  {pickupAddress && (
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">From:</span>{' '}
                      {pickupCity || pickupAddress}
                      {pickupState && `, ${pickupState}`}
                    </div>
                  )}
                  {dropoffAddress && (
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">To:</span>{' '}
                      {dropoffCity || dropoffAddress}
                      {dropoffState && `, ${dropoffState}`}
                    </div>
                  )}
                  {distanceMiles ? (
                    <div className="text-sm text-muted-foreground">
                      Distance: {distanceMiles.toLocaleString()} miles
                    </div>
                  ) : null}
                </div>
              )}

              {/* Cargo Summary */}
              {cargoItems.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Cargo</div>
                    <div className="text-sm text-muted-foreground">
                      {cargoItems.reduce((sum, i) => sum + i.quantity, 0)} items
                      {activePlan && (
                        <>
                          {' '}
                          &bull; {(activePlan.totalWeight / 1000).toFixed(1)}k lbs
                        </>
                      )}
                    </div>
                    {activePlan && (
                      <Badge variant="outline">
                        {activePlan.totalTrucks} truck{activePlan.totalTrucks > 1 ? 's' : ''} needed
                      </Badge>
                    )}
                  </div>
                </>
              )}

              {/* Services Summary */}
              {serviceItems.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Services ({serviceItems.length})</div>
                    {serviceItems.slice(0, 4).map((service) => (
                      <div key={service.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{service.name}</span>
                        <span className="font-mono">{formatCurrency(service.total || 0)}</span>
                      </div>
                    ))}
                    {serviceItems.length > 4 && (
                      <div className="text-sm text-muted-foreground">
                        +{serviceItems.length - 4} more...
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold font-mono text-primary">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Date */}
              <div className="text-sm text-muted-foreground text-center pt-2">
                {currentDate && formatDate(currentDate)}
              </div>
            </CardContent>
          </Card>

          {/* Route Map */}
          <RouteMap
            pickup={
              pickupAddress && pickupCity && pickupState
                ? {
                    address: pickupAddress,
                    city: pickupCity,
                    state: pickupState,
                    zip: pickupZip,
                  }
                : undefined
            }
            dropoff={
              dropoffAddress && dropoffCity && dropoffState
                ? {
                    address: dropoffAddress,
                    city: dropoffCity,
                    state: dropoffState,
                    zip: dropoffZip,
                  }
                : undefined
            }
            onRouteCalculated={(data) => {
              setDistanceMiles(data.distance_miles);
              setDurationMinutes(data.duration_minutes);
              toast.success('Route calculated successfully');
            }}
            className="mt-4"
          />
        </div>
      </div>
    </div>
  );
}
