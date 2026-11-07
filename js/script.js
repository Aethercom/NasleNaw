// فایل های ج.ا, سی اس اس, اچ تی ام ال و سایر فایل های سایت در حالت بتا قرار دارن و باید بعد از نهایی شدن همه شون, کدها رو بصورت مرتب شده اصلاح کنم
// ================ Aethercom.github.io ====================
// آریا لیبل ها توی نسخه نهایی حتما توی اچ تی ام ال اضافه بشن
const textCards = document.querySelectorAll(".card-becuase");
if ("IntersectionObserver" in window) {
    const textObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("text-open");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    textCards.forEach(card => textObserver.observe(card));
} else {
    textCards.forEach(card => card.classList.add("text-open"));
}
/*  ====================================================
        Slider
    ===================================================*/
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector("#hero-slider");
    if (!slider) return;
    const slides = [...slider.querySelectorAll(".slide")];
    const prevButton = slider.querySelector(".slider-prev");
    const nextButton = slider.querySelector(".slider-next");
    const dotsContainer = slider.querySelector(".slider-dots");
    const progressBar = slider.querySelector(".slider-progress-bar");
    if (
        slides.length === 0 ||
        !prevButton ||
        !nextButton ||
        !dotsContainer ||
        !progressBar
    ) {
        return;
    }
    const AUTO_DELAY = 5000;
    const MANUAL_DELAY = 8000;
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );
    let currentIndex = Math.max(
        0,
        slides.findIndex((slide) => slide.classList.contains("active"))
    );
    let timerId = null;
    let deadline = 0;
    let remainingTime = AUTO_DELAY;
    let isPaused = false;
    let isInViewport = true;
    let isPageVisible = !document.hidden;
    let touchStartX = 0;
    let touchStartY = 0;
    let dots = [];
    /* =========================
       CREATE DOTS
    ========================= */
    slides.forEach((slide, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute(
            "aria-label",
            `رفتن به اسلاید ${index + 1}`
        );
        dot.addEventListener("click", () => {
            if (index === currentIndex) {
                scheduleNext(MANUAL_DELAY);
                return;
            }
            showSlide(index);
            scheduleNext(MANUAL_DELAY);
        });

        dotsContainer.appendChild(dot);
        dots.push(dot);
    });
    /* =========================
       UPDATE SLIDE
    ========================= */
    function updateSlide() {
        slides.forEach((slide, index) => {
            const isActive = index === currentIndex;
            slide.classList.toggle("active", isActive);
            slide.setAttribute(
                "aria-hidden",
                String(!isActive)
            );
            if ("inert" in slide) {
                slide.inert = !isActive;
            }
        });
        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle("active", isActive);
            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }
    function showSlide(index) {
        currentIndex =
            (index + slides.length) % slides.length;
        updateSlide();
    }
    function nextSlide() {
        showSlide(currentIndex + 1);
    }
    function previousSlide() {
        showSlide(currentIndex - 1);
    }
    /* =========================
       TIMER
    ========================= */
    function clearTimer() {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
    }
    function canRun() {
        return (
            !isPaused &&
            isInViewport &&
            isPageVisible &&
            !reducedMotion.matches &&
            slides.length > 1
        );
    }
    function scheduleNext(delay) {
        clearTimer();
        remainingTime = delay;
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        deadline = Date.now() + delay;
        if (!canRun()) {
            return;
        }
        requestAnimationFrame(() => {
            if (!canRun()) return;
            progressBar.style.transition =
                `width ${delay}ms linear`;

            progressBar.style.width = "100%";
        });
        timerId = setTimeout(() => {
            timerId = null;
            nextSlide();
            scheduleNext(AUTO_DELAY);
        }, delay);
    }
    /* =========================
       MANUAL CONTROLS
    ========================= */
    nextButton.addEventListener("click", () => {
        nextSlide();
        scheduleNext(MANUAL_DELAY);
    });
    prevButton.addEventListener("click", () => {
        previousSlide();
        scheduleNext(MANUAL_DELAY);
    });
    /* =========================
       PAUSE / RESUME
    ========================= */
    function pauseSlider() {
        if (isPaused) return;
        isPaused = true;
        if (timerId !== null) {
            remainingTime = Math.max(
                0,
                deadline - Date.now()
            );
        }
        clearTimer();
        progressBar.style.transition = "none";
        const elapsed =
            deadline - remainingTime;
        const duration = deadline - elapsed;
        const progress =
            duration > 0
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        ((duration - remainingTime) / duration) * 100
                    )
                )
                : 0;
        progressBar.style.width = `${progress}%`;
    }
    function resumeSlider() {
        if (!isPaused) return;
        isPaused = false;
        if (remainingTime <= 0) {
            nextSlide();
            scheduleNext(AUTO_DELAY);
        } else {
            scheduleNext(remainingTime);
        }
    }
    slider.addEventListener("mouseenter", pauseSlider);
    slider.addEventListener("mouseleave", resumeSlider);
    slider.addEventListener("focusin", pauseSlider);
    slider.addEventListener("focusout", (event) => {
        if (!slider.contains(event.relatedTarget)) {
            resumeSlider();
        }
    });
    /* =========================
       PAUSE WHEN TAB IS HIDDEN
    ========================= */
    document.addEventListener("visibilitychange", () => {
        isPageVisible = !document.hidden;

        if (!isPageVisible) {
            pauseSlider();
        } else {
            resumeSlider();
        }
    });
    /* =========================
       PAUSE WHEN OFFSCREEN
    ========================= */
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            ([entry]) => {
                isInViewport = entry.isIntersecting;
                if (!isInViewport) {
                    pauseSlider();
                } else {
                    resumeSlider();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(slider);
    }
    /* =========================
       TOUCH SWIPE
    ========================= */
    slider.addEventListener(
        "touchstart",
        (event) => {
            const touch = event.changedTouches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        },
        { passive: true }
    );
    slider.addEventListener(
        "touchend",
        (event) => {
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            if (
                Math.abs(deltaX) < 50 ||
                Math.abs(deltaX) < Math.abs(deltaY)
            ) {
                return;
            }
            if (deltaX > 0) {
                previousSlide();
            } else {
                nextSlide();
            }

            scheduleNext(MANUAL_DELAY);
        },
        { passive: true }
    );
    /* =========================
       REDUCED MOTION
    ========================= */

    function handleMotionPreference() {
        clearTimer();

        if (reducedMotion.matches) {
            progressBar.style.transition = "none";
            progressBar.style.width = "0%";
        } else if (canRun()) {
            scheduleNext(AUTO_DELAY);
        }
    }

    if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener(
            "change",
            handleMotionPreference
        );
    } else {
        reducedMotion.addListener(handleMotionPreference);
    }

    /* =========================
       INITIALIZE
    ========================= */

    updateSlide();
    scheduleNext(AUTO_DELAY);
});
/*  ==========================================
        Header
    ==========================================*/
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const siteNav = document.getElementById("site-navigation");
    if (!menuToggle || !siteNav) {
        return;
    }
    function setMenuState(isOpen) {
        menuToggle.classList.toggle("is-open", isOpen);
        siteNav.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "بستن منو" : "باز کردن منو"
        );
    }
    menuToggle.addEventListener("click", () => {
        const isOpen =
            menuToggle.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
    });
    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setMenuState(false);
        });
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });
    document.addEventListener("click", (event) => {
        const clickedInsideMenu = siteNav.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);
        if (!clickedInsideMenu && !clickedToggle) {
            setMenuState(false);
        }
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            setMenuState(false);
        }
    });
});
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});
document.querySelectorAll(".reveal").forEach((element) => {
    observer.observe(element);
});
/*  ====================*/
(() => {
    const gallery = document.querySelector("#schoolGallery");
    if (!gallery || gallery.dataset.ready) return;
    gallery.dataset.ready = "true";
    const main = gallery.querySelector(".gallery-main");
    const image = gallery.querySelector(".gallery-image");
    const blur = gallery.querySelector(".gallery-blur");
    const thumbs = [...gallery.querySelectorAll(".gallery-thumb")];
    const prev = gallery.querySelector(".gallery-prev");
    const next = gallery.querySelector(".gallery-next");
    const viewer = document.querySelector(".gallery-viewer");
    const viewerImage = viewer.querySelector(".gallery-viewer-image");
    const close = viewer.querySelector(".gallery-close");
    let index = 0;
    let startX = 0;
    let startY = 0;
    function showImage(i) {
        index = (i + thumbs.length) % thumbs.length;
        const thumbImage = thumbs[index].querySelector("img");
        const src = thumbImage.src;
        image.src = src;
        blur.src = src;
        image.alt = `تصویر ${index + 1} گالری مکتب نسل نو`;
        thumbs.forEach((thumb, n) => {
            thumb.classList.toggle("active", n === index);
        });
    }
    prev.addEventListener("click", () => showImage(index - 1));
    next.addEventListener("click", () => showImage(index + 1));
    thumbs.forEach((thumb, i) => {
        thumb.addEventListener("click", () => showImage(i));
    });
    function openViewer() {
        viewerImage.src = image.src;
        viewerImage.alt = image.alt;

        viewer.classList.add("open");
        viewer.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
        close.focus();
    }
    function closeViewer() {
        viewer.classList.remove("open");
        viewer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        viewerImage.src = "";
    }
    image.addEventListener("click", openViewer);
    close.addEventListener("click", closeViewer);
    viewer.addEventListener("click", event => {
        if (event.target === viewer) closeViewer();
    });
    document.addEventListener("keydown", event => {
        if (viewer.classList.contains("open")) {
            if (event.key === "Escape") closeViewer();
            return;
        }
        if (!gallery.contains(document.activeElement)) return;
        if (event.key === "ArrowLeft") showImage(index + 1);
        if (event.key === "ArrowRight") showImage(index - 1);
    });
    main.addEventListener("touchstart", event => {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    }, { passive: true });
    main.addEventListener("touchend", event => {
        const diffX = event.changedTouches[0].clientX - startX;
        const diffY = event.changedTouches[0].clientY - startY;
        if (Math.abs(diffX) < 45) return;
        if (Math.abs(diffX) < Math.abs(diffY)) return;
        if (diffX < 0) {
            showImage(index + 1);
        } else {
            showImage(index - 1);
        }
    }, { passive: true });
    showImage(0);
})();
/*============================================*/
const statNumbers = document.querySelectorAll(".stat-number");
if ("IntersectionObserver" in window) {
    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            const target = Number(element.dataset.target);
            if (!Number.isFinite(target)) {
                observer.unobserve(element);
                return;
            }
            const duration = 1500;
            const startTime = performance.now();
            function updateNumber(currentTime) {
                const progress = Math.min(
                    (currentTime - startTime) / duration,
                    1
                );
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                element.textContent = Math.round(
                    target * easedProgress
                ).toLocaleString("en-US");
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                }
            }
            requestAnimationFrame(updateNumber);
            observer.unobserve(element);
        });
    }, {
        threshold: 0.5
    });
    statNumbers.forEach(number => statObserver.observe(number));
} else {
    statNumbers.forEach(number => {
        number.textContent = Number(number.dataset.target).toLocaleString("en-US");
    });
}