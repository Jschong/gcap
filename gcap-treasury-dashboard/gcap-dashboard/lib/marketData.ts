export interface BenchmarkRate {
  tenor: string
  rate: number
}

export interface RFRate {
  tenor: string
  rate: number
}

export interface CorporateBond {
  tenor: string
  aaa: number
  aa1: number
  aa2: number
  aa3: number
}

export interface HistoricalPoint {
  month: string
  cashRate: number | null
  benchmark: number
  rfRate: number
  cpi: number
  fxRate: number
}

export interface ForwardRate {
  date: string
  rate: number
}

export interface CountryData {
  id: string
  name: string
  currency: string
  flag: string
  sources: string[]
  centralBank: string
  cashRate: number | null
  cashRateName: string
  cashRateLastUpdate: string
  cashRateNextUpdate: string
  benchmark: number
  benchmarkName: string
  benchmarkLastUpdate: string
  benchmarkSource: string
  rfRate: number
  rfName: string
  rfShortName: string
  rfLastUpdate: string
  rfSource: string
  cpi: number
  cpiLastUpdate: string
  fxVsMYR: number
  benchmarks: BenchmarkRate[]
  rfRates: RFRate[]
  corporateBonds?: CorporateBond[]
  corporateBondsLastUpdate?: string
  corporateBondsSource?: string
  forwardRates?: ForwardRate[]
  oilImpact: string
  summary: string
  historical: HistoricalPoint[]
}

export const STATIC_MARKET_DATA: Record<string, CountryData> = {
  MY: {
    id: 'MY', name: 'Malaysia', currency: 'MYR', flag: '🇲🇾',
    sources: ['Bank Negara Malaysia (BNM)', 'Department of Statistics Malaysia (DOSM)', 'BIX Malaysia', 'AmBank Research'],
    centralBank: 'Bank Negara Malaysia (BNM)',
    cashRate: 2.75,
    cashRateName: 'OPR',
    cashRateLastUpdate: '5 Mar 2026',
    cashRateNextUpdate: '7 May 2026',
    benchmark: 3.31,
    benchmarkName: 'KLIBOR',
    benchmarkLastUpdate: '16 Mar 2026',
    benchmarkSource: 'Bank Negara Malaysia (BNM) / AmBank Research',
    rfRate: 3.60,
    rfName: '10Y MGS',
    rfShortName: '10Y MGS',
    rfLastUpdate: '13 Mar 2026',
    rfSource: 'BPAM Local Market',
    cpi: 1.60,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 1.0000,
    benchmarks: [
      { tenor: '1M', rate: 3.00 },
      { tenor: '3M', rate: 3.28 },
      { tenor: '6M', rate: 3.31 }
    ],
    rfRates: [
      { tenor: '3Y', rate: 3.21 },
      { tenor: '5Y', rate: 3.36 },
      { tenor: '7Y', rate: 3.48 },
      { tenor: '10Y', rate: 3.60 },
      { tenor: '15Y', rate: 3.84 },
      { tenor: '20Y', rate: 3.96 },
      { tenor: '30Y', rate: 4.02 }
    ],
    corporateBonds: [
      { tenor: '3Y', aaa: 3.58, aa1: 3.70, aa2: 3.70, aa3: 3.70 },
      { tenor: '5Y', aaa: 3.67, aa1: 3.79, aa2: 3.79, aa3: 3.79 },
      { tenor: '10Y', aaa: 3.87, aa1: 3.99, aa2: 3.99, aa3: 3.99 }
    ],
    corporateBondsLastUpdate: '13 Mar 2026',
    corporateBondsSource: 'BPAM Local Market',
    oilImpact: "As a net exporter of oil and gas, Malaysia stands to benefit from higher energy prices driven by geopolitical tensions. This provides support to the MYR and boosts government revenue, though it may increase the fiscal burden of domestic fuel subsidies.",
    summary: "Malaysia's inflation remains well-contained at 1.6%. With the OPR held steady at 2.75% and KLIBOR 6M at 3.31%, the interest rate environment remains supportive of domestic growth.",
    historical: [
      { month: 'Apr 25', cashRate: 3.00, benchmark: 3.45, rfRate: 3.90, cpi: 2.0, fxRate: 1.0000 },
      { month: 'May 25', cashRate: 3.00, benchmark: 3.40, rfRate: 3.88, cpi: 1.9, fxRate: 1.0000 },
      { month: 'Jun 25', cashRate: 3.00, benchmark: 3.35, rfRate: 3.85, cpi: 1.9, fxRate: 1.0000 },
      { month: 'Jul 25', cashRate: 3.00, benchmark: 3.30, rfRate: 3.82, cpi: 1.8, fxRate: 1.0000 },
      { month: 'Aug 25', cashRate: 2.75, benchmark: 3.25, rfRate: 3.80, cpi: 1.8, fxRate: 1.0000 },
      { month: 'Sep 25', cashRate: 2.75, benchmark: 3.22, rfRate: 3.78, cpi: 1.8, fxRate: 1.0000 },
      { month: 'Oct 25', cashRate: 2.75, benchmark: 3.20, rfRate: 3.75, cpi: 1.8, fxRate: 1.0000 },
      { month: 'Nov 25', cashRate: 2.75, benchmark: 3.22, rfRate: 3.78, cpi: 1.7, fxRate: 1.0000 },
      { month: 'Dec 25', cashRate: 2.75, benchmark: 3.24, rfRate: 3.80, cpi: 1.6, fxRate: 1.0000 },
      { month: 'Jan 26', cashRate: 2.75, benchmark: 3.25, rfRate: 3.82, cpi: 1.6, fxRate: 1.0000 },
      { month: 'Feb 26', cashRate: 2.75, benchmark: 3.27, rfRate: 3.85, cpi: 1.5, fxRate: 1.0000 },
      { month: 'Mar 26', cashRate: 2.75, benchmark: 3.31, rfRate: 3.60, cpi: 1.60, fxRate: 1.0000 }
    ]
  },
  US: {
    id: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸',
    sources: ['Federal Reserve', 'Bureau of Labor Statistics (BLS)', 'US Department of the Treasury', 'CME Group'],
    centralBank: 'Federal Reserve',
    cashRate: 3.75,
    cashRateName: 'Fed Funds Rate',
    cashRateLastUpdate: '28 Jan 2026',
    cashRateNextUpdate: '19 Mar 2026',
    benchmark: 3.63,
    benchmarkName: 'SOFR',
    benchmarkLastUpdate: '12 Mar 2026',
    benchmarkSource: 'CME Group / Federal Reserve',
    rfRate: 4.11,
    rfName: '10Y Gov Bond',
    rfShortName: '10Y Bond',
    rfLastUpdate: '12 Mar 2026',
    rfSource: 'US Department of the Treasury',
    cpi: 2.70,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 3.9280,
    benchmarks: [
      { tenor: '1M', rate: 3.67 },
      { tenor: '3M', rate: 3.67 },
      { tenor: '6M', rate: 3.63 }
    ],
    rfRates: [
      { tenor: '1Y', rate: 3.53 },
      { tenor: '3Y', rate: 3.58 },
      { tenor: '5Y', rate: 3.70 },
      { tenor: '7Y', rate: 3.90 },
      { tenor: '10Y', rate: 4.11 },
      { tenor: '20Y', rate: 4.69 }
    ],
    oilImpact: "The US is a major oil producer and net exporter. While higher prices benefit domestic energy sectors, they pose an upside risk to consumer inflation, potentially forcing the Fed to maintain a restrictive stance longer than anticipated.",
    summary: "The USD/MYR spot has strengthened to 3.9280. With the Fed Funds Rate at 3.75% and the 10Y Treasury yield softening to 4.11%, the market is pricing in a more neutral policy outlook.",
    historical: [
      { month: 'Apr 25', cashRate: 5.25, benchmark: 5.30, rfRate: 4.70, cpi: 3.4, fxRate: 4.7500 },
      { month: 'May 25', cashRate: 5.25, benchmark: 5.25, rfRate: 4.65, cpi: 3.3, fxRate: 4.7200 },
      { month: 'Jun 25', cashRate: 5.00, benchmark: 5.10, rfRate: 4.60, cpi: 3.2, fxRate: 4.6800 },
      { month: 'Jul 25', cashRate: 5.00, benchmark: 4.90, rfRate: 4.55, cpi: 3.1, fxRate: 4.6500 },
      { month: 'Aug 25', cashRate: 4.75, benchmark: 4.70, rfRate: 4.50, cpi: 3.0, fxRate: 4.6000 },
      { month: 'Sep 25', cashRate: 4.50, benchmark: 4.40, rfRate: 4.55, cpi: 2.9, fxRate: 4.5500 },
      { month: 'Oct 25', cashRate: 4.25, benchmark: 4.10, rfRate: 4.60, cpi: 2.8, fxRate: 4.4773 },
      { month: 'Nov 25', cashRate: 4.00, benchmark: 3.90, rfRate: 4.45, cpi: 2.7, fxRate: 4.4783 },
      { month: 'Dec 25', cashRate: 4.00, benchmark: 3.85, rfRate: 4.40, cpi: 2.6, fxRate: 4.3510 },
      { month: 'Jan 26', cashRate: 3.75, benchmark: 3.75, rfRate: 4.35, cpi: 2.5, fxRate: 4.1200 },
      { month: 'Feb 26', cashRate: 3.75, benchmark: 3.68, rfRate: 4.28, cpi: 2.4, fxRate: 4.0500 },
      { month: 'Mar 26', cashRate: 3.75, benchmark: 3.63, rfRate: 4.11, cpi: 2.70, fxRate: 3.9280 }
    ]
  },
  AU: {
    id: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺',
    sources: ['Reserve Bank of Australia (RBA)', 'Australian Bureau of Statistics (ABS)', 'ASX'],
    centralBank: 'Reserve Bank of Australia',
    cashRate: 4.10,
    cashRateName: 'RBA Cash Rate',
    cashRateLastUpdate: '17 Mar 2026',
    cashRateNextUpdate: '5 May 2026',
    benchmark: 4.63,
    benchmarkName: 'BBSW',
    benchmarkLastUpdate: '16 Mar 2026',
    benchmarkSource: 'ASX (Australian Securities Exchange)',
    rfRate: 4.85,
    rfName: '10Y Gov Bond',
    rfShortName: '10Y Bond',
    rfLastUpdate: '13 Mar 2026',
    rfSource: 'Reserve Bank of Australia (RBA)',
    cpi: 3.60,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 2.7853,
    benchmarks: [
      { tenor: '1M', rate: 3.95 },
      { tenor: '3M', rate: 4.17 },
      { tenor: '6M', rate: 4.63 }
    ],
    rfRates: [
      { tenor: '1Y', rate: 4.34 },
      { tenor: '3Y', rate: 4.48 },
      { tenor: '5Y', rate: 4.56 },
      { tenor: '7Y', rate: 4.68 },
      { tenor: '10Y', rate: 4.85 },
      { tenor: '15Y', rate: 5.05 },
      { tenor: '20Y', rate: 5.23 }
    ],
    oilImpact: "Australia is a net importer of crude oil but a massive exporter of LNG and coal. The net impact on terms of trade is positive, but higher imported fuel costs will exacerbate already sticky domestic inflation.",
    summary: "The RBA raised the cash rate to 4.10% in its March 17 meeting, a 25bps hike widely expected to address persistent domestic inflation. Short-term funding costs remain elevated, with the 6M BBSW at 4.63%.",
    historical: [
      { month: 'Apr 25', cashRate: 4.35, benchmark: 4.40, rfRate: 4.30, cpi: 4.1, fxRate: 3.1500 },
      { month: 'May 25', cashRate: 4.35, benchmark: 4.35, rfRate: 4.25, cpi: 4.0, fxRate: 3.1200 },
      { month: 'Jun 25', cashRate: 4.10, benchmark: 4.20, rfRate: 4.20, cpi: 3.9, fxRate: 3.1000 },
      { month: 'Jul 25', cashRate: 4.10, benchmark: 4.15, rfRate: 4.15, cpi: 3.9, fxRate: 3.0800 },
      { month: 'Aug 25', cashRate: 3.85, benchmark: 4.10, rfRate: 4.10, cpi: 3.8, fxRate: 3.0500 },
      { month: 'Sep 25', cashRate: 3.85, benchmark: 4.05, rfRate: 4.05, cpi: 3.8, fxRate: 3.0400 },
      { month: 'Oct 25', cashRate: 3.60, benchmark: 4.05, rfRate: 4.10, cpi: 3.8, fxRate: 3.0255 },
      { month: 'Nov 25', cashRate: 3.60, benchmark: 4.10, rfRate: 4.15, cpi: 3.6, fxRate: 3.0153 },
      { month: 'Dec 25', cashRate: 3.60, benchmark: 4.15, rfRate: 4.12, cpi: 3.5, fxRate: 2.9853 },
      { month: 'Jan 26', cashRate: 3.60, benchmark: 4.20, rfRate: 4.18, cpi: 3.4, fxRate: 2.8870 },
      { month: 'Feb 26', cashRate: 3.85, benchmark: 4.23, rfRate: 4.22, cpi: 3.3, fxRate: 2.7773 },
      { month: 'Mar 26', cashRate: 4.10, benchmark: 4.63, rfRate: 4.85, cpi: 3.60, fxRate: 2.7853 }
    ]
  },
  UK: {
    id: 'UK', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧',
    sources: ['Bank of England (BoE)', 'Office for National Statistics (ONS)'],
    centralBank: 'Bank of England',
    cashRate: 3.75,
    cashRateName: 'BoE Base Rate',
    cashRateLastUpdate: '18 Dec 2025',
    cashRateNextUpdate: '19 Mar 2026',
    benchmark: 3.68,
    benchmarkName: 'SONIA',
    benchmarkLastUpdate: '12 Mar 2026',
    benchmarkSource: 'Bank of England',
    rfRate: 4.65,
    rfName: '10Y UK Gilt',
    rfShortName: '10Y Gilt',
    rfLastUpdate: '12 Mar 2026',
    rfSource: 'Bank of England / DMO',
    cpi: 3.40,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 5.2826,
    benchmarks: [
      { tenor: '1M', rate: 3.72 },
      { tenor: '3M', rate: 3.70 },
      { tenor: '6M', rate: 3.68 }
    ],
    rfRates: [
      { tenor: '1Y', rate: 3.90 },
      { tenor: '3Y', rate: 4.06 },
      { tenor: '5Y', rate: 4.16 },
      { tenor: '7Y', rate: 4.37 },
      { tenor: '10Y', rate: 4.65 },
      { tenor: '15Y', rate: 5.03 },
      { tenor: '20Y', rate: 5.24 }
    ],
    forwardRates: [
      { date: 'Jun-26', rate: 4.72 },
      { date: 'Sep-26', rate: 4.77 },
      { date: 'Dec-26', rate: 4.83 },
      { date: 'Mar-27', rate: 4.88 },
      { date: 'Jun-27', rate: 4.93 },
      { date: 'Sep-27', rate: 4.98 },
      { date: 'Dec-27', rate: 5.03 },
      { date: 'Mar-28', rate: 5.08 }
    ],
    oilImpact: "As a net importer of oil, the UK is vulnerable to energy shocks from Middle East tensions. A sustained spike in oil prices will directly hit the trade balance and could reverse recent progress on disinflation.",
    summary: "The UK yield curve has steepened, with 6M SONIA at 3.68% and 10Y Gilts at 4.65%. This shift reflects market adjustments to persistent inflation of 3.4%.",
    historical: [
      { month: 'Apr 25', cashRate: 5.25, benchmark: 4.80, rfRate: 4.50, cpi: 3.2, fxRate: 5.8000 },
      { month: 'May 25', cashRate: 5.25, benchmark: 4.70, rfRate: 4.45, cpi: 3.1, fxRate: 5.7500 },
      { month: 'Jun 25', cashRate: 5.00, benchmark: 4.50, rfRate: 4.40, cpi: 3.0, fxRate: 5.6500 },
      { month: 'Jul 25', cashRate: 5.00, benchmark: 4.40, rfRate: 4.35, cpi: 2.9, fxRate: 5.6000 },
      { month: 'Aug 25', cashRate: 4.75, benchmark: 4.20, rfRate: 4.30, cpi: 2.8, fxRate: 5.5000 },
      { month: 'Sep 25', cashRate: 4.50, benchmark: 4.00, rfRate: 4.25, cpi: 2.7, fxRate: 5.4500 },
      { month: 'Oct 25', cashRate: 4.25, benchmark: 3.80, rfRate: 4.30, cpi: 2.5, fxRate: 5.3667 },
      { month: 'Nov 25', cashRate: 4.00, benchmark: 3.75, rfRate: 4.20, cpi: 2.2, fxRate: 5.3861 },
      { month: 'Dec 25', cashRate: 3.75, benchmark: 3.65, rfRate: 4.10, cpi: 2.0, fxRate: 5.3720 },
      { month: 'Jan 26', cashRate: 3.75, benchmark: 3.60, rfRate: 4.05, cpi: 1.9, fxRate: 5.3554 },
      { month: 'Feb 26', cashRate: 3.75, benchmark: 3.55, rfRate: 4.00, cpi: 1.8, fxRate: 5.3410 },
      { month: 'Mar 26', cashRate: 3.75, benchmark: 3.68, rfRate: 4.65, cpi: 3.40, fxRate: 5.2826 }
    ]
  },
  NZ: {
    id: 'NZ', name: 'New Zealand', currency: 'NZD', flag: '🇳🇿',
    sources: ['Reserve Bank of New Zealand (RBNZ)', 'Stats NZ'],
    centralBank: 'Reserve Bank of New Zealand',
    cashRate: 2.25,
    cashRateName: 'RBNZ OCR',
    cashRateLastUpdate: '18 Feb 2026',
    cashRateNextUpdate: '8 Apr 2026',
    benchmark: 2.63,
    benchmarkName: 'BKBM',
    benchmarkLastUpdate: '12 Mar 2026',
    benchmarkSource: 'New Zealand Financial Markets Association (NZFMA)',
    rfRate: 4.57,
    rfName: '10Y Gov Bond',
    rfShortName: '10Y Bond',
    rfLastUpdate: '12 Mar 2026',
    rfSource: 'Reserve Bank of New Zealand (RBNZ)',
    cpi: 3.10,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 2.3275,
    benchmarks: [
      { tenor: '1M', rate: 2.43 },
      { tenor: '3M', rate: 2.50 },
      { tenor: '6M', rate: 2.63 }
    ],
    rfRates: [
      { tenor: '3Y', rate: 3.60 },
      { tenor: '5Y', rate: 4.06 },
      { tenor: '7Y', rate: 4.31 },
      { tenor: '10Y', rate: 4.57 },
      { tenor: '15Y', rate: 4.94 },
      { tenor: '20Y', rate: 5.19 }
    ],
    oilImpact: "As a net importer of oil, New Zealand faces inflationary pressures from rising global energy prices, which could complicate the RBNZ's current tactical pause on rate cuts.",
    summary: "Following the Feb 18 hold at 2.25%, the RBNZ has entered a tactical pause to assess the transmission of last year's aggressive cuts into the broader economy.",
    historical: [
      { month: 'Apr 25', cashRate: 5.50, benchmark: 5.40, rfRate: 4.80, cpi: 4.0, fxRate: 2.8500 },
      { month: 'May 25', cashRate: 5.50, benchmark: 5.20, rfRate: 4.70, cpi: 3.8, fxRate: 2.8000 },
      { month: 'Jun 25', cashRate: 5.00, benchmark: 4.80, rfRate: 4.60, cpi: 3.6, fxRate: 2.7500 },
      { month: 'Jul 25', cashRate: 4.50, benchmark: 4.40, rfRate: 4.50, cpi: 3.4, fxRate: 2.6500 },
      { month: 'Aug 25', cashRate: 4.00, benchmark: 4.00, rfRate: 4.40, cpi: 3.3, fxRate: 2.5500 },
      { month: 'Sep 25', cashRate: 3.50, benchmark: 3.60, rfRate: 4.30, cpi: 3.2, fxRate: 2.5000 },
      { month: 'Oct 25', cashRate: 3.50, benchmark: 3.50, rfRate: 4.20, cpi: 3.10, fxRate: 2.4500 },
      { month: 'Nov 25', cashRate: 2.25, benchmark: 3.00, rfRate: 4.30, cpi: 3.10, fxRate: 2.4000 },
      { month: 'Dec 25', cashRate: 2.25, benchmark: 2.80, rfRate: 4.10, cpi: 3.10, fxRate: 2.3800 },
      { month: 'Jan 26', cashRate: 2.25, benchmark: 2.70, rfRate: 4.30, cpi: 3.10, fxRate: 2.3500 },
      { month: 'Feb 26', cashRate: 2.25, benchmark: 2.60, rfRate: 4.40, cpi: 3.10, fxRate: 2.3300 },
      { month: 'Mar 26', cashRate: 2.25, benchmark: 2.63, rfRate: 4.57, cpi: 3.10, fxRate: 2.3275 }
    ]
  },
  HK: {
    id: 'HK', name: 'Hong Kong', currency: 'HKD', flag: '🇭🇰',
    sources: ['Hong Kong Monetary Authority (HKMA)', 'Census and Statistics Department (C&SD)', 'Hang Seng Bank'],
    centralBank: 'Hong Kong Monetary Authority',
    cashRate: 3.75,
    cashRateName: 'Base Rate',
    cashRateLastUpdate: '1 Feb 2026',
    cashRateNextUpdate: 'N/A',
    benchmark: 2.73,
    benchmarkName: 'HIBOR',
    benchmarkLastUpdate: '16 Mar 2026',
    benchmarkSource: 'Hang Seng Bank',
    rfRate: 3.50,
    rfName: '10Y EFN',
    rfShortName: '10Y EFN',
    rfLastUpdate: '27 Feb 2026',
    rfSource: 'Hong Kong Monetary Authority (HKMA)',
    cpi: 1.80,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 0.5015,
    benchmarks: [
      { tenor: '1M', rate: 2.60 },
      { tenor: '3M', rate: 2.68 },
      { tenor: '6M', rate: 2.73 }
    ],
    oilImpact: "As a major trade and financial hub, Hong Kong is indirectly affected by global energy price fluctuations through trade and inflation. Higher costs for imported goods could pressure the local cost of living.",
    summary: "HIBOR rates are showing stability, with the 6M fixing at 2.73%. The HKMA maintains its currency peg, ensuring stability in the face of global rate volatility.",
    historical: [
      { month: 'Apr 25', cashRate: 5.25, benchmark: 4.50, rfRate: 4.20, cpi: 2.4, fxRate: 0.6000 },
      { month: 'May 25', cashRate: 5.25, benchmark: 4.40, rfRate: 4.15, cpi: 2.3, fxRate: 0.5900 },
      { month: 'Jun 25', cashRate: 5.00, benchmark: 4.20, rfRate: 4.10, cpi: 2.2, fxRate: 0.5800 },
      { month: 'Jul 25', cashRate: 5.00, benchmark: 4.00, rfRate: 4.05, cpi: 2.1, fxRate: 0.5700 },
      { month: 'Aug 25', cashRate: 4.75, benchmark: 3.80, rfRate: 4.00, cpi: 2.0, fxRate: 0.5600 },
      { month: 'Sep 25', cashRate: 4.50, benchmark: 3.60, rfRate: 3.95, cpi: 1.9, fxRate: 0.5500 },
      { month: 'Oct 25', cashRate: 4.25, benchmark: 3.40, rfRate: 3.90, cpi: 1.8, fxRate: 0.5400 },
      { month: 'Nov 25', cashRate: 4.00, benchmark: 3.20, rfRate: 3.85, cpi: 1.7, fxRate: 0.5300 },
      { month: 'Dec 25', cashRate: 4.00, benchmark: 3.00, rfRate: 3.80, cpi: 1.6, fxRate: 0.5200 },
      { month: 'Jan 26', cashRate: 3.75, benchmark: 2.90, rfRate: 3.70, cpi: 1.5, fxRate: 0.5100 },
      { month: 'Feb 26', cashRate: 3.75, benchmark: 2.80, rfRate: 3.60, cpi: 1.6, fxRate: 0.5050 },
      { month: 'Mar 26', cashRate: 3.75, benchmark: 2.73, rfRate: 3.50, cpi: 1.80, fxRate: 0.5015 }
    ]
  },
  SG: {
    id: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬',
    sources: ['Monetary Authority of Singapore (MAS)', 'Department of Statistics Singapore (DOS)'],
    centralBank: 'Monetary Authority of Singapore',
    cashRate: null,
    cashRateName: 'Exchange Rate Policy',
    cashRateLastUpdate: 'N/A',
    cashRateNextUpdate: 'N/A',
    benchmark: 1.16,
    benchmarkName: 'SORA',
    benchmarkLastUpdate: '12 Mar 2026',
    benchmarkSource: 'Monetary Authority of Singapore (MAS)',
    rfRate: 2.12,
    rfName: '10Y Gov Bond',
    rfShortName: '10Y Bond',
    rfLastUpdate: '12 Mar 2026',
    rfSource: 'Monetary Authority of Singapore (MAS)',
    cpi: 1.20,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 3.0847,
    benchmarks: [
      { tenor: '1M', rate: 1.03 },
      { tenor: '3M', rate: 1.11 },
      { tenor: '6M', rate: 1.16 }
    ],
    rfRates: [
      { tenor: '1Y', rate: 1.39 },
      { tenor: '5Y', rate: 1.70 },
      { tenor: '10Y', rate: 2.12 },
      { tenor: '15Y', rate: 2.20 },
      { tenor: '20Y', rate: 2.22 }
    ],
    oilImpact: "Singapore is a major oil refining hub. While it is a net importer of crude, volatility can temporarily boost refining margins. However, sustained high energy prices pose a risk to its trade-dependent economy.",
    summary: "MAS continues to manage policy via the NEER band. The 6M SORA benchmark has trended lower to 1.16% as global rate pressure eases. CPI remains stable near 1.2%.",
    historical: [
      { month: 'Apr 25', cashRate: null, benchmark: 3.50, rfRate: 3.30, cpi: 2.8, fxRate: 3.5000 },
      { month: 'May 25', cashRate: null, benchmark: 3.40, rfRate: 3.20, cpi: 2.6, fxRate: 3.4800 },
      { month: 'Jun 25', cashRate: null, benchmark: 3.20, rfRate: 3.10, cpi: 2.4, fxRate: 3.4500 },
      { month: 'Jul 25', cashRate: null, benchmark: 3.00, rfRate: 3.05, cpi: 2.2, fxRate: 3.4200 },
      { month: 'Aug 25', cashRate: null, benchmark: 2.80, rfRate: 3.00, cpi: 2.0, fxRate: 3.3800 },
      { month: 'Sep 25', cashRate: null, benchmark: 2.60, rfRate: 2.95, cpi: 1.9, fxRate: 3.3500 },
      { month: 'Oct 25', cashRate: null, benchmark: 2.45, rfRate: 2.90, cpi: 1.8, fxRate: 3.3260 },
      { month: 'Nov 25', cashRate: null, benchmark: 2.35, rfRate: 2.85, cpi: 1.6, fxRate: 3.3273 },
      { month: 'Dec 25', cashRate: null, benchmark: 2.25, rfRate: 2.80, cpi: 1.5, fxRate: 3.3219 },
      { month: 'Jan 26', cashRate: null, benchmark: 2.18, rfRate: 2.75, cpi: 1.3, fxRate: 3.2412 },
      { month: 'Feb 26', cashRate: null, benchmark: 2.15, rfRate: 2.70, cpi: 1.2, fxRate: 3.1830 },
      { month: 'Mar 26', cashRate: null, benchmark: 1.16, rfRate: 2.12, cpi: 1.20, fxRate: 3.0847 }
    ]
  },
  VN: {
    id: 'VN', name: 'Vietnam', currency: 'VND', flag: '🇻🇳',
    sources: ['State Bank of Vietnam (SBV)', 'General Statistics Office (GSO)', 'Hanoi Stock Exchange (HNX)'],
    centralBank: 'State Bank of Vietnam',
    cashRate: 4.50,
    cashRateName: 'SBV Rate',
    cashRateLastUpdate: '9 Jan 2026',
    cashRateNextUpdate: 'N/A',
    benchmark: 7.75,
    benchmarkName: 'VNIBOR',
    benchmarkLastUpdate: '12 Mar 2026',
    benchmarkSource: 'State Bank of Vietnam (SBV)',
    rfRate: 4.19,
    rfName: '10Y Gov Bond',
    rfShortName: '10Y Bond',
    rfLastUpdate: '12 Mar 2026',
    rfSource: 'Hanoi Stock Exchange (HNX)',
    cpi: 3.48,
    cpiLastUpdate: '31 Dec 2025',
    fxVsMYR: 0.1496,
    benchmarks: [
      { tenor: '1M', rate: 6.90 },
      { tenor: '3M', rate: 7.65 },
      { tenor: '6M', rate: 7.75 }
    ],
    rfRates: [
      { tenor: '1Y', rate: 3.10 },
      { tenor: '3Y', rate: 3.27 },
      { tenor: '5Y', rate: 3.85 },
      { tenor: '7Y', rate: 3.87 },
      { tenor: '10Y', rate: 4.19 },
      { tenor: '15Y', rate: 4.26 },
      { tenor: '20Y', rate: 4.35 }
    ],
    oilImpact: "Vietnam is a net importer of petroleum products. An oil price shock would negatively impact its trade balance, increase manufacturing input costs, and drive up imported inflation, complicating SBV's policy.",
    summary: "Vietnam shows one of the highest 6M benchmarks in the region, indicating high domestic demand for credit. SBV rates are holding at 4.5% to manage inflation at 3.48%.",
    historical: [
      { month: 'Apr 25', cashRate: 4.50, benchmark: 6.50, rfRate: 3.80, cpi: 3.0, fxRate: 0.1850 },
      { month: 'May 25', cashRate: 4.50, benchmark: 6.70, rfRate: 3.85, cpi: 3.1, fxRate: 0.1860 },
      { month: 'Jun 25', cashRate: 4.50, benchmark: 6.90, rfRate: 3.90, cpi: 3.2, fxRate: 0.1870 },
      { month: 'Jul 25', cashRate: 4.50, benchmark: 7.10, rfRate: 3.95, cpi: 3.3, fxRate: 0.1875 },
      { month: 'Aug 25', cashRate: 4.50, benchmark: 7.30, rfRate: 4.00, cpi: 3.4, fxRate: 0.1880 },
      { month: 'Sep 25', cashRate: 4.50, benchmark: 7.50, rfRate: 4.05, cpi: 3.4, fxRate: 0.1885 },
      { month: 'Oct 25', cashRate: 4.50, benchmark: 7.60, rfRate: 4.10, cpi: 3.5, fxRate: 0.1887 },
      { month: 'Nov 25', cashRate: 4.50, benchmark: 7.65, rfRate: 4.15, cpi: 3.5, fxRate: 0.1890 },
      { month: 'Dec 25', cashRate: 4.50, benchmark: 7.70, rfRate: 4.12, cpi: 3.6, fxRate: 0.1888 },
      { month: 'Jan 26', cashRate: 4.50, benchmark: 7.80, rfRate: 4.15, cpi: 3.5, fxRate: 0.1907 },
      { month: 'Feb 26', cashRate: 4.50, benchmark: 7.90, rfRate: 4.18, cpi: 3.5, fxRate: 0.1907 },
      { month: 'Mar 26', cashRate: 4.50, benchmark: 7.75, rfRate: 4.19, cpi: 3.48, fxRate: 0.1496 }
    ]
  }
}
