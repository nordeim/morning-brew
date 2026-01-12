document.addEventListener('DOMContentLoaded', function() {

  // ===== MOBILE MENU TOGGLE =====
  class MobileMenu {
    constructor() {
      this.menuToggle = document.querySelector('.menu-toggle');
      this.mobileMenu = document.getElementById('mobile-menu');
      this.mobileMenuClose = document.querySelector('.mobile-menu-close');
      this.mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
      this.body = document.body;
      this.init();
    }

    init() {
      if (!this.menuToggle || !this.mobileMenu) return;
      this.menuToggle.addEventListener('click', () => this.toggle());
      this.mobileMenuClose.addEventListener('click', () => this.toggle());
      this.mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (this.menuToggle.getAttribute('aria-expanded') === 'true') {
            this.toggle();
          }
        });
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.menuToggle.getAttribute('aria-expanded') === 'true') {
          this.toggle();
        }
      });
      this.mobileMenu.addEventListener('click', (e) => {
        if (e.target === this.mobileMenu) {
          this.toggle();
        }
      });
    }

    toggle() {
      const isExpanded = this.menuToggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;
      this.menuToggle.setAttribute('aria-expanded', newState);
      this.mobileMenu.setAttribute('aria-hidden', !newState);
      this.mobileMenu.classList.toggle('active', newState);
      this.body.style.overflow = newState ? 'hidden' : 'auto';
      if (newState) {
        setTimeout(() => {
          this.mobileNavLinks[0]?.focus();
        }, 300);
      }
    }
  }

  new MobileMenu();

  // ===== SCROLL-TRIGGERED ANIMATIONS =====
  class ScrollAnimations {
    constructor() {
      this.elements = document.querySelectorAll('.scroll-animated, .hero-content');
      this.init();
    }

    init() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, {
          root: null,
          rootMargin: '0px',
          threshold: 0.1
        });
        this.elements.forEach(element => observer.observe(element));
      } else {
        this.elements.forEach(element => element.classList.add('visible'));
      }
    }
  }

  new ScrollAnimations();

  // ===== HEADER SCROLL EFFECTS =====
  class HeaderScrollEffects {
    constructor() {
      this.header = document.querySelector('.header');
      this.heroSection = document.querySelector('.hero');
      this.init();
    }

    init() {
      if (!this.header || !this.heroSection) return;
      const heroHeight = this.heroSection.offsetHeight;
      window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        if (scrollY > heroHeight * 0.3) {
          this.header.style.background = 'var(--nav-bg-mobile)';
        } else {
          this.header.style.background = 'var(--nav-bg-desktop)';
        }
      });
      if (window.pageYOffset > heroHeight * 0.3) {
        this.header.style.background = 'var(--nav-bg-mobile)';
      }
    }
  }

  new HeaderScrollEffects();

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== KEYBOARD NAVIGATION TRACKING =====
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

  // ===== INITIAL ANIMATION DELAY =====
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(() => {
      heroContent.classList.add('visible');
    }, 300);
  }

  // ===== CART ICON INTERACTION =====
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', () => {
      const cartOverlay = document.getElementById('cart-overlay');
      if (cartOverlay) {
        const isOpen = cartOverlay.getAttribute('aria-hidden') === 'false';
        cartOverlay.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'auto' : 'hidden';
      }
    });
  }

  // ===== MENU FILTERING =====
  class MenuFilter {
    constructor() {
      this.filterBtns = document.querySelectorAll('.filter-btn');
      this.menuItems = document.querySelectorAll('.menu-item');
      this.init();
    }

    init() {
      this.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.filterMenuItems(e.target);
        });
      });
    }

    filterMenuItems(activeBtn) {
      this.filterBtns.forEach(btn => btn.classList.remove('active'));
      activeBtn.classList.add('active');
      const filter = activeBtn.dataset.filter;
      this.menuItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
          setTimeout(() => {
            item.classList.add('visible');
          }, 50);
        } else {
          item.classList.remove('visible');
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    }
  }

  new MenuFilter();

});
