import { describe, it, expect } from 'vitest';
import { rejectReason, type GuardInput } from '@/lib/server/request-guard';

const base: GuardInput = {
  method: 'POST',
  host: 'localhost:3000',
  origin: 'http://localhost:3000',
  secFetchSite: 'same-origin',
};

describe('rejectReason', () => {
  it('allows the app calling its own api', () => {
    expect(rejectReason(base)).toBeNull();
  });

  it('allows tools without browser headers, such as curl', () => {
    expect(rejectReason({ ...base, origin: null, secFetchSite: null })).toBeNull();
  });

  it('refuses a form post from another site', () => {
    expect(
      rejectReason({ ...base, origin: 'https://evil.example', secFetchSite: 'cross-site' }),
    ).not.toBeNull();
  });

  it('refuses another localhost port even without fetch metadata', () => {
    expect(
      rejectReason({ ...base, origin: 'http://localhost:4000', secFetchSite: null }),
    ).not.toBeNull();
  });

  it('refuses a cross-site GET, such as an image tag', () => {
    expect(rejectReason({ ...base, method: 'GET', origin: null, secFetchSite: 'cross-site' })).not.toBeNull();
  });

  it('refuses a rebound domain even when origin and host agree', () => {
    expect(
      rejectReason({ ...base, host: 'rebind.example:3000', origin: 'http://rebind.example:3000' }),
    ).not.toBeNull();
  });

  it('accepts a LAN address and an allowed host name', () => {
    expect(rejectReason({ ...base, host: '192.168.1.20:3000', origin: 'http://192.168.1.20:3000' })).toBeNull();
    expect(
      rejectReason({
        ...base,
        host: 'marketiyo.lan:3000',
        origin: 'http://marketiyo.lan:3000',
        allowedHosts: ['marketiyo.lan'],
      }),
    ).toBeNull();
  });
});
