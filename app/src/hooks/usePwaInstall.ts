import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type InstallPromptState =
  | { type: "unsupported" }
  | { type: "ios"; prompt: () => void }
  | { type: "chrome"; prompt: () => void }
  | { type: "installed" };

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // `navigator.standalone` is a non-standard iOS-only Safari property (not in the DOM lib types).
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

const STORAGE_KEY = "lf-pwa-install-dismissed";

export function usePwaInstall(): {
  state: InstallPromptState;
  dismissed: boolean;
  dismiss: () => void;
} {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  }, []);

  const promptIOS = useCallback(() => {
    // iOS has no programmatic prompt; we rely on the UI telling the user to tap Share → Add.
  }, []);

  const promptChrome = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (dismissed || isStandalone()) {
    return { state: { type: "installed" }, dismissed, dismiss };
  }

  if (deferredPrompt) {
    return { state: { type: "chrome", prompt: promptChrome }, dismissed, dismiss };
  }

  if (isIOS()) {
    return { state: { type: "ios", prompt: promptIOS }, dismissed, dismiss };
  }

  return { state: { type: "unsupported" }, dismissed, dismiss };
}
