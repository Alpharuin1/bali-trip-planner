import { supabase } from "../lib/supabase";
import type { Plan } from "../types";

export interface TripSnapshot {
  plans: Record<string, Plan>;
  planOrder: string[];
  activeTemplate: string;
}

export interface CloudTripRow {
  share_code: string;
  title: string;
  payload: TripSnapshot;
  updated_at: string;
}

function normalizeShareCode(code: string): string {
  return code.trim().toUpperCase();
}

export function newShareCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function shareLinkFor(code: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("trip", normalizeShareCode(code));
  url.hash = "";
  return url.toString();
}

export function setTripInUrl(code: string | null): void {
  const url = new URL(window.location.href);
  if (code) url.searchParams.set("trip", normalizeShareCode(code));
  else url.searchParams.delete("trip");
  url.hash = "";
  window.history.replaceState({}, "", url.toString());
}

export function tripCodeFromUrl(): string | null {
  const code = new URLSearchParams(window.location.search).get("trip");
  return code ? normalizeShareCode(code) : null;
}

export async function createCloudTrip(
  title: string,
  snapshot: TripSnapshot
): Promise<CloudTripRow> {
  if (!supabase) throw new Error("Supabase is not configured");

  const share_code = newShareCode();
  const { data, error } = await supabase
    .from("trips")
    .insert({ share_code, title, payload: snapshot })
    .select("share_code, title, payload, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CloudTripRow;
}

export async function fetchCloudTrip(shareCode: string): Promise<CloudTripRow> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("trips")
    .select("share_code, title, payload, updated_at")
    .eq("share_code", normalizeShareCode(shareCode))
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Trip not found — check the share code or link.");
  return data as CloudTripRow;
}

export async function updateCloudTrip(
  shareCode: string,
  snapshot: TripSnapshot
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase
    .from("trips")
    .update({
      payload: snapshot,
      updated_at: new Date().toISOString(),
    })
    .eq("share_code", normalizeShareCode(shareCode));

  if (error) throw new Error(error.message);
}
