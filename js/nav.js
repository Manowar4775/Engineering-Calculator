// Client-side navigation: switches between <section class="view"> panels by
// URL hash, no page reload. Also drives the mobile off-canvas side nav.

const VALID_VIEWS = [
  "home", "basic", "bmi", "stress", "strain",
  "scientific", "converter", "percentage", "average", "history",
];

function currentViewFromHash() {
  const hash = window.location.hash.replace("#", "");
  return VALID_VIEWS.includes(hash) ? hash : "home";
}

function showView(name) {
  document.querySelectorAll(".view").forEach((el) => {
    el.hidden = el.dataset.view !== name;
  });
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.nav === name);
  });
  const main = document.getElementById("main");
  if (main) main.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
  closeMobileNav();
}

function closeMobileNav() {
  document.getElementById("sideNav")?.classList.remove("is-open");
  document.getElementById("navScrim")?.classList.remove("is-visible");
  document.getElementById("navToggle")?.setAttribute("aria-expanded", "false");
}

export function initNav() {
  showView(currentViewFromHash());
  window.addEventListener("hashchange", () => showView(currentViewFromHash()));

  const toggle = document.getElementById("navToggle");
  const sideNav = document.getElementById("sideNav");
  const scrim = document.getElementById("navScrim");

  toggle?.addEventListener("click", () => {
    const isOpen = sideNav.classList.toggle("is-open");
    scrim.classList.toggle("is-visible", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  scrim?.addEventListener("click", closeMobileNav);
}
