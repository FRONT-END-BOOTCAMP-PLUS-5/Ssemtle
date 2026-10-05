// Run against a real Next.js server: SSEMTLE_TEST_URL=http://localhost:3510 node --test tests/e2e/image-formats.check.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';

for (const [accept, contentType] of [
  ['image/avif,image/webp', 'image/avif'],
  ['image/webp', 'image/webp'],
  ['image/png', 'image/png'],
]) {
  test(`serves ${contentType} for Accept: ${accept}`, async () => {
    assert.ok(
      process.env.SSEMTLE_TEST_URL,
      'Set SSEMTLE_TEST_URL to a running Next.js server'
    );
    const url = new URL('/_next/image', process.env.SSEMTLE_TEST_URL);
    url.search = new URLSearchParams({
      url: '/logos/Ssemtle_logo.png',
      w: '64',
      q: '75',
    });
    const response = await fetch(url, { headers: { Accept: accept } });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), contentType);
    assert.match(response.headers.get('vary') ?? '', /Accept/i);
    const { info } = await sharp(Buffer.from(await response.arrayBuffer()))
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 64);
    assert.ok(info.height > 0);
  });
}
