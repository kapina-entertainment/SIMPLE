// Current Year for Footer
document.getElementById('year').textContent = new Date().getFullYear();
// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
const logoImg = document.querySelector('.logo-img');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        if (logoImg) logoImg.src = 'white_logo.png';
    } else {
        navbar.classList.remove('scrolled');
        if (logoImg) logoImg.src = 'black_logo.png';
    }
});

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

// Floating Widget Visibility Toggle (hide when reaching the contact section)
const floatingWidget = document.querySelector('.floating-widget');
const contactSection = document.getElementById('contact');

if (floatingWidget && contactSection) {
    const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If contact section is visible, hide the floating widget
                floatingWidget.classList.add('hidden');
            } else {
                // If out of contact section, show the floating widget
                floatingWidget.classList.remove('hidden');
            }
        });
    }, {
        root: null,
        threshold: 0.1 // Triggers when 10% of the contact section is visible
    });

    contactObserver.observe(contactSection);
}

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
// --- Dynamic Portfolio Generating Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.portfolio-grid');
    if (!grid) return; // Exit if not on the main page

    let currentPortfolioData = PORTFOLIO_DATA;

    // Check if there is saved admin data in localStorage
    const savedData = localStorage.getItem('simple_portfolio_data');
    if (savedData) {
        try {
            currentPortfolioData = JSON.parse(savedData);
        } catch (e) {
            console.error("Failed to parse saved portfolio data", e);
        }
    }

    grid.innerHTML = ''; // Clear grid container just in case

    // 1. We want 3 columns (matching CSS desktop grid)
    const colCount = window.innerWidth <= 768 ? 1 : 3;
    const columns = [];

    for (let i = 0; i < colCount; i++) {
        const col = document.createElement('div');
        col.className = 'portfolio-column';
        grid.appendChild(col);
        columns.push(col);
    }

    // 2. Generate items mathematically from the data array
    const allItems = [];

    currentPortfolioData.forEach((dataItem, index) => {
        // Create the main wrapper
        const itemDiv = document.createElement('div');
        itemDiv.className = 'portfolio-item';

        // Initial State setup for scroll revealing is handled entirely by style.css (.portfolio-item)
        itemDiv.dataset.index = index; // Store index for modal clicking

        // Setup the image poster
        const posterSrc = dataItem.posterSrc || (dataItem.previewSrc ? dataItem.previewSrc.replace('.webm', '.jpg') : '');

        itemDiv.innerHTML = `
            <div class="item-visuals">
                <img class="portfolio-poster" src="${posterSrc}" data-video="${dataItem.previewSrc}" alt="Portfolio Thumbnail">
            </div>
            <div class="item-info">
                <h3>${dataItem.title}</h3>
                <p>${dataItem.subtitle || dataItem.role || ''}</p>
            </div>
        `;

        // Distribute left-to-right (row-major)
        columns[index % colCount].appendChild(itemDiv);
        allItems.push(itemDiv);
    });

    // 3. Update the intersection observer for scroll animations
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

    // 4. Attach Event Listeners to New Elements
    attachPortfolioEventListeners(currentPortfolioData);
});

// Extracted Function for Event Listeners
function attachPortfolioEventListeners(currentPortfolioData) {
    // A. Poster Hover-to-Play Elements
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
    const modalDesc = document.getElementById('modal-desc');
    const modalMediaContainer = document.getElementById('modal-media-container');

    // Mapping the exact 17 items inside HTML dynamically by mapping elements
    // Mapping the exact items inside HTML dynamically by mapping elements
    // The data source is now currentPortfolioData which we populated earlier
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            // Extract the index from the dataset we saved during rendering
            const index = item.dataset.index;

            if (index !== undefined && currentPortfolioData[index]) {
                const data = currentPortfolioData[index];

                // Inject data into modal
                modalTitle.textContent = data.title;
                modalDesc.innerHTML = data.desc || '';
                modalMediaContainer.innerHTML = data.media || '';

                // Explicitly play video if it's there
                const video = modalMediaContainer.querySelector('video');
                if (video) {
                    video.load(); // Force reset if needed
                    let playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => console.log('Autoplay blocked:', e));
                    }
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
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
} // End attached function
