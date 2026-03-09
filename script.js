document.addEventListener('DOMContentLoaded', () => {
    // ===== FAST DYNAMIC BANNERS LOADING =====
    async function loadAndRenderBanners() {
        if (typeof sbGetBanners === 'undefined') return;
        const slider = document.querySelector('.slider');
        const dotsContainer = document.querySelector('.slider-dots');
        if (!slider || !dotsContainer) return;

        let isMobile = window.innerWidth <= 768;

        const renderBanners = (bannersData) => {
            let displayBanners = isMobile
                ? bannersData.filter(b => b.image_url === 'mobile_only' || (b.image_mobile_url && b.image_mobile_url.trim() !== ''))
                : bannersData.filter(b => b.image_url !== 'mobile_only');

            if (displayBanners.length === 0) displayBanners = bannersData;
            if (displayBanners.length === 0) return;

            slider.innerHTML = '';
            dotsContainer.innerHTML = '';

            displayBanners.forEach((b, i) => {
                const activeClass = i === 0 ? 'active' : '';
                const uniqueId = b.id || i;

                let finalSrc = '';
                if (isMobile) {
                    let mbUrl = (b.image_mobile_url && b.image_mobile_url.trim() !== '') ? b.image_mobile_url : b.image_url;
                    finalSrc = (mbUrl.startsWith('data:image') || mbUrl.startsWith('http')) ? mbUrl : 'assets/images/' + mbUrl;
                } else {
                    finalSrc = (b.image_url.startsWith('data:image') || b.image_url.startsWith('http')) ? b.image_url : 'assets/images/' + b.image_url;
                }

                if (i === 0) {
                    let link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = finalSrc;
                    document.head.appendChild(link);
                }

                slider.innerHTML += `
                  <style>
                    .slide-bg-${uniqueId} { background-image: url('${finalSrc}'); }
                  </style>
                  <div class="slide ${activeClass}">
                    <div class="slide-bg slide-bg-${uniqueId}"></div>
                    <div class="slide-content" style="opacity:1 !important;">
                      <h1 style="background:transparent; max-width:100%; height:auto;">${b.title}</h1>
                      <p style="background:transparent; max-width:100%; height:auto;">${b.subtitle || ''}</p>
                      ${b.link === 'none' ? '' : `<a href="${b.link || 'produtos.html'}" class="btn-hero">Ver Produtos</a>`}
                    </div>
                  </div>
                `;
                dotsContainer.innerHTML += `<button class="slider-dot ${activeClass}"></button>`;
            });

            slider.style.transition = 'opacity 0.3s ease';
            slider.style.opacity = '1';

            // Re-init slider logic if it exists
            setTimeout(() => { if (window.initSliderCore) window.initSliderCore(); }, 50);
        };

        // 1. Try Cache First for INSTANT render
        try {
            const cached = localStorage.getItem('tk_fast_banners');
            if (cached) renderBanners(JSON.parse(cached));
        } catch (e) { }

        // 2. Fetch fresh from DB asynchronously
        try {
            const freshBanners = await sbGetBanners();
            if (freshBanners && freshBanners.length > 0) {
                const freshStr = JSON.stringify(freshBanners);
                const cached = localStorage.getItem('tk_fast_banners');

                // Only re-render if something changed, to prevent screen flash
                if (freshStr !== cached) {
                    localStorage.setItem('tk_fast_banners', freshStr);
                    renderBanners(freshBanners);
                }
            }
        } catch (e) { console.error('Erro ao carregar banners:', e); }
    }

    // Initialize very early
    loadAndRenderBanners();

    // ===== DYNAMIC DATA LOADING FROM SUPABASE =====
    async function loadSiteData() {
        if (typeof sbGetProducts === 'undefined') return; // supabase not loaded on this page

        try {
            // Load Settings
            const settings = await sbGetSettings();
            if (settings && settings.length > 0) {
                const settingsMap = {};
                settings.forEach(s => settingsMap[s.key] = s.value);

                if (settingsMap.site_name) {
                    document.title = document.title.replace('Toy King', settingsMap.site_name).replace('ToyKing', settingsMap.site_name);
                }
                if (settingsMap.primary_color) {
                    document.documentElement.style.setProperty('--blue', settingsMap.primary_color);
                    document.documentElement.style.setProperty('--blue-primary', settingsMap.primary_color);
                }
                if (settingsMap.instagram) {
                    document.querySelectorAll('a[href*="instagram.com"]').forEach(a => { if (!a.href.includes('post')) a.href = settingsMap.instagram; });
                }
                if (settingsMap.facebook) {
                    document.querySelectorAll('a[href*="facebook.com"]').forEach(a => { if (!a.href.includes('post')) a.href = settingsMap.facebook; });
                }
                if (settingsMap.youtube) {
                    document.querySelectorAll('a[href*="youtube.com"]').forEach(a => a.href = settingsMap.youtube);
                    document.querySelectorAll('.footer-social').forEach(fs => {
                        if (settingsMap.youtube && !fs.querySelector('.fa-youtube')) {
                            fs.innerHTML += `<a href="${settingsMap.youtube}" aria-label="YouTube" target="_blank"><i class="fab fa-youtube"></i></a>`;
                        }
                    });
                }
                if (settingsMap.email) {
                    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
                        a.href = 'mailto:' + settingsMap.email;
                        a.textContent = settingsMap.email;
                    });
                    document.querySelectorAll('.fa-envelope').forEach(icon => {
                        let parent = icon.parentElement;
                        if (parent && (parent.tagName === 'P' || parent.tagName === 'LI') && !parent.querySelector('a')) {
                            parent.innerHTML = `<i class="fas fa-envelope"></i> ${settingsMap.email}`;
                        }
                    });
                }
                if (settingsMap.phone) {
                    const purePhone = settingsMap.phone.replace(/\D/g, '');
                    document.querySelectorAll('.fa-phone, .fa-phone-alt').forEach(icon => {
                        let parent = icon.parentElement;
                        if (parent && (parent.tagName === 'P' || parent.tagName === 'LI')) {
                            const a = parent.querySelector('a');
                            if (a) {
                                a.href = 'tel:' + purePhone;
                                a.textContent = settingsMap.phone;
                            } else {
                                parent.innerHTML = `<i class="fas fa-phone"></i> ${settingsMap.phone}`;
                            }
                        }
                    });
                }
                if (settingsMap.whatsapp) {
                    const pureWa = settingsMap.whatsapp.replace(/\D/g, '');
                    document.querySelectorAll('.fa-whatsapp').forEach(icon => {
                        let parent = icon.parentElement;
                        if (parent) {
                            if (parent.tagName === 'A') {
                                parent.href = 'https://wa.me/55' + pureWa;
                            } else if (parent.tagName === 'P' || parent.tagName === 'LI') {
                                const a = parent.querySelector('a');
                                if (a) {
                                    a.href = 'https://wa.me/55' + pureWa;
                                    a.textContent = settingsMap.whatsapp;
                                } else {
                                    parent.innerHTML = `<i class="fab fa-whatsapp"></i> ${settingsMap.whatsapp}`;
                                }
                            }
                        }
                    });
                }
                if (settingsMap.address) {
                    document.querySelectorAll('.fa-map-marker-alt').forEach(icon => {
                        let parent = icon.parentElement;
                        if (parent && (parent.tagName === 'P' || parent.tagName === 'LI')) {
                            parent.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${settingsMap.address}`;
                        }
                    });
                }
                if (settingsMap.slogan) {
                    document.querySelectorAll('.footer-logo').forEach(logo => {
                        let nextElem = logo.nextElementSibling;
                        if (nextElem && nextElem.tagName === 'P') {
                            nextElem.textContent = settingsMap.slogan;
                        }
                    });
                }

                if (settingsMap.about_proposito && document.getElementById('aboutProposito')) {
                    const lines = settingsMap.about_proposito.split('\n').filter(l => l.trim() !== '');
                    document.getElementById('aboutProposito').innerHTML = lines.map(l => `<p>${l}</p>`).join('');
                }
                if (settingsMap.about_missao && document.getElementById('aboutMissao')) {
                    document.getElementById('aboutMissao').textContent = settingsMap.about_missao;
                }
                if (settingsMap.about_essencia && document.getElementById('aboutEssencia')) {
                    const items = settingsMap.about_essencia.split(',').filter(i => i.trim() !== '');
                    document.getElementById('aboutEssencia').innerHTML = items.map(i => `<li><i class="fas fa-check-circle"></i> ${i.trim()}</li>`).join('');
                }

                if (settingsMap.insta_feed_data) {
                    try {
                        const instaData = JSON.parse(settingsMap.insta_feed_data);
                        const instaGrid = document.querySelector('.insta-grid');
                        if (instaGrid && instaData.length > 0) {
                            instaGrid.innerHTML = '';
                            instaData.forEach((item, idx) => {
                                const relImgSrc = item.image && (item.image.startsWith('data:image') || item.image.startsWith('http')) ? item.image : 'assets/images/' + item.image;
                                instaGrid.innerHTML += `
                                    <div class="insta-item reveal-scale" style="transition-delay: ${0.1 + (idx * 0.05)}s;" onclick="window.open('${item.link}', '_blank')">
                                        <img src="${relImgSrc}" alt="Instagram ${idx + 1}" loading="lazy">
                                        <div class="insta-overlay"><i class="fab fa-instagram"></i></div>
                                    </div>`;
                            });
                            if (window.initReveals) window.initReveals();
                        }
                    } catch (e) { console.error('Erro ao processar feed Instagram:', e); }
                }

                if (settingsMap.video_feed_data) {
                    try {
                        const videoData = JSON.parse(settingsMap.video_feed_data);
                        const videoGrid = document.querySelector('.video-grid');
                        if (videoGrid && videoData.length > 0) {
                            videoGrid.innerHTML = '';
                            videoData.forEach((item, idx) => {
                                let relImgSrc = item.image && (item.image.startsWith('data:image') || item.image.startsWith('http')) ? item.image : 'assets/images/' + item.image;

                                const ytMatch = item.link && typeof item.link === 'string' ? item.link.match(/(?:youtu\.be\/|youtube\.com\/.*[?&]v=)([^&?]+)/) : null;
                                if (ytMatch && ytMatch[1] && (!item.image || item.image.includes('hero_banner.png') || item.image.includes('capa_do_youtube'))) {
                                    relImgSrc = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                                }

                                videoGrid.innerHTML += `
                                    <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="video-card reveal" style="display:block; text-decoration:none; color:inherit; transition-delay: ${0.1 + (idx * 0.1)}s;">
                                        <div class="video-thumb">
                                            <img src="${relImgSrc}" alt="${item.title}">
                                            <div class="play-icon"><i class="fas fa-play"></i></div>
                                        </div>
                                        <h4>${item.title}</h4>
                                    </a>`;
                            });
                            if (window.initReveals) window.initReveals();
                        }
                    } catch (e) { console.error('Erro ao processar feed de vídeos:', e); }
                }
            }
        } catch (e) { console.error('Erro ao carregar configurações:', e); }

        // Banners will be loaded by a separate async function to not block other data

        try {
            // Load Products for homepage sections
            const products = await sbGetProducts();
            if (products && products.length > 0) {
                const homeCatsStr = window.siteSettings && window.siteSettings.home_categories
                    ? window.siteSettings.home_categories
                    : "Encartelados, Display, Brinquedos a Pilha, Jogos, Didáticos, Verão, Patinetes";

                const homeCats = homeCatsStr.split(',').map(c => c.trim()).filter(c => c);

                const iconMap = { 'Encartelados': '📦', 'Didáticos': '📚', 'Brinquedos a Pilha': '⚡', 'Pilha': '⚡', 'Verão': '☀️', 'Jogos': '🎲', 'Display': '🎁', 'Patinetes': '🛴', 'Maletas': '🎨', 'Armas': '🔫', 'Meninas': '🎀', 'Meninos': '🚗', 'Bebês': '👶', 'Pelúcias': '🧸' };
                const bgColors = ['section-green', 'section-orange', 'section-blue', 'section-pink', 'section-purple', 'section-yellow', 'section-red'];
                const bgWaveColors = ['#FCE4EC', '#FFF3E0', '#E3F2FD', '#F3E5F5', '#FFFDE7', '#FFEBEE', '#E0F7FA'];

                // 1. Update Header Sub
                const headerSub = document.getElementById('dynamic-header-sub');
                if (headerSub) {
                    headerSub.innerHTML = '<a href="produtos.html" class="cat-link highlight">🔥 Novidades!</a>';
                    homeCats.forEach(cat => {
                        headerSub.innerHTML += `<a href="produtos.html?cat=${encodeURIComponent(cat)}" class="cat-link">${cat}</a>`;
                    });
                }

                // 2. Update Bubbles
                const bubblesContainer = document.getElementById('dynamic-bubbles');
                if (bubblesContainer) {
                    bubblesContainer.innerHTML = '';
                    homeCats.forEach((cat, idx) => {
                        let icon = '🧸';
                        for (let key in iconMap) {
                            if (cat.toLowerCase().includes(key.toLowerCase())) { icon = iconMap[key]; break; }
                        }

                        bubblesContainer.innerHTML += `
                          <div class="age-bubble reveal-scale" style="transition-delay: ${0.1 + (idx * 0.1)}s;">
                            <div class="bubble-anim-wrapper">
                              <div class="bubble-decor"><span></span><span></span><span></span><span></span></div>
                              <dotlottie-player src="https://lottie.host/861b6aad-e4d1-4042-913d-31c23af8998e/riouT6qwUo.lottie" background="transparent" speed="${0.8 + (idx % 3) * 0.2}" style="width: 290%; height: 290%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 1; pointer-events: none;" loop autoplay></dotlottie-player>
                              <span class="age-icon">${icon}</span>
                            </div>
                            <span class="bubble-label">${cat}</span>
                          </div>
                        `;
                    });
                }

                // 3. Update Sections
                const sectionsContainer = document.getElementById('dynamic-categories-container');
                if (sectionsContainer) {
                    sectionsContainer.innerHTML = '';
                    homeCats.forEach((cat, idx) => {
                        // Priority 1: Starred (featured) products for this category
                        const featuredProdsObj = window.siteSettings && window.siteSettings.featured_products ? JSON.parse(window.siteSettings.featured_products) : {};
                        const featuredIds = featuredProdsObj[cat] || [];
                        let prods = [];

                        if (featuredIds.length > 0) {
                            prods = featuredIds.map(id => products.find(p => p.product_code === id)).filter(p => p && p.status === 'active');
                        }

                        // Priority 2: Fill remaining slots up to 4 with regular active products
                        if (prods.length < 4) {
                            const remaining = products.filter(p => p.category === cat && p.status === 'active' && !featuredIds.includes(p.product_code)).slice(0, 4 - prods.length);
                            prods = prods.concat(remaining);
                        }

                        if (prods.length === 0) return; // SKIP EXAMPLES IF NO ACTIVE PRODUCTS! // <--- This fulfills user's request explicitly

                        let icon = '🧸';
                        for (let key in iconMap) {
                            if (cat.toLowerCase().includes(key.toLowerCase())) { icon = iconMap[key]; break; }
                        }
                        const catId = 'cat-' + idx;
                        const sectionClass = bgColors[idx % bgColors.length];
                        const waveFill = bgWaveColors[idx % bgWaveColors.length];

                        let prodsHtml = '';
                        prods.forEach((p, i) => {
                            let badgeHtml = '';
                            if (p.badge) {
                                const badgeClass = p.badge === 'TOP' ? 'badge-hot' : 'badge-new';
                                const badgeIcon = p.badge === 'TOP' ? '🔥 ' : '';
                                badgeHtml = `<span class="badge ${badgeClass}">${badgeIcon}${p.badge}</span>`;
                            }
                            const imgSrc = p.image_url && (p.image_url.startsWith('data:image') || p.image_url.startsWith('http')) ? p.image_url : (p.image_url ? 'assets/images/' + p.image_url : 'assets/images/hero_banner.png');
                            prodsHtml += `
                                <div class="product-card reveal" style="transition-delay: ${0.1 + (i * 0.1)}s; cursor:pointer;" onclick="window.location.href='produto.html?id=${p.product_code}'">
                                    ${badgeHtml}
                                    <div class="product-img-wrapper">
                                      <img src="${imgSrc}" alt="${p.name}" class="product-img">
                                    </div>
                                    <div class="product-info">
                                      <h3>${p.name}</h3>
                                      <p class="product-code-tag">${p.product_code}</p>
                                      <div class="product-tags-row">
                                        <span class="product-tag">${p.category}</span>
                                        <span class="product-tag">${p.age}</span>
                                        ${p.sounds ? '<span class="product-tag icon-tag">🔊</span>' : ''}
                                        ${p.lights ? '<span class="product-tag icon-tag">💡</span>' : ''}
                                        ${p.educational ? '<span class="product-tag icon-tag">🎓</span>' : ''}
                                      </div>
                                    </div>
                                </div>
                            `;
                        });

                        const isEven = idx % 2 === 0;
                        const waveD = isEven
                            ? 'M0,40 C360,100 720,0 1080,60 C1260,80 1380,20 1440,40 L1440,100 L0,100 Z'
                            : 'M0,60 C240,10 480,90 720,40 C960,0 1200,80 1440,30 L1440,100 L0,100 Z';

                        sectionsContainer.innerHTML += `
                          <section class="category-section ${sectionClass}" id="${catId}">
                            ${isEven ? '<div class="particles"></div>' : ''}
                            <div class="container">
                              <div class="section-header">
                                <h2 class="section-title reveal-left">${icon} ${cat}</h2>
                                <a href="produtos.html?cat=${encodeURIComponent(cat)}" class="btn-see-all reveal-right">Ver Todos</a>
                              </div>
                              <div class="products-grid">
                                ${prodsHtml}
                              </div>
                            </div>
                          </section>
                          <div class="wave-separator">
                            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                              <path fill="${waveFill}" d="${waveD}"></path>
                            </svg>
                          </div>
                        `;
                    });

                    // Force reveal update
                    setTimeout(() => {
                        sectionsContainer.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
                        sectionsContainer.querySelectorAll('.reveal-left, .reveal-right').forEach(el => el.classList.add('visible'));
                    }, 500);
                }
            }
        } catch (e) { console.error('Erro ao carregar produtos:', e); }
    }

    loadSiteData();

    // ===== LOADER E TRANSIÇÃO DE PÁGINA =====
    const loader = document.querySelector('.loader-overlay');
    window.addEventListener('load', () => {
        if (loader) setTimeout(() => { loader.classList.add('hidden'); }, 300);
        document.body.classList.add('page-loaded');
    });

    // Resolve cache do botão voltar (BFCache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            document.body.classList.remove('page-exit');
            document.body.classList.add('page-loaded');
        }
    });

    // Intercepta cliques para saída suave (Apple Style)
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');

            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || target === '_blank') return;

            e.preventDefault();
            document.body.classList.remove('page-loaded');
            document.body.classList.add('page-exit');

            setTimeout(() => {
                window.location.href = href;
            }, 500); // 500ms exit delay
        });
    });

    // ===== HEADER SCROLL =====
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ===== MOBILE NAV =====
    const toggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileClose = document.querySelector('.mobile-nav-close');

    function openMobile() {
        toggle.classList.add('active');
        mobileNav.classList.add('open');
        mobileOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    function closeMobile() {
        toggle.classList.remove('active');
        mobileNav.classList.remove('open');
        mobileOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
    toggle.addEventListener('click', () => {
        toggle.classList.contains('active') ? closeMobile() : openMobile();
    });
    mobileOverlay.addEventListener('click', closeMobile);
    mobileClose.addEventListener('click', closeMobile);
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));

    // ===== HERO SLIDER =====
    let isSliderInitialized = false;
    let slideInterval;
    let currentSlide = 0;

    window.initSliderCore = function () {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        const sliderEl = document.querySelector('.slider');

        // Clear interval if already exists
        if (slideInterval) clearInterval(slideInterval);
        currentSlide = 0;

        function goToSlide(idx) {
            if (!slides.length) return;
            if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
            if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
            currentSlide = (idx + slides.length) % slides.length;
            if (slides[currentSlide]) slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        }
        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }
        function startAutoSlide() { slideInterval = setInterval(nextSlide, 5000); }
        function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

        if (!isSliderInitialized) {
            if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
            if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });

            // Touch swipe support
            let touchStartX = 0;
            if (sliderEl) {
                sliderEl.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
                sliderEl.addEventListener('touchend', e => {
                    const diff = touchStartX - e.changedTouches[0].screenX;
                    if (Math.abs(diff) > 50) {
                        diff > 0 ? nextSlide() : prevSlide();
                        resetAutoSlide();
                    }
                }, { passive: true });
            }
            isSliderInitialized = true;
        }

        // Dots are recreated, so they need listeners attached every time
        if (dots) dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); resetAutoSlide(); }));

        if (slides && slides.length > 0) {
            goToSlide(0);
            startAutoSlide();
        }

        // ===== PARALLAX HERO BACKGROUND =====
        const heroBgs = document.querySelectorAll('.slide-bg');
        if (heroBgs.length > 0) {
            window.addEventListener('scroll', () => {
                const scrollPos = window.scrollY;
                heroBgs.forEach(bg => {
                    bg.style.transform = `translateY(${scrollPos * 0.4}px) scale(1.05)`;
                });
            }, { passive: true });
        }
    };

    // Call it initially in case there are static hardcoded slides before loading
    window.initSliderCore();

    // ===== SCROLL REVEAL ANIMATIONS =====
    function initReveals() {
        const reveals = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

        reveals.forEach(el => revealObserver.observe(el));
    }

    initReveals();
    // Re-init after some time to catch any dynamic content or missed elements
    setTimeout(initReveals, 1000);
    setTimeout(initReveals, 3000);

    // ===== STAGGER PRODUCT CARDS =====
    document.querySelectorAll('.products-grid').forEach(grid => {
        const cards = grid.querySelectorAll('.product-card');
        cards.forEach((card, i) => {
            card.style.transitionDelay = `${i * 0.1}s`;
        });
    });

    // ===== SCROLL TO TOP =====
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('show', window.scrollY > 400);
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== FLOATING PARTICLES =====
    function createParticles(container) {
        const colors = ['#1A8BD6', '#F5A623', '#E53935', '#FDD835', '#7CB342', '#E91E90'];
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 12 + 5;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDuration = (Math.random() * 15 + 10) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            container.appendChild(p);
        }
    }
    document.querySelectorAll('.particles').forEach(createParticles);

    // ===== COUNTER ANIMATION =====
    const counters = document.querySelectorAll('.counter-num');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                const target = parseInt(entry.target.dataset.target);
                let current = 0;
                const step = target / 60;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { current = target; clearInterval(timer); }
                    entry.target.textContent = Math.floor(current) + '+';
                }, 30);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));

    // ===== SMOOTH PARALLAX ON HERO =====
    window.addEventListener('scroll', () => {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        const scrolled = window.scrollY;
        const bgs = heroSection.querySelectorAll('.slide-bg');
        if (bgs && bgs.length > 0) {
            bgs.forEach(bg => {
                bg.style.transform = `translateY(${scrolled * 0.3}px)`;
            });
        }
    });

    // ===== CAROUSEL NAVIGATION + AUTO-SCROLL (DESKTOP) =====
    const carouselWrapper = document.querySelector('.cat-carousel-wrapper');
    if (carouselWrapper) {
        const carousel = carouselWrapper.querySelector('.age-bubbles');
        const prevBtn = carouselWrapper.querySelector('.cat-nav-btn.prev');
        const nextBtn = carouselWrapper.querySelector('.cat-nav-btn.next');

        if (carousel && prevBtn && nextBtn) {
            const scrollAmount = 220; // pixels per auto-scroll step
            const autoScrollDelay = 2500; // ms between each step
            let autoScrollInterval = null;
            let isHovering = false;

            // ---- Auto-scroll logic ----
            function autoScrollStep() {
                if (isHovering) return;
                const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
                if (maxScrollLeft <= 0) return; // nothing to scroll

                if (carousel.scrollLeft >= maxScrollLeft - 5) {
                    // Reached the end – snap back to start smoothly
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }

            function startAutoScroll() {
                if (autoScrollInterval) clearInterval(autoScrollInterval);
                autoScrollInterval = setInterval(autoScrollStep, autoScrollDelay);
            }

            function resetAutoScroll() {
                clearInterval(autoScrollInterval);
                startAutoScroll();
            }

            // Pause on hover
            carouselWrapper.addEventListener('mouseenter', () => { isHovering = true; });
            carouselWrapper.addEventListener('mouseleave', () => { isHovering = false; });

            // ---- Manual buttons ----
            prevBtn.addEventListener('click', () => {
                const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
                if (carousel.scrollLeft <= 5) {
                    // At the start – jump to the end
                    carousel.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
                } else {
                    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                }
                resetAutoScroll();
            });

            nextBtn.addEventListener('click', () => {
                const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
                if (carousel.scrollLeft >= maxScrollLeft - 5) {
                    // At the end – jump back to start
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
                resetAutoScroll();
            });

            // ---- Button visibility (always visible, no disabled state) ----
            const updateButtons = () => {
                const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
                const hidden = maxScrollLeft <= 0;
                prevBtn.style.display = hidden ? 'none' : 'flex';
                nextBtn.style.display = hidden ? 'none' : 'flex';
                prevBtn.style.opacity = '1';
                nextBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
                nextBtn.style.pointerEvents = 'auto';
            };

            carousel.addEventListener('scroll', updateButtons);
            window.addEventListener('resize', updateButtons);

            // Start everything after a short delay (so dynamic bubbles have time to render)
            setTimeout(() => {
                updateButtons();
                startAutoScroll();
            }, 800);
        }
    }
});
