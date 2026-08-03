import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import type { CinematicMediaAsset } from "@/data/cinematic-media";
import "./CinematicMedia.css";

type Props = {
  media: CinematicMediaAsset;
  alt?: string;
  className?: string;
  fit?: "cover" | "contain";
  priority?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

/**
 * Silent inline film with an instant poster and deliberately lazy decoding.
 * Sources are stored as data attributes in prerendered HTML, then activated
 * only when the film is close to view. Reduced-motion and data-saver visitors
 * keep the same logo-free poster without downloading or decoding the video.
 */
export default function CinematicMedia({
  media,
  alt = "",
  className = "",
  fit = "cover",
  priority = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    const control = controlRef.current;
    if (!root || !video || !control) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean(
      (navigator as NavigatorWithConnection).connection?.saveData,
    );
    let motionAllowed = !motionPreference.matches && !saveData;
    let activated = false;
    let inView = false;
    let pageVisible = document.visibilityState === "visible";
    let userPaused = false;

    const syncControl = (playing: boolean) => {
      root.dataset.playing = String(playing);
      const action = playing ? "Pause" : "Play";
      control.setAttribute("aria-label", `${action} process film`);
      control.title = `${action} process film`;
    };

    const syncPlayback = () => {
      if (
        !motionAllowed
        || !activated
        || !inView
        || !pageVisible
        || userPaused
      ) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        root.dataset.autoplay = "blocked";
        syncControl(false);
      });
    };

    const activate = () => {
      if (!motionAllowed || activated) return;

      video.querySelectorAll<HTMLSourceElement>("source[data-src]").forEach((source) => {
        const sourceUrl = source.dataset.src;
        if (sourceUrl) source.src = sourceUrl;
      });
      activated = true;
      root.dataset.media = "loading";
      video.load();
      syncPlayback();
    };

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        activate();
        loadObserver.disconnect();
      },
      { rootMargin: "500px 0px", threshold: 0 },
    );

    const playbackObserver = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (inView) activate();
        syncPlayback();
      },
      { threshold: 0.08 },
    );

    const handleVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      syncPlayback();
    };

    const handleMotionPreference = () => {
      motionAllowed = !motionPreference.matches && !saveData;
      root.dataset.motion = motionAllowed ? "video" : "still";
      if (motionAllowed) {
        if (priority || inView) activate();
        syncPlayback();
      } else {
        video.pause();
        syncControl(false);
      }
    };

    const handlePlaying = () => {
      root.dataset.media = "ready";
      delete root.dataset.autoplay;
      syncControl(true);
    };

    const handlePause = () => {
      syncControl(false);
    };

    const handleError = () => {
      root.dataset.media = "failed";
      syncControl(false);
    };

    const handleControl = () => {
      if (!motionAllowed) return;

      if (!video.paused) {
        userPaused = true;
        root.dataset.userPaused = "true";
        video.pause();
        return;
      }

      userPaused = false;
      root.dataset.userPaused = "false";
      activate();
      void video.play().catch(() => {
        root.dataset.autoplay = "blocked";
        syncControl(false);
      });
    };

    root.dataset.motion = motionAllowed ? "video" : "still";
    syncControl(false);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);
    video.addEventListener("loadeddata", syncPlayback);
    control.addEventListener("click", handleControl);
    document.addEventListener("visibilitychange", handleVisibility);
    motionPreference.addEventListener("change", handleMotionPreference);
    playbackObserver.observe(root);

    if (priority) activate();
    else loadObserver.observe(root);

    return () => {
      loadObserver.disconnect();
      playbackObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionPreference.removeEventListener("change", handleMotionPreference);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadeddata", syncPlayback);
      control.removeEventListener("click", handleControl);
      video.pause();
    };
  }, [priority]);

  return (
    <div
      ref={rootRef}
      className={`lf-cinematic-media ${className}`.trim()}
      data-fit={fit}
    >
      <img
        className="lf-cinematic-media__poster"
        src={media.poster}
        alt={alt}
        width={media.width}
        height={media.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
      <video
        ref={videoRef}
        className="lf-cinematic-media__video"
        poster={media.poster}
        autoPlay
        muted
        playsInline
        loop
        preload={priority ? "auto" : "metadata"}
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
      >
        <source
          data-src={media.mobileSrc}
          media="(max-width: 639px)"
          type="video/mp4"
        />
        <source data-src={media.desktopSrc} type="video/mp4" />
      </video>
      <button
        ref={controlRef}
        className="lf-cinematic-media__control"
        type="button"
        aria-label="Play process film"
        title="Play process film"
      >
        <Play
          className="lf-cinematic-media__play"
          size={15}
          strokeWidth={2.2}
          fill="currentColor"
          aria-hidden="true"
        />
        <Pause
          className="lf-cinematic-media__pause"
          size={15}
          strokeWidth={2.2}
          fill="currentColor"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
