import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/pemasukan", "/pengeluaran", "/transaksi"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/pemasukan") || pathname.startsWith("/pengeluaran")) {
    return NextResponse.redirect(new URL("/transaksi", request.url));
  }

  if (protectedPaths.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/pemasukan/:path*", "/pengeluaran/:path*", "/transaksi/:path*", "/login"],
};
