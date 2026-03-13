/**
 * BulkActionBar — Component Tests
 *
 * Tests for bulk dispatch UI: visibility, carrier picker, status picker,
 * selection state, and rendering behavior.
 *
 * MP-05-015
 */
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { BulkActionBar } from '@/components/tms/command-center/bulk-action-bar';

const mockClearSelection = jest.fn();

const mockCarriers = [
  {
    id: 'c1',
    legalName: 'Fast Freight LLC',
    mcNumber: 'MC-123456',
    activeLoadCount: 3,
  },
  {
    id: 'c2',
    legalName: 'Road Runner Transport',
    mcNumber: 'MC-789012',
    activeLoadCount: 1,
  },
  {
    id: 'c3',
    legalName: 'Eagle Express',
    mcNumber: null,
    activeLoadCount: 0,
  },
];

beforeEach(() => {
  mockClearSelection.mockReset();
});

describe('BulkActionBar — Visibility', () => {
  it('does not render when no loads are selected', () => {
    const { container } = render(
      <BulkActionBar
        selectedIds={new Set()}
        onClearSelection={mockClearSelection}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders when loads are selected', () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1, 2, 3])}
        onClearSelection={mockClearSelection}
        carriers={mockCarriers}
      />
    );
    expect(screen.getByText(/3 loads selected/i)).toBeInTheDocument();
  });

  it("shows singular 'load' for single selection", () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
      />
    );
    expect(screen.getByText(/1 load selected/i)).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
      />
    );
    expect(
      screen.getByRole('button', { name: /assign carrier/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /dispatch/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument();
  });

  it('renders with floating bar styling', () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
      />
    );
    const bar = screen.getByText(/1 load selected/i).closest('.fixed');
    expect(bar).toBeInTheDocument();
  });
});

describe('BulkActionBar — Clear Selection', () => {
  it('clears selection when X button is clicked', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1, 2])}
        onClearSelection={mockClearSelection}
      />
    );

    const buttons = screen.getAllByRole('button');
    const clearBtn = buttons[buttons.length - 1];
    await userEvent.click(clearBtn!);

    expect(mockClearSelection).toHaveBeenCalled();
  });
});

describe('BulkActionBar — Carrier Picker', () => {
  it('opens carrier picker popover', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1, 2])}
        onClearSelection={mockClearSelection}
        carriers={mockCarriers}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /assign carrier/i })
    );

    await waitFor(() => {
      expect(screen.getByText('Fast Freight LLC')).toBeInTheDocument();
      expect(screen.getByText('Road Runner Transport')).toBeInTheDocument();
      expect(screen.getByText('Eagle Express')).toBeInTheDocument();
    });
  });

  it('filters carriers by search term', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1, 2])}
        onClearSelection={mockClearSelection}
        carriers={mockCarriers}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /assign carrier/i })
    );

    const searchInput = screen.getByPlaceholderText(/search carriers/i);
    await userEvent.type(searchInput, 'eagle');

    await waitFor(() => {
      expect(screen.getByText('Eagle Express')).toBeInTheDocument();
      expect(screen.queryByText('Fast Freight LLC')).not.toBeInTheDocument();
    });
  });

  it('filters carriers by MC number', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1, 2])}
        onClearSelection={mockClearSelection}
        carriers={mockCarriers}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /assign carrier/i })
    );

    const searchInput = screen.getByPlaceholderText(/search carriers/i);
    await userEvent.type(searchInput, '789012');

    await waitFor(() => {
      expect(screen.getByText('Road Runner Transport')).toBeInTheDocument();
      expect(screen.queryByText('Fast Freight LLC')).not.toBeInTheDocument();
    });
  });

  it('shows active load count for each carrier', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
        carriers={mockCarriers}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /assign carrier/i })
    );

    await waitFor(() => {
      expect(screen.getByText('3 active')).toBeInTheDocument();
      expect(screen.getByText('1 active')).toBeInTheDocument();
      expect(screen.getByText('0 active')).toBeInTheDocument();
    });
  });

  it('shows MC number for carriers that have one', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
        carriers={mockCarriers}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /assign carrier/i })
    );

    await waitFor(() => {
      expect(screen.getByText('MC# MC-123456')).toBeInTheDocument();
      expect(screen.getByText('MC# MC-789012')).toBeInTheDocument();
    });
  });

  it("shows 'No carriers found' when list is empty", async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
        carriers={[]}
        carriersLoading={false}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /assign carrier/i })
    );

    await waitFor(() => {
      expect(screen.getByText('No carriers found')).toBeInTheDocument();
    });
  });

  it('shows loading state when carriers are loading', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
        carriers={[]}
        carriersLoading={true}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /assign carrier/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/loading carriers/i)).toBeInTheDocument();
    });
  });
});

describe('BulkActionBar — Status Picker', () => {
  it('opens status picker popover with all statuses', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /status/i }));

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Planning')).toBeInTheDocument();
      expect(screen.getByText('Dispatched')).toBeInTheDocument();
      expect(screen.getByText('In Transit')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('shows all transitional load statuses', async () => {
    render(
      <BulkActionBar
        selectedIds={new Set([1])}
        onClearSelection={mockClearSelection}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /status/i }));

    await waitFor(() => {
      expect(screen.getByText('Tendered')).toBeInTheDocument();
      expect(screen.getByText('Accepted')).toBeInTheDocument();
      expect(screen.getByText('At Pickup')).toBeInTheDocument();
      expect(screen.getByText('Picked Up')).toBeInTheDocument();
      expect(screen.getByText('At Delivery')).toBeInTheDocument();
    });
  });
});
