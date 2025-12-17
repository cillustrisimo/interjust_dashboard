/**
 * SCRIPTS.JS 
 * Logic for Scrollytelling (Focus/Zoom), footnotes, and Smooth Scroll
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
            
            // Skip smooth scroll for footnote links - handled separately
            if (this.classList.contains('ref-link')) return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ===============================================
       FOOTNOTE BIDIRECTIONAL NAVIGATION
       Footnotes link to references, references link back to footnotes.
       Handles modal interactions for footnotes inside case study modals.
       =============================================== */
    
    // Track the last clicked footnote for spring-back styling
    let lastClickedFootnote = null;
    
    // --- Build a map of which footnotes exist in which modal ---
    function buildModalFootnoteMap() {
        const map = {};
        if (typeof CaseStudyGlobes !== 'undefined' && CaseStudyGlobes.caseStudies) {
            CaseStudyGlobes.caseStudies.forEach((caseStudy, index) => {
                const matches = caseStudy.content.match(/href="#ref-(\d+)"/g);
                if (matches) {
                    matches.forEach(match => {
                        const refNum = match.match(/ref-(\d+)/)[1];
                        map[refNum] = index;
                    });
                }
            });
        }
        return map;
    }
    
    const modalFootnoteMap = buildModalFootnoteMap();
    
    // --- STEP 1: Add unique IDs to all footnote links in main document ---
    const footnoteLinks = document.querySelectorAll('a.ref-link');
    
    footnoteLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#ref-')) {
            const refNum = href.replace('#ref-', '');
            const footnoteId = `footnote-${refNum}`;
            
            const supElement = link.closest('sup');
            if (supElement) {
                supElement.setAttribute('id', footnoteId);
            } else {
                link.setAttribute('id', footnoteId);
            }
        }
    });
    
    // --- STEP 2: Handle footnote clicks (text -> reference) ---
    footnoteLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#ref-')) {
                e.preventDefault();
                const refNum = href.replace('#ref-', '');
                lastClickedFootnote = `footnote-${refNum}`;
                
                // Check if footnote is inside a modal - close modal first
                const modal = link.closest('.case-study-modal');
                if (modal && modal.classList.contains('active')) {
                    if (typeof CaseStudyGlobes !== 'undefined') {
                        CaseStudyGlobes.closeModal();
                    }
                }
                
                const targetRef = document.getElementById(`ref-${refNum}`);
                if (targetRef) {
                    // Remove active state from any other reference
                    document.querySelectorAll('.reference-item.has-return').forEach(item => {
                        item.classList.remove('has-return');
                    });
                    // Mark this reference as having a return target
                    targetRef.classList.add('has-return');
                    
                    // Smooth scroll to reference
                    setTimeout(() => {
                        targetRef.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 100);
                }
            }
        });
    });
    
    // --- STEP 3: Handle reference clicks (reference -> footnote) ---
    const referenceItems = document.querySelectorAll('.reference-item[id^="ref-"]');
    
    referenceItems.forEach((refItem) => {
        refItem.style.cursor = 'pointer';
        
        refItem.addEventListener('click', (e) => {
            // Don't trigger if clicking on an actual link within the reference
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            
            const refId = refItem.getAttribute('id');
            const refNum = refId.replace('ref-', '');
            const footnoteId = `footnote-${refNum}`;
            
            // Check if this footnote exists in a modal
            if (modalFootnoteMap.hasOwnProperty(refNum)) {
                e.preventDefault();
                const modalIndex = modalFootnoteMap[refNum];
                
                // Find the trigger card for this modal and scroll to it
                const triggerCard = document.querySelector(`.globe-case-study-trigger[data-case-study-index="${modalIndex}"]`);
                
                if (triggerCard) {
                    triggerCard.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // After scrolling to card, open the modal and highlight footnote
                    setTimeout(() => {
                        if (typeof CaseStudyGlobes !== 'undefined') {
                            CaseStudyGlobes.openModal(modalIndex);
                            
                            setTimeout(() => {
                                const modalText = document.querySelector('.modal-text');
                                if (modalText) {
                                    const modalFootnote = modalText.querySelector(`a[href="#ref-${refNum}"]`);
                                    if (modalFootnote) {
                                        const supElement = modalFootnote.closest('sup') || modalFootnote;
                                        supElement.classList.add('footnote-highlight');
                                        setTimeout(() => {
                                            supElement.classList.remove('footnote-highlight');
                                        }, 2000);
                                    }
                                }
                            }, 400);
                        }
                    }, 600);
                }
                
                refItem.classList.remove('has-return');
                lastClickedFootnote = null;
                return;
            }
            
            // Footnote is in main document
            const footnoteElement = document.getElementById(footnoteId);
            
            if (footnoteElement) {
                e.preventDefault();
                
                footnoteElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                footnoteElement.classList.add('footnote-highlight');
                setTimeout(() => {
                    footnoteElement.classList.remove('footnote-highlight');
                }, 2000);
                
                refItem.classList.remove('has-return');
                lastClickedFootnote = null;
            }
        });
        
        refItem.setAttribute('title', 'Click to go to footnote in text');
    });
    
    // --- STEP 4: Add keyboard accessibility for references ---
    referenceItems.forEach((refItem) => {
        refItem.setAttribute('tabindex', '0');
        refItem.setAttribute('role', 'button');
        refItem.setAttribute('aria-label', 'Click to go to footnote in text');
        
        refItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                refItem.click();
            }
        });
    });
    
    // --- STEP 5: Handle footnotes inside modals via event delegation ---
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a.ref-link');
        if (!link) return;
        
        const modal = link.closest('.case-study-modal');
        if (!modal || !modal.classList.contains('active')) return;
        
        const href = link.getAttribute('href');
        if (href && href.startsWith('#ref-')) {
            e.preventDefault();
            e.stopPropagation();
            
            const refNum = href.replace('#ref-', '');
            
            if (typeof CaseStudyGlobes !== 'undefined') {
                CaseStudyGlobes.closeModal();
            }
            
            const targetRef = document.getElementById(`ref-${refNum}`);
            if (targetRef) {
                document.querySelectorAll('.reference-item.has-return').forEach(item => {
                    item.classList.remove('has-return');
                });
                targetRef.classList.add('has-return');
                
                setTimeout(() => {
                    targetRef.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            }
        }
    });
    
    console.log('[Footnotes] Bidirectional navigation initialized');

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