import { useRef, useState } from "react";
import { bindMagnetic } from "../../animations/magnetic.ts";
import { leetcode } from "../../data/leetcode.ts";
import { profile } from "../../data/profile.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { haptic } from "../../utils/haptics.ts";
import { ProfilePortrait } from "../profile/ProfilePortrait.tsx";
import { LocalTime } from "./LocalTime.tsx";
import { RollText } from "./RollText.tsx";
import "./Contact.css";

function handleFrom(url: string): string {
  return url.replace(/\/+$/, "").split("/").pop() ?? url;
}

const socials = [
  { id: "linkedin", name: "LinkedIn", href: profile.links.linkedin },
  { id: "github", name: "GitHub", href: profile.links.github },
  { id: "leetcode", name: "LeetCode", href: leetcode.url },
].filter((item): item is { id: string; name: string; href: string } => Boolean(item.href));

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [copied, setCopied] = useState(false);
  const email = profile.links.email;

  // Email when one is published; LinkedIn until then.
  const cta = email
    ? { href: `mailto:${email}`, label: email, kicker: "WRITE TO", external: false }
    : {
        href: profile.links.linkedin,
        label: "Start a conversation",
        kicker: "MESSAGE ON LINKEDIN",
        external: true,
      };

  useGSAP(
    () => {
      if (!root.current || reduced) {
        return;
      }
      gsap.from(root.current.querySelectorAll("[data-social]"), {
        yPercent: 100,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-socials]", start: "top 92%", once: true },
      });
      gsap.from("[data-cta]", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cta]", start: "top 92%", once: true },
      });
      if (!desktop) {
        return;
      }
      const cleanups = [...root.current.querySelectorAll<HTMLElement>("[data-magnetic]")].map((el) =>
        bindMagnetic(el, 0.18),
      );
      return () => {
        cleanups.forEach((fn) => {
          fn();
        });
      };
    },
    { scope: root, dependencies: [reduced, desktop], revertOnUpdate: true },
  );

  const copyEmail = async () => {
    if (!email) {
      return;
    }
    try {
      await navigator.clipboard.writeText(email);
      haptic("success");
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <section ref={root} className="section contact" id="contact">
      <div className="section__head">
        <p className="kicker">06 — CONTACT</p>
        <p className="kicker">OPEN CHANNEL</p>
      </div>

      <div className="contact__grid">
        <div className="contact__main">
          <h2 className="display contact__title" data-split>
            Let's build something <em>useful.</em>
          </h2>
          <p className="contact__sub">Have a difficult system problem? Let's talk.</p>

          <div className="contact__cta-wrap" data-cta>
            <a
              className="contact__cta"
              href={cta.href}
              target={cta.external ? "_blank" : undefined}
              rel={cta.external ? "noreferrer" : undefined}
              data-cursor="open"
              data-cursor-label="SAY HI"
              data-magnetic
            >
              <span className="contact__cta-kicker">{cta.kicker}</span>
              <span className="contact__cta-line">
                <RollText text={cta.label} />
                <span className="sr-only">{cta.label}</span>
                <span className="contact__cta-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
            </a>
            {email ? (
              <button type="button" className="contact__copy" onClick={copyEmail} aria-live="polite">
                {copied ? "COPIED ✓" : "COPY ADDRESS"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="contact__side">
          <ProfilePortrait treatment="contact" />
          <p className="contact__local">
            <span className="contact__pulse" aria-hidden="true" />
            {profile.location.toUpperCase()} · <LocalTime /> IST
          </p>
        </div>
      </div>

      <ul className="contact__socials" data-socials>
        {socials.map((item, index) => (
          <li key={item.id}>
            <a
              className="social"
              href={item.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
              data-social
            >
              <span className="social__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="social__name">{item.name}</span>
              <span className="social__handle">{handleFrom(item.href)}</span>
              <span className="social__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
