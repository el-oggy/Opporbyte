"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./Brand";

const links = [
  { title: "How It Works", href: "/#how-it-works" },
  { title: "Features", href: "/#features" },
  { title: "Explore", href: "/#explore" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (
        !menu.current?.contains(event.target as Node) &&
        !toggle.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 760) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  return (
    <header className="site-header">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <nav className="navigation shell" aria-label="Main navigation">
        <Brand />
        <div className="desktop-links">
          {links.map((link) => (
            <a key={link.title} href={link.href}>
              {link.title}
            </a>
          ))}
        </div>
        <Link href="/onboarding" className="nav-cta">
          Get Started <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
        <button
          className="menu-toggle"
          ref={toggle}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        {open && (
          <div className="mobile-menu" id="mobile-menu" ref={menu}>
            {links.map((link) => (
              <a
                key={link.title}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.title}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            ))}
            <Link href="/onboarding" onClick={() => setOpen(false)}>
              Get Started
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
