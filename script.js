// --- Theme Switcher (Floating Action Button) ---
const themeFab = document.getElementById('themeFab');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const getStoredTheme = () => localStorage.getItem('theme');
const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeFab) {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        themeFab.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
        themeFab.setAttribute('title', `Switch to ${nextTheme} theme`);
    }
};

// Initial Theme Selection
const savedTheme = getStoredTheme();
if (savedTheme) {
    applyTheme(savedTheme);
} else if (prefersDark.matches) {
    applyTheme('dark');
} else {
    applyTheme('light');
}

// Toggle Theme on FAB Click
if (themeFab) {
    themeFab.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || (prefersDark.matches ? 'dark' : 'light');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setStoredTheme(newTheme);
        applyTheme(newTheme);
    });
}

// Listen to System Preference Changes if no localStorage override
prefersDark.addEventListener('change', (e) => {
    if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});

// --- Mobile Navigation Menu ---
const nav = document.querySelector('nav');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobile-menu');

const closeMobileMenu = () => {
    document.body.classList.remove('menu-open');
    if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.textContent = '☰';
    }
};

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        const open = document.body.classList.toggle('menu-open');
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuBtn.textContent = open ? '×' : '☰';
    });
}

document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', closeMobileMenu));

// Close mobile menu on Escape key press or clicking outside nav
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMobileMenu();
    }
});

document.addEventListener('click', (e) => {
    if (document.body.classList.contains('menu-open')) {
        const isClickInside = nav && (nav.contains(e.target) || mobileMenu.contains(e.target));
        if (!isClickInside) {
            closeMobileMenu();
        }
    }
});

// --- Scrollspy: Active Nav Link Highlighting ---
const sections = document.querySelectorAll('header[id], section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"], #mobile-menu a[href^="#"]');

if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
}

// --- Scroll Reveal Animations ---
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => revealObserver.observe(el));
} else {
    // Fallback if IntersectionObserver isn't supported
    reveals.forEach(el => el.classList.add('active'));
}

// --- Service Chips Selection ---
const chips = document.querySelectorAll('#serviceChips .chip');
let selectedService = '';
chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
    selectedService = chip.textContent;
    document.getElementById('f-service').classList.remove('invalid');
}));

// --- Live Form Input Error Clearing ---
['name', 'email', 'message'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
        field.addEventListener('input', () => {
            const parent = field.closest('.field');
            if (parent) parent.classList.remove('invalid');
        });
    }
});

// --- Contact Form Submission ---
const form = document.getElementById('inquiryForm');
const status = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        const budget = document.getElementById('budget');
        const timeline = document.getElementById('timeline');

        const setInvalid = (id, bad) => {
            const fieldEl = document.getElementById(id);
            if (fieldEl) fieldEl.classList.toggle('invalid', bad);
            if (bad) valid = false;
        };

        setInvalid('f-name', name.value.trim().length < 2);
        setInvalid('f-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
        setInvalid('f-service', !selectedService);
        setInvalid('f-message', message.value.trim().length < 10);

        status.className = 'form-status';
        if (!valid) {
            status.innerHTML = 'Please fill in the required fields above (Name, Email, Service, Message) before sending.';
            status.classList.add('show', 'error');
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Animated Success State
        if (submitBtn) {
            submitBtn.classList.add('success-state');
            submitBtn.innerHTML = `
                <svg class="check-anim-svg" viewBox="0 0 52 52">
                    <circle class="check-circle" cx="26" cy="26" r="23"/>
                    <path class="check-path" d="M14 27l7 7 16-16"/>
                </svg>
                <span>Inquiry Prepared!</span>
            `;
        }

        const checkmarkSvg = `
            <svg class="check-anim-svg" viewBox="0 0 52 52">
                <circle class="check-circle" cx="26" cy="26" r="23"/>
                <path class="check-path" d="M14 27l7 7 16-16"/>
            </svg>
        `;

        status.innerHTML = `
            ${checkmarkSvg}
            <span>Opening your email app with your project details filled in — hit send to confirm!</span>
        `;
        status.classList.add('show', 'success');

        const subject = encodeURIComponent(`Project inquiry: ${selectedService}`);
        const body = encodeURIComponent(
            `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\nService: ${selectedService}\nBudget: ${budget.value || 'Not specified'}\nTimeline: ${timeline.value || 'Flexible'}\n\nProject details:\n${message.value.trim()}`
        );

        // Delay opening email client to display full SVG checkmark animation
        setTimeout(() => {
            window.location.href = `mailto:kajekealfred@gmail.com?subject=${subject}&body=${body}`;
        }, 1400);
    });
}