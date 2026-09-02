import React, { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Send, X } from "lucide-react";
import { navigation as nav } from "../../data/siteContent.js";

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
  const path = (location.hash.slice(1) || "/").split("?")[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openContactForm = () => {
    sessionStorage.setItem("scroll-to-contact-form", "true");
    setOpen(false);

    if (path === "/contacts") {
      requestAnimationFrame(() => {
        const form = document.querySelector("#contact-form");
        if (form) {
          window.scrollTo({
            top: form.getBoundingClientRect().top + window.scrollY - 100,
            behavior: "smooth",
          });
        }
        sessionStorage.removeItem("scroll-to-contact-form");
      });
    }
  };

  return (
    <header className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}>
      <div className="navwrap">
        <Logo />
        <nav className={open ? "open" : ""}>
          {nav.map(([name, route]) => (
            <a
              className={path === route ? "active" : ""}
              href={route === "/contacts" ? "#/contacts?form=1" : "#" + route}
              onClick={
                route === "/contacts" ? openContactForm : () => setOpen(false)
              }
              key={route}
            >
              {name}
            </a>
          ))}
          <a
            className="mobile-cta"
            href="#/contacts?form=1"
            onClick={openContactForm}
          >
            Связаться с нами
          </a>
        </nav>
        <a
          className="header-cta"
          href="#/contacts?form=1"
          onClick={openContactForm}
        >
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
            <a
              href={route === "/contacts" ? "#/contacts?form=1" : "#" + route}
              key={route}
            >
              {name}
            </a>
          ))}
        </div>
        <div>
          <b>Направления</b>
          <a href="#/production">Производство</a>
          <a href="#/quality">Система качества</a>
          <a href="#/products">Продукция</a>
          <a href="#/career">Карьера</a>
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
