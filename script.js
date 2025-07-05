// ===== GLOBAL VARIABLES =====
let wishesData = [];

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function() {
    // Hide loading screen after delay
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2500);
    
    // Initialize all functionalities
    setupCountdown();
    setupScrollAnimations();
    setupAudioPlayer();
    setupNavigationMenu();
    setupWishForm();
    loadSampleWishes();
    loadWishes();
});

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

// ===== AUDIO PLAYER =====
function setupAudioPlayer() {
    const music = document.getElementById('backgroundMusic');
    const playBtn = document.getElementById('playPauseBtn');
    
    if (!music || !playBtn) return;

    // Set initial button state to pause since music will auto-play
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playBtn.classList.add('playing');

    // Auto-play music when page loads
    const attemptAutoPlay = () => {
        music.play().then(() => {
            console.log('Auto-play started successfully');
        }).catch(error => {
            console.log('Auto-play failed, user interaction required:', error);
            // If auto-play fails, reset button to play state
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.classList.remove('playing');
        });
    };

    // Try to auto-play immediately
    attemptAutoPlay();

    // Also try auto-play after a short delay (for better browser compatibility)
    setTimeout(attemptAutoPlay, 1000);

    // Handle user interaction with play/pause button
    playBtn.addEventListener('click', function() {
        if (music.paused) {
            music.play().then(() => {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                playBtn.classList.add('playing');
            }).catch(error => {
                console.log('Audio play failed:', error);
            });
        } else {
            music.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.classList.remove('playing');
        }
    });

    // Handle audio events
    music.addEventListener('ended', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.classList.remove('playing');
    });

    music.addEventListener('pause', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.classList.remove('playing');
    });

    music.addEventListener('play', () => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.classList.add('playing');
    });

    // Handle page visibility change to pause/resume music
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (!music.paused) {
                music.pause();
            }
        } else {
            // Resume music when page becomes visible again
            if (music.paused && playBtn.classList.contains('playing')) {
                music.play().catch(error => {
                    console.log('Resume play failed:', error);
                });
            }
        }
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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const wishData = {
            name: form.wishName.value,
            message: form.wishMessage.value,
            attendance: form.wishAttendance.value,
            timestamp: new Date().toISOString()
        };

        wishesData.unshift(wishData);
        saveWishes();
        displayWishes();
        
        form.reset();
        showNotification('Terima kasih! Ucapan Anda telah terkirim.', 'success');
    });
}

// ===== WISHES MANAGEMENT =====
function loadSampleWishes() {
    const sampleWishes = [
        {
            name: 'Keluarga Besar Solihin',
            message: 'Selamat atas pernikahan yang penuh berkah ini. Semoga Allah SWT senantiasa memberikan keberkahan, kebahagiaan, dan kemudahan dalam menjalani kehidupan berumah tangga. Barokallahu lakuma wa baroka alaikuma.',
            attendance: 'hadir',
            timestamp: new Date().toISOString()
        },
        {
            name: 'Teman Kuliah',
            message: 'Selamat ya untuk kalian berdua! Semoga pernikahan ini menjadi awal dari kebahagiaan yang tak terhingga. Semoga selalu bersama dalam suka dan duka, dalam sehat dan sakit, sampai kakek nenek nanti!',
            attendance: 'hadir',
            timestamp: new Date().toISOString()
        },
        {
            name: 'Keluarga Nasehat',
            message: 'Alhamdulillah, akhirnya momen yang ditunggu-tunggu telah tiba. Semoga Allah meridhoi pernikahan kalian dan memberikan keturunan yang sholeh dan sholehah. Bahagia selalu untuk kalian!',
            attendance: 'tidak-hadir',
            timestamp: new Date().toISOString()
        }
    ];

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

    // Clear user wishes (keep sample wishes)
    const userWishes = container.querySelectorAll('.user-wish');
    userWishes.forEach(wish => wish.remove());

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

function saveWishes() {
    localStorage.setItem('weddingWishes', JSON.stringify(wishesData));
}

function loadWishes() {
    const storedWishes = localStorage.getItem('weddingWishes');
    if (storedWishes) {
        try {
            wishesData = JSON.parse(storedWishes);
            displayWishes();
        } catch (error) {
            console.error('Error parsing stored wishes:', error);
            wishesData = [];
        }
    }
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

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// ===== UTILITY FUNCTIONS =====
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
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
        box-shadow: var(--shadow-primary);
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

// ===== SMOOTH SCROLLING FOR ANCHOR LINKS =====
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

// ===== KEYBOARD ACCESSIBILITY =====
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) {
            closeModal(openModal.id);
        }
        
        // Close navigation menu
        const menuList = document.getElementById('navMenuList');
        if (menuList && menuList.classList.contains('active')) {
            menuList.classList.remove('active');
            document.getElementById('navMenuBtn').querySelector('i').className = 'fas fa-bars';
        }
    }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Preload critical resources
window.addEventListener('load', function() {
    // Preload audio
    const audio = document.getElementById('backgroundMusic');
    if (audio) {
        audio.load();
    }
});