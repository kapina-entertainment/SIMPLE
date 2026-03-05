// Current Year for Footer
document.getElementById('year').textContent = new Date().getFullYear();

// Custom Cursor Implementation
const cursor = document.getElementById('cursor');
const cursorBlur = document.getElementById('cursor-blur');

document.addEventListener('mousemove', (e) => {
    // Sharp cursor instantly follows
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // Smooth trailing effect for the glow
    cursorBlur.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
    }, { duration: 500, fill: "forwards" });
});

// Cursor Hover Effects for Links and Buttons (Magnetic removed)
const interactables = document.querySelectorAll('a, .btn, .portfolio-item, .footer-socials a');

interactables.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursor.style.backgroundColor = 'transparent';
        cursor.style.border = '2px solid var(--accent-color)';

        cursorBlur.style.transform = 'translate(-50%, -50%) scale(1.2)';
        cursorBlur.style.opacity = '0.8';
    });

    link.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'var(--accent-color)';
        cursor.style.border = 'none';

        cursorBlur.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorBlur.style.opacity = '0.35';
    });
});

// Scroll Animations to reveal elements when in horizontal or vertical view
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.portfolio-item, .about-container, .contact-box').forEach(el => {
    // Initial State setup for scroll revealing
    if (!el.classList.contains('portfolio-item')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    }
    observer.observe(el);
});

// Make it visible classes for transition logic
const visibleStyle = document.createElement("style");
visibleStyle.innerHTML = `
    .about-container.visible, .contact-box.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(visibleStyle);

// Navbar Dynamic Background Scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 5%';
        nav.style.background = 'rgba(5, 5, 5, 0.8)';
        nav.style.backdropFilter = 'blur(20px)';
    } else {
        nav.style.padding = '1.5rem 5%';
        nav.style.background = 'var(--glass-bg)';
        nav.style.backdropFilter = 'blur(12px)';
    }
});

// --- 3D Hero Background relies on Spline Web Component now ---
// Three.js removed.

// Initialize Lenis (Smooth Scrolling)
const lenis = new Lenis({
    lerp: 0.1, // Adjust this for smoother/tighter feeling (lower is smoother)
    smoothWheel: true,
    wheelMultiplier: 1.2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Lenis Anchor Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        // Use Lenis to scroll to the target, offset by navbar height (e.g., 80px)
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            lenis.scrollTo(targetElement, {
                offset: -80, // Offset for the fixed navbar
                duration: 1.2, // Adjust smooth scroll duration
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) // Custom easing curve
            });
        }
    });
});

// --- New Features Logic ---

// 1. Magnetic Effect
const magnetics = document.querySelectorAll('.magnetic');
magnetics.forEach((element) => {
    element.addEventListener('mousemove', (e) => {
        const position = element.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;

        // Adjust the multiplier for stronger/weaker magnetic pull
        element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0px, 0px)';
    });
});

// Portfolio item magnetic cursor tracking removed as requested.

// --- Left-to-Right True Masonry Layout Fix ---
// CSS Grid rows force the next row to start exactly under the tallest element of the prior row.
// CSS Column-count ruins the 1, 2, 3 left-to-right order.
// We dynamically restructure the HTML into explicit columns to get BOTH.
const grid = document.querySelector('.portfolio-grid');
if (grid) {
    // 1. Gather all items mathematically
    const allItems = Array.from(grid.querySelectorAll('.portfolio-item'));
    grid.innerHTML = ''; // Clear grid

    // 2. We want 3 columns (matching CSS desktop grid)
    const colCount = window.innerWidth <= 768 ? 1 : 3;
    const columns = [];

    for (let i = 0; i < colCount; i++) {
        const col = document.createElement('div');
        col.className = 'portfolio-column';
        grid.appendChild(col);
        columns.push(col);
    }

    // 3. Distribute items visually Left-to-Right (row-major)
    // Item 0 -> Col 0, Item 1 -> Col 1, Item 2 -> Col 2, Item 3 -> Col 0...
    allItems.forEach((item, index) => {
        // Re-apply inline reset for transform initially inside new containers
        item.style.transform = 'translateY(50px)';
        columns[index % colCount].appendChild(item);
    });

    // 4. Update the intersection observer for scroll animations since DOM changed
    const resetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Reset transform to 0 so the mousemove effect works from 0,0 locally
                entry.target.style.transform = '';
            }
        });
    }, { threshold: 0.1 });

    allItems.forEach(item => resetObserver.observe(item));
}

// 2. Poster Hover-to-Play Elements
const portfolioPosters = document.querySelectorAll('.portfolio-poster');
portfolioPosters.forEach(poster => {

    const parentItem = poster.closest('.portfolio-item');
    const visualsContainer = poster.closest('.item-visuals');
    let dynamicVideo = null;
    let isHovering = false;

    if (parentItem && visualsContainer) {
        parentItem.addEventListener('mouseenter', () => {
            isHovering = true;
            // Lazy load the video element on first hover to save massive bandwidth
            if (!dynamicVideo) {
                dynamicVideo = document.createElement('video');
                dynamicVideo.src = poster.dataset.video;
                dynamicVideo.muted = true;
                dynamicVideo.loop = true;
                dynamicVideo.playsInline = true;
                dynamicVideo.className = 'portfolio-video dynamic-video';
                // Style to overlay fully on top of the poster seamlessly
                dynamicVideo.style.position = 'absolute';
                dynamicVideo.style.top = '0';
                dynamicVideo.style.left = '0';
                dynamicVideo.style.width = '100%';
                dynamicVideo.style.height = '100%';
                dynamicVideo.style.objectFit = 'cover';
                dynamicVideo.style.opacity = '0';
                dynamicVideo.style.transition = 'opacity 0.3s ease';
                visualsContainer.appendChild(dynamicVideo);

                // Once loaded enough to play, fade it in
                dynamicVideo.addEventListener('playing', () => {
                    // Quick check in case the user moved their mouse out while it was still buffering
                    if (isHovering) {
                        dynamicVideo.style.opacity = '1';
                    }
                });
            }

            // Play from the beginning every time they hover
            if (dynamicVideo) {
                dynamicVideo.currentTime = 0;
                let playPromise = dynamicVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => { console.log('Auto-play blocked or interrupted', error); });
                }
            }
        });

        parentItem.addEventListener('mouseleave', () => {
            isHovering = false;
            if (dynamicVideo) {
                dynamicVideo.style.opacity = '0';
                // Wait for the fade out transition before pausing
                setTimeout(() => {
                    if (!isHovering) { // Double check they didn't hover back in immediately
                        dynamicVideo.pause();
                    }
                }, 300);
            }
        });
    }
});

// 3. Portfolio Modal Logic
const modal = document.getElementById('portfolio-modal');
const modalCloseBtn = document.querySelector('.modal-close');
const modalBackdrop = document.querySelector('.modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalRole = document.getElementById('modal-role');
const modalDesc = document.getElementById('modal-desc');
const modalMediaContainer = document.getElementById('modal-media-container');

// Mapping the exact 17 items inside HTML dynamically by mapping elements
const portfolioData = {
    '01.G-idle': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/01.G-idle.webm" type="video/webm"></video>'
    },
    '02.B&O Beoplay HX Promotion': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/02.B&O Beoplay HX Promotion.webm" type="video/webm"></video>'
    },
    '03.toasty': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/03.toasty.webm" type="video/webm"></video>'
    },
    '04.Dedication_2D_motion': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/04.Dedication_2D_motion.webm" type="video/webm"></video>'
    },
    '05.코웨이_LCD 모션_냉수-260107-01': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/05.코웨이_LCD 모션_냉수-260107-01.webm" type="video/webm"></video>'
    },
    '06.크런틴_1080x1920-260118-05': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/06.크런틴_1080x1920-260118-05.webm" type="video/webm"></video>'
    },
    '07.빙그레 이지드링크-20220729-01': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop muted controls playsinline style="width:100%;height:100%;"><source src="assets/07.Bingre.webm" type="video/webm"></video>'
    },
    '08.열정국밥-260106-01': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop muted controls playsinline style="width:100%;height:100%;"><source src="assets/08.Yeoljeong.webm" type="video/webm"></video>'
    },
    '09.ENHYPEN_Sunghoon_crossvision': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/09.ENHYPEN_Sunghoon_crossvision.webm" type="video/webm"></video>'
    },
    '10.크라이오소닉_최종본-20250211-01': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop muted controls playsinline style="width:100%;height:100%;"><source src="assets/10.Criosonic.webm" type="video/webm"></video>'
    },
    '11.SNS_Motion': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/11.SNS_Motion.webm" type="video/webm"></video>'
    },
    '12.catch_care-251209-01': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/12.catch_care-251209-01.webm" type="video/webm"></video>'
    },
    '13.Kallos Scene 8_Promotion': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/13.Kallos Scene 8_Promotion.webm" type="video/webm"></video>'
    },
    '14.민간 R&D 협의체': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop muted controls playsinline style="width:100%;height:100%;"><source src="assets/14.R&D.webm" type="video/webm"></video>'
    },
    '15.오알오_최종본-20250530-01': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop muted controls playsinline style="width:100%;height:100%;"><source src="assets/15.ORO.webm" type="video/webm"></video>'
    },
    '16.코웨이_LCD 모션_온수-260107-01': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop muted controls playsinline style="width:100%;height:100%;"><source src="assets/16.Coway_warm.webm" type="video/webm"></video>'
    },
    '17.제 9회 대구 스타트업 행사 오프닝-251203-02': {
        role: 'TBD',
        desc: '설명을 여기에 적어주세요.',
        media: '<video autoplay loop muted controls playsinline style="width:100%;height:100%;"><source src="assets/17.Daegu_Startup.webm" type="video/webm"></video>'
    }
};

const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        // Extract basic info from the clicked card
        const titleElement = item.querySelector('h3');
        if (!titleElement) return;

        const title = titleElement.textContent;
        const data = portfolioData[title];

        if (data) {
            // Inject data into modal
            modalTitle.textContent = title;
            modalRole.textContent = data.role;
            modalDesc.innerHTML = data.desc;
            modalMediaContainer.innerHTML = data.media;

            // Explicitly play video if it's there
            const video = modalMediaContainer.querySelector('video');
            if (video) {
                video.load(); // Force reset if needed
                video.play().catch(e => console.log('Autoplay blocked:', e));
            }

            // Show modal
            modal.classList.add('active');
            // Disable body scrolling
            document.body.style.overflow = 'hidden';
        }
    });
});

// Function to close modal
const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling

    // Clear media to stop video/audio playing in background after a short delay
    setTimeout(() => {
        modalMediaContainer.innerHTML = '';
    }, 400); // Matches CSS transition duration
};

// Close event listeners
modalCloseBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});
