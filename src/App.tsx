import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ASCIIText } from "@/components/ui/ascii-text";
import { ChromaGrid, type ChromaGridItem } from "@/components/ui/chroma-grid";
import type { InfiniteMenuItem } from "@/components/ui/infinite-menu";
import {
  ManifestoTypewriter,
  type ManifestoTitleState,
} from "@/components/ui/manifesto-typewriter";
import { SignalNavigation } from "@/components/ui/signal-navigation";
import { ShaderBackground } from "@/src/components/ShaderBackground";
import { SocialSignalPorts } from "@/src/components/SocialSignalPorts";

const InfiniteMenu = lazy(() =>
  import("@/components/ui/infinite-menu").then((module) => ({ default: module.InfiniteMenu }))
);

const compactAsciiLayoutTitle = `A personal
portfolio
by HarryX`;
const highlightPrefix = "I am a ";
const roleAsciiAnchor = "I am a Photographer";
const highlightPhrases = ["Developer", "Researcher", "Photographer"];
const initialTitleState: ManifestoTitleState = {
  displayText: "",
  targetText: "This is Rosebeg",
};

const mobileInitialTitleState: ManifestoTitleState = {
  displayText: "",
  targetText: "This is Rosebeg",
};

type MobileTitleStep =
  | { action: "type"; text: string; speed?: number; targetText?: string }
  | { action: "delete"; count: number; speed?: number; targetText?: string }
  | { action: "wait"; duration: number; targetText?: string };

const mobileTypeSpeed = 58;
const mobileDeleteSpeed = 28;
const mobileTitleSequence: MobileTitleStep[] = [
  { action: "wait", duration: 120, targetText: "This is Rosebeg" },
  { action: "type", text: "This is Rosebeg", targetText: "This is Rosebeg" },
  { action: "wait", duration: 1200, targetText: "This is Rosebeg" },
  { action: "delete", count: "This is Rosebeg".length, targetText: "This is Rosebeg" },
  { action: "type", text: "A personal portfolio", targetText: "A personal portfolio by HarryX" },
  { action: "wait", duration: 420, targetText: "A personal portfolio by HarryX" },
  { action: "type", text: " by HarryX", targetText: "A personal portfolio by HarryX" },
  { action: "wait", duration: 1300, targetText: "A personal portfolio by HarryX" },
  {
    action: "delete",
    count: "A personal portfolio by HarryX".length,
    targetText: "A personal portfolio by HarryX",
  },
  { action: "type", text: "I am a Developer", targetText: "I am a Developer" },
  { action: "wait", duration: 980, targetText: "I am a Developer" },
  { action: "delete", count: "Developer".length, targetText: "I am a Developer" },
  { action: "type", text: "Researcher", targetText: "I am a Researcher" },
  { action: "wait", duration: 980, targetText: "I am a Researcher" },
  { action: "delete", count: "Researcher".length, targetText: "I am a Researcher" },
  { action: "type", text: "Photographer", targetText: "I am a Photographer" },
  { action: "wait", duration: 1150, targetText: "I am a Photographer" },
  { action: "delete", count: "I am a Photographer".length, targetText: "I am a Photographer" },
  { action: "type", text: "Welcome to Rosebeg", targetText: "Welcome to Rosebeg" },
];

const contactEmail = "hello@rosebeg.com";

function detectMobilePerformanceMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const mobileMedia = window.matchMedia("(max-width: 720px), (pointer: coarse)");
  const narrowMedia = window.matchMedia("(max-width: 980px)");
  const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const constrainedDevice =
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) ||
    (typeof deviceMemory === "number" && deviceMemory <= 4);
  const lowPowerDevice = (mobileMedia.matches || narrowMedia.matches) && constrainedDevice;

  return mobileMedia.matches || reducedMotionMedia.matches || connection?.saveData === true || lowPowerDevice;
}

const photographyItems: InfiniteMenuItem[] = [
  {
    image: "/assets/photography/signal-plain-thumb.jpg",
    link: "/assets/photography/signal-plain-large.jpg",
    title: "Stone Gate",
    description: "A quiet threshold held in old masonry and winter light.",
    aspect: 2400 / 1800,
  },
  {
    image: "/assets/photography/violet-street-thumb.jpg",
    link: "/assets/photography/violet-street-large.jpg",
    title: "Underline Skyline",
    description: "A city cut by shadow, steel, and a distant tower.",
    aspect: 2400 / 1800,
  },
  {
    image: "/assets/photography/quiet-edge-thumb.jpg",
    link: "/assets/photography/quiet-edge-large.jpg",
    title: "Crosswalk Heat",
    description: "Street geometry washed in red light and noon glare.",
    aspect: 2400 / 1800,
  },
  {
    image: "/assets/photography/night-current-thumb.jpg",
    link: "/assets/photography/night-current-large.jpg",
    title: "Library Drift",
    description: "A soft corridor of books dissolving into focus.",
    aspect: 2400 / 1173,
  },
  {
    image: "/assets/photography/glass-weather-thumb.jpg",
    link: "/assets/photography/glass-weather-large.jpg",
    title: "Harbor Weather",
    description: "Blue air, water, and towers held in a clean horizon.",
    aspect: 2400 / 1597,
  },
  {
    image: "/assets/photography/afterimage-thumb.jpg",
    link: "/assets/photography/afterimage-large.jpg",
    title: "Window Afterimage",
    description: "The city reduced to panes, silhouettes, and late light.",
    aspect: 1655 / 2400,
  },
];

const chromaIdentityItems: ChromaGridItem[] = [
  {
    image: "/assets/identity/developer-lab.jpg",
    title: "Developer",
    subtitle: "Full-stack systems, AI tools, product engineering",
    handle: "@code",
    borderColor: "#93F3FF",
    gradient: "linear-gradient(145deg, #164D58, #000)",
    url: "#works",
  },
  {
    image: "/assets/photography/signal-plain-thumb.jpg",
    title: "Researcher",
    subtitle: "Signal fields, hardware prototypes, autonomy experiments",
    handle: "@lab",
    borderColor: "#CFFF58",
    gradient: "linear-gradient(210deg, #536B2D, #000)",
    url: "#works",
  },
  {
    image: "/assets/photography/night-current-thumb.jpg",
    title: "Photographer",
    subtitle: "Architecture, street light, quiet spatial narratives",
    handle: "@field",
    borderColor: "#F59E0B",
    gradient: "linear-gradient(165deg, #6F4D18, #000)",
    url: "#photos",
  },
  {
    image: "/assets/photography/afterimage-thumb.jpg",
    title: "Designer",
    subtitle: "Identity systems, motion language, interface atmosphere",
    handle: "@visual",
    borderColor: "#8B5CF6",
    gradient: "linear-gradient(195deg, #5227FF, #000)",
    url: "#contact",
  },
];

type CodeWorkItem = {
  name: string;
  kicker: string;
  summary: string;
  sourceUrl: string;
  websiteUrl?: string;
};

const codeWorks: CodeWorkItem[] = [
  {
    name: "Auto Email System",
    kicker: "Self-hosted AI Console",
    summary: "AI email triage for IMAP/POP3 inboxes, Chinese summaries, attachments, and WeChat alerts.",
    sourceUrl: "https://github.com/Ha22yX/auto-email-system",
  },
  {
    name: "Bridge US V2",
    kicker: "International Student Platform",
    summary: "Community platform with posts, multilingual workflows, moderation, and AI Q&A.",
    sourceUrl: "https://github.com/Ha22yX/Bridge-US-V2",
    websiteUrl: "https://bridge-us.org/",
  },
  {
    name: "Mother-Ship Docking Drone System",
    kicker: "Dual UAV Research",
    summary: "Relative-localization workspace for autonomous docking with UWB, AprilTag, PX4, and MAVLink.",
    sourceUrl: "https://github.com/Ha22yX/Mother-Ship-Docking-Drone-System",
    websiteUrl: "https://isef.rosebeg.com/",
  },
  {
    name: "Surfboard Vacuum Table DXF Generator",
    kicker: "CAD Automation Tool",
    summary: "Local DXF generator for surfboard vacuum-table suction holes and capsule slots.",
    sourceUrl: "https://github.com/Ha22yX/dxf-auto-shape-tool",
  },
  {
    name: "ESP32 Sound Radar",
    kicker: "Embedded Signal Prototype",
    summary: "ESP32-S3 four-microphone sound radar with TDOA estimation, TFT display, and web tuning dashboard.",
    sourceUrl: "https://github.com/Ha22yX/ESP32-Sound-Radar",
  },
  {
    name: "SAT AI Tutor",
    kicker: "Adaptive Learning Platform",
    summary: "SAT practice platform with adaptive study plans, AI explanations, PDF import, analytics, and admin tools.",
    sourceUrl: "https://github.com/Ha22yX/SAT-AI-Tutor",
    websiteUrl: "https://sat.rosebeg.com/auth/login?demo=1",
  },
  {
    name: "PhotoBack",
    kicker: "Photography Delivery Desk",
    summary: "Event gallery platform for private links, client selections, delivery, and Google Drive backup.",
    sourceUrl: "https://github.com/Ha22yX/PhotoBack",
    websiteUrl: "https://photoback.rosebeg.com/view/8b6ab9d9",
  },
];

function useViewportGate<T extends HTMLElement>({
  preloadMargin = "720px",
  activeMargin = "0px",
  threshold = 0.01,
}: {
  preloadMargin?: string;
  activeMargin?: string;
  threshold?: number;
} = {}) {
  const ref = useRef<T | null>(null);
  const [isNear, setIsNear] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsNear(true);
      setIsActive(true);
      return undefined;
    }

    const nearObserver = new IntersectionObserver(
      ([entry]) => setIsNear(entry.isIntersecting),
      { root: null, rootMargin: preloadMargin, threshold: 0 }
    );
    const activeObserver = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { root: null, rootMargin: activeMargin, threshold }
    );

    nearObserver.observe(node);
    activeObserver.observe(node);

    return () => {
      nearObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [activeMargin, preloadMargin, threshold]);

  return { ref, isNear, isActive };
}

function PerformancePlaceholder({ label, kind }: { label: string; kind: string }) {
  return (
    <div className="performance-placeholder" data-performance-placeholder={kind} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

function MobilePhotoGallery({ items }: { items: InfiniteMenuItem[] }) {
  const featured = items[0];
  const supporting = items.slice(1, 5);

  return (
    <div className="mobile-photo-gallery" data-mobile-photo-gallery>
      <figure className="mobile-photo-feature">
        <img src={featured.image} alt={featured.title} loading="lazy" decoding="async" />
        <figcaption>
          <strong>{featured.title}</strong>
          <span>{featured.description}</span>
        </figcaption>
      </figure>
      <div className="mobile-photo-strip" aria-label="Photography thumbnails">
        {supporting.map((item) => (
          <img src={item.image} alt={item.title} loading="lazy" decoding="async" key={item.title} />
        ))}
      </div>
    </div>
  );
}

function MobileCodeWorks({ items }: { items: CodeWorkItem[] }) {
  return (
    <div className="mobile-code-works" data-mobile-code-works>
      <div className="mobile-code-works-header">
        <span>Portfolio</span>
        <h2>Selected Code Works</h2>
        <p>Lightweight project index for mobile and low-power devices.</p>
      </div>
      <div className="mobile-code-works-list">
        {items.map((item, index) => (
          <article className="mobile-code-work-card" data-mobile-code-work-card key={item.name}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.kicker}</strong>
            </div>
            <h3>{item.name}</h3>
            <p>{item.summary}</p>
            <nav aria-label={`${item.name} links`}>
              <a href={item.websiteUrl ?? item.sourceUrl} target="_blank" rel="noreferrer">
                {item.name}
              </a>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </nav>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatAsciiTitle(text: string, compact: boolean) {
  if (!compact) {
    return text;
  }

  return text
    .replace("This is Rosebeg", "This is\nRosebeg")
    .replace("A personal portfolio by HarryX", "A personal\nportfolio\nby HarryX")
    .replace("A personal portfolio", "A personal\nportfolio")
    .replace("I am a Developer", "I am a\nDeveloper")
    .replace("I am a Researcher", "I am a\nResearcher")
    .replace("I am a Photographer", "I am a\nPhotographer")
    .replace("Welcome to Rosebeg", "Welcome to\nRosebeg");
}

function getAsciiRenderConfig(targetText: string, compact: boolean) {
  if (compact) {
    return {
      layoutText: compactAsciiLayoutTitle,
      asciiFontSize: 3,
      planeBaseHeight: 11.6,
    };
  }

  if (targetText === "A personal portfolio by HarryX") {
    return {
      layoutText: "A personal portfolio by HarryX",
      asciiFontSize: 4,
      planeBaseHeight: 5.2,
    };
  }

  if (targetText.startsWith("I am a ")) {
    return {
      layoutText: roleAsciiAnchor,
      asciiFontSize: 4,
      planeBaseHeight: 9.4,
    };
  }

  return {
    layoutText: targetText || "This is Rosebeg",
    asciiFontSize: 4,
    planeBaseHeight: 9.4,
  };
}

function getAsciiTitleLayers(text: string, targetText: string, compact: boolean) {
  const displayText = text || " ";
  const targetOrDisplayText = targetText || displayText;
  const anchorText = formatAsciiTitle(targetOrDisplayText, compact);

  if (!displayText.startsWith(highlightPrefix)) {
    return {
      baseText: formatAsciiTitle(displayText, compact),
      accentText: "",
      baseAnchorText: anchorText,
      accentAnchorText: anchorText,
      baseAlignMode: "anchored" as const,
    };
  }

  const ending = displayText.slice(highlightPrefix.length);
  const hasAccent = ending.length > 0 && highlightPhrases.some((phrase) => phrase.startsWith(ending));

  if (!hasAccent) {
    return {
      baseText: formatAsciiTitle(displayText, compact),
      accentText: "",
      baseAnchorText: anchorText,
      accentAnchorText: anchorText,
      baseAlignMode: "anchored" as const,
    };
  }

  if (compact) {
    return {
      baseText: `I am a\n${" ".repeat(ending.length)}`,
      accentText: `\n${ending}`,
      baseAnchorText: anchorText,
      accentAnchorText: anchorText,
      baseAlignMode: "anchored" as const,
    };
  }

  return {
    baseText: `${highlightPrefix}${" ".repeat(ending.length)}`,
    accentText: `${" ".repeat(highlightPrefix.length)}${ending}`,
    baseAnchorText: anchorText,
    accentAnchorText: anchorText,
    baseAlignMode: "anchored" as const,
  };
}

function App() {
  const [titleState, setTitleState] = useState<ManifestoTitleState>(() =>
    detectMobilePerformanceMode() ? mobileInitialTitleState : initialTitleState
  );
  const [isCompact, setIsCompact] = useState(false);
  const [isMobilePerformanceMode, setIsMobilePerformanceMode] = useState(() => detectMobilePerformanceMode());
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "copied">("idle");
  const heroGate = useViewportGate<HTMLElement>({ preloadMargin: "120px", activeMargin: "80px" });
  const worksGate = useViewportGate<HTMLElement>({
    preloadMargin: isMobilePerformanceMode ? "360px" : "680px",
    activeMargin: "160px",
  });
  const photosGate = useViewportGate<HTMLElement>({
    preloadMargin: isMobilePerformanceMode ? "420px" : "760px",
    activeMargin: "160px",
  });
  const asciiTitle = getAsciiTitleLayers(titleState.displayText, titleState.targetText, isCompact);
  const asciiRender = getAsciiRenderConfig(titleState.targetText, isCompact);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 980px)");
    const sync = () => setIsCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const handleContactCopy = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setContactStatus("copied");
      window.setTimeout(() => setContactStatus("idle"), 1800);
    } catch {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 720px), (pointer: coarse)");
    const narrowMedia = window.matchMedia("(max-width: 980px)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setIsMobilePerformanceMode(detectMobilePerformanceMode());
    sync();
    mobileMedia.addEventListener("change", sync);
    narrowMedia.addEventListener("change", sync);
    reducedMotionMedia.addEventListener("change", sync);
    return () => {
      mobileMedia.removeEventListener("change", sync);
      narrowMedia.removeEventListener("change", sync);
      reducedMotionMedia.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!isMobilePerformanceMode) {
      return undefined;
    }

    const timers: number[] = [];
    let cancelled = false;
    let displayText = "";
    let targetText = "This is Rosebeg";

    const applyState = () => {
      setTitleState({ displayText, targetText });
    };

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay);
      timers.push(timer);
    };

    const runStep = (stepIndex: number) => {
      if (cancelled || stepIndex >= mobileTitleSequence.length) {
        return;
      }

      const step = mobileTitleSequence[stepIndex];
      targetText = step.targetText ?? targetText;

      if (step.action === "wait") {
        applyState();
        schedule(() => runStep(stepIndex + 1), step.duration);
        return;
      }

      const speed = step.speed ?? (step.action === "type" ? mobileTypeSpeed : mobileDeleteSpeed);
      const total = step.action === "type" ? step.text.length : step.count;
      let index = 0;

      const tick = () => {
        if (cancelled) {
          return;
        }

        index += 1;
        if (step.action === "type") {
          displayText += step.text[index - 1] ?? "";
        } else {
          displayText = displayText.slice(0, -1);
        }
        applyState();

        if (index < total) {
          schedule(tick, speed);
        } else {
          schedule(() => runStep(stepIndex + 1), speed);
        }
      };

      schedule(tick, speed);
    };

    setTitleState(mobileInitialTitleState);
    schedule(() => runStep(0), 0);

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isMobilePerformanceMode]);

  return (
    <>
      <ShaderBackground
        className={isNavigationOpen ? "is-navigation-open" : ""}
        performanceMode={isMobilePerformanceMode ? "mobile" : "full"}
      />
      <div
        className={[
          "page-stage",
          isNavigationOpen ? "is-navigation-open" : "",
          isMobilePerformanceMode ? "is-mobile-performance" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-page-stage
        data-mobile-performance={isMobilePerformanceMode ? "true" : "false"}
        data-archive-experience="signal-archive"
      >
        <div className="archive-field" data-archive-field aria-hidden="true" />
        <main className="site-shell">
          <section
            id="hero"
            className="hero-panel"
            aria-labelledby="hero-title"
            ref={heroGate.ref}
            data-archive-section="hero"
          >
            <div className="hero-stage">
              <h1
                id="hero-title"
                aria-label="Rosebeg digital manifesto"
                className="manifesto-title ascii-manifesto-title"
              >
                {!isMobilePerformanceMode ? (
                  <span className="typewriter-title-source" data-typewriter-title>
                    <ManifestoTypewriter onTitleStateChange={setTitleState} />
                  </span>
                ) : null}
                {isMobilePerformanceMode ? (
                  <span className="mobile-plain-title" data-mobile-plain-title aria-hidden="true">
                    {titleState.displayText}
                  </span>
                ) : (
                  <span className="ascii-title-layer" data-ascii-title aria-hidden="true">
                    <span className="ascii-title-base">
                      <ASCIIText
                        key={`base-${isCompact ? "compact" : "wide"}-${asciiRender.layoutText}`}
                        text={asciiTitle.baseText}
                        layoutText={asciiRender.layoutText}
                        anchorText={asciiTitle.baseAnchorText}
                        asciiFontSize={asciiRender.asciiFontSize}
                        textFontSize={160}
                        textColor="#fdf9f3"
                        planeBaseHeight={asciiRender.planeBaseHeight}
                        alignMode={asciiTitle.baseAlignMode}
                        resizeMode="debounced"
                        enableWaves
                        active={heroGate.isActive}
                        animated={heroGate.isActive}
                      />
                    </span>
                    {asciiTitle.accentText ? (
                      <span className="ascii-title-accent is-role-accent" data-ascii-accent>
                        <ASCIIText
                          key={`accent-${isCompact ? "compact" : "wide"}-${asciiRender.layoutText}-role`}
                          text={asciiTitle.accentText}
                          layoutText={asciiRender.layoutText}
                          anchorText={asciiTitle.accentAnchorText}
                          asciiFontSize={asciiRender.asciiFontSize}
                          textFontSize={160}
                          textColor="#ffd866"
                          planeBaseHeight={asciiRender.planeBaseHeight}
                          alignMode="layout"
                          resizeMode="debounced"
                          enableWaves={false}
                          active={heroGate.isActive}
                          animated={false}
                        />
                      </span>
                    ) : null}
                  </span>
                )}
              </h1>
            </div>
          </section>

          <section
            id="who"
            className="section-panel who-panel chroma-about-panel"
            aria-labelledby="who-title"
            data-archive-section="who"
          >
            <div className="chroma-about-copy">
              <span>Signal identity</span>
              <h2 id="who-title">Who</h2>
            </div>
            <div className="chroma-about-stage">
              <ChromaGrid
                items={chromaIdentityItems}
                radius={isMobilePerformanceMode ? 180 : 300}
                damping={0.45}
                fadeOut={0.6}
                ease="power3.out"
                columns={isMobilePerformanceMode ? 1 : 2}
                rows={isMobilePerformanceMode ? 4 : 2}
                staticMode={isMobilePerformanceMode}
              />
            </div>
          </section>

          <section
            id="works"
            className="section-panel code-works-panel"
            aria-label="Selected code works"
            ref={worksGate.ref}
            data-archive-section="works"
          >
            {isMobilePerformanceMode ? (
              <MobileCodeWorks items={codeWorks} />
            ) : (
              <iframe
                className="code-works-frame"
                title="Selected Code Works"
                src="/project-card-swap/index.html"
                loading="eager"
              />
            )}
          </section>

          <section
            id="photos"
            className="section-panel photography-panel"
            aria-label="Photography"
            ref={photosGate.ref}
            data-archive-section="photos"
          >
            <div className="photography-lens-frame" data-lens-frame aria-hidden="true" />
            {photosGate.isNear ? (
              isMobilePerformanceMode ? (
                <MobilePhotoGallery items={photographyItems} />
              ) : (
                <Suspense fallback={<PerformancePlaceholder label="Photography field preloading" kind="photos" />}>
                  <InfiniteMenu items={photographyItems} scale={1} active={photosGate.isActive} />
                </Suspense>
              )
            ) : (
              <PerformancePlaceholder label="Photography field preloading" kind="photos" />
            )}
          </section>

          <SocialSignalPorts />

        <section
          id="contact"
          className="section-panel contact-panel"
          aria-labelledby="contact-title"
          data-archive-section="contact"
        >
          <div className="contact-terminal">
            <div className="contact-copy">
              <span className="contact-kicker">Final signal</span>
              <h2 id="contact-title">Contact</h2>
              <p>
                For collaboration, admissions conversations, portfolio questions,
                or project inquiries, send a direct signal to Ha22yX.
              </p>
              <div className="contact-tags" aria-label="Contact topics">
                <span>Collaboration</span>
                <span>Admissions</span>
                <span>Portfolio</span>
                <span>Projects</span>
              </div>
            </div>

            <div className="contact-signal" aria-hidden="true">
              <span />
              <span />
            </div>

            <div className="contact-endpoint">
              <span className="endpoint-label">Signal endpoint</span>
              <a className="contact-link" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
              <div className="contact-actions">
                <button
                  className="contact-copy-button"
                  type="button"
                  onClick={handleContactCopy}
                  aria-label="Copy email address"
                >
                  Copy signal
                </button>
                <span
                  className="contact-status"
                  data-active={contactStatus === "copied" ? "true" : "false"}
                  aria-live="polite"
                >
                  {contactStatus === "copied" ? "signal copied" : "direct line open"}
                </span>
              </div>
            </div>
          </div>
        </section>
        </main>
      </div>
      <SignalNavigation isOpen={isNavigationOpen} onOpenChange={setIsNavigationOpen} />
    </>
  );
}

export default App;
