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
