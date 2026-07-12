const CARD_SWAP_CONFIG = {
  width: 940,
  height: 600,
  cardDistance: 44,
  verticalDistance: 32,
  delay: 3600,
  pauseOnHover: false,
  skewAmount: 2,
  easing: "elastic",
  visibleCardCount: "all",
  virtualCardCount: "all",
  initialIndex: "random"
};

const TEXT_PRESSURE_CONFIG = {
  text: "Selected Code Works",
  fontFamily: "Roboto Flex",
  fontUrl: "https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=block",
  width: true,
  weight: true,
  italic: false,
  alpha: false,
  flex: true,
  stroke: true,
  scale: false,
  textColor: "#FFFFFF",
  strokeColor: "#EAB308",
  minFontSize: 36
};

const PROJECTS = [
  {
    name: "Auto Email System",
    icon: "mail-search",
    kicker: "Self-hosted AI Console",
    tagline: "AI email triage for IMAP/POP3 inboxes, Chinese summaries, attachments, and WeChat alerts.",
    stack: ["React", "Express", "IMAP", "WeChat"],
    summary: "Turns noisy unread mail into priority queues: Important, Secondary, or Ignore.",
    sourceUrl: "https://github.com/Ha22yX/auto-email-system",
    repoLabel: "View repository",
    accent: "#9bc3ef",
    glow: "rgba(111, 164, 220, 0.16)",
    chips: [
      ["green", "React + Express"],
      ["orange", "AI triage"],
      ["red", "WeChat alerts"]
    ],
    sidebarProject: ["server/src", "src", "docs"],
    files: [
      { type: "folder", name: "Auto Email System" },
      { type: "folder", name: "server" },
      { type: "folder", name: "src" },
      { type: "doc", label: "MD", name: "README.md" },
      { type: "doc", label: "TS", name: "imapflow.ts", variant: "txt" },
      { type: "doc", label: "URL", name: "github.url", variant: "url", href: "https://github.com/Ha22yX/auto-email-system" }
    ]
  },
  {
    name: "Bridge US V2",
    icon: "messages-square",
    kicker: "International Student Platform",
    tagline: "Full-stack community platform with posts, multilingual workflows, moderation, and AI Q&A.",
    stack: ["React", "FastAPI", "Tailwind", "AI Q&A"],
    summary: "A clearer React/FastAPI rebuild for student-life posts, search, translation, and admin operations.",
    sourceUrl: "https://github.com/Ha22yX/Bridge-US-V2",
    websiteUrl: "https://bridge-us.org/",
    repoLabel: "View repository",
    websiteLabel: "Open website",
    accent: "#93f3ff",
    glow: "rgba(147, 243, 255, 0.15)",
    chips: [
      ["green", "React"],
      ["orange", "FastAPI"],
      ["red", "Moderation"]
    ],
    sidebarProject: ["WebSite", "Docs", "Accesses"],
    files: [
      { type: "folder", name: "Bridge US V2" },
      { type: "folder", name: "FrontEnd" },
      { type: "folder", name: "BackEnd" },
      { type: "doc", label: "API", name: "FastAPI.py", variant: "txt" },
      { type: "doc", label: "WEB", name: "bridge-us.org", variant: "web", href: "https://bridge-us.org/" },
      { type: "doc", label: "URL", name: "github.url", variant: "url", href: "https://github.com/Ha22yX/Bridge-US-V2" }
    ]
  },
  {
    name: "Mother-Ship Docking Drone System",
    icon: "satellite",
    kicker: "Dual UAV Research",
    tagline: "Relative-localization workspace for autonomous docking with UWB, AprilTag, PX4, and MAVLink.",
    stack: ["PX4", "UWB", "AprilTag", "Python"],
    summary: "Focuses on mother-frame relative position first, then safe control experiments and hardware validation.",
    sourceUrl: "https://github.com/Ha22yX/Mother-Ship-Docking-Drone-System",
    websiteUrl: "https://isef.rosebeg.com/",
    repoLabel: "View repository",
    websiteLabel: "Open project site",
    accent: "#8fd8ff",
    glow: "rgba(117, 184, 255, 0.14)",
    chips: [
      ["green", "PX4 / MAVLink"],
      ["orange", "UWB + Vision"],
      ["red", "Research prototype"]
    ],
    sidebarProject: ["gps_drift_test", "hardware", "scripts"],
    files: [
      { type: "folder", name: "Docking Drone" },
      { type: "folder", name: "hardware" },
      { type: "folder", name: "gps_drift_test" },
      { type: "doc", label: "PY", name: "MAVLink.py", variant: "txt" },
      { type: "doc", label: "WEB", name: "isef.rosebeg.com", variant: "web", href: "https://isef.rosebeg.com/" },
      { type: "doc", label: "URL", name: "github.url", variant: "url", href: "https://github.com/Ha22yX/Mother-Ship-Docking-Drone-System" }
    ]
  },
  {
    name: "Surfboard Vacuum Table DXF Generator",
    icon: "drafting-compass",
    kicker: "CAD Automation Tool",
    tagline: "Local DXF generator for surfboard vacuum-table suction holes and capsule slots.",
    stack: ["Python", "FastAPI", "ezdxf", "SVG"],
    summary: "Converts selected board edges into repeatable machining geometry with preview and export controls.",
    sourceUrl: "https://github.com/Ha22yX/dxf-auto-shape-tool",
    repoLabel: "View repository",
    accent: "#d8ff5f",
    glow: "rgba(216, 255, 95, 0.13)",
    chips: [
      ["green", "FastAPI"],
      ["orange", "DXF geometry"],
      ["red", "Manufacturing"]
    ],
    sidebarProject: ["backend", "frontend", "packaging"],
    files: [
      { type: "folder", name: "DXF Generator" },
      { type: "folder", name: "backend" },
      { type: "folder", name: "frontend" },
      { type: "doc", label: "DXF", name: "output.dxf", variant: "cad" },
      { type: "doc", label: "PY", name: "main.py", variant: "txt" },
      { type: "doc", label: "URL", name: "github.url", variant: "url", href: "https://github.com/Ha22yX/dxf-auto-shape-tool" }
    ]
  },
  {
    name: "ESP32 Sound Radar",
    icon: "radio-tower",
    kicker: "Embedded Signal Prototype",
    tagline: "ESP32-S3 four-microphone sound radar with TDOA estimation, TFT display, and web tuning dashboard.",
    stack: ["ESP32-S3", "Arduino", "I2S", "TDOA"],
    summary: "A compact hardware demo that estimates sound direction and streams calibration data to the browser.",
    sourceUrl: "https://github.com/Ha22yX/ESP32-Sound-Radar",
    repoLabel: "View repository",
    accent: "#ffca6a",
    glow: "rgba(255, 184, 86, 0.13)",
    chips: [
      ["green", "ESP32-S3"],
      ["orange", "I2S microphones"],
      ["red", "TDOA"]
    ],
    sidebarProject: ["src", "hardware", "dashboard"],
    files: [
      { type: "folder", name: "ESP32 Radar" },
      { type: "folder", name: "src" },
      { type: "doc", label: "INO", name: "sound_radar.ino", variant: "txt" },
      { type: "doc", label: "WEB", name: "local-dashboard", variant: "web" },
      { type: "doc", label: "TFT", name: "direction.ui", variant: "json" },
      { type: "doc", label: "URL", name: "github.url", variant: "url", href: "https://github.com/Ha22yX/ESP32-Sound-Radar" }
    ]
  },
  {
    name: "SAT AI Tutor",
    icon: "graduation-cap",
    kicker: "Adaptive Learning Platform",
    tagline: "SAT practice platform with adaptive study plans, AI explanations, PDF import, analytics, and admin tools.",
    stack: ["Next.js", "Flask", "OpenAI", "Docker"],
    summary: "Wrong answers become guided review with explanations, mastery data, question import, and admin workflows.",
    sourceUrl: "https://github.com/Ha22yX/SAT-AI-Tutor",
    repoLabel: "View repository",
    accent: "#bca7ff",
    glow: "rgba(188, 167, 255, 0.14)",
    chips: [
      ["green", "Next.js"],
      ["orange", "Flask"],
      ["red", "AI tutor"]
    ],
    sidebarProject: ["frontend", "sat_platform", "docs"],
    files: [
      { type: "folder", name: "SAT AI Tutor" },
      { type: "folder", name: "frontend" },
      { type: "folder", name: "sat_platform" },
      { type: "doc", label: "PDF", name: "question-bank.pdf", variant: "txt" },
      { type: "doc", label: "GHCR", name: "container.url", variant: "url" },
      { type: "doc", label: "URL", name: "github.url", variant: "url", href: "https://github.com/Ha22yX/SAT-AI-Tutor" }
    ]
  },
  {
    name: "PhotoBack",
    icon: "images",
    kicker: "Photography Delivery Desk",
    tagline: "Self-hosted event gallery platform for private links, client selections, delivery, and Google Drive backup.",
    stack: ["Flask", "SQLite", "Pillow", "Google Drive"],
    summary: "Built around a photographer workflow: upload media, share one clean link, collect selections, and deliver files.",
    sourceUrl: "https://github.com/Ha22yX/PhotoBack",
    websiteUrl: "https://photoback.rosebeg.com/view/8b6ab9d9",
    repoLabel: "View repository",
    websiteLabel: "Open demo site",
    accent: "#ff9ca8",
    glow: "rgba(255, 156, 168, 0.14)",
    chips: [
      ["green", "Flask"],
      ["orange", "Client portal"],
      ["red", "Drive backup"]
    ],
    sidebarProject: ["app/admin", "app/client", "migrations"],
    files: [
      { type: "folder", name: "PhotoBack" },
      { type: "folder", name: "app" },
      { type: "folder", name: "migrations" },
      { type: "doc", label: "IMG", name: "gallery.ui", variant: "cad" },
      { type: "doc", label: "WEB", name: "demo.view", variant: "web", href: "https://photoback.rosebeg.com/view/8b6ab9d9" },
      { type: "doc", label: "URL", name: "github.url", variant: "url", href: "https://github.com/Ha22yX/PhotoBack" }
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name, className = "") {
  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";
  return `<i data-lucide="${escapeHtml(name)}"${classAttr}></i>`;
}

function pressureDist(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPressureAttr(distance, maxDist, minVal, maxVal) {
  const safeMaxDist = Math.max(1, maxDist);
  const val = maxVal - Math.abs((maxVal * distance) / safeMaxDist);
  return Math.max(minVal, val + minVal);
}

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true";
}

function injectTextPressureFont(fontUrl) {
  const fontAlreadyLinked = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(
    (link) => link.href === fontUrl
  );

  if (
    !fontUrl ||
    document.querySelector(`style[data-text-pressure-font="${CSS.escape(fontUrl)}"]`) ||
    fontAlreadyLinked
  ) {
    return;
  }

  const style = document.createElement("style");
  style.dataset.textPressureFont = fontUrl;
  style.textContent = `@import url('${fontUrl}');`;
  document.head.append(style);
}

class TextPressure {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      ...TEXT_PRESSURE_CONFIG,
      ...options
    };
    this.chars = Array.from(this.options.text);
    this.spans = [];
    this.mouse = { x: 0, y: 0 };
    this.cursor = { x: 0, y: 0 };
    this.fontSize = this.options.minFontSize;
    this.scaleY = 1;
    this.lineHeight = 1;
    this.rafId = 0;
    this.isDestroyed = false;
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.setSize = this.setSize.bind(this);
    this.debouncedSetSize = debounce(this.setSize, 100);

    this.mount();
  }

  mount() {
    injectTextPressureFont(this.options.fontUrl);
    this.container.style.setProperty("--text-pressure-stroke", this.options.strokeColor);
    this.container.innerHTML = "";

    this.title = document.createElement("h1");
    this.title.className = [
      "text-pressure-title",
      this.options.flex ? "flex" : "",
      this.options.stroke ? "stroke" : "",
      this.options.className || ""
    ]
      .filter(Boolean)
      .join(" ");
    this.title.setAttribute("aria-label", this.options.text);
    this.title.style.fontFamily = this.options.fontFamily;
    this.title.style.textTransform = "uppercase";
    this.title.style.fontSize = `${this.fontSize}px`;
    this.title.style.lineHeight = this.lineHeight;
    this.title.style.transform = `scale(1, ${this.scaleY})`;
    this.title.style.transformOrigin = "center top";
    this.title.style.color = this.options.textColor;

    this.chars.forEach((char, index) => {
      const span = document.createElement("span");
      span.dataset.char = char;
      span.textContent = char;
      if (!this.options.stroke) {
        span.style.color = this.options.textColor;
      }
      this.spans[index] = span;
      this.title.append(span);
    });

    this.container.append(this.title);

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("touchmove", this.handleTouchMove, { passive: true });
    window.addEventListener("resize", this.debouncedSetSize);

    const { left, top, width, height } = this.container.getBoundingClientRect();
    this.mouse.x = left + width / 2;
    this.mouse.y = top + height / 2;
    this.cursor.x = this.mouse.x;
    this.cursor.y = this.mouse.y;

    this.setSize();
    this.applyPressureFrame();
    this.container.dataset.textPressureReady = "true";
    this.animate();
  }

  handleMouseMove(event) {
    this.cursor.x = event.clientX;
    this.cursor.y = event.clientY;
  }

  handleTouchMove(event) {
    const touch = event.touches[0];
    if (!touch) return;
    this.cursor.x = touch.clientX;
    this.cursor.y = touch.clientY;
  }

  setSize() {
    if (!this.container || !this.title || this.isDestroyed) return;

    const { width: containerW, height: containerH } = this.container.getBoundingClientRect();
    const charDivisor = Math.max(1, this.chars.length / 2);
    let newFontSize = containerW / charDivisor;
    newFontSize = Math.max(newFontSize, this.options.minFontSize);

    this.fontSize = newFontSize;
    this.scaleY = 1;
    this.lineHeight = 1;
    this.title.style.fontSize = `${this.fontSize}px`;
    this.title.style.lineHeight = this.lineHeight;
    this.title.style.transform = `scale(1, ${this.scaleY})`;

    requestAnimationFrame(() => {
      if (!this.title || this.isDestroyed) return;
      const textRect = this.title.getBoundingClientRect();

      if (this.options.scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        this.scaleY = yRatio;
        this.lineHeight = yRatio;
        this.title.style.lineHeight = this.lineHeight;
        this.title.style.transform = `scale(1, ${this.scaleY})`;
      }
    });
  }

  applyPressureFrame() {
    if (this.title) {
      const titleRect = this.title.getBoundingClientRect();
      const maxDist = titleRect.width / 2;

      this.spans.forEach((span) => {
        if (!span) return;

        const rect = span.getBoundingClientRect();
        const charCenter = {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2
        };

        const distance = pressureDist(this.mouse, charCenter);
        const wdth = this.options.width ? Math.floor(getPressureAttr(distance, maxDist, 5, 200)) : 100;
        const wght = this.options.weight ? Math.floor(getPressureAttr(distance, maxDist, 100, 900)) : 400;
        const italVal = this.options.italic ? getPressureAttr(distance, maxDist, 0, 1).toFixed(2) : 0;
        const alphaVal = this.options.alpha ? getPressureAttr(distance, maxDist, 0, 1).toFixed(2) : 1;
        const fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

        if (span.style.fontVariationSettings !== fontVariationSettings) {
          span.style.fontVariationSettings = fontVariationSettings;
        }

        if (this.options.alpha && span.style.opacity !== alphaVal) {
          span.style.opacity = alphaVal;
        }
      });
    }
  }

  animate() {
    if (this.isDestroyed) return;

    this.mouse.x += (this.cursor.x - this.mouse.x) / 15;
    this.mouse.y += (this.cursor.y - this.mouse.y) / 15;

    this.applyPressureFrame();

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener("resize", this.debouncedSetSize);
    this.container.removeAttribute("data-text-pressure-ready");
  }
}

function initTextPressure(root = document, config = TEXT_PRESSURE_CONFIG) {
  const container = root.querySelector("[data-text-pressure]");
  if (!container) return null;

  return new TextPressure(container, {
    text: container.dataset.text || config.text,
    fontFamily: container.dataset.fontFamily || config.fontFamily,
    fontUrl: container.dataset.fontUrl || config.fontUrl,
    flex: parseBoolean(container.dataset.flex, config.flex),
    alpha: parseBoolean(container.dataset.alpha, config.alpha),
    stroke: parseBoolean(container.dataset.stroke, config.stroke),
    width: parseBoolean(container.dataset.width, config.width),
    weight: parseBoolean(container.dataset.weight, config.weight),
    italic: parseBoolean(container.dataset.italic, config.italic),
    scale: parseBoolean(container.dataset.scale, config.scale),
    textColor: container.dataset.textColor || config.textColor,
    strokeColor: container.dataset.strokeColor || config.strokeColor,
    minFontSize: Number(container.dataset.minFontSize || config.minFontSize)
  });
}

function initScrollHint(root = document) {
  const hint = root.querySelector("[data-scroll-hint]");
  const cardSwap = root.querySelector("[data-card-swap]");
  if (!hint || !cardSwap) return null;

  let positionFrame = 0;
  const position = () => {
    window.cancelAnimationFrame(positionFrame);
    positionFrame = window.requestAnimationFrame(() => {
      const frontCard = cardSwap.querySelector(".card.is-front");
      if (!frontCard) return;

      const rect = frontCard.getBoundingClientRect();
      const sectionRect = hint.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
      const centerX = rect.left + rect.width / 2 - sectionRect.left;
      const y = rect.bottom + 18 - sectionRect.top;

      hint.style.setProperty("--scroll-hint-x", `${centerX.toFixed(2)}px`);
      hint.style.setProperty("--scroll-hint-y", `${y.toFixed(2)}px`);
      hint.dataset.scrollHintPositioned = "true";
    });
  };

  let revealTimer = window.setTimeout(() => {
    position();
    hint.dataset.scrollHintReady = "true";
  }, 900);

  const dismiss = () => {
    window.clearTimeout(revealTimer);
    hint.dataset.scrollHintReady = "true";
    hint.dataset.scrollHintDismissed = "true";
  };

  cardSwap.addEventListener("card-swap:wheel-intent", dismiss, { once: true });
  cardSwap.addEventListener("card-swap:layout", position);
  cardSwap.addEventListener("card-swap:progress", position);
  window.addEventListener("resize", position);
  position();

  return {
    hint,
    position,
    dismiss,
    destroy() {
      window.clearTimeout(revealTimer);
      window.cancelAnimationFrame(positionFrame);
      cardSwap.removeEventListener("card-swap:wheel-intent", dismiss);
      cardSwap.removeEventListener("card-swap:layout", position);
      cardSwap.removeEventListener("card-swap:progress", position);
      window.removeEventListener("resize", position);
    }
  };
}

function renderFolderIcon() {
  return `
    <div class="folder-icon" aria-hidden="true">
      <div class="folder-tab"></div>
      <div class="folder-back"></div>
      <div class="folder-front"></div>
    </div>
  `;
}

function renderDocIcon(file) {
  const variant = file.variant ? ` ${escapeHtml(file.variant)}` : "";
  return `
    <div class="doc-icon" aria-hidden="true">
      <span class="doc-label${variant}">${escapeHtml(file.label || "TXT")}</span>
    </div>
  `;
}

function renderFileItem(file, index) {
  const iconMarkup = file.type === "folder" ? renderFolderIcon() : renderDocIcon(file);
  const kind = file.type === "folder" ? "Folder" : "File";
  const href = file.href ? ` data-file-href="${escapeHtml(file.href)}"` : "";

  return `
    <div
      class="file-item"
      data-file-index="${index}"
      data-file-name="${escapeHtml(file.name)}"
      data-file-kind="${kind}"
      aria-label="${escapeHtml(`${file.name}, ${kind} preview`)}"${href}
    >
      ${iconMarkup}
      <div class="file-name">${escapeHtml(file.name)}</div>
    </div>
  `;
}

function externalTarget(url) {
  return url && url !== "#" ? ' target="_blank" rel="noreferrer"' : "";
}

function getProjectExpandedDetails(project) {
  const detailMap = {
    "Auto Email System": {
      focus: "A private inbox command center that compresses unread mail into decisions instead of another queue.",
      role: "Full-stack automation, data flow design, alert logic",
      notes: [
        "Separates inbox noise into priority classes before it reaches the user.",
        "Keeps the surface operational: summaries, attachments, and WeChat alerts stay in one workflow.",
        "Designed for self-hosting, so credentials and mail state remain under owner control."
      ]
    },
    "Bridge US V2": {
      focus: "A rebuild of student-life infrastructure around multilingual posts, moderation, search, and AI help.",
      role: "Product architecture, React/FastAPI implementation, admin UX",
      notes: [
        "Balances public community posting with moderation and administrative visibility.",
        "Uses translation and AI Q&A as workflow features rather than decorative add-ons.",
        "Structured as a practical platform that can keep growing after launch."
      ]
    },
    "Mother-Ship Docking Drone System": {
      focus: "A research workspace for relative localization and safer autonomous docking experiments.",
      role: "Research prototyping, sensor integration, control validation",
      notes: [
        "Combines UWB, visual markers, PX4, and MAVLink into one experimental stack.",
        "Prioritizes mother-frame relative position before higher-risk control loops.",
        "Keeps hardware validation and simulation artifacts visible in the same repository story."
      ]
    },
    "Surfboard Vacuum Table DXF Generator": {
      focus: "A geometry tool that turns board contours into repeatable manufacturing outputs.",
      role: "CAD automation, local tool design, export pipeline",
      notes: [
        "Converts edge selections into suction-hole and capsule-slot patterns.",
        "Bridges visual preview and DXF export so the tool stays useful at the bench.",
        "Keeps manufacturing geometry parameterized instead of hand-redrawn."
      ]
    },
    "ESP32 Sound Radar": {
      focus: "A compact embedded signal prototype for estimating direction from microphone timing differences.",
      role: "Embedded prototyping, signal workflow, calibration UI",
      notes: [
        "Builds a four-microphone TDOA pipeline around ESP32-S3 constraints.",
        "Pairs the physical display with a web tuning surface for fast calibration.",
        "Treats the browser as a live lab console rather than only a dashboard."
      ]
    },
    "SAT AI Tutor": {
      focus: "An adaptive study system that turns wrong answers into guided review and mastery data.",
      role: "Learning product design, AI explanation flow, admin tooling",
      notes: [
        "Connects practice, explanations, PDF import, and analytics into a single learning loop.",
        "Uses AI feedback where it can reduce review friction and expose patterns.",
        "Keeps admin workflows close to the question bank and student progress data."
      ]
    },
    PhotoBack: {
      focus: "A self-hosted gallery desk for photographer delivery, private links, and client selections.",
      role: "Photography workflow design, Flask implementation, media delivery",
      notes: [
        "Turns event delivery into a clean client-facing link instead of scattered files.",
        "Keeps selection, delivery, and backup close to the photographer workflow.",
        "Designed around trust: private access, clear gallery states, and predictable handoff."
      ]
    }
  };

  return (
    detailMap[project.name] ?? {
      focus: project.summary,
      role: "Design, implementation, and system integration",
      notes: [
        "Built as a focused project surface rather than a generic repository preview.",
        "Highlights the implementation decisions that make the project useful.",
        "Keeps code structure, launch paths, and project intent readable at a glance."
      ]
    }
  );
}

function renderProjectExpandedDetails(project) {
  const details = getProjectExpandedDetails(project);
  const stack = project.stack?.join(" / ") || project.chips.map(([, label]) => label).join(" / ");
  const notes = details.notes
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("");

  return `
    <section class="project-expanded-details" aria-label="${escapeHtml(project.name)} expanded project details">
      <div class="detail-column detail-column-primary">
        <div class="section-label">Expanded brief</div>
        <p>${escapeHtml(details.focus)}</p>
      </div>
      <div class="detail-stats" aria-label="Project metadata">
        <div class="detail-stat">
          <span>Role</span>
          <strong>${escapeHtml(details.role)}</strong>
        </div>
        <div class="detail-stat">
          <span>Stack</span>
          <strong>${escapeHtml(stack)}</strong>
        </div>
      </div>
      <ul class="detail-list">
        ${notes}
      </ul>
    </section>
  `;
}

function applyExplorerCardContent(card, project, index) {
  if (!project) return;

  card.className = "card explorer-card";
  card.dataset.projectCard = "true";
  card.dataset.cardIndex = String(index);
  card.dataset.projectIndex = String(index);
  card.dataset.projectName = project.name;
  card.dataset.contentLoaded = "true";
  card.style.setProperty("--project-accent", project.accent);
  card.style.setProperty("--project-glow", project.glow);

  const sidebarProject = project.sidebarProject
    .map((name) => `
      <div class="sidebar-item">
        ${icon("folder", "sidebar-folder")}
        <span>${escapeHtml(name)}</span>
      </div>
    `)
    .join("");
  const chips = project.chips
    .map(([color, label]) => `
      <div class="priority-chip">
        <span class="dot ${escapeHtml(color)}"></span>
        ${escapeHtml(label)}
      </div>
    `)
    .join("");
  const files = project.files.map(renderFileItem).join("");
  const itemCount = project.files.length;
  const sourceTarget = externalTarget(project.sourceUrl);
  const websiteButton = project.websiteUrl
    ? `
          <a class="repo-card site-action" href="${escapeHtml(project.websiteUrl)}"${externalTarget(project.websiteUrl)}>
            ${icon("external-link")}
            <span>${escapeHtml(project.websiteLabel || "Open website")}</span>
            ${icon("arrow-up-right")}
          </a>
        `
    : "";

  card.innerHTML = `
    <div class="card-frame">
    <header class="titlebar">
      <div class="tab">
        ${icon("folder", "tab-folder")}
        <span class="tab-title">${escapeHtml(project.name)}</span>
        ${icon("x", "tab-close")}
      </div>
      <span class="new-tab" aria-hidden="true">${icon("plus")}</span>
      <div class="window-actions">
        <span class="window-button" aria-hidden="true">${icon("minus")}</span>
        <button class="window-button project-window-toggle" type="button" aria-label="Maximize project window" data-hover-ready="false" data-project-window-toggle>
          ${icon("square")}
        </button>
        <span class="window-button close" aria-hidden="true">${icon("x")}</span>
      </div>
    </header>

    <nav class="toolbar" aria-label="${escapeHtml(project.name)} toolbar">
      <span class="tool-button" aria-hidden="true">
        ${icon("circle-plus")}
        <span class="tool-label">New</span>
        ${icon("chevron-down")}
      </span>
      <div class="separator"></div>
      <span class="icon-button" aria-hidden="true">${icon("folder-open")}</span>
      <span class="icon-button" aria-hidden="true">${icon("copy")}</span>
      <span class="icon-button" aria-hidden="true">${icon("trash-2")}</span>
      <div class="separator"></div>
      <span class="tool-button" aria-hidden="true">${icon("arrow-up-down")}<span class="tool-label">Sort</span></span>
      <span class="tool-button" aria-hidden="true">${icon("layout-grid")}<span class="tool-label">View</span></span>
      <span class="icon-button" aria-hidden="true">${icon("ellipsis")}</span>
      <div class="toolbar-spacer"></div>
      <a class="source-button" href="${escapeHtml(project.sourceUrl)}"${sourceTarget}>
        ${icon("github")}
        <span>GitHub</span>
        ${icon("arrow-up-right")}
      </a>
    </nav>

    <section class="content">
      <aside class="sidebar" aria-label="${escapeHtml(project.name)} navigation">
        <div class="sidebar-title">Quick Access</div>
        <div class="sidebar-item active">${icon("home")}<span>Overview</span></div>
        <div class="sidebar-item">${icon("file-text")}<span>README</span></div>
        <div class="sidebar-item">${icon("github")}<span>GitHub</span></div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-title">Project</div>
        ${sidebarProject}
      </aside>

      <section class="main">
        <section class="project-overview">
          <div class="project-intro">
            <div class="project-icon">${icon(project.icon)}</div>
            <div class="summary-copy">
              <div class="project-kicker">${escapeHtml(project.kicker || "Open Source Project")}</div>
              <h1>${escapeHtml(project.name)}</h1>
              <p>${escapeHtml(project.tagline)}</p>
            </div>
          </div>
          <div class="project-actions">
            <a class="repo-card primary-action" href="${escapeHtml(project.sourceUrl)}"${sourceTarget}>
              ${icon("github")}
              <span>${escapeHtml(project.repoLabel || "Open GitHub repo")}</span>
              ${icon("arrow-up-right")}
            </a>
            ${websiteButton}
          </div>
          <p class="repo-note">${escapeHtml(project.summary)}</p>
        </section>
        <div class="project-tag-row">${chips}</div>
        <div class="files-header">
          <div>
            <div class="section-label">Repository snapshot</div>
            <div class="selected-file">Static preview. Open GitHub for details.</div>
          </div>
        </div>
        <div class="folder-grid">${files}</div>
        ${renderProjectExpandedDetails(project)}
      </section>
    </section>

    <footer class="statusbar">
      <span>${itemCount} items</span>
      <span class="status-selection">Preview only</span>
      <span class="status-spacer"></span>
      <div class="status-view">
        <span aria-hidden="true">${icon("list")}</span>
        <span aria-hidden="true">${icon("layout-grid")}</span>
      </div>
    </footer>
    </div>
  `;

  return card;
}

function renderExplorerCardShell(project, index) {
  const card = document.createElement("article");
  card.className = "card explorer-card";
  card.dataset.projectCard = "true";
  card.dataset.cardIndex = String(index);
  card.dataset.projectIndex = String(index);
  card.dataset.projectName = project.name;
  card.dataset.contentLoaded = "false";
  card.style.setProperty("--project-accent", project.accent);
  card.style.setProperty("--project-glow", project.glow);
  card.innerHTML = `
    <div class="card-frame">
      <header class="titlebar">
        <div class="tab">
          ${icon("folder", "tab-folder")}
          <span class="tab-title">${escapeHtml(project.name)}</span>
          ${icon("x", "tab-close")}
        </div>
        <span class="new-tab" aria-hidden="true">${icon("plus")}</span>
        <div class="window-actions">
          <span class="window-button" aria-hidden="true">${icon("minus")}</span>
          <button class="window-button project-window-toggle" type="button" aria-label="Maximize project window" data-hover-ready="false" data-project-window-toggle>
            ${icon("square")}
          </button>
          <span class="window-button close" aria-hidden="true">${icon("x")}</span>
        </div>
      </header>
    </div>
  `;

  return card;
}

function renderExplorerCard(project, index) {
  const card = document.createElement("article");
  applyExplorerCardContent(card, project, index);

  return card;
}

function renderProjectCards(container, projects, poolSize = projects.length) {
  const safePoolSize = Math.min(projects.length, Math.max(0, poolSize));
  container.replaceChildren(...projects.slice(0, safePoolSize).map(renderExplorerCardShell));
  container.dataset.projectCount = String(projects.length);
  container.dataset.renderedCardCount = String(safePoolSize);
  window.lucide?.createIcons();
}

function resolveCardCount(value, fallback, projectCount) {
  if (value === "all" || value === undefined || value === null || value === "") {
    return projectCount;
  }

  const count = Number(value);

  if (!Number.isFinite(count)) {
    return fallback;
  }

  return Math.min(projectCount, Math.max(1, Math.trunc(count)));
}

function resolveInitialIndex(value, projectCount) {
  if (projectCount <= 0) return 0;

  if (value === "random" || value === undefined || value === null || value === "") {
    return Math.floor(Math.random() * projectCount);
  }

  const index = Number(value);
  if (!Number.isFinite(index)) return 0;

  return positiveModulo(Math.trunc(index), projectCount);
}

function slotSpacingFactor(step) {
  if (step <= 1) return 1;
  if (step === 2) return 0.38;

  return Math.max(0.08, 0.18 - (step - 3) * 0.035);
}

function slotAxisOffset(slotIndex, distance) {
  let offset = 0;

  for (let step = 1; step <= slotIndex; step += 1) {
    offset += distance * slotSpacingFactor(step);
  }

  return offset;
}

function fitProjectStack(container, total, distX, distY, width, height) {
  const lastSlot = Math.max(0, total - 1);
  const stackOffsetX = slotAxisOffset(lastSlot, distX);
  const stackOffsetY = slotAxisOffset(lastSlot, distY);
  container.style.setProperty("--stack-center-x", `${-stackOffsetX / 2}px`);
  container.style.setProperty("--stack-center-y", `${stackOffsetY / 2}px`);

  const stackWidth = width + stackOffsetX;
  const stackHeight = height + stackOffsetY;
  const viewportWidth = window.innerWidth || stackWidth;
  const viewportHeight = window.innerHeight || stackHeight;
  const availableWidth = viewportWidth * 0.9;
  const availableHeight = viewportHeight * 0.86;
  const scale = Math.min(1, availableWidth / stackWidth, availableHeight / stackHeight);
  const safeScale = Math.max(0.24, Number.isFinite(scale) ? scale : 1);

  container.style.setProperty("--stack-scale", safeScale.toFixed(4));
  container.dataset.fitScale = safeScale.toFixed(3);
}

function makeSlot(i, distX, distY, total) {
  const x = slotAxisOffset(i, distX);
  const y = -slotAxisOffset(i, distY);
  const normalizedDepth = distX > 0 ? x / distX : i;

  return {
    x,
    y,
    z: -x * 0.42,
    zIndex: total - i,
    depth: normalizedDepth
  };
}

function placeNow(el, slot, skew) {
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function positiveModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

function blendSlot(from, to, amount, arcY = 0) {
  const t = clamp(amount, 0, 1);

  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t) + Math.sin(Math.PI * t) * arcY,
    z: lerp(from.z, to.z, t),
    depth: lerp(from.depth, to.depth, t)
  };
}

class CardSwap {
  constructor(container, options = {}) {
    this.container = container;
    this.root = container.ownerDocument;
    this.width = options.width ?? 940;
    this.height = options.height ?? 600;
    this.cardDistance = options.cardDistance ?? 44;
    this.verticalDistance = options.verticalDistance ?? 32;
    this.delay = options.delay ?? 3600;
    this.pauseOnHover = options.pauseOnHover ?? false;
    this.skewAmount = options.skewAmount ?? 2;
    this.easing = options.easing ?? "elastic";
    this.projects = options.projects ?? [];
    this.cards = Array.from(container.querySelectorAll(".card"));
    this.projectCount = this.projects.length || this.cards.length;
    this.visibleCardCount = Math.min(options.visibleCardCount ?? 3, this.projectCount, this.cards.length);
    this.virtualCardCount = this.cards.length;
    this.hasVirtualBuffer = this.virtualCardCount > this.visibleCardCount;
    this.initialIndex = resolveInitialIndex(options.initialIndex, this.projectCount);
    this.cardProjectIndices = new Map();
    this.order = this.cards.map((_, index) => index);
    this.timeline = null;
    this.interval = null;
    this.swapCount = 0;
    this.isAnimating = false;
    this.isDestroyed = false;
    this.hoverPaused = false;
    this.pointerOverStack = false;
    this.currentProgress = this.initialIndex;
    this.targetProgress = this.initialIndex;
    this.progressVelocity = 0;
    this.progressFrame = 0;
    this.progressLastTime = 0;
    this.motionDirection = 1;
    this.wheelAccumulator = 0;
    this.lastWheelDirection = 0;
    this.lastWheelAt = 0;
    this.wheelBurst = 0;
    this.wheelSettleTimer = null;
    this.frameMotion = new WeakMap();
    this.frameTweens = new WeakMap();
    this.reboundTweens = new WeakMap();
    this.expandedCard = null;
    this.expandedSnapshot = null;
    this.expandTween = null;
    this.isRestoringExpandedCard = false;
    this.lastPointer = { x: null, y: null };
    this.handlePointerMove = (event) => this.onPointerMove(event);
    this.handlePointerLeave = () => this.clearStackHover({ schedule: true });
    this.handleWheel = (event) => this.onWheel(event);
    this.handleProgressFrame = (time) => this.onProgressFrame(time);
    this.handleStackClick = (event) => this.onStackClick(event);
    this.handleStackPointerOver = (event) => this.onStackPointerOver(event);
    this.handleStackPointerOut = (event) => this.onStackPointerOut(event);
    this.handleBlankPointerDown = (event) => this.onBlankPointerDown(event);

    this.config =
      this.easing === "elastic"
        ? {
            ease: "elastic.out(0.6,0.9)",
            durDrop: 2,
            durMove: 2,
            durReturn: 2,
            promoteOverlap: 0.9,
            returnDelay: 0.05
          }
        : {
            ease: "power1.inOut",
            durDrop: 0.8,
            durMove: 0.8,
            durReturn: 0.8,
            promoteOverlap: 0.45,
            returnDelay: 0.2
          };

    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;
    this.cards.forEach((card) => {
      card.style.width = `${this.width}px`;
      card.style.height = `${this.height}px`;
      this.cardProjectIndices.set(card, Number(card.dataset.projectIndex || card.dataset.cardIndex || 0));
    });
    this.container.dataset.projectCount = String(this.projectCount);
    this.container.dataset.renderedCardCount = String(this.cards.length);
    this.container.dataset.visibleCardCount = String(this.visibleCardCount);
    this.container.dataset.initialIndex = String(this.initialIndex);
    this.container.dataset.expanded = "false";

    this.init();
  }

  init() {
    const total = this.cards.length;
    this.cards.forEach((card, index) => {
      placeNow(card, makeSlot(index, this.cardDistance, this.verticalDistance, total), this.skewAmount);
    });

    this.container.dataset.cardSwapReady = "true";
    this.container.dataset.motionMode = "idle";
    this.renderProgress(this.initialIndex);
    this.bindFrontHoverPause();
    this.bindWheelSwitching();
    this.bindWindowExpansion();
    this.scheduleNextSwap();

    if (this.pauseOnHover) {
      this.container.addEventListener("mouseenter", () => this.pause());
      this.container.addEventListener("mouseleave", () => this.resume());
    }
  }

  pause() {
    this.timeline?.pause();
    this.clearScheduledSwap();
  }

  resume() {
    this.timeline?.play();
    this.scheduleNextSwap();
  }

  destroy() {
    this.isDestroyed = true;
    this.timeline?.kill();
    this.clearScheduledSwap();
    window.cancelAnimationFrame(this.progressFrame);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerleave", this.handlePointerLeave);
    window.removeEventListener("blur", this.handlePointerLeave);
    window.removeEventListener("wheel", this.handleWheel);
    this.root.removeEventListener("click", this.handleStackClick);
    this.root.removeEventListener("pointerover", this.handleStackPointerOver);
    this.root.removeEventListener("pointerout", this.handleStackPointerOut);
    this.container.closest("[data-project-card-swap-section]")?.removeEventListener("pointerdown", this.handleBlankPointerDown);
    window.clearTimeout(this.wheelSettleTimer);
    this.expandTween?.kill();
    this.clearArrivalRebound();
    this.settleWheelTension(0.01);
    this.container.dataset.cardSwapReady = "false";
  }

  bindFrontHoverPause() {
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerleave", this.handlePointerLeave);
    window.addEventListener("blur", this.handlePointerLeave);
  }

  bindWheelSwitching() {
    window.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  bindWindowExpansion() {
    this.root.addEventListener("click", this.handleStackClick);
    this.root.addEventListener("pointerover", this.handleStackPointerOver);
    this.root.addEventListener("pointerout", this.handleStackPointerOut);
    this.container.closest("[data-project-card-swap-section]")?.addEventListener("pointerdown", this.handleBlankPointerDown);
  }

  clearScheduledSwap() {
    window.clearTimeout(this.interval);
    this.interval = null;
  }

  scheduleNextSwap() {
    this.clearScheduledSwap();
    if (this.isDestroyed || this.hoverPaused || this.isAnimating || this.expandedCard) return;

    this.interval = window.setTimeout(() => this.swap(), this.delay);
  }

  onPointerMove(event) {
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.syncHoverPauseFromPointer({ schedule: true });
  }

  isPointOverCardStack(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

    return this.cards.some((card) => {
      if (card.classList.contains("is-virtual-hidden")) return false;

      const target = this.getFrame(card) ?? card;
      const rect = target.getBoundingClientRect();

      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  }

  clearStackHover({ schedule = false } = {}) {
    this.pointerOverStack = false;
    this.hoverPaused = false;
    this.container.dataset.hoverPaused = "false";
    this.cards.forEach((card) => card.classList.remove("is-hovered"));

    if (schedule) {
      this.scheduleNextSwap();
    }
  }

  syncHoverPauseFromPointer({ schedule = false } = {}) {
    const frontCard = this.cards[this.order[0]];
    const hasPointer = Number.isFinite(this.lastPointer.x) && Number.isFinite(this.lastPointer.y);
    const shouldPause = hasPointer
      ? this.isPointOverCardStack(this.lastPointer.x, this.lastPointer.y)
      : this.pointerOverStack || Boolean(frontCard?.matches(":hover"));

    this.pointerOverStack = shouldPause;
    this.hoverPaused = shouldPause;
    this.container.dataset.hoverPaused = String(shouldPause);
    this.cards.forEach((card) => card.classList.remove("is-hovered"));

    if (shouldPause && frontCard) {
      frontCard.classList.add("is-hovered");
      this.clearScheduledSwap();
      return true;
    }

    if (schedule) {
      this.scheduleNextSwap();
    }

    return false;
  }

  onWheel(event) {
    if (this.expandedCard) return;

    this.lastPointer = { x: event.clientX, y: event.clientY };
    if (!this.isPointOverCardStack(event.clientX, event.clientY)) return;

    event.preventDefault();
    event.stopPropagation();
    this.syncHoverPauseFromPointer();

    const delta = event.deltaY || event.deltaX;
    if (Math.abs(delta) < 2) return;

    this.container.dispatchEvent(
      new CustomEvent("card-swap:wheel-intent", {
        bubbles: true,
        detail: { delta }
      })
    );

    const rawDirection = delta > 0 ? 1 : -1;
    const now = performance.now();
    this.wheelBurst = now - this.lastWheelAt < 180 ? Math.min(1, this.wheelBurst + 0.22) : 0;
    this.lastWheelAt = now;

    if (this.lastWheelDirection && this.lastWheelDirection !== rawDirection) {
      this.wheelAccumulator = 0;
    }

    this.lastWheelDirection = rawDirection;
    const threshold = event.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? 70 : 1;
    const absDelta = Math.abs(delta);
    let direction = rawDirection;
    let steps = 0;

    this.applyWheelTension(direction, Math.abs(delta), this.wheelBurst);
    window.clearTimeout(this.wheelSettleTimer);
    this.wheelSettleTimer = window.setTimeout(() => this.settleWheelTension(), 150);

    if (absDelta >= threshold) {
      steps = Math.min(3, Math.max(1, Math.round(absDelta / threshold)));
      this.wheelAccumulator = 0;
    } else {
      this.wheelAccumulator += delta;
      direction = this.wheelAccumulator > 0 ? 1 : -1;

      if (Math.abs(this.wheelAccumulator) < threshold) return;

      steps = 1;
      this.wheelAccumulator = 0;
    }

    this.advanceProgress(direction * steps, { source: "wheel" });
  }

  getOrderForStep(step) {
    return this.getProjectOrderForStep(step)
      .map((projectIndex) => this.getCardIndexForProject(projectIndex))
      .filter((cardIndex) => cardIndex !== null);
  }

  getProjectOrderForStep(step, count = this.visibleCardCount) {
    const start = positiveModulo(step, this.projectCount);

    return Array.from({ length: count }, (_, index) => positiveModulo(start + index, this.projectCount));
  }

  getVirtualWindowProjectIndices(step, direction) {
    const start = this.hasVirtualBuffer && direction < 0 ? step - 1 : step;

    return Array.from({ length: this.virtualCardCount }, (_, index) =>
      positiveModulo(start + index, this.projectCount)
    );
  }

  getCardIndexForProject(projectIndex) {
    const normalized = positiveModulo(projectIndex, this.projectCount);

    for (let index = 0; index < this.cards.length; index += 1) {
      if (this.cardProjectIndices.get(this.cards[index]) === normalized) {
        return index;
      }
    }

    return null;
  }

  syncVirtualCards(projectIndices) {
    const normalizedProjects = projectIndices.map((index) => positiveModulo(index, this.projectCount));
    const availableCards = [...this.cards];
    const nextAssignments = new Map();
    let didUpdateContent = false;

    normalizedProjects.forEach((projectIndex) => {
      let card = availableCards.find((candidate) => this.cardProjectIndices.get(candidate) === projectIndex);

      if (!card) {
        card = availableCards[0];
        applyExplorerCardContent(card, this.projects[projectIndex], projectIndex);
        didUpdateContent = true;
      }

      availableCards.splice(availableCards.indexOf(card), 1);
      nextAssignments.set(card, projectIndex);
    });

    this.cards.forEach((card) => {
      if (nextAssignments.has(card)) {
        this.cardProjectIndices.set(card, nextAssignments.get(card));
        card.dataset.virtualActive = "true";
      } else {
        this.cardProjectIndices.delete(card);
        card.dataset.virtualActive = "false";
      }
    });

    if (didUpdateContent) {
      window.lucide?.createIcons();
    }
  }

  ensureCardContent(card) {
    if (!card || card.dataset.contentLoaded === "true") {
      return false;
    }

    const projectIndex = this.cardProjectIndices.get(card) ?? Number(card.dataset.projectIndex || 0);
    const normalizedProjectIndex = positiveModulo(projectIndex, this.projectCount);
    applyExplorerCardContent(card, this.projects[normalizedProjectIndex], normalizedProjectIndex);
    this.cardProjectIndices.set(card, normalizedProjectIndex);

    return true;
  }

  hydrateContentForLayout(layout) {
    let didHydrate = false;
    const frontCardIndex = this.order[0];

    this.cards.forEach((card, index) => {
      const slot = layout.get(index);

      if (slot?.hydrateContent || index === frontCardIndex) {
        didHydrate = this.ensureCardContent(card) || didHydrate;
      }
    });

    if (didHydrate) {
      window.lucide?.createIcons();
    }
  }

  getProgressState(progress) {
    const nearestStep = Math.round(progress);
    const onStep = Math.abs(progress - nearestStep) < 0.0001;
    const direction = this.targetProgress === progress
      ? this.motionDirection
      : Math.sign(this.targetProgress - progress) || this.motionDirection || 1;
    const step = onStep ? nearestStep : direction >= 0 ? Math.floor(progress) : Math.ceil(progress);
    const fraction = onStep ? 0 : direction >= 0 ? progress - step : step - progress;
    const t = clamp(fraction, 0, 1);

    return { direction, step, t };
  }

  getProgressLayout(progress) {
    const total = this.visibleCardCount;
    const slots = Array.from({ length: total }, (_, index) =>
      makeSlot(index, this.cardDistance, this.verticalDistance, total)
    );
    const hiddenSlot = makeSlot(total, this.cardDistance, this.verticalDistance, total + 1);
    hiddenSlot.y += this.verticalDistance * 0.9;
    const { direction, step, t } = this.getProgressState(progress);
    const windowProjects = this.getVirtualWindowProjectIndices(step, direction);
    this.syncVirtualCards(windowProjects);
    const layout = new Map();
    const arcY = Math.min(320, this.height * 0.52);

    if (this.hasVirtualBuffer) {
      if (direction >= 0) {
        windowProjects.forEach((projectIndex, position) => {
          const cardIndex = this.getCardIndexForProject(projectIndex);
          if (cardIndex === null) return;

          if (position === 0) {
            layout.set(cardIndex, {
              ...blendSlot(slots[0], hiddenSlot, t, arcY),
              opacity: clamp(1 - t * 1.8, 0, 1),
              contentReady: t < 0.18,
              hydrateContent: t < 0.18
            });
            return;
          }

          if (position < total) {
            layout.set(cardIndex, {
              ...blendSlot(slots[position], slots[position - 1], t),
              opacity: 1,
              contentReady: position <= 2,
              hydrateContent: position <= 2
            });
            return;
          }

          layout.set(cardIndex, {
            ...blendSlot(hiddenSlot, slots[total - 1], t),
            opacity: t,
            contentReady: t > 0.12,
            hydrateContent: t > 0.12
          });
        });
      } else {
        windowProjects.forEach((projectIndex, position) => {
          const cardIndex = this.getCardIndexForProject(projectIndex);
          if (cardIndex === null) return;

          if (position === 0) {
            layout.set(cardIndex, {
              ...blendSlot(hiddenSlot, slots[0], t, arcY),
              opacity: t,
              contentReady: t > 0.12,
              hydrateContent: t > 0.12
            });
            return;
          }

          if (position < total) {
            layout.set(cardIndex, {
              ...blendSlot(slots[position - 1], slots[position], t),
              opacity: 1,
              contentReady: position <= 2,
              hydrateContent: position <= 2
            });
            return;
          }

          layout.set(cardIndex, {
            ...blendSlot(slots[total - 1], hiddenSlot, t),
            opacity: clamp(1 - t * 1.8, 0, 1),
            contentReady: t < 0.18,
            hydrateContent: t < 0.18
          });
        });
      }

      return layout;
    }

    this.syncVirtualCards(this.getProjectOrderForStep(step, this.virtualCardCount));
    const order = this.getOrderForStep(step);

    if (direction >= 0) {
      const outgoing = order[0];
      layout.set(outgoing, {
        ...blendSlot(slots[0], slots[total - 1], t, arcY),
        opacity: 1,
        contentReady: true,
        hydrateContent: true
      });

      for (let i = 1; i < total; i += 1) {
        layout.set(order[i], {
          ...blendSlot(slots[i], slots[i - 1], t),
          opacity: 1,
          contentReady: i <= 2,
          hydrateContent: i <= 2
        });
      }
    } else {
      const incoming = order[total - 1];
      layout.set(incoming, {
        ...blendSlot(slots[total - 1], slots[0], t, arcY),
        opacity: 1,
        contentReady: true,
        hydrateContent: true
      });

      for (let i = 0; i < total - 1; i += 1) {
        layout.set(order[i], {
          ...blendSlot(slots[i], slots[i + 1], t),
          opacity: 1,
          contentReady: i <= 1,
          hydrateContent: i <= 1
        });
      }
    }

    return layout;
  }

  getMotionAngle() {
    return { angle: "90deg", counter: "-90deg" };
  }

  writeMotionStretch(amount = 0) {
    const stretch = clamp(amount, 0, 0.078);
    const scaleX = 1 + stretch;
    const scaleY = 1 - stretch * 0.58;
    const { angle, counter } = this.getMotionAngle();

    this.container.dataset.motionStretch = stretch.toFixed(4);
    this.cards.forEach((card) => {
      const frame = this.getFrame(card);
      if (!frame) return;

      frame.style.setProperty("--speed-angle", angle);
      frame.style.setProperty("--speed-counter-angle", counter);
      frame.style.setProperty("--speed-scale-x", scaleX.toFixed(4));
      frame.style.setProperty("--speed-scale-y", scaleY.toFixed(4));
    });
  }

  markContentReady(layout, progress) {
    const isMoving = Math.abs(this.targetProgress - progress) > 0.01 || Math.abs(this.progressVelocity) > 0.02;
    const keepVisibleStackContent =
      isMoving ||
      this.container.dataset.motionMode === "progress-chase" ||
      this.container.dataset.motionMode === "rebound" ||
      this.container.dataset.reboundActive === "true";

    this.cards.forEach((card, index) => {
      const slot = layout.get(index);
      const ready = keepVisibleStackContent ? Boolean(slot?.contentReady) : this.order[0] === index;

      card.classList.toggle("is-content-ready", ready);
      card.classList.toggle("is-virtual-hidden", (slot?.opacity ?? 0) <= 0.02);
    });
  }

  refreshHoverClass() {
    if (!this.hoverPaused && !this.pointerOverStack) return;

    const frontCard = this.cards[this.order[0]];
    this.cards.forEach((card) => card.classList.remove("is-hovered"));
    frontCard?.classList.add("is-hovered");
  }

  renderProgress(progress = this.currentProgress) {
    if (this.expandedCard) return;

    const total = this.visibleCardCount;
    const layout = this.getProgressLayout(progress);
    const roleStep = Math.round(progress);

    this.currentProgress = progress;
    this.order = this.getOrderForStep(roleStep);
    this.hydrateContentForLayout(layout);
    this.container.dataset.frontCard = String(this.order[0] ?? 0);
    this.container.dataset.currentProgress = progress.toFixed(4);
    this.container.dataset.targetProgress = this.targetProgress.toFixed(4);
    this.container.dataset.progressGap = Math.abs(this.targetProgress - progress).toFixed(4);
    this.updateCardRoles();
    this.markContentReady(layout, progress);
    this.refreshHoverClass();

    this.cards.forEach((card, index) => {
      const slot = layout.get(index) ?? makeSlot(total - 1, this.cardDistance, this.verticalDistance, total);
      gsap.set(card, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        opacity: slot.opacity ?? 0,
        xPercent: -50,
        yPercent: -50,
        skewY: this.skewAmount,
        transformOrigin: "center center",
        zIndex: Math.round(1000 - slot.depth * 100),
        force3D: true
      });
    });

    this.writeMotionStretch(Math.abs(this.progressVelocity) / 92);
    this.container.dispatchEvent(
      new CustomEvent("card-swap:progress", {
        bubbles: true,
        detail: { progress: this.currentProgress, frontCard: this.order[0] }
      })
    );
  }

  advanceProgress(deltaSteps, { source = "wheel" } = {}) {
    if (
      this.cards.length < 2 ||
      this.isDestroyed ||
      this.expandedCard ||
      !Number.isFinite(deltaSteps) ||
      deltaSteps === 0
    ) {
      return;
    }

    const wholeSteps = Math.trunc(deltaSteps);
    if (wholeSteps === 0) return;

    this.motionDirection = wholeSteps > 0 ? 1 : -1;
    this.targetProgress += wholeSteps;
    this.swapCount += Math.abs(wholeSteps);
    this.container.dataset.swapCount = String(this.swapCount);
    this.container.dataset.wheelDirection = this.motionDirection > 0 ? "next" : "previous";
    this.container.dataset.motionMode = "progress-chase";
    this.container.dataset.motionSource = source;
    this.container.dataset.targetProgress = this.targetProgress.toFixed(4);
    this.clearScheduledSwap();
    this.clearArrivalRebound();
    this.renderProgress(this.currentProgress);

    if (!this.progressFrame) {
      this.isAnimating = true;
      this.progressLastTime = performance.now();
      this.progressFrame = window.requestAnimationFrame(this.handleProgressFrame);
    }
  }

  onProgressFrame(time) {
    if (this.isDestroyed) return;

    const dt = clamp((time - this.progressLastTime) / 1000, 0.001, 0.034);
    const distance = this.targetProgress - this.currentProgress;
    const stiffness = 39 + Math.min(17, Math.abs(distance) * 3.8);
    const damping = 12.1 + Math.min(3, Math.abs(this.progressVelocity) * 0.05);

    this.progressLastTime = time;
    this.progressVelocity += distance * stiffness * dt;
    this.progressVelocity *= Math.exp(-damping * dt);
    this.currentProgress += this.progressVelocity * dt;
    this.renderProgress(this.currentProgress);

    const remaining = Math.abs(this.targetProgress - this.currentProgress);
    if (remaining < 0.0025 && Math.abs(this.progressVelocity) < 0.018) {
      this.currentProgress = this.targetProgress;
      this.progressVelocity = 0;
      this.progressFrame = 0;
      this.renderProgress(this.currentProgress);
      this.writeMotionStretch(0);
      this.isAnimating = false;
      this.container.dataset.motionMode = "rebound";
      this.container.dataset.motionSource = "arrival";
      this.triggerArrivalRebound(() => {
        this.container.dataset.motionMode = "idle";
        this.container.dataset.motionSource = "none";
        this.renderProgress(this.currentProgress);
        this.syncHoverPauseFromPointer({ schedule: true });
      });
      return;
    }

    this.progressFrame = window.requestAnimationFrame(this.handleProgressFrame);
  }

  getFrame(card) {
    return card?.querySelector(".card-frame") ?? null;
  }

  getFrameState(frame) {
    if (!this.frameMotion.has(frame)) {
      this.frameMotion.set(frame, {
        sx: 1,
        sy: 1,
        shift: 0,
        tilt: 0
      });
    }

    return this.frameMotion.get(frame);
  }

  writeFrameState(frame, state) {
    frame.style.setProperty("--wheel-scale-x", state.sx.toFixed(4));
    frame.style.setProperty("--wheel-scale-y", state.sy.toFixed(4));
    frame.style.setProperty("--wheel-shift", `${state.shift.toFixed(2)}px`);
    frame.style.setProperty("--wheel-tilt", `${state.tilt.toFixed(3)}deg`);
  }

  animateFrameState(frame, target, duration, ease) {
    if (!frame) return;

    const state = this.getFrameState(frame);
    this.frameTweens.get(frame)?.kill();
    this.frameTweens.set(
      frame,
      gsap.to(state, {
        ...target,
        duration,
        ease,
        overwrite: true,
        onUpdate: () => this.writeFrameState(frame, state)
      })
    );
  }

  clearArrivalRebound() {
    this.container.dataset.reboundActive = "false";
    this.cards.forEach((card) => {
      const frame = this.getFrame(card);
      if (!frame) return;

      this.reboundTweens.get(frame)?.kill();
      frame.style.setProperty("--rebound-scale-x", "1");
      frame.style.setProperty("--rebound-scale-y", "1");
    });
  }

  triggerArrivalRebound(onComplete) {
    let activeTweens = 0;
    this.container.dataset.reboundActive = "true";

    this.cards.forEach((card) => {
      const frame = this.getFrame(card);
      if (!frame) return;

      activeTweens += 1;
      const state = {
        sx: 1,
        sy: 1
      };

      frame.style.setProperty("--rebound-scale-x", state.sx.toFixed(4));
      frame.style.setProperty("--rebound-scale-y", state.sy.toFixed(4));
      this.reboundTweens.get(frame)?.kill();
      this.reboundTweens.set(
        frame,
        gsap.timeline({
          onUpdate: () => {
            frame.style.setProperty("--rebound-scale-x", state.sx.toFixed(4));
            frame.style.setProperty("--rebound-scale-y", state.sy.toFixed(4));
          },
          onComplete: () => {
            activeTweens -= 1;
            if (activeTweens <= 0) {
              this.container.dataset.reboundActive = "false";
              onComplete?.();
            }
          }
        })
          .to(state, {
            sx: 1,
            sy: 1,
            duration: 0.18,
            ease: "none"
          })
      );
    });

    if (activeTweens === 0) {
      this.container.dataset.reboundActive = "false";
      onComplete?.();
    }
  }

  applyWheelTension(direction, magnitude, burst = 0) {
    const frontCard = this.cards[this.order[0]];
    const frame = this.getFrame(frontCard);
    if (!frame) return;

    const progressPressure = Math.min(1, Math.abs(this.targetProgress - this.currentProgress) * 0.14);
    const rapidness = Math.min(1, magnitude / 420 + burst + progressPressure);
    const stretch = 0.024 + rapidness * 0.058;
    const shift = direction * (5 + rapidness * 13);
    const tilt = direction * (0.18 + rapidness * 0.46);

    this.container.dataset.wheelActive = "true";
    this.animateFrameState(
      frame,
      {
        sx: 1 + stretch,
        sy: 1 - stretch * 0.48,
        shift,
        tilt
      },
      0.12,
      "power2.out"
    );
  }

  settleWheelTension(duration = 0.72) {
    this.container.dataset.wheelActive = "false";
    this.cards.forEach((card) => {
      this.animateFrameState(
        this.getFrame(card),
        {
          sx: 1,
          sy: 1,
          shift: 0,
          tilt: 0
        },
        duration,
        "elastic.out(0.45,0.38)"
      );
    });
  }

  onStackClick(event) {
    const button = event.target.closest("[data-project-window-toggle]");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const card = button.closest(".card");
    if (!card) return;

    if (card === this.expandedCard) {
      this.restoreExpandedCard();
      return;
    }

    if (!card.classList.contains("is-front")) return;
    this.expandCard(card);
  }

  onStackPointerOver(event) {
    const button = event.target.closest("[data-project-window-toggle]");
    if (button) {
      button.dataset.hoverReady = "true";
      const card = button.closest(".card");
      if (card?.classList.contains("is-front") && !this.expandedCard) {
        this.cards.forEach((candidate) => candidate.classList.remove("is-hovered"));
        card.classList.add("is-hovered");
        this.hoverPaused = true;
        this.pointerOverStack = true;
        this.container.dataset.hoverPaused = "true";
        this.clearScheduledSwap();
      }
    }
  }

  onStackPointerOut(event) {
    const button = event.target.closest("[data-project-window-toggle]");
    if (button && !button.contains(event.relatedTarget)) {
      button.dataset.hoverReady = "false";
      if (!this.expandedCard) {
        this.syncHoverPauseFromPointer({ schedule: true });
      }
    }
  }

  onBlankPointerDown(event) {
    if (!this.expandedCard || this.isRestoringExpandedCard) return;
    if (event.target.closest(".card.is-expanded")) return;

    this.restoreExpandedCard();
  }

  updateWindowToggle(card, isExpanded) {
    const button = card?.querySelector("[data-project-window-toggle]");
    if (!button) return;

    button.setAttribute("aria-label", isExpanded ? "Restore project window" : "Maximize project window");
    button.dataset.windowState = isExpanded ? "expanded" : "compact";
    button.innerHTML = icon(isExpanded ? "minimize-2" : "square");
    window.lucide?.createIcons();
  }

  getExpandedTargetRect() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = clamp(viewportWidth * 0.72, this.width * 1.16, Math.min(1240, viewportWidth - 88));
    const height = clamp(viewportHeight * 0.74, this.height * 1.1, Math.min(790, viewportHeight - 76));

    return {
      left: Math.max(32, (viewportWidth - width) / 2 + Math.min(56, viewportWidth * 0.025)),
      top: Math.max(32, (viewportHeight - height) / 2),
      width,
      height
    };
  }

  lockProgressAnimation() {
    window.cancelAnimationFrame(this.progressFrame);
    this.progressFrame = 0;
    this.targetProgress = this.currentProgress;
    this.progressVelocity = 0;
    this.isAnimating = false;
    this.clearScheduledSwap();
    this.clearArrivalRebound();
    this.settleWheelTension(0.18);
  }

  expandCard(card) {
    if (this.expandedCard || this.isRestoringExpandedCard || !card) return;

    this.ensureCardContent(card);
    this.lockProgressAnimation();

    const startRect = card.getBoundingClientRect();
    const targetRect = this.getExpandedTargetRect();

    this.expandedCard = card;
    this.expandedSnapshot = {
      card,
      parent: card.parentNode,
      nextSibling: card.nextSibling,
      style: card.getAttribute("style") || "",
      rect: startRect,
      progress: this.currentProgress
    };

    this.container.dataset.expanded = "true";
    this.container.closest("[data-project-card-swap-section]")?.setAttribute("data-expanded", "true");
    this.cards.forEach((candidate) => candidate.classList.toggle("is-expansion-muted", candidate !== card));
    card.classList.add("is-expanded", "is-expanding");
    card.classList.remove("is-hovered");
    this.updateWindowToggle(card, true);
    this.root.body.append(card);

    gsap.killTweensOf(card);
    card.style.position = "fixed";
    card.style.left = `${startRect.left}px`;
    card.style.top = `${startRect.top}px`;
    card.style.width = `${startRect.width}px`;
    card.style.height = `${startRect.height}px`;
    card.style.transform = "none";
    card.style.zIndex = "5000";
    card.style.opacity = "1";
    card.style.skewY = "0deg";
    card.style.pointerEvents = "auto";

    this.expandTween?.kill();
    this.expandTween = gsap.to(card, {
      left: targetRect.left,
      top: targetRect.top,
      width: targetRect.width,
      height: targetRect.height,
      duration: 0.7,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => {
        card.classList.remove("is-expanding");
        card.classList.add("is-expanded-settled");
        this.expandTween = null;
      }
    });
  }

  restoreExpandedCard() {
    const card = this.expandedCard;
    const snapshot = this.expandedSnapshot;
    if (!card || !snapshot || this.isRestoringExpandedCard) return;

    this.isRestoringExpandedCard = true;
    card.classList.remove("is-expanded-settled", "is-expanding");
    card.classList.add("is-restoring");
    this.updateWindowToggle(card, false);

    this.expandTween?.kill();
    this.expandTween = gsap.to(card, {
      left: snapshot.rect.left,
      top: snapshot.rect.top,
      width: snapshot.rect.width,
      height: snapshot.rect.height,
      duration: 0.58,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => {
        card.classList.remove("is-expanded", "is-restoring");
        this.cards.forEach((candidate) => candidate.classList.remove("is-expansion-muted"));
        if (snapshot.parent) {
          if (snapshot.nextSibling?.parentNode === snapshot.parent) {
            snapshot.parent.insertBefore(card, snapshot.nextSibling);
          } else {
            snapshot.parent.append(card);
          }
        }
        card.setAttribute("style", snapshot.style);
        this.container.dataset.expanded = "false";
        this.container.closest("[data-project-card-swap-section]")?.setAttribute("data-expanded", "false");
        this.expandedCard = null;
        this.expandedSnapshot = null;
        this.isRestoringExpandedCard = false;
        this.expandTween = null;
        this.currentProgress = snapshot.progress;
        this.targetProgress = snapshot.progress;
        this.renderProgress(this.currentProgress);
        this.syncHoverPauseFromPointer({ schedule: true });
      }
    });
  }

  updateCardRoles() {
    this.cards.forEach((card) => {
      card.classList.remove("is-front", "is-middle", "is-back");
    });

    this.order.forEach((cardIndex, position) => {
      const card = this.cards[cardIndex];
      if (!card) return;

      if (position === 0) {
        card.classList.add("is-front");
      } else if (position === 1) {
        card.classList.add("is-middle");
      } else {
        card.classList.add("is-back");
      }
    });
  }

  getMotionConfig(source) {
    if (source === "wheel") {
      return {
        ease: "elastic.out(0.62,0.84)",
        durDrop: 0.52,
        durMove: 0.54,
        durReturn: 0.58,
        promoteOverlap: 0.76,
        returnDelay: 0.01,
        stagger: 0.045,
        yDrop: 315
      };
    }

    return {
      ...this.config,
      stagger: 0.15,
      yDrop: 500
    };
  }

  swap({ direction = 1, source = "auto" } = {}) {
    if (this.order.length < 2 || this.isDestroyed || this.expandedCard) return;
    if (source === "auto" && this.isAnimating) return;

    this.advanceProgress(direction >= 0 ? 1 : -1, { source });
  }
}

function initExplorerCardSwap({
  root = document,
  projects = PROJECTS,
  config = CARD_SWAP_CONFIG,
  initialIndex
} = {}) {
  const container = root.querySelector("[data-card-swap]");
  if (!container) {
    return null;
  }

  const projectCount = projects.length;
  const visibleCardCount = resolveCardCount(
    container.dataset.visibleCardCount || config.visibleCardCount,
    projectCount,
    projectCount
  );
  const virtualCardCount = Math.max(
    visibleCardCount,
    resolveCardCount(container.dataset.virtualCardCount || config.virtualCardCount, visibleCardCount, projectCount)
  );
  const renderPoolSize = Math.min(projectCount, Math.max(visibleCardCount, virtualCardCount));
  renderProjectCards(container, projects, renderPoolSize);
  const cardDistance = Number(container.dataset.cardDistance || config.cardDistance);
  const verticalDistance = Number(container.dataset.verticalDistance || config.verticalDistance);
  const width = Number(container.dataset.width || config.width);
  const height = Number(container.dataset.height || config.height);
  const resolvedInitialIndex = resolveInitialIndex(
    initialIndex ?? config.initialIndex,
    projectCount
  );
  let layoutFrame = 0;
  const syncLayout = () =>
    fitProjectStack(
      container,
      Math.min(projects.length, visibleCardCount),
      cardDistance,
      verticalDistance,
      width,
      height
    );
  const handleResize = () => {
    window.cancelAnimationFrame(layoutFrame);
    layoutFrame = window.requestAnimationFrame(syncLayout);
  };

  syncLayout();
  window.addEventListener("resize", handleResize);

  const instance = new CardSwap(container, {
    projects,
    width,
    height,
    cardDistance,
    verticalDistance,
    delay: Number(container.dataset.delay || config.delay),
    pauseOnHover: container.dataset.pauseOnHover === "true" || config.pauseOnHover,
    skewAmount: Number(container.dataset.skewAmount || config.skewAmount),
    easing: container.dataset.easing || config.easing,
    visibleCardCount,
    virtualCardCount,
    initialIndex: resolvedInitialIndex
  });

  return {
    container,
    instance,
    projects,
    syncLayout,
    destroy() {
      window.cancelAnimationFrame(layoutFrame);
      window.removeEventListener("resize", handleResize);
      instance.destroy();
    }
  };
}

let mountedTextPressure = initTextPressure();
let mountedScrollHint = initScrollHint();
let mounted = initExplorerCardSwap();

window.rosebegExplorerCards = {
  projects: PROJECTS,
  config: CARD_SWAP_CONFIG,
  textPressure: mountedTextPressure,
  scrollHint: mountedScrollHint,
  cardSwap: mounted?.instance ?? null,
  mounted,
  mountedTextPressure,
  mountedScrollHint,
  setProjects(nextProjects, options = {}) {
    if (this.mounted) {
      this.mounted.destroy();
    }
    mounted = initExplorerCardSwap({
      projects: nextProjects,
      config: this.config,
      initialIndex: options.initialIndex
    });
    this.projects = nextProjects;
    this.mounted = mounted;
    this.cardSwap = mounted?.instance ?? null;
    return this.cardSwap;
  },
  resetScrollHint() {
    if (this.mountedScrollHint) {
      this.mountedScrollHint.destroy();
    }
    delete document.querySelector("[data-scroll-hint]")?.dataset.scrollHintReady;
    delete document.querySelector("[data-scroll-hint]")?.dataset.scrollHintDismissed;
    mountedScrollHint = initScrollHint();
    this.mountedScrollHint = mountedScrollHint;
    this.scrollHint = mountedScrollHint;
    return this.scrollHint;
  },
  resetTextPressure() {
    if (this.mountedTextPressure) {
      this.mountedTextPressure.destroy();
    }
    mountedTextPressure = initTextPressure();
    this.mountedTextPressure = mountedTextPressure;
    this.textPressure = mountedTextPressure;
    return this.textPressure;
  }
};
