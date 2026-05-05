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
  followUpPreference?: string;
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
    "What service is broken, and when did it start?",
  ],
  website: [
    "What feels wrong with the website right now?",
  ],
  software: [
    "What tool is causing the problem?",
  ],
  workflow: [
    "Where does the work get lost, repeated, or stuck?",
  ],
  customers: [
    "What should customers find you for, and where?",
  ],
  unsure: [
    "What feels most messy right now?",
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

function isE164(value: string): boolean {
  return /^\+\d{7,15}$/.test(value);
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

function safeXmlAttribute(value: string, fallback: string): string {
  const cleaned = cleanText(value, 80);
  return /^[a-zA-Z0-9_.:%+-]+$/.test(cleaned) ? cleaned : fallback;
}

function say(text: string): string {
  const voice = safeXmlAttribute(env("TWILIO_TTS_VOICE") || "Polly.Matthew-Neural", "Polly.Matthew-Neural");
  const language = safeXmlAttribute(env("TWILIO_TTS_LANGUAGE") || "en-US", "en-US");
  const rate = safeXmlAttribute(env("TWILIO_TTS_RATE") || "106%", "106%");

  return `<Say voice="${voice}" language="${language}"><prosody rate="${rate}">${escapeXml(text)}</prosody></Say>`;
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

function publicFitCheckUrl(): string {
  return cleanText(env("FIT_CHECK_URL") || "https://littlefightnyc.com/fit-check/", 500);
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
    state.followUpPreference ? `Preferred follow-up: ${state.followUpPreference}` : "",
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
  const followUpPreference = cleanText(state.followUpPreference, 160);
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
      preferred_follow_up: followUpPreference,
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
  form.set("preferred_follow_up", cleanText(state.followUpPreference));
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

async function sendTwilioSms(to: string, body: string): Promise<{
  configured: boolean;
  sent: boolean;
  status?: number;
  error?: string;
}> {
  const accountSid = env("TWILIO_ACCOUNT_SID");
  const authToken = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_NOTIFY_FROM") || env("TWILIO_FROM_NUMBER") || "";
  if (!accountSid || !authToken || !from || !isE164(to)) {
    return { configured: false, sent: false };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        signal: controller.signal,
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: body.slice(0, 1500),
        }).toString(),
      },
    );

    return { configured: true, sent: twilioResponse.ok, status: twilioResponse.status };
  } catch (error) {
    return {
      configured: true,
      sent: false,
      error: cleanText((error as Error).message, 160),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyDavidBySms(subject: string, state: VoiceState, details: string[] = []) {
  const notifyTo = cleanText(env("TWILIO_NOTIFY_TO") || env("FIT_CHECK_URGENT_FORWARD_NUMBER"), 80);
  if (!notifyTo) return { configured: false, sent: false };

  const lines = [
    subject,
    state.caller ? `Caller: ${state.caller}` : "",
    state.callSid ? `Call: ${state.callSid}` : "",
    state.problem ? `Issue: ${state.problem}` : "",
    state.urgencyLevel ? `Urgency: ${state.urgencyLevel}` : "",
    state.followUpPreference ? `Follow-up: ${state.followUpPreference}` : "",
    ...details,
  ].filter(Boolean);

  return sendTwilioSms(notifyTo, lines.join("\n"));
}

function businessHoursState(now = new Date()): {
  open: boolean;
  label: string;
} {
  const timeZone = env("FIT_CHECK_BUSINESS_TIMEZONE") || "America/New_York";
  const startHour = Number(env("FIT_CHECK_BUSINESS_START_HOUR") || 9);
  const endHour = Number(env("FIT_CHECK_BUSINESS_END_HOUR") || 18);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value || "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const weekdayOpen = !["Sat", "Sun"].includes(weekday);
  const open = weekdayOpen && hour >= startHour && hour < endHour;

  return {
    open,
    label: `${weekday} ${String(hour).padStart(2, "0")}:00 ${timeZone}`,
  };
}

function conversionPathForVoice(result: JsonRecord | null, state: VoiceState): {
  stage: "urgent_support" | "fit_check" | "light_review";
  label: string;
  url: string;
} {
  const resultRecord = result?.result && typeof result.result === "object"
    ? (result.result as JsonRecord)
    : null;
  const category = cleanText(resultRecord?.primary_category) || categoryNames[state.selectedEntry || "unsure"];
  const urgency = cleanText(resultRecord?.urgency_level) || state.urgencyLevel || "planned_improvement";
  const urgentUrl = cleanText(env("FIT_CHECK_URGENT_SUPPORT_URL") || env("URGENT_SUPPORT_PAYMENT_URL"), 500);
  const fitCheckUrl = cleanText(env("FIT_CHECK_BOOKING_URL") || env("FIT_CHECK_PAYMENT_URL"), 500);
  const fallbackUrl = publicFitCheckUrl();

  if (urgency === "emergency" || category === "Quick Fix") {
    return {
      stage: "urgent_support",
      label: urgentUrl ? "Start urgent support" : "Urgent support follow-up",
      url: urgentUrl || fallbackUrl,
    };
  }

  if (category === "Not Sure Yet") {
    return {
      stage: "light_review",
      label: "Human review",
      url: fallbackUrl,
    };
  }

  return {
    stage: "fit_check",
    label: fitCheckUrl ? "Book a Fit Check" : "Fit Check follow-up",
    url: fitCheckUrl || fallbackUrl,
  };
}

async function sendCallRecoverySms(params: URLSearchParams): Promise<void> {
  if (env("FIT_CHECK_RECOVERY_SMS_ENABLED") !== "true") return;
  const caller = cleanText(paramValue(params, "From") || paramValue(params, "Caller"), 80);
  if (!isE164(caller)) return;

  await sendTwilioSms(
    caller,
    `Little Fight NYC: looks like the call dropped. Finish the Fit Check here: ${publicFitCheckUrl()}`,
  );
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

  const conversion = conversionPathForVoice(result, state);
  const callerSmsEnabled = env("FIT_CHECK_CALLER_SMS_ENABLED") === "true" && isE164(cleanText(state.caller));

  if (conversion.stage === "urgent_support") {
    return callerSmsEnabled
      ? `Got it. This sounds urgent. I am alerting David and texting you the next step. This is not a quote.`
      : `Got it. This sounds urgent. I am alerting David now. This is not a quote.`;
  }

  if (conversion.stage === "fit_check") {
    return callerSmsEnabled
      ? `This sounds like a Fit Check. I am texting you the next step and sending David the useful version. This is not a quote.`
      : `This sounds like a Fit Check. I am sending David the useful version. This is not a quote.`;
  }

  if (cleanText(resultRecord?.client_facing_summary)) {
    return `Based on what you shared, this sounds like ${category}. David will review it directly. This is not a quote.`;
  }

  return `Based on what you shared, this sounds like ${category}. David will review it directly. This is not a quote.`;
}

function urgentDial(req: Request, state: VoiceState): string {
  if (state.urgencyLevel !== "emergency") return "";
  const forwardNumber = cleanText(env("FIT_CHECK_URGENT_FORWARD_NUMBER"), 80);
  if (!forwardNumber) return "";
  const hours = businessHoursState();
  const transferAfterHours = env("FIT_CHECK_TRANSFER_AFTER_HOURS") === "true";
  if (!hours.open && !transferAfterHours) {
    return say("It is outside normal hours, so I am sending the urgent alert instead of transferring the call.");
  }

  const action = absoluteUrl(req, `?step=dial_done&s=${encodeURIComponent(encodeState(state))}`);
  return [
    say("I am going to try David now. If he cannot pick up, the brief has still been captured."),
    `<Dial timeout="18" action="${escapeXml(action)}">${escapeXml(forwardNumber)}</Dial>`,
  ].join("");
}

async function handleStatusCallback(params: URLSearchParams): Promise<Response> {
  const state: VoiceState = {
    caller: cleanText(paramValue(params, "From") || paramValue(params, "Caller"), 80),
    callSid: cleanText(paramValue(params, "CallSid"), 100),
  };
  const callStatus = cleanText(paramValue(params, "CallStatus"), 80);
  const duration = Number(paramValue(params, "CallDuration") || paramValue(params, "Duration") || 0);
  const statusLabel = callStatus || "status";

  await notifyDavidBySms(`Fit Check call ${statusLabel}`, state, [
    Number.isFinite(duration) && duration > 0 ? `Duration: ${duration}s` : "",
  ]);

  const recoveryThreshold = Number(env("FIT_CHECK_RECOVERY_THRESHOLD_SECONDS") || 35);
  if (
    callStatus === "completed" &&
    Number.isFinite(duration) &&
    duration > 0 &&
    duration <= recoveryThreshold
  ) {
    await sendCallRecoverySms(params);
  }

  return new Response("", { status: 204, headers: twimlHeaders });
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

  if (step === "status") {
    return handleStatusCallback(params);
  }

  if (step === "start") {
    await notifyDavidBySms("Incoming Fit Check call", state);

    return response(
      twiml([
        gather(
          req,
          "Little Fight NYC Fit Check. I am the intake assistant. I will ask a few quick questions, summarize the call for David, and send him the brief. Do not share sensitive information. Say yes or press 1 to continue. Say no or press 2 to leave a message.",
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
            "No problem. Say your name, business, what happened, and how urgent it is.",
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
            "Say yes or press 1 to continue. Say no or press 2 to leave a message.",
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
          "Got it. What is broken, messy, expensive, or not working right now?",
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
    await notifyDavidBySms("Fit Check caller left a message", state);
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
      ? "Do not share sensitive information on this call. "
      : "";

    return response(
      twiml([
        say(`${warning}First read: ${categoryNames[state.selectedEntry]}.`),
        gather(
          req,
          "Is this affecting customers right now? Press 1 for yes. Press 2 for urgent but not a fire. Press 3 for planned cleanup. Press 4 if you are just exploring.",
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
            ? "Got it. I will treat this as urgent."
            : "Got it.",
        ),
        gather(req, questionFor(state, 0), "q1", state, { timeout: "9" }),
      ]),
    );
  }

  if (step === "q1") {
    state.q1 = input;
    return response(
      twiml([
        gather(
          req,
          "How should David follow up: text, phone, or email?",
          "followup",
          state,
          { timeout: "9" },
        ),
      ]),
    );
  }

  if (step === "followup") {
    state.followUpPreference = input;
    return response(
      twiml([
        gather(
          req,
          "Last thing. Say your name and business name.",
          "contact",
          state,
          { timeout: "9" },
        ),
      ]),
    );
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
        say("Thanks. David will review it before talking scope or pricing."),
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
