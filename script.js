// DOM Elements - consolidated and updated
const elements = {
    form: document.getElementById('reqForm'),
    getLocationBtn: document.getElementById('getLocationBtn'),
    submitBtn: document.getElementById('submitBtn'),
    locationStatus: document.getElementById('locationStatus'),
    locationDetails: document.getElementById('locationDetails'),
    latitudeValue: document.getElementById('latitudeValue'),
    longitudeValue: document.getElementById('longitudeValue'),
    accuracyValue: document.getElementById('accuracyValue'),
    viewOnMapBtn: document.getElementById('viewOnMap'),
    mechanicMap: document.getElementById('mechanicMap'),
    successModal: document.getElementById('successModal'),
    whatsappFloat: document.getElementById('whatsappFloat'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileCloseBtn: document.getElementById('mobileCloseBtn'),
    mobileNav: document.getElementById('mobileNav'),
    nameInput: document.getElementById('name'),
    phoneInput: document.getElementById('phone'),
    carInput: document.getElementById('car'),
    issueSelect: document.getElementById('issue')
};

// State
let userLocation = null;
let currentStep = 1;
let slideInterval = null;

// Mobile Menu Functionality - improved with better event handling
const overlay = document.createElement('div');
overlay.className = 'mobile-overlay';
overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
`;
document.body.appendChild(overlay);

function openMobileMenu() {
    elements.mobileNav.classList.add('open');
    overlay.classList.add('active');
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    elements.mobileNav.classList.remove('open');
    overlay.classList.remove('active');
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
}

// Event Listeners
elements.mobileMenuBtn?.addEventListener('click', openMobileMenu);
elements.mobileCloseBtn?.addEventListener('click', closeMobileMenu);
overlay.addEventListener('click', closeMobileMenu);

// Close menu when clicking on a link
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#formSection') {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(() => {
                document.getElementById("formSection").scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }, 300);
        } else {
            closeMobileMenu();
        }
    });
});

// Close menu with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.mobileNav.classList.contains('open')) {
        closeMobileMenu();
    }
});

// Form Step Navigation
function nextStep(step) {
    if (!validateCurrentStep()) {
        return;
    }
    
    // Animate step transition
    const currentStepElement = document.querySelector(`#step${currentStep}`);
    const nextStepElement = document.querySelector(`#step${step}`);
    
    if (currentStepElement && nextStepElement) {
        currentStepElement.classList.remove('active');
        document.querySelectorAll('.flow-step')[currentStep - 1].classList.remove('active');
        
        currentStep = step;
        
        nextStepElement.classList.add('active');
        document.querySelectorAll('.flow-step')[currentStep - 1].classList.add('active');
        
        // Smooth animation
        nextStepElement.style.opacity = '0';
        nextStepElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            nextStepElement.style.transition = 'all 0.3s ease';
            nextStepElement.style.opacity = '1';
            nextStepElement.style.transform = 'translateY(0)';
        }, 10);
    }
}

function prevStep(step) {
    const currentStepElement = document.querySelector(`#step${currentStep}`);
    const prevStepElement = document.querySelector(`#step${step}`);
    
    if (currentStepElement && prevStepElement) {
        currentStepElement.classList.remove('active');
        document.querySelectorAll('.flow-step')[currentStep - 1].classList.remove('active');
        
        currentStep = step;
        
        prevStepElement.classList.add('active');
        document.querySelectorAll('.flow-step')[currentStep - 1].classList.add('active');
    }
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            if (!elements.nameInput.value.trim() || !elements.phoneInput.value.trim()) {
                showToast('Please fill in your name and phone number.', 'warning');
                return false;
            }
            
            // Validate phone number format (Ghana specific)
            const phone = elements.phoneInput.value.trim().replace(/\D/g, '');
            if (phone.length < 10) {
                showToast('Please enter a valid Ghanaian phone number.', 'warning');
                return false;
            }
            return true;
            
        case 2:
            if (!elements.carInput.value.trim()) {
                showToast('Please enter your vehicle details.', 'warning');
                return false;
            }
            
            if (!elements.issueSelect.value) {
                showToast('Please select an issue.', 'warning');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'warning' ? '#ffaa00' : '#00cc88'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slide-in 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-out 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Get Live Location - improved with better error handling
elements.getLocationBtn?.addEventListener('click', getCurrentLocation);

async function getCurrentLocation() {
    const statusDot = elements.locationStatus?.querySelector('.status-dot');
    const statusText = elements.locationStatus?.querySelector('span');
    
    // Show loading state
    elements.getLocationBtn.innerHTML = `
        <i class="fas fa-satellite-dish fa-spin"></i>
        <span>Detecting Location...</span>
    `;
    elements.getLocationBtn.disabled = true;
    
    if (statusDot) statusDot.style.background = '#ffaa00';
    if (statusText) statusText.textContent = 'Detecting your location...';
    
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.', 'warning');
        handleLocationError({ code: 0 });
        return;
    }
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            });
        });
        
        handleLocationSuccess(position);
    } catch (error) {
        handleLocationError(error);
    }
}

function handleLocationSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    userLocation = { lat, lng, accuracy };
    
    // Update UI
    elements.getLocationBtn.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Location Captured!</span>
    `;
    elements.getLocationBtn.style.background = 'linear-gradient(45deg, #00cc88, #00ffc6)';
    elements.getLocationBtn.disabled = false;
    
    const statusDot = elements.locationStatus?.querySelector('.status-dot');
    const statusText = elements.locationStatus?.querySelector('span');
    if (statusDot) statusDot.style.background = '#00cc88';
    if (statusText) statusText.textContent = 'Live location ready';
    
    // Show location details
    if (elements.locationDetails) {
        elements.locationDetails.classList.remove('hidden');
        if (elements.latitudeValue) elements.latitudeValue.textContent = lat.toFixed(6);
        if (elements.longitudeValue) elements.longitudeValue.textContent = lng.toFixed(6);
        if (elements.accuracyValue) elements.accuracyValue.textContent = `${Math.round(accuracy)} meters`;
    }
    
    // Enable submit button
    if (elements.submitBtn) {
        elements.submitBtn.disabled = false;
    }
    
    // Show mechanic map
    if (elements.mechanicMap) {
        setTimeout(() => {
            elements.mechanicMap.classList.remove('hidden');
            elements.mechanicMap.style.animation = 'slide-up 0.5s ease-out';
        }, 500);
    }
    
    // Animate WhatsApp float
    animateWhatsAppFloat();
    
    // Update counter stats
    animateCounters();
    
    // Get approximate address
    getAddressFromCoords(lat, lng);
}

function handleLocationError(error) {
    console.error("Geolocation error:", error);
    
    elements.getLocationBtn.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>Allow Location Access</span>
    `;
    elements.getLocationBtn.disabled = false;
    
    const statusDot = elements.locationStatus?.querySelector('.status-dot');
    const statusText = elements.locationStatus?.querySelector('span');
    
    if (statusDot) statusDot.style.background = '#ff4757';
    
    let errorMessage = 'Unable to get location.';
    if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable in browser settings.';
    } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Check your connection.';
    } else if (error.code === 3) {
        errorMessage = 'Location request timed out.';
    }
    
    if (statusText) statusText.textContent = errorMessage;
    
    // Offer manual location entry
    setTimeout(() => {
        if (confirm('Unable to get your location. Would you like to enter it manually?')) {
            promptManualLocation();
        }
    }, 1000);
}

function promptManualLocation() {
    const manualLocation = prompt("Please enter your location (street, landmark, etc.):");
    if (manualLocation) {
        userLocation = { manual: manualLocation };
        
        elements.getLocationBtn.innerHTML = `
            <i class="fas fa-map-pin"></i>
            <span>Manual Location Set</span>
        `;
        elements.getLocationBtn.style.background = 'linear-gradient(45deg, #ffaa00, #ffcc00)';
        
        const statusDot = elements.locationStatus?.querySelector('.status-dot');
        const statusText = elements.locationStatus?.querySelector('span');
        if (statusDot) statusDot.style.background = '#ffaa00';
        if (statusText) statusText.textContent = 'Manual location entered';
        
        if (elements.locationDetails) {
            elements.locationDetails.classList.remove('hidden');
            if (elements.latitudeValue) elements.latitudeValue.textContent = 'Manual';
            if (elements.longitudeValue) elements.longitudeValue.textContent = 'Location';
            if (elements.accuracyValue) elements.accuracyValue.textContent = 'N/A';
        }
        
        if (elements.submitBtn) {
            elements.submitBtn.disabled = false;
        }
    }
}

// Get approximate address from coordinates - with rate limiting
let lastGeocodeTime = 0;
const GEOCODE_DELAY = 1000; // 1 second delay between requests

async function getAddressFromCoords(lat, lng) {
    const now = Date.now();
    if (now - lastGeocodeTime < GEOCODE_DELAY) {
        return;
    }
    
    lastGeocodeTime = now;
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        if (data.display_name && elements.locationDetails) {
            const address = data.display_name.split(',').slice(0, 3).join(',');
            let addressElement = elements.locationDetails.querySelector('.address');
            
            if (!addressElement) {
                addressElement = document.createElement('p');
                addressElement.className = 'address small';
                elements.locationDetails.appendChild(addressElement);
            }
            
            addressElement.textContent = `📍 ${address}`;
        }
    } catch (err) {
        console.log("Address lookup failed:", err);
    }
}

// View on Map
elements.viewOnMapBtn?.addEventListener('click', () => {
    if (userLocation && userLocation.lat) {
        const url = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
        openInNewTab(url);
    } else if (userLocation?.manual) {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userLocation.manual)}`;
        openInNewTab(url);
    }
});

// Form Submission - UPDATED WHATSAPP FUNCTIONALITY
elements.form?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!userLocation) {
        showToast("⚠️ Please share your location first", 'warning');
        return;
    }
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Get form data
    const name = elements.nameInput.value.trim();
    const phone = elements.phoneInput.value.trim().replace(/\D/g, '');
    const car = elements.carInput.value.trim();
    const issue = elements.issueSelect.value;
    
    // Show loading state
    const originalContent = elements.submitBtn.innerHTML;
    elements.submitBtn.innerHTML = `
        <i class="fab fa-whatsapp"></i>
        <span>Preparing Request...</span>
        <div class="submit-spinner">
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
        </div>
    `;
    elements.submitBtn.disabled = true;
    
    // Create WhatsApp message
    const message = createWhatsAppMessage(name, phone, car, issue, userLocation);
    
    // Store request locally (backup)
    storeRequestLocally({ name, phone, car, issue, location: userLocation });
    
    // Send to WhatsApp
    try {
        const success = await sendToWhatsApp(message);
        
        if (success) {
            showToast('✅ Request sent successfully!', 'success');
            setTimeout(() => {
                showSuccessModal();
                resetForm();
            }, 1500);
        } else {
            fallbackToClipboard(message);
        }
    } catch (error) {
        console.error('Submission failed:', error);
        fallbackToClipboard(message);
    } finally {
        elements.submitBtn.disabled = false;
        elements.submitBtn.innerHTML = originalContent;
    }
});

// Create WhatsApp message - improved formatting
function createWhatsAppMessage(name, phone, car, issue, location) {
    const issueText = getIssueText(issue);
    const timestamp = new Date().toLocaleString('en-GH', {
        timeZone: 'Africa/Accra',
        hour12: true
    });
    
    let message = `🛠️ *BS AUTO-CONNECT EMERGENCY REQUEST* 🛠️\n\n`;
    message += `👤 *Client:* ${name}\n`;
    message += `📱 *Phone:* ${phone}\n`;
    message += `🚗 *Vehicle:* ${car}\n`;
    message += `🔧 *Issue:* ${issueText}\n`;
    message += `🕒 *Time:* ${timestamp}\n\n`;
    
    if (location.manual) {
        message += `📍 *Location:* ${location.manual}\n`;
        message += `🗺️ *Maps:* https://maps.google.com/?q=${encodeURIComponent(location.manual)}\n\n`;
    } else {
        message += `📍 *Live Coordinates:*\n`;
        message += `Lat: ${location.lat.toFixed(6)}\n`;
        message += `Lng: ${location.lng.toFixed(6)}\n`;
        message += `Accuracy: ${Math.round(location.accuracy)}m\n\n`;
        
        const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
        message += `🗺️ *Google Maps:* ${mapsUrl}\n\n`;
    }
    
    message += `⏱️ *Priority:* HIGH\n`;
    message += `🚨 *Status:* AWAITING DISPATCH\n\n`;
    message += `ℹ️ _Please contact client via this number_`;
    
    return message;
}

// Send to WhatsApp with improved error handling
async function sendToWhatsApp(message) {
    const whatsappNumber = '+233573961829';
    const encodedMessage = encodeURIComponent(message);
    
    // Try different URL formats
    const urlFormats = [
        `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
        `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`,
        `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`
    ];
    
    for (const url of urlFormats) {
        try {
            const success = await tryWhatsAppUrl(url);
            if (success) return true;
        } catch (error) {
            console.log(`URL ${url} failed:`, error);
            continue;
        }
    }
    
    return false;
}

function tryWhatsAppUrl(url) {
    return new Promise((resolve) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        
        // Add to body and click
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            resolve(true); // Assume success if no error
        }, 100);
    });
}

// Fallback to clipboard
async function fallbackToClipboard(message) {
    try {
        await navigator.clipboard.writeText(message);
        showToast('✅ Message copied to clipboard! Opening WhatsApp...', 'success');
        
        // Try to open WhatsApp
        setTimeout(() => {
            window.open('https://wa.me/+233573961829', '_blank');
        }, 1000);
        
        showSuccessModal();
        resetForm();
    } catch (err) {
        showToast('📋 Please copy this message manually and send to +233573961829 on WhatsApp', 'warning');
        console.log('Message to copy:', message);
    }
}

// Store request locally
function storeRequestLocally(data) {
    try {
        const requests = JSON.parse(localStorage.getItem('bsautoconnect_requests') || '[]');
        const requestData = {
            ...data,
            timestamp: new Date().toISOString(),
            status: 'pending',
            id: Date.now().toString()
        };
        
        requests.unshift(requestData); // Add to beginning
        if (requests.length > 50) requests.pop(); // Keep only last 50
        
        localStorage.setItem('bsautoconnect_requests', JSON.stringify(requests));
    } catch (error) {
        console.error('Failed to store locally:', error);
    }
}

// Reset form
function resetForm() {
    if (elements.form) elements.form.reset();
    
    // Reset buttons
    if (elements.submitBtn) {
        elements.submitBtn.disabled = true;
        elements.submitBtn.innerHTML = `
            <i class="fab fa-whatsapp"></i>
            Send Request via WhatsApp
        `;
    }
    
    if (elements.getLocationBtn) {
        elements.getLocationBtn.innerHTML = `
            <i class="fas fa-crosshairs"></i>
            <span>Get My Live Location</span>
        `;
        elements.getLocationBtn.style.background = 'linear-gradient(45deg, var(--secondary), var(--accent))';
        elements.getLocationBtn.disabled = false;
    }
    
    // Hide location details
    if (elements.locationDetails) {
        elements.locationDetails.classList.add('hidden');
    }
    
    if (elements.mechanicMap) {
        elements.mechanicMap.classList.add('hidden');
    }
    
    // Reset state
    userLocation = null;
    currentStep = 1;
    
    // Reset steps
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.flow-step').forEach(step => step.classList.remove('active'));
    document.querySelector('#step1')?.classList.add('active');
    document.querySelectorAll('.flow-step')[0]?.classList.add('active');
}

// Helper Functions
function getIssueText(issueValue) {
    const issues = {
        'flat-tire': '🚗 Flat Tire',
        'battery': '🔋 Dead Battery',
        'engine': '🔥 Engine Won\'t Start',
        'keys': '🔑 Locked Out',
        'fuel': '⛽ Out of Fuel',
        'other': '❓ Other Issue'
    };
    return issues[issueValue] || issueValue;
}

function showSuccessModal() {
    if (elements.successModal) {
        elements.successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (!elements.successModal.classList.contains('hidden')) {
                closeModal();
            }
        }, 10000);
    }
}

function closeModal() {
    if (elements.successModal) {
        elements.successModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Open in new tab helper
function openInNewTab(url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
}

// Animate counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count')) || 0;
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// Animate WhatsApp float
function animateWhatsAppFloat() {
    if (elements.whatsappFloat) {
        elements.whatsappFloat.style.animation = 'none';
        setTimeout(() => {
            elements.whatsappFloat.style.animation = 'float 1s ease-in-out 3';
        }, 10);
    }
}

// Testimonial Slider Functionality
function initTestimonialSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    if (!testimonialCards.length) return;
    
    let currentSlide = 0;
    const totalSlides = testimonialCards.length;
    
    function updateSlider() {
        // Update slider track
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // Update cards
        testimonialCards.forEach((card, index) => {
            card.classList.remove('active');
            if (index === currentSlide) {
                card.classList.add('active');
            }
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSlide) {
                dot.classList.add('active');
            }
        });
    }
    
    // Event listeners for buttons
    prevBtn?.addEventListener('click', () => {
        currentSlide = currentSlide > 0 ? currentSlide - 1 : totalSlides - 1;
        updateSlider();
        resetAutoSlide();
    });
    
    nextBtn?.addEventListener('click', () => {
        currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
        updateSlider();
        resetAutoSlide();
    });
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
            resetAutoSlide();
        });
    });
    
    // Auto-slide
    function startAutoSlide() {
        slideInterval = setInterval(() => {
            currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
            updateSlider();
        }, 5000);
    }
    
    function resetAutoSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
            startAutoSlide();
        }
    }
    
    // Pause on hover
    if (sliderTrack) {
        sliderTrack.addEventListener('mouseenter', () => {
            if (slideInterval) clearInterval(slideInterval);
        });
        
        sliderTrack.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Initialize
    updateSlider();
    startAutoSlide();
}

// Smooth scroll for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active states
                updateActiveNavLink(href);
            }
        });
    });
}

function updateActiveNavLink(targetId) {
    // Update desktop nav
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
    
    // Update mobile nav
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Update nav on scroll
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        if (current) {
            updateActiveNavLink(`#${current}`);
        }
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Animate hero elements
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transition = 'all 0.6s ease-out';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
    }, 300);
    
    // Initialize components
    initTestimonialSlider();
    initSmoothScroll();
    initScrollSpy();
    
    // Start counter animations
    setTimeout(animateCounters, 1000);
    
    // Close modal handlers
    elements.successModal?.addEventListener('click', (e) => {
        if (e.target === elements.successModal || e.target.closest('.close-modal')) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.successModal && !elements.successModal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // WhatsApp float button
    elements.whatsappFloat?.addEventListener('click', function(e) {
        e.preventDefault();
        const testMsg = encodeURIComponent("Hello! I need assistance with my vehicle.");
        const url = `https://wa.me/+233573961829?text=${testMsg}`;
        openInNewTab(url);
    });
    
    // Form validation
    if (elements.nameInput && elements.phoneInput) {
        elements.nameInput.addEventListener('input', validateStep1);
        elements.phoneInput.addEventListener('input', validateStep1);
    }
    
    if (elements.carInput && elements.issueSelect) {
        elements.carInput.addEventListener('input', validateStep2);
        elements.issueSelect.addEventListener('change', validateStep2);
    }
});

// Step validation functions
function validateStep1() {
    const nameValid = elements.nameInput.value.trim().length >= 2;
    const phoneValid = elements.phoneInput.value.trim().replace(/\D/g, '').length >= 10;
    
    // Add visual feedback
    if (elements.nameInput) {
        elements.nameInput.style.borderColor = nameValid ? '#00cc88' : '';
    }
    if (elements.phoneInput) {
        elements.phoneInput.style.borderColor = phoneValid ? '#00cc88' : '';
    }
    
    return nameValid && phoneValid;
}

function validateStep2() {
    const carValid = elements.carInput.value.trim().length >= 2;
    const issueValid = elements.issueSelect.value !== '';
    
    // Add visual feedback
    if (elements.carInput) {
        elements.carInput.style.borderColor = carValid ? '#00cc88' : '';
    }
    if (elements.issueSelect) {
        elements.issueSelect.style.borderColor = issueValid ? '#00cc88' : '';
    }
    
    return carValid && issueValid;
}

// Export for debugging
window.BSAutoConnect = {
    getCurrentLocation,
    resetForm,
    testWhatsApp: () => sendToWhatsApp("Test message from BS Auto-connect"),
    getStoredRequests: () => JSON.parse(localStorage.getItem('bsautoconnect_requests') || '[]')
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .toast {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
    }
    
    .toast-success {
        background: linear-gradient(45deg, #00cc88, #00ffc6) !important;
    }
    
    .toast-warning {
        background: linear-gradient(45deg, #ffaa00, #ffcc00) !important;
    }
    
    .submit-spinner {
        display: inline-flex;
        gap: 4px;
        margin-left: 8px;
    }
    
    .spinner-dot {
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
        animation: pulse 1.2s ease-in-out infinite;
    }
    
    .spinner-dot:nth-child(2) { animation-delay: 0.2s; }
    .spinner-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(style);
