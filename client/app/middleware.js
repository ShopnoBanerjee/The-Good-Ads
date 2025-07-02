import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 👇 Protect any path that starts with `/dashboard` or `/society`
  const protectedPaths = ["/dashboard", "/society"];
  const url = req.nextUrl.pathname;

  const isProtected = protectedPaths.some((path) =>
    url.startsWith(path)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/society/:path*"],
};
