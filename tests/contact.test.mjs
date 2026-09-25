import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_ENDPOINT, CONTACT_ORIGIN, MAX_CONTACT_BYTES, ContactError, deliverEnquiry, originAllowed, readContactBody, validateEnquiry } from '../lib/contact.ts';
const valid = { name: 'Test Visitor', email: 'visitor@example.com', phone: '07000 000000', location: 'Test town', service: 'Brickwork', message: 'Please discuss a garden wall repair.', website: '' };
test('validates fields and discards caller-controlled mail routing', () => {
  const result = validateEnquiry({ ...valid, _cc: 'attacker@example.com', to: 'attacker@example.com', name: ' Test Visitor ' });
  assert.deepEqual(result, valid);
});
test('rejects malformed, oversized, injected and incomplete enquiries', () => {
  for (const bad of [null, [], { ...valid, name: '' }, { ...valid, email: 'invalid' }, { ...valid, email: 'a@example.com\r\nBcc: b@example.com' }, { ...valid, phone: 1 }, { ...valid, name: 'x\nInjected' }, { ...valid, message: 'short' }, { ...valid, message: 'x'.repeat(4001) }]) assert.throws(() => validateEnquiry(bad), ContactError);
});
test('accepts only explicit trusted origins', () => {
  assert.equal(originAllowed(CONTACT_ORIGIN, undefined, false), true);
  assert.equal(originAllowed(null, undefined, false), false);
  assert.equal(originAllowed('https://evil.example', undefined, false), false);
  assert.equal(originAllowed('https://goldkrest.group', 'https://goldkrest.group', false), true);
  assert.equal(originAllowed('https://goldkrest.group.evil.example', 'https://goldkrest.group', false), false);
  assert.equal(originAllowed('http://localhost:5173', undefined, false), false);
  assert.equal(originAllowed('http://localhost:5173', undefined, true), true);
});
test('bounds streamed JSON independently of the content-length header', async () => {
  const request = body => new Request('https://example.com/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  assert.deepEqual(await readContactBody(request(JSON.stringify(valid))), valid);
  await assert.rejects(readContactBody(request('not json')), ContactError);
  await assert.rejects(readContactBody(request('x'.repeat(MAX_CONTACT_BYTES + 1))), e => e.status === 413);
  await assert.rejects(readContactBody(new Request('https://example.com', { method: 'POST', body: '{}' })), e => e.status === 415);
});
test('forwards only validated fields to the fixed business email', async () => {
  let captured;
  await deliverEnquiry(valid, async (url, options) => { captured = { url, options }; return Response.json({ success: 'true', message: 'Form successfully submitted' }); });
  assert.equal(captured.url, CONTACT_ENDPOINT);
  assert.equal(captured.options.method, 'POST');
  const body = JSON.parse(captured.options.body);
  assert.equal(body.email, valid.email);
  assert.equal(body.message, valid.message);
  assert.equal(body._subject, 'New website enquiry — Goldkrest Group');
  assert.equal(body._cc, undefined);
  assert.ok(captured.options.signal instanceof AbortSignal);
});
test('does not claim success when the provider fails or needs activation', async () => {
  for (const response of [new Response('', { status: 503 }), Response.json({ success: false }), Response.json({ success: 'true', message: 'Please activate your form' }), new Response('not json')]) await assert.rejects(deliverEnquiry(valid, async () => response));
});
