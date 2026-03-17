import { NextResponse } from 'next/server'

export const revalidate = 1800 // 30 min cache

export async function GET() {
  try {
    // Primary: open.er-api.com (free, no key needed)
    const res = await fetch(`https://open.er-api.com/v6/latest/MYR`, {
      next: { revalidate: 1800 }
    })
    if (!res.ok) throw new Error(`ER-API status: ${res.status}`)
    const data = await res.json()
    if (!data.rates) throw new Error('No rates in response')

    // Also fetch previous day for daily change calc
    let prevRates: Record<string, number> | null = null
    for (let i = 1; i <= 5; i++) {
      try {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const ds = d.toISOString().split('T')[0]
        const prevRes = await fetch(
          `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${ds}/v1/currencies/myr.json`,
          { next: { revalidate: 86400 } }
        )
        if (prevRes.ok) {
          const prevData = await prevRes.json()
          if (prevData?.myr) {
            prevRates = {}
            for (const key in prevData.myr) {
              prevRates[key.toUpperCase()] = prevData.myr[key]
            }
            break
          }
        }
      } catch { /* try next day */ }
    }

    return NextResponse.json({
      rates: data.rates,
      prevRates,
      lastUpdate: data.time_last_update_utc || new Date().toUTCString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
