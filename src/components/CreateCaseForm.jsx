import { useState } from "react";
import { sendWrite } from "../lib/genlayer.js";

const SAMPLE_TERMS =
  "Covered: manufacturer defects for 12 months (dead switches, factory soldering faults, non-working PCB out of the box).\n" +
  "NOT covered: physical damage, liquid/water damage, misuse, unauthorized mods, or claims after 12 months.";

export default function CreateCaseForm({ account, onCreated }) {
  const [item, setItem] = useState("");
  const [seller, setSeller] = useState(account || "");
  const [buyer, setBuyer] = useState("");
  const [terms, setTerms] = useState(SAMPLE_TERMS);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!account) return setError("Connect your wallet first.");
    if (!item || !terms) return setError("Item and warranty terms are required.");
    setBusy(true);
    try {
      await sendWrite(
        account,
        "create_case",
        [seller || account, buyer || account, item, terms, amount || "0"],
        setStatus
      );
      setStatus("");
      setItem("");
      setBuyer("");
      setAmount("");
      onCreated?.();
    } catch (err) {
      setError(err?.shortMessage || err?.message || "Transaction failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Open an escrow case</h2>
      <p className="sub">Seller registers an item + warranty terms in plain language.</p>

      <label>Item</label>
      <input
        placeholder="e.g. GMMK Pro mechanical keyboard"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />

      <div className="row">
        <div>
          <label>Seller address</label>
          <input placeholder="0x… (defaults to you)" value={seller} onChange={(e) => setSeller(e.target.value)} />
        </div>
        <div>
          <label>Buyer address</label>
          <input placeholder="0x… (defaults to you)" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
        </div>
      </div>

      <label>Warranty terms (plain language)</label>
      <textarea rows={5} value={terms} onChange={(e) => setTerms(e.target.value)} />

      <label>Escrow amount (GEN, logical)</label>
      <input placeholder="e.g. 120" value={amount} onChange={(e) => setAmount(e.target.value)} />

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" disabled={busy || !account}>
          {busy ? "Creating…" : "Create case"}
        </button>
      </div>

      {status && (
        <div className="status-line">
          <span className="spinner" /> {status}
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!account && <div className="hint">Connect an EVM wallet to create a case.</div>}
    </form>
  );
}
