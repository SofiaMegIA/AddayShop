// ============================================================
// ADDAY SHOP — app.js
// SPA: Home → Categoría → Producto → Carrito
// ============================================================

// ---- STORAGE HELPERS ----
const _lsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };

const DEFAULT_SETTINGS = {
  waNumber: '573332259912', instagram: 'addayshop',
  heroTitle: 'Bienestar y belleza que se sienten bien',
  heroDesc: 'Naturistas, vitaminas, cuidado personal y mucho más. Calidad de verdad, a un mensaje de distancia.',
  accent: 'neon',
};
const DEFAULT_MODULES = { hero:true, trust:true, categories:true, flashsale:true, bestsellers:true, cta:false };

const getStoreSettings  = () => Object.assign({}, DEFAULT_SETTINGS, _lsGet('adday_settings') || {});
const getStoreModules   = () => Object.assign({}, DEFAULT_MODULES,  _lsGet('adday_modules')  || {});
const getStoreProducts  = () => _lsGet('adday_products')   || FALLBACK_PRODUCTS;
const getStoreCategories= () => _lsGet('adday_categories') || FALLBACK_CATEGORIES;

const WA       = getStoreSettings().waNumber;
const WA_PLAIN = `https://wa.me/${WA}`;

// ---- DATOS DE PRODUCTOS (fallback) ----
const FALLBACK_PRODUCTS = [
  { id: 1, brand: 'Adday Vital',  name: 'Vitamina C Efervescente 1000mg',    price: 24900, old: 32900, tag: 'Oferta',       tint: 'mint',  rating: 4.8, count: 214 },
  { id: 2, brand: 'Pure Glow',    name: 'Sérum Facial Vitamina E · 30ml',    price: 38900, old: 49900, tag: 'Más vendido',  tint: 'pink',  rating: 4.9, count: 389 },
  { id: 3, brand: 'NaturActive',  name: 'Magnesio + Zinc · 120 cápsulas',   price: 45900, old: null,  tag: 'Nuevo',        tint: 'lilac', rating: 4.7, count: 96  },
  { id: 4, brand: 'Adday Care',   name: 'Crema Hidratante Natural · 200ml', price: 29900, old: 35900, tag: 'Oferta',       tint: 'mint',  rating: 4.6, count: 142 },
  { id: 5, brand: 'BioCol',       name: 'Colágeno Hidrolizado + Vit C',     price: 59900, old: null,  tag: 'Más vendido',  tint: 'pink',  rating: 4.9, count: 502 },
  { id: 6, brand: 'Esencia',      name: 'Aceite Esencial de Lavanda · 15ml',price: 19900, old: null,  tag: 'Nuevo',        tint: 'lilac', rating: 4.5, count: 73  },
  { id: 7, brand: 'SunCare',      name: 'Protector Solar SPF 50+',          price: 42900, old: 52900, tag: 'Oferta',       tint: 'pink',  rating: 4.8, count: 267 },
  { id: 8, brand: 'Adday Vital',  name: 'Omega 3 · 1000mg · 90 softgels',  price: 49900, old: 64900, tag: 'Oferta',       tint: 'lilac', rating: 4.7, count: 188 },
  { id: 9, brand: 'Herbal',       name: 'Té Verde Detox · 30 sobres',       price: 17900, old: null,  tag: null,           tint: 'mint',  rating: 4.6, count: 120 },
  { id: 10, brand: 'Adday Care',  name: 'Shampoo Sólido Natural',           price: 22900, old: null,  tag: 'Nuevo',        tint: 'mint',  rating: 4.5, count: 64  },
];

const FALLBACK_CATEGORIES = [
  { name: 'Naturistas',      bg: '#E7F8EE' },
  { name: 'Medicinales',     bg: '#E6F0FF' },
  { name: 'Belleza',         bg: '#FFE9F3' },
  { name: 'Vitaminas',       bg: '#F4FFC2' },
  { name: 'Suplementos',     bg: '#EFEAFE' },
  { name: 'Cosméticos',      bg: '#FFEAD9' },
  { name: 'Cuidado Personal',bg: '#E7F8EE' },
  { name: 'Higiene',         bg: '#E6F0FF' },
  { name: 'Hogar',           bg: '#F2F2EE' },
  { name: 'Accesorios',      bg: '#FFE9F3' },
];

// ---- ESTADO ----
const state = {
  screen: 'home',
  cart: [],
  currentProduct: 2,
  currentCategory: 'Belleza',
};

// ---- HELPERS ----
const cop = n => '$' + Number(n).toLocaleString('es-CO');

const tintBg = t => ({ mint: '#E7F8EE', pink: '#FFE9F3', lilac: '#EFEAFE' }[t] || '#F2F2EE');

const tagStyle = tag => ({
  'Oferta':      { bg: '#FF2E9A', color: '#fff' },
  'Nuevo':       { bg: '#E3FF12', color: '#111113' },
  'Más vendido': { bg: '#111113', color: '#E3FF12' },
}[tag] || { bg: 'transparent', color: '#111113' });

const cartCount = () => state.cart.reduce((s, i) => s + i.qty, 0);
const cartTotal = () => state.cart.reduce((s, i) => s + i.price * i.qty, 0);

// ---- NAVEGACIÓN ----
const navigate = (screen, extra = {}) => {
  Object.assign(state, { screen, ...extra });
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.navigate = navigate;

// ---- CARRITO ----
const addToCart = id => {
  const existing = state.cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else {
    const p = getStoreProducts().find(p => p.id === id);
    if (p) state.cart.push({ ...p, qty: 1 });
  }
  updateCartBadge();
  showToast('¡Producto agregado! 🛒');
};
window.addToCart = addToCart;

const updateCartQty = (idx, delta) => {
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
  updateCartBadge();
  render();
};
window.updateCartQty = updateCartQty;

const removeCartItem = idx => {
  state.cart.splice(idx, 1);
  updateCartBadge();
  render();
};
window.removeCartItem = removeCartItem;

const updateCartBadge = () => {
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = cartCount();
};

const buildWAMessage = () => {
  const name  = document.getElementById('cart-name')?.value  || '';
  const notes = document.getElementById('cart-notes')?.value || '';
  let msg = '¡Hola Adday Shop! Quiero realizar este pedido:\n\n';
  state.cart.forEach(i => { msg += `• ${i.qty}x ${i.name} — ${cop(i.price * i.qty)}\n`; });
  msg += `\nTotal: ${cop(cartTotal())}\nNombre: ${name}\nObservaciones: ${notes}`;
  return msg;
};

const updateWAHref = el => {
  const waNum = getStoreSettings().waNumber;
  el.href = `https://wa.me/${waNum}?text=${encodeURIComponent(buildWAMessage())}`;
};
window.updateWAHref = updateWAHref;

// ---- TOAST ----
const showToast = msg => {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
      background:#111113;color:#E3FF12;padding:12px 22px;border-radius:999px;
      font-weight:700;font-size:13.5px;z-index:999;
      transition:opacity .3s;font-family:'Plus Jakarta Sans',sans-serif;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
};

// ============================================================
// COMPONENTES HTML
// ============================================================

// ---- PRODUCTO CARD ----
const ProductCard = p => {
  const oldPrice = p.oldPrice || p.old || null;
  const bg  = p.img ? null : tintBg(p.tint);
  const tag = p.tag ? tagStyle(p.tag) : null;
  const hasOld = !!oldPrice;
  const disc = hasOld ? Math.round((oldPrice - p.price) / oldPrice * 100) : 0;
  const waNum = getStoreSettings().waNumber;
  return `
    <div class="product-card" onclick="navigate('product',{currentProduct:${p.id}})">
      <div class="product-card__img"${bg ? ` style="background-color:${bg}"` : ''}>
        ${p.img ? `<img src="${p.img}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">` : ''}
        ${p.tag ? `<span class="product-card__tag" style="background:${tag.bg};color:${tag.color}">${p.tag}</span>` : ''}
        <button class="product-card__share" onclick="event.stopPropagation()" title="Compartir">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/>
            <path d="M8 11l8-4M8 13l8 4"/>
          </svg>
        </button>
      </div>
      <div class="product-card__body">
        <div class="product-card__brand">${p.brand}</div>
        <div class="product-card__name">${p.name}</div>
        ${p.rating ? `<div class="product-card__rating">★ ${p.rating} <span>(${p.count})</span></div>` : ''}
        <div class="product-card__price">
          <span class="product-card__price-main">${cop(p.price)}</span>
          ${hasOld ? `<span class="product-card__price-old">${cop(oldPrice)}</span>` : ''}
          ${disc  > 0 ? `<span class="product-card__price-discount">-${disc}%</span>` : ''}
        </div>
        <div class="product-card__actions">
          <button class="btn-add" onclick="event.stopPropagation();addToCart(${p.id})">Agregar</button>
          <button class="btn-quick" onclick="event.stopPropagation();window.open('https://wa.me/${waNum}','_blank')" title="Compra rápida">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
          </button>
        </div>
      </div>
    </div>`;
};

// ---- HEADER ----
const Header = () => `
  <header class="header">
    <div class="header__top">
      <div class="container">
        <a href="#" onclick="navigate('home');return false" class="logo">
          <div class="logo__badge">
            <span class="logo__letters"><em>A</em>S</span>
          </div>
          <span class="logo__text">ADDAY<small>SHOP</small></span>
        </a>
        <div class="search-bar">
          <input type="search" placeholder="Busca productos, marcas y categorías…" />
          <button>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>
            </svg>
            Buscar
          </button>
        </div>
        <div class="header__actions">
          <a href="${WA_PLAIN}" target="_blank" class="btn-wa">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 14.4c-.3-.15-1.8-.9-2.1-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51l-.58-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.8-.74 2.05-1.45.25-.7.25-1.31.18-1.44-.07-.13-.27-.2-.57-.35z M12 2a10 10 0 0 0-8.6 15.07L2 22l5.07-1.33A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.93-.2-.3A8.2 8.2 0 1 1 12 20.2z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
          <a href="https://instagram.com/addayshop" target="_blank" class="icon-btn" title="Instagram">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="5.4"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <button class="icon-btn" title="Mi perfil">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
            </svg>
          </button>
          <button class="cart-btn" onclick="navigate('cart')" title="Carrito">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
              <path d="M2 3h3l2.4 11.4a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>
            </svg>
            <span id="cart-badge">${cartCount()}</span>
          </button>
          <a href="admin.html" class="admin-access-btn" title="Panel de administración">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            <span>Admin</span>
          </a>
        </div>
      </div>
    </div>
    <nav class="header__nav">
      <div class="container">
        ${getStoreCategories().map(c =>
          `<button class="nav-btn" onclick="navigate('cat',{currentCategory:'${c.name}'})">${c.name}</button>`
        ).join('')}
      </div>
    </nav>
  </header>`;

// ---- FOOTER ----
const Footer = () => {
  const s    = getStoreSettings();
  const cats = getStoreCategories();
  const waLink  = `https://wa.me/${s.waNumber}`;
  const igHandle= s.instagram || '@addayshop';
  const igSlug  = igHandle.replace('@','');
  return `
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <div class="footer__logo">ADDAY<span>SHOP</span></div>
        <p>Tu tienda de bienestar, belleza y salud. Productos originales y atención cercana.</p>
        <div class="footer__socials">
          <a href="${waLink}" target="_blank" class="footer__social footer__social--wa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.07L2 22l5.07-1.33A10 10 0 1 0 12 2z"/>
            </svg>
          </a>
          <a href="https://instagram.com/${igSlug}" target="_blank" class="footer__social footer__social--ig">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="3" width="18" height="18" rx="5.4"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
        </div>
      </div>
      <div class="footer__col">
        <h4>Categorías</h4>
        ${cats.slice(0,5).map(c =>
          `<a href="#" onclick="navigate('cat',{currentCategory:'${c.name}'});return false">${c.name}</a>`
        ).join('')}
      </div>
      <div class="footer__col">
        <h4>Ayuda</h4>
        ${['Cómo comprar','Envíos y entregas','Medios de pago','Preguntas frecuentes','Contáctanos'].map(h =>
          `<a href="#">${h}</a>`
        ).join('')}
      </div>
      <div class="footer__col">
        <h4>Contáctanos</h4>
        <p>WhatsApp: ${s.waNumber}<br>Instagram: ${igHandle}<br>Lun–Sáb · 8am–7pm</p>
        <a href="${waLink}" target="_blank" class="btn-escribenos">Escríbenos</a>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="footer__inner">
        <span>© 2026 Adday Shop. Todos los derechos reservados.</span>
        <span>Hecho con cariño para tu bienestar.</span>
      </div>
    </div>
  </footer>`;
};

// ---- WA FAB ----
const WaFab = () => {
  const waLink = `https://wa.me/${getStoreSettings().waNumber}`;
  return `
  <a href="${waLink}" target="_blank" class="wa-fab" title="Escríbenos por WhatsApp">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.15-1.8-.9-2.1-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51l-.58-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.8-.74 2.05-1.45.25-.7.25-1.31.18-1.44-.07-.13-.27-.2-.57-.35z M12 2a10 10 0 0 0-8.6 15.07L2 22l5.07-1.33A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.93-.2-.3A8.2 8.2 0 1 1 12 20.2z"/>
    </svg>
  </a>`;
};

// ============================================================
// PÁGINAS
// ============================================================

// ---- HOME ----
const HomePage = () => {
  const prods   = getStoreProducts();
  const cats    = getStoreCategories();
  const mods    = getStoreModules();
  const s       = getStoreSettings();
  const waLink  = `https://wa.me/${s.waNumber}`;
  const igHandle= s.instagram || '@addayshop';
  const igSlug  = igHandle.replace('@','');
  const offerProds    = prods.filter(p => p.tag === 'Oferta').slice(0, 5);
  const bestProds     = prods.filter(p => p.tag === 'Más vendido').slice(0, 6);
  const fallbackProds = prods.slice(0, 5);
  return `
  <main class="page-home fade-in">

    ${mods.hero ? `<section class="hero-section">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-main">
            <span class="hero-label">NUEVA TEMPORADA</span>
            <h1>${s.heroTitle}</h1>
            <p>${s.heroDesc}</p>
            <div class="hero-actions">
              <button class="btn-primary" onclick="navigate('cat',{currentCategory:'${cats[2]?.name||'Belleza'}'})"  >Comprar ahora</button>
              <button class="btn-outline-light" onclick="navigate('cat',{currentCategory:'${cats[0]?.name||'Naturistas'}'})">Ver categorías</button>
            </div>
            <div class="hero-deco"></div>
          </div>
          <div class="hero-side">
            <div class="promo-card promo-card--pink" onclick="navigate('cat',{currentCategory:'${cats[2]?.name||'Belleza'}'})">
              <span class="promo-label">${(cats[2]?.name||'BELLEZA').toUpperCase()}</span>
              <div class="promo-title">Hasta 40% OFF</div>
              <span>Ver ofertas →</span>
            </div>
            <div class="promo-card promo-card--neon" onclick="navigate('cat',{currentCategory:'${cats[3]?.name||'Vitaminas'}'})">
              <span class="promo-label promo-label--dark">${(cats[3]?.name||'VITAMINAS').toUpperCase()}</span>
              <div class="promo-title">Lleva 2, paga 1</div>
              <span>Aprovechar →</span>
            </div>
          </div>
        </div>
      </div>
    </section>` : ''}

    ${mods.trust ? `<div class="trust-bar">
      <div class="trust-bar__inner container">
        <div class="trust-item"><div class="trust-icon">➜</div><div><strong>Envío a todo el país</strong><span>Rápido y seguro</span></div></div>
        <div class="trust-item"><div class="trust-icon">$</div><div><strong>Pago contra entrega</strong><span>o por WhatsApp</span></div></div>
        <div class="trust-item"><div class="trust-icon">✓</div><div><strong>100% originales</strong><span>Productos certificados</span></div></div>
        <div class="trust-item"><div class="trust-icon">♥</div><div><strong>Atención cercana</strong><span>Te asesoramos siempre</span></div></div>
      </div>
    </div>` : ''}

    ${mods.categories ? `<section class="container section-spaced">
      <div class="section-header">
        <h2 class="section-title">Compra por categoría</h2>
        <a onclick="navigate('cat',{currentCategory:'${cats[0]?.name||'Belleza'}'})" class="see-all">Ver todas →</a>
      </div>
      <div class="cat-grid">
        ${cats.map(c => `
          <button class="cat-btn" style="background:${c.color||c.bg||'#F2F2EE'}" onclick="navigate('cat',{currentCategory:'${c.name}'})">
            <div class="cat-btn__icon">${c.emoji||''}</div>
            <span class="cat-btn__name">${c.name}</span>
            <span class="cat-btn__cta">Ver productos →</span>
          </button>`).join('')}
      </div>
    </section>` : ''}

    ${mods.flashsale ? `<section class="container section-spaced">
      <div class="section-header">
        <h2 class="section-title">Ofertas del día</h2>
        <span class="countdown" id="countdown">Cargando…</span>
        <a onclick="navigate('cat',{currentCategory:'${cats[0]?.name||'Belleza'}'})" class="see-all">Ver más →</a>
      </div>
      <div class="products-grid">
        ${(offerProds.length ? offerProds : fallbackProds).map(ProductCard).join('')}
      </div>
    </section>` : ''}

    ${mods.bestsellers ? `<section class="container section-spaced">
      <h2 class="section-title" style="margin-bottom:20px">Más vendidos</h2>
      <div class="products-grid">
        ${(bestProds.length ? bestProds : prods.slice(4,10)).map(ProductCard).join('')}
      </div>
    </section>` : ''}

    ${mods.cta ? `<section class="cta-section container" style="padding-bottom:54px">
      <div class="cta-grid">
        <div class="cta-wa">
          <h2>Compra fácil, <span>paga por WhatsApp</span></h2>
          <p>Arma tu pedido y nosotros te lo confirmamos al instante. Pago contra entrega disponible.</p>
          <a href="${waLink}" target="_blank" class="btn-wa-lg">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.07L2 22l5.07-1.33A10 10 0 1 0 12 2z"/></svg>
            Escríbenos ahora
          </a>
        </div>
        <div class="cta-ig">
          <div class="cta-ig__handle">${igHandle}</div>
          <p>Síguenos para ofertas, novedades y tips de bienestar.</p>
          <a href="https://instagram.com/${igSlug}" target="_blank" class="btn-ig">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="3" width="18" height="18" rx="5.4"/><circle cx="12" cy="12" r="4"/>
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/>
            </svg>
            Seguir en Instagram
          </a>
        </div>
      </div>
    </section>` : ''}

  </main>`; };

// ---- CATEGORÍA ----
const CategoryPage = () => {
  const cat   = state.currentCategory || 'Belleza';
  const prods = getStoreProducts();
  const cats  = getStoreCategories();
  const catProds = prods.filter(p => p.category === cat);
  const displayProds = catProds.length ? catProds : prods;
  const brands = [...new Set(prods.map(p => p.brand))].slice(0, 6);
  return `
    <main class="page-cat fade-in">
      <div class="container">
        <div class="breadcrumb">Inicio <span>/</span> <strong>${cat}</strong></div>
        <div class="cat-header">
          <div>
            <h1>${cat}</h1>
            <span class="cat-count">${displayProds.length} productos</span>
          </div>
          <div class="sort-row">
            <span>Ordenar por</span>
            <select>
              <option>Relevancia</option>
              <option>Menor precio</option>
              <option>Mayor precio</option>
              <option>Más vendidos</option>
            </select>
          </div>
        </div>
        <div class="cat-layout">
          <aside class="cat-aside">
            <div class="aside-header">
              <span>Filtros</span>
              <a class="clear-link">Limpiar</a>
            </div>
            <div class="aside-section">
              <div class="aside-title">Categoría</div>
              ${cats.map(c => `
                <label class="filter-label">
                  <input type="checkbox" ${c.name === cat ? 'checked' : ''} />
                  ${c.name}
                </label>`).join('')}
            </div>
            <div class="aside-section">
              <div class="aside-title">Marca</div>
              ${brands.map(b => `
                <label class="filter-label">
                  <input type="checkbox" /> ${b}
                </label>`).join('')}
            </div>
            <div class="aside-section">
              <div class="aside-title">Precio</div>
              <div class="price-range">
                <input type="number" placeholder="Mín" />
                <span>—</span>
                <input type="number" placeholder="Máx" />
              </div>
            </div>
            <div class="aside-section">
              ${['En oferta','Más vendidos','Solo disponibles'].map(t => `
                <label class="filter-label">
                  <input type="checkbox" /> ${t}
                </label>`).join('')}
            </div>
            <button class="btn-apply-filter">Aplicar filtros</button>
          </aside>
          <div>
            <div class="active-filters">
              <span class="filter-tag filter-tag--active">${cat} ✕</span>
            </div>
            <div class="products-grid products-grid--cat">
              ${displayProds.map(ProductCard).join('')}
            </div>
          </div>
        </div>
      </div>
    </main>`;
};

// ---- PRODUCTO ----
const ProductPage = () => {
  const prods  = getStoreProducts();
  const s      = getStoreSettings();
  const p      = prods.find(x => x.id === state.currentProduct) || prods[0];
  if (!p) return '<main class="page-product fade-in"><div class="container" style="padding:80px 0;text-align:center"><p>Producto no encontrado.</p></div></main>';
  const oldPrice = p.oldPrice || p.old || null;
  const bg   = p.img ? null : tintBg(p.tint);
  const hasOld = !!oldPrice;
  const disc = hasOld ? Math.round((oldPrice - p.price) / oldPrice * 100) : 0;
  const waLink = `https://wa.me/${s.waNumber}`;
  const related = prods.filter(x => x.id !== p.id).slice(0, 5);
  const similar = prods.filter(x => x.id !== p.id).slice(2, 7);
  const thumbs  = ['#FFE9F3','#EFEAFE','#E7F8EE','#FFEAD9'];

  const descMap = {
    1: 'Efervescente con 1000mg de Vitamina C de absorción rápida. Ideal para reforzar el sistema inmune, combatir el cansancio y proteger tu piel.',
    2: 'Sérum facial ligero formulado con activos naturales que nutren, hidratan y devuelven la luminosidad a tu piel desde el primer uso.',
    3: 'Suplemento de Magnesio y Zinc en cápsulas de alta biodisponibilidad. Apoya la función muscular, el sueño y el sistema inmunitario.',
    default: 'Producto de alta calidad, certificado y original. Seleccionado por el equipo de Adday Shop para tu bienestar diario.',
  };
  const desc = descMap[p.id] || descMap.default;

  return `
    <main class="page-product fade-in">
      <div class="container">
        <div class="breadcrumb">Inicio <span>/</span> ${p.brand} <span>/</span> <strong>${p.name}</strong></div>
        <div class="product-layout">
          <div class="product-gallery">
            <div class="product-main-img"${bg ? ` style="background-color:${bg}"` : ''}>
              ${p.img ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:16px">` : `<div class="product-img-placeholder"></div>`}
              ${p.tag ? `<span class="product-badge product-badge--dark">${p.tag.toUpperCase()}</span>` : ''}
            </div>
            <div class="product-thumbs">
              ${thumbs.map((t, i) =>
                `<div class="product-thumb${i === 0 ? ' product-thumb--active' : ''}" style="background-color:${t}"></div>`
              ).join('')}
            </div>
          </div>
          <div class="product-info">
            <div class="product-brand-label">${p.brand}</div>
            <h1 class="product-title">${p.name}</h1>
            <div class="product-meta">
              <span class="product-rating">★ ${p.rating} <span>(${p.count})</span></span>
              <span>· ${p.count + 100} vendidos</span>
              <span class="product-stock">En stock</span>
            </div>
            <div class="product-price">
              <span class="product-price-main">${cop(p.price)}</span>
              ${hasOld ? `<span class="product-price-old">${cop(oldPrice)}</span>` : ''}
              ${disc > 0 ? `<span class="product-price-badge">-${disc}%</span>` : ''}
            </div>
            ${hasOld ? `<div class="product-saving">Ahorras ${cop(oldPrice - p.price)}</div>` : ''}
            <div class="product-features">
              <div class="feature-item"><span class="check">✓</span>Producto 100% original y certificado</div>
              <div class="feature-item"><span class="check">✓</span>Asesoría cercana por WhatsApp</div>
              <div class="feature-item"><span class="check">✓</span>Envío a todo el país, 2–4 días</div>
            </div>
            <div class="qty-row">
              <div class="qty-control">
                <button id="qty-minus" onclick="changeQty(-1)">−</button>
                <span id="qty-val">1</span>
                <button id="qty-plus" onclick="changeQty(1)">+</button>
              </div>
              <span class="qty-stock">12 disponibles</span>
            </div>
            <div class="product-actions">
              <button class="btn-add-product" onclick="addToCart(${p.id});navigate('cart')">Agregar al carrito</button>
              <a href="${waLink}" target="_blank" class="btn-buy-wa">Compra rápida</a>
              <button class="btn-share" title="Compartir">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/>
                  <path d="M8 11l8-4M8 13l8 4"/>
                </svg>
              </button>
            </div>
            <div class="product-delivery">
              <div><strong>Envío nacional</strong><br>Llega en 2–4 días</div>
              <div><strong>Pago contra entrega</strong><br>o por WhatsApp</div>
              <div><strong>100% original</strong><br>Garantía Adday</div>
            </div>
          </div>
        </div>

        <div class="info-blocks">
          ${[
            { title: 'Descripción',     body: desc },
            { title: 'Beneficios',      body: 'Resultados visibles desde las primeras semanas de uso. Mejora tu bienestar general con ingredientes seleccionados y formulaciones de alta calidad.' },
            { title: 'Ingredientes',    body: 'Ingredientes naturales y certificados, sin parabenos ni aditivos dañinos. Formulado para todo tipo de piel y condición.' },
            { title: 'Modo de uso',     body: 'Sigue las indicaciones del empaque. Para consultas personalizadas, escríbenos por WhatsApp y te asesoramos.' },
            { title: 'Recomendaciones', body: 'Conservar en lugar fresco y seco, lejos de la luz directa. Mantener fuera del alcance de los niños.' },
          ].map(b => `
            <div class="info-block">
              <h3>${b.title}</h3>
              <p>${b.body}</p>
            </div>`).join('')}
        </div>

        <section class="related-section">
          <h2>Productos relacionados</h2>
          <div class="products-grid">${related.map(ProductCard).join('')}</div>
        </section>
        <section class="related-section">
          <h2>También te puede gustar</h2>
          <div class="products-grid">${similar.map(ProductCard).join('')}</div>
        </section>
      </div>
    </main>`;
};

const changeQty = delta => {
  const el = document.getElementById('qty-val');
  if (el) el.textContent = Math.max(1, parseInt(el.textContent) + delta);
};
window.changeQty = changeQty;

// ---- CARRITO ----
const CartPage = () => {
  const items  = state.cart;
  const total  = cartTotal();
  const waNum  = getStoreSettings().waNumber;
  const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent(buildWAMessage())}`;

  const itemsHTML = items.length === 0
    ? `<div style="padding:40px;text-align:center;color:#8a8a8a;font-size:15px">
         Tu carrito está vacío.
         <a onclick="navigate('home')" style="color:#FF2E9A;cursor:pointer;font-weight:700;margin-left:5px">Ver productos →</a>
       </div>`
    : items.map((ci, idx) => `
        <div class="cart-item">
          <div class="cart-item__img" style="${ci.img ? '' : `background-color:${tintBg(ci.tint||'mint')}`}">${ci.img ? `<img src="${ci.img}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : ''}</div>
          <div class="cart-item__info">
            <div class="cart-item__brand">${ci.brand}</div>
            <div class="cart-item__name">${ci.name}</div>
          </div>
          <div class="qty-control qty-control--sm">
            <button onclick="updateCartQty(${idx},-1)">−</button>
            <span>${ci.qty}</span>
            <button onclick="updateCartQty(${idx},1)">+</button>
          </div>
          <div class="cart-item__price">${cop(ci.price * ci.qty)}</div>
          <button class="cart-item__remove" onclick="removeCartItem(${idx})" title="Eliminar">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>
            </svg>
          </button>
        </div>`).join('');

  return `
    <main class="page-cart fade-in">
      <div class="container">
        <h1 class="cart-title">Tu carrito <span>(${cartCount()} productos)</span></h1>
        <div class="cart-layout">
          <div>
            <div class="cart-items-box">${itemsHTML}</div>
            ${items.length > 0 ? `
            <div class="cart-form-box">
              <h3>Tus datos para el pedido</h3>
              <div class="form-grid">
                <input type="text"  id="cart-name"  placeholder="Nombre completo" />
                <input type="tel"   id="cart-phone" placeholder="Teléfono / WhatsApp" />
              </div>
              <textarea id="cart-notes" placeholder="Observaciones (dirección, color, indicaciones…)" rows="3"></textarea>
            </div>` : ''}
          </div>
          ${items.length > 0 ? `
          <div class="cart-summary">
            <div class="summary-box">
              <h3>Resumen del pedido</h3>
              <div class="summary-row"><span>Subtotal</span><span>${cop(total)}</span></div>
              <div class="summary-row"><span>Envío</span><span class="text-green">Se coordina por WhatsApp</span></div>
              <div class="summary-total"><span>Total</span><span>${cop(total)}</span></div>
              <a id="wa-order-btn" href="${waHref}" target="_blank" class="btn-wa-order" onclick="updateWAHref(this)">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15.07L2 22l5.07-1.33A10 10 0 1 0 12 2z"/>
                </svg>
                Realizar pedido por WhatsApp
              </a>
              <p class="summary-note">No se cobra en línea. Se abre WhatsApp con tu pedido listo para enviar.</p>
            </div>
            <div class="msg-preview">
              <div class="msg-preview__label">VISTA PREVIA DEL MENSAJE</div>
              <div class="msg-preview__content">
                ¡Hola Adday Shop! Quiero realizar este pedido:<br><br>
                ${items.map(ci => `• ${ci.qty}x ${ci.name} — ${cop(ci.price * ci.qty)}<br>`).join('')}
                <br>Total: <span>${cop(total)}</span><br>
                Nombre: ___<br>Observaciones: ___
              </div>
            </div>
          </div>` : ''}
        </div>
      </div>
    </main>`;
};

// ============================================================
// RENDER & COUNTDOWN
// ============================================================

let countdownInterval = null;

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  const end = new Date();
  end.setHours(23, 59, 59, 0);
  const tick = () => {
    const diff = Math.max(0, end - new Date());
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    const el = document.getElementById('countdown');
    if (el) el.textContent = `Termina en ${h}:${m}:${s}`;
    else clearInterval(countdownInterval);
  };
  tick();
  countdownInterval = setInterval(tick, 1000);
};

const PAGES = { home: HomePage, cat: CategoryPage, product: ProductPage, cart: CartPage };

const render = () => {
  const root = document.getElementById('root');
  const Page = PAGES[state.screen] || HomePage;
  root.innerHTML = Header() + Page() + Footer() + WaFab();
  updateCartBadge();
  if (state.screen === 'home') startCountdown();
};

render();
