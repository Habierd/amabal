const products = [
  { id: 1, name: "Kit Uñas Postizas Pastel", category: "unas", categoryLabel: "Uñas postizas", price: 32000, emoji: "💅", description: "Set de 24 uñas tono pastel, limas y adhesivo incluido.", tag: "Nuevo" },
  { id: 2, name: "Adhesivo en Gel para Uñas", category: "unas", categoryLabel: "Adhesivos para uñas", price: 18000, emoji: "✨", description: "Adhesivo en gel de larga duración, cómodo y resistente.", tag: "Top venta" },
  { id: 3, name: "Set Stickers Cute para Uñas", category: "unas", categoryLabel: "Decoración de uñas", price: 15000, emoji: "🌸", description: "Stickers kawaii para personalizar tus diseños.", tag: "Cute" },
  { id: 4, name: "Serum Capilar Reparador", category: "capilar", categoryLabel: "Productos capilares", price: 45000, emoji: "💇‍♀️", description: "Serum ligero para puntas abiertas y frizz.", tag: "Capilar" },
  { id: 5, name: "Mascarilla Hidratante para Cabello", category: "capilar", categoryLabel: "Productos capilares", price: 38000, emoji: "🧴", description: "Mascarilla semanal para brillo y suavidad.", tag: "Hidratación" },
  { id: 6, name: "Gel Limpiador Facial Suave", category: "piel", categoryLabel: "Cuidado de la piel", price: 29000, emoji: "🫧", description: "Ideal para piel mixta, limpia sin resecar.", tag: "Skincare" },
  { id: 7, name: "Crema Hidratante Ligera", category: "piel", categoryLabel: "Cuidado de la piel", price: 31000, emoji: "🌙", description: "Textura gel-crema, rápida absorción.", tag: "Día y noche" },
  { id: 8, name: "Scrunchies y Vinchas Soft", category: "accesorios", categoryLabel: "Accesorios", price: 16000, emoji: "🎀", description: "Pack de scrunchies y vincha para skincare.", tag: "Accesorios" },
  { id: 9, name: "Kit Manicure en Casa", category: "unas", categoryLabel: "Uñas", price: 52000, emoji: "🧰", description: "Cortaúñas, palitos de naranjo, buffers y más.", tag: "Kit" }
];

let filteredCategory = "all";
let searchQuery = "";
let sortMode = "default";
let cart = [];

const formatPrice = (value) =>
  "$" + value.toLocaleString("es-CO", { minimumFractionDigits: 0 });

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const categoryChips = document.getElementById("categoryChips");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const closeCartButton = document.getElementById("closeCartButton");
const backdrop = document.getElementById("backdrop");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");

// ===== ROUTING SPA =====
const routes = {
  "#/": "home",
  "#/productos": "productos",
  "#/categorias": "categorias",
  "#/nosotras": "nosotras",
  "#/contacto": "contacto"
};

function getRouteFromHash() {
  const hash = window.location.hash || "#/";
  return routes[hash] || "home";
}

function showPage(pageId) {
  pages.forEach(page => {
    page.classList.toggle("page--active", page.id === pageId);
  });
}

function updateActiveNavLink() {
  const currentHash = window.location.hash || "#/";
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === currentHash);
  });
}

function handleRouteChange() {
  const pageId = getRouteFromHash();
  showPage(pageId);
  updateActiveNavLink();
  window.scrollTo(0, 0);
  if (pageId === "productos") renderProducts();
}

// ===== PRODUCTOS =====
function getVisibleProducts() {
  let result = [...products];

  if (filteredCategory !== "all") {
    result = result.filter(p => p.category === filteredCategory);
  }

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (sortMode === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (sortMode === "price-desc") result.sort((a, b) => b.price - a.price);
  else if (sortMode === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name, "es"));

  return result;
}

function renderProducts() {
  if (!productGrid || !emptyState) return;
  const items = getVisibleProducts();
  productGrid.innerHTML = "";

  if (items.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  items.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-card__tag">${product.tag}</div>
      <div class="product-card__image">${product.emoji}</div>
      <h3 class="product-card__title">${product.name}</h3>
      <p class="product-card__category">${product.categoryLabel}</p>
      <p class="product-card__desc">${product.description}</p>
      <div class="product-card__bottom">
        <p class="product-card__price">${formatPrice(product.price)} <span>COP</span></p>
        <button class="btn btn-ghost" data-add-to-cart="${product.id}">Agregar</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

// ===== FILTROS =====
if (categoryChips) {
  categoryChips.addEventListener("click", event => {
    const btn = event.target.closest(".chip");
    if (!btn || !btn.dataset.category) return;
    filteredCategory = btn.dataset.category;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("chip--active"));
    btn.classList.add("chip--active");
    renderProducts();
  });
}

if (searchInput) {
  searchInput.addEventListener("input", event => {
    searchQuery = event.target.value;
    if (getRouteFromHash() === "productos") renderProducts();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", event => {
    sortMode = event.target.value;
    renderProducts();
  });
}

// ===== CARRITO =====
function openCart() {
  if (!cartPanel || !backdrop) return;
  cartPanel.classList.add("cart-panel--open");
  backdrop.classList.add("backdrop--visible");
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
  if (!cartPanel || !backdrop) return;
  cartPanel.classList.remove("cart-panel--open");
  backdrop.classList.remove("backdrop--visible");
  cartPanel.setAttribute("aria-hidden", "true");
}

if (cartButton) cartButton.addEventListener("click", openCart);
if (closeCartButton) closeCartButton.addEventListener("click", closeCart);
if (backdrop) backdrop.addEventListener("click", closeCart);

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  if (!cartItemsContainer) return; // ✅ guard añadido

  let totalQty = 0;
  let totalPrice = 0;
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p style="font-size:0.85rem;color:#7a6e78;">Tu carrito está vacío. Agrega algunos productos cute ✨</p>';
  } else {
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      totalQty += item.qty;
      totalPrice += product.price * item.qty; // ✅ corregido: era solo "price"

      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item__image">${product.emoji}</div>
        <div class="cart-item__info">
          <p class="cart-item__title">${product.name}</p>
          <p class="cart-item__meta">${product.categoryLabel}</p>
          <div class="cart-item__qty">
            <button data-decrease="${product.id}">-</button>
            <span>${item.qty}</span>
            <button data-increase="${product.id}">+</button>
            <button data-remove="${product.id}" style="margin-left:8px;font-size:0.7rem;">Quitar</button>
          </div>
        </div>
        <div class="cart-item__price">${formatPrice(product.price * item.qty)}</div>
      `;
      cartItemsContainer.appendChild(row);
    });
  }

  if (cartCount) cartCount.textContent = totalQty;
  if (cartTotal) cartTotal.textContent = formatPrice(totalPrice);
}

if (cartItemsContainer) {
  cartItemsContainer.addEventListener("click", event => {
    const decId = event.target.dataset.decrease;
    const incId = event.target.dataset.increase;
    const remId = event.target.dataset.remove;

    if (decId) {
      const id = Number(decId);
      const item = cart.find(i => i.id === id);
      if (!item) return;
      item.qty -= 1;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      updateCartUI();
    } else if (incId) {
      const id = Number(incId);
      const item = cart.find(i => i.id === id);
      if (!item) return;
      item.qty += 1;
      updateCartUI();
    } else if (remId) {
      cart = cart.filter(i => i.id !== Number(remId));
      updateCartUI();
    }
  });
}

if (productGrid) {
  productGrid.addEventListener("click", event => {
    const btn = event.target.closest("button[data-add-to-cart]");
    if (!btn) return;
    addToCart(Number(btn.dataset.addToCart));
  });
}

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    alert("Esta es una versión demo. Aquí podrías redirigir a un flujo real de pago (Nequi, Daviplata, pasarela, etc.).");
  });
}

// ===== NAVBAR MÓVIL =====
const navbarToggle = document.querySelector(".navbar__toggle");
const navbarLinks = document.querySelector(".navbar__links");

if (navbarToggle && navbarLinks) {
  navbarToggle.addEventListener("click", () => {
    navbarLinks.classList.toggle("navbar__links--open");
  });
  navbarLinks.addEventListener("click", event => {
    if (event.target.tagName.toLowerCase() === "a") {
      navbarLinks.classList.remove("navbar__links--open");
    }
  });
}

// ===== FOOTER AÑO =====
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ===== INICIALIZACIÓN =====
window.addEventListener("hashchange", handleRouteChange);
window.addEventListener("load", handleRouteChange);
renderProducts();
updateCartUI();