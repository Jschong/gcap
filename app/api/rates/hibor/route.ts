import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  // HKMA provides an official API for HIBOR - much more reliable than scraping Hang Seng
  // https://api.hkma.gov.hk/public/market-data-and-statistics/monthly-statistical-bulletin/financial-market/interbank-rates
  try {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')

    // Try current month, then last month
    for (let offset = 0; offset <= 2; offset++) {
      const d = new Date(yyyy, today.getMonth() - offset, 1)
      const fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

      const url = `https://api.hkma.gov.hk/public/market-data-and-statistics/monthly-statistical-bulletin/financial-market/interbank-rates?startdate=${fromDate}&choose=hibor`

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })

      if (!res.ok) continue
      const data = await res.json()

      if (!data?.result?.dataSet || data.result.dataSet.length === 0) continue

      // Get the most recent entry
      const entries = data.result.dataSet
      const latest = entries[entries.length - 1]

      if (!latest) continue

      // HKMA field names: end_of_day (date), fixing_1m, fixing_3m, fixing_6m, fixing_12m
      const rate1M = parseFloat(latest.fixing_1m || latest['1_month'] || '0')
      const rate3M = parseFloat(latest.fixing_3m || latest['3_month'] || '0')
      const rate6M = parseFloat(latest.fixing_6m || latest['6_month'] || '0')

      const dateStr = latest.end_of_day || latest.date || ''
      let formattedDate = dateStr
      try {
        const dt = new Date(dateStr)
        if (!isNaN(dt.getTime())) {
          formattedDate = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        }
      } catch { /* keep original */ }

      if (rate6M > 0) {
        return NextResponse.json({
          lastUpdate: formattedDate,
          benchmark: rate6M,
          benchmarks: [
            { tenor: '1M', rate: rate1M },
            { tenor: '3M', rate: rate3M },
            { tenor: '6M', rate: rate6M },
          ],
          source: 'Hong Kong Monetary Authority (HKMA)',
        })
      }
    }

    throw new Error('No valid HIBOR data found from HKMA API')
  } catch (err: any) {
    // Fallback: Try the HKMA daily figures API
    try {
      const res = await fetch(
        'https://api.hkma.gov.hk/public/market-data-and-statistics/daily-monetary-statistics/daily-figures-interbank-liquidity?pagesize=5&sortby=end_of_day&sortorder=desc',
        {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store',
        }
      )
      if (!res.ok) throw new Error(`HKMA daily API status: ${res.status}`)
      const data = await res.json()

      // Try alternate HKMA HIBOR endpoint
      const res2 = await fetch(
        `https://api.hkma.gov.hk/public/market-data-and-statistics/daily-monetary-statistics/daily-figures-exchange-fund-bills-and-notes?pagesize=1&sortby=end_of_day&sortorder=desc`,
        {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store',
        }
      )

      // If all HKMA sources fail, return structured error so frontend uses fallback
      return NextResponse.json({ error: `HKMA API unavailable: ${err.message}` }, { status: 500 })
    } catch (fallbackErr: any) {
      return NextResponse.json({ error: `HIBOR unavailable: ${err.message}` }, { status: 500 })
    }
  }
}
