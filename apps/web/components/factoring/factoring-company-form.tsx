'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  CreateFactoringCompanyDto,
  FactoringCompany,
} from '@/lib/hooks/factoring';

interface FactoringCompanyFormProps {
  company?: FactoringCompany | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dto: CreateFactoringCompanyDto) => Promise<void>;
  isLoading: boolean;
}

const verificationMethods = [
  'PHONE_CALL',
  'EMAIL',
  'FAX',
  'ONLINE_PORTAL',
  'MAIL',
];
const statuses = ['ACTIVE', 'INACTIVE'];

export function FactoringCompanyForm({
  company,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
}: FactoringCompanyFormProps) {
  const isEditing = !!company;

  const [formData, setFormData] = useState<CreateFactoringCompanyDto>({
    companyCode: company?.companyCode ?? '',
    name: company?.name ?? '',
    email: company?.email ?? '',
    phone: company?.phone ?? '',
    fax: company?.fax ?? '',
    address: company?.address ?? '',
    verificationMethod:
      (company?.verificationMethod as
        | 'PHONE_CALL'
        | 'EMAIL'
        | 'FAX'
        | 'ONLINE_PORTAL'
        | 'MAIL'
        | undefined) ?? 'EMAIL',
    verificationSLAHours: company?.verificationSLAHours ?? 24,
    status: (company?.status as 'ACTIVE' | 'INACTIVE' | undefined) ?? 'ACTIVE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error(
        'Failed to save company:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Factoring Company' : 'New Factoring Company'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Company Code *</Label>
              <Input
                id="code"
                value={formData.companyCode}
                onChange={(e) =>
                  setFormData({ ...formData, companyCode: e.target.value })
                }
                placeholder="e.g., FC-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Full company name"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="contact@example.com"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={formData.fax ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, fax: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="sla">SLA Hours</Label>
              <Input
                id="sla"
                type="number"
                min="1"
                max="72"
                value={formData.verificationSLAHours ?? 24}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    verificationSLAHours: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Verification Method</Label>
              <Select
                value={formData.verificationMethod}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    verificationMethod: value as
                      | 'PHONE_CALL'
                      | 'EMAIL'
                      | 'FAX'
                      | 'ONLINE_PORTAL'
                      | 'MAIL',
                  })
                }
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {verificationMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as 'ACTIVE' | 'INACTIVE',
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input
              id="endpoint"
              value={formData.apiEndpoint ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, apiEndpoint: e.target.value })
              }
              placeholder="https://api.example.com/v1"
            />
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="apikey">API Key</Label>
              <Input
                id="apikey"
                type="password"
                value={formData.apiKey ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                placeholder="Your API key (encrypted)"
              />
            </div>
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
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
