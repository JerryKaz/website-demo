// DOM Elements
const form = document.getElementById('reqForm');
const getLocationBtn = document.getElementById('getLocationBtn');
const submitBtn = document.getElementById('submitBtn');
const locationStatus = document.getElementById('locationStatus');
const locationDetails = document.getElementById('locationDetails');
const latitudeValue = document.getElementById('latitudeValue');
const longitudeValue = document.getElementById('longitudeValue');
const accuracyValue = document.getElementById('accuracyValue');
const viewOnMapBtn = document.getElementById('viewOnMap');
const mechanicMap = document.getElementById('mechanicMap');
const successModal = document.getElementById('successModal');
const whatsappFloat = document.getElementById('whatsappFloat');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');
const mobileNav = document.getElementById('mobileNav');

// State
let userLocation = null;
let currentStep = 1;

// Mobile Menu Functionality
const overlay = document.createElement('div');
overlay.className = 'mobile-overlay';
document.body.appendChild(overlay);

// Open mobile menu
mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close mobile menu
mobileCloseBtn.addEventListener('click', closeMobileMenu);
overlay.addEventListener('click', closeMobileMenu);

// Close mobile menu function
function closeMobileMenu() {
    mobileNav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close menu when clicking on a link
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close menu with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMobileMenu();
    }
});

// Scroll to form
function scrollToForm() {
    closeMobileMenu(); // Close mobile menu if open
    document.getElementById("formSection").scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Form Step Navigation
function nextStep(step) {
    // Validate current step before proceeding
    if (currentStep === 1) {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!name || !phone) {
            alert('Please fill in your name and phone number.');
            return;
        }
    }
    
    if (currentStep === 2) {
        const car = document.getElementById('car').value.trim();
        const issue = document.getElementById('issue').value;
        
        if (!car) {
            alert('Please enter your vehicle details.');
            return;
        }
        
        if (!issue) {
            alert('Please select an issue.');
            return;
        }
    }
    
    document.querySelector(`#step${currentStep}`).classList.remove('active');
    document.querySelectorAll('.flow-step')[currentStep - 1].classList.remove('active');
    
    currentStep = step;
    document.querySelector(`#step${currentStep}`).classList.add('active');
    document.querySelectorAll('.flow-step')[currentStep - 1].classList.add('active');
    
    // Animate step change
    document.querySelector(`#step${currentStep}`).style.animation = 'none';
    setTimeout(() => {
        document.querySelector(`#step${currentStep}`).style.animation = 'slide-up 0.5s ease-out';
    }, 10);
}

function prevStep(step) {
    document.querySelector(`#step${currentStep}`).classList.remove('active');
    document.querySelectorAll('.flow-step')[currentStep - 1].classList.remove('active');
    
    currentStep = step;
    document.querySelector(`#step${currentStep}`).classList.add('active');
    document.querySelectorAll('.flow-step')[currentStep - 1].classList.add('active');
}

// Get Live Location
getLocationBtn.addEventListener('click', () => {
    const statusDot = locationStatus.querySelector('.status-dot');
    const statusText = locationStatus.querySelector('span');
    
    // Show loading state
    getLocationBtn.innerHTML = `
        <i class="fas fa-satellite"></i>
        <span>Detecting Location...</span>
        <div class="scanning-beam"></div>
    `;
    getLocationBtn.disabled = true;
    
    statusDot.style.background = '#ffaa00';
    statusText.textContent = 'Detecting your location...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Success callback
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                userLocation = { lat, lng, accuracy };
                
                // Update UI
                getLocationBtn.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Location Captured!</span>
                `;
                getLocationBtn.style.background = 'linear-gradient(45deg, #00cc88, #00ffc6)';
                getLocationBtn.disabled = false;
                
                statusDot.style.background = '#00cc88';
                statusText.textContent = 'Live location ready';
                
                // Show location details
                locationDetails.classList.remove('hidden');
                latitudeValue.textContent = lat.toFixed(6);
                longitudeValue.textContent = lng.toFixed(6);
                accuracyValue.textContent = `${Math.round(accuracy)} meters`;
                
                // Enable submit button
                submitBtn.disabled = false;
                
                // Show mechanic map
                setTimeout(() => {
                    mechanicMap.classList.remove('hidden');
                    mechanicMap.style.animation = 'slide-up 0.5s ease-out';
                }, 500);
                
                // Animate WhatsApp float
                animateWhatsAppFloat();
                
                // Update counter stats
                animateCounters();
                
                // Get approximate address
                getAddressFromCoords(lat, lng);
            },
            // Error callback
            (error) => {
                console.error("Geolocation error:", error);
                
                getLocationBtn.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Allow Location Access</span>
                `;
                getLocationBtn.disabled = false;
                
                statusDot.style.background = '#ff4757';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        statusText.textContent = 'Location access denied. Please enable in browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        statusText.textContent = 'Location unavailable. Check your connection.';
                        break;
                    case error.TIMEOUT:
                        statusText.textContent = 'Location request timed out.';
                        break;
                    default:
                        statusText.textContent = 'Unable to get location.';
                }
                
                // Fallback to manual location
                setTimeout(() => {
                    const manualLocation = prompt("Please enter your location (street, landmark, etc.):");
                    if (manualLocation) {
                        userLocation = { manual: manualLocation };
                        
                        getLocationBtn.innerHTML = `
                            <i class="fas fa-map-pin"></i>
                            <span>Manual Location Set</span>
                        `;
                        getLocationBtn.style.background = 'linear-gradient(45deg, #ffaa00, #ffcc00)';
                        
                        statusDot.style.background = '#ffaa00';
                        statusText.textContent = 'Manual location entered';
                        
                        locationDetails.classList.remove('hidden');
                        latitudeValue.textContent = 'Manual';
                        longitudeValue.textContent = 'Location';
                        accuracyValue.textContent = 'N/A';
                        
                        submitBtn.disabled = false;
                    }
                }, 1000);
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert("Your browser doesn't support live location sharing. Please update your browser.");
    }
});

// Get approximate address from coordinates
function getAddressFromCoords(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                const address = data.display_name.split(',').slice(0, 2).join(',');
                const addressElement = document.createElement('p');
                addressElement.className = 'small';
                addressElement.textContent = `Near: ${address}`;
                locationDetails.appendChild(addressElement);
            }
        })
        .catch(err => console.log("Address lookup failed:", err));
}

// View on Map
viewOnMapBtn?.addEventListener('click', () => {
    if (userLocation && userLocation.lat) {
        const url = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
        openInNewTab(url);
    }
});

// Form Submission - UPDATED WHATSAPP FUNCTIONALITY
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!userLocation) {
        alert("⚠️ Please share your location first");
        return;
    }
    
    // Validate required fields
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const car = document.getElementById('car').value.trim();
    const issue = document.getElementById('issue').value;
    
    if (!name || !phone || !car || !issue) {
        alert("❌ Please fill in all required fields.");
        return;
    }
    
    // Show loading state
    const submitSpinner = submitBtn.querySelector('.submit-spinner');
    submitSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <i class="fab fa-whatsapp"></i>
        <span>Preparing Request...</span>
        <div class="submit-spinner">
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
        </div>
    `;
    
    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Create WhatsApp message
    const message = createWhatsAppMessage(name, cleanPhone, car, issue, userLocation);
    
    // Store request locally (backup)
    storeRequestLocally({ name, phone: cleanPhone, car, issue, location: userLocation });
    
    // Send to WhatsApp
    const success = await sendToWhatsApp(message);
    
    if (success) {
        // Show success modal
        setTimeout(() => {
            showSuccessModal();
            resetForm();
        }, 1000);
    } else {
        // Fallback: copy to clipboard
        fallbackToClipboard(message);
    }
});

// Create WhatsApp message
function createWhatsAppMessage(name, phone, car, issue, location) {
    const issueText = getIssueText(issue);
    const timestamp = new Date().toLocaleString();
    
    let message = `🛠️ *BS AUTO-CONNECT EMERGENCY REQUEST* 🛠️\n\n`;
    message += `👤 *Client:* ${name}\n`;
    message += `📱 *Phone:* ${phone}\n`;
    message += `🚗 *Vehicle:* ${car}\n`;
    message += `🔧 *Issue:* ${issueText}\n`;
    message += `🕒 *Time:* ${timestamp}\n\n`;
    
    if (location.manual) {
        message += `📍 *Location:* ${location.manual}\n`;
    } else {
        message += `📍 *Live Coordinates:*\n`;
        message += `Lat: ${location.lat.toFixed(6)}\n`;
        message += `Lng: ${location.lng.toFixed(6)}\n`;
        message += `Accuracy: ${Math.round(location.accuracy)}m\n\n`;
        
        // Google Maps link (shortened)
        const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
        message += `🗺️ *Google Maps:* ${mapsUrl}\n\n`;
    }
    
    message += `⏱️ *Priority:* HIGH\n`;
    message += `🚨 *Status:* AWAITING DISPATCH\n\n`;
    message += `ℹ️ Please contact client via this number`;
    
    return message;
}

// Send to WhatsApp with multiple fallbacks
async function sendToWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '+233573961829';
    
    // Try different WhatsApp URL formats
    const urls = [
        `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
        `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`,
        `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`
    ];
    
    // Method 1: Try hidden link click (most reliable)
    try {
        const link = document.createElement('a');
        link.href = urls[0];
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Check if it worked
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    } catch (error) {
        console.log('Method 1 failed:', error);
    }
    
    // Method 2: Try form submission
    try {
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = 'https://api.whatsapp.com/send';
        form.target = '_blank';
        
        const phoneInput = document.createElement('input');
        phoneInput.type = 'hidden';
        phoneInput.name = 'phone';
        phoneInput.value = whatsappNumber;
        
        const textInput = document.createElement('input');
        textInput.type = 'hidden';
        textInput.name = 'text';
        textInput.value = message;
        
        form.appendChild(phoneInput);
        form.appendChild(textInput);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        return true;
    } catch (error) {
        console.log('Method 2 failed:', error);
    }
    
    // Method 3: Direct window.open as last resort
    try {
        const newWindow = window.open(urls[0], '_blank', 'noopener,noreferrer');
        if (newWindow) {
            return true;
        }
    } catch (error) {
        console.log('Method 3 failed:', error);
    }
    
    return false;
}

// Fallback to clipboard
function fallbackToClipboard(message) {
    const textArea = document.createElement('textarea');
    textArea.value = message;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            alert('✅ Message copied to clipboard! Please:\n1. Open WhatsApp\n2. Message +233573961829\n3. Paste the message');
            showSuccessModal();
            resetForm();
        } else {
            throw new Error('Copy failed');
        }
    } catch (err) {
        alert('📋 Please copy this message manually and send to +233573961829 on WhatsApp:\n\n' + message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <i class="fab fa-whatsapp"></i>
            <span>Try Again</span>
        `;
        const submitSpinner = submitBtn.querySelector('.submit-spinner');
        submitSpinner.classList.add('hidden');
    }
}

// Store request locally
function storeRequestLocally(data) {
    try {
        const requests = JSON.parse(localStorage.getItem('bsautoconnect_requests') || '[]');
        requests.push({
            ...data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('bsautoconnect_requests', JSON.stringify(requests));
        console.log('Request stored locally');
    } catch (error) {
        console.error('Failed to store locally:', error);
    }
}

// Reset form
function resetForm() {
    const submitSpinner = submitBtn.querySelector('.submit-spinner');
    form.reset();
    submitSpinner.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <i class="fab fa-whatsapp"></i>
        Send Request via WhatsApp
    `;
    locationDetails.classList.add('hidden');
    mechanicMap.classList.add('hidden');
    getLocationBtn.innerHTML = `
        <i class="fas fa-crosshairs"></i>
        <span>Get My Live Location</span>
        <div class="scanning-beam"></div>
    `;
    getLocationBtn.style.background = 'linear-gradient(45deg, var(--secondary), var(--accent))';
    userLocation = null;
    currentStep = 1;
    
    // Reset steps
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.flow-step').forEach(step => step.classList.remove('active'));
    document.querySelector('#step1').classList.add('active');
    document.querySelectorAll('.flow-step')[0].classList.add('active');
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
    successModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    successModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
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
        const target = parseInt(counter.getAttribute('data-count'));
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 20);
    });
}

// Animate WhatsApp float
function animateWhatsAppFloat() {
    whatsappFloat.style.animation = 'none';
    setTimeout(() => {
        whatsappFloat.style.animation = 'float 1s ease-in-out 3';
    }, 100);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Animate hero elements
    setTimeout(() => {
        document.querySelector('.hero-content').style.opacity = '1';
        document.querySelector('.hero-content').style.transform = 'translateY(0)';
    }, 300);
    
    // Start counter animations
    setTimeout(animateCounters, 1000);
    
    // Close modal on background click
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !successModal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Test WhatsApp link on float button
    whatsappFloat.addEventListener('click', function(e) {
        e.preventDefault();
        const testMsg = encodeURIComponent("Hello! I need assistance with my vehicle.");
        const url = `https://wa.me/+233573961829?text=${testMsg}`;
        openInNewTab(url);
    });
    
    // Initialize form validation for step 1
    document.getElementById('name').addEventListener('input', validateStep1);
    document.getElementById('phone').addEventListener('input', validateStep1);
    
    // Initialize form validation for step 2
    document.getElementById('car').addEventListener('input', validateStep2);
    document.getElementById('issue').addEventListener('change', validateStep2);
});

// Step validation functions
function validateStep1() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const isValid = name && phone;
    
    // You could add visual feedback here
    return isValid;
}

function validateStep2() {
    const car = document.getElementById('car').value.trim();
    const issue = document.getElementById('issue').value;
    const isValid = car && issue;
    
    // You could add visual feedback here
    return isValid;
}

// Testimonial Slider Functionality
const sliderTrack = document.querySelector('.slider-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const dots = document.querySelectorAll('.dot');
const testimonialCards = document.querySelectorAll('.testimonial-card');

let currentSlide = 0;
const totalSlides = testimonialCards.length;

function updateSlider() {
  // Update active classes
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
  
  // Animate slide change
  if (sliderTrack) {
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

// Previous button click
prevBtn?.addEventListener('click', () => {
  currentSlide = currentSlide > 0 ? currentSlide - 1 : totalSlides - 1;
  updateSlider();
});

// Next button click
nextBtn?.addEventListener('click', () => {
  currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
  updateSlider();
});

// Dot navigation
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    currentSlide = index;
    updateSlider();
  });
});

// Auto-advance slider (optional)
let slideInterval;
if (sliderTrack) {
  slideInterval = setInterval(() => {
    currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
    updateSlider();
  }, 5000);
  
  // Pause auto-advance on hover
  sliderTrack.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  
  sliderTrack.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => {
      currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
      updateSlider();
    }, 5000);
  });
}

// Smooth scroll for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
      
      // Update active nav link
      document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
    }
  });
});

// Update nav on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      // Update desktop nav
      document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
      
      // Update mobile nav
      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
});

// Debug: Test WhatsApp function
window.testWhatsApp = function() {
    const testMsg = "Test message from BS Auto-connect website";
    sendToWhatsApp(testMsg);
};

// Add click handlers for mobile navigation links
document.querySelectorAll('.mobile-nav-link[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu after navigation
            const mobileNav = document.getElementById('mobileNav');
            if (mobileNav) {
                mobileNav.classList.remove('open');
            }
        }
    });
});
