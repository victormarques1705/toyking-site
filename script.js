document.addEventListener('DOMContentLoaded', () => {
    // ===== LOADER =====
    const loader = document.querySelector('.loader-overlay');
    window.addEventListener('load', () => {
        setTimeout(() => { loader.classList.add('hidden'); }, 1200);
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

    nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
    prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); resetAutoSlide(); }));

    // Touch swipe support
    let touchStartX = 0;
    const sliderEl = document.querySelector('.slider');
    sliderEl.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide();
            resetAutoSlide();
        }
    }, { passive: true });

    startAutoSlide();

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
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('show', window.scrollY > 400);
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

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
        bgs.forEach(bg => {
            bg.style.transform = `translateY(${scrolled * 0.3}px)`;
        });
    });
});
