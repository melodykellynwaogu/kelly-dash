let cart = JSON.parse(localStorage.getItem("cart")) || [];

function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.toggle("translate-x-full");
  drawer.classList.toggle("translate-x-0");
  renderCart();
}

function searchClothes() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const min = parseFloat(document.getElementById("minPrice").value) || 0;
  const max = parseFloat(document.getElementById("maxPrice").value) || Infinity;
  const resultsContainer = document.getElementById("productResults");
  resultsContainer.innerHTML = `<p class="text-center">Searching...</p>`;

  fetch(`https://dummyjson.com/products/search?q=${query}`)
    .then(res => res.json())
    .then(data => {
      const filtered = data.products.filter(p => p.price >= min && p.price <= max);
      if (filtered.length === 0) {
        resultsContainer.innerHTML = `<p class="text-center text-gray-500">No products found.</p>`;
        return;
      }

      resultsContainer.innerHTML = filtered.map(p => `
        <div class="bg-white rounded shadow-md p-4 flex flex-col">
          <img src="${p.thumbnail}" alt="${p.title}" class="rounded h-40 object-cover mb-2" />
          <h3 class="font-bold text-purple-700">${p.title}</h3>
          <p class="text-sm text-gray-600">${p.description.slice(0, 60)}...</p>
          <p class="text-black font-bold mt-2">$${p.price}</p>
          <button onclick='addToCart(${JSON.stringify(p)})' class="mt-auto bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-800 transition">Add to Cart</button>
        </div>
      `).join("");
    })
    .catch(err => {
      console.error(err);
      resultsContainer.innerHTML = `<p class="text-center text-red-500">Failed to fetch products.</p>`;
    });
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="text-center text-gray-500">Your cart is empty.</p>`;
    cartTotal.innerText = "$0";
    updateCartCount();
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
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateQty(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart.splice(index, 1);
  renderCart();
  localStorage.setItem("cart", JSON.stringify(cart));
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").innerText = count;
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  alert("✅ Thank you for your purchase! Your order has been placed.");
  cart = [];
  renderCart();
  updateCartCount();
  localStorage.removeItem("cart");
}
updateCartCount();