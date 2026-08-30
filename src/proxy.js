import { NextResponse } from 'next/server';

function hostnameOf(hostHeader) {
  return String(hostHeader || '')
    .split(':')[0]
    .trim()
    .toLowerCase();
}

function isPlatformHost(host) {
  if (!host) return true;
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return true;
  if (host.endsWith('.vercel.app') || host.endsWith('.localhost')) return true;
  if (host.includes('ngrok') || host.includes('trycloudflare')) return true;
  if (host === 'upklick.com' || host.endsWith('.upklick.com')) return true;
  const extras = String(process.env.NEXT_PUBLIC_APP_HOSTS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return extras.includes(host);
}

export function proxy(request) {
  const host = hostnameOf(request.headers.get('host'));
  if (isPlatformHost(host)) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (url.pathname.startsWith('/preview-site') || url.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  url.pathname = '/preview-site';
  url.searchParams.set('host', host);
  url.searchParams.set('path', request.nextUrl.pathname || '/');
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
