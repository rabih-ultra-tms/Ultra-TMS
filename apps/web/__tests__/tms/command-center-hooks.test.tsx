/**
 * Command Center Hooks — Unit Tests
 *
 * Tests for useCommandCenter (URL state management) and
 * the data-fetching hooks from hooks/command-center/use-command-center.
 *
 * MP-05-015
 */
import { renderHook, act } from '@/test/utils';
import { jest } from '@jest/globals';
import { mockReplace } from '@/test/mocks/next-navigation';

// useCommandCenter uses next/navigation which is mocked globally
import {
  useCommandCenter,
  CC_TABS,
  CC_LAYOUTS,
  type CCTab,
  type CCLayout,
} from '@/lib/hooks/tms/use-command-center';

describe('useCommandCenter — URL State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns default tab 'loads' and layout 'board'", () => {
    const { result } = renderHook(() => useCommandCenter());

    expect(result.current.activeTab).toBe('loads');
    expect(result.current.layout).toBe('board');
  });

  it('returns all expected methods', () => {
    const { result } = renderHook(() => useCommandCenter());

    expect(typeof result.current.setActiveTab).toBe('function');
    expect(typeof result.current.setLayout).toBe('function');
    expect(typeof result.current.openDrawer).toBe('function');
    expect(typeof result.current.closeDrawer).toBe('function');
  });

  it('calls router.replace when setActiveTab is invoked', () => {
    const { result } = renderHook(() => useCommandCenter());

    act(() => {
      result.current.setActiveTab('quotes');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('tab=quotes'),
      expect.anything()
    );
  });

  it('calls router.replace when setLayout is invoked', () => {
    const { result } = renderHook(() => useCommandCenter());

    act(() => {
      result.current.setLayout('split');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('layout=split'),
      expect.anything()
    );
  });

  it('manages drawer state — open and close', () => {
    const { result } = renderHook(() => useCommandCenter());

    // Initially closed
    expect(result.current.drawer.open).toBe(false);
    expect(result.current.drawer.entityType).toBeNull();
    expect(result.current.drawer.entityId).toBeNull();

    // Open drawer
    act(() => {
      result.current.openDrawer('load', '123');
    });

    expect(result.current.drawer.open).toBe(true);
    expect(result.current.drawer.entityType).toBe('load');
    expect(result.current.drawer.entityId).toBe('123');

    // Close drawer
    act(() => {
      result.current.closeDrawer();
    });

    expect(result.current.drawer.open).toBe(false);
    expect(result.current.drawer.entityType).toBeNull();
    expect(result.current.drawer.entityId).toBeNull();
  });

  it('supports all drawer entity types', () => {
    const { result } = renderHook(() => useCommandCenter());

    const entityTypes = ['load', 'quote', 'carrier', 'order', 'alert'] as const;

    for (const type of entityTypes) {
      act(() => {
        result.current.openDrawer(type, `${type}-1`);
      });

      expect(result.current.drawer.entityType).toBe(type);
      expect(result.current.drawer.entityId).toBe(`${type}-1`);
    }
  });
});

describe('CC_TABS and CC_LAYOUTS — Constants', () => {
  it('defines exactly 5 tabs', () => {
    expect(CC_TABS).toHaveLength(5);
    expect(CC_TABS).toContain('loads');
    expect(CC_TABS).toContain('quotes');
    expect(CC_TABS).toContain('carriers');
    expect(CC_TABS).toContain('tracking');
    expect(CC_TABS).toContain('alerts');
  });

  it('defines exactly 4 layouts', () => {
    expect(CC_LAYOUTS).toHaveLength(4);
    expect(CC_LAYOUTS).toContain('board');
    expect(CC_LAYOUTS).toContain('split');
    expect(CC_LAYOUTS).toContain('dashboard');
    expect(CC_LAYOUTS).toContain('focus');
  });
});

describe('Command Center Data Hooks — Mock Shape Verification', () => {
  // Verify the mock module exports the correct interface
  // by importing it directly (moduleNameMapper redirects to mock)

  it('commandCenterKeys generates correct cache keys', async () => {
    const { commandCenterKeys } =
      await import('@/lib/hooks/command-center/use-command-center');

    expect(commandCenterKeys.all).toEqual(['command-center']);
    expect(commandCenterKeys.kpis('today')).toEqual([
      'command-center',
      'kpis',
      'today',
    ]);
    expect(commandCenterKeys.alerts('critical')).toEqual([
      'command-center',
      'alerts',
      'critical',
    ]);
    expect(commandCenterKeys.activity(2)).toEqual([
      'command-center',
      'activity',
      2,
    ]);
    expect(commandCenterKeys.autoMatch('load-1')).toEqual([
      'command-center',
      'auto-match',
      'load-1',
    ]);
  });

  it('mock exports all required hook functions', async () => {
    const mod = await import('@/lib/hooks/command-center/use-command-center');

    expect(typeof mod.useCommandCenterKPIs).toBe('function');
    expect(typeof mod.useCommandCenterAlerts).toBe('function');
    expect(typeof mod.useAcknowledgeAlert).toBe('function');
    expect(typeof mod.useCommandCenterActivity).toBe('function');
    expect(typeof mod.useCarrierMatch).toBe('function');
    expect(typeof mod.useBulkDispatchCommand).toBe('function');
  });
});
