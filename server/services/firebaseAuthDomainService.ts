import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function cleanString(val?: string | null): string {
  if (!val) return '';
  let s = val.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getGoogleAccessToken(): Promise<string | null> {
  const clientEmail = cleanString(process.env.FIREBASE_CLIENT_EMAIL);
  const rawKey = cleanString(process.env.FIREBASE_PRIVATE_KEY)
    .replace(/\\n/g, '\n')
    .trim();

  if (!clientEmail || !rawKey || !rawKey.includes('-----BEGIN')) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60) {
    return cachedAccessToken.token;
  }

  try {
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const b64url = (obj: any) =>
      Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj)).toString(
        'base64url'
      );

    const signInput = `${b64url(header)}.${b64url(claim)}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signInput);
    const signature = signer.sign(rawKey, 'base64url');
    const jwtToken = `${signInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      }),
    });

    const data = await res.json();
    if (data.access_token) {
      cachedAccessToken = {
        token: data.access_token,
        expiresAt: now + (data.expires_in || 3600),
      };
      return data.access_token;
    } else {
      console.warn('[Firebase Auth Domain] OAuth token response error:', data);
    }
  } catch (err) {
    console.error('[Firebase Auth Domain] Failed to obtain access token:', err);
  }
  return null;
}

export async function getAuthorizedDomains(): Promise<string[]> {
  const projectId =
    cleanString(process.env.FIREBASE_PROJECT_ID) ||
    cleanString(process.env.VITE_FIREBASE_PROJECT_ID);

  if (!projectId) return [];

  const token = await getGoogleAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.authorizedDomains || [];
    }
  } catch (err) {
    console.error('[Firebase Auth Domain] Failed to get authorized domains:', err);
  }
  return [];
}

export async function ensureAuthorizedDomain(rawDomain: string): Promise<{ success: boolean; authorizedDomains: string[] }> {
  let hostname = cleanString(rawDomain);
  if (!hostname) return { success: false, authorizedDomains: [] };

  // Strip protocol and port if present
  if (hostname.includes('://')) {
    try {
      hostname = new URL(hostname).hostname;
    } catch {}
  }
  if (hostname.includes(':')) {
    hostname = hostname.split(':')[0];
  }

  const projectId =
    cleanString(process.env.FIREBASE_PROJECT_ID) ||
    cleanString(process.env.VITE_FIREBASE_PROJECT_ID);

  if (!projectId) {
    return { success: false, authorizedDomains: [] };
  }

  const token = await getGoogleAccessToken();
  if (!token) {
    return { success: false, authorizedDomains: [] };
  }

  try {
    const currentRes = await fetch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!currentRes.ok) {
      console.warn('[Firebase Auth Domain] Failed to fetch current config:', await currentRes.text());
      return { success: false, authorizedDomains: [] };
    }

    const currentConfig = await currentRes.json();
    const existingDomains: string[] = currentConfig.authorizedDomains || [];

    if (existingDomains.includes(hostname)) {
      return { success: true, authorizedDomains: existingDomains };
    }

    const updatedDomains = Array.from(new Set([...existingDomains, hostname])).filter(Boolean);

    const patchRes = await fetch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorizedDomains: updatedDomains,
        }),
      }
    );

    if (patchRes.ok) {
      const patchData = await patchRes.json();
      const resulting = patchData.authorizedDomains || updatedDomains;
      console.log(`[Firebase Auth Domain] Successfully authorized domain "${hostname}" in project ${projectId}`);
      return { success: true, authorizedDomains: resulting };
    } else {
      console.warn('[Firebase Auth Domain] Patch failed:', await patchRes.text());
    }
  } catch (err) {
    console.error('[Firebase Auth Domain] Error during domain authorization:', err);
  }

  return { success: false, authorizedDomains: [] };
}
