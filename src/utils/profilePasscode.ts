const PIN_LENGTH = 4;

export function isValidProfilePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function normalizeShareCode(code: string): string {
  return code.trim().toUpperCase();
}

async function digestPasscode(
  shareCode: string,
  profileId: string,
  pin: string
): Promise<string> {
  const payload = `${normalizeShareCode(shareCode)}:${profileId}:${pin}`;
  const bytes = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashProfilePasscode(
  shareCode: string,
  profileId: string,
  pin: string
): Promise<string> {
  if (!isValidProfilePin(pin)) {
    throw new Error(`Passcode must be exactly ${PIN_LENGTH} digits.`);
  }
  return digestPasscode(shareCode, profileId, pin);
}

export async function passcodeMatchesHash(
  shareCode: string,
  profileId: string,
  pin: string,
  storedHash: string
): Promise<boolean> {
  if (!isValidProfilePin(pin)) return false;
  const hash = await digestPasscode(shareCode, profileId, pin);
  return hash === storedHash;
}

export { PIN_LENGTH };
