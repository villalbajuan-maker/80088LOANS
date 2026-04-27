const sections = [...document.querySelectorAll(".panel")];
const dotsWrap = document.getElementById("rail-dots");
const progress = document.querySelector(".rail-progress");
const tabs = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];
const gauge = document.querySelector(".gauge");
const returnsTarget = document.querySelector(".returns-end");
const statusIndex = document.getElementById("status-index");
const statusLabel = document.getElementById("status-label");
const hudTitle = document.getElementById("hud-title");
const navLinks = [...document.querySelectorAll(".topnav a")];
const mobileNavLinks = [...document.querySelectorAll(".mobile-nav a")];
const prevSectionButton = document.getElementById("prev-section");
const nextSectionButton = document.getElementById("next-section");
let currentSectionIndex = 0;

function formatLabel(section) {
  return section.querySelector(".eyebrow")?.textContent?.trim() || section.id;
}

sections.forEach((section, index) => {
  const dot = document.createElement("a");
  dot.href = `#${section.id}`;
  dot.className = "rail-dot";
  dot.setAttribute("aria-label", `Jump to section ${index + 1}`);
  dotsWrap.appendChild(dot);
});

const dots = [...document.querySelectorAll(".rail-dot")];

function setActiveSection(activeIndex) {
  currentSectionIndex = activeIndex;
  const activeSection = sections[activeIndex];

  sections.forEach((panel) => panel.classList.remove("active-panel"));
  activeSection.classList.add("active-panel");

  dots.forEach((dot, index) => dot.classList.toggle("active", index === activeIndex));

  navLinks.forEach((link) => {
    const linkTarget = link.getAttribute("href");
    link.classList.toggle("active", linkTarget === `#${activeSection.id}`);
  });

  mobileNavLinks.forEach((link) => {
    const linkTarget = link.getAttribute("href");
    link.classList.toggle("active", linkTarget === `#${activeSection.id}`);
  });

  const progressRatio = activeIndex / Math.max(sections.length - 1, 1);
  progress.style.height = `${progressRatio * 100}%`;

  if (statusIndex) {
    statusIndex.textContent = String(activeIndex + 1).padStart(2, "0");
  }

  const label = formatLabel(activeSection);
  if (statusLabel) statusLabel.textContent = label;
  if (hudTitle) hudTitle.textContent = label;

  if (activeSection.id === "strength") {
    animateGauge();
  }

  if (activeSection.id === "returns") {
    animateReturn();
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const activeIndex = sections.indexOf(entry.target);
      setActiveSection(activeIndex);
    });
  },
  {
    rootMargin: "-30% 0px -40% 0px",
    threshold: 0.1,
  },
);

sections.forEach((section) => observer.observe(section));

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((button) => button.classList.toggle("active", button === tab));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === target));
  });
});

function scrollToSection(index) {
  const boundedIndex = Math.max(0, Math.min(index, sections.length - 1));
  sections[boundedIndex].scrollIntoView({ behavior: "smooth", block: "start" });
}

prevSectionButton?.addEventListener("click", () => scrollToSection(currentSectionIndex - 1));
nextSectionButton?.addEventListener("click", () => scrollToSection(currentSectionIndex + 1));

window.addEventListener("keydown", (event) => {
  const tagName = document.activeElement?.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA") return;

  if (["ArrowDown", "PageDown", "j", "J"].includes(event.key)) {
    event.preventDefault();
    scrollToSection(currentSectionIndex + 1);
  }

  if (["ArrowUp", "PageUp", "k", "K"].includes(event.key)) {
    event.preventDefault();
    scrollToSection(currentSectionIndex - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    scrollToSection(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    scrollToSection(sections.length - 1);
  }
});

let gaugeAnimated = false;
function animateGauge() {
  if (gaugeAnimated || !gauge) return;
  gaugeAnimated = true;
  const score = Number(gauge.dataset.score || "81");
  const degrees = Math.round((score / 100) * 360);
  gauge.style.background = `radial-gradient(circle at center, rgba(11, 31, 58, 0.94) 0 58%, transparent 59%), conic-gradient(#c9a24a 0deg, #c9a24a ${degrees}deg, rgba(255,255,255,0.08) ${degrees}deg)`;
}

let returnAnimated = false;
function animateReturn() {
  if (returnAnimated || !returnsTarget) return;
  returnAnimated = true;
  const finalValue = Number(returnsTarget.dataset.target || "120000");
  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progressValue = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    const currentValue = Math.round(100000 + (finalValue - 100000) * eased);
    returnsTarget.textContent = `$${currentValue.toLocaleString()}`;
    if (progressValue < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

if (sections[0]) {
  setActiveSection(0);
}
