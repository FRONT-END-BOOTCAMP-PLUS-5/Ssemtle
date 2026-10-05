// Run against a real Next.js server: SSEMTLE_TEST_URL=http://localhost:3510 node --test tests/e2e/favicon.check.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';

test('serves a favicon without authentication', async () => {
  assert.ok(
    process.env.SSEMTLE_TEST_URL,
    'Set SSEMTLE_TEST_URL to a running Next.js server'
  );
  const response = await fetch(
    new URL('/favicon.ico', process.env.SSEMTLE_TEST_URL),
    { redirect: 'manual' }
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get('content-type') ?? '',
    /^image\/(x-icon|vnd\.microsoft\.icon)$/
  );
  const icon = Buffer.from(await response.arrayBuffer());
  assert.equal(icon.readUInt16LE(0), 0);
  assert.equal(icon.readUInt16LE(2), 1);
  assert.ok(icon.readUInt16LE(4) > 0);
  assert.ok(icon.length >= icon.readUInt32LE(18) + icon.readUInt32LE(14));
});

test('links the favicon and preserves the Apple PNG in the page head', async () => {
  assert.ok(
    process.env.SSEMTLE_TEST_URL,
    'Set SSEMTLE_TEST_URL to a running Next.js server'
  );
  const response = await fetch(
    new URL('/landing', process.env.SSEMTLE_TEST_URL)
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  const links = html.match(/<link\b[^>]*>/g) ?? [];
  for (const [rel, href] of [
    ['icon', '/favicon.ico'],
    ['shortcut icon', '/favicon.ico'],
    ['apple-touch-icon', '/ssemtle_favicon.png'],
  ]) {
    assert.ok(
      links.some(
        (link) =>
          link.includes(`rel="${rel}"`) && link.includes(`href="${href}"`)
      ),
      `Missing ${rel}: ${href}`
    );
  }
});
