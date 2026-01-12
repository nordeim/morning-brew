class AccessibilityHelper {
  constructor() {
    this.initKeyboardNavigation();
    this.initScreenReaderAnnouncements();
    this.initReducedMotion();
    this.initEscapeKey();
  }

  initKeyboardNavigation() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    document.querySelectorAll('.cart-overlay, .mobile-menu').forEach(modal => {
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = 'auto';
        }

        if (e.key === 'Tab') {
          const focusable = modal.querySelectorAll(focusableElements);
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      });
    });

    let keyboardNavigation = false;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        keyboardNavigation = true;
        document.documentElement.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      keyboardNavigation = false;
      document.documentElement.classList.remove('keyboard-navigation');
    });
  }

  initScreenReaderAnnouncements() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);

    this.announce = (message) => {
      liveRegion.textContent = message;
    };

    document.addEventListener('cart-updated', (e) => {
      const { items, total } = e.detail;
      this.announce(`${items} items in cart. Total: $${total.toFixed(2)}`);
    });

    document.addEventListener('form-error', (e) => {
      this.announce(`Error: ${e.detail.message}`);
    });
  }

  initReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');

      document.querySelectorAll('.steam-particle, .coffee-beans-animation').forEach(element => {
        element.style.animation = 'none';
      });

      document.querySelectorAll('*').forEach(element => {
        element.style.transition = 'none';
      });
    }
  }

  initEscapeKey() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay && cartOverlay.getAttribute('aria-hidden') === 'false') {
          cartOverlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = 'auto';
        }

        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = 'auto';
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AccessibilityHelper();
});
