import type { TruckType as ApiTruckType, TruckTypeListItem } from '@/types/truck-types'
import type { TruckType } from './types'

const DEFAULT_LEGAL_WIDTH = 8.5
const DEFAULT_LEGAL_HEIGHT = 13.5

const normalizeBestFor = (value: string[] | null | undefined) =>
  Array.isArray(value) ? value : []

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
    features: 'features' in record ? (record.features || []) : [],
    bestFor: normalizeBestFor('bestFor' in record ? record.bestFor : []),
    loadingMethod: 'loadingMethod' in record ? record.loadingMethod || undefined : undefined,
  }
}
