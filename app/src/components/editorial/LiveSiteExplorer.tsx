import { useRef, useState } from "react";
import { ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import "./WorkShowcase.css";

type Device = "desktop" | "mobile";

type Props = {
  client: string;
  slug: string;
  url: string;
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

export default function LiveSiteExplorer({ client, slug, url }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [loading, setLoading] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);

  function chooseDevice(next: Device) {
    if (next === device) return;
    setLoading(true);
    setDevice(next);
    viewportRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <>
      <div className="lf-work-showcase__toolbar">
        <span className="lf-work-showcase__domain">{domain(url)}</span>
        <div className="lf-work-showcase__devices" aria-label="Preview size">
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
        aria-label={`${client} ${device} site preview. Scroll this frame to explore.`}
        tabIndex={0}
      >
        {loading && <span className="lf-work-showcase__loading">Loading current capture</span>}
        <img
          key={`${slug}-${device}`}
          className={loading ? "is-loading" : "is-loaded"}
          src={capturePath(slug, device)}
          alt={`${client} live website, captured July 21, 2026`}
          width={device === "desktop" ? 1200 : 390}
          height={device === "desktop" ? 2000 : 2400}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoading(false)}
        />
      </div>
    </>
  );
}
