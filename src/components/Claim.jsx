import { useState } from "react";
import { fmtAmount, roman } from "../lib/format.js";

export default function Claim({ c, onBack, onSubmit, busy, status }) {
  const [issue, setIssue] = useState("");
  const [evidence, setEvidence] = useState("");
  const [serial, setSerial] = useState("");
  const [error, setError] = useState("");

  if (!c) return null;

  const submit = () => {
    setError("");
    if (!issue.trim()) return setError("Describe what went wrong. The arbiter reads exactly what you write.");
    onSubmit({ issue: issue.trim(), evidence: evidence.trim(), serial: serial.trim() || c.serial });
  };

  return (
    <section className="page page--slim">
      <button className="btn-back" onClick={onBack}>← back to case</button>
      <div className="mono-label">File a claim · {c.ref}</div>
      <h1 className="h1-serif h1-serif--md" style={{ margin: "10px 0 6px" }}>State your grievance</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 30px" }}>
        Regarding <span style={{ color: "var(--ink)" }}>{c.item}</span>, escrow {fmtAmount(c.escrow)}.
      </p>

      <div className="form-col">
        <div>
          <label className="field-label">What went wrong?</label>
          <textarea className="textarea" rows={5} value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Describe the fault plainly. The arbiter reads exactly what you write." />
        </div>
        <div className="form-grid-2">
          <div>
            <label className="field-label">Evidence URL (optional)</label>
            <input className="input" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="field-label">Serial number</label>
            <input className="input input--mono" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder={c.serial || "SN-…"} />
          </div>
        </div>

        <div className="hint-box">
          The arbiter will read your claim against the {c.terms.length} article{c.terms.length > 1 ? "s" : ""} of this warranty.
          Try phrases like <em>“three switches stopped registering”</em> (covered) or <em>“I dropped it in water”</em> (excluded) to see the ruling change.
        </div>

        {error && <div className="form-error">{error}</div>}

        <button className="btn-grad" onClick={submit} disabled={busy} style={{ padding: 17, borderRadius: 14, fontSize: 16 }}>
          {busy ? status || "Summoning the arbiter…" : "⚖ Summon the arbiter"}
        </button>
      </div>
    </section>
  );
}
