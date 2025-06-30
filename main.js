// Cart initialization
let cart = JSON.parse(localStorage.getItem("cart")) || [];
window.searchResults = [];

// Toggle cart drawer
function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.toggle("translate-x-full");
  drawer.classList.toggle("translate-x-0");
  renderCart();
}

// Search for clothes/products
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

// Add to cart by product ID (safer than passing product object in HTML)
function addToCartById(id) {
  const product = window.searchResults.find(p => p.id === id);
  if (product) addToCart(product);
}

// Add product to cart
function addToCart(product) {
  // Ensure cart is up-to-date
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Render cart drawer items and total
function renderCart() {
  // Always reload cart from localStorage
  cart = JSON.parse(localStorage.getItem("cart")) || [];
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
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update product quantity in cart
function updateQty(index, change) {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart[index]) return;
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart.splice(index, 1);
  renderCart();
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Remove an item from the cart
function removeItem(index) {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  renderCart();
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart count badge in nav
function updateCartCount() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").innerText = count;
}

// Checkout function, clears cart
function checkout() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) {
    alert("Your cart is empty!");
    return;
  }

  alert("✅ Thank you for your purchase! Your order has been placed.");
  cart = [];
  renderCart();
  updateCartCount();
  localStorage.removeItem("cart");
}

// Support "Enter" key for search
document.getElementById("searchInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    searchClothes();
  }
});

// Search button click
document.getElementById("searchBtn").addEventListener("click", searchClothes);

// Make all functions globally accessible for inline HTML events
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.addToCartById = addToCartById;
window.updateQty = updateQty;
window.removeItem = removeItem;
window.renderCart = renderCart;
window.checkout = checkout;
window.updateCartCount = updateCartCount;

// Initial cart badge update on page load
updateCartCount();