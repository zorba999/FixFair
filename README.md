# FixFair

An AI powered warranty and repair claim adjudicator built on [GenLayer](https://genlayer.com), running on the Bradbury testnet.

Sellers open an escrow case with warranty terms written in plain language. When something breaks, the buyer files a claim. A GenLayer Intelligent Contract reads the claim against those terms, reasons with an LLM, reaches validator consensus, and returns a verdict: **refund**, **partial**, or **reject**, each with a written reason and a confidence score. No human referee.

## Why GenLayer

A normal smart contract can move money, but it cannot weigh a sentence like "three switches stopped registering" against a warranty written in human language. FixFair needs judgment over unstructured text, so it runs on GenLayer Intelligent Contracts:

- `gl.eq_principle.prompt_non_comparative` reaches consensus on the subjective verdict.
- `gl.eq_principle.strict_eq` with `gl.nondet.web.get` pulls optional evidence from the web, with no oracle.

## Contract surface

| Method | Type | Purpose |
| --- | --- | --- |
| `create_case(seller, buyer, item, category, serial, warranty_terms, amount)` | write | open an escrow case |
| `submit_claim(case_id, description, evidence_url, serial)` | write | adjudicate a claim with LLM plus consensus |
| `get_case(case_id)` | view | one case as JSON |
| `get_all_cases()` | view | all cases as a JSON array |
