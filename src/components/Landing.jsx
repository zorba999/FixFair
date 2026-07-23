import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, killScrollTriggers } from "../lib/gsap.js";

function Emblem() {
  return (
    <div className="emblem-wrap">
      <div className="emblem" data-emblem>
        <div className="emblem-aura" />
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: "relative" }}>
          <g className="spin-slow">
            <circle cx="50" cy="50" r="47" fill="none" stroke="url(#fxg)" strokeWidth=".7" strokeDasharray="1 5" strokeLinecap="round" />
          </g>
          <g className="spin-rev">
            <circle cx="50" cy="50" r="41" fill="none" stroke="var(--line2)" strokeWidth=".5" strokeDasharray="8 4" />
          </g>
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--line)" strokeWidth=".6" />
          <g stroke="url(#fxg)" strokeWidth="1.7" strokeLinecap="round" fill="none">
            <line x1="50" y1="24" x2="50" y2="68" /><line x1="26" y1="36" x2="74" y2="36" />
            <line x1="26" y1="36" x2="26" y2="47" /><line x1="74" y1="36" x2="74" y2="47" />
            <path d="M18 47 a8 8 0 0 0 16 0" /><path d="M66 47 a8 8 0 0 0 16 0" />
            <line x1="41" y1="68" x2="59" y2="68" />
          </g>
          <circle cx="50" cy="22" r="2.6" fill="url(#fxg)" />
        </svg>
      </div>
    </div>
  );
}

export default function Landing({ cases, onRunDemo, onDocket }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-eyebrow]", { y: 18, opacity: 0, duration: 0.5 })
        .from("[data-hero-line]", { yPercent: 110, opacity: 0, duration: 0.85, stagger: 0.1 }, "-=.2")
        .from("[data-hero-sub]", { y: 20, opacity: 0, duration: 0.6 }, "-=.4")
        .from("[data-hero-cta]", { y: 18, opacity: 0, stagger: 0.09, duration: 0.5 }, "-=.35")
        .from("[data-emblem]", { scale: 0.6, opacity: 0, rotate: -24, duration: 1.1, ease: "power4.out" }, 0.15);
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 88%" },
          y: 46, opacity: 0, duration: 0.8, ease: "power3.out",
        });
      });
    }, rootRef);
    return () => {
      ctx.revert();
      killScrollTriggers();
    };
  }, []);

  const resolved = cases.filter((c) => c.verdict);
  const openCount = cases.filter((c) => c.status === "open").length;

  return (
    <div ref={rootRef}>
      <section className="hero">
        <div>
          <div className="hero-eyebrow" data-hero-eyebrow>
            <span className="pulse-dot" />Impartial AI adjudication
          </div>
          <h1 className="hero-title">
            <span className="hero-line-mask"><span className="hero-line" data-hero-line>Every warranty</span></span>
            <span className="hero-line-mask"><span className="hero-line" data-hero-line>deserves a</span></span>
            <span className="hero-line-mask"><span className="hero-line hero-line--grad" data-hero-line>fair hearing.</span></span>
          </h1>
          <p className="hero-sub" data-hero-sub>
            FixFair holds the money in escrow and lets a neutral AI arbiter weigh each repair claim
            against the warranty's own words, then delivers a verdict you can read, question, and trust.
          </p>
          <div className="hero-ctas">
            <button className="btn-grad" data-hero-cta onClick={onRunDemo}>Witness a live verdict →</button>
            <button className="btn-pill" data-hero-cta onClick={onDocket}>Browse the docket</button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">{cases.length}</div>
              <div className="hero-stat-label">cases on the docket</div>
            </div>
            <div>
              <div className="hero-stat-num">{resolved.length}</div>
              <div className="hero-stat-label">verdicts rendered</div>
            </div>
            <div>
              <div className="hero-stat-num">{openCount}</div>
              <div className="hero-stat-label">escrows open</div>
            </div>
          </div>
        </div>
        <Emblem />
      </section>

      <section className="acts">
        <div className="acts-head" data-reveal>
          <div className="mono-label">Due process, in three acts</div>
          <h2 className="h2-serif">No screenshots to a support inbox. A record, a claim, a ruling.</h2>
        </div>
        <div className="acts-grid">
          <div className="act-card" data-reveal>
            <div className="act-roman">I</div>
            <h3>The record is written</h3>
            <p>A seller opens an escrow case: the item, the parties, the money held, and the warranty spelled out in plain language. Those words become the law of the case.</p>
          </div>
          <div className="act-card" data-reveal>
            <div className="act-roman">II</div>
            <h3>The claim is filed</h3>
            <p>When something breaks, the buyer states what went wrong, attaches evidence, and cites the serial number. No pleading to a human. Just the facts, entered into the record.</p>
          </div>
          <div className="act-card" data-reveal>
            <div className="act-roman">III</div>
            <h3>The verdict is sealed</h3>
            <p>The arbiter weighs claim against covenant and rules: refund, partial, or reject, with a written reason and a confidence score. Escrow moves the instant it's decided.</p>
          </div>
        </div>
      </section>

      <section className="showcase">
        <div className="showcase-card" data-reveal>
          <div>
            <div className="mono-label">The verdict moment</div>
            <h2>A ruling you can actually read.</h2>
            <p>Every decision arrives with its reasoning laid bare and a confidence you can weigh. If it's wrong, you can see exactly where, because the reason is written, not hidden behind a policy code.</p>
            <button className="btn-grad btn-grad--sm" onClick={onRunDemo}>Run a sample case →</button>
          </div>
          <div className="sample-verdict">
            <div className="sample-verdict-blur" />
            <div className="sample-verdict-row"><span>CASE FX-0455</span><span>96% confidence</span></div>
            <div className="sample-verdict-word">REFUND</div>
            <p>Gimbal instability falls under covered flight-control components. Logs show calm-weather use, no impact events, so no exclusion applies.</p>
            <div className="sample-verdict-foot"><span>Released to buyer</span><span style={{ color: "var(--refund)" }}>640 GEN</span></div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        FixFair · a neutral arbiter for warranty disputes · adjudicated on GenLayer, Bradbury testnet
      </footer>
    </div>
  );
}
