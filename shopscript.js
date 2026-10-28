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

});
