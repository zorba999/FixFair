import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap.js";
import { verdictMeta, fmtAmount } from "../lib/format.js";

const RING = 339.292;

export default function Verdict({ v, onViewCase, onDocket }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!v) return;
    const meta = verdictMeta(v.decision);
    const finalOff = RING * (1 - v.confidence / 100);

    const ctx = gsap.context(() => {
      const ring = ref.current.querySelector("[data-conf-ring]");
      const num = ref.current.querySelector("[data-conf-num]");
      gsap.set(ring, { strokeDashoffset: RING });
      if (num) num.textContent = "0";

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo("[data-verdict-flash]", { opacity: 0.85 }, { opacity: 0, duration: 0.7, ease: "power2.in" })
        .from("[data-verdict-glow]", { scale: 0.4, opacity: 0, duration: 0.9 }, 0)
        .from("[data-verdict-seal]", { scale: 2.3, opacity: 0, rotate: -16, duration: 0.6, ease: "back.out(1.7)" }, 0.15)
        .to("[data-verdict-seal]", { keyframes: [{ x: -6, duration: 0.05 }, { x: 6, duration: 0.05 }, { x: -4, duration: 0.05 }, { x: 0, duration: 0.05 }] }, ">-.05")
        .from("[data-verdict-word]", { yPercent: 115, opacity: 0, duration: 0.7, ease: "power4.out" }, "-=.35")
        .to(ring, { strokeDashoffset: finalOff, duration: 1.3, ease: "power2.inOut" }, "-=.5")
        .to({ n: 0 }, { n: v.confidence, duration: 1.3, ease: "power2.inOut", onUpdate() { if (num) num.textContent = Math.round(this.targets()[0].n); } }, "<")
        .from("[data-v-el]", { y: 22, opacity: 0, stagger: 0.09, duration: 0.55 }, "-=.7");
    }, ref);
    return () => ctx.revert();
  }, [v]);

  if (!v) return null;
  const meta = verdictMeta(v.decision);

  return (
    <section className="verdict-screen" ref={ref}>
      <div className="verdict-flash" data-verdict-flash style={{ background: meta.color }} />
      <div className="verdict-glow" data-verdict-glow style={{ background: `radial-gradient(circle, ${meta.glow}, transparent 62%)` }} />

      <div className="verdict-inner">
        <div className="verdict-kicker" data-v-el>Case {v.ref} · verdict rendered</div>

        <div className="verdict-seal" data-verdict-seal>
          <svg viewBox="0 0 160 160" width="200" height="200">
            <circle cx="80" cy="80" r="54" fill="none" stroke="var(--line2)" strokeWidth="8" />
            <circle data-conf-ring cx="80" cy="80" r="54" fill="none" stroke={meta.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${RING} ${RING}`} strokeDashoffset={RING} transform="rotate(-90 80 80)" />
          </svg>
          <div className="verdict-seal-center">
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span className="conf-num" data-conf-num style={{ color: meta.color }}>0</span>
              <span className="conf-pct" style={{ color: meta.color }}>%</span>
            </div>
            <div className="conf-label">confidence</div>
          </div>
        </div>

        <div className="verdict-word-mask">
          <div className="verdict-word" data-verdict-word style={{ color: meta.color }}>{meta.label}</div>
        </div>
        <div className="verdict-sub" data-v-el>{meta.sub}</div>

        <p className="verdict-reason" data-v-el>{v.reason}</p>

        <div className="verdict-settle" data-v-el>
          <div className="settle-cell">
            <div className="fact-label">SETTLEMENT</div>
            <div className="settle-amount" style={{ color: meta.color }}>{fmtAmount(v.amount)}</div>
          </div>
          <div className="sep" />
          <div className="settle-cell">
            <div className="fact-label">ITEM</div>
            <div className="settle-item">{v.item}</div>
          </div>
        </div>

        <div className="verdict-actions" data-v-el>
          <button className="btn-pill btn-pill--sm" onClick={onViewCase}>View the case file</button>
          <button className="btn-grad btn-grad--sm" onClick={onDocket}>Return to the docket</button>
        </div>
      </div>
    </section>
  );
}
