'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FactoringCompanyForm } from '@/components/factoring/factoring-company-form';
import {
  useFactoringCompanies,
  useCreateFactoringCompany,
  useUpdateFactoringCompany,
  useDeleteFactoringCompany,
  FactoringCompany,
  CreateFactoringCompanyDto,
} from '@/lib/hooks/factoring';
import { Trash2, Edit2 } from 'lucide-react';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | ''>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<FactoringCompany | null>(null);

  const { data, isLoading, refetch } = useFactoringCompanies({
    search: search || undefined,
    status: (status as 'ACTIVE' | 'INACTIVE' | '') || undefined,
  });

  const { mutateAsync: createCompany, isPending: isCreating } =
    useCreateFactoringCompany();
  const { mutateAsync: updateCompany, isPending: isUpdating } =
    useUpdateFactoringCompany(selectedCompany?.id ?? '');
  const { mutateAsync: deleteCompany, isPending: _isDeleting } =
    useDeleteFactoringCompany(selectedCompany?.id ?? '');

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEdit = (company: FactoringCompany) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleDelete = async (company: FactoringCompany) => {
    if (!window.confirm('Are you sure you want to delete this company?'))
      return;
    try {
      setSelectedCompany(company);
      await deleteCompany();
      refetch();
    } catch (_err) {
      console.error('Failed to delete company:', _err);
    }
  };

  const handleFormSubmit = async (dto: CreateFactoringCompanyDto) => {
    if (selectedCompany) {
      await updateCompany(dto);
    } else {
      await createCompany(dto);
    }
    refetch();
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Factoring Companies</h2>
        <Button onClick={handleCreate}>Add Company</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Company name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as 'ACTIVE' | 'INACTIVE' | '')
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verification Method</TableHead>
              <TableHead>SLA Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading companies...
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-mono text-sm">
                    {company.companyCode}
                  </TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.email || '-'}</TableCell>
                  <TableCell className="text-sm">
                    {company.verificationMethod.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{company.verificationSLAHours}h</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        company.status === 'ACTIVE' ? 'default' : 'secondary'
                      }
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(company)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <FactoringCompanyForm
        company={selectedCompany}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
