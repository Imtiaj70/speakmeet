import { Router } from 'express';
import { ensureAuthorizedDomain, getAuthorizedDomains } from '../services/firebaseAuthDomainService';

const router = Router();

// Automatically ensure a domain is authorized for Firebase Auth
router.post('/authorize-domain', async (req, res) => {
  try {
    const requestedDomain =
      req.body?.domain ||
      req.headers['x-forwarded-host'] ||
      req.headers.host ||
      '';

    const cleanHost = String(requestedDomain).split(':')[0].trim();
    if (!cleanHost) {
      res.status(400).json({ error: 'Domain is required' });
      return;
    }

    const result = await ensureAuthorizedDomain(cleanHost);
    res.json({
      success: result.success,
      domain: cleanHost,
      authorizedDomains: result.authorizedDomains,
    });
  } catch (error: any) {
    console.error('[Auth Route] Error authorizing domain:', error);
    res.status(500).json({
      error: 'Failed to authorize domain',
      details: error?.message || String(error),
    });
  }
});

// Check authorization status of current host and list authorized domains
router.get('/auth-status', async (req, res) => {
  try {
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].trim();
    const domains = await getAuthorizedDomains();
    const isHostAuthorized = domains.includes(host);

    res.json({
      currentHost: host,
      isAuthorized: isHostAuthorized,
      authorizedDomains: domains,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve auth status' });
  }
});

export default router;
