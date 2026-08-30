import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';
import { normalizeHost } from '@/lib/sites/publicSite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function expectedTargets() {
  const raw = [
    process.env.NEXT_PUBLIC_SITES_CNAME,
    process.env.SITES_CNAME_TARGET,
    'cname.vercel-dns.com'
  ].filter(Boolean);
  return raw.map((item) => normalizeHost(item));
}

function recordMatches(value, targets) {
  const host = normalizeHost(value);
  if (!host) return false;
  if (host.includes('vercel-dns.com')) return true;
  return targets.some((target) => host === target || host.endsWith(`.${target}`));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const host = normalizeHost(body?.host);
    if (!host || !host.includes('.')) {
      return NextResponse.json({ error: 'Enter a valid domain like www.yourbrand.com' }, { status: 400 });
    }

    const targets = expectedTargets();
    let cnames = [];
    let aRecords = [];

    try {
      cnames = await dns.resolveCname(host);
    } catch {
      cnames = [];
    }

    try {
      aRecords = await dns.resolve4(host);
    } catch {
      aRecords = [];
    }

    const matched = cnames.some((value) => recordMatches(value, targets));

    let vercel = null;
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        const res = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: host })
        });
        vercel = await res.json();
      } catch (err) {
        vercel = { error: err.message };
      }
    }

    return NextResponse.json({
      ok: true,
      host,
      matched,
      cnames: cnames.map((value) => normalizeHost(value)),
      aRecords,
      targets,
      vercel
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not check DNS' }, { status: 500 });
  }
}
