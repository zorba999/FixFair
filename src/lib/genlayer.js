import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import deployed from "./deployed.json";

export const chain = testnetBradbury;
export const CONTRACT_ADDRESS = deployed.address;
export const EXPLORER = testnetBradbury.blockExplorers?.default?.url?.replace(/\/$/, "");

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

export async function readAllCases() {
  if (!CONTRACT_ADDRESS) return [];
  const client = getReadClient();
  const res = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_all_cases",
    args: [],
  });
  try {
    return typeof res === "string" ? JSON.parse(res) : res;
  } catch {
    return [];
  }
}

// Send a write tx through the connected wallet and wait for acceptance.
export async function sendWrite(walletAddress, functionName, args, onStatus) {
  const client = getWalletClient(walletAddress);
  onStatus?.("Waiting for wallet signature…");
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    value: 0n,
  });
  onStatus?.("Tx sent, waiting for consensus…");
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    retries: 200,
    interval: 5000,
  });
  return { txHash, receipt };
}
