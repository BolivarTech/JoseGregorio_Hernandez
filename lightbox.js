/**
 * Lightbox Image Viewer for San José Gregorio Hernández Website
 *
 * This script creates a secure, accessible lightbox for viewing images in high resolution.
 * Features:
 *  - Click any image to view full-size version
 *  - Keyboard navigation (Escape to close, Arrow keys for next/prev)
 *  - Touch/swipe support for mobile devices
 *  - Accessible (ARIA labels, focus management)
 *  - Prevents XSS by using DOM APIs instead of innerHTML
 *  - Smooth animations and responsive design
 */

'use strict';

(function () {
  // Configuration
  const CONFIG = {
    animationDuration: 300,
    swipeThreshold: 50,
    preloadAdjacent: true
  };

  let lightbox = null;
  let currentImageIndex = 0;
  let imageElements = [];
  let touchStartX = 0;
  let touchStartY = 0;

  /**
   * Initialize the lightbox when DOM is ready
   */
  function init() {
    // Find all images that should be clickable (exclude small icons/decorative images)
    const selectors = [
      '.main-image',
      '.section-image',
      '.gallery-image'
    ];

    imageElements = Array.from(document.querySelectorAll(selectors.join(', ')))
      .filter(img => img.src && img.src.trim() !== '');

    if (imageElements.length === 0) {
      return; // No images to enhance
    }

    // Create lightbox DOM structure
    createLightboxStructure();

    // Add click handlers to all images
    imageElements.forEach((img, index) => {
      img.style.cursor = 'pointer';
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Ver imagen en tamaño completo: ${img.alt || 'Imagen ' + (index + 1)}`);

      img.addEventListener('click', () => openLightbox(index));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });
  }

  /**
   * Create the lightbox DOM structure safely using DOM APIs
   */
  function createLightboxStructure() {
    // Main container
    lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Visor de imágenes');
    lightbox.style.display = 'none';

    // Overlay (backdrop)
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.addEventListener('click', closeLightbox);

    // Content container
    const content = document.createElement('div');
    content.className = 'lightbox-content';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Cerrar visor de imágenes');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', closeLightbox);

    // Navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav lightbox-prev';
    prevBtn.setAttribute('aria-label', 'Imagen anterior');
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateImage(-1);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav lightbox-next';
    nextBtn.setAttribute('aria-label', 'Imagen siguiente');
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateImage(1);
    });

    // Image container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'lightbox-image-container';

    const img = document.createElement('img');
    img.className = 'lightbox-image';
    img.alt = '';

    imgContainer.appendChild(img);

    // Caption
    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';
    caption.setAttribute('role', 'status');
    caption.setAttribute('aria-live', 'polite');

    // Counter
    const counter = document.createElement('div');
    counter.className = 'lightbox-counter';
    counter.setAttribute('aria-live', 'polite');

    // Assemble the structure
    content.appendChild(closeBtn);
    content.appendChild(prevBtn);
    content.appendChild(nextBtn);
    content.appendChild(imgContainer);
    content.appendChild(caption);
    content.appendChild(counter);

    lightbox.appendChild(overlay);
    lightbox.appendChild(content);

    // Add styles
    addLightboxStyles();

    // Append to body
    document.body.appendChild(lightbox);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Touch events for mobile swipe
    imgContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    imgContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    imgContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  /**
   * Add CSS styles for the lightbox
   */
  function addLightboxStyles() {
    if (document.getElementById('lightbox-styles')) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = 'lightbox-styles';
    style.textContent = `
      .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        opacity: 0;
        transition: opacity ${CONFIG.animationDuration}ms ease;
      }

      .lightbox.active {
        opacity: 1;
      }

      .lightbox-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
      }

      .lightbox-content {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 20px 80px;
      }

      .lightbox-image-container {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .lightbox-image {
        max-width: 100%;
        max-height: 80vh;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        transform: scale(0.9);
        transition: transform ${CONFIG.animationDuration}ms ease;
      }

      .lightbox.active .lightbox-image {
        transform: scale(1);
      }

      .lightbox-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 36px;
        line-height: 1;
        cursor: pointer;
        z-index: 10001;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 300;
      }

      .lightbox-close:hover,
      .lightbox-close:focus {
        background: #fff;
        transform: scale(1.1);
        outline: 2px solid #667eea;
      }

      .lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 48px;
        line-height: 1;
        cursor: pointer;
        z-index: 10001;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 300;
      }

      .lightbox-prev {
        left: 20px;
      }

      .lightbox-next {
        right: 20px;
      }

      .lightbox-nav:hover,
      .lightbox-nav:focus {
        background: #fff;
        transform: translateY(-50%) scale(1.1);
        outline: 2px solid #667eea;
      }

      .lightbox-nav:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .lightbox-nav:disabled:hover {
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.9);
      }

      .lightbox-caption {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        max-width: 80%;
        text-align: center;
        font-size: 16px;
        line-height: 1.4;
      }

      .lightbox-counter {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
      }

      @media (max-width: 768px) {
        .lightbox-content {
          padding: 80px 10px 100px;
        }

        .lightbox-close {
          top: 10px;
          right: 10px;
          width: 45px;
          height: 45px;
          font-size: 32px;
        }

        .lightbox-nav {
          width: 45px;
          height: 45px;
          font-size: 40px;
        }

        .lightbox-prev {
          left: 10px;
        }

        .lightbox-next {
          right: 10px;
        }

        .lightbox-caption {
          font-size: 14px;
          padding: 10px 16px;
          max-width: 90%;
        }

        .lightbox-image {
          max-height: 70vh;
        }
      }

      /* Prevent body scroll when lightbox is open */
      body.lightbox-open {
        overflow: hidden;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Open the lightbox with the specified image
   */
  function openLightbox(index) {
    currentImageIndex = index;

    const img = imageElements[index];
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    const counter = lightbox.querySelector('.lightbox-counter');

    // Set image source - use the same source or a high-res variant if available
    // You can modify this to use data-fullsize attribute for higher resolution versions
    lightboxImg.src = img.getAttribute('data-fullsize') || img.src;
    lightboxImg.alt = img.alt || 'Imagen';

    // Set caption (from alt or adjacent caption element)
    caption.textContent = img.alt || '';

    // Set counter
    counter.textContent = `${index + 1} / ${imageElements.length}`;

    // Update navigation buttons
    updateNavigationButtons();

    // Show lightbox
    lightbox.style.display = 'block';
    document.body.classList.add('lightbox-open');

    // Force reflow then add active class for animation
    lightbox.offsetHeight;
    lightbox.classList.add('active');

    // Focus the close button for accessibility
    lightbox.querySelector('.lightbox-close').focus();

    // Preload adjacent images
    if (CONFIG.preloadAdjacent) {
      preloadAdjacentImages(index);
    }
  }

  /**
   * Close the lightbox
   */
  function closeLightbox() {
    lightbox.classList.remove('active');

    setTimeout(() => {
      lightbox.style.display = 'none';
      document.body.classList.remove('lightbox-open');

      // Return focus to the original image
      if (imageElements[currentImageIndex]) {
        imageElements[currentImageIndex].focus();
      }
    }, CONFIG.animationDuration);
  }

  /**
   * Navigate to next/previous image
   */
  function navigateImage(direction) {
    const newIndex = currentImageIndex + direction;

    if (newIndex >= 0 && newIndex < imageElements.length) {
      openLightbox(newIndex);
    }
  }

  /**
   * Update navigation button states
   */
  function updateNavigationButtons() {
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === imageElements.length - 1;

    // Hide buttons if only one image
    if (imageElements.length === 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }
  }

  /**
   * Preload adjacent images for smoother navigation
   */
  function preloadAdjacentImages(index) {
    const preloadIndexes = [index - 1, index + 1];

    preloadIndexes.forEach(i => {
      if (i >= 0 && i < imageElements.length) {
        const preloadImg = new Image();
        preloadImg.src = imageElements[i].getAttribute('data-fullsize') || imageElements[i].src;
      }
    });
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyPress(e) {
    if (lightbox.style.display === 'none') {
      return;
    }

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigateImage(-1);
        break;
      case 'ArrowRight':
        navigateImage(1);
        break;
    }
  }

  /**
   * Touch event handlers for mobile swipe
   */
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) {
      return;
    }

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Prevent vertical scroll if horizontal swipe is detected
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (!touchStartX || !touchStartY) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Check if horizontal swipe (and not vertical scroll)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > CONFIG.swipeThreshold) {
      if (diffX > 0) {
        // Swipe left - next image
        navigateImage(1);
      } else {
        // Swipe right - previous image
        navigateImage(-1);
      }
    }

    touchStartX = 0;
    touchStartY = 0;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

