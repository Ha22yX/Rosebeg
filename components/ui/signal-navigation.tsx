import { type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { Shuffle } from "@/components/ui/shuffle";

const menuItems = [
  { label: "HOME", ariaLabel: "Home", link: "#hero" },
  { label: "ABOUT", ariaLabel: "About", link: "#who" },
  { label: "WORKS", ariaLabel: "Works", link: "#works" },
  { label: "PHOTOS", ariaLabel: "Photos", link: "#photos" },
  { label: "SOCIAL", ariaLabel: "Social", link: "#social" },
  { label: "CONTACT", ariaLabel: "Contact", link: "#contact" },
];

const socialItems = [
  { label: "GitHub", link: "https://github.com/Ha22yX" },
  { label: "X", link: "#" },
  { label: "Email", link: "mailto:hello@rosebeg.com" },
];

const SHUFFLE_SEQUENCE_DELAY = 0.25;

type SignalNavigationProps = {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function SignalNavigation({
  isOpen: controlledIsOpen,
  onOpenChange,
}: SignalNavigationProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const socialRefs = useRef<HTMLAnchorElement[]>([]);
  const scrollAnimationRef = useRef<number | null>(null);
  const isOpen = controlledIsOpen ?? internalIsOpen;

  const setMenuOpen = (nextIsOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextIsOpen);
    }

    onOpenChange?.(nextIsOpen);
  };

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen(!isOpen);

  const stopNavigationScroll = () => {
    if (scrollAnimationRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  };

  const scrollToHashTarget = (hash: string) => {
    const target = document.querySelector(hash);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    stopNavigationScroll();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startY = window.scrollY;
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY);

    window.history.pushState(null, "", hash);

    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    const distance = targetY - startY;
    const duration = Math.min(2200, Math.max(1200, Math.abs(distance) * 0.55));
    const startedAt = performance.now();
    document.documentElement.dataset.navigationScrollState = "scrolling";

    const easeInOutCubic = (progress: number) =>
      progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));

      if (progress < 1) {
        scrollAnimationRef.current = window.requestAnimationFrame(tick);
        return;
      }

      window.scrollTo(0, targetY);
      delete document.documentElement.dataset.navigationScrollState;
      scrollAnimationRef.current = null;
    };

    scrollAnimationRef.current = window.requestAnimationFrame(tick);
  };

  const handleMenuLinkClick = (event: MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith("#")) {
      event.preventDefault();
      scrollToHashTarget(link);
    }

    closeMenu();
  };

  useLayoutEffect(() => {
    if (backdropRef.current) {
      gsap.set(backdropRef.current, { autoAlpha: 0 });
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => () => stopNavigationScroll(), []);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const socials = socialRefs.current.filter(Boolean);

    if (!panel || !backdrop) {
      return;
    }

    gsap.killTweensOf([backdrop, ...socials]);

    if (isOpen) {
      setShuffleKey((value) => value + 1);
      gsap.to(backdrop, {
        autoAlpha: 1,
        duration: 0.72,
        ease: "power2.out",
      });
      gsap.fromTo(
        socials,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.44, stagger: 0.055, delay: 0.48, ease: "power3.out" }
      );
      return;
    }

    gsap.to(backdrop, {
      autoAlpha: 0,
      duration: 0.72,
      ease: "power2.out",
    });
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={isOpen ? "staggered-menu-toggle is-open" : "staggered-menu-toggle"}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        onClick={toggleMenu}
        data-signal-navigation
      >
        <span>{isOpen ? "Close" : "Menu"}</span>
        <span className="staggered-menu-icon" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <div ref={backdropRef} className="staggered-menu-backdrop" onClick={closeMenu} />

      <aside
        ref={panelRef}
        className={isOpen ? "staggered-menu-panel is-open" : "staggered-menu-panel"}
        aria-hidden={!isOpen}
        aria-label="Rosebeg navigation"
        data-staggered-menu-panel
      >
        <div className="staggered-menu-panel-top">
          <span>Rosebeg</span>
          <button type="button" onClick={closeMenu} aria-label="Close navigation">
            Close
            <span aria-hidden="true">x</span>
          </button>
        </div>

        <nav className="staggered-menu-links" aria-label="Primary">
          {menuItems.map((item, index) => (
            <a
              href={item.link}
              role="menuitem"
              aria-label={item.ariaLabel}
              className="staggered-menu-link"
              key={item.label}
              onClick={(event) => handleMenuLinkClick(event, item.link)}
            >
              <span className="staggered-menu-link-text">
                <Shuffle
                  text={item.label}
                  shuffleDirection="right"
                  duration={0.35}
                  animationMode="evenodd"
                  shuffleTimes={1}
                  ease="power3.out"
                  stagger={0.03}
                  threshold={0.1}
                  triggerOnce={true}
                  triggerOnHover={false}
                  respectReducedMotion={true}
                  loop={false}
                  loopDelay={0}
                  activeKey={`${shuffleKey}-${item.label}`}
                  playDelay={index * SHUFFLE_SEQUENCE_DELAY}
                  enabled={isOpen}
                  fixedCharacterMetrics
                />
              </span>
              <span className="staggered-menu-number">{String(index + 1).padStart(2, "0")}</span>
            </a>
          ))}
        </nav>

        <div className="staggered-menu-socials">
          <span>Socials</span>
          <div>
            {socialItems.map((item, index) => (
              <a
                href={item.link}
                key={item.label}
                ref={(element) => {
                  if (element) {
                    socialRefs.current[index] = element;
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
