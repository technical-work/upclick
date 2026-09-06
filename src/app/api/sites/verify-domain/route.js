import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';
import { normalizeHost } from '@/lib/sites/publicSite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXPECTED_A_IPS = [
  process.env.SITES_A_RECORD_IP,
  process.env.NEXT_PUBLIC_SITES_A_RECORD_IP,
  '76.76.21.21',
  '216.150.1.1'
].filter(Boolean);

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

function getVercelQuery() {
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID;
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
}

async function addDomainToVercel(domainName) {
  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    return { configured: false, reason: 'Missing VERCEL_TOKEN or VERCEL_PROJECT_ID environment variables' };
  }
  const query = getVercelQuery();
  const url = `https://api.vercel.com/v10/projects/${encodeURIComponent(process.env.VERCEL_PROJECT_ID)}/domains${query}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: domainName })
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function removeDomainFromVercel(domainName) {
  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) return null;
  const query = getVercelQuery();
  const url = `https://api.vercel.com/v9/projects/${encodeURIComponent(process.env.VERCEL_PROJECT_ID)}/domains/${encodeURIComponent(domainName)}${query}`;
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const host = normalizeHost(body?.host);
    if (!host || !host.includes('.')) {
      return NextResponse.json({ error: 'Enter a valid domain like www.yourbrand.com or yourbrand.com' }, { status: 400 });
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

    const cnameMatched = cnames.some((value) => recordMatches(value, targets));
    const aRecordMatched = aRecords.some((ip) => EXPECTED_A_IPS.includes(ip));
    const matched = cnameMatched || aRecordMatched;
    const matchedType = cnameMatched ? 'cname' : (aRecordMatched ? 'a' : null);

    // Auto-provision on Vercel
    let vercel = null;
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
      vercel = await addDomainToVercel(host);
      // If apex domain without www, also register www on Vercel
      const parts = host.split('.');
      if (parts.length === 2) {
        await addDomainToVercel(`www.${host}`).catch(() => {});
      } else if (parts.length === 3 && parts[0] === 'www') {
        await addDomainToVercel(parts.slice(1).join('.')).catch(() => {});
      }
    } else {
      vercel = { configured: false, reason: 'VERCEL_TOKEN and VERCEL_PROJECT_ID not set in env' };
    }

    return NextResponse.json({
      ok: true,
      host,
      matched,
      matchedType,
      cnames: cnames.map((value) => normalizeHost(value)),
      aRecords,
      targets,
      expectedIps: EXPECTED_A_IPS,
      vercel
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not check DNS' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const host = normalizeHost(body?.host);
    if (!host) {
      return NextResponse.json({ error: 'Missing host' }, { status: 400 });
    }
    const vercel = await removeDomainFromVercel(host);
    return NextResponse.json({ ok: true, host, vercel });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not remove domain from Vercel' }, { status: 500 });
  }
}
