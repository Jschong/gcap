import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch(`https://www.bpam.com.my/local-market?t=${Date.now()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.bpam.com.my/',
      },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`BPAM responded with ${res.status}`)
    const text = await res.text()

    // Extract the raw_data_sets JS variable
    const match = text.match(/var raw_data_sets\s*=\s*(\{[\s\S]*?\});\s*(?:var|\/\/|$)/m)
      || text.match(/raw_data_sets\s*=\s*(\{[\s\S]*?\});/)
    if (!match) throw new Error('Could not find raw_data_sets on BPAM page')

    const data = JSON.parse(match[1])
    const curveData = data.Conventional_YTM_Curve
    if (!curveData) throw new Error('No curve data in BPAM response')

    const asAt = data.Conventional_Islamic_YTM_AsAt?.[0]?.AS_AT
      || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    const mgs = curveData.filter((c: any) => c.CURVE_NAME === 'LT Conv-Gov-MGS')
    const aaa = curveData.filter((c: any) => c.CURVE_NAME === 'LT Conv-Corporate-AAA')
    const aa2 = curveData.filter((c: any) => c.CURVE_NAME === 'LT Conv-Corporate-AA2')

    const getYield = (arr: any[], tenure: string): number => {
      const item = arr.find((c: any) => c.TENURE === tenure)
      return item ? parseFloat(item.YIELD) : 0
    }

    const rfRates = ['3Y', '5Y', '7Y', '10Y', '15Y', '20Y', '30Y'].map(t => ({
      tenor: t,
      rate: getYield(mgs, t),
    })).filter(r => r.rate > 0)

    const corporateBonds = ['3Y', '5Y', '10Y'].map(t => {
      const aaaYield = getYield(aaa, t)
      const aa2Yield = getYield(aa2, t)
      // AA1: for 5Y and 10Y same as AA2. For 3Y, halfway between AAA and AA2.
      let aa1Yield = aa2Yield
      if (t === '3Y' && aaaYield > 0 && aa2Yield > 0) {
        aa1Yield = aaaYield + (aa2Yield - aaaYield) / 2
      }
      // AA3: AA2 + 9bps for 3Y/5Y, AA2 + 10bps for 10Y
      const aa3Yield = aa2Yield + (t === '10Y' ? 0.10 : 0.09)
      return { tenor: t, aaa: aaaYield, aa1: aa1Yield, aa2: aa2Yield, aa3: aa3Yield }
    })

    return NextResponse.json({
      lastUpdate: asAt,
      rfRates,
      corporateBonds,
      rfRate10Y: getYield(mgs, '10Y'),
      source: 'BPAM Local Market',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
