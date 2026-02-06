/**
 * AI Parser for Load Planner
 *
 * Uses Claude Opus 4.5 to extract cargo information from text and images
 */

import Anthropic from '@anthropic-ai/sdk'
import type { ParsedItem } from './universal-parser'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

let anthropic: Anthropic | null = null

function getAnthropic() {
  if (!ANTHROPIC_API_KEY) {
    console.error('[AI Parser] ANTHROPIC_API_KEY is not set in environment variables')
    return null
  }
  if (!anthropic) {
    console.log('[AI Parser] Creating Anthropic client with API key: [REDACTED]')
    anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  }
  return anthropic
}

export interface AIParseResult {
  success: boolean
  items: ParsedItem[]
  rawResponse?: string
  error?: string
  warning?: string
  debugInfo?: {
    rawItemCount: number
    filteredItemCount: number
    sampleRawItem: unknown
    potentiallyTruncated?: boolean
  }
}

function detectTruncatedJSON(responseText: string): boolean {
  const trimmed = responseText.trim()

  if (!trimmed.endsWith(']')) {
    return true
  }

  let bracketCount = 0
  let braceCount = 0
  let inString = false
  let escape = false

  for (const char of trimmed) {
    if (escape) {
      escape = false
      continue
    }
    if (char === '\\') {
      escape = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (!inString) {
      if (char === '[') bracketCount++
      if (char === ']') bracketCount--
      if (char === '{') braceCount++
      if (char === '}') braceCount--
    }
  }

  return bracketCount !== 0 || braceCount !== 0
}

function deduplicateItems(items: ParsedItem[]): ParsedItem[] {
  const seen = new Map<string, ParsedItem>()

  for (const item of items) {
    const key = item.sku
      ? `sku:${item.sku.toLowerCase().trim()}`
      : `desc:${item.description.toLowerCase().trim()}|${item.length}|${item.width}|${item.height}|${item.weight}`

    if (seen.has(key)) {
      const existing = seen.get(key)!
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1)
    } else {
      seen.set(key, { ...item })
    }
  }

  const deduped = Array.from(seen.values())
  console.log(`[deduplicateItems] Deduped from ${items.length} to ${deduped.length} items`)
  return deduped
}

const CARGO_EXTRACTION_PROMPT = `You are an expert at extracting cargo/freight data from ANY format - spreadsheets, tables, packing lists, emails, PDFs, etc.

Your job is to find ALL UNIQUE cargo items with their dimensions and weights.

LOOK FOR:
- Item names/descriptions (SKU, Name, Description, Part #, etc.)
- Dimensions - could be labeled as Length/Width/Height, L/W/H, Dimensions, Size, etc.
- Weights - could be in lbs, kg, tons, pounds, kilograms
- Quantities - Qty, Quantity, Count, Pcs, Units
- The data might have headers explaining units (e.g., "Length dimensions: Inches" or "Weight: Pounds")

UNDERSTAND DIFFERENT FORMATS:
- CSV/spreadsheet data with columns separated by commas or pipes
- Tables with headers that might span multiple rows
- Metadata rows that explain units (e.g., "Inches", "Pounds", "Decimeters")
- European formats (commas as decimals, different column names)
- Cargo Planner exports, packing lists, shipping manifests

Return a JSON array with this EXACT structure:
[
  {
    "sku": "item ID if available",
    "description": "item name or description",
    "quantity": 1,
    "length": 10.5,
    "width": 8.2,
    "height": 5.0,
    "weight": 15000,
    "stackable": true,
    "priority": 1
  }
]

CRITICAL CONVERSION RULES:
- Convert ALL dimensions to FEET:
  * Inches → divide by 12
  * Meters → multiply by 3.28084
  * Centimeters → divide by 30.48
  * Decimeters → multiply by 0.328084
- Convert ALL weights to POUNDS:
  * Kilograms → multiply by 2.20462
  * Tons → multiply by 2000
- Look for unit hints in headers or metadata rows

CRITICAL REQUIREMENTS - NO DUPLICATES:
- ONE JSON object per UNIQUE data row - if a spreadsheet has 47 rows of cargo, return exactly 47 JSON objects
- Use the "quantity" field for multiples - do NOT create separate JSON objects for each unit
- If the same item appears in multiple sheets, include it ONLY ONCE (deduplicate across sheets)
- NEVER duplicate items - each unique SKU/description should appear only once
- Skip header rows, totals rows, summary rows - only parse actual cargo data rows
- If units aren't specified, assume inches for dimensions and pounds for weight
- Stackable: true if "Yes"/"Y", false if "No"/"N"
- Return ONLY the JSON array, no explanation or comments
- If no items found, return []`

type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

type ImageSourceBlock = {
  type: 'image'
  source: {
    type: 'base64'
    media_type: ImageMimeType
    data: string
  }
}

type DocumentSourceBlock = {
  type: 'document'
  source: {
    type: 'base64'
    media_type: 'application/pdf'
    data: string
  }
}

type TextBlock = {
  type: 'text'
  text: string
}

type ContentBlock = ImageSourceBlock | DocumentSourceBlock | TextBlock

const extractTextFromContent = (content: Array<{ type?: string; text?: string }>) =>
  content.find((block) => block.type === 'text')?.text ?? ''

export async function parseImageWithAI(imageData: string): Promise<AIParseResult> {
  const client = getAnthropic()

  if (!client) {
    return {
      success: false,
      items: [],
      error: 'AI service not configured. Please set ANTHROPIC_API_KEY.',
    }
  }

  try {
    const match = imageData.match(/^data:(.+);base64,(.+)$/)
    if (!match) {
      return {
        success: false,
        items: [],
        error: 'Invalid image data format',
      }
    }

    const mimeType = match[1] as string
    const base64Data = match[2] as string
    const isPDF = mimeType === 'application/pdf'

    if (!isPDF) {
      const allowedImageTypes: ImageMimeType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedImageTypes.includes(mimeType as ImageMimeType)) {
        return {
          success: false,
          items: [],
          error: `Unsupported image type: ${mimeType}. Supported: ${allowedImageTypes.join(', ')}`,
        }
      }
    }

    console.log(`[parseImageWithAI] Processing ${isPDF ? 'PDF' : 'image'} with mime type: ${mimeType}`)

    const contentArray: ContentBlock[] = []

    if (isPDF) {
      contentArray.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      })
    } else {
      const imageMimeType = mimeType as ImageMimeType
      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageMimeType,
          data: base64Data,
        },
      })
    }

    contentArray.push({
      type: 'text',
      text: CARGO_EXTRACTION_PROMPT + `\n\nAnalyze this ${isPDF ? 'PDF document' : 'image'} and extract ALL cargo information. Make sure to extract EVERY item - do not stop early:`,
    })

    console.log('[parseImageWithAI] Starting streaming request with Opus 4.5...')

    type StreamParams = Parameters<typeof client.messages.stream>[0]
    type StreamContent = StreamParams['messages'][number]['content']
    const stream = client.messages.stream({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 30000,
      messages: [
        {
          role: 'user',
          content: contentArray as unknown as StreamContent,
        },
      ],
    })

    const finalMessage = await stream.finalMessage()
    const responseText = extractTextFromContent(finalMessage.content as Array<{ type?: string; text?: string }>)

    console.log('[parseImageWithAI] Stream complete, response length:', responseText.length)

    try {
      let jsonStr = responseText
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }

      const rawItems = JSON.parse(jsonStr) as Array<{
        sku?: string
        description: string
        quantity: number
        length: number
        width: number
        height: number
        weight: number
        stackable?: boolean
        priority?: number
      }>

      console.log(`[parseImageWithAI] AI returned ${rawItems.length} raw items`)

      const filteredItems: ParsedItem[] = rawItems
        .map((item, index) => ({
          id: `ai-${Date.now()}-${index}`,
          sku: item.sku,
          description: item.description || item.sku || `Item ${index + 1}`,
          quantity: item.quantity || 1,
          length: Math.round((item.length || 0) * 100) / 100,
          width: Math.round((item.width || 0) * 100) / 100,
          height: Math.round((item.height || 0) * 100) / 100,
          weight: Math.round(item.weight || 0),
          stackable: item.stackable,
          priority: item.priority,
        }))
        .filter(item =>
          item.length > 0 || item.width > 0 || item.height > 0 || item.weight > 0
        )

      console.log(`[parseImageWithAI] After filtering: ${filteredItems.length} items (filtered ${rawItems.length - filteredItems.length})`)

      const parsedItems = deduplicateItems(filteredItems)

      const potentiallyTruncated = detectTruncatedJSON(responseText)

      return {
        success: parsedItems.length > 0,
        items: parsedItems,
        rawResponse: responseText,
        warning: potentiallyTruncated
          ? 'Response may have been truncated. Some items might be missing.'
          : undefined,
        debugInfo: {
          rawItemCount: rawItems.length,
          filteredItemCount: parsedItems.length,
          sampleRawItem: rawItems[0],
          potentiallyTruncated,
        },
      }
    } catch (parseError) {
      console.error('[parseImageWithAI] JSON parse error:', parseError)
      console.error('[parseImageWithAI] Response text length:', responseText.length)
      console.error('[parseImageWithAI] Response preview:', responseText.substring(0, 500))
      return {
        success: false,
        items: [],
        rawResponse: responseText,
        error: 'Could not parse AI response. The image may not contain structured cargo data.',
      }
    }
  } catch (error) {
    console.error('AI Vision parsing error:', error)
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'AI vision processing failed',
    }
  }
}

export async function parseTextWithAI(text: string): Promise<AIParseResult> {
  const client = getAnthropic()

  if (!client) {
    console.error('Failed to create Anthropic client - API key missing or invalid')
    return {
      success: false,
      items: [],
      error: 'AI service not configured. Please set ANTHROPIC_API_KEY.',
    }
  }

  try {
    console.log('[parseTextWithAI] Starting streaming request with Opus 4.5...')

    const stream = client.messages.stream({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 30000,
      messages: [
        {
          role: 'user',
          content: CARGO_EXTRACTION_PROMPT + '\n\nDATA TO ANALYZE:\n' + text,
        },
      ],
    })

    const finalMessage = await stream.finalMessage()
    const responseText = extractTextFromContent(finalMessage.content as Array<{ type?: string; text?: string }>)

    console.log('[parseTextWithAI] Stream complete, response length:', responseText.length)

    const potentiallyTruncated = detectTruncatedJSON(responseText)

    try {
      let jsonStr = responseText
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }

      const rawItems = JSON.parse(jsonStr) as Array<{
        sku?: string
        description: string
        quantity: number
        length: number
        width: number
        height: number
        weight: number
        stackable?: boolean
        priority?: number
      }>

      console.log(`[parseTextWithAI] AI returned ${rawItems.length} raw items`)
      console.log(`[parseTextWithAI] Response text length: ${responseText.length} chars`)

      const filteredItems: ParsedItem[] = rawItems
        .map((item, index) => ({
          id: `ai-${Date.now()}-${index}`,
          sku: item.sku,
          description: item.description || item.sku || `Item ${index + 1}`,
          quantity: item.quantity || 1,
          length: Math.round((item.length || 0) * 100) / 100,
          width: Math.round((item.width || 0) * 100) / 100,
          height: Math.round((item.height || 0) * 100) / 100,
          weight: Math.round(item.weight || 0),
          stackable: item.stackable,
          priority: item.priority,
        }))
        .filter(item =>
          item.length > 0 || item.width > 0 || item.height > 0 || item.weight > 0
        )

      console.log(`[parseTextWithAI] After filtering: ${filteredItems.length} items (filtered out ${rawItems.length - filteredItems.length})`)

      const parsedItems = deduplicateItems(filteredItems)

      return {
        success: parsedItems.length > 0,
        items: parsedItems,
        rawResponse: responseText,
        warning: potentiallyTruncated
          ? 'Response may have been truncated. Some items might be missing.'
          : undefined,
        debugInfo: {
          rawItemCount: rawItems.length,
          filteredItemCount: parsedItems.length,
          sampleRawItem: rawItems[0],
          potentiallyTruncated,
        },
      }
    } catch (parseError) {
      console.error('[parseTextWithAI] JSON parse error:', parseError)
      console.error('[parseTextWithAI] Response text length:', responseText.length)
      console.error('[parseTextWithAI] Response preview:', responseText.substring(0, 500))
      return {
        success: false,
        items: [],
        rawResponse: responseText,
        error: `Could not parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      }
    }
  } catch (error) {
    console.error('[parseTextWithAI] Claude API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'AI text processing failed'
    console.error('[parseTextWithAI] Error message:', errorMessage)
    if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
      return {
        success: false,
        items: [],
        error: 'Invalid API key. Please check ANTHROPIC_API_KEY in environment variables.',
      }
    }
    if (errorMessage.includes('429')) {
      return {
        success: false,
        items: [],
        error: 'Rate limit exceeded. Please try again in a few moments.',
      }
    }
    return {
      success: false,
      items: [],
      error: errorMessage,
    }
  }
}

export async function parsePDFWithAI(pdfText: string): Promise<AIParseResult> {
  return parseTextWithAI(pdfText)
}

const MULTILANG_PROMPT = `${CARGO_EXTRACTION_PROMPT}

ADDITIONAL: This data may be in ANY language (English, German, Spanish, French, Chinese, Japanese, etc.)
Common dimension/weight terms in other languages:
- German: Länge (length), Breite (width), Höhe (height), Gewicht (weight), Stück (pieces)
- Spanish: Largo/Longitud (length), Ancho (width), Alto/Altura (height), Peso (weight)
- French: Longueur (length), Largeur (width), Hauteur (height), Poids (weight)
- Chinese: 长度 (length), 宽度 (width), 高度 (height), 重量 (weight)
- Japanese: 長さ (length), 幅 (width), 高さ (height), 重量 (weight)

Translate any item descriptions to English in your response.`

export async function parseTextWithAIMultilang(text: string): Promise<AIParseResult> {
  const client = getAnthropic()

  if (!client) {
    return {
      success: false,
      items: [],
      error: 'AI service not configured. Please set ANTHROPIC_API_KEY.',
    }
  }

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 30000,
      messages: [
        {
          role: 'user',
          content: MULTILANG_PROMPT + '\n\nDATA TO ANALYZE:\n' + text,
        },
      ],
    })

    const finalMessage = await stream.finalMessage()
    const responseText = extractTextFromContent(finalMessage.content as Array<{ type?: string; text?: string }>)

    const potentiallyTruncated = detectTruncatedJSON(responseText)

    try {
      let jsonStr = responseText
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }

      const items = JSON.parse(jsonStr) as Array<{
        sku?: string
        description: string
        quantity: number
        length: number
        width: number
        height: number
        weight: number
        stackable?: boolean
        priority?: number
      }>

      const parsedItems: ParsedItem[] = items
        .map((item, index) => ({
          id: `ai-${Date.now()}-${index}`,
          sku: item.sku,
          description: item.description || item.sku || `Item ${index + 1}`,
          quantity: item.quantity || 1,
          length: Math.round((item.length || 0) * 100) / 100,
          width: Math.round((item.width || 0) * 100) / 100,
          height: Math.round((item.height || 0) * 100) / 100,
          weight: Math.round(item.weight || 0),
          stackable: item.stackable,
          priority: item.priority,
        }))
        .filter(item =>
          item.length > 0 || item.width > 0 || item.height > 0 || item.weight > 0
        )

      return {
        success: parsedItems.length > 0,
        items: parsedItems,
        rawResponse: responseText,
        warning: potentiallyTruncated
          ? 'Response may have been truncated. Some items might be missing.'
          : undefined,
      }
    } catch {
      return {
        success: false,
        items: [],
        rawResponse: responseText,
        error: 'Could not parse AI response.',
      }
    }
  } catch (error) {
    console.error('Claude multilang parsing error:', error)
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'AI processing failed',
    }
  }
}
