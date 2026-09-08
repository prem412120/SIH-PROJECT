tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        navy: {
                            50: '#F0F4FA',
                            100: '#D9E3F3',
                            200: '#B3C8E7',
                            300: '#84A7D7',
                            400: '#4D7EC1',
                            500: '#255BA5',
                            600: '#1B4786',
                            700: '#143667',
                            800: '#0F2548',
                            900: '#0B1B3D',
                            950: '#060F24'
                        },
                        amberAccent: {
                            400: '#FBBF24',
                            500: '#F59E0B',
                            600: '#D97706',
                            700: '#B45309'
                        },
                        warmOrange: {
                            50: '#FDF6EE',
                            100: '#FBEBD7',
                            200: '#F7D4AB',
                            300: '#F2BC7E',
                            400: '#EEA050',
                            500: '#E67E22',
                            600: '#D35400',
                            700: '#AC4300',
                            800: '#873402',
                            900: '#6E2B04',
                            950: '#3D1400'
                        }
                    }
                }
            }
        }

// Safe HTML escaping utility
        function escapeHtml(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // Global App State
        const AppState = {
            activeView: 'home',
            source: 'Delhi',
            destination: 'Manali',
            get origin() { return this.source; },
            set origin(val) { this.source = val; },
            stops: ['Chandigarh (Comfort & Fuel)', 'Bilaspur (Lake View)'],
            direction: 'oneway',
            members: 2,
            purpose: 'leisure',
            days: 4,
            nights: 3,
            mode: 'car',
            budget: 16000,
            selectedRouteIndex: 0,
            selectedPlaces: ['solang-valley', 'hadimba-temple', 'atal-tunnel', 'vashisht-baths'],
            activePlaceCategory: 'all',
            activeHotelCategory: 'all',
            hotelSearchQuery: '',
            selectedHotel: null,
            selectedRoomId: null,
            selectedTransitClass: 0,
            selectedTransitTicketIndex: 0,
            selectedTransitTicketPrice: null,
            selectedTransitTicketName: '',
            selectedTransitClassName: '',
            userExplicitHotel: false,
            vehicles: [
                { plate: 'DL 01 AB 8842', fuel: 'Petrol' }
            ],
            taxiType: 'fixed',
            authMode: 'signup',
            userLoggedIn: false,
            userName: '',
            selectedPaymentMethod: 'upi',
            appliedPromo: null,
            discountAmount: 0,
            isPaymentProcessing: false,
            paymentCompleted: false,
            bookingId: null,
            escrowTxnId: null,
            checkinDate: '2026-09-12',
            checkoutDate: '2026-09-15'
        };

        // Initialize App on DOM Load
        window.addEventListener('DOMContentLoaded', () => {
            setTravelMode(AppState.mode);
            renderStops();
            updateBudgetCalculations();
            renderTransitDetails();
            renderVehicles();
            renderRoutes();
            renderSelectedRouteDetails();
            renderPlaces();
            updateSelectedPlacesTray();
            renderHotels();
            updateHotelsTripHeader();
            populatePaymentPage();
            
            initContainerTextFlip();
            initDirectionAwareHover();
            initCard3DGlare();
            initCanvasReveal();
            initAmbientBackgroundParticles();
            initFloatingDock();
            initPlaceholdersAndVanishInput();
            initCardSpotlight();

            // Bind Direct Click Listeners to ensure 100% reliability
            const planBtn = document.getElementById('btn-hero-plan');
            if (planBtn) {
                planBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchPage('questions');
                });
            }
            const quickBtn = document.getElementById('btn-hero-quick-access');
            if (quickBtn) {
                quickBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openQuickAccessModal();
                });
            }

            // Global Escape Key Listener for Modals
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                    closeAllModals();
                }
            });

            // Backdrop click to dismiss modals
            document.querySelectorAll('.modal-backdrop').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeAllModals();
                    }
                });
            });
        });

        // -------------------------------------------------------------
        // NAVIGATION CONTROLLER & HISTORY STACK (Reliable Step Back)
        // -------------------------------------------------------------
        const navigationHistory = [];

        function switchPage(pageId, isBack = false) {
            closeAllModals();
            if (!isBack && AppState.activeView && AppState.activeView !== pageId) {
                navigationHistory.push(AppState.activeView);
            }

            document.querySelectorAll('.app-page').forEach(page => {
                page.classList.remove('active');
            });
            const target = document.getElementById(`view-${pageId}`);
            if (target) {
                target.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                AppState.activeView = pageId;
                updateDockActiveItem(pageId);

                // Auto-refresh dynamic sections upon entering views
                if (pageId === 'car') {
                    renderRoutes();
                    renderSelectedRouteDetails();
                } else if (pageId === 'places') {
                    renderPlaces();
                    updateSelectedPlacesTray();
                } else if (pageId === 'hotels') {
                    renderHotels();
                    updateHotelsTripHeader();
                } else if (pageId === 'navigation-view') {
                    syncNavigationView();
                } else if (pageId === 'payment') {
                    populatePaymentPage();
                } else if (pageId === 'fuel-finder') {
                    initFuelFinder();
                } else if (pageId === 'restaurants') {
                    initRestaurants();
                } else if (pageId === 'taxi-booking') {
                    initTaxiBookingPage();
                }
            }
        }

        function goBack() {
            while (navigationHistory.length > 0) {
                const prev = navigationHistory.pop();
                if (prev && prev !== AppState.activeView && document.getElementById(`view-${prev}`)) {
                    switchPage(prev, true);
                    return;
                }
            }
            // Smart fallback if stack is empty (e.g. direct entry or refreshed)
            const fallbackMap = {
                'questions': 'home',
                'car': 'questions',
                'transit': 'questions',
                'places': AppState.mode === 'car' ? 'car' : 'transit',
                'hotels': 'places',
                'payment': 'hotels',
                'navigation-view': 'payment',
                'fuel-finder': 'home',
                'restaurants': 'home',
                'taxi-booking': 'home'
            };
            const fallback = fallbackMap[AppState.activeView] || 'home';
            switchPage(fallback, true);
        }

        function updateDockActiveItem(pageId) {
            document.querySelectorAll('.dock-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-dock') === pageId) {
                    item.classList.add('active');
                }
            });
        }

        // Dedicated Simulated Asynchronous Action Loader
        function triggerLoader(callback, duration = 500, statusText = 'Processing optimal routes & verification...') {
            const loader = document.getElementById('sarv-global-loader');
            const status = document.getElementById('loader-status-text');
            if (status) status.innerText = statusText;
            
            loader.classList.remove('hidden');
            setTimeout(() => {
                loader.classList.add('hidden');
                if (callback) callback();
            }, duration);
        }

        // Home to Trip Questions prefill
        function startTripWithDestination(src, dest, purpose = 'leisure') {
            document.getElementById('trip-source').value = src;
            document.getElementById('trip-destination').value = dest;
            AppState.source = src;
            AppState.destination = dest;
            setTripPurpose(purpose);
            switchPage('questions');
        }

        // -------------------------------------------------------------
        // EFFECT: 3D Card Effect (Perspective Tilt & Dynamic Glare)
        // -------------------------------------------------------------
        function initCard3DGlare() {
            // Event delegation so dynamic hotel and place cards automatically have 3D tilt
            document.addEventListener('mousemove', (e) => {
                const card = e.target.closest('.card-3d-interactive');
                if (!card) return;
                // Exclude payment summary, tables, and non-interactive list rows
                if (card.closest('#view-payment') || card.closest('table')) return;

                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const pctX = (x / rect.width) * 100;
                const pctY = (y / rect.height) * 100;

                card.style.setProperty('--mouse-x', `${pctX.toFixed(1)}%`);
                card.style.setProperty('--mouse-y', `${pctY.toFixed(1)}%`);

                // Subtle perspective tilt: max ~6-8 deg
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (((y - centerY) / centerY) * -6.5).toFixed(2);
                const rotateY = (((x - centerX) / centerX) * 6.5).toFixed(2);

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            document.addEventListener('mouseout', (e) => {
                const card = e.target.closest('.card-3d-interactive');
                if (!card) return;
                if (!card.contains(e.relatedTarget)) {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                    card.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    setTimeout(() => {
                        if (card) card.style.transition = '';
                    }, 450);
                }
            });
        }

        // -------------------------------------------------------------
        // EFFECT: Canvas Reveal Effect (Hero Banner Glowing Dot Matrix)
        // -------------------------------------------------------------
        function initCanvasReveal() {
            const canvas = document.getElementById('hero-reveal-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext ? canvas.getContext('2d') : null;
            if (!ctx) return;
            let width, height;
            let mouse = { x: -1000, y: -1000 };

            function resize() {
                const parent = canvas.parentElement;
                if (!parent) return;
                width = canvas.width = parent.offsetWidth || 800;
                height = canvas.height = parent.offsetHeight || 400;
            }
            resize();
            window.addEventListener('resize', resize);

            const heroBanner = (canvas.closest && canvas.closest('.relative')) || canvas.parentElement;
            if (heroBanner && heroBanner.addEventListener) {
                heroBanner.addEventListener('mousemove', (e) => {
                    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
                    mouse.x = e.clientX - rect.left;
                    mouse.y = e.clientY - rect.top;
                });
                heroBanner.addEventListener('mouseleave', () => {
                    mouse.x = -1000;
                    mouse.y = -1000;
                });
            }

            let frame = 0;
            function draw() {
                if (AppState.activeView !== 'home') {
                    requestAnimationFrame(draw);
                    return;
                }
                frame++;
                ctx.clearRect(0, 0, width, height);
                const spacing = 28;

                for (let x = spacing; x < width; x += spacing) {
                    for (let y = spacing; y < height; y += spacing) {
                        const dx = mouse.x - x;
                        const dy = mouse.y - y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const maxDist = 170;

                        if (dist < maxDist) {
                            const proximityFactor = 1 - (dist / maxDist);
                            const dynamicAlpha = proximityFactor * 0.78;
                            const size = 1.2 + (proximityFactor * 2.2);

                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(245, 158, 11, ${dynamicAlpha})`;
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                            ctx.fill();
                        }
                    }
                }
                requestAnimationFrame(draw);
            }
            draw();
        }

        // -------------------------------------------------------------
        // DYNAMIC AMBIENT BACKGROUND PARTICLES & CONSTELLATION NETWORK
        // -------------------------------------------------------------
        function initAmbientBackgroundParticles() {
            const canvas = document.getElementById('sarv-ambient-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext ? canvas.getContext('2d') : null;
            if (!ctx) return;
            let w, h;
            let particles = [];

            function resize() {
                w = canvas.width = window.innerWidth;
                h = canvas.height = window.innerHeight;
            }
            resize();
            window.addEventListener('resize', resize);

            const count = Math.min(45, Math.floor(window.innerWidth / 30));
            const colors = ['rgba(245, 158, 11, 0.45)', 'rgba(230, 126, 34, 0.4)', 'rgba(37, 91, 165, 0.35)', 'rgba(16, 185, 129, 0.35)'];

            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.45,
                    vy: (Math.random() - 0.5) * 0.45,
                    radius: Math.random() * 2 + 1.2,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }

            function render() {
                ctx.clearRect(0, 0, w, h);

                // Draw connections
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 120) {
                            ctx.strokeStyle = `rgba(203, 213, 225, ${(1 - dist / 120) * 0.28})`;
                            ctx.lineWidth = 0.8;
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }

                // Draw particles
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0) p.x = w;
                    if (p.x > w) p.x = 0;
                    if (p.y < 0) p.y = h;
                    if (p.y > h) p.y = 0;

                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                });

                requestAnimationFrame(render);
            }
            render();
        }

        // -------------------------------------------------------------
        // EFFECT: Container Text Flip (Headline 3D Words with Pause on Hover)
        // -------------------------------------------------------------
        function initContainerTextFlip() {
            const words = [
                'Himalayan Valleys',
                'Golden Desert Forts',
                'Backwater Villages',
                'Spiritual Varanasi Ghats',
                'Coastal Konkan Roads'
            ];
            let currentIndex = 0;
            const container = document.getElementById('hero-flip-container');
            if (!container) return;

            let isPaused = false;
            container.addEventListener('mouseenter', () => { isPaused = true; });
            container.addEventListener('mouseleave', () => { isPaused = false; });

            setInterval(() => {
                if (isPaused) return; // Pause on hover as requested
                if (AppState.activeView !== 'home') return;

                const currentWord = container.querySelector('.flip-word.flip-in') || container.querySelector('.flip-word');
                if (!currentWord) return;

                currentIndex = (currentIndex + 1) % words.length;
                const nextWord = document.createElement('span');
                nextWord.className = 'flip-word flip-next';
                nextWord.innerText = words[currentIndex];
                container.appendChild(nextWord);

                currentWord.classList.remove('flip-in');
                currentWord.classList.add('flip-out');

                requestAnimationFrame(() => {
                    nextWord.classList.remove('flip-next');
                    nextWord.classList.add('flip-in');
                    setTimeout(() => {
                        if (currentWord && currentWord.parentElement) {
                            currentWord.remove();
                        }
                    }, 550);
                });

            }, 2500); // Rotate every ~2.5s
        }

        // -------------------------------------------------------------
        // EFFECT: Floating Dock (macOS Style Distance-Based Magnification)
        // -------------------------------------------------------------
        function initFloatingDock() {
            const dock = document.getElementById('sarv-floating-dock');
            if (!dock) return;

            const items = dock.querySelectorAll('.dock-item');
            const maxScale = 1.32;
            const maxDistance = 110;

            dock.addEventListener('mousemove', (e) => {
                const mouseX = e.clientX;

                items.forEach(item => {
                    const rect = item.getBoundingClientRect();
                    const itemCenter = rect.left + rect.width / 2;
                    const distance = Math.abs(mouseX - itemCenter);

                    if (distance < maxDistance) {
                        const factor = Math.cos((distance / maxDistance) * (Math.PI / 2));
                        const scale = 1 + (maxScale - 1) * factor;
                        const lift = -10 * factor;
                        item.style.transform = `translateY(${lift.toFixed(1)}px) scale(${scale.toFixed(3)})`;
                    } else {
                        item.style.transform = item.classList.contains('active') ? 'translateY(-4px) scale(1)' : 'translateY(0px) scale(1)';
                    }
                });
            });

            dock.addEventListener('mouseleave', () => {
                items.forEach(item => {
                    item.style.transform = item.classList.contains('active') ? 'translateY(-4px) scale(1)' : 'translateY(0px) scale(1)';
                });
            });
        }

        // -------------------------------------------------------------
        // EFFECT: Direction Aware Hover (Sliding Overlay on Hotel & Place Cards)
        // -------------------------------------------------------------
        function initDirectionAwareHover() {
            document.addEventListener('mouseover', (e) => {
                const card = e.target.closest('.direction-aware-card');
                if (!card || card.contains(e.relatedTarget)) return;

                const overlay = card.querySelector('.direction-aware-overlay');
                if (!overlay) return;

                const dir = getHoverDirection(e, card);
                card.classList.add('is-hovered');
                overlay.style.transition = 'none';

                if (dir === 0) overlay.style.transform = 'translateY(-100%)';      // Top
                else if (dir === 1) overlay.style.transform = 'translateX(100%)';  // Right
                else if (dir === 2) overlay.style.transform = 'translateY(100%)';  // Bottom
                else if (dir === 3) overlay.style.transform = 'translateX(-100%)'; // Left

                void overlay.offsetHeight; // Force reflow
                overlay.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
                overlay.style.transform = 'translate(0, 0)';
            });

            document.addEventListener('mouseout', (e) => {
                const card = e.target.closest('.direction-aware-card');
                if (!card || card.contains(e.relatedTarget)) return;

                const overlay = card.querySelector('.direction-aware-overlay');
                if (!overlay) return;

                const dir = getHoverDirection(e, card);
                overlay.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';

                if (dir === 0) overlay.style.transform = 'translateY(-100%)';
                else if (dir === 1) overlay.style.transform = 'translateX(100%)';
                else if (dir === 2) overlay.style.transform = 'translateY(100%)';
                else if (dir === 3) overlay.style.transform = 'translateX(-100%)';

                card.classList.remove('is-hovered');
            });
        }

        function getHoverDirection(e, el) {
            const rect = el.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const x = (e.clientX - rect.left - (w / 2)) * (w > h ? (h / w) : 1);
            const y = (e.clientY - rect.top - (h / 2)) * (h > w ? (w / h) : 1);
            return Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
        }

        // -------------------------------------------------------------
        // EFFECT: Placeholders And Vanish Input (Specific Search Fields)
        // -------------------------------------------------------------
        function initPlaceholdersAndVanishInput() {
            const configs = [
                {
                    id: 'custom-place-input',
                    placeholders: [
                        "Search place (e.g. Rohtang Pass, Bhrigu Lake)...",
                        "Try 'Naggar Castle & Art Gallery'...",
                        "Try 'Jogini Waterfalls & Pine Trail'...",
                        "Try 'Old Manali Bohemian Cafés'..."
                    ]
                },
                {
                    id: 'hotel-search-input',
                    placeholders: [
                        "Search hotels (e.g. Cedar, Chalet, Resort)...",
                        "Try 'Wooden Cottage with River View'...",
                        "Try 'Luxury Heritage Resort with Escrow'...",
                        "Try 'Workation Stays with High-Speed Wi-Fi'..."
                    ]
                }
            ];

            configs.forEach(cfg => {
                const input = document.getElementById(cfg.id);
                if (!input) return;

                let pIndex = 0;
                let isFocused = false;

                input.addEventListener('focus', () => { isFocused = true; });
                input.addEventListener('blur', () => { isFocused = false; });

                // Rotate placeholder text when field is empty and idle
                setInterval(() => {
                    if (isFocused || input.value.trim() !== '') return;
                    pIndex = (pIndex + 1) % cfg.placeholders.length;
                    input.placeholder = cfg.placeholders[pIndex];
                }, 3000);

                // Play particle dissolve vanish effect on Enter submission
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const val = input.value.trim();
                        if (val) {
                            playVanishDissolve(input);
                        }
                    }
                });
            });
        }

        function playVanishDissolve(input) {
            const parent = input.parentElement;
            if (!parent) return;

            const particleContainer = document.createElement('div');
            particleContainer.className = 'absolute inset-0 pointer-events-none overflow-hidden z-30';
            parent.appendChild(particleContainer);

            const colors = ['#F59E0B', '#E67E22', '#255BA5', '#10B981'];
            for (let i = 0; i < 16; i++) {
                const p = document.createElement('div');
                const size = Math.random() * 5 + 3;
                p.style.position = 'absolute';
                p.style.borderRadius = '50%';
                p.style.width = `${size}px`;
                p.style.height = `${size}px`;
                p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                p.style.left = `${Math.random() * 60 + 20}%`;
                p.style.top = '50%';
                p.style.transition = 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
                p.style.opacity = '1';
                particleContainer.appendChild(p);

                const tx = (Math.random() - 0.5) * 70;
                const ty = -(Math.random() * 40 + 10);

                requestAnimationFrame(() => {
                    p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
                    p.style.opacity = '0';
                });
            }

            setTimeout(() => {
                particleContainer.remove();
            }, 600);
        }

        // -------------------------------------------------------------
        /* EFFECT: Card Spotlight Effect (Aceternity-style Subtle Glow) */
        // Chosen for Quick Access cards to add rich depth without visual clutter
        // -------------------------------------------------------------
        function initCardSpotlight() {
            document.querySelectorAll('.card-3d-interactive').forEach(card => {
                card.classList.add('spotlight-card');
            });
        }

        // -------------------------------------------------------------
        // MODAL MANAGEMENT (Body Scroll Lock & Unified Dismiss)
        // -------------------------------------------------------------
        function setModalBodyScroll(isLocked) {
            if (typeof document === 'undefined' || !document.body) return;
            if (isLocked) {
                document.body.classList.add('overflow-hidden');
            } else {
                const anyModalOpen = Array.from(document.querySelectorAll('.modal-backdrop')).some(m => !m.classList.contains('hidden') && m.classList.contains('flex'));
                if (!anyModalOpen) {
                    document.body.classList.remove('overflow-hidden');
                }
            }
        }

        function closeAllModals() {
            if (typeof closeHotelDetail === 'function') closeHotelDetail();
            if (typeof closeQuickAccessModal === 'function') closeQuickAccessModal();
            if (typeof closeFeedbackModal === 'function') closeFeedbackModal();
            if (typeof closeSignupModal === 'function') closeSignupModal();
            if (typeof closePaymentSuccessModal === 'function') closePaymentSuccessModal();
            if (typeof closeTaxiConfirmModal === 'function') closeTaxiConfirmModal();
            const modals = document.querySelectorAll('.modal-backdrop');
            modals.forEach(m => {
                m.classList.add('hidden');
                m.classList.remove('flex');
            });
            setModalBodyScroll(false);
        }

        // -------------------------------------------------------------
        // QUICK ACCESS MODAL & SHORTCUT TOOLS (Debugged & Reliable)
        // -------------------------------------------------------------
        function openQuickAccessModal() {
            const m = document.getElementById('modal-quick-access');
            if (m) {
                m.classList.remove('hidden');
                m.classList.add('flex');
                setModalBodyScroll(true);
            }
        }

        function closeQuickAccessModal() {
            const m = document.getElementById('modal-quick-access');
            if (m) {
                m.classList.add('hidden');
                m.classList.remove('flex');
            }
            setModalBodyScroll(false);
        }

        function toggleQuickAccessModal() {
            const m = document.getElementById('modal-quick-access');
            if (m && m.classList.contains('hidden')) {
                openQuickAccessModal();
            } else {
                closeQuickAccessModal();
            }
        }

        function openQuickTool(tool) {
            closeQuickAccessModal();

            if (tool === 'fuel') {
                initFuelFinder();
                switchPage('fuel-finder');
            } else if (tool === 'hotel') {
                switchPage('hotels');
            } else if (tool === 'restaurant') {
                initRestaurants();
                switchPage('restaurants');
            } else if (tool === 'navigation') {
                inspectSelectedRouteOnMap(0);
            } else if (tool === 'taxi') {
                initTaxiBookingPage();
                switchPage('taxi-booking');
            }
        }

        // -------------------------------------------------------------
        // SIGNUP & AUTH FORM LOGIC
        // -------------------------------------------------------------
        function openSignupModal() {
            const modal = document.getElementById('modal-signup');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setModalBodyScroll(true);
            }
        }

        function closeSignupModal() {
            const modal = document.getElementById('modal-signup');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            setModalBodyScroll(false);
        }

        /* EFFECT: Signup Form Polish (Sliding Tab Pill) */
        function toggleAuthMode(mode) {
            AppState.authMode = mode;
            const tabSignup = document.getElementById('tab-signup');
            const tabSignin = document.getElementById('tab-signin');
            const tabPill = document.getElementById('auth-tab-pill');
            const nameField = document.getElementById('field-auth-name');
            const tagsField = document.getElementById('field-auth-tags');
            const title = document.getElementById('auth-modal-title');
            const submitText = document.getElementById('auth-submit-btn-text');

            if (mode === 'signup') {
                if (tabPill) tabPill.style.transform = 'translateX(0)';
                if (tabSignup) tabSignup.className = 'py-2 rounded-xl text-navy-900 font-black relative z-10 transition-colors';
                if (tabSignin) tabSignin.className = 'py-2 rounded-xl text-slate-500 font-bold relative z-10 hover:text-navy-900 transition-colors';
                if (nameField) nameField.classList.remove('hidden');
                if (tagsField) tagsField.classList.remove('hidden');
                if (title) title.innerText = 'Join Sarvyatri Circle';
                if (submitText) submitText.innerText = 'Create Free Account';
            } else {
                if (tabPill) tabPill.style.transform = 'translateX(100%)';
                if (tabSignin) tabSignin.className = 'py-2 rounded-xl text-navy-900 font-black relative z-10 transition-colors';
                if (tabSignup) tabSignup.className = 'py-2 rounded-xl text-slate-500 font-bold relative z-10 hover:text-navy-900 transition-colors';
                if (nameField) nameField.classList.add('hidden');
                if (tagsField) tagsField.classList.add('hidden');
                if (title) title.innerText = 'Welcome Back to Sarvyatri';
                if (submitText) submitText.innerText = 'Sign In Securely';
            }
        }

        function togglePasswordVisibility() {
            const pwdInput = document.getElementById('auth-password-input');
            const toggleText = document.getElementById('pwd-toggle-text');
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                toggleText.innerText = 'Hide';
            } else {
                pwdInput.type = 'password';
                toggleText.innerText = 'Show';
            }
        }

        function togglePersonaChip(chip) {
            chip.classList.toggle('border-warmOrange-500');
            chip.classList.toggle('bg-amber-50');
            chip.classList.toggle('text-warmOrange-700');
        }

        function handleSignupSubmit(e) {
            e.preventDefault();
            const nameInput = document.getElementById('auth-name-input');
            const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Traveler';

            closeSignupModal();
            AppState.userLoggedIn = true;
            AppState.userName = name;
            showToast(`Welcome ${name}! Your Sarvyatri membership is active with ₹0 cancellation & escrow protection.`);
        }

        function socialLogin(provider) {
            closeSignupModal();
            AppState.userLoggedIn = true;
            AppState.userName = `${provider} Traveler`;
            showToast(`Logged in successfully via ${provider}!`);
        }

        // -------------------------------------------------------------
        // INTERMEDIATE STOPS & TRIP QUESTIONS
        // -------------------------------------------------------------
        function renderStops() {
            const container = document.getElementById('stops-container');
            container.innerHTML = '';

            AppState.stops.forEach((stop, index) => {
                const stopDiv = document.createElement('div');
                stopDiv.className = 'flex items-center gap-2 p-2 rounded-xl border border-slate-300 bg-slate-50';
                stopDiv.innerHTML = `
                    <span class="w-6 h-6 rounded-md bg-amber-100 text-warmOrange-600 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        ${index + 1}
                    </span>
                    <div class="gooey-wrapper flex-1">
                        <input type="text" value="${stop}" onchange="updateStop(${index}, this.value)" 
                            placeholder="Intermediate Stop Name (e.g. Agra, Jaipur)" 
                            class="gooey-input-field w-full font-bold text-xs text-navy-900 outline-none p-1">
                        <div class="gooey-blob-container"><div class="gooey-blob-1"></div><div class="gooey-blob-2"></div></div>
                    </div>
                    <button type="button" onclick="removeStop(${index})" aria-label="Remove stop" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                `;
                container.appendChild(stopDiv);
            });
        }

        function addStop() {
            AppState.stops.push('New In-Between Stop');
            renderStops();
            updateBudgetCalculations();
        }

        function updateStop(index, value) {
            AppState.stops[index] = value;
        }

        function removeStop(index) {
            AppState.stops.splice(index, 1);
            renderStops();
            updateBudgetCalculations();
        }

        function setTripDirection(dir) {
            AppState.direction = dir;
            const btnOneWay = document.getElementById('btn-dir-oneway');
            const btnRound = document.getElementById('btn-dir-roundtrip');
            if (dir === 'oneway') {
                btnOneWay.className = 'py-2.5 px-4 rounded-xl font-black text-xs border border-navy-900 bg-navy-900 text-white transition-all shadow-sm';
                btnRound.className = 'py-2.5 px-4 rounded-xl font-bold text-xs border border-slate-300 bg-white text-navy-900 hover:border-slate-400 transition-all shadow-sm';
            } else {
                btnRound.className = 'py-2.5 px-4 rounded-xl font-black text-xs border border-navy-900 bg-navy-900 text-white transition-all shadow-sm';
                btnOneWay.className = 'py-2.5 px-4 rounded-xl font-bold text-xs border border-slate-300 bg-white text-navy-900 hover:border-slate-400 transition-all shadow-sm';
            }
            updateBudgetCalculations();
        }

        function changeMembers(delta) {
            const slider = document.getElementById('members-slider');
            let val = parseInt(slider.value) + delta;
            if (val >= 1 && val <= 15) {
                slider.value = val;
                onMembersSliderChange(val);
            }
        }

        function onMembersSliderChange(val) {
            AppState.members = parseInt(val);
            const label = document.getElementById('members-count-display');
            if (label) label.innerText = `${val}`;
            const hotelMemLabel = document.getElementById('hotels-members-summary');
            if (hotelMemLabel) hotelMemLabel.innerText = `${val} Traveler${val > 1 ? 's' : ''}`;
            updateBudgetCalculations();
        }

        function onBudgetSliderChange(val) {
            AppState.budget = parseInt(val);
            AppState.selectedTransitTicketPrice = null;
            AppState.userExplicitHotel = false;
            AppState.selectedHotel = null;
            AppState.selectedRoomId = null;
            const label = document.getElementById('budget-val-label');
            if (label) label.innerText = `₹${parseInt(val).toLocaleString('en-IN')}`;
        }

        function toggleManualBudget(checked) {
            const wrap = document.getElementById('manual-budget-input-wrap');
            if (wrap) {
                if (checked) {
                    wrap.classList.remove('hidden');
                } else {
                    wrap.classList.add('hidden');
                    const slider = document.getElementById('budget-slider');
                    if (slider) onBudgetSliderChange(slider.value);
                }
            }
        }

        function onManualBudgetInput(val) {
            if (val && !isNaN(val)) {
                AppState.budget = parseInt(val);
                AppState.selectedTransitTicketPrice = null;
                AppState.userExplicitHotel = false;
                AppState.selectedHotel = null;
                AppState.selectedRoomId = null;
                const label = document.getElementById('budget-val-label');
                if (label) label.innerText = `₹${parseInt(val).toLocaleString('en-IN')} (Manual)`;
            }
        }

        function updateBudgetCalculations() {
            const basePerPerson = 2800;
            const stopCost = AppState.stops.length * 600;
            const multiplier = AppState.direction === 'roundtrip' ? 1.8 : 1.0;
            
            const minCalc = Math.round((basePerPerson * AppState.members + stopCost) * multiplier);
            const maxCalc = minCalc * 4;

            const slider = document.getElementById('budget-slider');
            if (slider) {
                slider.min = minCalc;
                slider.max = maxCalc;

                if (AppState.budget < minCalc || AppState.budget > maxCalc) {
                    AppState.budget = Math.round((minCalc + maxCalc) / 2.8);
                    AppState.selectedTransitTicketPrice = null;
                    AppState.userExplicitHotel = false;
                    AppState.selectedHotel = null;
                    AppState.selectedRoomId = null;
                    slider.value = AppState.budget;
                }
            }

            const minBound = document.getElementById('budget-min-bound');
            if (minBound) minBound.innerText = `Min: ₹${minCalc.toLocaleString('en-IN')}`;

            const maxBound = document.getElementById('budget-max-bound');
            if (maxBound) maxBound.innerText = `Max: ₹${maxCalc.toLocaleString('en-IN')}`;

            const valLabel = document.getElementById('budget-val-label');
            if (valLabel) valLabel.innerText = `₹${AppState.budget.toLocaleString('en-IN')}`;
        }

        function setTripPurpose(purpose) {
            AppState.purpose = purpose;
            ['leisure', 'adventure', 'religious', 'business'].forEach(p => {
                const btn = document.getElementById(`purpose-btn-${p}`);
                if (btn) {
                    if (p === purpose) {
                        btn.className = 'p-3 rounded-2xl border-2 border-warmOrange-500 bg-amber-50 text-navy-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm';
                    } else {
                        btn.className = 'p-3 rounded-2xl border border-slate-300 bg-white text-navy-900 font-bold text-xs flex items-center justify-center gap-2 hover:border-slate-400 transition-all shadow-sm';
                    }
                }
            });
        }

        function updateDuration(days, nights) {
            if (days !== null) AppState.days = parseInt(days);
            if (nights !== null) AppState.nights = parseInt(nights);
            const placesDurBadge = document.getElementById('places-trip-duration-badge');
            if (placesDurBadge) placesDurBadge.innerText = `${AppState.days} Days / ${AppState.nights} Nights`;
            const hotelDurSummary = document.getElementById('hotels-duration-summary');
            if (hotelDurSummary) hotelDurSummary.innerText = `${AppState.days}D / ${AppState.nights}N`;
        }

        function setTravelMode(mode) {
            AppState.mode = mode;
            AppState.selectedTransitClass = 0;
            AppState.selectedTransitTicketIndex = 0;
            AppState.selectedTransitTicketPrice = null;
            AppState.selectedTransitTicketName = '';
            AppState.selectedTransitClassName = '';
            ['car', 'bus', 'train', 'taxi'].forEach(m => {
                const btn = document.getElementById(`mode-btn-${m}`);
                if (btn) {
                    if (m === mode) {
                        btn.className = 'p-3 rounded-2xl border-2 border-warmOrange-500 bg-amber-50 text-navy-900 flex flex-col items-center gap-1.5 transition-all shadow-sm';
                    } else {
                        btn.className = 'p-3 rounded-2xl border border-slate-300 bg-white text-navy-900 flex flex-col items-center gap-1.5 hover:border-slate-400 transition-all shadow-sm';
                    }
                }
            });
            updateDockTransitIcon();
        }

        function updateDockTransitIcon() {
            const dockTransit = document.querySelector('[data-dock="car"], [data-dock="transit"]');
            if (!dockTransit) return;
            const tooltip = dockTransit.querySelector('.dock-tooltip');
            const icon = dockTransit.querySelector('i');
            if (AppState.mode === 'car') {
                dockTransit.setAttribute('data-dock', 'car');
                dockTransit.setAttribute('onclick', "switchPage('car')");
                if (tooltip) tooltip.innerText = 'Car Routes';
                if (icon) icon.className = 'fa-solid fa-car text-base';
            } else {
                dockTransit.setAttribute('data-dock', 'transit');
                dockTransit.setAttribute('onclick', "switchPage('transit')");
                const modeLabels = { bus: 'Bus Options', train: 'Train Schedules', taxi: 'Cab & Taxi' };
                const modeIcons = { bus: 'fa-solid fa-bus text-base', train: 'fa-solid fa-train text-base', taxi: 'fa-solid fa-taxi text-base' };
                if (tooltip) tooltip.innerText = modeLabels[AppState.mode] || 'Transit';
                if (icon) icon.className = modeIcons[AppState.mode] || 'fa-solid fa-bus text-base';
            }
        }

        function proceedFromQuestions() {
            triggerLoader(() => {
                if (AppState.mode === 'car') {
                    switchPage('car');
                } else {
                    renderTransitDetails();
                    switchPage('transit');
                }
            }, 400, 'Calculating sequenced stops and vehicle route...');
        }

        // -------------------------------------------------------------
        // VEHICLES MANAGER (Car Travelers)
        // -------------------------------------------------------------
        function renderVehicles() {
            const container = document.getElementById('vehicle-list-container');
            if (!container) return;
            container.innerHTML = '';

            AppState.vehicles.forEach((v, index) => {
                const div = document.createElement('div');
                div.className = 'p-3 rounded-2xl border border-slate-300 bg-slate-50 flex items-center justify-between gap-3';
                div.innerHTML = `
                    <div class="flex items-center gap-2.5 flex-1">
                        <span class="w-7 h-7 rounded-lg bg-navy-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            #${index + 1}
                        </span>
                        <div class="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 transition-all focus-within:border-warmOrange-500 focus-within:ring-2 focus-within:ring-warmOrange-500/20 shadow-sm">
                            <input type="text" value="${v.plate}" onchange="updateVehiclePlate(${index}, this.value)" 
                                placeholder="Registration Plate (e.g. MH 02 CD 4490)" 
                                class="w-full bg-transparent font-black text-xs text-navy-900 uppercase tracking-wider outline-none placeholder:text-slate-400 placeholder:normal-case placeholder:font-medium">
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <select onchange="updateVehicleFuel(${index}, this.value)" class="p-2 rounded-xl border border-slate-300 font-bold text-xs text-navy-900 bg-white outline-none focus:border-warmOrange-500 focus:ring-2 focus:ring-warmOrange-500/20 transition-all">
                            <option value="" disabled ${!v.fuel ? 'selected' : ''}>Select Fuel Type</option>
                            <option value="Petrol" ${v.fuel === 'Petrol' ? 'selected' : ''}>Petrol</option>
                            <option value="Diesel" ${v.fuel === 'Diesel' ? 'selected' : ''}>Diesel</option>
                            <option value="CNG" ${v.fuel === 'CNG' ? 'selected' : ''}>CNG</option>
                            <option value="Electric" ${v.fuel === 'Electric' ? 'selected' : ''}>EV</option>
                        </select>
                        ${AppState.vehicles.length > 1 ? `
                            <button type="button" onclick="removeVehiclePlate(${index})" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition-colors shadow-sm" title="Remove vehicle">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        ` : ''}
                    </div>
                `;
                container.appendChild(div);
            });
        }

        function addVehiclePlate() {
            AppState.vehicles.push({ plate: '', fuel: '' });
            renderVehicles();
        }

        function updateVehiclePlate(index, val) {
            AppState.vehicles[index].plate = val;
        }

        function updateVehicleFuel(index, val) {
            AppState.vehicles[index].fuel = val;
        }

        function removeVehiclePlate(index) {
            AppState.vehicles.splice(index, 1);
            renderVehicles();
        }

        // -------------------------------------------------------------
        // VISUAL ROUTE DATABASE & INTERACTIVE SELECTION (Car Travelers)
        // -------------------------------------------------------------
        const RoutesDatabase = [
            {
                id: 'route-1',
                badge: 'Fastest Route (Visual Path A)',
                badgeClass: 'bg-emerald-500 text-white',
                name: 'Scenic Foothills Corridor',
                tagline: 'Smooth 4-lane expressway transitioning into panoramic pine mountain climbs',
                distance: '536 km',
                time: '10h 30m',
                fuelTollCost: '₹4,200',
                elevation: '240m → 2,050m Altitude',
                roadQuality: '94% Smooth Asphalt Expressway',
                image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop',
                waypoints: [
                    { name: 'Delhi NCR Ring Gate', km: 'KM 0', note: 'Start Point' },
                    { name: 'Murthal Food Hub', km: 'KM 52', note: 'Breakfast & fuel' },
                    { name: 'Ambala Junction Bypass', km: 'KM 202', note: 'Expressway toll' },
                    { name: 'Bilaspur Lake Overlook', km: 'KM 362', note: 'Scenic lake overlook' },
                    { name: 'Mandi Foothills Gateway', km: 'KM 440', note: 'Valley entry point' },
                    { name: 'Kullu Pine & Apple Belt', km: 'KM 495', note: 'River stretch' },
                    { name: 'Manali Mall Road Hub', km: 'KM 536', note: 'Trip Destination' }
                ],
                fuelStations: [
                    { name: 'Indian Oil Swagat Oasis', km: 'KM 118', type: 'Petrol, Diesel, High-Speed EV Charger & Clean Restrooms', status: '24/7 Verified' },
                    { name: 'Bharat Petroleum Highway Smart Hub', km: 'KM 242', type: 'High-Pressure Green CNG Station & Diesel Pumps', status: '24/7 Verified' },
                    { name: 'HPCL Cedar Hillside Pitstop', km: 'KM 380', type: 'Petrol, Diesel, EV Fast Station & Food Court', status: '24/7 Verified' },
                    { name: 'Reliance Petro Gateway', km: 'KM 475', type: 'Ultra-Pure Petrol & Nitrogen Inflation Station', status: 'Open 24/7' }
                ],
                mealStops: [
                    { name: 'Sukhdev Dhaba & Tandoor', km: 'KM 52', highlight: 'Fresh White Butter Paranthas, Lassi & Kulhad Chai', rating: '4.8 ★ (18k Reviews)', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop' },
                    { name: 'Haveli Highway Heritage Court', km: 'KM 148', highlight: 'Authentic Mountain Thali & Clean Modern Facilities', rating: '4.7 ★ (11k Reviews)', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop' }
                ]
            },
            {
                id: 'route-2',
                badge: 'Scenic Riverway (Visual Path B)',
                badgeClass: 'bg-amber-500 text-navy-950',
                name: 'Riverside Valley Corridor',
                tagline: 'Winds along the turquoise Beas riverbanks with deep gorge views and suspension bridges',
                distance: '568 km',
                time: '11h 15m',
                fuelTollCost: '₹4,550',
                elevation: '240m → 1,980m Altitude',
                roadQuality: '89% High Quality Riverway',
                image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
                waypoints: [
                    { name: 'Delhi Outer Ring Start', km: 'KM 0', note: 'Start Point' },
                    { name: 'Panipat Green Flyover', km: 'KM 88', note: 'Smooth transit' },
                    { name: 'Chandigarh Garden Outskirts', km: 'KM 245', note: 'Comfort halt' },
                    { name: 'Sundernagar Lake Valley', km: 'KM 390', note: 'Canal reservoir' },
                    { name: 'Pandoh Dam Mountain Vista', km: 'KM 445', note: 'Photogenic cliff' },
                    { name: 'Aut Tunnel Beas Riverfront', km: 'KM 468', note: 'Breathtaking canyon' },
                    { name: 'Manali Rivergate Arrival', km: 'KM 568', note: 'Trip Destination' }
                ],
                fuelStations: [
                    { name: 'Shell Premium Express Fuel', km: 'KM 94', type: 'V-Power Petrol, Diesel & Deli2Go Express Café', status: '24/7 Verified' },
                    { name: 'Indian Oil Riverbend Superstation', km: 'KM 270', type: 'High-Flow Diesel, Petrol & Multi-Car EV Bay', status: '24/7 Verified' },
                    { name: 'HPCL Beas Riverside Stop', km: 'KM 430', type: 'Petrol, Diesel, Mountain Emergency Air & Water', status: '24/7 Verified' }
                ],
                mealStops: [
                    { name: 'Puran Singh Ka Mashhoor Dhaba', km: 'KM 205', highlight: 'Famous Clay-Oven Rotis & Mountain Gravy', rating: '4.7 ★ (8.4k Reviews)', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop' },
                    { name: 'Riverview Pine Canopy Café', km: 'KM 452', highlight: 'Fresh Mountain Trout, Siddu & Herbal Cinnamon Tea', rating: '4.9 ★ (4.2k Reviews)', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop' }
                ]
            },
            {
                id: 'route-3',
                badge: 'Express Bypass (Visual Path C)',
                badgeClass: 'bg-sky-500 text-white',
                name: 'Express Green Bypass',
                tagline: 'Newly surfaced 4-lane bypass tunnels avoiding urban choke points with minimal mountain gradient',
                distance: '512 km',
                time: '9h 45m',
                fuelTollCost: '₹4,780',
                elevation: '240m → 2,050m Altitude',
                roadQuality: '98% Newly Surfaced Expressway',
                image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop',
                waypoints: [
                    { name: 'Delhi Expressway Gate', km: 'KM 0', note: 'Fast exit' },
                    { name: 'Sonipat Elevated Transit', km: 'KM 36', note: 'Zero signal flyover' },
                    { name: 'Kurukshetra Smart Bypass', km: 'KM 165', note: 'Speed corridor' },
                    { name: 'Kiratpur Mountain Express Cut', km: 'KM 290', note: 'Modern 4-lane bypass' },
                    { name: 'Swarghat Elevated Viaduct', km: 'KM 340', note: 'Bypasses steep ghat hairpin' },
                    { name: 'Takoli High-Speed Bypass', km: 'KM 460', note: 'Direct tunnel connection' },
                    { name: 'Manali South Portal Gateway', km: 'KM 512', note: 'Trip Destination' }
                ],
                fuelStations: [
                    { name: 'Jio-bp Mobility Station', km: 'KM 68', type: 'Wild Bean Café, Fast CCS2 EV Chargers, Petrol & Diesel', status: '24/7 Verified' },
                    { name: 'Indian Oil Eco-Corridor Hub', km: 'KM 215', type: 'High-Capacity Green CNG & Petrol Station', status: '24/7 Verified' },
                    { name: 'Bharat Petroleum Highspeed Terminal', km: 'KM 325', type: 'Mountain High-Grade Petrol & Quick Service Bay', status: '24/7 Verified' },
                    { name: 'Tata Power EV Mega Charger', km: 'KM 435', type: '60 kW CCS2 Dual-Gun Rapid EV Station', status: '24/7 Verified' }
                ],
                mealStops: [
                    { name: 'Express Oasis Highway Court', km: 'KM 110', highlight: 'Multi-Cuisine Food Court, Subway, Costa Coffee & Clean Washrooms', rating: '4.8 ★ (9.6k Reviews)', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop' },
                    { name: 'Himachali Rasoi Highway Dhaba', km: 'KM 355', highlight: 'Authentic Mountain Thali, Kadi Chawal & Honey Ginger Drink', rating: '4.8 ★ (5.1k Reviews)', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop' }
                ]
            }
        ];

        function renderRoutes() {
            const container = document.getElementById('routes-preview-grid');
            if (!container) return;
            container.innerHTML = '';

            RoutesDatabase.forEach((route, idx) => {
                const isSelected = (idx === AppState.selectedRouteIndex);
                const card = document.createElement('div');
                card.className = `card-3d-interactive sarv-card rounded-2xl overflow-hidden transition-all group border-2 flex flex-col justify-between cursor-pointer ${
                    isSelected ? 'border-warmOrange-500 ring-2 ring-warmOrange-400 bg-amber-50/40 shadow-lg' : 'border-slate-300 hover:border-slate-400 bg-white shadow-sm'
                }`;
                card.onclick = () => selectRoute(idx);

                card.innerHTML = `
                    <div class="card-3d-glare"></div>
                    <div>
                        <div class="relative h-44 bg-navy-950 overflow-hidden">
                            <img src="${route.image}" alt="${route.name}" class="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500">
                            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent"></div>
                            <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                <span class="px-2.5 py-1 rounded-full ${route.badgeClass} text-[10px] font-black uppercase shadow">
                                    ${route.badge}
                                </span>
                                ${isSelected ? `
                                    <span class="px-2.5 py-0.5 rounded-full bg-warmOrange-500 text-white text-[10px] font-black shadow flex items-center gap-1">
                                        <i class="fa-solid fa-check"></i> Active
                                    </span>
                                ` : ''}
                            </div>
                            <div class="absolute bottom-2.5 left-3 right-3 text-white">
                                <span class="text-xs font-black text-amber-400 block">${route.distance} • Est. ${route.time}</span>
                                <span class="text-sm font-black leading-tight">${route.name}</span>
                            </div>
                        </div>
                        <div class="p-3.5 space-y-2 text-xs">
                            <p class="text-slate-600 text-[11px] font-medium line-clamp-2 leading-relaxed">${route.tagline}</p>
                            <div class="flex items-center justify-between font-bold text-[11px] text-navy-900 pt-1 border-t border-slate-200">
                                <span class="text-slate-500">Est. Fuel & Toll:</span>
                                <span class="font-black text-navy-950">${route.fuelTollCost}</span>
                            </div>
                            <div class="flex items-center justify-between font-bold text-[11px] text-navy-900">
                                <span class="text-slate-500">Elevation:</span>
                                <span class="text-slate-700">${route.elevation}</span>
                            </div>
                        </div>
                    </div>
                    <div class="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                        <button type="button" onclick="event.stopPropagation(); selectRoute(${idx})" class="w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                            isSelected ? 'bg-warmOrange-500 text-white' : 'border border-slate-300 bg-white hover:bg-slate-100 text-navy-900'
                        }">
                            <i class="fa-solid ${isSelected ? 'fa-circle-check' : 'fa-circle'} text-[11px]"></i>
                            <span>${isSelected ? 'Selected Active Route ✓' : 'Select This Route'}</span>
                        </button>
                        <button type="button" onclick="event.stopPropagation(); inspectSelectedRouteOnMap(${idx})" class="w-full py-1 text-[11px] font-extrabold text-warmOrange-600 hover:text-warmOrange-700 flex items-center justify-center gap-1">
                            <span>Open Route on Live Map</span>
                            <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function selectRoute(idx) {
            AppState.selectedRouteIndex = idx;
            const r = RoutesDatabase[idx];
            renderRoutes();
            renderSelectedRouteDetails();
            updateHotelsTripHeader();

            const badge = document.getElementById('places-route-badge');
            if (badge) badge.innerText = `${r.name} (${r.distance})`;

            showToast(`Selected Route: ${r.name} (${r.distance} • ${r.time})! Fuel and stop information updated below.`, 'fa-route');
        }

        function inspectSelectedRouteOnMap(idx) {
            AppState.selectedRouteIndex = idx;
            switchPage('navigation-view');
        }

        function renderSelectedRouteDetails() {
            const container = document.getElementById('selected-route-details-panel');
            if (!container) return;
            const r = RoutesDatabase[AppState.selectedRouteIndex] || RoutesDatabase[0];

            container.innerHTML = `
                <!-- Selected Route Header Banner -->
                <div class="sarv-card p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 text-white shadow-md border border-navy-800 space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-warmOrange-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                                <i class="fa-solid fa-map-location-dot"></i>
                            </span>
                            <div>
                                <span class="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Currently Selected Active Route</span>
                                <h4 class="text-sm sm:text-base font-black text-white">${r.name}</h4>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40">
                                ${r.distance}
                            </span>
                            <span class="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40">
                                Est. ${r.time}
                            </span>
                            <span class="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 font-bold">
                                Fuel & Tolls: ${r.fuelTollCost}
                            </span>
                        </div>
                    </div>
                    <div class="text-xs text-slate-300 flex flex-wrap items-center gap-4">
                        <span><i class="fa-solid fa-road text-amber-400 mr-1.5"></i><strong>Surface:</strong> ${r.roadQuality}</span>
                        <span><i class="fa-solid fa-mountain text-amber-400 mr-1.5"></i><strong>Gradient:</strong> ${r.elevation}</span>
                        <span><i class="fa-solid fa-gas-pump text-amber-400 mr-1.5"></i><strong>Fuel Stations:</strong> ${r.fuelStations.length} Verified Pitstops</span>
                    </div>
                </div>

                <!-- Key Waypoints Sequence for Selected Route -->
                <div class="sarv-card p-4 sm:p-5 rounded-3xl space-y-3 border border-slate-300 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-timeline text-warmOrange-500"></i>
                            <h4 class="text-xs font-black text-navy-900 uppercase tracking-wider">Sequential Highway Stops & Waypoints for ${r.name}</h4>
                        </div>
                        <span class="text-[10px] font-bold text-slate-500 uppercase">${r.waypoints.length} Points Along Corridor</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
                        ${r.waypoints.map((wp, i) => `
                            <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-1">
                                <span class="px-1.5 py-0.5 rounded bg-navy-900 text-white text-[9px] font-black w-fit">${wp.km}</span>
                                <span class="font-extrabold text-navy-900 text-[11px] leading-tight block">${wp.name}</span>
                                <span class="text-[9px] text-slate-500 font-medium block">${wp.note}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Fuel, CNG & EV Stations Along Selected Route -->
                <div class="sarv-card p-5 sm:p-6 rounded-3xl space-y-4 border border-slate-300 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-gas-pump text-warmOrange-500 text-base"></i>
                            <div>
                                <h3 class="text-sm font-black text-navy-900 uppercase tracking-wider">Fuel, CNG & EV Charging Stations Along ${r.name}</h3>
                                <p class="text-[11px] text-slate-600 font-medium">Verified operating 24/7 with restrooms and emergency tire air</p>
                            </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            ${r.fuelStations.length} Stations Found
                        </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        ${r.fuelStations.map(f => `
                            <div class="p-3 rounded-2xl border border-slate-300 bg-slate-50/90 flex flex-col justify-between space-y-1.5">
                                <div>
                                    <div class="flex items-center justify-between gap-1 mb-1">
                                        <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">${f.km}</span>
                                        <span class="text-[9px] font-extrabold text-emerald-700">${f.status}</span>
                                    </div>
                                    <h4 class="font-black text-navy-900 text-xs">${f.name}</h4>
                                </div>
                                <p class="text-slate-600 text-[11px] leading-tight font-medium">${f.type}</p>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Opt-in Highway Meal Stops & Dhabas -->
                    <div class="pt-3 border-t border-slate-200 space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" id="toggle-meal-stops" onchange="toggleMealStops(this.checked)" class="w-4 h-4 rounded text-warmOrange-500 cursor-pointer">
                                <label for="toggle-meal-stops" class="text-xs font-black text-navy-900 cursor-pointer">
                                    Include Highway Dining & Dhaba Pitstops for ${r.name}
                                </label>
                            </div>
                            <span class="text-[10px] font-bold text-slate-500 uppercase">Optional Opt-In</span>
                        </div>

                        <!-- Meal stops dynamically populated for selected route -->
                        <div id="meal-stops-container" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            ${r.mealStops.map(m => `
                                <div class="p-3.5 rounded-2xl border border-amber-300 bg-amber-50/80 flex items-center gap-3 shadow-sm">
                                    <img src="${m.image}" alt="${m.name}" class="w-16 h-16 rounded-xl object-cover shrink-0 border border-amber-200">
                                    <div class="text-xs space-y-0.5">
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="font-black text-navy-900 block">${m.name}</span>
                                            <span class="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-black">${m.km}</span>
                                        </div>
                                        <span class="text-[11px] text-slate-700 block font-medium">${m.highlight}</span>
                                        <span class="text-[10px] font-black text-amber-700 block">${m.rating}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        function toggleMealStops(checked) {
            const container = document.getElementById('meal-stops-container');
            if (container) {
                if (checked) {
                    container.classList.remove('hidden');
                } else {
                    container.classList.add('hidden');
                }
            }
        }

        // -------------------------------------------------------------
        // PUBLIC TRANSIT & TAXI DETAILS
        // -------------------------------------------------------------
        function renderTransitDetails() {
            const title = document.getElementById('transit-page-title');
            const classesGrid = document.getElementById('transit-classes-grid');
            const ticketContainer = document.getElementById('ticket-options-container');
            const taxiWrap = document.getElementById('taxi-options-wrap');

            if (!classesGrid || !ticketContainer) return;

            const targetBudget = Number(AppState.budget) || 16000;
            const numMembers = Math.max(1, Number(AppState.members) || 1);
            const travelBudget = Math.round(targetBudget * 0.32);

            let classes = [];
            let operators = [];
            let isTaxi = (AppState.mode === 'taxi');

            if (AppState.mode === 'bus') {
                if (title) title.innerText = 'Bus Travelers Portal';
                if (taxiWrap) taxiWrap.classList.add('hidden');
                classes = [
                    { id: 'seater', name: 'AC Seater (2+2)', multiplier: 1.0 },
                    { id: 'sleeper', name: 'AC Sleeper (Multi-Axle)', multiplier: 1.35 },
                    { id: 'nonac', name: 'Non-AC Sleeper', multiplier: 0.80 },
                    { id: 'volvo', name: 'Volvo Luxury Gold', multiplier: 1.60 }
                ];
                operators = [
                    { name: 'Himachal Express Volvo', time: '08:30 PM - 07:00 AM (10h 30m)', factor: 1.0, rating: '4.8 ★' },
                    { name: 'Zingbus Royal Diamond', time: '09:15 PM - 07:45 AM (10h 30m)', factor: 1.15, rating: '4.9 ★' },
                    { name: 'HRTC Himsuta Scania', time: '07:00 PM - 06:00 AM (11h 00m)', factor: 0.92, rating: '4.7 ★' }
                ];
            } else if (AppState.mode === 'train') {
                if (title) title.innerText = 'Train Travelers Portal';
                if (taxiWrap) taxiWrap.classList.add('hidden');
                classes = [
                    { id: 'sl', name: 'Sleeper (SL)', multiplier: 0.55 },
                    { id: '3a', name: '3rd AC (3A)', multiplier: 1.0 },
                    { id: '2a', name: '2nd AC (2A)', multiplier: 1.45 },
                    { id: '1a', name: 'First AC (1A)', multiplier: 2.10 }
                ];
                operators = [
                    { name: 'Vande Bharat Express (22447)', time: '05:50 AM - 11:05 AM (5h 15m)', factor: 1.05, rating: '4.9 ★' },
                    { name: 'Kalka Shatabdi Special (12005)', time: '05:15 PM - 09:20 PM (4h 05m)', factor: 0.95, rating: '4.8 ★' },
                    { name: 'Paschim SF Express (12925)', time: '11:05 AM - 04:00 PM (4h 55m)', factor: 0.75, rating: '4.6 ★' }
                ];
            } else if (AppState.mode === 'taxi') {
                if (title) title.innerText = 'Direct Taxi & Cab Portal';
                if (taxiWrap) taxiWrap.classList.remove('hidden');
                classes = [
                    { id: 'sedan', name: 'Sedan (Dzire / Etios)', multiplier: 1.0 },
                    { id: 'suv', name: 'Prime SUV (Innova Crysta)', multiplier: 1.45 },
                    { id: 'tempo', name: 'Tempo Traveler (12-Seater)', multiplier: 2.10 },
                    { id: 'ev', name: 'Luxury EV (Ioniq / EV6)', multiplier: 1.65 }
                ];
                operators = [
                    { name: 'Sarvyatri Fleet Verified Mountain Cab', time: 'Instant Dispatch or Scheduled Pickup', factor: 1.0, rating: '4.95 ★' },
                    { name: 'Crysta Comfort Mountain Carrier', time: 'Experienced Mountain Chauffeur', factor: 1.18, rating: '4.98 ★' },
                    { name: 'GreenHimalaya Electric Swift', time: 'Eco-Friendly Silent Cabin', factor: 1.08, rating: '4.88 ★' }
                ];
            }

            if (AppState.selectedTransitClass >= classes.length) {
                AppState.selectedTransitClass = 0;
            }
            const currentClass = classes[AppState.selectedTransitClass] || classes[0];

            // Render Class Buttons with active state styling & click handlers
            classesGrid.innerHTML = '';
            classes.forEach((c, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.id = `transit-class-btn-${idx}`;
                btn.onclick = () => selectTransitClass(idx);
                const isActive = (idx === AppState.selectedTransitClass);
                btn.className = `p-3 rounded-2xl border text-left text-xs font-black transition-all ${
                    isActive
                        ? 'border-2 border-warmOrange-500 bg-amber-50 text-navy-900 shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`;
                btn.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span>${c.name}</span>
                        <i class="${isActive ? 'fa-solid fa-circle-check text-warmOrange-500' : 'fa-regular fa-circle text-slate-300'}"></i>
                    </div>
                `;
                classesGrid.appendChild(btn);
            });

            // Calculate Ticket Prices scaled to AppState.budget and selected class
            const tickets = operators.map(op => {
                let perPersonPrice = 0;
                let totalFare = 0;

                if (isTaxi) {
                    const baseCab = Math.max(2000, Math.round(travelBudget / 50) * 50);
                    totalFare = Math.round((baseCab * currentClass.multiplier * op.factor) / 50) * 50;
                    perPersonPrice = Math.round(totalFare / numMembers);
                } else {
                    const perPersonBudget = Math.round(travelBudget / numMembers);
                    const baseSeat = Math.max(350, Math.round(perPersonBudget / 10) * 10);
                    perPersonPrice = Math.max(250, Math.round((baseSeat * currentClass.multiplier * op.factor) / 10) * 10);
                    totalFare = perPersonPrice * numMembers;
                }

                return {
                    operator: op.name,
                    time: op.time,
                    rating: op.rating,
                    perPersonPrice,
                    totalFare
                };
            });

            if (AppState.selectedTransitTicketIndex >= tickets.length) {
                AppState.selectedTransitTicketIndex = 0;
            }

            // Render Ticket Cards with selection and budget comparison badges
            ticketContainer.innerHTML = '';
            tickets.forEach((t, idx) => {
                const isSelected = (idx === AppState.selectedTransitTicketIndex);
                const div = document.createElement('div');
                div.className = `p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                        ? 'border-2 border-warmOrange-500 bg-amber-50/70 shadow-sm'
                        : 'border border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400'
                }`;
                div.onclick = () => selectTransitTicket(idx);

                let badgeHtml = '';
                if (t.totalFare <= travelBudget) {
                    badgeHtml = '<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Budget Friendly</span>';
                } else if (t.totalFare <= targetBudget) {
                    badgeHtml = '<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">Higher Share</span>';
                } else {
                    badgeHtml = '<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">Exceeds Budget</span>';
                }

                const priceSubtext = isTaxi
                    ? `Total vehicle fare (${numMembers} passenger${numMembers > 1 ? 's' : ''})`
                    : `₹${t.perPersonPrice.toLocaleString('en-IN')}/seat • Total for ${numMembers} member${numMembers > 1 ? 's' : ''}`;

                div.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <i class="${isSelected ? 'fa-solid fa-circle-check text-warmOrange-500' : 'fa-regular fa-circle text-slate-300'}"></i>
                                <h4 class="font-black text-xs text-navy-900">${t.operator}</h4>
                                <span class="text-[10px] font-extrabold text-amber-600">${t.rating}</span>
                                ${badgeHtml}
                            </div>
                            <span class="text-[11px] text-slate-600 font-medium block pl-5">${t.time}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-sm font-black text-navy-900 block">₹${t.totalFare.toLocaleString('en-IN')}</span>
                            <span class="text-[10px] text-slate-500 font-bold">${priceSubtext}</span>
                        </div>
                    </div>
                `;
                ticketContainer.appendChild(div);
            });

            // Store current selected transit ticket in AppState for Payment page
            const selectedTicket = tickets[AppState.selectedTransitTicketIndex] || tickets[0];
            if (selectedTicket) {
                AppState.selectedTransitTicketPrice = selectedTicket.totalFare;
                AppState.selectedTransitTicketName = selectedTicket.operator;
                AppState.selectedTransitClassName = currentClass.name;
            }

            // Low-Budget Protection Alert check
            const totalFare = selectedTicket ? selectedTicket.totalFare : 0;
            const alertBox = document.getElementById('low-budget-alert');
            if (alertBox) {
                if (totalFare > targetBudget) {
                    const calcVal = document.getElementById('low-budget-calc-val');
                    if (calcVal) calcVal.innerText = totalFare.toLocaleString('en-IN');
                    alertBox.classList.remove('hidden');
                } else {
                    alertBox.classList.add('hidden');
                }
            }
        }

        function selectTransitClass(index) {
            AppState.selectedTransitClass = index;
            renderTransitDetails();
            populatePaymentPage();
        }

        function selectTransitTicket(index) {
            AppState.selectedTransitTicketIndex = index;
            renderTransitDetails();
            populatePaymentPage();
        }

        function resolveLowBudget(action) {
            const alertBox = document.getElementById('low-budget-alert');
            if (alertBox) alertBox.classList.add('hidden');
            if (action === 'arrange') {
                AppState.selectedTransitTicketPrice = 0;
                showToast('Self-booking selected: Transit fare excluded from package bill.', 'fa-ticket');
                populatePaymentPage();
            } else if (action === 'economy' || action === 'cheapest') {
                AppState.selectedTransitClass = (AppState.mode === 'train' ? 0 : (AppState.mode === 'bus' ? 2 : 0));
                AppState.selectedTransitTicketIndex = 0;
                renderTransitDetails();
                populatePaymentPage();
                showToast('Switched to economy class to stay within your budget.', 'fa-tags');
            } else if (action === 'increase' || action === 'customizer') {
                showToast('Returning to Trip Customizer so you can adjust your budget.', 'fa-sliders');
                switchPage('questions');
            }
        }

        function setTaxiType(type) {
            AppState.taxiType = type;
            const btnF = document.getElementById('btn-taxi-fixed');
            const btnM = document.getElementById('btn-taxi-metered');
            if (type === 'fixed') {
                btnF.className = 'p-4 rounded-2xl border-2 border-warmOrange-500 bg-amber-50 text-left space-y-1 transition-all';
                btnM.className = 'p-4 rounded-2xl border border-slate-300 bg-white text-left space-y-1 hover:border-slate-400 transition-all';
            } else {
                btnM.className = 'p-4 rounded-2xl border-2 border-warmOrange-500 bg-amber-50 text-left space-y-1 transition-all';
                btnF.className = 'p-4 rounded-2xl border border-slate-300 bg-white text-left space-y-1 hover:border-slate-400 transition-all';
            }
        }

        // -------------------------------------------------------------
        // PLACES & SIGHTSEEING (Interactive Selection, Search & Save)
        // -------------------------------------------------------------
        const PlacesDatabase = [
            {
                id: 'solang-valley',
                name: 'Solang Valley Alpine Meadow',
                category: 'Adventure Sports & Snow',
                fee: 'Free Entry (Activities charged separately)',
                image: 'https://images.unsplash.com/photo-1677820915325-d8ce3184c2a4?w=800&auto=format&fit=crop',
                rating: '4.8 ★',
                highlight: 'Snow sports, paragliding, zorbing & quad biking with snow peaks backdrop',
                isAdventure: true,
                safetyRating: '3.9 / 5.0 (High Public Activity Rating)',
                safetyDisclaimer: 'Disclaimer: Safety rating is aggregated from public adventure reports and local operator audits. Do not rely entirely on this metric; exercise personal discretion.'
            },
            {
                id: 'hadimba-temple',
                name: 'Hadimba Devi Ancient Wooden Temple',
                category: 'Historic & Cultural',
                fee: '₹20 (Adults) • Free for Children',
                image: 'https://images.unsplash.com/photo-1655470062196-c37e923fc4c1?w=800&auto=format&fit=crop',
                rating: '4.9 ★',
                highlight: '16th-century pagoda-style wooden sanctuary nestled amidst towering ancient cedars',
                isAdventure: false
            },
            {
                id: 'atal-tunnel',
                name: 'Atal Tunnel North Portal & Sissu Falls',
                category: 'Himalayan Nature',
                fee: 'Free Green Corridor Transit',
                image: 'https://images.unsplash.com/photo-1652544711491-b6fcd4de4e70?w=800&auto=format&fit=crop',
                rating: '4.95 ★',
                highlight: '9.02 km engineering marvel opening into Lahaul valley and glacial waterfalls',
                isAdventure: false
            },
            {
                id: 'vashisht-baths',
                name: 'Vashisht Natural Sulfur Hot Springs',
                category: 'Leisure & Hot Springs',
                fee: 'Free Public Baths',
                image: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Vashisht_temple_near_manali.jpg',
                rating: '4.7 ★',
                highlight: 'Natural therapeutic sulfur thermal baths and ancient Sage Vashisht temple',
                isAdventure: false
            },
            {
                id: 'jogini-falls',
                name: 'Jogini Cascading Waterfall Trek',
                category: 'Himalayan Nature',
                fee: 'Free Mountain Trek',
                image: 'https://images.unsplash.com/photo-1634711951571-15e318b8a862?w=800&auto=format&fit=crop',
                rating: '4.85 ★',
                highlight: 'Scenic 3 km pine forest trail leading to multiple tiers of cold mountain cascades',
                isAdventure: false
            },
            {
                id: 'old-manali',
                name: 'Old Manali Village & Bohemian Cafés',
                category: 'Leisure & Hot Springs',
                fee: 'Free Village Walk',
                image: 'https://images.unsplash.com/photo-1657452923830-5bb9c9c09f71?w=800&auto=format&fit=crop',
                rating: '4.75 ★',
                highlight: 'Traditional Kathkuni wooden cottages, live acoustic music and riverside bakeries',
                isAdventure: false
            },
            {
                id: 'rohtang-pass',
                name: 'Rohtang Snow Crest Glacier Pass',
                category: 'Adventure Sports & Snow',
                fee: 'NGT Permit Required (₹550/vehicle)',
                image: 'https://images.unsplash.com/photo-1563630257272-e43377f07482?w=800&auto=format&fit=crop',
                rating: '4.9 ★',
                highlight: 'High mountain pass at 3,978m connecting Kullu with the arid Spiti & Lahaul valleys',
                isAdventure: true,
                safetyRating: '3.7 / 5.0 (High Altitude Weather Dependent)',
                safetyDisclaimer: 'Notice: Requires prior online NGT permit. Weather changes rapidly; warm layers mandatory.'
            },
            {
                id: 'naggar-castle',
                name: 'Historic Naggar Castle & Art Gallery',
                category: 'Historic & Cultural',
                fee: '₹50 Entry Ticket',
                image: 'https://images.unsplash.com/photo-1711005183541-d3496d253e20?w=800&auto=format&fit=crop',
                rating: '4.8 ★',
                highlight: 'Medieval timber-and-stone royal fortress with Nicholas Roerich Himalayan art estate',
                isAdventure: false
            }
        ];

        function renderPlaces() {
            const container = document.getElementById('places-grid-container');
            if (!container) return;
            container.innerHTML = '';

            const activeCat = AppState.activePlaceCategory || 'all';
            const filtered = activeCat === 'all' 
                ? PlacesDatabase 
                : PlacesDatabase.filter(p => p.category === activeCat);

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <i class="fa-solid fa-map-location-dot text-slate-400 text-3xl mb-2"></i>
                        <h4 class="font-black text-navy-900 text-sm">No sights match this category</h4>
                        <p class="text-xs text-slate-500 mt-1">Try selecting 'All Sights' or use the search bar above to add a custom place.</p>
                    </div>
                `;
                return;
            }

            filtered.forEach(p => {
                const isSelected = AppState.selectedPlaces.includes(p.id);
                const div = document.createElement('div');
                div.className = `card-3d-interactive sarv-card rounded-2xl overflow-hidden group border-2 transition-all flex flex-col justify-between ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50/20 shadow-md' : 'border-slate-300 hover:border-slate-400 bg-white shadow-sm'
                }`;

                div.innerHTML = `
                    <div class="card-3d-glare"></div>
                    <div>
                        <!-- EFFECT: Direction Aware Hover Card -->
                        <div class="direction-aware-card relative h-44 overflow-hidden bg-slate-900">
                            <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90">
                            <!-- EFFECT: Direction Aware Overlay -->
                            <div class="direction-aware-overlay">
                                <span class="text-[11px] font-black text-amber-300 flex items-center gap-1.5 drop-shadow">
                                    <i class="fa-solid fa-mountain-sun text-xs"></i> Explore Scenic Sight
                                </span>
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none z-10"></div>
                            
                            <!-- Top controls: status badge + delete button -->
                            <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-25">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow backdrop-blur-sm ${
                                    isSelected ? 'bg-emerald-600 text-white' : 'bg-navy-950/80 text-slate-200'
                                }">
                                    ${isSelected ? '✓ Included in Trip' : '+ Not in Trip'}
                                </span>
                                <button type="button" onclick="event.stopPropagation(); deletePlace('${p.id}')" title="Remove this suggestion from list" class="w-7 h-7 rounded-full bg-navy-950/80 text-white hover:bg-rose-600 flex items-center justify-center transition-colors shadow">
                                    <i class="fa-solid fa-xmark text-xs"></i>
                                </button>
                            </div>

                            <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px] font-extrabold z-25">
                                <span class="px-2 py-0.5 rounded-md bg-navy-950/85 backdrop-blur-sm shadow">
                                    ${p.fee}
                                </span>
                                <span class="px-2 py-0.5 rounded-md bg-amber-500 text-navy-950 shadow">
                                    ${p.rating}
                                </span>
                            </div>
                        </div>

                        <div class="p-4 space-y-2">
                            <div class="flex items-center justify-between gap-1">
                                <span class="text-[9px] font-black uppercase tracking-wider text-warmOrange-600">${p.category}</span>
                            </div>
                            <h4 class="font-black text-sm text-navy-900 leading-tight">${p.name}</h4>
                            <p class="text-xs text-slate-600 font-medium leading-relaxed">${p.highlight}</p>

                            ${p.isAdventure ? `
                                <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 mt-2">
                                    <div class="flex items-center justify-between text-[10px] font-black text-amber-900">
                                        <span>Adventure Safety Audit:</span>
                                        <span>${p.safetyRating}</span>
                                    </div>
                                    <p class="text-[9px] text-slate-600 leading-tight font-medium">
                                        ${p.safetyDisclaimer}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Bottom Action Button -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200">
                        <button type="button" onclick="togglePlaceSelection('${p.id}')" class="w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                            isSelected 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                : 'border border-slate-300 bg-white hover:bg-slate-100 text-navy-900'
                        }">
                            <i class="fa-solid ${isSelected ? 'fa-circle-check' : 'fa-plus'} text-xs"></i>
                            <span>${isSelected ? 'Included in Trip ✓ (Click to Remove)' : '+ Add to Trip'}</span>
                        </button>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        function togglePlaceSelection(id) {
            const place = PlacesDatabase.find(p => p.id === id);
            const name = place ? place.name : 'Place';
            const index = AppState.selectedPlaces.indexOf(id);

            if (index > -1) {
                AppState.selectedPlaces.splice(index, 1);
                showToast(`Removed "${name}" from trip itinerary.`);
            } else {
                AppState.selectedPlaces.push(id);
                showToast(`Added "${name}" to your trip!`, 'fa-circle-check');
            }

            renderPlaces();
            updateSelectedPlacesTray();
            updateHotelsTripHeader();
        }

        function deletePlace(id) {
            const place = PlacesDatabase.find(p => p.id === id);
            const name = place ? place.name : 'Place';

            const dbIndex = PlacesDatabase.findIndex(p => p.id === id);
            if (dbIndex > -1) {
                PlacesDatabase.splice(dbIndex, 1);
            }

            const selIndex = AppState.selectedPlaces.indexOf(id);
            if (selIndex > -1) {
                AppState.selectedPlaces.splice(selIndex, 1);
            }

            renderPlaces();
            updateSelectedPlacesTray();
            updateHotelsTripHeader();
            showToast(`Deleted "${name}" from recommendations.`);
        }

        function addCustomPlace() {
            const input = document.getElementById('custom-place-input');
            if (!input) return;
            const val = input.value.trim();
            if (!val) {
                showToast('Please type a place name to add.', 'fa-circle-exclamation');
                return;
            }

            const newId = `custom-${Date.now()}`;
            const newPlace = {
                id: newId,
                name: val,
                category: 'Himalayan Nature',
                fee: 'Local tariff applies',
                image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop',
                rating: '4.8 ★',
                highlight: 'Custom place added to your personalized itinerary',
                isAdventure: false
            };

            PlacesDatabase.unshift(newPlace);
            AppState.selectedPlaces.push(newId);
            input.value = '';

            renderPlaces();
            updateSelectedPlacesTray();
            updateHotelsTripHeader();
            showToast(`"${val}" added and saved in your trip!`, 'fa-circle-check');
        }

        function selectAllPlaces() {
            PlacesDatabase.forEach(p => {
                if (!AppState.selectedPlaces.includes(p.id)) {
                    AppState.selectedPlaces.push(p.id);
                }
            });
            renderPlaces();
            updateSelectedPlacesTray();
            updateHotelsTripHeader();
            showToast('All recommended places added to your trip!', 'fa-circle-check');
        }

        function clearAllPlaces() {
            AppState.selectedPlaces = [];
            renderPlaces();
            updateSelectedPlacesTray();
            updateHotelsTripHeader();
            showToast('All places cleared from trip itinerary.');
        }

        function filterPlacesCategory(cat) {
            AppState.activePlaceCategory = cat;
            document.querySelectorAll('.place-cat-chip').forEach(btn => {
                if (btn.getAttribute('data-pcat') === cat) {
                    btn.className = 'place-cat-chip active px-3 py-1.5 rounded-xl text-xs font-black transition-all bg-navy-900 text-white shadow-sm';
                } else {
                    btn.className = 'place-cat-chip px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-slate-300 text-slate-700 hover:border-slate-400';
                }
            });
            renderPlaces();
        }

        function updateSelectedPlacesTray() {
            const count = AppState.selectedPlaces.length;
            const counterBadge = document.getElementById('saved-places-counter-badge');
            if (counterBadge) {
                counterBadge.innerText = `${count} ${count === 1 ? 'Place' : 'Places'} Saved`;
            }

            const btnText = document.getElementById('save-places-btn-text');
            if (btnText) {
                btnText.innerText = `Save (${count}) Selected Places & Proceed to Hotels`;
            }

            const chipsContainer = document.getElementById('selected-places-chips');
            if (chipsContainer) {
                chipsContainer.innerHTML = '';
                if (count === 0) {
                    chipsContainer.innerHTML = `
                        <span class="text-xs text-slate-500 font-medium italic">
                            No places saved yet. Click "+ Add to Trip" on any sight below or use the search bar.
                        </span>
                    `;
                } else {
                    AppState.selectedPlaces.forEach(id => {
                        const p = PlacesDatabase.find(item => item.id === id);
                        const name = p ? p.name : id;
                        const chip = document.createElement('div');
                        chip.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900 text-white text-xs font-bold shadow-sm';
                        chip.innerHTML = `
                            <span>${name}</span>
                            <button type="button" onclick="togglePlaceSelection('${id}')" title="Remove from trip" class="w-4 h-4 rounded-full bg-white/20 hover:bg-rose-500 text-white flex items-center justify-center transition-colors">
                                <i class="fa-solid fa-xmark text-[9px]"></i>
                            </button>
                        `;
                        chipsContainer.appendChild(chip);
                    });
                }
            }

            // Sync connected trip banners
            const r = RoutesDatabase[AppState.selectedRouteIndex] || RoutesDatabase[0];
            const routeBadge = document.getElementById('places-route-badge');
            if (routeBadge) routeBadge.innerText = `${r.name} (${r.distance})`;

            const durBadge = document.getElementById('places-trip-duration-badge');
            if (durBadge) durBadge.innerText = `${AppState.days} Days / ${AppState.nights} Nights`;
        }

        function savePlacesAndProceed() {
            triggerLoader(() => {
                switchPage('hotels');
                showToast(`Itinerary saved with ${AppState.selectedPlaces.length} places! Now browse verified hotel stays.`, 'fa-circle-check');
            }, 350, 'Saving your selected sights into the master itinerary...');
        }

        // -------------------------------------------------------------
        // HOTELS & ADVANCE ESCROW BOOKING
        // -------------------------------------------------------------
        const HotelsDatabase = [
            {
                id: 'hotel-1',
                name: 'Grand Alpine Cedar Sanctuary',
                category: 'Luxury Heritage Resort',
                rating: '4.9 ★ (340 verified stays)',
                ratingVal: 4.9,
                location: 'Log Huts Area, Old Manali (1.2 km from Mall Road)',
                description: 'Perched high among century-old Himalayan deodars, Grand Alpine Cedar Sanctuary offers authentic mountain luxury, private panoramic balconies overlooking Solang Valley, heated wooden interiors, 24/7 power backup, and round-the-clock concierge service.',
                pricePerNight: 3499,
                escrowDeposit: 699,
                balanceDue: 2800,
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1000&auto=format&fit=crop'
                ],
                amenities: [
                    { icon: 'fa-temperature-arrow-up', text: 'Heated Wooden Flooring' },
                    { icon: 'fa-mountain-sun', text: 'Mountain Valley Balcony' },
                    { icon: 'fa-bolt', text: '24/7 Power & Hot Water' },
                    { icon: 'fa-wifi', text: 'High-Speed Wi-Fi (150 Mbps)' },
                    { icon: 'fa-fire', text: 'Bonfire & Barbecue Lawn' },
                    { icon: 'fa-square-parking', text: 'Free Covered Car Parking' }
                ],
                rooms: [
                    {
                        id: 'h1-r1',
                        name: 'Deluxe Cedar Balcony Suite',
                        beds: '1 King Bed • Up to 3 Guests',
                        perks: 'Private Forest Balcony • Free Gourmet Breakfast • Cedar Steam Tub',
                        pricePerNight: 3499,
                        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop'
                    },
                    {
                        id: 'h1-r2',
                        name: 'Himalayan Attic Family Penthouse',
                        beds: '2 King Beds • Up to 5 Guests',
                        perks: 'Panoramic 360° Loft • Stone Fireplace • Breakfast & Dinner Included',
                        pricePerNight: 5800,
                        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop'
                    },
                    {
                        id: 'h1-r3',
                        name: 'Alpine Executive Wooden Chalet',
                        beds: '1 Queen Bed • 2 Guests',
                        perks: 'Garden Patio • Dedicated Work Desk • Artisan Herbal Tea Bar',
                        pricePerNight: 2899,
                        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop'
                    }
                ],
                reviews: [
                    {
                        reviewer: 'Pooja Sharma',
                        date: 'Stayed Aug 2026',
                        tag: 'Couple Getaway',
                        rating: 5,
                        comment: 'Immaculate wooden suites, piping hot cedar steam water, and scenic morning breakfast. Quiet forest ambience with dedicated car parking right near our cottage.'
                    },
                    {
                        reviewer: 'Rajesh Nair',
                        date: 'Stayed July 2026',
                        tag: 'Family Vacation',
                        rating: 5,
                        comment: 'The 20% escrow booking gave us immense peace of mind. The staff was courteous, the attic room had breathtaking valley views, and the kids loved the lawn bonfire!'
                    },
                    {
                        reviewer: 'Rohan Mehta',
                        date: 'Stayed June 2026',
                        tag: 'Solo Workation',
                        rating: 4.8,
                        comment: 'Wi-Fi was rock solid (140 Mbps on speedtest), power backup kicked in seamlessly during thunderstorms, and the restaurant served hot pahadi dal at night.'
                    }
                ]
            },
            {
                id: 'hotel-2',
                name: 'Riverside Pine Wood Chalet',
                category: 'Boutique Wooden Cottage',
                rating: '4.8 ★ (182 verified stays)',
                ratingVal: 4.8,
                location: 'Clubhouse Road, Beas Riverbank, Old Manali',
                description: 'Situated right along the gentle waters of the Beas tributary, Riverside Pine Wood Chalet combines rustic stone-and-wood architecture with cozy modern warmth, riverside breakfast decks, and private fishing access.',
                pricePerNight: 2350,
                escrowDeposit: 470,
                balanceDue: 1880,
                image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&auto=format&fit=crop'
                ],
                amenities: [
                    { icon: 'fa-water', text: 'Riverfront Deck & Sit-out' },
                    { icon: 'fa-fire-burner', text: 'Traditional Stone Fireplace' },
                    { icon: 'fa-sun', text: '24/7 Solar Hot Water' },
                    { icon: 'fa-wifi', text: 'High-Speed Wi-Fi' },
                    { icon: 'fa-person-hiking', text: 'Riverbank Walking Trail' },
                    { icon: 'fa-square-parking', text: 'Secure Parking on Site' }
                ],
                rooms: [
                    {
                        id: 'h2-r1',
                        name: 'Riverside Classic Cottage',
                        beds: '1 Queen Bed • 2 Guests',
                        perks: 'River-Facing Patio • Hot Shower • Daily Organic Breakfast Included',
                        pricePerNight: 2350,
                        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop'
                    },
                    {
                        id: 'h2-r2',
                        name: 'Riverfront Premium Pine Duplex',
                        beds: '1 King + 1 Day Bed • Up to 4 Guests',
                        perks: 'Upper Wooden Loft • Private Water-View Balcony • Ceramic Room Heater',
                        pricePerNight: 3950,
                        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop'
                    }
                ],
                reviews: [
                    {
                        reviewer: 'Vikram & Ananya',
                        date: 'Stayed Aug 2026',
                        tag: 'Couples Retreat',
                        rating: 5,
                        comment: 'Waking up to the calming sound of the river was magical! The host served hot ginger tea directly on the bank deck. 20% escrow deposit made reservation completely risk-free.'
                    },
                    {
                        reviewer: 'Deepak Verma',
                        date: 'Stayed July 2026',
                        tag: 'Road Trip Enthusiast',
                        rating: 4.7,
                        comment: 'Authentic wooden ambiance with clean linen and piping hot water. Safe parking for my SUV right outside the door.'
                    }
                ]
            },
            {
                id: 'hotel-3',
                name: 'Highland Backpackers & Workation Inn',
                category: 'Verified Budget Homestay',
                rating: '4.7 ★ (412 verified stays)',
                ratingVal: 4.7,
                location: 'Vashisht Village Path (2.5 km from Manali Center)',
                description: 'A vibrant, eco-conscious sanctuary designed for road-trippers, backpackers, and remote digital nomads. Features dedicated coworking workstations, hot springs proximity, high-speed fiber, and healthy café dining.',
                pricePerNight: 1250,
                escrowDeposit: 250,
                balanceDue: 1000,
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop'
                ],
                amenities: [
                    { icon: 'fa-laptop-code', text: 'Dedicated Coworking Lounge' },
                    { icon: 'fa-wifi', text: '200 Mbps Dual Fiber Wi-Fi' },
                    { icon: 'fa-mug-hot', text: 'Rooftop Organic Café' },
                    { icon: 'fa-hot-tub-person', text: 'Natural Hot Spring Nearby' },
                    { icon: 'fa-lock', text: 'Secure Luggage Lockers' },
                    { icon: 'fa-motorcycle', text: 'Bike & Scooter Rentals' }
                ],
                rooms: [
                    {
                        id: 'h3-r1',
                        name: 'Private Standard Workation Room',
                        beds: '1 Queen Bed • 1-2 Guests',
                        perks: 'Ergonomic Desk & Chair • High-Speed Fiber • Mountain Window',
                        pricePerNight: 1250,
                        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop'
                    },
                    {
                        id: 'h3-r2',
                        name: 'Superior Mountain View Studio',
                        beds: '1 King Bed • 2 Guests',
                        perks: 'Private Sunny Balcony • Mini Kitchenette • Tea & Coffee Maker',
                        pricePerNight: 1900,
                        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&auto=format&fit=crop'
                    }
                ],
                reviews: [
                    {
                        reviewer: 'Sneha Patel',
                        date: 'Stayed Aug 2026',
                        tag: 'Remote Workation',
                        rating: 5,
                        comment: 'Stayed 10 days for remote work. Internet never disconnected once, the rooftop café serves affordable healthy meals, and sunsets over the snow peaks are unmatched.'
                    },
                    {
                        reviewer: 'Aman Joshi',
                        date: 'Stayed July 2026',
                        tag: 'Solo Explorer',
                        rating: 4.6,
                        comment: 'Best budget stay in Manali. 20% advance security was only ₹250 to confirm. Paid the rest post-checkout without any hidden charges.'
                    }
                ]
            }
        ];

        function renderHotels() {
            const container = document.getElementById('hotels-listing-container');
            if (!container) return;
            container.innerHTML = '';

            const activeCat = AppState.activeHotelCategory || 'all';
            const query = (AppState.hotelSearchQuery || '').toLowerCase().trim();

            let filtered = HotelsDatabase.filter(h => {
                const matchesCat = (activeCat === 'all' || h.category === activeCat);
                const matchesQuery = !query || 
                    h.name.toLowerCase().includes(query) ||
                    h.location.toLowerCase().includes(query) ||
                    h.category.toLowerCase().includes(query) ||
                    h.description.toLowerCase().includes(query);
                return matchesCat && matchesQuery;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <i class="fa-solid fa-hotel text-slate-400 text-3xl"></i>
                        <h4 class="font-black text-navy-900 text-sm">No hotels match your filter</h4>
                        <p class="text-xs text-slate-500">Try clearing your search query or selecting 'All Stays'.</p>
                        <button type="button" onclick="filterHotelsCategory('all'); document.getElementById('hotel-search-input').value=''; filterHotelsList();" class="btn-navy px-4 py-2 rounded-xl text-xs font-bold mt-2">
                            Reset Hotel Filters
                        </button>
                    </div>
                `;
                return;
            }

            filtered.forEach((h, index) => {
                const card = document.createElement('div');
                card.className = 'card-3d-interactive sarv-card rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-warmOrange-500 hover:shadow-xl transition-all border border-slate-300 shadow-sm cursor-pointer group';
                card.onclick = () => openHotelDetail(h.id);
                card.innerHTML = `
                    <div class="card-3d-glare"></div>
                    <!-- EFFECT: Direction Aware Hover Card -->
                    <div class="direction-aware-card relative sm:w-56 h-48 sm:h-auto overflow-hidden shrink-0 bg-slate-100">
                        <img src="${h.image}" alt="${h.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <!-- EFFECT: Direction Aware Overlay -->
                        <div class="direction-aware-overlay">
                            <span class="text-[11px] font-black text-amber-300 flex items-center gap-1.5 drop-shadow">
                                <i class="fa-solid fa-eye text-xs"></i> View Rooms & Escrow
                            </span>
                        </div>
                        <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-navy-950/85 backdrop-blur-sm text-white text-[10px] font-black shadow flex items-center gap-1 z-25">
                            <i class="fa-solid fa-shield-halved text-warmOrange-400"></i>
                            <span>20% Escrow Eligible</span>
                        </span>
                        <span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 text-navy-900 text-[10px] font-extrabold shadow sm:hidden z-25">
                            Click for Details →
                        </span>
                    </div>
                    <div class="p-5 flex-1 flex flex-col justify-between space-y-3 relative z-20">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-1">
                                <span class="text-[10px] font-extrabold text-warmOrange-600 uppercase tracking-wider">${h.category}</span>
                                <span class="text-xs font-black text-amber-600 flex items-center gap-1">
                                    <i class="fa-solid fa-star text-[11px]"></i>${h.rating}
                                </span>
                            </div>
                            <h4 class="text-lg font-black text-navy-900 group-hover:text-warmOrange-600 transition-colors">${h.name}</h4>
                            <p class="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                                <i class="fa-solid fa-location-dot text-slate-400 text-[11px]"></i>${h.location}
                            </p>
                            <p class="text-xs text-slate-500 line-clamp-1 mt-1">${h.rooms.length} Room Types Available • ${h.reviews.length} Verified Reviews</p>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                                <span class="text-slate-500 font-bold text-[10px] block">Starting Tariff</span>
                                <span class="font-black text-navy-900 text-sm sm:text-base">₹${h.pricePerNight.toLocaleString('en-IN')}<span class="text-[11px] font-medium text-slate-500">/night</span></span>
                            </div>
                            <div class="text-right">
                                <span class="text-emerald-700 font-black text-[11px] block">Pay Now (20% Escrow): ₹${h.escrowDeposit.toLocaleString('en-IN')}</span>
                                <span class="text-slate-600 font-semibold text-[10px]">Release ₹${h.balanceDue.toLocaleString('en-IN')} post-checkout</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-xs font-black text-warmOrange-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                View Rooms, Reviews & Details <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </span>
                            <button type="button" onclick="event.stopPropagation(); openHotelDetail('${h.id}')" class="btn-warm py-2.5 px-4 rounded-xl text-xs font-black shadow-md">
                                View Rooms & Reserve
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);

                if (index === 0) {
                    const adDiv = document.createElement('div');
                    adDiv.className = 'p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-dashed border-amber-400 flex items-center justify-between shadow-sm';
                    adDiv.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl bg-warmOrange-500 text-white flex items-center justify-center text-sm font-black">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <div>
                                <span class="text-[9px] font-black text-amber-800 uppercase tracking-wider block">Featured Partner Protection</span>
                                <span class="text-xs font-black text-navy-900">Tata AIG Mountain Travel Insurance • ₹199 per traveler</span>
                            </div>
                        </div>
                        <button type="button" onclick="showToast('Travel Insurance added to trip summary at ₹199/person.')" class="btn-navy px-3.5 py-2 rounded-xl text-[11px] font-bold shrink-0">
                            Add Cover
                        </button>
                    `;
                    container.appendChild(adDiv);
                }
            });
        }

        function filterHotelsList() {
            const input = document.getElementById('hotel-search-input');
            if (input) {
                AppState.hotelSearchQuery = input.value.toLowerCase().trim();
                renderHotels();
            }
        }

        function filterHotelsCategory(cat) {
            AppState.activeHotelCategory = cat;
            document.querySelectorAll('.hotel-cat-chip').forEach(btn => {
                if (btn.getAttribute('data-hcat') === cat) {
                    btn.className = 'hotel-cat-chip active px-3 py-1 rounded-xl text-xs font-black bg-navy-900 text-white transition-all shadow-sm';
                } else {
                    btn.className = 'hotel-cat-chip px-3 py-1 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:border-slate-400 transition-all';
                }
            });
            renderHotels();
        }

        function updateHotelsTripHeader() {
            const r = (typeof RoutesDatabase !== 'undefined' && RoutesDatabase[AppState.selectedRouteIndex]) ? RoutesDatabase[AppState.selectedRouteIndex] : { name: 'Scenic Foothills Corridor', distance: '536 km' };
            const titleEl = document.getElementById('hotels-trip-title');
            if (titleEl) {
                titleEl.innerText = `Route: ${r.name} (${r.distance}) • Destination: ${AppState.destination}`;
            }

            const placesPill = document.getElementById('hotels-saved-places-pill');
            if (placesPill) {
                const count = AppState.selectedPlaces.length;
                placesPill.innerText = `${count} ${count === 1 ? 'Place' : 'Places'} Saved in Trip`;
            }

            const nightsPill = document.getElementById('hotels-nights-pill');
            if (nightsPill) {
                nightsPill.innerText = `${AppState.nights} Nights Stay`;
            }

            const memSummary = document.getElementById('hotels-members-summary');
            if (memSummary) {
                memSummary.innerText = `${AppState.members} Traveler${AppState.members > 1 ? 's' : ''}`;
            }

            const budgetSummary = document.getElementById('hotels-budget-summary');
            if (budgetSummary) {
                budgetSummary.innerText = `Trip Budget: ₹${AppState.budget.toLocaleString('en-IN')}`;
            }
        }

        function syncNavigationView() {
            const r = (typeof RoutesDatabase !== 'undefined' && RoutesDatabase[AppState.selectedRouteIndex]) ? RoutesDatabase[AppState.selectedRouteIndex] : null;
            if (!r) return;

            // Direct ID bindings for navigation stats
            const distEl = document.getElementById('nav-stat-distance');
            if (distEl) distEl.innerText = r.distance;
            const timeEl = document.getElementById('nav-stat-time');
            if (timeEl) timeEl.innerText = r.time;
            const costEl = document.getElementById('nav-stat-cost');
            if (costEl) costEl.innerText = r.fuelTollCost;
            const stopsEl = document.getElementById('nav-stat-stops');
            if (stopsEl) stopsEl.innerText = `${r.waypoints ? r.waypoints.length : 0} Waypoints`;

            // Backward compatible selector updates
            const cards = document.querySelectorAll('#view-navigation-view .sarv-card span.text-lg');
            if (cards.length >= 4) {
                cards[0].innerText = r.distance;
                cards[1].innerText = r.time;
                cards[2].innerText = r.fuelTollCost;
                cards[3].innerText = `${r.waypoints.length} Waypoints`;
            }

            // Dynamically update waypoint pin labels to match AppState origin and destination
            const src = AppState.source || AppState.origin || 'Delhi';
            const dst = AppState.destination || 'Manali';
            const pin0 = document.getElementById('waypoint-pin-0');
            if (pin0) {
                const label = pin0.querySelector('span:last-child');
                if (label) label.innerHTML = `<i class="fa-solid fa-location-dot text-warmOrange-400 mr-1"></i>Origin: ${escapeHtml(src)}`;
            }
            const pin3 = document.getElementById('waypoint-pin-3');
            if (pin3) {
                const label = pin3.querySelector('span:last-child');
                if (label) label.innerHTML = `<i class="fa-solid fa-flag-checkered text-white mr-1"></i>Destination: ${escapeHtml(dst)}`;
            }

            if (typeof showMapWaypointDetails === 'function') {
                showMapWaypointDetails(0);
            }
        }

        function openHotelDetail(hotelId) {
            const h = HotelsDatabase.find(item => item.id === hotelId) || HotelsDatabase[0];
            AppState.selectedHotel = h;
            AppState.selectedRoomId = h.rooms[0].id;
            AppState.userExplicitHotel = true;

            // Header details
            const nameEl = document.getElementById('modal-hotel-name');
            if (nameEl) nameEl.innerText = h.name;

            const catEl = document.getElementById('modal-hotel-category');
            if (catEl) catEl.innerText = h.category;

            const ratingEl = document.getElementById('modal-hotel-rating-text');
            if (ratingEl) ratingEl.innerText = h.rating;

            const locEl = document.getElementById('modal-hotel-location-text');
            if (locEl) locEl.innerText = h.location;

            const descEl = document.getElementById('modal-hotel-description');
            if (descEl) descEl.innerText = h.description;

            // Gallery
            const mainImg = document.getElementById('modal-hotel-main-img');
            if (mainImg) mainImg.src = h.gallery[0] || h.image;

            const galleryStrip = document.getElementById('modal-hotel-gallery-strip');
            if (galleryStrip) {
                galleryStrip.innerHTML = '';
                (h.gallery || [h.image]).forEach((imgUrl, idx) => {
                    const thumb = document.createElement('div');
                    thumb.className = `relative h-16 sm:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${idx === 0 ? 'border-warmOrange-500 ring-2 ring-warmOrange-300' : 'border-slate-200 hover:border-slate-400'}`;
                    thumb.innerHTML = `<img src="${imgUrl}" alt="${h.name} photo ${idx + 1}" class="w-full h-full object-cover">`;
                    thumb.onclick = () => setHotelGalleryImage(imgUrl, thumb);
                    galleryStrip.appendChild(thumb);
                });
            }

            // Amenities
            const amenContainer = document.getElementById('modal-hotel-amenities');
            if (amenContainer) {
                amenContainer.innerHTML = '';
                h.amenities.forEach(a => {
                    const item = document.createElement('div');
                    item.className = 'p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-bold text-navy-900';
                    item.innerHTML = `<i class="fa-solid ${a.icon} text-warmOrange-600 text-xs shrink-0"></i><span class="truncate">${a.text}</span>`;
                    amenContainer.appendChild(item);
                });
            }

            // Rooms
            renderHotelRooms();

            // Reviews
            const reviewsContainer = document.getElementById('modal-hotel-reviews-container');
            if (reviewsContainer) {
                reviewsContainer.innerHTML = '';
                h.reviews.forEach(rev => {
                    const revEl = document.createElement('div');
                    revEl.className = 'p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs';
                    revEl.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-navy-900 text-white font-black text-[10px] flex items-center justify-center">
                                    ${rev.reviewer.charAt(0)}
                                </span>
                                <span class="font-extrabold text-navy-900">${rev.reviewer}</span>
                                <span class="text-[10px] text-slate-500 font-semibold">• ${rev.date}</span>
                            </div>
                            <span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                                ${'★'.repeat(Math.round(rev.rating))} (${rev.tag})
                            </span>
                        </div>
                        <p class="text-slate-700 text-[11px] leading-relaxed italic">
                            "${rev.comment}"
                        </p>
                    `;
                    reviewsContainer.appendChild(revEl);
                });
            }

            updateHotelEscrowCalculations();

            const modal = document.getElementById('modal-hotel-detail');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setModalBodyScroll(true);
            }
        }

        function setHotelGalleryImage(url, activeThumb) {
            const mainImg = document.getElementById('modal-hotel-main-img');
            if (mainImg) {
                mainImg.style.opacity = '0.7';
                setTimeout(() => {
                    mainImg.src = url;
                    mainImg.style.opacity = '1';
                }, 100);
            }
            const strip = document.getElementById('modal-hotel-gallery-strip');
            if (strip) {
                strip.querySelectorAll('div').forEach(el => {
                    el.className = 'relative h-16 sm:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all border-slate-200 hover:border-slate-400';
                });
                if (activeThumb) {
                    activeThumb.className = 'relative h-16 sm:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all border-warmOrange-500 ring-2 ring-warmOrange-300';
                }
            }
        }

        function renderHotelRooms() {
            const container = document.getElementById('modal-hotel-rooms-container');
            if (!container || !AppState.selectedHotel) return;
            container.innerHTML = '';

            const h = AppState.selectedHotel;
            h.rooms.forEach(room => {
                const isSelected = room.id === AppState.selectedRoomId;
                const card = document.createElement('div');
                card.className = `p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected ? 'border-warmOrange-500 bg-amber-50/70 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                }`;
                card.onclick = () => {
                    AppState.selectedRoomId = room.id;
                    renderHotelRooms();
                    updateHotelEscrowCalculations();
                };

                const escrow = Math.round(room.pricePerNight * 0.20);
                const balance = room.pricePerNight - escrow;

                card.innerHTML = `
                    <div class="flex items-center gap-3 flex-1">
                        <img src="${room.image}" alt="${room.name}" class="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200">
                        <div class="space-y-0.5">
                            <div class="flex items-center gap-2">
                                <h5 class="text-xs font-black text-navy-900">${room.name}</h5>
                                ${isSelected ? '<span class="px-2 py-0.5 rounded-md bg-warmOrange-500 text-white text-[9px] font-black uppercase">Selected</span>' : ''}
                            </div>
                            <span class="text-[11px] text-slate-600 font-bold block">${room.beds}</span>
                            <span class="text-[10px] text-slate-500 block">${room.perks}</span>
                        </div>
                    </div>
                    <div class="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <div class="text-right">
                            <span class="font-black text-navy-900 text-sm block">₹${room.pricePerNight.toLocaleString('en-IN')}<span class="text-[10px] font-normal text-slate-500">/night</span></span>
                            <span class="text-[10px] text-emerald-700 font-extrabold block">20% Escrow: ₹${escrow.toLocaleString('en-IN')}</span>
                        </div>
                        <button type="button" class="px-3 py-1.5 rounded-xl font-black text-[11px] transition-all ${
                            isSelected ? 'bg-warmOrange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }">
                            ${isSelected ? 'Selected ✓' : 'Choose Room'}
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function updateHotelEscrowCalculations() {
            if (!AppState.selectedHotel) return;
            const h = AppState.selectedHotel;
            const room = (h.rooms && h.rooms.find(r => r.id === AppState.selectedRoomId)) || (h.rooms && h.rooms[0]) || { pricePerNight: h.pricePerNight, name: 'Standard Room' };

            const checkinInput = document.getElementById('hotel-checkin-date');
            const checkoutInput = document.getElementById('hotel-checkout-date');
            let checkinVal = (checkinInput && checkinInput.value) || AppState.checkinDate || '2026-09-12';
            let checkoutVal = (checkoutInput && checkoutInput.value) || AppState.checkoutDate || '2026-09-15';

            let d1 = new Date(checkinVal);
            let d2 = new Date(checkoutVal);

            // Strict checkout > checkin enforcement
            if (checkinInput && checkinVal) {
                const nextDay = new Date(d1);
                nextDay.setDate(nextDay.getDate() + 1);
                const nextDayStr = nextDay.toISOString().split('T')[0];
                if (checkoutInput) checkoutInput.min = nextDayStr;
                if (isNaN(d2.getTime()) || d2 <= d1) {
                    d2 = nextDay;
                    checkoutVal = nextDayStr;
                    if (checkoutInput) checkoutInput.value = checkoutVal;
                }
            }

            let diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
            if (isNaN(diffDays) || diffDays < 1) diffDays = 1;

            AppState.checkinDate = checkinVal;
            AppState.checkoutDate = checkoutVal;

            const totalStay = room.pricePerNight * diffDays;
            const escrowDeposit = Math.round(totalStay * 0.20);
            const balanceDue = totalStay - escrowDeposit;

            const nightsBadge = document.getElementById('modal-calculated-nights-badge');
            if (nightsBadge) nightsBadge.innerText = `${diffDays} Night${diffDays > 1 ? 's' : ''} Selected`;

            const nightsCount = document.getElementById('modal-escrow-nights-count');
            if (nightsCount) nightsCount.innerText = `${diffDays} night${diffDays > 1 ? 's' : ''}`;

            const totalEl = document.getElementById('modal-total-stay-val');
            if (totalEl) totalEl.innerText = `₹${totalStay.toLocaleString('en-IN')}`;

            const escrowEl = document.getElementById('modal-escrow-val');
            if (escrowEl) escrowEl.innerText = `₹${escrowDeposit.toLocaleString('en-IN')}`;

            const balanceEl = document.getElementById('modal-balance-val');
            if (balanceEl) balanceEl.innerText = `₹${balanceDue.toLocaleString('en-IN')}`;

            const reserveBtnText = document.getElementById('modal-reserve-btn-text');
            if (reserveBtnText) {
                reserveBtnText.innerText = `Reserve ${room.name} (Pay ₹${escrowDeposit.toLocaleString('en-IN')} Escrow)`;
            }
        }

        function closeHotelDetail() {
            const modal = document.getElementById('modal-hotel-detail');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            setModalBodyScroll(false);
        }

        function confirmHotelBooking() {
            if (!AppState.selectedHotel && typeof HotelsDatabase !== 'undefined' && HotelsDatabase.length > 0) {
                AppState.selectedHotel = HotelsDatabase[0];
            }
            if (!AppState.selectedHotel) return;
            AppState.userExplicitHotel = true;
            const h = AppState.selectedHotel;
            const room = (h.rooms && h.rooms.find(r => r.id === AppState.selectedRoomId)) || (h.rooms && h.rooms[0]) || { pricePerNight: h.pricePerNight, name: 'Standard Room' };

            const checkinInput = document.getElementById('hotel-checkin-date');
            const checkoutInput = document.getElementById('hotel-checkout-date');
            if (checkinInput && checkinInput.value) AppState.checkinDate = checkinInput.value;
            if (checkoutInput && checkoutInput.value) AppState.checkoutDate = checkoutInput.value;

            closeHotelDetail();
            triggerLoader(() => {
                showToast(`Hotel selected: ${h.name} (${room.name})! Proceeding to 20% escrow checkout.`, 'fa-shield-halved');
                switchPage('payment');
            }, 400, 'Securing room & generating 20% escrow checkout...');
        }

        // -------------------------------------------------------------
        // STEP 5: PAYMENT ENGINE & ESCROW VAULT CHECKOUT
        // -------------------------------------------------------------
        function populatePaymentPage() {
            const targetBudget = Number(AppState.budget) || 16000;

            // Ensure hotel selection is initialized and respects budget tier if not explicitly chosen
            if (!AppState.selectedHotel && typeof HotelsDatabase !== 'undefined' && HotelsDatabase.length > 0) {
                if (targetBudget <= 10500) {
                    AppState.selectedHotel = HotelsDatabase.find(item => item.id === 'hotel-3') || HotelsDatabase[2] || HotelsDatabase[0];
                } else if (targetBudget <= 18000) {
                    AppState.selectedHotel = HotelsDatabase.find(item => item.id === 'hotel-2') || HotelsDatabase[1] || HotelsDatabase[0];
                } else {
                    AppState.selectedHotel = HotelsDatabase[0];
                }
            }
            const h = AppState.selectedHotel || (typeof HotelsDatabase !== 'undefined' ? HotelsDatabase[0] : null);
            if (!h) return;

            if (!AppState.selectedRoomId && h.rooms && h.rooms.length > 0) {
                AppState.selectedRoomId = h.rooms[0].id;
            }
            const room = (h.rooms && h.rooms.find(rm => rm.id === AppState.selectedRoomId)) || (h.rooms && h.rooms[0]) || { pricePerNight: h.pricePerNight, name: 'Standard Room' };

            // Route Information
            const r = (typeof RoutesDatabase !== 'undefined' && RoutesDatabase[AppState.selectedRouteIndex]) ? RoutesDatabase[AppState.selectedRouteIndex] : { name: 'Scenic Foothills Corridor', distance: '536 km', time: '10h 30m', fuelTollCost: '₹4,200' };

            // Dates & Duration
            const checkinVal = AppState.checkinDate || document.getElementById('hotel-checkin-date')?.value || '2026-09-12';
            const checkoutVal = AppState.checkoutDate || document.getElementById('hotel-checkout-date')?.value || '2026-09-15';
            const d1 = new Date(checkinVal);
            const d2 = new Date(checkoutVal);
            let diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
            if (isNaN(diffDays) || diffDays < 1) diffDays = AppState.nights || 3;

            // Formatted Date helper
            function formatNiceDate(isoDateStr) {
                try {
                    const dt = new Date(isoDateStr);
                    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                } catch (e) {
                    return isoDateStr;
                }
            }

            // Populate Summary Header
            const routeNameEl = document.getElementById('pay-route-name');
            if (routeNameEl) routeNameEl.innerText = r.name;

            const routeMetaEl = document.getElementById('pay-route-meta');
            if (routeMetaEl) routeMetaEl.innerText = `${AppState.source} → ${AppState.destination} • ${r.distance} • ${r.time}`;

            const hotelNameEl = document.getElementById('pay-hotel-name');
            if (hotelNameEl) hotelNameEl.innerText = h.name;

            const hotelRoomEl = document.getElementById('pay-hotel-room');
            if (hotelRoomEl) hotelRoomEl.innerText = room.name;

            const checkinEl = document.getElementById('pay-checkin-date');
            if (checkinEl) checkinEl.innerText = `Check-in: ${formatNiceDate(checkinVal)}`;

            const checkoutEl = document.getElementById('pay-checkout-date');
            if (checkoutEl) checkoutEl.innerText = `Check-out: ${formatNiceDate(checkoutVal)} • ${diffDays} Night${diffDays > 1 ? 's' : ''}`;

            const travelersEl = document.getElementById('pay-travelers');
            if (travelersEl) travelersEl.innerText = `${AppState.members} Traveler${AppState.members > 1 ? 's' : ''}`;

            const placesCountEl = document.getElementById('pay-places-count');
            if (placesCountEl) {
                const pCount = (AppState.selectedPlaces && AppState.selectedPlaces.length) || 4;
                placesCountEl.innerText = `${pCount} Place${pCount > 1 ? 's' : ''} in Itinerary`;
            }

            // Calculations: Reconciled with AppState.budget
            // 1. Transport line item calculation and label/icon
            let transportFareNum = 0;
            const transIconEl = document.getElementById('pay-transport-icon');
            const transTitleEl = document.getElementById('pay-transport-title');

            if (AppState.mode === 'car') {
                if (transIconEl) transIconEl.className = 'fa-solid fa-gas-pump text-slate-400';
                if (transTitleEl) transTitleEl.innerText = 'Estimated Fuel & Tolls (Car)';

                if (!AppState.userExplicitHotel && targetBudget <= 11000) {
                    transportFareNum = Math.round((targetBudget * 0.34) / 50) * 50;
                } else if (!AppState.userExplicitHotel && targetBudget < 18000) {
                    transportFareNum = Math.min(4200, Math.round((targetBudget * 0.32) / 50) * 50);
                } else {
                    transportFareNum = 4200;
                    if (r.fuelTollCost) {
                        const parsed = parseInt(r.fuelTollCost.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(parsed)) transportFareNum = parsed;
                    }
                }
            } else {
                const cName = AppState.selectedTransitClassName || (AppState.mode === 'taxi' ? 'Sedan' : (AppState.mode === 'train' ? '3rd AC' : 'AC Seater'));
                if (AppState.mode === 'bus') {
                    if (transIconEl) transIconEl.className = 'fa-solid fa-bus text-warmOrange-500';
                    if (transTitleEl) transTitleEl.innerText = `Transit Tickets (Bus - ${cName}) • ${AppState.members} Pass.`;
                } else if (AppState.mode === 'train') {
                    if (transIconEl) transIconEl.className = 'fa-solid fa-train text-warmOrange-500';
                    if (transTitleEl) transTitleEl.innerText = `Transit Tickets (Train - ${cName}) • ${AppState.members} Pass.`;
                } else if (AppState.mode === 'taxi') {
                    if (transIconEl) transIconEl.className = 'fa-solid fa-taxi text-warmOrange-500';
                    if (transTitleEl) transTitleEl.innerText = `Taxi Fare (${cName})`;
                }

                if (AppState.selectedTransitTicketPrice !== null && AppState.selectedTransitTicketPrice !== undefined) {
                    transportFareNum = AppState.selectedTransitTicketPrice;
                } else {
                    transportFareNum = Math.round((targetBudget * 0.32) / 50) * 50;
                    AppState.selectedTransitTicketPrice = transportFareNum;
                }
            }

            // 2. Room Tariff calculation
            let roomTariff = 0;
            let actualPerNight = room.pricePerNight;
            if (!AppState.userExplicitHotel) {
                if (targetBudget <= 11000) {
                    actualPerNight = Math.min(room.pricePerNight, Math.max(700, Math.round((targetBudget * 0.50) / diffDays / 10) * 10));
                    roomTariff = actualPerNight * diffDays;
                } else if (targetBudget <= 18000) {
                    actualPerNight = Math.min(room.pricePerNight, Math.max(1200, Math.round((targetBudget * 0.48) / diffDays / 10) * 10));
                    roomTariff = actualPerNight * diffDays;
                } else {
                    roomTariff = room.pricePerNight * diffDays;
                    actualPerNight = room.pricePerNight;
                }
            } else {
                roomTariff = room.pricePerNight * diffDays;
                actualPerNight = room.pricePerNight;
            }

            // 3. Sightseeing / Places fees calculation
            let placesFeesNum = 0;
            if (!AppState.userExplicitHotel) {
                const targetRemainder = targetBudget - roomTariff - transportFareNum;
                if (targetRemainder >= 500) {
                    placesFeesNum = targetRemainder;
                } else {
                    placesFeesNum = Math.max(500, Math.round((targetBudget * 0.16) / 50) * 50);
                }
            } else {
                if (typeof PlacesDatabase !== 'undefined' && Array.isArray(AppState.selectedPlaces)) {
                    AppState.selectedPlaces.forEach(pId => {
                        const pl = PlacesDatabase.find(item => item.id === pId);
                        if (pl && pl.fee && pl.fee.includes('₹')) {
                            const parsedFee = parseInt(pl.fee.replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(parsedFee)) placesFeesNum += (parsedFee * AppState.members);
                        }
                    });
                }
                if (placesFeesNum === 0) placesFeesNum = 1600;
            }

            const discountNum = AppState.discountAmount || 0;
            const grandTotalNum = Math.max(0, roomTariff + transportFareNum + placesFeesNum - discountNum);
            const escrowNowNum = Math.round(roomTariff * 0.20);
            const balanceDueNum = roomTariff - escrowNowNum;

            // DOM Updates for Breakdown
            const roomNightsEl = document.getElementById('pay-room-nights');
            if (roomNightsEl) roomNightsEl.innerText = diffDays;

            const perNightEl = document.getElementById('pay-per-night');
            if (perNightEl) perNightEl.innerText = `₹${actualPerNight.toLocaleString('en-IN')}`;

            const totalStayEl = document.getElementById('pay-total-stay');
            if (totalStayEl) totalStayEl.innerText = `₹${roomTariff.toLocaleString('en-IN')}`;

            const fuelCostEl = document.getElementById('pay-fuel-cost');
            if (fuelCostEl) fuelCostEl.innerText = `₹${transportFareNum.toLocaleString('en-IN')}`;

            const placesFeesEl = document.getElementById('pay-places-fees');
            if (placesFeesEl) placesFeesEl.innerText = `₹${placesFeesNum.toLocaleString('en-IN')}`;

            const discountEl = document.getElementById('pay-discount');
            if (discountEl) discountEl.innerText = `-₹${discountNum.toLocaleString('en-IN')}`;

            const grandTotalEl = document.getElementById('pay-grand-total');
            if (grandTotalEl) grandTotalEl.innerText = `₹${grandTotalNum.toLocaleString('en-IN')}`;

            const escrowNowEl = document.getElementById('pay-escrow-now');
            if (escrowNowEl) escrowNowEl.innerText = `₹${escrowNowNum.toLocaleString('en-IN')}`;

            const escrowLaterEl = document.getElementById('pay-escrow-later');
            if (escrowLaterEl) escrowLaterEl.innerText = `₹${balanceDueNum.toLocaleString('en-IN')}`;

            const payBtnText = document.getElementById('btn-pay-text');
            if (payBtnText) payBtnText.innerText = `Pay ₹${escrowNowNum.toLocaleString('en-IN')} Securely`;

            const bottomBalEl = document.getElementById('pay-bottom-balance');
            if (bottomBalEl) bottomBalEl.innerText = `₹${balanceDueNum.toLocaleString('en-IN')}`;

            // Visual Budget Comparison Bar
            const planBudEl = document.getElementById('pay-planned-budget');
            if (planBudEl) planBudEl.innerText = `₹${targetBudget.toLocaleString('en-IN')}`;

            const compTotEl = document.getElementById('pay-comparison-total');
            if (compTotEl) compTotEl.innerText = `₹${grandTotalNum.toLocaleString('en-IN')}`;

            const statusPillEl = document.getElementById('pay-budget-status-pill');
            const diffLabelEl = document.getElementById('pay-budget-diff-label');

            const preDiscountTotal = roomTariff + transportFareNum + placesFeesNum;
            if (preDiscountTotal <= targetBudget + 100) {
                if (statusPillEl) {
                    statusPillEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1';
                    statusPillEl.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Within Budget</span>';
                }
                if (diffLabelEl) {
                    diffLabelEl.className = 'font-bold text-emerald-700';
                    const diff = targetBudget - preDiscountTotal;
                    diffLabelEl.innerText = (diff === 0) ? 'Exact Budget Match' : `₹${Math.abs(diff).toLocaleString('en-IN')} Under Budget`;
                }
            } else {
                if (statusPillEl) {
                    statusPillEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1';
                    statusPillEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Budget Exceeded</span>';
                }
                if (diffLabelEl) {
                    diffLabelEl.className = 'font-bold text-rose-600';
                    const diff = preDiscountTotal - targetBudget;
                    diffLabelEl.innerText = `₹${diff.toLocaleString('en-IN')} Over Budget (Custom Upgrade)`;
                }
            }
        }

        function selectPaymentMethod(method) {
            AppState.selectedPaymentMethod = method;

            // Update Tabs styling
            document.querySelectorAll('.pay-method-tab').forEach(btn => {
                if (btn.getAttribute('data-method') === method) {
                    btn.className = 'pay-method-tab active p-3 rounded-xl border-2 border-warmOrange-500 bg-amber-50 flex flex-col items-center gap-1.5 transition-all shadow-sm';
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('text-slate-600');
                        icon.classList.add('text-warmOrange-600');
                    }
                } else {
                    btn.className = 'pay-method-tab p-3 rounded-xl border-2 border-slate-200 bg-white flex flex-col items-center gap-1.5 hover:border-slate-300 transition-all';
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('text-warmOrange-600');
                        icon.classList.add('text-slate-600');
                    }
                }
            });

            // Toggle form panels
            const panels = {
                'upi': 'pay-form-upi',
                'card': 'pay-form-card',
                'netbanking': 'pay-form-netbanking',
                'wallet': 'pay-form-wallet'
            };

            Object.entries(panels).forEach(([m, panelId]) => {
                const panel = document.getElementById(panelId);
                if (panel) {
                    if (m === method) {
                        panel.classList.remove('hidden');
                    } else {
                        panel.classList.add('hidden');
                    }
                }
            });
        }

        function verifyUpiId() {
            const input = document.getElementById('pay-upi-id');
            const status = document.getElementById('pay-upi-status');
            if (!input || !status) return false;
            const val = input.value.trim();
            if (!val || !val.includes('@') || val.length < 5) {
                status.className = 'text-[11px] font-bold text-rose-600 flex items-center gap-1.5';
                status.innerHTML = '<i class="fa-solid fa-circle-xmark"></i><span>Please enter a valid UPI ID (e.g. name@upi or 9876543210@ybl)</span>';
                status.classList.remove('hidden');
                return false;
            }
            status.className = 'text-[11px] font-bold text-emerald-700 flex items-center gap-1.5';
            status.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>UPI ID verified: Active VPA (Instant Escrow Routing Verified ✓)</span>';
            status.classList.remove('hidden');
            showToast('UPI ID verified successfully!', 'fa-circle-check');
            return true;
        }

        function formatCardNumber(input) {
            let val = input.value.replace(/\D/g, '').substring(0, 16);
            let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
            input.value = formatted;
        }

        function formatCardExpiry(input) {
            let val = input.value.replace(/\D/g, '').substring(0, 4);
            if (val.length >= 3) {
                input.value = val.substring(0, 2) + '/' + val.substring(2);
            } else {
                input.value = val;
            }
        }

        function selectBank(btn, bankName) {
            document.querySelectorAll('.bank-option').forEach(el => {
                el.className = 'bank-option p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-navy-400 text-xs font-bold text-navy-900 flex items-center gap-2 transition-all';
            });
            btn.className = 'bank-option p-3 rounded-xl border-2 border-warmOrange-500 bg-amber-50 text-xs font-bold text-navy-900 flex items-center gap-2 transition-all shadow-sm';
            showToast(`Selected Bank: ${bankName}`, 'fa-building-columns');
        }

        function selectWallet(btn, walletName) {
            document.querySelectorAll('.wallet-option').forEach(el => {
                el.className = 'wallet-option p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-navy-400 text-xs font-bold text-navy-900 flex items-center gap-2 transition-all';
            });
            btn.className = 'wallet-option p-3 rounded-xl border-2 border-warmOrange-500 bg-amber-50 text-xs font-bold text-navy-900 flex items-center gap-2 transition-all shadow-sm';
            showToast(`Selected Wallet: ${walletName}`, 'fa-wallet');
        }

        function applyPromoCode() {
            const input = document.getElementById('pay-promo-input');
            const status = document.getElementById('pay-promo-status');
            const text = document.getElementById('pay-promo-text');
            if (!input) return;
            const code = input.value.trim().toUpperCase();
            if (!code) {
                showToast('Please enter a coupon or promo code.', 'fa-tag');
                return;
            }
            const validCodes = {
                'SARV200': 200,
                'YATRI10': 500,
                'HIMALAYA': 750,
                'FIRSTTRIP': 1000
            };
            if (validCodes[code]) {
                AppState.appliedPromo = code;
                AppState.discountAmount = validCodes[code];
                if (status) {
                    status.className = 'p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-2';
                    if (text) text.innerText = `Promo "${code}" applied! You saved ₹${validCodes[code].toLocaleString('en-IN')}.`;
                    status.classList.remove('hidden');
                }
                showToast(`Promo Applied! ₹${validCodes[code]} saved.`, 'fa-circle-check');
                populatePaymentPage();
            } else {
                if (status) {
                    status.className = 'p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[11px] font-bold flex items-center gap-2';
                    if (text) text.innerText = `Invalid code "${code}". Try SARV200 or YATRI10.`;
                    status.classList.remove('hidden');
                }
                showToast(`Invalid promo code "${code}".`, 'fa-circle-xmark');
            }
        }

        function processPayment() {
            if (AppState.isPaymentProcessing) return;

            const termsCheck = document.getElementById('pay-terms-check');
            if (termsCheck && !termsCheck.checked) {
                showToast('Please accept the Escrow Agreement & terms to proceed.', 'fa-circle-exclamation');
                return;
            }

            const method = AppState.selectedPaymentMethod || 'upi';
            if (method === 'upi') {
                const upiInput = document.getElementById('pay-upi-id');
                const upiVal = upiInput ? upiInput.value.trim() : '';
                if (!upiVal || !upiVal.includes('@')) {
                    showToast('Please enter and verify your UPI ID before paying.', 'fa-mobile-screen');
                    if (upiInput) upiInput.focus();
                    return;
                }
            } else if (method === 'card') {
                const cardNum = document.getElementById('pay-card-number')?.value.trim();
                const cardCvv = document.getElementById('pay-card-cvv')?.value.trim();
                if (!cardNum || cardNum.length < 16 || !cardCvv || cardCvv.length < 3) {
                    showToast('Please enter your 16-digit card number and CVV.', 'fa-credit-card');
                    return;
                }
            }

            AppState.isPaymentProcessing = true;
            const payBtn = document.getElementById('btn-pay-now');
            if (payBtn) {
                payBtn.disabled = true;
                payBtn.classList.add('opacity-75', 'cursor-not-allowed');
            }

            // Calculation values
            const h = AppState.selectedHotel || (typeof HotelsDatabase !== 'undefined' ? HotelsDatabase[0] : { name: 'Manali Stay' });
            const room = (h.rooms && h.rooms.find(rm => rm.id === AppState.selectedRoomId)) || (h.rooms && h.rooms[0]) || { pricePerNight: 3499, name: 'Deluxe Cedar Suite' };

            const checkinVal = AppState.checkinDate || '2026-09-12';
            const checkoutVal = AppState.checkoutDate || '2026-09-15';
            const d1 = new Date(checkinVal);
            const d2 = new Date(checkoutVal);
            let nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
            if (isNaN(nights) || nights < 1) nights = AppState.nights || 3;

            const targetBudget = Number(AppState.budget) || 16000;
            let roomNightlyRate = room.pricePerNight;
            if (!AppState.userExplicitHotel) {
                if (targetBudget <= 11000) {
                    roomNightlyRate = Math.min(room.pricePerNight, Math.max(700, Math.round((targetBudget * 0.50) / nights / 10) * 10));
                } else if (targetBudget <= 18000) {
                    roomNightlyRate = Math.min(room.pricePerNight, Math.max(1200, Math.round((targetBudget * 0.48) / nights / 10) * 10));
                }
            }

            const roomStayTotal = roomNightlyRate * nights;
            const escrowPaid = Math.round(roomStayTotal * 0.20);
            const balanceDue = roomStayTotal - escrowPaid;

            // Generate realistic IDs
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const bookingId = `SY-${new Date().getFullYear()}-MNL-${randomSuffix}`;
            const escrowTxn = `TXN-ESC-${Date.now().toString().slice(-8)}`;

            AppState.bookingId = bookingId;
            AppState.escrowTxnId = escrowTxn;
            AppState.paymentCompleted = true;

            triggerLoader(() => {
                AppState.isPaymentProcessing = false;
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                }

                // Populate modal data
                const bookIdEl = document.getElementById('success-booking-id');
                if (bookIdEl) bookIdEl.innerText = bookingId;

                const hotelEl = document.getElementById('success-hotel-name');
                if (hotelEl) hotelEl.innerText = h.name;

                const roomEl = document.getElementById('success-room-name');
                if (roomEl) roomEl.innerText = room.name;

                const datesEl = document.getElementById('success-stay-dates');
                if (datesEl) datesEl.innerText = `${checkinVal} to ${checkoutVal} (${nights} Nights)`;

                const routeEl = document.getElementById('success-route-name');
                if (routeEl) routeEl.innerText = `${AppState.source} → ${AppState.destination}`;

                const stayEl = document.getElementById('success-total-stay');
                if (stayEl) stayEl.innerText = `₹${roomStayTotal.toLocaleString('en-IN')}`;

                const escrowEl = document.getElementById('success-escrow-paid');
                if (escrowEl) escrowEl.innerText = `₹${escrowPaid.toLocaleString('en-IN')}`;

                const balEl = document.getElementById('success-balance-due');
                if (balEl) balEl.innerText = `₹${balanceDue.toLocaleString('en-IN')}`;

                const methodEl = document.getElementById('success-payment-method');
                if (methodEl) {
                    const methodNames = {
                        'upi': 'UPI (GPay / PhonePe Verified)',
                        'card': 'Debit / Credit Card (256-bit Encrypted)',
                        'netbanking': 'Net Banking (Direct Authorization)',
                        'wallet': 'Digital Wallet Vault'
                    };
                    methodEl.innerText = methodNames[method] || method.toUpperCase();
                }

                const txnEl = document.getElementById('success-txn-id');
                if (txnEl) txnEl.innerText = escrowTxn;

                // Open Success Modal
                const successModal = document.getElementById('modal-payment-success');
                if (successModal) {
                    successModal.classList.remove('hidden');
                    successModal.classList.add('flex');
                    setModalBodyScroll(true);
                }

                showToast(`Payment of ₹${escrowPaid.toLocaleString('en-IN')} Secured in Escrow! Booking ${bookingId} confirmed.`, 'fa-circle-check');
            }, 600, 'Depositing 20% security into Sarvyatri Escrow Vault & securing room...');
        }

        function closePaymentSuccessModal() {
            const modal = document.getElementById('modal-payment-success');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            setModalBodyScroll(false);
        }

        function printBookingReceipt() {
            showToast('Preparing booking confirmation voucher for print / save...', 'fa-file-invoice');
            setTimeout(() => {
                window.print();
            }, 400);
        }

        // Weather Delay Simulator
        let isDelayed = false;
        function toggleDelaySimulation() {
            isDelayed = !isDelayed;
            const alert = document.getElementById('weather-delay-alert');
            const btn = document.getElementById('btn-delay-sim');
            if (isDelayed) {
                alert.classList.remove('hidden');
                btn.className = 'px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-[10px]';
                btn.innerText = 'Clear Delay Simulation';
            } else {
                alert.classList.add('hidden');
                btn.className = 'px-2.5 py-1 rounded-lg bg-navy-900 text-white font-black text-[10px]';
                btn.innerText = 'Simulate Behind-Schedule (+2h)';
            }
        }

        // Post-Trip Feedback Modal Logic
        function openFeedbackModal() {
            const modal = document.getElementById('modal-feedback');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setModalBodyScroll(true);
            }
        }

        function closeFeedbackModal() {
            const modal = document.getElementById('modal-feedback');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            setModalBodyScroll(false);
        }

        function submitTripFeedback(e) {
            e.preventDefault();
            closeFeedbackModal();
            showToast('Feedback successfully registered! Thank you for keeping Sarvyatri verified.');
        }

        // Toast Helper
        function showToast(msg, icon = 'fa-check-circle') {
            const toast = document.getElementById('sarv-toast');
            const text = document.getElementById('toast-text');
            const iconElem = document.getElementById('toast-icon');

            text.innerText = msg;
            iconElem.className = `fa-solid ${icon} text-amber-400`;

            toast.classList.remove('hidden');
            toast.classList.add('flex');

            setTimeout(() => {
                toast.classList.add('hidden');
                toast.classList.remove('flex');
            }, 3400);
        }

        // =============================================================
        // WAYPOINT DETAILS LOGIC (Bug 6 Fix)
        // =============================================================
        const WaypointInfoData = [
            {
                name: "Delhi (Origin Terminal)",
                badge: "Departure Point",
                tag: "0 km Start",
                distance: "0 km",
                time: "Start point (06:00 AM Departure)",
                halt: "Departure Point",
                desc: "Initial departure hub at Kashmiri Gate / NH44 bypass. Full fuel tank inspection & FASTag balance check recommended.",
                facilities: ["HP Fuel Hub", "ATM", "Washrooms", "Tyre Pressure"],
                statusColor: "text-warmOrange-400",
                badgeBg: "bg-warmOrange-500/20 text-warmOrange-300 border border-warmOrange-500/40"
            },
            {
                name: "Chandigarh (Comfort & Meal Stop)",
                badge: "Waypoint Stop 1",
                tag: "248 km • 4h 15m",
                distance: "248 km from origin",
                time: "Arrival est. 10:15 AM",
                halt: "45 mins Recommended Meal & Rest Halt",
                desc: "Sukhna Lake bypass junction. Top highway dhabas, EV fast charger hub (60 kW DC), and sanitised family washrooms.",
                facilities: ["EV DC Fast Charger", "Authentic Dhabas", "Sanitised Washrooms", "Pharmacy"],
                statusColor: "text-amber-400",
                badgeBg: "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            },
            {
                name: "Bilaspur (Scenic Foothills Halt)",
                badge: "Waypoint Stop 2",
                tag: "385 km • 7h 30m",
                distance: "137 km from Stop 1 (385 km total)",
                time: "Arrival est. 02:00 PM",
                halt: "30 mins Mountain Transition Break",
                desc: "Gateway to Himachal foothills along Govind Sagar reservoir. Recommended mountain vehicle check and tea break.",
                facilities: ["IOCL Petrol & Diesel", "Scenic Lake Viewpoint", "Hill Cafe", "Emergency Mechanic"],
                statusColor: "text-blue-400",
                badgeBg: "bg-blue-500/20 text-blue-300 border border-blue-500/40"
            },
            {
                name: "Manali (Solang & Mall Road)",
                badge: "Final Destination",
                tag: "538 km • 11h 45m",
                distance: "153 km from Stop 2 (538 km total)",
                time: "Arrival est. 06:15 PM",
                halt: "Hotel Check-in & Parking Ready",
                desc: "Arrival at valley elevation 2,050 m. Hotel parking navigation, snow condition advisories, and local itinerary ready.",
                facilities: ["Hotel Drop-off", "Mall Road Transit", "Snow Gear Rentals", "24/7 Helpline"],
                statusColor: "text-emerald-400",
                badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            }
        ];

        function showMapWaypointDetails(idx) {
            const data = WaypointInfoData[idx];
            if (!data) return;

            // Highlight active pin and dim others
            [0, 1, 2, 3].forEach(i => {
                const pin = document.getElementById(`waypoint-pin-${i}`);
                if (pin) {
                    if (i === idx) {
                        pin.classList.add('ring-4', 'ring-warmOrange-400', 'scale-110');
                        pin.classList.remove('opacity-70');
                    } else {
                        pin.classList.remove('ring-4', 'ring-warmOrange-400', 'scale-110');
                        pin.classList.add('opacity-70');
                    }
                }
            });

            const card = document.getElementById('nav-waypoint-info-card');
            if (!card) return;

            const facHtml = data.facilities.map(f => `<span class="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-bold text-slate-200 border border-white/10">${f}</span>`).join(' ');

            card.innerHTML = `
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="space-y-1.5 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-0.5 rounded-full ${data.badgeBg} text-[10px] font-black uppercase tracking-wider">
                                ${data.badge}
                            </span>
                            <span class="text-xs font-bold text-slate-300">• ${data.tag}</span>
                        </div>
                        <h4 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                            <span class="${data.statusColor}">${data.name}</span>
                        </h4>
                        <p class="text-xs text-slate-300 leading-relaxed max-w-2xl">${data.desc}</p>
                        <div class="flex flex-wrap items-center gap-1.5 pt-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Facilities:</span>
                            ${facHtml}
                        </div>
                    </div>
                    <div class="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                        <div class="bg-navy-950/90 px-3.5 py-2 rounded-xl border border-slate-700 text-left md:text-right">
                            <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Estimated Halt</span>
                            <span class="text-xs font-black text-warmOrange-400">${data.halt}</span>
                        </div>
                        <button type="button" onclick="showToast('Focused on waypoint: ${data.name.split('(')[0].trim()}', 'fa-location-dot')" class="btn-warm px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md">
                            <i class="fa-solid fa-location-crosshairs"></i><span>Focus Waypoint</span>
                        </button>
                    </div>
                </div>
            `;
        }

        // =============================================================
        // FUEL PUMP & EV CHARGER FINDER LOGIC (Bug 3 Fix)
        // =============================================================
        const FuelStationsDatabase = [
            {
                id: 'fs-1',
                name: 'IndianOil Swagat Highway Hub - Murthal',
                brand: 'IndianOil',
                location: 'NH44 Murthal, Haryana (KM 44)',
                distance: '12 km ahead',
                side: 'Left side of highway',
                rating: 4.8,
                reviews: 1420,
                types: ['petrol', 'cng', 'ev'],
                amenities: ['Clean AC Washrooms', 'Haldiram Express', '24/7 Air & Nitrogen', 'ATM'],
                prices: { petrol: '₹96.72', diesel: '₹89.62', cng: '₹75.59/kg', ev: '₹18/kWh' },
                mapCoord: { left: '16%', top: '74%' },
                isOpen24h: true
            },
            {
                id: 'fs-2',
                name: 'Bharat Petroleum Highway Oasis - Karnal',
                brand: 'Bharat Petroleum',
                location: 'Karnal Bypass, GT Road (KM 122)',
                distance: '48 km ahead',
                side: 'Right side (Direct Flyover Access)',
                rating: 4.7,
                reviews: 980,
                types: ['petrol', 'ev'],
                amenities: ['McDonalds Drive-Thru', 'Tata Power EV 60kW', 'Family Restrooms', 'Baby Care'],
                prices: { petrol: '₹96.65', diesel: '₹89.55', ev: '₹19/kWh' },
                mapCoord: { left: '34%', top: '56%' },
                isOpen24h: true
            },
            {
                id: 'fs-3',
                name: 'HP Green Fuel & CNG Superstation - Panipat',
                brand: 'HPCL',
                location: 'Panipat Toll Plaza (KM 88)',
                distance: '32 km ahead',
                side: 'Left side of highway',
                rating: 4.6,
                reviews: 650,
                types: ['cng', 'petrol'],
                amenities: ['12 High-Flow CNG Dispensers (200 Bar)', 'Tyre Care', 'Highway Cafe'],
                prices: { petrol: '₹96.70', diesel: '₹89.60', cng: '₹75.40/kg' },
                mapCoord: { left: '26%', top: '64%' },
                isOpen24h: true
            },
            {
                id: 'fs-4',
                name: 'Shell Highway Select Station - Ambala',
                brand: 'Shell',
                location: 'Ambala Cantt Junction (KM 198)',
                distance: '86 km ahead',
                side: 'Left side of highway',
                rating: 4.9,
                reviews: 2100,
                types: ['petrol', 'ev'],
                amenities: ['Shell V-Power', 'Costa Coffee Lounge', 'Premium Restrooms', 'EV Fast Charger'],
                prices: { petrol: '₹102.50', diesel: '₹94.20', ev: '₹21/kWh' },
                mapCoord: { left: '52%', top: '42%' },
                isOpen24h: true
            },
            {
                id: 'fs-5',
                name: 'Tata Power Mega EV Fast Charger Hub',
                brand: 'Tata Power EV',
                location: 'Chandigarh Zirakpur Highway (KM 238)',
                distance: '115 km ahead',
                side: 'Highway Service Lane',
                rating: 4.9,
                reviews: 540,
                types: ['ev'],
                amenities: ['4x 120kW Dual CCS2 Guns', 'Comfort Lounge with Wi-Fi', 'Subway & Starbucks', 'Clean Restrooms'],
                prices: { ev: '₹17.50/kWh (Ultra Fast 120kW)' },
                mapCoord: { left: '68%', top: '30%' },
                isOpen24h: true
            },
            {
                id: 'fs-6',
                name: 'HP Mountain Fuels & Diesel Depot',
                brand: 'HPCL',
                location: 'Swarghat - Bilaspur Hill Ascent (KM 320)',
                distance: '168 km ahead',
                side: 'Hill Ascent Left',
                rating: 4.5,
                reviews: 430,
                types: ['petrol'],
                amenities: ['Mountain Grade Diesel', 'Radiator Coolant Top-up', 'Emergency Mechanic Shop'],
                prices: { petrol: '₹97.10', diesel: '₹90.15' },
                mapCoord: { left: '84%', top: '16%' },
                isOpen24h: true
            }
        ];

        let activeFuelFilter = 'all';
        let fuelSearchTerm = '';
        let selectedFuelStationId = 'fs-1';

        function initFuelFinder() {
            renderFuelMapMarkers();
            renderFuelStationsList();
            highlightFuelStation(selectedFuelStationId);
        }

        function filterFuelStations(type) {
            activeFuelFilter = type;
            document.querySelectorAll('#fuel-filter-chips .fuel-chip').forEach(btn => {
                if (btn.getAttribute('data-filter') === type) {
                    btn.className = 'fuel-chip active px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 bg-navy-900 text-white border-navy-900';
                } else {
                    btn.className = 'fuel-chip px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300';
                }
            });
            renderFuelMapMarkers();
            renderFuelStationsList();
        }

        function onFuelSearchInput(val) {
            fuelSearchTerm = (val || '').toLowerCase().trim();
            renderFuelStationsList();
        }

        function getFilteredFuelStations() {
            return FuelStationsDatabase.filter(s => {
                const matchesFilter = (activeFuelFilter === 'all') || s.types.includes(activeFuelFilter);
                const matchesSearch = !fuelSearchTerm || 
                    s.name.toLowerCase().includes(fuelSearchTerm) || 
                    s.brand.toLowerCase().includes(fuelSearchTerm) || 
                    s.location.toLowerCase().includes(fuelSearchTerm);
                return matchesFilter && matchesSearch;
            });
        }

        function renderFuelMapMarkers() {
            const layer = document.getElementById('fuel-map-markers-layer');
            if (!layer) return;
            layer.innerHTML = '';

            FuelStationsDatabase.forEach((s) => {
                const isFiltered = (activeFuelFilter === 'all') || s.types.includes(activeFuelFilter);
                const isSelected = s.id === selectedFuelStationId;

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.onclick = () => highlightFuelStation(s.id);
                btn.style.left = s.mapCoord.left;
                btn.style.top = s.mapCoord.top;
                btn.className = `absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all cursor-pointer z-20 ${
                    isSelected ? 'bg-warmOrange-500 ring-4 ring-white shadow-xl scale-125' : 
                    isFiltered ? 'bg-navy-900/90 text-white hover:scale-110 hover:bg-warmOrange-500 border border-white/60' : 'opacity-30 bg-slate-800'
                }`;
                btn.title = `${s.name} (${s.distance})`;
                
                let iconClass = 'fa-gas-pump';
                if (s.types.includes('ev')) iconClass = 'fa-bolt';
                else if (s.types.includes('cng')) iconClass = 'fa-leaf';

                btn.innerHTML = `<i class="fa-solid ${iconClass} text-xs text-white px-1"></i>`;
                layer.appendChild(btn);
            });
        }

        function highlightFuelStation(id) {
            selectedFuelStationId = id;
            const station = FuelStationsDatabase.find(s => s.id === id);
            if (!station) return;

            const nameEl = document.getElementById('fuel-map-selected-name');
            const metaEl = document.getElementById('fuel-map-selected-meta');
            if (nameEl) nameEl.innerText = station.name;
            if (metaEl) {
                const p = station.prices;
                const priceStr = [
                    p.petrol ? `Petrol: ${p.petrol}` : null,
                    p.diesel ? `Diesel: ${p.diesel}` : null,
                    p.cng ? `CNG: ${p.cng}` : null,
                    p.ev ? `EV: ${p.ev}` : null
                ].filter(Boolean).join(' • ');
                metaEl.innerText = `${station.distance} • ${station.location} • ${priceStr}`;
            }

            renderFuelMapMarkers();

            // Highlight card in list
            document.querySelectorAll('#fuel-stations-list-container .fuel-card').forEach(c => {
                if (c.getAttribute('data-id') === id) {
                    c.classList.add('border-warmOrange-500', 'bg-warmOrange-50/20', 'ring-2', 'ring-warmOrange-500/30');
                    c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    c.classList.remove('border-warmOrange-500', 'bg-warmOrange-50/20', 'ring-2', 'ring-warmOrange-500/30');
                }
            });
        }

        function renderFuelStationsList() {
            const container = document.getElementById('fuel-stations-list-container');
            const badge = document.getElementById('fuel-stations-count-badge');
            if (!container) return;

            const filtered = getFilteredFuelStations();
            if (badge) badge.innerText = `${filtered.length} Results`;

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                        <i class="fa-solid fa-gas-pump text-3xl text-slate-300 mb-2"></i>
                        <p class="font-bold text-xs">No fuel stations matching your filter criteria.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(s => {
                const isSelected = s.id === selectedFuelStationId;
                const typePills = s.types.map(t => {
                    if (t === 'petrol') return '<span class="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black"><i class="fa-solid fa-gas-pump mr-1"></i>Petrol/Diesel</span>';
                    if (t === 'cng') return '<span class="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black"><i class="fa-solid fa-leaf mr-1"></i>CNG</span>';
                    if (t === 'ev') return '<span class="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 text-[10px] font-black"><i class="fa-solid fa-bolt mr-1"></i>CCS2 EV Fast</span>';
                    return '';
                }).join(' ');

                const amenitiesHtml = s.amenities.map(a => `<span class="text-[10px] text-slate-500 font-semibold">• ${a}</span>`).join(' ');

                return `
                    <div data-id="${s.id}" onclick="highlightFuelStation('${s.id}')" class="fuel-card sarv-card p-4 rounded-2xl bg-white border border-slate-200 hover:border-warmOrange-400 cursor-pointer transition-all ${isSelected ? 'border-warmOrange-500 bg-warmOrange-50/20 ring-2 ring-warmOrange-500/30' : ''}">
                        <div class="flex items-start justify-between gap-2">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded-md bg-navy-900 text-white text-[10px] font-black">${s.brand}</span>
                                    <span class="text-xs font-black text-navy-900">${s.name}</span>
                                </div>
                                <p class="text-[11px] text-slate-500 font-medium">${s.location} • <span class="text-slate-700 font-bold">${s.side}</span></p>
                            </div>
                            <div class="text-right shrink-0">
                                <span class="text-xs font-black text-warmOrange-600 block">${s.distance}</span>
                                <span class="text-[10px] text-slate-500"><i class="fa-solid fa-star text-amber-400 mr-0.5"></i>${s.rating} (${s.reviews})</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between gap-2 my-2">
                            <div class="flex flex-wrap items-center gap-1.5">
                                ${typePills}
                            </div>
                            <div class="text-[11px] font-black text-slate-700 shrink-0">
                                ${s.prices.petrol ? `<span class="text-amber-600 mr-1.5">${s.prices.petrol}</span>` : ''}
                                ${s.prices.cng ? `<span class="text-emerald-600 mr-1.5">${s.prices.cng}</span>` : ''}
                                ${s.prices.ev ? `<span class="text-cyan-600">${s.prices.ev}</span>` : ''}
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                            <div class="flex flex-wrap items-center gap-2">
                                ${amenitiesHtml}
                            </div>
                            <button type="button" onclick="event.stopPropagation(); showToast('Added ${s.name.split('-')[0].trim()} as waypoint stop!', 'fa-circle-plus')" class="btn-warm px-3 py-1 rounded-xl text-[11px] font-black shadow-sm shrink-0">
                                Add Stop
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // =============================================================
        // RESTAURANTS & DHABAS GUIDE LOGIC (Bug 4 Fix)
        // =============================================================
        const RestaurantsDatabase = [
            {
                id: 'rest-1',
                name: 'Amrik Sukhdev Dhaba',
                cuisine: 'dhaba',
                cuisineName: 'Authentic Punjabi Dhaba',
                location: 'NH44 Murthal, Haryana',
                distance: '44 km from Delhi',
                rating: 4.9,
                reviews: 84000,
                image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop',
                pricePerPerson: '₹250 - ₹400',
                pureVeg: true,
                specialities: ['Tandoori Aloo Paratha with White Butter', 'Dal Makhani', 'Sweet Lassi in Kulhad'],
                facilities: ['24/7 Dining', '500+ Car Parking', 'Clean Sanitised Restrooms', 'EV Chargers']
            },
            {
                id: 'rest-2',
                name: 'Haveli Heritage Highway Resort',
                cuisine: 'dhaba',
                cuisineName: 'Punjabi Heritage Dining',
                location: 'GT Road, Karnal (KM 130)',
                distance: '130 km from Delhi',
                rating: 4.8,
                reviews: 42000,
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
                pricePerPerson: '₹450 - ₹700',
                pureVeg: true,
                specialities: ['Amritsari Chole Kulche', 'Sarson Ka Saag & Makki Roti', 'Heritage Kulfi'],
                facilities: ['Cultural Folk Village', 'Kids Play Zone', 'Air-Conditioned Dining', 'Clean Restrooms']
            },
            {
                id: 'rest-3',
                name: 'Sagar Ratna Highway Express',
                cuisine: 'south-indian',
                cuisineName: 'South Indian & Pure Veg',
                location: 'Oasis Complex, Karnal Bypass',
                distance: '124 km from Delhi',
                rating: 4.7,
                reviews: 18500,
                image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop',
                pricePerPerson: '₹200 - ₹350',
                pureVeg: true,
                specialities: ['Ghee Roast Masala Dosa', 'Filter Coffee', 'Idli Vada Platter'],
                facilities: ['Quick Highway Takeaway', 'AC Dining', 'Clean Toilets', 'High Chairs for Toddlers']
            },
            {
                id: 'rest-4',
                name: 'Giani Da Dhaba - Dharampur',
                cuisine: 'dhaba',
                cuisineName: 'Himalayan Foothill Dhaba',
                location: 'Dharampur, Kalka-Shimla / Manali Junction',
                distance: '270 km from Delhi',
                rating: 4.6,
                reviews: 29000,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
                pricePerPerson: '₹300 - ₹500',
                pureVeg: false,
                specialities: ['Butter Chicken', 'Lemon Chicken', 'Stuffed Naan & Dal Tadka'],
                facilities: ['Valley Mountain View', 'Open Air Seating', 'Quick Service', 'Card & UPI Payments']
            },
            {
                id: 'rest-5',
                name: 'Haldiram\'s Highway Oasis',
                cuisine: 'pure-veg',
                cuisineName: 'North & South Indian Thali',
                location: 'Panipat Toll Plaza (NH44)',
                distance: '86 km from Delhi',
                rating: 4.7,
                reviews: 31000,
                image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
                pricePerPerson: '₹200 - ₹380',
                pureVeg: true,
                specialities: ['Chole Bhature', 'Raj Kachori', 'Executive Special Thali'],
                facilities: ['Packaged Snacks & Sweets', 'Express Self-Service Counter', 'Clean AC Washrooms']
            },
            {
                id: 'rest-6',
                name: 'Highway Artisan Cafe & Coffee',
                cuisine: 'fast-food',
                cuisineName: 'Cafes & Artisan Bites',
                location: 'Zirakpur Mall Bypass',
                distance: '235 km from Delhi',
                rating: 4.8,
                reviews: 12400,
                image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop',
                pricePerPerson: '₹350 - ₹600',
                pureVeg: false,
                specialities: ['Cold Brew & Espresso', 'Gourmet Grilled Paninis', 'Brownie Sundae'],
                facilities: ['Drive-Thru Window', 'Free High-Speed Wi-Fi', 'Work Desks', 'Pet Friendly Garden']
            }
        ];

        let activeRestaurantCuisine = 'all';
        let restaurantSearchTerm = '';

        function initRestaurants() {
            renderRestaurantsList();
        }

        function setRestaurantCuisine(cuisine) {
            activeRestaurantCuisine = cuisine;
            document.querySelectorAll('#restaurant-cuisine-tabs .restaurant-tab').forEach(btn => {
                if (btn.getAttribute('data-cuisine') === cuisine) {
                    btn.className = 'restaurant-tab active px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 bg-navy-900 text-white border-navy-900';
                } else {
                    btn.className = 'restaurant-tab px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300';
                }
            });
            renderRestaurantsList();
        }

        function onRestaurantSearchInput(val) {
            restaurantSearchTerm = (val || '').toLowerCase().trim();
            renderRestaurantsList();
        }

        function renderRestaurantsList() {
            const container = document.getElementById('restaurants-grid-container');
            if (!container) return;

            const filtered = RestaurantsDatabase.filter(r => {
                const matchesCuisine = (activeRestaurantCuisine === 'all') || 
                    (activeRestaurantCuisine === 'pure-veg' ? r.pureVeg : r.cuisine === activeRestaurantCuisine);
                const matchesSearch = !restaurantSearchTerm ||
                    r.name.toLowerCase().includes(restaurantSearchTerm) ||
                    r.cuisineName.toLowerCase().includes(restaurantSearchTerm) ||
                    r.location.toLowerCase().includes(restaurantSearchTerm) ||
                    r.specialities.some(s => s.toLowerCase().includes(restaurantSearchTerm));
                return matchesCuisine && matchesSearch;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                        <i class="fa-solid fa-utensils text-4xl text-slate-300 mb-3"></i>
                        <h4 class="font-black text-sm text-navy-900">No restaurants match your search</h4>
                        <p class="text-xs text-slate-400 mt-1">Try switching cuisine filters or clear the search keyword.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(r => {
                const specHtml = r.specialities.map(s => `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">${s}</span>`).join(' ');
                const facHtml = r.facilities.map(f => `<span class="text-[10px] text-slate-500 font-semibold">• ${f}</span>`).join(' ');

                return `
                    <div class="sarv-card rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-warmOrange-500 transition-all flex flex-col group">
                        <div class="relative h-48 overflow-hidden bg-slate-100">
                            <img src="${r.image}" alt="${r.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <div class="absolute top-3 left-3 flex items-center gap-1.5">
                                <span class="px-2.5 py-1 rounded-xl bg-navy-900/90 backdrop-blur-sm text-white text-[10px] font-black">
                                    ${r.cuisineName}
                                </span>
                                ${r.pureVeg ? '<span class="px-2 py-0.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black"><i class="fa-solid fa-leaf mr-1"></i>Pure Veg</span>' : ''}
                            </div>
                            <div class="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-sm text-navy-900 text-xs font-black shadow-md flex items-center gap-1">
                                <i class="fa-solid fa-star text-amber-400"></i>
                                <span>${r.rating}</span>
                                <span class="text-slate-400 text-[10px]">(${r.reviews > 1000 ? (r.reviews/1000).toFixed(1)+'k' : r.reviews})</span>
                            </div>
                        </div>

                        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                                <div class="flex items-start justify-between gap-2">
                                    <h4 class="font-black text-base text-navy-900">${r.name}</h4>
                                    <span class="text-xs font-black text-warmOrange-600 shrink-0">${r.pricePerPerson}</span>
                                </div>
                                <p class="text-xs text-slate-500 mt-1"><i class="fa-solid fa-location-dot text-rose-500 mr-1"></i>${r.location} • <span class="font-bold text-slate-700">${r.distance}</span></p>
                                
                                <div class="mt-3">
                                    <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Famous Must-Tries:</span>
                                    <div class="flex flex-wrap gap-1">
                                        ${specHtml}
                                    </div>
                                </div>
                            </div>

                            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div class="flex flex-wrap gap-2">
                                    ${facHtml}
                                </div>
                                <button type="button" onclick="showToast('Added ${r.name} to meal halt plan!', 'fa-utensils')" class="btn-warm px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm shrink-0">
                                    Plan Halt
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // =============================================================
        // TAXI & OUTSTATION CAB BOOKING LOGIC (Bug 7 Fix)
        // =============================================================
        const TaxiFleetDatabase = [
            {
                id: 'sedan',
                name: 'Comfort Sedan (Dzire / Etios)',
                category: 'Economy Outstation',
                tag: 'Best for 2-4 Pax',
                passengers: 4,
                bags: 2,
                ratePerKm: 11,
                basePrice: 5499,
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop',
                features: ['AC Sedan with Boot Space', 'Tolls & State Tax Included', 'Verified Chauffeur', 'Clean Interiors']
            },
            {
                id: 'suv',
                name: 'Prime Family SUV (Ertiga / Carens)',
                category: 'Spacious 6-Seater',
                tag: 'Popular Family Choice',
                passengers: 6,
                bags: 3,
                ratePerKm: 15,
                basePrice: 7850,
                image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop',
                features: ['6-Seater Dual AC', 'Roof Carrier for Extra Luggage', 'Extra Legroom', 'Hill Driving Specialist']
            },
            {
                id: 'innova',
                name: 'Luxury MPV (Innova Crysta / Hycross)',
                category: 'Executive Hill Ride',
                tag: 'Maximum Comfort',
                passengers: 7,
                bags: 4,
                ratePerKm: 19,
                basePrice: 9999,
                image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop',
                features: ['Recliner Captain Chairs', 'Ultra Soft Hill Suspension', 'Rear USB Chargers', 'Senior Chauffeur']
            },
            {
                id: 'tempo',
                name: '12-Seater Luxury Tempo Traveller',
                category: 'Group Transit',
                tag: 'Ideal for 8-12 Pax',
                passengers: 12,
                bags: 10,
                ratePerKm: 26,
                basePrice: 13400,
                image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&auto=format&fit=crop',
                features: ['Individual Pushback Seats', 'Massive Luggage Boot', 'Entertainment Screen', 'Dual Air Conditioning']
            }
        ];

        let selectedTaxiVehicleId = 'innova';
        let taxiTripType = 'one-way';
        let taxiPassengersCount = 4;

        function initTaxiBookingPage() {
            const pickInput = document.getElementById('taxi-pickup-input');
            const dropInput = document.getElementById('taxi-drop-input');
            if (pickInput && (AppState.source || AppState.origin)) pickInput.value = AppState.source || AppState.origin;
            if (dropInput && AppState.destination) dropInput.value = AppState.destination;

            if (AppState.members && AppState.members > 0) {
                taxiPassengersCount = AppState.members;
                const disp = document.getElementById('taxi-passengers-display');
                if (disp) {
                    const bags = Math.max(1, Math.floor(taxiPassengersCount * 0.7));
                    disp.innerText = `${taxiPassengersCount} Travellers, ${bags} Bags`;
                }
            }

            // Auto-select vehicle that accommodates passenger count
            const currentVeh = TaxiFleetDatabase.find(v => v.id === selectedTaxiVehicleId);
            if (!currentVeh || currentVeh.passengers < taxiPassengersCount) {
                const suitableVeh = TaxiFleetDatabase.find(v => v.passengers >= taxiPassengersCount) || TaxiFleetDatabase[TaxiFleetDatabase.length - 1];
                if (suitableVeh) selectedTaxiVehicleId = suitableVeh.id;
            }

            renderTaxiFleetGrid();
            updateTaxiFareBreakdown();
        }

        function setTaxiTripType(type) {
            taxiTripType = type;
            document.querySelectorAll('#taxi-trip-type-tabs .taxi-tab').forEach(btn => {
                if (btn.getAttribute('data-type') === type) {
                    btn.className = 'taxi-tab active px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer bg-navy-900 text-white border-navy-900';
                } else {
                    btn.className = 'taxi-tab px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300';
                }
            });
            updateTaxiFareBreakdown();
        }

        function adjustTaxiPax(delta) {
            taxiPassengersCount = Math.max(1, Math.min(12, taxiPassengersCount + delta));
            const disp = document.getElementById('taxi-passengers-display');
            if (disp) {
                const bags = Math.max(1, Math.floor(taxiPassengersCount * 0.7));
                disp.innerText = `${taxiPassengersCount} Travellers, ${bags} Bags`;
            }
            // Auto recommend vehicle size if pax exceeds capacity
            const activeVeh = TaxiFleetDatabase.find(v => v.id === selectedTaxiVehicleId);
            if (activeVeh && taxiPassengersCount > activeVeh.passengers) {
                const betterVeh = TaxiFleetDatabase.find(v => v.passengers >= taxiPassengersCount) || TaxiFleetDatabase[TaxiFleetDatabase.length - 1];
                if (betterVeh) selectTaxiVehicle(betterVeh.id);
            }
        }

        function selectTaxiVehicle(vehId) {
            const veh = TaxiFleetDatabase.find(v => v.id === vehId);
            if (veh && veh.passengers < taxiPassengersCount) {
                showToast(`Vehicle capacity (${veh.passengers} seats) is insufficient for ${taxiPassengersCount} passengers. Please choose a larger cab.`, 'fa-users');
                return;
            }
            selectedTaxiVehicleId = vehId;
            renderTaxiFleetGrid();
            updateTaxiFareBreakdown();
        }

        function renderTaxiFleetGrid() {
            const container = document.getElementById('taxi-fleet-grid');
            if (!container) return;

            container.innerHTML = TaxiFleetDatabase.map(v => {
                const isSelected = v.id === selectedTaxiVehicleId;
                const multiplier = taxiTripType === 'round-trip' ? 1.85 : taxiTripType === 'hourly' ? 0.6 : 1.0;
                const estPrice = Math.round(v.basePrice * multiplier);
                const featsHtml = v.features.map(f => `<span class="text-[11px] text-slate-600 font-semibold">• ${f}</span>`).join(' ');
                const isCapacityExceeded = v.passengers < taxiPassengersCount;

                return `
                    <div onclick="selectTaxiVehicle('${v.id}')" class="sarv-card p-4 rounded-2xl bg-white border-2 transition-all cursor-pointer ${
                        isSelected ? 'border-warmOrange-500 ring-2 ring-warmOrange-500/20 shadow-lg' : 
                        isCapacityExceeded ? 'border-slate-200 opacity-60 hover:border-rose-300 shadow-sm' : 
                        'border-slate-200 hover:border-slate-300 shadow-sm'
                    }">
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <img src="${v.image}" alt="${escapeHtml(v.name)}" class="w-20 h-16 rounded-xl object-cover border border-slate-200 shrink-0">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded-md bg-navy-900 text-white text-[10px] font-black">${v.category}</span>
                                        <span class="px-2 py-0.5 rounded-md bg-warmOrange-100 text-warmOrange-800 text-[10px] font-bold">${v.tag}</span>
                                        ${isCapacityExceeded ? `<span class="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">Max ${v.passengers} Pax</span>` : ''}
                                    </div>
                                    <h4 class="font-black text-sm text-navy-900 mt-1">${v.name}</h4>
                                    <div class="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                        <span class="${isCapacityExceeded ? 'text-rose-600 font-bold' : ''}"><i class="fa-solid fa-users ${isCapacityExceeded ? 'text-rose-500' : 'text-slate-400'} mr-1"></i>Up to ${v.passengers} Seats</span>
                                        <span><i class="fa-solid fa-suitcase text-slate-400 mr-1"></i>${v.bags} Bags</span>
                                        <span><i class="fa-solid fa-snowflake text-cyan-500 mr-1"></i>AC</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <span class="text-lg font-black text-navy-900">₹${estPrice.toLocaleString('en-IN')}</span>
                                <span class="text-[10px] text-slate-400 font-bold">₹${v.ratePerKm}/km included</span>
                                <button type="button" class="mt-1 px-3 py-1 rounded-xl text-xs font-black ${
                                    isSelected ? 'bg-warmOrange-500 text-white' : 
                                    isCapacityExceeded ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                                    'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }">
                                    ${isSelected ? '<i class="fa-solid fa-check mr-1"></i>Selected' : isCapacityExceeded ? 'Too Small' : 'Select'}
                                </button>
                            </div>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1">
                            ${featsHtml}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateTaxiFareBreakdown() {
            const card = document.getElementById('taxi-fare-breakdown-card');
            if (!card) return;

            const v = TaxiFleetDatabase.find(item => item.id === selectedTaxiVehicleId) || TaxiFleetDatabase[0];
            const multiplier = taxiTripType === 'round-trip' ? 1.85 : taxiTripType === 'hourly' ? 0.6 : 1.0;
            const totalFare = Math.round(v.basePrice * multiplier);
            const tollTax = Math.round(totalFare * 0.08);
            const driverAllowance = taxiTripType === 'round-trip' ? 800 : 400;
            const baseCabFare = totalFare - tollTax - driverAllowance;

            const tripLabel = taxiTripType === 'round-trip' ? 'Round Trip (Delhi ↔ Manali)' : 
                              taxiTripType === 'hourly' ? 'Local Hourly Package (80km)' : 'One-Way Direct Outstation';

            card.innerHTML = `
                <div class="space-y-1 pb-3 border-b border-slate-100">
                    <span class="text-[10px] uppercase font-black tracking-wider text-slate-400">Selected Vehicle</span>
                    <h4 class="font-black text-base text-navy-900">${v.name}</h4>
                    <p class="text-xs text-warmOrange-600 font-bold">${tripLabel}</p>
                </div>

                <div class="space-y-2 text-xs">
                    <div class="flex justify-between text-slate-600">
                        <span>Base Fare:</span>
                        <span class="font-bold text-navy-900">₹${baseCabFare.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between text-slate-600">
                        <span>State Taxes & Tolls Est.:</span>
                        <span class="font-bold text-navy-900">₹${tollTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between text-slate-600">
                        <span>Chauffeur Night & Hill Allowance:</span>
                        <span class="font-bold text-navy-900">₹${driverAllowance.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between text-slate-600">
                        <span>GST (5% Included):</span>
                        <span class="font-bold text-emerald-600">Included</span>
                    </div>
                    <div class="flex justify-between font-black text-navy-900 text-sm pt-2 border-t border-slate-200">
                        <span>Total Payable Fare:</span>
                        <span class="text-emerald-600 text-base">₹${totalFare.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <button type="button" onclick="confirmTaxiBooking()" class="btn-warm w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                    <i class="fa-solid fa-car"></i><span>Confirm & Dispatch Cab</span>
                </button>
            `;
        }

        function confirmTaxiBooking() {
            const v = TaxiFleetDatabase.find(item => item.id === selectedTaxiVehicleId) || TaxiFleetDatabase[0];
            if (v && v.passengers < taxiPassengersCount) {
                showToast(`Selected vehicle (${v.name}) accommodates up to ${v.passengers} passengers, but you have ${taxiPassengersCount}. Please select a larger vehicle.`, 'fa-triangle-exclamation');
                return;
            }

            const multiplier = taxiTripType === 'round-trip' ? 1.85 : taxiTripType === 'hourly' ? 0.6 : 1.0;
            const totalFare = Math.round(v.basePrice * multiplier);

            const modal = document.getElementById('taxi-booking-confirm-modal');
            const idEl = document.getElementById('confirmed-booking-id');
            const vehEl = document.getElementById('confirmed-vehicle-name');
            const pickEl = document.getElementById('confirmed-pickup-loc');
            const dropEl = document.getElementById('confirmed-drop-loc');
            const fareEl = document.getElementById('confirmed-total-fare');

            const pickInput = document.getElementById('taxi-pickup-input');
            const dropInput = document.getElementById('taxi-drop-input');

            if (idEl) idEl.innerText = `SY-CAB-${Math.floor(10000 + Math.random() * 90000)}`;
            if (vehEl) vehEl.innerText = v.name;
            if (pickEl) pickEl.innerText = pickInput ? pickInput.value : 'Delhi NCR';
            if (dropEl) dropEl.innerText = dropInput ? dropInput.value : 'Manali Mall Road';
            if (fareEl) fareEl.innerText = `₹${totalFare.toLocaleString('en-IN')}`;

            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setModalBodyScroll(true);
            }
        }

        function closeTaxiConfirmModal() {
            const modal = document.getElementById('taxi-booking-confirm-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            setModalBodyScroll(false);
        }
