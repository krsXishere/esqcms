import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "CMS_ITS_PASSWORD_123"
);

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    console.error("JWT invalid", err);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Protected routes untuk Seikaku Ebara QC System
  const protectedRoutes = [
    "/admin",
    "/inspector",
    "/checker",
    "/approver",
    "/dashboard", // Keep old route for backward compatibility
    "/realtime-status",
    "/monitoring",
    "/analysis&diagnose",
    "/alarm&notification",
    "/report",
    "/user-management",
    "/area-management",
    "/device-management",
  ];
  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and accessing login page, redirect to appropriate dashboard
  if (pathname === "/login" && token) {
    const role = request.cookies.get("role")?.value || "super_admin";
    
    if (role === "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (role === "inspector") {
      return NextResponse.redirect(new URL("/inspector/dashboard", request.url));
    } else if (role === "checker") {
      return NextResponse.redirect(new URL("/checker/dashboard", request.url));
    } else if (role === "approver") {
      return NextResponse.redirect(new URL("/approver/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (token) {
    const decoded = await verifyToken(token);
    const role = decoded?.role;

    // ❌ Blokir role "user" dari /user-management
    if (
      (pathname.startsWith("/user-management") ||
        pathname.startsWith("/device-management") ||
        pathname.startsWith("/area-management")) &&
      role === "User"
    ) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
