/**
 * Email Signature Parser
 * Extracts contact information from pasted email signatures
 */

export interface ParsedSignature {
  firstName?: string
  lastName?: string
  fullName?: string
  company?: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  title?: string
  website?: string
}

// Regex patterns
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_PATTERNS = [
  /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  /(?:phone|tel|cell|mobile|office|direct|fax|p|m|o|c)?[:\s]*(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/gi,
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
]
const CITY_STATE_ZIP_PATTERN = /([A-Za-z\s]+),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/i
const CITY_STATE_PATTERN = /^([A-Za-z\s]+),\s*([A-Z]{2})$/i
const WEBSITE_PATTERN = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi
const STREET_ADDRESS_PATTERN = /^\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place|pkwy|parkway|hwy|highway|circle|cir|terrace|ter)\.?\b/i

const TITLE_PATTERN = /\b(?:CEO|CFO|COO|CTO|CIO|CMO|VP|Vice President|President|Director|Manager|Owner|Partner|Founder|Principal|Chairman|Supervisor|Coordinator|Administrator|Executive|Officer|Consultant|Specialist|Analyst|Engineer|Developer|Designer|Architect|Lead|Head|Chief|Sales|Account|Representative|Agent|Broker|Realtor|Attorney|Lawyer|Accountant|Doctor|Nurse|Professor|Teacher)\b/i

const COMPANY_INDICATORS = /\b(?:Inc\.?|LLC|Corp\.?|Corporation|Company|Co\.?|Ltd\.?|Limited|Group|Holdings|Enterprises|Industries|Services|Solutions|Associates|Partners|Consulting|Logistics|Transport|Transportation|Trucking|Freight|Shipping|Equipment|Construction|Machinery|Heavy)\b/i

const LABEL_PATTERN = /^(?:phone|tel|cell|mobile|office|direct|fax|email|e-mail|address|name|company|title|website|web):?\s*/i

/**
 * Parse an email signature and extract contact information
 */
export function parseEmailSignature(signature: string): ParsedSignature {
  const result: ParsedSignature = {}

  const lines = signature
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (lines.length === 0) return result

  let foundEmail = false
  let foundPhone = false
  let foundMobile = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue;
    const lowerLine = line.toLowerCase()

    const emailMatches = line.match(EMAIL_PATTERN)
    if (emailMatches && !foundEmail) {
      result.email = emailMatches[0].toLowerCase()
      foundEmail = true
    }

    if (!foundPhone || !foundMobile) {
      for (const pattern of PHONE_PATTERNS) {
        const phoneMatches = line.match(pattern)
        if (phoneMatches) {
          const phone = phoneMatches[0].replace(LABEL_PATTERN, '').trim()

          if (!foundMobile && /(?:cell|mobile)/i.test(lowerLine)) {
            result.mobile = phone
            foundMobile = true
          } else if (!foundPhone) {
            result.phone = phone
            foundPhone = true
          }
        }
      }
    }

    if (!result.website && !EMAIL_PATTERN.test(line)) {
      const websiteMatches = line.match(WEBSITE_PATTERN)
      if (websiteMatches) {
        result.website = websiteMatches[0]
      }
    }

    if (!result.company && COMPANY_INDICATORS.test(line)) {
      let company = line
        .replace(/^(?:at|@|\||-|–|—)\s*/i, '')
        .replace(EMAIL_PATTERN, '')
        .replace(PHONE_PATTERNS[0] || /\d{3}[-.]?\d{3}[-.]?\d{4}/, '')
        .replace(WEBSITE_PATTERN, '')
        .trim()

      company = company.replace(TITLE_PATTERN, '').replace(/^[,|\s-–—]+/, '').trim()

      if (company.length > 2) {
        result.company = company
      }
    }

    const cityStateZipMatch = line.match(CITY_STATE_ZIP_PATTERN)
    if (cityStateZipMatch && cityStateZipMatch[1] && cityStateZipMatch[2] && !result.city) {
      result.city = cityStateZipMatch[1].trim()
      result.state = cityStateZipMatch[2].toUpperCase()
      result.zip = cityStateZipMatch[3]

      if (i > 0) {
        const prevLine = lines[i - 1]
        if (prevLine && /\d/.test(prevLine) && /\b(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place|pkwy|parkway|hwy|highway|suite|ste|floor|fl)\b/i.test(prevLine)) {
          result.address = `${prevLine}, ${line}`
        } else {
          result.address = line
        }
      } else {
        result.address = line
      }
    }

    if (!result.city) {
      const cityStateMatch = line.match(CITY_STATE_PATTERN)
      if (cityStateMatch && cityStateMatch[1] && cityStateMatch[2]) {
        result.city = cityStateMatch[1].trim()
        result.state = cityStateMatch[2].toUpperCase()
      }
    }

    if (!result.address && STREET_ADDRESS_PATTERN.test(line)) {
      result.address = line
    }
  }

  if (!result.fullName) {
    for (const line of lines) {
      if (!line) continue;
      if (EMAIL_PATTERN.test(line)) continue
      if (PHONE_PATTERNS[0] && PHONE_PATTERNS[0].test(line)) continue
      if (COMPANY_INDICATORS.test(line)) continue
      if (WEBSITE_PATTERN.test(line)) continue
      if (CITY_STATE_ZIP_PATTERN.test(line)) continue
      if (LABEL_PATTERN.test(line)) continue

      if (line.length > 2 && line.length < 50 && /[a-zA-Z]/.test(line)) {
        const titleMatch = line.match(TITLE_PATTERN)
        if (titleMatch) {
          const parts = line.split(/[,|–—-]/).map(p => p.trim())
          if (parts[0] && !TITLE_PATTERN.test(parts[0])) {
            result.fullName = parts[0]
            result.title = titleMatch[0]
          }
        } else {
          result.fullName = line
        }
        break
      }
    }
  }

  if (result.fullName) {
    const nameParts = result.fullName.split(/\s+/)
    if (nameParts.length >= 2) {
      result.firstName = nameParts[0]
      result.lastName = nameParts.slice(1).join(' ')
    }
  }

  return result
}
