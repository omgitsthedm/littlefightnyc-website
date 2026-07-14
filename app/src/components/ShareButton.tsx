import { useCallback, useState } from "react";
import { Share2, Check } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import "./ShareButton.css";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
  className?: string;
  label?: string;
};

export default function ShareButton({
  title,
  text,
  url,
  className = "",
  label = "Share",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const haptic = useHaptic(8);

  const handleShare = useCallback(async () => {
    haptic();
    const shareData = { title, text, url };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable; do nothing.
    }
  }, [haptic, title, text, url]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`lf-share ${className}`}
      aria-label={copied ? "Link copied" : `Share ${title}`}
      title={copied ? "Copied to clipboard" : "Share"}
    >
      {copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
