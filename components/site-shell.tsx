"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X, Pause, Play } from "lucide-react";

const links = [["/", "Home"], ["/brickwork", "Brickwork"], ["/landscaping", "Landscaping"], ["/pressure-washing", "Pressure washing"], ["/contact", "Contact us"]];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  return <header className="site-header">
    <Link href="/" className="wordmark" aria-label="Goldkrest Group home"><img src="/images/goldkrest-brand.jpeg" width={1600} height={1127} alt="Goldkrest Group" /></Link>
    <button className="menu-toggle" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav id="primary-navigation" aria-label="Main navigation" className={open ? "navigation is-open" : "navigation"} onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}>
      {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)} className={href === "/contact" ? "nav-contact" : undefined}>{label}{href === "/contact" && <ArrowUpRight size={16} aria-hidden="true" />}</Link>)}
    </nav>
  </header>;
}

export function AnimatedBackground() {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener("change", sync);
    try { setPaused(localStorage.getItem("goldkrest-motion") === "paused"); } catch { /* Preference storage is optional. */ }
    return () => media.removeEventListener("change", sync);
  }, []);
  const stopped = paused || reduced;
  return <>
    <div className={`ambient-background${stopped ? " motion-paused" : ""}`} aria-hidden="true"><div className="ambient-grid" /></div>
    <button className="motion-control" aria-label={reduced ? "Background motion disabled by your device settings" : paused ? "Play background animation" : "Pause background animation"} aria-pressed={stopped} disabled={reduced} onClick={() => { const value = !paused; setPaused(value); try { localStorage.setItem("goldkrest-motion", value ? "paused" : "playing"); } catch { /* Optional preference. */ } }}>{stopped ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}<span>{stopped ? "Motion off" : "Pause motion"}</span></button>
  </>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-top"><Link className="footer-brand" href="/"><img src="/images/goldkrest-brand.jpeg" width={1600} height={1127} alt="Goldkrest Group" /></Link><p>Care in every detail.<br />A golden standard.</p><div className="footer-contact"><a href="tel:+447394633885">07394 633885</a><a href="mailto:info@goldkrest.group">info@goldkrest.group</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Goldkrest Group</span><nav aria-label="Footer navigation">{links.slice(1).map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav><a href="#top">Back to top ↑</a></div></footer>;
}
