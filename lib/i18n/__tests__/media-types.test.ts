import { describe, it, expect } from 'vitest';
import { t } from '@/lib/i18n';
import { platformHint, platformLabel } from '@/lib/i18n/labels';
import { platformSchema } from '@/lib/schema';

const outlets = ['instagram', 'tiktok', 'linkedin', 'facebook', 'threads', 'youtube', 'x'];

describe('media type labels', () => {
  for (const language of ['tr', 'en'] as const) {
    const dict = t(language);

    it(`never names a platform as the media type (${language})`, () => {
      for (const type of platformSchema.options) {
        const label = platformLabel(dict, type).toLowerCase();
        for (const outlet of outlets) {
          expect(label.split(/\s+/), `${type} is labelled "${label}"`).not.toContain(outlet);
        }
      }
    });

    it(`gives every media type a hint saying where it runs (${language})`, () => {
      for (const type of platformSchema.options) {
        expect(platformHint(dict, type).length).toBeGreaterThan(5);
      }
    });

    it(`lists short video under visual and video outlets, not as one of them (${language})`, () => {
      expect(platformHint(dict, 'short-video')).toMatch(/Reels/);
      expect(platformHint(dict, 'instagram-static')).toMatch(/Instagram/);
    });
  }
});
