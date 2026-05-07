# Project Overview: Vocra

Vocra is a Chrome extension that provides real-time translated subtitles for YouTube and online videos, prioritizing a Polish-first approach to beat YouTube's auto-translate quality. 

The project is currently in "Phase 0" (Validation & Waitlist), focusing on the landing page (`vocra.dev`) and gathering initial user interest through customer interviews. Future phases will include the actual Chrome extension (built with WXT) and the backend API (Cloudflare Workers).

## Repository Architecture

This is structured as a monorepo (though currently mostly focused on the landing page):

- `apps/landing/`: The main marketing website and waitlist capture application. Built with Astro 5, Tailwind CSS v4, and deployed via Vercel (using the `@astrojs/vercel` server adapter).
- `docs/`: Contains strategic and marketing documents, including Reddit/FB community post drafts and the customer interview script.
- `pencil-new.pen`: The design file containing the UI/UX mockups for the landing page (manageable via the Pencil MCP editor).

**Future additions planned:**
- `apps/extension/`: The WXT-based Chrome extension.
- `apps/api/`: Cloudflare Workers backend.
- `packages/shared/`: Shared TypeScript types.

## Tech Stack (Landing Page)
- **Framework:** Astro 5
- **Styling:** Tailwind CSS 4
- **Deployment:** Vercel (Server output)
- **Database / Auth:** Supabase (for the waitlist)
- **Email:** Resend
- **Translations/AI (Planned):** Claude Haiku 4.5 & Groq Whisper-large-v3

## Building and Running

The project uses `pnpm` as the package manager. All commands should be run from the `apps/landing` directory.

### Development Server
```bash
cd apps/landing
pnpm install
pnpm dev
```
The server will start at `http://localhost:4321`.

### Production Build & Preview
```bash
cd apps/landing
pnpm build
pnpm preview
```

### Environment Variables
For local development of the waitlist API, you need to create a `.env.development.local` file in `apps/landing/` with the following variables (or pull them via Vercel CLI using `npx vercel env pull`):
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`

## Development Conventions

- **i18n:** The landing page uses Astro's built-in i18n routing, with Polish (`pl`) as the default language and English (`en`) supported.
- **Styling:** Tailwind CSS is used globally. The design style follows a "SaaS Modern / Clean Trust" aesthetic with a dark theme (`#0a0a0a` background, `#10b981` emerald accents).
- **Deployment:** Deployment is managed via Vercel. Code pushed to the main branch is automatically deployed if connected, or can be deployed manually using the Vercel CLI (`npx vercel --prod`).
- **Waitlist Logic:** The waitlist form submits to a server-rendered Astro endpoint (`src/pages/api/waitlist.ts`), which handles the Supabase insertion and Resend email notification securely on the server-side using the `SUPABASE_SERVICE_KEY`.
