import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const menuItems = [
  { label: "HOME", ariaLabel: "Home", link: "#hero" },
  { label: "ABOUT", ariaLabel: "About", link: "#who" },
  { label: "PROJECTS", ariaLabel: "Projects", link: "#works" },
  { label: "SOCIAL", ariaLabel: "Social", link: "#social" },
  { label: "CONTACT", ariaLabel: "Contact", link: "#contact" },
];

const socialItems = [
  { label: "GitHub", link: "https://github.com/Ha22yX" },
  { label: "X", link: "#" },
  { label: "Email", link: "mailto:hello@rosebeg.com" },
];

export function SignalNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLAnchorElement[]>([]);
  const socialRefs = useRef<HTMLAnchorElement[]>([]);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((value) => !value);

  useLayoutEffect(() => {
    if (panelRef.current) {
      gsap.set(panelRef.current, { x: "104%", pointerEvents: "none" });
    }
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

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const items = itemRefs.current.filter(Boolean);
    const socials = socialRefs.current.filter(Boolean);

    if (!panel || !backdrop) {
      return;
    }

    gsap.killTweensOf([panel, backdrop, ...items, ...socials]);

    if (isOpen) {
      gsap.set(panel, { pointerEvents: "auto" });
      gsap.to(backdrop, {
        autoAlpha: 1,
        duration: 0.32,
        ease: "power2.out",
      });
      gsap.fromTo(
        panel,
        { x: "104%", borderTopLeftRadius: 34, borderBottomLeftRadius: 34 },
        { x: "0%", duration: 0.72, ease: "expo.out", borderTopLeftRadius: 18, borderBottomLeftRadius: 18 }
      );
      gsap.fromTo(
        items,
        { x: 74, y: 28, autoAlpha: 0, rotate: 2 },
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          rotate: 0,
          duration: 0.76,
          stagger: 0.075,
          delay: 0.16,
          ease: "power4.out",
        }
      );
      gsap.fromTo(
        socials,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.44, stagger: 0.055, delay: 0.48, ease: "power3.out" }
      );
      return;
    }

    gsap.to(backdrop, {
      autoAlpha: 0,
      duration: 0.28,
      ease: "power2.in",
    });
    gsap.to(panel, {
      x: "104%",
      duration: 0.48,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(panel, { pointerEvents: "none" });
      },
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
        className="staggered-menu-panel"
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
              onClick={closeMenu}
              ref={(element) => {
                if (element) {
                  itemRefs.current[index] = element;
                }
              }}
            >
              <span className="staggered-menu-link-text">{item.label}</span>
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
