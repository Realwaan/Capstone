import { describe, it, expect } from 'vitest';
import { createSignedInviteToken, verifyInviteToken } from '../tokenSecurity';

describe('tokenSecurity - Cryptographic Invite System', () => {
  it('creates and verifies a valid HMAC-SHA256 signed invite token', async () => {
    const payload = {
      pid: 'CF-M3ZXJJ',
      title: 'Smart Agri IoT',
      role: 'developer' as const,
      iss: 'usr_lead_andrei',
      org: 'College of Computer Studies',
      trackType: 'full_coding',
      teamName: 'AgriDevs',
      adviserName: 'Prof. Garcia'
    };

    const token = await createSignedInviteToken(payload, 7);
    expect(token).toMatch(/^cft_/);

    const result = await verifyInviteToken(token);
    expect(result.valid).toBe(true);
    expect(result.payload?.pid).toBe('CF-M3ZXJJ');
    expect(result.payload?.title).toBe('Smart Agri IoT');
    expect(result.payload?.role).toBe('developer');
    expect(result.payload?.iss).toBe('usr_lead_andrei');
    expect(result.payload?.org).toBe('College of Computer Studies');
    expect(result.payload?.teamName).toBe('AgriDevs');
    expect(result.payload?.adviserName).toBe('Prof. Garcia');
  });

  it('extracts and verifies token from full URL hash string', async () => {
    const payload = {
      pid: 'CF-ALPHA8',
      role: 'adviser' as const,
      iss: 'usr_manager',
      org: 'Computer Studies'
    };

    const token = await createSignedInviteToken(payload, 14);
    const fullUrl = `https://capstoneflow.app/#projects?join=CF-ALPHA8&role=adviser&token=${token}`;

    const result = await verifyInviteToken(fullUrl);
    expect(result.valid).toBe(true);
    expect(result.payload?.pid).toBe('CF-ALPHA8');
    expect(result.payload?.role).toBe('adviser');
  });

  it('rejects an expired token', async () => {
    const payload = {
      pid: 'CF-EXPIRED',
      role: 'viewer' as const,
      iss: 'usr_lead'
    };

    // Generate token with -1 days (already expired)
    const token = await createSignedInviteToken(payload, -1);
    const result = await verifyInviteToken(token);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('EXPIRED');
  });

  it('rejects malformed token strings safely without throwing', async () => {
    const result1 = await verifyInviteToken('invalid-token-string');
    expect(result1.valid).toBe(false);

    const result2 = await verifyInviteToken('');
    expect(result2.valid).toBe(false);
  });
});
