"use client";

import { useEffect } from "react";

export default function useInvitationMotion(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    root.classList.add("motion-enhanced");

    const selector = [
      ".hero-copy > *", ".hero-bottom", ".reveal > .eyebrow", ".reveal h2",
      ".reveal .section-illustration", ".story .section-no", ".story-copy > *",
      ".day-section > .section-intro", ".itinerary .section-caption", ".itinerary-grid > article",
      ".venue-art", ".venue-copy > p", ".venue-address", ".venue-copy > a", ".venue-copy > .pending-tag",
      ".interlude > *", ".gallery-heading > p", ".gallery-heading .eyebrow", ".photo-gallery .photo-frame",
      ".details-section > .section-shell > .eyebrow", ".details-grid > article",
      ".gifts-heading > *", ".gifts-grid > article", ".gifts-note", ".rsvp-copy > *", ".rsvp-form-wrap",
      ".footer > .monogram", ".footer > h2", ".footer > p",
    ].join(",");
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const groups = new Map<Element, number>();
    targets.forEach(element => {
      const group = element.closest("section, footer") || element;
      const index = groups.get(group) || 0;
      element.style.setProperty("--motion-delay", `${Math.min(index % 3 * 65, 130)}ms`);
      element.classList.add("motion-ready");
      groups.set(group, index + 1);
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -18px 0px" });
    targets.forEach(element => observer.observe(element));

    // Keyboard navigation must reveal a focused control and its visual context immediately.
    function onFocus(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.id === "hero-title") return;
      const section = target.closest("section, footer");
      if (!section) return;
      section.querySelectorAll(".motion-ready").forEach(element => {
        element.classList.add("is-inview");
        observer.unobserve(element);
      });
    }
    function reduceMotion() {
      if (preference.matches) root.classList.remove("motion-enhanced");
    }
    document.addEventListener("focusin", onFocus);
    preference.addEventListener("change", reduceMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocus);
      preference.removeEventListener("change", reduceMotion);
      root.classList.remove("motion-enhanced");
      targets.forEach(element => element.classList.remove("motion-ready", "is-inview"));
    };
  }, [ready]);
}
