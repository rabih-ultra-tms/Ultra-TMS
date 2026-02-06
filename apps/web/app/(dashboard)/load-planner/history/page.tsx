'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  useLoadPlannerQuotes,
  useLoadPlannerQuoteStats,
  useDuplicateLoadPlannerQuote,
  useDeleteLoadPlannerQuote,
  useCreateLoadHistory,
} from '@/lib/hooks/operations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  Pencil,
  Clock,
  CheckSquare,
  X,
  FileText,
  Truck,
  Package,
} from 'lucide-react'
import type { LoadPlannerQuoteListItem, LoadPlannerQuote } from '@/types/load-planner-quotes'

const STATUS_COLORS: Record<LoadPlannerQuote['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
}

const STATUS_LABELS: Record<LoadPlannerQuote['status'], string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
}

export default function LoadPlannerHistoryPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<LoadPlannerQuote['status'] | 'all'>('all')
  const [pickupStateFilter, setPickupStateFilter] = useState<string>('')
  const [dropoffStateFilter, setDropoffStateFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const pageSize = 25

  const { data, isLoading, error } = useLoadPlannerQuotes({
    page: Math.max(1, page),
    limit: pageSize,
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(pickupStateFilter ? { pickupState: pickupStateFilter } : {}),
    ...(dropoffStateFilter ? { dropoffState: dropoffStateFilter } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const { data: stats } = useLoadPlannerQuoteStats()

  const deleteQuoteMutation = useDeleteLoadPlannerQuote()
  const duplicateQuoteMutation = useDuplicateLoadPlannerQuote()
  const createLoadMutation = useCreateLoadHistory()
  const queryClient = useQueryClient()

  const handleDeleteQuote = async (id: string) => {
    try {
      await deleteQuoteMutation.mutateAsync(id)
      toast.success('Quote deleted')
    } catch (error: unknown) {
      toast.error('Failed to delete quote', { description: (error as Error).message })
    }
  }

  const handleDuplicateQuote = async (id: string) => {
    try {
      const duplicated = await duplicateQuoteMutation.mutateAsync(id)
      toast.success('Quote duplicated', {
        description: `New quote ${duplicated.quoteNumber} created`,
        action: {
          label: 'Edit',
          onClick: () => router.push(`/load-planner/${duplicated.id}/edit`),
        },
      })
    } catch (error: unknown) {
      toast.error('Failed to duplicate quote', { description: (error as Error).message })
    }
  }

  const handleUpdateStatus = async (id: string, status: LoadPlannerQuote['status']) => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      await apiClient.patch(`/operations/load-planner-quotes/${id}/status`, { status })
      queryClient.invalidateQueries({ queryKey: ['load-planner-quotes'] })
      toast.success('Quote status updated')
    } catch (error: unknown) {
      toast.error('Failed to update status', { description: (error as Error).message })
    }
  }

  const handleRecordLoad = async (quote: LoadPlannerQuoteListItem) => {
    try {
      await createLoadMutation.mutateAsync({
        loadPlannerQuoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        customerName: quote.customerName,
        customerCompany: quote.customerCompany,
        originCity: quote.pickupCity,
        originState: quote.pickupState,
        originZip: quote.pickupZip,
        destinationCity: quote.dropoffCity,
        destinationState: quote.dropoffState,
        destinationZip: quote.dropoffZip,
        totalMiles: quote.distanceMiles,
        cargoDescription: quote._count?.cargoItems ? `${quote._count.cargoItems} item(s)` : undefined,
      })
      toast.success('Load recorded')
    } catch (error: unknown) {
      toast.error('Failed to record load', { description: (error as Error).message })
    }
  }

  const quotes = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const allSelected = quotes.length > 0 && quotes.every((q) => selectedIds.has(q.id))
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(quotes.map((q) => q.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    if (confirm(`Are you sure you want to delete ${selectedIds.size} quotes? This cannot be undone.`)) {
      const ids = Array.from(selectedIds)
      try {
        await Promise.all(ids.map((id) => deleteQuoteMutation.mutateAsync(id)))
        setSelectedIds(new Set())
        toast.success(`Deleted ${ids.length} quotes`)
      } catch (error: unknown) {
        toast.error('Failed to delete some quotes', { description: (error as Error).message })
      }
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setPickupStateFilter('')
    setDropoffStateFilter('')
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters =
    statusFilter !== 'all' || pickupStateFilter || dropoffStateFilter || searchQuery || dateFrom || dateTo

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Load Planner History</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage Load Planner quotes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/load-planner/new/edit" className="flex-1 sm:flex-initial">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalLoads}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-600">{stats.draftCount}</div>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.sentCount}</div>
              <p className="text-xs text-muted-foreground">Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.acceptedCount}</div>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(stats.totalValueCents)}
              </div>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{stats.totalLoads}</div>
              <p className="text-xs text-muted-foreground">Quotes</p>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedIds.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedIds.size} selected</span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={deleteQuoteMutation.isPending}
                  className="flex-1 sm:flex-initial"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Delete Selected</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Load Planner Quotes</CardTitle>
          <CardDescription>{total} quotes total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by quote #, customer name, company..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as LoadPlannerQuote['status'] | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="VIEWED">Viewed</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Origin State"
                value={pickupStateFilter}
                onChange={(e) => {
                  setPickupStateFilter(e.target.value.toUpperCase().slice(0, 2))
                  setPage(1)
                }}
                className="w-full sm:w-[130px]"
                maxLength={2}
              />

              <Input
                placeholder="Dest State"
                value={dropoffStateFilter}
                onChange={(e) => {
                  setDropoffStateFilter(e.target.value.toUpperCase().slice(0, 2))
                  setPage(1)
                }}
                className="w-full sm:w-[130px]"
                maxLength={2}
              />

              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                className="w-full sm:w-[170px]"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                className="w-full sm:w-[170px]"
              />

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading quotes...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading quotes: {(error as Error).message}
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No Load Planner quotes found</p>
              <Link href="/load-planner/new/edit">
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first quote
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Quote</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(quote.id)}
                          onCheckedChange={() => toggleSelect(quote.id)}
                          aria-label="Select quote"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{quote.quoteNumber}</span>
                          <span className="text-xs text-muted-foreground">
                            {quote._count?.cargoItems || 0} items
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{quote.customerName || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">
                            {quote.customerCompany || '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{quote.pickupCity}, {quote.pickupState}</div>
                            <div className="text-xs text-muted-foreground">
                              → {quote.dropoffCity}, {quote.dropoffState}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[quote.status]}>
                          {STATUS_LABELS[quote.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(quote.totalCents || 0)}
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(quote.createdAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/load-planner/${quote.id}/edit`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateQuote(quote.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRecordLoad(quote)}>
                              <Package className="h-4 w-4 mr-2" />
                              Record as Load
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'SENT')}>
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'ACCEPTED')}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Accepted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'REJECTED')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Mark as Rejected
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'EXPIRED')}>
                              <Clock className="h-4 w-4 mr-2" />
                              Mark as Expired
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteQuote(quote.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
