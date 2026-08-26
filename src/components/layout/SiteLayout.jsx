import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Send, X } from "lucide-react";
import { navigation as nav } from "../../data/siteContent.js";

const FluidGlassHeader = lazy(() => import("../ui/FluidGlassHeader.jsx"));

function HeaderRefractionLayer({ active }) {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!active || !layer) return undefined;
    const source = document.querySelector("main");
    if (!source) return undefined;

    const clone = source.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.add("header-refraction-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");
    clone
      .querySelectorAll("[id]")
      .forEach((element) => element.removeAttribute("id"));
    layer.replaceChildren(clone);

    const syncClone = () => {
      const bounds = source.getBoundingClientRect();
      clone.style.width = `${bounds.width}px`;
      clone.style.transform = `translate3d(${bounds.left}px, ${bounds.top}px, 0)`;
      [...source.children].forEach((element, index) => {
        const clonedElement = clone.children[index];
        if (!clonedElement) return;
        clonedElement.className = element.className;
        clonedElement.style.cssText = element.style.cssText;
      });
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
      className="header-refraction-layer"
      aria-hidden="true"
    />
  );
}

export function Logo({ light = false }) {
  return (
    <a
      className={`logo ${light ? "logo-light" : ""}`}
      href="#/"
      aria-label="Rhazes Pharma"
    >
      <img
        className="logo-main-image"
        src={`${import.meta.env.BASE_URL}assets/rhazes-logo.png`}
        alt="Rhazes"
      />
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);
  const path = location.hash.slice(1) || "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={scrolled ? "site-header-scrolled" : ""}>
      <svg className="header-glass-filters" aria-hidden="true">
        <defs>
          <filter
            id="header-glass-refraction"
            x="-15%"
            y="-45%"
            width="130%"
            height="190%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.045"
              numOctaves="2"
              seed="12"
              result="glassNoise"
            />
            <feGaussianBlur
              in="glassNoise"
              stdDeviation="0.7"
              result="softNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softNoise"
              scale="28"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>
      <div className="navwrap">
        <HeaderRefractionLayer active={scrolled} />
        {scrolled && (
          <Suspense fallback={<div className="header-fluid-glass-fallback" />}>
            <FluidGlassHeader active />
          </Suspense>
        )}
        <Logo />
        <nav className={open ? "open" : ""}>
          {nav.map(([name, route]) => (
            <a
              className={path === route ? "active" : ""}
              href={"#" + route}
              onClick={() => setOpen(false)}
              key={route}
            >
              {name}
            </a>
          ))}
          <a className="mobile-cta" href="#/contacts">
            Связаться с нами
          </a>
        </nav>
        <a className="header-cta" href="#/contacts">
          Связаться <ArrowUpRight size={17} />
        </a>
        <button className="menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div>
          <Logo light />
          <p>
            Современная фармацевтическая платформа для здоровья и
            технологической независимости Таджикистана.
          </p>
        </div>
        <div>
          <b>Навигация</b>
          {nav.slice(1).map(([name, route]) => (
            <a href={"#" + route} key={route}>
              {name}
            </a>
          ))}
        </div>
        <div>
          <b>Направления</b>
          <a href="#/production">Производство</a>
          <a href="#/quality">Система качества</a>
          <a href="#/products">Продукция</a>
          <a href="#/about">Карьера</a>
        </div>
        <div>
          <b>Контакты</b>
          <a href="mailto:info@rhazes.tj">info@rhazes.tj</a>
          <a href="#/contacts">Душанбе, Таджикистан</a>
          <div className="social">
            <a aria-label="Социальная сеть">in</a>
            <a aria-label="Социальная сеть">ig</a>
            <a aria-label="Telegram">
              <Send />
            </a>
          </div>
        </div>
      </div>
      <div className="copyright">
        <span>© 2026 РАЗЕС ФАРМА. Все права защищены.</span>
        <span>Качество, которому доверяют</span>
      </div>
    </footer>
  );
}

export function Layout({ children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const sections = [
        ...document.querySelectorAll("main > section, main > .stats"),
      ].slice(1);
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("section-reveal-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -7% 0px",
        },
      );

      sections.forEach((section, index) => {
        section.classList.add("section-reveal");
        section.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
        observer.observe(section);
      });

      window.__rhazesSectionObserver = observer;
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.__rhazesSectionObserver?.disconnect();
      delete window.__rhazesSectionObserver;
    };
  }, []);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
