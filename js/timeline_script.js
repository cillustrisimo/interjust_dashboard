document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const eventsContainer = document.getElementById('events-container');
    const labelsContainer = document.getElementById('labels-container');
    const timelineContainer = document.querySelector('.timeline-container');
    const progressIndicator = document.querySelector('.progress-indicator');

    // =====================================================
    // 1. FETCH AND PROCESS DATA
    // =====================================================
    
    fetch('./data/timeline_data.json')
        .then(response => response.json())
        .then(data => {
            initTimeline(data);
        })
        .catch(error => {
            console.error('[Timeline] Error loading timeline data:', error);
            eventsContainer.innerHTML = '<p style="color:white; text-align:center;">Error loading data.</p>';
        });

    function initTimeline(data) {
        if (progressIndicator && timelineContainer) {
            timelineContainer.appendChild(progressIndicator);
        }

        // Add timeline title header INSIDE the sticky container so it scrolls with timeline
        createTimelineTitle();

        const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Group data into CLUSTERS by Year
        const clusters = [];
        let currentCluster = null;

        sortedData.forEach(item => {
            const itemYear = item.year || new Date(item.date).getFullYear().toString();
            if (!currentCluster || currentCluster.year !== itemYear) {
                currentCluster = { year: itemYear, items: [] };
                clusters.push(currentCluster);
            }
            currentCluster.items.push(item);
        });

        const totalClusters = clusters.length;
        const startTime = new Date(sortedData[0].date).getTime();
        const endTime = new Date(sortedData[sortedData.length - 1].date).getTime();
        const totalDuration = endTime - startTime;

        clusters.forEach((cluster, clusterIndex) => {
            const clusterDate = new Date(cluster.items[0].date).getTime();

            // Calculate Position
            let linearPct = totalDuration > 0 ? (clusterDate - startTime) / totalDuration : 0;
            const sequencePct = clusterIndex / (totalClusters - 1);
            const weightedPos = (sequencePct * 0.85) + (linearPct * 0.15);
            const finalPercent = weightedPos * 100;

            // Determine Position (Above/Below) based on Cluster Index
            const positionClass = clusterIndex % 2 === 0 ? 'above' : 'below';

            // --- RENDER LOGIC ---
            
            if (cluster.items.length === 1) {
                // CASE A: SINGLE EVENT
                const item = cluster.items[0];
                
                const staggerPattern = ['len-med', 'len-long', 'len-short']; 
                const lengthClass = staggerPattern[clusterIndex % staggerPattern.length];

                const contentHtml = generateCardHtml(item);

                const eventEl = document.createElement('div');
                eventEl.classList.add('timeline-event');
                eventEl.dataset.position = finalPercent;
                
                eventEl.innerHTML = `
                    <div class="event-marker"></div>
                    <div class="cluster-stem ${positionClass} ${lengthClass}"></div>
                    <div class="event-content standalone-card ${positionClass} ${lengthClass} card-collapsed">
                        ${contentHtml}
                    </div>
                `;
                eventsContainer.appendChild(eventEl);
            } else {
                // CASE B: MULTI-EVENT CLUSTER
                const clusterEl = document.createElement('div');
                clusterEl.classList.add('timeline-event', 'cluster-wrapper'); 
                clusterEl.dataset.position = finalPercent;
                
                let branchesHtml = '';
                cluster.items.forEach((item, index) => {
                    const contentHtml = generateCardHtml(item);
                    const staggerPattern = ['len-short', 'len-long', 'len-med'];
                    const lengthClass = staggerPattern[index % staggerPattern.length];

                    branchesHtml += `
                        <div class="branch-node" data-branch-index="${index}">
                            <div class="event-content ${lengthClass} card-collapsed" data-branch-index="${index}">
                                ${contentHtml}
                            </div>
                        </div>
                    `;
                });

                clusterEl.innerHTML = `
                    <div class="event-marker"></div>
                    <div class="cluster-stem ${positionClass}"></div>
                    <div class="cluster-branches ${positionClass}">
                        ${branchesHtml}
                    </div>
                `;
                eventsContainer.appendChild(clusterEl);
            }

            // Render Year Label
            if (cluster.year) {
                const labelEl = document.createElement('span');
                labelEl.classList.add('year-label');
                labelEl.dataset.position = finalPercent;
                labelEl.textContent = cluster.year;
                labelsContainer.appendChild(labelEl);
            }
        });

        // Create modal container
        createModalContainer();
        
        setupAnimations();
        setupInteractivity();
        setupScrollHeader(); 
    }

    // =====================================================
    // TIMELINE TITLE (Desktop Only - Inside Sticky Container)
    // =====================================================
    
    function createTimelineTitle() {
        // Insert title inside the timeline-container (which is sticky)
        // This ensures the title scrolls/sticks with the timeline
        const container = document.querySelector('.timeline-container');
        if (!container) return;
        
        // Check if title already exists
        if (container.querySelector('.timeline-title-header')) return;
        
        const titleHeader = document.createElement('div');
        titleHeader.className = 'timeline-title-header';
        titleHeader.innerHTML = '<h2>The Development of Universal Jurisdiction</h2>';
        
        // Insert as first child of the sticky container
        container.insertBefore(titleHeader, container.firstChild);
    }

    function generateCardHtml(item) {
        let mediaHtml = '';
        if (item.isVideo && item.videoSrc) {
            mediaHtml = `<div class="event-media"><iframe src="${item.videoSrc}" allowfullscreen loading="lazy"></iframe></div>`;
        } else if (item.hasImage && item.imgSrc) {
            mediaHtml = `<div class="event-media"><img src="${item.imgSrc}" alt="${item.title}" loading="lazy"></div>`;
        }
        const extraHtml = item.extra ? `<div class="event-extra">${item.extra}</div>` : '';

        return `
            ${mediaHtml}
            <span class="event-date">${item.date}</span>
            <h3 class="event-title">${item.title}</h3>
            <button class="read-more-btn">Read More</button>
            <div class="card-hidden-content">
                <p class="event-description">${item.text}</p>
                ${extraHtml}
            </div>
        `;
    }

    // =====================================================
    // MODAL SYSTEM
    // =====================================================
    
    function createModalContainer() {
        const modal = document.createElement('div');
        modal.id = 'card-modal-overlay';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-card-container">
                <div class="modal-card">
                    <button class="modal-close-btn">&times;</button>
                    <div class="modal-card-content"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        
        // Close when clicking anywhere outside the modal card (on the container)
        modal.querySelector('.modal-card-container').addEventListener('click', (e) => {
            // Only close if the click target is the container itself, not the card
            if (e.target.classList.contains('modal-card-container')) {
                closeModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }
    
    let currentExpandedCard = null;
    let currentStemElement = null;
    let currentBranchNode = null;
    
    function openModal(card) {
        const modal = document.getElementById('card-modal-overlay');
        const modalContent = modal.querySelector('.modal-card-content');
        const modalCard = modal.querySelector('.modal-card');
        
        // Store reference to original card
        currentExpandedCard = card;
        
        // Get the card's starting position for animation
        const cardRect = card.getBoundingClientRect();
        
        // Clone the card content (expanded version)
        const cardInner = card.innerHTML;
        
        // Build modal content with hidden content visible
        modalContent.innerHTML = cardInner;
        
        // Make hidden content visible in modal
        const hiddenContent = modalContent.querySelector('.card-hidden-content');
        if (hiddenContent) {
            hiddenContent.style.display = 'block';
            hiddenContent.style.opacity = '1';
        }
        
        // Change button text
        const btn = modalContent.querySelector('.read-more-btn');
        if (btn) btn.style.display = 'none'; // Hide the read more button in modal
        
        // Mark original card as expanded (for styling)
        card.classList.add('expanded');
        
        // Handle stem hiding
        const isStandalone = card.classList.contains('standalone-card');
        const parentWrapper = card.closest('.timeline-event');
        
        if (isStandalone) {
            // Hide the main stem for standalone cards
            currentStemElement = parentWrapper.querySelector('.cluster-stem');
            if (currentStemElement) {
                currentStemElement.classList.add('stem-hidden');
            }
        } else {
            // For branch cards, hide only this branch's connector
            currentBranchNode = card.closest('.branch-node');
            if (currentBranchNode) {
                currentBranchNode.classList.add('branch-hidden');
            }
        }
        
        // Set initial position for animation (from card position)
        modalCard.style.setProperty('--start-x', `${cardRect.left + cardRect.width/2}px`);
        modalCard.style.setProperty('--start-y', `${cardRect.top + cardRect.height/2}px`);
        modalCard.style.setProperty('--start-width', `${cardRect.width}px`);
        modalCard.style.setProperty('--start-height', `${cardRect.height}px`);
        
        // Show modal with animation
        modal.classList.add('active');
        
        // Trigger animation
        requestAnimationFrame(() => {
            modalCard.classList.add('animate-in');
        });
    }
    
    function closeModal() {
        const modal = document.getElementById('card-modal-overlay');
        const modalCard = modal.querySelector('.modal-card');
        
        if (!modal.classList.contains('active')) return;
        
        // Start close animation
        modalCard.classList.remove('animate-in');
        modalCard.classList.add('animate-out');
        
        // Restore stem visibility
        if (currentStemElement) {
            currentStemElement.classList.remove('stem-hidden');
            currentStemElement = null;
        }
        
        if (currentBranchNode) {
            currentBranchNode.classList.remove('branch-hidden');
            currentBranchNode = null;
        }
        
        // Remove expanded class from original card
        if (currentExpandedCard) {
            currentExpandedCard.classList.remove('expanded');
            currentExpandedCard = null;
        }
        
        // Wait for animation to complete
        setTimeout(() => {
            modal.classList.remove('active');
            modalCard.classList.remove('animate-out');
            modal.querySelector('.modal-card-content').innerHTML = '';
        }, 300);
    }

    // =====================================================
    // INTERACTIVITY 
    // =====================================================
    function setupInteractivity() {
        const eventsContainer = document.getElementById('events-container');
        
        eventsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more-btn')) {
                const card = e.target.closest('.event-content');
                
                // Close any existing modal first
                closeModal();
                
                // Small delay to ensure clean state
                setTimeout(() => {
                    openModal(card);
                }, 50);
            }
        });
    }

    // =====================================================
    // ANIMATIONS
    // =====================================================

    function positionElement(element, position) {
        const leftPadding = 5; 
        const availableWidth = 85; 
        const leftPercent = leftPadding + (position / 100) * availableWidth;
        element.style.left = `${leftPercent}vw`;
    }

    function setupAnimations() {
        const timelineSection = document.querySelector('.timeline-section');
        const timelineLine = document.querySelector('.timeline-line');
        const timelineEvents = document.querySelectorAll('.timeline-event');
        const yearLabels = document.querySelectorAll('.year-label');
        const progressFill = document.querySelector('.progress-fill');

        // Initial CSS positioning (Left %)
        timelineEvents.forEach(el => positionElement(el, parseFloat(el.dataset.position)));
        yearLabels.forEach(el => positionElement(el, parseFloat(el.dataset.position)));

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: timelineSection,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onUpdate: (self) => {
                    if(progressFill) progressFill.style.width = `${self.progress * 100}%`;
                }
            }
        });

        // 1. Draw the main line
        tl.to(timelineLine, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'none' }, 0);

        const paddingOffset = 0.05; 
        const widthFactor = 0.85;   
        
        // 2. Animate Years FIRST
        yearLabels.forEach(label => {
            const position = parseFloat(label.dataset.position);
            const startTime = paddingOffset + (position / 100) * widthFactor;
            tl.to(label, { opacity: 1, duration: 0.05 }, startTime);
        });

        // 3. Animate Events/Branches SECOND
        timelineEvents.forEach(event => {
            const position = parseFloat(event.dataset.position);
            const branchDelay = 0.05; 
            const startTime = paddingOffset + (position / 100) * widthFactor + branchDelay;
            tl.to(event, { opacity: 1, duration: 0.05, ease: 'power1.out' }, startTime);
        });

        setupIntroAnimation();
        setupConclusionAnimation();
    }

    function setupIntroAnimation() {
        const introTl = gsap.timeline();
        introTl.from('.main-title', { opacity: 0, y: 50, duration: 1 })
               .from('.intro-text', { opacity: 0, y: 30, duration: 0.8 }, '-=0.5')
               .from('.scroll-indicator', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');
    }

    function setupConclusionAnimation() {
        gsap.from('.conclusion-content', {
            scrollTrigger: {
                trigger: '.conclusion-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0, y: 50, duration: 1
        });
    }

    function setupScrollHeader() {
        ScrollTrigger.create({
            trigger: ".intro-section",
            start: "bottom top", 
            onEnter: () => document.body.classList.add("scrolled-past-intro"),
            onLeaveBack: () => document.body.classList.remove("scrolled-past-intro")
        });
    }
});
