import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GCAP Treasury Market Insights',
  description: 'Global Treasury Market Insights — GCAP Internal Live Market Data',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
