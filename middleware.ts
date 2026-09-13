import { NextResponse, type NextRequest } from 'next/server';
import { rejectReason } from '@/lib/server/request-guard';

export function middleware(request: NextRequest) {
  const reason = rejectReason({
    method: request.method,
    host: request.headers.get('host'),
    origin: request.headers.get('origin'),
    secFetchSite: request.headers.get('sec-fetch-site'),
    allowedHosts: (process.env.MARKETIYO_ALLOWED_HOSTS ?? '')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  });

  if (reason) return NextResponse.json({ error: reason }, { status: 403 });
  return NextResponse.next();
}

export const config = { matcher: '/api/:path*' };
