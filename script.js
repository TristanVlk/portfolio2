/* script.js
   Single JS file to:
   - load tsParticles (cdn)
   - load Swiper (cdn)
   - init particles only inside #hero (lines, white, slow)
   - init Swiper (mySwiper)
   - init hero reveal (IntersectionObserver)
   - init lightbox for images/videos
*/

(() => {
  // --- helper to load external scripts dynamically ---
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  // Insert small CSS needed for particles positioning inside hero
  (function injectStyles() {
    const css = `
/* injected by script.js -> keeps particles inside hero and behind content */
#hero { position: relative; overflow: hidden; }
#particles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
/* ensure hero content sits above particles */
.hero-container { position: relative; z-index: 2; }
/* if tsParticles creates its own canvas, make it fit */
#particles > canvas { display: block; width: 100% !important; height: 100% !important; }
    `.trim();

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  })();

  // Ensure container for particles exists and is a div (tsParticles prefers a container element)
  function ensureParticlesContainer() {
    const existing = document.getElementById("particles");
    if (!existing) {
      // create it inside hero
      const hero = document.getElementById("hero");
      if (!hero) return null;
      const div = document.createElement("div");
      div.id = "particles";
      hero.insertBefore(div, hero.firstChild);
      return div;
    }
    // if it's a <canvas>, replace it with a div (to avoid conflicts)
    if (existing.tagName === "CANVAS") {
      const div = document.createElement("div");
      div.id = "particles";
      existing.parentNode.replaceChild(div, existing);
      return div;
    }
    return existing;
  }

  // Initialize tsParticles with white connected-lines, slow motion
  async function initParticles() {
    // load tsParticles CDN
    await loadScript("https://cdn.jsdelivr.net/npm/tsparticles-engine@3/tsparticles.engine.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/tsparticles@3/tsparticles.min.js");

    // if tsParticles isn't available, exit gracefully
    const tsParticles = window.tsParticles || window.particlesJS || window.loadFull || null;
    if (!window.tsParticles) {
      console.warn("tsParticles not found after load.");
      return;
    }

    const containerEl = ensureParticlesContainer();
    if (!containerEl) return;

    // configuration for lines + dots, white color, slow (Style 2)
    const particlesConfig = {
      fullScreen: { enable: false }, // do not cover full screen
      detectRetina: true,
      fpsLimit: 60,
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 50, density: { enable: true, area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.9, random: { enable: true, minimumValue: 0.2 } },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          distance: 120,
          color: "#ffffff",
          opacity: 0.5,
          width: 0.9
        },
        move: {
          enable: true,
          speed: 0.3,       // slow speed (you asked A)
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "bounce" },
          attract: { enable: false }
        }
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: { enable: true, mode: "grab" },
          onClick: { enable: false },
          resize: true
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.7 } }
        }
      }
    };

    // use tsParticles.load to attach to container id
    try {
      // ensure tsParticles is the correct entry
      if (window.tsParticles && typeof window.tsParticles.load === "function") {
        await window.tsParticles.load(containerEl.id, particlesConfig);
      } else if (window.particlesJS && typeof window.particlesJS === "function") {
        // fallback in case particles.js is present
        window.particlesJS(containerEl.id, particlesConfig);
      } else {
        console.warn("No particles loader available.");
      }
    } catch (err) {
      console.error("Error initializing particles:", err);
    }
  }

  // Initialize Swiper (dynamically load if needed)
  async function initSwiper() {
    // If global Swiper exists, no need to load. Otherwise load CDN
    if (!window.Swiper) {
      await loadScript("https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js");
    }

    // Wait a tick to ensure DOM is ready
    await new Promise(r => setTimeout(r, 20));

    try {
      // Works slider (selector .mySwiper)
      if (typeof window.Swiper === "function") {
        new window.Swiper(".mySwiper", {
          slidesPerView: 1,
          spaceBetween: 30,
          loop: true,
          pagination: { el: ".works-pagination", clickable: true },
          navigation: { nextEl: ".works-next", prevEl: ".works-prev" },
          breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });

        // Initialize other sliders if present (mySwiperBrochure)
        const brochureEl = document.querySelector(".mySwiperBrochure");
        if (brochureEl) {
          new window.Swiper(".mySwiperBrochure", {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: { el: ".brochure-pagination", clickable: true },
            navigation: { nextEl: ".brochure-next", prevEl: ".brochure-prev" },
            breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
          });
        }
      }
    } catch (err) {
      console.error("Swiper init error:", err);
    }
  }

  // Hero reveal (IntersectionObserver)
  function initHeroReveal() {
    const hero = document.querySelector("#hero");
    if (!hero) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        hero.classList.toggle("show", entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    obs.observe(hero);
  }

  // Lightbox functionality (images/videos/zoomable)
  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxVideo = document.getElementById("lightbox-video");
    const lightboxClose = lightbox.querySelector(".lightbox-close");

    // helper to open
    function open(item) {
      lightbox.classList.add("active");
      if (item.tagName === "IMG") {
        lightboxImg.src = item.src;
        lightboxImg.style.display = "block";
        if (lightboxVideo) lightboxVideo.style.display = "none";
      } else if (item.tagName === "VIDEO") {
        const source = item.querySelector("source");
        if (source && lightboxVideo) {
          lightboxVideo.querySelector("source").src = source.src || source.getAttribute("src");
          lightboxVideo.load();
          lightboxVideo.style.display = "block";
          lightboxImg.style.display = "none";
        }
      }
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("active");
      if (lightboxVideo) {
        try { lightboxVideo.pause(); } catch(e) {}
        if (lightboxVideo.querySelector("source")) lightboxVideo.querySelector("source").src = "";
      }
      if (lightboxImg) lightboxImg.src = "";
      document.body.style.overflow = "";
    }

    // attach listeners to portfolio items and zoomable images
    document.querySelectorAll(".portfolio-item img, .portfolio-item video, .zoomable").forEach(item => {
      item.addEventListener("click", () => open(item));
    });

    if (lightboxClose) lightboxClose.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (lightbox.classList.contains("active") && e.key === "Escape") close();
    });
  }

  // main init sequence
  async function main() {
    // run synchronous init that doesn't need external libs
    initHeroReveal();
    initLightbox();

    // init swiper (loads Swiper if missing) and particles
    await Promise.all([initSwiper(), initParticles()]);
  }

  // wait for DOM ready then run
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
  var swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 20,
    loop: true,  // enables infinite loop
    grabCursor: true,
    autoplay: {
      delay: 1000, // 1 sec auto swipe
      disableOnInteraction: false, // keeps autoplay after user swipes
    },
    speed: 800, // smooth sliding
    pagination: {
      el: ".works-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".works-next",
      prevEl: ".works-prev",
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });


