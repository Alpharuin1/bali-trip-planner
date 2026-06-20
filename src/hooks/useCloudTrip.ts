import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  createCloudTrip,
  fetchCloudTrip,
  setTripInUrl,
  shareLinkFor,
  tripCodeFromUrl,
  updateCloudTrip,
  type TripSnapshot,
} from "../services/tripCloud";

export type CloudSyncStatus =
  | "local"
  | "loading"
  | "saving"
  | "saved"
  | "error";

const SAVE_DEBOUNCE_MS = 1500;

interface UseCloudTripOptions {
  snapshot: TripSnapshot;
  applySnapshot: (snapshot: TripSnapshot) => void;
  tripTitle?: string;
}

export function useCloudTrip({
  snapshot,
  applySnapshot,
  tripTitle = "Bali Trip",
}: UseCloudTripOptions) {
  const configured = isSupabaseConfigured;
  const [shareCode, setShareCode] = useState<string | null>(() =>
    tripCodeFromUrl()
  );
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() =>
    tripCodeFromUrl() ? "loading" : "local"
  );
  const [error, setError] = useState<string | null>(null);

  const readyToSave = useRef(false);
  const skipNextSave = useRef(false);
  const saveTimer = useRef<number | null>(null);

  // Load trip from URL once on mount (e.g. ?trip=CODE link).
  useEffect(() => {
    if (!configured) return;

    const codeFromUrl = tripCodeFromUrl();
    if (!codeFromUrl) return;

    let cancelled = false;
    setShareCode(codeFromUrl);
    setSyncStatus("loading");
    setError(null);

    fetchCloudTrip(codeFromUrl)
      .then((row) => {
        if (cancelled) return;
        skipNextSave.current = true;
        applySnapshot(row.payload);
        readyToSave.current = true;
        setSyncStatus("saved");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Could not load shared trip.";
        setError(message);
        setSyncStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once from URL on mount
  }, [configured]);

  // Debounced auto-save when editing a shared trip.
  useEffect(() => {
    if (!configured || !shareCode || !readyToSave.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    setSyncStatus((prev) => (prev === "error" ? "error" : "saving"));
    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(() => {
      updateCloudTrip(shareCode, snapshot)
        .then(() => {
          setError(null);
          setSyncStatus("saved");
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Could not save changes.";
          setError(message);
          setSyncStatus("error");
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [configured, shareCode, snapshot]);

  const createSharedTrip = useCallback(async () => {
    if (!configured) {
      setError("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env first.");
      return null;
    }

    setSyncStatus("saving");
    setError(null);

    try {
      const row = await createCloudTrip(tripTitle, snapshot);
      readyToSave.current = true;
      setShareCode(row.share_code);
      setTripInUrl(row.share_code);
      setSyncStatus("saved");
      return row.share_code;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not create shared trip.";
      setError(message);
      setSyncStatus("error");
      return null;
    }
  }, [configured, snapshot, tripTitle]);

  const joinTrip = useCallback(
    async (code: string) => {
      if (!configured) {
        setError("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env first.");
        return false;
      }

      const normalized = code.trim().toUpperCase();
      if (!normalized) return false;

      setSyncStatus("loading");
      setError(null);
      readyToSave.current = false;

      try {
        const row = await fetchCloudTrip(normalized);
        skipNextSave.current = true;
        applySnapshot(row.payload);
        readyToSave.current = true;
        setShareCode(row.share_code);
        setTripInUrl(row.share_code);
        setSyncStatus("saved");
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Could not join that trip.";
        setError(message);
        setSyncStatus("error");
        return false;
      }
    },
    [applySnapshot, configured]
  );

  const copyShareLink = useCallback(async () => {
    if (!shareCode) return false;
    const link = shareLinkFor(shareCode);
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch {
      window.prompt("Copy this link to share the trip:", link);
      return true;
    }
  }, [shareCode]);

  const stopSharing = useCallback(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    readyToSave.current = false;
    setShareCode(null);
    setTripInUrl(null);
    setError(null);
    setSyncStatus("local");
  }, []);

  return {
    configured,
    shareCode,
    syncStatus,
    error,
    createSharedTrip,
    joinTrip,
    copyShareLink,
    stopSharing,
  };
}
