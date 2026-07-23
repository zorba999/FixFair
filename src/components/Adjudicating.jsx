import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap.js";

export default function Adjudicating({ c }) {
  const ref = useRef(null);

  const lines = [
    `Loading escrow record ${c?.ref || ""}…`,
    `Parsing the warranty — ${c?.terms?.length || 0} articles indexed`,
    "Cross-referencing the claim against covered components…",
    "Testing exclusion clauses for a matching cause…",
    "Verifying serial and evidence attachments…",
    "Gathering validator opinions across the network…",
    "Reconciling toward consensus…",
    "Sealing the verdict.",
  ];

  useEffect(() => {
    const loops = [];
    const ctx = gsap.context(() => {
      gsap.from("[data-adj-emblem]", { scale: 0.7, opacity: 0, duration: 0.7, ease: "power3.out" });
      const lineEls = ref.current.querySelectorAll("[data-line]");
      gsap.set(lineEls, { opacity: 0, x: -12 });
      gsap.to(lineEls, { opacity: 1, x: 0, stagger: 0.55, duration: 0.4, ease: "power2.out" });
      loops.push(gsap.to("[data-adj-beam]", { rotation: 9, transformOrigin: "50px 34px", duration: 0.95, yoyo: true, repeat: -1, ease: "sine.inOut" }));
      loops.push(gsap.fromTo("[data-scan]", { yPercent: -120 }, { yPercent: 260, duration: 1.5, repeat: -1, ease: "none" }));
    }, ref);
    return () => {
      loops.forEach((l) => l.kill());
      ctx.revert();
    };
  }, []);

  return (
    <section className="adj-screen" ref={ref}>
      <div className="adj-emblem" data-adj-emblem>
        <div className="adj-aura" />
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: "relative" }}>
          <g className="spin-fast">
            <circle cx="50" cy="50" r="47" fill="none" stroke="url(#fxg)" strokeWidth=".8" strokeDasharray="3 6" strokeLinecap="round" />
          </g>
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--line)" strokeWidth=".6" />
          <g data-adj-beam stroke="url(#fxg)" strokeWidth="2" strokeLinecap="round" fill="none" style={{ transformOrigin: "50px 34px" }}>
            <line x1="26" y1="34" x2="74" y2="34" /><line x1="26" y1="34" x2="26" y2="45" /><line x1="74" y1="34" x2="74" y2="45" />
            <path d="M18 45 a8 8 0 0 0 16 0" /><path d="M66 45 a8 8 0 0 0 16 0" />
          </g>
          <g stroke="url(#fxg)" strokeWidth="2" strokeLinecap="round">
            <line x1="50" y1="22" x2="50" y2="68" /><line x1="41" y1="68" x2="59" y2="68" />
          </g>
          <circle cx="50" cy="20" r="3" fill="url(#fxg)" />
        </svg>
      </div>

      <div className="adj-title">
        The tribunal is deliberating<span className="d1">.</span><span className="d2">.</span><span className="d3">.</span>
      </div>

      <div className="adj-log">
        <div className="adj-scan" data-scan />
        <div className="adj-lines">
          {lines.map((ln, i) => (
            <div className="adj-line" data-line key={i}>
              <span className="caret">›</span><span>{ln}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="adj-note">On-chain LLM consensus · this can take a moment on Bradbury</div>
    </section>
  );
}
