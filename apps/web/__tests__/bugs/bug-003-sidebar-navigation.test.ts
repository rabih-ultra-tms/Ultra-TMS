/**
 * BUG-003 Regression Test: Sidebar 404 Links
 *
 * Verifies that all navigation links either have valid routes or are disabled.
 * The original bug had 5 links (/invoices, /settlements, /reports, /help, /settings)
 * pointing to non-existent pages.
 */
import { navigationConfig } from "@/lib/config/navigation";

function getAllNavItems() {
  const items = [
    ...navigationConfig.mainNav.flatMap((group) => group.items),
    ...navigationConfig.bottomNav,
  ];
  return items;
}

describe("BUG-003: Navigation Config — No broken links", () => {
  const allItems = getAllNavItems();

  it("has no /invoices link (remapped to /accounting/invoices)", () => {
    const invoicesItem = allItems.find((item) => item.href === "/invoices");
    expect(invoicesItem).toBeUndefined();
  });

  it("has no /settlements link (remapped to /accounting/settlements)", () => {
    const settlementsItem = allItems.find((item) => item.href === "/settlements");
    expect(settlementsItem).toBeUndefined();
  });

  it("has no bare /reports link (remapped to /accounting/reports/aging)", () => {
    const reportsItem = allItems.find((item) => item.href === "/reports");
    expect(reportsItem).toBeUndefined();
  });

  it("has no bare /settings link in bottomNav (remapped to /profile)", () => {
    const bottomSettings = navigationConfig.bottomNav.find(
      (item) => item.href === "/settings"
    );
    expect(bottomSettings).toBeUndefined();
  });

  it("/help link is disabled", () => {
    const helpItem = allItems.find((item) => item.href === "/help");
    expect(helpItem).toBeDefined();
    expect(helpItem?.disabled).toBe(true);
  });

  it("has Invoices at /accounting/invoices", () => {
    const item = allItems.find((item) => item.href === "/accounting/invoices");
    expect(item).toBeDefined();
    expect(item?.title).toBe("Invoices");
  });

  it("has Settlements at /accounting/settlements", () => {
    const item = allItems.find((item) => item.href === "/accounting/settlements");
    expect(item).toBeDefined();
    expect(item?.title).toBe("Settlements");
  });

  it("has Aging Reports at /accounting/reports/aging", () => {
    const item = allItems.find((item) => item.href === "/accounting/reports/aging");
    expect(item).toBeDefined();
    expect(item?.title).toBe("Aging Reports");
  });

  it("has Settings at /admin/settings in mainNav", () => {
    const mainNavItems = navigationConfig.mainNav.flatMap((g) => g.items);
    const item = mainNavItems.find((item) => item.href === "/admin/settings");
    expect(item).toBeDefined();
    expect(item?.title).toBe("Settings");
  });

  it("has profile settings at /profile in bottomNav", () => {
    const item = navigationConfig.bottomNav.find((item) => item.href === "/profile");
    expect(item).toBeDefined();
    expect(item?.title).toBe("Settings");
  });

  it("every enabled nav item has a non-empty href", () => {
    const enabledItems = allItems.filter((item) => !item.disabled);
    for (const item of enabledItems) {
      expect(item.href).toBeTruthy();
      expect(item.href).not.toBe("#");
    }
  });
});
