document.addEventListener('DOMContentLoaded', () => {
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
            }
        } catch (e) { console.error('Erro ao carregar configurações:', e); }

        try {
            // Load Banners
            const banners = await sbGetBanners();
            if (banners && banners.length > 0) {
                const slider = document.querySelector('.slider');
                const dotsContainer = document.querySelector('.slider-dots');
                if (slider && dotsContainer) {
                    slider.innerHTML = '';
                    dotsContainer.innerHTML = '';

                    let isMobile = window.innerWidth <= 768;
                    let displayBanners = isMobile
                        ? banners.filter(b => b.image_url === 'mobile_only' || (b.image_mobile_url && b.image_mobile_url.trim() !== ''))
                        : banners.filter(b => b.image_url !== 'mobile_only');

                    if (displayBanners.length === 0) displayBanners = banners;

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

                        slider.innerHTML += `
                          <style>
                            .slide-bg-${uniqueId} { background-image: url('${finalSrc}'); }
                          </style>
                          <div class="slide ${activeClass}">
                            <div class="slide-bg slide-bg-${uniqueId}"></div>
                            <div class="slide-content">
                              <h1>${b.title}</h1>
                              <p>${b.subtitle || ''}</p>
                              ${b.link === 'none' ? '' : `<a href="${b.link || 'produtos.html'}" class="btn-hero">Ver Produtos</a>`}
                            </div>
                          </div>
                        `;
                        dotsContainer.innerHTML += `<button class="slider-dot ${activeClass}"></button>`;
                    });

                    if (window.initSliderCore) window.initSliderCore();
                }
            }
        } catch (e) { console.error('Erro ao carregar banners:', e); }

        try {
            // Load Products for homepage sections
            const products = await sbGetProducts();
            if (products && products.length > 0) {
                const catMap = {
                    'Encartelados': '#encartelados',
                    'Brinquedos a Pilha': '#pilha',
                    'Jogos': '#jogos',
                    'Didáticos': '#didaticos',
                    'Verão': '#verao',
                    'Patinetes': '#patinetes',
                    'Display': '#display'
                };

                for (const [catName, secId] of Object.entries(catMap)) {
                    const section = document.querySelector(secId);
                    if (section) {
                        const grid = section.querySelector('.products-grid');
                        if (grid) {
                            const prods = products.filter(p => p.category === catName && p.status === 'active').slice(0, 4);
                            if (prods.length > 0) {
                                grid.innerHTML = '';
                                prods.forEach((p, i) => {
                                    let badgeHtml = '';
                                    if (p.badge) {
                                        const badgeClass = p.badge === 'TOP' ? 'badge-hot' : 'badge-new';
                                        const badgeIcon = p.badge === 'TOP' ? '🔥 ' : '';
                                        badgeHtml = `<span class="badge ${badgeClass}">${badgeIcon}${p.badge}</span>`;
                                    }
                                    const imgSrc = p.image_url && (p.image_url.startsWith('data:image') || p.image_url.startsWith('http')) ? p.image_url : (p.image_url ? 'assets/images/' + p.image_url : 'assets/images/hero_banner.png');
                                    grid.innerHTML += `
                                      <div class="product-card reveal" style="transition-delay: ${0.1 + (i * 0.1)}s;">
                                        ${badgeHtml}
                                        <div class="product-img-wrapper">
                                          <img src="${imgSrc}" alt="${p.name}" class="product-img">
                                        </div>
                                        <div class="product-info">
                                          <h3>${p.name}</h3>
                                          <p class="category-tag">${p.category}</p>
                                          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                                            <span class="product-age">${p.age}</span>
                                            ${p.sounds ? '<span class="product-age" style="background:#f0f8ff;">🔊</span>' : ''}
                                            ${p.lights ? '<span class="product-age" style="background:#fffcf0;">💡</span>' : ''}
                                            ${p.educational ? '<span class="product-age" style="background:#f0fff4;">🎓</span>' : ''}
                                          </div>
                                        </div>
                                      </div>
                                    `;
                                });
                                // Force visible class on new items
                                grid.querySelectorAll('.reveal').forEach(el => {
                                    setTimeout(() => el.classList.add('visible'), 100);
                                });
                            }
                        }
                    }
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
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => revealObserver.observe(el));

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

    // ===== CAROUSEL NAVIGATION (DESKTOP) =====
    const carouselWrapper = document.querySelector('.cat-carousel-wrapper');
    if (carouselWrapper) {
        const carousel = carouselWrapper.querySelector('.age-bubbles');
        const prevBtn = carouselWrapper.querySelector('.cat-nav-btn.prev');
        const nextBtn = carouselWrapper.querySelector('.cat-nav-btn.next');

        if (carousel && prevBtn && nextBtn) {
            const scrollAmount = 350; // Approximations for scrolling a few items

            prevBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

            // Optional: Hide buttons if at start or end
            const updateButtons = () => {
                const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
                if (carousel.scrollLeft <= 0) {
                    prevBtn.style.opacity = '0.3';
                    prevBtn.style.pointerEvents = 'none';
                } else {
                    prevBtn.style.opacity = '1';
                    prevBtn.style.pointerEvents = 'auto';
                }

                if (carousel.scrollLeft >= maxScrollLeft - 10) {
                    nextBtn.style.opacity = '0.3';
                    nextBtn.style.pointerEvents = 'none';
                } else {
                    nextBtn.style.opacity = '1';
                    nextBtn.style.pointerEvents = 'auto';
                }
            };

            carousel.addEventListener('scroll', updateButtons);
            // Initial check
            setTimeout(updateButtons, 100);
            window.addEventListener('resize', updateButtons);
        }
    }
});
