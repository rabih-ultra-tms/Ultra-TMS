"use client";

import { UseFormReturn } from "react-hook-form";
import { Snowflake, Container, Flame, Zap, Package, RectangleHorizontal, ArrowDownRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  EQUIPMENT_TYPES,
  EQUIPMENT_TYPE_CONFIG,
  HAZMAT_CLASSES,
  HAZMAT_CLASS_LABELS,
  SPECIAL_HANDLING_OPTIONS,
  type OrderFormValues,
} from "./order-form-schema";

// Icon mapping for equipment types
const EQUIPMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Container: Container,
  Snowflake: Snowflake,
  RectangleHorizontal: RectangleHorizontal,
  ArrowDownRight: ArrowDownRight,
  Zap: Zap,
  Flame: Flame,
  Package: Package,
  MoreHorizontal: MoreHorizontal,
};

interface OrderCargoStepProps {
  form: UseFormReturn<OrderFormValues>;
}

export function OrderCargoStep({ form }: OrderCargoStepProps) {
  const equipmentType = form.watch("equipmentType");
  const isHazmat = form.watch("isHazmat");
  const isReefer = equipmentType === "REEFER";

  return (
    <div className="space-y-6">
      {/* Commodity & Weight */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Cargo Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="commodity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commodity *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Electronics - Consumer"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (lbs) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min={1}
                      max={80000}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pieces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pieces</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min={1}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pallets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pallets</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={30}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Equipment Type *
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="equipmentType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {EQUIPMENT_TYPES.map((type) => {
                      const config = EQUIPMENT_TYPE_CONFIG[type];
                      const IconComponent = EQUIPMENT_ICONS[config.icon];
                      const isSelected = field.value === type;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => field.onChange(type)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors text-center",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          {IconComponent && (
                            <IconComponent
                              className={cn(
                                "h-6 w-6",
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Temperature Requirements (conditional: Reefer) */}
      {isReefer && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Temperature Requirements
            </CardTitle>
            <CardDescription>
              Required for reefer equipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tempMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Temp (&deg;F) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 34"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tempMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Temp (&deg;F) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 38"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hazmat Toggle & Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Hazmat
            </CardTitle>
            <FormField
              control={form.control}
              name="isHazmat"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardHeader>
        {isHazmat && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="hazmatUnNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UN Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., UN1234"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hazmatClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hazmat Class *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HAZMAT_CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {HAZMAT_CLASS_LABELS[cls]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hazmatPlacard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placard Type *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Flammable"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Special Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Special Handling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="specialHandling"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SPECIAL_HANDLING_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={field.value?.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          if (checked) {
                            field.onChange([...current, option.value]);
                          } else {
                            field.onChange(
                              current.filter((v: string) => v !== option.value)
                            );
                          }
                        }}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Dimensions (optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Dimensions
          </CardTitle>
          <CardDescription>Optional — length, width, height in inches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dimensionLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (in)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensionWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width (in)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensionHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (in)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? Number(val) : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
