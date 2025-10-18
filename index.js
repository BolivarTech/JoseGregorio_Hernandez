// Replace console.log with a small, secure redirect implementation.
// This script uses a strict whitelist and avoids injecting untrusted HTML.
'use strict';

(function () {
  // Whitelisted targets (only these exact basenames or simple variants are allowed)
  const ALLOWED = new Set([
    'jose_gregorio_hernandez.html',
    '/jose_gregorio_hernandez.html',
    './jose_gregorio_hernandez.html'
  ]);

  const DEFAULT_TARGET = 'jose_gregorio_hernandez.html';

  /**
   * Read an optional `to` query parameter and return a sanitized basename
   * Returns null if nothing valid was provided.
   */
  function getRequestedTargetFromQuery() {
    try {
      const params = new URLSearchParams(location.search);
      const raw = params.get('to');
      if (!raw) return null;
      // Only keep the last path segment (basename) to avoid path traversal / host injection
      const withoutQuery = raw.split(/[?#]/)[0];
      const segments = withoutQuery.split('/').filter(Boolean);
      const basename = segments.length ? segments[segments.length - 1] : withoutQuery;
      // normalize simple ./ or / prefixes
      return basename || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Normalize a candidate target into a safe relative path we allow.
   * We only permit exact whitelist matches (after simple normalization).
   */
  function normalizeAndValidateTarget(candidate) {
    if (!candidate || typeof candidate !== 'string') return null;
    // Remove dangerous characters and leading separators
    const cleaned = candidate.replace(/^\.+/, '').replace(/^\\+|^\/+/, '');
    // Only allow simple filenames (no query, no fragment)
    const basename = cleaned.split(/[?#]/)[0].split('/').filter(Boolean).pop();
    if (!basename) return null;
    const variants = [basename, './' + basename, '/' + basename];
    for (const v of variants) {
      if (ALLOWED.has(v)) return basename; // return the safe relative path (basename)
    }
    return null;
  }

  /**
   * Create a small, accessible fallback message with a safe link.
   * We use textContent to avoid XSS and do not insert raw HTML.
   */
  function createFallbackLink(target) {
    try {
      const container = document.createElement('div');
      container.setAttribute('role', 'status');
      container.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.95);z-index:9999;font-family:system-ui,Arial,sans-serif;padding:1rem;';

      const message = document.createElement('p');
      message.style.margin = '0 0.5rem 0 0';
      message.style.color = '#111';
      message.textContent = 'Redirecting — click the link if nothing happens:';

      const link = document.createElement('a');
      // Use a plain relative link; this is safe because `target` was validated
      link.href = './' + target;
      link.textContent = target;
      link.style.color = '#0066cc';
      link.style.textDecoration = 'underline';

      container.appendChild(message);
      container.appendChild(link);
      document.body.appendChild(container);

      return { container, link };
    } catch (e) {
      // If DOM operations fail, don't block redirect; silently continue
      return null;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Determine candidate target from query param first
    const requested = getRequestedTargetFromQuery();
    const validated = normalizeAndValidateTarget(requested) || normalizeAndValidateTarget(DEFAULT_TARGET);

    if (!validated) {
      // Nothing valid to redirect to — do nothing (or optionally log)
      return;
    }

    // Create an accessible fallback UI before redirecting
    const ui = createFallbackLink(validated);

    // Perform the redirect using replace so we don't create a back-history entry
    try {
      // small timeout so assistive tech can announce status and users can click if needed
      setTimeout(function () {
        // Use a relative path. Using replace avoids back-button surprises.
        location.replace('./' + validated);
      }, 250);
    } catch (e) {
      // If replace fails, leave the fallback link visible so the user can manually proceed.
      if (ui && ui.link) {
        // Nothing to do; link is already present.
      }
    }
  });

})();
