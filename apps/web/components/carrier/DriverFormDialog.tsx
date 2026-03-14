'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Driver,
  DriverStatus,
  CdlClass,
  CreateDriverInput,
  UpdateDriverInput,
  useCreateDriver,
  useUpdateDriver,
} from '@/lib/hooks/carrier/use-drivers';

const driverFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .regex(/^[A-Z0-9]{5,20}$/, 'License number format is invalid'),
  licenseState: z
    .string()
    .min(1, 'License state is required')
    .length(2, 'License state must be 2 characters'),
  cdlClass: z.enum([CdlClass.A, CdlClass.B, CdlClass.C] as const),
  licenseExpiration: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-()+]{10,}$/.test(val),
      'Phone number format is invalid'
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Email format is invalid'
    ),
  status: z.enum([
    DriverStatus.ACTIVE,
    DriverStatus.INACTIVE,
    DriverStatus.SUSPENDED,
  ]),
  medicalCardExpiration: z.string().optional(),
  hireDate: z.string().optional(),
  notes: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver;
}

export function DriverFormDialog({
  open,
  onOpenChange,
  driver,
}: DriverFormDialogProps) {
  const isEditing = !!driver;
  const createDriverMutation = useCreateDriver();
  const updateDriverMutation = useUpdateDriver();

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: driver
      ? {
          firstName: driver.firstName,
          lastName: driver.lastName,
          licenseNumber: driver.cdlNumber,
          licenseState: driver.cdlState,
          cdlClass: driver.cdlClass,
          licenseExpiration: driver.cdlExpiration
            ? new Date(driver.cdlExpiration).toISOString().split('T')[0]
            : undefined,
          phone: driver.phone || '',
          email: driver.email || '',
          status: driver.status,
          medicalCardExpiration: driver.medicalCardExpiration
            ? new Date(driver.medicalCardExpiration).toISOString().split('T')[0]
            : undefined,
          hireDate: driver.hireDate
            ? new Date(driver.hireDate).toISOString().split('T')[0]
            : undefined,
          notes: driver.notes || '',
        }
      : {
          firstName: '',
          lastName: '',
          licenseNumber: '',
          licenseState: '',
          cdlClass: CdlClass.A,
          status: DriverStatus.ACTIVE,
        },
  });

  const isLoading =
    createDriverMutation.isPending || updateDriverMutation.isPending;

  async function onSubmit(values: DriverFormValues) {
    try {
      if (isEditing && driver) {
        const input: UpdateDriverInput = {
          firstName: values.firstName,
          lastName: values.lastName,
          licenseNumber: values.licenseNumber,
          licenseState: values.licenseState,
          cdlClass: values.cdlClass,
          licenseExpiration: values.licenseExpiration,
          phone: values.phone,
          email: values.email,
          status: values.status,
          medicalCardExpiration: values.medicalCardExpiration,
          hireDate: values.hireDate,
          notes: values.notes,
        };
        await updateDriverMutation.mutateAsync({
          driverId: driver.id,
          input,
        });
      } else {
        const input: CreateDriverInput = {
          firstName: values.firstName,
          lastName: values.lastName,
          licenseNumber: values.licenseNumber,
          licenseState: values.licenseState,
          cdlClass: values.cdlClass,
          licenseExpiration: values.licenseExpiration,
          phone: values.phone,
          email: values.email,
          medicalCardExpiration: values.medicalCardExpiration,
          hireDate: values.hireDate,
          notes: values.notes,
        };
        await createDriverMutation.mutateAsync(input);
      }
      onOpenChange(false);
      form.reset();
    } catch {
      // Error toast handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update driver information'
              : 'Add a new driver to your carrier account'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CA"
                        maxLength={2}
                        {...field}
                        value={field.value.toUpperCase()}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cdlClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CDL Class</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select CDL class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CdlClass.A}>Class A</SelectItem>
                        <SelectItem value={CdlClass.B}>Class B</SelectItem>
                        <SelectItem value={CdlClass.C}>Class C</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseExpiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DriverStatus.ACTIVE}>
                          Active
                        </SelectItem>
                        <SelectItem value={DriverStatus.INACTIVE}>
                          Inactive
                        </SelectItem>
                        <SelectItem value={DriverStatus.SUSPENDED}>
                          Suspended
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Driver'
                    : 'Add Driver'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
