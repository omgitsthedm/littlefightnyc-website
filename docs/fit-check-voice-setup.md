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
7. Routes the lead toward urgent support, a Fit Check, or light review.
8. If urgent and configured, tries to dial David during business hours.
9. Sends SMS alerts and caller follow-up links when Twilio notification env vars are configured.

## Required Twilio Setup

1. Buy or choose a Twilio phone number with Voice support.
2. In Twilio Console, open the number.
3. Set **A call comes in** to:
   - Webhook
   - `https://littlefightnyc.com/api/fit-check/voice`
   - HTTP `POST`
4. Optional but recommended: set the fallback URL to the same endpoint.
5. Set the status callback URL to:
   - `https://littlefightnyc.com/api/fit-check/voice?step=status`
   - HTTP `POST`
6. Test by calling the Twilio number directly.
7. After direct testing works, forward the Google Voice number to the Twilio number.

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

Notification and recovery SMS:

`TWILIO_NOTIFY_FROM`

Usually the Twilio number in E.164 format.

`TWILIO_NOTIFY_TO`

David's phone number in E.164 format. While the Twilio account is in trial mode, this number must be verified in Twilio.

`FIT_CHECK_CALLER_SMS_ENABLED`

Set to `true` to text callers their next-step link after completed voice Fit Checks.

`FIT_CHECK_RECOVERY_SMS_ENABLED`

Set to `true` to text short abandoned callers a recovery link.

`FIT_CHECK_RECOVERY_THRESHOLD_SECONDS`

Default: `35`

Business hours and urgent transfer:

`FIT_CHECK_BUSINESS_TIMEZONE`

Default: `America/New_York`

`FIT_CHECK_BUSINESS_START_HOUR`

Default: `9`

`FIT_CHECK_BUSINESS_END_HOUR`

Default: `18`

`FIT_CHECK_TRANSFER_AFTER_HOURS`

Set to `true` if urgent calls should try David even outside business hours.

Conversion links:

`FIT_CHECK_URL`

Default: `https://littlefightnyc.com/fit-check/`

`FIT_CHECK_BOOKING_URL`

Used for normal Fit Check follow-up links.

`FIT_CHECK_PAYMENT_URL`

Optional payment/deposit link for Fit Check.

`FIT_CHECK_URGENT_SUPPORT_URL`

Used for urgent support follow-up links.

`URGENT_SUPPORT_PAYMENT_URL`

Optional payment/deposit link for urgent support.

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
- Completed calls can send David an internal SMS and text callers a next-step link when notification env vars are configured.
- Short abandoned calls can receive a recovery SMS when status callbacks and recovery SMS are enabled.
- Email spelling by voice is intentionally avoided.
- Caller ID is used as the phone contact when available.
- A human still reviews before scope, timeline, or pricing is confirmed.
