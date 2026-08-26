import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const Btn = ({
  to = "/about",
  children = "Узнать больше",
  ghost = false,
}) => (
  <a href={"#" + to} className={"btn " + (ghost ? "ghost" : "")}>
    {children}
    <ArrowRight size={18} />
  </a>
);

export function Eyebrow({ children }) {
  return (
    <div className="eyebrow">
      <i /> {children}
    </div>
  );
}

export function ModalGlassRefraction({ active = true }) {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    const source = document.querySelector("main");
    if (!active || !layer || !source) return undefined;

    const clone = source.cloneNode(true);
    clone
      .querySelectorAll(".hvac-modal-backdrop, [id]")
      .forEach((element) =>
        element.matches(".hvac-modal-backdrop")
          ? element.remove()
          : element.removeAttribute("id"),
      );
    clone.classList.add("modal-refraction-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");
    layer.replaceChildren(clone);

    const bounds = source.getBoundingClientRect();
    clone.style.width = `${bounds.width}px`;
    clone.style.transform = `translate3d(${bounds.left}px, ${bounds.top}px, 0)`;

    return () => layer.replaceChildren();
  }, [active]);

  return (
    <div ref={layerRef} className="modal-refraction-layer" aria-hidden="true" />
  );
}

export function ProductTooltipRefraction({ active }) {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!active || !layer) return undefined;
    const source = document.querySelector(".products-catalog");
    if (!source) return undefined;

    const clone = source.cloneNode(true);
    clone
      .querySelectorAll(".product-tooltip, [id]")
      .forEach((element) =>
        element.matches(".product-tooltip")
          ? element.remove()
          : element.removeAttribute("id"),
      );
    clone.classList.add("product-tooltip-refraction-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");
    layer.replaceChildren(clone);

    const syncClone = () => {
      const sourceBounds = source.getBoundingClientRect();
      const layerBounds = layer.getBoundingClientRect();
      clone.style.width = `${sourceBounds.width}px`;
      clone.style.transform = `translate3d(${sourceBounds.left - layerBounds.left}px, ${sourceBounds.top - layerBounds.top}px, 0)`;
    };

    syncClone();
    window.addEventListener("scroll", syncClone, { passive: true });
    window.addEventListener("resize", syncClone);
    return () => {
      window.removeEventListener("scroll", syncClone);
      window.removeEventListener("resize", syncClone);
      layer.replaceChildren();
    };
  }, [active]);

  return (
    <div
      ref={layerRef}
      className="product-tooltip-refraction"
      aria-hidden="true"
    />
  );
}

export function AnimatedNumber({ value, duration = 1400 }) {
  const elementRef = useRef(null);
  const [displayValue, setDisplayValue] = useState("0");
  useEffect(() => {
    const match = String(value).match(/^([\d.,]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return undefined;
    }
    const target = Number(match[1].replace(",", "."));
    const suffix = match[2];
    const decimals = match[1].includes(",") ? match[1].split(",")[1].length : 0;
    const format = (number) =>
      number.toFixed(decimals).replace(".", ",") + suffix;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame;
    const startAnimation = () => {
      if (reducedMotion) {
        setDisplayValue(format(target));
        return;
      }
      const startedAt = performance.now();
      const tick = (time) => {
        const progress = Math.min((time - startedAt) / duration, 1);
        setDisplayValue(format(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        startAnimation();
      },
      { threshold: 0.35 },
    );
    observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);
  return (
    <b ref={elementRef} className="animated-number" aria-label={String(value)}>
      {displayValue}
    </b>
  );
}

export function Stats() {
  return (
    <div className="stats">
      <div>
        <strong>
          <AnimatedNumber value="2" />
        </strong>
        <span>га территории</span>
      </div>
      <div>
        <strong>
          <AnimatedNumber value="100" />
        </strong>
        <span>млн сомони инвестиций</span>
      </div>
      <div>
        <strong>
          <AnimatedNumber value="150" />
        </strong>
        <span>рабочих мест на I этапе</span>
      </div>
      <div>
        <strong>
          <AnimatedNumber value="2022" />
        </strong>
        <span>год начала проекта</span>
      </div>
    </div>
  );
}

export function Capability({ n, title, value, image }) {
  return (
    <a href="#/production" className="cap-card">
      <span>{n}</span>
      <div className="form-art">
        <img src={image} alt="" loading="lazy" />
      </div>
      <h3>{title}</h3>
      <strong>
        <AnimatedNumber value={value} />
        <small>единиц в год</small>
      </strong>
      <ArrowUpRight />
    </a>
  );
}

export function Value({ icon, t, d }) {
  return (
    <div className="value">
      <i>{icon}</i>
      <h3>{t}</h3>
      <p>{d}</p>
    </div>
  );
}

export function PageHero({ eyebrow, title, text, note, n = "02" }) {
  return (
    <section className="pagehero">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="pagehero-note">
        <span>{n}</span>
        <p>{note}</p>
      </div>
      <i className="pagehero-liquid-secondary" aria-hidden="true" />
    </section>
  );
}
