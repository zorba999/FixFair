import { useCallback, useEffect, useState } from "react";
import { connectWallet, onAccountsChanged, shortAddr } from "./lib/wallet.js";
import { readAllCases, CONTRACT_ADDRESS, EXPLORER, chain } from "./lib/genlayer.js";
import CreateCaseForm from "./components/CreateCaseForm.jsx";
import CaseCard from "./components/CaseCard.jsx";
import ClaimModal from "./components/ClaimModal.jsx";

export default function App() {
  const [account, setAccount] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimCase, setClaimCase] = useState(null);
  const [walletError, setWalletError] = useState("");

  const loadCases = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;
    setLoading(true);
    try {
      const list = await readAllCases();
      setCases(Array.isArray(list) ? list.reverse() : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
    onAccountsChanged(setAccount);
  }, [loadCases]);

  async function handleConnect() {
    setWalletError("");
    try {
      const addr = await connectWallet();
      setAccount(addr);
    } catch (e) {
      setWalletError(e?.message || "Could not connect wallet.");
    }
  }

  return (
    <div className="container">
      <header className="topbar">
        <div className="brand">
          <div className="logo">⚖️</div>
          <div>
            <h1>
              FixFair <span className="badge">Bradbury testnet</span>
            </h1>
            <p>Warranty &amp; repair-claim adjudicator · powered by GenLayer Intelligent Contracts</p>
          </div>
        </div>

        {account ? (
          <div className="wallet-pill">
            <span className="dot" /> {shortAddr(account)}
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleConnect}>
            Connect wallet
          </button>
        )}
      </header>

      {walletError && <div className="error" style={{ marginBottom: 16 }}>{walletError}</div>}

      {!CONTRACT_ADDRESS && (
        <div className="card" style={{ marginBottom: 22, borderColor: "var(--amber)" }}>
          <h2>Contract not deployed yet</h2>
          <p className="sub">
            Run <code>npm run deploy</code> to deploy the FixFair contract, then refresh. The address
            gets written to <code>src/lib/deployed.json</code>.
          </p>
        </div>
      )}

      <div className="grid">
        <CreateCaseForm account={account} onCreated={loadCases} />

        <div>
          <div className="section-head">
            <h2>Escrow cases</h2>
            <button className="btn btn-sm btn-ghost" onClick={loadCases} disabled={loading}>
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          <div className="cases">
            {cases.length === 0 && (
              <div className="card empty">
                {loading ? "Loading cases…" : "No cases yet. Create the first one on the left."}
              </div>
            )}
            {cases.map((c) => (
              <CaseCard key={c.id} c={c} account={account} onFileClaim={setClaimCase} />
            ))}
          </div>
        </div>
      </div>

      {claimCase && (
        <ClaimModal
          caseItem={claimCase}
          account={account}
          onClose={() => setClaimCase(null)}
          onResolved={() => {
            setClaimCase(null);
            loadCases();
          }}
        />
      )}

      <div className="footer">
        {CONTRACT_ADDRESS ? (
          <>
            Contract{" "}
            <a href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
              <code>{shortAddr(CONTRACT_ADDRESS)}</code>
            </a>{" "}
            on {chain.name}
          </>
        ) : (
          <>Not deployed</>
        )}
      </div>
    </div>
  );
}
