// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5Eg7G5bbW1YgzS0ujTCupfWYFwrfrVqw",
    authDomain: "wedding-invitatation.firebaseapp.com",
    projectId: "wedding-invitatation",
    storageBucket: "wedding-invitatation.firebasestorage.app",
    messagingSenderId: "934435258475",
    appId: "1:934435258475:web:3cf137e94b942f55c4b12e",
    measurementId: "G-8RC901YRF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variables
let wishesData = [];
let isSubmitting = false;
let backgroundMusic = null;
let isMusicPlaying = false;

// Sample wishes data
const sampleWishes = [

];

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function() {
    // Initialize background music first
    setupBackgroundMusic();
    
    // Hide loading screen after delay
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        // Try to start music after loading screen is hidden
        setTimeout(startBackgroundMusic, 500);
    }, 2500);
    
    // Initialize other functionalities
    setupCountdown();
    setupScrollAnimations();
    setupNavigationMenu();
    setupWishForm();
    setupMusicControl();
    loadSampleWishes();
    loadWishesFromFirebase();
});

// ===== BACKGROUND MUSIC =====
function setupBackgroundMusic() {
    backgroundMusic = document.getElementById('backgroundMusic');
    if (!backgroundMusic) return;

    // Set volume to comfortable level
    backgroundMusic.volume = 0.3;
    
    // Preload the audio
    backgroundMusic.load();
    
    // Handle audio events
    backgroundMusic.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
    });
    
    backgroundMusic.addEventListener('error', (e) => {
        console.log('Audio loading error:', e);
        // Hide music control if audio fails to load
        const musicControl = document.getElementById('musicControl');
        if (musicControl) {
            musicControl.style.display = 'none';
        }
    });
    
    backgroundMusic.addEventListener('ended', () => {
        // Loop the music
        backgroundMusic.currentTime = 0;
        if (isMusicPlaying) {
            backgroundMusic.play().catch(e => console.log('Loop play failed:', e));
        }
    });
}

function startBackgroundMusic() {
    if (!backgroundMusic) return;
    
    // Try to auto-play music
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Background music started automatically');
            isMusicPlaying = true;
            updateMusicControl();
        }).catch(error => {
            console.log('Auto-play prevented by browser:', error);
            // Music will be started on first user interaction
            isMusicPlaying = false;
            updateMusicControl();
        });
    }
}

function setupMusicControl() {
    const musicBtn = document.getElementById('musicBtn');
    const musicControl = document.getElementById('musicControl');
    
    if (!musicBtn || !musicControl) return;
    
    // Add click event to music button
    musicBtn.addEventListener('click', toggleMusic);
    
    // Try to start music on any user interaction
    document.addEventListener('click', startMusicOnInteraction, { once: true });
    document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
    document.addEventListener('keydown', startMusicOnInteraction, { once: true });
}

function startMusicOnInteraction() {
    if (!backgroundMusic || isMusicPlaying) return;
    
    backgroundMusic.play().then(() => {
        console.log('Background music started on user interaction');
        isMusicPlaying = true;
        updateMusicControl();
    }).catch(error => {
        console.log('Failed to start music on interaction:', error);
    });
}

function toggleMusic() {
    if (!backgroundMusic) return;
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        console.log('Music paused');
    } else {
        backgroundMusic.play().then(() => {
            isMusicPlaying = true;
            console.log('Music resumed');
        }).catch(error => {
            console.log('Failed to resume music:', error);
        });
    }
    
    updateMusicControl();
}

function updateMusicControl() {
    const musicBtn = document.getElementById('musicBtn');
    const musicIcon = document.getElementById('musicIcon');
    const musicControl = document.getElementById('musicControl');
    
    if (!musicBtn || !musicIcon || !musicControl) return;
    
    if (isMusicPlaying) {
        musicIcon.className = 'fas fa-music';
        musicBtn.classList.remove('paused');
        musicControl.classList.remove('paused');
    } else {
        musicIcon.className = 'fas fa-music';
        musicBtn.classList.add('paused');
        musicControl.classList.add('paused');
    }
}

// ===== COUNTDOWN TIMER =====
function setupCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const targetDate = new Date("Aug 30, 2025 07:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            countdownElement.innerHTML = `
                <div class="countdown-finished" style="grid-column: 1 / -1; padding: 32px; background: white; border-radius: 16px; box-shadow: var(--shadow-primary);">
                    <div style="font-size: 2rem; margin-bottom: 16px;">🎉</div>
                    <h3 style="font-family: var(--font-primary); color: var(--color-primary); font-size: 2rem; margin-bottom: 8px;">
                        Wancinipun Sampun Dumugi
                    </h3>
                    <p style="color: var(--color-secondary); font-size: 1.25rem;">
                        Selamat Atas Pernikahan Ajeng & Balya
                    </p>
                </div>
            `;
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// ===== SCROLL ANIMATIONS =====
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
    });
}

// ===== NAVIGATION MENU =====
function setupNavigationMenu() {
    const menuBtn = document.getElementById('navMenuBtn');
    const menuList = document.getElementById('navMenuList');
    
    if (!menuBtn || !menuList) return;

    menuBtn.addEventListener('click', function() {
        menuList.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        icon.className = menuList.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });

    document.addEventListener('click', function(event) {
        if (!menuBtn.contains(event.target) && !menuList.contains(event.target)) {
            menuList.classList.remove('active');
            menuBtn.querySelector('i').className = 'fas fa-bars';
        }
    });

    menuList.querySelectorAll('.nav-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            menuList.classList.remove('active');
            menuBtn.querySelector('i').className = 'fas fa-bars';
        });
    });
}

// ===== WISH FORM =====
function setupWishForm() {
    const form = document.getElementById('wishForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        const wishData = {
            name: form.wishName.value.trim(),
            message: form.wishMessage.value.trim(),
            attendance: form.wishAttendance.value,
            timestamp: new Date().toISOString()
        };

        // Validation
        if (!wishData.name || !wishData.message || !wishData.attendance) {
            showNotification('Mohon lengkapi semua field', 'error');
            return;
        }

        await saveWishToFirebase(wishData);
        form.reset();
    });
}

// ===== FIREBASE FUNCTIONS =====
async function saveWishToFirebase(wishData) {
    try {
        isSubmitting = true;
        updateSubmitButton(true);
        
        // Save to Firebase
        const docRef = await addDoc(collection(db, 'wishes'), wishData);
        
        // Add to local array with Firebase ID
        const wishWithId = {
            id: docRef.id,
            ...wishData
        };
        
        wishesData.unshift(wishWithId);
        displayWishes();
        
        showNotification('Terima kasih! Ucapan Anda telah terkirim.', 'success');
        
    } catch (error) {
        console.error('Error saving wish:', error);
        showNotification('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
    } finally {
        isSubmitting = false;
        updateSubmitButton(false);
    }
}

async function loadWishesFromFirebase() {
    try {
        const wishesQuery = query(
            collection(db, 'wishes'),
            orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(wishesQuery);
        wishesData = [];
        
        querySnapshot.forEach((doc) => {
            wishesData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayWishes();
        
    } catch (error) {
        console.error('Error loading wishes:', error);
        showNotification('Gagal memuat ucapan', 'error');
    }
}

// ===== WISHES DISPLAY =====
function loadSampleWishes() {
    const container = document.getElementById('wishesContainer');
    if (!container) return;

    sampleWishes.forEach(wish => {
        const wishElement = createWishElement(wish);
        container.appendChild(wishElement);
    });
}

function displayWishes() {
    const container = document.getElementById('wishesContainer');
    if (!container) return;

    // Remove existing user wishes
    const userWishes = container.querySelectorAll('.user-wish');
    userWishes.forEach(wish => wish.remove());

    // Add Firebase wishes
    wishesData.forEach(wish => {
        const wishElement = createWishElement(wish, true);
        // Insert after sample wishes
        const sampleWishes = container.querySelectorAll('.wish-item:not(.user-wish)');
        if (sampleWishes.length > 0) {
            sampleWishes[sampleWishes.length - 1].insertAdjacentElement('afterend', wishElement);
        } else {
            container.appendChild(wishElement);
        }
    });
}

function createWishElement(wish, isUserWish = false) {
    const wishElement = document.createElement('div');
    wishElement.className = `wish-item${isUserWish ? ' user-wish' : ''}`;
    wishElement.style.animation = 'slideInUp 0.5s ease-out';
    
    const attendanceClass = wish.attendance === 'hadir' ? 'attendance-hadir' : 'attendance-tidak-hadir';
    const attendanceText = wish.attendance === 'hadir' ? '✓ Hadir' : '✗ Tidak Hadir';

    wishElement.innerHTML = `
        <div class="wish-header">
            <h4 class="wish-name">${wish.name}</h4>
            <span class="attendance-badge ${attendanceClass}">${attendanceText}</span>
        </div>
        <p class="wish-message">${wish.message}</p>
    `;

    return wishElement;
}

// ===== UI HELPERS =====
function updateSubmitButton(loading) {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    
    if (loading) {
        submitBtn.disabled = true;
        submitText.textContent = 'Mengirim...';
    } else {
        submitBtn.disabled = false;
        submitText.textContent = 'Kirim Ucapan';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${bgColor};
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.3s ease-out;
        font-weight: 600;
        max-width: 320px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Make functions global for HTML onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.scrollToSection = scrollToSection;

// ===== UTILITY FUNCTIONS =====
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== EVENT LISTENERS =====
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Keyboard accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) {
            closeModal(openModal.id);
        }
        
        const menuList = document.getElementById('navMenuList');
        if (menuList && menuList.classList.contains('active')) {
            menuList.classList.remove('active');
            document.getElementById('navMenuBtn').querySelector('i').className = 'fas fa-bars';
        }
    }
    
    // Space bar to toggle music
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleMusic();
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!backgroundMusic) return;
    
    if (document.hidden) {
        // Pause music when page is hidden
        if (isMusicPlaying && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    } else {
        // Resume music when page becomes visible
        if (isMusicPlaying && backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.log('Resume play failed:', error);
            });
        }
    }
});