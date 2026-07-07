import { useEffect, useRef } from "react";

/**
 * AmbientField — a living blue constellation behind a section. Drifting nodes
 * with faint links, a signature "atmosphere" moment. Cross-device (auto-drift,
 * no pointer dependency), capped + paused off-screen for performance, and it
 * never renders under prefers-reduced-motion (the section keeps its static wash).
 */
export default function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement as HTMLElement;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];

    function seed() {
      // Density scales with area but stays capped for perf.
      const count = Math.min(64, Math.round((width * height) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: 0.6 + Math.random() * 1.4,
      }));
    }

    function resize() {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    const LINK = 132;
    function frame() {
      ctx!.clearRect(0, 0, width, height);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.16;
            ctx!.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(96, 165, 250, 0.55)";
        ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    let raf = 0;
    let running = false;
    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // Only animate while the section is on screen and the tab is visible.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !document.hidden) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    io.observe(parent);

    const onVis = () => {
      if (document.hidden) stop();
      else if (parent.getBoundingClientRect().top < window.innerHeight) start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="lf-ambient" aria-hidden="true" />;
}
