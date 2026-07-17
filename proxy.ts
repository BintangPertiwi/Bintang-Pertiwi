import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_for_dev_only"
);

// Path admin yang boleh diakses role "kontributor".
// Hanya dashboard, modul produk, dan pengaturan akun sendiri.
function isKontributorAllowed(pathname: string): boolean {
  if (pathname === '/admin') return true;
  if (pathname === '/admin/pengaturan') return true; // akun sendiri (password + WA)
  if (pathname === '/admin/produk' || pathname.startsWith('/admin/produk/')) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_session')?.value;

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Token lama (tanpa id) → paksa login ulang agar dapat klaim role/id.
      if (!payload.id) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin_session');
        return response;
      }

      const role = payload.role === 'kontributor' ? 'kontributor' : 'super_admin';
      if (role === 'kontributor' && !isKontributorAllowed(pathname)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch {
        const response = NextResponse.next();
        response.cookies.delete('admin_session');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
