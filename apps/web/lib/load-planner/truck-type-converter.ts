import type { TruckType as ApiTruckType, TruckTypeListItem } from '@/types/truck-types'
import type { TruckType } from './types'

const DEFAULT_LEGAL_WIDTH = 8.5
const DEFAULT_LEGAL_HEIGHT = 13.5

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry
      if (typeof entry === 'number' || typeof entry === 'boolean') return String(entry)
      if (entry && typeof entry === 'object') {
        const candidate = (entry as { label?: unknown; name?: unknown }).label
          ?? (entry as { name?: unknown }).name
        if (typeof candidate === 'string') return candidate
        if (candidate != null) return String(candidate)
      }
      return ''
    })
    .filter((entry): entry is string => Boolean(entry))
}

export function truckTypeRecordToTruckType(record: ApiTruckType | TruckTypeListItem): TruckType {
  const deckHeight = record.deckHeightFt ?? 0
  const maxLegalCargoHeight = record.maxLegalCargoHeightFt ?? Math.max(0, DEFAULT_LEGAL_HEIGHT - deckHeight)

  return {
    id: record.id,
    name: record.name,
    category: record.category as TruckType['category'],
    description: record.description || '',
    deckHeight,
    deckLength: record.deckLengthFt ?? 0,
    deckWidth: record.deckWidthFt ?? DEFAULT_LEGAL_WIDTH,
    wellLength: 'wellLengthFt' in record ? record.wellLengthFt ?? undefined : undefined,
    wellHeight: 'wellHeightFt' in record ? record.wellHeightFt ?? undefined : undefined,
    maxCargoWeight: record.maxCargoWeightLbs ?? 0,
    tareWeight: 'tareWeightLbs' in record ? record.tareWeightLbs ?? undefined : undefined,
    maxLegalCargoHeight,
    maxLegalCargoWidth: 'maxLegalCargoWidthFt' in record
      ? record.maxLegalCargoWidthFt ?? DEFAULT_LEGAL_WIDTH
      : DEFAULT_LEGAL_WIDTH,
    features: 'features' in record ? normalizeStringArray(record.features) : [],
    bestFor: normalizeStringArray('bestFor' in record ? record.bestFor : []),
    loadingMethod: 'loadingMethod' in record ? record.loadingMethod || undefined : undefined,
  }
}
