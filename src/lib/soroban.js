// src/lib/soroban.js - v2 with dispute + deadline support
import * as StellarSdk from "@stellar/stellar-sdk";
import {
  CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL, HORIZON_URL, TOKEN_ADDRESS,
} from "./config";
import { signTransaction } from "@stellar/freighter-api";

export const rpc     = new StellarSdk.rpc.Server(RPC_URL);
export const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);

const dec    = new TextDecoder();
const decode = (val) => {
  if (!val) return "";
  if (val instanceof Uint8Array) return dec.decode(val);
  if (val.data)  return dec.decode(new Uint8Array(val.data));
  return String(val);
};

// ── Encoders ──────────────────────────────────────────────────────────────────
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

// ── Build + simulate ──────────────────────────────────────────────────────────
export const buildTx = async (sourceAddress, method, args = []) => {
  const account  = await horizon.loadAccount(sourceAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim))
    throw new Error("Simulation failed: " + sim.error);
  return StellarSdk.rpc.assembleTransaction(tx, sim).build();
};

// ── Sign + submit + poll ──────────────────────────────────────────────────────
export const signAndSubmit = async (tx, address) => {
  let signedXdr;
  try {
    const result = await signTransaction(tx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE, address,
    });
    signedXdr = result?.signedTxXdr ?? result;
  } catch (e) {
    const msg = (e?.message || "").toLowerCase();
    if (msg.includes("reject") || msg.includes("denied") || msg.includes("cancel")) {
      const err = new Error("Transaction rejected in Freighter.");
      err.type = "user_rejected"; throw err;
    }
    throw e;
  }

  if (!signedXdr) {
    const err = new Error("Signing returned empty result.");
    err.type = "user_rejected"; throw err;
  }

  const signedTx   = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await rpc.sendTransaction(signedTx);
  if (sendResult.status === "ERROR")
    throw new Error("Submission failed: " + sendResult.errorResult);

  const hash = sendResult.hash;
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const poll = await rpc.getTransaction(hash);
      if (poll.status === "SUCCESS") return { hash };
      if (poll.status === "FAILED") throw new Error("TX failed on-chain: " + hash);
    } catch (e) {
      if (e.message?.includes("Bad union switch") || e.message?.includes("union"))
        return { hash };
      throw e;
    }
  }
  return { hash };
};

// ── Read-only ─────────────────────────────────────────────────────────────────
const SIM_SOURCE = "GDB54GMX5MI5X5ETVUWPKY6JJMOHRT4KK2WM5ECR57WLPYYYN6ZCE37L";

export const simulateRead = async (method, args = []) => {
  await rpc.getLatestLedger();
  const account  = await horizon.loadAccount(SIM_SOURCE);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim))
    throw new Error("Read failed: " + sim.error);
  return sim.result?.retval;
};

// ── Parse escrow ──────────────────────────────────────────────────────────────
export const parseEscrow = (scVal) => {
  if (!scVal) return null;
  try {
    const entries = scVal._value || [];

    const get = (key) => {
      const entry = entries.find((e) => {
        const k   = e._attributes?.key;
        const sym = k?._value;
        if (!sym) return false;
        return decode(sym) === key;
      });
      return entry?._attributes?.val;
    };

    const addrOf = (v) => {
      try {
        const inner  = v?._value;
        const raw    = inner?._value?._value;
        if (raw?.data) return StellarSdk.StrKey.encodeEd25519PublicKey(new Uint8Array(raw.data));
        return StellarSdk.Address.fromScAddress(v.address?.()).toString();
      } catch { return ""; }
    };

    // amount i128
    const amountParts = get("amount")?._value?._attributes;
    const lo    = BigInt(amountParts?.lo?._value ?? "0");
    const hi    = BigInt(amountParts?.hi?._value ?? "0");
    const amount = (hi << BigInt(64)) | lo;

    // status — symbol inside vec
    const statusVec = get("status")?._value ?? [];
    const symVal    = statusVec[0]?._value;
    let statusStr   = "Active";
    if (symVal instanceof Uint8Array) statusStr = dec.decode(symVal);
    else if (symVal?.data) statusStr = dec.decode(new Uint8Array(Object.values(symVal.data)));

    let status = "Active";
    if (statusStr === "Funded")    status = "Funded";
    if (statusStr === "Completed") status = "Completed";
    if (statusStr === "Cancelled") status = "Cancelled";
    if (statusStr === "Disputed")  status = "Disputed";

    // description
    const descRaw   = get("description")?._value;
    const description = descRaw instanceof Uint8Array
      ? dec.decode(descRaw)
      : descRaw?.data
      ? dec.decode(new Uint8Array(Object.values(descRaw.data)))
      : "";

    return {
      id:          Number(get("id")?._value?._value ?? 0),
      client:      addrOf(get("client")),
      freelancer:  addrOf(get("freelancer")),
      amount,
      description,
      status,
      created_at:  Number(get("created_at")?._value?._value ?? 0),
      deadline:    Number(get("deadline")?._value?._value ?? 0),
      token:       TOKEN_ADDRESS,
    };
  } catch (e) {
    console.error("parseEscrow failed:", e.message);
    return null;
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

export const getNextId = async () => {
  try {
    const retval = await simulateRead("get_next_id");
    return Number(retval?._value?._value ?? retval?.u64?.() ?? 0);
  } catch { return 0; }
};

export const getEscrow = async (escrowId) => {
  try {
    const retval = await simulateRead("get_escrow", [scU64(escrowId)]);
    return parseEscrow(retval);
  } catch (e) {
    console.error("getEscrow error id", escrowId, e.message);
    return null;
  }
};

// create_escrow — now with deadline param (seconds, 0 = no deadline)
export const createEscrow = async (client, freelancer, amountStroops, description, deadlineSecs = 0) => {
  if (!client) { const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e; }
  if (!freelancer?.trim()) { const e = new Error("Freelancer address required."); e.type = "invalid_input"; throw e; }
  if (client === freelancer.trim()) { const e = new Error("Client and freelancer must differ."); e.type = "invalid_input"; throw e; }
  if (!amountStroops || BigInt(amountStroops) <= 0n) { const e = new Error("Amount must be positive."); e.type = "invalid_input"; throw e; }

  const acc = await horizon.loadAccount(client).catch(() => null);
  if (!acc) { const e = new Error("Account not found. Fund via Friendbot."); e.type = "wallet_not_found"; throw e; }
  const xlm = parseFloat(acc.balances?.find((b) => b.asset_type === "native")?.balance ?? "0");
  if (xlm < 1) { const e = new Error(`Insufficient balance: ${xlm.toFixed(2)} XLM.`); e.type = "insufficient_balance"; throw e; }

  const tx = await buildTx(client, "create_escrow", [
    scAddress(client),
    scAddress(freelancer.trim()),
    scAddress(TOKEN_ADDRESS),
    scI128(amountStroops),
    scString(description),
    scU64(deadlineSecs),
  ]);
  return signAndSubmit(tx, client);
};

export const fundEscrow = async (clientAddr, escrowId) => {
  if (!clientAddr) { const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e; }
  const tx = await buildTx(clientAddr, "fund_escrow", [scAddress(clientAddr), scU64(escrowId)]);
  return signAndSubmit(tx, clientAddr);
};

export const approveEscrow = async (clientAddr, escrowId) => {
  if (!clientAddr) { const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e; }
  const tx = await buildTx(clientAddr, "approve_escrow", [scAddress(clientAddr), scU64(escrowId)]);
  return signAndSubmit(tx, clientAddr);
};

export const cancelEscrow = async (clientAddr, escrowId) => {
  if (!clientAddr) { const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e; }
  const tx = await buildTx(clientAddr, "cancel_escrow", [scAddress(clientAddr), scU64(escrowId)]);
  return signAndSubmit(tx, clientAddr);
};

export const raiseDispute = async (callerAddr, escrowId) => {
  if (!callerAddr) { const e = new Error("Wallet not connected."); e.type = "wallet_not_found"; throw e; }
  const tx = await buildTx(callerAddr, "raise_dispute", [scAddress(callerAddr), scU64(escrowId)]);
  return signAndSubmit(tx, callerAddr);
};