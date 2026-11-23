import { useEffect, useMemo, useRef, useState } from 'react';
import { PROJECTS, FILTERS, SB2_MODS, FEATURED } from './data.js';
import { UI } from './i18n.js';

const BASE = import.meta.env.BASE_URL;
const asset = (path) => BASE + path.replace(/^\/+/, '');

const GITHUB = 'https://github.com/hubertdungen';
const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const fromUrl = () => {
  const k = decodeURIComponent(location.pathname.replace(/\//g, '') || location.hash.slice(1));
  return byId[k] ? k : null;
};
const nameOf = (p, lang) => (typeof p.name === 'string' ? p.name : p.name[lang]);
const counts = Object.fromEntries(
  FILTERS.map((f) => [f, f === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.kinds.includes(f)).length]),
);

function initialLang() {
  try {
    const saved = localStorage.getItem('dlf-lang');
    if (saved === 'en' || saved === 'pt') return saved;
  } catch { /* storage blocked */ }
  return (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

const ext = { target: '_blank', rel: 'noopener noreferrer' };

/* ---------- visuals for projects without screenshots ---------- */

function Spools() {
  // Illustration only: colours named the way Bobina parses them.
  const spools = [
    ['PLA Silk Red', '#c8323c'],
    ['PETG Matte Black', '#22272b'],
    ['PLA Pastel Mint Green', '#9fdcc0'],
    ['ASA Azure', '#3b8fd9'],
  ];
  return (
    <div className="vis vis-spools" aria-hidden="true">
      {spools.map(([label, c], i) => (
        <div className="spool" key={label} style={{ '--c': c, '--i': i }}>
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" className="sp-rim" />
            <circle cx="32" cy="32" r="24" fill={c} />
            {[20, 16, 12].map((r) => <circle key={r} cx="32" cy="32" r={r} className="sp-wind" />)}
            <circle cx="32" cy="32" r="8" className="sp-hub" />
            <circle cx="32" cy="32" r="3" className="sp-hole" />
          </svg>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Screens() {
  return (
    <div className="vis vis-screens" aria-hidden="true">
      <div className="mon-row">
        {[['LEFT', 'x −2560'], ['PRIMARY', 'x 0'], ['RIGHT', 'x 2560']].map(([n, x]) => (
          <div className="mon" key={n}>
            <b>{n}</b>
            <span>2560 × 1440</span>
            <i>{x}</i>
          </div>
        ))}
        <div className="mon-span"><span>7680 × 1440</span></div>
      </div>
    </div>
  );
}

function Console() {
  // Excerpt of FlexScript's original menu output.
  return (
    <div className="vis vis-console" aria-hidden="true">
      <pre>{`#############################################
#      Stellaris MPP Mod Customization      #
#############################################
'vanilla'  default game settings
'standard' mod default presets
'custom'   enter your preferred settings

ETHOS_MAX_POINTS              3 → 5
GOVERNMENT_CIVIC_POINTS_BASE  2 → 5`}<span className="caret">▌</span></pre>
    </div>
  );
}

function Classified({ t }) {
  return (
    <div className="vis vis-classified" aria-hidden="true">
      <div className="cl-stamp">{t.modal.comingSoon}</div>
      <div className="cl-title">POLISTRAT</div>
      <div className="cl-lines">
        <span>ENGINE // UNITY</span>
        <span>{t.modal.longHaul}</span>
      </div>
    </div>
  );
}

function Visual({ p, t, lang, large }) {
  if (p.shots.length) {
    const s = p.shots[0];
    return (
      <img
        src={`${BASE}shots/${s.file}-720.webp`}
        srcSet={s.large ? `${BASE}shots/${s.file}-720.webp 720w, ${BASE}shots/${s.file}-1440.webp 1440w` : undefined}
        sizes={large ? '(min-width: 1080px) 640px, 100vw' : '(min-width: 1080px) 400px, (min-width: 720px) 50vw, 100vw'}
        alt={s.alt[lang]}
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (p.visual === 'spools') return <Spools />;
  if (p.visual === 'screens') return <Screens />;
  if (p.visual === 'console') return <Console />;
  return <Classified t={t} />;
}

const visualTag = (p, t) =>
  p.visual === 'spools' ? t.modal.illustration : p.visual === 'screens' ? t.modal.diagram : null;

/* ---------- logo ---------- */

function Mark({ className }) {
  return <img className={className} src={asset('/brand/dlforge-mark.svg')} alt="DL Forge" width="891" height="423" />;
}

/* ---------- header ---------- */

function Header({ t, lang, setLang }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const close = () => setOpen(false);
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="wrap header-row">
        <a className="brand" href="#top" onClick={close}><Mark /></a>
        <nav id="site-nav" className={`nav${open ? ' is-open' : ''}`} aria-label="Main">
          {Object.entries(t.nav).map(([k, v]) => (
            <a key={k} href={`#${k}`} onClick={close}>{v}</a>
          ))}
          <a className="nav-git" href={GITHUB} {...ext} onClick={close}>GitHub ↗</a>
        </nav>
        <div className="header-tools">
          <div className="lang" role="group" aria-label={t.langLabel}>
            {['en', 'pt'].map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l === 'pt' ? 'pt-PT' : 'en'}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{t.menu}</span>
            <span className="burger" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- hero with level-select ---------- */

function Hero({ t, lang, openProject }) {
  const [active, setActive] = useState(FEATURED[0]);
  const p = byId[active];
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-heat" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="hero-title" className="hero-title">
            <span className="h1-lead">{t.h1[0]}</span>
            <span className="h1-line">{t.h1[1]}</span>
            <span className="h1-line h1-outline">{t.h1[2]}</span>
            <span className="h1-line">{t.h1[3]}<em>{t.h1[4]}</em></span>
          </h1>
          <p className="lede">{t.lede}</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#work">{t.ctaWork}</a>
            <a className="btn btn-ghost" href={GITHUB} {...ext}>{t.ctaGit} ↗</a>
          </div>
          <p className="hud-line" aria-label={t.hud(counts)}>
            <span aria-hidden="true">{t.hud(counts)}</span>
          </p>
        </div>

        <div className="select-panel">
          <div className="select-head">
            <span>{t.selectTitle}</span>
            <span className="select-idx" aria-hidden="true">
              {String(FEATURED.indexOf(active) + 1).padStart(2, '0')}/{String(FEATURED.length).padStart(2, '0')}
            </span>
          </div>
          <button type="button" className="select-preview" onClick={() => openProject(active)} aria-label={`${t.open}: ${nameOf(p, lang)}`}>
            <span className="select-media" key={active}>
              <Visual p={p} t={t} lang={lang} large />
              <span className="frame" aria-hidden="true"><i /><i /><i /><i /></span>
            </span>
            {/* all captions share one grid cell so the panel height is the tallest one and never shifts the list under the cursor */}
            <span className="select-captions">
              {FEATURED.map((id) => {
                const f = byId[id];
                return (
                  <span key={id} className={'select-caption' + (id === active ? ' is-on' : '')} aria-hidden={id === active ? undefined : 'true'}>
                    <span className="kind-chip">{f.kinds.map((k) => t.kinds[k]).join(' / ')}</span>
                    <strong>{nameOf(f, lang)}</strong>
                    <span>{f.tagline[lang]}</span>
                  </span>
                );
              })}
            </span>
          </button>
          <ul className="select-list" aria-describedby="select-hint">
            {FEATURED.map((id, i) => {
              const f = byId[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={id === active ? 'is-active' : ''}
                    aria-current={id === active ? 'true' : undefined}
                    onMouseEnter={() => setActive(id)}
                    onFocus={() => setActive(id)}
                    onClick={() => openProject(id)}
                  >
                    <span className="sl-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="sl-name">{nameOf(f, lang)}</span>
                    <span className="sl-kind">{t.kinds[f.kinds[0]]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p id="select-hint" className="select-hint">{t.selectHint}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- divisions ---------- */

function Split({ t }) {
  return (
    <section className="split" aria-labelledby="split-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{t.splitEyebrow}</p>
        <h2 id="split-title" className="section-title" data-reveal>{t.splitTitle}</h2>
        <p className="section-lede" data-reveal>{t.splitLede}</p>
        <a className="div-card div-parent" href="https://dungenlabs.com" {...ext} data-reveal>
          <img src={asset('/brand/dungenlabs-color.svg')} alt="DungenLabs" width="318" height="165" className="div-mark dl" />
          <p>{t.dlText}</p>
          <span className="div-go">{t.visit} dungenlabs.com ↗</span>
        </a>
        <div className="split-grid">
          <a className="div-card" href="https://dlx.dungenlabs.com" {...ext} data-reveal>
            <img src={asset('/brand/dlx-mark.svg')} alt="DL X" width="745" height="513" className="div-mark dlx" />
            <p>{t.dlxText}</p>
            <span className="div-go">{t.visit} dlx.dungenlabs.com ↗</span>
          </a>
          <div className="div-card is-here" data-reveal>
            <Mark className="div-mark forge" />
            <p>{t.forgeText}</p>
            <span className="div-go here">◆ {t.youAreHere}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- portfolio ---------- */

function Work({ t, lang, openProject }) {
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => PROJECTS.filter((p) => filter === 'all' || p.kinds.includes(filter)), [filter]);
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="work-head">
          <div>
            <p className="eyebrow" data-reveal>{t.workEyebrow}</p>
            <h2 id="work-title" className="section-title" data-reveal>{t.workTitle}</h2>
            <p className="section-lede" data-reveal>{t.workLede}</p>
          </div>
          <div className="filters" role="group" aria-label={t.filterLabel}>
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {t.filters[f]} <span className="count">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">{t.showing(list.length)}</p>
        <ul className="grid" key={filter}>
          {list.map((p, i) => {
            const tag = visualTag(p, t);
            return (
              <li key={p.id} className={`card${['grimorio', 'sb2', 'multiscreen'].includes(p.id) ? ' wide' : ''}`} style={{ '--i': i }}>
                <div className="card-media">
                  <Visual p={p} t={t} lang={lang} large={['grimorio', 'sb2', 'multiscreen'].includes(p.id)} />
                  <span className="kinds" aria-hidden="true">
                    {p.kinds.map((k) => <span key={k} className={`kind-chip k-${k}`}>{t.kinds[k]}</span>)}
                  </span>
                  {tag && <span className="vis-tag">{tag}</span>}
                </div>
                <div className="card-body">
                  <div className="card-title">
                    {p.icon ? <img src={asset(p.icon)} alt="" width="36" height="36" className="card-icon" loading="lazy" /> : <span className="card-icon mono" aria-hidden="true">{nameOf(p, lang).slice(0, 2)}</span>}
                    <h3>
                      <button type="button" className="card-hit" onClick={() => openProject(p.id)} aria-haspopup="dialog">
                        {nameOf(p, lang)}
                      </button>
                    </h3>
                  </div>
                  <p className="card-tag">{p.tagline[lang]}</p>
                  <p className="card-meta">
                    <span className="sr-only">{t.kinds[p.kinds[0]]}. </span>
                    {p.status[lang]}
                  </p>
                  <p className="card-meta card-plat">{p.type[lang]} <span aria-hidden="true">/</span> {p.platforms[lang]}</p>
                  <span className="card-open" aria-hidden="true">{t.open} →</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- SB2 loadout ---------- */

function Loadout({ t, lang, openProject }) {
  return (
    <section className="loadout" id="loadout" aria-labelledby="loadout-title">
      <div className="loadout-bg" aria-hidden="true" />
      <div className="wrap">
        <div className="loadout-head">
          <div>
            <p className="eyebrow" data-reveal>{t.loadEyebrow}</p>
            <h2 id="loadout-title" className="section-title" data-reveal>{t.loadTitle}</h2>
            <p className="section-lede" data-reveal>{t.loadLede(SB2_MODS.length)}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => openProject('sb2')} aria-haspopup="dialog">{t.loadCta}</button>
        </div>
        <ol className="slots">
          {SB2_MODS.map((m, i) => (
            <li key={m.name} className={m.core ? 'slot is-core' : 'slot'} style={{ '--i': i }}>
              <a href={m.href} {...ext}>
                <span className="slot-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {m.core && <span className="slot-core">{t.core}</span>}
                <strong>{m.name}</strong>
                <span className="slot-line">{m.line[lang]}</span>
                <span className="slot-bar" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- method ---------- */

function Method({ t }) {
  return (
    <section className="method" id="method" aria-labelledby="method-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>{t.methodEyebrow}</p>
        <h2 id="method-title" className="section-title" data-reveal>{t.methodTitle}</h2>
        <ol className="method-list">
          {t.method.map(([h, p], i) => (
            <li key={i} data-reveal>
              <span className="m-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- partners ---------- */

function Partners({ t }) {
  return (
    <section className="partners" id="partners" aria-labelledby="partners-title">
      <div className="wrap">
        <p className="eyebrow">{t.partnersEyebrow}</p>
        <h2 className="partners-title" id="partners-title">{t.partnersTitle}</h2>
        <p className="partners-intro">{t.partnersIntro}</p>
        <ul className="partner-cards">
          <li>
            <a href="https://z89develop.pt" {...ext} aria-label="Z89 Develop">
              <img src={asset('/partners/z89.png')} alt="" width="72" height="72" loading="lazy" />
              <span className="partner-word">Z89 <b>Develop</b></span>
            </a>
            <div className="partner-copy">
              <p className="partner-role">{t.z89Role}</p>
              <p className="partner-line">{t.z89Line}</p>
              <a className="partner-visit" href="https://z89develop.pt" {...ext}>{t.partnerVisit} Z89 <span aria-hidden="true">↗</span></a>
            </div>
          </li>
          <li>
            <a href="https://hexrig.com" {...ext} aria-label="Hexrig">
              <img className="hexrig-wordmark" src={asset('/partners/hexrig-wordmark.png')} alt="Hexrig" width="436" height="100" loading="lazy" />
            </a>
            <div className="partner-copy">
              <p className="partner-role">{t.hexrigRole}</p>
              <p className="partner-line">{t.hexrigLine}</p>
              <a className="partner-visit" href="https://hexrig.com" {...ext}>{t.partnerVisit} Hexrig <span aria-hidden="true">↗</span></a>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer({ t, lang, setLang }) {
  return (
    <footer className="site-footer">
      <div className="wrap foot-grid">
        <div>
          <Mark className="foot-mark" />
          <p className="foot-tag">{t.footTag}</p>
        </div>
        <nav aria-label={t.eco}>
          <h2 className="foot-h">{t.eco}</h2>
          <ul>
            <li><a href="https://dungenlabs.com" {...ext}>{t.ecoLinks.dl} ↗</a></li>
            <li><a href="https://dlx.dungenlabs.com" {...ext}>{t.ecoLinks.dlx} ↗</a></li>
            <li><a href="https://www.hubertdungen.com" {...ext}>{t.ecoLinks.hd} ↗</a></li>
            <li><a href={`https://dungenlabs.com/legal${lang === 'pt' ? '#pt' : ''}`} {...ext}>{t.legal} ↗</a></li>
            <li><a href={`https://dungenlabs.com/privacy${lang === 'pt' ? '#pt' : ''}`} {...ext}>{t.privacy} ↗</a></li>
          </ul>
        </nav>
        <nav aria-label={t.code}>
          <h2 className="foot-h">{t.code}</h2>
          <ul>
            <li><a href={GITHUB} {...ext}>github.com/hubertdungen ↗</a></li>
            <li>
              <button type="button" className="linkish" onClick={() => setLang(lang === 'en' ? 'pt' : 'en')} lang={lang === 'en' ? 'pt-PT' : 'en'}>
                {lang === 'en' ? 'Ver em português' : 'View in English'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="wrap foot-base">
        <span>© {new Date().getFullYear()} {t.rights}</span>
        <a href="#top">{t.top} ↑</a>
      </div>
    </footer>
  );
}

/* ---------- case file modal ---------- */

function CaseModal({ id, onClose, t, lang }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  const p = id ? byId[id] : null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) {
      setIdx(0);
      d.showModal();
      d.scrollTop = 0;
    }
    if (!p && d.open) d.close();
  }, [p]);

  if (!p) return <dialog ref={ref} className="case" onClose={onClose} />;

  const shots = p.shots;
  const n = shots.length;
  const cur = Math.min(idx, Math.max(n - 1, 0));
  const go = (d) => setIdx((i) => (Math.min(i, n - 1) + d + n) % n);
  const s = shots[cur];
  const m = t.modal;
  const tag = visualTag(p, t);

  return (
    <dialog
      ref={ref}
      className="case"
      aria-labelledby="case-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}
      onKeyDown={(e) => {
        if (n > 1 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest('a')) {
          e.preventDefault();
          go(e.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className="case-inner">
        <header className="case-head">
          <div className="case-id">
            {p.icon && <img src={asset(p.icon)} alt="" width="44" height="44" />}
            <div>
              <p className="eyebrow">{p.kinds.map((k) => t.kinds[k]).join(' / ')}</p>
              <h2 id="case-title">{nameOf(p, lang)}</h2>
            </div>
          </div>
          <button type="button" className="case-close" onClick={() => ref.current.close()} autoFocus>
            <span className="sr-only">{m.close}</span>
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <figure className="case-media">
          <div className="case-stage">
            {n ? (
              <img
                key={s.file}
                src={`${BASE}shots/${s.file}-720.webp`}
                srcSet={s.large ? `${BASE}shots/${s.file}-720.webp 720w, ${BASE}shots/${s.file}-1440.webp 1440w` : undefined}
                sizes="(min-width: 1000px) 920px, 100vw"
                alt={s.alt[lang]}
                className={s.large ? '' : 'is-narrow'}
              />
            ) : (
              <Visual p={p} t={t} lang={lang} large />
            )}
            {tag && <span className="vis-tag">{tag}</span>}
            {n > 1 && (
              <>
                <button type="button" className="g-nav prev" onClick={() => go(-1)}><span className="sr-only">{m.prev}</span><span aria-hidden="true">‹</span></button>
                <button type="button" className="g-nav next" onClick={() => go(1)}><span className="sr-only">{m.next}</span><span aria-hidden="true">›</span></button>
              </>
            )}
          </div>
          {n > 0 && (
            <figcaption>
              {n > 1 && <span className="g-count">{m.image(cur + 1, n)} · </span>}
              {s.alt[lang]}
            </figcaption>
          )}
          {n > 1 && (
            <div className="thumbs">
              {shots.map((x, i) => (
                <button key={x.file} type="button" aria-pressed={i === cur} onClick={() => setIdx(i)}>
                  <img src={`${BASE}shots/${x.file}-720.webp`} alt="" loading="lazy" />
                  <span className="sr-only">{x.alt[lang]}</span>
                </button>
              ))}
            </div>
          )}
        </figure>

        <div className="case-body">
          <div className="case-main">
            <p className="case-tagline">{p.tagline[lang]}</p>
            <h3>{m.what}</h3>
            <p>{p.summary[lang]}</p>
            <h3>{m.why}</h3>
            <p>{p.problem[lang]}</p>
            {p.features[lang].length > 0 && (
              <>
                <h3>{m.does}</h3>
                <ul className="feat">
                  {p.features[lang].map((f) => <li key={f}>{f}</li>)}
                </ul>
              </>
            )}
            {p.roster && (
              <>
                <h3>{m.mods}</h3>
                <ul className="roster">
                  {SB2_MODS.map((x) => (
                    <li key={x.name}><a href={x.href} {...ext}><b>{x.name}</b> <span>{x.line[lang]}</span></a></li>
                  ))}
                </ul>
              </>
            )}
            {p.note && (
              <>
                <h3>{m.notes}</h3>
                <p className="case-note">{p.note[lang]}</p>
              </>
            )}
          </div>
          <aside className="case-side">
            <dl>
              <div><dt>{m.status}</dt><dd>{p.status[lang]}</dd></div>
              <div><dt>{m.type}</dt><dd>{p.type[lang]}</dd></div>
              <div><dt>{m.platforms}</dt><dd>{p.platforms[lang]}</dd></div>
              <div><dt>{m.licence}</dt><dd>{p.licence[lang]}</dd></div>
              <div><dt>{m.stack}</dt><dd className="stack">{p.stack.map((x) => <span key={x}>{x}</span>)}</dd></div>
            </dl>
            <h3>{m.links}</h3>
            {p.links.length ? (
              <ul className="case-links">
                {p.links.map((l) => (
                  <li key={l.href}><a className="btn btn-ghost btn-sm" href={l.href} {...ext}>{l.label[lang]} ↗</a></li>
                ))}
              </ul>
            ) : (
              <p className="case-note">{m.noLinks}</p>
            )}
          </aside>
        </div>
      </div>
    </dialog>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [lang, setLangState] = useState(initialLang);
  const [openId, setOpenId] = useState(fromUrl);
  const t = UI[lang];

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem('dlf-lang', l); } catch { /* storage blocked */ }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';
    document.title = openId ? (lang === 'en' && byId[openId].seo?.title) || `${nameOf(byId[openId], lang)} · DL Forge` : lang === 'pt'
      ? 'DL Forge · Software, jogos e mods da DungenLabs'
      : 'DL Forge · Software, games and mods by DungenLabs';
  }, [lang, openId]);

  // Deep links: /grimorio/ (static page from scripts/prerender.mjs) or the old #grimorio open that case file;
  // the back button closes it.
  useEffect(() => {
    const on = () => setOpenId(fromUrl());
    addEventListener('popstate', on);
    addEventListener('hashchange', on);
    return () => { removeEventListener('popstate', on); removeEventListener('hashchange', on); };
  }, []);

  const openProject = (id) => {
    history.pushState(null, '', `/${id}/`);
    setOpenId(id);
  };
  const closeProject = () => {
    if (fromUrl()) history.replaceState(null, '', '/' + location.search);
    setOpenId(null);
  };

  // Reveal-on-scroll; content stays visible if this never runs. Re-queries the DOM each time so
  // elements re-created by a language switch (keyed lists) are never left hidden.
  useEffect(() => {
    document.documentElement.classList.add('reveal-ready');
    const sweep = () => document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.95) el.classList.add('in'); });
    sweep();
    addEventListener('scroll', sweep, { passive: true });
    addEventListener('hashchange', sweep);
    addEventListener('resize', sweep);
    const tm = setInterval(sweep, 500);
    return () => { removeEventListener('scroll', sweep); removeEventListener('hashchange', sweep); removeEventListener('resize', sweep); clearInterval(tm); };
  }, [lang]);

  return (
    <>
      <a className="skip" href="#main">{t.skip}</a>
      <Header t={t} lang={lang} setLang={setLang} />
      <main id="main">
        <Hero t={t} lang={lang} openProject={openProject} />
        <Split t={t} />
        <Work t={t} lang={lang} openProject={openProject} />
        <Loadout t={t} lang={lang} openProject={openProject} />
        <Method t={t} />
        <Partners t={t} />
      </main>
      <Footer t={t} lang={lang} setLang={setLang} />
      <CaseModal id={openId} onClose={closeProject} t={t} lang={lang} />
    </>
  );
}
