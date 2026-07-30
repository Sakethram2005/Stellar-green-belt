// src/lib/config.js
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "CDZV25VGJDGZ4DQYTZAVC5QMIZZ5GYL4MMFA7KWPRWHQ4KLJSHIEYEG4";
export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS  ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"; // XLM SAC testnet
export const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";
export const RPC_URL       = import.meta.env.VITE_RPC_URL        ||
  "https://soroban-testnet.stellar.org";
export const HORIZON_URL   = import.meta.env.VITE_HORIZON_URL    ||
  "https://horizon-testnet.stellar.org";
export const EXPLORER_TX   = "https://stellar.expert/explorer/testnet/tx";
export const EXPLORER_CONTRACT = "https://stellar.expert/explorer/testnet/contract";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";