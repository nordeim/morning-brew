class CartSystem {
  constructor() {
    this.cart = this.loadCart();
    this.cartOverlay = document.getElementById('cart-overlay');
    this.cartToggle = document.querySelector('.cart-icon');
    this.cartClose = document.querySelector('.cart-close');
    this.cartItemsList = document.querySelector('.cart-items-list');
    this.subtotalElement = document.querySelector('.subtotal-amount');
    this.gstElement = document.querySelector('.gst-amount');
    this.totalElement = document.querySelector('.total-amount');
    this.countBadge = document.querySelector('.cart-count-badge');
    this.cartCount = document.querySelector('.cart-count');
    this.checkoutBtn = document.querySelector('.btn-checkout');
    this.clearCartBtn = document.querySelector('.btn-clear-cart');
    this.cartEmptyState = document.querySelector('.cart-empty');
    this.template = document.getElementById('cart-item-template').content;
    this.init();
  }

  loadCart() {
    try {
      const savedCart = localStorage.getItem('morningBrewCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('morningBrewCart', JSON.stringify(this.cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  init() {
    this.initEventListeners();
    this.renderCart();
  }

  initEventListeners() {
    if (this.cartToggle) {
      this.cartToggle.addEventListener('click', () => this.toggleCart());
    }

    if (this.cartClose) {
      this.cartClose.addEventListener('click', () => this.closeCart());
    }

    if (this.cartOverlay) {
      this.cartOverlay.addEventListener('click', (e) => {
        if (e.target === this.cartOverlay) {
          this.closeCart();
        }
      });
    }

    if (this.clearCartBtn) {
      this.clearCartBtn.addEventListener('click', () => this.clearCart());
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const product = {
          id: button.dataset.product,
          name: button.closest('.menu-item-content').querySelector('.menu-item-title').textContent,
          price: parseFloat(button.dataset.price),
          quantity: 1
        };
        this.addToCart(product);
      });
    });

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
    }
  }

  toggleCart() {
    const isOpen = this.cartOverlay.getAttribute('aria-hidden') === 'false';
    this.cartOverlay.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
    if (!isOpen && this.cart.length === 0) {
      this.showEmptyCart();
    }
  }

  closeCart() {
    this.cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  addToCart(product) {
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      this.cart.push(product);
    }

    this.saveCart();
    this.renderCart();
    this.showCartNotification(product.name);
  }

  updateQuantity(itemId, change) {
    const item = this.cart.find(item => item.id === itemId);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        this.removeItem(itemId);
      } else {
        this.saveCart();
        this.renderCart();
      }
    }
  }

  removeItem(itemId) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.saveCart();
    this.renderCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.renderCart();
  }

  showCartNotification(productName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">✓</div>
        <div class="notification-text">
          <strong>${productName}</strong> added to cart!
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showEmptyCart() {
    this.cartEmptyState.style.display = 'block';
    this.cartItemsContainer = document.querySelector('.cart-items-list');
    this.cartItemsContainer.style.display = 'none';
  }

  hideEmptyCart() {
    this.cartEmptyState.style.display = 'none';
    this.cartItemsContainer = document.querySelector('.cart-items-list');
    this.cartItemsContainer.style.display = 'block';
  }

  renderCart() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    this.countBadge.textContent = totalCount;
    this.cartCount.textContent = totalCount;

    if (this.cart.length === 0) {
      this.showEmptyCart();
      this.checkoutBtn.disabled = true;
    } else {
      this.hideEmptyCart();
      this.checkoutBtn.disabled = false;
    }

    this.cartItemsList.innerHTML = '';

    this.cart.forEach(item => {
      const itemElement = this.template.cloneNode(true);
      const itemNode = itemElement.querySelector('.cart-item');

      itemNode.querySelector('.cart-item-name').textContent = item.name;
      itemNode.querySelector('.cart-item-price').textContent = `$${(item.price * item.quantity).toFixed(2)}`;
      itemNode.querySelector('.cart-item-quantity').textContent = `${item.quantity}x`;
      itemNode.querySelector('.quantity-display').textContent = item.quantity;

      itemNode.querySelector('.minus').dataset.itemId = item.id;
      itemNode.querySelector('.plus').dataset.itemId = item.id;
      itemNode.querySelector('.remove-item').dataset.itemId = item.id;

      this.cartItemsList.appendChild(itemNode);
    });

    this.cartItemsList.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.updateQuantity(itemId, -1);
      });
    });

    this.cartItemsList.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.updateQuantity(itemId, 1);
      });
    });

    this.cartItemsList.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.removeItem(itemId);
      });
    });

    this.updateTotals();
  }

  updateTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * 0.09;
    const total = subtotal + gst;

    this.subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    this.gstElement.textContent = `$${gst.toFixed(2)}`;
    this.totalElement.textContent = `$${total.toFixed(2)}`;
  }

  proceedToCheckout() {
    if (this.cart.length === 0) return;
    this.closeCart();
    alert('Proceeding to checkout...\n\nThis would connect to your payment gateway for PayNow, GrabPay, or credit card processing.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CartSystem();
});
