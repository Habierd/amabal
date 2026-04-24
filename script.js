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

const formatPrice = v => "$" + v.toLocaleString("es-CO", { minimumFractionDigits: 0 });

// DOM refs
const pages              = document.querySelectorAll(".page");
const navLinks           = document.querySelectorAll(".nav-link");
const productGrid        = document.getElementById("productGrid");
const emptyState         = document.getElementById("emptyState");
const categoryChips      = document.getElementById("categoryChips");
const searchInput        = document.getElementById("searchInput");
const sortSelect         = document.getElementById("sortSelect");
const cartButton         = document.getElementById("cartButton");
const cartPanel          = document.getElementById("cartPanel");
const closeCartButton    = document.getElementById("closeCartButton");
const backdrop           = document.getElementById("backdrop");
const cartCount          = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal          = document.getElementById("cartTotal");
const checkoutButton     = document.getElementById("checkoutButton");

// ── ROUTING ──────────────────────────────────────────────
const routes = { "#/": "home", "#/productos": "productos", "#/categorias": "categorias", "#/nosotras": "nosotras", "#/contacto": "contacto" };

function getPageId() {
  return routes[window.location.hash] || "home";
}

function showPage(id) {
  pages.forEach(p => p.classList.toggle("page--active", p.id === id));
}

function markActiveLink() {
  const hash = window.location.hash || "#/";
  navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === hash));
}

function handleRoute() {
  const id = getPageId();
  showPage(id);
  markActiveLink();
  window.scrollTo(0, 0);
  if (id === "productos") renderProducts();
}

window.addEventListener("hashchange", handleRoute);
window.addEventListener("load", handleRoute);

// ── PRODUCTOS ─────────────────────────────────────────────
function getVisible() {
  let r = [...products];
  if (filteredCategory !== "all") r = r.filter(p => p.category === filteredCategory);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    r = r.filter(p => p.name.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (sortMode === "price-asc")  r.sort((a, b) => a.price - b.price);
  if (sortMode === "price-desc") r.sort((a, b) => b.price - a.price);
  if (sortMode === "name-asc")   r.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return r;
}

function renderProducts() {
  if (!productGrid || !emptyState) return;
  const items = getVisible();
  productGrid.innerHTML = "";
  emptyState.hidden = items.length > 0;
  items.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-card__tag">${p.tag}</div>
      <div class="product-card__image">${p.emoji}</div>
      <h3 class="product-card__title">${p.name}</h3>
      <p class="product-card__category">${p.categoryLabel}</p>
      <p class="product-card__desc">${p.description}</p>
      <div class="product-card__bottom">
        <p class="product-card__price">${formatPrice(p.price)} <span>COP</span></p>
        <button class="btn btn-ghost" data-add-to-cart="${p.id}">Agregar</button>
      </div>`;
    productGrid.appendChild(card);
  });
}

if (categoryChips) {
  categoryChips.addEventListener("click", e => {
    const btn = e.target.closest(".chip");
    if (!btn?.dataset.category) return;
    filteredCategory = btn.dataset.category;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("chip--active"));
    btn.classList.add("chip--active");
    renderProducts();
  });
}
if (searchInput) searchInput.addEventListener("input", e => { searchQuery = e.target.value; if (getPageId() === "productos") renderProducts(); });
if (sortSelect)  sortSelect.addEventListener("change",  e => { sortMode = e.target.value; renderProducts(); });
if (productGrid) productGrid.addEventListener("click",  e => { const b = e.target.closest("[data-add-to-cart]"); if (b) addToCart(Number(b.dataset.addToCart)); });

// ── CARRITO ───────────────────────────────────────────────
function openCart()  { cartPanel?.classList.add("cart-panel--open");    backdrop?.classList.add("backdrop--visible");    cartPanel?.setAttribute("aria-hidden","false"); }
function closeCart() { cartPanel?.classList.remove("cart-panel--open"); backdrop?.classList.remove("backdrop--visible"); cartPanel?.setAttribute("aria-hidden","true"); }

if (cartButton)      cartButton.addEventListener("click", openCart);
if (closeCartButton) closeCartButton.addEventListener("click", closeCart);
if (backdrop)        backdrop.addEventListener("click", closeCart);

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  updateCartUI();
}

function updateCartUI() {
  if (!cartItemsContainer) return;
  let qty = 0, total = 0;
  cartItemsContainer.innerHTML = "";
  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p style="font-size:0.85rem;color:#7a6e78;">Tu carrito está vacío ✨</p>';
  } else {
    cart.forEach(item => {
      const p = products.find(x => x.id === item.id);
      if (!p) return;
      qty   += item.qty;
      total += p.price * item.qty;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item__image">${p.emoji}</div>
        <div class="cart-item__info">
          <p class="cart-item__title">${p.name}</p>
          <p class="cart-item__meta">${p.categoryLabel}</p>
          <div class="cart-item__qty">
            <button data-decrease="${p.id}">−</button>
            <span>${item.qty}</span>
            <button data-increase="${p.id}">+</button>
            <button data-remove="${p.id}" style="margin-left:6px;font-size:0.7rem;background:transparent;border:none;cursor:pointer;color:#c05;">✕</button>
          </div>
        </div>
        <div class="cart-item__price">${formatPrice(p.price * item.qty)}</div>`;
      cartItemsContainer.appendChild(row);
    });
  }
  if (cartCount) cartCount.textContent = qty;
  if (cartTotal) cartTotal.textContent = formatPrice(total);
}

if (cartItemsContainer) {
  cartItemsContainer.addEventListener("click", e => {
    const dec = e.target.closest("[data-decrease]");
    const inc = e.target.closest("[data-increase]");
    const rem = e.target.closest("[data-remove]");
    if (dec) {
      const id = Number(dec.dataset.decrease);
      const item = cart.find(i => i.id === id);
      if (item) { item.qty--; if (item.qty <= 0) cart = cart.filter(i => i.id !== id); updateCartUI(); }
    } else if (inc) {
      const id = Number(inc.dataset.increase);
      const item = cart.find(i => i.id === id);
      if (item) { item.qty++; updateCartUI(); }
    } else if (rem) {
      cart = cart.filter(i => i.id !== Number(rem.dataset.remove));
      updateCartUI();
    }
  });
}

if (checkoutButton) checkoutButton.addEventListener("click", () => {
  cart.length ? alert("Versión demo — aquí integrarías tu pasarela de pago (Nequi, Daviplata, etc.).")
              : alert("Tu carrito está vacío.");
});

// ── NAVBAR MÓVIL ──────────────────────────────────────────
const navbarToggle = document.querySelector(".navbar__toggle");
const navbarLinksEl = document.querySelector(".navbar__links");
if (navbarToggle && navbarLinksEl) {
  navbarToggle.addEventListener("click", () => navbarLinksEl.classList.toggle("navbar__links--open"));
  navbarLinksEl.addEventListener("click", e => { if (e.target.tagName === "A") navbarLinksEl.classList.remove("navbar__links--open"); });
}

// ── FOOTER ────────────────────────────────────────────────
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();

// ── INIT ──────────────────────────────────────────────────
updateCartUI();