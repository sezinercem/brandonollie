import { ProjectGallery } from "@/components/project-gallery";
import { projectPhotos } from "@/lib/project-photos";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, Check, Plus } from "lucide-react";
import { services } from "@/lib/content";

export function ContactBand() {
  return <section className="contact-band section-wrap"><div><p className="eyebrow">LET’S MAKE SOMETHING LAST</p><h2>Your next project<br />starts with a conversation.</h2></div><Link href="/contact" className="button button-gold">Let’s talk <ArrowUpRight size={19} aria-hidden="true" /></Link></section>;
}

export function ServicePage({ service }: { service: typeof services[number] }) {
  const hero = projectPhotos.find(p => p.id === (service.slug === "brickwork" ? 24 : service.slug === "landscaping" ? 8 : 34))!;
  return <>
    <section className="service-hero section-wrap"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>{service.name}</span></div><div className="service-hero-grid"><div><p className="eyebrow"><span className="label-rule" />{service.eyebrow}</p><h1>{service.heading.split("\n").map((line, index) => <span key={line} className={index ? "gold-text" : undefined}>{line}</span>)}</h1><p className="hero-description">{service.intro}</p><Link href={`/contact?service=${service.slug}`} className="button button-gold">Discuss your project <ArrowUpRight size={18} aria-hidden="true" /></Link></div><div className="service-photo"><img src={hero.src} alt={hero.alt} width={hero.width} height={hero.height} /></div></div><a className="scroll-link" href="#services">Explore the details <ArrowDown size={16} aria-hidden="true" /></a></section>
    <section id="services" className="services-detail section-wrap"><div className="section-heading"><p className="eyebrow">WHAT WE DO</p><h2>The detail makes<br />the difference.</h2></div><div className="detail-list">{service.items.map(([title, description], i) => <article className="detail-row" key={title}><span className="item-number">{String(i + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div><Check size={20} aria-hidden="true" /></article>)}</div></section>
    <ProjectGallery service={service.slug} />
    <section className="care-section section-wrap"><span className="asterisk" aria-hidden="true">✳</span><div><p className="eyebrow">THE GOLDKREST APPROACH</p><h2>{service.note}</h2><p>{service.detail}</p></div></section>
    <section className="faq-section section-wrap"><div><p className="eyebrow">GOOD TO KNOW</p><h2>A few useful details.</h2></div><div>{service.faqs.map(([question, answer]) => <details className="faq" key={question}><summary>{question}<Plus size={19} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>
    <section className="other-services section-wrap"><p className="eyebrow">EXPLORE OUR OTHER SERVICES</p><div>{services.filter(s => s.slug !== service.slug).map(s => <Link href={`/${s.slug}`} key={s.slug}><span>{s.name}</span><ArrowUpRight aria-hidden="true" /></Link>)}</div></section>
    <ContactBand />
  </>;
}
