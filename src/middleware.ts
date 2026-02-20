import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;

  // If SITE_PASSWORD is set, gate the entire site behind it
  if (sitePassword) {
    const isPasswordRoute = request.nextUrl.pathname === "/site-password";
    const hasAccess = request.cookies.get("site_access")?.value === sitePassword;

    if (!hasAccess && !isPasswordRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/site-password";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|opengraph-image|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
