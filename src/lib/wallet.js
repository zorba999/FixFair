import { testnetBradbury as c } from "genlayer-js/chains";

const chainIdHex = "0x" + Number(c.id).toString(16);

export async function ensureChain() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (e) {
    const code = e?.code ?? e?.data?.originalError?.code;
    if (code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: c.name,
            nativeCurrency: c.nativeCurrency,
            rpcUrls: c.rpcUrls.default.http,
            blockExplorerUrls: [c.blockExplorers?.default?.url].filter(Boolean),
          },
        ],
      });
    } else {
      throw e;
    }
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No EVM wallet found. Install MetaMask (or another EVM wallet).");
  }
  await ensureChain();
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

export function onAccountsChanged(cb) {
  if (!window.ethereum) return;
  window.ethereum.on("accountsChanged", (accts) => cb(accts?.[0] ?? null));
}

export function shortAddr(a) {
  return a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
}
