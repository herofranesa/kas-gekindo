import { NextResponse } from "next/server";
import { USERS, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      message: "Login berhasil",
      user: { username: user.username, role: user.role, nama: user.nama },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const response = NextResponse.json({ message: "Logout berhasil" });
  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
