import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwtRole(token: string): string | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
        
    );
    const parsed = JSON.parse(jsonPayload);
    
    // Token yaroqlilik muddatini tekshirish (exp sekundlarda beriladi)
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    
    return parsed?.role || parsed?.data?.role || null;
  } catch (error) {
    return null;
  }
}

// Rollarga mos asosiy boshlang'ich va ruxsat etilgan route prefikslari
const ROLE_CONFIG: Record<string, { home: string; allowedPrefixes: string[] }> = {
  SUPERADMIN: { home: "/dashboard", allowedPrefixes: ["/dashboard", "/mentor", "/assistents", "/students"] },
  ADMIN: { home: "/dashboard", allowedPrefixes: ["/dashboard", "/mentor"] }, // Adminlarga ham mentor paneliga kirish ruxsati berildi
  MENTOR: { home: "/mentor", allowedPrefixes: ["/mentor"] },
  ASSISTANT: { home: "/assistents", allowedPrefixes: ["/assistents"] },
  STUDENT: { home: "/students", allowedPrefixes: ["/students"] },
};

// Barcha rollarga tegishli maxsus panellar ro'yxati
const PROTECTED_PANEL_PREFIXES = [
  "/dashboard",
  "/mentor",
  "/assistents",
  "/students",
];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Xatolik 401 yoki tizimdan chiqish (logout) vaqtida cookielarni server tomondan tozalash
  if (searchParams.get("clear_auth") === "true") {
    const url = new URL(request.url);
    url.searchParams.delete("clear_auth");
    const response = NextResponse.redirect(url);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  let token = request.cookies.get("accessToken")?.value;

  let role = null;
  if (token) {
    role = parseJwtRole(token);
    if (!role) {
      token = undefined; // Token yaroqsiz yoki muddati o'tgan
    }
  }

  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/courses",
    "/login",
    "/register",
    "/verify-otp",
  ];

  const isPublicPath =
    pathname === "/" ||
    publicPaths.some((path) => path !== "/" && pathname.startsWith(path));

  if (!isPublicPath && !token) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (request.cookies.has("accessToken")) {
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
    }
    return response;
  }

  // 2. Token mavjud bo'lsa -> Rollar bo'yicha qat'iy ajratish
  if (token && role) {
    const userRoleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.STUDENT;

    // A. Foydalanuvchi public (landing yoki auth) sahifalarga kirmoqchi bo'lsa -> o'z panelining bosh sahifasiga yo'naltirish
    if (isPublicPath) {
      return NextResponse.redirect(new URL(userRoleConfig.home, request.url));
    }

    // B. Foydalanuvchi himoyalangan panellardan biriga kirayotganini tekshirish
    const isAccessingAnyPanel = PROTECTED_PANEL_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (isAccessingAnyPanel) {
      // Agar kirayotgan sahifasi o'zining roliga tegishli bo'lmasa -> o'z uyiga qaytarish
      const hasAccess = userRoleConfig.allowedPrefixes.some(prefix => pathname.startsWith(prefix));
      if (!hasAccess) {
        return NextResponse.redirect(new URL(userRoleConfig.home, request.url));
      }
    }
  }

  const response = NextResponse.next();
  
  // Agar token cookie'da bo'lsa, lekin yaroqsiz/muddati o'tgan deb topilsa o'chirib yuborish
  if (request.cookies.get("accessToken") && !token) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
