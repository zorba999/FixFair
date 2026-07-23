const ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export const roman = (n) => ROMANS[n - 1] || String(n);

export const shortAddr = (a) =>
  a && a.startsWith("0x") && a.length > 12 ? a.slice(0, 6) + "…" + a.slice(-4) : a || "";

export const caseRef = (id) => "FX-" + String(id).padStart(4, "0");

export const fmtAmount = (n) => Number(n || 0).toLocaleString() + " GEN";

export function verdictMeta(decision) {
  if (decision === "refund")
    return { label: "REFUND", color: "var(--refund)", glow: "rgba(52,211,153,.4)", sub: "Claim upheld, escrow released to the buyer" };
  if (decision === "partial")
    return { label: "PARTIAL", color: "var(--partial)", glow: "rgba(251,191,36,.4)", sub: "Split remedy, escrow divided between the parties" };
  return { label: "REJECT", color: "var(--reject)", glow: "rgba(248,113,113,.4)", sub: "Claim denied, escrow returned to the seller" };
}

export function settlement(escrow, decision) {
  if (decision === "refund") return escrow;
  if (decision === "partial") return Math.round(escrow / 2);
  return 0;
}

export const joinTerms = (clauses) => clauses.map((t) => t.trim()).filter(Boolean).join("\n");

export const splitTerms = (blob) => {
  const parts = String(blob || "").split("\n").map((t) => t.trim()).filter(Boolean);
  return parts.length ? parts : [String(blob || "")];
};

// Map an on-chain case (contract JSON) to the UI model.
export function mapCase(c) {
  const escrow = Number(c.amount) || 0;
  const decision = c.verdict || null;
  return {
    id: c.id,
    ref: caseRef(c.id),
    item: c.item || "Untitled item",
    category: c.category || "Other",
    seller: c.seller || "",
    buyer: c.buyer || "",
    escrow,
    status: c.state === "resolved" ? "resolved" : "open",
    serial: c.serial || "",
    terms: splitTerms(c.warranty_terms),
    rawTerms: c.warranty_terms || "",
    claim: c.claim
      ? { issue: c.claim.description || "", evidence: c.claim.evidence_url || "", serial: c.claim.serial || "" }
      : null,
    verdict: decision
      ? {
          decision,
          confidence: Number(c.confidence) || 0,
          reason: c.reason || "",
          amount: settlement(escrow, decision),
        }
      : null,
  };
}
