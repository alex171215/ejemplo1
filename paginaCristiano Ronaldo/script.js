document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Animations for Sections
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve after fading in to keep it visible
                // fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 2. Statistics Counter Animation
    const statsSection = document.getElementById('estadisticas');
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    const countUp = (element) => {
        const target = +element.getAttribute('data-target');
        const count = +element.innerText;
        const speed = 200; // lower is faster
        
        const inc = target / speed;

        if (count < target) {
            element.innerText = Math.ceil(count + inc);
            setTimeout(() => countUp(element), 10);
        } else {
            element.innerText = target;
        }
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted) {
                hasCounted = true;
                counters.forEach(counter => countUp(counter));
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // 3. Timeline Interactive Highlight
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            timelineItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
        
        // Mobile tap support
        item.addEventListener('click', () => {
            timelineItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });

        // Keyboard support
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                timelineItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });

    // 4. Navbar active state on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        const headerHeight = document.querySelector('nav').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - headerHeight - 100)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = ''; // reset
            if (link.getAttribute('href').substring(1) === current) {
                link.style.color = 'var(--accent-gold)';
            }
        });
    });
});
