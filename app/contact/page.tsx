import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ArrowUpRight, Mail, Phone, Check } from "lucide-react";
import { pageMetadata } from "@/lib/metadata";
import { services } from "@/lib/content";
export const metadata = pageMetadata("Contact Us", "Talk to Goldkrest Group about your brickwork, landscaping or pressure washing project. Call 07394 633885 or email info@goldkrest.group.", "/contact");
export default async function Contact({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;
  const service = services.find(s => s.slug === params.service);
  const subject = service ? `${service.name} enquiry` : "Project enquiry";
  const email = `mailto:info@goldkrest.group?subject=${encodeURIComponent(subject)}`;
  return <>
    <section className="contact-hero section-wrap"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Contact us</span></div><p className="eyebrow"><span className="label-rule" />GOOD WORK STARTS HERE</p><h1>Let’s talk about<br /><span className="gold-text">your project.</span></h1><p className="hero-description">Have a project in mind? Big or small, we’d love to hear about it. Get in touch and let’s talk through the possibilities.</p></section>
    <section className="contact-content section-wrap"><ContactForm service={service?.name ?? ""} /><div className="contact-sidebar"><div className="contact-options"><a className="contact-option" href="tel:+447394633885"><Phone size={26} strokeWidth={1.2} aria-hidden="true" /><div><span className="eyebrow">GIVE US A CALL</span><h2>07394 633885</h2><p>A conversation is a good place to start.</p></div><ArrowUpRight size={24} aria-hidden="true" /></a><a className="contact-option" href={email}><Mail size={26} strokeWidth={1.2} aria-hidden="true" /><div><span className="eyebrow">SEND US AN EMAIL</span><h2>info@goldkrest.group</h2><p>{service ? `Let’s talk about your ${service.name.toLowerCase()} project.` : "Tell us a little about what you have in mind."}</p></div><ArrowUpRight size={24} aria-hidden="true" /></a><p className="contact-small">Email opens your email app. You can attach photographs of your project there.</p></div><aside className="enquiry-guide"><p className="eyebrow">MAKE THE FIRST STEP EASY</p><h2>A little detail<br />goes a long way.</h2><p>When you get in touch, it helps to include:</p><ul>{["The work you have in mind", "Your location and property type", "Your preferred timing", "A few photographs, if you have them"].map(item => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul></aside></div></section>
    <section className="contact-services section-wrap"><p className="eyebrow">NOT SURE WHERE TO START?</p><h2>Find the service for your space.</h2><div>{services.map(service => <Link key={service.slug} href={`/${service.slug}`}>{service.name}<ArrowUpRight size={20} aria-hidden="true" /></Link>)}</div></section>
  </>;
}
