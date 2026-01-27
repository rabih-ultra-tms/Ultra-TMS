'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCarriers,
  useCreateCarrier,
  useDeleteCarrier,
} from '@/lib/hooks/operations';
import { OperationsCarrierListItem, CarrierListParams } from '@/types/carriers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MoreHorizontal, Plus, Trash2, Mail, Phone, MapPin } from 'lucide-react';

export default function CarriersPage() {
  const router = useRouter();
  const [params, setParams] = useState<CarrierListParams>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    carrierType: undefined,
  });

  const { data: listData, isLoading } = useCarriers(params);
  const createMutation = useCreateCarrier();
  const deleteMutation = useDeleteCarrier();
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const carriers = listData?.data || [];
  const total = listData?.total || 0;
  const totalPages = listData?.totalPages || 0;

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PREFERRED: 'bg-blue-100 text-blue-800',
    ON_HOLD: 'bg-yellow-100 text-yellow-800',
    BLACKLISTED: 'bg-red-100 text-red-800',
  };

  const typeColors: Record<string, string> = {
    COMPANY: 'bg-purple-100 text-purple-800',
    OWNER_OPERATOR: 'bg-orange-100 text-orange-800',
  };

  const handleDelete = (id: string) => {
    setSelectedDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      if (selectedDeleteId) {
        await deleteMutation.mutateAsync(selectedDeleteId);
        setSelectedDeleteId(null);
      }
    } catch (error) {
      console.error('Failed to delete carrier:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carriers</h1>
          <p className="text-gray-600">Manage trucking companies and owner operators</p>
        </div>
        <Button
          onClick={() => router.push('/carriers/new')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Carrier
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Search carrier, MC #, email..."
              value={params.search || ''}
              onChange={(e) =>
                setParams({ ...params, search: e.target.value, page: 1 })
              }
            />
            <Select
              value={params.status || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  status: value === 'all' ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PREFERRED">Preferred</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={params.carrierType || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  carrierType: value === 'all' ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="OWNER_OPERATOR">Owner Operator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Carriers ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Drivers</TableHead>
                  <TableHead>Trucks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : carriers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No carriers found
                    </TableCell>
                  </TableRow>
                ) : (
                  carriers.map((carrier: OperationsCarrierListItem) => (
                    <TableRow
                      key={carrier.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/carriers/${carrier.id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">{carrier.companyName}</div>
                        {carrier.mcNumber && (
                          <div className="text-sm text-gray-600">
                            MC#{carrier.mcNumber}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={typeColors[carrier.carrierType]}>
                          {carrier.carrierType === 'OWNER_OPERATOR'
                            ? 'Owner Op'
                            : 'Company'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {carrier.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {carrier.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {carrier._count.drivers}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {carrier._count.trucks}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[carrier.status]}>
                          {carrier.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {carrier.paymentTermsDays} days{' '}
                        <span className="text-gray-600">
                          ({carrier.preferredPaymentMethod})
                        </span>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/carriers/${carrier.id}/edit`)
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(carrier.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Page {params.page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParams({ ...params, page: params.page - 1 })}
                  disabled={params.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParams({ ...params, page: params.page + 1 })}
                  disabled={params.page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
