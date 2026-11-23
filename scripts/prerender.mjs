// After `vite build`: one static page per project at /<id>/ (own title, description, Open Graph and
// JSON-LD, plus the case text inside #root for crawlers; React replaces it on load), and the sitemap.
import fs from 'node:fs';
import { PROJECTS } from '../src/data.js';

const SITE = 'https://dlforge.dungenlabs.com';
const shell = fs.readFileSync('dist/index.html', 'utf8');
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nameOf = (p) => (typeof p.name === 'string' ? p.name : p.name.en);
const meta = (html, attr, key, val) =>
  html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(val)}$2`);

for (const p of PROJECTS) {
  const name = nameOf(p);
  const url = `${SITE}/${p.id}/`;
  const title = p.seo?.title || `${name} · ${p.tagline.en.replace(/\.$/, '')} · DL Forge`;
  const desc = p.seo?.description || p.summary.en;
  const shots = p.shots || [];
  const img = p.seo?.image ? SITE + p.seo.image : shots[0] ? `${SITE}/shots/${shots[0].file}-${shots[0].large ? 1440 : 720}.webp` : `${SITE}/og.png`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    url,
    description: desc,
    applicationCategory: p.kinds.includes('games') ? 'GameApplication' : 'UtilitiesApplication',
    operatingSystem: p.platforms.en.replace(/ · /g, ', '),
    license: p.licence.en,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    screenshot: shots.map((s) => `${SITE}/shots/${s.file}-${s.large ? 1440 : 720}.webp`),
    featureList: p.features?.en,
    author: { '@type': 'Organization', name: 'DungenLabs', url: 'https://dungenlabs.com/' },
    sameAs: (p.links || []).map((l) => l.href).filter((h) => h.startsWith('http')),
    ...(p.seo?.keywords && { keywords: p.seo.keywords }),
  };
  const body = `<article>
<h1>${esc(name)}</h1>
<p>${esc(p.tagline.en)}</p>
<p>${esc(p.summary.en)}</p>
${p.problem ? `<p>${esc(p.problem.en)}</p>` : ''}
${p.features ? `<ul>${p.features.en.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
${shots.map((s) => `<img src="/shots/${s.file}-720.webp" alt="${esc(s.alt.en)}" width="720" loading="lazy">`).join('\n')}
<p>${(p.links || []).map((l) => `<a href="${esc(l.href)}">${esc(l.label.en)}</a>`).join(' · ')}</p>
<p><a href="/">DL Forge: all software, games and mods by DungenLabs</a></p>
</article>`;

  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace('</head>', `    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n  </head>`);
  html = meta(html, 'name', 'description', desc);
  html = meta(html, 'property', 'og:title', title);
  html = meta(html, 'property', 'og:description', desc);
  html = meta(html, 'property', 'og:url', url);
  html = meta(html, 'property', 'og:image', img);
  html = meta(html, 'property', 'og:image:alt', shots[0]?.alt.en || name);
  if (shots[0] && !p.seo?.image) html = html.replace(/\s*<meta property="og:image:(width|height)"[^>]*>/g, '');
  fs.mkdirSync(`dist/${p.id}`, { recursive: true });
  fs.writeFileSync(`dist/${p.id}/index.html`, html);
}

const urls = ['/', ...PROJECTS.map((p) => `/${p.id}/`)];
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`prerender: ${PROJECTS.length} project pages + sitemap`);
