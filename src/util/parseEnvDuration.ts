import ms from "ms";

/** e.g. `60 * 15` or `60*15` → product in seconds (same semantics as a plain numeric env). */
function tryParseIntMultiplication(trimmed: string): number | undefined {
  const parts = trimmed.split("*").map((s) => s.trim());
  if (parts.length < 2) {
    return undefined;
  }
  if (!parts.every((p) => /^\d+$/.test(p))) {
    return undefined;
  }
  return parts.reduce<number>((acc, p) => acc * Number(p), 1);
}

/**
 * Cookie maxAge in milliseconds. Env may be seconds as a number (e.g. 604800) or a duration string (e.g. 7d).
 */
export function parseEnvDurationToMs(
  value: string | undefined,
  envName: string,
): number {
  if (value === undefined || value.trim() === "") {
    throw new Error(`${envName} is not set`);
  }
  const trimmed = value.trim();
  const fromMult = tryParseIntMultiplication(trimmed);
  if (
    fromMult !== undefined &&
    Number.isFinite(fromMult) &&
    fromMult > 0
  ) {
    return Math.floor(fromMult * 1000);
  }
  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return Math.floor(asNumber * 1000);
  }
  const parsed = ms(trimmed as ms.StringValue);
  if (typeof parsed !== "number" || !Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `${envName} must be a positive number (seconds) or a duration string (e.g. 7d), got: ${value}`,
    );
  }
  return parsed;
}

/**
 * Value for jsonwebtoken `expiresIn`: seconds as number, or duration string (e.g. 7d).
 */
export function parseEnvDurationForJwt(
  value: string | undefined,
  envName: string,
): string | number {
  if (value === undefined || value.trim() === "") {
    throw new Error(`${envName} is not set`);
  }
  const trimmed = value.trim();
  const fromMult = tryParseIntMultiplication(trimmed);
  if (
    fromMult !== undefined &&
    Number.isFinite(fromMult) &&
    fromMult > 0
  ) {
    return fromMult;
  }
  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return asNumber;
  }
  const parsed = ms(trimmed as ms.StringValue);
  if (typeof parsed !== "number" || !Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `${envName} must be a positive number (seconds) or a duration string (e.g. 7d), got: ${value}`,
    );
  }
  return trimmed;
}
