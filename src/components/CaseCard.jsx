import { shortAddr } from "../lib/wallet.js";

const VERDICT_LABEL = {
  refund: "Refund the buyer",
  partial: "Partial refund",
  reject: "Claim rejected",
};

export default function CaseCard({ c, account, onFileClaim }) {
  const resolved = c.state === "resolved";
  const canClaim = c.state === "funded" && !!account;

  return (
    <div className="case">
      <div className="case-top">
        <div>
          <h3>{c.item || "Untitled item"}</h3>
          <div className="meta">
            <span>#{c.id}</span>
            <span>seller {shortAddr(c.seller)}</span>
            <span>buyer {shortAddr(c.buyer)}</span>
            {c.amount ? <span>{c.amount} GEN</span> : null}
          </div>
        </div>
        <span className={`state ${c.state}`}>{c.state}</span>
      </div>

      <div className="terms">{c.warranty_terms}</div>

      {c.claim?.description && (
        <div className="claim-desc">“{c.claim.description}”</div>
      )}

      {resolved && c.verdict && (
        <div className={`verdict-box ${c.verdict}`}>
          <div className="verdict-title">
            <span className={`v-${c.verdict}`}>⚖️ {VERDICT_LABEL[c.verdict] || c.verdict}</span>
          </div>
          {c.reason && <p>{c.reason}</p>}
          {c.confidence != null && <div className="conf">Confidence: {c.confidence}/100</div>}
        </div>
      )}

      {canClaim && (
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-sm" onClick={() => onFileClaim(c)}>
            File a warranty claim
          </button>
        </div>
      )}
    </div>
  );
}
