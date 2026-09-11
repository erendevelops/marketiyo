import { describe, it, expect } from 'vitest';
import { extractJson } from '@/lib/providers/json';

describe('extractJson', () => {
  it('parses bare json', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips a fenced block', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('ignores prose around the object', () => {
    expect(extractJson('Iste sonuc:\n{"a":1}\nUmarim yardimci olur.')).toEqual({ a: 1 });
  });

  it('handles braces inside strings', () => {
    expect(extractJson('{"a":"}{"}')).toEqual({ a: '}{' });
  });

  it('handles escaped quotes inside strings', () => {
    expect(extractJson('{"a":"say \\"hi\\" }"}')).toEqual({ a: 'say "hi" }' });
  });

  it('handles nested objects', () => {
    expect(extractJson('{"a":{"b":[1,2]}}')).toEqual({ a: { b: [1, 2] } });
  });

  it('returns null when there is no object', () => {
    expect(extractJson('hicbir sey yok')).toBeNull();
  });

  it('returns null for an unterminated object', () => {
    expect(extractJson('{"a": 1')).toBeNull();
  });
});
