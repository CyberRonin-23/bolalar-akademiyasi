/* ═══════════════════════════════════════════
   BOLALAR AKADEMIYASI — Interactions
════════════════════════════════════════════ */

/* ─── Preloader ─── */
function hidePreloader() {
  const pre = document.getElementById("preloader");
  if (!pre || pre.classList.contains("hide")) return;
  pre.classList.add("hide");
}
window.addEventListener("load", () => setTimeout(hidePreloader, 300));
setTimeout(hidePreloader, 2000);

/* ─── Nav scroll state + mobile menu ─── */
const nav = document.getElementById("nav");
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 40);
  toTop.classList.toggle("show", y > 600);
}, { passive: true });

const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
burger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  burger.classList.toggle("active");
});
navLinks.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    burger.classList.remove("active");
  });
});

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ─── Scroll reveal (re-observes on re-render) ─── */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

function observeReveals(root = document) {
  root.querySelectorAll(".reveal:not(.in)").forEach((el) => revealIO.observe(el));
}

/* ─── Animated counters ─── */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    countIO.unobserve(entry.target);
  });
}, { threshold: 0.5 });

/* ─── Renderers (data-driven, re-run on language change) ─── */
function renderValues() {
  const track = document.getElementById("valuesTrack");
  track.innerHTML = contentData[currentLang].values
    .map((v) => `<span class="value-chip">${v}</span>`)
    .join("");
}

function renderStats() {
  const grid = document.getElementById("statsGrid");
  grid.innerHTML = contentData[currentLang].stats
    .map(
      (s) => `
    <div class="stat-card">
      <div class="stat-icon"><svg class="icon"><use href="#${s.icon}"/></svg></div>
      <div class="stat-num" data-count="${s.num}">0</div>
      <div class="stat-label">${s.label}</div>
    </div>`
    )
    .join("");
  grid.querySelectorAll(".stat-num").forEach((el) => countIO.observe(el));
}

let activeTabIndex = 0;
const TAB_PHOTOS = [
  "assets/photos/tab-preschool.jpg",
  "assets/photos/tab-primary.jpg",
  "assets/photos/tab-grade0.jpg",
  "assets/photos/tab-secondary.jpg",
];
function renderTabs() {
  const tabs = contentData[currentLang].ageTabs;
  const tr = translations[currentLang];
  const nav = document.getElementById("tabsNav");
  const panel = document.getElementById("tabsPanel");

  nav.innerHTML = tabs
    .map((tab, i) => `<button class="tab-btn${i === activeTabIndex ? " active" : ""}" data-tab="${i}" role="tab">${tab.label}</button>`)
    .join("");

  panel.innerHTML = tabs
    .map((tab, i) => {
      let listsHtml = "";
      if (tab.subjects) {
        listsHtml += `<div class="tab-list-title">${tr["approach.subjectsLabel"]}</div><div class="tab-tags">${tab.subjects.map((s) => `<span class="tab-tag">${s}</span>`).join("")}</div>`;
      }
      if (tab.extra) {
        listsHtml += `<div class="tab-list-title">${tr["approach.extraLabel"]}</div><div class="tab-tags">${tab.extra.map((s) => `<span class="tab-tag">${s}</span>`).join("")}</div>`;
      }
      if (tab.specials) {
        listsHtml += `<div class="tab-list-title">${tr["approach.specialsLabel"]}</div><div class="tab-tags">${tab.specials.map((s) => `<span class="tab-tag">${s}</span>`).join("")}</div>`;
      }
      if (tab.approach) {
        listsHtml += `<div class="tab-list-title">${tr["approach.approachLabel"]}</div><p>${tab.approach}</p>`;
      }
      if (tab.desc) {
        listsHtml += `<p>${tab.desc}</p>`;
      }
      if (tab.note) {
        listsHtml += `<div class="tab-note">${tab.note}</div>`;
      }
      return `
      <div class="tab-content${i === activeTabIndex ? " active" : ""}" data-tab-content="${i}">
        <div class="tab-text">
          <h3 class="tab-heading">${tab.heading}</h3>
          ${listsHtml}
        </div>
        <div class="tab-photo"><div class="photo-frame"><img src="${TAB_PHOTOS[i]}" alt="${tab.heading}" loading="lazy"></div></div>
      </div>`;
    })
    .join("");

  nav.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTabIndex = parseInt(btn.dataset.tab, 10);
      nav.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      panel.querySelectorAll(".tab-content").forEach((c) => c.classList.toggle("active", parseInt(c.dataset.tabContent, 10) === activeTabIndex));
    });
  });
}

/* ─── Team: founders (fixed) + category carousel ─── */
let carouselOffset = 0;
let carouselPaused = false;
let carouselRAF = null;
let carouselSetWidth = 0;
let carouselStatic = false; // true when the category has few enough members to fit without scrolling
let activeTeamCategory = 0;

function renderFounders() {
  const grid = document.getElementById("foundersGrid");
  const founders = contentData[currentLang].team.founders;
  grid.innerHTML = founders
    .map(
      (m, idx) => `
    <div class="team-card founder-card" data-founder="${idx}">
      <div class="team-photo"><div class="ph-photo" data-label="${m.name} surati"></div></div>
      <div class="team-info">
        <div class="team-name">${m.name}</div>
        <div class="team-role">${m.role}</div>
      </div>
    </div>`
    )
    .join("");

  grid.querySelectorAll(".founder-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.founder, 10);
      openTeamModal(founders[idx]);
    });
  });
}

function renderTeamCategories() {
  const wrap = document.getElementById("teamCategories");
  const categories = contentData[currentLang].team.categories;
  if (activeTeamCategory >= categories.length) activeTeamCategory = 0;

  wrap.innerHTML = categories
    .map((cat, i) => `<button class="tab-btn${i === activeTeamCategory ? " active" : ""}" data-cat="${i}">${cat.label}</button>`)
    .join("");

  wrap.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTeamCategory = parseInt(btn.dataset.cat, 10);
      wrap.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      renderTeamCarousel();
    });
  });

  renderTeamCarousel();
}

function renderTeamCarousel() {
  const track = document.getElementById("teamTrack");
  const viewport = document.querySelector(".carousel");
  const controls = document.querySelector(".carousel-controls");
  const categories = contentData[currentLang].team.categories;
  const members = (categories[activeTeamCategory] && categories[activeTeamCategory].members) || [];
  const cardHtml = (m, idx) => `
    <div class="team-card" data-member="${idx}">
      ${m.placeholder
        ? `<div class="team-avatar-slot"><svg class="icon"><use href="#i-users"/></svg></div>`
        : `<div class="team-photo"><div class="ph-photo" data-label="${m.name} surati"></div></div>`}
      <div class="team-info">
        <div class="team-name">${m.name}</div>
        <div class="team-role">${m.role}</div>
        ${m.placeholder ? `<span class="team-badge">${m.role}</span>` : ""}
      </div>
    </div>`;

  const single = members.map((m, i) => cardHtml(m, i)).join("");

  // Render one set first to measure whether it even needs to scroll. Clear
  // any stale .static (flex-wrap) state left over from the previous category
  // first, otherwise this measurement silently wraps instead of overflowing.
  track.classList.remove("static");
  track.innerHTML = single;
  track.style.transform = "translateX(0px)";
  const fitsWithoutScroll = track.scrollWidth <= viewport.clientWidth;

  carouselStatic = fitsWithoutScroll;
  carouselOffset = 0;
  track.classList.toggle("static", fitsWithoutScroll);
  controls.style.display = fitsWithoutScroll ? "none" : "";

  if (fitsWithoutScroll) {
    carouselSetWidth = 0; // nothing to loop — cards just sit centered
  } else {
    track.innerHTML = single + single; // duplicate set for a seamless loop
    track.style.transform = "translateX(0px)";
    carouselSetWidth = track.scrollWidth / 2;
  }

  track.querySelectorAll(".team-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.member, 10);
      openTeamModal(members[idx]);
    });
  });
}

function startCarousel() {
  cancelAnimationFrame(carouselRAF);
  let last = performance.now();
  function step(now) {
    const dt = now - last;
    last = now;
    if (!carouselPaused && carouselSetWidth > 0) {
      carouselOffset -= dt * 0.075; // px per ms
      if (Math.abs(carouselOffset) >= carouselSetWidth) carouselOffset += carouselSetWidth;
      document.getElementById("teamTrack").style.transform = `translateX(${carouselOffset}px)`;
    }
    carouselRAF = requestAnimationFrame(step);
  }
  carouselRAF = requestAnimationFrame(step);
}

const carouselEl = document.querySelector(".carousel");
carouselEl.addEventListener("mouseenter", () => (carouselPaused = true));
carouselEl.addEventListener("mouseleave", () => (carouselPaused = false));

/* ─── Manual carousel nudge (prev/next buttons) ─── */
const CARD_STEP = 260 + 24; // team-card width + gap
let carouselResumeTimer = null;

function nudgeCarousel(dir) {
  if (carouselStatic) return;
  carouselPaused = true;
  clearTimeout(carouselResumeTimer);
  const track = document.getElementById("teamTrack");
  const startOffset = carouselOffset;
  const targetOffset = startOffset - dir * CARD_STEP;
  const duration = 420;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    carouselOffset = startOffset + (targetOffset - startOffset) * eased;
    if (carouselSetWidth > 0) {
      if (carouselOffset <= -carouselSetWidth) carouselOffset += carouselSetWidth;
      if (carouselOffset > 0) carouselOffset -= carouselSetWidth;
    }
    track.style.transform = `translateX(${carouselOffset}px)`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      carouselResumeTimer = setTimeout(() => { carouselPaused = false; }, 2000);
    }
  }
  requestAnimationFrame(tick);
}

document.getElementById("carouselPrev").addEventListener("click", () => nudgeCarousel(-1));
document.getElementById("carouselNext").addEventListener("click", () => nudgeCarousel(1));

/* ─── Team modal ─── */
const teamModal = document.getElementById("teamModal");
function openTeamModal(member) {
  carouselPaused = true;
  document.getElementById("teamModalBody").innerHTML = `
    <div class="team-modal-photo">
      ${member.placeholder
        ? `<div class="team-avatar-slot"><svg class="icon"><use href="#i-users"/></svg></div>`
        : `<div class="ph-photo" data-label="${member.name} surati"></div>`}
    </div>
    <h3>${member.name}</h3>
    <div class="team-role">${member.role}</div>
    <p>${member.bio}</p>
  `;
  teamModal.classList.add("open");
}
function closeTeamModal() {
  teamModal.classList.remove("open");
  carouselPaused = false;
}
document.getElementById("teamModalClose").addEventListener("click", closeTeamModal);
teamModal.addEventListener("click", (e) => { if (e.target === teamModal) closeTeamModal(); });

/* ─── Highlights ─── */
function renderHighlights() {
  const grid = document.getElementById("highlightsGrid");
  grid.innerHTML = contentData[currentLang].highlights
    .map(
      (h) => `
    <div class="highlight-card">
      <div class="highlight-icon"><svg class="icon"><use href="#${h.icon}"/></svg></div>
      <h4>${h.title}</h4>
      <p>${h.desc}</p>
    </div>`
    )
    .join("");
}

/* ─── Testimonials ─── */
const TESTIMONIAL_PHOTOS = [
  "assets/photos/parent-nilufar.jpg",
  "assets/photos/parent-sardor.jpg",
  "assets/photos/parent-dilnoza.jpg",
];

function renderTestimonials() {
  const grid = document.getElementById("testimonialsGrid");
  grid.innerHTML = contentData[currentLang].testimonials
    .map(
      (item, i) => `
    <div class="testimonial-card">
      <span class="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
      <p class="testimonial-text">${item.text}</p>
      <div class="testimonial-meta">
        <div class="testimonial-avatar"><img src="${TESTIMONIAL_PHOTOS[i]}" alt="${item.name}" loading="lazy"></div>
        <div>
          <div class="testimonial-name">${item.name}</div>
          <div class="testimonial-role">${item.role}</div>
        </div>
      </div>
    </div>`
    )
    .join("");
}

/* ─── FAQ accordion ─── */
function renderFaq() {
  const wrap = document.getElementById("faqAccordion");
  wrap.innerHTML = contentData[currentLang].faq
    .map(
      (item, i) => `
    <div class="accordion-item" data-faq="${i}">
      <button class="accordion-q" aria-expanded="false">
        <span>${item.q}</span>
        <svg class="icon"><use href="#i-chevron"/></svg>
      </button>
      <div class="accordion-a"><div class="accordion-a-inner">${item.a}</div></div>
    </div>`
    )
    .join("");

  wrap.querySelectorAll(".accordion-item").forEach((item) => {
    const q = item.querySelector(".accordion-q");
    const a = item.querySelector(".accordion-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      wrap.querySelectorAll(".accordion-item.open").forEach((openItem) => {
        openItem.classList.remove("open");
        openItem.querySelector(".accordion-q").setAttribute("aria-expanded", "false");
        openItem.querySelector(".accordion-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}

/* ─── Re-render everything on language change ─── */
function onLangChange() {
  renderValues();
  renderStats();
  renderTabs();
  renderFounders();
  renderTeamCategories();
  renderHighlights();
  renderTestimonials();
  renderFaq();
  observeReveals();
}

/* ─── Lead form ─── */
const leadForm = document.getElementById("leadForm");
const leadSubmit = document.getElementById("leadSubmit");
const successModal = document.getElementById("successModal");

function showFieldError(field, message) {
  const wrap = leadForm.querySelector(`[name="${field}"]`).closest(".field");
  wrap.classList.toggle("invalid", !!message);
  wrap.querySelector(".field-error").textContent = message || "";
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  return /^998\d{9}$/.test(digits) || /^\d{9}$/.test(digits);
}

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tr = translations[currentLang];
  const name = leadForm.name.value.trim();
  const age = leadForm.age.value;
  const phone = leadForm.phone.value.trim();

  let valid = true;
  showFieldError("name", "");
  showFieldError("age", "");
  showFieldError("phone", "");
  document.getElementById("formError").textContent = "";

  if (!name) { showFieldError("name", tr["form.err.name"]); valid = false; }
  if (!age) { showFieldError("age", tr["form.err.age"]); valid = false; }
  if (!validatePhone(phone)) { showFieldError("phone", tr["form.err.phone"]); valid = false; }
  if (!valid) return;

  leadSubmit.classList.add("loading");
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, phone, lang: currentLang }),
    });
    if (!res.ok) throw new Error("submit failed");
    successModal.classList.add("open");
    leadForm.reset();
  } catch (err) {
    document.getElementById("formError").textContent = tr["form.err.submit"];
  } finally {
    leadSubmit.classList.remove("loading");
  }
});

function closeSuccessModal() { successModal.classList.remove("open"); }
document.getElementById("successModalClose").addEventListener("click", closeSuccessModal);
document.getElementById("successModalOk").addEventListener("click", closeSuccessModal);
successModal.addEventListener("click", (e) => { if (e.target === successModal) closeSuccessModal(); });

/* ─── Global ESC to close modals ─── */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeTeamModal();
    closeSuccessModal();
  }
});

/* ─── Footer year ─── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ─── Init ───
   Initial render is triggered by i18n.js's applyTranslations() -> onLangChange()
   on DOMContentLoaded (i18n.js loads first, so its listener fires first).
   Here we only start the carousel loop once. */
document.addEventListener("DOMContentLoaded", () => {
  startCarousel();
});
