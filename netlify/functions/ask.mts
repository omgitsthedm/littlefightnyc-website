// Ask Little Fight — public AI assistant.
// POST /api/ask  body: { question: string }
// Calls Anthropic API. Falls back gracefully if key missing or API errors.

declare const Netlify:
  | { env?: { get?: (key: string) => string | undefined } }
  | undefined;

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 700;
const MAX_QUESTION_LENGTH = 1000;

// Corpus seed — curated facts + voice from Little Fight pages.
// In a later iteration this becomes RAG over the live HTML/markdown corpus.
const CORPUS = `
LITTLE FIGHT NYC — what we do:
- Websites: hand-built, mobile-first, owner-trainable. Live in 14 days, or you don't pay. From $2,400 flat.
- Custom Systems: bespoke software, dashboards, automations for NYC small business. First working version in 30 days. From $4,000.
- Consulting: 30-day audit + written fight plan. We map every tool, workflow, bill. $1,500 flat.
- IT Support: 2-hour NYC response, or it's free. POS, network, email, computer, smart-home. $150/hr or $500/mo retainer.

POSITIONING:
- We help NYC small business owners fight bad software, expensive vendors, and tools that don't work.
- David Marsh is the founder. Real human. Picks up the phone at (646) 360-0318.
- Manhattan + outer boroughs on-site. Anywhere remote.
- Plain English first. The bill has to earn it. Local businesses are worth defending.
- "Keep what works. Connect what matters. Replace what drags. Build what fits."

COMMON OWNER QUESTIONS WE'VE WRITTEN ABOUT:
- POS comparison: Square vs Toast for NYC restaurants. Square: lower fees, simpler ops, less full-service. Toast: heavier menu/inventory, costs more, locks you in. Most NYC bars/cafes are fine on Square; full-service restaurants with complex menus often need Toast.
- Booking software: Square Appointments is fine for solo and small. GlossGenius for salons that want client-relationship features. Acuity for studios with classes. Most NYC salons over-pay for booking — the SaaS tier ladder is brutal once you cross 3 chairs.
- Local SEO: Google Business Profile is the foundation. Real photos, weekly posts, 1-3 reviews/week, accurate hours, services field filled out. Neighborhood pages on the website. Don't pay for mass directory submissions.
- Custom vs SaaS: Custom usually wins when you pay $200+/mo for tools that make staff work around them, when 2+ apps need to share data, or when the next SaaS tier is 5x the price. Below $100/mo SaaS spend, custom doesn't pay back.
- Website cost: A real working small business website in NYC runs $2,400-$6,000 from us, $5,000-$15,000 from most agencies, $200-$500/year DIY (Squarespace, Webflow). We charge less than agencies because we don't carry agency overhead.
- Google Business Profile suspended: usually a verification or category mismatch. Can be reinstated within 1-3 days through GBP support. Most common cause: changed address without updating, or service-area-business set up wrong.
- Restaurant website + booking + payments: Resy or Tock for reservations, Toast or Square for POS, Stripe for online checkout. Connect via webhooks/Zapier. Custom only when these don't talk to each other and you're losing data.
- Spreadsheet to dashboard: yes we build these. Usually $4,000-$8,000 for a focused owner-view. Replaces 2-3 tools shops were paying for.
- Lead capture: every form, call, DM should land in one inbox. Email + SMS notify owner. Auto-reply within 5 minutes. We've seen 30%+ revenue lift from lead-capture cleanup alone.

THE FIT CHECK is our intake — 60-second conversational form (web) or voice (phone). Real human reply within 2 hours, NYC business hours.

WE DO NOT do: pay-per-click ads, social media management, content marketing, paid SEO link-building, vague "growth marketing." We do tech. We refer paid-media work elsewhere.
`.trim();

const SYSTEM_PROMPT = `You are the Ask Little Fight assistant on littlefightnyc.com — a public Q&A bot for New York small business owners asking tech questions.

VOICE RULES:
- Direct, warm, practical. Speak like a NYC tradesman, not a SaaS startup.
- Short sentences. Plain words. No jargon unless explained in dollars/time.
- Name specific tools (Square, Toast, Stripe, Acuity, Webflow, etc.) when relevant.
- Never say "leverage," "synergize," "optimize your experience," "innovative," "cutting-edge," "amazing."
- Never say "we'd be happy to" or "feel free to." Talk plainly.
- Use US English. Use real numbers when you have them.

ANSWERING RULES:
- Answer ONLY from the corpus below. If the corpus doesn't cover the question, say so plainly: "I don't know that one — David might. Want to start a Fit Check at /fit-check/?"
- Keep answers under 200 words. Most under 80.
- For pricing questions about a specific shop's situation, give a range from the corpus and route to Fit Check for an exact number.
- For urgent technical issues (POS down, website down, payment broken): keep it brief and route to (646) 360-0318 or /fit-check/.
- End with a soft pointer to Fit Check or the relevant quadrant page when it makes sense, not on every reply.
- Never invent client names, specific case-study numbers, or testimonials.
- Never give legal, tax, financial, or HR advice. Route to a real professional.

LITTLE FIGHT CORPUS:
${CORPUS}`;

interface AskRequest {
  question?: string;
}

function fallbackAnswer(): string {
  return (
    "Couldn't reach the assistant just now. Want a real answer? Start a Fit Check at /fit-check/ — David replies in person, usually within 2 hours during NYC business hours. Or call (646) 360-0318."
  );
}

function quickRouteFallback(question: string): string {
  const q = question.toLowerCase();
  if (
    q.includes("urgent") ||
    q.includes("down right now") ||
    q.includes("emergency") ||
    q.includes("on fire") ||
    q.includes("broken") ||
    q.includes("not working")
  ) {
    return "Sounds urgent. Call (646) 360-0318 or start a Fit Check at /fit-check/ and mark it urgent — David will pick it up in under 2 hours during NYC business hours.";
  }
  if (q.includes("how much") || q.includes("cost") || q.includes("price")) {
    return "Pricing depends on the shop. Ranges from the site: Websites from $2,400, Custom Systems from $4,000, Consulting walkthrough $1,500 flat, IT Support $150/hr or $500/mo retainer. For a real number for your situation, start a Fit Check at /fit-check/.";
  }
  return "I don't have a great answer for that one. Want David to reply directly? Start a Fit Check at /fit-check/ or call (646) 360-0318.";
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: AskRequest;
  try {
    body = (await req.json()) as AskRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const question = (body.question ?? "").trim();
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return new Response(JSON.stringify({ error: "Bad question" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Netlify?.env?.get?.("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // Graceful fallback when API not configured — don't leak the misconfig.
    console.log("[ask] No ANTHROPIC_API_KEY configured. Returning fallback.");
    return new Response(
      JSON.stringify({ answer: quickRouteFallback(question), source: "fallback-no-key" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!res.ok) {
      console.log(`[ask] Anthropic API ${res.status}: ${await res.text()}`);
      return new Response(
        JSON.stringify({ answer: fallbackAnswer(), source: "fallback-api-error" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text =
      data.content
        ?.filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n")
        .trim() ?? "";

    if (!text) {
      return new Response(
        JSON.stringify({ answer: fallbackAnswer(), source: "fallback-empty" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log question for content-feedback loop. Do not log answer — keep cost down.
    console.log(`[ask] Q: ${question.replace(/\n/g, " ")}`);

    return new Response(JSON.stringify({ answer: text, source: "anthropic" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(`[ask] Exception: ${err}`);
    return new Response(
      JSON.stringify({ answer: fallbackAnswer(), source: "fallback-exception" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/ask",
};
