import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap.js";
import { verdictMeta, fmtAmount, shortAddr } from "../lib/format.js";

const TABS = [
  ["open", "Open"],
  ["resolved", "Resolved"],
  ["all", "All cases"],
];

function CaseCard({ c, onOpen }) {
  const open = c.status === "open";
  const vm = c.verdict ? verdictMeta(c.verdict.decision) : null;
  return (
    <button className="case-card" data-card onClick={() => onOpen(c.id)}>
      <div className="case-card-row">
        <span className="mono-tag">{c.ref}</span>
        <span className={`status-chip ${open ? "status-chip--open" : "status-chip--resolved"}`}>
          <span className="sdot" />
          {open ? "Funded · Open" : "Resolved"}
        </span>
      </div>
      <div className="case-card-item">{c.item}</div>
      <div className="case-card-meta">
        {c.category} · {shortAddr(c.seller)} → {shortAddr(c.buyer)}
      </div>
      <div className="case-card-foot">
        <div>
          <div className="escrow-label">ESCROW</div>
          <div className="escrow-amount">{fmtAmount(c.escrow)}</div>
        </div>
        {vm && <span className="verdict-chip" style={{ color: vm.color }}>{vm.label}</span>}
      </div>
    </button>
  );
}

export default function Docket({ cases, filter, onFilter, onOpen, onCreate, loading }) {
  const gridRef = useRef(null);
  const filtered = cases.filter((c) => (filter === "all" ? true : c.status === filter));

  useEffect(() => {
    if (!gridRef.current) return;
    const els = gridRef.current.querySelectorAll("[data-card]");
    if (els.length) gsap.from(els, { y: 28, opacity: 0, stagger: 0.05, duration: 0.55, ease: "power3.out" });
  }, [filter, cases.length]);

  return (
    <section className="page">
      <div className="docket-head">
        <div>
          <div className="mono-label">The docket</div>
          <h1 className="h1-serif">Cases before the tribunal</h1>
        </div>
        <button className="btn-grad btn-grad--sm" onClick={onCreate}>+ Open a case</button>
      </div>

      <div className="filter-tabs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className={`filter-tab ${filter === key ? "filter-tab--on" : ""}`}
            onClick={() => onFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="docket-empty">
          {loading ? "Loading the docket…" : "No cases here yet. Open the first one."}
        </div>
      ) : (
        <div className="cases-grid" ref={gridRef}>
          {filtered.map((c) => (
            <CaseCard key={c.id} c={c} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
