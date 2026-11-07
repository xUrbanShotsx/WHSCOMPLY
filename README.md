# WHSCOMPLY

Marketing site for WHSCOMPLY, WHS compliance software for builders. Next.js, Tailwind, GSAP and Lenis.

```bash
npm install
npm run dev
```

## AI toolkit

The dashboard has an AI toolkit and Assistant. They call the Claude API from the server, so add a key to `.env.local` (see `.env.example`) and restart:

```bash
ANTHROPIC_API_KEY=...
```

Without a key the tools show a friendly "not connected" message. The routes are `src/app/api/ai` (one-shot tools) and `src/app/api/ai/chat` (streaming Assistant). Both are limited to same-origin requests and rate limited per address, which is light protection for a public demo, so add real authentication before opening the dashboard to the public.
