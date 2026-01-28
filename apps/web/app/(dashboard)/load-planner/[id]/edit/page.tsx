'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  useLoadPlannerQuote,
  useCreateLoadPlannerQuote,
  useUpdateLoadPlannerQuote,
} from '@/lib/hooks/operations';
import type { LoadPlannerQuote, CargoItem, LoadPlannerTruck } from '@/types/load-planner-quotes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Trash2, User, MapPin, Package, Truck, DollarSign, FileWarning, FileText, Upload, Plus, Copy, MessageSquare, ChevronDown, ChevronUp, Layers, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { CustomerForm } from '@/components/quotes/customer-form';
import { RouteMap } from '@/components/load-planner/route-map';
import { UniversalDropzone } from '@/components/load-planner/UniversalDropzone';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ServiceItem {
  id: string;
  name: string;
  billing_unit?: string;
  quantity: number;
  rate: number;
  total: number;
  notes?: string;
  showNotes?: boolean;
  [key: string]: unknown;
}

interface AccessorialItem {
  id: string;
  name: string;
  billing_unit: string;
  quantity: number;
  rate: number;
  total: number;
}

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

  // Cargo entry mode
  const [cargoEntryMode, setCargoEntryMode] = useState<'ai' | 'manual'>('ai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setAnalysisError] = useState<string | null>(null);
  const [parsingStatus, setParsingStatus] = useState<string>('');

  // Manual cargo entry
  const [manualDescription, setManualDescription] = useState('');
  const [manualLength, setManualLength] = useState('');
  const [manualWidth, setManualWidth] = useState('');
  const [manualHeight, setManualHeight] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [manualQuantity, setManualQuantity] = useState('1');
  const [isEquipmentMode, setIsEquipmentMode] = useState(false);
  const [, setSelectedMakeId] = useState<string | null>(null);
  const [, setSelectedModelId] = useState<string | null>(null);
  const [lengthUnit, setLengthUnit] = useState('feet');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [selectedCargoTypeId, setSelectedCargoTypeId] = useState<string | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<CargoItem | null>(null);

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

  // Computed totals
  const servicesTotal = serviceItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const accessorialsTotal = accessorialItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const grandTotal = servicesTotal + accessorialsTotal;

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
      
      setSubtotalCents(quote.subtotalCents);
      setTotalCents(quote.totalCents);
    }
  }, [quote, isEdit]);

  const handleAnalyzed = (result: { items: unknown[] }) => {
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
    toast.success(`Added ${newCargoItems.length} cargo items`);
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
    // Validate inputs
    if (!manualDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!manualLength || !manualWidth || !manualHeight || !manualWeight) {
      toast.error('Please enter all dimensions and weight');
      return;
    }

    // Convert units to feet/lbs for storage
    const lengthFeet = convertLengthToFeet(parseFloat(manualLength), lengthUnit);
    const widthFeet = convertLengthToFeet(parseFloat(manualWidth), lengthUnit);
    const heightFeet = convertLengthToFeet(parseFloat(manualHeight), lengthUnit);
    const weightLbs = convertWeightToLbs(parseFloat(manualWeight), weightUnit);

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
      sortOrder: cargoItems.length,
    };

    setCargoItems([...cargoItems, newItem]);
    setLastAddedItem(newItem);
    
    // Clear form
    setManualDescription('');
    setManualLength('');
    setManualWidth('');
    setManualHeight('');
    setManualWeight('');
    setManualQuantity('1');
    
    toast.success('Cargo item added');
  };

  // Pricing helper functions
  const addServiceItem = (truckIndex?: number) => {
    const newItem = {
      id: `service-${Date.now()}`,
      name: 'Custom Service',
      quantity: 1,
      rate: 0,
      total: 0,
      truckIndex: truckIndex ?? null,
      showNotes: false,
      notes: '',
    };
    setServiceItems([...serviceItems, newItem]);
  };

  const updateServiceItem = (index: number, field: string, value: unknown) => {
    const updated = [...serviceItems];
    if (field === 'rate') {
      const cents = typeof value === 'string' ? parseWholeDollarsToCents(value) : (value as number);
      updated[index]!.rate = cents;
      updated[index]!.total = cents * updated[index]!.quantity;
    } else if (field === 'quantity') {
      const qty = parseInt(String(value)) || 1;
      updated[index]!.quantity = qty;
      updated[index]!.total = updated[index]!.rate * qty;
    } else {
      updated[index]![field] = value;
    }
    setServiceItems(updated);
  };

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const duplicateServiceItem = (index: number) => {
    const item = { ...serviceItems[index]!, id: `service-${Date.now()}` };
    setServiceItems([...serviceItems, item]);
  };

  const toggleServiceNotes = (index: number) => {
    const updated = [...serviceItems];
    updated[index]!.showNotes = !updated[index]!.showNotes;
    setServiceItems(updated);
  };

  const addServiceBundle = () => {
    // Placeholder for service bundles
    toast.info('Service bundles coming soon');
  };

  const addAccessorialItem = () => {
    const newItem = {
      id: `accessorial-${Date.now()}`,
      name: 'Detention',
      billing_unit: 'Flat',
      quantity: 1,
      rate: 0,
      total: 0,
    };
    setAccessorialItems([...accessorialItems, newItem]);
  };

  const updateAccessorialItem = (index: number, field: string, value: unknown) => {
    const updated = [...accessorialItems];
    if (field === 'rate') {
      const cents = typeof value === 'string' ? parseWholeDollarsToCents(value) : (value as number);
      updated[index]!.rate = cents;
      updated[index]!.total = cents * updated[index]!.quantity;
    } else if (field === 'quantity') {
      const qty = parseInt(String(value)) || 1;
      updated[index]!.quantity = qty;
      updated[index]!.total = updated[index]!.rate * qty;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated[index]! as any)[field] = value;
    }
    setAccessorialItems(updated);
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
  const serviceOptions = [
    { value: 'line-haul', label: 'Line Haul' },
    { value: 'fuel-surcharge', label: 'Fuel Surcharge' },
    { value: 'loading', label: 'Loading/Unloading' },
    { value: 'tarping', label: 'Tarping' },
    { value: 'escort', label: 'Escort' },
    { value: 'permit', label: 'Permit' },
    { value: 'custom', label: 'Custom Service' },
  ];

  const accessorialOptions = [
    { value: 'Detention', label: 'Detention' },
    { value: 'Layover', label: 'Layover' },
    { value: 'Tolls', label: 'Tolls' },
    { value: 'TONU', label: 'TONU (Truck Ordered Not Used)' },
    { value: 'Weekend Delivery', label: 'Weekend Delivery' },
    { value: 'After Hours', label: 'After Hours' },
  ];

  const billingUnitOptions = [
    { value: 'Flat', label: 'Flat' },
    { value: 'Per Hour', label: 'Per Hour' },
    { value: 'Per Day', label: 'Per Day' },
    { value: 'Per Mile', label: 'Per Mile' },
  ];

  const SERVICE_BUNDLES = [
    { name: 'Standard Flatbed', services: [{ name: 'Line Haul', rate: 0 }, { name: 'Fuel Surcharge', rate: 0 }] },
    { name: 'Oversized Load', services: [{ name: 'Line Haul', rate: 0 }, { name: 'Fuel Surcharge', rate: 0 }, { name: 'Permit', rate: 0 }] },
  ];

  const handleSaveQuote = async () => {
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
      // Use browser's print functionality to generate PDF
      window.print();
      toast.success('PDF download ready');
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
                    <Input
                      id="pickupAddress"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
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
                    <Input
                      id="dropoffAddress"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
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
                      onError={setAnalysisError}
                      onStatusChange={setParsingStatus}
                    />
                    {/* Parsing Status Indicator */}
                    {isAnalyzing && parsingStatus && (
                      <div className="p-4 border rounded-lg bg-muted">
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
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium">Equipment Mode</span>
                          <p className="text-xs text-muted-foreground">
                            Select equipment from database to auto-fill dimensions
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isEquipmentMode}
                        onCheckedChange={(checked) => {
                          setIsEquipmentMode(checked);
                          if (!checked) {
                            setSelectedMakeId(null);
                            setSelectedModelId(null);
                          }
                        }}
                      />
                    </div>

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
                      <Label className="text-xs font-medium">Cargo Type</Label>
                      <select
                        value={selectedCargoTypeId || ''}
                        onChange={(e) => setSelectedCargoTypeId(e.target.value || null)}
                        className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                      >
                        <option value="">Select cargo type for auto-fill...</option>
                        <option value="general">General Cargo</option>
                        <option value="machinery">Machinery</option>
                        <option value="vehicles">Vehicles</option>
                        <option value="livestock">Livestock</option>
                        <option value="hazmat">Hazardous Materials</option>
                      </select>
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
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Truck selection and load planning will be available once you add cargo items.
                      </p>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          💡 Smart truck recommendation engine will automatically suggest the best trucks based on your cargo specifications, route distance, and permit requirements.
                        </p>
                      </div>
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
                            onChange={() => addServiceBundle()}
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
                            <Button variant="outline" size="sm" onClick={() => addServiceBundle()}>
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
                          {serviceItems.map((service, index) => (
                            <div key={service.id} className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 p-2 rounded bg-muted/30">
                                <SearchableSelect
                                  value={service.name}
                                  onChange={(value) => {
                                    const selected = serviceOptions.find(s => s.label === value);
                                    if (selected) {
                                      updateServiceItem(index, 'name', selected.label);
                                    }
                                  }}
                                  options={serviceOptions.map((s): SearchableSelectOption => ({
                                    value: s.label,
                                    label: s.label,
                                  }))}
                                  placeholder="Select service"
                                  searchPlaceholder="Search services..."
                                  className="w-full sm:w-[180px]"
                                />
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
                                    value={formatWholeDollars(service.rate)}
                                    onChange={(e) => updateServiceItem(index, 'rate', e.target.value)}
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
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Per-truck pricing
                    <div className="space-y-6">
                      <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg bg-muted/30">
                        Per-truck pricing requires load planning first. Add cargo and complete truck selection.
                      </div>
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
                                    value={formatWholeDollars(accessorial.rate)}
                                    onChange={(e) => updateAccessorialItem(index, 'rate', e.target.value)}
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
                          Services: {formatCurrency(servicesTotal)} + Accessorials: {formatCurrency(accessorialsTotal)}
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
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium text-sm">Permit Intelligence</span>
                        </div>
                        <p className="text-sm text-blue-600">
                          Advanced permit calculation will automatically analyze your route and cargo to determine required permits for each state, including oversized/overweight permits and escort requirements.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">Route</div>
                            <div className="text-sm text-muted-foreground">
                              {pickupCity && pickupState ? `${pickupCity}, ${pickupState}` : pickupAddress} → {dropoffCity && dropoffState ? `${dropoffCity}, ${dropoffState}` : dropoffAddress}
                            </div>
                          </div>
                          {distanceMiles > 0 && (
                            <Badge variant="secondary">{distanceMiles.toFixed(0)} miles</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">Cargo Items</div>
                            <div className="text-sm text-muted-foreground">
                              {cargoItems.length} item{cargoItems.length !== 1 ? 's' : ''} added
                            </div>
                          </div>
                          <Badge variant="secondary">
                            Max: {Math.max(...cargoItems.map(i => i.lengthIn / 12)).toFixed(1)}&apos; × {Math.max(...cargoItems.map(i => i.widthIn / 12)).toFixed(1)}&apos; × {Math.max(...cargoItems.map(i => i.heightIn / 12)).toFixed(1)}&apos;
                          </Badge>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 text-amber-700 mb-2">
                            <FileWarning className="h-4 w-4" />
                            <span className="font-medium text-sm">Manual Review Required</span>
                          </div>
                          <p className="text-sm text-amber-600">
                            Detailed permit requirements and state-by-state analysis will be available in the full implementation. Contact your permit specialist for accurate permit costs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('pricing')}>
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
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">Quote Preview</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px] h-9 bg-white text-slate-900 border-slate-200">
                      <SelectValue placeholder="Select sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          All Sections
                        </div>
                      </SelectItem>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer Info
                        </div>
                      </SelectItem>
                      <SelectItem value="route">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Route Details
                        </div>
                      </SelectItem>
                      <SelectItem value="cargo">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Cargo Items
                        </div>
                      </SelectItem>
                      <SelectItem value="pricing">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Pricing
                        </div>
                      </SelectItem>
                      <SelectItem value="permits">
                        <div className="flex items-center gap-2">
                          <FileWarning className="h-4 w-4" />
                          Permits
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={handleDownloadPdf} 
                    disabled={isDownloadingPdf}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
                  </Button>
                </div>
              </div>

              {/* PDF Content */}
              <div className="bg-white rounded-lg overflow-auto" style={{ maxHeight: '70vh' }}>
                {/* Main Card */}
                <div className="max-w-5xl mx-auto px-6 py-2">
                  <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
                    {/* Header Section */}
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

                    {/* Client Information */}
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

                    {/* Transport Distance */}
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

                    {/* Services Section */}
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
                                  {formatCurrency(grandTotal)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('permits')}>
                  Back to Permits
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
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-bold font-mono text-primary">
                  {formatCurrency(totalCents)}
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
