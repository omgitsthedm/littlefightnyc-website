# Little Fight Fit Check Voice Setup

This is the production wiring guide for the Twilio voice intake POC.

## Live Webhook

Use this Twilio Voice webhook:

`https://littlefightnyc.com/api/fit-check/voice`

Method:

`POST`

Fallback URL:

`https://littlefightnyc.com/api/fit-check/voice`

## What It Does

1. Answers as the Little Fight NYC Fit Check intake assistant.
2. Discloses AI transcription/summary and asks consent.
3. If the caller says no, captures a short non-AI message.
4. If the caller says yes, collects:
   - issue description
   - urgency
   - 1 adaptive context answer
   - preferred follow-up method
   - name and business
5. Posts the completed call into the same Fit Check backend used by the website.
6. Submits a Netlify Forms backup record.
7. If urgent and configured, tries to dial David.

## Required Twilio Setup

1. Buy or choose a Twilio phone number with Voice support.
2. In Twilio Console, open the number.
3. Set **A call comes in** to:
   - Webhook
   - `https://littlefightnyc.com/api/fit-check/voice`
   - HTTP `POST`
4. Optional but recommended: set the fallback URL to the same endpoint.
5. Test by calling the Twilio number directly.
6. After direct testing works, forward the Google Voice number to the Twilio number.

## Netlify Environment Variables

Set these in Netlify for stronger production behavior.

Required for signed Twilio webhook validation:

`TWILIO_AUTH_TOKEN`

Recommended while the trial number is being tested:

`TWILIO_PUBLIC_VOICE_URL`

Set to:

`https://littlefightnyc.com/api/fit-check/voice`

Temporary trial fallback when Twilio's real inbound request shape fails strict signature validation:

`TWILIO_ACCOUNT_SID`

`TWILIO_ALLOW_SIGNATURE_FALLBACK`

Set `TWILIO_ALLOW_SIGNATURE_FALLBACK` to `true` only during trial testing, then remove it after token rotation and strict validation is confirmed.

Optional urgent transfer number:

`FIT_CHECK_URGENT_FORWARD_NUMBER`

Use E.164 format, for example:

`+16463600318`

Optional voice tuning:

`TWILIO_TTS_VOICE`

Default:

`Polly.Matthew-Neural`

`TWILIO_TTS_LANGUAGE`

Default:

`en-US`

`TWILIO_TTS_RATE`

Default:

`106%`

Optional AI/backend upgrades already supported by the web Fit Check:

`OPENAI_API_KEY`

`OPENAI_MODEL`

`SUPABASE_URL`

`SUPABASE_SERVICE_ROLE_KEY`

Notification email:

`RESEND_API_KEY`

`FIT_CHECK_NOTIFY_EMAIL`

`FIT_CHECK_EMAIL_FROM`

Without these, the backend still returns a result and submits the Netlify Forms backup, but David will not receive function-sent email alerts for every completed call.

## Google Voice Strategy

Google Voice remains the public-facing number if desired.

Use Google Voice for:

- public number continuity
- manual calls
- voicemail fallback
- forwarding

Use Twilio for:

- programmable answering
- speech gathering
- AI intake
- urgent routing
- webhook integrations

## Test Script

Direct webhook health check:

```bash
curl https://littlefightnyc.com/api/fit-check/voice?step=health
```

Simulate the opening Twilio call:

```bash
curl -X POST https://littlefightnyc.com/api/fit-check/voice \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'From=%2B16465550123&CallSid=TESTCALL'
```

That should return TwiML with the consent prompt.

## Current Limits

- This is not streaming speech-to-speech Realtime yet.
- It is a Twilio speech-gathering intake flow.
- The caller flow is intentionally short: consent, issue, urgency, one context question, preferred follow-up, contact.
- Email spelling by voice is intentionally avoided.
- Caller ID is used as the phone contact when available.
- A human still reviews before scope, timeline, or pricing is confirmed.
