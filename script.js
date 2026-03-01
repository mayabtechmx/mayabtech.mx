// ============================================
// CONFIGURACIÓN GLOBAL - TODO VIENE DEL XML
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
                nombre: getTagValue(sitio, 'nombre'),
                descripcion: getTagValue(sitio, 'descripcion'),
                telefono: getTagValue(sitio, 'telefono'),
                email: getTagValue(sitio, 'email'),
                direccion: {
                    calle: getTagValue(sitio, 'calle'),
                    colonia: getTagValue(sitio, 'colonia'),
                    ciudad: getTagValue(sitio, 'ciudad'),
                    cp: getTagValue(sitio, 'cp'),
                    municipio: getTagValue(sitio, 'municipio'),
                    estado: getTagValue(sitio, 'estado'),
                    mapa: getTagValue(sitio, 'mapa'),
                    iframe: getTagValue(sitio, 'iframe')
                },
                horario: getMultipleTagValues(sitio, 'horario', 'dia'),
                redes: {
                    facebook: getTagValue(sitio, 'facebook'),
                    instagram: getTagValue(sitio, 'instagram'),
                    whatsapp: getTagValue(sitio, 'whatsapp')
                }
            };
        }
        
        // Cargar configuración del carrusel
        const carrusel = xmlDoc.getElementsByTagName('carrusel')[0];
        if (carrusel) {
            const config = carrusel.getElementsByTagName('config')[0];
            const slides = [];
            const slideNodes = carrusel.getElementsByTagName('slide');
            
            for (let slide of slideNodes) {
                if (getTagValue(slide, 'activo') === 'true') {
                    slides.push({
                        imagen: getTagValue(slide, 'imagen'),
                        texto: getTagValue(slide, 'texto'),
                        enlace: getTagValue(slide, 'enlace'),
                        color_texto: getTagValue(slide, 'color_texto') || '#ffffff'
                    });
                }
            }
            
            CARRUSEL = {
                intervalo: parseInt(getTagValue(config, 'intervalo')) || 4000,
                autoplay: getTagValue(config, 'autoplay') === 'true',
                mostrar_controles: getTagValue(config, 'mostrar_controles') === 'true',
                mostrar_dots: getTagValue(config, 'mostrar_dots') === 'true',
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
                    id: cat.getAttribute('id'),
                    nombre: getTagValue(cat, 'nombre'),
                    icono: getTagValue(cat, 'icono'),
                    descripcion: getTagValue(cat, 'descripcion'),
                    imagen: getTagValue(cat, 'imagen'),
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
                    id: prod.getAttribute('id'),
                    nombre: getTagValue(prod, 'nombre'),
                    categoria: getTagValue(prod, 'categoria'),
                    precio: parseInt(getTagValue(prod, 'precio')) || 0,
                    descripcion: getTagValue(prod, 'descripcion'),
                    imagenes: imagenes,
                    especificaciones: especificaciones,
                    envio_gratis: getTagValue(prod, 'envio_gratis') === 'true',
                    stock: parseInt(getTagValue(prod, 'stock')) || 0,
                    marca: getTagValue(prod, 'marca'),
                    destacado: getTagValue(prod, 'destacado') === 'true'
                });
            }
        }
        
        // Cargar configuración de página
        const pagina = xmlDoc.getElementsByTagName('pagina')[0];
        if (pagina) {
            PAGINA = {
                productos_por_pagina: parseInt(getTagValue(pagina, 'productos_por_pagina')) || 12,
                productos_destacados_por_categoria: parseInt(getTagValue(pagina, 'productos_destacados_por_categoria')) || 4,
                moneda: getTagValue(pagina, 'moneda') || '$',
                formato_precio: getTagValue(pagina, 'formato_precio') || 'CLP',
                impuesto_incluido: getTagValue(pagina, 'impuesto_incluido') === 'true',
                porcentaje_impuesto: parseInt(getTagValue(pagina, 'porcentaje_impuesto')) || 0
            };
        }
        
        // Cargar mensajes
        const mensajes = xmlDoc.getElementsByTagName('mensajes')[0];
        if (mensajes) {
            const msgNodes = mensajes.getElementsByTagName('mensaje');
            MENSAJES = {};
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

function getTagValue(parent, tagName) {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent : '';
}

function getMultipleTagValues(parent, parentTag, childTag) {
    const values = [];
    const parentElem = parent.getElementsByTagName(parentTag)[0];
    if (parentElem) {
        const children = parentElem.getElementsByTagName(childTag);
        for (let child of children) {
            values.push(child.textContent);
        }
    }
    return values;
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
        if (!this.slidesContainer || !CARRUSEL.slides.length) return;
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
                
                if (config.enlace) {
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
                this.startAutoSlide();
            });
            
            document.getElementById('nextBtn')?.addEventListener('click', () => {
                this.next();
                this.stopAutoSlide();
                this.startAutoSlide();
            });
        } else {
            document.getElementById('prevBtn')?.style.display = 'none';
            document.getElementById('nextBtn')?.style.display = 'none';
        }
        
        const carousel = document.getElementById('carousel');
        carousel?.addEventListener('mouseenter', () => this.stopAutoSlide());
        carousel?.addEventListener('mouseleave', () => this.startAutoSlide());
        
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
                       prod.descripcion.toLowerCase().includes(term);
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
            <div class="product-price">${PAGINA.moneda}${prod.precio.toLocaleString()}</div>
            ${prod.envio_gratis ? '<div class="product-shipping"><i class="fas fa-truck"></i> ' + (MENSAJES.envio_gratis || 'Envío gratis') + '</div>' : ''}
            <p class="product-description">${prod.descripcion}</p>
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
            // Mostrar por categorías
            CATEGORIAS.filter(cat => cat.destacado).forEach(cat => {
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
                
                productosCat.slice(0, PAGINA.productos_destacados_por_categoria).forEach(prod => {
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
        document.getElementById('searchInput').value = '';
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
    // Cargar configuración
    await loadConfiguracion();
    
    // Actualizar título de la página
    document.title = SITIO.nombre + ' · ' + SITIO.descripcion;
    
    // Inicializar carrusel
    const carousel = new Carousel('carousel');
    setTimeout(() => carousel.update(), 100);
    
    // Inicializar renderizador de productos
    const renderer = new ProductRenderer('mainContainer');
    
    // Configurar búsqueda
    document.getElementById('searchButton')?.addEventListener('click', () => {
        const input = document.getElementById('searchInput');
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
            document.getElementById('searchButton').click();
        }
    });
    
    // Configurar navegación por categorías (dinámico desde XML)
    const categoryNav = document.getElementById('categoryNav');
    if (categoryNav) {
        categoryNav.innerHTML = '<a data-category="all" class="active"><i class="fas fa-home"></i> Todos</a>';
        CATEGORIAS.forEach(cat => {
            const link = document.createElement('a');
            link.dataset.category = cat.id;
            link.innerHTML = `<i class="fas ${cat.icono}"></i> ${cat.nombre}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                renderer.setFilter(cat.id);
                document.getElementById('mainContainer').scrollIntoView({ behavior: 'smooth' });
            });
            categoryNav.appendChild(link);
        });
    }
    
    // Configurar información del sitio en footer
    const footer = document.querySelector('footer');
    if (footer) {
        const footerContent = footer.querySelector('.footer-content');
        if (footerContent) {
            footerContent.innerHTML = `
                <div class="footer-logo">
                    <i class="fas fa-bolt"></i> ${SITIO.nombre}
                </div>
                <div class="footer-links">
                    <a href="index.html">Inicio</a>
                    ${CATEGORIAS.map(cat => `<a href="categoria.html?cat=${cat.id}">${cat.nombre}</a>`).join('')}
                    <a href="#visitanos">Visítanos</a>
                </div>
                <p class="copyright">© 2025 ${SITIO.nombre} - ${SITIO.descripcion}</p>
            `;
        }
    }
    
    // Configurar sección Visítanos
    const visitSection = document.getElementById('visitanos');
    if (visitSection) {
        const visitContainer = visitSection.querySelector('.visit-container');
        if (visitContainer) {
            visitContainer.innerHTML = `
                <div class="visit-info">
                    <h2><i class="fas fa-store"></i> ¡Visítanos!</h2>
                    <p>Estamos ubicados en el corazón de Hecelchakán, Campeche. Te esperamos para ofrecerte la mejor tecnología y atención personalizada.</p>
                    
                    <div class="address">
                        <p><i class="fas fa-map-pin"></i> <span>Dirección:</span><br>
                        ${SITIO.direccion.calle}<br>
                        ${SITIO.direccion.colonia}<br>
                        ${SITIO.direccion.ciudad}, ${SITIO.direccion.cp}<br>
                        ${SITIO.direccion.municipio}, ${SITIO.direccion.estado}</p>
                        
                        <p><i class="fas fa-phone-alt"></i> <span>Teléfono:</span><br>
                        ${SITIO.telefono}</p>
                        
                        <p><i class="fas fa-envelope"></i> <span>Email:</span><br>
                        ${SITIO.email}</p>
                    </div>
                    
                    <div class="visit-hours">
                        <p><i class="fas fa-clock"></i> <span>Horario de atención:</span><br>
                        ${SITIO.horario.join('<br>')}</p>
                    </div>
                    
                    <a href="${SITIO.direccion.mapa}" target="_blank" class="map-button">
                        <i class="fas fa-directions"></i> Cómo llegar (Google Maps)
                    </a>
                </div>
                
                <div class="map-container">
                    <iframe 
                        src="${SITIO.direccion.iframe}" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            `;
        }
    }
    
    // Smooth scroll para "Visítanos"
    document.querySelector('.visit-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('visitanos').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Renderizar productos
    renderer.setFilter('all');
});