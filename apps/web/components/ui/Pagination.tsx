import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  page: number;
  limit: number;
  total?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

const defaultPageSizes = [10, 20, 50, 100];

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  pageSizeOptions = defaultPageSizes,
}: PaginationProps) {
  const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : undefined;
  const canGoPrev = page > 1;
  const canGoNext = totalPages ? page < totalPages : true;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {onLimitChange ? (
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => onLimitChange?.(Number(value))}
            >
              <SelectTrigger className="h-8 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {total !== undefined && (
          <span>
            {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={!canGoPrev}
          onClick={() => canGoPrev && onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          Page {page}
          {totalPages ? ` of ${totalPages}` : ""}
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={!canGoNext}
          onClick={() => canGoNext && onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
