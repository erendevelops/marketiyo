/**
 * The API has no login, because it only ever serves the person at this
 * machine. That makes two browser tricks worth blocking:
 *
 * - Cross-site requests. Any page open in the same browser can send a form
 *   POST to localhost, which would spend the user's Claude or Gemini quota.
 *   Browsers always send Origin on such requests, so it must match the host.
 * - DNS rebinding. A domain that resolves to 127.0.0.1 passes the origin
 *   check, because its Origin and Host agree. Only loopback names and IP
 *   literals are accepted as the host, plus anything listed in
 *   MARKETIYO_ALLOWED_HOSTS.
 */

export type GuardInput = {
  method: string;
  host: string | null;
  origin: string | null;
  secFetchSite: string | null;
  allowedHosts?: string[];
};

function hostnameOf(host: string): string {
  if (host.startsWith('[')) return host.slice(1, host.indexOf(']'));
  return host.replace(/:\d+$/, '');
}

function isLocalHostname(hostname: string, allowed: string[]): boolean {
  const name = hostname.toLowerCase();
  if (name === 'localhost' || name.endsWith('.localhost')) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(name)) return true;
  if (name.includes(':')) return true; // IPv6 literal
  return allowed.includes(name);
}

/** Returns a reason when the request must be refused, otherwise null. */
export function rejectReason({
  method,
  host,
  origin,
  secFetchSite,
  allowedHosts = [],
}: GuardInput): string | null {
  if (!host || !isLocalHostname(hostnameOf(host), allowedHosts)) {
    return 'Bu adres üzerinden erişime izin verilmiyor.';
  }

  if (secFetchSite === 'cross-site' || secFetchSite === 'same-site') {
    return 'Başka bir siteden gelen istek reddedildi.';
  }

  const safe = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  if (!safe && origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return 'Başka bir siteden gelen istek reddedildi.';
    }
    if (originHost.toLowerCase() !== host.toLowerCase()) {
      return 'Başka bir siteden gelen istek reddedildi.';
    }
  }

  return null;
}
