function getSessionId() {
  let match = document.cookie.match('(^|;)\\s*cartSessionId\\s*=\\s*([^;]+)');
  if (match) return match.pop();
  // Create a new UUID (can use Date.now + Math.random for simplicity if crypto unavailable)
  const sessionId = (crypto.randomUUID && crypto.randomUUID()) ||
    ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  document.cookie = `cartSessionId=${sessionId}; path=/; max-age=2592000`; // 30 days
  return sessionId;
}

function getCartKey() {
  return `cart_${getSessionId()}`;
}

function getCart() {
  return JSON.parse(localStorage.getItem(getCartKey())) || [];
}

function setCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}



window.searchResults = [];

function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.toggle("translate-x-full");
  drawer.classList.toggle("translate-x-0");
  renderCart();
}

function searchClothes() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultsContainer = document.getElementById("productResults");

  if (!query) {
    resultsContainer.innerHTML = `<p class="text-center text-gray-500">Please enter a search term.</p>`;
    return;
  }

  resultsContainer.innerHTML = `<p class="text-center">Searching...</p>`;

  fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      window.searchResults = data.products;
      const filtered = data.products;

      if (!filtered.length) {
        resultsContainer.innerHTML = `<p class="text-center text-gray-500">No products found for "${query}".</p>`;
        return;
      }

      resultsContainer.innerHTML = filtered.map(p => `
        <div class="bg-white rounded shadow-md p-4 flex flex-col">
          <img src="${p.thumbnail}" alt="${p.title}" class="rounded h-40 object-cover mb-2" />
          <h3 class="font-bold text-purple-700">${p.title}</h3>
          <p class="text-sm text-gray-600">${p.description}</p>
          <p class="text-black font-bold mt-2">$${p.price}</p>
          <button onclick="addToCartById(${p.id})" class="mt-auto bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-800 transition">Add to Cart</button>
        </div>
      `).join("");
    })
    .catch(err => {
      console.error(err);
      resultsContainer.innerHTML = `<p class="text-center text-red-500">Failed to load products.</p>`;
    });
}

function addToCartById(id) {
  const product = window.searchResults.find(p => p.id === id);
  if (product) addToCart(product);
}

function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  setCart(cart);
  updateCartCount();
}

function renderCart() {
  let cart = getCart();
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  cartItems.innerHTML = "";

  if (!cart.length) {
    cartItems.innerHTML = `<p class="text-center text-gray-500">Your cart is empty.</p>`;
    cartTotal.innerText = "$0";
    updateCartCount();
    document.getElementById("buyNowBtn").disabled = true;
    document.getElementById("buyNowBtn").classList.add("opacity-50", "cursor-not-allowed");
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    cartItems.innerHTML += `
      <div class="flex items-start justify-between gap-2 border-b pb-3">
        <img src="${item.thumbnail}" class="w-16 h-16 object-cover rounded" />
        <div class="flex-1">
          <h4 class="font-semibold text-purple-700">${item.title}</h4>
          <p>$${item.price} × ${item.quantity}</p>
          <div class="flex items-center gap-1 mt-2">
            <button onclick="updateQty(${index}, -1)" class="px-2 bg-gray-200 rounded">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateQty(${index}, 1)" class="px-2 bg-gray-200 rounded">+</button>
            <button onclick="removeItem(${index})" class="text-red-600 ml-auto text-sm">Remove</button>
          </div>
        </div>
      </div>
    `;
  });

  cartTotal.innerText = `$${total.toFixed(2)}`;
  updateCartCount();

  // Enable "Buy Now" if cart has items
  const buyBtn = document.getElementById("buyNowBtn");
  buyBtn.disabled = false;
  buyBtn.classList.remove("opacity-50", "cursor-not-allowed");
  setCart(cart);
}

function updateQty(index, change) {
  let cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

function updateCartCount() {
  let cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").innerText = count;
}

function checkout() {
  let cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty!");
    return;
  }

  alert("✅ Thank you for your purchase! Your order has been placed.");
  cart = [];
  setCart(cart);
  renderCart();
  updateCartCount();
  // Optionally: remove cart for this session completely
  // localStorage.removeItem(getCartKey());
}

// Support "Enter" key for search
document.getElementById("searchInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    searchClothes();
  }
});

document.getElementById("searchBtn").addEventListener("click", searchClothes);

// Expose functions for inline events
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.addToCartById = addToCartById;
window.updateQty = updateQty;
window.removeItem = removeItem;
window.renderCart = renderCart;
window.checkout = checkout;
window.updateCartCount = updateCartCount;

// Initial
updateCartCount();