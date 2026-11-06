const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
});

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

aboutPhoto.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "touch") return;
  aboutPhoto.src = "toga.jpeg";
  aboutPhoto.alt = "Potret toga Azzah Aulia Syarif";
});

aboutPhoto.addEventListener("pointerleave", () => {
  aboutPhoto.src = originalPhoto;
  aboutPhoto.alt = originalPhotoAlt;
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
