/* ============================================================
   ADDAY ADMIN — admin.js
   ============================================================ */

const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

const DEFAULT_SETTINGS = {
  waNumber: '573332259912',
  instagram: '@addayshop',
  heroTitle: 'Bienestar y belleza que se sienten bien',
  heroDesc: 'Productos naturales, suplementos y cosméticos con delivery a domicilio',
  accent: 'neon',
};

const DEFAULT_MODULES = {
  hero: true, trust: true, categories: true,
  flashsale: true, bestsellers: true, cta: false,
};

const DEFAULT_PRODUCTS = [
  { id:1, name:'Cúrcuma + Pimienta Negra', brand:'NaturaVida', category:'Naturistas', price:38000, oldPrice:52000, tag:'Oferta', stock:true, tint:'#FFF3CD', img:null },
  { id:2, name:'Vitamina C 1000mg', brand:'VitaPro', category:'Vitaminas', price:45000, oldPrice:null, tag:'Más vendido', stock:true, tint:'#FFE0CC', img:null },
  { id:3, name:'Colágeno Marino', brand:'BeautyLab', category:'Suplementos', price:62000, oldPrice:75000, tag:'Oferta', stock:true, tint:'#FCE4EC', img:null },
  { id:4, name:'Sérum Vitamina C', brand:'GlowSkin', category:'Cosméticos', price:89000, oldPrice:null, tag:'Nuevo', stock:true, tint:'#FFF9C4', img:null },
  { id:5, name:'Magnesio Complex', brand:'VitaPro', category:'Vitaminas', price:35000, oldPrice:48000, tag:'Oferta', stock:false, tint:'#E8EAF6', img:null },
  { id:6, name:'Té Verde Matcha', brand:'ZenHerbs', category:'Naturistas', price:28000, oldPrice:null, tag:'Más vendido', stock:true, tint:'#E8F5E9', img:null },
  { id:7, name:'Crema de Árnica', brand:'NaturaVida', category:'Medicinales', price:22000, oldPrice:30000, tag:'Oferta', stock:true, tint:'#E3F2FD', img:null },
  { id:8, name:'Proteína Vegana', brand:'PlantPower', category:'Suplementos', price:95000, oldPrice:null, tag:'Más vendido', stock:true, tint:'#F3E5F5', img:null },
  { id:9, name:'Aceite de Coco', brand:'OrganicLife', category:'Naturistas', price:32000, oldPrice:40000, tag:'Oferta', stock:true, tint:'#FFF8E1', img:null },
  { id:10, name:'Retinol Night Cream', brand:'GlowSkin', category:'Belleza', price:78000, oldPrice:null, tag:'Nuevo', stock:true, tint:'#FCE4EC', img:null },
];

const DEFAULT_CATEGORIES = [
  { id:1, name:'Naturistas',   color:'#E8F5E9', emoji:'🌿' },
  { id:2, name:'Medicinales',  color:'#E3F2FD', emoji:'💊' },
  { id:3, name:'Belleza',      color:'#FCE4EC', emoji:'💄' },
  { id:4, name:'Vitaminas',    color:'#FFF9C4', emoji:'💊' },
  { id:5, name:'Suplementos',  color:'#EDE7F6', emoji:'💪' },
  { id:6, name:'Cosméticos',   color:'#E0F2F1', emoji:'✨' },
  { id:7, name:'Aromaterapia', color:'#FBE9E7', emoji:'🕯️' },
  { id:8, name:'Herbolaria',   color:'#F1F8E9', emoji:'🌱' },
  { id:9, name:'Bienestar',    color:'#E8EAF6', emoji:'🧘' },
  { id:10, name:'Spa & Relax', color:'#FFF3E0', emoji:'🛁' },
];

/* helpers */
const getProducts   = () => LS.get('adday_products')   || DEFAULT_PRODUCTS;
const getCategories = () => LS.get('adday_categories') || DEFAULT_CATEGORIES;
const getSettings   = () => Object.assign({}, DEFAULT_SETTINGS, LS.get('adday_settings') || {});
const getModules    = () => Object.assign({}, DEFAULT_MODULES, LS.get('adday_modules') || {});

const saveProducts   = v => LS.set('adday_products', v);
const saveCategories = v => LS.set('adday_categories', v);
const saveSettings   = v => LS.set('adday_settings', Object.assign({}, DEFAULT_SETTINGS, LS.get('adday_settings') || {}, v));
const saveModules    = v => LS.set('adday_modules', Object.assign({}, getModules(), v));

function nextId(list) {
  return list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
}

/* ---- Auth ---- */
const getAdminCreds = () => LS.get('adday_admin_creds') || { user: 'admin', pass: 'adday2026' };
const isLoggedIn    = () => sessionStorage.getItem('adday_admin_session') === '1';
const login = (user, pass) => {
  const c = getAdminCreds();
  if (user === c.user && pass === c.pass) { sessionStorage.setItem('adday_admin_session', '1'); return true; }
  return false;
};
const logout = () => { sessionStorage.removeItem('adday_admin_session'); renderRoot(); };

/* ============================================================
   TOAST
   ============================================================ */
function toast(msg) {
  document.querySelectorAll('.admin-toast').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = 'admin-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/* ============================================================
   ICONS
   ============================================================ */
const icon = {
  dashboard: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  products:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`,
  cats:      `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01M12 7v10M7 12h10"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
  modules:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  settings:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  logout:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>`,
  edit:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  plus:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  store:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  eye:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

/* ============================================================
   ADMIN STATE
   ============================================================ */
const state = {
  section: 'dashboard',
  searchQ: '',
  modal: null,     // 'product-new' | 'product-edit' | 'cat-new' | 'cat-edit' | 'confirm-delete'
  editItem: null,
  pendingDelete: null,
  formData: {},
};

function nav(section) {
  state.section = section;
  state.searchQ = '';
  renderRoot();
}

/* ============================================================
   LAYOUT PIECES
   ============================================================ */
function Sidebar() {
  const sections = [
    { id: 'dashboard', label: 'Dashboard',    ico: icon.dashboard },
    { id: 'products',  label: 'Productos',    ico: icon.products  },
    { id: 'cats',      label: 'Categorías',   ico: icon.cats      },
    { id: 'modules',   label: 'Módulos',      ico: icon.modules   },
    { id: 'settings',  label: 'Configuración',ico: icon.settings  },
  ];
  return `<aside class="sidebar" id="sidebar">
    <div class="sidebar__logo">
      <div class="sidebar__logo-brand">⚡ ADDAY ADMIN</div>
      <div class="sidebar__logo-sub">Panel de administración</div>
    </div>
    <nav class="sidebar__nav">
      ${sections.map(s => `
        <div class="nav-item${state.section===s.id?' active':''}" onclick="adminNav('${s.id}')">
          ${s.ico} ${s.label}
        </div>`).join('')}
    </nav>
    <div class="sidebar__footer">
      <div class="sidebar__user">
        <div class="sidebar__avatar">S</div>
        <div class="sidebar__info">
          <div class="sidebar__name">Sofia</div>
          <div class="sidebar__role">Administradora</div>
        </div>
        <button class="sidebar__logout" onclick="adminLogout()" title="Cerrar sesión">${icon.logout}</button>
      </div>
    </div>
  </aside>`;
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function DashboardPage() {
  const prods = getProducts();
  const cats  = getCategories();
  const onSale    = prods.filter(p => p.tag === 'Oferta').length;
  const outStock  = prods.filter(p => !p.stock).length;
  const s = getSettings();
  return `
    <div class="topbar">
      <span class="topbar__title">Dashboard</span>
      <a href="index.html" target="_blank" class="store-link">${icon.store} Ver tienda</a>
    </div>
    <div class="content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Productos</div>
          <div class="stat-card__value">${prods.length}</div>
          <div class="stat-card__sub gray">${cats.length} categorías</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">En oferta</div>
          <div class="stat-card__value">${onSale}</div>
          <div class="stat-card__sub">con descuento activo</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Sin stock</div>
          <div class="stat-card__value">${outStock}</div>
          <div class="stat-card__sub${outStock>0?' red':' gray'}">${outStock>0?'revisar inventario':'todo disponible'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">WhatsApp</div>
          <div class="stat-card__value" style="font-size:18px">+${s.waNumber.slice(0,2)}&nbsp;${s.waNumber.slice(2,5)}&nbsp;${s.waNumber.slice(5)}</div>
          <div class="stat-card__sub gray">número configurado</div>
        </div>
      </div>

      <div class="sec-header" style="margin-top:8px">
        <h2>Acciones rápidas</h2>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-dark" onclick="adminNav('products');setTimeout(()=>openProductModal(),50)">${icon.plus} Nuevo producto</button>
        <button class="btn btn-ghost" onclick="adminNav('products')">${icon.products} Ver productos</button>
        <button class="btn btn-ghost" onclick="adminNav('modules')">${icon.modules} Gestionar módulos</button>
        <button class="btn btn-ghost" onclick="adminNav('settings')">${icon.settings} Configuración</button>
      </div>

      <div class="sec-header" style="margin-top:26px">
        <h2>Últimos productos</h2>
        <button class="btn btn-ghost btn-sm" onclick="adminNav('products')">Ver todos</button>
      </div>
      <div class="table-box">
        <table class="table">
          <thead><tr>
            <th>Producto</th><th>Categoría</th><th>Precio</th><th>Tag</th><th>Estado</th>
          </tr></thead>
          <tbody>
            ${prods.slice(0,5).map(p => `<tr>
              <td><div class="prod-cell">
                ${ProductThumb(p)}
                <div><div class="prod-name">${p.name}</div><div class="prod-brand">${p.brand}</div></div>
              </div></td>
              <td>${p.category}</td>
              <td><span class="price-main">${fmt(p.price)}</span>${p.oldPrice?`<span class="price-old">${fmt(p.oldPrice)}</span>`:''}</td>
              <td>${TagBadge(p.tag)}</td>
              <td>${StockBadge(p.stock)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ============================================================
   PRODUCTS
   ============================================================ */
function fmt(n) { return n ? '$' + n.toLocaleString('es-CO') : '—'; }

function ProductThumb(p) {
  if (p.img) return `<div class="prod-thumb"><img src="${p.img}" alt="${p.name}"></div>`;
  return `<div class="prod-thumb" style="background:${p.tint||'#F4F4F2'};background-image:repeating-linear-gradient(45deg,rgba(17,17,19,.04) 0 6px,transparent 6px 12px)"></div>`;
}

function TagBadge(tag) {
  const map = { 'Oferta':'badge-pink','Más vendido':'badge-neon','Nuevo':'badge-dark','Agotado':'badge-red' };
  return `<span class="badge ${map[tag]||'badge-dark'}">${tag||'—'}</span>`;
}

function StockBadge(stock) {
  return `<span class="badge ${stock?'badge-green':'badge-red'}">
    <span class="stock-dot ${stock?'green':'red'}"></span>${stock?'En stock':'Agotado'}
  </span>`;
}

function ProductsPage() {
  const prods = getProducts();
  const q = state.searchQ.toLowerCase();
  const filtered = q ? prods.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : prods;
  const cats = getCategories();
  return `
    <div class="topbar">
      <span class="topbar__title">Productos</span>
      <div class="topbar__right">
        <div class="search-box">
          ${icon.search}
          <input type="text" placeholder="Buscar producto..." value="${state.searchQ}"
            oninput="adminSearch(this.value)" onkeydown="if(event.key==='Escape')adminSearch('')">
        </div>
        <button class="btn btn-dark" onclick="openProductModal()">${icon.plus} Nuevo producto</button>
      </div>
    </div>
    <div class="content">
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card"><div class="stat-card__label">Total</div><div class="stat-card__value">${prods.length}</div></div>
        <div class="stat-card"><div class="stat-card__label">En oferta</div><div class="stat-card__value">${prods.filter(p=>p.tag==='Oferta').length}</div></div>
        <div class="stat-card"><div class="stat-card__label">Sin stock</div><div class="stat-card__value">${prods.filter(p=>!p.stock).length}</div></div>
        <div class="stat-card"><div class="stat-card__label">Categorías</div><div class="stat-card__value">${cats.length}</div></div>
      </div>
      ${filtered.length === 0 ? `<div class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__title">Sin resultados</div><p>No se encontraron productos para "${state.searchQ}"</p></div>` : `
      <div class="table-box">
        <table class="table">
          <thead><tr>
            <th>Producto</th><th>Categoría</th><th>Precio</th><th>Tag</th><th>Estado</th><th>Acciones</th>
          </tr></thead>
          <tbody>
            ${filtered.map(p => `<tr>
              <td><div class="prod-cell">
                ${ProductThumb(p)}
                <div><div class="prod-name">${p.name}</div><div class="prod-brand">${p.brand}</div></div>
              </div></td>
              <td>${p.category}</td>
              <td><span class="price-main">${fmt(p.price)}</span>${p.oldPrice?`<span class="price-old">${fmt(p.oldPrice)}</span>`:''}</td>
              <td>${TagBadge(p.tag)}</td>
              <td>${StockBadge(p.stock)}</td>
              <td><div class="action-cell">
                <button class="btn btn-ghost btn-icon btn-sm" onclick="editProduct(${p.id})" title="Editar">${icon.edit}</button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="confirmDelete('product',${p.id})" title="Eliminar">${icon.trash}</button>
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;
}

/* ============================================================
   PRODUCT MODAL
   ============================================================ */
function ProductModal() {
  const cats = getCategories();
  const isEdit = state.modal === 'product-edit';
  const d = state.formData;
  const tags = ['Oferta', 'Más vendido', 'Nuevo', ''];
  const tints = ['#FFF3CD','#FFE0CC','#FCE4EC','#FFF9C4','#E8F5E9','#E3F2FD','#E8EAF6','#EDE7F6','#FBE9E7','#E0F2F1'];

  return `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? 'Editar producto' : 'Nuevo producto'}</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:140px 1fr;gap:16px;margin-bottom:14px">
          <div>
            <div class="form-label">Foto</div>
            <div class="img-upload-area" id="img-upload-area" onclick="document.getElementById('prod-img-input').click()">
              ${d.img ? `<img src="${d.img}" alt="preview" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
                <button class="img-remove" onclick="event.stopPropagation();clearProdImg()">×</button>` :
                `<div class="upload-label">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">Subir foto</span>
                </div>`}
              <input type="file" id="prod-img-input" accept="image/*" style="display:none" onchange="handleProdImg(this)">
            </div>
          </div>
          <div>
            <div class="form-group">
              <label class="form-label">Nombre del producto *</label>
              <input class="form-input" id="f-name" value="${d.name||''}" placeholder="ej. Vitamina C 1000mg">
            </div>
            <div class="form-group">
              <label class="form-label">Marca</label>
              <input class="form-input" id="f-brand" value="${d.brand||''}" placeholder="ej. VitaPro">
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Precio *</label>
            <input class="form-input" id="f-price" type="number" value="${d.price||''}" placeholder="38000">
          </div>
          <div class="form-group">
            <label class="form-label">Precio anterior (tachado)</label>
            <input class="form-input" id="f-oldprice" type="number" value="${d.oldPrice||''}" placeholder="52000">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select class="form-select" id="f-category">
              ${cats.map(c => `<option value="${c.name}" ${d.category===c.name?'selected':''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tag / Etiqueta</label>
            <select class="form-select" id="f-tag">
              ${tags.map(t => `<option value="${t}" ${(d.tag||'')===(t)?'selected':''}>${t||'— Sin etiqueta —'}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea class="form-textarea" id="f-desc" rows="2" placeholder="Beneficios y características...">${d.desc||''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Estado</label>
          <select class="form-select" id="f-stock">
            <option value="1" ${d.stock!==false?'selected':''}>En stock</option>
            <option value="0" ${d.stock===false?'selected':''}>Agotado</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Color de fondo (sin foto)</label>
          <div class="color-swatches">
            ${tints.map(c => `<div class="swatch${(d.tint||tints[0])===c?' selected':''}" style="background:${c}" onclick="selectTint('${c}')"></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-dark" onclick="saveProduct()">${isEdit ? 'Guardar cambios' : 'Crear producto'}</button>
      </div>
    </div>
  </div>`;
}

/* ---- product actions ---- */
window.openProductModal = function() {
  state.modal = 'product-new';
  state.formData = { tint: '#FFF3CD', stock: true };
  renderModal();
};

window.editProduct = function(id) {
  const p = getProducts().find(p => p.id === id);
  if (!p) return;
  state.modal = 'product-edit';
  state.editItem = id;
  state.formData = { ...p };
  renderModal();
};

window.saveProduct = function() {
  const name  = document.getElementById('f-name')?.value.trim();
  const price = parseInt(document.getElementById('f-price')?.value);
  if (!name) { toast('El nombre es obligatorio'); return; }
  if (!price) { toast('El precio es obligatorio'); return; }

  const obj = {
    name,
    brand:    document.getElementById('f-brand')?.value.trim() || '',
    price,
    oldPrice: parseInt(document.getElementById('f-oldprice')?.value) || null,
    category: document.getElementById('f-category')?.value || '',
    tag:      document.getElementById('f-tag')?.value || '',
    desc:     document.getElementById('f-desc')?.value.trim() || '',
    stock:    document.getElementById('f-stock')?.value === '1',
    tint:     state.formData.tint || '#FFF3CD',
    img:      state.formData.img || null,
  };

  const prods = getProducts();
  if (state.modal === 'product-edit') {
    const idx = prods.findIndex(p => p.id === state.editItem);
    if (idx >= 0) prods[idx] = { ...prods[idx], ...obj };
    toast('Producto actualizado ✓');
  } else {
    prods.push({ id: nextId(prods), ...obj });
    toast('Producto creado ✓');
  }
  saveProducts(prods);
  closeModal();
  renderSection();
};

window.confirmDelete = function(type, id) {
  state.modal = 'confirm-delete';
  state.pendingDelete = { type, id };
  renderModal();
};

window.doDelete = function() {
  const { type, id } = state.pendingDelete;
  if (type === 'product') {
    const prods = getProducts().filter(p => p.id !== id);
    saveProducts(prods);
    toast('Producto eliminado');
  } else if (type === 'cat') {
    const cats = getCategories().filter(c => c.id !== id);
    saveCategories(cats);
    toast('Categoría eliminada');
  }
  closeModal();
  renderSection();
};

window.handleProdImg = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.formData.img = e.target.result;
    renderModal();
  };
  reader.readAsDataURL(file);
};

window.clearProdImg = function() {
  state.formData.img = null;
  renderModal();
};

window.selectTint = function(color) {
  state.formData.tint = color;
  document.querySelectorAll('.swatch').forEach(el => {
    el.classList.toggle('selected', el.style.background === color || el.style.backgroundColor === color);
  });
};

/* ============================================================
   CATEGORIES
   ============================================================ */
function CatsPage() {
  const cats = getCategories();
  return `
    <div class="topbar">
      <span class="topbar__title">Categorías</span>
      <div class="topbar__right">
        <span class="topbar__hint">${cats.length} categorías activas</span>
        <button class="btn btn-dark" onclick="openCatModal()">${icon.plus} Nueva categoría</button>
      </div>
    </div>
    <div class="content">
      <div class="cat-admin-grid">
        ${cats.map(c => `
          <div class="cat-admin-card" style="background:${c.color};border-color:${c.color}">
            <div style="font-size:28px">${c.emoji||'🏷️'}</div>
            <div class="cat-admin-card__name">${c.name}</div>
            <div class="cat-admin-card__actions">
              <button class="cat-admin-card__edit-btn" onclick="editCat(${c.id})">${icon.edit} Editar</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="confirmDelete('cat',${c.id})">${icon.trash}</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function CatModal() {
  const isEdit = state.modal === 'cat-edit';
  const d = state.formData;
  const colors = ['#E8F5E9','#E3F2FD','#FCE4EC','#FFF9C4','#EDE7F6','#E0F2F1','#FBE9E7','#F1F8E9','#E8EAF6','#FFF3E0','#FFF3CD','#FFE0CC'];
  const emojis = ['🌿','💊','💄','💪','✨','🕯️','🌱','🧘','🛁','🍃','🧴','🌸'];
  return `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? 'Editar categoría' : 'Nueva categoría'}</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-input" id="f-catname" value="${d.name||''}" placeholder="ej. Naturistas">
        </div>
        <div class="form-group">
          <label class="form-label">Emoji / Ícono</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
            ${emojis.map(e => `<button type="button" style="font-size:22px;padding:6px 8px;background:${(d.emoji||'🌿')===e?'#111113':'#F4F4F2'};border:none;border-radius:9px;cursor:pointer" onclick="selectEmoji('${e}')">${e}</button>`).join('')}
          </div>
          <input class="form-input" id="f-emoji" value="${d.emoji||''}" placeholder="o escribe tu emoji aquí" style="margin-top:8px" oninput="state.formData.emoji=this.value">
        </div>
        <div class="form-group">
          <label class="form-label">Color de fondo</label>
          <div class="color-swatches">
            ${colors.map(c => `<div class="swatch${(d.color||colors[0])===c?' selected':''}" style="background:${c}" onclick="selectCatColor('${c}')"></div>`).join('')}
          </div>
        </div>
        <div style="background:${d.color||colors[0]};border-radius:14px;padding:20px;text-align:center;margin-top:14px">
          <div style="font-size:30px">${d.emoji||'🌿'}</div>
          <div style="font-weight:700;margin-top:6px">${d.name||'Previsualización'}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-dark" onclick="saveCat()">${isEdit ? 'Guardar' : 'Crear'}</button>
      </div>
    </div>
  </div>`;
}

window.openCatModal = function() {
  state.modal = 'cat-new';
  state.formData = { color: '#E8F5E9', emoji: '🌿' };
  renderModal();
};

window.editCat = function(id) {
  const c = getCategories().find(c => c.id === id);
  if (!c) return;
  state.modal = 'cat-edit';
  state.editItem = id;
  state.formData = { ...c };
  renderModal();
};

window.saveCat = function() {
  const name = document.getElementById('f-catname')?.value.trim();
  if (!name) { toast('El nombre es obligatorio'); return; }
  const emoji = document.getElementById('f-emoji')?.value.trim() || state.formData.emoji || '🌿';
  const obj = { name, emoji, color: state.formData.color || '#E8F5E9' };
  const cats = getCategories();
  if (state.modal === 'cat-edit') {
    const idx = cats.findIndex(c => c.id === state.editItem);
    if (idx >= 0) cats[idx] = { ...cats[idx], ...obj };
    toast('Categoría actualizada ✓');
  } else {
    cats.push({ id: nextId(cats), ...obj });
    toast('Categoría creada ✓');
  }
  saveCategories(cats);
  closeModal();
  renderSection();
};

window.selectEmoji = function(e) {
  state.formData.emoji = e;
  renderModal();
};

window.selectCatColor = function(c) {
  state.formData.color = c;
  renderModal();
};

/* ============================================================
   MODULES
   ============================================================ */
const MODULE_DEF = [
  { key:'hero',       name:'Banner principal',         emoji:'🦸', bg:'#F4FFC2', desc:'Hero con título, descripción y CTAs', preview:'Imagen principal, botón "Comprar ahora" y tarjetas de categoría destacadas.' },
  { key:'trust',      name:'Barra de confianza',       emoji:'✅', bg:'#E7F8EE', desc:'Envío · Pago · Originales · Atención', preview:'Muestra 4 íconos de confianza debajo del hero: envío, pago, calidad y atención.' },
  { key:'categories', name:'Categorías',               emoji:'🏷️', bg:'#E6F0FF', desc:'Grid de categorías en la portada',    preview:'Grilla de todas las categorías activas con íconos y nombres.' },
  { key:'flashsale',  name:'Ofertas del día',          emoji:'⚡', bg:'#FFE9F3', desc:'Productos en oferta + cuenta regresiva', preview:'Cuenta regresiva hasta medianoche y productos con tag "Oferta".' },
  { key:'bestsellers',name:'Más vendidos',             emoji:'🏆', bg:'#EFEAFE', desc:'Grid de productos más populares',      preview:'Grilla con productos etiquetados como "Más vendido".' },
  { key:'cta',        name:'CTA WhatsApp + Instagram', emoji:'💬', bg:'#E0F9EC', desc:'Sección de contacto al final',         preview:'Llamado a la acción con link a WhatsApp e Instagram.' },
];

function ModulesPage() {
  const mods = getModules();
  return `
    <div class="topbar">
      <span class="topbar__title">Módulos del sitio</span>
      <span class="topbar__hint">Los cambios se aplican al instante en la tienda</span>
    </div>
    <div class="content">
      <div class="sec-header"><h2>Controla qué secciones se muestran en tu tienda</h2></div>
      <div class="modules-grid">
        ${MODULE_DEF.map((m,i) => {
          const on = mods[m.key];
          return `<div class="module-card${on?'':' inactive'}" style="animation-delay:${i*0.05}s">
            <div class="module-card__top">
              <div class="module-card__info">
                <div class="module-card__icon" style="background:${m.bg}">${m.emoji}</div>
                <div>
                  <div class="module-card__name">${m.name}</div>
                  <div class="module-card__desc">${m.desc}</div>
                  <span class="status-pill ${on?'on':'off'}">${on?'Activo':'Oculto'}</span>
                </div>
              </div>
              <div class="toggle-wrap">
                <button class="toggle-sw ${on?'on':'off'}" onclick="toggleModule('${m.key}')"></button>
              </div>
            </div>
            <div class="module-card__preview">${m.preview}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

window.toggleModule = function(key) {
  const mods = getModules();
  mods[key] = !mods[key];
  saveModules(mods);
  renderSection();
};

/* ============================================================
   SETTINGS
   ============================================================ */
function SettingsPage() {
  const s = getSettings();
  const creds = getAdminCreds();
  return `
    <div class="topbar">
      <span class="topbar__title">Configuración</span>
      <button class="btn btn-dark" onclick="saveAllSettings()">Guardar cambios</button>
    </div>
    <div class="content">
      <div class="settings-grid">

        <div class="settings-card">
          <h3>📱 Contacto y redes sociales</h3>
          <div class="form-group">
            <label class="form-label">Número de WhatsApp</label>
            <input class="form-input" id="s-wa" value="${s.waNumber}" placeholder="573332259912">
            <div class="form-hint">Incluye el código de país sin + (ej: 573332259912)</div>
          </div>
          <div class="form-group">
            <label class="form-label">Instagram</label>
            <input class="form-input" id="s-ig" value="${s.instagram}" placeholder="@addayshop">
          </div>
        </div>

        <div class="settings-card">
          <h3>🎨 Color de acento</h3>
          <div class="accent-options">
            <div class="accent-opt${s.accent!=='pink'?' selected':''}" onclick="selectAccent('neon')">
              <div class="accent-opt__swatch" style="background:#E3FF12"></div>
              <div class="accent-opt__label">Neon Yellow</div>
            </div>
            <div class="accent-opt${s.accent==='pink'?' selected':''}" onclick="selectAccent('pink')">
              <div class="accent-opt__swatch" style="background:#FF2E9A"></div>
              <div class="accent-opt__label">Hot Pink</div>
            </div>
          </div>
          <input type="hidden" id="s-accent" value="${s.accent||'neon'}">
        </div>

        <div class="settings-card full">
          <h3>🏠 Texto del banner principal (Hero)</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Título principal</label>
              <input class="form-input" id="s-herotitle" value="${s.heroTitle}" placeholder="Bienestar y belleza...">
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <input class="form-input" id="s-herodesc" value="${s.heroDesc}" placeholder="Descripción breve...">
            </div>
          </div>
        </div>

        <div class="settings-card full">
          <h3>🔐 Cambiar contraseña del panel</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Contraseña actual</label>
              <input class="form-input" id="s-passold" type="password" placeholder="Contraseña actual">
            </div>
            <div class="form-group">
              <label class="form-label">Nueva contraseña</label>
              <input class="form-input" id="s-passnew" type="password" placeholder="Nueva contraseña">
            </div>
          </div>
          <button class="btn btn-dark btn-sm" onclick="changePassword()">Cambiar contraseña</button>
        </div>

        <div class="settings-card full">
          <h3>🔄 Datos de la tienda</h3>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="resetToDefaults()">Restaurar productos de ejemplo</button>
            <button class="btn btn-ghost btn-sm" onclick="exportData()">Exportar datos (JSON)</button>
          </div>
          <div class="form-hint" style="margin-top:8px">Restaurar reemplaza todos los productos por los valores de demostración. Exportar descarga un JSON con toda tu tienda.</div>
        </div>

      </div>
    </div>`;
}

window.selectAccent = function(val) {
  document.getElementById('s-accent').value = val;
  document.querySelectorAll('.accent-opt').forEach((el, i) => {
    el.classList.toggle('selected', (val === 'neon' && i === 0) || (val === 'pink' && i === 1));
  });
};

window.saveAllSettings = function() {
  saveSettings({
    waNumber:  document.getElementById('s-wa')?.value.trim() || '',
    instagram: document.getElementById('s-ig')?.value.trim() || '',
    heroTitle: document.getElementById('s-herotitle')?.value.trim() || '',
    heroDesc:  document.getElementById('s-herodesc')?.value.trim() || '',
    accent:    document.getElementById('s-accent')?.value || 'neon',
  });
  toast('Configuración guardada ✓');
};

window.changePassword = function() {
  const oldVal = document.getElementById('s-passold')?.value;
  const newVal = document.getElementById('s-passnew')?.value;
  const creds  = getAdminCreds();
  if (oldVal !== creds.pass) { toast('Contraseña actual incorrecta'); return; }
  if (!newVal || newVal.length < 4) { toast('La nueva contraseña debe tener al menos 4 caracteres'); return; }
  LS.set('adday_admin_creds', { user: creds.user, pass: newVal });
  toast('Contraseña cambiada ✓');
  document.getElementById('s-passold').value = '';
  document.getElementById('s-passnew').value = '';
};

window.resetToDefaults = function() {
  if (!confirm('¿Restaurar los 10 productos de ejemplo? Esto reemplazará tus productos actuales.')) return;
  saveProducts(DEFAULT_PRODUCTS);
  saveCategories(DEFAULT_CATEGORIES);
  toast('Datos de ejemplo restaurados ✓');
};

window.exportData = function() {
  const data = {
    products: getProducts(),
    categories: getCategories(),
    settings: getSettings(),
    modules: getModules(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'addayshop-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

/* ============================================================
   CONFIRM DELETE MODAL
   ============================================================ */
function ConfirmModal() {
  const { type, id } = state.pendingDelete || {};
  let label = type === 'product' ? 'este producto' : 'esta categoría';
  return `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="max-width:380px">
      <div class="modal-header">
        <h3>Confirmar eliminación</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body" style="text-align:center;padding:30px 24px">
        <div style="font-size:42px;margin-bottom:12px">🗑️</div>
        <p style="font-size:15px;color:#444">¿Segura que quieres eliminar ${label}? Esta acción no se puede deshacer.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-pink" onclick="doDelete()">Sí, eliminar</button>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   LOGIN
   ============================================================ */
function LoginPage() {
  return `<div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo__badge">
          <span class="login-logo__letters"><em>A</em>S</span>
        </div>
        <span class="login-logo__text">ADDAY<small>ADMIN</small></span>
      </div>
      <h1 class="login-title">Bienvenida, Sofia 👋</h1>
      <p class="login-sub">Ingresa al panel de administración</p>
      <div id="login-error" style="display:none" class="login-error">Usuario o contraseña incorrectos</div>
      <div class="form-group">
        <label class="form-label">Usuario</label>
        <input class="form-input" id="l-user" value="admin" autocomplete="username">
      </div>
      <div class="form-group">
        <label class="form-label">Contraseña</label>
        <input class="form-input" id="l-pass" type="password" placeholder="••••••••" autocomplete="current-password"
          onkeydown="if(event.key==='Enter')doLogin()">
      </div>
      <button class="btn-login" onclick="doLogin()">Ingresar al panel →</button>
    </div>
  </div>`;
}

window.doLogin = function() {
  const user = document.getElementById('l-user')?.value.trim();
  const pass = document.getElementById('l-pass')?.value;
  if (login(user, pass)) {
    renderRoot();
  } else {
    const err = document.getElementById('login-error');
    if (err) err.style.display = 'block';
    document.getElementById('l-pass').value = '';
    document.getElementById('l-pass').focus();
  }
};

window.adminLogout = function() { logout(); };

/* ============================================================
   RENDER ENGINE
   ============================================================ */
function renderSection() {
  const main = document.querySelector('.main');
  if (!main) return;
  let html = '';
  if (state.section === 'dashboard') html = DashboardPage();
  else if (state.section === 'products') html = ProductsPage();
  else if (state.section === 'cats') html = CatsPage();
  else if (state.section === 'modules') html = ModulesPage();
  else if (state.section === 'settings') html = SettingsPage();
  main.innerHTML = html;
  // Update active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('onclick')?.includes(`'${state.section}'`));
  });
}

function renderModal() {
  let existing = document.getElementById('admin-modal-container');
  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'admin-modal-container';
    document.body.appendChild(existing);
  }
  if (!state.modal) { existing.innerHTML = ''; return; }
  if (state.modal === 'product-new' || state.modal === 'product-edit') existing.innerHTML = ProductModal();
  else if (state.modal === 'cat-new' || state.modal === 'cat-edit') existing.innerHTML = CatModal();
  else if (state.modal === 'confirm-delete') existing.innerHTML = ConfirmModal();
}

window.closeModal = function() {
  state.modal = null;
  renderModal();
};

function renderRoot() {
  const root = document.getElementById('admin-root');
  if (!root) return;
  if (!isLoggedIn()) {
    root.innerHTML = LoginPage();
    return;
  }
  root.innerHTML = `${Sidebar()}
    <div class="main" id="admin-main"></div>`;
  renderSection();
}

/* ---- global nav helpers ---- */
window.adminNav = function(s) { nav(s); };
window.adminSearch = function(q) {
  state.searchQ = q;
  renderSection();
};

/* ---- init ---- */
renderRoot();
