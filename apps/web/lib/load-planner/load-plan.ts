import type { LoadItem, TruckType, LoadPlan, ItemPlacement, PlannedLoad } from './types'

const createPlacements = (items: LoadItem[], truck: TruckType): ItemPlacement[] => {
  const placements: ItemPlacement[] = []
  let cursorX = 0
  let cursorZ = 0
  let rowWidth = 0

  for (const item of items) {
    const itemLength = item.length
    const itemWidth = item.width

    if (cursorX + itemLength > truck.deckLength) {
      cursorX = 0
      cursorZ += rowWidth
      rowWidth = 0
    }

    const exceedsWidth = cursorZ + itemWidth > truck.deckWidth

    if (exceedsWidth) {
      placements.push({
        itemId: item.id,
        x: 0,
        z: 0,
        rotated: false,
        failed: true,
      })
      continue
    }

    placements.push({
      itemId: item.id,
      x: cursorX,
      z: cursorZ,
      rotated: false,
    })

    cursorX += itemLength
    rowWidth = Math.max(rowWidth, itemWidth)
  }

  return placements
}

const splitItemsIntoLoads = (items: LoadItem[], truck: TruckType): LoadItem[][] => {
  const loads: LoadItem[][] = []
  let current: LoadItem[] = []
  let currentWeight = 0

  const pushLoad = () => {
    if (current.length > 0) {
      loads.push(current)
      current = []
      currentWeight = 0
    }
  }

  items.forEach((item) => {
    const itemWeight = item.weight * (item.quantity || 1)
    if (current.length > 0 && currentWeight + itemWeight > truck.maxCargoWeight) {
      pushLoad()
    }
    current.push(item)
    currentWeight += itemWeight
  })

  pushLoad()

  return loads
}

export function buildLoadPlan(items: LoadItem[], truck: TruckType): LoadPlan {
  if (items.length === 0) {
    return { loads: [], totalTrucks: 0, totalItems: 0, totalWeight: 0, unassignedItems: [], warnings: [] }
  }

  const splitLoads = splitItemsIntoLoads(items, truck)
  const loads: PlannedLoad[] = splitLoads.map((loadItems, index) => {
    const placements = createPlacements(loadItems, truck)
    const failedCount = placements.filter(p => p.failed).length
    const warnings: string[] = []

    if (failedCount > 0) {
      warnings.push(`${failedCount} item${failedCount > 1 ? 's' : ''} need manual placement`) 
    }

    const loadWeight = loadItems.reduce((sum, item) => sum + item.weight * (item.quantity || 1), 0)
    if (loadWeight > truck.maxCargoWeight) {
      warnings.push('Load exceeds truck weight capacity')
    }

    const loadLength = loadItems.length ? Math.max(...loadItems.map(item => item.length)) : 0
    const loadWidth = loadItems.length ? Math.max(...loadItems.map(item => item.width)) : 0
    const loadHeight = loadItems.length ? Math.max(...loadItems.map(item => item.height)) : 0
    const totalWeight = loadWeight
    const maxLegalHeight = truck.maxLegalCargoHeight || Math.max(0, 13.5 - truck.deckHeight)
    const maxLegalWidth = truck.maxLegalCargoWidth || 8.5
    const isLegal = loadLength <= truck.deckLength && loadWidth <= maxLegalWidth && loadHeight <= maxLegalHeight && totalWeight <= truck.maxCargoWeight

    return {
      id: `load-${index + 1}`,
      items: loadItems,
      length: loadLength,
      width: loadWidth,
      height: loadHeight,
      weight: totalWeight,
      recommendedTruck: truck,
      truckScore: 100,
      placements,
      permitsRequired: isLegal ? [] : ['PERMIT_REQUIRED'],
      warnings,
      isLegal,
    }
  })

  const totalWeight = items.reduce((sum, item) => sum + item.weight * (item.quantity || 1), 0)
  const warnings: string[] = []
  if (loads.length > 1) {
    warnings.push(`Load split into ${loads.length} trucks based on weight`) 
  }

  return {
    loads,
    totalTrucks: loads.length,
    totalItems: items.length,
    totalWeight,
    unassignedItems: [],
    warnings,
  }
}
