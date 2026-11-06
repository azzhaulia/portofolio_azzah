const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const themeToggle = document.querySelector(".theme-toggle");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#171816" : "#ffffff";
}

applyTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  document.documentElement.dataset.themeSource = "saved";
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch (error) {
    console.warn("Tidak dapat menyimpan preferensi tema.", error);
  }
});
systemTheme.addEventListener("change", (event) => {
  if (document.documentElement.dataset.themeSource === "system") {
    applyTheme(event.matches ? "dark" : "light");
  }
});

function setMenuOpen(isOpen) {
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.querySelector(".sr-only").textContent = isOpen ? "Tutup navigasi" : "Buka navigasi";
  navigation.classList.toggle("is-open", isOpen);
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

document.addEventListener("click", (event) => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
    setMenuOpen(false);
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 761px)").addEventListener("change", () => setMenuOpen(false));

const pages = document.querySelectorAll("main > section");
const navigationLinks = navigation.querySelectorAll("a");

function updatePage() {
  const requestedId = location.hash.slice(1);
  const activeId = [...pages].some((section) => section.id === requestedId) ? requestedId : "home";
  pages.forEach((section) => {
    section.hidden = section.id !== activeId;
  });
  navigationLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${activeId}`) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("hashchange", updatePage);
updatePage();

document.querySelector("#footer-year").textContent = String(new Date().getFullYear());
document.querySelector(".footer-top").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
  });
});

document.querySelector(".about-intro-explore").addEventListener("click", () => {
  document.querySelector("#education-history").scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "start"
  });
});

const galleryWall = document.querySelector(".gallery-masonry");
const galleryPhotos = [...galleryWall.querySelectorAll(".gallery-photo")];
galleryWall.replaceChildren();
const placedGalleryPhotos = new Set();
for (let columnIndex = 0; columnIndex < 4; columnIndex++) {
  const column = document.createElement("div");
  column.className = "gallery-column";
  for (let rowIndex = 0; rowIndex < 24; rowIndex++) {
    const photoIndex = (columnIndex * 3 + rowIndex) % galleryPhotos.length;
    const source = galleryPhotos[photoIndex];
    if (!placedGalleryPhotos.has(photoIndex)) {
      column.append(source);
      placedGalleryPhotos.add(photoIndex);
    } else {
      const tile = document.createElement("div");
      tile.className = "gallery-photo";
      tile.setAttribute("aria-hidden", "true");
      const image = source.querySelector("img").cloneNode();
      image.alt = "";
      tile.append(image);
      column.append(tile);
    }
  }
  galleryWall.append(column);
}

const aboutPhoto = document.querySelector(".home-about-photo");
const originalPhoto = aboutPhoto.getAttribute("src");
const originalPhotoAlt = aboutPhoto.alt;
const photoWithoutHover = window.matchMedia("(hover: none)");

function updateAboutPhoto(showGraduation) {
  aboutPhoto.src = showGraduation ? "toga.jpeg" : originalPhoto;
  aboutPhoto.alt = showGraduation ? "Potret toga Azzah Aulia Syarif" : originalPhotoAlt;
}

updateAboutPhoto(photoWithoutHover.matches);
photoWithoutHover.addEventListener("change", () => {
  updateAboutPhoto(photoWithoutHover.matches);
});

aboutPhoto.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "touch") return;
  updateAboutPhoto(true);
});

aboutPhoto.addEventListener("pointerleave", () => {
  updateAboutPhoto(photoWithoutHover.matches);
});

const rippleLayer = document.querySelector(".ripple-layer");
const mistArea = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const certificateTrack = document.querySelector(".certificates-track");
const certificatePrevious = document.querySelector(".certificates-prev");
const certificateNext = document.querySelector(".certificates-next");

function updateCertificateControls() {
  certificatePrevious.disabled = certificateTrack.scrollLeft <= 1;
  certificateNext.disabled = certificateTrack.scrollLeft + certificateTrack.clientWidth >= certificateTrack.scrollWidth - 1;
}

for (const [button, direction] of [[certificatePrevious, -1], [certificateNext, 1]]) {
  button.addEventListener("click", () => {
    const card = certificateTrack.querySelector(".certificate-card");
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(certificateTrack).columnGap);
    certificateTrack.scrollBy({
      left: direction * step,
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  });
}
certificateTrack.addEventListener("scroll", updateCertificateControls, { passive: true });
new ResizeObserver(updateCertificateControls).observe(certificateTrack);
updateCertificateControls();

function createMist(x, y) {
  if (reducedMotion.matches) return;
  const bounds = mistArea.getBoundingClientRect();
  if (mistArea.closest("[hidden]") || x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return;
  if (rippleLayer.childElementCount >= 8) rippleLayer.firstElementChild.remove();
  const ripple = document.createElement("div");
  ripple.className = "water-ripple";
  ripple.style.left = `${x - bounds.left}px`;
  ripple.style.top = `${y - bounds.top}px`;
  ripple.append(...Array.from({ length: 3 }, () => document.createElement("span")));
  rippleLayer.append(ripple);
  setTimeout(() => ripple.remove(), 1500);
}

let lastMist = -Infinity;
document.addEventListener("pointermove", (event) => {
  if (event.target.closest(".contact-icon, .home-about, .about-page")) {
    rippleLayer.replaceChildren();
    return;
  }
  if (event.pointerType === "touch" || performance.now() - lastMist < 100) return;
  lastMist = performance.now();
  createMist(event.clientX, event.clientY);
}, { passive: true });

document.addEventListener("click", (event) => {
  if (event.target.closest(".contact-icon, .home-about, .about-page")) {
    rippleLayer.replaceChildren();
    return;
  }
  let x = event.clientX;
  let y = event.clientY;
  if (event.detail === 0) {
    const bounds = event.target.getBoundingClientRect();
    x = bounds.left + bounds.width / 2;
    y = bounds.top + bounds.height / 2;
  }
  createMist(x, y);
});
