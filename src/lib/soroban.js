// src/lib/soroban.js
import * as StellarSdk from "@stellar/stellar-sdk";
import {
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_URL,
  HORIZON_URL,
  TOKEN_ADDRESS,
} from "./config";
import { signTransaction } from "@stellar/freighter-api";

export const rpc = new StellarSdk.rpc.Server(RPC_URL, { allowHttp: false });
export const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);

const dec = new TextDecoder();
const decode = (val) => {
  if (!val) return "";
  if (val.data) return dec.decode(new Uint8Array(val.data));
  return String(val);
};

// ── Encode helpers ────────────────────────────────────────────────────────────
export const scAddress = (addr) => new StellarSdk.Address(addr).toScVal();

export const scU64 = (n) =>
  StellarSdk.xdr.ScVal.scvU64(
    StellarSdk.xdr.Uint64.fromString(String(Math.floor(Number(n))))
  );

export const scI128 = (n) => {
  const big  = BigInt(Math.floor(Number(n)));
  const mask = BigInt("0xFFFFFFFFFFFFFFFF");
  const lo   = big & mask;
  const hi   = big >> BigInt(64);
  return StellarSdk.xdr.ScVal.scvI128(
    new StellarSdk.xdr.Int128Parts({
      hi: StellarSdk.xdr.Int64.fromString(hi.toString()),
      lo: StellarSdk.xdr.Uint64.fromString(lo.toString()),
    })
  );
};

export const scString = (s) =>
  StellarSdk.xdr.ScVal.scvString(new TextEncoder().encode(s));

// ── Build + simulate + assemble ───────────────────────────────────────────────
export const buildTx = async (sourceAddress, method, args = []) => {
  const account  = await horizon.loadAccount(sourceAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim))
    throw new Error("Simulation failed: " + sim.error);

  return StellarSdk.rpc.assembleTransaction(tx, sim).build();
};

// ── Sign with Freighter + submit ──────────────────────────────────────────────
export const signAndSubmit = async (tx, address) => {
  let signedXdr;
  try {
    const result = await signTransaction(tx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      address,
    });
    signedXdr = result?.signedTxXdr ?? result;
  } catch (e) {
    const msg = (e?.message || "").toLowerCase();
    if (msg.includes("reject") || msg.includes("denied") || msg.includes("cancel")) {
      const err = new Error("Transaction rejected in Freighter.");
      err.type = "user_rejected";
      throw err;
    }
    throw e;
  }

  if (!signedXdr) {
    const err = new Error("Signing returned empty result.");
    err.type = "user_rejected";
    throw err;
  }

  const signedTx   = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await rpc.sendTransaction(signedTx);

  if (sendResult.status === "ERROR")
    throw new Error("Submission failed: " + sendResult.errorResult);

  const hash = sendResult.hash;

  // Poll for confirmation
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const poll = await rpc.getTransaction(hash);
      if (poll.status === "SUCCESS") return { hash };
      if (poll.status === "FAILED")
        throw new Error("Transaction failed on-chain: " + hash);
    } catch (e) {
      // SDK v26 throws "Bad union switch" parsing getTransaction response
      // but the tx already succeeded — return hash safely
      if (e.message?.includes("Bad union switch") ||
          e.message?.includes("union")) {
        return { hash };
      }
      throw e;
    }
  }
  return { hash };
};

// ── Read-only simulation ──────────────────────────────────────────────────────
const SIM_SOURCE = "GDB54GMX5MI5X5ETVUWPKY6JJMOHRT4KK2WM5ECR57WLPYYYN6ZCE37L";

export const simulateRead = async (method, args = []) => {
  await rpc.getLatestLedger();
  const account  = await horizon.loadAccount(SIM_SOURCE);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim))
    throw new Error("Read failed: " + sim.error);

  return sim.result?.retval;
};

// ── Parse escrow from ScVal (SDK v26 internal structure) ──────────────────────
export const parseEscrow = (scVal) => {
  if (!scVal) return null;
  try {
    const entries = scVal._value || [];

    // Get a field value by key name
    const get = (key) => {
      const entry = entries.find((e) => {
        const k = e._attributes?.key;
        const sym = k?._value;
        if (!sym) return false;
        return decode(sym) === key;
      });
      return entry?._attributes?.val;
    };

    // Decode address from internal ScVal structure
    const addrOf = (v) => {
      try {
        const inner    = v?._value;
        const addrType = inner?._switch?.name;
        if (addrType === "scAddressTypeAccount") {
          const accountId = inner?._value;
          const keyType   = accountId?._switch?.name;
          if (keyType === "publicKeyTypeEd25519") {
            const raw = accountId?._value;
            if (raw?.data) {
              return StellarSdk.StrKey.encodeEd25519PublicKey(
                new Uint8Array(raw.data)
              );
            }
          }
        }
        // Fallback — try standard XDR methods
        return StellarSdk.Address.fromScAddress(v.address?.()).toString();
      } catch { return ""; }
    };

    // amount: i128
    const amountVal   = get("amount");
    const amountParts = amountVal?._value?._attributes;
    const lo          = BigInt(amountParts?.lo?._value ?? "0");
    const hi          = BigInt(amountParts?.hi?._value ?? "0");
    const amount      = (hi << BigInt(64)) | lo;

    // id: u64
    const idVal = get("id");
    const id    = Number(idVal?._value?._value ?? 0);

    // created_at: u64
    const createdVal = get("created_at");
    const created_at = Number(createdVal?._value?._value ?? 0);

    // description: scvString (Buffer with data array)
    const descVal   = get("description");
    const descRaw   = descVal?._value;
    const description = descRaw?.data
      ? dec.decode(new Uint8Array(descRaw.data))
      : descVal?.str?.()?.toString() ?? "";

    // status: scvVec containing one scvSymbol
    // status: scvVec containing one scvSymbol
    const statusVal = get("status");
    const statusVec = statusVal?._value ?? [];
    const firstItem = statusVec[0];
    const symVal = firstItem?._value;
    let statusStr = "Active";
    if (symVal instanceof Uint8Array) {
      statusStr = dec.decode(symVal);
    } else if (symVal?.data) {
      statusStr = dec.decode(new Uint8Array(Object.values(symVal.data)));
    }
    console.log("statusStr decoded:", statusStr);

    // Map status string to display value
    let status = "Active";
    if (statusStr === "Funded")    status = "Funded";
    if (statusStr === "Completed") status = "Completed";
    if (statusStr === "Cancelled") status = "Cancelled";

    return {
      id,
      client:      addrOf(get("client")),
      freelancer:  addrOf(get("freelancer")),
      amount,
      description,
      status,
      created_at,
      token: TOKEN_ADDRESS,
    };
  } catch (e) {
    console.error("parseEscrow failed:", e.message);
    return null;
  }
};

// ── Public contract API ───────────────────────────────────────────────────────

export const getNextId = async () => {
  try {
    const retval = await simulateRead("get_next_id");
    return Number(retval?._value?._value ?? retval?.u64?.() ?? 0);
  } catch { return 0; }
};

export const getEscrow = async (escrowId) => {
  try {
    const retval = await simulateRead("get_escrow", [scU64(escrowId)]);
    const parsed = parseEscrow(retval);
    if (escrowId === 15) console.log("Escrow 15 status:", parsed?.status, "raw status vec:", JSON.stringify(retval?._value?.find(e => decode(e._attributes?.key?._value) === "status"), null, 2));
    return parsed;
  } catch (e) {
    console.error("getEscrow error id", escrowId, e.message);
    return null;
  }
};

// create_escrow(client, freelancer, token, amount: i128, description: String)
export const createEscrow = async (client, freelancer, amountStroops, description) => {
  if (!client) {
    const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e;
  }
  if (!freelancer?.trim()) {
    const e = new Error("Freelancer address required."); e.type = "invalid_input"; throw e;
  }
  if (client === freelancer.trim()) {
    const e = new Error("Client and freelancer must differ."); e.type = "invalid_input"; throw e;
  }
  if (!amountStroops || BigInt(amountStroops) <= 0n) {
    const e = new Error("Amount must be positive."); e.type = "invalid_input"; throw e;
  }

  const acc = await horizon.loadAccount(client).catch(() => null);
  if (!acc) {
    const e = new Error("Account not found. Fund via Friendbot."); e.type = "wallet_not_found"; throw e;
  }
  const xlm = parseFloat(acc.balances?.find((b) => b.asset_type === "native")?.balance ?? "0");
  if (xlm < 1) {
    const e = new Error(`Insufficient balance: ${xlm.toFixed(2)} XLM.`); e.type = "insufficient_balance"; throw e;
  }

  const tx = await buildTx(client, "create_escrow", [
    scAddress(client),
    scAddress(freelancer.trim()),
    scAddress(TOKEN_ADDRESS),
    scI128(amountStroops),
    scString(description),
  ]);
  return signAndSubmit(tx, client);
};

// fund_escrow(client, escrow_id)
export const fundEscrow = async (clientAddr, escrowId) => {
  if (!clientAddr) {
    const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e;
  }
  const tx = await buildTx(clientAddr, "fund_escrow", [
    scAddress(clientAddr),
    scU64(escrowId),
  ]);
  return signAndSubmit(tx, clientAddr);
};

// approve_escrow(client, escrow_id)
export const approveEscrow = async (clientAddr, escrowId) => {
  if (!clientAddr) {
    const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e;
  }
  const tx = await buildTx(clientAddr, "approve_escrow", [
    scAddress(clientAddr),
    scU64(escrowId),
  ]);
  return signAndSubmit(tx, clientAddr);
};

// cancel_escrow(client, escrow_id)
export const cancelEscrow = async (clientAddr, escrowId) => {
  if (!clientAddr) {
    const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e;
  }
  const tx = await buildTx(clientAddr, "cancel_escrow", [
    scAddress(clientAddr),
    scU64(escrowId),
  ]);
  return signAndSubmit(tx, clientAddr);
};