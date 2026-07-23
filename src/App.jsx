import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Landing from "./components/Landing.jsx";
import Docket from "./components/Docket.jsx";
import Detail from "./components/Detail.jsx";
import CreateCase from "./components/CreateCase.jsx";
import Claim from "./components/Claim.jsx";
import Adjudicating from "./components/Adjudicating.jsx";
import Verdict from "./components/Verdict.jsx";
import { connectWallet, onAccountsChanged } from "./lib/wallet.js";
import { readAllCases, sendWrite, pollCases, CONTRACT_ADDRESS } from "./lib/genlayer.js";
import { joinTerms } from "./lib/format.js";

// Scripted verdict for the landing "witness a live verdict" demo (no chain).
const DEMO_VERDICT = {
  decision: "refund",
  confidence: 96,
  reason:
    "The hot-swap socket failure is a covered board fault, well within the 12-month window. No excluded cause — liquid, drops, or firmware modification — is present. Full escrow is released to the buyer.",
  amount: 189,
  ref: "FX-DEMO",
  item: "Keychron Q1 Pro — Wireless Mechanical",
};

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [screen, setScreen] = useState("landing");
  const [account, setAccount] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("open");
  const [verdict, setVerdict] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);
  const demoTimer = useRef(null);

  const selected = cases.find((c) => c.id === selectedId) || null;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const loadCases = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;
    setLoading(true);
    try {
      const list = await readAllCases();
      setCases(list.slice().reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
    onAccountsChanged(setAccount);
    return () => clearTimeout(demoTimer.current);
  }, [loadCases]);

  const flash = (msg, kind) => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 4200);
  };

  const go = (s) => {
    window.scrollTo(0, 0);
    setScreen(s);
  };

  const handleConnect = async () => {
    try {
      setAccount(await connectWallet());
    } catch (e) {
      flash(e?.message || "Could not connect wallet.", "err");
    }
  };

  const openCase = (id) => {
    setSelectedId(id);
    go("detail");
  };

  // ---- create case (real write) ----
  const submitCreate = async (form) => {
    setBusy(true);
    setStatus("");
    try {
      await sendWrite(
        account,
        "create_case",
        [form.seller, form.buyer, form.item, form.category, form.serial, joinTerms(form.terms), form.escrow],
        setStatus
      );
      setStatus("Recording on-chain…");
      const before = cases.length;
      const { cases: fresh } = await pollCases((cs) => cs.length > before, { timeoutMs: 300000 });
      setCases(fresh.slice().reverse());
      const newest = fresh[fresh.length - 1];
      flash("Case opened and escrow recorded.");
      if (newest) {
        setSelectedId(newest.id);
        go("detail");
      } else {
        go("docket");
      }
    } catch (e) {
      flash(e?.shortMessage || e?.message || "Could not open the case.", "err");
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  // ---- file claim (real write -> adjudicating -> verdict) ----
  const submitClaim = async (form) => {
    const c = selected;
    if (!c) return;
    setBusy(true);
    setStatus("");
    go("adjudicating");
    try {
      await sendWrite(account, "submit_claim", [c.id, form.issue, form.evidence, form.serial], setStatus);
      const { cases: fresh, timedOut } = await pollCases(
        (cs) => cs.find((x) => x.id === c.id)?.status === "resolved",
        { timeoutMs: 900000 }
      );
      setCases(fresh.slice().reverse());
      const resolved = fresh.find((x) => x.id === c.id);
      if (timedOut || !resolved?.verdict) {
        flash("The tribunal is taking longer than usual — check the case shortly.", "err");
        go("detail");
        return;
      }
      setVerdict({ ...resolved.verdict, ref: resolved.ref, item: resolved.item });
      go("verdict");
    } catch (e) {
      flash(e?.shortMessage || e?.message || "The claim could not be filed.", "err");
      go("detail");
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  // ---- demo / replay (scripted, no chain) ----
  const runScripted = (v) => {
    setVerdict(v);
    go("adjudicating");
    clearTimeout(demoTimer.current);
    demoTimer.current = setTimeout(() => go("verdict"), 4200);
  };
  const runDemo = () => runScripted(DEMO_VERDICT);
  const replay = (c) =>
    c?.verdict && runScripted({ ...c.verdict, ref: c.ref, item: c.item });

  return (
    <div className="shell">
      <div className="aura-bg" />
      <Header
        account={account}
        onConnect={handleConnect}
        onHome={() => go("landing")}
        onDocket={() => go("docket")}
        onCreate={() => go("create")}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <main className="main">
        {screen === "landing" && <Landing cases={cases} onRunDemo={runDemo} onDocket={() => go("docket")} />}

        {screen === "docket" && (
          <Docket
            cases={cases}
            filter={filter}
            onFilter={setFilter}
            onOpen={openCase}
            onCreate={() => go("create")}
            loading={loading}
          />
        )}

        {screen === "detail" && (
          <Detail c={selected} onBack={() => go("docket")} onClaim={() => go("claim")} onReplay={replay} />
        )}

        {screen === "create" && (
          <CreateCase account={account} onBack={() => go("docket")} onSubmit={submitCreate} busy={busy} status={status} />
        )}

        {screen === "claim" && (
          <Claim c={selected} onBack={() => go("detail")} onSubmit={submitClaim} busy={busy} status={status} />
        )}

        {screen === "adjudicating" && <Adjudicating c={selected} />}

        {screen === "verdict" && (
          <Verdict v={verdict} onViewCase={() => go("detail")} onDocket={() => go("docket")} />
        )}
      </main>

      {toast && <div className={`toast ${toast.kind === "err" ? "toast--err" : ""}`}>{toast.msg}</div>}
    </div>
  );
}
