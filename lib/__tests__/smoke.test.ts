import { describe, it, expect } from 'vitest';
import { appName } from '@/lib/meta';

describe('app metadata', () => {
  it('exposes the project name', () => {
    expect(appName).toBe('Marketiyo');
  });
});
