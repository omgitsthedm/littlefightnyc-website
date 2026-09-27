import { BOOKING_HREF } from "../../../app/src/data/contact.ts";

interface AuditEmailInput {
  companyName: string;
  domain: string;
  grade: string | null;
  overallScore: number | null;
  measuredCategoryCount: number;
  auditUrl: string;
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

/** Pure, provider-free rendering shared by delivery tests and local previews. */
export function renderAuditEmail(input: AuditEmailInput) {
  const domain = input.domain.replace(/[\r\n]/g, "").slice(0, 254);
  const company = input.companyName.replace(/[\r\n]/g, "").slice(0, 100);
  const complete = input.measuredCategoryCount === 4 && input.overallScore !== null;
  const partial = !complete && input.measuredCategoryCount > 0;
  const title = complete ? "Your website check is ready."
    : partial ? "Part of your check is ready."
      : "We couldn’t complete this check.";
  const subject = `${complete ? "Your website check is ready" : partial ? "Your website check: partial results" : "Your website check couldn’t finish"} — ${domain}`.slice(0, 200);
  const intro = complete
    ? "Your mobile website check covers loading speed, search basics, accessibility, and browser best practices. The report explains the results and what to look at next."
    : partial
      ? `Google returned ${input.measuredCategoryCount} of the 4 checks. You can read those results now; an overall score needs all four.`
      : "Google’s page-testing service didn’t return measurements this time. That doesn’t mean your website is broken. There are no scores or findings to share yet.";
  const reportId = new URL(input.auditUrl).pathname.split("/").filter(Boolean).at(-1) ?? "";
  const firstLook = new URL("https://littlefightnyc.com/tech-audit/");
  firstLook.search = new URLSearchParams({ intent: "website", source: "audit-lab", url: domain, report: reportId }).toString();
  const googleCheck = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(`https://${domain}`)}`;
  const ctaHref = complete || partial ? input.auditUrl : firstLook.href;
  const ctaLabel = complete ? "See my website check" : partial ? "See the available results" : "Get a free human first look";
  const secondary = complete || partial
    ? `Want help making sense of it? Reply to this email, or <a href="${escape(BOOKING_HREF)}" target="_blank" rel="noopener noreferrer" style="color:#FFFFFF;text-decoration:underline">choose a free 30-minute conversation</a>.`
    : `Prefer to try the automated check again? <a href="${escape(googleCheck)}" target="_blank" rel="noopener noreferrer" style="color:#FFFFFF;text-decoration:underline">Open Google’s check</a>.`;
  const body = complete || partial
    ? "A score is a snapshot, not a verdict on your business. We can help you decide which changes are worth making."
    : "A real person can still look at your website and help you choose a next step. The first look is free, with no obligation.";
  const domainLink = `<a href="${escape(`https://${domain}`)}" style="color:#A1A1AA;font-weight:400;text-decoration:underline;overflow-wrap:anywhere">${escape(domain)}</a>`;
  const identity = company && company.toLowerCase() !== domain.toLowerCase()
    ? `${escape(company)}<br>${domainLink}`
    : domainLink;
  const score = complete ? `<tr><td style="padding:0 32px 28px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1A1C23;border-radius:12px"><tr><td style="padding:20px 24px"><strong style="font-size:40px;line-height:1.15;color:#FFFFFF">${input.overallScore}<span style="font-size:18px;font-weight:400;color:#A1A1AA"> / 100</span></strong><p style="margin:8px 0 0;font-size:16px;line-height:1.5;color:#A1A1AA">Average of four mobile checks${input.grade ? ` · Grade ${escape(input.grade)}` : ""}</p></td></tr></table></td></tr>` : "";
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><title>${escape(title)}</title></head>
<body style="margin:0;background:#050507;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escape(intro)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050507"><tr><td align="center" style="padding:24px 8px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px">
<tr><td style="padding:20px 32px 28px;border-top:4px solid #F97316"><a href="https://littlefightnyc.com" style="color:#FFFFFF;font-size:18px;font-weight:700;text-decoration:none">LITTLE FIGHT NYC<span style="color:#F97316">.</span></a></td></tr>
<tr><td style="padding:0 32px 24px"><p style="margin:0 0 16px;color:#A1A1AA;font-size:16px;line-height:1.5">${identity}</p><h1 style="margin:0;font-size:34px;line-height:1.14;letter-spacing:-1px;font-weight:700">${escape(title)}</h1></td></tr>
<tr><td style="padding:0 32px 24px"><p style="margin:0;font-size:18px;line-height:1.6;color:#FFFFFF">${escape(intro)}</p></td></tr>
${score}
<tr><td style="padding:0 32px 28px"><p style="margin:0;font-size:18px;line-height:1.6;color:#A1A1AA">${escape(body)}</p></td></tr>
<tr><td style="padding:0 32px 28px"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#F97316" style="border-radius:32px"><a href="${escape(ctaHref)}" style="display:inline-block;padding:16px 24px;color:#050507;font-size:16px;font-weight:700;line-height:1.3;text-decoration:none">${escape(ctaLabel)} &rarr;</a></td></tr></table></td></tr>
<tr><td style="padding:0 32px 32px"><p style="margin:0;font-size:16px;line-height:1.6;color:#A1A1AA">${secondary}</p></td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid #27272A"><p style="margin:0;font-size:16px;line-height:1.6;color:#A1A1AA">A real person replies, 9am–9pm Eastern.<br><a href="mailto:hello@littlefightnyc.com" style="color:#FFFFFF;text-decoration:none">hello@littlefightnyc.com</a></p></td></tr>
</table></td></tr></table></body></html>`;
  const text = ["LITTLE FIGHT NYC", domain, "", title, "", intro, "", complete ? `Average of four mobile checks: ${input.overallScore}/100` : "", body, "", `${ctaLabel}: ${ctaHref}`, "", complete || partial ? `Reply to this email or choose a free conversation: ${BOOKING_HREF}` : `Try Google's check: ${googleCheck}`, "", "A real person replies, 9am–9pm Eastern.", "hello@littlefightnyc.com"].filter((line, index, lines) => line || lines[index - 1]).join("\n");
  return { subject, html, text };
}
