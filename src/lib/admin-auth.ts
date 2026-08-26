import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SECRET = process.env.ADMIN_JWT_SECRET || "kiosk_admin_secret_key_2026_default";

export interface AdminSession {
  username: string;
  role: "ADMIN";
  exp: number;
}

function signToken(payload: AdminSession): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyToken(token: string): AdminSession | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8")) as AdminSession;
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function setAdminCookie(username: string) {
  const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours session
  const token = signToken({ username, role: "ADMIN", exp });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getAdminSession(): AdminSession | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
