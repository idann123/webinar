import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "kosgoro_session";

export type Role = "SISWA" | "GURU" | "ADMIN";

export type SessionPayload = {
  userId: number;
  nama: string;
  email: string;
  role: Role;
};

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "kosgoro-dev-secret-change-me"
);

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}