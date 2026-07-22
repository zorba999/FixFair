import "dotenv/config";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const hash = process.argv[2];
if (!hash) {
  console.error("usage: node scripts/receipt.mjs <txHash>");
  process.exit(1);
}

const account = createAccount(process.env.PRIVATE_KEY);
const client = createClient({ chain: testnetBradbury, account });

const receipt = await client.waitForTransactionReceipt({
  hash,
  status: TransactionStatus.ACCEPTED,
  retries: 60,
  interval: 5000,
});

const address =
  receipt?.data?.contract_address ||
  receipt?.data?.contractAddress ||
  receipt?.to_address ||
  receipt?.recipient ||
  null;

console.log("status:", receipt?.statusName ?? receipt?.status);
console.log("address:", address);
console.log("keys:", Object.keys(receipt || {}).join(", "));
console.log("data:", JSON.stringify(receipt?.data ?? {}, null, 2).slice(0, 1500));

if (address) {
  writeFileSync(
    join(root, "src", "lib", "deployed.json"),
    JSON.stringify(
      { address, chainId: testnetBradbury.id, chain: "testnetBradbury", deployTx: hash },
      null,
      2
    ) + "\n"
  );
  console.log("Wrote src/lib/deployed.json");
}
