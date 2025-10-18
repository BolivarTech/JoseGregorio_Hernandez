/**
 * Language Preference Handler
 *
 * Stores user's language preference when they manually switch languages.
 * This ensures their choice is remembered for future visits.
 */

'use strict';

(function () {
  const LANGUAGE_KEY = 'preferred_language';

  /**
   * Store language preference when user clicks a language link
   */
  function initLanguageSwitcher() {
    const currentPage = window.location.pathname.toLowerCase();
    let currentLang = 'es';

    // Detect current language from page URL
    if (currentPage.includes('_en.html')) {
      currentLang = 'en';
    }

    // Store current language in localStorage
    try {
      localStorage.setItem(LANGUAGE_KEY, currentLang);
    } catch (e) {
      // localStorage might be disabled, continue without storing
    }

    // Add click handlers to language selector links
    const langLinks = document.querySelectorAll('.language-selector a');
    langLinks.forEach(link => {
      link.addEventListener('click', function() {
        const href = this.getAttribute('href');
        let targetLang = 'es';

        // Determine target language from href
        if (href && href.includes('_en.html')) {
          targetLang = 'en';
        }

        // Store the user's preference
        try {
          localStorage.setItem(LANGUAGE_KEY, targetLang);
        } catch (err) {
          // Continue without storing
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
  } else {
    initLanguageSwitcher();
  }

})();
