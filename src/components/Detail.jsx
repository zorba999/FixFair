import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap.js";
import { verdictMeta, fmtAmount, shortAddr, roman } from "../lib/format.js";

const JusticeWatermark = ({ className }) => (
  <div className={className} aria-hidden="true">
    <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="var(--accent-b)" strokeWidth="2">
      <circle cx="50" cy="50" r="46" /><line x1="50" y1="24" x2="50" y2="66" /><line x1="26" y1="36" x2="74" y2="36" />
    </svg>
  </div>
);

export default function Detail({ c, onBack, onClaim, onReplay }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll("[data-reveal]");
    if (els.length) gsap.from(els, { y: 26, opacity: 0, stagger: 0.07, duration: 0.55, ease: "power3.out" });
  }, [c?.id]);

  if (!c) return null;
  const open = c.status === "open";
  const vm = c.verdict ? verdictMeta(c.verdict.decision) : null;

  return (
    <section className="page page--narrow" ref={ref}>
      <button className="btn-back" onClick={onBack}>← back to docket</button>

      <div className="detail-head">
        <div>
          <span className="mono-tag">{c.ref} · {c.category}</span>
          <h1 className="detail-title">{c.item}</h1>
          <div className="detail-sub">{shortAddr(c.seller)} → {shortAddr(c.buyer)}</div>
        </div>
        <span className={`status-chip status-chip--lg ${open ? "status-chip--open" : "status-chip--resolved"}`}>
          <span className="sdot" />{open ? "Funded · Open" : "Resolved"}
        </span>
      </div>

      <div className="detail-grid">
        <div className="doc-card" data-reveal>
          <JusticeWatermark className="doc-watermark" />
          <div className="mono-label">⎯ The warranty · the law of this case</div>
          <div className="articles">
            {c.terms.map((t, i) => (
              <div className="article-row" key={i}>
                <div className="article-roman">Art. {roman(i + 1)}</div>
                <div className="article-text">{t}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-col">
          <div className="facts-card" data-reveal>
            <div className="mono-label mono-label--muted">Case facts</div>
            <div className="facts-grid">
              <div><div className="fact-label">ESCROW HELD</div><div className="fact-serif">{fmtAmount(c.escrow)}</div></div>
              <div><div className="fact-label">SERIAL</div><div className="fact-mono">{c.serial || "—"}</div></div>
              <div><div className="fact-label">SELLER</div><div className="fact-plain">{shortAddr(c.seller)}</div></div>
              <div><div className="fact-label">BUYER</div><div className="fact-plain">{shortAddr(c.buyer)}</div></div>
            </div>
          </div>

          {c.claim?.issue && (
            <div className="facts-card" data-reveal>
              <div className="mono-label mono-label--muted">The claim on record</div>
              <p style={{ margin: "14px 0 0", lineHeight: 1.6, color: "var(--ink)" }}>“{c.claim.issue}”</p>
            </div>
          )}

          {open && (
            <div className="claim-cta-card" data-reveal>
              <h3>Something broke?</h3>
              <p>File a claim and the arbiter will weigh it against the warranty above.</p>
              <button className="btn-grad btn-full" onClick={onClaim}>File a claim →</button>
            </div>
          )}

          {vm && (
            <div className="verdict-card" data-reveal style={{ borderColor: vm.color }}>
              <div className="verdict-card-blur" style={{ background: vm.color }} />
              <div className="mono-label mono-label--muted">Verdict rendered</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "12px 0 6px" }}>
                <span className="verdict-card-word" style={{ color: vm.color }}>{vm.label}</span>
                <span className="mono-tag">{c.verdict.confidence}% confidence</span>
              </div>
              <p>{c.verdict.reason}</p>
              <div className="verdict-card-foot">
                <span>Settlement</span>
                <span style={{ color: vm.color }}>{fmtAmount(c.verdict.amount)}</span>
              </div>
              <button className="btn-replay" onClick={() => onReplay(c)}>↺ Replay the ruling</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
