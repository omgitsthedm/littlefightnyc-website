import { useEffect, useRef } from "react";

type Particle = {
  alpha: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canvas || reducedMotion) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pointerX = width * 0.5;
    let pointerY = height * 0.5;
    let frame = 0;

    const particles: Particle[] = [];
    const colors = ["rgba(249,115,22,", "rgba(240,242,248,", "rgba(100,116,139,"];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    for (let index = 0; index < 120; index += 1) {
      particles.push({
        alpha: Math.random() * 0.38 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        x: Math.random() * width,
        y: Math.random() * height,
      });
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        const dx = pointerX - particle.x;
        const dy = pointerY - particle.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 200) {
          particle.vx -= dx * 0.00002;
          particle.vy -= dy * 0.00002;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        particle.vx *= 0.995;
        particle.vy *= 0.995;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `${particle.color}${particle.alpha})`;
        context.fill();
      }

      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const dx = particles[first].x - particles[second].x;
          const dy = particles[first].y - particles[second].y;
          const distance = Math.hypot(dx, dy);

          if (distance < 118) {
            context.beginPath();
            context.moveTo(particles[first].x, particles[first].y);
            context.lineTo(particles[second].x, particles[second].y);
            context.strokeStyle = `rgba(249,115,22,${0.04 * (1 - distance / 118)})`;
            context.lineWidth = 0.5;
            context.stroke();
          }
        }
      }

      frame = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}
