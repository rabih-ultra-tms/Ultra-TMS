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
} from '@/lib/hooks/operations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  Plus,
  Search,
  Truck,
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
  Package,
  MapPin,
  ArrowRight,
  FileText,
  DollarSign,
} from 'lucide-react'
import type { LoadPlannerQuoteListItem } from '@/types/load-planner-quotes'

type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

const STATUS_COLORS: Record<QuoteStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
}

export default function QuoteHistoryPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [pickupStateFilter, setPickupStateFilter] = useState<string>('')
  const [dropoffStateFilter, setDropoffStateFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const pageSize = 25
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false)

  // Fetch quotes - only pass defined values to avoid undefined params
  const { data, isLoading, error } = useLoadPlannerQuotes({
    page: Math.max(1, page),
    limit: pageSize,
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(pickupStateFilter ? { pickupState: pickupStateFilter } : {}),
    ...(dropoffStateFilter ? { dropoffState: dropoffStateFilter } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  } as any)

  // Fetch stats
  const { data: stats } = useLoadPlannerQuoteStats()

  // Mutations
  const deleteQuoteMutation = useDeleteLoadPlannerQuote()
  const duplicateQuoteMutation = useDuplicateLoadPlannerQuote()
  
  // Note: We can't use a single useUpdateLoadPlannerQuoteStatus hook for all quotes
  // So we'll use a generic approach via the queryClient
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

  const handleUpdateStatus = async (id: string, status: QuoteStatus) => {
    try {
      // Use the API client directly for status updates
      const { apiClient } = await import('@/lib/api-client')
      await apiClient.patch(`/operations/load-planner-quotes/${id}/status`, { status })
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['load-planner-quotes'] })
      toast.success('Quote status updated')
    } catch (error: unknown) {
      toast.error('Failed to update status', { description: (error as Error).message })
    }
  }

  const quotes = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  // Selection helpers
  const allSelected = quotes.length > 0 && quotes.every((q) => selectedIds.has(q.id))
  const someSelected = selectedIds.size > 0 && !allSelected

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

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    setShowBatchDeleteDialog(true)
  }

  const confirmBatchDelete = async () => {
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => deleteQuoteMutation.mutateAsync(id)))
      setSelectedIds(new Set())
      toast.success(`Deleted ${ids.length} quotes`)
    } catch (error: unknown) {
      toast.error('Failed to delete some quotes', { description: (error as Error).message })
    }
    setShowBatchDeleteDialog(false)
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setPickupStateFilter('')
    setDropoffStateFilter('')
    setSearchQuery('')
    setPage(1)
  }

  const hasActiveFilters =
    statusFilter !== 'all' || pickupStateFilter || dropoffStateFilter || searchQuery

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quote History</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage Load Planner v2 quotes
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalLoads ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-600">{stats.draftCount ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.sentCount ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.acceptedCount ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency((stats.totalValueCents ?? 0) / 100)}</div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batch Actions Bar */}
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

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Load Planner Quotes</CardTitle>
          <CardDescription>{total} quotes total</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Search */}
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

            {/* Filter Row */}
            <div className="flex flex-wrap gap-3">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as QuoteStatus | 'all')
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

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Table/Cards */}
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading quotes...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading quotes: {error.message}
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
            <>
              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className={`rounded-lg border p-4 ${selectedIds.has(quote.id) ? 'bg-primary/5 border-primary' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedIds.has(quote.id)}
                          onCheckedChange={() => toggleSelect(quote.id)}
                          aria-label={`Select ${quote.quoteNumber}`}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{quote.quoteNumber}</span>
                            <Badge className={STATUS_COLORS[quote.status]}>
                              {STATUS_LABELS[quote.status]}
                            </Badge>
                          </div>
                          <p className="font-medium mt-1">
                            {quote.customerName || quote.customerCompany || 'No customer'}
                          </p>
                          {quote.pickupState && quote.dropoffState && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {quote.pickupCity ? `${quote.pickupCity}, ` : ''}
                              {quote.pickupState}
                              <ArrowRight className="h-3 w-3" />
                              {quote.dropoffCity ? `${quote.dropoffCity}, ` : ''}
                              {quote.dropoffState}
                            </p>
                          )}
                        </div>
                      </div>
                      <QuoteActionsMenu
                        quote={quote}
                        onDelete={() => handleDeleteQuote(quote.id)}
                        onDuplicate={() => handleDuplicateQuote(quote.id)}
                        onStatusChange={(status) => handleUpdateStatus(quote.id, status)}
                        isDeleting={deleteQuoteMutation.isPending}
                        isDuplicating={duplicateQuoteMutation.isPending}
                      />
                    </div>

                    <div className="mt-3 ml-8 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-mono font-medium">
                          {quote.totalCents ? formatCurrency(quote.totalCents) : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">{formatDate(quote.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trucks:</span>
                        <p className="font-medium flex items-center gap-1">
                          <Truck className="h-3 w-3" /> {quote._count.trucks}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cargo Items:</span>
                        <p className="font-medium flex items-center gap-1">
                          <Package className="h-3 w-3" /> {quote._count.cargoItems}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                          className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                        />
                      </TableHead>
                      <TableHead>Quote #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-center">Trucks</TableHead>
                      <TableHead className="text-center">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow
                        key={quote.id}
                        className={selectedIds.has(quote.id) ? 'bg-primary/5' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(quote.id)}
                            onCheckedChange={() => toggleSelect(quote.id)}
                            aria-label={`Select ${quote.quoteNumber}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {quote.customerName || quote.customerCompany || '-'}
                            </p>
                            {quote.customerName && quote.customerCompany && (
                              <p className="text-sm text-muted-foreground">
                                {quote.customerCompany}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {quote.pickupState && quote.dropoffState ? (
                            <div className="flex items-center gap-1 text-sm">
                              <span>
                                {quote.pickupCity ? `${quote.pickupCity}, ` : ''}
                                {quote.pickupState}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {quote.dropoffCity ? `${quote.dropoffCity}, ` : ''}
                                {quote.dropoffState}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            {quote._count.trucks}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {quote._count.cargoItems}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {quote.totalCents ? formatCurrency(quote.totalCents) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[quote.status]}>
                            {STATUS_LABELS[quote.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(quote.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <QuoteActionsMenu
                            quote={quote}
                            onDelete={() => handleDeleteQuote(quote.id)}
                            onDuplicate={() => handleDuplicateQuote(quote.id)}
                            onStatusChange={(status) => handleUpdateStatus(quote.id, status)}
                            isDeleting={deleteQuoteMutation.isPending}
                            isDuplicating={duplicateQuoteMutation.isPending}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
                    {total} quotes
                  </p>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1 text-sm">
                      <span>Page {page} of {totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showBatchDeleteDialog}
        title="Delete Quotes"
        description={`Are you sure you want to delete ${selectedIds.size} quotes? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteQuoteMutation.isPending}
        onConfirm={confirmBatchDelete}
        onCancel={() => setShowBatchDeleteDialog(false)}
      />
    </div>
  )
}

interface QuoteActionsMenuProps {
  quote: LoadPlannerQuoteListItem
  onDelete: () => void
  onDuplicate: () => void
  onStatusChange: (status: QuoteStatus) => void
  isDeleting: boolean
  isDuplicating: boolean
}

function QuoteActionsMenu({
  quote,
  onDelete,
  onDuplicate,
  onStatusChange,
  isDeleting,
  isDuplicating,
}: QuoteActionsMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/load-planner/${quote.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Quote
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate} disabled={isDuplicating}>
          <Copy className="h-4 w-4 mr-2" />
          {isDuplicating ? 'Duplicating...' : 'Duplicate Quote'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        {quote.status === 'DRAFT' && (
          <DropdownMenuItem onClick={() => onStatusChange('SENT')}>
            <Send className="h-4 w-4 mr-2" />
            Mark as Sent
          </DropdownMenuItem>
        )}
        {(quote.status === 'DRAFT' || quote.status === 'SENT' || quote.status === 'VIEWED') && (
          <>
            <DropdownMenuItem onClick={() => onStatusChange('ACCEPTED')} className="text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Accepted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('REJECTED')} className="text-red-600">
              <XCircle className="h-4 w-4 mr-2" />
              Mark as Rejected
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Quote
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <ConfirmDialog
      open={showDeleteConfirm}
      title="Delete Quote"
      description="Are you sure you want to delete this quote? This cannot be undone."
      confirmLabel="Delete"
      destructive
      isLoading={isDeleting}
      onConfirm={async () => {
        await onDelete()
        setShowDeleteConfirm(false)
      }}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    </>
  )
}
