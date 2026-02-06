export interface ParsedItem {
  id: string
  sku?: string
  description: string
  quantity: number
  length: number
  width: number
  height: number
  weight: number
  stackable?: boolean
  priority?: number
  unit?: string
  raw?: Record<string, unknown>
}
