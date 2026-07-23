# FixFair

An AI powered warranty and repair claim adjudicator built on [GenLayer](https://genlayer.com), running on the Bradbury testnet.

Sellers open an escrow case with warranty terms written in plain language. When something breaks, the buyer files a claim. A GenLayer Intelligent Contract reads the claim against those terms, reasons with an LLM, reaches validator consensus, and returns a verdict: **refund**, **partial**, or **reject**, each with a written reason and a confidence score. No human referee.

## Why GenLayer

A normal smart contract can move money, but it cannot weigh a sentence like "three switches stopped registering" against a warranty written in human language. FixFair needs judgment over unstructured text, so it runs on GenLayer Intelligent Contracts:

- `gl.eq_principle.prompt_non_comparative` reaches consensus on the subjective verdict.
- `gl.eq_principle.strict_eq` with `gl.nondet.web.get` pulls optional evidence from the web, with no oracle.

## Features

- Escrow cases with plain language warranty terms as the "law" of each case.
- Claim filing with description, optional evidence URL, and serial number.
- On chain LLM adjudication with a written reason and a confidence score.
- A React frontend with GSAP motion, dark and light themes, and an EVM wallet adapter.

## Tech stack

| Layer | Stack |
| --- | --- |
| Intelligent Contract | Python (GenLayer GenVM) |
| Deploy and scripts | Node, `genlayer-js` |
| Frontend | React, Vite, GSAP |
| Wallet | EVM adapter via `window.ethereum` |
| Network | GenLayer Bradbury testnet (chainId 4221) |

## Contract surface

| Method | Type | Purpose |
| --- | --- | --- |
| `create_case(seller, buyer, item, category, serial, warranty_terms, amount)` | write | open an escrow case |
| `submit_claim(case_id, description, evidence_url, serial)` | write | adjudicate a claim with LLM plus consensus |
| `get_case(case_id)` | view | one case as JSON |
| `get_all_cases()` | view | all cases as a JSON array |

## Getting started

Requirements: Node 18 or newer, an EVM wallet such as MetaMask, and a Bradbury testnet key with faucet funds for deployment.

```bash
npm install
cp .env.example .env
```

Put your deploy key in `.env`:

```
PRIVATE_KEY=0x...
```

Deploy the contract. This writes the deployed address to `src/lib/deployed.json`:

```bash
npm run deploy
```

Run the frontend:

```bash
npm run dev
```

Open http://localhost:5173, connect a wallet, open a case, then file a claim to watch the adjudication.

## Project structure

```
contracts/fixfair.py     Intelligent Contract
scripts/deploy.mjs       deploy with a private key
scripts/interact.mjs     end to end test script
src/components/          Landing, Docket, Detail, Create, Claim, Adjudicating, Verdict
src/lib/genlayer.js      reads and writes to the contract
src/lib/wallet.js        EVM wallet adapter
```

## Security

`.env` is gitignored and holds a testnet only key. Never reuse a deploy key for anything with real value.
