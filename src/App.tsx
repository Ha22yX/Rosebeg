import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ASCIIText } from "@/components/ui/ascii-text";
import type { InfiniteMenuItem } from "@/components/ui/infinite-menu";
import {
  ManifestoTypewriter,
  type ManifestoTitleState,
} from "@/components/ui/manifesto-typewriter";
import { SignalNavigation } from "@/components/ui/signal-navigation";
import { ShaderBackground } from "@/src/components/ShaderBackground";

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

const socials = [
  ["GitHub", "https://github.com/Ha22yX"],
  ["X", "#"],
  ["Instagram", "#"],
  ["Email", "mailto:hello@rosebeg.com"],
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
  const [titleState, setTitleState] = useState<ManifestoTitleState>(initialTitleState);
  const [isCompact, setIsCompact] = useState(false);
  const [isMobilePerformanceMode, setIsMobilePerformanceMode] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
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

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 720px), (pointer: coarse)");
    const narrowMedia = window.matchMedia("(max-width: 980px)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const constrainedDevice =
        (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) ||
        (typeof deviceMemory === "number" && deviceMemory <= 4);
      const lowPowerDevice = (mobileMedia.matches || narrowMedia.matches) && constrainedDevice;
      setIsMobilePerformanceMode(
        mobileMedia.matches || reducedMotionMedia.matches || connection?.saveData === true || lowPowerDevice
      );
    };
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

  return (
    <>
      <ShaderBackground
        className={isNavigationOpen ? "is-navigation-open" : ""}
        performanceMode={isMobilePerformanceMode ? "mobile" : "full"}
      />
      <div className={isNavigationOpen ? "page-stage is-navigation-open" : "page-stage"} data-page-stage>
        <main className="site-shell">
          <section id="hero" className="hero-panel" aria-labelledby="hero-title" ref={heroGate.ref}>
            <div className="hero-stage">
              <h1
                id="hero-title"
                aria-label="Rosebeg digital manifesto"
                className="manifesto-title ascii-manifesto-title"
              >
                <span className="typewriter-title-source" data-typewriter-title>
                  <ManifestoTypewriter onTitleStateChange={setTitleState} />
                </span>
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
                        active={heroGate.isNear}
                      />
                    </span>
                    <span className="ascii-title-accent" data-ascii-accent>
                      <ASCIIText
                        key={`accent-${isCompact ? "compact" : "wide"}-${asciiRender.layoutText}`}
                        text={asciiTitle.accentText || " "}
                        layoutText={asciiRender.layoutText}
                        anchorText={asciiTitle.accentAnchorText}
                        asciiFontSize={asciiRender.asciiFontSize}
                        textFontSize={160}
                        textColor="#ffd866"
                        planeBaseHeight={asciiRender.planeBaseHeight}
                        alignMode="layout"
                        resizeMode="debounced"
                        enableWaves
                        active={heroGate.isNear}
                      />
                    </span>
                  </span>
                )}
              </h1>
            </div>
          </section>

        <section id="who" className="section-panel who-panel" aria-labelledby="who-title">
          <div className="section-copy">
            <h2 id="who-title">Who</h2>
            <p>
              Ha22yX designs and builds digital spaces with a focus on identity,
              atmosphere, interaction, and visual systems.
            </p>
          </div>
          <div className="identity-panel">
            <span>Signal origin</span>
            <strong>Designer, builder, digital identity maker.</strong>
          </div>
        </section>

          <section
            id="works"
            className="section-panel code-works-panel"
            aria-label="Selected code works"
            ref={worksGate.ref}
          >
            {isMobilePerformanceMode ? (
              <MobileCodeWorks items={codeWorks} />
            ) : worksGate.isNear ? (
              <iframe
                className="code-works-frame"
                title="Selected Code Works"
                src="/project-card-swap/index.html"
                loading="lazy"
              />
            ) : (
              <PerformancePlaceholder label="Selected code works preloading" kind="works" />
            )}
          </section>

          <section
            id="photos"
            className="section-panel photography-panel"
            aria-label="Photography"
            ref={photosGate.ref}
          >
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

        <section id="social" className="section-panel social-panel" aria-labelledby="social-title">
          <div className="section-copy">
            <h2 id="social-title">Social</h2>
            <p>
              Public channels and identity endpoints. Replace these placeholders
              with live links when the homepage is ready.
            </p>
          </div>
          <div className="port-list" aria-label="Social links">
            {socials.map(([label, href]) => (
              <a href={href} aria-label={label} key={label}>
                {label}
              </a>
            ))}
          </div>
        </section>

        <section id="contact" className="section-panel contact-panel" aria-labelledby="contact-title">
          <div className="contact-terminal">
            <h2 id="contact-title">Contact</h2>
            <p>
              For collaboration, commissions, or a direct signal to Ha22yX, use
              the terminal below and replace the address later.
            </p>
            <a className="contact-link" href="mailto:hello@rosebeg.com">
              hello@rosebeg.com
            </a>
          </div>
        </section>
        </main>
      </div>
      <SignalNavigation isOpen={isNavigationOpen} onOpenChange={setIsNavigationOpen} />
    </>
  );
}

export default App;
