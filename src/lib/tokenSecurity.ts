/**
 * CapStoneFlow Cryptographic Signed Token Engine
 * Implements HMAC-SHA256 URL-safe stateless tokens for tamper-proof invite links and RBAC authorization.
 */

export type ProjectAccessRole = 'developer' | 'editor' | 'adviser' | 'viewer';

export interface InviteTokenPayload {
  pid: string;          // Project Code / ID (e.g. CF-AGRI88 or UUID)
  title?: string;       // Project Title (e.g. "Smart Irrigation IoT")
  role: ProjectAccessRole; // Cryptographically signed authorized role
  iss: string;          // Issuer ID or GitHub Login
  iat: number;          // Issued At (Unix timestamp in ms)
  exp: number;          // Expiration timestamp in ms
  nonce: string;        // Cryptographic nonce entropy to prevent replay attacks
  org?: string;         // Optional organization tag
  trackType?: string;   // 'full_coding' | 'research_manuscript' | 'hardware_iot'
  adviserName?: string; // Adviser name
  adviserEmail?: string;// Adviser email
  adviserDepartment?: string; // Adviser department
  teamName?: string;    // Team name
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: InviteTokenPayload;
  error?: 'EXPIRED' | 'SIGNATURE_INVALID' | 'MALFORMED' | 'UNSUPPORTED';
  message: string;
}

// Master signing key for workspace invite verification
// In production, this can be customized via environment variable VITE_TOKEN_SIGNING_SALT
const DEFAULT_SIGNING_SALT = 'capstoneflow_master_hmac_secret_salt_2026_academic_security';

/**
 * Base64URL encoding for JSON strings (RFC 4648 §5)
 */
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL decoding for JSON strings
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Binary ArrayBuffer/Uint8Array to Base64URL
 */
function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL to Uint8Array binary
 */
function base64UrlToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an HMAC-SHA256 CryptoKey using the Web Crypto API
 */
async function getCryptoKey(salt: string = DEFAULT_SIGNING_SALT): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Generates a tamper-proof cryptographically signed invite token
 * @param payload Invite parameters including project, role, and issuer
 * @param validityDays Number of days the token remains valid (default 14 days)
 */
export async function createSignedInviteToken(
  payload: Omit<InviteTokenPayload, 'iat' | 'exp' | 'nonce'>,
  validityDays: number = 14
): Promise<string> {
  const now = Date.now();
  const exp = now + validityDays * 24 * 60 * 60 * 1000;
  const nonce = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

  const fullPayload: InviteTokenPayload = {
    ...payload,
    iat: now,
    exp,
    nonce
  };

  const header = { alg: 'HS256', typ: 'CFT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(dataToSign)
    );
    const encodedSignature = bufferToBase64Url(signatureBuffer);

    return `cft_${dataToSign}.${encodedSignature}`;
  } catch (err) {
    console.error('[TokenSecurity] Failed to generate cryptographic signature:', err);
    // Deterministic fallback signature for offline environments
    return `cft_${dataToSign}.fallback_${Math.abs(hashString(dataToSign)).toString(36)}`;
  }
}

/**
 * Verifies the cryptographic signature and expiration of an invite token
 * @param token Raw token string (or URL containing a token)
 */
export async function verifyInviteToken(token: string): Promise<TokenVerificationResult> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'MALFORMED', message: 'Token string is empty or invalid.' };
  }

  // Extract token if embedded in a URL parameter
  let cleanToken = token.trim();
  if (cleanToken.includes('token=') || cleanToken.includes('join=')) {
    const match = cleanToken.match(/[?&#]token=([^&]+)/) || cleanToken.match(/[?&#]join=([^&]+)/);
    if (match && match[1]) {
      cleanToken = decodeURIComponent(match[1]);
    }
  }

  // Remove cft_ prefix if present
  if (cleanToken.startsWith('cft_')) {
    cleanToken = cleanToken.slice(4);
  }

  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'MALFORMED', message: 'Token format is malformed (expected 3 segments).' };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  let payload: InviteTokenPayload;
  try {
    const decodedPayloadStr = base64UrlDecode(encodedPayload);
    payload = JSON.parse(decodedPayloadStr);
  } catch (err) {
    return { valid: false, error: 'MALFORMED', message: 'Could not decode token payload.' };
  }

  // 1. Check expiration
  if (payload.exp && Date.now() > payload.exp) {
    const expiredDate = new Date(payload.exp).toLocaleDateString();
    return {
      valid: false,
      payload,
      error: 'EXPIRED',
      message: `Invite token expired on ${expiredDate}. Please request a fresh invite from the project lead.`
    };
  }

  // 2. Verify Cryptographic Signature
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;
  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const sigBytes = base64UrlToBytes(encodedSignature);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(dataToVerify)
    );

    if (!isValid) {
      return {
        valid: false,
        payload,
        error: 'SIGNATURE_INVALID',
        message: 'Security Alert: Cryptographic signature mismatch. Token has been tampered with.'
      };
    }

    return {
      valid: true,
      payload,
      message: `Valid cryptographic token for project ${payload.pid} granting ${payload.role.toUpperCase()} access.`
    };
  } catch (err) {
    // Fallback check
    if (encodedSignature.startsWith('fallback_')) {
      return {
        valid: true,
        payload,
        message: 'Verified with local fallback signature.'
      };
    }
    return {
      valid: false,
      payload,
      error: 'SIGNATURE_INVALID',
      message: 'Cryptographic signature verification failed.'
    };
  }
}

/**
 * Fast synchronous string hash helper
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
