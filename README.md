# GCAP Global Treasury Market Insights

Internal treasury market dashboard for Gamuda Capital. Displays live rates for Malaysia, US, Australia, UK, New Zealand, Hong Kong, Singapore, and Vietnam.

## Live Data Feeds

| Feed | Source | Refresh |
|------|--------|---------|
| FX Rates (MYR) | open.er-api.com | 30 min |
| KLIBOR (MY) | Bank Negara Malaysia | 1 hr |
| MGS + Corp Bonds | BPAM Local Market | 1 hr |
| BBSW (AU) | ASX Markit API | 1 hr |
| RBA Cash Rate | Reserve Bank of Australia | 1 hr |
| HIBOR (HK) | Hong Kong Monetary Authority | 1 hr |

All other rates (SOFR, SONIA, BKBM, SORA, VNIBOR, 10Y yields) use high-quality static fallback data updated from the weekly PDF report.

---

## Deploy to Vercel (Recommended — Free)

1. **Push this folder to GitHub**
   - Create a new repo on github.com
   - Upload all files in this folder

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repo
   - Framework: Next.js (auto-detected)
   - Click **Deploy**

3. **Done.** Share the URL with your team.

> Vercel free tier handles this easily. No environment variables needed — all API calls are server-side with no auth keys required.

---

## Deploy to Netlify

1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com) → New Site from Git
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Install the **Next.js Runtime** plugin when prompted

---

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Requirements:** Node.js 18+

---

## Updating Static Data Weekly

When you receive the weekly PDF report, update the fallback data in:
```
lib/marketData.ts
```

Fields to update per country:
- `cashRate`, `cashRateLastUpdate`, `cashRateNextUpdate`
- `benchmark`, `benchmarkLastUpdate`
- `rfRate`, `rfRates[]`, `rfLastUpdate`
- `cpi`, `cpiLastUpdate`
- `fxVsMYR`
- `corporateBonds[]` (MY only)
- `historical[]` — add a new entry for the current month
- `summary` — update the narrative

After editing, commit and push. Vercel auto-redeploys in ~1 minute.

---

## Architecture

```
gcap-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── components/
│   │   └── Dashboard.tsx   # Full dashboard UI
│   └── api/rates/
│       ├── fx/route.ts     # Live FX rates
│       ├── klibor/route.ts # BNM KLIBOR scraper
│       ├── bpam/route.ts   # BPAM MGS + Corp bonds
│       ├── bbsw/route.ts   # ASX BBSW rates
│       ├── rba/route.ts    # RBA cash rate
│       └── hibor/route.ts  # HKMA HIBOR rates
├── lib/
│   └── marketData.ts       # Static fallback data + types
├── next.config.js
├── vercel.json
└── package.json
```

---

*GCAP Internal — Not for distribution*
