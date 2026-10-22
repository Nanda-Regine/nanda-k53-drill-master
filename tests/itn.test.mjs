// node --test tests/  — PayFast ITN activation (no network: fake Supabase client).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activateSubscriber } from '../api/itn.js';

const DAY = 864e5;
const NOW = Date.parse('2026-10-22T12:00:00Z');

function fakeSupabase({ subscriber = null, inviteError = null, existingAuthUserId = null } = {}) {
  const calls = { invites: 0, links: 0, upserts: [] };
  const client = {
    calls,
    from() {
      return {
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: subscriber, error: null }),
        upsert: async (row) => { calls.upserts.push(row); return { error: null }; },
      };
    },
    auth: {
      admin: {
        inviteUserByEmail: async () => {
          calls.invites++;
          return inviteError ? { data: null, error: { message: inviteError } } : { data: { user: { id: 'new-user' } }, error: null };
        },
        generateLink: async () => {
          calls.links++;
          return existingAuthUserId ? { data: { user: { id: existingAuthUserId } }, error: null } : { data: null, error: { message: 'nope' } };
        },
      },
    },
  };
  return client;
}

test('new buyer: invited, activated for the plan length', async () => {
  const sb = fakeSupabase();
  await activateSubscriber('a@x.co', 'monthly', 'mm.1', sb, NOW);
  assert.equal(sb.calls.invites, 1);
  const row = sb.calls.upserts[0];
  assert.equal(row.user_id, 'new-user');
  assert.equal(row.status, 'active');
  assert.equal(Date.parse(row.expires_at), NOW + 30 * DAY);
});

test('returning buyer (the bug): no invite, expiry extended, reactivated', async () => {
  const sb = fakeSupabase({ subscriber: { user_id: 'u1', expires_at: new Date(NOW + 10 * DAY).toISOString() }, inviteError: 'already registered' });
  await activateSubscriber('a@x.co', 'bundle', 'mm.2', sb, NOW);
  assert.equal(sb.calls.invites, 0);
  const row = sb.calls.upserts[0];
  assert.equal(row.user_id, 'u1');
  assert.equal(row.status, 'active');
  assert.equal(Date.parse(row.expires_at), NOW + 100 * DAY, 'adds 90 days on top of the 10 left');
});

test('lapsed buyer: extends from now, not from the old expiry', async () => {
  const sb = fakeSupabase({ subscriber: { user_id: 'u1', expires_at: new Date(NOW - 50 * DAY).toISOString() } });
  await activateSubscriber('a@x.co', 'monthly', 'mm.3', sb, NOW);
  assert.equal(Date.parse(sb.calls.upserts[0].expires_at), NOW + 30 * DAY);
});

test('account exists but no subscriber row: resolved via magic link, no duplicate', async () => {
  const sb = fakeSupabase({ inviteError: 'already registered', existingAuthUserId: 'u2' });
  await activateSubscriber('a@x.co', 'monthly', 'mm.4', sb, NOW);
  assert.equal(sb.calls.links, 1);
  assert.equal(sb.calls.upserts[0].user_id, 'u2');
});

test('no way to resolve the user: throws (handler logs, still 200s PayFast)', async () => {
  const sb = fakeSupabase({ inviteError: 'boom' });
  await assert.rejects(activateSubscriber('a@x.co', 'monthly', 'mm.5', sb, NOW), /Invite failed/);
  assert.equal(sb.calls.upserts.length, 0);
});
