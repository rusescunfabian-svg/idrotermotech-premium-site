const currentYear = new Date().getFullYear();
const footer = document.querySelector(".footer-inner p:last-child");
const intro = document.getElementById("intro");
const mainNav = document.getElementById("mainNav");
const uploadTrigger = document.getElementById("uploadTrigger");
const portfolioUpload = document.getElementById("portfolioUpload");
const navLogo = document.getElementById("navLogo");

if (footer) {
  footer.textContent = `P.IVA e dati fiscali su richiesta - ${currentYear} - Tutti i diritti riservati`;
}

if (intro) {
  document.body.classList.add("intro-active");
  window.setTimeout(() => {
    intro.classList.add("hidden");
    document.body.classList.remove("intro-active");
  }, 2100);
}

const imageFallbacks = [
  ["assets/bagno-1.jpg", "assets/bagno1.jpg", "assets/1.jpg", "assets/1.png"],
  ["assets/bagno-2.jpg", "assets/bagno2.jpg", "assets/2.jpg", "assets/2.png"],
  ["assets/bagno-3.jpg", "assets/bagno3.jpg", "assets/3.jpg", "assets/3.png"],
  ["assets/bagno-4.jpg", "assets/bagno4.jpg", "assets/4.jpg", "assets/4.png"],
];

const portfolioImages = document.querySelectorAll(".portfolio-card img");

const savedPortfolio = JSON.parse(localStorage.getItem("portfolioImagesBase64") || "[]");
portfolioImages.forEach((img, index) => {
  if (savedPortfolio[index]) {
    img.src = savedPortfolio[index];
  }
  const focus = img.dataset.focus;
  if (focus) {
    img.style.setProperty("--focus", focus);
  }
});

portfolioImages.forEach((img, index) => {
  const candidates = imageFallbacks[index] || [img.getAttribute("src")];
  let candidateIdx = 0;

  if (!img.getAttribute("src")) {
    img.src = candidates[candidateIdx];
  }

  img.addEventListener("error", () => {
    candidateIdx += 1;
    if (candidateIdx < candidates.length) {
      img.src = candidates[candidateIdx];
      return;
    }
    img.src = `https://placehold.co/1200x1500/101a2d/e8edf7?text=Bagno+Premium+${index + 1}`;
  });
});

const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));

const parallaxImages = document.querySelectorAll(".parallax-img");
const updateParallax = () => {
  const viewportH = window.innerHeight || 1;
  parallaxImages.forEach((img) => {
    const rect = img.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > viewportH) return;
    const relative = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
    const offset = relative * -14;
    img.style.transform = `translateY(${offset}px) scale(1.02)`;
  });
};

window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);
updateParallax();

const updateNavState = () => {
  if (!mainNav) return;
  if (window.scrollY > 24) {
    mainNav.classList.add("scrolled");
  } else {
    mainNav.classList.remove("scrolled");
  }
};
window.addEventListener("scroll", updateNavState, { passive: true });
updateNavState();

const animateCounter = (el) => {
  const target = Number(el.dataset.target || "0");
  const suffix = el.dataset.suffix || "";
  const duration = 1100;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
    el.textContent = `${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counters = document.querySelectorAll(".counter");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
counters.forEach((counter) => counterObserver.observe(counter));

if (uploadTrigger && portfolioUpload) {
  uploadTrigger.addEventListener("click", () => {
    portfolioUpload.click();
  });

  portfolioUpload.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 4);
    if (!files.length) return;

    const toBase64 = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });

    const imagesAsBase64 = await Promise.all(files.map(toBase64));
    imagesAsBase64.forEach((src, idx) => {
      if (portfolioImages[idx]) portfolioImages[idx].src = src;
    });
    localStorage.setItem("portfolioImagesBase64", JSON.stringify(imagesAsBase64));
  });
}

if (navLogo) {
  const savedLogo = localStorage.getItem("brandLogoBase64");
  if (savedLogo) navLogo.src = savedLogo;
  navLogo.addEventListener("error", () => {
    navLogo.style.display = "none";
  });
}
