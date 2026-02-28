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

                if (settingsMap.site_name) document.title = document.title.replace('Toy King', settingsMap.site_name);
                if (settingsMap.primary_color) {
                    document.documentElement.style.setProperty('--blue', settingsMap.primary_color);
                    document.documentElement.style.setProperty('--blue-primary', settingsMap.primary_color);
                }
                if (settingsMap.instagram) {
                    document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = settingsMap.instagram);
                }
                if (settingsMap.facebook) {
                    document.querySelectorAll('a[href*="facebook.com"]').forEach(a => a.href = settingsMap.facebook);
                }
                if (settingsMap.phone) {
                    const phone = settingsMap.phone;
                    const purePhone = phone.replace(/\D/g, '');
                    document.querySelectorAll('a[href^="tel:"]').forEach(a => { a.href = 'tel:' + purePhone; a.textContent = phone; });
                    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => { a.href = 'https://wa.me/55' + purePhone; a.textContent = phone; });
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
                    banners.forEach((b, i) => {
                        const activeClass = i === 0 ? 'active' : '';
                        const imgSrc = b.image_url && (b.image_url.startsWith('data:image') || b.image_url.startsWith('http')) ? b.image_url : 'assets/images/' + b.image_url;
                        const hasMobile = b.image_mobile_url && b.image_mobile_url.trim() !== '';
                        const imgMobileSrc = hasMobile ? ((b.image_mobile_url.startsWith('data:image') || b.image_mobile_url.startsWith('http')) ? b.image_mobile_url : 'assets/images/' + b.image_mobile_url) : imgSrc;
                        const uniqueId = b.id || i;

                        slider.innerHTML += `
                          <style>
                            .slide-bg-${uniqueId} { background-image: url('${imgSrc}'); }
                            @media (max-width: 768px) { .slide-bg-${uniqueId} { background-image: url('${imgMobileSrc}'); } }
                          </style>
                          <div class="slide ${activeClass}">
                            <div class="slide-bg slide-bg-${uniqueId}"></div>
                            <div class="slide-content">
                              <h1>${b.title}</h1>
                              <p>${b.subtitle || ''}</p>
                              <a href="${b.link && b.link !== 'none' ? b.link : 'produtos.html'}" class="btn-hero" ${b.link === 'none' ? 'style="display:none;"' : ''}>Ver Produtos</a>
                            </div>
                          </div>
                        `;
                        dotsContainer.innerHTML += `<button class="slider-dot ${activeClass}"></button>`;
                    });
                }
            }
        } catch (e) { console.error('Erro ao carregar banners:', e); }

        try {
            // Load Products for homepage sections
            const products = await sbGetProducts();
            if (products && products.length > 0) {
                const catMap = {
                    'Encartelados': '#encartelados', 'Brinquedos a Pilha': '#pilha',
                    'Jogos': '#jogos', 'Didáticos': '#didaticos',
                    'Verão': '#verao', 'Patinetes': '#patinetes'
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
                                    const imgSrc = p.image_url && (p.image_url.startsWith('data:image') || p.image_url.startsWith('http')) ? p.image_url : 'assets/images/' + p.image_url;
                                    grid.innerHTML += `
                                      <div class="product-card reveal" style="transition-delay: ${0.1 + (i * 0.1)}s;">
                                        ${badgeHtml}
                                        <div class="product-img-wrapper">
                                          <img src="${imgSrc}" alt="${p.name}" class="product-img">
                                        </div>
                                        <div class="product-info">
                                          <h3>${p.name}</h3>
                                          <p class="category-tag">${p.category}</p>
                                          <span class="product-age">${p.age}</span>
                                        </div>
                                      </div>
                                    `;
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
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(idx) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (idx + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }
    function startAutoSlide() { slideInterval = setInterval(nextSlide, 5000); }
    function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
    if (dots) dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); resetAutoSlide(); }));

    // Touch swipe support
    let touchStartX = 0;
    const sliderEl = document.querySelector('.slider');
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

    if (slides && slides.length > 0) startAutoSlide();

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
            card.style.transitionDelay = `${i * 0.1} s`;
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
