// Télécharge une photo libre pour chaque recette, plat et objet de matériel.
// Source : photo principale de l'article Wikipédia indiqué dans seed/data/imageSources.js,
// hébergée sur Wikimedia Commons. Auteur, licence et lien sont enregistrés dans
// seed/data/imageCredits.json pour l'attribution (obligatoire pour les licences CC BY / BY-SA).
// Usage : npm run images:fetch --workspace server [-- --force] [-- --only=recipes]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSources } from '../seed/data/imageSources.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(root, 'public/images');
const creditsFile = path.join(root, 'seed/data/imageCredits.json');
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.find((a) => a.startsWith('--only='))?.split('=')[1];
const HEADERS = { 'User-Agent': 'BivySwiss/0.1 (projet personnel, développement local)' };
const ALLOWED_LICENSES = /^(CC0|CC BY|CC-BY|Public domain|PD|Attribution|GFDL|FAL)/i;

const stripHtml = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wikimedia limite le débit (HTTP 429) : on réessaie avec une attente croissante.
async function fetchWithRetry(url, tries = 5) {
  for (let i = 0; i < tries; i += 1) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.status !== 429 && res.status < 500) return res;
    const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * 2 ** i;
    await sleep(wait);
  }
  throw new Error('trop de requêtes (HTTP 429), réessaie plus tard');
}

async function getJson(url) {
  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function leadImageFile(source) {
  if (typeof source === 'object' && source.file) return source.file;
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', format: 'json', prop: 'pageimages', piprop: 'name', redirects: '1', titles: source });
  const data = await getJson(url);
  const page = Object.values(data.query?.pages ?? {})[0];
  return page?.pageimage ? `File:${page.pageimage}` : null;
}

async function commonsInfo(fileTitle) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', format: 'json', titles: fileTitle, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '500' });
  const data = await getJson(url);
  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null; // fichier absent de Commons (souvent non libre) : ignoré
  const meta = info.extmetadata ?? {};
  return {
    thumbUrl: info.thumburl ?? info.url,
    sourceUrl: info.descriptionurl,
    author: stripHtml(meta.Artist?.value) || 'Auteur inconnu',
    license: stripHtml(meta.LicenseShortName?.value) || 'Licence inconnue',
    licenseUrl: meta.LicenseUrl?.value ?? null,
  };
}

let credits = {};
try { credits = JSON.parse(await fs.readFile(creditsFile, 'utf8')); } catch { /* premier lancement */ }

const report = { ok: 0, skipped: 0, failed: [] };
for (const [type, entries] of Object.entries(imageSources)) {
  if (only && only !== type) continue;
  await fs.mkdir(path.join(imagesDir, type), { recursive: true });
  for (const [id, source] of Object.entries(entries)) {
    const key = `${type}/${id}`;
    if (!force && credits[key]) { report.skipped += 1; continue; }
    try {
      const file = await leadImageFile(source);
      if (!file) throw new Error('pas de photo principale');
      const info = await commonsInfo(file);
      if (!info) throw new Error(`${file} absent de Commons`);
      if (!ALLOWED_LICENSES.test(info.license)) throw new Error(`licence refusée : ${info.license}`);
      const res = await fetchWithRetry(info.thumbUrl);
      if (!res.ok) throw new Error(`téléchargement HTTP ${res.status}`);
      const ext = (res.headers.get('content-type') ?? '').includes('png') ? 'png' : 'jpg';
      const fileName = `${id}.${ext}`;
      await fs.writeFile(path.join(imagesDir, type, fileName), Buffer.from(await res.arrayBuffer()));
      credits[key] = { url: `/images/${type}/${fileName}`, file, author: info.author, license: info.license, licenseUrl: info.licenseUrl, sourceUrl: info.sourceUrl };
      report.ok += 1;
      console.log(`[images] ${key} ← ${file} (${info.license})`);
    } catch (err) {
      report.failed.push(`${key} : ${err.message}`);
      console.warn(`[images] ${key} : ${err.message}`);
    }
    await sleep(1200);
  }
}
await fs.writeFile(creditsFile, `${JSON.stringify(credits, null, 2)}\n`);
console.log(`[images] ${report.ok} téléchargées, ${report.skipped} déjà présentes, ${report.failed.length} échecs`);
if (report.failed.length) console.log(report.failed.join('\n'));
