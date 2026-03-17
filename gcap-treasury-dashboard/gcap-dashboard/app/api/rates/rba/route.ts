import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  try {
    // RBA publishes cash rate as a downloadable CSV - much more reliable than HTML scraping
    const csvRes = await fetch(
      'https://www.rba.gov.au/statistics/tables/csv/f1-data.csv',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/csv,text/plain,*/*',
        },
        cache: 'no-store',
      }
    )

    if (!csvRes.ok) throw new Error(`RBA CSV status: ${csvRes.status}`)
    const csv = await csvRes.text()

    const lines = csv.split('\n').filter(l => l.trim())
    // Find the cash rate row - look for "Cash Rate Target" in the description rows
    // RBA F1 CSV format: date column + series columns, with metadata rows at top
    // Data rows start after the header section (usually after row with "Series ID")

    let cashRateColIndex = -1
    let dataStartRow = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.toLowerCase().includes('cash rate target') && cashRateColIndex === -1) {
        // This row describes the series - find which column
        const cols = line.split(',')
        for (let j = 0; j < cols.length; j++) {
          if (cols[j].toLowerCase().includes('cash rate target')) {
            cashRateColIndex = j
            break
          }
        }
      }
      // Data rows start after the row containing "Series ID"
      if (line.toLowerCase().includes('series id')) {
        dataStartRow = i + 1
      }
    }

    // If col detection failed, try column 1 (most common position in F1)
    if (cashRateColIndex < 0) cashRateColIndex = 1

    // Find last non-empty data row
    let lastDate = ''
    let lastRate: number | null = null

    if (dataStartRow > 0) {
      for (let i = dataStartRow; i < lines.length; i++) {
        const cols = lines[i].split(',')
        if (cols.length > cashRateColIndex) {
          const dateStr = cols[0]?.trim()
          const rateStr = cols[cashRateColIndex]?.trim()
          if (dateStr && rateStr && rateStr !== '' && !isNaN(parseFloat(rateStr))) {
            lastDate = dateStr
            lastRate = parseFloat(rateStr)
          }
        }
      }
    }

    // If CSV parsing failed, try the HTML page as fallback
    if (lastRate === null) {
      throw new Error('Could not parse RBA CSV data')
    }

    // Format date from RBA format (e.g. "2026-03-17" or "Mar-2026")
    let formattedDate = lastDate
    try {
      const d = new Date(lastDate)
      if (!isNaN(d.getTime())) {
        formattedDate = `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
      }
    } catch { /* keep original */ }

    return NextResponse.json({
      rate: lastRate,
      date: formattedDate,
      source: 'Reserve Bank of Australia (RBA)',
    })
  } catch (err: any) {
    // Fallback: try scraping the HTML table
    try {
      const res = await fetch('https://www.rba.gov.au/statistics/cash-rate/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
        },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`RBA HTML status: ${res.status}`)
      const html = await res.text()

      // Find the cash rate table and extract latest value
      // Look for patterns like "4.10" in a table context
      const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i)
      if (tableMatch) {
        const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []
        const monthNames2 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        for (let i = rows.length - 1; i >= 0; i--) {
          const cells = (rows[i].match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [])
            .map((c: string) => c.replace(/<[^>]+>/g, '').trim())
          if (cells.length >= 3) {
            const rate = parseFloat(cells[2]?.replace(/[^\d.]/g, ''))
            if (!isNaN(rate) && rate > 0 && rate < 20) {
              return NextResponse.json({
                rate,
                date: cells[0],
                source: 'Reserve Bank of Australia (RBA)',
              })
            }
          }
        }
      }
      throw new Error('Could not parse RBA HTML table')
    } catch (fallbackErr: any) {
      return NextResponse.json({ error: `Primary: ${err.message} | Fallback: ${fallbackErr.message}` }, { status: 500 })
    }
  }
}
