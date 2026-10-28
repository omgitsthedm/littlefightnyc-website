# Lighthouse evidence: client case studies, 2026-10-27

Measured to support the dated Lighthouse figures published in the client case
studies (`app/preview-content/cases.json`, field `proof.lighthouse`). These are
lab measurements of each client's live homepage. They are not traffic, booking,
or revenue results and are never presented as conversion outcomes.

## Method

    npx -y lighthouse@13 <url> \
      --only-categories=performance,accessibility,best-practices,seo \
      --form-factor=mobile --screenEmulation.mobile --chrome-flags="--headless=new"

    npx -y lighthouse@13 <url> \
      --only-categories=performance,accessibility,best-practices,seo \
      --preset=desktop --chrome-flags="--headless=new"

Lighthouse 13.6.0, installed Google Chrome (headless), from a New York
residential connection, one run per form factor. The ccfilms.net mobile run
failed once with a Lighthouse trace error (NO_NAVSTART) and was re-run; the
table shows the completed run. Lighthouse varies a few points between runs;
treat each number as that day's single measurement. The case studies publish the
mobile result and link to PageSpeed Insights so a reader can re-run it.

Raw JSON reports are kept outside the repository at
`Website/_qa/case-studies-2026-10-27/lighthouse/`.

## Result

| URL | Form factor | Performance | Accessibility | Best practices | SEO | LCP | Run (UTC) |
|---|---|---|---|---|---|---|---|
| https://hairbyrachelcharles.com/ | mobile | 91 | 100 | 100 | 100 | 3.4 s | 2026-10-27T23:33Z |
| https://hairbyrachelcharles.com/ | desktop | 100 | 100 | 100 | 100 | 0.7 s | 2026-10-27T23:33Z |
| https://www.grandfundingllc.com/ | mobile | 99 | 100 | 100 | 100 | 1.7 s | 2026-10-27T23:33Z |
| https://www.grandfundingllc.com/ | desktop | 99 | 100 | 100 | 100 | 0.5 s | 2026-10-27T23:33Z |
| https://thebreakroompoolhall.com/ | mobile | 99 | 100 | 100 | 100 | 2.0 s | 2026-10-27T23:33Z |
| https://thebreakroompoolhall.com/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 2026-10-27T23:34Z |
| https://easytigerglendale.com/ | mobile | 100 | 100 | 100 | 100 | 1.8 s | 2026-10-27T23:34Z |
| https://easytigerglendale.com/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 2026-10-27T23:34Z |
| https://stepheniepowershair.com/ | mobile | 93 | 100 | 100 | 100 | 2.0 s | 2026-10-27T23:34Z |
| https://stepheniepowershair.com/ | desktop | 99 | 100 | 100 | 100 | 0.5 s | 2026-10-27T23:35Z |
| https://chromaticaz.com/ | mobile | 98 | 100 | 100 | 100 | 2.4 s | 2026-10-27T23:35Z |
| https://chromaticaz.com/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 2026-10-27T23:36Z |
| https://ccfilms.net/ | mobile | 97 | 100 | 100 | 100 | 2.1 s | 2026-10-27T23:38Z |
| https://ccfilms.net/ | desktop | 100 | 100 | 100 | 100 | 0.4 s | 2026-10-27T23:36Z |
| https://thetarothotline.com/ | mobile | 99 | 100 | 100 | 100 | 2.1 s | 2026-10-27T23:36Z |
| https://thetarothotline.com/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 2026-10-27T23:37Z |
| https://www.hirayagroup.net/ | mobile | 98 | 100 | 100 | 100 | 1.0 s | 2026-10-27T23:37Z |
| https://www.hirayagroup.net/ | desktop | 100 | 100 | 100 | 100 | 0.3 s | 2026-10-27T23:38Z |

## Re-measure when

A client site is redeployed, a published figure is questioned, or before the
next release that changes these case studies. Update this file and the
`proof.lighthouse` values together.
