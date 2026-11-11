document.addEventListener("DOMContentLoaded", () => {

    const cover = document.querySelector(".cover");

    const backgroundImage = document.querySelector(
        ".background-image"
    );

    const brandLogo = document.querySelector(".brand-logo");


    /* =========================================
       BACKGROUND IMAGE LOADING
    ========================================= */

    if (cover && backgroundImage) {

        function revealBackground() {
            backgroundImage.classList.add("is-loaded");

            cover.classList.remove("image-error");
        }

        function handleBackgroundError() {
            console.error(
                "Background image could not be loaded. " +
                "Make sure cover-bg.png exists in the project folder."
            );

            cover.classList.add("image-error");
        }

        if (
            backgroundImage.complete &&
            backgroundImage.naturalWidth > 0
        ) {
            revealBackground();
        } else {
            backgroundImage.addEventListener(
                "load",
                revealBackground,
                { once: true }
            );

            backgroundImage.addEventListener(
                "error",
                handleBackgroundError,
                { once: true }
            );
        }
    }


    /* =========================================
       LOGO LOADING CHECK
    ========================================= */

    if (brandLogo) {

        brandLogo.addEventListener("error", () => {

            console.error(
                "Logo could not be loaded. " +
                "Make sure abhishek-rai-logo.png exists " +
                "in the project folder."
            );

        }, { once: true });

    }


    /* =========================================
       RESPONSIVE LAYOUT DETECTION
    ========================================= */

    const mobileLayout = window.matchMedia(
        "(max-width: 600px)"
    );

    const tabletLayout = window.matchMedia(
        "(min-width: 601px) and (max-width: 900px)"
    );


    function updateLayout() {

        let layout = "desktop";

        if (mobileLayout.matches) {

            layout = "mobile";

        } else if (tabletLayout.matches) {

            layout = "tablet";

        }

        document.documentElement.dataset.layout = layout;

    }


    updateLayout();

    mobileLayout.addEventListener(
        "change",
        updateLayout
    );

    tabletLayout.addEventListener(
        "change",
        updateLayout
    );


    /* =========================================
       HEADER NAVIGATION & MOBILE DRAWER
    ========================================= */

    function initHeaderMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('headerNav');
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('is-open');
            navToggle.classList.toggle('is-active', isOpen);
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close when clicking any nav link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
                navToggle.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                if (navMenu.classList.contains('is-open')) {
                    navMenu.classList.remove('is-open');
                    navToggle.classList.remove('is-active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
                navMenu.classList.remove('is-open');
                navToggle.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    initHeaderMenu();

    /* =========================================
       HUMBLE. GOOGLE SHEET SUBMISSION (APPS SCRIPT)
    ========================================= */

    function initOrderForm() {
        // Replace with your deployed Google Apps Script Web App URL (/exec)
        const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyxfxGQ_1pFsf6T9G6uSCG8WP964qff0YcjvPwfPtQY09QsArC3WOIq-gNJpdoaxfpBkA/exec';

        const form = document.getElementById('humbleOrderForm');
        const submitBtn = document.getElementById('humbleSubmitBtn');
        const errorMsg = document.getElementById('humbleFormError');
        const successPanel = document.getElementById('humbleFormSuccess');
        const resetBtn = document.getElementById('humbleResetBtn');

        if (!form || !submitBtn || !successPanel) return;

        // Clear per-field error highlight on input
        form.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
                if (errorMsg) errorMsg.textContent = '';
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorMsg) errorMsg.textContent = '';

            const requiredInputs = form.querySelectorAll('[required]');
            let firstInvalid = null;

            requiredInputs.forEach(input => {
                input.classList.remove('is-invalid');
                const val = input.value.trim();
                const isEmail = input.type === 'email';
                const emailValid = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

                if (!val || !emailValid) {
                    input.classList.add('is-invalid');
                    if (!firstInvalid) firstInvalid = input;
                }
            });

            if (firstInvalid) {
                if (errorMsg) {
                    errorMsg.textContent = firstInvalid.type === 'email' && firstInvalid.value.trim()
                        ? 'Please enter a valid email address.'
                        : 'Please fill in all required fields marked with *.';
                }
                firstInvalid.focus();
                return;
            }

            if (!GOOGLE_SHEET_WEBAPP_URL || GOOGLE_SHEET_WEBAPP_URL.includes('PASTE_YOUR_APPS_SCRIPT')) {
                if (errorMsg) {
                    errorMsg.textContent = 'Google Sheet endpoint is not configured yet. Deploy the Apps Script Web App and paste its URL into shopscript.js.';
                }
                return;
            }

            const params = new URLSearchParams();
            new FormData(form).forEach((value, key) => {
                let clean = String(value).trim();
                // Prevent Google Sheets from treating leading +, =, -, or @ (e.g. +91 phone) as a formula
                if (/^[=+\-@]/.test(clean)) {
                    clean = "'" + clean;
                }
                params.append(key, clean);
            });

            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'SUBMITTING...';

            try {
                const res = await fetch(GOOGLE_SHEET_WEBAPP_URL, {
                    method: 'POST',
                    body: params
                });

                if (!res.ok) {
                    throw new Error(`Request failed with status ${res.status}`);
                }

                const data = await res.json();
                if (data.result !== 'success') {
                    throw new Error(data.error || 'Submission rejected');
                }

                form.hidden = true;
                successPanel.hidden = false;
            } catch (err) {
                console.error('Sheet submission error:', err);
                if (errorMsg) {
                    errorMsg.textContent = 'Unable to submit right now. Please try again in a moment.';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'SUBMIT';
            }
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                form.reset();
                form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
                if (errorMsg) errorMsg.textContent = '';
                successPanel.hidden = true;
                form.hidden = false;
            });
        }
    }

    initOrderForm();

});
