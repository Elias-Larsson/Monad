import { NextResponse, type NextRequest } from "next/server";

const authPages = new Set(["/login", "/register"]);

function isSafeRedirectPath(path: string | null) {
  return path !== null && path.startsWith("/") && !path.startsWith("//");
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (token && authPages.has(pathname)) {
    return NextResponse.redirect(new URL("/workflows", request.url));
  }

  if (!token && !authPages.has(pathname)) {
    const loginURL = new URL("/login", request.url);
    const nextPath = `${pathname}${request.nextUrl.search}`;

    if (isSafeRedirectPath(nextPath)) {
      loginURL.searchParams.set("next", nextPath);
    }

    return NextResponse.redirect(loginURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workflows/:path*", "/login", "/register"],
};
