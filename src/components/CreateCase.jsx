import { useState } from "react";
import { roman } from "../lib/format.js";

const CATEGORIES = ["Keyboards", "Drones", "Retro", "Handhelds", "Audio", "Other"];

const STARTER_TERMS = [
  "Manufacturer defects — dead switches, factory soldering faults, a non-working board out of the box — are covered for 12 months from delivery.",
  "Coverage excludes physical damage, liquid ingress, misuse, and any unauthorized modification.",
];

export default function CreateCase({ account, onBack, onSubmit, busy, status }) {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("Keyboards");
  const [escrow, setEscrow] = useState("");
  const [seller, setSeller] = useState("");
  const [buyer, setBuyer] = useState("");
  const [serial, setSerial] = useState("");
  const [terms, setTerms] = useState(STARTER_TERMS);
  const [error, setError] = useState("");

  const setClause = (i, v) => setTerms((t) => t.map((x, j) => (j === i ? v : x)));
  const addClause = () => setTerms((t) => [...t, ""]);
  const removeClause = (i) => setTerms((t) => (t.length > 1 ? t.filter((_, j) => j !== i) : t));

  const submit = () => {
    setError("");
    if (!account) return setError("Connect your wallet first to fund an escrow.");
    if (!item.trim()) return setError("Give the item a name.");
    const clean = terms.map((t) => t.trim()).filter(Boolean);
    if (!clean.length) return setError("Write at least one warranty article.");
    onSubmit({
      item: item.trim(),
      category,
      serial: serial.trim() || "SN-" + Math.floor(1000 + Math.random() * 8999),
      seller: seller.trim() || account,
      buyer: buyer.trim() || account,
      escrow: escrow.replace(/[^0-9]/g, "") || "0",
      terms: clean,
    });
  };

  const previewMeta = `${seller.trim() ? seller.trim() : "Seller"} → ${buyer.trim() ? buyer.trim() : "Buyer"} · ${escrow ? `${Number(escrow).toLocaleString()} GEN` : "0 GEN"}`;

  return (
    <section className="page page--narrow">
      <button className="btn-back" onClick={onBack}>← back to docket</button>
      <div className="mono-label">Open an escrow case</div>
      <h1 className="h1-serif h1-serif--md">Draft the record</h1>

      <div className="create-grid">
        <div className="form-col">
          <div>
            <label className="field-label">Item</label>
            <input className="input" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Keychron Q1 Pro — Wireless Mechanical" />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="field-label">Category</label>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Escrow (GEN)</label>
              <input className="input" value={escrow} onChange={(e) => setEscrow(e.target.value.replace(/[^0-9]/g, ""))} placeholder="189" inputMode="numeric" />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="field-label">Seller</label>
              <input className="input" value={seller} onChange={(e) => setSeller(e.target.value)} placeholder="0x… (defaults to you)" />
            </div>
            <div>
              <label className="field-label">Buyer</label>
              <input className="input" value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="0x… (defaults to you)" />
            </div>
          </div>

          <div>
            <label className="field-label">Serial number</label>
            <input className="input input--mono" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="KQ1P-77A213" />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label className="field-label" style={{ margin: 0 }}>Warranty terms · plain language</label>
              <button className="btn-ghost-sm" onClick={addClause}>+ Article</button>
            </div>
            <div className="form-col" style={{ gap: 10 }}>
              {terms.map((val, i) => (
                <div className="clause-row" key={i}>
                  <span className="clause-roman">{roman(i + 1)}</span>
                  <textarea className="textarea" rows={2} value={val} onChange={(e) => setClause(i, e.target.value)} placeholder="Write a clause the way a human would say it…" />
                  <button className="clause-x" onClick={() => removeClause(i)}>×</button>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn-grad" onClick={submit} disabled={busy} style={{ marginTop: 6, padding: 16, borderRadius: 14 }}>
            {busy ? status || "Funding escrow…" : "Fund escrow & open case →"}
          </button>
        </div>

        <div className="cert-sticky">
          <div className="cert">
            <JusticeWatermark />
            <div className="cert-head">
              <div className="cert-kicker">CERTIFICATE OF WARRANTY</div>
              <div className="cert-item">{item.trim() || "Untitled Item"}</div>
              <div className="cert-meta">{previewMeta}</div>
            </div>
            <div className="cert-clauses">
              {terms.map((t, i) => (
                <div className="cert-row" key={i}>
                  <div className="cert-roman">Art. {roman(i + 1)}</div>
                  <div className="cert-text" style={{ color: t.trim() ? "var(--doc-ink)" : "var(--muted)" }}>
                    {t.trim() || "— clause to be written —"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const JusticeWatermark = () => (
  <div className="doc-watermark doc-watermark--bl" aria-hidden="true">
    <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="var(--accent-b)" strokeWidth="2">
      <circle cx="50" cy="50" r="46" /><line x1="50" y1="24" x2="50" y2="66" /><line x1="26" y1="36" x2="74" y2="36" />
    </svg>
  </div>
);
