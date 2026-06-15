import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "kas-gekindo-secret-key-2024";

export const USERS = [
  { username: "admin", password: "admin123", role: "admin", nama: "Administrator" },
  { username: "bendahara", password: "bendahara123", role: "bendahara", nama: "Bendahara" },
];

export function generateToken(user: { username: string; role: string; nama: string }) {
  return jwt.sign(
    { username: user.username, role: user.role, nama: user.nama },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      username: string;
      role: string;
      nama: string;
    };
  } catch {
    return null;
  }
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
