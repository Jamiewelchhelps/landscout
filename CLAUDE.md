LandScout — Intelligent Land Listing Platform
What This Project Is
A premium land listing and intelligence platform that makes buying rural/undeveloped land
as easy and informative as buying a house on Zillow. We translate every piece of land data
into plain English that a first-time buyer can understand.
Tech Stack (do not deviate without asking)
Framework: Next.js 14+ (App Router, server components by default)
Language: TypeScript (strict mode, no `any` types)
Styling: Tailwind CSS 3.x — no other CSS frameworks
Database: Supabase free tier (PostgreSQL + PostGIS for spatial queries)
Auth: Supabase Auth (free tier)
Maps: Leaflet with React-Leaflet (ESRI satellite tiles + OpenStreetMap, no API key needed)
AI Reports: Anthropic Claude API (claude-sonnet-4-20250514) — Phase 2
Hosting: Vercel free tier
Package Manager: pnpm
Project Structure
```
src/
  app/              # Next.js App Router pages
    (marketing)/    # Landing page, about, pricing
    (app)/          # Authenticated app routes
      search/       # Map search + filtering
      parcel/[id]/  # Individual parcel pages
      dashboard/    # User dashboard, saved searches
    api/            # API routes
  components/       # Shared React components
    ui/             # Base UI primitives (buttons, inputs, cards)
    map/            # Leaflet map components
    parcel/         # Parcel display components
    report/         # AI report section components
  lib/              # Utilities, API clients, helpers
    supabase/       # Supabase client + queries
    data-sources/   # Government API integrations (USDA, FEMA, USGS, etc.)
    ai/             # Claude API integration for reports
  types/            # TypeScript type definitions
  hooks/            # Custom React hooks
```
Map Configuration
Use Leaflet via react-leaflet. No paid map provider.
ESRI satellite tiles as default layer (free, no key):
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
OpenStreetMap as alternate layer (free, no key):
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
OpenTopoMap as terrain layer (free, no key):
https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
Use react-leaflet-cluster for marker clustering
Leaflet is NOT SSR-compatible — always load map components with dynamic import
and ssr: false in Next.js (e.g., dynamic(() => import('./Map'), { ssr: false }))
Design Philosophy
Premium, clean, modern — think Airbnb applied to land
No jargon without plain-English explanation
Mobile-first responsive design
Dark satellite map as hero, light UI panels overlaid
Smooth animations and transitions (framer-motion where warranted)
Typography: use distinctive, premium fonts from Google Fonts (not Inter/Roboto/Arial)
Every piece of complex information is presented with visual aids
The UI should feel fast — use server components, streaming, and optimistic updates
Code Conventions
Use named exports, not default exports (except Next.js pages/layouts)
Prefer server components; use "use client" only when interactivity is needed
All database queries go through lib/supabase/ — never query directly from components
All external API calls go through lib/data-sources/ with proper error handling and caching
Use Zod for runtime validation of all external API responses
Every component gets its own file — no multi-component files
Descriptive variable names, no abbreviations
All prices stored in cents internally, format for display only
Coordinates always [latitude, longitude] for Leaflet (Leaflet uses lat/lng, NOT lng/lat)
Use `cn()` helper (clsx + twMerge) for conditional Tailwind classes
Prefer composition over prop drilling — use React context for shared state
Data Architecture
Parcels are the core entity — everything relates back to a parcel
Parcel data comes from county assessor/GIS records (public data)
Intelligence report sections are generated on-demand and cached in Supabase
Use PostGIS for all spatial queries (ST_Contains, ST_DWithin, ST_MakeEnvelope)
Cache expensive API calls (USDA soil, FEMA flood, etc.) with 30-day TTL
Parcel IDs use format: {state_fips}{county_fips}_{apn} (e.g., "48453_1234-567-890")
External Data Sources (all free)
All government APIs are free. Integration modules live in lib/data-sources/:
USDA Web Soil Survey API — soil type, drainage, capability class
FEMA NFHL API — flood zones, flood insurance requirements
USGS Water Services — groundwater data, well depths
NREL Solar Resource API — solar potential, peak sun hours
SRTM / USGS Elevation — slope analysis, viewshed
NOAA Climate Normals — weather, precipitation, temperature
NOAA Storm Events — natural disaster history
FCC Broadband Map — internet/cell coverage
BLM NLCS — public land boundaries
National Wetlands Inventory — wetland locations
Build Phases (current: Phase 1)
Phase 1 (MVP): Listing pages, Leaflet map, search/filter, user accounts, saved listings
Phase 2: AI intelligence reports pulling from 5-10 data sources, development cost calculator
Phase 3: Historical satellite, viewshed analysis, agriculture/hunting scores, full 20+ data sources
Phase 4: Monetization, community features, contractor directory
Commands
`pnpm dev` — start dev server
`pnpm build` — production build (run after major changes to catch type errors)
`pnpm lint` — run ESLint
`pnpm test` — run tests
`pnpm db:migrate` — run Supabase migrations
`pnpm seed` — seed database with sample parcel data
Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
No map API keys needed. Leaflet + ESRI/OSM tiles are completely free and keyless.
Important Rules
Never commit API keys or .env.local
Always run `pnpm build` after major changes to verify no type errors
When creating database tables, always include created_at and updated_at with defaults
Write meaningful git commit messages using conventional commits (feat:, fix:, chore:)
Every API route needs proper error handling — return structured JSON errors, never crash
All user-facing text should be plain English — translate any technical jargon
Log external API failures with enough context to debug (source, endpoint, status code, parcel ID)
Leaflet maps MUST use dynamic imports with ssr: false — they will crash during server-side rendering otherwise
