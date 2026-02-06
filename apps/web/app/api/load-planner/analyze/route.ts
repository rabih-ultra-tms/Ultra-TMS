import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { parseTextWithAI, parseImageWithAI } from '@/lib/load-planner/ai-parser'
import type { LoadItem } from '@/lib/load-planner/types'

interface ParsedLoad {
  length: number
  width: number
  height: number
  weight: number
  totalWeight: number
  items: LoadItem[]
  confidence: number
}

interface AnalyzeResponse {
  success: boolean
  parsedLoad: ParsedLoad
  metadata?: {
    parseMethod?: 'text-ai' | 'image-ai' | 'spreadsheet' | 'items'
    itemsFound?: number
    confidence?: number
  }
  warning?: string
  error?: string
}

function convertSpreadsheetToText(data: ArrayBuffer, fileName: string): string {
  const workbook = XLSX.read(data, { type: 'array' })
  const textParts: string[] = []

  textParts.push(`File: ${fileName}`)
  textParts.push('')

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][]

    if (jsonData.length === 0) continue

    textParts.push(`=== Sheet: ${sheetName} ===`)
    textParts.push('')

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as unknown[]
      if (row.every(cell => cell === '' || cell === null || cell === undefined)) continue

      const rowText = row.map(cell => {
        if (cell === null || cell === undefined || cell === '') return ''
        return String(cell).trim()
      }).join(' | ')

      if (rowText.trim()) {
        textParts.push(rowText)
      }
    }

    textParts.push('')
  }

  return textParts.join('\n')
}

function buildParsedLoad(items: LoadItem[], confidence: number): ParsedLoad {
  const totalWeight = items.reduce((sum, i) => sum + (i.weight || 0) * (i.quantity || 1), 0)
  return {
    length: items.length ? Math.max(...items.map((i) => i.length || 0)) : 0,
    width: items.length ? Math.max(...items.map((i) => i.width || 0)) : 0,
    height: items.length ? Math.max(...items.map((i) => i.height || 0)) : 0,
    weight: items.length ? Math.max(...items.map((i) => i.weight || 0)) : 0,
    totalWeight,
    items,
    confidence,
  }
}

function createEmptyParsedLoad(): ParsedLoad {
  return {
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    totalWeight: 0,
    items: [],
    confidence: 0,
  }
}

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const requestId = crypto.randomUUID()
    console.log(`[analyze:${requestId}] Incoming request`, { contentType })

    let items: LoadItem[] = []
    let metadata: AnalyzeResponse['metadata'] = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const text = formData.get('text') as string | null

      if (file) {
        console.log(`[analyze:${requestId}] File received`, { name: file.name, type: file.type, size: file.size })
        const fileType = file.type
        const fileName = file.name.toLowerCase()

        if (fileType.startsWith('image/')) {
          console.log(`[analyze:${requestId}] Dispatching image AI parser`, { fileType })
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          const dataUrl = `data:${fileType};base64,${base64}`
          const result = await parseImageWithAI(dataUrl)
          console.log(`[analyze:${requestId}] Image AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
          items = result.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            length: item.length,
            width: item.width,
            height: item.height,
            weight: item.weight,
            stackable: item.stackable,
          }))
          metadata = { parseMethod: 'image-ai', itemsFound: items.length, confidence: 85 }
        } else if (fileName.endsWith('.csv')) {
          console.log(`[analyze:${requestId}] Dispatching text AI parser (csv)`)
          const csvText = await file.text()
          const result = await parseTextWithAI(csvText)
          console.log(`[analyze:${requestId}] Text AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
          items = result.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            length: item.length,
            width: item.width,
            height: item.height,
            weight: item.weight,
            stackable: item.stackable,
          }))
          metadata = { parseMethod: 'text-ai', itemsFound: items.length, confidence: 90 }
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          console.log(`[analyze:${requestId}] Dispatching text AI parser (spreadsheet)`)
          const arrayBuffer = await file.arrayBuffer()
          const spreadsheetText = convertSpreadsheetToText(arrayBuffer, fileName)
          const result = await parseTextWithAI(spreadsheetText)
          console.log(`[analyze:${requestId}] Text AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
          items = result.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            length: item.length,
            width: item.width,
            height: item.height,
            weight: item.weight,
            stackable: item.stackable,
          }))
          metadata = { parseMethod: 'text-ai', itemsFound: items.length, confidence: 90 }
        } else if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
          console.log(`[analyze:${requestId}] Dispatching image AI parser (pdf)`)
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          const dataUrl = `data:application/pdf;base64,${base64}`
          const result = await parseImageWithAI(dataUrl)
          console.log(`[analyze:${requestId}] Image AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
          items = result.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            length: item.length,
            width: item.width,
            height: item.height,
            weight: item.weight,
            stackable: item.stackable,
          }))
          metadata = { parseMethod: 'image-ai', itemsFound: items.length, confidence: 90 }
        } else if (fileName.endsWith('.txt') || fileName.endsWith('.eml')) {
          console.log(`[analyze:${requestId}] Dispatching text AI parser (text/eml)`)
          const textContent = await file.text()
          const result = await parseTextWithAI(textContent)
          console.log(`[analyze:${requestId}] Text AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
          items = result.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            length: item.length,
            width: item.width,
            height: item.height,
            weight: item.weight,
            stackable: item.stackable,
          }))
          metadata = { parseMethod: 'text-ai', itemsFound: items.length, confidence: 85 }
        } else {
          return NextResponse.json<AnalyzeResponse>(
            {
              success: false,
              parsedLoad: createEmptyParsedLoad(),
              error: `Unsupported file type: ${fileType || fileName}. Supported: images, Excel (.xlsx/.xls), CSV, PDF, text files`,
            },
            { status: 400 }
          )
        }
      } else if (text) {
        console.log(`[analyze:${requestId}] Text field received`, { length: text.length })
        const result = await parseTextWithAI(text)
        console.log(`[analyze:${requestId}] Text AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
        items = result.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          stackable: item.stackable,
        }))
        metadata = { parseMethod: 'text-ai', itemsFound: items.length, confidence: 85 }
      } else {
        return NextResponse.json<AnalyzeResponse>(
          {
            success: false,
            parsedLoad: createEmptyParsedLoad(),
            error: 'No file or text provided',
          },
          { status: 400 }
        )
      }
    } else if (contentType.includes('application/json')) {
      const body = await request.json()

      if (body.text || body.emailText) {
        const text = body.text || body.emailText
        console.log(`[analyze:${requestId}] JSON text received`, { length: typeof text === 'string' ? text.length : 0 })
        if (typeof text !== 'string' || text.trim().length < 10) {
          return NextResponse.json<AnalyzeResponse>(
            {
              success: false,
              parsedLoad: createEmptyParsedLoad(),
              error: 'Text is too short to analyze (minimum 10 characters)',
            },
            { status: 400 }
          )
        }
        const result = await parseTextWithAI(text)
        console.log(`[analyze:${requestId}] Text AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
        items = result.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          stackable: item.stackable,
        }))
        metadata = { parseMethod: 'text-ai', itemsFound: items.length, confidence: 85 }
      } else if (body.imageBase64 && body.mimeType) {
        const dataUrl = body.imageBase64.startsWith('data:')
          ? body.imageBase64
          : `data:${body.mimeType};base64,${body.imageBase64}`
        console.log(`[analyze:${requestId}] JSON image received`, { mimeType: body.mimeType })
        const result = await parseImageWithAI(dataUrl)
        console.log(`[analyze:${requestId}] Image AI parser result`, { success: result.success, items: result.items.length, warning: result.warning })
        items = result.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          stackable: item.stackable,
        }))
        metadata = { parseMethod: 'image-ai', itemsFound: items.length, confidence: 85 }
      } else if (body.items && Array.isArray(body.items)) {
        items = body.items
        metadata = { parseMethod: 'items', itemsFound: items.length, confidence: 100 }
      } else if (body.rows && Array.isArray(body.rows)) {
        items = body.rows.map((row: Record<string, unknown>, index: number) => ({
          id: `item-${index}`,
          description: String(row.description || row.name || row.item || 'Unknown Item'),
          quantity: Number(row.quantity || row.qty || 1),
          length: Number(row.length || 0),
          width: Number(row.width || 0),
          height: Number(row.height || 0),
          weight: Number(row.weight || 0),
          stackable: Boolean(row.stackable),
        }))
        metadata = { parseMethod: 'spreadsheet', itemsFound: items.length, confidence: 80 }
      } else {
        return NextResponse.json<AnalyzeResponse>(
          {
            success: false,
            parsedLoad: createEmptyParsedLoad(),
            error: 'Invalid request body. Provide text, imageBase64+mimeType, items array, or rows array',
          },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          parsedLoad: createEmptyParsedLoad(),
          error: 'Unsupported content type. Use multipart/form-data or application/json',
        },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      console.log(`[analyze:${requestId}] No items extracted`, { metadata })
      return NextResponse.json<AnalyzeResponse>({
        success: true,
        parsedLoad: createEmptyParsedLoad(),
        metadata,
        warning: 'No cargo items could be extracted. Please check the input format.',
      })
    }

    const validItems = items.filter(
      (item) => item.length > 0 || item.width > 0 || item.height > 0 || item.weight > 0
    )

    if (validItems.length === 0) {
      console.log(`[analyze:${requestId}] Items extracted with no dimensions`, { count: items.length })
      return NextResponse.json<AnalyzeResponse>({
        success: true,
        parsedLoad: buildParsedLoad(items, metadata?.confidence || 80),
        metadata,
        warning: 'Items were found but none have any dimensions (length, width, height, or weight).',
      })
    }

    const warning = validItems.length < items.length
      ? `${items.length - validItems.length} item(s) have incomplete dimensions - please review.`
      : undefined

    const finalParsedLoad = buildParsedLoad(items, metadata?.confidence || 80)

    return NextResponse.json<AnalyzeResponse>({
      success: true,
      parsedLoad: finalParsedLoad,
      metadata,
      warning,
    })
  } catch (error) {
    console.error('Error analyzing cargo:', error)
    let errorMessage = 'Failed to analyze cargo. Please try again.'
    if (error instanceof Error) {
      errorMessage = error.message
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'AI service authentication failed. Check ANTHROPIC_API_KEY.'
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = 'AI service rate limit exceeded. Please wait a moment and try again.'
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'AI service request timed out. Try a smaller file.'
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        errorMessage = 'Network error connecting to AI service.'
      }
    }
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        parsedLoad: createEmptyParsedLoad(),
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
