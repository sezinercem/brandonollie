"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { photoGroups, projectPhotos } from "@/lib/project-photos";

export function ProjectGallery({ service }: { service: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const groups = photoGroups.filter(g => service === "pressure-washing" ? g.id === "paving" : g.service === service);
  const photos = projectPhotos.filter(p => groups.some(g => g.id === p.group));
  const current = selected === null ? null : photos[selected];
  useEffect(() => { if (selected !== null && !dialog.current?.open) dialog.current?.showModal(); }, [selected]);
  const open = (id: number) => setSelected(photos.findIndex(p => p.id === id));
  const shift = (direction: number) => setSelected(i => i === null ? null : (i + direction + photos.length) % photos.length);
  const close = () => { dialog.current?.close(); setSelected(null); };
  const card = (id: number, label?: string) => {
    const p = projectPhotos.find(p => p.id === id)!;
    return <figure key={id}><button className="project-photo-button" onClick={() => open(id)} aria-label={`Enlarge: ${p.alt}`}><img src={p.thumb} srcSet={`${p.thumb} 560w, ${p.src} ${p.width}w`} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 28vw" width={p.width} height={p.height} alt={p.alt} loading="lazy" decoding="async" /></button><figcaption>{label || p.stage}</figcaption></figure>;
  };
  return <section className="project-section section-wrap" id="project-gallery">
    <div className="section-heading"><div><p className="eyebrow">GOLDKREST PROJECT PHOTOGRAPHS</p><h2>{service === "pressure-washing" ? "Patios & paths." : "See the work."}</h2></div><p>{service === "pressure-washing" ? "A look at the outdoor surfaces in our project collection. Talk to us about the right cleaning approach for yours." : "From preparation to the finished details. Explore our work below."}</p></div>
    {service === "landscaping" && <div className="project-comparisons">{[["Hedge reshaping",2,3],["New lawn installation",10,20],["Garden transformation",73,71]].map(([title,before,after]) => <article className="project-comparison" key={title}><h3>{title}</h3><div>{card(Number(before),"Before")}{card(Number(after),"After")}</div></article>)}</div>}
    {groups.map((g,i) => <details className="project-group" key={g.id} open={i === 0}><summary><span>{g.title}</span><span>{photos.filter(p=>p.group===g.id).length} photos <span aria-hidden="true">＋</span></span></summary><div className="project-grid">{photos.filter(p=>p.group===g.id).map(p=>card(p.id))}</div></details>)}
    <dialog ref={dialog} className="photo-dialog" aria-label="Project photograph viewer" onClose={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={e=>{if(e.key==='ArrowLeft')shift(-1);if(e.key==='ArrowRight')shift(1);}}>
      {current && <div className="photo-viewer"><div className="photo-viewer-bar"><p id="photo-caption">{current.alt} <span>({selected!+1} / {photos.length})</span></p><button onClick={close} aria-label="Close photograph" autoFocus><X aria-hidden="true" /></button></div><img src={current.src} width={current.width} height={current.height} alt={current.alt} /><div className="photo-viewer-controls"><button onClick={()=>shift(-1)}><ArrowLeft size={18} aria-hidden="true" /> Previous</button><button onClick={()=>shift(1)}>Next <ArrowRight size={18} aria-hidden="true" /></button></div></div>}
    </dialog>
  </section>;
}
