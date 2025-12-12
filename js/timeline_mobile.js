/* =====================================================
   MOBILE FUNCTIONALITY
   - Hamburger menu (mobile only)
   - Full card click (mobile only) 
   - Progress bar visibility (mobile only)
   - Vertical timeline (mobile only)
   - Year markers on left side (mobile only)
   ===================================================== */

(function() {
    'use strict';
    
    const isMobile = () => window.innerWidth <= 900;
    const isSmallMobile = () => window.innerWidth <= 768;
    
    // =====================================================
    // FULL CARD CLICK - MOBILE ONLY
    // On mobile, clicking anywhere on a timeline card opens modal
    // =====================================================
    
    function setupMobileCardClick() {
        if (!isMobile()) return;
        
        const eventsContainer = document.getElementById('events-container');
        if (!eventsContainer) return;
        
        eventsContainer.addEventListener('click', handleMobileCardClick);
    }
    
    function handleMobileCardClick(e) {
        if (!isMobile()) return;
        
        const card = e.target.closest('.event-content');
        if (!card) return;
        
        if (e.target.closest('#card-modal-overlay')) return;
        if (e.target.closest('.modal-close-btn')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (typeof window.openModal === 'function') {
            window.openModal(card);
        } else {
            openCardModal(card);
        }
    }
    
    function openCardModal(card) {
        const modal = document.getElementById('card-modal-overlay');
        if (!modal) return;
        
        const modalContent = modal.querySelector('.modal-card-content');
        const modalCard = modal.querySelector('.modal-card');
        
        if (!modalContent || !modalCard) return;
        
        modalContent.innerHTML = card.innerHTML;
        
        const hiddenContent = modalContent.querySelector('.card-hidden-content');
        if (hiddenContent) {
            hiddenContent.style.display = 'block';
            hiddenContent.style.opacity = '1';
        }
        
        const btn = modalContent.querySelector('.read-more-btn');
        if (btn) btn.style.display = 'none';
        
        card.classList.add('expanded');
        
        const isStandalone = card.classList.contains('standalone-card');
        const parentWrapper = card.closest('.timeline-event');
        
        if (isStandalone && parentWrapper) {
            const stem = parentWrapper.querySelector('.cluster-stem');
            if (stem) stem.classList.add('stem-hidden');
        } else {
            const branchNode = card.closest('.branch-node');
            if (branchNode) branchNode.classList.add('branch-hidden');
        }
        
        modal.classList.add('active');
        
        requestAnimationFrame(() => {
            modalCard.classList.add('animate-in');
        });
        
        const closeModal = () => {
            modalCard.classList.remove('animate-in');
            modalCard.classList.add('animate-out');
            
            card.classList.remove('expanded');
            
            if (isStandalone && parentWrapper) {
                const stem = parentWrapper.querySelector('.cluster-stem');
                if (stem) stem.classList.remove('stem-hidden');
            } else {
                const branchNode = card.closest('.branch-node');
                if (branchNode) branchNode.classList.remove('branch-hidden');
            }
            
            setTimeout(() => {
                modal.classList.remove('active');
                modalCard.classList.remove('animate-out');
                modalContent.innerHTML = '';
            }, 300);
        };
        
        const closeBtn = modal.querySelector('.modal-close-btn');
        const backdrop = modal.querySelector('.modal-backdrop');
        const container = modal.querySelector('.modal-card-container');
        
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        
        if (backdrop) {
            backdrop.onclick = closeModal;
        }
        
        if (container) {
            container.onclick = (e) => {
                if (e.target === container) closeModal();
            };
        }
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    // =====================================================
    // HAMBURGER MENU - MOBILE ONLY
    // =====================================================
    
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
                        <span class="mobile-menu-title">Which states can prosecute globally?</span>
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
                        <span class="mobile-menu-title">How states pursue crimes beyond their borders</span>
                    </a>
                </li>
                <li class="mobile-menu-item">
                    <a href="#section-5" class="mobile-menu-link">
                        <span class="mobile-menu-num">05</span>
                        <span class="mobile-menu-title">How often states apply universal jurisdiction</span>
                    </a>
                </li>
            </ul>
        `;
        
        document.body.insertBefore(mobileNav, document.body.firstChild);
        document.body.insertBefore(mobileMenu, mobileNav.nextSibling);
        
        const hamburgerBtn = mobileNav.querySelector('.hamburger-btn');
        
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('is-open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !mobileMenu.contains(e.target)) {
                if (mobileMenu.classList.contains('is-open')) {
                    closeMobileMenu();
                }
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });
    }
    
    function openMobileMenu() {
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (hamburgerBtn && mobileMenu) {
            hamburgerBtn.classList.add('is-open');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            mobileMenu.classList.add('is-open');
        }
    }
    
    function closeMobileMenu() {
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (hamburgerBtn && mobileMenu) {
            hamburgerBtn.classList.remove('is-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('is-open');
        }
    }
    
    // =====================================================
    // PROGRESS BAR VISIBILITY - MOBILE ONLY
    // =====================================================
    
    function setupProgressBarVisibility() {
        if (!isMobile()) return;
        
        const timelineSection = document.querySelector('.timeline-section');
        const progressIndicator = document.querySelector('.progress-indicator');
        
        if (!timelineSection || !progressIndicator) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressIndicator.classList.add('is-visible');
                } else {
                    progressIndicator.classList.remove('is-visible');
                }
            });
        }, {
            root: null,
            rootMargin: '-5% 0px -5% 0px',
            threshold: 0
        });
        
        observer.observe(timelineSection);
    }
    
    // =====================================================
    // VERTICAL TIMELINE SETUP - MOBILE ONLY
    // =====================================================
    
    function initMobileTimeline() {
        if (!isMobile()) return;
        
        const timelineEvents = document.querySelectorAll('.timeline-event');
        if (!timelineEvents.length) return;
        
        timelineEvents.forEach(el => {
            el.style.opacity = '1';
        });
        
        createMobileYearMarkers();
        createMobileYearBadges();
        setupMobileScrollAnimations();
    }
    
    // =====================================================
    // YEAR MARKERS - LEFT SIDE OF TIMELINE
    // Creates year labels that appear when entering a new year
    // =====================================================
    
    function createMobileYearMarkers() {
        if (!isMobile()) return;
        
        const events = document.querySelectorAll('.timeline-event');
        let lastYear = null;
        
        document.querySelectorAll('.mobile-year-marker').forEach(m => m.remove());
        
        events.forEach((event, index) => {
            const position = event.dataset.position;
            
            let eventYear = null;
            const yearLabel = document.querySelector(`.year-label[data-position="${position}"]`);
            if (yearLabel) {
                eventYear = yearLabel.textContent.trim();
            }
            
            if (!eventYear) {
                const card = event.querySelector('.event-content');
                if (card) {
                    const dateEl = card.querySelector('.event-date');
                    if (dateEl) {
                        const dateText = dateEl.textContent;
                        const yearMatch = dateText.match(/\d{4}/);
                        if (yearMatch) {
                            eventYear = yearMatch[0];
                        }
                    }
                }
            }
            
            if (eventYear && eventYear !== lastYear) {
                const marker = document.createElement('div');
                marker.className = 'mobile-year-marker';
                marker.innerHTML = `<span class="mobile-year-marker-year">${eventYear}</span>`;
                
                event.insertBefore(marker, event.firstChild);
                
                lastYear = eventYear;
            }
        });
    }
    
    // =====================================================
    // YEAR BADGES - INSIDE CARDS
    // Small badge showing year inside each card
    // =====================================================
    
    function createMobileYearBadges() {
        if (!isMobile()) return;
        
        const events = document.querySelectorAll('.timeline-event');
        
        events.forEach(event => {
            const position = event.dataset.position;
            const cards = event.querySelectorAll('.event-content');
            
            cards.forEach(card => {
                if (!card.querySelector('.mobile-year-badge')) {
                    const yearLabel = document.querySelector(`.year-label[data-position="${position}"]`);
                    if (yearLabel) {
                        const badge = document.createElement('span');
                        badge.className = 'mobile-year-badge';
                        badge.textContent = yearLabel.textContent;
                        card.insertBefore(badge, card.firstChild);
                    }
                }
            });
        });
    }
    
    // =====================================================
    // SCROLL ANIMATIONS - MOBILE ONLY
    // Fade-in and animate cards as they enter viewport
    // =====================================================
    
    function setupMobileScrollAnimations() {
        if (!isMobile()) return;
        
        const events = document.querySelectorAll('.timeline-event');
        const yearMarkers = document.querySelectorAll('.mobile-year-marker');
        
        const eventObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('mobile-visible');
                }
            });
        }, {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        });
        
        events.forEach(event => eventObserver.observe(event));
        
        const markerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            root: null,
            rootMargin: '-5% 0px -5% 0px',
            threshold: 0.5
        });
        
        yearMarkers.forEach(marker => markerObserver.observe(marker));
    }
    
    // =====================================================
    // RESIZE HANDLER
    // =====================================================
    
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isMobile()) {
                createMobileNav();
                setupProgressBarVisibility();
                initMobileTimeline();
                setupMobileCardClick();
            } else {
                const mobileNav = document.querySelector('.mobile-nav');
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileNav) mobileNav.remove();
                if (mobileMenu) mobileMenu.remove();
                
                document.querySelectorAll('.mobile-year-badge').forEach(b => b.remove());
                document.querySelectorAll('.mobile-year-marker').forEach(m => m.remove());
                document.querySelectorAll('.timeline-event').forEach(el => {
                    el.classList.remove('mobile-visible');
                });
                
                const progressIndicator = document.querySelector('.progress-indicator');
                if (progressIndicator) {
                    progressIndicator.classList.remove('is-visible');
                }
                
                document.body.style.paddingTop = '';
            }
        }, 250);
    }
    
    // =====================================================
    // MENU ACTIVE STATE
    // =====================================================
    
    function setupMenuActiveState() {
        if (!isSmallMobile()) return;
        
        const sections = document.querySelectorAll('section[id^="section-"]');
        const menuLinks = document.querySelectorAll('.mobile-menu-link');
        
        if (!sections.length || !menuLinks.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    menuLinks.forEach(link => {
                        link.classList.remove('is-active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('is-active');
                        }
                    });
                }
            });
        }, {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        });
        
        sections.forEach(section => observer.observe(section));
    }
    
    // =====================================================
    // INITIALIZATION
    // =====================================================
    
    function init() {
        if (isMobile()) {
            createMobileNav();
            setupProgressBarVisibility();
            setupMenuActiveState();
            setupMobileCardClick();
            
            setTimeout(initMobileTimeline, 500);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.addEventListener('resize', handleResize);
    
    window.addEventListener('load', () => {
        if (isMobile()) {
            setTimeout(() => {
                initMobileTimeline();
                setupMobileCardClick();
                setupMenuActiveState();
            }, 1000);
        }
    });
    
})();
