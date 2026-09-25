import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { checkRateLimit, RATE_LIMIT, rateKey } from '../lib/rate-limit.ts';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../drizzle/0000_panoramic_rhodey.sql', import.meta.url), 'utf8'));
  return {
    sqlite,
    prepare(sql) { return { bind(...params) { return { sql, params }; } }; },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const result = statements.map(({ sql, params }) => {
          const statement = sqlite.prepare(sql);
          return { results: /RETURNING/.test(sql) ? statement.all(...params) : (statement.run(...params), []) };
        });
        sqlite.exec('COMMIT');
        return result;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
}
test('shared database enforces the exact budget across concurrent callers', async () => {
  const db = database();
  const results = await Promise.all(Array.from({ length: RATE_LIMIT + 10 }, () => checkRateLimit(db, '192.0.2.1', 60000)));
  assert.equal(results.filter(r => r.allowed).length, RATE_LIMIT);
  assert.equal(results.at(-1).remaining, 0);
  assert.equal(results.at(-1).retryAfter, 60);
  assert.equal(db.sqlite.prepare('SELECT count FROM rate_limits').get().count, RATE_LIMIT + 1);
  db.sqlite.close();
});
test('different clients have independent budgets and windows reset', async () => {
  const db = database();
  for (let i = 0; i < RATE_LIMIT; i++) await checkRateLimit(db, 'a', 119000);
  assert.equal((await checkRateLimit(db, 'a', 119000)).allowed, false);
  assert.equal((await checkRateLimit(db, 'b', 119000)).allowed, true);
  assert.equal((await checkRateLimit(db, 'a', 120000)).remaining, RATE_LIMIT - 1);
  await checkRateLimit(db, 'a', 240000);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM rate_limits').get().n, 1);
  db.sqlite.close();
});
test('keys rotate and raw client addresses are not stored', async () => {
  assert.notEqual(await rateKey('192.0.2.1', 1), await rateKey('192.0.2.1', 2));
  assert.match(await rateKey('192.0.2.1', 1), /^[0-9a-f]{64}$/);
});
test('storage failure is propagated instead of granting unlimited access', async () => {
  const db = database();
  db.sqlite.close();
  await assert.rejects(checkRateLimit(db, 'a', 60000));
});
