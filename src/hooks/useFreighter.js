// src/hooks/useFreighter.js
import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  getAddress,
  requestAccess,
  setAllowed,
} from "@stellar/freighter-api";

export function useFreighter() {
  const [address, setAddress]     = useState(() => localStorage.getItem("escrow_address") || "");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [installed, setInstalled] = useState(true);

  // Auto-restore session
  useEffect(() => {
    isConnected().then((connected) => {
      setInstalled(!!connected);
    }).catch(() => setInstalled(false));
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await requestAccess();
      await setAllowed();
      const { address: addr } = await getAddress();
      if (!addr) throw new Error("No address returned.");
      setAddress(addr);
      localStorage.setItem("escrow_address", addr);
      return addr;
    } catch (e) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("reject") || msg.includes("denied") || msg.includes("cancel")) {
        const err = new Error("Connection rejected in Freighter.");
        err.type = "user_rejected";
        setError(err.message);
        throw err;
      }
      const err = new Error("Freighter not found. Install from freighter.app");
      err.type  = "wallet_not_found";
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress("");
    setError(null);
    localStorage.removeItem("escrow_address");
  }, []);

  return { address, loading, error, installed, connect, disconnect, isConnected: !!address };
}
