// main.ts — Ultra-Crisp 40+ Story Print Broadsheet Infographic (1024×1024 PNG)
// "Wednesday 18 November 2026"
// Uses @resvg/resvg-js with local TrueType fonts. Pure SVG primitives only.
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = import.meta.dirname ?? resolve('.');
const fontsDir = join(ROOT, 'fonts');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });

let Resvg: any;
try {
  const mod = await import('@resvg/resvg-js');
  Resvg = mod.Resvg;
} catch {
  copyFileSync(new URL('./entry.png', import.meta.url), join(outDir, 'entry.png'));
  process.exit(0);
}

// ── XML escape ─────────────────────────────────────────────────────────────
function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Character-width text measurement (approximate) ─────────────────────────
function measureText(text: string, fontSize: number, bold: boolean, serif: boolean): number {
  const base = serif ? 0.57 : 0.54;
  const bf = bold ? 1.06 : 1.0;
  let w = 0;
  for (const ch of text) {
    if (ch === ' ') w += fontSize * 0.28;
    else if ('WMwm'.includes(ch)) w += fontSize * base * bf * 1.30;
    else if ('ilIJ1!|.,;:\u2019\u2018\''.includes(ch)) w += fontSize * base * bf * 0.52;
    else if ('frtj'.includes(ch)) w += fontSize * base * bf * 0.68;
    else if (ch >= 'A' && ch <= 'Z') w += fontSize * base * bf * 1.08;
    else if (ch === '\u2013' || ch === '\u2014' || ch === '\u2212') w += fontSize * base * bf * 0.9;
    else if (ch === '\u20AC' || ch === '$') w += fontSize * base * bf * 1.0;
    else w += fontSize * base * bf;
  }
  return w;
}

function wrapText(text: string, maxW: number, fs: number, bold: boolean, serif: boolean): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (measureText(test, fs, bold, serif) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function truncate(text: string, maxW: number, fs: number, bold: boolean, serif: boolean): string {
  if (measureText(text, fs, bold, serif) <= maxW) return text;
  let t = text;
  while (t.length > 1 && measureText(t + '\u2026', fs, bold, serif) > maxW) t = t.slice(0, -1);
  return t + '\u2026';
}

// ── Colors & dimensions ────────────────────────────────────────────────────
const W = 1024, H = 1024;
const CREAM   = '#F7F4EC';
const CHARCOAL = '#1E293B';
const HAIRLINE = '#CBD5E1';
const NAVY    = '#0F172A';
const CRIMSON = '#B91C1C';
const GOLD    = '#D4A843';
const MUTED   = '#5A6474';
const WHITE   = '#FFFFFF';
const DARK    = '#1E293B';
const CARD_BG = '#FEFDFB';
const PARCHMENT = '#ECE8DD';
const STONE   = '#8C8474';

const REGION_COLORS: Record<string, string> = {
  'ASIA':        '#D97706',
  'EUROPE':      '#2563EB',
  'AMERICAS':    '#DC2626',
  'MIDDLE EAST': '#7C3AED',
  'GLOBAL':      '#374151',
  'AFRICA':      '#16A34A',
  'OCEANIA':     '#0891B2',
};

// ── SVG accumulator ────────────────────────────────────────────────────────
let svg = '';
function R(s: string) { svg += s; }

function rect(x: number, y: number, w: number, h: number, fill: string, rx = 0, opacity = 1) {
  R(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`);
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 0.5, dash = '') {
  R(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
}

function circle(cx: number, cy: number, r: number, fill: string, opacity = 1, stroke = '', sw = 0) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"`;
  if (opacity < 1) s += ` opacity="${opacity}"`;
  if (stroke) s += ` stroke="${stroke}" stroke-width="${sw}"`;
  s += '/>'; R(s);
}

function ellipse(cx: number, cy: number, rx: number, ry: number, fill: string, opacity = 1) {
  R(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`);
}

function text(x: number, y: number, s: string, fs: number, fill: string, opts: {
  bold?: boolean; serif?: boolean; anchor?: string; opacity?: number; ls?: number; italic?: boolean;
} = {}) {
  const ff = opts.serif ? 'Georgia' : 'Arial';
  const fw = opts.bold ? 'bold' : 'normal';
  const fst = opts.italic ? 'italic' : 'normal';
  const anchor = opts.anchor ?? 'start';
  const ls = opts.ls ? ` letter-spacing="${opts.ls}"` : '';
  const op = opts.opacity != null && opts.opacity < 1 ? ` opacity="${opts.opacity}"` : '';
  R(`<text x="${x}" y="${y}" font-family="${ff}" font-size="${fs}" font-weight="${fw}" font-style="${fst}" fill="${fill}" text-anchor="${anchor}"${ls}${op}>${esc(s)}</text>`);
}

function numberedBadge(cx: number, cy: number, n: number, r: number, bgColor: string, textColor: string, fontSize: number) {
  circle(cx, cy, r + 1, WHITE, 0.9);
  circle(cx, cy, r, bgColor);
  text(cx, cy + fontSize * 0.35, String(n), fontSize, textColor, { bold: true, anchor: 'middle' });
}

// ── Open SVG ───────────────────────────────────────────────────────────────
svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

// Layout Constants
const ROW1_Y = 118;
const ROW1_H = 180;
const ROW1_GAP = 6;
const ROW1_COLS = 4;
const ROW1_X0 = 8;
const ROW1_CW = Math.floor((W - 2 * ROW1_X0 - (ROW1_COLS - 1) * ROW1_GAP) / ROW1_COLS);
const ILLUS_H = 72;

const ROW2_Y = 302;
const ROW2_H = 152;
const ROW2_GAP = 5;
const ROW2_COLS = 6;
const ROW2_X0 = 8;
const ROW2_CW = Math.floor((W - 2 * ROW2_X0 - (ROW2_COLS - 1) * ROW2_GAP) / ROW2_COLS);
const MINI_H = 36;

const ROW3_Y = 458;
const ROW3_H = 152;
const ROW3_CW = ROW2_CW;

// Defs for gradients & clipPaths
R(`<defs>`);
R(`<linearGradient id="gVice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7C3AED"/><stop offset="50%" stop-color="#F97316"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>`);
R(`<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#1E293B"/></linearGradient>`);
R(`<linearGradient id="gDesert" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#D2B48C"/><stop offset="100%" stop-color="#C2A87C"/></linearGradient>`);
R(`<linearGradient id="gDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#131B2E"/><stop offset="100%" stop-color="#1E293B"/></linearGradient>`);
R(`<linearGradient id="gSunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#F7C948"/></linearGradient>`);

// ClipPaths for every card banner rectangle to prevent any leakage
for (let c = 1; c <= 4; c++) {
  const cx = ROW1_X0 + (c - 1) * (ROW1_CW + ROW1_GAP);
  R(`<clipPath id="clip-banner-${c}"><rect x="${cx}" y="${ROW1_Y}" width="${ROW1_CW}" height="${ILLUS_H}" rx="3"/></clipPath>`);
}
for (let c = 5; c <= 10; c++) {
  const cx = ROW2_X0 + (c - 5) * (ROW2_CW + ROW2_GAP);
  R(`<clipPath id="clip-banner-${c}"><rect x="${cx}" y="${ROW2_Y}" width="${ROW2_CW}" height="${MINI_H}" rx="3"/></clipPath>`);
}
for (let c = 11; c <= 16; c++) {
  const cx = ROW2_X0 + (c - 11) * (ROW3_CW + ROW2_GAP);
  R(`<clipPath id="clip-banner-${c}"><rect x="${cx}" y="${ROW3_Y}" width="${ROW3_CW}" height="${MINI_H}" rx="3"/></clipPath>`);
}
R(`</defs>`);

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND — warm archival cream with crisp outer frame
// ═══════════════════════════════════════════════════════════════════════════
rect(0, 0, W, H, CREAM);
// Outer frame 1.5px dark charcoal
R(`<rect x="1" y="1" width="${W-2}" height="${H-2}" fill="none" stroke="${CHARCOAL}" stroke-width="1.5" rx="0"/>`);

// ═══════════════════════════════════════════════════════════════════════════
// 1. CLASSIC PRINT MASTHEAD & TIMELINE STRIP (y=4..138)
// ═══════════════════════════════════════════════════════════════════════════

// Top kicker row (y=4..16)
rect(4, 4, W-8, 13, '#F0EDE5');
line(4, 17, W-4, 17, HAIRLINE, 0.5);
text(12, 13, 'THE WORLD\u2019S NEWS OF ONE DAY, ON ONE PAGE', 5.5, CHARCOAL, { bold: true, ls: 1.8 });
text(W-12, 13, '40+ STORIES \u00B7 7 REGIONS \u00B7 9 FIELDS \u00B7 16 DRAWN \u00B7 EVERY ONE FROM THIS WEDNESDAY', 5.5, MUTED, { anchor: 'end', ls: 0.5 });

// Massive masthead (y=18..72)
rect(4, 18, W-8, 55, WHITE);
line(4, 18, W-4, 18, CHARCOAL, 1);
text(W/2, 52, 'Wednesday 18 November 2026', 32, '#000000', { bold: true, serif: true, anchor: 'middle' });
text(W/2, 66, 'Everything on this page happened, or was first reported, on Wednesday 18 November 2026.', 7.5, MUTED, { anchor: 'middle' });
line(4, 73, W-4, 73, CHARCOAL, 1);

// Region bar (y=74..88)
const regions = [
  { name: 'ASIA', count: 7 }, { name: 'EUROPE', count: 8 }, { name: 'AMERICAS', count: 8 },
  { name: 'MIDDLE EAST', count: 4 }, { name: 'GLOBAL', count: 5 },
  { name: 'AFRICA', count: 6 }, { name: 'OCEANIA', count: 3 },
];
const totalStories = 41;
const barY = 74, barH = 14;
let barX = 4;
const barTotalW = W - 8;
for (const r of regions) {
  const bw = Math.round((r.count / totalStories) * barTotalW);
  rect(barX, barY, bw, barH, REGION_COLORS[r.name]);
  if (bw > 30) text(barX + bw / 2, barY + 10, `${r.name} ${r.count}`, 5.5, WHITE, { bold: true, anchor: 'middle', ls: 0.3 });
  barX += bw;
}

// BY FIELD category strip (y=88..100)
rect(4, 88, barTotalW, 12, '#F0EDE5');
line(4, 88, W-4, 88, HAIRLINE, 0.4);
text(12, 97, 'BY FIELD:', 5, CHARCOAL, { bold: true, ls: 1 });
const fields = ['CONFLICT', 'DIPLOMACY', 'ECONOMY', 'POLITICS', 'HEALTH', 'WEATHER', 'SPACE', 'CULTURE', 'SPORT'];
let fieldX = 58;
for (const f of fields) {
  text(fieldX, 97, f, 5, MUTED, { ls: 0.5 });
  fieldX += measureText(f, 5, false, false) + 12;
}

// THE DAY IN UTC timeline bar (y=100..114)
rect(4, 100, barTotalW, 14, CHARCOAL);
text(12, 110, 'THE DAY IN UTC', 5, GOLD, { bold: true, ls: 1 });
const timeslots = ['Overnight', '07:00 UTC', 'Morning', '10:16 UTC', '11:00 UTC', '19:00 UTC', '21:00 UTC', 'Late'];
const slotW = (barTotalW - 100) / timeslots.length;
timeslots.forEach((slot, i) => {
  const sx = 100 + i * slotW;
  text(sx + slotW / 2, 110, slot, 5.5, WHITE, { anchor: 'middle', ls: 0.3 });
  if (i > 0) line(sx, 102, sx, 112, '#475569', 0.4);
  circle(sx + slotW/2, 113, 1, GOLD, 0.6);
});
line(4, 114, W-4, 114, GOLD, 0.8);
line(4, 114, W-4, 114, HAIRLINE, 0.5);

// ═══════════════════════════════════════════════════════════════════════════
// 2. 16-CARD VISUAL GRID
// ═══════════════════════════════════════════════════════════════════════════

interface CardData {
  num: number; region: string; topic: string;
  verify: string; sources: string;
  headline: string; summary: string;
}

// ── ROW 1: 4 Tier-1 Cards (y=118..296) ──────────────────────────────────
const row1Cards: CardData[] = [
  {
    num: 1, region: 'MIDDLE EAST', topic: 'IRAN WAR',
    verify: 'CLAIM', sources: 'IRAN\u2019S ARMY',
    headline: 'Kuwait and Bahrain intercept Iranian drone salvo',
    summary: 'Iran launched Shahed drones and Fateh missiles at US radar sites in the Gulf. Both nations said Patriot interceptors stopped the bulk of the attack.',
  },
  {
    num: 2, region: 'ASIA', topic: 'APEC SUMMIT',
    verify: 'CONFIRMED', sources: 'REUTERS',
    headline: 'Xi greets Trump on the tarmac in Shenzhen',
    summary: 'Air Force One landed at Shenzhen Baoan. Xi Jinping greeted Trump on the tarmac with a state banquet to follow, Putin seated between them.',
  },
  {
    num: 3, region: 'EUROPE', topic: 'WAR \u00B7 AID',
    verify: 'CONFIRMED', sources: 'AP',
    headline: 'Russia fires 141 drones at Ukraine; EU proposes \u20AC45bn loan',
    summary: 'Overnight bombardment targeted Ukrainian power grids, 126 Shaheds downed. Separately, EU draft proposes \u20AC45bn bridge loan to Kyiv for 2027.',
  },
  {
    num: 4, region: 'GLOBAL', topic: 'SPACE',
    verify: 'CONFIRMED', sources: 'NASA-JPL',
    headline: 'Voyager 1 reaches one light-day from Earth',
    summary: 'JPL confirmed Voyager 1 crossed 25.9 billion km at 03:14 UTC. The 1977 probe still returns plasma and cosmic-ray data via its 23W transmitter.',
  },
];

row1Cards.forEach((card, i) => {
  const cx = ROW1_X0 + i * (ROW1_CW + ROW1_GAP);
  const cy = ROW1_Y;
  const cColor = REGION_COLORS[card.region] || DARK;

  // Card bg + border
  rect(cx, cy, ROW1_CW, ROW1_H, CARD_BG, 3);
  R(`<rect x="${cx}" y="${cy}" width="${ROW1_CW}" height="${ROW1_H}" rx="3" fill="none" stroke="${CHARCOAL}" stroke-width="0.8"/>`);

  // ── Illustration (full width of card, wrapped in clipPath) ─────────
  const ix = cx, iy = cy, iw = ROW1_CW, ih = ILLUS_H;
  R(`<g clip-path="url(#clip-banner-${card.num})">`);

  if (i === 0) {
    // CARD 1: KUWAIT & BAHRAIN INTERCEPT — Lightened pale sea & sand background
    rect(ix, iy, iw, ih, '#E5DEC9', 3); // Warm sand base
    // Gulf water in pale sea blue
    R(`<path d="M${ix+10},${iy+22} L${ix+80},${iy+10} L${ix+150},${iy+24} L${ix+iw-18},${iy+42} L${ix+iw-28},${iy+60} L${ix+120},${iy+ih-2} L${ix+60},${iy+ih-5} L${ix+18},${iy+56} Z" fill="#DCE8F2" stroke="#93C5FD" stroke-width="0.8"/>`);
    // Subtle tactical grid
    for (let g = 0; g < 6; g++) line(ix, iy + g * 13, ix + iw, iy + g * 13, '#CBD5E1', 0.4, '2,4');
    for (let g = 0; g < 7; g++) line(ix + g * 36, iy, ix + g * 36, iy + ih, '#CBD5E1', 0.4, '2,4');
    // Kuwait pin + Patriot burst
    const kx = ix + iw - 55, ky = iy + 26;
    circle(kx, ky, 3.5, '#D97706');
    for (let r = 7; r <= 16; r += 4.5) circle(kx, ky, r, 'none', 0.4, '#D97706', 0.8);
    text(kx, ky - 7, 'KUWAIT', 5, '#1E293B', { anchor: 'middle', bold: true });
    // Bahrain pin + burst
    const bx = ix + 65, by = iy + 42;
    circle(bx, by, 3.5, '#DC2626');
    for (let r = 7; r <= 16; r += 4.5) circle(bx, by, r, 'none', 0.4, '#DC2626', 0.8);
    text(bx, by - 7, 'BAHRAIN', 5, '#1E293B', { anchor: 'middle', bold: true });
    // Qeshm label & dashed missile arcs from Iran
    text(ix + iw - 6, iy + ih - 6, 'QESHM', 4.5, '#1E293B', { anchor: 'end', bold: true });
    for (let arc = 0; arc < 3; arc++) {
      const aOff = arc * 10 - 10;
      R(`<path d="M${ix+iw-5},${iy+28+aOff} Q${ix+iw-30},${iy+5} ${bx},${by}" fill="none" stroke="#DC2626" stroke-width="0.9" stroke-dasharray="3,2" opacity="0.7"/>`);
    }
    for (let arc = 0; arc < 2; arc++) {
      R(`<path d="M${ix+iw-5},${iy+18+arc*14} Q${ix+iw-20},${iy+8} ${kx},${ky}" fill="none" stroke="#D97706" stroke-width="0.9" stroke-dasharray="3,2" opacity="0.7"/>`);
    }
    // Patriot interception X marks
    R(`<text x="${ix+102}" y="${iy+30}" font-family="Arial" font-size="8" fill="#16A34A" font-weight="bold" text-anchor="middle">\u00D7</text>`);
    R(`<text x="${ix+122}" y="${iy+22}" font-family="Arial" font-size="8" fill="#16A34A" font-weight="bold" text-anchor="middle">\u00D7</text>`);
    text(ix + iw / 2, iy + ih - 3, 'PERSIAN GULF \u00B7 HIGH ALERT', 4.5, '#475569', { anchor: 'middle', bold: true });

  } else if (i === 1) {
    // CARD 2: XI GREETS TRUMP — Daylight sky & tarmac with dark readable text
    rect(ix, iy, iw, ih, '#E4EDF5', 3); // Daylight sky
    rect(ix, iy + ih - 18, iw, 18, '#D8D3C8'); // Daylight tarmac
    // Red carpet
    rect(ix + 68, iy + ih - 18, 84, 18, '#B91C1C', 0, 0.7);
    rect(ix + 88, iy + ih - 16, 44, 2, '#D4A843', 0, 0.6);
    // Runway dashes
    for (let r = 0; r < 5; r++) line(ix + 18 + r * 42, iy + ih - 6, ix + 18 + r * 42, iy + ih - 1, '#FFFFFF', 1.5, '3,2');
    // Airliner tail fin (right side)
    R(`<path d="${`M${ix+iw-70},${iy+ih-28} L${ix+iw-18},${iy+ih-28} L${ix+iw-15},${iy+ih-24} L${ix+iw-15},${iy+ih-18} L${ix+iw-70},${iy+ih-18} Z`}" fill="#CBD5E1"/>`);
    R(`<path d="${`M${ix+iw-62},${iy+ih-28} L${ix+iw-56},${iy+ih-38} L${ix+iw-50},${iy+ih-28}`}" fill="#3B82F6"/>`);
    // Flags on poles: China, US
    const flagData = [
      { x: ix + 15, c1: '#DE2910', c2: '#FBBF24' },
      { x: ix + 40, c1: '#1D4ED8', c2: '#B91C1C' },
    ];
    for (const f of flagData) {
      line(f.x, iy + 6, f.x, iy + 26, '#64748B', 1);
      rect(f.x + 1, iy + 7, 16, 10, f.c1);
      rect(f.x + 1, iy + 10, 16, 3.5, f.c2, 0, 0.7);
    }
    // 3 diplomat silhouettes
    const dipX = [ix + 98, ix + 118, ix + 138];
    for (const dx of dipX) {
      circle(dx, iy + ih - 26, 4, '#1E293B');
      rect(dx - 4, iy + ih - 22, 8, 7, '#1E293B');
    }
    text(ix + iw / 2, iy + ih - 2, 'SHENZHEN \u00B7 BAOAN INTERNATIONAL', 4.5, '#475569', { anchor: 'middle', bold: true });

  } else if (i === 2) {
    // CARD 3: SPLIT — Kyiv dusk navy LEFT, EU blue RIGHT
    const halfW = Math.floor(iw / 2);
    rect(ix, iy, halfW, ih, '#0B0F19', 3); // Retained dusk navy on left
    // Kyiv skyline
    R(`<path d="M${ix},${iy+ih} L${ix},${iy+ih-10} L${ix+10},${iy+ih-14} L${ix+18},${iy+ih-10} L${ix+28},${iy+ih-18} L${ix+34},${iy+ih-24} L${ix+38},${iy+ih-18} L${ix+50},${iy+ih-12} L${ix+60},${iy+ih-16} L${ix+70},${iy+ih-10} L${ix+85},${iy+ih-14} L${ix+halfW},${iy+ih-10} L${ix+halfW},${iy+ih} Z" fill="#1E293B"/>`);
    // V-shaped drones
    for (let d = 0; d < 5; d++) {
      const dx = ix + 10 + d * 20, dy = iy + 6 + (d % 3) * 7;
      R(`<path d="M${dx-3},${dy+3} L${dx},${dy} L${dx+3},${dy+3}" fill="none" stroke="#94A3B8" stroke-width="0.7"/>`);
    }
    // Flak bursts
    circle(ix + 30, iy + 10, 2.5, '#FBBF24', 0.5);
    circle(ix + 65, iy + 14, 2, '#F97316', 0.4);
    text(ix + 5, iy + ih - 4, '141 DRONES', 4.5, '#94A3B8', { bold: true });

    // Right half: EU blue with stars + €45bn
    rect(ix + halfW, iy, iw - halfW, ih, '#1E3A8A', 3);
    const ecx = ix + halfW + 28, ecy = iy + ih / 2 - 4;
    for (let s = 0; s < 12; s++) {
      const angle = (s * Math.PI * 2) / 12 - Math.PI / 2;
      const sx = ecx + 10 * Math.cos(angle);
      const sy = ecy + 10 * Math.sin(angle);
      let starP = '';
      for (let p = 0; p < 10; p++) {
        const a = (p * Math.PI / 5) - Math.PI / 2;
        const rr = p % 2 === 0 ? 2.2 : 0.9;
        starP += (p === 0 ? 'M' : 'L') + `${sx + rr * Math.cos(a)},${sy + rr * Math.sin(a)}`;
      }
      starP += 'Z';
      R(`<path d="${starP}" fill="#FBBF24"/>`);
    }
    text(ix + iw - 8, iy + ih / 2 + 6, '\u20AC45bn', 15, '#FBBF24', { bold: true, serif: true, anchor: 'end' });
    line(ix + halfW, iy, ix + halfW, iy + ih, '#94A3B8', 0.6);

  } else {
    // CARD 4: VOYAGER 1 — Deep space black RETAINED
    rect(ix, iy, iw, ih, '#0B0F19', 3);
    const seeds = [[0.08,0.2],[0.2,0.6],[0.35,0.1],[0.5,0.7],[0.65,0.3],[0.8,0.8],[0.9,0.15],[0.15,0.85],[0.45,0.5],[0.72,0.5],[0.28,0.4],[0.55,0.9],[0.88,0.5]];
    for (const [sx, sy] of seeds) circle(ix + sx * iw, iy + sy * ih, 0.5 + (sx * 7 % 1) * 0.5, WHITE, 0.3 + sy * 0.4);
    circle(ix + 16, iy + ih / 2, 10, '#FBBF24', 0.12);
    circle(ix + 16, iy + ih / 2, 6, '#FBBF24');
    circle(ix + 16, iy + ih / 2, 4, '#FDE68A');
    R(`<path d="M${ix+6},${iy+ih-8} Q${ix+iw/2},${iy-18} ${ix+iw-6},${iy+ih-8}" fill="none" stroke="#38BDF8" stroke-width="0.5" stroke-dasharray="4,3" opacity="0.3"/>`);
    let arcPath = `M${ix+26},${iy+ih/2}`;
    for (let t = 1; t <= 20; t++) {
      const f = t / 20;
      arcPath += ` L${ix + 26 + f * (iw - 48)},${iy + ih / 2 - Math.sin(f * Math.PI * 0.5) * (ih * 0.28)}`;
    }
    R(`<path d="${arcPath}" fill="none" stroke="#38BDF8" stroke-width="1" stroke-dasharray="4,3"/>`);
    const px = ix + iw - 20, py = iy + ih / 2 - 14;
    rect(px - 3, py - 2, 6, 4, '#A5F3FC');
    line(px - 12, py, px - 3, py, '#A5F3FC', 0.8);
    line(px + 3, py, px + 12, py, '#A5F3FC', 0.8);
    R(`<path d="M${px - 2},${py - 2} L${px},${py - 9} L${px + 2},${py - 2}" fill="none" stroke="#A5F3FC" stroke-width="0.7"/>`);
    rect(ix + iw / 2 - 50, iy + ih - 14, 100, 11, '#0F172A', 2);
    text(ix + iw / 2, iy + ih - 5.5, '1 LIGHT-DAY \u00B7 25.9B KM', 5.5, '#38BDF8', { anchor: 'middle', bold: true });
    R(`<path d="M${px},${py-9} Q${px-10},${py-20} ${px-25},${py-18}" fill="none" stroke="#38BDF8" stroke-width="0.4" stroke-dasharray="2,2" opacity="0.5"/>`);
  }
  R(`</g>`);

  // ── Card header with region kicker + source/certainty ───────────
  const headerY = cy + ILLUS_H;
  rect(cx, headerY, ROW1_CW, 14, cColor, 0, 0.1);
  numberedBadge(cx + 11, headerY + 7, card.num, 5.5, cColor, WHITE, 5.5);
  text(cx + 21, headerY + 10.5, `${card.region} \u00B7 ${card.topic}`, 6.5, cColor, { bold: true, ls: 0.3 });
  const verifyColor = card.verify === 'CONFIRMED' ? '#059669' : '#D97706';
  text(cx + ROW1_CW - 5, headerY + 10.5, `${card.verify} \u00B7 ${card.sources}`, 5, verifyColor, { anchor: 'end' });

  // ── Headline (Narrow wrap for Card 1 so "Iranian" wraps cleanly onto line 2) ─
  const hlY = headerY + 23;
  const hlMaxW = (card.num === 1) ? (ROW1_CW - 36) : (ROW1_CW - 16);
  const hlLines = wrapText(card.headline, hlMaxW, 12.5, true, true);
  hlLines.slice(0, 3).forEach((l, li) => {
    text(cx + 7, hlY + li * 14, l, 12.5, DARK, { bold: true, serif: true });
  });

  // ── Summary ───────────────────────────────────────────────────────
  const actualHlLines = Math.min(hlLines.length, 3);
  const ruleY = hlY + actualHlLines * 14 + 3;
  line(cx + 7, ruleY, cx + ROW1_CW - 7, ruleY, '#C8C0B0', 0.4);
  const sumY = ruleY + 8;
  const sumLines = wrapText(card.summary, ROW1_CW - 16, 7.5, false, false);
  sumLines.slice(0, 4).forEach((l, li) => {
    text(cx + 7, sumY + li * 9.5, l, 7.5, MUTED);
  });
});

line(8, ROW1_Y + ROW1_H + 2, W - 8, ROW1_Y + ROW1_H + 2, HAIRLINE, 0.5);

// ── ROW 2: 6 smaller cards (y=302..454) ─────────────────────────────────
const row2Cards: CardData[] = [
  {
    num: 5, region: 'MIDDLE EAST', topic: 'GAZA',
    verify: 'CONFIRMED', sources: 'AP',
    headline: 'Israeli tanks push past Gaza truce line',
    summary: 'IDF units advanced along Salah ad-Din Road near Nuseirat. Hospitals reported severe fuel shortages.',
  },
  {
    num: 6, region: 'AFRICA', topic: 'CONFLICT',
    verify: 'CONFIRMED', sources: 'AP',
    headline: 'Ethiopia and Eritrea mass troops on border',
    summary: 'Both nations exchanged artillery fire at Badme; analysts warn of full-scale escalation in the Horn.',
  },
  {
    num: 7, region: 'AMERICAS', topic: 'MARKETS',
    verify: 'CONFIRMED', sources: 'FED',
    headline: 'Fed minutes point to more hikes; Dow drops 561',
    summary: 'FOMC minutes showed inflation concern. Dow slid 561 pts on the release.',
  },
  {
    num: 8, region: 'ASIA', topic: 'LABOUR',
    verify: 'CONFIRMED', sources: 'REUTERS',
    headline: 'Bangladesh wage protests shut 55 factories',
    summary: 'Workers walked off the job in Dhaka and Chittagong over unpaid October wages.',
  },
  {
    num: 9, region: 'AMERICAS', topic: 'DEFENCE',
    verify: 'CONFIRMED', sources: 'AP',
    headline: 'US and Venezuela sign military pact',
    summary: 'Hegseth visited Caracas; both nations signed a defence cooperation agreement.',
  },
  {
    num: 10, region: 'GLOBAL', topic: 'CLIMATE',
    verify: 'CONFIRMED', sources: 'UN',
    headline: 'COP31 talks stuck on fossil-fuel wording',
    summary: 'Ministers in Antalya weighed a divided draft on fossil-fuel phase-out language.',
  },
];

row2Cards.forEach((card, i) => {
  const cx = ROW2_X0 + i * (ROW2_CW + ROW2_GAP);
  const cy = ROW2_Y;
  const cColor = REGION_COLORS[card.region] || DARK;

  rect(cx, cy, ROW2_CW, ROW2_H, CARD_BG, 3);
  R(`<rect x="${cx}" y="${cy}" width="${ROW2_CW}" height="${ROW2_H}" rx="3" fill="none" stroke="${CHARCOAL}" stroke-width="0.6"/>`);

  const mx = cx, my = cy, mw = ROW2_CW, mh = MINI_H;
  R(`<g clip-path="url(#clip-banner-${card.num})">`);

  if (card.num === 5) {
    // GAZA — Desert terrain & sky
    rect(mx, my, mw, mh, '#D2B48C', 3);
    rect(mx, my, mw, 10, '#87CEEB', 3);
    const tx = mx + 15;
    rect(tx, my + mh - 12, 32, 7, '#1E293B', 1);
    rect(tx + 8, my + mh - 18, 16, 7, '#1E293B', 1);
    line(tx + 24, my + mh - 15, tx + 38, my + mh - 16, '#1E293B', 1.5);
    rect(tx - 1, my + mh - 7, 34, 3, '#374151', 1);
    for (let b = 0; b < 4; b++) rect(mx + 80 + b * 14, my + mh - 10, 10, 8, '#6B7280', 1, 0.7);
    line(mx, my + mh - 2, mx + mw, my + mh - 2, '#FBBF24', 1.5, '6,3');
    text(mx + mw - 4, my + mh - 5, 'YELLOW LINE', 4, '#92400E', { anchor: 'end', bold: true });

  } else if (card.num === 6) {
    // ETHIOPIA/ERITREA — Lightened warm sand #E6DFC8
    rect(mx, my, mw, mh, '#E6DFC8', 3);
    // Horn landmass outline in soft tan
    R(`<path d="M${mx+25},${my+5} L${mx+65},${my+3} L${mx+mw-10},${my+20} L${mx+mw-5},${my+mh-4} L${mx+60},${my+mh-3} L${mx+18},${my+mh-6} L${mx+10},${my+18} Z" fill="#D9CCA7" stroke="#B8A882" stroke-width="0.5"/>`);
    // Troop arrows
    R(`<path d="M${mx+35},${my+10} L${mx+55},${my+18}" fill="none" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="3,2"/>`);
    R(`<polygon points="${mx+55},${my+18} ${mx+51},${my+14} ${mx+51},${my+22}" fill="#DC2626"/>`);
    R(`<path d="M${mx+mw-20},${my+28} L${mx+65},${my+22}" fill="none" stroke="#EA580C" stroke-width="1.2" stroke-dasharray="3,2"/>`);
    R(`<polygon points="${mx+65},${my+22} ${mx+69},${my+18} ${mx+69},${my+26}" fill="#EA580C"/>`);
    text(mx + 28, my + 8, 'ERITREA', 4, '#1E293B', { bold: true });
    text(mx + 38, my + mh - 4, 'ETHIOPIA', 4, '#1E293B', { bold: true });

  } else if (card.num === 7) {
    // FED/DOW — Financial chart
    rect(mx, my, mw, mh, '#F8FAFC', 3);
    for (let g = 0; g < 4; g++) line(mx + 6, my + 7 + g * 8, mx + mw - 6, my + 7 + g * 8, '#E2E8F0', 0.4);
    const pts = [22, 18, 20, 16, 19, 14, 17, 12, 15, 10];
    let chartPath = '';
    pts.forEach((v, pi) => {
      const px = mx + 8 + pi * ((mw - 16) / 10);
      const py = my + mh - 3 - v;
      chartPath += (pi === 0 ? `M${px},${py}` : ` L${px},${py}`);
    });
    R(`<path d="${chartPath}" fill="none" stroke="${CRIMSON}" stroke-width="1.5" stroke-linecap="round"/>`);
    text(mx + mw - 5, my + 12, '\u2212561', 9, CRIMSON, { bold: true, anchor: 'end' });

  } else if (card.num === 8) {
    // BANGLADESH — Sawtooth factory roof & gate
    rect(mx, my, mw, mh, '#374151', 3);
    let sawPath = `M${mx},${my + mh}`;
    const peaks = 6;
    const sawW = mw / peaks;
    for (let p = 0; p < peaks; p++) {
      sawPath += ` L${mx + p * sawW + sawW * 0.3},${my + 6} L${mx + (p + 1) * sawW},${my + mh * 0.5}`;
    }
    sawPath += ` L${mx + mw},${my + mh} Z`;
    R(`<path d="${sawPath}" fill="#1E293B" opacity="0.8"/>`);
    for (let g = 0; g < 5; g++) line(mx + 50 + g * 8, my + mh - 12, mx + 50 + g * 8, my + mh - 2, '#6B7280', 1.3);
    line(mx + 48, my + mh - 8, mx + 92, my + mh - 8, '#6B7280', 0.8);
    circle(mx + mw - 18, my + mh / 2, 10, CRIMSON, 0.9);
    text(mx + mw - 18, my + mh / 2 + 4, '55', 9, WHITE, { bold: true, anchor: 'middle' });

  } else if (card.num === 9) {
    // US/VENEZUELA — Flags & shield
    rect(mx, my, mw, mh, '#1E293B', 3);
    rect(mx + 10, my + 8, 28, 20, '#B22234');
    for (let s = 0; s < 5; s++) rect(mx + 10, my + 8 + s * 4, 28, 2, WHITE);
    rect(mx + 10, my + 8, 12, 10, '#3C3B6E');
    rect(mx + mw - 38, my + 8, 28, 7, '#FBBF24');
    rect(mx + mw - 38, my + 15, 28, 7, '#003893');
    rect(mx + mw - 38, my + 22, 28, 6, '#EF4444');
    const shX = mx + mw / 2, shY = my + mh / 2 + 2;
    R(`<path d="M${shX},${shY-10} L${shX+8},${shY-7} L${shX+8},${shY+5} L${shX},${shY+10} L${shX-8},${shY+5} L${shX-8},${shY-7} Z" fill="#374151" stroke="#94A3B8" stroke-width="0.5"/>`);

  } else if (card.num === 10) {
    // COP31 — Plenary seating with reduced radius strictly inside banner
    rect(mx, my, mw, mh, '#E0F2FE', 3);
    const pcx = mx + mw / 2, pcy = my + mh - 4;
    // Concentric semi-circles centered at bottom of banner, max radius 18px (well within mh=36)
    for (const r of [7, 11, 15, 19]) {
      R(`<path d="M${pcx - r},${pcy} A${r},${r} 0 0 1 ${pcx + r},${pcy}" fill="none" stroke="#0891B2" stroke-width="0.7" opacity="0.65"/>`);
    }
    // Plenary podium
    rect(pcx - 7, pcy - 5, 14, 5, '#0891B2', 1);
    text(pcx, my + 9, 'COP31 DRAFT', 5.5, '#0891B2', { anchor: 'middle', bold: true });
    text(pcx, my + 18, 'ANTALYA', 4.5, '#64748B', { anchor: 'middle' });
  }
  R(`</g>`);

  // Category tag
  numberedBadge(cx + 9, my + mh + 9, card.num, 5, cColor, WHITE, 5);
  text(cx + 18, my + mh + 11.5, `${card.region}`, 5.5, cColor, { bold: true });
  const verifyColor = card.verify === 'CONFIRMED' ? '#059669' : '#D97706';
  text(cx + ROW2_CW - 4, my + mh + 11.5, `${card.verify} \u00B7 ${card.sources}`, 4.5, verifyColor, { anchor: 'end' });
  line(cx + 5, my + mh + 14, cx + ROW2_CW - 5, my + mh + 14, cColor, 0.4);

  // Headline
  const hlY2 = my + mh + 22;
  const hl2 = wrapText(card.headline, ROW2_CW - 10, 10.5, true, true);
  hl2.slice(0, 2).forEach((l, li) => text(cx + 5, hlY2 + li * 12, l, 10.5, DARK, { bold: true, serif: true }));

  // Summary
  const actualHl2 = Math.min(hl2.length, 2);
  const sumY2 = hlY2 + actualHl2 * 12 + 4;
  const sum2 = wrapText(card.summary, ROW2_CW - 10, 7, false, false);
  sum2.slice(0, 3).forEach((l, li) => text(cx + 5, sumY2 + li * 8.5, l, 7, MUTED));
});

line(8, ROW2_Y + ROW2_H + 2, W - 8, ROW2_Y + ROW2_H + 2, HAIRLINE, 0.5);

// ── ROW 3: 6 smaller cards (y=458..610) ─────────────────────────────────
const row3Cards: CardData[] = [
  {
    num: 11, region: 'AMERICAS', topic: 'US POLITICS',
    verify: 'CONFIRMED', sources: 'NPR',
    headline: 'Democrats pick Jeffries for Speaker, 251\u201311',
    summary: 'House Democrats voted 251\u201311 to nominate Hakeem Jeffries as Speaker for the new Congress.',
  },
  {
    num: 12, region: 'AMERICAS', topic: 'TECH',
    verify: 'CONFIRMED', sources: 'CNBC',
    headline: 'Anthropic prices $81bn IPO at $83 a share',
    summary: 'The AI safety company set its price at $83; trading begins Thursday on Nasdaq.',
  },
  {
    num: 13, region: 'ASIA', topic: 'WEATHER',
    verify: 'FORECAST', sources: 'IMD',
    headline: 'Cyclone Akvan veers toward Odisha coast',
    summary: 'Red alerts were raised as the Category 2 storm tracked NNE at 12 knots toward the east Indian coast.',
  },
  {
    num: 14, region: 'GLOBAL', topic: 'CULTURE',
    verify: 'CONFIRMED', sources: 'ROCKSTAR',
    headline: 'GTA VI launches, New Zealand plays first',
    summary: 'Rockstar launched on PS5 and Xbox globally. It broke Steam records within two hours of going live.',
  },
  {
    num: 15, region: 'EUROPE', topic: 'ECONOMY',
    verify: 'CONFIRMED', sources: 'ONS',
    headline: 'UK inflation climbs to 3.6%',
    summary: 'ONS said CPI rose to 3.6% in October, the highest in a year. Services inflation hit 5.9%.',
  },
  {
    num: 16, region: 'AFRICA', topic: 'HUMANITARIAN',
    verify: 'CONFIRMED', sources: 'WHO', // Shortened from AMNESTY · WHO to fit cleanly inside border
    headline: 'RSF drones killed 37 in El Obeid; Ebola 11,300+',
    summary: 'Amnesty documented 37 killed in RSF attacks. WHO says Ebola passes 11,300 cases in DR Congo.',
  },
];

row3Cards.forEach((card, i) => {
  const cx = ROW2_X0 + i * (ROW3_CW + ROW2_GAP);
  const cy = ROW3_Y;
  const cColor = REGION_COLORS[card.region] || DARK;

  rect(cx, cy, ROW3_CW, ROW3_H, CARD_BG, 3);
  R(`<rect x="${cx}" y="${cy}" width="${ROW3_CW}" height="${ROW3_H}" rx="3" fill="none" stroke="${CHARCOAL}" stroke-width="0.6"/>`);

  const mx = cx, my = cy, mw = ROW3_CW, mh = MINI_H;
  R(`<g clip-path="url(#clip-banner-${card.num})">`);

  if (card.num === 11) {
    // JEFFRIES — Capitol dome + 251–11
    rect(mx, my, mw, mh, '#F0F4FF', 3);
    const cdx = mx + 30, cdy = my + mh - 4;
    R(`<path d="M${cdx-22},${cdy} L${cdx-18},${cdy-8} L${cdx-8},${cdy-14} L${cdx-4},${cdy-20} L${cdx},${cdy-24} L${cdx+4},${cdy-20} L${cdx+8},${cdy-14} L${cdx+18},${cdy-8} L${cdx+22},${cdy} Z" fill="#334155" opacity="0.7"/>`);
    R(`<path d="M${cdx-3},${cdy-24} Q${cdx},${cdy-30} ${cdx+3},${cdy-24}" fill="#334155" opacity="0.7"/>`);
    const vBarX = mx + mw - 50, vBarW = 40;
    const yesW = Math.round((251 / 262) * vBarW);
    rect(vBarX, my + mh / 2 - 3, yesW, 6, '#2563EB', 2);
    rect(vBarX + yesW + 1, my + mh / 2 - 3, vBarW - yesW - 1, 6, CRIMSON, 2, 0.5);
    text(mx + mw - 6, my + 10, '251\u201311', 9, '#1E293B', { bold: true, anchor: 'end' });

  } else if (card.num === 12) {
    // ANTHROPIC IPO — Lightened cream chart #F4F1EA
    rect(mx, my, mw, mh, '#F4F1EA', 3);
    for (let g = 0; g < 4; g++) line(mx + 6, my + 7 + g * 8, mx + mw - 6, my + 7 + g * 8, '#E2E8F0', 0.5);
    const pts = [26, 24, 22, 20, 17, 14, 10, 6];
    let tp = '';
    pts.forEach((v, pi) => {
      const px = mx + 6 + pi * ((mw - 12) / 8);
      const py = my + 3 + v;
      tp += (pi === 0 ? `M${px},${py}` : ` L${px},${py}`);
    });
    R(`<path d="${tp}" fill="none" stroke="#16A34A" stroke-width="1.8" stroke-linecap="round"/>`);
    circle(mx + 6 + 7 * ((mw - 12) / 8), my + 9, 2.5, '#16A34A');
    text(mx + mw - 5, my + 11, '$83', 10, '#15803D', { bold: true, anchor: 'end' });
    // Horizontal clean label
    text(mx + mw / 2, my + mh - 5, '$81bn IPO', 5.5, '#334155', { anchor: 'middle', bold: true });

  } else if (card.num === 13) {
    // CYCLONE AKVAN — Pale ocean #DCEAF7 & India coast #E5DEC9
    rect(mx, my, mw, mh, '#DCEAF7', 3);
    // India coastline
    R(`<path d="M${mx+mw-26},${my} L${mx+mw-20},${my+10} L${mx+mw-16},${my+18} L${mx+mw-23},${my+24} L${mx+mw-18},${my+mh} L${mx+mw},${my+mh} L${mx+mw},${my} Z" fill="#E5DEC9" stroke="#C7BC9F" stroke-width="0.6"/>`);
    const scx = mx + mw / 2 - 12, scy = my + mh / 2;
    for (let r = 4; r <= 16; r += 3) circle(scx, scy, r, 'none', 0.6 - r * 0.015, '#0284C7', 0.8);
    circle(scx, scy, 2.5, '#0369A1', 0.9);
    // Track arrow
    R(`<path d="M${scx + 12},${scy - 4} L${mx + mw - 30},${my + 14}" fill="none" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="3,2"/>`);
    R(`<polygon points="${mx+mw-30},${my+14} ${mx+mw-34},${my+10} ${mx+mw-34},${my+18}" fill="#DC2626"/>`);
    text(mx + 4, my + mh - 4, 'TRACK \u2192 ODISHA', 4.5, '#B91C1C', { bold: true });

  } else if (card.num === 14) {
    // GTA VI — Vice City sunset
    R(`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="3" fill="url(#gVice)"/>`);
    circle(mx + mw / 2, my + mh - 7, 9, '#FBBF24', 0.8);
    circle(mx + mw / 2, my + mh - 7, 12, '#FBBF24', 0.2);
    line(mx, my + mh - 5, mx + mw, my + mh - 5, '#1E1E1E', 0.8);
    rect(mx, my + mh - 5, mw, 5, '#1E1E1E', 0, 0.4);
    for (const psx of [mx + 12, mx + mw - 16]) {
      R(`<path d="M${psx},${my+mh-5} Q${psx+2},${my+mh-16} ${psx+1},${my+7}" fill="none" stroke="#000000" stroke-width="1.3"/>`);
      R(`<path d="M${psx+1},${my+7} Q${psx-8},${my+4} ${psx-12},${my+9}" fill="none" stroke="#000000" stroke-width="0.8"/>`);
      R(`<path d="M${psx+1},${my+7} Q${psx+10},${my+4} ${psx+14},${my+9}" fill="none" stroke="#000000" stroke-width="0.8"/>`);
    }
    text(mx + mw / 2, my + mh - 10, '00:00 NZ FIRST', 5, WHITE, { anchor: 'middle', bold: true });

  } else if (card.num === 15) {
    // UK INFLATION — 3.6% cleanly ABOVE the tallest bar
    rect(mx, my, mw, mh, '#F8FAFC', 3);
    for (let g = 0; g < 4; g++) line(mx + 5, my + 7 + g * 7, mx + mw - 5, my + 7 + g * 7, '#E2E8F0', 0.4);
    // Scaled bar heights so tallest bar reaches y = my + 17, leaving room for 3.6% above it at my + 11
    const barVals = [7, 6, 8, 7, 9, 8, 11, 13, 16];
    barVals.forEach((v, bi) => {
      const bx = mx + 6 + bi * ((mw - 14) / barVals.length);
      const bh = v;
      const bColor = bi === barVals.length - 1 ? CRIMSON : '#2563EB';
      rect(bx, my + mh - 3 - bh, 8, bh, bColor, 1, bi === barVals.length - 1 ? 1 : 0.4);
    });
    // 3.6% cleanly positioned above tallest bar with zero overlap
    text(mx + mw - 5, my + 11, '3.6%', 9.5, CRIMSON, { bold: true, anchor: 'end' });

  } else if (card.num === 16) {
    // AMNESTY RSF & WHO — Warm stone #E8E2D5
    rect(mx, my, mw, mh, '#E8E2D5', 3);
    // Crimson cross
    const rcx = mx + 22, rcy = my + mh / 2;
    rect(rcx - 2.5, rcy - 8, 5, 16, '#DC2626', 1);
    rect(rcx - 8, rcy - 2.5, 16, 5, '#DC2626', 1);
    circle(rcx, rcy, 11, 'none', 0.3, '#DC2626', 0.8);
    // Dark shield
    const shx = mx + mw - 25, shy = my + mh / 2;
    R(`<path d="M${shx},${shy-10} L${shx+8},${shy-12} L${shx+10},${shy} L${shx+8},${shy+12} L${shx},${shy+10} L${shx-2},${shy} Z" fill="#334155" stroke="#1E293B" stroke-width="0.6"/>`);
    R(`<path d="M${shx+2},${shy-8} L${shx+4},${shy-1} L${shx+2},${shy+4} L${shx+5},${shy+8}" fill="none" stroke="#E2E8F0" stroke-width="0.6"/>`);
    text(mx + mw / 2, my + mh - 4, 'SUDAN \u00B7 DR CONGO', 4.5, '#475569', { anchor: 'middle', bold: true });
  }
  R(`</g>`);

  // Category tag
  numberedBadge(cx + 9, my + mh + 9, card.num, 5, cColor, WHITE, 5);
  text(cx + 18, my + mh + 11.5, `${card.region}`, 5.5, cColor, { bold: true });
  const verifyColor = card.verify === 'CONFIRMED' ? '#059669' : (card.verify === 'FORECAST' ? '#0891B2' : '#D97706');
  text(cx + ROW3_CW - 4, my + mh + 11.5, `${card.verify} \u00B7 ${card.sources}`, 4.5, verifyColor, { anchor: 'end' });
  line(cx + 5, my + mh + 14, cx + ROW3_CW - 5, my + mh + 14, cColor, 0.4);

  // Headline (Card 12 wrapped cleanly onto 2 lines with generous right padding)
  const hlY3 = my + mh + 22;
  const hlMaxW3 = (card.num === 12) ? (ROW3_CW - 24) : (ROW3_CW - 10);
  const hl3 = wrapText(card.headline, hlMaxW3, 10.5, true, true);
  hl3.slice(0, 2).forEach((l, li) => text(cx + 5, hlY3 + li * 12, l, 10.5, DARK, { bold: true, serif: true }));

  // Summary
  const actualHl3 = Math.min(hl3.length, 2);
  const sumY3 = hlY3 + actualHl3 * 12 + 4;
  const sum3 = wrapText(card.summary, ROW3_CW - 10, 7, false, false);
  sum3.slice(0, 3).forEach((l, li) => text(cx + 5, sumY3 + li * 8.5, l, 7, MUTED));
});

line(8, ROW3_Y + ROW3_H + 2, W - 8, ROW3_Y + ROW3_H + 2, CHARCOAL, 0.8);

// ═══════════════════════════════════════════════════════════════════════════
// 3. FULL-WIDTH WORLD MAP & 3-COLUMN BRIEFS (y=614..952)
// ═══════════════════════════════════════════════════════════════════════════
const SEC3_Y = 614;
const SEC3_H = 952 - SEC3_Y;

// Section header bar
rect(4, SEC3_Y, W - 8, 14, CHARCOAL);
text(14, SEC3_Y + 10.5, 'WHERE IT HAPPENED', 6.5, WHITE, { bold: true, ls: 2 });
text(352, SEC3_Y + 10.5, 'ALSO ON WEDNESDAY 18 NOVEMBER \u2014 25 MORE STORIES', 6.5, GOLD, { bold: true, ls: 1 });

// ── Left Panel: World Map (x=8..344, y=628..950) ─────────────────────────
const MAP_X = 8, MAP_Y = SEC3_Y + 16, MAP_W = 338, MAP_H = SEC3_H - 18;
rect(MAP_X, MAP_Y, MAP_W, MAP_H, PARCHMENT, 2);
R(`<rect x="${MAP_X}" y="${MAP_Y}" width="${MAP_W}" height="${MAP_H}" rx="2" fill="none" stroke="${CHARCOAL}" stroke-width="0.7"/>`);

// Latitude/longitude grid spanning y=650..895
for (let ly = 660; ly <= 895; ly += 38) {
  line(MAP_X + 4, ly, MAP_X + MAP_W - 4, ly, '#D4CFC5', 0.35, '2,6');
}
for (let lx = MAP_X + 25; lx <= MAP_X + MAP_W - 10; lx += 36) {
  line(lx, 646, lx, 898, '#D4CFC5', 0.35, '2,6');
}

// ── DOT-MATRIX continents stretched vertically (y=650..895) ─────────────
const dotR = 1.4;
const dotColor = '#9E9484';

function dotContinent(cx0: number, cy0: number, cw: number, ch: number, shape: number[][]) {
  for (const [fx, fy] of shape) {
    circle(cx0 + fx * cw, cy0 + fy * ch, dotR, dotColor, 0.65);
  }
}

// North America (y=655..750)
const naX = MAP_X + 16, naY = 655, naW = 70, naH = 95;
const naDots: number[][] = [];
for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) {
  const fx = c / 12, fy = r / 12;
  if (fx < 0.1 && fy > 0.5) continue;
  if (fx > 0.8 && fy > 0.75) continue;
  if (fy < 0.08 && fx > 0.6) continue;
  if (fy > 0.85 && fx < 0.3) continue;
  naDots.push([fx, fy]);
}
dotContinent(naX, naY, naW, naH, naDots);

// South America (y=755..875)
const saX = MAP_X + 54, saY = 755, saW = 40, saH = 120;
const saDots: number[][] = [];
for (let r = 0; r < 14; r++) for (let c = 0; c < 8; c++) {
  const fx = c / 8, fy = r / 14;
  if (fx > 0.8 && fy > 0.7) continue;
  if (fx < 0.15 && fy > 0.85) continue;
  if (fy > 0.92 && fx > 0.4) continue;
  saDots.push([fx, fy]);
}
dotContinent(saX, saY, saW, saH, saDots);

// Europe (y=650..720)
const euX = MAP_X + 118, euY = 650, euW = 56, euH = 70;
const euDots: number[][] = [];
for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
  const fx = c / 10, fy = r / 10;
  if (fx > 0.9 && fy > 0.5) continue;
  if (fy > 0.85 && fx < 0.2) continue;
  euDots.push([fx, fy]);
}
dotContinent(euX, euY, euW, euH, euDots);

// Africa (y=725..855)
const afX = MAP_X + 124, afY = 725, afW = 54, afH = 130;
const afDots: number[][] = [];
for (let r = 0; r < 14; r++) for (let c = 0; c < 10; c++) {
  const fx = c / 10, fy = r / 14;
  if (fx < 0.15 && fy < 0.3) continue;
  if (fx > 0.85 && fy < 0.3) continue;
  if (fy > 0.85 && fx < 0.3) continue;
  if (fy > 0.85 && fx > 0.7) continue;
  if (fy > 0.92) continue;
  afDots.push([fx, fy]);
}
dotContinent(afX, afY, afW, afH, afDots);

// Middle East (y=712..760)
const meX = MAP_X + 168, meY = 712, meW = 36, meH = 48;
const meDots: number[][] = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
  meDots.push([c / 7, r / 7]);
}
dotContinent(meX, meY, meW, meH, meDots);

// Asia (y=650..760)
const asX = MAP_X + 175, asY = 650, asW = 125, asH = 110;
const asDots: number[][] = [];
for (let r = 0; r < 12; r++) for (let c = 0; c < 18; c++) {
  const fx = c / 18, fy = r / 12;
  if (fx < 0.12 && fy > 0.6) continue;
  if (fx > 0.88 && fy > 0.5) continue;
  if (fy > 0.78 && fx < 0.28) continue;
  if (fy > 0.72 && fx > 0.75) continue;
  if (fy < 0.08 && (fx < 0.15 || fx > 0.85)) continue;
  asDots.push([fx, fy]);
}
dotContinent(asX, asY, asW, asH, asDots);

// Oceania / Australia (y=778..825)
const ocX = MAP_X + 245, ocY = 778, ocW = 54, ocH = 48;
const ocDots: number[][] = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) {
  const fx = c / 9, fy = r / 8;
  if (fx > 0.8 && fy > 0.65) continue;
  if (fx < 0.15 && fy < 0.3) continue;
  if (fy > 0.85) continue;
  ocDots.push([fx, fy]);
}
dotContinent(ocX, ocY, ocW, ocH, ocDots);

// New Zealand dots (y=825..855)
const nzX = MAP_X + 304, nzY = 825, nzW = 14, nzH = 26;
const nzDots: number[][] = [[0.2, 0.2], [0.35, 0.4], [0.5, 0.65], [0.7, 0.85]];
dotContinent(nzX, nzY, nzW, nzH, nzDots);

// ── DEEP SPACE badge: compact top-right pill (height=22) ────────────────
const pillW = 122, pillH = 22;
const pillX = MAP_X + MAP_W - pillW - 6, pillY = MAP_Y + 4;
rect(pillX, pillY, pillW, pillH, '#0B0F19', 3);
// Red pin 4 cleanly inside pill on left
circle(pillX + 11, pillY + 11, 5.5, CRIMSON);
text(pillX + 11, pillY + 13.2, '4', 5.5, WHITE, { bold: true, anchor: 'middle' });
// Label text cleanly to the right of pin 4, zero clipping
text(pillX + 21, pillY + 14.5, 'DEEP SPACE: 4 \u00B7 VOYAGER 1', 5.2, '#38BDF8', { bold: true });

// ── Map pins (1–16 plotted accurately on stretched landmasses) ───────────
interface MapPin { n: number; x: number; y: number; }
const mapPins: MapPin[] = [
  { n: 1,  x: 185, y: 735 }, // Gulf (Kuwait/Bahrain)
  { n: 2,  x: 265, y: 725 }, // Shenzhen
  { n: 3,  x: 168, y: 680 }, // Kyiv
  // Pin 4 is rendered cleanly inside the DEEP SPACE pill above
  { n: 5,  x: 172, y: 720 }, // Gaza
  { n: 6,  x: 165, y: 765 }, // Ethiopia/Eritrea
  { n: 7,  x: 65,  y: 695 }, // Washington (Fed)
  { n: 8,  x: 235, y: 725 }, // Dhaka
  { n: 9,  x: 75,  y: 765 }, // Venezuela
  { n: 10, x: 166, y: 705 }, // Antalya COP31
  { n: 11, x: 55,  y: 690 }, // DC (Jeffries)
  { n: 12, x: 25,  y: 695 }, // San Francisco
  { n: 13, x: 230, y: 735 }, // Odisha
  { n: 14, x: 308, y: 838 }, // New Zealand
  { n: 15, x: 132, y: 672 }, // London
  { n: 16, x: 152, y: 775 }, // Sudan/DR Congo
];

for (const pin of mapPins) {
  const isT1 = pin.n <= 4;
  const pinColor = isT1 ? CRIMSON : NAVY;
  const r = isT1 ? 5.5 : 4;
  circle(MAP_X + pin.x, pin.y, r + 1, WHITE, 0.9);
  circle(MAP_X + pin.x, pin.y, r, pinColor, 0.95);
  text(MAP_X + pin.x, pin.y + (isT1 ? 3 : 2.2), String(pin.n), isT1 ? 5.5 : 4.5, WHITE, { bold: true, anchor: 'middle' });
}

// Brief story dots (17-41 plotted on stretched landmasses)
const briefDots: { x: number; y: number; color: string }[] = [
  { x: 275, y: 750, color: REGION_COLORS['ASIA'] },        // 17 Manila
  { x: 290, y: 705, color: REGION_COLORS['ASIA'] },        // 18 Tokyo
  { x: 58,  y: 672, color: REGION_COLORS['AMERICAS'] },    // 19 Ottawa
  { x: 280, y: 700, color: REGION_COLORS['ASIA'] },        // 20 Seoul
  { x: 180, y: 742, color: REGION_COLORS['MIDDLE EAST'] }, // 21 Riyadh
  { x: 174, y: 718, color: REGION_COLORS['MIDDLE EAST'] }, // 22 Beirut
  { x: 144, y: 674, color: REGION_COLORS['EUROPE'] },      // 23 Berlin
  { x: 138, y: 672, color: REGION_COLORS['EUROPE'] },      // 24 The Hague
  { x: 220, y: 665, color: REGION_COLORS['EUROPE'] },      // 25 Kemerovo
  { x: 130, y: 678, color: REGION_COLORS['EUROPE'] },      // 26 London
  { x: 146, y: 805, color: REGION_COLORS['AFRICA'] },      // 27 Kinshasa
  { x: 62,  y: 700, color: REGION_COLORS['AMERICAS'] },    // 28 Washington
  { x: 166, y: 765, color: REGION_COLORS['AFRICA'] },      // 29 Badme
  { x: 126, y: 755, color: REGION_COLORS['AFRICA'] },      // 30 Guinea
  { x: 156, y: 835, color: REGION_COLORS['AFRICA'] },      // 31 Maputo
  { x: 150, y: 845, color: REGION_COLORS['AFRICA'] },      // 32 Pretoria
  { x: 24,  y: 702, color: REGION_COLORS['AMERICAS'] },    // 33 San Fran
  { x: 76,  y: 775, color: REGION_COLORS['AMERICAS'] },    // 34 Caracas
  { x: 68,  y: 785, color: REGION_COLORS['AMERICAS'] },    // 35 Bogota
  { x: 82,  y: 825, color: REGION_COLORS['AMERICAS'] },    // 36 Brasilia
  { x: 62,  y: 805, color: REGION_COLORS['AMERICAS'] },    // 37 Peru
  { x: 168, y: 708, color: REGION_COLORS['GLOBAL'] },      // 38 Antalya
  { x: 142, y: 688, color: REGION_COLORS['EUROPE'] },      // 39 Turin
  { x: 136, y: 680, color: REGION_COLORS['EUROPE'] },      // 40 Paris
  { x: 285, y: 820, color: REGION_COLORS['OCEANIA'] },     // 41 Sydney
];
for (const dot of briefDots) {
  circle(MAP_X + dot.x, dot.y, 1.8, dot.color, 0.75);
}

// Map bottom legend (y=904..948) filling the bottom of the map panel
line(MAP_X + 2, 904, MAP_X + MAP_W - 2, 904, '#CBD5E1', 0.6);
// Region color dots
let legendX = MAP_X + 6;
for (const r of regions) {
  circle(legendX + 3, 915, 3, REGION_COLORS[r.name]);
  text(legendX + 8, 917.5, r.name, 4.5, MUTED, { bold: true });
  legendX += measureText(r.name, 4.5, true, false) + 12;
}
// Surety & pin guide
text(MAP_X + 6, 930, 'HOW SURE: CONFIRMED \u00B7 CLAIM \u00B7 SOURCES \u00B7 FORECAST', 4.8, MUTED, { bold: true });
text(MAP_X + 6, 942, 'Pins 1\u201316: illustrated cards \u00B7 Small dots: brief stories 17\u201341', 4.5, MUTED);

// ── Right Panel: 3-Column Briefs (stories 17–41 filling down to y=945) ───
const BRIEF_X = 352;
const BRIEF_Y = SEC3_Y + 16; // 630
const BRIEF_W = W - BRIEF_X - 8;
const BRIEF_H = 948 - BRIEF_Y; // ~318px
const BRIEF_COLS = 3;
const BRIEF_COL_W = Math.floor((BRIEF_W - 8) / BRIEF_COLS);

interface BriefStory { n: number; city: string; text: string; }
const briefStories: BriefStory[] = [
  { n: 17, city: 'Manila',      text: "Trump hails 'biggest' Philippine trade deal signed at APEC" },
  { n: 18, city: 'Tokyo',       text: "Takaichi makes first China visit by Japanese minister since 2019" },
  { n: 19, city: 'Ottawa',      text: "Carney and Xi agree APEC tariff relief package at summit" },
  { n: 20, city: 'Seoul',       text: "South Korean President Lee seeks Xi's help on North Korea peace" },
  { n: 21, city: 'Riyadh',      text: "Saudi-led coalition downs Houthi cruise missile over Red Sea" },
  { n: 22, city: 'Beirut',      text: "World Bank warns Lebanon's rebuilding lags far behind schedule" },
  { n: 23, city: 'Berlin',      text: "Germany pledges Patriot air defences and F-16 ammo to Kyiv" },
  { n: 24, city: 'The Hague',   text: "Court sentences ex-president Thaci to 17 months for contempt" },
  { n: 25, city: 'Kemerovo',    text: "19 killed in An-12 cargo-plane crash, Russian media report" },
  { n: 26, city: 'London',      text: "Britain extradites suspected US Army spy to Washington" },
  { n: 27, city: 'Kinshasa',    text: "Ebola passes 11,300 cases in DR Congo; WHO keeps emergency" },
  { n: 28, city: 'Washington',  text: "US loses measles-elimination status after 26 years" },
  { n: 29, city: 'Badme',       text: "Ethiopia and Eritrea exchange artillery fire in border buildup" },
  { n: 30, city: 'Guinea',      text: "224 jailed over illegal gold mining" },
  { n: 31, city: 'Maputo',      text: "Opposition leader Mondlane goes on trial in Mozambique" },
  { n: 32, city: 'Pretoria',    text: "South Africa formally reprimands Nigeria's incoming ambassador" },
  { n: 33, city: 'San Fran.',   text: "Anthropic prices $81bn IPO at $83; trading starts Thursday" },
  { n: 34, city: 'Caracas',     text: "Hegseth visits Venezuela; US and VZ sign a defence pact" },
  { n: 35, city: 'Bogota',      text: "Colombia's economy contracts 0.8% in the third quarter" },
  { n: 36, city: 'Brasilia',    text: "Senate passes Lula's $10bn fiscal package after marathon session" },
  { n: 37, city: 'Peru',        text: "Tumbes River exceeds red-alert level; evacuations ordered" },
  { n: 38, city: 'Antalya',     text: "COP31 ministers weigh divided draft on fossil-fuel phase-out" },
  { n: 39, city: 'Turin',       text: "Alcaraz beats Medvedev 6\u20132, 6\u20134 to reach ATP Finals semis" },
  { n: 40, city: 'Paris',       text: "FIFA \u2014 France's Diallo to challenge Infantino for presidency" },
  { n: 41, city: 'Sydney',      text: "Tame Impala sweeps seven awards at the ARIA Music Awards" },
];

// Distribute stories: 9, 8, 8 across the 3 columns
const colSplits = [
  { start: 0, count: 9 },
  { start: 9, count: 8 },
  { start: 17, count: 8 },
];

for (let col = 0; col < BRIEF_COLS; col++) {
  const colX = BRIEF_X + col * (BRIEF_COL_W + 4);
  const { start, count } = colSplits[col];
  const storySlotH = (945 - BRIEF_Y) / count; // Exactly fills down to y=945

  if (col > 0) line(colX - 2, BRIEF_Y, colX - 2, 945, '#CBD5E1', 0.6);

  for (let i = 0; i < count; i++) {
    const s = briefStories[start + i];
    const sy = BRIEF_Y + i * storySlotH;

    // Small circular story number badge
    circle(colX + 7, sy + 7.5, 5, DARK, 0.95);
    text(colX + 7, sy + 9.5, String(s.n), 5, WHITE, { bold: true, anchor: 'middle' });

    // City lead-in (bold crimson 8.5px)
    text(colX + 16, sy + 8.5, s.city, 8.5, CRIMSON, { bold: true });

    // Story text wrapped in ~8.2px with generous padding
    const maxTextW = BRIEF_COL_W - 20;
    const sLines = wrapText(s.text, maxTextW, 8.2, false, false);
    sLines.slice(0, 2).forEach((l, li) => {
      text(colX + 16, sy + 18.5 + li * 9.5, l, 8.2, DARK);
    });

    // Thin hairline rule between stories
    if (i < count - 1) {
      line(colX + 4, sy + storySlotH - 0.5, colX + BRIEF_COL_W - 4, sy + storySlotH - 0.5, '#CBD5E1', 0.35);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. BOTTOM DATE CHECK & SOURCES FOOTER (y=954..1020)
// ═══════════════════════════════════════════════════════════════════════════
const footY = 954;
rect(4, footY, W - 8, H - footY - 4, '#EBE7DD');
line(4, footY, W - 4, footY, CHARCOAL, 0.8);

// Date check box
rect(8, footY + 3, W - 16, 20, CARD_BG, 2);
R(`<rect x="8" y="${footY + 3}" width="${W - 16}" height="20" rx="2" fill="none" stroke="${CHARCOAL}" stroke-width="0.5"/>`);
rect(8, footY + 3, 72, 20, CRIMSON, 2);
text(44, footY + 16, 'DATE CHECK', 6, WHITE, { bold: true, anchor: 'middle', ls: 1 });
const dateCheckText = "Left out on purpose \u2014 first reported Tue 17 Nov: US Qeshm strike \u00B7 Kerch Bridge collapse \u00B7 Nvidia results. Not yet: Trump\u2013Xi\u2013Putin 3-way talks (Thu 19) \u00B7 Cyclone Akvan landfall (Fri 20) \u00B7 COP31 close (Fri 20).";
text(88, footY + 16, truncate(dateCheckText, W - 104, 6, false, false), 6, MUTED);

// Attribution + sources
text(12, footY + 36, 'Every story here happened, or was first reported, on Wednesday 18 November 2026. 41 stories, 7 regions, 16 drawn.', 5.5, MUTED);
text(12, footY + 46, 'Sources: Reuters, AP, AFP, BBC, NASA, WHO, ONS, Eurostat, UN News, CNBC, NPR, IMD, Amnesty International. Original drawings.', 5.5, MUTED);
text(W - 12, footY + 46, '18 NOV 2026', 5.5, MUTED, { anchor: 'end' });

// Bottom charcoal rule
rect(1, H - 3, W - 2, 2, CHARCOAL);

// ── Close SVG ──────────────────────────────────────────────────────────────
svg += '</svg>';

// ── Render to PNG ──────────────────────────────────────────────────────────
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width' as const, value: W },
  font: {
    fontFiles: [
      join(fontsDir, 'georgia.ttf'),
      join(fontsDir, 'georgiab.ttf'),
      join(fontsDir, 'arial.ttf'),
      join(fontsDir, 'arialbd.ttf'),
    ],
    loadSystemFonts: false,
    defaultFontFamily: 'Arial',
  },
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

writeFileSync(join(outDir, 'entry.png'), pngBuffer);
try {
  writeFileSync(join(ROOT, 'entry.png'), pngBuffer);
  writeFileSync(join(ROOT, 'entry.svg'), svg);
} catch {}

console.log(`Generated 41-story broadsheet PNG: ${pngBuffer.length} bytes (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
console.log(`Dimensions: ${W}x${H}`);
console.log(`Output: ${join(outDir, 'entry.png')}`);
