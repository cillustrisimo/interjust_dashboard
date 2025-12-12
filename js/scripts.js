/**
 * SCRIPTS.JS 
 * Logic for Scrollytelling (Focus/Zoom) and Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ===============================================
       SCROLL SPY (NAV HIGHLIGHT)
       =============================================== */
    
    // Select all nav links and the sections they point to
    const navLinks = document.querySelectorAll('.side-nav a');
    // This selects any section with an ID starting with "section-" plus references
    const contentSections = document.querySelectorAll('section[id^="section-"], #references');

    // Set up the observer options
    const spyOptions = {
        root: null,
        // This margin creates a line across the exact center of the screen.
        // The observer triggers when a section crosses this center line.
        rootMargin: '-50% 0px -50% 0px', 
        threshold: 0
    };

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Clean up: Remove 'active-nav' from ALL links first
                navLinks.forEach(link => link.classList.remove('active-nav'));

                // Highlight: Add 'active-nav' to the matching link
                const activeLink = document.querySelector(`.side-nav a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active-nav');
                }
            }
        });
    }, spyOptions);

    // Start watching the sections
    contentSections.forEach(section => {
        spyObserver.observe(section);
    });
    
    /* ===============================================
    GLOSSARY TO SIDEBAR TRANSITION LOGIC
    =============================================== */
    const glossarySection = document.getElementById('glossary');
    const sideNav = document.getElementById('side-nav');

    if (glossarySection && sideNav) {
        const glossaryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If the glossary is no longer intersecting 
                // and we are below it (boundingClientRect.top is negative), show sidebar.
                const isBelow = entry.boundingClientRect.top < 0;
                
                if (!entry.isIntersecting && isBelow) {
                    sideNav.classList.add('is-visible');
                } else {
                    sideNav.classList.remove('is-visible');
                }
            });
        }, {
            root: null,
            // -100px at the top creates a buffer zone.
            // The observer considers the glossary invisible 
            // once it enters the top 100px of the screen.
            // This ensures the sidebar triggers before 
            // the glossary is 100% gone.
            rootMargin: "-100px 0px 0px 0px", 
            threshold: 0 
        });

        glossaryObserver.observe(glossarySection);
    }
    
    /* ===============================================
       SCROLLYTELLING LOGIC 
       =============================================== */
    
    // Find all scrollytelling sections
    const scrollySections = document.querySelectorAll('[id^="scrolly-section-"]');
    
    scrollySections.forEach(section => {
        const sectionId = section.id;
        const chartWrapper = section.querySelector('.chart-wrapper');
        const steps = section.querySelectorAll('.step');
        
        if (!chartWrapper || steps.length === 0) return;
        
        console.log('[Scrollytelling] Initializing', sectionId);

        const config = {
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const step = entry.target;
                    const action = step.getAttribute('data-action');
                    const target = step.getAttribute('data-target');
                    
                    // Find the correct chart wrapper for this step
                    const targetWrapper = target ? 
                        document.getElementById(target)?.closest('.chart-wrapper') : 
                        chartWrapper;
                    
                    if (targetWrapper) {
                        // Apply zoom/reset action
                        if (action === 'zoom') {
                            targetWrapper.classList.add('is-zoomed');
                        } else if (action === 'reset') {
                            targetWrapper.classList.remove('is-zoomed');
                        }
                    }

                    // Update active card styling
                    steps.forEach(s => {
                        const card = s.querySelector('.card');
                        if (card) card.classList.remove('is-active');
                    });
                    
                    const card = step.querySelector('.card');
                    if (card) card.classList.add('is-active');
                }
            });
        }, config);

        steps.forEach(step => observer.observe(step));
    });

    /* ===============================================
       SMOOTH SCROLL
       =============================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ===============================================
       MOBILE HAMBURGER MENU
       =============================================== */
    function isSmallMobile() {
        return window.innerWidth <= 768;
    }

    function createMobileNav() {
        if (!isSmallMobile()) return;
        if (document.querySelector('.mobile-nav')) return;
        
        const mobileNav = document.createElement('nav');
        mobileNav.className = 'mobile-nav';
        mobileNav.innerHTML = `
            <span class="mobile-nav-logo">Project Meridian</span>
            <button class="hamburger-btn" aria-label="Toggle menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
        `;
        
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <ul class="mobile-menu-list">
                <li class="mobile-menu-item">
                    <a href="#section-1" class="mobile-menu-link">
                        <span class="mobile-menu-num">01</span>
                        <span class="mobile-menu-title">What is Universal Jurisdiction?</span>
                    </a>
                </li>
                <li class="mobile-menu-item">
                    <a href="#section-2" class="mobile-menu-link">
                        <span class="mobile-menu-num">02</span>
                        <span class="mobile-menu-title">What crimes can States prosecute?</span>
                    </a>
                </li>
                <li class="mobile-menu-item">
                    <a href="#section-3" class="mobile-menu-link">
                        <span class="mobile-menu-num">03</span>
                        <span class="mobile-menu-title">Who can be held responsible?</span>
                    </a>
                </li>
                <li class="mobile-menu-item">
                    <a href="#section-4" class="mobile-menu-link">
                        <span class="mobile-menu-num">04</span>
                        <span class="mobile-menu-title">How states pursue crimes</span>
                    </a>
                </li>
                <li class="mobile-menu-item">
                    <a href="#section-5" class="mobile-menu-link">
                        <span class="mobile-menu-num">05</span>
                        <span class="mobile-menu-title">How often states apply UJ</span>
                    </a>
                </li>
                <li class="mobile-menu-item">
                    <a href="#references" class="mobile-menu-link">
                        <span class="mobile-menu-num">06</span>
                        <span class="mobile-menu-title">References</span>
                    </a>
                </li>
            </ul>
        `;
        
        document.body.insertBefore(mobileNav, document.body.firstChild);
        document.body.insertBefore(mobileMenu, mobileNav.nextSibling);
        
        // Event listeners
        const hamburgerBtn = mobileNav.querySelector('.hamburger-btn');
        
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('is-open');
            if (isOpen) {
                mobileMenu.classList.remove('is-open');
                hamburgerBtn.classList.remove('is-open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            } else {
                mobileMenu.classList.add('is-open');
                hamburgerBtn.classList.add('is-open');
                hamburgerBtn.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close on link click
        mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-open');
                hamburgerBtn.classList.remove('is-open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // Initialize mobile nav
    createMobileNav();
    window.addEventListener('resize', createMobileNav);

});