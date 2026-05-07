import type { APIRoute } from "astro";
import { promises as fs } from "node:fs";
import path from "node:path";

export const prerender = false;

interface WaitlistPayload {
  email: string;
  lang: "pl" | "en";
  source?: string;
}

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const POST: APIRoute = async ({ request }) => {
  let body: WaitlistPayload;
  try {
    body = (await request.json()) as WaitlistPayload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  if (!body.email || !isValidEmail(body.email)) {
    return new Response(JSON.stringify({ error: "invalid_email" }), { status: 400 });
  }

  const lang = body.lang === "en" ? "en" : "pl";
  const source = body.source?.slice(0, 64) ?? "landing";
  const entry = {
    email: body.email.toLowerCase().trim(),
    lang,
    source,
    created_at: new Date().toISOString(),
  };

  // STUB: append to local JSON file in dev. In production wire to Supabase + Resend.
  // After deploy:
  //   1. Insert into Supabase `waitlist` table
  //   2. Send welcome email via Resend with -50% Pro discount code
  //   3. Tag in PostHog for funnel tracking
  if (import.meta.env.DEV) {
    const dataDir = path.resolve(process.cwd(), ".data");
    await fs.mkdir(dataDir, { recursive: true });
    const file = path.join(dataDir, "waitlist.jsonl");
    await fs.appendFile(file, JSON.stringify(entry) + "\n");
    console.log("[waitlist]", entry);
  } else {
    // Placeholder for production wiring
    console.log("[waitlist:prod-stub]", entry);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
