# FixFair ⚖️ — Warranty & Repair-Claim Adjudicator

A full-stack GenLayer dApp on the **Bradbury testnet**. Sellers register an item + a
plain-language warranty. When a buyer files a claim, a GenLayer **Intelligent Contract**
judges the claim against those terms with an LLM and reaches validator consensus on a
verdict — **refund / partial / reject** — with no human referee.

> Why GenLayer: this needs *judgment* over unstructured text (and optional live web
> evidence), which a normal EVM smart contract cannot do. It uses
> `gl.eq_principle.prompt_non_comparative` for the subjective verdict and
> `gl.eq_principle.strict_eq` + `gl.nondet.web.get` for optional evidence fetching.

## Stack

- **Intelligent Contract** — `contracts/fixfair.py` (GenLayer GenVM, Python)
- **Deploy script** — `scripts/deploy.mjs` (Node, `genlayer-js`, signs with a private key)
- **Frontend** — React + Vite, `genlayer-js` SDK, **EVM wallet adapter** (MetaMask via `window.ethereum`)

## Prerequisites

- Node 18+ (tested on Node 24)
- An EVM wallet (MetaMask) for the browser UI
- A funded Bradbury testnet key for deployment (faucet from the GenLayer portal)

## Setup

```bash
npm install
cp .env.example .env    # then put your deploy PRIVATE_KEY inside .env
```

`.env`:

```
PRIVATE_KEY=0x...   # testnet key with Bradbury faucet funds — NEVER a mainnet key
```

## 1) Deploy the contract

```bash
npm run deploy
```

This signs with `PRIVATE_KEY`, deploys `contracts/fixfair.py` to Bradbury, waits for the
receipt, and writes the address to `src/lib/deployed.json`.

## 2) Run the frontend

```bash
npm run dev
```

Open http://localhost:5173, click **Connect wallet** (the app auto-adds the Bradbury
network to MetaMask — chainId `4221`, RPC `https://rpc-bradbury.genlayer.com`), then:

1. **Create a case** — item, seller/buyer, warranty terms, amount.
2. **File a claim** — describe the defect, optionally add an evidence URL + serial.
3. The contract adjudicates and the card shows the **verdict + reason + confidence**.

## Contract surface

| Method | Type | Purpose |
| --- | --- | --- |
| `create_case(seller, buyer, item, warranty_terms, amount)` | write | open an escrow case |
| `submit_claim(case_id, description, evidence_url, serial)` | write | adjudicate a claim (LLM + consensus) |
| `get_case(case_id)` | view | one case as JSON |
| `get_all_cases()` | view | all cases as a JSON array |

## Notes & next steps

- The escrow amount is tracked logically (state machine). Wiring real native `GEN`
  value transfers on settlement is the natural next step (`@gl.public.write.payable`
  + transfers keyed to the verdict).
- Adjudication is **text-based**. Image/vision evidence depends on the testnet model —
  prefer text descriptions or an evidence URL with readable text.
- An **appeal** flow (re-run with a stricter prompt / more validators on low confidence)
  is a good follow-up.

## Security

`.env` is gitignored. The provided key is **testnet-only**. Never reuse a deploy key for
anything with real value.
