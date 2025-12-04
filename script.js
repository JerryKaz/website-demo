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

// State
let userLocation = null;
let currentStep = 1;

// Scroll to form
function scrollToForm() {
    document.getElementById("formSection").scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Form Step Navigation
function nextStep(step) {
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

// View on Map
viewOnMapBtn?.addEventListener('click', () => {
    if (userLocation && userLocation.lat) {
        const url = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
        window.open(url, '_blank');
    }
});

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!userLocation) {
        alert("Please share your location first");
        return;
    }
    
    // Show loading state
    const submitSpinner = submitBtn.querySelector('.submit-spinner');
    submitSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <i class="fab fa-whatsapp"></i>
        <span>Sending Request...</span>
        <div class="submit-spinner">
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
        </div>
    `;
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const car = document.getElementById('car').value.trim();
    const issue = document.getElementById('issue').value;
    
    // Create WhatsApp message
    let text = `🛠️ *QUICKFIX EMERGENCY REQUEST* 🛠️%0A%0A`;
    text += `👤 *Client:* ${name}%0A`;
    text += `🚗 *Vehicle:* ${car}%0A`;
    text += `🔧 *Issue:* ${getIssueText(issue)}%0A%0A`;
    
    // Add location
    if (userLocation.manual) {
        text += `📍 *Location:* ${userLocation.manual}%0A`;
    } else {
        text += `📍 *Live Coordinates:*%0A`;
        text += `Lat: ${userLocation.lat.toFixed(6)}%0A`;
        text += `Lng: ${userLocation.lng.toFixed(6)}%0A`;
        text += `Accuracy: ${Math.round(userLocation.accuracy)}m%0A%0A`;
        
        // Add Google Maps link
        const mapsUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
        text += `🗺️ *Google Maps:* ${mapsUrl}%0A%0A`;
    }
    
    text += `⏱️ *Priority:* HIGH%0A`;
    text += `🚨 *Status:* AWAITING DISPATCH%0A%0A`;
    text += `ℹ️ _Please contact client via WhatsApp for live location sharing_`;
    
    // Simulate API delay
    setTimeout(() => {
        // Open WhatsApp
        window.open(`https://wa.me/+233573961829?text=${text}`, '_blank');
        
        // Show success modal
        showSuccessModal();
        
        // Reset form
        setTimeout(() => {
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
        }, 2000);
    }, 1500);
});

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
////////////////////////////////////////////////////////////////////////////////////////////////////

// Animate WhatsApp float
function animateWhatsAppFloat() {
    whatsappFloat.style.animation = 'none';
    setTimeout(() => {
        whatsappFloat.style.animation = 'float 1s ease-in-out 3';
    }, 100);
}

// Initialize animations
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
});

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
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
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
let slideInterval = setInterval(() => {
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
      document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
});