import type { APIRoute } from "astro";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

  if (import.meta.env.DEV) {
    const dataDir = path.resolve(process.cwd(), ".data");
    await fs.mkdir(dataDir, { recursive: true });
    const file = path.join(dataDir, "waitlist.jsonl");
    await fs.appendFile(file, JSON.stringify(entry) + "\n");
    console.log("[waitlist]", entry);
  } else {
    const supabase = createClient(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_KEY
    );

    const { error: dbError } = await supabase
      .from("waitlist")
      .insert({ email: entry.email, lang: entry.lang, source: entry.source });

    // 23505 = unique_violation — duplicate signup, still return ok
    if (dbError && dbError.code !== "23505") {
      console.error("[waitlist] supabase error", dbError);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500 });
    }

    if (!dbError) {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      const isPl = entry.lang !== "en";
      await resend.emails.send({
        from: "Vocra <hello@vocra.dev>",
        to: entry.email,
        subject: isPl ? "Jesteś na liście Vocra!" : "You're on the Vocra waitlist!",
        html: isPl
          ? `<p>Hej,</p><p>Dziękujemy za dołączenie do listy oczekujących Vocra. Jako jedna z pierwszych 200 osób otrzymasz <strong>50% zniżki</strong> na pierwszy rok Pro.</p><p>Free to tłumaczenie tekstowe i napisy. Pro odblokowuje dubbing z głosem mówcy i funkcje premium.</p><p>Napisz do nas: hello@vocra.dev</p>`
          : `<p>Hey,</p><p>Thanks for joining the Vocra waitlist. As one of the first 200 signups you'll get <strong>50% off</strong> your first year of Pro.</p><p>Free includes text translation and subtitles. Pro unlocks speaker-voice dubbing and premium features.</p><p>Reach us: hello@vocra.dev</p>`,
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
