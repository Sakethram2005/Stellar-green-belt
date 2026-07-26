// src/hooks/useEscrowList.js
import { useState, useEffect, useCallback } from "react";
import { getNextId, getEscrow } from "../lib/soroban";

export function useEscrowList(address) {
  const [escrows, setEscrows]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const total = await getNextId();
      const all = [];
      for (let i = 0; i < total; i++) {
        try {
          const e = await getEscrow(i);
          if (e) all.push(e);
        } catch { /* skip invalid */ }
      }

      // Filter to escrows involving the connected wallet
      const mine = address
        ? all.filter((e) => e.client === address || e.freelancer === address)
        : all;

      setEscrows(mine.reverse());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { load(); }, [load]);

  // Poll every 15s for real-time updates
  useEffect(() => {
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [load]);

  return { escrows, loading, error, refresh: load };
}
