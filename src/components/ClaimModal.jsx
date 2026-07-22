import { useState } from "react";
import { sendWrite } from "../lib/genlayer.js";

export default function ClaimModal({ caseItem, account, onClose, onResolved }) {
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [serial, setSerial] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!description) return setError("Describe the defect.");
    setBusy(true);
    try {
      await sendWrite(
        account,
        "submit_claim",
        [caseItem.id, description, evidenceUrl, serial],
        setStatus
      );
      onResolved?.();
    } catch (err) {
      setError(err?.shortMessage || err?.message || "Adjudication failed.");
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={busy ? undefined : onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>File a claim — {caseItem.item}</h2>
        <p className="sub">
          The Intelligent Contract will judge this against the warranty terms and reach validator
          consensus on the verdict.
        </p>

        <label>What went wrong?</label>
        <textarea
          rows={4}
          placeholder="e.g. Three switches stopped registering after 2 weeks of normal use."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Evidence URL (optional)</label>
        <input
          placeholder="https://… (product page, repair log, listing)"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
        />

        <label>Serial number (optional)</label>
        <input placeholder="SN-…" value={serial} onChange={(e) => setSerial(e.target.value)} />

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Adjudicating…" : "Submit for adjudication"}
          </button>
        </div>

        {status && (
          <div className="status-line">
            <span className="spinner" /> {status}
          </div>
        )}
        {busy && !status && (
          <div className="hint">The LLM verdict runs on-chain — this can take a minute.</div>
        )}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
