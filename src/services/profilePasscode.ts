import { supabase } from "../lib/supabase";
import type { PersonalProfile } from "../types";
import {
  hashProfilePasscode,
  normalizeShareCode,
  passcodeMatchesHash,
} from "../utils/profilePasscode";

export async function fetchProtectedProfileIds(shareCode: string): Promise<Set<string>> {
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("profile_passcodes")
    .select("profile_id")
    .eq("share_code", normalizeShareCode(shareCode));

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.profile_id));
}

export function applyPasscodeFlagsToProfiles(
  profiles: Record<string, PersonalProfile>,
  protectedIds: Set<string>
): Record<string, PersonalProfile> {
  const out: Record<string, PersonalProfile> = {};
  for (const [id, profile] of Object.entries(profiles)) {
    if (protectedIds.has(id) || profile.hasPasscode) {
      out[id] = { ...profile, hasPasscode: true };
    } else {
      out[id] = profile;
    }
  }
  return out;
}

export async function saveProfilePasscode(
  shareCode: string,
  profileId: string,
  pin: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const passcode_hash = await hashProfilePasscode(shareCode, profileId, pin);
  const normalized = normalizeShareCode(shareCode);

  const { error } = await supabase.from("profile_passcodes").upsert(
    {
      share_code: normalized,
      profile_id: profileId,
      passcode_hash,
    },
    { onConflict: "share_code,profile_id" }
  );

  if (error) throw new Error(error.message);
}

export async function deleteProfilePasscode(
  shareCode: string,
  profileId: string
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from("profile_passcodes")
    .delete()
    .eq("share_code", normalizeShareCode(shareCode))
    .eq("profile_id", profileId);

  if (error) throw new Error(error.message);
}

export async function fetchProfilePasscodeHash(
  shareCode: string,
  profileId: string
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profile_passcodes")
    .select("passcode_hash")
    .eq("share_code", normalizeShareCode(shareCode))
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.passcode_hash ?? null;
}

export async function verifyProfilePasscode(
  shareCode: string,
  profileId: string,
  pin: string
): Promise<boolean> {
  const storedHash = await fetchProfilePasscodeHash(shareCode, profileId);
  if (!storedHash) return false;
  return passcodeMatchesHash(shareCode, profileId, pin, storedHash);
}
