import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Redirect uppercase /BREACH/... to lowercase /breach/...
  const pathname = request.nextUrl.pathname;
  if (pathname !== pathname.toLowerCase() && pathname.toLowerCase().startsWith("/breach")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  const sitePassword = process.env.SITE_PASSWORD;

  // If SITE_PASSWORD is set, gate the entire site behind it
  if (sitePassword) {
    const isPasswordRoute =
      request.nextUrl.pathname === "/site-password" ||
      request.nextUrl.pathname === "/api/site-password";
    const hasAccess = request.cookies.get("site_access")?.value === sitePassword;

    if (!hasAccess && !isPasswordRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/site-password";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Skip auth checks for the password page itself
    if (isPasswordRoute) {
      return NextResponse.next();
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|opengraph-image|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
