"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2, MapPin, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuoteFormValues } from "@/types/quotes";

interface QuoteStopsBuilderProps {
  form: UseFormReturn<QuoteFormValues>;
}

const STOP_TYPE_COLORS = {
  PICKUP: "border-blue-200 bg-blue-50/50",
  DELIVERY: "border-green-200 bg-green-50/50",
  STOP: "border-gray-200 bg-gray-50/50",
} as const;

const STOP_TYPE_DOT_COLORS = {
  PICKUP: "bg-blue-500",
  DELIVERY: "bg-green-500",
  STOP: "bg-gray-400",
} as const;

export function QuoteStopsBuilder({ form }: QuoteStopsBuilderProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  const handleAddStop = () => {
    const nextSeq = fields.length + 1;
    append({
      type: "STOP",
      city: "",
      state: "",
      sequence: nextSeq,
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const stopType = form.watch(`stops.${index}.type`);
        const isFirst = index === 0;
        const isLast = index === fields.length - 1;
        const canDelete = fields.length > 2;

        return (
          <Card
            key={field.id}
            className={cn("relative", STOP_TYPE_COLORS[stopType] ?? STOP_TYPE_COLORS.STOP)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      STOP_TYPE_DOT_COLORS[stopType] ?? STOP_TYPE_DOT_COLORS.STOP
                    )}
                  />
                  <CardTitle className="text-sm font-semibold">
                    Stop {index + 1}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`stops.${index}.type`}
                    render={({ field: typeField }) => (
                      <Select
                        value={typeField.value}
                        onValueChange={typeField.onChange}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
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
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* City / State row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`stops.${index}.city`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Chicago" {...f} className="h-9" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`stops.${index}.state`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">State *</FormLabel>
                      <FormControl>
                        <Input placeholder="IL" maxLength={2} {...f} className="h-9" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
              <FormField
                control={form.control}
                name={`stops.${index}.address`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Industrial Blvd"
                        {...f}
                        value={f.value ?? ""}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Facility / Zip */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`stops.${index}.facilityName`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Facility</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Warehouse name"
                          {...f}
                          value={f.value ?? ""}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`stops.${index}.zipCode`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">ZIP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="60601"
                          maxLength={10}
                          {...f}
                          value={f.value ?? ""}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`stops.${index}.appointmentDate`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...f}
                          value={f.value ?? ""}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`stops.${index}.appointmentTime`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...f}
                          value={f.value ?? ""}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact / Phone */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`stops.${index}.contactName`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact name"
                          {...f}
                          value={f.value ?? ""}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`stops.${index}.contactPhone`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(312) 555-0142"
                          {...f}
                          value={f.value ?? ""}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name={`stops.${index}.notes`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Dock #, call ahead, special instructions..."
                        rows={2}
                        {...f}
                        value={f.value ?? ""}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleAddStop}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Stop
      </Button>
    </div>
  );
}
