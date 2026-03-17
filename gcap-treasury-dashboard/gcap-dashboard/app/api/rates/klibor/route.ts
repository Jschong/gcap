import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  async function fetchWithRetry(retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(
          `https://financialmarkets.bnm.gov.my/data-download-klibor?t=${Date.now()}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': 'https://financialmarkets.bnm.gov.my/',
            },
            cache: 'no-store',
          }
        )
        if (!res.ok) throw new Error(`BNM responded with ${res.status}`)
        return await res.text()
      } catch (err: any) {
        if (i === retries - 1) throw err
        await new Promise(r => setTimeout(r, 2000))
      }
    }
    throw new Error('All retries exhausted')
  }

  try {
    const text = await fetchWithRetry()

    const tableMatch = text.match(/<table[^>]*id="tblUser"[^>]*>([\s\S]*?)<\/table>/i)
    if (!tableMatch) throw new Error('Could not find KLIBOR table')

    const tbodyMatch = tableMatch[1].match(/<tbody>([\s\S]*?)<\/tbody>/i)
    if (!tbodyMatch) throw new Error('Could not find KLIBOR tbody')

    const rows = tbodyMatch[1].match(/<tr>([\s\S]*?)<\/tr>/gi)
    if (!rows || rows.length === 0) throw new Error('No KLIBOR rows found')

    const lastRow = rows[rows.length - 1]
    const cells = lastRow.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
    if (!cells || cells.length < 5) throw new Error('Not enough KLIBOR cells')

    const clean = (html: string) => html.replace(/<[^>]+>/g, '').trim()

    const dateStr = clean(cells[0])
    const rate1M = parseFloat(clean(cells[1])) || 0
    const rate3M = parseFloat(clean(cells[3])) || 0
    const rate6M = parseFloat(clean(cells[4])) || 0

    // Format date DD/MM/YYYY → "16 Mar 2026"
    const parts = dateStr.split('/')
    let formattedDate = dateStr
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts
      formattedDate = `${parseInt(dd)} ${monthNames[parseInt(mm) - 1]} ${yyyy}`
    }

    return NextResponse.json({
      lastUpdate: formattedDate,
      benchmark: rate6M,
      benchmarks: [
        { tenor: '1M', rate: rate1M },
        { tenor: '3M', rate: rate3M },
        { tenor: '6M', rate: rate6M },
      ],
      source: 'Bank Negara Malaysia (BNM)',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
