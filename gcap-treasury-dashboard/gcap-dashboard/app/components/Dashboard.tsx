'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { STATIC_MARKET_DATA, CountryData } from '../lib/marketData'

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────
const Icon = {
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  TrendingUp: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Activity: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  DollarSign: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  BarChart: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  RefreshCw: ({ spinning }: { spinning?: boolean }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={spinning ? { animation: 'spin 1s linear infinite' } : {}}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Info: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Zap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ArrowUp: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  ArrowDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Check: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  AlertCircle: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface LiveData {
  fx: { rates: Record<string, number>; prevRates: Record<string, number> | null; lastUpdate: string } | null
  klibor: { benchmark: number; benchmarks: any[]; lastUpdate: string } | null
  bpam: { rfRate10Y: number; rfRates: any[]; corporateBonds: any[]; lastUpdate: string } | null
  bbsw: { benchmark: number; benchmarks: any[]; lastUpdate: string } | null
  rba: { rate: number; date: string } | null
  hibor: { benchmark: number; benchmarks: any[]; lastUpdate: string } | null
}

type FeedStatus = 'loading' | 'live' | 'error'

interface FeedStatuses {
  fx: FeedStatus
  klibor: FeedStatus
  bpam: FeedStatus
  bbsw: FeedStatus
  rba: FeedStatus
  hibor: FeedStatus
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined, digits = 2) =>
  n !== null && n !== undefined && !isNaN(n) ? n.toFixed(digits) : '--'

const fmtPct = (n: number | null | undefined) =>
  n !== null && n !== undefined && !isNaN(n) ? `${n.toFixed(2)}%` : '--'

function getCountryFx(currency: string, rates: Record<string, number> | null, isVND?: boolean) {
  if (!rates || !rates[currency]) return null
  const multiplier = isVND ? 1000 : 1
  return multiplier / rates[currency]
}

function getDailyChange(currency: string, rates: Record<string, number> | null, prevRates: Record<string, number> | null, isVND?: boolean) {
  const cur = getCountryFx(currency, rates, isVND)
  const prev = getCountryFx(currency, prevRates, isVND)
  if (cur === null || prev === null || prev === 0) return null
  return ((cur - prev) / prev) * 100
}

// ─── Status Pill ─────────────────────────────────────────────────────────────
function StatusPill({ status, label }: { status: FeedStatus; label: string }) {
  const map = {
    loading: { color: '#f97316', dot: '#f97316', text: 'Fetching...' },
    live: { color: '#4ade80', dot: '#4ade80', text: 'Live' },
    error: { color: '#fb7185', dot: '#fb7185', text: 'Fallback' },
  }
  const s = map[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: s.color, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block', animation: status === 'loading' ? 'pulse-soft 1.5s infinite' : status === 'live' ? 'pulse-soft 3s infinite' : 'none' }} />
      {label}: {s.text}
    </span>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, val, unit = '%', sub, color, lastUpdate, nextUpdate, loading }: {
  label: string; val: number | null; unit?: string; sub: string;
  color: 'blue' | 'orange' | 'green' | 'rose' | 'purple' | 'cyan'
  lastUpdate?: string; nextUpdate?: string; loading?: boolean
}) {
  const colorMap = {
    blue: '#60a5fa', orange: '#f97316', green: '#4ade80',
    rose: '#fb7185', purple: '#c084fc', cyan: '#22d3ee',
  }
  const c = colorMap[color]
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 110 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>{label}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '0.05em' }}>{sub}</span>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 32, width: '60%', marginTop: 4 }} />
        ) : (
          <div style={{ fontSize: 28, fontWeight: 800, color: c, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '-0.02em' }}>
            {val !== null && val !== undefined ? `${fmt(val)}${unit}` : '--'}
          </div>
        )}
      </div>
      {(lastUpdate || nextUpdate) && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
          {lastUpdate && <span style={{ fontSize: 9, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last: {lastUpdate}</span>}
          {nextUpdate && <span style={{ fontSize: 9, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next: {nextUpdate}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Rate Table ──────────────────────────────────────────────────────────────
function RateTable({ title, icon, rows, colKey, colorClass, lastUpdate, source }: {
  title: string; icon: React.ReactNode; rows: any[]; colKey: string;
  colorClass: string; lastUpdate?: string; source?: string
}) {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: colorClass === 'orange' ? '#f97316' : colorClass === 'green' ? '#4ade80' : '#22d3ee' }}>{icon}</span>
          {title}
        </h3>
        {lastUpdate && (
          <span style={{ fontSize: 9, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#111', border: '1px solid #1e1e1e', padding: '3px 8px', borderRadius: 2 }}>
            {lastUpdate}
          </span>
        )}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
            <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tenor</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.tenor} style={{ borderBottom: i < rows.length - 1 ? '1px solid #111' : 'none' }}>
              <td style={{ padding: '7px 10px', color: '#aaa', fontWeight: 600 }}>{r.tenor}</td>
              <td style={{ padding: '7px 10px', color: colorClass === 'orange' ? '#f97316' : colorClass === 'green' ? '#4ade80' : '#22d3ee', fontWeight: 700 }}>
                {fmt(r[colKey])}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {source && <div style={{ marginTop: 8, fontSize: 10, color: '#444', textAlign: 'right', fontStyle: 'italic' }}>Source: {source}</div>}
    </div>
  )
}

// ─── Corporate Bond Table ─────────────────────────────────────────────────────
function CorporateBondTable({ bonds, lastUpdate, source }: { bonds: any[]; lastUpdate?: string; source?: string }) {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#22d3ee' }}><Icon.BarChart /></span>
          MY Corporate Bond Spot Rates
        </h3>
        {lastUpdate && (
          <span style={{ fontSize: 9, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#111', border: '1px solid #1e1e1e', padding: '3px 8px', borderRadius: 2 }}>
            {lastUpdate}
          </span>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Tenor', 'AAA', 'AA1', 'AA2', 'AA3'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, color: h === 'Tenor' ? '#555' : '#22d3ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bonds.map((b, i) => (
              <tr key={b.tenor} style={{ borderBottom: i < bonds.length - 1 ? '1px solid #111' : 'none' }}>
                <td style={{ padding: '7px 10px', color: '#aaa', fontWeight: 600 }}>{b.tenor}</td>
                {(['aaa', 'aa1', 'aa2', 'aa3'] as const).map(k => (
                  <td key={k} style={{ padding: '7px 10px', color: '#22d3ee', fontWeight: 700 }}>{fmt(b[k])}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {source && <div style={{ marginTop: 8, fontSize: 10, color: '#444', textAlign: 'right', fontStyle: 'italic' }}>Source: {source}</div>}
    </div>
  )
}

// ─── Yield Curve Chart + Table ────────────────────────────────────────────────
function YieldCurvePanel({ rfRates, rfName, rfLastUpdate, rfSource, color }: {
  rfRates: any[]; rfName: string; rfLastUpdate?: string; rfSource?: string; color: string
}) {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#4ade80' }}><Icon.TrendingUp /></span>
          {rfName} Yield Curve
        </h3>
        {rfLastUpdate && (
          <span style={{ fontSize: 9, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#111', border: '1px solid #1e1e1e', padding: '3px 8px', borderRadius: 2 }}>
            {rfLastUpdate}
          </span>
        )}
      </div>
      <div style={{ height: 160, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rfRates} margin={{ top: 4, right: 4, left: -22, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
            <XAxis dataKey="tenor" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#555', fontWeight: 700 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#555', fontWeight: 700 }} domain={['dataMin - 0.2', 'dataMax + 0.2']} tickFormatter={v => v.toFixed(2)} />
            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: 3, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Yield']} />
            <Line type="monotone" dataKey="rate" stroke="#4ade80" strokeWidth={2} dot={{ r: 3, fill: '#4ade80', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
            <th style={{ textAlign: 'left', padding: '5px 10px', fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tenor</th>
            <th style={{ textAlign: 'left', padding: '5px 10px', fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Yield</th>
          </tr>
        </thead>
        <tbody>
          {rfRates.map((r, i) => (
            <tr key={r.tenor} style={{ borderBottom: i < rfRates.length - 1 ? '1px solid #111' : 'none' }}>
              <td style={{ padding: '6px 10px', color: '#aaa', fontWeight: 600 }}>{r.tenor}</td>
              <td style={{ padding: '6px 10px', color: '#4ade80', fontWeight: 700 }}>{fmt(r.rate)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rfSource && <div style={{ marginTop: 8, fontSize: 10, color: '#444', textAlign: 'right', fontStyle: 'italic' }}>Source: {rfSource}</div>}
    </div>
  )
}

// ─── Historical Chart ─────────────────────────────────────────────────────────
function HistoricalChart({ country, showFX }: { country: CountryData; showFX: boolean }) {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '16px 20px' }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <span style={{ color: '#f97316' }}><Icon.TrendingUp /></span>
        12-Month Historical Trends
      </h3>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={country.historical} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#555' }} dy={8} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#555' }} />
            {showFX && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#22d3ee' }} domain={['auto', 'auto']} />}
            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: 3, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }} />
            <Legend verticalAlign="top" align="right" height={30} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, color: '#666' }} />
            {country.cashRate !== null && <Line yAxisId="left" type="stepAfter" name="Policy" dataKey="cashRate" stroke="#c084fc" strokeWidth={2} dot={false} />}
            <Line yAxisId="left" type="monotone" name="6M Bench" dataKey="benchmark" stroke="#f97316" strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" name={country.rfShortName} dataKey="rfRate" stroke="#4ade80" strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" name="CPI" dataKey="cpi" stroke="#fb7185" strokeWidth={2} dot={false} />
            {showFX && <Line yAxisId="right" type="monotone" name="FX/MYR" dataKey="fxRate" stroke="#22d3ee" strokeWidth={2} strokeDasharray="4 4" dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Global Dashboard ─────────────────────────────────────────────────────────
function GlobalDashboard({ marketData, live, fxLastUpdate, onSelectCountry }: {
  marketData: Record<string, CountryData>
  live: LiveData
  fxLastUpdate: string | null
  onSelectCountry: (id: string) => void
}) {
  const rows = useMemo(() => Object.values(marketData).map(c => {
    const isVND = c.currency === 'VND'
    const fxRates = live.fx?.rates || null
    const prevRates = live.fx?.prevRates || null
    const currentFx = getCountryFx(c.currency, fxRates, isVND) ?? c.fxVsMYR
    const dailyChange = getDailyChange(c.currency, fxRates, prevRates, isVND)
    const realRate = c.cashRate !== null ? c.cashRate - c.cpi : null
    return { ...c, currentFx, dailyChange, realRate }
  }), [marketData, live.fx])

  const cols = [
    { key: 'flag+id', label: 'Market', render: (r: any) => (
      <td key="flag+id" style={{ padding: '9px 12px', fontWeight: 700, color: '#e0e0e0', whiteSpace: 'nowrap' }}>
        <span style={{ marginRight: 6 }}>{r.flag}</span>{r.id}
      </td>
    )},
    { key: 'cashRate', label: 'Policy Rate', color: '#60a5fa' },
    { key: 'benchmark', label: '6M Bench', color: '#f97316' },
    { key: 'rfRate', label: '10Y Yield', color: '#4ade80' },
    { key: 'cpi', label: 'CPI', color: '#fb7185' },
    { key: 'realRate', label: 'Real Rate', color: '#c084fc' },
    { key: 'currentFx', label: 'Spot vs MYR', color: '#22d3ee', decimals: 4 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Macro Pulse */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '16px 20px', display: 'flex', gap: 14 }}>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 3, padding: 10, color: '#f97316', flexShrink: 0, alignSelf: 'flex-start' }}>
          <Icon.Globe />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', marginBottom: 8 }}>Global Macro Pulse</div>
          <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.65, fontWeight: 400, marginBottom: 8 }}>
            Global central banks are exhibiting diverging policy paths. The US Federal Reserve maintains a restrictive stance to combat sticky inflation, keeping the USD elevated. APAC economies like Malaysia and Vietnam are holding rates steady to balance growth and FX stability. Australia and New Zealand remain relatively hawkish due to persistent domestic inflation. Energy prices driven by geopolitical tensions continue to pose upside inflation risks for net importers, while benefiting exporters like Malaysia.
          </p>
          {fxLastUpdate && <p style={{ fontSize: 10, color: '#555', fontStyle: 'italic' }}>FX data as of: {fxLastUpdate}</p>}
        </div>
      </div>

      {/* Cross-Market Table */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#22d3ee' }}><Icon.BarChart /></span>
            Cross-Market Rates Comparison
          </h3>
          {fxLastUpdate && (
            <span style={{ fontSize: 9, color: '#555', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>FX: {fxLastUpdate}</span>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Market', 'Policy Rate', '6M Bench', '10Y Yield', 'CPI YoY', 'Real Rate', 'Spot vs MYR', 'Daily Chg'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Market' ? 'left' : 'right', padding: '6px 12px', fontSize: 9, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} onClick={() => onSelectCountry(row.id)}
                  style={{ borderBottom: idx < rows.length - 1 ? '1px solid #111' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#111')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: '#e0e0e0', whiteSpace: 'nowrap', fontSize: 13 }}>
                    <span style={{ marginRight: 6 }}>{row.flag}</span>{row.id}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: '#60a5fa', fontWeight: 600, fontSize: 12 }}>
                    {row.cashRate !== null ? `${fmt(row.cashRate)}%` : <span style={{ color: '#444' }}>N/A</span>}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: '#f97316', fontWeight: 600, fontSize: 12 }}>{fmt(row.benchmark)}%</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: '#4ade80', fontWeight: 600, fontSize: 12 }}>{fmt(row.rfRate)}%</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: '#fb7185', fontWeight: 600, fontSize: 12 }}>{fmt(row.cpi)}%</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12, color: row.realRate !== null ? (row.realRate >= 0 ? '#c084fc' : '#fb7185') : '#444' }}>
                    {row.realRate !== null ? `${fmt(row.realRate)}%` : '--'}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', color: row.id === 'MY' ? '#444' : '#22d3ee', fontWeight: 600, fontSize: 12 }}>
                    {row.id === 'MY' ? '—' : row.currentFx.toFixed(4)}
                    {row.id === 'VN' && <span style={{ fontSize: 9, color: '#555', marginLeft: 2 }}>*</span>}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, fontSize: 11 }}>
                    {row.id === 'MY' || row.dailyChange === null ? (
                      <span style={{ color: '#444' }}>—</span>
                    ) : (
                      <span style={{ color: row.dailyChange > 0 ? '#4ade80' : row.dailyChange < 0 ? '#fb7185' : '#666' }}>
                        {row.dailyChange > 0 ? '+' : ''}{row.dailyChange.toFixed(2)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: '#444', textAlign: 'right', fontStyle: 'italic' }}>
          * VND spot expressed as MYR per 1,000 VND. Click any row for detail view.
        </div>
      </div>
    </div>
  )
}

// ─── Country Detail ───────────────────────────────────────────────────────────
function CountryDetail({ country, live }: { country: CountryData; live: LiveData }) {
  const [tab, setTab] = useState<'overview' | 'insights'>('overview')

  const fxRates = live.fx?.rates || null
  const prevRates = live.fx?.prevRates || null
  const isVND = country.currency === 'VND'
  const currentFx = getCountryFx(country.currency, fxRates, isVND) ?? country.fxVsMYR
  const dailyChange = getDailyChange(country.currency, fxRates, prevRates, isVND)
  const fxLastUpdate = live.fx?.lastUpdate || null

  // Build effective data (live overrides static)
  const effectiveBenchmark = country.id === 'MY' && live.klibor?.benchmark
    ? live.klibor.benchmark : country.id === 'AU' && live.bbsw?.benchmark
    ? live.bbsw.benchmark : country.id === 'HK' && live.hibor?.benchmark
    ? live.hibor.benchmark : country.benchmark

  const effectiveBenchmarks = country.id === 'MY' && live.klibor?.benchmarks
    ? live.klibor.benchmarks : country.id === 'AU' && live.bbsw?.benchmarks
    ? live.bbsw.benchmarks : country.id === 'HK' && live.hibor?.benchmarks
    ? live.hibor.benchmarks : country.benchmarks

  const effectiveRfRates = country.id === 'MY' && live.bpam?.rfRates?.length
    ? live.bpam.rfRates : country.rfRates

  const effectiveCorporateBonds = country.id === 'MY' && live.bpam?.corporateBonds?.length
    ? live.bpam.corporateBonds : country.corporateBonds

  const effectiveCashRate = country.id === 'AU' && live.rba?.rate != null
    ? live.rba.rate : country.cashRate

  const benchmarkLastUpdate = country.id === 'MY' ? (live.klibor?.lastUpdate || country.benchmarkLastUpdate)
    : country.id === 'AU' ? (live.bbsw?.lastUpdate || country.benchmarkLastUpdate)
    : country.id === 'HK' ? (live.hibor?.lastUpdate || country.benchmarkLastUpdate)
    : country.benchmarkLastUpdate

  const rfLastUpdate = country.id === 'MY' ? (live.bpam?.lastUpdate || country.rfLastUpdate) : country.rfLastUpdate
  const cashRateLastUpdate = country.id === 'AU' ? (live.rba?.date || country.cashRateLastUpdate) : country.cashRateLastUpdate

  // Insights
  const insights = useMemo(() => {
    const list: { title: string; desc: string; color: string }[] = []
    if (country.id === 'SG') {
      list.push({ title: 'Exchange Rate Policy Framework', desc: 'As a small open economy, Singapore relies on the Singapore Dollar Nominal Effective Exchange Rate (S$NEER) as its primary monetary policy tool rather than a policy interest rate. The MAS manages the SGD within a policy band, meaning domestic rates like SORA are largely driven by global rates and SGD expectations.', color: '#60a5fa' })
    }
    if (effectiveCashRate !== null) {
      const realRate = effectiveCashRate - country.cpi
      list.push({ title: 'Monetary Policy Stance', desc: `Real interest rate stands at ${realRate.toFixed(2)}% (${effectiveCashRate.toFixed(2)}% policy rate minus ${country.cpi.toFixed(2)}% CPI). This indicates a ${realRate > 1.5 ? 'restrictive' : realRate > 0 ? 'modestly restrictive' : 'accommodative'} stance by the ${country.centralBank}.`, color: '#c084fc' })
    }
    if (country.historical.length > 0) {
      const startCPI = country.historical[0].cpi
      const cpiChange = country.cpi - startCPI
      list.push({ title: 'CPI Inflation Trend (12M)', desc: `Over the observed period, CPI has ${cpiChange > 0 ? 'risen' : 'fallen'} by ${Math.abs(cpiChange).toFixed(2)}pp, currently at ${country.cpi.toFixed(2)}% YoY. ${cpiChange < 0 ? 'The disinflationary trend provides room for policy easing.' : 'Elevated inflation may limit central bank flexibility.'}`, color: '#fb7185' })
    }
    list.push({ title: '6-Month Cost of Funds', desc: `The 6M ${country.benchmarkName} at ${effectiveBenchmark.toFixed(2)}% is the primary floating rate reference for corporate debt pricing. Current levels indicate ${effectiveBenchmark > 4.5 ? 'elevated' : effectiveBenchmark > 3 ? 'moderate' : 'benign'} short-term financing costs for local operations.`, color: '#f97316' })
    if (country.id !== 'MY' && country.historical.length > 0) {
      const startFX = country.historical[0].fxRate
      const fxChange = ((currentFx - startFX) / startFX) * 100
      list.push({ title: 'Currency Performance vs MYR', desc: `The ${country.currency} has ${fxChange > 0 ? 'appreciated' : 'depreciated'} by ${Math.abs(fxChange).toFixed(2)}% against the MYR over the observed 12-month period (${startFX.toFixed(4)} → ${currentFx.toFixed(4)}).`, color: '#22d3ee' })
    }
    if (country.oilImpact) {
      list.push({ title: 'Geopolitical Energy Impact', desc: country.oilImpact, color: '#fb7185' })
    }
    return list
  }, [country, effectiveBenchmark, effectiveCashRate, currentFx])

  return (
    <div>
      {/* Country Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>{country.name}</h2>
          <p style={{ fontSize: 12, color: '#666', marginTop: 4, fontWeight: 500 }}>{country.centralBank}</p>
        </div>
        {country.id !== 'MY' && (
          <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '10px 16px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: 3 }}>Spot vs MYR</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#22d3ee', fontFamily: 'IBM Plex Mono, monospace' }}>{currentFx.toFixed(4)}</span>
                {dailyChange !== null && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: dailyChange > 0 ? '#4ade80' : dailyChange < 0 ? '#fb7185' : '#666' }}>
                    {dailyChange > 0 ? '+' : ''}{dailyChange.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            {fxLastUpdate && (
              <div style={{ fontSize: 9, color: '#444', fontFamily: 'IBM Plex Mono, monospace' }}>
                FX: {fxLastUpdate}<br />
                <span style={{ color: '#333' }}>% = daily change</span>
                {isVND && <><br /><span style={{ color: '#333' }}>*per 1,000 VND</span></>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 3, padding: 3, marginBottom: 20, gap: 2 }}>
        {(['overview', 'insights'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.05em',
            background: tab === t ? '#1a1a1a' : 'transparent',
            color: tab === t ? '#f97316' : '#555',
            border: 'none', borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Market Pulse */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '14px 18px', display: 'flex', gap: 12 }}>
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 3, padding: 8, color: '#f97316', flexShrink: 0 }}>
              <Icon.Zap />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', marginBottom: 6 }}>Market Pulse</div>
              <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6 }}>{country.summary}</p>
              <p style={{ fontSize: 10, color: '#444', marginTop: 6, fontStyle: 'italic' }}>* This is a pre-compiled market summary. Verify independently before use.</p>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MetricCard label="Policy Rate" val={effectiveCashRate} sub={country.cashRateName} color="blue" lastUpdate={cashRateLastUpdate} nextUpdate={country.cashRateNextUpdate} />
            <MetricCard label="6M Benchmark" val={effectiveBenchmark} sub={country.benchmarkName} color="orange" lastUpdate={benchmarkLastUpdate} />
            <MetricCard label={country.rfShortName} val={country.rfRate} sub="Gov Yield" color="green" lastUpdate={rfLastUpdate} />
            <MetricCard label="CPI Inflation" val={country.cpi} sub="YoY" color="rose" lastUpdate={country.cpiLastUpdate} />
          </div>

          {/* Historical Chart */}
          <HistoricalChart country={country} showFX={country.id !== 'MY'} />

          {/* Benchmark + Yield Curve side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {effectiveBenchmarks && effectiveBenchmarks.length > 0 && (
              <RateTable
                title={`${country.benchmarkName} Rates`}
                icon={<Icon.BarChart />}
                rows={effectiveBenchmarks}
                colKey="rate"
                colorClass="orange"
                lastUpdate={benchmarkLastUpdate}
                source={country.benchmarkSource}
              />
            )}
            <YieldCurvePanel
              rfRates={effectiveRfRates}
              rfName={country.rfShortName}
              rfLastUpdate={rfLastUpdate}
              rfSource={country.rfSource}
              color="#4ade80"
            />
          </div>

          {/* MY Corporate Bonds */}
          {country.id === 'MY' && effectiveCorporateBonds && effectiveCorporateBonds.length > 0 && (
            <CorporateBondTable
              bonds={effectiveCorporateBonds}
              lastUpdate={live.bpam?.lastUpdate || country.corporateBondsLastUpdate}
              source={country.corporateBondsSource}
            />
          )}

          {/* UK Forward Rates */}
          {country.id === 'UK' && country.forwardRates && (
            <RateTable
              title="10Y Gilt Forward Rates"
              icon={<Icon.TrendingUp />}
              rows={country.forwardRates}
              colKey="rate"
              colorClass="cyan"
              source="Bank of England"
            />
          )}

          {/* Data Sources */}
          <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid #111' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon.Info /> Data Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {country.sources.map((s, i) => (
                <span key={i} style={{ fontSize: 11, color: '#444' }}>• {s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.map((item, i) => (
            <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 3, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: item.color, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: item.color, marginBottom: 6 }}>{item.title}</div>
                <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [marketData, setMarketData] = useState<Record<string, CountryData>>(STATIC_MARKET_DATA)
  const [live, setLive] = useState<LiveData>({ fx: null, klibor: null, bpam: null, bbsw: null, rba: null, hibor: null })
  const [statuses, setStatuses] = useState<FeedStatuses>({ fx: 'loading', klibor: 'loading', bpam: 'loading', bbsw: 'loading', rba: 'loading', hibor: 'loading' })
  const [view, setView] = useState<'global' | 'country'>('global')
  const [selectedCountry, setSelectedCountry] = useState('MY')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const setStatus = (feed: keyof FeedStatuses, status: FeedStatus) =>
    setStatuses(prev => ({ ...prev, [feed]: status }))

  const fetchAll = useCallback(async () => {
    setIsRefreshing(true)

    const fetchFeed = async (url: string, key: keyof FeedStatuses) => {
      try {
        const res = await fetch(`${url}?t=${Date.now()}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setStatus(key, 'live')
        return data
      } catch (e: any) {
        console.warn(`[${key}] fetch failed:`, e.message)
        setStatus(key, 'error')
        return null
      }
    }

    const [fx, klibor, bpam, bbsw, rba, hibor] = await Promise.all([
      fetchFeed('/api/rates/fx', 'fx'),
      fetchFeed('/api/rates/klibor', 'klibor'),
      fetchFeed('/api/rates/bpam', 'bpam'),
      fetchFeed('/api/rates/bbsw', 'bbsw'),
      fetchFeed('/api/rates/rba', 'rba'),
      fetchFeed('/api/rates/hibor', 'hibor'),
    ])

    setLive({ fx, klibor, bpam, bbsw, rba, hibor })
    setLastSync(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    setIsRefreshing(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const country = marketData[selectedCountry]
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e0e0e0', paddingBottom: 60 }}>
      {/* Header */}
      <header style={{ background: '#040404', borderBottom: '1px solid #1a1a1a', padding: '0 16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Left: Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => { setView('global'); setIsDropdownOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ background: '#f97316', padding: '6px 7px', borderRadius: 3, color: '#000', display: 'flex', alignItems: 'center' }}>
                <Icon.BarChart />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#e0e0e0', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                  Global Treasury Market Insights
                </div>
                <div style={{ fontSize: 9, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span>GCAP Internal</span>
                  <span style={{ width: 2, height: 2, borderRadius: '50%', background: '#333' }} />
                  <span>{today}</span>
                  {lastSync && (
                    <>
                      <span style={{ width: 2, height: 2, borderRadius: '50%', background: '#333' }} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span className="live-dot" />
                        Synced {lastSync}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </button>

            <button onClick={fetchAll} disabled={isRefreshing}
              style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 3, padding: '5px 6px', cursor: 'pointer', color: isRefreshing ? '#f97316' : '#555', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              title="Refresh all data"
            >
              <Icon.RefreshCw spinning={isRefreshing} />
            </button>
          </div>

          {/* Right: Feed Status + Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Status pills - only show on large screens */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(Object.entries(statuses) as [keyof FeedStatuses, FeedStatus][]).map(([key, status]) => (
                <StatusPill key={key} status={status} label={key.toUpperCase()} />
              ))}
            </div>

            {/* Country Dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', border: '1px solid #1e1e1e', borderRadius: 3, padding: '7px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#ccc', whiteSpace: 'nowrap' }}>
                {view === 'global' ? (
                  <><span style={{ color: '#f97316', display: 'flex' }}><Icon.Globe /></span> Global</>
                ) : (
                  <><span>{country.flag}</span> {country.id}</>
                )}
                <span style={{ color: '#555' }}><Icon.ChevronDown /></span>
              </button>

              {isDropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 200, background: '#080808', border: '1px solid #1e1e1e', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.8)', zIndex: 50, overflow: 'hidden' }}>
                  <button onClick={() => { setView('global'); setIsDropdownOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: view === 'global' ? '#f9731612' : 'transparent', color: view === 'global' ? '#f97316' : '#aaa', border: 'none', borderBottom: '1px solid #111' }}>
                    <span style={{ color: '#f97316', display: 'flex' }}><Icon.Globe /></span> Global Overview
                  </button>
                  {Object.values(marketData).map(c => (
                    <button key={c.id} onClick={() => { setSelectedCountry(c.id); setView('country'); setIsDropdownOpen(false) }}
                      style={{ width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: view === 'country' && selectedCountry === c.id ? '#f9731612' : 'transparent', color: view === 'country' && selectedCountry === c.id ? '#f97316' : '#888', border: 'none', borderBottom: '1px solid #0a0a0a' }}
                      onMouseEnter={e => { if (!(view === 'country' && selectedCountry === c.id)) (e.currentTarget as HTMLElement).style.background = '#111' }}
                      onMouseLeave={e => { if (!(view === 'country' && selectedCountry === c.id)) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <span>{c.flag}</span> {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }} className="animate-in">
        {view === 'global' ? (
          <GlobalDashboard
            marketData={marketData}
            live={live}
            fxLastUpdate={live.fx?.lastUpdate || null}
            onSelectCountry={(id: string) => { setSelectedCountry(id); setView('country') }}
          />
        ) : (
          <CountryDetail country={country} live={live} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 20px', borderTop: '1px solid #111', marginTop: 20, paddingTop: 16 }}>
        <p style={{ fontSize: 10, color: '#333', textAlign: 'center' }}>
          GCAP Internal Use Only · Data from BNM, BPAM, ASX, RBA, HKMA, open.er-api.com · Refresh cadence: 30 min (FX), 1 hr (rates) · Not for distribution
        </p>
      </footer>
    </div>
  )
}
