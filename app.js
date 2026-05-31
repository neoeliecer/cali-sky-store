/* ==========================================================================
   CALI SKY STORES - CLIENT LOGIC, N8N SIMULATOR & BREVO PARSER ENGINE
   ========================================================================== */

// 1. DEFAULT DATASETS
const DEFAULT_CLIENTS = [
  {
    id: "client-1",
    name: "Juan Pérez",
    email: "juan@email.com",
    type: "apartamento",
    zone: "El Ingenio",
    maxPrice: 350000000,
    beds: 3,
    deal: "Compra",
    status: "active"
  },
  {
    id: "client-2",
    name: "Sophia Gómez",
    email: "sophia@email.com",
    type: "casa",
    zone: "Ciudad Jardín",
    maxPrice: 850000000,
    beds: 4,
    deal: "Compra",
    status: "active"
  },
  {
    id: "client-3",
    name: "Andrés Delgado",
    email: "andres@email.com",
    type: "local",
    zone: "Av. Colombia",
    maxPrice: 1200000000,
    beds: 2,
    deal: "Compra",
    status: "paused"
  }
];

const DEFAULT_PROPERTIES = [
  {
    id: "prop-1",
    title: "Penthouse de Lujo en El Ingenio",
    type: "apartamento",
    zone: "El Ingenio",
    price: 340000000,
    beds: 3,
    bathrooms: 3,
    area: 124,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    address: "Calle 14 # 85-30, Apt 802, Cali",
    phone: "+57 315 765 4321",
    owner: "Alonso Restrepo",
    source: "Fincaraiz",
    sourceLink: "https://fincaraiz.com.co/inmueble/349823",
    grokAnalysis: "Apartamento con excelente iluminación, terraza privada con vista al Parque de El Ingenio. Cocina tipo americana remodelada, ideal para familias.",
    advisorNote: "El Ingenio es una zona de alta valorización. Negociable hasta en un 5% por pago de contado. Excelente administración y portería 24/7."
  },
  {
    id: "prop-2",
    title: "Apartamento Vista Río Av. Colombia",
    type: "apartamento",
    zone: "Av. Colombia",
    price: 380000000,
    beds: 2,
    bathrooms: 2,
    area: 95,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    address: "Av. Colombia # 3-45, Apt 1404, Cali",
    phone: "+57 320 890 1234",
    owner: "María Patricia Castro",
    source: "Metrocuadrado",
    sourceLink: "https://metrocuadrado.com/inmueble/892019",
    grokAnalysis: "Espectacular loft con acabados italianos y ventanales de piso a techo sobre el Río Cali. Excelente seguridad, piscina climatizada y gimnasio.",
    advisorNote: "Ideal para inversionistas de rentas cortas (AirBnb). Libre de gravámenes. Sector de alta demanda corporativa."
  },
  {
    id: "prop-3",
    title: "Mansión Contemporánea Ciudad Jardín",
    type: "casa",
    zone: "Ciudad Jardín",
    price: 820000000,
    beds: 4,
    bathrooms: 5,
    area: 340,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    address: "Calle 18 # 112-45, Casa 12, Condominio La Ceiba",
    phone: "+57 300 456 7890",
    owner: "Carlos Mario Holguín",
    source: "Metrocuadrado",
    sourceLink: "https://metrocuadrado.com/inmueble/776655",
    grokAnalysis: "Residencia moderna con piscina privada, domótica integrada de luces y sonido, cocina industrial abierta y parqueadero cubierto para 4 vehículos.",
    advisorNote: "Condominio cerrado de primer nivel. El precio por m² está un 12% por debajo del promedio del sector en Ciudad Jardín. Propiedad lista para entrega."
  },
  {
    id: "prop-4",
    title: "Lote Urbanizable Pance Exclusivo",
    type: "local", // Category local/lotes mapping
    zone: "Pance",
    price: 950000000,
    beds: 1,
    bathrooms: 1,
    area: 1200,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    address: "Vía Pance, Km 4, Sector La Vorágine",
    phone: "+57 318 333 4444",
    owner: "Urbanizadora del Valle",
    source: "Fincaraiz",
    sourceLink: "https://fincaraiz.com.co/inmueble/665544",
    grokAnalysis: "Lote plano ideal para construir casa campestre. Lindero directo con reserva natural y quebrada limpia. Clima fresco de montaña.",
    advisorNote: "Cuenta con todos los servicios públicos aprobados (Emcali) y licencia de construcción vigente. Zona de altísima exclusividad."
  },
  {
    id: "prop-5",
    title: "Casa de Tres Niveles en El Ingenio",
    type: "casa",
    zone: "El Ingenio",
    price: 620000000,
    beds: 4,
    bathrooms: 4,
    area: 220,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    address: "Carrera 83C # 15-22, Cali",
    phone: "+57 311 222 3333",
    owner: "Humberto Gómez",
    source: "Facebook Marketplace",
    sourceLink: "https://facebook.com/marketplace/item/90281923",
    grokAnalysis: "Amplia casa con estudio, patio interior ornamental, garaje eléctrico doble y balcón. Cocina integral de excelente calidad.",
    advisorNote: "Se encuentra completamente desocupada y pintada. El propietario acepta permutas por menor valor en el norte o oeste de Cali."
  },
  {
    id: "prop-6",
    title: "Local Comercial Centro Av. Colombia",
    type: "local",
    zone: "Av. Colombia",
    price: 1100000000,
    beds: 2,
    bathrooms: 2,
    area: 180,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    address: "Av. Colombia # 7-15, Cali",
    phone: "+57 315 999 8888",
    owner: "Inmobiliaria Siglo XXI",
    source: "OLX Cali",
    sourceLink: "https://olx.com.co/item/local-comercial-cali-8902",
    grokAnalysis: "Local comercial a pie de calle con alto flujo peatonal y vehicular. Fachada acristalada de seguridad, ideal para banco, franquicia o boutique premium.",
    advisorNote: "Rentando actualmente a una franquicia de cafés reconocida. Contrato a 3 años renovable. Retorno de inversión (ROI) estimado en 0.7% mensual."
  },
  {
    id: "prop-7",
    title: "Apartamento Familiar El Ingenio",
    type: "apartamento",
    zone: "El Ingenio",
    price: 320000000,
    beds: 3,
    bathrooms: 2,
    area: 104,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80",
    address: "Carrera 84 # 13B-60, Apt 304, Cali",
    phone: "+57 314 444 5555",
    owner: "Clara Inés Vivas",
    source: "Fincaraiz",
    sourceLink: "https://fincaraiz.com.co/inmueble/110022",
    grokAnalysis: "Apartamento en conjunto cerrado con piscina, zonas verdes, gimnasio y seguridad 24/7. Excelente distribución interna con balcón social.",
    advisorNote: "Muy buena administración del conjunto. El apartamento está listo para escriturar, no posee hipotecas ni deudas pendientes de predial."
  },
  {
    id: "prop-8",
    title: "Loft Moderno Ciudad Jardín",
    type: "apartamento",
    zone: "Ciudad Jardín",
    price: 390000000,
    beds: 2,
    bathrooms: 2,
    area: 88,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    address: "Av. Cañasgordas # 120-10, Cali",
    phone: "+57 321 555 6666",
    owner: "Santiago Echeverry",
    source: "Metrocuadrado",
    sourceLink: "https://metrocuadrado.com/inmueble/334455",
    grokAnalysis: "Loft de concepto abierto con acabados minimalistas, balcón amplio con vista a los Farallones de Cali. Piscina sin fin comunal.",
    advisorNote: "Perfecto para ejecutivos jóvenes o parejas. Ubicado a pocos metros de las universidades de primer nivel (Javeriana e Icesi)."
  },
  {
    id: "prop-9",
    title: "Casa Campestre Normandía Premium",
    type: "casa",
    zone: "Normandía",
    price: 980000000,
    beds: 5,
    bathrooms: 5,
    area: 410,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    address: "Calle Oeste # 3-18, Normandía, Cali",
    phone: "+57 316 777 8888",
    owner: "Eduardo Santos",
    source: "OLX Cali",
    sourceLink: "https://olx.com.co/item/casa-colonial-normandia-29",
    grokAnalysis: "Clásica casona de Normandía restaurada. Conserva patio central andaluz, techos altos de madera y frescura inigualable por brisa del oeste.",
    advisorNote: "Sector residencial histórico, de muy alta alcurnia y valorización sostenida. Cuenta con seguridad vecinal integral privada."
  }
];

// New Properties found dynamically during simulation
const SIMULATED_NEW_PROPERTIES = [
  {
    id: "new-prop-1",
    title: "EXCLUSIVO: Apartamento Club House El Ingenio",
    type: "apartamento",
    zone: "El Ingenio",
    price: 335000000,
    beds: 3,
    bathrooms: 3,
    area: 112,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    address: "Carrera 85 # 14-40, Apt 502, Cali",
    phone: "+57 312 888 7777",
    owner: "Diana Marcela Ospina",
    source: "Metrocuadrado (Cazado anoche)",
    sourceLink: "https://metrocuadrado.com/inmueble/new-ingenio-1",
    grokAnalysis: "Oportunidad de remate inmediato. Apartamento con acabados premium de mármol, salón social y vista norte. Ideal para Juan.",
    advisorNote: "El vendedor necesita liquidez urgente. Se puede ofertar $320M de inmediato y cerrar negocio."
  },
  {
    id: "new-prop-2",
    title: "EXCLUSIVO: Casa Quinta Ciudad Jardín Pinos",
    type: "casa",
    zone: "Ciudad Jardín",
    price: 840000000,
    beds: 4,
    bathrooms: 4,
    area: 310,
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
    address: "Calle 15 # 105-30, Casa Campestre, Cali",
    phone: "+57 318 999 0000",
    owner: "Felipe Garcés",
    source: "Grupo de Facebook Cerrado (Cazado anoche)",
    sourceLink: "https://facebook.com/groups/inmobiliarioscali/posts/291820",
    grokAnalysis: "Casa campestre espectacular con amplios jardines y salón de juegos privado. Encontramos la publicación en un grupo cerrado de Whatsapp y Facebook.",
    advisorNote: "Excelente precio para Ciudad Jardín. Se encuentra en un condominio pequeño de solo 8 casas."
  }
];

// 2. STATE MANAGER
class AppState {
  constructor() {
    this.clients = JSON.parse(localStorage.getItem("calisky_clients")) || DEFAULT_CLIENTS;
    this.properties = JSON.parse(localStorage.getItem("calisky_properties")) || DEFAULT_PROPERTIES;
    this.currentUser = JSON.parse(localStorage.getItem("calisky_current_user")) || null;
    this.logs = [];
  }

  save() {
    localStorage.setItem("calisky_clients", JSON.stringify(this.clients));
    localStorage.setItem("calisky_properties", JSON.stringify(this.properties));
    localStorage.setItem("calisky_current_user", JSON.stringify(this.currentUser));
  }

  addClient(client) {
    client.id = "client-" + Date.now();
    client.status = "active";
    this.clients.push(client);
    this.save();
  }

  deleteClient(id) {
    this.clients = this.clients.filter(c => c.id !== id);
    this.save();
  }

  login(email) {
    const user = this.clients.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.currentUser = user;
      this.save();
      return user;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
    this.save();
  }

  addProperties(newProps) {
    // Avoid duplicates
    newProps.forEach(np => {
      if (!this.properties.some(p => p.id === np.id)) {
        this.properties.unshift(np); // Put on top
      }
    });
    this.save();
  }
}

const state = new AppState();

// 3. UI RENDERING ENGINES

// Utility to format currency COP
function formatCOP(num) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

// Render Public Showcase Grid
function renderPublicProperties(filter = "all") {
  const container = document.getElementById("public-properties-grid");
  if (!container) return;
  
  container.innerHTML = "";
  
  const filtered = state.properties.filter(p => {
    if (filter === "all") return true;
    return p.type === filter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="glass-panel text-center pad-xl" style="grid-column: 1/-1;">No hay inmuebles disponibles para este filtro.</div>`;
    return;
  }

  filtered.forEach(p => {
    // Generate public price range
    const minRange = formatCOP(p.price * 0.95);
    const maxRange = formatCOP(p.price * 1.05);

    const card = document.createElement("div");
    card.className = "glass-panel property-card";
    card.id = `pub-${p.id}`;
    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'">
        <div class="card-badge-zone"><i class="fa-solid fa-location-dot"></i> ${p.zone}</div>
        <div class="card-badge-type">${p.type}</div>
      </div>
      <div class="card-info-content">
        <div class="card-price-row">
          <span class="price-tag">${minRange} - ${maxRange}</span>
          <span class="deal-type-badge">${p.deal}</span>
        </div>
        <h3>${p.title}</h3>
        <p class="property-desc">${p.grokAnalysis}</p>
        
        <div class="card-specs-row">
          <div class="spec-item">
            <i class="fa-solid fa-maximize"></i>
            <span>${p.area} m²</span>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-bed"></i>
            <span>${p.beds} Hab.</span>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-bath"></i>
            <span>${p.bathrooms} Baños</span>
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-request-info" data-id="${p.id}">
          <i class="fa-solid fa-envelope"></i> Quiero información completa →
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach event listeners to buttons
  document.querySelectorAll(".btn-request-info").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-id");
      openContactModal(id);
    });
  });
}

// Render Private Matched Catalog Grid
function renderPrivateProperties() {
  const container = document.getElementById("private-properties-grid");
  if (!container || !state.currentUser) return;
  
  container.innerHTML = "";
  const user = state.currentUser;

  // Search logic that matches client parameters: Zone and Type are critical. Price is max threshold, beds is minimum.
  const matches = state.properties.filter(p => {
    const zoneMatch = p.zone.toLowerCase() === user.zone.toLowerCase();
    const typeMatch = p.type.toLowerCase() === user.type.toLowerCase();
    const priceMatch = p.price <= user.maxPrice;
    const bedMatch = p.beds >= user.beds;
    return zoneMatch && typeMatch && priceMatch && bedMatch;
  });

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center pad-xl" style="grid-column: 1/-1;">
        <i class="fa-solid fa-magnifying-glass-chart text-glow-gold" style="font-size: 40px; margin-bottom: 16px; display: block;"></i>
        <h3>Buscando coincidencias perfectas...</h3>
        <p class="section-desc margin-center">
          Actualmente no hay inmuebles en la base de datos que cumplan al 100% tus criterios específicos en <strong>${user.zone}</strong> por un precio menor a <strong>${formatCOP(user.maxPrice)}</strong>.
        </p>
        <div class="alert-box note-box margin-t-md max-w-md margin-center">
          <i class="fa-solid fa-cloud-bolt text-glow-cyan"></i>
          <p>Ve a la <strong>Consola Admin</strong> y haz clic en <strong>"Ejecutar Búsqueda Nocturna"</strong> en la pestaña n8n para simular el rastreador nocturno Groq Llama-3 encontrando una nueva propiedad que encaje contigo!</p>
        </div>
      </div>
    `;
    return;
  }

  matches.forEach(p => {
    const card = document.createElement("div");
    card.className = "glass-panel property-card";
    card.style.borderColor = "var(--accent-gold)";
    card.id = `priv-${p.id}`;
    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${p.image}" alt="${p.title}">
        <div class="card-badge-zone"><i class="fa-solid fa-location-dot"></i> ${p.zone}</div>
        <div class="card-badge-type">${p.type}</div>
      </div>
      <div class="card-info-content">
        <div class="card-price-row">
          <span class="price-tag text-glow-gold">${formatCOP(p.price)}</span>
          <span class="deal-type-badge">${p.deal}</span>
        </div>
        <h3>${p.title}</h3>
        <p class="property-desc">${p.grokAnalysis}</p>
        
        <div class="card-specs-row">
          <div class="spec-item">
            <i class="fa-solid fa-maximize"></i>
            <span>${p.area} m²</span>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-bed"></i>
            <span>${p.beds} Hab.</span>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-bath"></i>
            <span>${p.bathrooms} Baños</span>
          </div>
        </div>

        <!-- Private Confidential Information Unlocked -->
        <div class="private-unlocked-info">
          <div class="unlocked-item">
            <strong>Dirección:</strong>
            <span><i class="fa-solid fa-map-pin"></i> ${p.address}</span>
          </div>
          <div class="unlocked-item">
            <strong>Contacto:</strong>
            <span><i class="fa-solid fa-user"></i> ${p.owner} - <a href="https://wa.me/${p.phone.replace(/[\s\+]/g, '')}?text=Hola+${p.owner.replace(' ', '+')},+estoy+interesado+en+tu+propiedad+en+Cali+Sky+Stores" target="_blank">${p.phone}</a></span>
          </div>
          <div class="unlocked-item">
            <strong>Fuente:</strong>
            <span><a href="${p.sourceLink}" target="_blank"><i class="fa-solid fa-square-arrow-up-right"></i> Ver en ${p.source}</a></span>
          </div>
          <div class="unlocked-item private-notes-box">
            <div class="spec-item" style="text-align: left; border: none;">
              <strong style="color: var(--accent-gold); font-size: 11px;"><i class="fa-solid fa-user-shield"></i> Nota del Asesor Cali Sky:</strong>
              <p style="font-size: 12px; margin-top: 4px; line-height: 1.4;">"${p.advisorNote}"</p>
            </div>
          </div>
        </div>

        <a href="https://wa.me/573000000000?text=Hola+Cali+Sky,+quiero+agendar+una+visita+al+inmueble+${p.title.replace(/\s/g, '+')}" target="_blank" class="btn btn-glow-gold btn-block">
          <i class="fa-brands fa-whatsapp"></i> Agendar Visita Inmediata →
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Clients Database Manager Table
function renderClientsTable() {
  const tbody = document.getElementById("clients-table-body");
  const badge = document.getElementById("clients-count-badge");
  if (!tbody) return;

  tbody.innerHTML = "";
  badge.textContent = `${state.clients.length} Registrados`;

  state.clients.forEach(c => {
    const tr = document.createElement("tr");
    tr.id = `row-${c.id}`;
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td><code>${c.email}</code></td>
      <td><span class="deal-type-badge">${c.type}</span></td>
      <td>${c.zone}</td>
      <td><strong>${formatCOP(c.maxPrice)}</strong></td>
      <td>${c.beds} hab.</td>
      <td>${c.deal}</td>
      <td>
        <span class="status-badge ${c.status}">
          <span class="pulse-dot" style="background-color: ${c.status === 'active' ? '#10b981' : '#f9a825'}; box-shadow: 0 0 8px ${c.status === 'active' ? '#10b981' : '#f9a825'}"></span>
          ${c.status === 'active' ? 'Activo' : 'Pausado'}
        </span>
      </td>
      <td>
        <button class="action-icon-btn btn-delete-client" data-id="${c.id}" title="Eliminar Cliente">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach delete click listeners
  document.querySelectorAll(".btn-delete-client").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Estás seguro de eliminar este perfil de búsqueda de cliente?")) {
        state.deleteClient(id);
        renderClientsTable();
        populateBrevoClientSelector();
        // If current logged in client is deleted
        if (state.currentUser && state.currentUser.id === id) {
          logoutUser();
        }
      }
    });
  });
}

// Render Brevo Selector dropdown list
function populateBrevoClientSelector() {
  const select = document.getElementById("brevo-select-client");
  if (!select) return;
  select.innerHTML = "";
  state.clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.email})`;
    select.appendChild(opt);
  });
  updateBrevoPreview();
}

// Assemble the Premium HTML Email Template for Brevo
function generateBrevoEmailHtml(client, matches) {
  let matchesHtml = "";
  
  if (matches.length === 0) {
    matchesHtml = `
      <div style="padding: 20px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 6px;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">Estamos monitoreando activamente el mercado de <strong>${client.zone}</strong>. Aún no se han reportado nuevas publicaciones del rango solicitado, te notificaremos tan pronto como Groq detecte una.</p>
      </div>
    `;
  } else {
    matches.forEach(p => {
      matchesHtml += `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px;">
          <img src="${p.image}" alt="${p.title}" style="width: 70px; height: 70px; border-radius: 6px; object-fit: cover; background: #eaeaea;">
          <div style="flex-grow: 1;">
            <span style="font-size: 10px; font-weight: 700; background: #fffae6; color: #b7791f; border: 1px solid #fbd38d; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${p.type}</span>
            <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 6px 0 4px 0; font-family: 'Outfit', sans-serif;">${p.title}</h4>
            <span style="font-size: 11px; color: #64748b;"><i class="fa-solid fa-map-pin"></i> Cali, ${p.zone} • ${p.area}m² • ${p.beds} Hab.</span>
            <div style="font-size: 13.5px; font-weight: 800; color: #059669; margin-top: 6px;">${formatCOP(p.price)}</div>
          </div>
        </div>
      `;
    });
  }

  const matchesCount = matches.length;

  return `
    <div class="brevo-email-body-wrap">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fafafa; padding: 20px 0;">
        <tr>
          <td align="center">
            <div class="email-container-inner">
              <!-- Header Brand -->
              <div class="email-header-top">
                <div class="email-logo"><span>CALI SKY</span> STORES</div>
                <div style="color: #00f3ff; font-family: 'Fira Code', monospace; font-size: 10px; margin-top: 6px; letter-spacing: 1px;">CRON AI PROPERTY ALERT • POWERED BY GROQ & N8N</div>
              </div>
              
              <!-- Content -->
              <div class="email-body-content" style="text-align: left;">
                <h2>Hola ${client.name},</h2>
                <p>Nuestro radar inteligente en la nube ejecutó la búsqueda nocturna a las 2:00 AM sobre las bases de datos de inmuebles en Cali.</p>
                
                <p style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; border-radius: 0 6px 6px 0; color: #065f46; font-size: 13px;">
                  <strong>Estado:</strong> Filtro completado exitosamente. Encontramos <strong>${matchesCount} propiedad(es)</strong> en la zona de <strong>${client.zone}</strong> que encajan perfectamente con tus preferencias de ${client.type} y presupuesto.
                </p>
                
                <div style="margin: 24px 0 10px 0;">
                  <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 12px; font-family: 'Outfit', sans-serif;">Coincidencias del Día</h3>
                  ${matchesHtml}
                </div>
                
                <p style="font-size: 13px; color: #64748b;">
                  * Nota comercial: Para ver las direcciones exactas, números telefónicos directos de los propietarios y las ligas de origen en Fincaraiz/Metrocuadrado, debes iniciar sesión en tu portal de cliente con tu clave privada.
                </p>
                
                <a href="https://caliskystores.com/portal" class="email-btn-cta">Ingresar a Mi Portal Privado →</a>
                
                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b; font-style: italic;">
                  Atentamente,<br>
                  <strong>Cali Sky Stores Intelligent Bot</strong><br>
                  Tu asistente inmobiliario automático en Cali.
                </div>
              </div>
              
              <!-- Footer -->
              <div class="email-footer-bottom">
                <p style="margin: 0 0 6px 0;">Cali Sky Stores Ltd. - Av. Colombia, Cali, Colombia</p>
                <p style="margin: 0;">Recibes este correo porque tienes contratado el servicio premium de búsqueda inmobiliaria automatizada.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Update Brevo Preview Card HTML Render
function updateBrevoPreview() {
  const select = document.getElementById("brevo-select-client");
  if (!select) return;

  const clientId = select.value;
  const client = state.clients.find(c => c.id === clientId);

  if (!client) {
    document.getElementById("email-mock-html-content").innerHTML = "Selecciona un cliente para previsualizar.";
    return;
  }

  // Find matches
  const matches = state.properties.filter(p => {
    return p.zone.toLowerCase() === client.zone.toLowerCase() &&
           p.type.toLowerCase() === client.type.toLowerCase() &&
           p.price <= client.maxPrice &&
           p.beds >= client.beds;
  });

  // Populate dynamic payload metrics variables on sidecard
  document.getElementById("var-contact-name").textContent = client.name;
  document.getElementById("var-contact-email").textContent = client.email;
  document.getElementById("var-params-zone").textContent = client.zone;
  document.getElementById("var-params-type").textContent = client.type;
  document.getElementById("var-params-count").textContent = matches.length;

  // Mock header fields in preview
  document.getElementById("email-mock-to").textContent = `${client.name} <${client.email}>`;
  document.getElementById("email-mock-subject").textContent = `Hola ${client.name}, hoy encontré ${matches.length} opciones de ${client.type} en ${client.zone} para ti`;

  // Render HTML in preview area
  const renderArea = document.getElementById("email-mock-html-content");
  renderArea.innerHTML = generateBrevoEmailHtml(client, matches);
}

// 4. ACTION CONTROLLERS & WORKFLOW SIMULATOR

// Add Client Controller
function handleAddClient(e) {
  e.preventDefault();
  const name = document.getElementById("client-name").value.trim();
  const email = document.getElementById("client-email").value.trim();
  const type = document.getElementById("client-type").value;
  const zone = document.getElementById("client-zone").value;
  const maxPrice = parseInt(document.getElementById("client-max-price").value);
  const beds = parseInt(document.getElementById("client-beds").value);
  const deal = document.getElementById("client-deal").value;

  if (!name || !email || isNaN(maxPrice) || isNaN(beds)) return;

  // Check if email already registered
  if (state.clients.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    alert("Este correo electrónico ya está registrado con otro cliente.");
    return;
  }

  state.addClient({ name, email, type, zone, maxPrice, beds, deal });
  
  // Reset Form
  document.getElementById("add-client-form").reset();
  document.getElementById("client-beds").value = 3;

  // Re-render
  renderClientsTable();
  populateBrevoClientSelector();
  alert(`¡Cliente ${name} registrado con éxito! Puedes iniciar sesión usando su email en el portal privado.`);
}

// User Authentication Operations
function loginUser(email) {
  const user = state.login(email);
  if (user) {
    state.currentUser = user;
    state.save();
    
    // Toggle navigation layouts
    document.getElementById("login-btn-text").textContent = `Portal (${user.name})`;
    document.getElementById("login-toggle-btn").classList.add("btn-glow-purple");
    
    document.getElementById("portal-fallback-wrapper").classList.add("hidden");
    document.getElementById("portal-section-wrapper").classList.remove("hidden");
    
    // Populate portal metadata info bar
    document.getElementById("portal-welcome-name").textContent = `Hola, ${user.name}`;
    document.getElementById("portal-search-type").textContent = user.type.charAt(0).toUpperCase() + user.type.slice(1);
    document.getElementById("portal-search-zone").textContent = user.zone;
    document.getElementById("portal-search-budget").textContent = `Máx ${formatCOP(user.maxPrice)}`;
    document.getElementById("portal-search-beds").textContent = `${user.beds} habs.`;

    // Render matches
    renderPrivateProperties();
    
    // Scroll smoothly to user portal section
    document.getElementById("portal-section-wrapper").scrollIntoView({ behavior: 'smooth' });
    return true;
  }
  return false;
}

function logoutUser() {
  state.logout();
  document.getElementById("login-btn-text").textContent = "Iniciar Sesión";
  document.getElementById("login-toggle-btn").classList.remove("btn-glow-purple");
  
  document.getElementById("portal-fallback-wrapper").classList.remove("hidden");
  document.getElementById("portal-section-wrapper").classList.add("hidden");
  renderPrivateProperties();
}

// Contact Modal Handling
function openContactModal(propId) {
  const prop = state.properties.find(p => p.id === propId);
  if (!prop) return;

  const preview = document.getElementById("contact-property-preview");
  preview.innerHTML = `
    <img src="${prop.image}" alt="${prop.title}" class="preview-img">
    <div class="preview-info">
      <h4>${prop.title}</h4>
      <span>Cali, ${prop.zone} • ${formatCOP(prop.price * 0.95)} - ${formatCOP(prop.price * 1.05)}</span>
    </div>
  `;

  // Pre-fill text in contact form
  document.getElementById("contact-message").value = `Hola Cali Sky Stores, estoy sumamente interesado en recibir la información completa de la propiedad "${prop.title}" en la zona de ${prop.zone}. Quedo atento a agendar una llamada.`;
  
  // Active contact modal
  document.getElementById("contact-modal").classList.add("active");
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contact-name").value.trim();
  const phone = document.getElementById("contact-phone").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const message = document.getElementById("contact-message").value.trim();

  // Create Whatsapp Direct Link simulating agent connection
  const whatsappNumber = "573000000000"; // Real agent phone number
  const encodedText = encodeURIComponent(`Hola Cali Sky Stores! Mi nombre es ${name}. Correo: ${email}, Celular: ${phone}. Estoy interesado en una propiedad de la vitrina pública. Mensaje: ${message}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

  // Reset and Close
  document.getElementById("contact-form").reset();
  document.getElementById("contact-modal").classList.remove("active");

  // Redirect to simulated whatsapp agent line
  alert("¡Solicitud enviada! Serás redirigido al WhatsApp directo de Cali Sky Stores para una atención inmediata.");
  window.open(whatsappUrl, "_blank");
}

// 5. N8N AUTOMATED WORKFLOW FLOWCHART SIMULATION
let isRunningWorkflow = false;

function addTerminalLog(text, type = "system") {
  const term = document.getElementById("workflow-terminal-logs");
  if (!term) return;

  const line = document.createElement("div");
  const time = new Date().toLocaleTimeString();
  line.className = `log-line ${type}`;
  line.textContent = `[${time}] ${text}`;
  
  term.appendChild(line);
  term.scrollTop = term.scrollHeight; // Scroll bottom
}

function runNightlyWorkflow() {
  if (isRunningWorkflow) return;
  isRunningWorkflow = true;

  const btn = document.getElementById("btn-run-workflow");
  const wfPulse = document.querySelector(".wf-pulse-light");
  
  // Set UI state
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Ejecutando...`;
  wfPulse.className = "wf-pulse-light orange-pulse";

  // Reset all flowchart nodes classes to neutral before running
  const nodes = ["node-trigger", "node-read-db", "node-prompt", "node-groq", "node-publish", "node-brevo"];
  const connectors = ["connector-1", "connector-2", "connector-3", "connector-4", "connector-5"];
  
  nodes.forEach(n => {
    document.getElementById(n).classList.remove("active-node", "done-node");
  });
  connectors.forEach(c => {
    document.getElementById(c).classList.remove("active-link");
  });

  addTerminalLog("INICIANDO AUTOMATIZACIÓN NOCTURNA (Simulando ejecución programada a las 2:00 AM)...", "cron");

  // Timed Sequence simulating n8n step executions
  setTimeout(() => {
    // 1. Cron Node
    document.getElementById("node-trigger").classList.add("active-node");
    addTerminalLog("Node 'Cron Trigger': Disparado por temporizador diario a las 2:00:00 AM.", "cron");
    
    setTimeout(() => {
      document.getElementById("node-trigger").classList.add("done-node");
      document.getElementById("node-trigger").classList.remove("active-node");
      document.getElementById("connector-1").classList.add("active-link");
      
      // 2. Read DB
      document.getElementById("node-read-db").classList.add("active-node");
      addTerminalLog("Node 'WP Get Profiles': Conectando a WordPress DB... Solicitando perfiles activos.", "wp");
      
      setTimeout(() => {
        const activeCount = state.clients.filter(c => c.status === 'active').length;
        addTerminalLog(`Node 'WP Get Profiles': Obtenidos ${activeCount} perfiles de búsqueda activos.`, "wp");
        document.getElementById("node-read-db").classList.add("done-node");
        document.getElementById("node-read-db").classList.remove("active-node");
        document.getElementById("connector-1").classList.remove("active-link");
        document.getElementById("connector-2").classList.add("active-link");
        
        // 3. Prompt Builder
        document.getElementById("node-prompt").classList.add("active-node");
        addTerminalLog("Node 'Prompt Builder': Armando instrucciones estructuradas para la API de Groq Cloud...", "system");
        
        setTimeout(() => {
          addTerminalLog("Node 'Prompt Builder': Inyectando variables personalizadas (Presupuesto, Zona, Tipo, Habs).", "system");
          document.getElementById("node-prompt").classList.add("done-node");
          document.getElementById("node-prompt").classList.remove("active-node");
          document.getElementById("connector-2").classList.remove("active-link");
          document.getElementById("connector-3").classList.add("active-link");
          
          // 4. Groq API
          document.getElementById("node-groq").classList.add("active-node");
          addTerminalLog("Node 'Groq Cloud': Conectando a Groq API Llama-3-70B de alta velocidad...", "groq");
          
          setTimeout(() => {
            addTerminalLog("Node 'Groq Cloud': Llama-3 escaneando Fincaraiz, Metrocuadrado y grupos inmobiliarios...", "groq");
            
            setTimeout(() => {
              addTerminalLog("Node 'Groq Cloud': Groq filtró con éxito 22 listados y detectó 2 coincidencias óptimas.", "groq");
              
              // Inyectar nuevas propiedades a la base de datos simulando el scraping AI real
              state.addProperties(SIMULATED_NEW_PROPERTIES);
              
              document.getElementById("node-groq").classList.add("done-node");
              document.getElementById("node-groq").classList.remove("active-node");
              document.getElementById("connector-3").classList.remove("active-link");
              document.getElementById("connector-4").classList.add("active-link");
              
              // 5. Publish WP
              document.getElementById("node-publish").classList.add("active-node");
              addTerminalLog("Node 'WP Publish': Creando posts privados en WordPress visibles únicamente para los clientes en correspondencia...", "wp");
              
              setTimeout(() => {
                addTerminalLog("Node 'WP Publish': Creado Post Privado ID 50921 para Juan Pérez (El Ingenio).", "wp");
                addTerminalLog("Node 'WP Publish': Creado Post Privado ID 50922 para Sophia Gómez (Ciudad Jardín).", "wp");
                document.getElementById("node-publish").classList.add("done-node");
                document.getElementById("node-publish").classList.remove("active-node");
                document.getElementById("connector-4").classList.remove("active-link");
                document.getElementById("connector-5").classList.add("active-link");
                
                // 6. Brevo Email
                document.getElementById("node-brevo").classList.add("active-node");
                addTerminalLog("Node 'Brevo API': Armado de payload JSON transaccional. Enviando alertas...", "brevo");
                
                setTimeout(() => {
                  state.clients.filter(c => c.status === 'active').forEach(c => {
                    addTerminalLog(`Node 'Brevo API': Email transaccional enviado a <${c.email}> con plantilla premium ID #4.`, "brevo");
                  });
                  
                  document.getElementById("node-brevo").classList.add("done-node");
                  document.getElementById("node-brevo").classList.remove("active-node");
                  document.getElementById("connector-5").classList.remove("active-link");
                  
                  // Finish Workflow
                  isRunningWorkflow = false;
                  btn.disabled = false;
                  btn.innerHTML = `<i class="fa-solid fa-play"></i> Ejecutar Búsqueda Nocturna`;
                  wfPulse.className = "wf-pulse-light green";
                  
                  addTerminalLog("PROCESO TERMINADO SATISFACTORIAMENTE. Base de datos e emails actualizados.", "success");
                  
                  // Refresh previews and pages
                  renderPublicProperties();
                  if (state.currentUser) {
                    renderPrivateProperties();
                  }
                  updateBrevoPreview();
                  
                  alert("¡Simulación completada! El flujo de n8n ha detectado y publicado nuevas propiedades. Si inicias sesión como Juan Pérez (juan@email.com) o Sophia Gómez (sophia@email.com) verás sus nuevas propiedades de lujo desbloqueadas en el panel privado. También se ha actualizado el template de Brevo.");
                  
                }, 2000);
              }, 2000);
            }, 1800);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  }, 1000);
}

// 6. APP ENGINE INITS & DOM BINDINGS
document.addEventListener("DOMContentLoaded", () => {
  
  // Render views initial
  renderPublicProperties();
  renderClientsTable();
  populateBrevoClientSelector();

  // If already logged in on refresh
  if (state.currentUser) {
    loginUser(state.currentUser.email);
  }

  // Navigation switching handler (Single Page Application smooth view changes)
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      // Toggle active link class
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Category filter clicks in Vitrina
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filterVal = btn.getAttribute("data-filter");
      renderPublicProperties(filterVal);
    });
  });

  // Modal Login triggers
  const loginToggleBtn = document.getElementById("login-toggle-btn");
  const loginModal = document.getElementById("login-modal");
  const closeLoginModal = document.getElementById("close-login-modal");
  const btnPortalLogin = document.getElementById("btn-portal-login");

  const openLogin = () => {
    if (state.currentUser) {
      // Log out directly if clicked when logged in
      logoutUser();
    } else {
      loginModal.classList.add("active");
    }
  };

  loginToggleBtn.addEventListener("click", openLogin);
  if (btnPortalLogin) btnPortalLogin.addEventListener("click", openLogin);
  closeLoginModal.addEventListener("click", () => loginModal.classList.remove("active"));
  
  // Handle login submit
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const success = loginUser(email);
    if (success) {
      loginModal.classList.remove("active");
      document.getElementById("login-form").reset();
    } else {
      alert("Error: El correo ingresado no coincide con ningún cliente registrado. Puedes usar los demo: juan@email.com o sophia@email.com");
    }
  });

  // Logout Click
  document.getElementById("logout-btn").addEventListener("click", () => {
    logoutUser();
  });

  // Modal Contact Close
  document.getElementById("close-contact-modal").addEventListener("click", () => {
    document.getElementById("contact-modal").classList.remove("active");
  });

  // Handle Contact Inquiry Form Submit
  document.getElementById("contact-form").addEventListener("submit", handleContactFormSubmit);

  // Admin section sub-tab switching
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Add Client Submit Form
  document.getElementById("add-client-form").addEventListener("submit", handleAddClient);

  // Run n8n automated workflow simulator
  document.getElementById("btn-run-workflow").addEventListener("click", runNightlyWorkflow);

  // Clear Terminal Output log panel
  document.getElementById("btn-clear-terminal").addEventListener("click", () => {
    const term = document.getElementById("workflow-terminal-logs");
    term.innerHTML = `<div class="log-line system">[INFO] Terminal limpia. Esperando disparador...</div>`;
  });

  // Brevo Client Selector change trigger
  document.getElementById("brevo-select-client").addEventListener("change", updateBrevoPreview);
});
