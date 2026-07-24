import { useRef, useState } from "react";
import { ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import "./WorkShowcase.css";

type Device = "desktop" | "mobile";

type Props = {
  client: string;
  slug: string;
  url: string;
  captureDate: string;
};

function domain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function capturePath(slug: string, device: Device) {
  return `/assets/case-${slug}-explore${device === "mobile" ? "-mobile" : ""}.webp`;
}

export default function LiveSiteExplorer({
  client,
  slug,
  url,
  captureDate,
}: Props) {
  const [device, setDevice] = useState<Device>(() => (
    typeof window !== "undefined" && window.matchMedia("(max-width: 620px)").matches
      ? "mobile"
      : "desktop"
  ));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const formattedCaptureDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${captureDate}T00:00:00Z`));

  function chooseDevice(next: Device) {
    if (next === device) return;
    setLoading(true);
    setLoadError(false);
    setDevice(next);
    viewportRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <section
      className="lf-work-showcase__live-site"
      aria-label={`${client} live website capture`}
    >
      <div className="lf-work-showcase__toolbar">
        <span className="lf-work-showcase__capture-meta">
          <strong className="lf-work-showcase__domain">{domain(url)}</strong>
          <span>
            Captured <time dateTime={captureDate}>{formattedCaptureDate}</time>
          </span>
        </span>
        <div
          className="lf-work-showcase__devices"
          role="group"
          aria-label="Choose capture size"
        >
          <button
            type="button"
            aria-label="Desktop preview"
            aria-pressed={device === "desktop"}
            onClick={() => chooseDevice("desktop")}
          >
            <Monitor size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            aria-label="Mobile preview"
            aria-pressed={device === "mobile"}
            onClick={() => chooseDevice("mobile")}
          >
            <Smartphone size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Mobile</span>
          </button>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open live
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>

      <div
        ref={viewportRef}
        className={`lf-work-showcase__viewport lf-work-showcase__viewport--${device}`}
        role="region"
        aria-label={`${client} ${device} website capture. Scroll inside this frame to explore.`}
        aria-busy={loading}
        tabIndex={0}
      >
        {loading && !loadError && (
          <span className="lf-work-showcase__loading" aria-live="polite">
            Loading {device} capture
          </span>
        )}
        {loadError && (
          <span className="lf-work-showcase__loading" role="alert">
            This capture could not load. The live site is still available above.
          </span>
        )}
        <img
          key={`${slug}-${device}`}
          className={loading ? "is-loading" : "is-loaded"}
          src={capturePath(slug, device)}
          alt={`${client} live website ${device} capture from ${formattedCaptureDate}`}
          width={device === "desktop" ? 1200 : 390}
          height={device === "desktop" ? 2000 : 2400}
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
