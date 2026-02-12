'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import { Search, Building2, ClipboardPaste, Trash2, Users } from 'lucide-react'
import { EmailSignatureDialog } from './email-signature-dialog'
import type { ParsedSignature } from '@/lib/email-signature-parser'
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanies } from '@/lib/hooks/crm/use-companies'
import { useContacts } from '@/lib/hooks/crm/use-contacts'

export interface CustomerAddress {
  address: string
  city: string
  state: string
  zip: string
}

interface CustomerFormProps {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCompany: string
  customerAddress?: string | CustomerAddress
  internalNotes?: string
  onCustomerNameChange: (value: string) => void
  onCustomerEmailChange: (value: string) => void
  onCustomerPhoneChange: (value: string) => void
  onCustomerCompanyChange: (value: string) => void
  onCustomerAddressChange?: (value: CustomerAddress) => void
  onInternalNotesChange?: (value: string) => void
  onCompanySelect?: (id: string, name: string) => void
  onContactSelect?: (id: string, name: string) => void
}

type SelectionMode = 'browse' | 'search' | 'manual'

export function CustomerForm({
  customerName,
  customerEmail,
  customerPhone,
  customerCompany,
  customerAddress,
  internalNotes,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onCustomerCompanyChange,
  onCustomerAddressChange,
  onInternalNotesChange,
  onCompanySelect,
  onContactSelect,
}: CustomerFormProps) {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('browse')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [selectedContactId, setSelectedContactId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Helper to get customer address as an object
  const getCustomerAddressObj = (): CustomerAddress => {
    if (!customerAddress) {
      return { address: '', city: '', state: '', zip: '' }
    }
    if (typeof customerAddress === 'string') {
      return { address: customerAddress, city: '', state: '', zip: '' }
    }
    return customerAddress
  }

  const addressObj = getCustomerAddressObj()

  // Helper to update customer address field
  const updateCustomerAddressField = (field: keyof CustomerAddress, value: string) => {
    if (onCustomerAddressChange) {
      onCustomerAddressChange({ ...addressObj, [field]: value })
    }
  }

  // Fetch all companies for browse mode
  const { data: companiesData, isLoading: companiesLoading } = useCompanies(
    selectionMode === 'browse' ? { limit: 100 } : {}
  )

  // Fetch companies for search mode
  const { data: searchResults, isLoading: searchLoading } = useCompanies(
    selectionMode === 'search' && searchQuery.length >= 2
      ? { search: searchQuery, limit: 10 }
      : {}
  )

  // Fetch contacts for selected company
  const { data: contactsData, isLoading: contactsLoading } = useContacts(
    selectedCompanyId ? { companyId: selectedCompanyId, limit: 50 } : {}
  )

  // Auto-select primary contact when contacts load
  useEffect(() => {
    if (contactsData?.data && contactsData.data.length > 0 && selectedCompanyId && !selectedContactId) {
      const primaryContact = contactsData.data.find(c => c.isPrimary)
      if (primaryContact) {
        setSelectedContactId(primaryContact.id)
        const fullName = `${primaryContact.firstName} ${primaryContact.lastName}`.trim()
        onCustomerNameChange(fullName)
        if (primaryContact.email) onCustomerEmailChange(primaryContact.email)
        if (primaryContact.phone) onCustomerPhoneChange(primaryContact.phone)
        // Call optional callback
        if (onContactSelect) {
          onContactSelect(primaryContact.id, fullName)
        }
      }
    }
  }, [contactsData, selectedCompanyId, selectedContactId, onCustomerNameChange, onCustomerEmailChange, onCustomerPhoneChange, onContactSelect])

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setSelectedContactId('')

    const companies = selectionMode === 'browse' 
      ? companiesData?.data 
      : searchResults?.data
    const company = companies?.find(c => c.id === companyId)
    
    if (company) {
      onCustomerCompanyChange(company.name)
      if (company.phone) onCustomerPhoneChange(company.phone)
      // Update address if available and handler exists
      if (onCustomerAddressChange && company.address) {
        const street = typeof company.address === 'string' 
          ? company.address 
          : company.address.street1 || ''
        onCustomerAddressChange({
          address: street,
          city: company.address.city || '',
          state: company.address.state || '',
          zip: company.address.postalCode || '',
        })
      }
      // Call optional callback
      if (onCompanySelect) {
        onCompanySelect(company.id, company.name)
      }
    }
  }

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId)

    const contact = contactsData?.data?.find(c => c.id === contactId)
    if (contact) {
      const fullName = `${contact.firstName} ${contact.lastName}`.trim()
      onCustomerNameChange(fullName)
      if (contact.email) onCustomerEmailChange(contact.email)
      if (contact.phone) onCustomerPhoneChange(contact.phone)
      // Call optional callback
      if (onContactSelect) {
        onContactSelect(contact.id, fullName)
      }
    }
  }

  const handleSearchCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setSelectedContactId('')
    
    const company = searchResults?.data?.find(c => c.id === companyId)
    if (company) {
      onCustomerCompanyChange(company.name)
      if (company.phone) onCustomerPhoneChange(company.phone)
      // Update address if available and handler exists
      if (onCustomerAddressChange && company.address) {
        const street = typeof company.address === 'string' 
          ? company.address 
          : company.address.street1 || ''
        onCustomerAddressChange({
          address: street,
          city: company.address.city || '',
          state: company.address.state || '',
          zip: company.address.postalCode || '',
        })
      }
      // Call optional callback
      if (onCompanySelect) {
        onCompanySelect(company.id, company.name)
      }
    }
    
    // Switch to browse mode so contacts load and auto-select primary
    setSelectionMode('browse')
    setSearchQuery('')
  }

  const handleApplySignature = (parsed: ParsedSignature) => {
    if (parsed.fullName) onCustomerNameChange(parsed.fullName)
    if (parsed.email) onCustomerEmailChange(parsed.email)
    if (parsed.phone) onCustomerPhoneChange(parsed.phone)
    if (parsed.mobile && !parsed.phone) onCustomerPhoneChange(parsed.mobile)
    if (parsed.company) onCustomerCompanyChange(parsed.company)
  }

  const clearSelection = () => {
    setSelectedCompanyId('')
    setSelectedContactId('')
    onCustomerNameChange('')
    onCustomerEmailChange('')
    onCustomerPhoneChange('')
    onCustomerCompanyChange('')
  }

  // Memoize company options for browse mode
  const companyOptions = useMemo((): SearchableSelectOption[] => {
    if (!companiesData?.data) return []
    return companiesData.data.map((company): SearchableSelectOption => ({
      value: company.id,
      label: company.name,
      description: company.phone || undefined,
    }))
  }, [companiesData])

  return (
    <div className="space-y-6">
      {/* Selection Mode Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant={selectionMode === 'browse' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectionMode('browse')}
        >
          <Building2 className="h-4 w-4 mr-2" />
          Browse Companies
        </Button>
        <Button
          type="button"
          variant={selectionMode === 'search' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectionMode('search')}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button
          type="button"
          variant={selectionMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectionMode('manual')}
        >
          Manual Entry
        </Button>
        <EmailSignatureDialog
          onApply={handleApplySignature}
          trigger={
            <Button type="button" variant="outline" size="sm">
              <ClipboardPaste className="h-4 w-4 mr-2" />
              Paste Signature
            </Button>
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Form
        </Button>
      </div>

      {/* Browse Mode - Company and Contact Dropdowns */}
      {selectionMode === 'browse' && (
        <div className="space-y-4 p-4 rounded-lg border bg-card">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Company</Label>
              <SearchableSelect
                value={selectedCompanyId}
                onChange={handleCompanySelect}
                options={companyOptions}
                placeholder={companiesLoading ? "Loading..." : "Choose a company..."}
                searchPlaceholder="Search companies..."
                disabled={companiesLoading}
                emptyMessage="No companies found"
                className="bg-background"
              />
            </div>

            {/* Contact Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Contact</Label>
              <Select
                value={selectedContactId}
                onValueChange={handleContactSelect}
                disabled={!selectedCompanyId || contactsLoading}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    placeholder={
                      !selectedCompanyId
                        ? "Select company first"
                        : contactsLoading
                          ? "Loading..."
                          : "Choose a contact..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-popover">
                  {contactsData?.data?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.firstName} {contact.lastName}</span>
                        {contact.isPrimary && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCompanyId && contactsData?.data?.length === 0 && (
                <p className="text-sm text-muted-foreground">No contacts for this company</p>
              )}
            </div>
          </div>

          {(selectedCompanyId || selectedContactId) && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearSelection}
              className="mt-2"
            >
              Clear Selection
            </Button>
          )}
        </div>
      )}

      {/* Search Mode */}
      {selectionMode === 'search' && (
        <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
          <Label>Search Existing Companies</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery.length >= 2 && searchLoading && (
            <p className="text-sm text-muted-foreground mt-2">Searching...</p>
          )}
          {searchQuery.length >= 2 && searchResults && searchResults.data && searchResults.data.length > 0 && (
            <div className="mt-2 border rounded-lg divide-y max-h-60 overflow-auto">
              {searchResults.data.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => handleSearchCompanySelect(company.id)}
                >
                  <p className="font-medium">{company.name}</p>
                  {company.phone && (
                    <p className="text-sm text-muted-foreground">{company.phone}</p>
                  )}
                </button>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && searchResults?.data?.length === 0 && !searchLoading && (
            <p className="text-sm text-muted-foreground mt-2">No companies found</p>
          )}
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-sm text-muted-foreground mt-2">Type at least 2 characters to search</p>
          )}
        </div>
      )}

      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Contact Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">Contact Name *</Label>
            <Input
              id="customerName"
              placeholder="John Smith"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCompany">Company</Label>
            <Input
              id="customerCompany"
              placeholder="Acme Construction"
              value={customerCompany}
              onChange={(e) => onCustomerCompanyChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="john@company.com"
              value={customerEmail}
              onChange={(e) => onCustomerEmailChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="(555) 123-4567"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
            />
          </div>

          {onCustomerAddressChange && (
            <>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerAddress">Street Address</Label>
                <AddressAutocomplete
                  id="customerAddress"
                  placeholder="123 Main St"
                  value={addressObj.address}
                  onChange={(value) => updateCustomerAddressField('address', value)}
                  onSelect={(components) => {
                    if (onCustomerAddressChange) {
                      onCustomerAddressChange({
                        address: components.address || '',
                        city: components.city || '',
                        state: components.state || '',
                        zip: components.zip || '',
                      })
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerCity">City</Label>
                <Input
                  id="customerCity"
                  placeholder="New York"
                  value={addressObj.city}
                  onChange={(e) => updateCustomerAddressField('city', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="customerState">State</Label>
                  <Input
                    id="customerState"
                    placeholder="NY"
                    maxLength={2}
                    value={addressObj.state}
                    onChange={(e) => updateCustomerAddressField('state', e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerZip">ZIP Code</Label>
                  <Input
                    id="customerZip"
                    placeholder="10001"
                    value={addressObj.zip}
                    onChange={(e) => updateCustomerAddressField('zip', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Internal Notes Section */}
      {onInternalNotesChange && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Internal Notes</h3>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Internal notes (not visible to customer)..."
            value={internalNotes || ''}
            onChange={(e) => onInternalNotesChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
