import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface LoadItem {
  id: string
  description: string
  quantity: number
  length: number
  width: number
  height: number
  weight: number
  unit: string
  weightUnit: string
}

interface ParsedLoad {
  items: LoadItem[]
}

const CARGO_PARSE_PROMPT = `You are a cargo data extraction assistant. Extract cargo/freight information from the provided content and return it as structured JSON.

For each item, extract:
- description: What the item is (e.g., "CAT 320 Excavator", "Steel Coils", "Transformer")
- quantity: Number of items (default to 1 if not specified)
- length: Length in FEET (convert if given in other units)
- width: Width in FEET (convert if given in other units)
- height: Height in FEET (convert if given in other units)
- weight: Weight in POUNDS (convert if given in other units like kg, tons)

Common unit conversions:
- 1 inch = 0.0833 feet
- 1 meter = 3.281 feet
- 1 cm = 0.0328 feet
- 1 kg = 2.205 lbs
- 1 ton (short) = 2000 lbs
- 1 ton (metric) = 2205 lbs

IMPORTANT:
- If dimensions are given as LxWxH format (e.g., "21' x 10' x 13'"), parse them correctly
- Look for patterns like "21ft x 10ft x 13ft" or "21' x 10' x 13'" or "21 x 10 x 13 feet"
- Weight often appears as "197,000 lbs" or "89,360 kg" - extract the number and convert to lbs
- If you see multiple items (e.g., "3 transformers"), set quantity accordingly
- For spreadsheet data, each row typically represents one item type

Return ONLY valid JSON in this exact format, no other text:
{
  "items": [
    {
      "id": "item-1",
      "description": "item description",
      "quantity": 1,
      "length": 21,
      "width": 10,
      "height": 13,
      "weight": 197000,
      "unit": "feet",
      "weightUnit": "lbs"
    }
  ]
}

If no cargo items can be extracted, return: {"items": []}`

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let textContent = ''
    let imageData: { type: 'base64'; media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; data: string } | null = null
    let pdfData: { type: 'base64'; media_type: 'application/pdf'; data: string } | null = null

    // Handle FormData (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        )
      }

      const fileName = file.name.toLowerCase()
      const fileBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(fileBuffer)

      // Handle different file types
      if (fileName.endsWith('.csv')) {
        // CSV - convert to text
        textContent = new TextDecoder().decode(bytes)
        textContent = `CSV File Content:\n${textContent}`
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Excel - we'll send as text description for now
        // In production, you'd use a library like xlsx to parse
        textContent = `Excel file uploaded: ${file.name}. Please note: For best results with Excel files, export as CSV first. The file contains spreadsheet data that may include cargo dimensions and weights.`
      } else if (fileName.endsWith('.txt')) {
        textContent = new TextDecoder().decode(bytes)
        textContent = `Text File Content:\n${textContent}`
      } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        // Image - send to Claude Vision
        const base64 = Buffer.from(bytes).toString('base64')
        const mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = fileName.endsWith('.png')
          ? 'image/png'
          : fileName.endsWith('.gif')
            ? 'image/gif'
            : fileName.endsWith('.webp')
              ? 'image/webp'
              : 'image/jpeg'

        imageData = {
          type: 'base64',
          media_type: mimeType,
          data: base64,
        }
      } else if (fileName.endsWith('.pdf')) {
        // PDF - send as document to Claude
        const base64 = Buffer.from(bytes).toString('base64')
        pdfData = {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64,
        }
      } else {
        return NextResponse.json(
          { success: false, error: `Unsupported file type: ${fileName}` },
          { status: 400 }
        )
      }
    } else {
      // Handle JSON body (text input)
      const body = await request.json()
      const emailText = body.emailText

      if (!emailText) {
        return NextResponse.json(
          { success: false, error: 'No text provided' },
          { status: 400 }
        )
      }

      textContent = `Email/Text Content:\n${emailText}`
    }

    // Build the message content
    const messageContent: Anthropic.MessageParam['content'] = []

    if (pdfData) {
      // PDF document
      messageContent.push({
        type: 'document',
        source: pdfData,
      })
      messageContent.push({
        type: 'text',
        text: CARGO_PARSE_PROMPT + '\n\nExtract cargo information from this PDF document.',
      })
    } else if (imageData) {
      // Image file
      messageContent.push({
        type: 'image',
        source: imageData,
      })
      messageContent.push({
        type: 'text',
        text: CARGO_PARSE_PROMPT + '\n\nExtract cargo information from this image.',
      })
    } else if (textContent) {
      messageContent.push({
        type: 'text',
        text: CARGO_PARSE_PROMPT + '\n\n' + textContent,
      })
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    })

    // Extract the response text
    const responseText =
      message.content[0]?.type === 'text' ? message.content[0].text : ''

    // Parse the JSON response
    let parsedLoad: ParsedLoad = { items: [] }

    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedLoad = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError)
      console.error('Raw response:', responseText)
    }

    // Ensure all items have required fields
    parsedLoad.items = parsedLoad.items.map((item, index) => ({
      id: item.id || `item-${index + 1}`,
      description: item.description || 'Unknown Item',
      quantity: item.quantity || 1,
      length: item.length || 0,
      width: item.width || 0,
      height: item.height || 0,
      weight: item.weight || 0,
      unit: item.unit || 'feet',
      weightUnit: item.weightUnit || 'lbs',
    }))

    return NextResponse.json({
      success: true,
      parsedLoad,
    })
  } catch (error) {
    console.error('Cargo analysis error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        error: `Failed to analyze cargo: ${errorMessage}`
      },
      { status: 500 }
    )
  }
}
