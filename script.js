// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
let SITIO = {};
let CARRUSEL = {};
let CATEGORIAS = [];
let PRODUCTOS = [];
let PAGINA = {};
let MENSAJES = {};

// ============================================
// FUNCIONES UTILITARIAS
// ============================================
function getImageUrl(imageName) {
    if (!imageName) return 'https://via.placeholder.com/300x300?text=Sin+imagen';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
    }
    return 'imagenes/' + imageName;
}

function parseXML(xmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, "text/xml");
}

function getTagValue(parent, tagName) {
    if (!parent) return '';
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent : '';
}

// ============================================
// CARGA DE CONFIGURACIÓN DESDE XML
// ============================================
async function loadConfiguracion() {
    try {
        const response = await fetch('config.xml');
        const xmlText = await response.text();
        const xmlDoc = parseXML(xmlText);
        
        // Cargar información del sitio
        const sitio = xmlDoc.getElementsByTagName('sitio')[0];
        if (sitio) {
            SITIO = {
                nombre: getTagValue(sitio, 'nombre') || 'mayabtech.mx',
                descripcion: getTagValue(sitio, 'descripcion') || 'Tecnología en Campeche y Yucatán',
                telefono: getTagValue(sitio, 'telefono') || '+52 981 123 4567',
                email: getTagValue(sitio, 'email') || 'ventas@mayabtech.mx',
                direccion: {
                    calle: getTagValue(sitio, 'calle') || 'C. 20 77, Centro',
                    colonia: getTagValue(sitio, 'colonia') || 'Centro',
                    ciudad: getTagValue(sitio, 'ciudad') || 'San Francisco de Campeche',
                    cp: getTagValue(sitio, 'cp') || '24800',
                    municipio: getTagValue(sitio, 'municipio') || 'Hecelchakán',
                    estado: getTagValue(sitio, 'estado') || 'Camp.',
                    mapa: getTagValue(sitio, 'mapa') || 'https://maps.app.goo.gl/VEB5XRypW2ZF6gFy9',
                    iframe: getTagValue(sitio, 'iframe') || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.960434517287!2d-90.13470692490283!3d19.57747493724892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f5d3b8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sC.%2020%2077%2C%20Centro%2C%2024800%20San%20Francisco%20de%20Campeche%2C%20Camp.!5e0!3m2!1ses!2smx!4v1709765432100'
                },
                horario: [],
                redes: {}
            };
            
            // Cargar horario
            const horario = sitio.getElementsByTagName('horario')[0];
            if (horario) {
                const dias = horario.getElementsByTagName('dia');
                for (let dia of dias) {
                    SITIO.horario.push(dia.textContent);
                }
            }
        }
        
        // Cargar configuración del carrusel
        const carrusel = xmlDoc.getElementsByTagName('carrusel')[0];
        if (carrusel) {
            const config = carrusel.getElementsByTagName('config')[0] || carrusel;
            const slides = [];
            const slideNodes = carrusel.getElementsByTagName('slide');
            
            for (let slide of slideNodes) {
                if (getTagValue(slide, 'activo') !== 'false') {
                    slides.push({
                        imagen: getTagValue(slide, 'imagen') || 'https://via.placeholder.com/1200x300',
                        texto: getTagValue(slide, 'texto') || '',
                        enlace: getTagValue(slide, 'enlace') || '#',
                        color_texto: getTagValue(slide, 'color_texto') || '#ffffff'
                    });
                }
            }
            
            CARRUSEL = {
                intervalo: parseInt(getTagValue(config, 'intervalo')) || 4000,
                autoplay: getTagValue(config, 'autoplay') !== 'false',
                mostrar_controles: getTagValue(config, 'mostrar_controles') !== 'false',
                mostrar_dots: getTagValue(config, 'mostrar_dots') !== 'false',
                slides: slides
            };
        }
        
        // Cargar categorías
        const categorias = xmlDoc.getElementsByTagName('categorias')[0];
        if (categorias) {
            const categoriaNodes = categorias.getElementsByTagName('categoria');
            CATEGORIAS = [];
            for (let cat of categoriaNodes) {
                CATEGORIAS.push({
                    id: cat.getAttribute('id') || `cat_${Math.random()}`,
                    nombre: getTagValue(cat, 'nombre') || 'Categoría',
                    icono: getTagValue(cat, 'icono') || 'fa-tag',
                    descripcion: getTagValue(cat, 'descripcion') || '',
                    imagen: getTagValue(cat, 'imagen') || '',
                    orden: parseInt(getTagValue(cat, 'orden')) || 999,
                    destacado: getTagValue(cat, 'destacado') === 'true'
                });
            }
            // Ordenar por orden
            CATEGORIAS.sort((a, b) => a.orden - b.orden);
        }
        
        // Cargar productos
        const productos = xmlDoc.getElementsByTagName('productos')[0];
        if (productos) {
            const productoNodes = productos.getElementsByTagName('producto');
            PRODUCTOS = [];
            for (let prod of productoNodes) {
                const imagenes = [];
                const imgNodes = prod.getElementsByTagName('imagen');
                for (let img of imgNodes) {
                    imagenes.push(img.textContent);
                }
                
                const especificaciones = [];
                const espNodes = prod.getElementsByTagName('especificacion');
                for (let esp of espNodes) {
                    especificaciones.push(esp.textContent);
                }
                
                PRODUCTOS.push({
                    id: prod.getAttribute('id') || `prod_${Math.random()}`,
                    nombre: getTagValue(prod, 'nombre') || 'Producto',
                    categoria: getTagValue(prod, 'categoria') || 'general',
                    precio: parseInt(getTagValue(prod, 'precio')) || 9900,
                    descripcion: getTagValue(prod, 'descripcion') || 'Descripción del producto',
                    imagenes: imagenes.length ? imagenes : ['https://via.placeholder.com/300x300'],
                    especificaciones: especificaciones,
                    envio_gratis: getTagValue(prod, 'envio_gratis') === 'true',
                    stock: parseInt(getTagValue(prod, 'stock')) || 10,
                    marca: getTagValue(prod, 'marca') || 'Genérica',
                    destacado: getTagValue(prod, 'destacado') === 'true'
                });
            }
        }
        
        // Cargar configuración de página
        const pagina = xmlDoc.getElementsByTagName('pagina')[0];
        PAGINA = {
            productos_por_pagina: parseInt(getTagValue(pagina, 'productos_por_pagina')) || 12,
            productos_destacados_por_categoria: parseInt(getTagValue(pagina, 'productos_destacados_por_categoria')) || 4,
            moneda: getTagValue(pagina, 'moneda') || '$',
            formato_precio: getTagValue(pagina, 'formato_precio') || 'CLP',
            impuesto_incluido: getTagValue(pagina, 'impuesto_incluido') === 'true',
            porcentaje_impuesto: parseInt(getTagValue(pagina, 'porcentaje_impuesto')) || 0
        };
        
        // Cargar mensajes
        const mensajes = xmlDoc.getElementsByTagName('mensajes')[0];
        MENSAJES = {};
        if (mensajes) {
            const msgNodes = mensajes.getElementsByTagName('mensaje');
            for (let msg of msgNodes) {
                const tipo = msg.getAttribute('tipo');
                MENSAJES[tipo] = msg.textContent;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error cargando configuración:', error);
        return false;
    }
}

// ============================================
// CARRUSEL
// ============================================
class Carousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.slidesContainer = document.getElementById('carouselSlides');
        this.dotsContainer = document.getElementById('carouselDots');
        this.currentIndex = 0;
        this.interval = null;
        
        this.init();
    }
    
    init() {
        if (!this.slidesContainer || !CARRUSEL.slides || !CARRUSEL.slides.length) return;
        this.buildSlides();
        this.createDots();
        this.addEventListeners();
        if (CARRUSEL.autoplay) this.startAutoSlide();
    }
    
    buildSlides() {
        this.slidesContainer.innerHTML = '';
        CARRUSEL.slides.forEach((config, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'carousel-slide';
            
            const img = document.createElement('img');
            img.src = getImageUrl(config.imagen);
            img.alt = `Promoción ${index+1}`;
            img.onerror = () => {
                img.src = 'https://via.placeholder.com/1200x300?text=Imagen+no+disponible';
            };
            slideDiv.appendChild(img);
            
            if (config.texto) {
                const textDiv = document.createElement('div');
                textDiv.className = 'slide-text';
                
                if (config.enlace && config.enlace !== '#') {
                    const link = document.createElement('a');
                    link.href = config.enlace;
                    link.textContent = config.texto;
                    link.style.color = config.color_texto;
                    textDiv.appendChild(link);
                } else {
                    const span = document.createElement('span');
                    span.textContent = config.texto;
                    span.style.color = config.color_texto;
                    span.style.padding = '12px 24px';
                    span.style.background = 'rgba(0,0,0,0.7)';
                    span.style.borderRadius = '50px';
                    span.style.display = 'inline-block';
                    textDiv.appendChild(span);
                }
                
                slideDiv.appendChild(textDiv);
            }
            
            this.slidesContainer.appendChild(slideDiv);
        });
    }
    
    createDots() {
        if (!this.dotsContainer || !CARRUSEL.mostrar_dots) return;
        this.dotsContainer.innerHTML = '';
        CARRUSEL.slides.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = 'dot' + (idx === 0 ? ' active' : '');
            dot.dataset.index = idx;
            dot.addEventListener('click', () => this.goToSlide(idx));
            this.dotsContainer.appendChild(dot);
        });
    }
    
    update() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (!slides.length) return;
        const width = slides[0].clientWidth;
        this.slidesContainer.style.transform = `translateX(-${this.currentIndex * width}px)`;
        
        if (CARRUSEL.mostrar_dots) {
            document.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentIndex);
            });
        }
    }
    
    next() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length) {
            this.currentIndex = (this.currentIndex + 1) % slides.length;
            this.update();
        }
    }
    
    prev() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length) {
            this.currentIndex = (this.currentIndex - 1 + slides.length) % slides.length;
            this.update();
        }
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.update();
    }
    
    startAutoSlide() {
        this.stopAutoSlide();
        this.interval = setInterval(() => this.next(), CARRUSEL.intervalo);
    }
    
    stopAutoSlide() {
        clearInterval(this.interval);
    }
    
    addEventListeners() {
        if (CARRUSEL.mostrar_controles) {
            document.getElementById('prevBtn')?.addEventListener('click', () => {
                this.prev();
                this.stopAutoSlide();
                if (CARRUSEL.autoplay) this.startAutoSlide();
            });
            
            document.getElementById('nextBtn')?.addEventListener('click', () => {
                this.next();
                this.stopAutoSlide();
                if (CARRUSEL.autoplay) this.startAutoSlide();
            });
        } else {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
        
        const carousel = document.getElementById('carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoSlide());
            carousel.addEventListener('mouseleave', () => {
                if (CARRUSEL.autoplay) this.startAutoSlide();
            });
        }
        
        window.addEventListener('resize', () => this.update());
    }
}

// ============================================
// RENDERIZADO DE PRODUCTOS
// ============================================
class ProductRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFilter = 'all';
        this.searchTerm = '';
    }
    
    filterProducts() {
        return PRODUCTOS.filter(prod => {
            if (this.currentFilter !== 'all' && prod.categoria !== this.currentFilter) {
                return false;
            }
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                return prod.nombre.toLowerCase().includes(term) || 
                       (prod.descripcion && prod.descripcion.toLowerCase().includes(term));
            }
            return true;
        });
    }
    
    createProductCard(prod) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => {
            window.location.href = `producto.html?id=${prod.id}`;
        };
        
        const imgSrc = prod.imagenes && prod.imagenes[0] 
            ? getImageUrl(prod.imagenes[0])
            : 'https://via.placeholder.com/200x200?text=Producto';
        
        card.innerHTML = `
            <img class="product-img" src="${imgSrc}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/200x200?text=Sin+imagen'">
            <h3 class="product-title">${prod.nombre}</h3>
            <div class="product-price">${PAGINA.moneda || '$'}${prod.precio.toLocaleString()}</div>
            ${prod.envio_gratis ? '<div class="product-shipping"><i class="fas fa-truck"></i> ' + (MENSAJES.envio_gratis || 'Envío gratis') + '</div>' : ''}
            <p class="product-description">${prod.descripcion || ''}</p>
            <div class="product-footer">
                <button class="btn-buy" onclick="event.stopPropagation()"><i class="fas fa-bolt"></i> Comprar</button>
                <i class="far fa-heart" onclick="event.stopPropagation()"></i>
            </div>
        `;
        return card;
    }
    
    render() {
        if (!this.container) return;
        
        const filteredProducts = this.filterProducts();
        this.container.innerHTML = '';
        
        if (this.searchTerm) {
            const searchInfo = document.createElement('div');
            searchInfo.className = 'search-info';
            searchInfo.innerHTML = `
                <span><i class="fas fa-search"></i> Buscando: "${this.searchTerm}" - ${filteredProducts.length} resultados</span>
                <button class="clear-search" id="clearSearch"><i class="fas fa-times"></i> Limpiar búsqueda</button>
            `;
            this.container.appendChild(searchInfo);
            
            document.getElementById('clearSearch')?.addEventListener('click', () => {
                document.getElementById('searchInput').value = '';
                this.searchTerm = '';
                this.render();
            });
        }
        
        if (filteredProducts.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 20px; color: #ccc;"></i>
                <h3>No encontramos productos</h3>
                <p>Intenta con otra búsqueda o categoría</p>
            `;
            this.container.appendChild(noResults);
            return;
        }
        
        if (this.currentFilter === 'all' && !this.searchTerm) {
            // Mostrar TODAS las categorías que tengan productos
            CATEGORIAS.forEach(cat => {
                const productosCat = filteredProducts.filter(p => p.categoria === cat.id);
                if (productosCat.length === 0) return;
                
                const section = document.createElement('section');
                section.className = 'category-section';
                section.id = cat.id;
                
                const header = document.createElement('div');
                header.className = 'category-header';
                header.innerHTML = `
                    <h2><i class="fas ${cat.icono}"></i> ${cat.nombre}</h2>
                    <a class="view-all-link" data-category="${cat.id}"><i class="fas fa-arrow-right"></i> Mostrar todos</a>
                `;
                section.appendChild(header);
                
                const grid = document.createElement('div');
                grid.className = 'product-grid';
                
                const maxProductos = PAGINA.productos_destacados_por_categoria || 4;
                productosCat.slice(0, maxProductos).forEach(prod => {
                    grid.appendChild(this.createProductCard(prod));
                });
                
                section.appendChild(grid);
                this.container.appendChild(section);
            });
        } else {
            // Vista de resultados
            const grid = document.createElement('div');
            grid.className = 'product-grid';
            
            filteredProducts.forEach(prod => {
                grid.appendChild(this.createProductCard(prod));
            });
            
            this.container.appendChild(grid);
        }
        
        document.querySelectorAll('.view-all-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = e.currentTarget.dataset.category;
                if (category) {
                    window.location.href = `categoria.html?cat=${category}`;
                }
            });
        });
    }
    
    setFilter(category) {
        this.currentFilter = category;
        this.searchTerm = '';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        this.render();
        
        document.querySelectorAll('.category-nav a').forEach(link => {
            const linkCat = link.dataset.category;
            link.classList.toggle('active', linkCat === category);
        });
    }
    
    setSearch(term) {
        this.searchTerm = term;
        this.currentFilter = 'all';
        this.render();
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando mayabtech.mx...');
    
    // Cargar configuración
    await loadConfiguracion();
    console.log('Configuración cargada:', { CATEGORIAS: CATEGORIAS.length, PRODUCTOS: PRODUCTOS.length });
    
    // Actualizar título de la página
    document.title = (SITIO.nombre || 'mayabtech.mx') + ' · ' + (SITIO.descripcion || 'Tecnología en Campeche y Yucatán');
    
    // Actualizar logo
    const logo = document.getElementById('logo');
    if (logo) {
        logo.innerHTML = `<i class="fas fa-bolt"></i> ${SITIO.nombre || 'mayabtech.mx'}`;
    }
    
    // Inicializar carrusel
    if (CARRUSEL.slides && CARRUSEL.slides.length) {
        const carousel = new Carousel('carousel');
        setTimeout(() => carousel.update(), 100);
    }
    
    // Inicializar renderizador de productos
    const renderer = new ProductRenderer('mainContainer');
    
    // Configurar búsqueda
    document.getElementById('searchButton')?.addEventListener('click', () => {
        const input = document.getElementById('searchInput');
        if (!input) return;
        const term = input.value.trim();
        if (term) {
            renderer.setSearch(term);
            document.querySelectorAll('.category-nav a').forEach(link => {
                link.classList.toggle('active', link.dataset.category === 'all');
            });
        }
    });
    
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('searchButton')?.click();
        }
    });
    
    // Configurar navegación por categorías
    const categoryNav = document.getElementById('categoryNav');
    if (categoryNav) {
        categoryNav.innerHTML = '<a data-category="all" class="active"><i class="fas fa-home"></i> Todos</a>';
        CATEGORIAS.forEach(cat => {
            const link = document.createElement('a');
            link.dataset.category = cat.id;
            link.innerHTML = `<i class="fas ${cat.icono || 'fa-tag'}"></i> ${cat.nombre || 'Categoría'}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                renderer.setFilter(cat.id);
                const mainContainer = document.getElementById('mainContainer');
                if (mainContainer) mainContainer.scrollIntoView({ behavior: 'smooth' });
            });
            categoryNav.appendChild(link);
        });
    }
    
    // Configurar información del sitio en footer
    const footerContent = document.querySelector('.footer-content');
    if (footerContent) {
        footerContent.innerHTML = `
            <div class="footer-logo">
                <i class="fas fa-bolt"></i> ${SITIO.nombre || 'mayabtech.mx'}
            </div>
            <div class="footer-links">
                <a href="index.html">Inicio</a>
                ${CATEGORIAS.map(cat => `<a href="categoria.html?cat=${cat.id}">${cat.nombre || 'Categoría'}</a>`).join('')}
                <a href="#visitanos">Visítanos</a>
            </div>
            <p class="copyright">© 2025 ${SITIO.nombre || 'mayabtech.mx'} - ${SITIO.descripcion || 'Tecnología en Campeche y Yucatán'}</p>
        `;
    }
    
    // Configurar sección Visítanos
    const visitContainer = document.querySelector('.visit-container');
    if (visitContainer) {
        const horarioHTML = SITIO.horario && SITIO.horario.length 
            ? SITIO.horario.join('<br>') 
            : 'Lunes a Viernes: 9:00 AM - 7:00 PM<br>Sábados: 10:00 AM - 4:00 PM<br>Domingos: Cerrado';
        
        visitContainer.innerHTML = `
            <div class="visit-info">
                <h2><i class="fas fa-store"></i> ¡Visítanos!</h2>
                <p>Estamos ubicados en el corazón de Hecelchakán, Campeche. Te esperamos para ofrecerte la mejor tecnología y atención personalizada.</p>
                
                <div class="address">
                    <p><i class="fas fa-map-pin"></i> <span>Dirección:</span><br>
                    ${SITIO.direccion?.calle || 'C. 20 77, Centro'}<br>
                    ${SITIO.direccion?.colonia || 'Centro'}<br>
                    ${SITIO.direccion?.ciudad || 'San Francisco de Campeche'}, ${SITIO.direccion?.cp || '24800'}<br>
                    ${SITIO.direccion?.municipio || 'Hecelchakán'}, ${SITIO.direccion?.estado || 'Camp.'}</p>
                    
                    <p><i class="fas fa-phone-alt"></i> <span>Teléfono:</span><br>
                    ${SITIO.telefono || '+52 981 123 4567'}</p>
                    
                    <p><i class="fas fa-envelope"></i> <span>Email:</span><br>
                    ${SITIO.email || 'ventas@mayabtech.mx'}</p>
                </div>
                
                <div class="visit-hours">
                    <p><i class="fas fa-clock"></i> <span>Horario de atención:</span><br>
                    ${horarioHTML}</p>
                </div>
                
                <a href="${SITIO.direccion?.mapa || '#'}" target="_blank" class="map-button">
                    <i class="fas fa-directions"></i> Cómo llegar (Google Maps)
                </a>
            </div>
            
            <div class="map-container">
                <iframe 
                    src="${SITIO.direccion?.iframe || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.960434517287!2d-90.13470692490283!3d19.57747493724892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f5d3b8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sC.%2020%2077%2C%20Centro%2C%2024800%20San%20Francisco%20de%20Campeche%2C%20Camp.!5e0!3m2!1ses!2smx!4v1709765432100'}" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        `;
    }
    
    // Smooth scroll para "Visítanos"
    document.querySelector('.visit-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        const visitSection = document.getElementById('visitanos');
        if (visitSection) visitSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Renderizar productos
    renderer.setFilter('all');
    
    console.log('Inicialización completa');
});