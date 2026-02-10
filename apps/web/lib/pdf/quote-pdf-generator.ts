// @ts-nocheck
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PDFQuoteData {
  quoteNumber: string
  quoteDate: string
  validUntil: string
  company: {
    name: string
    address: string
    email: string
    phone: string
  }
  customer: {
    company: string
    name: string
    email: string
    phone: string
    address: string
  }
  pickup: { address: string; city: string; state: string; zip: string }
  dropoff: { address: string; city: string; state: string; zip: string }
  distance: number
  duration: number
  cargoItems: Array<{
    description: string
    quantity: number
    length: number
    width: number
    height: number
    weight: number
  }>
  serviceItems: Array<{
    name: string
    quantity: number
    rate: number
    total: number
  }>
  accessorialItems: Array<{
    name: string
    quantity: number
    rate: number
    total: number
  }>
  permitStates: Array<{
    stateCode: string
    stateName: string
    permitFees: number
    escortFees: number
    totalCost: number
  }>
  loadDiagrams?: Array<{
    truckName: string
    items: string[]
  }>
  servicesTotal: number
  accessorialsTotal: number
  grandTotal: number
  notes: string
  sections: {
    companyHeader: boolean
    clientInformation: boolean
    pickupDropoffLocations: boolean
    routeMap: boolean
    cargoDetails: boolean
    loadArrangementDiagrams: boolean
    loadCompliance: boolean
    servicesTable: boolean
    accessorialCharges: boolean
    permitEscortCosts: boolean
    pricingSummary: boolean
    termsNotes: boolean
  }
}

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],      // blue-600
  headerBg: [15, 23, 42] as [number, number, number],      // slate-900
  headerText: [255, 255, 255] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],  // slate-500
  border: [226, 232, 240] as [number, number, number],     // slate-200
  bg: [248, 250, 252] as [number, number, number],         // slate-50
  success: [22, 163, 74] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function generateQuotePDF(data: PDFQuoteData): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function checkPageBreak(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      y = margin
    }
  }

  function drawSectionHeader(title: string) {
    checkPageBreak(15)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text(title.toUpperCase(), margin, y)
    y += 2
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5
  }

  // ─── HEADER ───
  if (data.sections.companyHeader) {
    // Company name
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.text)
    doc.text(data.company.name.toUpperCase(), margin, y + 6)

    // Company details
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.textMuted)
    doc.text(data.company.address, margin, y + 12)
    doc.text(data.company.email, margin, y + 16)
    doc.text(data.company.phone, margin, y + 20)

    // Quote badge
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('QUOTATION', pageWidth - margin, y + 6, { align: 'right' })

    // Quote details
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.textMuted)
    const quoteInfoX = pageWidth - margin - 45
    doc.text('Quote ID', quoteInfoX, y + 12)
    doc.text('Issue Date', quoteInfoX, y + 16)
    doc.text('Valid Until', quoteInfoX, y + 20)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.text)
    doc.text(`#${data.quoteNumber}`, pageWidth - margin, y + 12, { align: 'right' })
    doc.text(data.quoteDate, pageWidth - margin, y + 16, { align: 'right' })
    doc.text(data.validUntil, pageWidth - margin, y + 20, { align: 'right' })

    y += 28
    doc.setDrawColor(...COLORS.border)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
  }

  // ─── CLIENT INFORMATION ───
  if (data.sections.clientInformation) {
    drawSectionHeader('Client Information')

    const fields = [
      ['Company', data.customer.company || '-'],
      ['Contact', data.customer.name || 'N/A'],
      ['Phone', data.customer.phone || '-'],
      ['Email', data.customer.email || '-'],
      ['Address', data.customer.address || '-'],
    ]

    doc.setFontSize(7)
    const colWidth = contentWidth / fields.length
    fields.forEach(([label, value], i) => {
      const x = margin + i * colWidth
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.textMuted)
      doc.text(label!.toUpperCase(), x, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.text)
      doc.text(value!, x, y + 4, { maxWidth: colWidth - 4 })
    })
    y += 14
  }

  // ─── LOCATIONS ───
  if (data.sections.pickupDropoffLocations) {
    drawSectionHeader('Transport Details')

    const colW = contentWidth / 3

    // Pickup
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('PICK-UP LOCATION', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(9)
    doc.text(data.pickup.address || '-', margin, y + 5, { maxWidth: colW - 5 })
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textMuted)
    if (data.pickup.city && data.pickup.state) {
      doc.text(`${data.pickup.city}, ${data.pickup.state} ${data.pickup.zip}`, margin, y + 10)
    }

    // Dropoff
    const col2X = margin + colW
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('DELIVERY LOCATION', col2X, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(9)
    doc.text(data.dropoff.address || '-', col2X, y + 5, { maxWidth: colW - 5 })
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textMuted)
    if (data.dropoff.city && data.dropoff.state) {
      doc.text(`${data.dropoff.city}, ${data.dropoff.state} ${data.dropoff.zip}`, col2X, y + 10)
    }

    // Distance
    const col3X = margin + colW * 2
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('TRANSPORT DISTANCE', col3X, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(9)
    doc.text(data.distance ? `${Math.round(data.distance).toLocaleString()} miles` : '-', col3X, y + 5)

    y += 18
  }

  // ─── CARGO DETAILS ───
  if (data.sections.cargoDetails && data.cargoItems.length > 0) {
    drawSectionHeader('Cargo Details')

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Qty', 'Dims (ft)', 'Weight (lbs)']],
      body: data.cargoItems.map(item => [
        item.description,
        item.quantity.toString(),
        `${item.length.toFixed(1)} × ${item.width.toFixed(1)} × ${item.height.toFixed(1)}`,
        item.weight.toLocaleString(),
      ]),
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.headerText,
        fontSize: 7,
        fontStyle: 'bold',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text,
        cellPadding: 3,
      },
      alternateRowStyles: { fillColor: COLORS.bg },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 45 },
        3: { halign: 'right', cellWidth: 35 },
      },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ─── PERMIT & ESCORT COSTS ───
  if (data.sections.permitEscortCosts && data.permitStates.length > 0) {
    checkPageBreak(40)
    drawSectionHeader('Permit & Escort Costs')

    const totalPermitFees = data.permitStates.reduce((s, p) => s + p.permitFees, 0)
    const totalEscortFees = data.permitStates.reduce((s, p) => s + p.escortFees, 0)
    const totalPermitCosts = totalPermitFees + totalEscortFees

    autoTable(doc, {
      startY: y,
      head: [['State', 'Permit Fee', 'Escort Cost', 'Total']],
      body: [
        ...data.permitStates.map(p => [
          `${p.stateName} (${p.stateCode})`,
          formatCurrency(p.permitFees),
          formatCurrency(p.escortFees),
          formatCurrency(p.totalCost),
        ]),
        // Totals row
        ['TOTAL', formatCurrency(totalPermitFees), formatCurrency(totalEscortFees), formatCurrency(totalPermitCosts)],
      ],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.headerText,
        fontSize: 7,
        fontStyle: 'bold',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text,
        cellPadding: 3,
      },
      alternateRowStyles: { fillColor: COLORS.bg },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'right', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 },
      },
      willDrawCell: (hookData) => {
        // Bold the totals row
        if (hookData.row.index === data.permitStates.length) {
          hookData.cell.styles.fontStyle = 'bold'
          hookData.cell.styles.fillColor = [220, 230, 245]
        }
      },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ─── SERVICES ───
  if (data.sections.servicesTable && data.serviceItems.length > 0) {
    checkPageBreak(40)
    drawSectionHeader('Inland Transportation Services')

    autoTable(doc, {
      startY: y,
      head: [['Service Description', 'Qty', 'Unit Rate', 'Line Total']],
      body: [
        ...data.serviceItems.map(item => [
          item.name,
          item.quantity.toString(),
          formatCurrency(item.rate),
          formatCurrency(item.total),
        ]),
        ['SUBTOTAL (SERVICES)', '', '', formatCurrency(data.servicesTotal)],
      ],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.headerText,
        fontSize: 7,
        fontStyle: 'bold',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text,
        cellPadding: 3,
      },
      alternateRowStyles: { fillColor: COLORS.bg },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 },
      },
      willDrawCell: (hookData) => {
        if (hookData.row.index === data.serviceItems.length) {
          hookData.cell.styles.fontStyle = 'bold'
          hookData.cell.styles.fillColor = [220, 230, 245]
        }
      },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ─── ACCESSORIALS ───
  if (data.sections.accessorialCharges && data.accessorialItems.length > 0) {
    checkPageBreak(40)
    drawSectionHeader('Accessorial Charges')

    autoTable(doc, {
      startY: y,
      head: [['Charge', 'Qty', 'Unit Rate', 'Line Total']],
      body: [
        ...data.accessorialItems.map(item => [
          item.name,
          item.quantity.toString(),
          formatCurrency(item.rate),
          formatCurrency(item.total),
        ]),
        ['SUBTOTAL (ACCESSORIALS)', '', '', formatCurrency(data.accessorialsTotal)],
      ],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.headerText,
        fontSize: 7,
        fontStyle: 'bold',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text,
        cellPadding: 3,
      },
      alternateRowStyles: { fillColor: COLORS.bg },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 },
      },
      willDrawCell: (hookData) => {
        if (hookData.row.index === data.accessorialItems.length) {
          hookData.cell.styles.fontStyle = 'bold'
          hookData.cell.styles.fillColor = [220, 230, 245]
        }
      },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ─── PRICING SUMMARY ───
  if (data.sections.pricingSummary) {
    checkPageBreak(40)
    drawSectionHeader('Pricing Summary')

    const totalPermits = data.permitStates.reduce((s, p) => s + p.totalCost, 0)

    const summaryRows = [
      ['Services Subtotal', formatCurrency(data.servicesTotal)],
      ['Accessorials Subtotal', formatCurrency(data.accessorialsTotal)],
    ]
    if (totalPermits > 0) {
      summaryRows.push(['Permit & Escort Costs', formatCurrency(totalPermits)])
    }
    summaryRows.push(['GRAND TOTAL', formatCurrency(data.grandTotal)])

    autoTable(doc, {
      startY: y,
      body: summaryRows,
      margin: { left: margin + contentWidth * 0.5, right: margin },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'normal' },
        1: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
      },
      willDrawCell: (hookData) => {
        if (hookData.row.index === summaryRows.length - 1) {
          hookData.cell.styles.fontStyle = 'bold'
          hookData.cell.styles.fontSize = 12
          hookData.cell.styles.fillColor = [37, 99, 235]
          hookData.cell.styles.textColor = [255, 255, 255]
        }
      },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ─── TERMS & NOTES ───
  if (data.sections.termsNotes && data.notes) {
    checkPageBreak(30)
    drawSectionHeader('Terms & Notes')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.text)
    const lines = doc.splitTextToSize(data.notes, contentWidth)
    doc.text(lines, margin, y)
    y += lines.length * 4 + 8
  }

  // ─── PAGE NUMBERS ───
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
    doc.text(
      `Generated by Ultra TMS`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' }
    )
  }

  return doc
}

export function downloadQuotePDF(data: PDFQuoteData): void {
  const doc = generateQuotePDF(data)
  doc.save(`quote-${data.quoteNumber}.pdf`)
}
