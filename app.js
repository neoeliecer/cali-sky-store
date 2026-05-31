/* ==========================================================================
   CALI SKY STORES - CLIENT LOGIC, CRON-JOB.ORG SIMULATOR & BREVO PARSER ENGINE
   ========================================================================== */

// 1. ZONING DATA STRUCTURE
const ZONES_AND_BARRIOS = {
  Sur: ["El Ingenio", "Ciudad Jardín", "Pance", "Valle del Lili", "El Caney", "La Hacienda", "Meléndez"],
  Norte: ["La Flora", "Chipichape", "Versalles", "Vipasa", "San Vicente", "Santa Mónica", "Menga"],
  Oeste: ["Normandía", "Juanambú", "Santa Rita", "Santa Teresita", "El Peñón", "San Antonio", "Cristales"],
  Centro: ["Avenida Colombia", "Centenario", "San Fernando", "Miraflores", "Tequendama", "Junín"],
  Oriente: ["Ciudad Córdoba", "Aguablanca", "Mariano Ramos", "Antonio Nariño"]
};

// 2. DEFAULT DATASETS WITH MULTI-ZONE SUPPORT (ARRAYS)
const DEFAULT_CLIENTS = [
  {
    id: "client-1",
    name: "Juan Pérez",
    email: "juan@email.com",
    phone: "3004567890",
    type: "apartamento",
    zone: ["Sur"],
    barrio: ["El Ingenio"],
    minPrice: 100000000,
    maxPrice: 350000000,
    beds: 3,
    baths: 2,
    parking: "cualquiera",
    minArea: 80,
    features: "ninguno",
    deal: "Compra",
    status: "active"
  },
  {
    id: "client-2",
    name: "Sophia Gómez",
    email: "sophia@email.com",
    phone: "3159876543",
    type: "casa",
    zone: ["Sur"],
    barrio: ["Ciudad Jardín"],
    minPrice: 300000000,
    maxPrice: 900000000,
    beds: 4,
    baths: 4,
    parking: "doble",
    minArea: 200,
    features: "piscina",
    deal: "Compra",
    status: "active"
  },
  {
    id: "client-3",
    name: "Andrés Delgado",
    email: "andres@email.com",
    phone: "3101112233",
    type: "local",
    zone: ["Centro"],
    barrio: ["Avenida Colombia"],
    minPrice: 500000000,
    maxPrice: 1200000000,
    beds: 1,
    baths: 2,
    parking: "requerido",
    minArea: 100,
    features: "ninguno",
    deal: "Compra",
    status: "paused"
  }
];

const DEFAULT_PROPERTIES = [
  {
    id: "prop-1",
    title: "Penthouse de Lujo en El Ingenio",
    type: "apartamento",
    zone: "Sur",
    barrio: "El Ingenio",
    price: 340000000,
    beds: 3,
    bathrooms: 3,
    area: 124,
    parking: 1,
    features: ["balcon", "seguridad"],
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
    zone: "Centro",
    barrio: "Avenida Colombia",
    price: 380000000,
    beds: 2,
    bathrooms: 2,
    area: 95,
    parking: 1,
    features: ["balcon", "seguridad"],
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
    zone: "Sur",
    barrio: "Ciudad Jardín",
    price: 820000000,
    beds: 4,
    bathrooms: 5,
    area: 340,
    parking: 4,
    features: ["piscina", "balcon", "seguridad"],
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
    type: "lote",
    zone: "Sur",
    barrio: "Pance",
    price: 950000000,
    beds: 1,
    bathrooms: 1,
    area: 1200,
    parking: 0,
    features: ["ninguno"],
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
    zone: "Sur",
    barrio: "El Ingenio",
    price: 620000000,
    beds: 4,
    bathrooms: 4,
    area: 220,
    parking: 2,
    features: ["balcon"],
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
    zone: "Centro",
    barrio: "Avenida Colombia",
    price: 1100000000,
    beds: 1,
    bathrooms: 2,
    area: 180,
    parking: 2,
    features: ["seguridad"],
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
    zone: "Sur",
    barrio: "El Ingenio",
    price: 320000000,
    beds: 3,
    bathrooms: 2,
    area: 104,
    parking: 1,
    features: ["balcon", "seguridad"],
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80",
    address: "Carrera 84 # 13B-60, Apt 304, Cali",
    phone: "+57 314 444 5555",
    owner: "Clara Inés Vivas",
    source: "Fincaraiz",
    sourceLink: "https://fincaraiz.com.co/inmueble/110022",
    grokAnalysis: "Apartamento en conjunto cerrado con piscina, zonas verdes, gimnasio y seguridad 24/7. Excelente distribución interna con balcón social.",
    advisorNote: "Muy buena administración del conjunto. El apartamento está listo para escriturar, no posee hipotecas ni deudas."
  },
  {
    id: "prop-8",
    title: "Loft Moderno Ciudad Jardín",
    type: "apartamento",
    zone: "Sur",
    barrio: "Ciudad Jardín",
    price: 390000000,
    beds: 2,
    bathrooms: 2,
    area: 88,
    parking: 1,
    features: ["balcon", "piscina", "seguridad"],
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
    title: "Casa Colonial Normandía Premium",
    type: "casa",
    zone: "Oeste",
    barrio: "Normandía",
    price: 980000000,
    beds: 5,
    bathrooms: 5,
    area: 410,
    parking: 3,
    features: ["balcon", "seguridad"],
    deal: "Compra",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    address: "Calle Oeste # 3-18, Normandía, Cali",
    phone: "+57 316 777 8888",
    owner: "Eduardo Santos",
    source: "OLX Cali",
    sourceLink: "https://olx.com.co/item/casa-colonial-normandia-29",
    grokAnalysis: "Clásica casona de Normandía restaurada. Conserva patio central andaluz, techos altos de madera y frescura inigualable por brisa del oeste.",
    advisorNote: "Sector residencial histórico, de muy alta alcurnia y valorización sostenida. Cuenta con seguridad vecinal privada."
  }
];

const SIMULATED_NEW_PROPERTIES = [
  {
    id: "new-prop-1",
    title: "EXCLUSIVO: Apartamento Club House El Ingenio",
    type: "apartamento",
    zone: "Sur",
    barrio: "El Ingenio",
    price: 335000000,
    beds: 3,
    bathrooms: 3,
    area: 112,
    parking: 2,
    features: ["balcon", "seguridad", "piscina"],
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
    zone: "Sur",
    barrio: "Ciudad Jardín",
    price: 840000000,
    beds: 4,
    bathrooms: 4,
    area: 310,
    parking: 3,
    features: ["piscina", "balcon", "seguridad"],
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

// 3. STATE MANAGER
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

  login(email, password) {
    const user = this.clients.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (password !== undefined) {
        const userPass = user.password || "calisky123";
        if (userPass !== password) {
          return { success: false, error: "Error: Contraseña incorrecta." };
        }
      }
      this.currentUser = user;
      this.save();
      return { success: true, user };
    }
    return { success: false, error: "Error: Correo electrónico no registrado como cliente premium." };
  }

  logout() {
    this.currentUser = null;
    this.save();
  }

  addProperties(newProps) {
    newProps.forEach(np => {
      if (!this.properties.some(p => p.id === np.id)) {
        this.properties.unshift(np);
      }
    });
    this.save();
  }
}

const state = new AppState();

// 4. UI RENDERING ENGINES
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
    if (filter === "local") return p.type === "local" || p.type === "lote";
    return p.type === filter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="glass-panel text-center pad-xl" style="grid-column: 1/-1;">No hay inmuebles disponibles para este filtro.</div>`;
    return;
  }

  filtered.forEach(p => {
    const minRange = formatCOP(p.price * 0.95);
    const maxRange = formatCOP(p.price * 1.05);

    const card = document.createElement("div");
    card.className = "glass-panel property-card";
    card.id = `pub-${p.id}`;
    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'">
        <div class="card-badge-zone"><i class="fa-solid fa-location-dot"></i> ${p.barrio} (Zona ${p.zone})</div>
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

  document.querySelectorAll(".btn-request-info").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-id");
      openContactModal(id);
    });
  });
}

// Rich Match Algorithm supporting multi-zone & multi-barrio arrays
function filterClientMatches(user) {
  return state.properties.filter(p => {
    // 1. Transaction Type (Compra / Arriendo)
    if (p.deal.toLowerCase() !== user.deal.toLowerCase()) return false;
    
    // 2. Property Type
    if (p.type.toLowerCase() !== user.type.toLowerCase()) return false;
    
    // 3. Zone Match (supporting arrays)
    if (user.zone && user.zone.length > 0) {
      if (!user.zone.includes(p.zone)) return false;
    }
    
    // 4. Barrio Match (supporting arrays)
    if (user.barrio && user.barrio.length > 0) {
      const allowedBySpecificBarrio = user.barrio.includes(p.barrio);
      const allowedByAllInZone = user.barrio.includes(`Todos los barrios de ${p.zone}`);
      if (!allowedBySpecificBarrio && !allowedByAllInZone) return false;
    }
    
    // 5. Price Range
    if (p.price < user.minPrice || p.price > user.maxPrice) return false;
    
    // 6. Minimum Beds
    if (p.beds < user.beds) return false;
    
    // 7. Minimum Baths
    if (user.baths && p.bathrooms < user.baths) return false;
    
    // 8. Minimum Area
    if (user.minArea && p.area < user.minArea) return false;
    
    // 9. Parking
    if (user.parking === "requerido" && p.parking < 1) return false;
    if (user.parking === "doble" && p.parking < 2) return false;
    
    // 10. Extras Requeridos
    if (user.features && user.features !== "ninguno") {
      if (!p.features.includes(user.features)) return false;
    }
    
    return true;
  });
}

// Render Private Matched Catalog Grid
function renderPrivateProperties() {
  const container = document.getElementById("private-properties-grid");
  if (!container || !state.currentUser) return;
  
  container.innerHTML = "";
  const user = state.currentUser;

  // Run the rich dynamic filtering
  const matches = filterClientMatches(user);

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center pad-xl" style="grid-column: 1/-1;">
        <i class="fa-solid fa-magnifying-glass-chart text-glow-gold" style="font-size: 40px; margin-bottom: 16px; display: block;"></i>
        <h3>Buscando coincidencias personalizadas...</h3>
        <p class="section-desc margin-center">
          Actualmente no hay inmuebles en la base de datos que cumplan con tus criterios específicos en las zonas de **${user.zone.join(", ")}** (${user.barrio.join(", ")}) por un rango de **${formatCOP(user.minPrice)} - ${formatCOP(user.maxPrice)}**.
        </p>
        <div class="alert-box note-box margin-t-md max-w-md margin-center">
          <i class="fa-solid fa-cloud-bolt text-glow-cyan"></i>
          <p>Ve a la **Consola Admin** y haz clic en **"Ejecutar Búsqueda Nocturna"** en la pestaña Cron-Job para simular que el rastreador encuentra una propiedad adaptada a tus gustos.</p>
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
    
    const amenitiesText = p.features.map(f => {
      if (f === "piscina") return "Piscina";
      if (f === "balcon") return "Balcón/Terraza";
      if (f === "seguridad") return "Club House/Seguridad";
      return f;
    }).join(", ");

    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${p.image}" alt="${p.title}">
        <div class="card-badge-zone"><i class="fa-solid fa-location-dot"></i> ${p.barrio} (Zona ${p.zone})</div>
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
            <strong>Parqueos:</strong>
            <span><i class="fa-solid fa-car"></i> ${p.parking > 0 ? `${p.parking} puesto(s)` : "Ninguno"}</span>
          </div>
          <div class="unlocked-item">
            <strong>Extras:</strong>
            <span><i class="fa-solid fa-circle-check"></i> ${amenitiesText || "Ninguno"}</span>
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
    
    const specsSummary = `${c.beds}H / ${c.baths}B / ${c.minArea}m²${c.parking !== 'cualquiera' ? ` / Pkg` : ''}`;
    
    // Format dynamic array outputs
    const zonesJoined = c.zone ? c.zone.join(", ") : "N/A";
    const barriosShortened = c.barrio ? c.barrio.map(b => b.replace("Todos los barrios", "Todos")).join(", ") : "N/A";

    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td><code>${c.email}</code></td>
      <td><span class="deal-type-badge">${c.type}</span></td>
      <td>Zonas: ${zonesJoined} (${barriosShortened})</td>
      <td><strong>${formatCOP(c.minPrice)} - ${formatCOP(c.maxPrice)}</strong></td>
      <td>${specsSummary}</td>
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

  document.querySelectorAll(".btn-delete-client").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Estás seguro de eliminar este perfil de búsqueda de cliente?")) {
        state.deleteClient(id);
        renderClientsTable();
        populateBrevoClientSelector();
        if (state.currentUser && state.currentUser.id === id) {
          logoutUser();
        }
      }
    });
  });
}

// Populate Brevo Selector dropdown list
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
        <p style="color: #64748b; font-size: 14px; margin: 0;">Estamos monitoreando activamente las zonas de <strong>${client.zone.join(", ")}</strong> (${client.barrio.join(", ")}). Aún no se han reportado nuevas publicaciones del rango solicitado, te notificaremos tan pronto como Groq detecte una.</p>
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
            <span style="font-size: 11px; color: #64748b;"><i class="fa-solid fa-map-pin"></i> Cali, ${p.barrio} (Zona ${p.zone}) • ${p.area}m² • ${p.beds} Hab.</span>
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
                <div style="color: #00f3ff; font-family: 'Fira Code', monospace; font-size: 10px; margin-top: 6px; letter-spacing: 1px;">CRON AI PROPERTY ALERT • POWERED BY GROQ & CRON-JOB.ORG</div>
              </div>
              
              <!-- Content -->
              <div class="email-body-content" style="text-align: left;">
                <h2>Hola ${client.name},</h2>
                <p>Nuestro radar inteligente en la nube ejecutó la búsqueda nocturna a las 2:00 AM sobre las bases de datos de inmuebles en Cali.</p>
                
                <p style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; border-radius: 0 6px 6px 0; color: #065f46; font-size: 13px;">
                  <strong>Estado:</strong> Filtro completado exitosamente. Encontramos <strong>${matchesCount} propiedad(es)</strong> en las áreas solicitadas que encajan perfectamente con tus especificaciones y presupuesto.
                </p>
                
                <div style="margin: 24px 0 10px 0;">
                  <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 12px; font-family: 'Outfit', sans-serif;">Coincidencias del Día</h3>
                  ${matchesHtml}
                </div>
                
                <!-- Access Credentials Info Panel -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 18px 0; font-family: 'Outfit', sans-serif;">
                  <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fa-solid fa-lock"></i> Credenciales de tu Portal Privado</h4>
                  <div style="font-size: 12.5px; color: #334155; line-height: 1.6;">
                    <strong>Usuario (Email):</strong> <code style="background: #e2e8f0; padding: 2px 5px; border-radius: 4px; font-size: 12px; color: #0f172a;">${client.email}</code><br>
                    <strong>Contraseña de Acceso:</strong> <code style="background: #e2e8f0; padding: 2px 5px; border-radius: 4px; font-size: 12px; color: #0f172a; font-weight: bold;">${client.password || "calisky123"}</code>
                  </div>
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

  // Find matches using rich criteria
  const matches = filterClientMatches(client);

  const zonesJoined = client.zone ? client.zone.join(", ") : "N/A";
  const barriosJoined = client.barrio ? client.barrio.join(", ") : "N/A";

  // Populate dynamic payload metrics variables on sidecard
  document.getElementById("var-contact-name").textContent = client.name;
  document.getElementById("var-contact-email").textContent = client.email;
  document.getElementById("var-params-zone").textContent = `Zonas: ${zonesJoined} (${barriosJoined})`;
  document.getElementById("var-params-type").textContent = client.type;
  document.getElementById("var-params-count").textContent = matches.length;

  // Mock header fields in preview
  document.getElementById("email-mock-to").textContent = `${client.name} <${client.email}>`;
  document.getElementById("email-mock-subject").textContent = `Hola ${client.name}, hoy encontré ${matches.length} opciones de ${client.type} en tus zonas de interés para ti`;

  // Render HTML in preview area
  const renderArea = document.getElementById("email-mock-html-content");
  renderArea.innerHTML = generateBrevoEmailHtml(client, matches);
}

// 5. ACTION CONTROLLERS & WORKFLOW SIMULATOR
function handleAddClient(e) {
  e.preventDefault();
  const name = document.getElementById("client-name").value.trim();
  const email = document.getElementById("client-email").value.trim();
  const phone = document.getElementById("client-phone").value.trim() || "3004567890";
  const password = document.getElementById("client-password").value.trim() || "calisky123";
  const type = document.getElementById("client-type").value;
  const deal = document.getElementById("client-deal").value;

  // Get arrays of selected checkboxes for Zones and Barrios
  const selectedZones = Array.from(document.querySelectorAll('input[name="client-zone"]:checked')).map(cb => cb.value);
  const selectedBarrios = Array.from(document.querySelectorAll('input[name="client-barrio"]:checked')).map(cb => cb.value);

  const minPrice = parseInt(document.getElementById("client-min-price").value) || 0;
  const maxPrice = parseInt(document.getElementById("client-max-price").value);
  const beds = parseInt(document.getElementById("client-beds").value);
  const baths = parseInt(document.getElementById("client-baths").value) || 1;
  const parking = document.getElementById("client-parking").value;
  const minArea = parseInt(document.getElementById("client-min-area").value) || 20;
  const features = document.getElementById("client-features").value;

  if (!name || !email || isNaN(maxPrice) || isNaN(beds)) return;
  if (selectedZones.length === 0) {
    alert("Por favor selecciona al menos una Zona de Cali.");
    return;
  }
  if (selectedBarrios.length === 0) {
    alert("Por favor selecciona al menos un Barrio.");
    return;
  }

  if (state.clients.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    alert("Este correo electrónico ya está registrado con otro cliente.");
    return;
  }

  state.addClient({ 
    name, email, phone, password, type, zone: selectedZones, barrio: selectedBarrios, minPrice, maxPrice, 
    beds, baths, parking, minArea, features, deal 
  });
  
  // Reset Form
  document.getElementById("add-client-form").reset();
  
  // Keep default zone Sur checked and rebuild barrio checkboxes
  document.querySelectorAll('input[name="client-zone"]').forEach(cb => {
    cb.checked = (cb.value === "Sur");
  });
  loadBarriosForSelectedZones(); 

  renderClientsTable();
  populateBrevoClientSelector();
  renderCentralDiscoveries();
  alert(`¡Cliente ${name} registrado con éxito! Puedes iniciar sesión usando su email en el portal privado.`);
}

// Dynamic barrio checkboxes generator supporting MULTIPLE active zones
function loadBarriosForSelectedZones() {
  const container = document.getElementById("client-barrios-checkbox-container");
  if (!container) return;

  // Find all currently checked zones in the checkboxes grid
  const checkedZones = Array.from(document.querySelectorAll('input[name="client-zone"]:checked')).map(cb => cb.value);
  
  container.innerHTML = "";

  if (checkedZones.length === 0) {
    container.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); grid-column: 1 / -1;">Selecciona una zona arriba para cargar sus barrios...</span>`;
    return;
  }

  checkedZones.forEach(zone => {
    const barrios = ZONES_AND_BARRIOS[zone] || [];
    
    // Add a helper header or separator for visual grouping of zones
    const groupHeader = document.createElement("div");
    groupHeader.style.gridColumn = "1 / -1";
    groupHeader.style.fontSize = "11px";
    groupHeader.style.fontWeight = "700";
    groupHeader.style.color = "var(--accent-gold)";
    groupHeader.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
    groupHeader.style.paddingBottom = "4px";
    groupHeader.style.marginTop = "8px";
    groupHeader.innerHTML = `<i class="fa-solid fa-map"></i> Barrios en Zona ${zone}`;
    container.appendChild(groupHeader);

    // "Todos los barrios" option for this zone
    const allLabel = document.createElement("label");
    allLabel.className = "custom-checkbox-wrap";
    allLabel.innerHTML = `
      <input type="checkbox" name="client-barrio" value="Todos los barrios de ${zone}" checked>
      <span>Todos (Zona ${zone})</span>
    `;
    container.appendChild(allLabel);

    barrios.forEach(b => {
      const label = document.createElement("label");
      label.className = "custom-checkbox-wrap";
      label.innerHTML = `
        <input type="checkbox" name="client-barrio" value="${b}">
        <span>${b}</span>
      `;
      container.appendChild(label);
    });
  });

  // Bind change events to dynamic checkboxes so their appearance glows instantly when clicked
  document.querySelectorAll('input[name="client-barrio"]').forEach(cb => {
    cb.addEventListener("change", () => {
      // Toggle has-checked visual indicator parent styling if needed
    });
  });
}

// User Authentication Operations
function loginUser(email, password) {
  const loginResult = state.login(email, password);
  if (loginResult.success) {
    const user = loginResult.user;
    state.currentUser = user;
    state.save();
    
    document.getElementById("login-btn-text").textContent = `Portal (${user.name})`;
    document.getElementById("login-toggle-btn").classList.add("btn-glow-purple");
    
    document.getElementById("portal-fallback-wrapper").classList.add("hidden");
    document.getElementById("portal-section-wrapper").classList.remove("hidden");
    
    const zonesJoined = user.zone ? user.zone.join(", ") : "N/A";
    const barriosJoined = user.barrio ? user.barrio.map(b => b.replace("Todos los barrios de ", "Todos ")).join(", ") : "N/A";

    document.getElementById("portal-welcome-name").textContent = `Hola, ${user.name}`;
    document.getElementById("portal-search-type").textContent = user.type.charAt(0).toUpperCase() + user.type.slice(1);
    document.getElementById("portal-search-zone").textContent = `Zonas: ${zonesJoined} (${barriosJoined})`;
    document.getElementById("portal-search-budget").textContent = `${formatCOP(user.minPrice)} - ${formatCOP(user.maxPrice)}`;
    document.getElementById("portal-search-beds").textContent = `${user.beds} habs / ${user.baths} baños`;

    renderPrivateProperties();
    
    document.getElementById("portal-section-wrapper").scrollIntoView({ behavior: 'smooth' });
    return true;
  } else {
    if (password !== undefined) {
      alert(loginResult.error);
    }
    return false;
  }
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
      <span>Cali, ${prop.barrio} • ${formatCOP(prop.price * 0.95)} - ${formatCOP(prop.price * 1.05)}</span>
    </div>
  `;

  document.getElementById("contact-message").value = `Hola Cali Sky Stores, estoy sumamente interesado en recibir la información completa de la propiedad "${prop.title}" en la zona de ${prop.barrio}. Quedo atento a agendar una llamada.`;
  document.getElementById("contact-modal").classList.add("active");
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contact-name").value.trim();
  const phone = document.getElementById("contact-phone").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const message = document.getElementById("contact-message").value.trim();

  const whatsappNumber = "573000000000";
  const encodedText = encodeURIComponent(`Hola Cali Sky Stores! Mi nombre es ${name}. Correo: ${email}, Celular: ${phone}. Estoy interesado en una propiedad de la vitrina pública. Mensaje: ${message}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

  document.getElementById("contact-form").reset();
  document.getElementById("contact-modal").classList.remove("active");

  alert("¡Solicitud enviada! Serás redirigido al WhatsApp directo de Cali Sky Stores para una atención inmediata.");
  window.open(whatsappUrl, "_blank");
}

// CRON-JOB.ORG AUTOMATED WORKFLOW FLOWCHART SIMULATION
let isRunningWorkflow = false;

function addTerminalLog(text, type = "system") {
  const term = document.getElementById("workflow-terminal-logs");
  if (!term) return;

  const line = document.createElement("div");
  const time = new Date().toLocaleTimeString();
  line.className = `log-line ${type}`;
  line.textContent = `[${time}] ${text}`;
  
  term.appendChild(line);
  term.scrollTop = term.scrollHeight;
}

function runNightlyWorkflow() {
  if (isRunningWorkflow) return;
  isRunningWorkflow = true;

  const btn = document.getElementById("btn-run-workflow");
  const wfPulse = document.querySelector(".wf-pulse-light");
  
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Ejecutando...`;
  wfPulse.className = "wf-pulse-light orange-pulse";

  const nodes = ["node-trigger", "node-read-db", "node-prompt", "node-groq", "node-publish", "node-brevo"];
  const connectors = ["connector-1", "connector-2", "connector-3", "connector-4", "connector-5"];
  
  nodes.forEach(n => {
    document.getElementById(n).classList.remove("active-node", "done-node");
  });
  connectors.forEach(c => {
    document.getElementById(c).classList.remove("active-link");
  });

  addTerminalLog("INICIANDO AUTOMATIZACIÓN NOCTURNA (Simulando ejecución programada por Cron-Job.org)...", "cron");

  setTimeout(() => {
    // 1. Cron Node
    document.getElementById("node-trigger").classList.add("active-node");
    addTerminalLog("Node 'Cron-Job.org': Disparado por temporizador programado (Webhook HTTP recibido).", "cron");
    
    setTimeout(() => {
      document.getElementById("node-trigger").classList.add("done-node");
      document.getElementById("node-trigger").classList.remove("active-node");
      document.getElementById("connector-1").classList.add("active-link");
      
      // 2. Read DB
      document.getElementById("node-read-db").classList.add("active-node");
      addTerminalLog("Node 'WP Get Profiles': Conectando a WordPress DB... Solicitando perfiles activos.", "wp");
      
      setTimeout(() => {
        const activeCount = state.clients.filter(c => c.status === 'active').length;
        addTerminalLog(`Node 'WP Get Profiles': Obtenidos ${activeCount} perfiles de búsqueda activos con múltiples zonas asociadas.`, "wp");
        document.getElementById("node-read-db").classList.add("done-node");
        document.getElementById("node-read-db").classList.remove("active-node");
        document.getElementById("connector-1").classList.remove("active-link");
        document.getElementById("connector-2").classList.add("active-link");
        
        // 3. Prompt Builder
        document.getElementById("node-prompt").classList.add("active-node");
        addTerminalLog("Node 'Prompt Builder': Armando instrucciones detalladas para la API de Groq Cloud...", "system");
        
        setTimeout(() => {
          addTerminalLog("Node 'Prompt Builder': Inyectando arrays de Zonas y Barrios en el prompt para Groq Llama-3...", "system");
          document.getElementById("node-prompt").classList.add("done-node");
          document.getElementById("node-prompt").classList.remove("active-node");
          document.getElementById("connector-2").classList.remove("active-link");
          document.getElementById("connector-3").classList.add("active-link");
          
          // 4. Groq API
          document.getElementById("node-groq").classList.add("active-node");
          addTerminalLog("Node 'Groq Cloud': Conectando a Groq API Llama-3-70B de alta velocidad...", "groq");
          
          setTimeout(() => {
            addTerminalLog("Node 'Groq Cloud': Llama-3 escaneando Fincaraiz, Metrocuadrado, OLX y grupos de Whatsapp en múltiples sectores de Cali...", "groq");
            
            setTimeout(() => {
              addTerminalLog("Node 'Groq Cloud': Groq filtró con éxito coincidiendo propiedades en las áreas solicitadas.", "groq");
              
              state.addProperties(SIMULATED_NEW_PROPERTIES);
              
              document.getElementById("node-groq").classList.add("done-node");
              document.getElementById("node-groq").classList.remove("active-node");
              document.getElementById("connector-3").classList.remove("active-link");
              document.getElementById("connector-4").classList.add("active-link");
              
              // 5. Publish WP
              document.getElementById("node-publish").classList.add("active-node");
              addTerminalLog("Node 'WP Publish': Creando posts privados en WordPress visibles únicamente para sus respectivos clientes...", "wp");
              
              setTimeout(() => {
                addTerminalLog("Node 'WP Publish': Creado Post Privado ID 50921 para Juan Pérez (Zonas: Sur / Barrio: El Ingenio).", "wp");
                addTerminalLog("Node 'WP Publish': Creado Post Privado ID 50922 para Sophia Gómez (Zonas: Sur / Barrio: Ciudad Jardín).", "wp");
                document.getElementById("node-publish").classList.add("done-node");
                document.getElementById("node-publish").classList.remove("active-node");
                document.getElementById("connector-4").classList.remove("active-link");
                document.getElementById("connector-5").classList.add("active-link");
                
                // 6. Brevo Email
                document.getElementById("node-brevo").classList.add("active-node");
                addTerminalLog("Node 'Brevo API': Armado de payload JSON transaccional. Enviando alertas...", "brevo");
                
                setTimeout(() => {
                  state.clients.filter(c => c.status === 'active').forEach(c => {
                    addTerminalLog(`Node 'Brevo API': Email transaccional enviado a <${c.email}> con plantilla premium de Cali Sky.`, "brevo");
                  });
                  
                  document.getElementById("node-brevo").classList.add("done-node");
                  document.getElementById("node-brevo").classList.remove("active-node");
                  document.getElementById("connector-5").classList.remove("active-link");
                  
                  isRunningWorkflow = false;
                  btn.disabled = false;
                  btn.innerHTML = `<i class="fa-solid fa-play"></i> Ejecutar Búsqueda Nocturna`;
                  wfPulse.className = "wf-pulse-light green";
                  
                  addTerminalLog("PROCESO TERMINADO SATISFACTORIAMENTE. Base de datos e emails actualizados.", "success");
                  
                  renderPublicProperties();
                  if (state.currentUser) {
                    renderPrivateProperties();
                  }
                  updateBrevoPreview();
                  renderCentralDiscoveries();
                  
                  alert("¡Simulación completada con éxito! El flujo automatizado por Cron-Job.org ha detectado y publicado nuevas propiedades utilizando los nuevos filtros avanzados multi-zona. Si inicias sesión como Juan Pérez (juan@email.com) o Sophia Gómez (sophia@email.com), verás sus nuevas propiedades de lujo desbloqueadas en el panel privado.");
                  
                }, 2000);
              }, 2000);
            }, 1800);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  }, 1000);
}

// Render AI Central Discoveries Hub Dashboard
function renderCentralDiscoveries() {
  const container = document.getElementById("admin-discoveries-grid");
  const badge = document.getElementById("discoveries-total-badge");
  if (!container || !badge) return;

  container.innerHTML = "";

  const discoveries = [];

  // Gather matches for all clients
  state.clients.forEach(client => {
    if (client.status !== 'active') return; // only active clients

    const clientMatches = filterClientMatches(client);
    clientMatches.forEach(p => {
      // Avoid duplicate matches showing up for the same client
      if (!discoveries.some(d => d.client.id === client.id && d.property.id === p.id)) {
        discoveries.push({ client, property: p });
      }
    });
  });

  badge.textContent = `${discoveries.length} Hallazgos`;

  if (discoveries.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 40px; margin-bottom: 12px; color: var(--accent-gold); display: block; text-shadow: 0 0 10px rgba(249,168,37,0.3);"></i>
        <p style="font-size: 15px; font-weight: 600; color: #fff; margin-top: 10px;">No hay hallazgos activos en este momento.</p>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.4;">
          Asegúrate de tener perfiles de búsqueda de clientes activos y ejecuta la simulación nocturna en la pestaña "Flujo Cron-Job" para buscar nuevas ofertas en Cali.
        </p>
      </div>
    `;
    return;
  }

  // Render each discovery
  discoveries.forEach(({ client, property: p }) => {
    const card = document.createElement("div");
    card.className = "glass-panel property-card";
    card.style.position = "relative";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.border = "1px solid var(--border-light)";
    card.style.borderRadius = "12px";
    card.style.overflow = "hidden";
    card.style.background = "rgba(10, 10, 20, 0.4)";
    card.style.backdropFilter = "blur(20px)";
    card.style.transition = "transform 0.3s ease, border-color 0.3s ease";
    
    // Compute dynamic match percent based on specs (simulate high premium matching)
    let matchScore = 95;
    if (p.beds === client.beds) matchScore += 2;
    if (p.price <= (client.minPrice + client.maxPrice)/2) matchScore += 2;
    matchScore = Math.min(matchScore, 99);

    // Dynamic WhatsApp message text
    const wsMessage = `Hola ${client.name}, te escribe tu asesor de Cali Sky Stores. Encontré una propiedad de alto interés para tu perfil (${client.type} en ${p.barrio}). Cuenta con ${p.beds} habs, ${p.bathrooms} baños y un precio de ${formatCOP(p.price)}. Puedes ver los detalles confidenciales (dirección y contacto del vendedor) ingresando a tu portal privado con tu correo: ${client.email}. Quedo atento a tus comentarios!`;
    const encodedMsg = encodeURIComponent(wsMessage);
    const clientPhone = client.phone ? client.phone.replace(/\D/g, '') : "3004567890";
    const waUrl = `https://api.whatsapp.com/send?phone=57${clientPhone}&text=${encodedMsg}`;

    card.innerHTML = `
      <div class="card-image-wrap" style="height: 170px; position: relative; overflow: hidden;">
        <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; top: 10px; left: 10px; background: rgba(121, 40, 202, 0.95); backdrop-filter: blur(5px); border: 1px solid var(--accent-purple); color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
          <i class="fa-solid fa-crown text-glow-gold"></i> Para: ${client.name}
        </div>
        <div style="position: absolute; top: 10px; right: 10px; background: rgba(0, 243, 255, 0.95); backdrop-filter: blur(5px); border: 1px solid var(--accent-cyan); color: #020206; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800;">
          <i class="fa-solid fa-heart-pulse"></i> ${matchScore}% Match
        </div>
      </div>
      <div class="card-body" style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1;">
        <h4 style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px; line-height: 1.3;">${p.title}</h4>
        
        <div style="display: flex; gap: 8px; font-size: 11px; color: var(--accent-gold); font-weight: 600; margin-bottom: 10px;">
          <span><i class="fa-solid fa-location-dot"></i> ${p.barrio} (Zona ${p.zone})</span>
          <span>•</span>
          <span style="color: var(--accent-cyan);"><i class="fa-solid fa-tag"></i> ${p.deal}</span>
        </div>

        <p style="color: var(--text-muted); font-size: 12px; line-height: 1.4; margin-bottom: 12px; flex-grow: 1;">
          <strong>Criterio buscado:</strong> ${client.type.charAt(0).toUpperCase() + client.type.slice(1)} de ${client.beds}+ habs hasta ${formatCOP(client.maxPrice)}.
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-top: auto;">
          <div style="font-size: 15px; font-weight: 800; color: var(--accent-gold);">
            ${formatCOP(p.price)}
          </div>
          <a href="${waUrl}" target="_blank" class="btn btn-glow-purple" style="font-size: 11px; padding: 6px 12px; border-radius: 6px; margin: 0; width: auto; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-brands fa-whatsapp"></i> Notificar
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// 6. APP ENGINE INITS & DOM BINDINGS
document.addEventListener("DOMContentLoaded", () => {
  
  // Dynamic Barrio Checkboxes initial load
  loadBarriosForSelectedZones();
  
  // Bind change events to Zone checkboxes to rebuild barrios checklist dynamic grid
  document.querySelectorAll('input[name="client-zone"]').forEach(cb => {
    cb.addEventListener("change", loadBarriosForSelectedZones);
  });

  // Render initial layouts
  renderPublicProperties();
  renderClientsTable();
  populateBrevoClientSelector();
  renderCentralDiscoveries();

  if (state.currentUser) {
    loginUser(state.currentUser.email);
  }

  // Navigation switching handler (SPA)
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
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
    const password = document.getElementById("login-password").value.trim();
    const success = loginUser(email, password);
    if (success) {
      loginModal.classList.remove("active");
      document.getElementById("login-form").reset();
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

  // --- CRON-JOB.ORG AUTOMATION TRIGGER LOGIC ---
  const cronFreqSelect = document.getElementById("cron-frequency");
  const cronTimeInput = document.getElementById("cron-time");
  const cronExpressionDisplay = document.getElementById("cron-expression-display");
  const cronIndicatorText = document.getElementById("cron-indicator-text");
  const btnSaveCron = document.getElementById("btn-save-cron");

  // Helper to generate Cron Expression
  function updateCronExpressionText() {
    const freq = cronFreqSelect.value;
    const timeVal = cronTimeInput.value || "02:00";
    const [hour, minute] = timeVal.split(":");
    
    let expression = "0 2 * * *";
    let summaryText = "Cron Activo (Todos los días)";

    if (freq === "diario") {
      expression = `${parseInt(minute)} ${parseInt(hour)} * * *`;
      summaryText = `Cron Activo (Todos los días a las ${timeVal})`;
    } else if (freq === "12horas") {
      expression = `0 */12 * * *`;
      summaryText = `Cron Activo (Cada 12 horas - 2 veces al día)`;
    } else if (freq === "6horas") {
      expression = `0 */6 * * *`;
      summaryText = `Cron Activo (Cada 6 horas - 4 veces al día)`;
    }

    cronExpressionDisplay.textContent = expression;
    cronIndicatorText.textContent = summaryText;

    return { expression, summaryText, freq, timeVal };
  }

  // Load saved Cron Settings
  const savedCronSettings = JSON.parse(localStorage.getItem("calisky_cron_settings")) || {
    freq: "diario",
    timeVal: "02:00"
  };

  // Pre-fill fields
  if (cronFreqSelect && cronTimeInput) {
    cronFreqSelect.value = savedCronSettings.freq;
    cronTimeInput.value = savedCronSettings.timeVal;
    
    const cronDetails = updateCronExpressionText();
    const nodeSpan = document.querySelector("#node-trigger .node-meta span");
    if (nodeSpan) {
      if (cronDetails.freq === "diario") {
        nodeSpan.textContent = `Cada día ${cronDetails.timeVal}`;
      } else {
        nodeSpan.textContent = cronDetails.freq === "12horas" ? "Cada 12 horas" : "Cada 6 horas";
      }
    }
  }

  // Bind change events to dynamically update expression
  if (cronFreqSelect) cronFreqSelect.addEventListener("change", updateCronExpressionText);
  if (cronTimeInput) cronTimeInput.addEventListener("input", updateCronExpressionText);

  // Save Cron Settings button handler
  if (btnSaveCron) {
    btnSaveCron.addEventListener("click", () => {
      const details = updateCronExpressionText();
      
      localStorage.setItem("calisky_cron_settings", JSON.stringify({
        freq: details.freq,
        timeVal: details.timeVal
      }));

      const nodeSpan = document.querySelector("#node-trigger .node-meta span");
      if (nodeSpan) {
        if (details.freq === "diario") {
          nodeSpan.textContent = `Cada día ${details.timeVal}`;
        } else {
          nodeSpan.textContent = details.freq === "12horas" ? "Cada 12 horas" : "Cada 6 horas";
        }
      }

      addTerminalLog(`Programador de Cron-Job.org actualizado con éxito. Expresión cron activa: "${details.expression}". Próxima ejecución programada.`, "success");

      alert(`¡Disparador de Cron-Job.org configurado exitosamente!\n\nFrecuencia: ${details.summaryText}\nCron Expression: ${details.expression}\n\nLos cambios se han guardado de forma permanente en la base de datos local y se han reflejado en el nodo visual.`);
    });
  }
});
