"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    let cleanup: (() => void) | undefined;
    let frame = 0;
    const started = performance.now();

    // wait until React has hydrated the page, so GSAP never edits nodes React still owns
    const hydrated = () => {
      const el = document.querySelector("[data-load],[data-reveal]");
      return !el || Object.keys(el).some((k) => k.startsWith("__reactFiber"));
    };

    const wait = () => {
      if (hydrated()) {
        try {
          cleanup = start();
          begun = true;
        } catch (err) {
          // never leave content hidden if motion fails to start
          console.error("Motion failed to start", err);
          document.documentElement.classList.remove("motion");
        }
      } else if (performance.now() - started > 4000)
        document.documentElement.classList.remove("motion");
      else frame = requestAnimationFrame(wait);
    };
    // last resort: if motion has not begun in 5s, show the content rather than leave it hidden
    let begun = false;
    const safety = window.setTimeout(() => {
      if (!begun) document.documentElement.classList.remove("motion");
    }, 5000);
    wait();

    return () => {
      window.clearTimeout(safety);
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [pathname]);

  return null;
}

function start() {
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
      gsap.fromTo(
        el.children,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      gsap.to(el, {
        yPercent: -Number(el.dataset.parallax),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  });

  const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);

  return () => {
    window.clearTimeout(refresh);
    ctx.revert();
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}
