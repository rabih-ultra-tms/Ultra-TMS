"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2, MapPin, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  type OrderFormValues,
  type StopFormValues,
  createDefaultStop,
} from "./order-form-schema";

const STOP_TYPE_COLORS: Record<string, string> = {
  PICKUP: "bg-blue-100 text-blue-800 border-blue-300",
  DELIVERY: "bg-emerald-100 text-emerald-800 border-emerald-300",
  STOP: "bg-amber-100 text-amber-800 border-amber-300",
};

const STOP_TYPE_LABELS: Record<string, string> = {
  PICKUP: "Pickup",
  DELIVERY: "Delivery",
  STOP: "Stop",
};

interface OrderStopsBuilderProps {
  form: UseFormReturn<OrderFormValues>;
}

export function OrderStopsBuilder({ form }: OrderStopsBuilderProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  const stops = form.watch("stops");
  const hasPickup = stops.some((s: StopFormValues) => s.type === "PICKUP");
  const hasDelivery = stops.some((s: StopFormValues) => s.type === "DELIVERY");

  const addStop = (type: "PICKUP" | "DELIVERY" | "STOP") => {
    append(createDefaultStop(type, fields.length));
  };

  const moveUp = (index: number) => {
    if (index > 0) move(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < fields.length - 1) move(index, index + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Stops ({fields.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addStop("PICKUP")}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Pickup
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addStop("STOP")}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Stop
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addStop("DELIVERY")}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Delivery
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Validation messages */}
          {form.formState.errors.stops && typeof form.formState.errors.stops.message === "string" && (
            <p className="text-sm text-destructive">
              {form.formState.errors.stops.message}
            </p>
          )}
          {!hasPickup && fields.length > 0 && (
            <p className="text-sm text-amber-600">
              At least one pickup stop is required.
            </p>
          )}
          {!hasDelivery && fields.length > 0 && (
            <p className="text-sm text-amber-600">
              At least one delivery stop is required.
            </p>
          )}

          {/* Stop Cards */}
          {fields.map((field, index) => (
            <StopCard
              key={field.id}
              form={form}
              index={index}
              canRemove={fields.length > 2}
              canMoveUp={index > 0}
              canMoveDown={index < fields.length - 1}
              onRemove={() => remove(index)}
              onMoveUp={() => moveUp(index)}
              onMoveDown={() => moveDown(index)}
            />
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No stops added yet.</p>
              <p className="text-sm">
                Add at least one pickup and one delivery stop.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Stop Card ---

function StopCard({
  form,
  index,
  canRemove,
  canMoveUp,
  canMoveDown,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  form: UseFormReturn<OrderFormValues>;
  index: number;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const stopType = form.watch(`stops.${index}.type`);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: stopType === "PICKUP" ? "#3b82f6" : stopType === "DELIVERY" ? "#10b981" : "#f59e0b" }}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
              >
                <ArrowDown className="h-3 w-3 rotate-180" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>

            <Badge
              variant="outline"
              className={cn("text-xs", STOP_TYPE_COLORS[stopType])}
            >
              Stop {index + 1}: {STOP_TYPE_LABELS[stopType]}
            </Badge>

            <FormField
              control={form.control}
              name={`stops.${index}.type`}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PICKUP">Pickup</SelectItem>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                    <SelectItem value="STOP">Stop</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive h-7 w-7 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Facility */}
        <FormField
          control={form.control}
          name={`stops.${index}.facilityName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Facility Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Acme Warehouse"
                  className="h-8 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name={`stops.${index}.address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Address *</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  id={`stops.${index}.address`}
                  value={field.value}
                  onChange={field.onChange}
                  onSelect={(components) => {
                    field.onChange(components.address || field.value);
                    if (components.city) form.setValue(`stops.${index}.city`, components.city);
                    if (components.state) form.setValue(`stops.${index}.state`, components.state);
                    if (components.zip) form.setValue(`stops.${index}.zipCode`, components.zip);
                  }}
                  placeholder="Start typing an address..."
                  className="h-8 text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name={`stops.${index}.city`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">City *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="City"
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`stops.${index}.state`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">State *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ST"
                    maxLength={2}
                    className="h-8 text-sm uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`stops.${index}.zipCode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">ZIP *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00000"
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`stops.${index}.contactName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Contact Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contact name"
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`stops.${index}.contactPhone`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Contact Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(555) 555-5555"
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Appointment */}
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name={`stops.${index}.appointmentDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Date *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`stops.${index}.appointmentTimeFrom`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">From *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`stops.${index}.appointmentTimeTo`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">To</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Special Instructions */}
        <FormField
          control={form.control}
          name={`stops.${index}.instructions`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Special Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Dock 14, call 30 min before arrival"
                  rows={2}
                  maxLength={500}
                  className="text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reference */}
        <FormField
          control={form.control}
          name={`stops.${index}.referenceNumber`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Reference # at Stop</FormLabel>
              <FormControl>
                <Input
                  placeholder="Stop reference"
                  className="h-8 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
