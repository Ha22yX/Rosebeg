import { useEffect } from "react";

import {
  clampScrollTarget,
  lazySmoothScrollConfig,
  lazySmoothScrollWheelMultiplier,
  normalizeWheelDelta,
  stepScrollMotion,
} from "@/components/ui/scroll-motion";

const scrollConfig = lazySmoothScrollConfig;
const wheelMultiplier = lazySmoothScrollWheelMultiplier;

function getScrollElement() {
  return document.scrollingElement ?? document.documentElement;
}

function getMaxScroll() {
  const scrollElement = getScrollElement();
  return Math.max(0, scrollElement.scrollHeight - window.innerHeight);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function hasScrollableAncestor(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) {
    return false;
  }

  let element: Element | null = target;

  while (element && element !== document.body && element !== document.documentElement) {
    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const canScrollY = /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight + 1;

    if (canScrollY) {
      const scrollTop = element.scrollTop;
      const maxScrollTop = element.scrollHeight - element.clientHeight;

      if ((deltaY < 0 && scrollTop > 0) || (deltaY > 0 && scrollTop < maxScrollTop - 1)) {
        return true;
      }
    }

    element = element.parentElement;
  }

  return false;
}

function shouldHandleKey(event: KeyboardEvent) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) {
    return false;
  }

  return [
    "ArrowDown",
    "ArrowUp",
    "PageDown",
    "PageUp",
    "Home",
    "End",
    " ",
    "Spacebar",
  ].includes(event.key);
}

function getSamePageHashLink(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest<HTMLAnchorElement>("a[href]");

  if (!anchor) {
    return null;
  }

  const url = new URL(anchor.href, window.location.href);

  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) {
    return null;
  }

  return anchor;
}

function keyToTargetDelta(event: KeyboardEvent) {
  const viewportStep = window.innerHeight * 0.82;

  switch (event.key) {
    case "ArrowDown":
      return 130;
    case "ArrowUp":
      return -130;
    case "PageDown":
      return viewportStep;
    case "PageUp":
      return -viewportStep;
    case " ":
    case "Spacebar":
      return event.shiftKey ? -viewportStep : viewportStep;
    default:
      return 0;
  }
}

export function SmoothScrollController() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.dataset.smoothScrollState = "native";
      return undefined;
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    let position = window.scrollY;
    let target = position;
    let velocity = 0;
    let frame = 0;
    let lastTime = 0;
    let internalScrollUntil = 0;
    let appliedScrollY = Math.round(position);

    root.style.scrollBehavior = "auto";
    root.style.setProperty("--smooth-scroll-remainder", "0px");

    const writeState = (state: "idle" | "running") => {
      root.dataset.smoothScrollState = state;
      root.dataset.smoothScrollPosition = position.toFixed(2);
      root.dataset.smoothScrollTarget = target.toFixed(2);
      root.dataset.smoothScrollVelocity = velocity.toFixed(2);
      root.dataset.smoothScrollMaxSpeed = scrollConfig.maxSpeed.toString();
    };

    const syncFromNativeScroll = () => {
      if (performance.now() < internalScrollUntil || frame) {
        return;
      }

      position = window.scrollY;
      target = position;
      velocity = 0;
      appliedScrollY = Math.round(position);
      root.style.setProperty("--smooth-scroll-remainder", "0px");
      writeState("idle");
    };

    const setWindowScroll = (nextPosition: number) => {
      const clampedPosition = clampScrollTarget(nextPosition, getMaxScroll());
      const nextAppliedScrollY = Math.round(clampedPosition);
      const visualRemainder = nextAppliedScrollY - clampedPosition;

      root.style.setProperty("--smooth-scroll-remainder", `${visualRemainder.toFixed(3)}px`);

      if (nextAppliedScrollY === appliedScrollY && Math.round(window.scrollY) === nextAppliedScrollY) {
        return;
      }

      appliedScrollY = nextAppliedScrollY;
      internalScrollUntil = performance.now() + 90;
      window.scrollTo({ top: nextAppliedScrollY, behavior: "instant" });
    };

    const stopIfSettled = () => {
      if (Math.abs(target - position) <= scrollConfig.settleDistance && Math.abs(velocity) < 8) {
        position = target;
        velocity = 0;
        setWindowScroll(position);
        writeState("idle");
        frame = 0;
        lastTime = 0;
        return true;
      }

      return false;
    };

    const animate = (time: number) => {
      const deltaTime = lastTime ? time - lastTime : 1000 / 60;
      lastTime = time;

      const next = stepScrollMotion({ position, velocity }, target, deltaTime, scrollConfig);
      position = clampScrollTarget(next.position, getMaxScroll());
      velocity = next.velocity;
      setWindowScroll(position);
      writeState("running");

      if (!stopIfSettled()) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const start = () => {
      if (!frame) {
        lastTime = 0;
        frame = window.requestAnimationFrame(animate);
      }
    };

    const updateTarget = (nextTarget: number) => {
      target = clampScrollTarget(nextTarget, getMaxScroll());

      if (!frame) {
        position = window.scrollY;
        velocity = 0;
      }

      writeState("running");
      start();
    };

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) {
        return;
      }

      const deltaY = normalizeWheelDelta(event);

      if (Math.abs(deltaY) < 0.01 || hasScrollableAncestor(event.target, deltaY)) {
        return;
      }

      event.preventDefault();
      updateTarget(target + deltaY * wheelMultiplier);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldHandleKey(event)) {
        return;
      }

      event.preventDefault();

      if (event.key === "Home") {
        updateTarget(0);
        return;
      }

      if (event.key === "End") {
        updateTarget(getMaxScroll());
        return;
      }

      updateTarget(target + keyToTargetDelta(event));
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      const anchor = getSamePageHashLink(event.target);

      if (!anchor) {
        return;
      }

      const hash = new URL(anchor.href, window.location.href).hash;

      if (hash === "#") {
        return;
      }

      const targetElement = document.getElementById(decodeURIComponent(hash.slice(1)));

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      const style = window.getComputedStyle(targetElement);
      const scrollMarginTop = Number.parseFloat(style.scrollMarginTop) || 0;
      const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - scrollMarginTop;

      window.history.pushState(null, "", hash);
      updateTarget(targetTop);
    };

    const onResize = () => {
      target = clampScrollTarget(target, getMaxScroll());
      position = clampScrollTarget(window.scrollY, getMaxScroll());
      appliedScrollY = Math.round(position);
      root.style.setProperty("--smooth-scroll-remainder", "0px");
      writeState(frame ? "running" : "idle");
    };

    writeState("idle");
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", syncFromNativeScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", syncFromNativeScroll);
      window.removeEventListener("resize", onResize);
      root.style.scrollBehavior = previousScrollBehavior;
      root.style.removeProperty("--smooth-scroll-remainder");
      delete root.dataset.smoothScrollState;
      delete root.dataset.smoothScrollPosition;
      delete root.dataset.smoothScrollTarget;
      delete root.dataset.smoothScrollVelocity;
      delete root.dataset.smoothScrollMaxSpeed;
    };
  }, []);

  return null;
}
