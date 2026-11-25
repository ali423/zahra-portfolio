'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { b, categories, experience, projects, text, type Lang, type Project } from '@/lib/content';
import { captions, featuredOrder, variants } from '@/lib/studio';

type IconKind = 'moon' | 'sun' | 'down' | 'next' | 'prev' | 'plus';
function Icon({ kind }: {kind: IconKind}) {
  const lines: Record<IconKind, React.ReactNode> = {
    moon: <path d="M20 15A8.4 8.4 0 0 1 9 4a8.5 8.5 0 1 0 11 11Z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,
    down:<path d="M12 3v17m-7-7 7 7 7-7"/>,next:<path d="m9 5 7 7-7 7"/>,prev:<path d="m15 5-7 7 7 7"/>,plus:<path d="M4 12h16m-8-8v16"/>
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{lines[kind]}</svg>;
}

const fmt = (i:number, lang:Lang) => i.toLocaleString(lang==='fa'?'fa-IR':'en-US',{minimumIntegerDigits:2});
function Gallery({ project, lang }: {project: Project; lang: Lang}) {
  const plates = useMemo(() => variants(project.id), [project.id]);
  const frame = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [requested, setRequested] = useState(0);
  const [shown, setShown] = useState({current: 0, previous: 0});
  const [failed, setFailed] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const count = plates.length;
  const title = project.title[lang];

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) { setNear(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, {rootMargin: '850px 0px'});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near && requested === 0) return;
    const next = frame.current?.querySelector<HTMLImageElement>(`[data-index="${requested}"] img`);
    if (!next) return;
    let live = true;
    async function reveal(img: HTMLImageElement) {
      try { await img.decode(); } catch {
        if (!img.complete || !img.naturalWidth) {
          if (live) setFailed(requested);
          return;
        }
      }
      if (!live) return;
      // Commit only after the incoming layer has pixels and its starting style exists.
      img.parentElement!.getBoundingClientRect();
      setReady(true);
      setFailed(null);
      setShown(old => old.current === requested ? old : {current: requested, previous: old.current});
    }
    void reveal(next);
    return () => { live = false; };
  }, [near, requested]);

  const mounted = new Set([shown.current, shown.previous, requested]);
  if (near) {
    mounted.add((shown.current + 1) % count);
    mounted.add((shown.current + count - 1) % count);
  }
  const change = (step: number) => setRequested(index => (index + step + count) % count);

  return <div className="specimen" ref={frame}>
    <div className="plate-stage" data-ready={ready ? "yes" : undefined}>
      {plates.map((plate, index) => mounted.has(index) && (
        <div key={plate.src} className="plate" data-index={index}
          data-active={index === shown.current} aria-hidden={index !== shown.current}>
          <img src={plate.src} className={plate.documentary ? 'photo-print' : undefined}
            decoding="async" loading={near || index === requested && requested !== 0 ? 'eager' : 'lazy'}
            alt={index === shown.current ? title+' · '+fmt(index+1,lang) : ''}/>
        </div>
      ))}
    </div>
    {count > 1 && <div className="pager" dir="ltr">
      <button onClick={() => change(-1)} aria-label={text[lang].prev+' · '+title}><Icon kind="prev"/></button>
      <span aria-live="polite">{fmt(shown.current+1,lang)} / {fmt(count,lang)}</span>
      <button onClick={() => change(1)} aria-label={text[lang].next+' · '+title}><Icon kind="next"/></button>
    </div>}
    {failed === requested && <small role="status">{b('Image unavailable','تصویر بارگیری نشد')[lang]}</small>}
  </div>;
}

function Study({ project, lang, index }: {project:Project;lang:Lang;index:number}) {
  const category=categories.find(c=>c.id===project.category)!;
  const [name, variant] = project.title[lang].split(' · ');
  const t=text[lang];
  return <article id={project.id} className={'study '+(index%2?'reverse':'')+' study-'+project.category} aria-labelledby={'name-'+project.id}>
    <Gallery project={project} lang={lang}/>
    <div className="study-copy">
      <small className="discipline">{category.label[lang]}</small>
      <h2 id={'name-'+project.id}>
        <span className="project-name">{name}</span>
        {variant && <span className="project-variant">{' '}{variant}</span>}
      </h2>
      <p>{project.description[lang]}</p>
      <details className="technical"><summary>{b('Project notes','یادداشت پروژه')[lang]}<Icon kind="plus"/></summary>
        <p>{project.review?<mark>{project.detail[lang]}</mark>:project.detail[lang]}</p>
        {!!project.facts.length && <dl>{project.facts.map(f=><div key={f.label.en}><dt>{f.label[lang]}</dt><dd>{f.value[lang]}</dd></div>)}</dl>}
        {project.source?.length && <details className="sheets"><summary>{t.source}<Icon kind="plus"/></summary>
          {project.source.map(n=><img key={n} loading="lazy" src={'/images/pack-page-'+String(n).padStart(2,'0')+'.webp'} alt={t.source+' '+fmt(n,lang)} width="1800" height="1013"/>)}
        </details>}
      </details>
    </div>
  </article>;
}

export default function Portfolio(){
  const atmosphere = useRef<HTMLDivElement>(null);
  const [lang,setLang]=useState<Lang>('fa');
  const [dark,setDark]=useState(false);
  const [paint,setPaint]=useState(false);
  const t=text[lang];
  useEffect(()=>{
    setLang(document.documentElement.lang==='en'?'en':'fa');
    setDark(document.documentElement.dataset.theme==='dark');
  },[]);
  useEffect(()=>{
    const scrollLinked = CSS.supports('animation-timeline: view()') && CSS.supports('animation-range: entry 0% entry 80%');
    if (scrollLinked || !('IntersectionObserver' in window)) return;
    const parts = document.querySelectorAll<HTMLElement>('.specimen, .study-copy');
    const observer = new IntersectionObserver(entries => {
      for (const {target, isIntersecting} of entries) {
        if (!isIntersecting) continue;
        (target as HTMLElement).dataset.reveal = 'visible';
        observer.unobserve(target);
      }
    }, {threshold: .04});
    parts.forEach(part => {
      if (part.dataset.reveal === 'visible') return;
      // A restored scroll position may already be showing this part.
      const box = part.getBoundingClientRect();
      part.dataset.reveal = box.top < innerHeight && box.bottom > 0 ? 'visible' : 'waiting';
      observer.observe(part);
    });
    return () => observer.disconnect();
  }, [paint]);

  useEffect(() => {
    if (!atmosphere.current) return;
    const layer: HTMLDivElement = atmosphere.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function update() {
      frame = 0;
      const phase = window.scrollY / Math.max(window.innerHeight, 500);
      layer.style.transform = reduced.matches ? '' :
        `translate3d(${16 * Math.sin(phase * .63)}px, ${24 * Math.sin(phase * .87)}px, 0)`;
    }
    function schedule() {
      if (!frame && !reduced.matches) frame = requestAnimationFrame(update);
    }
    addEventListener('scroll', schedule, {passive: true});
    reduced.addEventListener('change', update);
    update();
    return () => {
      removeEventListener('scroll', schedule);
      reduced.removeEventListener('change', update);
      cancelAnimationFrame(frame);
    };
  }, []);
  function language(next:Lang){
    setLang(next);document.documentElement.lang=next;document.documentElement.dir=next==='fa'?'rtl':'ltr';
    try{localStorage.setItem('zg-language',next);}catch{}
    const u=new URL(location.href);u.searchParams.set('lang',next);history.replaceState(null,'',u);
  }
  function theme(){
    const v=!dark;setDark(v);document.documentElement.dataset.theme=v?'dark':'light';
    try{localStorage.setItem('zg-theme',v?'dark':'light');}catch{}
  }
  useEffect(()=>{document.title=lang==='fa'?'زهرا گودرزی‌راد | طراحی صنعتی':'Zahra Goudarzi Rad | Industrial Design';},[lang]);
  return <main>
    <div className="atmosphere" ref={atmosphere} aria-hidden="true"/>
    <div className="folio">
      <div className="topline">
        <span className="autograph" aria-label="Zahra Goudarzi Rad" dir="ltr">Z<span>g</span><i>.</i></span>
        <div className="preferences" dir="ltr">
          <button className="lang" lang={lang==='fa'?'en':'fa'} aria-label={lang==='fa'?'English':'فارسی'} onClick={()=>language(lang==='fa'?'en':'fa')}>{lang==='fa'?'EN':'فا'}</button>
          <i aria-hidden="true"/><button aria-label={dark?t.light:t.dark} title={dark?t.light:t.dark} onClick={theme}><Icon kind={dark?'sun':'moon'}/></button>
        </div>
      </div>
      <section className="opening" aria-labelledby="designer">
        <div className="intro">
          <p className="role">{b('Industrial designer','طراح صنعتی')[lang]}</p>
          <h1 id="designer"><span className="given-name">{b('Zahra','زهرا')[lang]}</span>{' '}<span className="family-name">{b('Goudarzi Rad','گودرزی‌راد')[lang]}</span></h1>
          <p className="bio">{captions.intro[lang]}</p>
          <a className="browse" href="#studies"><Icon kind="down"/>{b('Selected work','آثار منتخب')[lang]}</a>
        </div>
        <figure className="designer-portrait">
          <img src="/images/zahra-print-960.webp"
            srcSet="/images/zahra-print-480.webp 480w, /images/zahra-print-960.webp 960w"
            sizes="(max-width: 720px) 65vw, (max-width: 1200px) 42vw, 520px"
            width="960" height="1234" alt={b('Portrait of Zahra Goudarzi Rad','پرترهٔ زهرا گودرزی‌راد')[lang]}
            fetchPriority="high" />
        </figure>
      </section>
      <div id="studies">{featuredOrder.map((id,i)=><Study key={id} project={projects.find(p=>p.id===id)!} lang={lang} index={i}/>)}</div>
      <section className="endmatter">
        <details className="profile"><summary>{b('Background and credentials','سوابق و مدارک')[lang]}<Icon kind="plus"/></summary>
          <div className="record"><div><h3>{t.education1}</h3><p>{t.university} · {t.educationDate}</p><p>{t.diploma}</p><p>{t.rank}</p><mark>{t.degreeReview}</mark></div>
            <div><h3>{t.languageTitle}</h3><p>{t.languageLevel}</p><mark>{t.languageReview}</mark></div>
            <div><h3>{b('Experience','تجربهٔ کاری')[lang]}</h3>{experience.map(e=><p key={e.title.en}>{e.title[lang]} · {e.role[lang]}<br/>{e.review?<mark>{e.years[lang]}</mark>:e.years[lang]}</p>)}</div>
            <div><h3>{t.skills}</h3><p dir="ltr">Illustrator · Photoshop · SketchUp · AutoCAD · Rhino · 3ds Max</p><a href="/documents/resume.pdf" download>{t.resume} ↓</a><p><mark>{t.oldResume}</mark></p><a href="/documents/packaging-portfolio.pdf" download>{t.downloadPortfolio} ↓</a></div>
            <div><h3>{t.contact}</h3><mark>{t.emailMissing}</mark></div>
          </div>
        </details>
        <button className="paint-toggle" aria-expanded={paint} aria-controls="paintings" onClick={()=>setPaint(v=>!v)}>{b('Paintings and illustrations','نقاشی و تصویرسازی')[lang]}<Icon kind={paint?'down':'plus'}/></button>
        <div id="paintings">{paint&&projects.filter(p=>p.category==='painting').map((p,i)=><Study key={p.id} project={p} lang={lang} index={i}/>)}</div>
      </section>
    </div>
  </main>;
}
