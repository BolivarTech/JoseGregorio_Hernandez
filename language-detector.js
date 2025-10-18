/**
 * Language Detection and Redirection Script
 *
 * Automatically detects the user's browser language and redirects to the appropriate version.
 * Supports Spanish (es) and English (en).
 * Respects user's language preference stored in localStorage.
 */

'use strict';

(function () {
  const LANGUAGE_KEY = 'preferred_language';
  const SUPPORTED_LANGUAGES = {
    es: 'jose_gregorio_hernandez.html',
    en: 'jose_gregorio_hernandez_en.html'
  };
  const DEFAULT_LANGUAGE = 'es';

  /**
   * Get the user's preferred language from various sources
   */
  function getUserLanguage() {
    // 1. Check if user has manually selected a language (stored in localStorage)
    const storedLang = localStorage.getItem(LANGUAGE_KEY);
    if (storedLang && SUPPORTED_LANGUAGES[storedLang]) {
      return storedLang;
    }

    // 2. Check browser language settings
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();

    // Check for exact match (e.g., 'es', 'en')
    if (SUPPORTED_LANGUAGES[browserLang]) {
      return browserLang;
    }

    // Check for language prefix (e.g., 'es-MX' -> 'es', 'en-US' -> 'en')
    const langPrefix = browserLang.split('-')[0];
    if (SUPPORTED_LANGUAGES[langPrefix]) {
      return langPrefix;
    }

    // 3. Default to Spanish
    return DEFAULT_LANGUAGE;
  }

  /**
   * Perform the redirect to the appropriate language version
   */
  function redirectToLanguage() {
    const userLang = getUserLanguage();
    const targetPage = SUPPORTED_LANGUAGES[userLang];

    // Store the detected/selected language
    try {
      localStorage.setItem(LANGUAGE_KEY, userLang);
    } catch (e) {
      // localStorage might be disabled, continue without storing
    }

    // Redirect to the appropriate page
    window.location.replace(targetPage);
  }

  // Execute when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', redirectToLanguage);
  } else {
    redirectToLanguage();
  }

})();

