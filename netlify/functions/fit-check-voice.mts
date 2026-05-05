import { createHmac, timingSafeEqual } from "node:crypto";

type JsonRecord = Record<string, unknown>;

declare const Netlify:
  | {
      env?: {
        get?: (key: string) => string | undefined;
      };
    }
  | undefined;

type VoiceState = {
  consent?: boolean;
  problem?: string;
  selectedEntry?: string;
  urgencyLevel?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  contact?: string;
  caller?: string;
  callSid?: string;
  retry?: number;
};

const twimlHeaders = {
  "Content-Type": "text/xml; charset=utf-8",
  "Cache-Control": "no-store",
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const urgentTriggers = [
  "booking down",
  "booking is down",
  "booking not working",
  "cannot book",
  "can't log in",
  "cannot log in",
  "customers cannot",
  "dns",
  "domain",
  "email down",
  "email stopped",
  "form goes nowhere",
  "form not working",
  "lost access",
  "payment down",
  "payment not",
  "pos down",
  "site down",
  "website down",
];

const entryKeywords: Record<string, string[]> = {
  broken: ["broken", "down", "not working", "login", "access", "payment", "pos", "email", "dns", "domain", "urgent"],
  website: ["website", "site", "mobile", "copy", "service page", "rebuild", "redesign", "form"],
  software: ["software", "crm", "subscription", "too expensive", "platform", "square", "toast", "shopify", "mindbody", "tool"],
  workflow: ["workflow", "manual", "spreadsheet", "follow up", "follow-up", "handoff", "dashboard", "tracking", "intake"],
  customers: ["google", "maps", "near me", "search", "seo", "review", "reviews", "local", "customers find", "competitor"],
};

const categoryNames: Record<string, string> = {
  broken: "Quick Fix",
  website: "Website Cleanup",
  software: "Tool / Software Decision",
  workflow: "Business System Build",
  customers: "Local Search / Visibility",
  unsure: "Not Sure Yet",
};

const questionSets: Record<string, string[]> = {
  broken: [
    "What is broken right now? Name the visible issue, but do not share passwords, codes, or private access details.",
    "Which platform, account, domain, email, form, POS, or booking tool is involved?",
    "When did it start, and has anyone already tried to fix it?",
  ],
  website: [
    "What feels weak about the current website?",
    "What platform is the site on, if you know?",
    "What action should visitors take: book, call, buy, fill out a form, or request a quote?",
  ],
  software: [
    "What software or platform are you worried about?",
    "Roughly what does it cost per month or year, if you know?",
    "Where does the team work around it with spreadsheets, email, notes, or memory?",
  ],
  workflow: [
    "What happens after someone contacts you?",
    "What gets lost, copied twice, followed up late, or tracked manually?",
    "Which tools are part of that workflow now?",
  ],
  customers: [
    "What would someone search to find a business like yours?",
    "Which neighborhood, borough, or service area matters most?",
    "Do competitors show up before you on Google or Maps?",
  ],
  unsure: [
    "Where does the business feel harder than it should?",
    "What tools are involved, even if you are not sure which one is the problem?",
    "What would make this feel meaningfully better in the next 30 days?",
  ],
};

function env(key: string): string {
  try {
    const netlifyValue =
      typeof Netlify !== "undefined" ? Netlify?.env?.get?.(key) : undefined;
    if (netlifyValue) return netlifyValue;
  } catch {
    // Netlify.env is unavailable in local unit-style execution.
  }

  return typeof process !== "undefined" ? process.env[key] || "" : "";
}

function cleanText(value: unknown, limit = 900): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function escapeXml(value: unknown): string {
  return cleanText(value, 2400)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function response(body: string, status = 200): Response {
  return new Response(body, { status, headers: twimlHeaders });
}

function say(text: string): string {
  return `<Say>${escapeXml(text)}</Say>`;
}

function pause(seconds = 1): string {
  return `<Pause length="${seconds}"/>`;
}

function hangup(): string {
  return "<Hangup/>";
}

function twiml(parts: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${parts.join("")}</Response>`;
}

function absoluteUrl(req: Request, query: string): string {
  const url = new URL(req.url);
  return `${url.origin}/api/fit-check/voice${query}`;
}

function gather(req: Request, prompt: string, step: string, state: VoiceState, options: {
  numDigits?: string;
  timeout?: string;
  speechTimeout?: string;
} = {}): string {
  const nextState = encodeState(state);
  const action = absoluteUrl(req, `?step=${encodeURIComponent(step)}&s=${encodeURIComponent(nextState)}`);
  return [
    `<Gather input="speech dtmf" method="POST" action="${escapeXml(action)}" timeout="${options.timeout || "7"}" speechTimeout="${options.speechTimeout || "auto"}"${options.numDigits ? ` numDigits="${options.numDigits}"` : ""}>`,
    say(prompt),
    "</Gather>",
    say("I did not catch that."),
    `<Redirect method="POST">${escapeXml(action)}</Redirect>`,
  ].join("");
}

function encodeState(state: VoiceState): string {
  const trimmed: VoiceState = {};
  Object.entries(state).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "string") {
      trimmed[key as keyof VoiceState] = cleanText(value, 520) as never;
      return;
    }
    trimmed[key as keyof VoiceState] = value as never;
  });

  return Buffer.from(JSON.stringify(trimmed)).toString("base64url");
}

function decodeState(value: string): VoiceState {
  if (!value) return {};
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as VoiceState;
  } catch {
    return {};
  }
}

async function parseForm(req: Request): Promise<URLSearchParams> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as JsonRecord;
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      params.set(key, cleanText(value, 1600));
    });
    return params;
  }

  return new URLSearchParams(await req.text());
}

function readInput(params: URLSearchParams): string {
  return cleanText(paramValue(params, "SpeechResult") || paramValue(params, "Digits") || paramValue(params, "Body"), 900);
}

function isAffirmative(input: string): boolean {
  const text = input.toLowerCase();
  return text === "1" || /\b(yes|yeah|yep|okay|ok|sure|consent|agree)\b/.test(text);
}

function isNegative(input: string): boolean {
  const text = input.toLowerCase();
  return text === "2" || /\b(no|nope|decline|human|message|voicemail)\b/.test(text);
}

function classifyEntry(problem: string): string {
  const text = problem.toLowerCase();
  if (urgentTriggers.some((trigger) => text.includes(trigger))) return "broken";

  let best = "unsure";
  let bestScore = 0;
  Object.entries(entryKeywords).forEach(([entry, keywords]) => {
    const score = keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  });

  return best;
}

function inferUrgency(problem: string, input: string): string {
  const text = `${problem} ${input}`.toLowerCase();
  if (
    input === "1" ||
    urgentTriggers.some((trigger) => text.includes(trigger)) ||
    /\b(right now|customers affected|revenue|payments?|bookings?|email|access|down)\b/.test(text)
  ) {
    return "emergency";
  }
  if (input === "2" || /\b(urgent|soon|this week|asap|not a fire)\b/.test(text)) {
    return "urgent_but_not_emergency";
  }
  if (input === "4" || /\b(exploring|curious|not sure|later)\b/.test(text)) {
    return "exploratory";
  }
  return "planned_improvement";
}

function sensitiveWarningNeeded(text: string): boolean {
  return /\b(password|passcode|recovery code|api key|secret key|private key|token|credit card|bank account|ssn|social security)\b/i.test(text);
}

function stateSummary(state: VoiceState): string {
  return [
    state.problem ? `Initial problem: ${state.problem}` : "",
    state.q1 ? `Answer 1: ${state.q1}` : "",
    state.q2 ? `Answer 2: ${state.q2}` : "",
    state.q3 ? `Answer 3: ${state.q3}` : "",
    state.contact ? `Contact: ${state.contact}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function questionFor(state: VoiceState, index: number): string {
  const entry = state.selectedEntry || "unsure";
  const questions = questionSets[entry] || questionSets.unsure;
  return questions[index] || questions[questions.length - 1];
}

function buildPayload(state: VoiceState, params: URLSearchParams): JsonRecord {
  const caller = cleanText(state.caller || paramValue(params, "From") || paramValue(params, "Caller"), 80);
  const selectedEntry = state.selectedEntry || classifyEntry(state.problem || "");
  const initialProblem = cleanText(state.problem, 1400);
  const urgencyLevel = state.urgencyLevel || inferUrgency(initialProblem, "");
  const contactSpeech = cleanText(state.contact, 400);
  const guessedBusiness = contactSpeech || `Voice caller ${caller || "unknown"}`;

  return {
    intake_mode: "voice",
    source: "twilio-voice",
    page_url: "voice-call",
    selected_entry: selectedEntry,
    initial_problem: initialProblem,
    urgency_level: urgencyLevel,
    answers: {
      voice_problem: initialProblem,
      voice_q1: cleanText(state.q1, 900),
      voice_q2: cleanText(state.q2, 900),
      voice_q3: cleanText(state.q3, 900),
      voice_contact: contactSpeech,
      selected_entry: selectedEntry,
      initial_problem: initialProblem,
      urgency_level: urgencyLevel,
      call_sid: cleanText(state.callSid || paramValue(params, "CallSid"), 100),
      from: caller,
    },
    contact: {
      name: contactSpeech || "Voice caller",
      business: guessedBusiness,
      phone: caller,
      website: "",
      industry: "",
      location: "",
      team_size: "",
    },
    consent_ai_summary: state.consent === true,
    consent_recording: false,
    events: [
      {
        event_type: "voice_intake_completed",
        created_at: new Date().toISOString(),
        event_payload: {
          selected_entry: selectedEntry,
          urgency_level: urgencyLevel,
          call_sid: cleanText(state.callSid || paramValue(params, "CallSid"), 100),
        },
      },
    ],
  };
}

async function submitFitCheck(req: Request, payload: JsonRecord): Promise<JsonRecord | null> {
  const url = new URL(req.url);
  const endpoint = `${url.origin}/api/fit-check/submit`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    return (await response.json()) as JsonRecord;
  } catch {
    return null;
  }
}

async function submitBackupForm(req: Request, state: VoiceState, result: JsonRecord | null): Promise<void> {
  const origin = new URL(req.url).origin;
  const resultRecord = (result?.result && typeof result.result === "object"
    ? (result.result as JsonRecord)
    : {}) as JsonRecord;

  const form = new URLSearchParams();
  form.set("form-name", "fit-check");
  form.set("name", cleanText(state.contact) || "Voice caller");
  form.set("business_name", cleanText(state.contact) || "Voice Fit Check");
  form.set("phone", cleanText(state.caller));
  form.set("email", "");
  form.set("business_type", "");
  form.set("neighborhood", "");
  form.set("selected_entry", cleanText(state.selectedEntry || "unsure"));
  form.set("initial_problem", cleanText(state.problem, 1400));
  form.set("urgency_level", cleanText(state.urgencyLevel || "planned_improvement"));
  form.set("primary_category", cleanText(resultRecord.primary_category || categoryNames[state.selectedEntry || "unsure"]));
  form.set("secondary_categories", Array.isArray(resultRecord.secondary_categories) ? resultRecord.secondary_categories.join(", ") : "");
  form.set("recommended_next_step", cleanText(resultRecord.recommended_next_step));
  form.set("ballpark_type", cleanText(resultRecord.ballpark_type));
  form.set("ai_client_summary", cleanText(resultRecord.client_facing_summary, 1800));
  form.set("ai_internal_brief", cleanText(resultRecord.internal_summary || stateSummary(state), 2200));
  form.set("follow_up_email_draft", cleanText((resultRecord.follow_up_email as JsonRecord | undefined)?.body, 1800));
  form.set("raw_answers_json", JSON.stringify(state));
  form.set("ai_result_json", JSON.stringify(resultRecord));
  form.set("messy_now", cleanText(state.problem, 1200));
  form.set("current_tools", [state.q1, state.q2, state.q3].map((item) => cleanText(item, 500)).join(" | "));
  form.set("consent_ai_summary", state.consent ? "true" : "false");

  try {
    await fetch(origin, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  } catch {
    // Netlify Forms fallback should never block the caller experience.
  }
}

async function submitNoAiMessage(req: Request, state: VoiceState): Promise<void> {
  await submitBackupForm(req, state, null);
}

function headerValue(req: Request, name: string): string {
  return cleanText(req.headers.get(name), 400);
}

function paramValue(params: URLSearchParams, name: string): string {
  const direct = params.get(name);
  if (direct !== null) return cleanText(direct, 1200);

  const lowerName = name.toLowerCase();
  const normalizedName = normalizeParamKey(name);
  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === lowerName) return cleanText(value, 1200);
    if (normalizeParamKey(key) === normalizedName) return cleanText(value, 1200);
  }

  return "";
}

function normalizeParamKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function safeEqual(left: string, right: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(left), Buffer.from(right));
  } catch {
    return false;
  }
}

function signatureFor(token: string, url: string, params: URLSearchParams): string {
  const data = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => `${acc}${key}${value}`, url);

  return createHmac("sha1", token).update(data).digest("base64");
}

function candidateSignatureUrls(req: Request): string[] {
  const url = new URL(req.url);
  const urls = new Set<string>([req.url]);
  const forwardedHost = headerValue(req, "x-forwarded-host") || headerValue(req, "host");
  const forwardedProto = headerValue(req, "x-forwarded-proto") || "https";
  const publicVoiceUrl = env("TWILIO_PUBLIC_VOICE_URL") || "https://littlefightnyc.com/api/fit-check/voice";

  if (forwardedHost) {
    urls.add(`${forwardedProto}://${forwardedHost}${url.pathname}${url.search}`);
    urls.add(`https://${forwardedHost}${url.pathname}${url.search}`);
  }

  urls.add(`${url.origin}${url.pathname}${url.search}`);
  urls.add(`https://littlefightnyc.com${url.pathname}${url.search}`);
  urls.add(`${publicVoiceUrl}${url.search}`);

  return Array.from(urls);
}

function candidateSignatureParams(params: URLSearchParams): URLSearchParams[] {
  const candidates = [params];
  const withoutCallToken = new URLSearchParams(params);
  withoutCallToken.delete("CallToken");
  withoutCallToken.delete("call_token");

  if (withoutCallToken.toString() !== params.toString()) {
    candidates.push(withoutCallToken);
  }

  return candidates;
}

function allowTrialSignatureFallback(params: URLSearchParams): boolean {
  if (env("TWILIO_ALLOW_SIGNATURE_FALLBACK") !== "true") return false;

  const expectedAccountSid = env("TWILIO_ACCOUNT_SID");
  const accountSid = paramValue(params, "AccountSid");
  const callSid = paramValue(params, "CallSid");
  const from = paramValue(params, "From") || paramValue(params, "Caller");
  const to = paramValue(params, "To") || paramValue(params, "Called");

  return (
    Boolean(expectedAccountSid) &&
    accountSid === expectedAccountSid &&
    /^CA[a-f0-9]{32}$/i.test(callSid) &&
    /^\+\d{7,15}$/.test(from) &&
    /^\+\d{7,15}$/.test(to)
  );
}

function validateTwilioSignature(req: Request, params: URLSearchParams): boolean {
  const token = env("TWILIO_AUTH_TOKEN");
  if (!token) return true;

  const signature = headerValue(req, "x-twilio-signature");
  if (!signature) return allowTrialSignatureFallback(params);

  for (const candidateUrl of candidateSignatureUrls(req)) {
    for (const candidateParams of candidateSignatureParams(params)) {
      if (safeEqual(signature, signatureFor(token, candidateUrl, candidateParams))) {
        return true;
      }
    }
  }

  if (allowTrialSignatureFallback(params)) {
    console.warn("Twilio signature fallback accepted for trial voice request.");
    return true;
  }

  return false;
}

function finalClientLine(result: JsonRecord | null, state: VoiceState): string {
  const resultRecord = result?.result && typeof result.result === "object"
    ? (result.result as JsonRecord)
    : null;

  const category =
    cleanText(resultRecord?.primary_category) ||
    categoryNames[state.selectedEntry || "unsure"] ||
    "Not Sure Yet";
  const nextStep = cleanText(resultRecord?.recommended_next_step) || "human follow-up";

  if (cleanText(resultRecord?.client_facing_summary)) {
    return cleanText(resultRecord?.client_facing_summary, 900);
  }

  return `Based on what you shared, this sounds like ${category}. The likely next step is ${nextStep}. This is not a quote. David needs to review the setup before scope, timeline, or pricing can be confirmed.`;
}

function urgentDial(req: Request, state: VoiceState): string {
  if (state.urgencyLevel !== "emergency") return "";
  const forwardNumber = cleanText(env("FIT_CHECK_URGENT_FORWARD_NUMBER"), 80);
  if (!forwardNumber) return "";

  const action = absoluteUrl(req, `?step=dial_done&s=${encodeURIComponent(encodeState(state))}`);
  return [
    say("This sounds active, so I am going to try David now. If he cannot pick up, the brief has still been captured."),
    `<Dial timeout="18" action="${escapeXml(action)}">${escapeXml(forwardNumber)}</Dial>`,
  ].join("");
}

async function handleStep(req: Request, params: URLSearchParams): Promise<Response> {
  const url = new URL(req.url);
  const step = url.searchParams.get("step") || "start";
  const input = readInput(params);
  const state = decodeState(url.searchParams.get("s") || "");
  state.caller = cleanText(state.caller || paramValue(params, "From") || paramValue(params, "Caller"), 80);
  state.callSid = cleanText(state.callSid || paramValue(params, "CallSid"), 100);

  if (step === "health") {
    return new Response(JSON.stringify({ ok: true, endpoint: "fit-check-voice" }), {
      headers: jsonHeaders,
    });
  }

  if (step === "start") {
    return response(
      twiml([
        gather(
          req,
          "Thanks for calling Little Fight NYC. This is the Fit Check intake assistant. I can ask a few questions about your website, software, local search visibility, or workflow so David has useful context before following up. This call may be transcribed and summarized by AI for human review. Is that okay? Say yes or press 1. If not, say no or press 2 and I can take a short non AI message instead.",
          "consent",
          state,
          { numDigits: "1", timeout: "8" },
        ),
      ]),
    );
  }

  if (step === "consent") {
    if (isNegative(input)) {
      state.consent = false;
      return response(
        twiml([
          gather(
            req,
            "No problem. Please leave a short message with your name, business, what is going on, and how urgent it is. Do not share passwords, recovery codes, or payment details.",
            "no_ai_message",
            state,
            { timeout: "10" },
          ),
        ]),
      );
    }

    if (!isAffirmative(input)) {
      return response(
        twiml([
          gather(
            req,
            "I need a clear yes before using the AI summary. Say yes or press 1 to continue, or say no or press 2 to leave a short message.",
            "consent",
            state,
            { numDigits: "1", timeout: "8" },
          ),
        ]),
      );
    }

    state.consent = true;
    return response(
      twiml([
        gather(
          req,
          "Got it. Tell me what is going on in plain English. You do not need the right tech term. Please do not share passwords, private keys, recovery codes, or payment details.",
          "problem",
          state,
          { timeout: "10" },
        ),
      ]),
    );
  }

  if (step === "no_ai_message") {
    state.problem = input || "Caller declined AI summary and did not leave a clear message.";
    await submitNoAiMessage(req, state);
    return response(
      twiml([
        say("Thanks. I have the short message and caller ID if available. David can follow up from there."),
        hangup(),
      ]),
    );
  }

  if (step === "problem") {
    state.problem = input;
    state.selectedEntry = classifyEntry(input);

    const warning = sensitiveWarningNeeded(input)
      ? "Please do not share passwords, recovery codes, payment details, private keys, or API tokens here. "
      : "";

    return response(
      twiml([
        say(`${warning}I am placing this first as ${categoryNames[state.selectedEntry]}. Now I need to understand urgency.`),
        gather(
          req,
          "Is this actively affecting customers, payments, bookings, website access, email, or staff access right now? Press 1 or say yes for active issue. Press 2 for urgent but not a fire. Press 3 for planned improvement. Press 4 for exploring.",
          "urgency",
          state,
          { numDigits: "1", timeout: "8" },
        ),
      ]),
    );
  }

  if (step === "urgency") {
    state.urgencyLevel = inferUrgency(state.problem || "", input);
    return response(
      twiml([
        say(
          state.urgencyLevel === "emergency"
            ? "I am treating this as active support first. If there is a larger cleanup behind it, David can separate that after the immediate issue."
            : "Good. I will ask a few pointed questions so David does not have to start cold.",
        ),
        gather(req, questionFor(state, 0), "q1", state, { timeout: "9" }),
      ]),
    );
  }

  if (step === "q1") {
    state.q1 = input;
    return response(twiml([gather(req, questionFor(state, 1), "q2", state, { timeout: "9" })]));
  }

  if (step === "q2") {
    state.q2 = input;
    return response(twiml([gather(req, questionFor(state, 2), "q3", state, { timeout: "9" })]));
  }

  if (step === "q3") {
    state.q3 = input;
    return response(
      twiml([
        gather(
          req,
          "Last thing. Please say your name and business name. Caller ID gives us your phone number if it is available.",
          "contact",
          state,
          { timeout: "9" },
        ),
      ]),
    );
  }

  if (step === "contact") {
    state.contact = input;
    const payload = buildPayload(state, params);
    const result = await submitFitCheck(req, payload);
    await submitBackupForm(req, state, result);

    return response(
      twiml([
        say(finalClientLine(result, state)),
        pause(1),
        say("I will send this to David as a Fit Check brief. A human review is still needed before scope, timeline, or pricing can be confirmed."),
        urgentDial(req, state),
        say("Thanks for calling Little Fight NYC."),
        hangup(),
      ]),
    );
  }

  if (step === "dial_done") {
    return response(twiml([say("The Fit Check brief has been captured. Thanks for calling Little Fight NYC."), hangup()]));
  }

  return response(twiml([say("I hit a routing issue, so this needs human review. Please call Little Fight again or use the Fit Check page."), hangup()]));
}

export default async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: twimlHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return response(twiml([say("Method not allowed."), hangup()]), 405);
  }

  if (url.searchParams.get("step") === "health") {
    return new Response(JSON.stringify({ ok: true, endpoint: "fit-check-voice" }), {
      headers: jsonHeaders,
    });
  }

  const params = req.method === "POST" ? await parseForm(req) : new URLSearchParams();
  if (!validateTwilioSignature(req, params)) {
    return response(twiml([say("Request signature failed."), hangup()]), 403);
  }

  return handleStep(req, params);
};

export const config = {
  path: "/api/fit-check/voice",
  method: ["GET", "POST", "OPTIONS"],
};
