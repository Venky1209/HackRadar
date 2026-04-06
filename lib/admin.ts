import { cookies } from "next/headers";

export const ADMIN_COOKIE = "hackradar_admin_session";

export function hasAdminSessionCookie(cookieHeader: string | null | undefined) {
  if (!cookieHeader) {
    return false;
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .includes(`${ADMIN_COOKIE}=unlocked`);
}

export async function isAdminCookiePresent() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "unlocked";
}

export function isValidAdminPin(pin: string | null | undefined) {
  const expected = process.env.ADMIN_PIN?.trim();
  if (!expected) {
    return false;
  }
  return Boolean(pin && pin.trim() === expected);
}
