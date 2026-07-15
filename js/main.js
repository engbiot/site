// ==========================================
// [SEÇÃO 1] MODO DIA/NOITE (LIGHT MODE TOGGLE) COM LOCALSTORAGE
// Gerencia a troca de tema (claro/escuro) e armazena a preferência na máquina do usuário.
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
});

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
}

// ==========================================
// [SEÇÃO 2] PULL TO REFRESH (ATUALIZAÇÃO NATIVA MOBILE)
// Simula a interação de aplicativos nativos de celular ao puxar a tela para baixo.
// ==========================================
let pStartY = 0;
let isPulling = false;
const ptrOverlay = document.getElementById('ptr-overlay');
const ptrPanelBg = document.getElementById('ptr-panel-bg');
const ptrContent = document.getElementById('ptr-content');
const MAX_PULL = 180; 
const THRESHOLD = 120; 

document.addEventListener('touchstart', (e) => {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide || activeSlide.scrollTop <= 0) {
        pStartY = e.touches[0].clientY;
        isPulling = true;
        ptrPanelBg.style.transition = 'none';
        ptrContent.style.transition = 'none';
    }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - pStartY;

    if (distance > 0) {
        let pullDistance = Math.min(distance * 0.5, MAX_PULL);
        
        ptrOverlay.style.opacity = '1';
        ptrOverlay.style.pointerEvents = 'all';
        
        ptrPanelBg.style.transform = `translateY(${100 + (pullDistance / window.innerHeight * 100)}vh)`;
        ptrContent.style.transform = `translateY(${-50 + pullDistance}px)`;
        ptrContent.style.opacity = Math.min(pullDistance / THRESHOLD, 1);
    }

}, { passive: false });

document.addEventListener('touchend', () => {
    if (!isPulling) return;
    isPulling = false;
    
    ptrPanelBg.style.transition = 'transform 0.4s ease-out';
    ptrContent.style.transition = 'transform 0.4s ease-out, opacity 0.4s';
    
    const currentY = parseFloat(ptrContent.style.transform.replace(/[^\d.-]/g, '')) || 0;
    if (currentY > (THRESHOLD - 50)) {
        ptrContent.innerHTML = '<span>Atualizando...</span>';
        setTimeout(() => { location.reload(); }, 500);
    } else {
        ptrOverlay.style.opacity = '0';
        ptrOverlay.style.pointerEvents = 'none';
        ptrPanelBg.style.transform = 'translateY(0)';
        ptrContent.style.transform = 'translateY(-50px)';
        ptrContent.style.opacity = '0';
    }
});

// ==========================================
// [SEÇÃO 3] TELA DE ABERTURA (SPLASH SCREEN)
// ==========================================
function closeSplash() {
    const splash = document.getElementById('splash-screen');
    if(!splash || splash.classList.contains('splitting')) return;
    splash.classList.add('splitting');
    setTimeout(() => { splash.style.display = 'none'; }, 1000); 
}

// ==========================================
// [SEÇÃO 4] NAVEGAÇÃO HISTORY API E INJEÇÃO DE RODAPÉS (CORRIGIDO E BLINDADO)
// ==========================================

// Função centralizada para ler a URL de forma infalível e retornar o slide correto
function getRouteFromURL() {
    let route = 'inicio';
    
    // 1. Verifica se há um parâmetro ?p= (Caso o navegador ainda guarde o cache do código antigo)
    const urlParams = new URLSearchParams(window.location.search);
    const pParam = urlParams.get('p');
    
    if (pParam) {
        route = pParam.replace(/^\/|\/$/g, '');
    } else {
        // 2. Lê o caminho real (ex: /contato)
        let path = window.location.pathname.replace(/^\/|\/$/g, '');
        // Se estiver em subpastas, garante que pega apenas o nome da página
        let pathParts = path.split('/');
        route = pathParts[pathParts.length - 1] || 'inicio';
    }

    // 3. Suporte aos hashes velhos de quem salvou o site antes da atualização (ex: #s3)
    const hash = window.location.hash;
    if (hash && hash.startsWith('#s')) {
        const slideIndex = parseInt(hash.replace('#s', ''), 10);
        const legacyMap = ['inicio', 'sobre', 'servicos', 'contato', 'adequacao-regulatoria', 'otimizacao-de-bioprocessos', 'solucoes-digitais', 'responsabilidade-tecnica', 'pgrs', 'bpf', 'pericia', 'previsibilidade-de-producao', 'bebidas-fermentadas', 'panificacao', 'maturacao-de-laticinios', 'controle-microbiologico', 'valorizacao-de-residuos', 'modelagem-matematica', 'desenvolvimento-web', 'orcamento-web'];
        if (!isNaN(slideIndex) && legacyMap[slideIndex]) {
            route = legacyMap[slideIndex];
        }
    }

    return route;
}

window.addEventListener('popstate', function(e) {
    if (e.state !== null && typeof e.state.slide !== 'undefined') {
        navigateTo(e.state.slide, false);
    } else {
        // Em vez de forçar o início se o estado for nulo, lê a rota atual
        navigateTo(getRouteFromURL(), false);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    let startSlide = getRouteFromURL();

    // Valida se o slide realmente existe no HTML. Se tentarem acessar um link quebrado, vai pro início.
    if (startSlide !== 'inicio' && !document.getElementById(startSlide)) {
        startSlide = 'inicio';
    }

    // Atualiza a URL limpando o lixo (como ?p= ou #s) sem recarregar a página
    try {
        history.replaceState({ slide: startSlide }, '', '/' + (startSlide === 'inicio' ? '' : startSlide));
    } catch(e) {
        console.warn("History API bloqueada (comum ao testar o arquivo HTML localmente).");
    }
    
    // Aplica o slide visualmente DE FORMA SILENCIOSA para não "piscar" a home page
    if (startSlide !== 'inicio') {
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.classList.add('passed');
        });
        
        const activeEl = document.getElementById(startSlide);
        if(activeEl) {
            activeEl.classList.remove('passed');
            activeEl.classList.add('active');
        }
        
        // Sincroniza a variável global do ZUI para não quebrar os próximos cliques
        currentSlide = startSlide;
    }

    setTimeout(closeSplash, 1000);

    const footerHTML = `
        <div class="slide-footer">
            <p>
                &copy; 2026 • Mike Jonathan dos Santos Brito<br>
                • Engenheiro de Biotecnologia <span class="nowrap">• CREA-SP: 5071801530<br></span>
                <a onclick="navigateTo('desenvolvimento-web')" class="discreet-link">Gostou da interface imersiva? <span class="nowrap">Solicite o desenvolvimento do seu site!</span></a>
            </p>
        </div>
    `;
    document.querySelectorAll('.slide').forEach(slide => {
        slide.insertAdjacentHTML('beforeend', footerHTML);
    });
});

// ==========================================
// [SEÇÃO 5] VALIDAÇÕES, MÁSCARAS E PREVENÇÕES
// ==========================================
const phoneInputs = document.querySelectorAll('.telefone-mask');
phoneInputs.forEach(input => {
    input.addEventListener('input', function (e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
});

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', e => e.preventDefault());
    img.addEventListener('dragstart', e => e.preventDefault());
});

// ==========================================
// [SEÇÃO 6] LÓGICA DE FORMULÁRIO E DROPDOWNS CUSTOMIZADOS
// ==========================================
function toggleServiceDropdown() { 
    document.getElementById('service-dropdown').classList.toggle('visible'); 
}
function toggleServiceDropdownWeb() { 
    document.getElementById('service-dropdown-web').classList.toggle('visible'); 
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('service-dropdown');
    if (dropdown && dropdown.classList.contains('visible') && !dropdown.contains(event.target)) {
        dropdown.classList.remove('visible');
    }
    
    const dropdownWeb = document.getElementById('service-dropdown-web');
    if (dropdownWeb && dropdownWeb.classList.contains('visible') && !dropdownWeb.contains(event.target)) {
        dropdownWeb.classList.remove('visible');
    }
});

function updateServicesTags(checkboxes, container, anchor, customClass = '', mainColor = 'var(--neon-green)', typeLabel = 'serviço(s)') {
    container.innerHTML = '';
    let selectedCount = 0;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedCount++;
            const span = document.createElement('span');
            span.className = `selected-item ${customClass}`;
            span.textContent = checkbox.value;
            container.appendChild(span);
        }
    });

    if (selectedCount > 0) {
        anchor.textContent = `${selectedCount} ${typeLabel} selecionado(s)`;
        anchor.style.color = mainColor;
        anchor.style.borderColor = mainColor;
    } else {
        anchor.textContent = 'Selecione opções...';
        anchor.style.color = 'var(--text-color)';
        anchor.style.borderColor = customClass ? 'rgba(0, 243, 255, 0.3)' : 'var(--border-color)';
    }
}

const serviceCheckboxes = document.querySelectorAll('#service-dropdown input[type="checkbox"]');
const selectedContainer = document.getElementById('selected-services-container');
const dropdownAnchor = document.querySelector('#service-dropdown .anchor');

if(serviceCheckboxes && selectedContainer && dropdownAnchor) {
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateServicesTags(serviceCheckboxes, selectedContainer, dropdownAnchor, '', 'var(--neon-green)', 'serviço(s)');
        });
    });
}

const webCheckboxes = document.querySelectorAll('#service-dropdown-web input[type="checkbox"]');
const selectedContainerWeb = document.getElementById('selected-services-container-web');
const dropdownAnchorWeb = document.querySelector('#service-dropdown-web .anchor');

if(webCheckboxes && selectedContainerWeb && dropdownAnchorWeb) {
    webCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateServicesTags(webCheckboxes, selectedContainerWeb, dropdownAnchorWeb, 'selected-item-web', 'var(--neon-blue)', 'funcionalidade(s)');
        });
    });
}

// ==========================================
// [SEÇÃO 7] TRANSIÇÃO DE TELAS (ZUI NAVIGATION)
// ==========================================
let currentSlide = 'inicio'; 

function toggleClassicMenu() {
    document.getElementById('hamburger-btn').classList.toggle('open');
    document.getElementById('classic-menu-overlay').classList.toggle('open');
}

function navigateFromClassic(path) {
    toggleClassicMenu(); 
    navigateTo(path); 
    const carouselIndex = carouselData.findIndex(item => item.id === path);
    if (carouselIndex !== -1) { targetAngle = -carouselIndex * theta; }
}

function goBack() { history.back(); }

function navigateTo(path, recordHistory = true) {
    if (recordHistory && currentSlide !== path) {
        try {
            history.pushState({ slide: path }, '', '/' + (path === 'inicio' ? '' : path));
        } catch(e) {}
    }
    
    let previousSlide = currentSlide;
    currentSlide = path;

    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        slide.classList.remove('active', 'passed');
        let slideId = slide.id;
        
        if (slideId === currentSlide) { 
            slide.classList.add('active'); 
        } else if (slideId === previousSlide || slideId === 'inicio' || (slideId !== currentSlide && recordHistory === false)) { 
            slide.classList.add('passed'); 
        } 
    });
}

// ==========================================
// [SEÇÃO 8] MOTOR DO CARROSSEL 3D (MENU SUPERIOR)
// ==========================================
const menuItensConfig = [
    { id: 'inicio', text: "Início", icon: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' }, 
    { id: 'sobre', text: "Sobre", icon: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' }, 
    { id: 'servicos', text: "Serviços", icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' }, 
    { id: 'adequacao-regulatoria', text: "Regulatória", icon: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>' }, 
    { id: 'otimizacao-de-bioprocessos', text: "Bioprocessos", icon: '<svg viewBox="0 0 24 24"><path d="M10 2v7.31l-6 10.39A2 2 0 0 0 5.73 23h12.54a2 2 0 0 0 1.73-3.3l-6-10.39V2h-4z"></path><line x1="8.5" y1="14" x2="15.5" y2="14"></line></svg>' }, 
    { id: 'solucoes-digitais', text: "Digitais", icon: '<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' }, 
    { id: 'contato', text: "Contato", icon: '<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' }
];

const carouselData = [...menuItensConfig]; 
const carouselEl = document.getElementById('carousel');

const setRadius = () => {
    if (window.innerWidth <= 375) return 140;
    if (window.innerWidth <= 474) return 150;
    if (window.innerWidth <= 500) return 160;
    if (window.innerWidth <= 650) return 190;
    if (window.innerWidth <= 768) return 250;
    if (window.innerWidth <= 800) return 300;
    return 350;
};
let radius = setRadius();
const theta = 360 / carouselData.length; 

function buildCarousel() {
    carouselEl.innerHTML = '';
    carouselData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'menu-item'; 
        div.innerHTML = `${item.icon}<span>${item.text}</span>`;
        div.dataset.target = item.id; div.dataset.index = index;
        div.style.transform = `rotateY(${index * theta}deg) translateZ(${radius}px)`;
        div.addEventListener('pointerup', (e) => {
            if (Math.abs(dragTotalX) > 15) return; 
            navigateTo(item.id); targetAngle = -index * theta;
        });
        carouselEl.appendChild(div);
    });
    carouselEl.style.transform = `translateZ(-${radius}px)`;
}
buildCarousel();

window.addEventListener('resize', () => {
    const newRadius = setRadius();
    if(newRadius !== radius) {
        radius = newRadius;
        buildCarousel();
    }
});

let currentAngle = 0; let targetAngle = 0; let isDragging = false; let startX = 0; let dragTotalX = 0;
const autoRotateSpeed = 0.08; const menuWrapper = document.getElementById('menu-wrapper');

menuWrapper.addEventListener('pointerdown', (e) => {
    isDragging = true; startX = e.clientX; dragTotalX = 0; menuWrapper.style.cursor = 'grabbing';
});
window.addEventListener('pointerup', () => { isDragging = false; menuWrapper.style.cursor = 'grab'; });
window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX; dragTotalX += deltaX; targetAngle += deltaX * 0.3; startX = e.clientX;
});

function updateCarouselCSS() {
    currentAngle += (targetAngle - currentAngle) * 0.1; 
    if (!isDragging) targetAngle -= autoRotateSpeed; 
    carouselEl.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle}deg)`;
    
    let normalizedAngle = ((currentAngle % 360) + 360) % 360; 
    let frontIndex = Math.round((360 - normalizedAngle) / theta) % carouselData.length;
    const items = document.querySelectorAll('.menu-item');
    items.forEach((item, idx) => {
        if (idx === frontIndex) item.classList.add('active'); else item.classList.remove('active');
    });
}

// ==========================================
// [SEÇÃO 9] ANIMAÇÃO DE BACKGROUND VIA CANVAS 3D (PARTÍCULAS)
// ==========================================
const canvas = document.getElementById('bgCanvas'); const ctx = canvas.getContext('2d');

function resizeCanvasBg() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvasBg); resizeCanvasBg();

const particles = []; const particleCount = 100; 

class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
        this.x = (Math.random() - 0.5) * window.innerWidth * 3; this.y = (Math.random() - 0.5) * window.innerHeight * 3;
        this.z = initial ? Math.random() * 2000 : 2000; this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02; this.speed = Math.random() * 4 + 2; 
    }
    update() { this.z -= this.speed; if (this.z <= 10) this.reset(false); this.rotation += this.rotationSpeed; }
    draw() {
        const cx = canvas.width / 2; const cy = canvas.height / 2;
        const fov = 600; const scale = fov / this.z;
        const x2d = cx + this.x * scale; const y2d = cy + this.y * scale;
        ctx.save(); ctx.translate(x2d, y2d); ctx.rotate(this.rotation); ctx.scale(scale, scale);
        ctx.globalAlpha = Math.max(0, Math.min(1, (2000 - this.z) / 500));
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.6)'; ctx.lineWidth = 3;
        
        ctx.beginPath(); ctx.arc(0, -20, 5, Math.PI, 0); ctx.lineTo(5, 20);              
        ctx.arc(0, 20, 5, 0, Math.PI); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = 'rgba(0, 243, 255, 0.2)'; ctx.fill(); ctx.restore();
    }
}

for(let i = 0; i < particleCount; i++) particles.push(new Particle());

function animate() {
    updateCarouselCSS();
    
    const isLightMode = document.body.classList.contains('light-mode');
    ctx.fillStyle = isLightMode ? 'rgba(244, 247, 246, 0.5)' : 'rgba(3, 5, 10, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = isLightMode ? 'rgba(0, 102, 255, 0.4)' : 'rgba(0, 255, 204, 0.6)';
    ctx.fillStyle = isLightMode ? 'rgba(0, 102, 255, 0.1)' : 'rgba(0, 243, 255, 0.2)';
    
    particles.forEach(p => { p.update(); p.draw(); }); 
    requestAnimationFrame(animate);
}
animate();