import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const pk = process.env.PRIVATE_KEY;
if (!pk) {
  console.error("Missing PRIVATE_KEY in .env");
  process.exit(1);
}

const account = createAccount(pk);
const client = createClient({ chain: testnetBradbury, account });

const code = readFileSync(join(root, "contracts", "fixfair.py"), "utf-8");

console.log("Network :", testnetBradbury.name, `(chainId ${testnetBradbury.id})`);
console.log("Deployer:", account.address);
console.log("Deploying FixFair ...");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function deployWithRetry(maxAttempts = 12) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      return await client.deployContract({ code, args: [], leaderOnly: false });
    } catch (e) {
      const msg = e?.details || e?.shortMessage || e?.message || "";
      const backpressure = msg.includes("backpressure") || msg.includes("not currently accepting");
      if (backpressure && i < maxAttempts) {
        const wait = Math.min(30000, 5000 * i);
        console.log(`Node busy (backpressure). Retry ${i}/${maxAttempts} in ${wait / 1000}s…`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
}

const hash = await deployWithRetry();
console.log("Deploy tx hash:", hash);

const receipt = await client.waitForTransactionReceipt({
  hash,
  status: TransactionStatus.ACCEPTED,
  retries: 200,
  interval: 5000,
});

// The deployed contract address shows up under different fields depending on
// node version, so probe the most likely ones.
const address =
  receipt?.data?.contract_address ||
  receipt?.data?.contractAddress ||
  receipt?.to_address ||
  receipt?.recipient ||
  null;

if (!address) {
  console.log("Full receipt (could not auto-detect address):");
  console.log(JSON.stringify(receipt, null, 2).slice(0, 4000));
  process.exit(1);
}

console.log("\n✅ FixFair deployed at:", address);

const out = {
  address,
  chainId: testnetBradbury.id,
  chain: "testnetBradbury",
  deployedAt: new Date().toISOString(),
  deployTx: hash,
};
writeFileSync(join(root, "src", "lib", "deployed.json"), JSON.stringify(out, null, 2) + "\n");
console.log("Wrote src/lib/deployed.json");
