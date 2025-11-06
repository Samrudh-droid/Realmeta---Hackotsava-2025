// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. MOCK DATABASE (Restored to 5 paintings)
    // =========================================================================
    const museumData = {
        "mona-lisa": {
            id: "mona-lisa",
            title: "Mona Lisa",
            artist: "Leonardo da Vinci",
            year: "c. 1503–1506",
            description: "The Mona Lisa is a half-length portrait painting by Italian artist Leonardo da Vinci. Considered an archetypal masterpiece of the Italian Renaissance, it has been described as 'the best known, the most visited, the most written about, the most sung about, the most parodied work of art in the world.'",
            story: "The painting's fame is the result of a complex story. It was not until the mid-19th century that it became a celebrated work. The biggest event in its history was its theft in 1911 by an Italian patriot who believed it belonged to Italy. The two-year search and its triumphant return to the Louvre in 1913 cemented its status as a global icon.",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
            audio: "DEPRECATED", 
            video: "https://www.youtube.com/embed/S26fKmyh6rY", 
            related: ["starry-night", "pearl-earring", "shakuntala"]
        },
        "starry-night": {
            id: "starry-night",
            title: "The Starry Night",
            artist: "Vincent van Gogh",
            year: "1889",
            description: "The Starry Night is an oil-on-canvas painting by the Dutch Post-Impressionist painter Vincent van Gogh. Painted in June 1889, it depicts the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence, just before sunrise, with the addition of an imaginary village.",
            story: "Van Gogh painted this piece during his 12-month stay at the Saint-Paul-de-Mausole asylum. It is one of his most personal and imaginative works, created at a time of great emotional turmoil. The swirling cypress tree in the foreground is often seen as a symbol of death and turmoil, while the luminous stars represent hope.",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
            audio: "DEPRECATED", 
            video: "https://www.youtube.com/embed/ozlu-8sU3T0", 
            related: ["mona-lisa", "pearl-earring", "bharat-mata"]
        },
        "pearl-earring": {
            id: "pearl-earring",
            title: "Girl with a Pearl Earring",
            artist: "Johannes Vermeer",
            year: "c. 1665",
            description: "Girl with a Pearl Earring is an oil painting by Dutch Golden Age painter Johannes Vermeer. It is a tronie of a young woman in an exotic dress, a turban, and a very large pearl earring. The painting has been in the collection of the Mauritshuis in The Hague since 1902.",
            story: "Unlike a portrait, this painting is a 'tronie,' a Dutch word for a painting of a head or bust not intended to be a specific person. It's a study of expression and costume. The dark, flat background pushes the girl forward, and her gaze, directed at the viewer, creates an intimate and mysterious connection that has fascinated art lovers for centuries.",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg",
            audio: "DEPRECATED", 
            video: "https://www.youtube.com/embed/pM_b3oQq3aA", 
            related: ["mona-lisa", "starry-night"]
        },
        "bharat-mata": {
            id: "bharat-mata",
            title: "Bharat Mata",
            artist: "Abanindranath Tagore",
            year: "1905",
            description: "Bharat Mata (Mother India) is a work painted by the Indian painter Abanindranath Tagore in 1905. The work depicts a saffron-clad woman, dressed like a sadhvi, holding a book, sheaves of paddy, a piece of white cloth, and a rudraksha mala (prayer beads) in her four hands.",
            story: "This painting was created during the Swadeshi movement, a period of intense nationalist protest against the partition of Bengal. Tagore's 'Bharat Mata' became a powerful icon of India's struggle for freedom, personifying a unified, divine motherland for whom the activists could fight.",
            image: "bharat_mata.jpg", 
            audio: "DEPRECATED", 
            video: "https://www.youtube.com/embed/O-x81_MltpM", 
            related: ["shakuntala", "starry-night"]
        },
        "shakuntala": {
            id: "shakuntala",
            title: "Shakuntala",
            artist: "Raja Ravi Varma",
            year: "c. 1870",
            description: "Shakuntala is an epic painting by the Indian painter Raja Ravi Varma. It depicts Shakuntala, a central character from the Hindu epic Mahabharata, who is pretending to remove a thorn from her foot, while actually looking back for her lover, Dushyanta. Her friends, Anasuya and Priyamvada, look on.",
            story: "Raja Ravi Varma is considered one of the greatest painters in the history of Indian art. He was one of the first to blend the techniques of European academic art with purely Indian subject matter. This painting is a classic example of his work, bringing a scene from ancient mythology to life with a sense of realism and emotion that was new to Indian art at the time.",
            image: "shakuntala.jpg", 
            audio: "DEPRECATED", 
            video: "https://www.youtube.com/embed/K9G9Yp8-UfE", 
            related: ["bharat-mata", "mona-lisa"]
        }
    };

    // =========================================================================
    // 2. STATE & ANALYTICS
    // =========================================================================
    const appState = {
        currentView: 'view-portal-choice',
        viewHistory: ['view-portal-choice'],
        visitorId: null,
        consentGiven: false,
        currentExhibit: null,
        dwellStartTime: null,
        uploadedFilename: null, // To store the filename for our "trick"
    };

    const analyticsData = {
        visitors: new Set(),
        totalViews: 0,
        dwellTimes: {}, 
        viewsByExhibit: {}, 
        scanSuccess: { qr: 0, ai: 0 },
        scanFail: { qr: 0, ai: 0 },
        liveFeed: [],
    };

    const chartInstances = {
        pieChart: null,
        barChart: null,
    };


    // =========================================================================
    // 3. DOM ELEMENT SELECTORS
    // =========================================================================
    const dom = {
        header: document.querySelector('header'),
        appTitle: document.getElementById('app-title'),
        backButton: document.getElementById('back-button'),
        headerSpacer: document.getElementById('header-spacer'),
        views: document.querySelectorAll('.view'),
        
        // Consent Banner
        consentBanner: document.getElementById('privacy-consent-banner'),
        btnAcceptConsent: document.getElementById('btn-accept-consent'),
        btnDeclineConsent: document.getElementById('btn-decline-consent'),

        // Portal Choice
        btnGoVisitor: document.getElementById('btn-go-visitor'),
        btnGoAuditor: document.getElementById('btn-go-auditor'),

        // Visitor Home
        btnGoIdentify: document.getElementById('btn-go-identify'),
        btnGoScan: document.getElementById('btn-go-scan'),
        btnGoTour: document.getElementById('btn-go-tour'),
        
        // Identify (AI) - Reverted
        viewIdentify: document.getElementById('view-identify'),
        imageUploadInput: document.getElementById('image-upload-input'),
        imagePreviewContainer: document.getElementById('image-preview-container'),
        imagePreview: document.getElementById('image-preview'),
        btnIdentifyImage: document.getElementById('btn-identify-image'),
        identifyLoader: document.getElementById('identify-loader'),
        identifyResult: document.getElementById('identify-result'),
        btnManualSelect1: document.getElementById('btn-manual-select-1'),

        // Scan (QR)
        viewScan: document.getElementById('view-scan'),
        qrReader: document.getElementById('qr-reader'),
        qrScanOverlay: document.getElementById('qr-scan-overlay'),
        qrScanResult: document.getElementById('qr-scan-result'),
        btnManualSelect2: document.getElementById('btn-manual-select-2'),

        // Tour List
        tourListContainer: document.getElementById('tour-list-container'),

        // Content
        viewContent: document.getElementById('view-content'),
        contentImg: document.getElementById('content-img'),
        contentTitle: document.getElementById('content-title'),
        contentArtist: document.getElementById('content-artist'),
        tabContainer: document.querySelector('nav[aria-label="Tabs"]'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        contentDescription: document.getElementById('content-description'),
        contentStory: document.getElementById('content-story'),
        
        // TTS buttons
        btnListen: document.getElementById('btn-listen-story'),
        btnStopListen: document.getElementById('btn-stop-story'),
        contentVideo: document.getElementById('content-video'),
        relatedContainer: document.getElementById('tab-related'),

        // Auditor
        passwordInput: document.getElementById('password-input'),
        btnLoginAuditor: document.getElementById('btn-auditor-login'),
        loginError: document.getElementById('login-error'),

        // Dashboard
        btnGoManageArt: document.getElementById('btn-go-manage-art'),
        statVisitors: document.getElementById('stat-visitors'),
        statViews: document.getElementById('stat-views'),
        statDwellTime: document.getElementById('stat-dwell-time'),
        statPopular: document.getElementById('stat-popular'),
        statQrSuccess: document.getElementById('stat-qr-success'),
        statQrFail: document.getElementById('stat-qr-fail'),
        statAiSuccess: document.getElementById('stat-ai-success'),
        statAiFail: document.getElementById('stat-ai-fail'),
        liveFeedContainer: document.getElementById('live-feed-container'),
        exhibitPieChart: document.getElementById('exhibitPieChart').getContext('2d'),
        dwellTimeBarChart: document.getElementById('dwellTimeBarChart').getContext('2d'),

        // Manage Art
        manageArtListContainer: document.getElementById('manage-art-list-container'),
        btnAddArt: document.getElementById('btn-add-new-art'),
        addArtMessage: document.getElementById('add-art-message'),
    };

    // QR Scanner Instance
    let html5QrCode = null;


    // =========================================================================
    // 4. CORE FUNCTIONS
    // =========================================================================

    function showView(viewId, title = 'Welcome') {
        // Stop all media when navigating
        stopQrScanner();
        stopSpeechSynthesis();
        
        if (appState.currentView === 'view-content') {
            dom.contentVideo.src = dom.contentVideo.src; 
        }
        if (appState.currentView === 'view-content' && appState.currentExhibit && appState.dwellStartTime) {
            const dwellEnd = Date.now();
            const duration = (dwellEnd - appState.dwellStartTime) / 1000;
            logEvent('dwell_time', { exhibitId: appState.currentExhibit, duration: duration });
            appState.currentExhibit = null;
            appState.dwellStartTime = null;
        }

        dom.views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        
        if (targetView) {
            targetView.classList.add('active');
            appState.currentView = viewId;
            if (appState.viewHistory[appState.viewHistory.length - 1] !== viewId) {
                appState.viewHistory.push(viewId);
            }
            updateHeader(title);

            // Start media if needed
            if (viewId === 'view-scan') startQrScanner();
            if (viewId === 'view-content') appState.dwellStartTime = Date.now();
            if (viewId === 'view-dashboard') updateDashboard();
        } else {
            console.error(`View with ID ${viewId} not found.`);
        }
    }

    function updateHeader(title) {
        dom.appTitle.textContent = title;
        if (appState.currentView === 'view-portal-choice') {
            dom.backButton.classList.add('hidden');
            dom.headerSpacer.classList.remove('hidden');
        } else {
            dom.backButton.classList.remove('hidden');
            dom.headerSpacer.classList.add('hidden');
        }
    }

    function goBack() {
        if (appState.viewHistory.length <= 1) return;
        appState.viewHistory.pop();
        let lastViewId = appState.viewHistory[appState.viewHistory.length - 1];
        
        let title = 'Welcome';
        if (lastViewId === 'view-home') title = 'Visitor Portal';
        else if (lastViewId === 'view-auditor-login') title = 'Auditor Login';
        else if (lastViewId === 'view-dashboard') title = 'Dashboard';
        else if (lastViewId === 'view-tour') title = 'Guided Tour';
        else if (lastViewId === 'view-scan') title = 'Scan QR Code';
        else if (lastViewId === 'view-identify') title = 'Identify by Picture';
        else if (lastViewId === 'view-manage-art') title = 'Manage Artworks';
        else if (lastViewId === 'view-content' && appState.currentExhibit) {
            title = museumData[appState.currentExhibit]?.title || 'Artwork';
        }

        // Manually navigate without using showView()
        dom.views.forEach(view => view.classList.remove('active'));
        document.getElementById(lastViewId).classList.add('active');
        appState.currentView = lastViewId;
        updateHeader(title);

        // Stop all media
        stopQrScanner();
        stopSpeechSynthesis();
        if (appState.currentView !== 'view-content') {
            dom.contentVideo.src = dom.contentVideo.src;
        }

        // Restart only the media for the view we are going back to
        if (lastViewId === 'view-scan') startQrScanner();
    }

    function populateContent(exhibitId) {
        const item = museumData[exhibitId];
        if (!item) {
            console.error(`Exhibit ${exhibitId} not found.`);
            return;
        }

        appState.currentExhibit = exhibitId;
        logEvent('view_exhibit', { exhibitId });

        dom.contentImg.src = item.image;
        dom.contentImg.alt = item.title;
        dom.contentTitle.textContent = item.title;
        dom.contentArtist.textContent = item.artist;
        dom.contentDescription.textContent = item.description;
        dom.contentStory.textContent = item.story;
        dom.contentVideo.src = item.video;
        
        // Reset TTS buttons
        dom.btnListen.classList.remove('hidden');
        dom.btnStopListen.classList.add('hidden');

        resetTabs();

        dom.relatedContainer.innerHTML = '';
        if (item.related && item.related.length > 0) {
            item.related.forEach(relatedId => {
                const relatedItem = museumData[relatedId];
                if (relatedItem) {
                    const el = document.createElement('button');
                    el.className = "flex items-center w-full p-3 bg-neutral-50 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors";
                    el.innerHTML = `
                        <img src="${relatedItem.image}" alt="${relatedItem.title}" class="w-16 h-16 rounded-md object-cover mr-4">
                        <div>
                            <p class="font-semibold text-neutral-800 text-left">${relatedItem.title}</p>
                            <p class="text-neutral-600 text-sm text-left">${relatedItem.artist}</p>
                        </div>
                    `;
                    el.onclick = () => {
                        showView('view-content', relatedItem.title);
                        populateContent(relatedId);
                        dom.viewContent.parentElement.scrollTop = 0;
                    };
                    dom.relatedContainer.appendChild(el);
                }
            });
        } else {
            dom.relatedContainer.innerHTML = '<p class="text-neutral-500">No related works found.</p>';
        }
        showView('view-content', item.title);
    }

    function resetTabs() {
        dom.tabButtons.forEach(btn => {
            btn.setAttribute('aria-current', btn.dataset.tab === 'tab-about' ? 'page' : 'false');
        });
        dom.tabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== 'tab-about');
        });
    }

    function populateTourList() {
        dom.tourListContainer.innerHTML = '';
        Object.values(museumData).forEach(item => {
            const el = document.createElement('button');
            el.className = "flex items-center w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]";
            el.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="w-20 h-20 rounded-lg object-cover mr-4">
                <div class="text-left">
                    <p class="text-lg font-bold text-neutral-800">${item.title}</p>
                    <p class="text-md text-neutral-600">${item.artist}</p>
                </div>
                <i class="ph-bold ph-caret-right text-2xl text-primary-600 ml-auto"></i>
            `;
            el.onclick = () => populateContent(item.id);
            dom.tourListContainer.appendChild(el);
        });
    }

    function populateManageArtList() {
        dom.manageArtListContainer.innerHTML = '';
        Object.values(museumData).forEach(item => {
            const el = document.createElement('div');
            el.className = "flex items-center w-full p-3 bg-white rounded-lg shadow-sm border border-neutral-200";
            el.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="w-12 h-12 rounded-md object-cover mr-3">
                <div class="flex-1 text-left">
                    <p class="font-semibold text-neutral-800">${item.title}</p>
                    <p class="text-neutral-500 text-sm">ID: ${item.id}</p>
                </div>
                <button class="p-2 rounded-full hover:bg-red-100 text-red-600 delete-art-btn">
                    <i class="ph-bold ph-trash text-lg"></i>
                </button>
            `;
            el.querySelector('.delete-art-btn').onclick = () => {
                alert(`Note: Deleting is disabled in this demo.\nWould delete "${item.title}".`);
            };
            dom.manageArtListContainer.appendChild(el);
        });
    }

    // =========================================================================
    // 5. SPEECH SYNTHESIS (TTS) FUNCTIONS
    // =========================================================================

    function startSpeechSynthesis() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); 
        }
        
        const item = museumData[appState.currentExhibit];
        if (!item || !item.story) return;

        const utterance = new SpeechSynthesisUtterance(item.story);
        
        const voices = speechSynthesis.getVoices();
        const indianVoice = voices.find(voice => voice.lang === 'en-IN');
        if (indianVoice) {
            utterance.voice = indianVoice;
        } else {
             utterance.voice = voices.find(voice => voice.lang === 'en-GB' || voice.lang === 'en-US');
        }

        utterance.onstart = () => {
            dom.btnListen.classList.add('hidden');
            dom.btnStopListen.classList.remove('hidden');
        };

        utterance.onend = () => {
            dom.btnListen.classList.remove('hidden');
            dom.btnStopListen.classList.add('hidden');
        };
        
        utterance.onerror = () => {
            dom.btnListen.classList.remove('hidden');
            dom.btnStopListen.classList.add('hidden');
        };

        speechSynthesis.speak(utterance);
    }

    function stopSpeechSynthesis() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            dom.btnListen.classList.remove('hidden');
            dom.btnStopListen.classList.add('hidden');
        }
    }


    // =========================================================================
    // 6. SCANNING & IDENTIFICATION
    // =========================================================================

    // --- QR SCANNER ---

    function startQrScanner() {
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("qr-reader");
        }
        dom.qrScanResult.textContent = '';
        dom.qrScanOverlay.classList.remove('hidden');
        dom.qrScanOverlay.innerHTML = '<p class="text-white text-lg font-medium">Starting camera...</p>';
        
        if (html5QrCode.isScanning) {
            dom.qrScanOverlay.classList.add('hidden');
            document.getElementById('qr-reader-line').classList.remove('hidden');
            return;
        }

        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => handleQrScanSuccess(decodedText),
            (errorMessage) => { /* Scan failure, do nothing */ }
        ).then(() => {
            dom.qrScanOverlay.classList.add('hidden');
            document.getElementById('qr-reader-line').classList.remove('hidden');
        }).catch(err => {
            dom.qrScanOverlay.innerHTML = `<p class="text-red-400 text-center p-4">Camera Error. Please grant permission and refresh. <br><br> ${err.message}</p>`;
        });
    }

    function stopQrScanner() {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                document.getElementById('qr-reader-line').classList.add('hidden');
                dom.qrScanOverlay.classList.remove('hidden');
                dom.qrScanOverlay.innerHTML = '<p class="text-white text-lg font-medium">Starting camera...</p>';
            }).catch(err => console.error("Failed to stop QR scanner:", err));
        }
    }

    function handleQrScanSuccess(exhibitId) {
        stopQrScanner();
        if (museumData[exhibitId]) {
            logEvent('scan_success', { type: 'qr', exhibitId });
            dom.qrScanResult.textContent = `Success! Loading "${museumData[exhibitId].title}"...`;
            dom.qrScanResult.className = 'mt-4 text-center text-green-600 font-medium';
            setTimeout(() => {
                populateContent(exhibitId);
                dom.qrScanResult.textContent = '';
            }, 1000);
        } else {
            logEvent('scan_fail', { type: 'qr', scannedValue: exhibitId });
            dom.qrScanResult.textContent = 'Invalid QR Code. This artwork is not in our system.';
            dom.qrScanResult.className = 'mt-4 text-center text-red-600 font-medium';
            setTimeout(() => {
                if (appState.currentView === 'view-scan') startQrScanner();
            }, 2000);
        }
    }

    // --- AI IDENTIFICATION (File Upload Method) ---

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            appState.uploadedFilename = file.name; // Store the filename
            const reader = new FileReader();
            reader.onload = (event) => {
                dom.imagePreview.src = event.target.result;
                dom.imagePreviewContainer.classList.remove('hidden');
                dom.btnIdentifyImage.classList.remove('hidden');
                dom.identifyResult.textContent = '';
            };
            reader.readAsDataURL(file);
        }
    }

    // Helper function for showing success
    function showIdentificationSuccess(artId) {
        logEvent('scan_success', { type: 'ai', exhibitId: artId });
        dom.identifyResult.className = 'mt-4 text-center text-lg font-medium text-green-600';
        dom.identifyResult.textContent = `Verified! This is "${museumData[artId].title}". Loading...`;
        
        setTimeout(() => {
            populateContent(artId);
            // Reset identify view
            dom.imagePreviewContainer.classList.add('hidden');
            dom.imageUploadInput.value = null; 
            dom.identifyResult.textContent = '';
            dom.btnIdentifyImage.classList.add('hidden');
            appState.uploadedFilename = null; // Clear stored filename
        }, 1500);
    }

    // "Smart" simulation that checks filename
    function simulateImageIdentify() {
        dom.btnIdentifyImage.classList.add('hidden');
        dom.identifyLoader.classList.remove('hidden');
        dom.identifyResult.textContent = '';

        const filename = appState.uploadedFilename;
        let matchedArtId = null;

        // --- The "Smart" Trick ---
        // We check for parts of the name to make it more flexible
        if (filename && (filename.toLowerCase().includes('shakuntala'))) {
            matchedArtId = 'shakuntala';
        } else if (filename && (filename.toLowerCase().includes('bharat'))) {
            matchedArtId = 'bharat-mata';
        } else if (filename && (filename.toLowerCase().includes('mona'))) {
            matchedArtId = 'mona-lisa';
        } else if (filename && (filename.toLowerCase().includes('starry'))) {
            matchedArtId = 'starry-night';
        } else if (filename && (filename.toLowerCase().includes('pearl'))) {
            matchedArtId = 'pearl-earring';
        }
        // --- End of Trick ---

        // Simulate network delay
        setTimeout(() => {
            dom.identifyLoader.classList.add('hidden');

            if (matchedArtId) {
                // --- We found a match by filename! ---
                showIdentificationSuccess(matchedArtId);
            } else {
                // --- No filename match, run the RANDOM simulation ---
                const isReal = Math.random() > 0.2; // 80% chance
                if (isReal) {
                    const artKeys = Object.keys(museumData);
                    const randomArtId = artKeys[Math.floor(Math.random() * artKeys.length)];
                    showIdentificationSuccess(randomArtId);
                } else {
                    logEvent('scan_fail', { type: 'ai' });
                    dom.identifyResult.className = 'mt-4 text-center text-lg font-medium text-red-600';
                    dom.identifyResult.textContent = 'Authentication Failed. This artwork could not be verified.';
                    dom.btnIdentifyImage.classList.remove('hidden');
                }
            }
            appState.uploadedFilename = null; // Clear filename after use
        }, 2500);
    }


    // =========================================================================
    // 7. ANALYTICS & DASHBOARD
    // =========================================================================

    function initAnalytics() {
        appState.visitorId = `visitor_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        appState.consentGiven = true;
        logEvent('visitor_join', { visitorId: appState.visitorId });
    }
    
    function logEvent(type, data = {}) {
        if (!appState.consentGiven && type !== 'visitor_join') return;

        const timestamp = new Date();
        const event = { type, timestamp, ...data };
        analyticsData.liveFeed.unshift(event);
        if (analyticsData.liveFeed.length > 50) analyticsData.liveFeed.pop();

        switch (type) {
            case 'visitor_join':
                analyticsData.visitors.add(data.visitorId);
                break;
            case 'view_exhibit':
                analyticsData.totalViews++;
                analyticsData.viewsByExhibit[data.exhibitId] = (analyticsData.viewsByExhibit[data.exhibitId] || 0) + 1;
                break;
            case 'dwell_time':
                if (!analyticsData.dwellTimes[data.exhibitId]) {
                    analyticsData.dwellTimes[data.exhibitId] = [];
                }
                analyticsData.dwellTimes[data.exhibitId].push(data.duration);
                break;
            case 'scan_success':
                if (data.type === 'qr') analyticsData.scanSuccess.qr++;
                if (data.type === 'ai') analyticsData.scanSuccess.ai++;
                break;
            case 'scan_fail':
                if (data.type === 'qr') analyticsData.scanFail.qr++;
                if (data.type === 'ai') analyticsData.scanFail.ai++;
                break;
        }
        if (appState.currentView === 'view-dashboard') {
            updateDashboard();
        }
    }

    function updateDashboard() {
        dom.statVisitors.textContent = analyticsData.visitors.size;
        dom.statViews.textContent = analyticsData.totalViews;

        let totalDwell = 0;
        let dwellCount = 0;
        let mostPopularId = null;
        let maxViews = 0;

        Object.keys(analyticsData.dwellTimes).forEach(id => {
            const times = analyticsData.dwellTimes[id];
            totalDwell += times.reduce((a, b) => a + b, 0);
            dwellCount += times.length;
        });
        const avgDwell = (dwellCount > 0) ? (totalDwell / dwellCount) : 0;
        dom.statDwellTime.textContent = `${avgDwell.toFixed(1)}s`;

        Object.keys(analyticsData.viewsByExhibit).forEach(id => {
            const views = analyticsData.viewsByExhibit[id];
            if (views > maxViews) {
                maxViews = views;
                mostPopularId = id;
            }
        });
        dom.statPopular.textContent = mostPopularId ? (museumData[mostPopularId]?.title || 'N/A') : 'N/A';
        
        dom.statQrSuccess.textContent = analyticsData.scanSuccess.qr;
        dom.statQrFail.textContent = analyticsData.scanFail.qr;
        dom.statAiSuccess.textContent = analyticsData.scanSuccess.ai;
        dom.statAiFail.textContent = analyticsData.scanFail.ai;

        updateCharts();
        updateLiveFeed();
    }

    function initCharts() {
        const chartColors = {
            primary: 'rgba(79, 70, 229, 0.8)',
            colors: ['rgba(79, 70, 229, 0.8)', 'rgba(217, 119, 6, 0.8)', 'rgba(5, 150, 105, 0.8)', 'rgba(225, 29, 72, 0.8)', 'rgba(147, 51, 234, 0.8)']
        };

        if (chartInstances.pieChart) chartInstances.pieChart.destroy();
        chartInstances.pieChart = new Chart(dom.exhibitPieChart, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: chartColors.colors, borderColor: '#ffffff', borderWidth: 2 }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } } }
        });

        if (chartInstances.barChart) chartInstances.barChart.destroy();
        chartInstances.barChart = new Chart(dom.dwellTimeBarChart, {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Avg. Dwell (s)', data: [], backgroundColor: chartColors.primary, borderRadius: 4 }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
        });
    }

    function updateCharts() {
        if (!chartInstances.pieChart || !chartInstances.barChart) {
            initCharts();
        }

        const pieLabels = [];
        const pieData = [];
        Object.keys(analyticsData.viewsByExhibit).forEach(id => {
            if (museumData[id]) {
                pieLabels.push(museumData[id].title);
                pieData.push(analyticsData.viewsByExhibit[id]);
            }
        });
        chartInstances.pieChart.data.labels = pieLabels;
        chartInstances.pieChart.data.datasets[0].data = pieData;
        chartInstances.pieChart.update();

        const barLabels = [];
        const barData = [];
        Object.keys(analyticsData.dwellTimes).forEach(id => {
            if (museumData[id]) {
                barLabels.push(museumData[id].title);
                const times = analyticsData.dwellTimes[id];
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                barData.push(avg.toFixed(1));
            }
        });
        chartInstances.barChart.data.labels = barLabels;
        chartInstances.barChart.data.datasets[0].data = barData;
        chartInstances.barChart.update();
    }

    function updateLiveFeed() {
        dom.liveFeedContainer.innerHTML = '';
        if (analyticsData.liveFeed.length === 0) {
            dom.liveFeedContainer.innerHTML = '<p class="text-neutral-500">Waiting for live data...</p>';
            return;
        }

        analyticsData.liveFeed.forEach(event => {
            const el = document.createElement('div');
            el.className = 'p-2 rounded-md bg-white border border-neutral-200 text-sm';
            let icon = 'ph-info';
            let color = 'text-neutral-600';
            let text = `Event: ${event.type}`;

            switch (event.type) {
                case 'visitor_join':
                    icon = 'ph-user-plus'; color = 'text-blue-600'; text = `New visitor joined.`; break;
                case 'view_exhibit':
                    icon = 'ph-eye'; color = 'text-primary-600'; text = `Viewed <strong>${museumData[event.exhibitId]?.title || 'Unknown'}</strong>.`; break;
                case 'dwell_time':
                    icon = 'ph-timer'; color = 'text-secondary-700'; text = `Spent <strong>${event.duration.toFixed(1)}s</strong> on <strong>${museumData[event.exhibitId]?.title || 'Unknown'}</strong>.`; break;
                case 'scan_success':
                    icon = 'ph-check-circle'; color = 'text-green-600'; text = `Successful ${event.type.toUpperCase()} scan.`; break;
                case 'scan_fail':
                    icon = 'ph-warning-circle'; color = 'text-red-600'; text = `Failed ${event.type.toUpperCase()} scan.`; break;
            }

            el.innerHTML = `
                <span class="flex items-center ${color}">
                    <i class="ph-bold ${icon} mr-2 text-lg"></i>
                    <span>${text}</span>
                    <span class="ml-auto text-xs text-neutral-400 font-mono">${event.timestamp.toLocaleTimeString()}</span>
                </span>
            `;
            dom.liveFeedContainer.appendChild(el);
        });
    }


    // =========================================================================
    // 8. EVENT LISTENERS
    // =========================================================================

    // Header
    dom.backButton.addEventListener('click', goBack);

    // Consent
    dom.btnAcceptConsent.addEventListener('click', () => {
        dom.consentBanner.classList.add('hidden');
        initAnalytics();
    });
    
    dom.btnDeclineConsent.addEventListener('click', () => {
        dom.consentBanner.classList.add('hidden');
    });

    // Portal Choice
    dom.btnGoVisitor.addEventListener('click', () => {
        showView('view-home', 'Visitor Portal');
        if (!appState.visitorId && !appState.consentGiven) {
            dom.consentBanner.classList.remove('hidden');
        }
    });
    dom.btnGoAuditor.addEventListener('click', () => {
        showView('view-auditor-login', 'Auditor Login');
        dom.consentBanner.classList.add('hidden');
    });

    // Visitor Home
    dom.btnGoIdentify.addEventListener('click', () => showView('view-identify', 'Identify by Picture'));
    dom.btnGoScan.addEventListener('click', () => showView('view-scan', 'Scan QR Code'));
    dom.btnGoTour.addEventListener('click', () => showView('view-tour', 'Guided Tour'));
    
    // Manual Tour Links
    dom.btnManualSelect1.addEventListener('click', () => showView('view-tour', 'Guided Tour'));
    dom.btnManualSelect2.addEventListener('click', () => showView('view-tour', 'Guided Tour'));
    
    // Identify (AI) - Reverted
    dom.imageUploadInput.addEventListener('change', handleImageUpload);
    dom.btnIdentifyImage.addEventListener('click', simulateImageIdentify);

    // Auditor Login
    dom.btnLoginAuditor.addEventListener('click', () => {
        const pass = dom.passwordInput.value;
        if (pass === 'siddarth') { 
            dom.loginError.textContent = '';
            showView('view-dashboard', 'Dashboard');
            initCharts();
            updateDashboard();
        } else {
            dom.loginError.textContent = 'Invalid password. Please try again.';
            dom.passwordInput.focus();
        }
    });

    // Dashboard
    dom.btnGoManageArt.addEventListener('click', () => showView('view-manage-art', 'Manage Artworks'));

    // Manage Art
    dom.btnAddArt.addEventListener('click', () => {
        dom.addArtMessage.classList.remove('hidden');
        dom.addArtMessage.textContent = 'Feature to add art is disabled in this demo.';
        setTimeout(() => dom.addArtMessage.classList.add('hidden'), 3000);
    });

    // Content Tabs
    dom.tabContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button.tab-btn');
        if (!targetButton) return;

        dom.tabButtons.forEach(btn => btn.removeAttribute('aria-current'));
        dom.tabContents.forEach(content => content.classList.add('hidden'));

        targetButton.setAttribute('aria-current', 'page');
        const tabId = targetButton.dataset.tab;
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }

        // Stop TTS if user clicks away from the media tab
        if (tabId !== 'tab-media') {
            stopSpeechSynthesis();
        }
    });

    // TTS Button Listeners
    dom.btnListen.addEventListener('click', startSpeechSynthesis);
    dom.btnStopListen.addEventListener('click', stopSpeechSynthesis);


    // =========================================================================
    // 9. INITIALIZATION
    // =========================================================================
    function init() {
        // Prime the TTS engine by getting voices
        speechSynthesis.getVoices();
        
        populateTourList();
        populateManageArtList();
        showView('view-portal-choice', 'Welcome');
    }

    init();
});