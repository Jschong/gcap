import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch(
      `https://asx.api.markitdigital.com/asx-research/1.0/bbsw/rates?t=${Date.now()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.asx.com.au',
          'Referer': 'https://www.asx.com.au/',
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) throw new Error(`ASX API status: ${res.status}`)
    const data = await res.json()

    if (!data?.data?.items) throw new Error('Unexpected BBSW response structure')

    const items = data.data.items
    const find = (tenor: string) => {
      const item = items.find((i: any) => i.tenor === tenor)
      return item ? parseFloat(item.mid) : null
    }

    const bbsw1M = find('1M')
    const bbsw3M = find('3M')
    const bbsw6M = find('6M')

    let lastUpdate = data.data.dateAsOf
    if (lastUpdate) {
      const d = new Date(lastUpdate)
      if (!isNaN(d.getTime())) {
        lastUpdate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    }

    return NextResponse.json({
      lastUpdate: lastUpdate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      benchmark: bbsw6M,
      benchmarks: [
        { tenor: '1M', rate: bbsw1M },
        { tenor: '3M', rate: bbsw3M },
        { tenor: '6M', rate: bbsw6M },
      ],
      source: 'ASX (Australian Securities Exchange)',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
