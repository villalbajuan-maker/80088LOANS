const sections = [...document.querySelectorAll(".panel")];
const accessGate = document.getElementById("access-gate");
const accessGateForm = document.getElementById("access-gate-form");
const accessLogin = document.getElementById("access-login");
const accessCode = document.getElementById("access-code");
const accessCodeToggle = document.getElementById("access-code-toggle");
const accessCodeToggleText = document.querySelector(".access-code-toggle-text");
const accessGateError = document.getElementById("access-gate-error");
const accessBriefing = document.getElementById("access-briefing");
const accessBriefingLines = [...document.querySelectorAll(".access-briefing-line")];
const houstonMapNode = document.getElementById("houston-map");
const mapFocusButtons = [...document.querySelectorAll(".map-focus-button")];
const dotsWrap = document.getElementById("rail-dots");
const progress = document.querySelector(".rail-progress");
const tabs = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];
const gauge = document.querySelector(".gauge");
const gaugeValue = document.querySelector(".gauge-value");
const returnsTarget = document.querySelector(".returns-end");
const heroMetricValues = [...document.querySelectorAll(".metric-value")];
const stackNumbers = [...document.querySelectorAll(".stack-number")];
const statusIndex = document.getElementById("status-index");
const statusLabel = document.getElementById("status-label");
const hudTitle = document.getElementById("hud-title");
const navLinks = [...document.querySelectorAll(".topnav a")];
const mobileNavLinks = [...document.querySelectorAll(".mobile-nav a")];
const prevSectionButton = document.getElementById("prev-section");
const nextSectionButton = document.getElementById("next-section");
const companionOrb = document.getElementById("companion-orb");
const companionPanel = document.getElementById("companion-panel");
const companionBackdrop = document.getElementById("companion-backdrop");
const companionClose = document.getElementById("companion-close");
const companionForm = document.getElementById("companion-form");
const companionInput = document.getElementById("companion-input");
const companionThread = document.getElementById("companion-thread");
const suggestionButtons = [...document.querySelectorAll(".suggestion-chip")];
let currentSectionIndex = 0;
let companionPending = false;
let heroMetricsAnimated = false;
let capitalAnimated = false;
let houstonMap;
let houstonMapReady = false;
const ACCESS_LOGIN = "investor";
const ACCESS_CODE = "80088loans";
const ACCESS_STORAGE_KEY = "80088loans-investor-access";
const BRIEFING_DURATION_MS = 4200;
const BRIEFING_ROTATION_MS = 1150;
const HOUSTON_MAP_POINTS = [
  {
    id: "green-river",
    title: "Green River",
    copy: "77028 focus with permit-backed infill positioning.",
    center: [-95.286, 29.828],
  },
  {
    id: "ward",
    title: "Ward / Foster Place",
    copy: "77021 cluster with assemblage and shovel-ready momentum.",
    center: [-95.345, 29.695],
  },
  {
    id: "berry",
    title: "Berry Street",
    copy: "77004 infill pocket with replatted lot concentration.",
    center: [-95.369, 29.731],
  },
  {
    id: "wycliffe",
    title: "Wycliffe",
    copy: "77043 small-cluster development focus in west Houston.",
    center: [-95.561, 29.818],
  },
];

function unlockPresentation() {
  accessGate?.classList.add("is-hidden");
  accessGate?.setAttribute("aria-hidden", "true");
  accessBriefing?.classList.remove("is-visible");
  accessBriefing?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("access-locked");
  document.body.classList.remove("access-briefing-active");
  sessionStorage.setItem(ACCESS_STORAGE_KEY, "granted");

  if (sections[currentSectionIndex]?.id === "cover") {
    animateHeroMetrics();
  }

  window.setTimeout(() => {
    houstonMap?.resize();
  }, 120);
}

function showBriefingThenUnlock() {
  accessGate?.classList.add("is-hidden");
  accessGate?.setAttribute("aria-hidden", "true");
  accessBriefing?.classList.add("is-visible");
  accessBriefing?.setAttribute("aria-hidden", "false");
  document.body.classList.add("access-briefing-active");

  accessBriefingLines.forEach((line, index) => {
    line.classList.toggle("is-active", index === 0);
  });

  accessBriefingLines.forEach((line, index) => {
    window.setTimeout(() => {
      accessBriefingLines.forEach((candidate, candidateIndex) => {
        candidate.classList.toggle("is-active", candidateIndex === index);
      });
    }, index * BRIEFING_ROTATION_MS);
  });

  window.setTimeout(() => {
    unlockPresentation();
  }, BRIEFING_DURATION_MS);
}

function initAccessGate() {
  const hasAccess = sessionStorage.getItem(ACCESS_STORAGE_KEY) === "granted";

  if (hasAccess) {
    unlockPresentation();
    return;
  }

  accessGate?.classList.remove("is-hidden");
  accessGate?.setAttribute("aria-hidden", "false");
  document.body.classList.add("access-locked");
  accessLogin?.focus();
}

function setActiveMapFocus(id) {
  mapFocusButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.focusId === id);
  });
}

async function initHoustonMap() {
  if (houstonMapReady || !houstonMapNode || !window.mapboxgl) return;

  let mapboxToken = "";
  try {
    const response = await fetch("/api/mapbox-token");
    if (!response.ok) return;
    const payload = await response.json();
    mapboxToken = payload.token || "";
  } catch (error) {
    return;
  }

  if (!mapboxToken) return;

  window.mapboxgl.accessToken = mapboxToken;

  houstonMap = new window.mapboxgl.Map({
    container: houstonMapNode,
    style: "mapbox://styles/mapbox/dark-v11",
    center: [-95.3698, 29.7604],
    zoom: 9.5,
    pitch: 20,
    bearing: -8,
    attributionControl: false,
  });

  houstonMap.scrollZoom.disable();

  const bounds = new window.mapboxgl.LngLatBounds();

  HOUSTON_MAP_POINTS.forEach((point) => {
    bounds.extend(point.center);

    const markerNode = document.createElement("div");
    markerNode.className = "map-marker";

    const popup = new window.mapboxgl.Popup({
      offset: 18,
      closeButton: false,
    }).setHTML(
      `<p class="map-popup-title">${point.title}</p><p class="map-popup-copy">${point.copy}</p>`,
    );

    const marker = new window.mapboxgl.Marker(markerNode)
      .setLngLat(point.center)
      .setPopup(popup)
      .addTo(houstonMap);

    markerNode.addEventListener("mouseenter", () => popup.addTo(houstonMap));
    markerNode.addEventListener("mouseleave", () => popup.remove());
    point.marker = marker;
    point.popup = popup;
  });

  houstonMap.on("load", () => {
    houstonMap.fitBounds(bounds, {
      padding: { top: 56, right: 56, bottom: 56, left: 56 },
      maxZoom: 10.8,
      duration: 0,
    });

    setActiveMapFocus("green-river");
    houstonMapReady = true;
  });

  mapFocusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const point = HOUSTON_MAP_POINTS.find((item) => item.id === button.dataset.focusId);
      if (!point || !houstonMap) return;

      setActiveMapFocus(point.id);
      houstonMap.flyTo({
        center: point.center,
        zoom: 11.5,
        speed: 0.7,
        essential: true,
      });

      point.popup?.setLngLat(point.center).addTo(houstonMap);
    });
  });
}

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

  if (activeSection.id === "cover") {
    animateHeroMetrics();
  }

  if (activeSection.id === "capital") {
    animateCapitalStack();
  }

  if (activeSection.id === "opportunity") {
    window.setTimeout(() => {
      houstonMap?.resize();
    }, 120);
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
function animateCount(node, target, options = {}) {
  if (!node) return;
  const prefix = options.prefix || "";
  const suffix = options.suffix || "";
  const duration = options.duration || 1200;
  const startValue = Number(options.startValue || 0);
  const start = performance.now();

  const step = (now) => {
    const progressValue = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    const currentValue = Math.round(startValue + (target - startValue) * eased);
    node.textContent = `${prefix}${currentValue.toLocaleString()}${suffix}`;
    if (progressValue < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

function animateRange(node, startTarget, endTarget, duration = 1400) {
  if (!node) return;
  const start = performance.now();

  const step = (now) => {
    const progressValue = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    const currentStart = Math.max(1, Math.round(startTarget * eased));
    const currentEnd = Math.max(currentStart, Math.round(endTarget * eased));
    node.textContent = `${currentStart}-${currentEnd}`;
    if (progressValue < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

function animateHeroMetrics() {
  if (heroMetricsAnimated) return;
  if (
    document.body.classList.contains("access-locked") ||
    document.body.classList.contains("access-briefing-active")
  ) {
    return;
  }
  heroMetricsAnimated = true;

  heroMetricValues.forEach((node, index) => {
    const countTarget = Number(node.dataset.countTarget || "");
    const suffix = node.dataset.countSuffix || "";
    const rangeStart = Number(node.dataset.rangeStart || "");
    const rangeEnd = Number(node.dataset.rangeEnd || "");

    window.setTimeout(() => {
      if (Number.isFinite(countTarget) && countTarget > 0) {
        animateCount(node, countTarget, { suffix, duration: 1100 + index * 120 });
        return;
      }

      if (Number.isFinite(rangeStart) && Number.isFinite(rangeEnd) && rangeEnd > 0) {
        animateRange(node, rangeStart, rangeEnd, 1400);
      }
    }, index * 140);
  });
}

function animateCapitalStack() {
  if (capitalAnimated) return;
  capitalAnimated = true;

  stackNumbers.forEach((node, index) => {
    const countTarget = Number(node.dataset.countTarget || "0");
    const suffix = node.dataset.countSuffix || "";

    window.setTimeout(() => {
      animateCount(node, countTarget, {
        suffix,
        duration: 1300 + index * 120,
      });
    }, index * 180);
  });
}

function animateGauge() {
  if (gaugeAnimated || !gauge) return;
  gaugeAnimated = true;
  const score = Number(gauge.dataset.score || "81");
  const degrees = Math.round((score / 100) * 360);
  gauge.style.background = `radial-gradient(circle at center, rgba(11, 31, 58, 0.94) 0 58%, transparent 59%), conic-gradient(#c9a24a 0deg, #c9a24a ${degrees}deg, rgba(255,255,255,0.08) ${degrees}deg)`;
  const gaugeTarget = Number(gaugeValue?.dataset.countTarget || "81");
  animateCount(gaugeValue, gaugeTarget, { duration: 1400 });
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

accessGateForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const loginValue = accessLogin?.value.trim().toLowerCase() || "";
  const codeValue = accessCode?.value.trim() || "";

  if (loginValue === ACCESS_LOGIN && codeValue === ACCESS_CODE) {
    if (accessGateError) {
      accessGateError.textContent = "";
    }
    showBriefingThenUnlock();
    return;
  }

  if (accessGateError) {
    accessGateError.textContent = "The login or access code is incorrect.";
  }

  if (accessCode) {
    accessCode.value = "";
    accessCode.focus();
  }
});

initAccessGate();
initHoustonMap();

accessCodeToggle?.addEventListener("click", () => {
  if (!accessCode) return;

  const isHidden = accessCode.type === "password";
  accessCode.type = isHidden ? "text" : "password";
  accessCodeToggle.setAttribute("aria-pressed", String(isHidden));
  accessCodeToggle.setAttribute(
    "aria-label",
    isHidden ? "Hide access code" : "Show access code",
  );

  if (accessCodeToggleText) {
    accessCodeToggleText.textContent = isHidden ? "Hide" : "Show";
  }
});

function setCompanionOpen(isOpen) {
  if (!companionPanel || !companionOrb) return;
  companionPanel.classList.toggle("open", isOpen);
  companionBackdrop?.classList.toggle("open", isOpen);
  companionPanel.setAttribute("aria-hidden", String(!isOpen));
  companionOrb.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("companion-open", isOpen);
  if (isOpen) companionInput?.focus();
}

function appendMessage(role, text, citations = [], meta = "", options = {}) {
  if (!companionThread) return;
  const article = document.createElement("article");
  article.className = `message message-${role}`;
  if (options.loading) {
    article.classList.add("message-loading");
  }

  const metaRow = document.createElement("div");
  metaRow.className = "message-meta-row";

  const roleLabel = document.createElement("span");
  roleLabel.className = "message-role";
  roleLabel.textContent = role === "assistant" ? "Atlas" : "You";
  metaRow.appendChild(roleLabel);
  article.appendChild(metaRow);

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;
  article.appendChild(bubble);

  if (citations.length && role === "assistant") {
    const citationsWrap = document.createElement("div");
    citationsWrap.className = "message-citations";

    citations.forEach((citation) => {
      const link = document.createElement("a");
      link.className = "citation-link";
      link.href = `#${citation.sectionId}`;
      link.textContent = `${citation.title} · ${citation.sourceLabel}`;
      citationsWrap.appendChild(link);
    });

    bubble.appendChild(citationsWrap);
  }

  if (meta && role === "assistant") {
    const metaNode = document.createElement("div");
    metaNode.className = "message-meta";
    metaNode.textContent = meta;
    bubble.appendChild(metaNode);
  }

  companionThread.appendChild(article);
  companionThread.scrollTop = companionThread.scrollHeight;
  return article;
}

async function askCompanion(question) {
  if (companionPending) return;
  companionPending = true;
  appendMessage("user", question);
  const loadingMessage = appendMessage(
    "assistant",
    "Reviewing the presentation and preparing a concise answer...",
    [],
    "",
    { loading: true },
  );

  if (companionInput) {
    companionInput.disabled = true;
  }

  try {
    const response = await fetch("/api/companion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const result = await response.json();
    loadingMessage?.remove();

    if (!response.ok) {
      appendMessage(
        "assistant",
        "The companion could not answer right now. Please try again in a moment.",
      );
      return;
    }

    appendMessage(
      "assistant",
      result.answer,
      result.citations || [],
      result.warning || (result.mode === "fallback" ? "Local retrieval mode." : "AI-assisted answer."),
    );
  } catch (error) {
    loadingMessage?.remove();
    appendMessage(
      "assistant",
      "The companion ran into a connection issue. Please try again shortly.",
    );
  } finally {
    companionPending = false;
    if (companionInput) {
      companionInput.disabled = false;
      companionInput.focus();
    }
  }
}

companionOrb?.addEventListener("click", () => {
  const isOpen = companionPanel?.classList.contains("open");
  setCompanionOpen(!isOpen);
});

companionClose?.addEventListener("click", () => setCompanionOpen(false));
companionBackdrop?.addEventListener("click", () => setCompanionOpen(false));

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.textContent.trim();
    setCompanionOpen(true);
    askCompanion(question);
  });
});

companionForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = companionInput?.value.trim();
  if (!question) return;
  companionInput.value = "";
  setCompanionOpen(true);
  askCompanion(question);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && companionPanel?.classList.contains("open")) {
    setCompanionOpen(false);
  }
});
