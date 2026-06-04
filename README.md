<p align="center">
  <img src="https://img.icons8.com/fluency/96/fire-element.png" width="80" alt="AdFeed Studio Logo" />
</p>

<h1 align="center">AdFeed Studio</h1>

<p align="center">
  <strong>A high-fidelity product feed parser & catalog ad preview studio</strong><br/>
  Turn raw commerce inventory feeds into pixel-perfect ad mockups for Meta, TikTok & Google Shopping — in seconds.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-D22128?style=flat-square" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-security">Security</a> •
  <a href="#-testing">Testing</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## ⚡ Quick Start

**Prerequisites:** Node.js 18+ and npm

```bash
# 1. Clone the repository
git clone https://github.com/your-org/adfeed-studio.git
cd adfeed-studio

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment
cp .env.example .env

# 4. Start development server
npm run dev
```

Open **http://localhost:3000** — you're ready to go.

---

## 🎯 Features

### Feed Parsing
| Capability | Details |
|-----------|---------|
| **JSON Input** | Paste raw JSON arrays or `{ products: [...] }` objects directly |
| **CSV Upload** | Drag & drop `.csv` files with automatic header detection |
| **Smart Header Mapping** | Auto-maps 25+ common feed headers (`g:id`, `sale_price`, `compare_at_price`, `image_link`, etc.) |
| **Google Namespace Support** | Strips `g:` prefixes from Google Shopping feed headers |
| **Sample Data** | One-click demo catalog with 3 curated products |
| **Validation Diagnostics** | Per-field error reporting with product ID tracing |

### Ad Preview Formats

| Platform | Aspect Ratio | Preview Style |
|----------|:------------:|--------------|
| **Meta Feed** | 1:1 Square | Facebook-style card with Like / Comment / Share actions |
| **Meta Story** | 9:16 Vertical | Instagram/Facebook story with progress bars & swipe-up CTA |
| **TikTok Ad** | 9:16 Vertical | TikTok-style creative with heart, comment, bookmark, share + music ticker |
| **Google Shopping** | Horizontal | Product card with star ratings, shipping badges & seller verification |

### Dynamic Design Overlays
Create conditional badge rules that auto-apply across all preview formats:

| Condition | Example |
|-----------|---------|
| `discount_gt` | Show **SALE** badge when discount exceeds 20% |
| `out_of_stock` | Show **OUT OF STOCK** badge when item is unavailable |
| `always` | Show **NEW** or **HOT** badge on every product |

**6 preset brand colors:** Studio Orange · Meta Red · TikTok Teal · Google Green · Deep Black · Slate Blue

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React 19)                       │
│                                                                 │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │  FeedInput    │  │ PlatformSwitcher│  │   DesignRules     │  │
│  │  (JSON/CSV)   │  │ (4 platforms)   │  │   (badge rules)   │  │
│  └──────┬───────┘  └────────┬────────┘  └────────┬──────────┘  │
│         │                   │                     │             │
│         ▼                   ▼                     ▼             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App.tsx (state hub)                    │  │
│  │              products[] · rules[] · platform             │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                      │
│         ┌───────────────┼───────────────┐                      │
│         ▼               ▼               ▼                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ MetaFeedAd  │ │  TikTokAd   │ │  GoogleAd   │  ...         │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└────────────────────────┬────────────────────────────────────────┘
                         │ fetch (useFeedParser hook)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Express Server (server.ts)                    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Rate Limiter  │  │ API Key Auth │  │ CORS Middleware       │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘ │
│         └──────────────────┴─────────────────────┘             │
│                            │                                    │
│  ┌─────────────────────────┼──────────────────────────────────┐ │
│  │              Validation & Security Pipeline                │ │
│  │  sanitizeString · escapeCSVFormula · SSRF checks           │ │
│  │  parseCSVLine · mapHeaders · validateProduct               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Endpoints:  GET /api/health                                    │
│              GET /api/feed/sample                               │
│              POST /api/feed/parse                               │
│              POST /api/feed/parse-csv                           │
└─────────────────────────────────────────────────────────────────┘
```

> The app is **fully stateless**. Products are parsed in-memory, returned to the browser, and rendered immediately. No database or background workers required.

---

## 📁 Project Structure

```
adfeed-studio/
├── server.ts                          # Express backend — API, validation, security
├── index.html                         # Vite SPA entry point
├── package.json                       # Dependencies & scripts
├── vite.config.ts                     # Vite + React + Tailwind v4 config
├── tsconfig.json                      # TypeScript config (ES2022, bundler)
├── .env.example                       # Environment variable template
│
└── src/
    ├── main.tsx                       # React 19 entry (StrictMode + createRoot)
    ├── App.tsx                        # Root layout — state hub, platform routing
    ├── index.css                      # Tailwind import, Syne + JetBrains Mono fonts
    │
    ├── hooks/
    │   └── useFeedParser.ts           # API client — fetch with retry, timeout, cleanup
    │
    ├── types/
    │   ├── product.ts                 # Product, FeedValidationError, DesignRule, Platform
    │   └── api.ts                     # ApiError, ApiResponse<T>
    │
    ├── components/
    │   ├── FeedInput/index.tsx         # JSON textarea + CSV drag-and-drop uploader
    │   ├── DesignRules/index.tsx       # Badge rule creator with color presets
    │   ├── PlatformSwitcher/index.tsx  # Platform tab bar with format metadata
    │   ├── AdPreview/
    │   │   ├── MetaFeedAd.tsx          # 1:1 Facebook feed card
    │   │   ├── MetaStoryAd.tsx         # 9:16 Instagram/Facebook story
    │   │   ├── TikTokAd.tsx           # 9:16 TikTok ad creative
    │   │   └── GoogleAd.tsx           # Horizontal Google Shopping card
    │   ├── EmptyState.tsx             # Empty catalog prompt + copyable JSON schema
    │   ├── ErrorBoundary.tsx          # React error boundary with recovery
    │   └── LoadingSpinner.tsx         # Animated loading indicator
    │
    └── __tests__/
        └── adfeed.test.ts            # Vitest — security, validation, boundary tests
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start Express + Vite development server on port 3000 |
| `npm run build` | Build frontend (Vite) + bundle backend (`dist/server.cjs`) |
| `npm run start` | Run production server from `dist/server.cjs` |
| `npm run lint` | TypeScript type-check via `tsc --noEmit` |
| `npm test` | Run Vitest test suite |
| `npm run clean` | Remove `dist/` and `server.js` build artifacts |

---

## 🔌 API Reference

### `GET /api/health`

Health check endpoint.

```json
{
  "status": "ok",
  "service": "AdFeed Studio backend running"
}
```

---

### `GET /api/feed/sample`

Returns a demo catalog with 3 curated products.

**Response:**
```json
{
  "products": [
    {
      "id": "jacket-001",
      "title": "Heritage Soft Leather Bomber Jacket - Vintage Amber",
      "brand": "Aero & Co. New York",
      "price": 149.00,
      "original_price": 220.00,
      "currency": "USD",
      "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?...",
      "category": "Apparel",
      "discount_percent": 32,
      "in_stock": true
    }
  ]
}
```

---

### `POST /api/feed/parse`

Validates a JSON product catalog. Accepts either a raw array or `{ products: [...] }` wrapper.

**Request:**
```json
[
  {
    "id": "prod-10",
    "title": "Minimal Ceramic Mug",
    "brand": "Ochre Studio",
    "price": 22,
    "original_price": 30,
    "currency": "USD",
    "image_url": "https://images.unsplash.com/photo-example",
    "category": "Home",
    "in_stock": true
  }
]
```

**Response:**
```json
{
  "products": [ /* validated products */ ],
  "errors": [ /* per-field validation errors */ ],
  "total": 1,
  "valid_count": 1
}
```

---

### `POST /api/feed/parse-csv`

Parses and validates CSV product data.

**Request:**
```json
{
  "csvText": "id,title,brand,price,original_price,currency,image_url,category,in_stock\nprod-10,Minimal Ceramic Mug,Ochre Studio,22,30,USD,https://example.com/img.jpg,Home,true"
}
```

**Supported CSV Headers:**

| Field | Recognized Headers |
|-------|-------------------|
| `id` | `id`, `sku`, `productid`, `item_id`, `g:id` |
| `title` | `title`, `name`, `productname` |
| `brand` | `brand`, `manufacturer`, `vendor` |
| `price` | `price`, `sale_price`, `saleprice` |
| `original_price` | `original_price`, `compare_at_price`, `list_price`, `regular_price` |
| `currency` | `currency`, `price_currency` |
| `image_url` | `image_url`, `image_link`, `image`, `img`, `g:image_link` |
| `category` | `category`, `product_type`, `type`, `google_product_category` |
| `in_stock` | `in_stock`, `availability`, `instock` |

---

## 📐 Product Schema

```typescript
interface Product {
  id: string;               // Required — unique product identifier
  title: string;            // Required — max 150 characters
  brand: string;            // Required — manufacturer or seller name
  price: number;            // Required — must be > 0
  original_price?: number;  // Optional — must be ≥ price
  currency: string;         // Defaults to "USD" — 3-letter code
  image_url: string;        // Required — must be http:// or https://
  category?: string;        // Optional — product type or category
  discount_percent?: number;// Auto-computed from price vs original_price
  in_stock: boolean;        // Defaults to true
}
```

**Validation rules:**
- `discount_percent` is auto-calculated: `round((original_price - price) / original_price × 100)`
- `in_stock` supports string coercion: `"false"`, `"0"`, `"no"`, `"out of stock"` → `false`
- Price fields strip `$`, `,` and other non-numeric characters before parsing

---

## 🔒 Security

### XSS Prevention
All text fields (`id`, `title`, `brand`, `currency`, `category`) are sanitized — HTML tags are stripped via regex before storage.

### CSV Injection Defense
Values starting with `=`, `+`, `-`, or `@` are escaped with a leading single-quote to prevent formula injection attacks.

### SSRF Protection
`image_url` values are validated against:

| Blocked | Examples |
|---------|----------|
| Loopback | `localhost`, `127.0.0.1`, `[::1]` |
| Cloud Metadata | `169.254.169.254` |
| Private Ranges | `10.x.x.x`, `192.168.x.x`, `172.16-31.x.x` |
| Internal Hosts | Single-label hostnames (no dots) |
| Bad Protocols | `ftp://`, `file://`, `javascript:` |

### Rate Limiting
In-memory per-IP throttle: **100 requests per 15 minutes** on all `/api/feed/*` endpoints.

### Request Size Limits
| Limit | Value |
|-------|-------|
| JSON body size | 5 MB |
| JSON product array | 1,000 items max |
| CSV file | 1,000 data rows + 1 header |

### Optional API Key
Set `ADFEED_API_KEY` in `.env` to enforce authorization via `X-AdFeed-API-Key` header or `apiKey` query parameter.

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

### Current Coverage

| Suite | Tests | What it covers |
|-------|:-----:|---------------|
| **XSS Defense** | 2 | `<script>` and `<iframe>` tag stripping |
| **CSV Injection** | 2 | Formula character escaping (`=`, `+`, `-`, `@`) |
| **SSRF Protection** | 2 | Blocked internal IPs + allowed public URLs |
| **Price Boundaries** | 3 | Discount computation, invalid pricing, negative values |

---

## ⚙️ Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|:--------:|-------------|
| `ADFEED_API_KEY` | No | If set, all `/api/feed/*` requests must include this key |
| `GEMINI_API_KEY` | No | Reserved for future AI-powered features |
| `APP_URL` | No | The public URL where this app is hosted |

---

## 🚀 Production Build

```bash
# Build frontend + bundle backend
npm run build

# Start production server
npm run start
```

The build outputs:
- `dist/` — Vite-compiled frontend assets
- `dist/server.cjs` — Bundled Express server (ESBuild)

### Pre-deploy Checklist

```bash
npm install        # Install dependencies
npm run lint       # Type-check passes
npm test           # All tests pass
npm run build      # Build succeeds
```

---

## 🗺 Roadmap

- [ ] **Dynamic port binding** — Use `process.env.PORT` instead of hardcoded 3000
- [ ] **CORS restriction** — Restrict origins per environment
- [ ] **CI/CD pipeline** — GitHub Actions for lint → test → build
- [ ] **Component tests** — React Testing Library for all UI components
- [ ] **Hook tests** — Cover `useFeedParser` loading, error, timeout, and cleanup flows
- [ ] **E2E tests** — Playwright smoke tests for sample load, platform switching, badge rendering
- [ ] **Centralized rule engine** — Extract duplicated badge-matching logic into a shared helper
- [ ] **Dynamic Google ratings** — Drive star ratings from product data instead of static 4.5
- [ ] **Bulk export** — Download rendered ad previews as PNG/PDF
- [ ] **Custom badge text** — Allow free-text badge labels beyond the 4 presets

---

## 🧰 Tech Stack Details

| Dependency | Version | Purpose |
|-----------|---------|---------|
| [React](https://react.dev) | 19.0 | UI component framework |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Static typing |
| [Vite](https://vitejs.dev) | 6.2 | Frontend build tool & dev server |
| [Express](https://expressjs.com) | 4.21 | Backend HTTP server |
| [Tailwind CSS](https://tailwindcss.com) | 4.1 | Utility-first CSS framework |
| [Lucide React](https://lucide.dev) | 0.546 | Icon library |
| [TSX](https://tsx.is) | 4.21 | TypeScript execution for dev server |
| [ESBuild](https://esbuild.github.io) | 0.25 | Server bundler for production |
| [Vitest](https://vitest.dev) | 4.1 | Unit test framework |
| [dotenv](https://github.com/motdotla/dotenv) | 17.2 | Environment variable loader |

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see individual file headers for details.

---

<p align="center">
  <sub>Built with 🔥 by the AdFeed Studio team · Inspired by <a href="https://confect.io">Confect.io</a></sub>
</p>
