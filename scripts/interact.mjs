import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const deployed = JSON.parse(readFileSync(join(root, "src", "lib", "deployed.json"), "utf-8"));
const ADDRESS = deployed.address;

const account = createAccount(process.env.PRIVATE_KEY);
const client = createClient({ chain: testnetBradbury, account });
const me = account.address;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTransient(e) {
  const msg = (e?.details || e?.shortMessage || e?.message || "") + JSON.stringify(e?.cause || "");
  return (
    msg.includes("backpressure") ||
    msg.includes("not currently accepting") ||
    msg.includes("fetch failed") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNRESET") ||
    msg.includes("An unknown RPC error")
  );
}

// Submit a write and return the tx hash (retry only the submission on congestion).
async function send(functionName, args) {
  for (let i = 1; i <= 30; i++) {
    try {
      return await client.writeContract({ address: ADDRESS, functionName, args, value: 0n });
    } catch (e) {
      if (isTransient(e) && i < 30) {
        const w = Math.min(30000, 4000 * i);
        console.log(`   submit busy, retry ${i} in ${w / 1000}s…`);
        await sleep(w);
        continue;
      }
      throw e;
    }
  }
}

async function readCases() {
  for (let i = 1; i <= 15; i++) {
    try {
      const res = await client.readContract({ address: ADDRESS, functionName: "get_all_cases", args: [] });
      return typeof res === "string" ? JSON.parse(res) : res;
    } catch (e) {
      if (isTransient(e) && i < 15) {
        await sleep(4000);
        continue;
      }
      throw e;
    }
  }
  return [];
}

// Poll the contract state (via reads) until predicate passes or timeout.
async function pollUntil(predicate, { timeoutMs = 720000, intervalMs = 8000, label = "" } = {}) {
  const start = Date.now();
  let last = [];
  while (Date.now() - start < timeoutMs) {
    last = await readCases();
    if (predicate(last)) return last;
    const secs = Math.round((Date.now() - start) / 1000);
    process.stdout.write(`\r   …waiting for ${label} (${secs}s)   `);
    await sleep(intervalMs);
  }
  console.log(`\n   ! timed out waiting for ${label}`);
  return last;
}

const TERMS =
  "Covered: manufacturer defects for 12 months (dead switches, factory soldering faults, non-working PCB out of the box). " +
  "NOT covered: physical damage, liquid/water damage, misuse, unauthorized mods, or claims after 12 months.";

console.log("Contract:", ADDRESS);
console.log("Caller  :", me, "\n");

// --- ensure a keyboard case exists ---
let cases = await readCases();
if (!cases.some((c) => c.item.includes("keyboard"))) {
  console.log("create_case A (keyboard) …");
  await send("create_case", [me, me, "GMMK Pro mechanical keyboard", TERMS, "120"]);
  cases = await pollUntil((cs) => cs.some((c) => c.item.includes("keyboard")), { label: "keyboard case" });
}
// --- ensure a drone case exists ---
if (!cases.some((c) => c.item.includes("drone"))) {
  console.log("\ncreate_case B (drone) …");
  await send("create_case", [me, me, "FPV racing drone", TERMS, "300"]);
  cases = await pollUntil((cs) => cs.some((c) => c.item.includes("drone")), { label: "drone case" });
}

const kb = cases.find((c) => c.item.includes("keyboard"));
const dr = cases.find((c) => c.item.includes("drone"));

// --- adjudicate the keyboard claim (covered defect -> expect refund) ---
if (kb && kb.state === "funded") {
  console.log("\nsubmit_claim A: dead switches after 2 weeks (should be COVERED) …");
  await send("submit_claim", [
    kb.id,
    "Three switches stopped registering after two weeks of normal typing. No drops, no liquid.",
    "",
    "SN-KB-001",
  ]);
  cases = await pollUntil((cs) => cs.find((c) => c.id === kb.id)?.state === "resolved", {
    label: "keyboard verdict",
  });
}

// --- adjudicate the drone claim (physical damage -> expect reject) ---
if (dr && dr.state === "funded") {
  console.log("\nsubmit_claim B: crashed into a wall (should be REJECTED) …");
  await send("submit_claim", [
    dr.id,
    "I flew it into a wall and the frame cracked and an arm broke off.",
    "",
    "SN-DR-002",
  ]);
  cases = await pollUntil((cs) => cs.find((c) => c.id === dr.id)?.state === "resolved", {
    label: "drone verdict",
  });
}

console.log("\n\n=== FINAL VERDICTS ===");
for (const c of cases) {
  console.log(`#${c.id}  ${c.item}`);
  console.log(`   state   : ${c.state}`);
  console.log(`   verdict : ${c.verdict}`);
  console.log(`   reason  : ${c.reason}`);
  console.log(`   conf    : ${c.confidence}`);
}
