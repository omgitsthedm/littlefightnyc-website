import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import type { CaseCaptureDevice, CaseFeatureProof } from "@/data/site-cases";
import "./LiveSiteExplorer.css";

type Props = {
  client: string;
  slug: string;
  url?: string;
  captureDate: string;
  devices?: CaseCaptureDevice[];
  featureProof?: CaseFeatureProof;
};

const DEVICE_LABELS: Record<CaseCaptureDevice, string> = {
  desktop: "Desktop",
  tablet: "iPad",
  mobile: "Mobile",
};

const DEVICE_DIMENSIONS: Record<
  CaseCaptureDevice,
  { width: number; height: number }
> = {
  desktop: { width: 1200, height: 2000 },
  tablet: { width: 1024, height: 2400 },
  mobile: { width: 390, height: 2400 },
};

const DEVICE_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

const DEVICE_SUFFIXES: Record<CaseCaptureDevice, string> = {
  desktop: "",
  tablet: "-tablet",
  mobile: "-mobile",
};

const DEVICE_CONTEXTS: Record<CaseCaptureDevice, string> = {
  desktop: "a wide desktop",
  tablet: "a touch-first iPad",
  mobile: "a phone in one hand",
};

function formatList(items: string[]) {
  if (items.length < 2) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function domain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function capturePath(slug: string, device: CaseCaptureDevice) {
  return `/assets/case-${slug}-explore${DEVICE_SUFFIXES[device]}.webp`;
}

export default function LiveSiteExplorer({
  client,
  slug,
  url,
  captureDate,
  devices = ["desktop", "mobile"],
  featureProof,
}: Props) {
  const initialDevice = (
    typeof window !== "undefined"
      && window.matchMedia("(max-width: 620px)").matches
      && devices.includes("mobile")
  )
    ? "mobile"
    : devices[0] ?? "desktop";
  const [device, setDevice] = useState<CaseCaptureDevice>(initialDevice);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const formattedCaptureDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${captureDate}T00:00:00Z`));
  const dimensions = DEVICE_DIMENSIONS[device];
  const conditionCount = ["Zero", "One", "Two", "Three"][devices.length]
    ?? String(devices.length);

  function chooseDevice(next: CaseCaptureDevice) {
    if (next === device) return;
    setLoading(true);
    setLoadError(false);
    setDevice(next);
    viewportRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <section
      className="lf-live-explorer"
      data-live-site-explorer
      aria-label={`${client} responsive website proof`}
    >
      <div className="lf-live-explorer__stage">
        <header className="lf-live-explorer__stage-copy">
          <span>Responsive field test</span>
          <strong>One website. {conditionCount} real conditions.</strong>
          <p>
            Separate captures show how the same system behaves on{" "}
            {formatList(devices.map((entry) => DEVICE_CONTEXTS[entry]))}.
          </p>
        </header>

        <div
          className="lf-live-explorer__device-set"
          data-device-count={devices.length}
          aria-label={`${client} captured on ${devices.map((entry) => DEVICE_LABELS[entry]).join(", ")}`}
        >
          {devices.map((entry) => {
            const entryDimensions = DEVICE_DIMENSIONS[entry];

            return (
              <figure
                className={`lf-live-explorer__device lf-live-explorer__device--${entry}`}
                key={entry}
              >
                <div className="lf-live-explorer__device-chrome" aria-hidden="true">
                  <span />
                </div>
                <div className="lf-live-explorer__device-screen">
                  <img
                    src={capturePath(slug, entry)}
                    alt=""
                    width={entryDimensions.width}
                    height={entryDimensions.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>
                  <span>{DEVICE_LABELS[entry]}</span>
                  <strong>
                    {entry === "desktop"
                      ? "The full first impression"
                      : entry === "tablet"
                        ? "Touch, distance, and rhythm"
                        : "The one-hand path"}
                  </strong>
                </figcaption>
              </figure>
            );
          })}
        </div>

      </div>

      <div className="lf-live-explorer__toolbar">
        <span className="lf-live-explorer__capture-meta">
          <strong className="lf-live-explorer__domain">
            {url ? domain(url) : client}
          </strong>
          <span>
            {url ? "Custom-domain capture" : "Case-study capture"} ·{" "}
            <time dateTime={captureDate}>{formattedCaptureDate}</time>
            {featureProof && (
              <>
                {" · "}Verified live{" "}
                <time dateTime={featureProof.verifiedAt}>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(`${featureProof.verifiedAt}T00:00:00Z`))}
                </time>
              </>
            )}
          </span>
        </span>
        <div
          className="lf-live-explorer__devices"
          role="group"
          aria-label="Choose full-page capture size"
        >
          {devices.map((entry) => {
            const Icon = DEVICE_ICONS[entry];

            return (
              <button
                type="button"
                aria-label={`${DEVICE_LABELS[entry]} preview`}
                aria-pressed={device === entry}
                onClick={() => chooseDevice(entry)}
                key={entry}
              >
                <Icon
                  size={entry === "mobile" ? 16 : 17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>{DEVICE_LABELS[entry]}</span>
              </button>
            );
          })}
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            data-lf-event={featureProof ? "portfolio_live_source" : undefined}
            data-lf-label={featureProof ? slug : undefined}
          >
            {featureProof ? `Visit ${featureProof.sourceLabel}` : "Open live"}
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        )}
      </div>

      <div
        ref={viewportRef}
        className={`lf-live-explorer__viewport lf-live-explorer__viewport--${device}`}
        role="region"
        aria-label={`${client} ${DEVICE_LABELS[device]} website capture. Scroll inside this frame to explore.`}
        aria-busy={loading}
        tabIndex={0}
      >
        {loading && !loadError && (
          <span className="lf-live-explorer__loading" aria-live="polite">
            Loading {DEVICE_LABELS[device]} capture
          </span>
        )}
        {loadError && (
          <span className="lf-live-explorer__loading" role="alert">
            This capture could not load.
            {url ? " The live site is still available above." : ""}
          </span>
        )}
        <img
          key={`${slug}-${device}`}
          className={loading ? "is-loading" : "is-loaded"}
          src={capturePath(slug, device)}
          alt={`${client} website ${DEVICE_LABELS[device]} capture from ${formattedCaptureDate}`}
          width={dimensions.width}
          height={dimensions.height}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setLoadError(true);
          }}
        />
      </div>
    </section>
  );
}
