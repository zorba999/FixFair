import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import deployed from "./deployed.json";
import { mapCase } from "./format.js";

export const chain = testnetBradbury;
export const CONTRACT_ADDRESS = deployed.address;
export const EXPLORER = testnetBradbury.blockExplorers?.default?.url?.replace(/\/$/, "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTransient(e) {
  const msg =
    (e?.details || e?.shortMessage || e?.message || "") + JSON.stringify(e?.cause ?? "");
  return (
    msg.includes("backpressure") ||
    msg.includes("not currently accepting") ||
    msg.includes("fetch failed") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNRESET") ||
    msg.includes("An unknown RPC error")
  );
}

// Read-only client — no wallet needed.
export function getReadClient() {
  return createClient({ chain: testnetBradbury });
}

// Wallet-connected client (EVM adapter through window.ethereum).
export function getWalletClient(walletAddress) {
  return createClient({
    chain: testnetBradbury,
    account: walletAddress,
    provider: window.ethereum,
  });
}

// Read + map all cases (retries transient RPC errors).
export async function readAllCases() {
  if (!CONTRACT_ADDRESS) return [];
  const client = getReadClient();
  for (let i = 1; i <= 6; i++) {
    try {
      const res = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_all_cases",
        args: [],
      });
      const list = typeof res === "string" ? JSON.parse(res) : res;
      return Array.isArray(list) ? list.map(mapCase) : [];
    } catch (e) {
      if (isTransient(e) && i < 6) {
        await sleep(3000);
        continue;
      }
      throw e;
    }
  }
  return [];
}

// Submit a write via the connected wallet. Retries testnet congestion, returns tx hash.
export async function sendWrite(walletAddress, functionName, args, onStatus) {
  const client = getWalletClient(walletAddress);
  for (let i = 1; i <= 10; i++) {
    try {
      onStatus?.(i === 1 ? "Confirm in your wallet…" : `Network busy — retry ${i}…`);
      return await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName,
        args,
        value: 0n,
      });
    } catch (e) {
      if (isTransient(e) && i < 10) {
        await sleep(Math.min(20000, 3000 * i));
        continue;
      }
      throw e;
    }
  }
}

// Poll the on-chain case list until `predicate(cases)` passes (or timeout).
export async function pollCases(predicate, { timeoutMs = 900000, intervalMs = 7000, onTick } = {}) {
  const start = Date.now();
  let last = [];
  while (Date.now() - start < timeoutMs) {
    try {
      last = await readAllCases();
      onTick?.(last, Math.round((Date.now() - start) / 1000));
      if (predicate(last)) return { cases: last, timedOut: false };
    } catch {
      /* transient read failure — keep polling */
    }
    await sleep(intervalMs);
  }
  return { cases: last, timedOut: true };
}
