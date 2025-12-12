/**
 * CASE_STUDY_GLOBES.JS
 * ==================================================
* This controls the interactive case-study globes
 * - Floating globe icons next to narrative blocks
 * - Modal popup with case study details
 * - Location pin on Europe-focused globe
 * - Smooth animations and hover effects
 * ==================================================
 */

var CaseStudyGlobes = {
    
    caseStudies: [
        {
            id: 'petrovsky',
            title: 'Russian Mercenary Commander Yan Petrovsky Prosecuted in Finland for War Crimes Committed in Eastern Ukraine',
            country: 'Finland',
            location: 'Helsinki, Finland',
            pinPosition: { x: 62, y: 28 },
            position: 'right',
            content: '<p>Yan Petrovsky is a Russian national and co-founder and former commander of Rusich, a far-right mercenary unit linked to the Wagner Group.<sup><a href="#ref-21" class="ref-link">[21]</a></sup> In September 2014, Rusich mercenaries under Petrovsky\'s command took part in an ambush in Luhansk, eastern Ukraine that left 22 Ukrainian soldiers dead and four others injured.<sup><a href="#ref-22" class="ref-link">[22]</a></sup> In 2023, Petrovsky, then living under the alias Voislav Torden, circumvented a Schengen Area entry ban and travelled to Finland, where he obtained a one-year residence permit based on family ties.<sup><a href="#ref-23" class="ref-link">[23]</a></sup> The Finnish Border Guard arrested Petrovsky during a security check at Helsinki Airport in July 2023 and ascertained his real identity through database checks.<sup><a href="#ref-24" class="ref-link">[24]</a></sup> Finland\'s National Bureau of Investigation led a ten-month investigation into Petrovsky\'s alleged involvement in war crimes in eastern Ukraine, in close cooperation with Ukrainian authorities, beginning in December 2023.<sup><a href="#ref-25" class="ref-link">[25]</a></sup> The Helsinki District Court convicted Petrovsky of war crimes in March 2025.<sup><a href="#ref-26" class="ref-link">[26]</a></sup> Petrovsky\'s conviction is the first worldwide under the principle of universal jurisdiction for war crimes committed in Ukraine.<sup><a href="#ref-27" class="ref-link">[27]</a></sup></p>'
        },
        {
            id: 'jumailly',
            title: 'Former ISIS Member Taha al-Jumailly Prosecuted in Germany for Genocide, Crimes against Humanity, and War Crimes Committed Against Yazidi Women in Iraq',
            country: 'Germany',
            location: 'Frankfurt, Germany',
            pinPosition: { x: 48, y: 48 },
            position: 'left',
            content: '<p>Taha al-Jumailly is an Iraqi national and former ISIS member who committed genocide, crimes against humanity, and war crimes through his enslavement and abuse of a Yazidi woman and her daughter.<sup><a href="#ref-28" class="ref-link">[28]</a></sup> Along with his wife, Jennifer Wenisch, a German national who was later convicted of crimes against humanity and war crimes, al-Jumailly held the Yazidi woman and her daughter in inhuman conditions at his home in Fallujah during the summer of 2015.<sup><a href="#ref-29" class="ref-link">[29]</a></sup> The German Federal Court of Justice issued an arrest warrant for al-Jumailly in April 2019, based on a structural investigation into crimes committed against the Yazidi by ISIS in Syria and Iraq that German authorities had opened in 2014.<sup><a href="#ref-30" class="ref-link">[30]</a></sup> Greek authorities arrested al-Jumailly based on the European Arrest Warrant in May 2019, and extradited him to Germany in October.<sup><a href="#ref-31" class="ref-link">[31]</a></sup> The Higher Regional Court of Frankfurt am Main convicted al-Jumailly of genocide, crimes against humanity, and war crimes and sentenced him to life imprisonment in November 2021.<sup><a href="#ref-32" class="ref-link">[32]</a></sup> Al-Jumailly\'s genocide conviction was the first worldwide of an ISIS member.<sup><a href="#ref-33" class="ref-link">[33]</a></sup></p>'
        },
        {
            id: 'sonko',
            title: 'Former Gambian Interior Minister Ousmon Sonko Prosecuted in Switzerland for Crimes Committed in The Gambia During the Regime of Yahya Jammeh',
            country: 'Switzerland',
            location: 'Bellinzona, Switzerland',
            pinPosition: { x: 44, y: 54 },
            position: 'right',
            content: '<p>Ousmon Sonko is a Gambian national who committed crimes against humanity in several roles under the regime of Yahya Jammeh, who led The Gambia from 1996-2017.<sup><a href="#ref-35" class="ref-link">[35]</a></sup> Sonko left the Gambia in September 2016.<sup><a href="#ref-36" class="ref-link">[36]</a></sup> Trial International filed a criminal complaint with prosecutors in Switzerland in January 2017, after it became aware of Sonko\'s presence in country.<sup><a href="#ref-37" class="ref-link">[37]</a></sup> Switzerland\'s Office of the Attorney General then opened what would become a six-year investigation which involved multiple trips to The Gambia to collect evidence and hear witness testimony.<sup><a href="#ref-38" class="ref-link">[38]</a></sup> In 2021, The Gambia\'s Truth, Reconciliation, and Reparations Commission recommended that Sonko be prosecuted for killings and acts of torture and sexual violence committed between 2000 and 2016.<sup><a href="#ref-39" class="ref-link">[39]</a></sup> The Federal Criminal Court of Bellinzona convicted Sonko of crimes against humanity and sentenced him to 20 years\' imprisonment in May 2024.<sup><a href="#ref-40" class="ref-link">[40]</a></sup> Having previously served as The Gambia\'s Minister of the Interior, Sonko is to date the highest-ranking State official prosecuted by a European court under the principle of universal jurisdiction.<sup><a href="#ref-41" class="ref-link">[41]</a></sup></p>'
        },
        {
            id: 'assad',
            title: 'Assad Regime Officials Prosecuted in Absentia in France for the Arrest, Detention, and Disappearance of Dual French and Syrian Nationals in Damascus',
            country: 'France',
            location: 'Paris, France',
            pinPosition: { x: 36, y: 52 },
            position: 'left',
            content: '<p>Ali Mamlouk, Jamil Hassan, and Abdel Salam Mahmoud are all Syrian nationals and former high-ranking officials in the Assad regime who were connected to the November 2013 arrest, detention, and disappearance of dual French and Syrian nationals Patrick and Mazen Dabbagh in Damascus.<sup><a href="#ref-47" class="ref-link">[47]</a></sup> Obeida Dabbagh, a family member of the disappeared, filed a complaint at the Paris Tribunal with the International Federation for Human Rights and one of its French affiliates in October 2016.<sup><a href="#ref-48" class="ref-link">[48]</a></sup> Judges from France\'s specialized unit for the prosecution of international crimes issued international arrest warrants for the three suspects in October 2018, and they completed their investigation in March 2022.<sup><a href="#ref-49" class="ref-link">[49]</a></sup> The Paris Criminal Court convicted Mamlouk, Hassan, and Mahmoud in absentia for complicity in crimes against humanity and war crimes and sentenced them to life imprisonment in May 2024.<sup><a href="#ref-50" class="ref-link">[50]</a></sup> In its ruling, the Court held that functional immunities for State officials do not apply in serious international crimes cases.<sup><a href="#ref-51" class="ref-link">[51]</a></sup></p>'
        },
        {
            id: 'alemu',
            title: 'Dual Ethiopian and Dutch National Eshetu Alemu Prosecuted in the Netherlands for International Crimes Committed in Ethiopia',
            country: 'The Netherlands',
            location: 'The Hague, Netherlands',
            pinPosition: { x: 44, y: 42 },
            position: 'right',
            content: '<p>Eshetu Alemu is a dual Ethiopian and Dutch national who committed war crimes as a member of the communist military regime, the "Derg", that ruled Ethiopia from 1974-91.<sup><a href="#ref-42" class="ref-link">[42]</a></sup> Alemu settled in the Netherlands in 1990, a year prior to the Derg\'s collapse, and obtained Dutch citizenship in 1998.<sup><a href="#ref-43" class="ref-link">[43]</a></sup> Also in 1998, a Dutch magazine published an investigative piece linking Alemu to war crimes in Ethiopia.<sup><a href="#ref-44" class="ref-link">[44]</a></sup> Based on the magazine article, the Dutch National Investigative Service\'s International Crimes Unit opened what would become a four-year investigation into Alemu in 2009 that involved cooperation with Ethiopia\'s Special Prosecutor\'s Office.<sup><a href="#ref-45" class="ref-link">[45]</a></sup> Dutch police arrested Alemu in September 2015, and The Hague District Court convicted him of war crimes and sentenced him to life imprisonment in December 2017.<sup><a href="#ref-46" class="ref-link">[46]</a></sup> Alemu\'s case is to date the only prosecution abroad for international crimes committed in Ethiopia.</p>'
        }
    ],
    
    svgPaths: {
        main: './images/icons_objects/main_globe_transparent.svg',
        euro: './images/icons_objects/euro_globe_transparent.svg'
    },
    
    currentModal: null,
    
    init: function() {
        console.log('[CaseStudyGlobes] Initializing...');
        
        this.createModalOverlay();
        this.createModalContainer();
        
        var oldCaseStudyBlocks = document.querySelectorAll('.case-study-block');
        console.log('[CaseStudyGlobes] Found', oldCaseStudyBlocks.length, 'old case study blocks');
        
        var self = this;
        oldCaseStudyBlocks.forEach(function(oldBlock, index) {
            if (index < self.caseStudies.length) {
                var narrativeBlock = self.findPrecedingNarrativeBlock(oldBlock);
                if (narrativeBlock) {
                    self.transformNarrativeBlock(narrativeBlock, self.caseStudies[index], index);
                    console.log('[CaseStudyGlobes] Attached globe for:', self.caseStudies[index].id);
                } else {
                    console.warn('[CaseStudyGlobes] No narrative block found for:', self.caseStudies[index].id);
                }
            }
        });
        
        this.setupEventListeners();
        
        console.log('[CaseStudyGlobes] Initialization complete');
    },
    
    findPrecedingNarrativeBlock: function(caseStudyBlock) {
        var sibling = caseStudyBlock.previousElementSibling;
        
        while (sibling) {
            if ((sibling.classList.contains('narrative-block') || 
                 sibling.classList.contains('narrative-block-lower')) && 
                !sibling.classList.contains('has-case-study')) {
                return sibling;
            }
            
            sibling = sibling.previousElementSibling;
        }
        
        return null;
    },
    
    createModalOverlay: function() {
        var overlay = document.createElement('div');
        overlay.className = 'case-study-modal-overlay';
        overlay.id = 'case-study-overlay';
        document.body.appendChild(overlay);
    },
    
    createModalContainer: function() {
        var modal = document.createElement('div');
        modal.className = 'case-study-modal';
        modal.id = 'case-study-modal';
        modal.innerHTML = [
            '<div class="modal-header">',
            '    <div class="modal-location">',
            '        <svg viewBox="0 0 12 12"><path d="M6 0C3.8 0 2 1.8 2 4c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4zm0 5.5c-.8 0-1.5-.7-1.5-1.5S5.2 2.5 6 2.5 7.5 3.2 7.5 4 6.8 5.5 6 5.5z"/></svg>',
            '        <span class="modal-location-text"></span>',
            '    </div>',
            '    <button class="modal-close-btn" aria-label="Close">&times;</button>',
            '</div>',
            '<div class="modal-content">',
            '    <h3 class="modal-title"></h3>',
            '    <div class="modal-narrative">',
            '        <div class="modal-globe">',
            '            <img src="' + this.svgPaths.euro + '" alt="Globe">',
            '            <svg class="modal-globe-pin" viewBox="0 0 100 100"></svg>',
            '        </div>',
            '        <div class="modal-text"></div>',
            '    </div>',
            '</div>'
        ].join('\n');
        document.body.appendChild(modal);
    },
    
    transformNarrativeBlock: function(block, caseStudy, index) {
        block.classList.add('has-case-study');
        block.classList.add('globe-' + caseStudy.position);
        
        var existingContent = block.innerHTML;
        
        block.innerHTML = [
            '<div class="narrative-content">' + existingContent + '</div>',
            '<div class="globe-case-study-trigger" data-case-study-index="' + index + '">',
            '    <div class="globe-wrapper">',
            '        <div class="globe-button" style="--float-delay: ' + (index * 0.5) + 's">',
            '            <img src="' + this.svgPaths.main + '" alt="Case Study Globe">',
            '        </div>',
            '    </div>',
            '    <div class="globe-country-label">Case Study</div>',
            '</div>'
        ].join('\n');
    },
    
    setupEventListeners: function() {
        var self = this;
        
        document.addEventListener('click', function(e) {
            var trigger = e.target.closest('.globe-case-study-trigger');
            if (trigger) {
                var index = parseInt(trigger.getAttribute('data-case-study-index'), 10);
                self.openModal(index);
            }
        });
        
        document.addEventListener('mouseenter', function(e) {
            var wrapper = e.target.closest('.globe-wrapper');
            if (wrapper) {
                var img = wrapper.querySelector('.globe-button img');
                if (img) {
                    if (img._completionTimeout) {
                        clearTimeout(img._completionTimeout);
                        img._completionTimeout = null;
                    }
                    img.classList.remove('completing-spin');
                    img.style.animation = '';
                    img.style.transform = '';
                    void img.offsetWidth;
                    img.classList.add('spinning');
                }
            }
        }, true);
        
        document.addEventListener('mouseleave', function(e) {
            var wrapper = e.target.closest('.globe-wrapper');
            if (wrapper && !e.relatedTarget?.closest('.globe-wrapper')) {
                var img = wrapper.querySelector('.globe-button img');
                if (img && img.classList.contains('spinning')) {
                    self.completeGlobeRotation(img);
                }
            }
        }, true);
        
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-close-btn')) {
                self.closeModal();
            }
        });
        
        var overlay = document.getElementById('case-study-overlay');
        if (overlay) {
            overlay.addEventListener('click', function() {
                self.closeModal();
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && self.currentModal !== null) {
                self.closeModal();
            }
        });
    },
    
    completeGlobeRotation: function(img) {
        if (img._completionTimeout) {
            clearTimeout(img._completionTimeout);
        }
        
        img.classList.remove('spinning');
        img.style.animation = 'none';
        void img.offsetWidth;
        img.style.animation = 'globeSpin 1.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards';
        img.classList.add('completing-spin');
        
        img._completionTimeout = setTimeout(function() {
            img.classList.remove('completing-spin');
            img.style.animation = '';
            img.style.transform = 'rotateY(0deg)';
            img._completionTimeout = null;
        }, 1550);
    },
    
    openModal: function(index) {
        var caseStudy = this.caseStudies[index];
        if (!caseStudy) return;
        
        this.currentModal = index;
        
        var modal = document.getElementById('case-study-modal');
        var overlay = document.getElementById('case-study-overlay');
        
        modal.querySelector('.modal-location-text').textContent = caseStudy.location;
        modal.querySelector('.modal-title').textContent = caseStudy.title;
        modal.querySelector('.modal-text').innerHTML = caseStudy.content;
        
        this.updateGlobePin(caseStudy.pinPosition, caseStudy.id);
        
        overlay.classList.add('active');
        modal.classList.add('active');
        
        document.body.style.overflow = 'hidden';
    },
    
    closeModal: function() {
        var modal = document.getElementById('case-study-modal');
        var overlay = document.getElementById('case-study-overlay');
        
        overlay.classList.remove('active');
        modal.classList.remove('active');
        
        document.body.style.overflow = '';
        
        this.currentModal = null;
    },
    
    updateGlobePin: function(pinPosition, id) {
        var pinSvg = document.querySelector('.modal-globe-pin');
        if (!pinSvg) return;
        
        pinSvg.innerHTML = [
            '<defs>',
            '    <filter id="pinGlow-' + id + '">',
            '        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.5"/>',
            '        <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#3182CE" flood-opacity="0.6"/>',
            '    </filter>',
            '</defs>',
            '<g class="pin-animated" filter="url(#pinGlow-' + id + ')">',
            '    <path transform="translate(' + (pinPosition.x - 6) + ', ' + (pinPosition.y - 18) + ')" d="M6 0 C2.7 0 0 2.7 0 6 C0 10.5 6 16.5 6 16.5 C6 16.5 12 10.5 12 6 C12 2.7 9.3 0 6 0 Z" fill="#4A9EE8" stroke="#1E40AF" stroke-width="0.8"/>',
            '    <circle transform="translate(' + (pinPosition.x - 6) + ', ' + (pinPosition.y - 18) + ')" cx="6" cy="6" r="2.5" fill="white"/>',
            '</g>'
        ].join('\n');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        CaseStudyGlobes.init();
    });
} else {
    CaseStudyGlobes.init();
}
