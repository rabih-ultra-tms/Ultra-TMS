import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/tms/tables/data-table";

// ---- Test data ----

interface TestRow {
  id: string;
  name: string;
  status: string;
  amount: number;
}

const testData: TestRow[] = [
  { id: "1", name: "Alpha Load", status: "Active", amount: 1500 },
  { id: "2", name: "Beta Load", status: "In Transit", amount: 2300 },
  { id: "3", name: "Gamma Load", status: "Delivered", amount: 900 },
];

const columnHelper = createColumnHelper<TestRow>();

const columns: ColumnDef<TestRow, unknown>[] = [
  columnHelper.accessor("name", { header: "Name" }) as ColumnDef<TestRow, unknown>,
  columnHelper.accessor("status", { header: "Status" }) as ColumnDef<TestRow, unknown>,
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => `$${info.getValue()}`,
  }) as ColumnDef<TestRow, unknown>,
];

// ---- Helper wrapper ----

function DataTableWrapper({
  data = testData,
  density = "default" as const,
  onRowClick,
  isRowAtRisk,
}: {
  data?: TestRow[];
  density?: "compact" | "default" | "spacious";
  onRowClick?: (row: any) => void;
  isRowAtRisk?: (row: any) => boolean;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataTable
      table={table}
      density={density}
      onRowClick={onRowClick}
      isRowAtRisk={isRowAtRisk}
    />
  );
}

describe("DataTable", () => {
  // ---- Basic rendering ----

  it("renders column headers", () => {
    render(<DataTableWrapper />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(<DataTableWrapper />);
    expect(screen.getByText("Alpha Load")).toBeInTheDocument();
    expect(screen.getByText("Beta Load")).toBeInTheDocument();
    expect(screen.getByText("Gamma Load")).toBeInTheDocument();
  });

  it("renders cell values with custom cell renderers", () => {
    render(<DataTableWrapper />);
    expect(screen.getByText("$1500")).toBeInTheDocument();
    expect(screen.getByText("$2300")).toBeInTheDocument();
    expect(screen.getByText("$900")).toBeInTheDocument();
  });

  // ---- Empty state ----

  it("renders empty state when no data", () => {
    render(<DataTableWrapper data={[]} />);
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  // ---- Density ----

  it.each([
    ["compact", "h-9"],
    ["default", "h-11"],
    ["spacious", "h-[52px]"],
  ] as const)("applies %s density class", (density, expectedClass) => {
    const { container } = render(<DataTableWrapper density={density} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(3);
    bodyRows.forEach((row) => {
      expect(row.className).toContain(expectedClass);
    });
  });

  // ---- Row clicks ----

  it("calls onRowClick when a row is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<DataTableWrapper onRowClick={handleClick} />);

    await user.click(screen.getByText("Alpha Load").closest("tr")!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // ---- At-risk rows ----

  it("applies at-risk styling to rows matching the predicate", () => {
    const { container } = render(
      <DataTableWrapper
        isRowAtRisk={(row) => row.original.status === "In Transit"}
      />
    );
    const rows = container.querySelectorAll("tbody tr");
    // Row 2 (Beta Load) should have danger-bg class
    expect(rows[1]!.className).toContain("danger-bg");
    // Other rows should not
    expect(rows[0]!.className).not.toContain("danger-bg");
    expect(rows[2]!.className).not.toContain("danger-bg");
  });

  // ---- Sort indicators ----

  it("renders sort indicators for sortable columns", () => {
    const { container } = render(<DataTableWrapper />);
    // All columns have sort arrows (ArrowUp / ArrowDown SVGs)
    const headers = container.querySelectorAll("th");
    headers.forEach((th) => {
      const svgs = th.querySelectorAll("svg");
      expect(svgs.length).toBe(2); // ArrowUp + ArrowDown
    });
  });

  it("allows clicking headers to sort", async () => {
    const user = userEvent.setup();
    render(<DataTableWrapper />);

    // Click the "Name" header to sort
    await user.click(screen.getByText("Name"));

    // After sorting, rows should still be visible
    expect(screen.getByText("Alpha Load")).toBeInTheDocument();
    expect(screen.getByText("Beta Load")).toBeInTheDocument();
    expect(screen.getByText("Gamma Load")).toBeInTheDocument();
  });

  // ---- Custom className ----

  it("passes className to the container", () => {
    function WrapperWithClass() {
      const table = useReactTable({
        data: testData,
        columns,
        getCoreRowModel: getCoreRowModel(),
      });
      return <DataTable table={table} className="my-grid-class" />;
    }

    const { container } = render(<WrapperWithClass />);
    expect(container.firstElementChild?.className).toContain("my-grid-class");
  });
});
