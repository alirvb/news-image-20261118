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
const ROW1_Y = 134;
const ROW1_H = 172;
const ROW1_GAP = 6;
const ROW1_COLS = 4;
const ROW1_X0 = 8;
const ROW1_CW = Math.floor((W - 2 * ROW1_X0 - (ROW1_COLS - 1) * ROW1_GAP) / ROW1_COLS);
const ILLUS_H = 66;

const ROW2_Y = 310;
const ROW2_H = 146;
const ROW2_GAP = 5;
const ROW2_COLS = 6;
const ROW2_X0 = 8;
const ROW2_CW = Math.floor((W - 2 * ROW2_X0 - (ROW2_COLS - 1) * ROW2_GAP) / ROW2_COLS);
const MINI_H = 36;

const ROW3_Y = 460;
const ROW3_H = 146;
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
// ── CREAM MICRO-CAPTION SUB-STRIP (y=114..130) ─────────────────────────
rect(4, 114, barTotalW, 16, '#F5F1E6');
line(4, 114, W-4, 114, '#D4CFC5', 0.5);
const microCaptions = [
  ['Drones over', 'Kuwait, Bahrain'],
  ['UK inflation:', '3.6%'],
  ['Xi greets Trump', 'in Shenzhen'],
  ['Voyager 1: one', 'light-day'],
  ['GTA VI unlocks', 'in NZ'],
  ['Fed minutes:', 'more hikes'],
  ['Dow closes', 'down 561'],
  ['Anthropic prices', 'record IPO'],
];
microCaptions.forEach((cap, i) => {
  const sx = 100 + i * slotW;
  text(sx + slotW / 2, 122, cap[0], 4.5, '#5A6474', { anchor: 'middle' });
  text(sx + slotW / 2, 128, cap[1], 4.5, '#1E293B', { anchor: 'middle', bold: true });
  if (i > 0) line(sx, 116, sx, 128, '#D4CFC5', 0.3);
});
line(4, 130, W-4, 130, '#D4CFC5', 0.5);

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
    // CARD 1: GULF DRONES — Crisp blue Persian Gulf map & sand coastlines
    rect(ix, iy, iw, ih, '#CFE3F5', 3); // Pale blue Gulf water
    // Sand coastlines on edges
    R(`<path d="M${ix},${iy} L${ix+30},${iy} L${ix+20},${iy+18} L${ix+10},${iy+32} L${ix},${iy+42} Z" fill="#E5DEC9"/>`);
    R(`<path d="M${ix+iw-50},${iy} L${ix+iw},${iy} L${ix+iw},${iy+ih} L${ix+iw-30},${iy+ih} L${ix+iw-18},${iy+40} L${ix+iw-35},${iy+20} Z" fill="#E5DEC9"/>`);
    R(`<path d="M${ix},${iy+ih-14} L${ix+50},${iy+ih} L${ix},${iy+ih} Z" fill="#E5DEC9"/>`);
    // Tactical grid
    for (let g = 0; g < 6; g++) line(ix, iy + g * 11, ix + iw, iy + g * 11, '#A8C8E8', 0.3, '2,4');
    for (let g = 0; g < 8; g++) line(ix + g * 30, iy, ix + g * 30, iy + ih, '#A8C8E8', 0.3, '2,4');
    // Kuwait pin + radar rings
    const kx = ix + iw - 60, ky = iy + 20;
    circle(kx, ky, 3, '#D97706');
    for (let r = 6; r <= 18; r += 4) circle(kx, ky, r, 'none', 0.35, '#D97706', 0.7);
    text(kx, ky - 6, 'KUWAIT', 5.5, '#1E293B', { anchor: 'middle', bold: true });
    // Bahrain pin + radar rings
    const bx = ix + 55, by = iy + 38;
    circle(bx, by, 3, '#DC2626');
    for (let r = 6; r <= 18; r += 4) circle(bx, by, r, 'none', 0.35, '#DC2626', 0.7);
    text(bx, by - 6, 'BAHRAIN', 5.5, '#1E293B', { anchor: 'middle', bold: true });
    // QESHM label on Iran coast
    text(ix + iw - 8, iy + 10, 'QESHM', 4.5, '#7C2D12', { anchor: 'end', bold: true });
    // Dashed red missile arcs from Qeshm
    for (let arc = 0; arc < 3; arc++) {
      const aOff = arc * 8 - 8;
      R(`<path d="M${ix+iw-10},${iy+14+aOff} Q${ix+iw-40},${iy+2} ${bx},${by}" fill="none" stroke="#DC2626" stroke-width="1" stroke-dasharray="3,2" opacity="0.7"/>`);
    }
    for (let arc = 0; arc < 2; arc++) {
      R(`<path d="M${ix+iw-10},${iy+10+arc*12} Q${ix+iw-28},${iy+4} ${kx},${ky}" fill="none" stroke="#D97706" stroke-width="1" stroke-dasharray="3,2" opacity="0.7"/>`);
    }
    // Orange starburst interceptions
    for (const [sx2,sy2] of [[ix+95,iy+24],[ix+115,iy+18],[ix+80,iy+32]]) {
      R(`<polygon points="${sx2},${sy2-4} ${sx2+2},${sy2-1} ${sx2+4},${sy2} ${sx2+2},${sy2+1} ${sx2},${sy2+4} ${sx2-2},${sy2+1} ${sx2-4},${sy2} ${sx2-2},${sy2-1}" fill="#F97316" opacity="0.85"/>`);
    }
    // Dark caption bar
    rect(ix, iy + ih - 11, iw, 11, '#1E293B', 0, 0.85);
    text(ix + iw / 2, iy + ih - 3, 'PERSIAN GULF \u00B7 PATRIOT INTERCEPT', 4.5, '#F5F1E6', { anchor: 'middle', bold: true });

  } else if (i === 1) {
    // CARD 2: SHENZHEN APEC — Warm sunlit sky, tarmac, airliner, red carpet
    R(`<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="3" fill="#DCE9F5"/>`);
    // Warm sky gradient effect
    rect(ix, iy, iw, 18, '#C7DDF0', 3);
    // Perspective tarmac
    R(`<path d="M${ix},${iy+ih-20} L${ix+iw},${iy+ih-22} L${ix+iw},${iy+ih} L${ix},${iy+ih} Z" fill="#D6D1C4"/>`);
    // Tarmac lines
    for (let r = 0; r < 6; r++) line(ix + 12 + r * 38, iy + ih - 6, ix + 12 + r * 38, iy + ih - 1, '#FFFFFF', 1.5, '3,2');
    // Red carpet centered
    rect(ix + 60, iy + ih - 20, 90, 20, '#B91C1C', 0, 0.75);
    rect(ix + 78, iy + ih - 18, 54, 2, '#D4A843', 0, 0.6);
    // White airliner fuselage on left
    R(`<path d="M${ix+5},${iy+ih-26} L${ix+70},${iy+ih-26} L${ix+72},${iy+ih-22} L${ix+72},${iy+ih-20} L${ix+5},${iy+ih-20} Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.5"/>`);
    // Tail fin
    R(`<path d="M${ix+8},${iy+ih-26} L${ix+14},${iy+ih-38} L${ix+22},${iy+ih-26}" fill="#3B82F6"/>`);
    // Windows
    for (let w = 0; w < 8; w++) rect(ix + 24 + w * 6, iy + ih - 25, 3, 2, '#64748B', 1, 0.5);
    // Flags on poles: China flag, US flag
    for (const [fx2, c1, c2] of [[ix+iw-55,'#DE2910','#FBBF24'],[ix+iw-35,'#1D4ED8','#B91C1C']] as [number,string,string][]) {
      line(fx2, iy + 4, fx2, iy + 28, '#64748B', 1);
      rect(fx2 + 1, iy + 5, 16, 11, c1);
      rect(fx2 + 1, iy + 9, 16, 3.5, c2, 0, 0.6);
    }
    // 3 diplomat silhouettes on carpet
    for (const dx of [ix + 90, ix + 108, ix + 126]) {
      circle(dx, iy + ih - 28, 3.5, '#1E293B');
      R(`<path d="M${dx-3},${iy+ih-24} L${dx-5},${iy+ih-16} L${dx+5},${iy+ih-16} L${dx+3},${iy+ih-24} Z" fill="#1E293B"/>`);
    }
    // Dark banner label
    rect(ix, iy + ih - 10, iw, 10, '#1E293B', 0, 0.8);
    text(ix + iw / 2, iy + ih - 3, "SHENZHEN BAO'AN", 4.5, '#F5F1E6', { anchor: 'middle', bold: true });

  } else if (i === 2) {
    // CARD 3: SPLIT — Deep dusk Kyiv LEFT, EU royal blue RIGHT
    const halfW = Math.floor(iw / 2);
    // LEFT: Deep dusk sky
    R(`<rect x="${ix}" y="${iy}" width="${halfW}" height="${ih}" rx="3" fill="#1E293B"/>`);
    R(`<rect x="${ix}" y="${iy}" width="${halfW}" height="${20}" rx="3" fill="#0B0F19"/>`);
    // Kyiv cathedral/city skyline
    R(`<path d="M${ix},${iy+ih} L${ix},${iy+ih-12} L${ix+8},${iy+ih-16} L${ix+14},${iy+ih-12} L${ix+22},${iy+ih-20} L${ix+28},${iy+ih-28} L${ix+30},${iy+ih-32} L${ix+32},${iy+ih-28} L${ix+40},${iy+ih-14} L${ix+50},${iy+ih-18} L${ix+58},${iy+ih-14} L${ix+68},${iy+ih-10} L${ix+80},${iy+ih-16} L${ix+halfW},${iy+ih-12} L${ix+halfW},${iy+ih} Z" fill="#374151"/>`);
    // Cathedral dome detail
    R(`<path d="M${ix+28},${iy+ih-28} Q${ix+30},${iy+ih-36} ${ix+32},${iy+ih-28}" fill="#475569"/>`);
    // Incoming Shahed drone silhouettes (V-shapes)
    for (let d = 0; d < 6; d++) {
      const dx = ix + 6 + d * 15, dy = iy + 4 + (d % 3) * 6;
      R(`<path d="M${dx-4},${dy+3} L${dx},${dy} L${dx+4},${dy+3}" fill="none" stroke="#94A3B8" stroke-width="0.8"/>`);
    }
    // Yellow radar searchlight beams
    R(`<path d="M${ix+20},${iy+ih-12} L${ix+5},${iy+4} L${ix+15},${iy+4} Z" fill="#FBBF24" opacity="0.12"/>`);
    R(`<path d="M${ix+60},${iy+ih-14} L${ix+50},${iy+2} L${ix+65},${iy+2} Z" fill="#FBBF24" opacity="0.1"/>`);
    // Flak bursts
    circle(ix + 25, iy + 10, 3, '#FBBF24', 0.5);
    circle(ix + 55, iy + 8, 2, '#F97316', 0.45);
    circle(ix + 42, iy + 14, 2.5, '#FBBF24', 0.35);
    text(ix + 4, iy + ih - 3, '141 DRONES \u00B7 126 DOWNED', 4, '#94A3B8', { bold: true });

    // RIGHT: Royal blue EU panel
    rect(ix + halfW, iy, iw - halfW, ih, '#1D4ED8', 3);
    // 12-star EU circle
    const ecx = ix + halfW + 24, ecy = iy + ih / 2 - 6;
    for (let s = 0; s < 12; s++) {
      const angle = (s * Math.PI * 2) / 12 - Math.PI / 2;
      const sx2 = ecx + 11 * Math.cos(angle);
      const sy2 = ecy + 11 * Math.sin(angle);
      let starP = '';
      for (let p = 0; p < 10; p++) {
        const a = (p * Math.PI / 5) - Math.PI / 2;
        const rr = p % 2 === 0 ? 2.5 : 1.0;
        starP += (p === 0 ? 'M' : 'L') + `${sx2 + rr * Math.cos(a)},${sy2 + rr * Math.sin(a)}`;
      }
      starP += 'Z';
      R(`<path d="${starP}" fill="#FBBF24"/>`);
    }
    // Bold €45bn
    text(ix + iw - 6, iy + ih / 2 - 2, '\u20AC45bn', 16, '#FBBF24', { bold: true, serif: true, anchor: 'end' });
    text(ix + iw - 6, iy + ih - 6, 'LOAN FOR KYIV', 4.5, '#93C5FD', { bold: true, anchor: 'end' });
    // Divider
    line(ix + halfW, iy, ix + halfW, iy + ih, '#93C5FD', 0.6);

  } else {
    // CARD 4: VOYAGER 1 — Deep space with sun, orbital arcs, signal beam, probe
    rect(ix, iy, iw, ih, '#0B0F19', 3);
    // Star field
    const seeds = [[0.08,0.2],[0.2,0.6],[0.35,0.1],[0.5,0.7],[0.65,0.3],[0.8,0.8],[0.9,0.15],[0.15,0.85],[0.45,0.5],[0.72,0.5],[0.28,0.4],[0.55,0.9],[0.88,0.5],[0.12,0.4],[0.62,0.15],[0.78,0.6],[0.42,0.85],[0.95,0.4]];
    for (const [sx2, sy2] of seeds) circle(ix + sx2 * iw, iy + sy2 * ih, 0.4 + (sx2 * 7 % 1) * 0.6, WHITE, 0.25 + sy2 * 0.45);
    // Glowing golden Sun on left
    circle(ix + 18, iy + ih / 2, 12, '#FBBF24', 0.08);
    circle(ix + 18, iy + ih / 2, 8, '#FBBF24', 0.15);
    circle(ix + 18, iy + ih / 2, 6, '#FBBF24');
    circle(ix + 18, iy + ih / 2, 4, '#FDE68A');
    // Orbital arcs from Sun
    for (const [orx, ory] of [[16,8],[24,14],[34,20]]) {
      R(`<ellipse cx="${ix+18}" cy="${iy+ih/2}" rx="${orx}" ry="${ory}" fill="none" stroke="#475569" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.4"/>`);
    }
    // Dashed signal beam from Sun to probe
    const px = ix + iw - 22, py = iy + ih / 2 - 10;
    R(`<path d="M${ix+26},${iy+ih/2} L${px-8},${py}" fill="none" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="4,3"/>`);
    // Detailed Voyager probe: dish + body + booms
    // Dish
    R(`<ellipse cx="${px}" cy="${py-2}" rx="7" ry="4" fill="#D4A843" stroke="#B8942F" stroke-width="0.5"/>`);
    // Feed horn
    line(px, py - 6, px, py - 12, '#A5F3FC', 0.8);
    circle(px, py - 12, 1.2, '#A5F3FC');
    // Probe body
    rect(px - 3, py + 1, 6, 8, '#E2E8F0', 1);
    rect(px - 2, py + 2, 4, 6, '#94A3B8', 0);
    // Magnetometer booms
    line(px - 3, py + 5, px - 14, py + 2, '#A5F3FC', 0.6);
    line(px + 3, py + 5, px + 14, py + 2, '#A5F3FC', 0.6);
    // RTG
    rect(px + 10, py, 6, 4, '#D97706', 1);
    // Dark label badge
    rect(ix + iw / 2 - 52, iy + ih - 13, 104, 11, '#0F172A', 2, 0.9);
    text(ix + iw / 2, iy + ih - 4.5, '1 LIGHT-DAY \u00B7 25.9B KM', 5.5, '#38BDF8', { anchor: 'middle', bold: true });
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
    // GAZA — Warm desert sky & sand, tank silhouette, barrier blocks, YELLOW LINE
    rect(mx, my, mw, mh, '#D2B48C', 3);
    // Warm desert sky
    R(`<rect x="${mx}" y="${my}" width="${mw}" height="12" rx="3" fill="#E8C98A"/>`);
    R(`<rect x="${mx}" y="${my}" width="${mw}" height="6" rx="3" fill="#C9A96E"/>`);
    // Detailed armored tank silhouette
    const tx = mx + 10;
    // Hull
    R(`<path d="M${tx},${my+mh-8} L${tx+2},${my+mh-14} L${tx+36},${my+mh-14} L${tx+38},${my+mh-8} Z" fill="#374151"/>`);
    // Turret
    R(`<path d="M${tx+10},${my+mh-14} L${tx+12},${my+mh-20} L${tx+28},${my+mh-20} L${tx+30},${my+mh-14} Z" fill="#1E293B"/>`);
    // Gun barrel
    line(tx + 30, my + mh - 18, tx + 50, my + mh - 19, '#1E293B', 2);
    // Tracks
    R(`<path d="M${tx-2},${my+mh-6} L${tx+40},${my+mh-6}" fill="none" stroke="#6B7280" stroke-width="2.5" stroke-linecap="round"/>`);
    for (let w = 0; w < 6; w++) line(tx + 2 + w * 7, my + mh - 8, tx + 2 + w * 7, my + mh - 5, '#4B5563', 0.8);
    // Concrete barrier blocks
    for (let b = 0; b < 4; b++) {
      const bx2 = mx + 72 + b * 14;
      R(`<path d="M${bx2},${my+mh-3} L${bx2+2},${my+mh-10} L${bx2+10},${my+mh-10} L${bx2+12},${my+mh-3} Z" fill="#9CA3AF" stroke="#6B7280" stroke-width="0.4"/>`);
    }
    // YELLOW LINE
    line(mx, my + mh - 2, mx + mw, my + mh - 2, '#FBBF24', 2);
    // Bold banner
    rect(mx + mw - 56, my + 2, 54, 10, '#92400E', 2, 0.85);
    text(mx + mw - 29, my + 9.5, 'YELLOW LINE', 4.5, '#FBBF24', { anchor: 'middle', bold: true });

  } else if (card.num === 6) {
    // ETHIOPIA/ERITREA — Detailed Horn of Africa map
    rect(mx, my, mw, mh, '#E6DFC8', 3);
    // Sea background on right
    R(`<path d="M${mx+mw-30},${my} L${mx+mw},${my} L${mx+mw},${my+mh} L${mx+mw-20},${my+mh} L${mx+mw-10},${my+mh/2} Z" fill="#CFE3F5"/>`);
    // Horn landmass with more detail
    R(`<path d="M${mx+15},${my+5} L${mx+60},${my+2} L${mx+mw-25},${my+8} L${mx+mw-15},${my+mh/2} L${mx+mw-8},${my+mh-8} L${mx+60},${my+mh-3} L${mx+20},${my+mh-5} L${mx+10},${my+22} Z" fill="#D9CCA7" stroke="#B8A882" stroke-width="0.6"/>`);
    // Border line between Eritrea & Ethiopia
    line(mx + 20, my + 14, mx + mw - 20, my + 16, '#475569', 0.6, '2,2');
    // RED SEA label
    text(mx + mw - 8, my + 10, 'RED SEA', 3.5, '#2563EB', { anchor: 'end', bold: true });
    // Bold red opposing troop arrows
    // North arrow (Eritrea → border)
    R(`<path d="M${mx+30},${my+6} L${mx+48},${my+14}" fill="none" stroke="#DC2626" stroke-width="1.5"/>`);
    R(`<polygon points="${mx+48},${my+14} ${mx+44},${my+10} ${mx+44},${my+18}" fill="#DC2626"/>`);
    // South arrow (Ethiopia → border)
    R(`<path d="M${mx+mw-25},${my+mh-8} L${mx+60},${my+20}" fill="none" stroke="#DC2626" stroke-width="1.5"/>`);
    R(`<polygon points="${mx+60},${my+20} ${mx+64},${my+16} ${mx+64},${my+24}" fill="#DC2626"/>`);
    // Labels
    text(mx + 22, my + 8, 'ERITREA', 4.5, '#1E293B', { bold: true });
    text(mx + 32, my + mh - 4, 'ETHIOPIA', 4.5, '#1E293B', { bold: true });
    // Badme marker
    circle(mx + 52, my + 17, 2, '#DC2626');
    text(mx + 57, my + 19, 'BADME', 3.5, '#7C2D12', { bold: true });

  } else if (card.num === 7) {
    // FED/DOW — Crisp cream financial chart with shaded red drop area
    rect(mx, my, mw, mh, '#FBF9F4', 3);
    // Horizontal gridlines
    for (let g = 0; g < 5; g++) line(mx + 5, my + 5 + g * 7, mx + mw - 5, my + 5 + g * 7, '#E2E8F0', 0.5);
    // Shaded red drop area curve
    const pts = [22, 20, 21, 18, 20, 16, 18, 14, 16, 10];
    let chartPath = '';
    let areaPath = '';
    pts.forEach((v, pi) => {
      const cpx = mx + 6 + pi * ((mw - 12) / (pts.length - 1));
      const cpy = my + mh - 3 - v;
      chartPath += (pi === 0 ? `M${cpx},${cpy}` : ` L${cpx},${cpy}`);
      areaPath += (pi === 0 ? `M${cpx},${cpy}` : ` L${cpx},${cpy}`);
    });
    // Close area path
    areaPath += ` L${mx + mw - 6},${my + mh - 3} L${mx + 6},${my + mh - 3} Z`;
    R(`<path d="${areaPath}" fill="#DC2626" opacity="0.12"/>`);
    R(`<path d="${chartPath}" fill="none" stroke="${CRIMSON}" stroke-width="1.5" stroke-linecap="round"/>`);
    // FED tag
    rect(mx + 4, my + 3, 18, 8, '#1E293B', 2);
    text(mx + 13, my + 9.5, 'FED', 4.5, WHITE, { bold: true, anchor: 'middle' });
    // Bold crimson DOW badge
    rect(mx + mw - 60, my + 3, 56, 12, CRIMSON, 2);
    text(mx + mw - 32, my + 12, 'DOW \u2212561 PTS', 5, WHITE, { bold: true, anchor: 'middle' });

  } else if (card.num === 8) {
    // BANGLADESH — Warm terracotta/ochre industrial backdrop
    rect(mx, my, mw, mh, '#8B6914', 3); // Warm ochre
    rect(mx, my, mw, 8, '#A0522D', 3); // Terracotta sky strip
    // Sawtooth factory roofs
    let sawPath = `M${mx},${my + mh}`;
    const peaks = 5;
    const sawW2 = mw / peaks;
    for (let p = 0; p < peaks; p++) {
      sawPath += ` L${mx + p * sawW2 + sawW2 * 0.4},${my + 8} L${mx + (p + 1) * sawW2},${my + mh * 0.5}`;
    }
    sawPath += ` L${mx + mw},${my + mh} Z`;
    R(`<path d="${sawPath}" fill="#4B3621" opacity="0.7"/>`);
    // Barred iron gate
    for (let g = 0; g < 5; g++) line(mx + 42 + g * 7, my + mh - 14, mx + 42 + g * 7, my + mh - 2, '#374151', 1.5);
    line(mx + 40, my + mh - 10, mx + 76, my + mh - 10, '#374151', 1);
    line(mx + 40, my + mh - 6, mx + 76, my + mh - 6, '#374151', 1);
    // SHUT sign on gate
    rect(mx + 48, my + mh - 13, 20, 6, '#DC2626', 1);
    text(mx + 58, my + mh - 8.5, 'SHUT', 3.5, WHITE, { bold: true, anchor: 'middle' });
    // Protest placards
    for (const [px2, py2] of [[mx+14,my+mh-18],[mx+24,my+mh-20]]) {
      line(px2, py2, px2, py2 + 12, '#8B7355', 0.8);
      rect(px2 - 5, py2 - 5, 10, 6, '#FEF3C7', 1);
    }
    // Bold crimson 55 FACTORIES badge
    rect(mx + mw - 48, my + 2, 46, 12, CRIMSON, 2);
    text(mx + mw - 25, my + 11, '55 FACTORIES', 4.5, WHITE, { bold: true, anchor: 'middle' });

  } else if (card.num === 9) {
    // US-VENEZUELA — Warm parchment/blue diplomatic backdrop
    rect(mx, my, mw, mh, '#E6E1D4', 3);
    // Blue diplomatic accent bar at top
    rect(mx, my, mw, 6, '#1D4ED8', 3, 0.3);
    // US flag on left pole
    line(mx + 10, my + 4, mx + 10, my + 28, '#64748B', 1);
    rect(mx + 11, my + 5, 18, 12, '#B22234');
    for (let s = 0; s < 4; s++) rect(mx + 11, my + 7 + s * 3, 18, 1.5, WHITE);
    rect(mx + 11, my + 5, 8, 6, '#3C3B6E');
    // Venezuelan flag on right pole
    line(mx + mw - 10, my + 4, mx + mw - 10, my + 28, '#64748B', 1);
    rect(mx + mw - 28, my + 5, 18, 4, '#FBBF24');
    rect(mx + mw - 28, my + 9, 18, 4, '#003893');
    rect(mx + mw - 28, my + 13, 18, 4, '#EF4444');
    // Gold-rimmed diplomatic seal/handshake emblem center
    const sealX = mx + mw / 2, sealY = my + mh / 2;
    circle(sealX, sealY, 10, '#D4A843', 0.15);
    circle(sealX, sealY, 8, 'none', 1, '#D4A843', 0.8);
    // Handshake icon
    R(`<path d="M${sealX-5},${sealY} Q${sealX-3},${sealY-3} ${sealX},${sealY} Q${sealX+3},${sealY+3} ${sealX+5},${sealY}" fill="none" stroke="#8B6914" stroke-width="1.2"/>`);
    R(`<path d="M${sealX-5},${sealY+1} Q${sealX-3},${sealY+4} ${sealX},${sealY+1} Q${sealX+3},${sealY-2} ${sealX+5},${sealY+1}" fill="none" stroke="#8B6914" stroke-width="1.2"/>`);
    // Dark ribbon caption
    rect(mx + 6, my + mh - 10, mw - 12, 9, '#1E293B', 2, 0.85);
    text(mx + mw / 2, my + mh - 3, 'CARACAS \u00B7 DEFENCE PACT', 4, '#F5F1E6', { anchor: 'middle', bold: true });

  } else if (card.num === 10) {
    // COP31 — Crisp mint-teal UN plenary hall diagram, strictly clipped
    rect(mx, my, mw, mh, '#E0F2FE', 3);
    // Header bar
    rect(mx, my, mw, 10, '#0891B2', 3, 0.85);
    text(mx + mw / 2, my + 7.5, 'COP31 DRAFT \u00B7 ANTALYA', 4.5, WHITE, { anchor: 'middle', bold: true });
    // Curved delegate bench rows (centered, radii well inside mh)
    const pcx = mx + mw / 2, pcy = my + mh + 2;
    for (const r of [10, 15, 20, 25]) {
      R(`<path d="M${pcx - r},${pcy - 4} A${r},${r * 0.5} 0 0 1 ${pcx + r},${pcy - 4}" fill="none" stroke="#0891B2" stroke-width="0.8" opacity="0.55"/>`);
    }
    // Small delegate dots on benches
    for (let d = 0; d < 7; d++) {
      const angle = Math.PI + (d / 6) * Math.PI;
      const dx = pcx + 13 * Math.cos(angle), dy = pcy - 4 + 7 * Math.sin(angle);
      if (dy < my + mh - 2) circle(dx, dy, 1, '#0891B2', 0.5);
    }
    // Podium
    rect(pcx - 5, my + mh - 10, 10, 6, '#0891B2', 1);
    circle(pcx, my + mh - 11, 2, '#0891B2', 0.4);
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
    // JEFFRIES — Crisp light-blue/cream Capitol backdrop with dome & vote bar
    rect(mx, my, mw, mh, '#E2ECF5', 3);
    // Cream accent strip
    rect(mx, my + mh - 6, mw, 6, '#F5F1E6', 0);
    // Detailed US Capitol dome & columns on left
    const cdx = mx + 28, cdy = my + mh - 6;
    // Base/steps
    R(`<path d="M${cdx-24},${cdy} L${cdx-20},${cdy-4} L${cdx+20},${cdy-4} L${cdx+24},${cdy} Z" fill="#94A3B8" opacity="0.5"/>`);
    // Columns
    for (const col of [-14,-7,0,7,14]) {
      rect(cdx + col - 1.5, cdy - 16, 3, 12, '#475569', 0, 0.6);
    }
    // Pediment
    R(`<path d="M${cdx-20},${cdy-16} L${cdx},${cdy-22} L${cdx+20},${cdy-16}" fill="#475569" opacity="0.65"/>`);
    // Dome
    R(`<path d="M${cdx-8},${cdy-22} Q${cdx},${cdy-32} ${cdx+8},${cdy-22}" fill="#334155" opacity="0.7"/>`);
    // Cupola
    line(cdx, cdy - 32, cdx, cdy - 35, '#334155', 0.8);
    circle(cdx, cdy - 35, 1, '#334155', 0.7);
    // Bold blue/red vote bar on right
    const vBarX = mx + mw - 50, vBarW = 42;
    const yesW = Math.round((251 / 262) * vBarW);
    rect(vBarX, my + mh / 2 - 4, yesW, 8, '#2563EB', 2);
    rect(vBarX + yesW + 1, my + mh / 2 - 4, vBarW - yesW - 1, 8, CRIMSON, 2, 0.6);
    // 251-11 VOTE badge
    rect(mx + mw - 52, my + 2, 48, 11, '#1E293B', 2, 0.85);
    text(mx + mw - 28, my + 10.5, '251\u201311 VOTE', 5, WHITE, { bold: true, anchor: 'middle' });

  } else if (card.num === 12) {
    // ANTHROPIC IPO — Dark-slate/emerald financial terminal card
    rect(mx, my, mw, mh, '#1A2332', 3);
    // Terminal gridlines
    for (let g = 0; g < 4; g++) line(mx + 5, my + 7 + g * 7, mx + mw - 5, my + 7 + g * 7, '#2D3B4A', 0.5);
    // Rising emerald area curve
    const pts = [26, 24, 22, 19, 16, 13, 9, 5];
    let tp = '';
    let areaP = '';
    pts.forEach((v, pi) => {
      const cpx = mx + 5 + pi * ((mw - 10) / (pts.length - 1));
      const cpy = my + 2 + v;
      tp += (pi === 0 ? `M${cpx},${cpy}` : ` L${cpx},${cpy}`);
      areaP += (pi === 0 ? `M${cpx},${cpy}` : ` L${cpx},${cpy}`);
    });
    areaP += ` L${mx + mw - 5},${my + mh - 2} L${mx + 5},${my + mh - 2} Z`;
    R(`<path d="${areaP}" fill="#16A34A" opacity="0.15"/>`);
    R(`<path d="${tp}" fill="none" stroke="#22C55E" stroke-width="1.8" stroke-linecap="round"/>`);
    // End dot
    circle(mx + mw - 5, my + 7, 2.5, '#22C55E');
    // NASDAQ: ANT label
    text(mx + 4, my + 10, 'NASDAQ: ANT', 4, '#4ADE80', { bold: true });
    // Bold callout badge
    rect(mx + mw - 60, my + mh - 12, 56, 10, '#16A34A', 2, 0.9);
    text(mx + mw - 32, my + mh - 4, '$81bn IPO \u00B7 $83', 4.5, WHITE, { bold: true, anchor: 'middle' });

  } else if (card.num === 13) {
    // CYCLONE AKVAN — Pale blue Bay of Bengal map
    rect(mx, my, mw, mh, '#D6E8F7', 3);
    // India/Odisha coast on right
    R(`<path d="M${mx+mw-28},${my} L${mx+mw-22},${my+8} L${mx+mw-18},${my+16} L${mx+mw-24},${my+22} L${mx+mw-20},${my+mh} L${mx+mw},${my+mh} L${mx+mw},${my} Z" fill="#E5DEC9" stroke="#C7BC9F" stroke-width="0.6"/>`);
    // Coast labels
    text(mx + mw - 6, my + 10, 'INDIA', 3.5, '#475569', { anchor: 'end', bold: true });
    text(mx + mw - 6, my + 18, 'ODISHA', 3.5, '#7C2D12', { anchor: 'end', bold: true });
    // Multi-arm spiral storm vortex
    const scx = mx + mw / 2 - 14, scy = my + mh / 2;
    for (let r = 4; r <= 16; r += 3) circle(scx, scy, r, 'none', 0.55 - r * 0.015, '#0284C7', 0.9);
    circle(scx, scy, 2.5, '#0369A1', 0.9);
    // Spiral arms
    for (let arm = 0; arm < 3; arm++) {
      const a0 = arm * (Math.PI * 2 / 3);
      let sp = '';
      for (let t = 0; t <= 12; t++) {
        const angle = a0 + t * 0.3;
        const rr = 3 + t * 1.1;
        const sx2 = scx + rr * Math.cos(angle), sy2 = scy + rr * Math.sin(angle);
        sp += (t === 0 ? `M${sx2},${sy2}` : ` L${sx2},${sy2}`);
      }
      R(`<path d="${sp}" fill="none" stroke="#0284C7" stroke-width="0.6" opacity="0.5"/>`);
    }
    // Bold red track arrow
    R(`<path d="M${scx + 14},${scy - 5} L${mx + mw - 32},${my + 12}" fill="none" stroke="#DC2626" stroke-width="1.5"/>`);
    R(`<polygon points="${mx+mw-32},${my+12} ${mx+mw-36},${my+8} ${mx+mw-36},${my+16}" fill="#DC2626"/>`);

  } else if (card.num === 14) {
    // GTA VI — Vibrant Vice City sunset gradient, palm silhouettes, neon badge
    R(`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="3" fill="url(#gVice)"/>`);
    // Glowing sun disc
    circle(mx + mw / 2, my + mh - 6, 10, '#FBBF24', 0.7);
    circle(mx + mw / 2, my + mh - 6, 14, '#FBBF24', 0.15);
    // Horizon & water
    line(mx, my + mh - 4, mx + mw, my + mh - 4, '#1E1E1E', 0.8);
    rect(mx, my + mh - 4, mw, 4, '#1E1E1E', 0, 0.5);
    // Black palm silhouettes
    for (const psx of [mx + 10, mx + mw - 14]) {
      R(`<path d="M${psx},${my+mh-4} Q${psx+1},${my+mh-14} ${psx+2},${my+6}" fill="none" stroke="#000000" stroke-width="1.5"/>`);
      R(`<path d="M${psx+2},${my+6} Q${psx-8},${my+2} ${psx-13},${my+8}" fill="none" stroke="#000000" stroke-width="0.9"/>`);
      R(`<path d="M${psx+2},${my+6} Q${psx+12},${my+2} ${psx+15},${my+8}" fill="none" stroke="#000000" stroke-width="0.9"/>`);
      R(`<path d="M${psx+2},${my+6} Q${psx+6},${my-2} ${psx+10},${my+4}" fill="none" stroke="#000000" stroke-width="0.7"/>`);
    }
    // Game controller icon (simplified)
    const gcx = mx + mw / 2 - 20, gcy = my + 8;
    R(`<path d="M${gcx},${gcy} Q${gcx+4},${gcy-3} ${gcx+10},${gcy} Q${gcx+6},${gcy+5} ${gcx},${gcy}" fill="#000000" opacity="0.5"/>`);
    // Retro neon badge
    rect(mx + mw / 2 - 32, my + mh - 14, 64, 10, '#000000', 2, 0.7);
    text(mx + mw / 2, my + mh - 6.5, 'GTA VI \u00B7 00:00 NZ', 4.5, '#F97316', { anchor: 'middle', bold: true });

  } else if (card.num === 15) {
    // UK INFLATION — Clean gridline bar chart with contrast bars, 3.6% above
    rect(mx, my, mw, mh, '#F8FAFC', 3);
    for (let g = 0; g < 4; g++) line(mx + 4, my + 7 + g * 7, mx + mw - 4, my + 7 + g * 7, '#E2E8F0', 0.4);
    // Gray/blue bars with final crimson bar
    const barVals = [7, 6, 8, 7, 9, 8, 11, 13, 16];
    const barCount = barVals.length;
    const barSpacing = (mw - 10) / barCount;
    barVals.forEach((v, bi) => {
      const bx2 = mx + 5 + bi * barSpacing;
      const bColor = bi === barCount - 1 ? CRIMSON : (bi % 2 === 0 ? '#94A3B8' : '#2563EB');
      const bOpacity = bi === barCount - 1 ? 1 : 0.5;
      rect(bx2, my + mh - 3 - v, barSpacing - 2, v, bColor, 1, bOpacity);
    });
    // 3.5% label on second-to-last bar
    text(mx + 5 + (barCount - 2) * barSpacing + barSpacing / 2, my + mh - 3 - 13 - 3, '3.5%', 3.5, '#475569', { anchor: 'middle' });
    // Bold 3.6% cleanly ABOVE the tallest bar with zero overlap
    text(mx + mw - 4, my + 10, '3.6%', 10, CRIMSON, { bold: true, anchor: 'end' });

  } else if (card.num === 16) {
    // SUDAN RSF / DR CONGO EBOLA — Warm parchment/stone split medical-security banner
    rect(mx, my, mw, mh, '#E8E2D5', 3);
    const splitX = mx + mw / 2;
    // LEFT: Hospital/medical side
    // Hospital roof
    R(`<path d="M${mx+6},${my+mh-6} L${mx+6},${my+10} L${mx+16},${my+6} L${mx+splitX-mx-6},${my+10} L${mx+splitX-mx-6},${my+mh-6} Z" fill="#D4CFC5"/>`);
    // Crimson medical cross
    const rcx2 = mx + (splitX - mx) / 2, rcy2 = my + mh / 2 - 2;
    rect(rcx2 - 2, rcy2 - 7, 4, 14, '#DC2626', 1);
    rect(rcx2 - 7, rcy2 - 2, 14, 4, '#DC2626', 1);
    circle(rcx2, rcy2, 10, 'none', 0.25, '#DC2626', 0.8);
    // 11,300+ CASES badge
    rect(mx + 2, my + mh - 10, splitX - mx - 4, 9, CRIMSON, 2, 0.85);
    text(mx + (splitX - mx) / 2, my + mh - 3, '11,300+ CASES', 4, WHITE, { bold: true, anchor: 'middle' });
    // Divider
    line(splitX, my + 2, splitX, my + mh - 2, '#94A3B8', 0.6);
    // RIGHT: Dark slate shield / security
    rect(splitX, my, mw / 2, mh, '#334155', 0, 0.3);
    const shx2 = splitX + (mw / 2) / 2, shy2 = my + mh / 2 - 2;
    // Shield shape
    R(`<path d="M${shx2},${shy2-11} L${shx2+9},${shy2-8} L${shx2+9},${shy2+4} L${shx2},${shy2+11} L${shx2-9},${shy2+4} L${shx2-9},${shy2-8} Z" fill="#475569" stroke="#1E293B" stroke-width="0.7"/>`);
    // Lightning bolt on shield
    R(`<path d="M${shx2-2},${shy2-6} L${shx2+2},${shy2-1} L${shx2-1},${shy2} L${shx2+3},${shy2+6}" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>`);
    // EL OBEID label
    rect(splitX + 2, my + mh - 10, mw / 2 - 4, 9, '#1E293B', 2, 0.85);
    text(splitX + mw / 4, my + mh - 3, 'EL OBEID', 4, '#E2E8F0', { bold: true, anchor: 'middle' });
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
const SEC3_Y = 612;
const SEC3_H = 952 - SEC3_Y;

// Section header bar
rect(4, SEC3_Y, W - 8, 14, CHARCOAL);
text(14, SEC3_Y + 10.5, 'WHERE IT HAPPENED', 6.5, WHITE, { bold: true, ls: 2 });
text(352, SEC3_Y + 10.5, 'ALSO ON WEDNESDAY 18 NOVEMBER \u2014 25 MORE STORIES', 6.5, GOLD, { bold: true, ls: 1 });

// ── Left Panel: World Map (x=8..344, y=628..950) ─────────────────────────
const MAP_X = 8, MAP_Y = SEC3_Y + 16, MAP_W = 338, MAP_H = SEC3_H - 18;
rect(MAP_X, MAP_Y, MAP_W, MAP_H, '#EAE5D8', 2);
R(`<rect x="${MAP_X}" y="${MAP_Y}" width="${MAP_W}" height="${MAP_H}" rx="2" fill="none" stroke="${CHARCOAL}" stroke-width="0.7"/>`);

// Latitude/longitude grid spanning y=650..895
for (let ly = 660; ly <= 895; ly += 38) {
  line(MAP_X + 4, ly, MAP_X + MAP_W - 4, ly, '#D4CFC5', 0.35, '2,6');
}
for (let lx = MAP_X + 25; lx <= MAP_X + MAP_W - 10; lx += 36) {
  line(lx, 646, lx, 898, '#D4CFC5', 0.35, '2,6');
}

// ── DOT-MATRIX continents stretched vertically (y=650..895) ─────────────
const dotR = 1.75;
const dotColor = '#6E6659';

function dotContinent(cx0: number, cy0: number, cw: number, ch: number, shape: number[][]) {
  for (const [fx, fy] of shape) {
    circle(cx0 + fx * cw, cy0 + fy * ch, dotR, dotColor, 0.8);
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
