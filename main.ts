// main.ts — High-Density 40-Story Broadsheet Front Page (1024×1024 PNG)
// "THE DAY IN WORLD NEWS — Wednesday 18 November 2026"
// Uses @resvg/resvg-js with local TrueType fonts. Pure SVG primitives only.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = import.meta.dirname ?? resolve('.');
const fontsDir = join(ROOT, 'fonts');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });

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
    if (ch === ' ') w += fontSize * 0.30;
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
const PAPER   = '#EFECE4';
const CARD_BG = '#FBF9F5';
const NAVY    = '#0F172A';
const CRIMSON = '#B91C1C';
const GOLD    = '#D4A843';
const MUTED   = '#5A6474';
const BORDER  = '#334155';
const WHITE   = '#FFFFFF';
const DARK    = '#1E293B';

const REGION_COLORS: Record<string, string> = {
  'EUROPE':      '#2563EB',
  'AMERICAS':    '#DC2626',
  'ASIA':        '#D97706',
  'AFRICA':      '#16A34A',
  'MIDDLE EAST': '#7C3AED',
  'OCEANIA':     '#0891B2',
  'WORLD':       '#374151',
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

function text(x: number, y: number, s: string, fs: number, fill: string, opts: {
  bold?: boolean; serif?: boolean; anchor?: string; opacity?: number; ls?: number; italic?: boolean;
} = {}) {
  const ff = opts.serif ? 'Georgia' : 'Arial';
  const fw = opts.bold ? 'bold' : 'normal';
  const fs2 = opts.italic ? 'italic' : 'normal';
  const anchor = opts.anchor ?? 'start';
  const ls = opts.ls ? ` letter-spacing="${opts.ls}"` : '';
  const op = opts.opacity != null && opts.opacity < 1 ? ` opacity="${opts.opacity}"` : '';
  R(`<text x="${x}" y="${y}" font-family="${ff}" font-size="${fs}" font-weight="${fw}" font-style="${fs2}" fill="${fill}" text-anchor="${anchor}"${ls}${op}>${esc(s)}</text>`);
}

// ── Background ────────────────────────────────────────────────────────────
svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

// Defs for gradients
R(`<defs>`);
R(`<linearGradient id="gVice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7C3AED"/><stop offset="50%" stop-color="#F97316"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>`);
R(`<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#1E293B"/></linearGradient>`);
R(`<linearGradient id="gStorm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#0F172A"/></linearGradient>`);
R(`<linearGradient id="gDesert" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#D2B48C"/><stop offset="100%" stop-color="#C2A87C"/></linearGradient>`);
R(`</defs>`);

rect(0, 0, W, H, PAPER);

// ═══════════════════════════════════════════════════════════════════════════
// 1. MASTHEAD (y=0..84)
// ═══════════════════════════════════════════════════════════════════════════
rect(0, 0, W, 84, NAVY);
rect(0, 0, W, 2, GOLD);
// Crimson date box
rect(14, 10, 66, 64, CRIMSON, 2);
text(47, 26, 'NOV', 7.5, WHITE, { bold: true, anchor: 'middle', ls: 1.5 });
text(47, 46, '18', 22, WHITE, { bold: true, serif: true, anchor: 'middle' });
text(47, 60, 'WED \u00B7 2026', 6, WHITE, { anchor: 'middle', ls: 0.5, opacity: 0.85 });
// Kicker
text(90, 20, 'THE DAY IN WORLD NEWS', 7.5, GOLD, { bold: true, ls: 2.0 });
// Main title
text(90, 48, 'Wednesday 18 November 2026', 28, WHITE, { bold: true, serif: true });
// Subtitle
text(90, 68, 'Everything on this page happened, or was first reported, on Wednesday 18 November 2026.', 7.5, '#94A3B8');
// Right-aligned stats
text(1010, 24, '40 STORIES', 8.5, GOLD, { bold: true, anchor: 'end', ls: 1 });
text(1010, 40, '7 REGIONS', 7.5, '#94A3B8', { anchor: 'end', ls: 0.5 });
text(1010, 54, 'ONE PAGE', 7.5, '#94A3B8', { anchor: 'end', ls: 0.5 });
rect(0, 82, W, 2, CRIMSON);

// ═══════════════════════════════════════════════════════════════════════════
// 2a. REGION DISTRIBUTION BAR (y=86..100)
// ═══════════════════════════════════════════════════════════════════════════
const regions = [
  { name: 'EUROPE', count: 8 }, { name: 'AMERICAS', count: 9 },
  { name: 'ASIA', count: 6 }, { name: 'AFRICA', count: 6 },
  { name: 'MIDDLE EAST', count: 4 }, { name: 'OCEANIA', count: 3 },
  { name: 'WORLD', count: 4 },
];
const totalStories = 40;
const barY = 86, barH = 14;
let barX = 0;
for (const r of regions) {
  const bw = Math.round((r.count / totalStories) * W);
  rect(barX, barY, bw, barH, REGION_COLORS[r.name]);
  if (bw > 30) text(barX + bw / 2, barY + 9.5, r.name, 5.5, WHITE, { bold: true, anchor: 'middle', ls: 0.3 });
  barX += bw;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2b. KEY NUMBERS STRIP (y=104..158)
// ═══════════════════════════════════════════════════════════════════════════
rect(0, 104, W, 54, DARK);
rect(0, 104, W, 1, GOLD);
text(16, 118, 'THE DAY IN NUMBERS', 7.5, GOLD, { bold: true, ls: 2 });
const stats = [
  { n: '141',       label: 'Russian drones\nfired overnight' },
  { n: '126',       label: 'of them shot\ndown, Kyiv says' },
  { n: '25.9bn km', label: 'Voyager 1 now \u2014\none light-day out' },
  { n: '55',        label: 'factories shut\nby Bangladesh' },
  { n: '251\u201311',   label: 'caucus vote backs\nJeffries, Speaker' },
  { n: '11,300+',   label: 'Ebola cases in\nDR Congo (WHO)' },
];
const statW = Math.floor(W / 6);
stats.forEach((s, i) => {
  const sx = i * statW;
  if (i > 0) line(sx, 106, sx, 156, '#2D3748', 0.5);
  text(sx + statW / 2, 135, s.n, 16, WHITE, { bold: true, serif: true, anchor: 'middle' });
  const parts = s.label.split('\n');
  parts.forEach((p, pi) => {
    text(sx + statW / 2, 146 + pi * 7.5, p, 6.8, '#94A3B8', { anchor: 'middle' });
  });
});
rect(0, 158, W, 1, GOLD);

// ═══════════════════════════════════════════════════════════════════════════
// 3. TIER 1 — 3 ILLUSTRATED LEAD CARDS (y=162..336)   height=178
// ═══════════════════════════════════════════════════════════════════════════
interface LeadCard {
  num: string; region: string; topic: string;
  verify: string; sources: string;
  headline: string; summary: string;
  color: string;
}

const leadCards: LeadCard[] = [
  {
    num: '1', region: 'ASIA', topic: 'APEC SUMMIT',
    verify: 'CONFIRMED', sources: 'AP \u00B7 CNBC',
    headline: 'Xi welcomes Trump on the tarmac in Shenzhen',
    summary: 'Air Force One landed at Shenzhen Baoan. Xi Jinping greeted Trump on the tarmac. A state banquet followed with Putin between the two leaders.',
    color: REGION_COLORS['ASIA'],
  },
  {
    num: '2', region: 'MIDDLE EAST', topic: 'IRAN WAR',
    verify: 'CLAIM', sources: 'AP \u00B7 REUTERS',
    headline: 'Bahrain and Kuwait intercept Iran drone salvo',
    summary: 'Iran launched Shahed drones and Fateh missiles at US radar sites. Both countries said interceptors stopped the bulk of the attack.',
    color: REGION_COLORS['MIDDLE EAST'],
  },
  {
    num: '3', region: 'WORLD', topic: 'SPACE',
    verify: 'CONFIRMED', sources: 'NASA-JPL',
    headline: 'Voyager 1 reaches one light-day from Earth',
    summary: 'JPL confirmed Voyager 1 crossed 25.9 billion km from Earth at 03:14 UTC. The 1977 probe still returns plasma and cosmic-ray data.',
    color: REGION_COLORS['WORLD'],
  },
];

const LEAD_COL_W = 320, LEAD_GAP = 11;
const LEAD_Y = 162, LEAD_H = 178;
const ILLUS_H = 66;

leadCards.forEach((card, i) => {
  const cx = 16 + i * (LEAD_COL_W + LEAD_GAP);
  const cy = LEAD_Y;
  // Card background
  rect(cx, cy, LEAD_COL_W, LEAD_H, CARD_BG, 3);
  R(`<rect x="${cx}" y="${cy}" width="${LEAD_COL_W}" height="${LEAD_H}" rx="3" fill="none" stroke="${BORDER}" stroke-width="0.8"/>`);

  // ── Illustration banner (full width of card: 320×66) ─────────────────
  const ix = cx, iy = cy, iw = LEAD_COL_W, ih = ILLUS_H;

  if (i === 0) {
    // #1 SHENZHEN APEC — Airport tarmac, flags, diplomats, airliner tail
    rect(ix, iy, iw, ih, '#0D2137', 3);
    // Sky gradient top
    rect(ix, iy, iw, 32, '#132D4A', 3);
    // Tarmac
    rect(ix, iy + ih - 16, iw, 16, '#374151');
    // Red carpet
    rect(ix + 100, iy + ih - 16, 120, 16, '#991B1B', 0, 0.5);
    rect(ix + 130, iy + ih - 14, 60, 2, '#FCA5A5', 0, 0.4);
    // Runway dashes
    for (let r = 0; r < 7; r++) line(ix + 30 + r * 42, iy + ih - 6, ix + 30 + r * 42, iy + ih - 1, '#6B7280', 1.5, '3,2');
    // Airliner tail fin (right side)
    R(`<path d="${`M${ix+iw-85},${iy+ih-28} L${ix+iw-25},${iy+ih-28} L${ix+iw-22},${iy+ih-24} L${ix+iw-22},${iy+ih-16} L${ix+iw-85},${iy+ih-16} Z`}" fill="#94A3B8" opacity="0.8"/>`);
    R(`<path d="${`M${ix+iw-78},${iy+ih-28} L${ix+iw-72},${iy+ih-38} L${ix+iw-66},${iy+ih-28}`}" fill="#CBD5E1"/>`);
    // Wing
    R(`<path d="${`M${ix+iw-60},${iy+ih-23} L${ix+iw-40},${iy+ih-14} L${ix+iw-55},${iy+ih-23}`}" fill="#94A3B8" opacity="0.7"/>`);
    // 3 flags on poles
    const flagData = [
      { x: ix + 22, c1: '#DE2910', c2: '#FBBF24' }, // China
      { x: ix + 54, c1: '#3C3B6E', c2: '#B22234' }, // US
      { x: ix + 86, c1: '#0039A6', c2: '#D52B1E' }, // Russia
    ];
    for (const f of flagData) {
      line(f.x, iy + 6, f.x, iy + 28, '#888', 0.8);
      rect(f.x + 1, iy + 7, 18, 12, f.c1);
      rect(f.x + 1, iy + 11, 18, 4, f.c2, 0, 0.6);
    }
    // 3 diplomat silhouettes
    const dipX = [ix + 136, ix + 160, ix + 184];
    for (const dx of dipX) {
      circle(dx, iy + ih - 26, 4, '#1E293B', 0.7);
      rect(dx - 4, iy + ih - 22, 8, 8, '#1E293B', 0, 0.7);
    }
    text(ix + iw / 2, iy + ih - 2, 'SHENZHEN \u00B7 BAOAN INTERNATIONAL', 5.5, '#94A3B8', { anchor: 'middle' });
  } else if (i === 1) {
    // #2 GULF / IRAN WAR — Dark tactical map, missile arcs, interception bursts
    rect(ix, iy, iw, ih, '#0F1E2D', 3);
    // Gulf water shape
    R(`<path d="M${ix+10},${iy+20} L${ix+100},${iy+8} L${ix+180},${iy+20} L${ix+220},${iy+40} L${ix+200},${iy+60} L${ix+140},${iy+ih-4} L${ix+80},${iy+ih-7} L${ix+30},${iy+55} Z" fill="#0F4C75" stroke="#38BDF8" stroke-width="0.5" opacity="0.6"/>`);
    // Grid lines
    for (let g = 0; g < 6; g++) line(ix, iy + g * 13, ix + iw, iy + g * 13, '#1E3A5F', 0.3, '2,4');
    for (let g = 0; g < 8; g++) line(ix + g * 45, iy, ix + g * 45, iy + ih, '#1E3A5F', 0.3, '2,4');
    // Bahrain pin + interception burst
    const bx = ix + 85, by = iy + 42;
    circle(bx, by, 3, '#EF4444');
    // Interception burst rings
    for (let r = 8; r <= 20; r += 6) circle(bx, by, r, 'none', 0.4 - r * 0.01, '#EF4444', 0.6);
    text(bx, by - 8, 'Bahrain', 5.5, '#FCA5A5', { anchor: 'middle', bold: true });
    // Kuwait pin + burst
    const kx = ix + 165, ky = iy + 28;
    circle(kx, ky, 3, '#F97316');
    for (let r = 8; r <= 18; r += 5) circle(kx, ky, r, 'none', 0.35 - r * 0.01, '#F97316', 0.6);
    text(kx, ky - 8, 'Kuwait', 5.5, '#FDBA74', { anchor: 'middle', bold: true });
    // Dotted missile trajectories from Iran (right edge)
    for (let arc = 0; arc < 3; arc++) {
      const aOff = arc * 10 - 10;
      R(`<path d="M${ix+iw-5},${iy+30+aOff} Q${ix+210},${iy+5} ${bx},${by}" fill="none" stroke="#F87171" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.5"/>`);
    }
    for (let arc = 0; arc < 2; arc++) {
      R(`<path d="M${ix+iw-5},${iy+20+arc*14} Q${ix+230},${iy+10} ${kx},${ky}" fill="none" stroke="#FDBA74" stroke-width="0.7" stroke-dasharray="3,2" opacity="0.4"/>`);
    }
    // Patriot interception X marks
    R(`<text x="${ix+120}" y="${iy+32}" font-family="Arial" font-size="8" fill="#22C55E" font-weight="bold" text-anchor="middle">\u00D7</text>`);
    R(`<text x="${ix+140}" y="${iy+22}" font-family="Arial" font-size="8" fill="#22C55E" font-weight="bold" text-anchor="middle">\u00D7</text>`);
    text(ix + iw - 8, iy + ih - 4, 'PERSIAN GULF \u00B7 HIGH ALERT', 5.5, '#94A3B8', { anchor: 'end' });
  } else {
    // #3 VOYAGER — Pitch black space, Sun, dashed heliosphere, probe, label
    rect(ix, iy, iw, ih, '#0B0F19', 3);
    // Stars
    const seeds = [[0.08,0.2],[0.2,0.6],[0.35,0.1],[0.5,0.7],[0.65,0.3],[0.8,0.8],[0.9,0.15],[0.15,0.85],[0.45,0.5],[0.72,0.5],[0.28,0.4],[0.55,0.9],[0.88,0.5],[0.03,0.5],[0.95,0.7]];
    for (const [sx, sy] of seeds) circle(ix + sx * iw, iy + sy * ih, 0.5 + (sx * 7 % 1), WHITE, 0.3 + sy * 0.5);
    // Sun (glow + disc)
    circle(ix + 18, iy + ih / 2, 12, '#FBBF24', 0.15);
    circle(ix + 18, iy + ih / 2, 8, '#FBBF24');
    circle(ix + 18, iy + ih / 2, 5, '#FDE68A');
    // Dashed heliosphere arc
    R(`<path d="M${ix+6},${iy+ih-10} Q${ix+iw/2},${iy-20} ${ix+iw-6},${iy+ih-10}" fill="none" stroke="#38BDF8" stroke-width="0.6" stroke-dasharray="4,3" opacity="0.4"/>`);
    // Trajectory line
    let arcPath = `M${ix+30},${iy+ih/2}`;
    for (let t = 1; t <= 20; t++) {
      const f = t / 20;
      arcPath += ` L${ix + 30 + f * (iw - 55)},${iy + ih / 2 - Math.sin(f * Math.PI * 0.5) * (ih * 0.28)}`;
    }
    R(`<path d="${arcPath}" fill="none" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="4,3"/>`);
    // Voyager probe
    const px = ix + iw - 24, py = iy + ih / 2 - 14;
    rect(px - 4, py - 2, 8, 4, '#A5F3FC');
    line(px - 14, py, px - 4, py, '#A5F3FC', 1);
    line(px + 4, py, px + 14, py, '#A5F3FC', 1);
    R(`<path d="M${px - 2},${py - 2} L${px},${py - 10} L${px + 2},${py - 2}" fill="none" stroke="#A5F3FC" stroke-width="0.8"/>`);
    // Label box
    rect(ix + iw / 2 - 60, iy + ih - 15, 120, 12, '#0F172A', 2);
    text(ix + iw / 2, iy + ih - 6, '1 LIGHT-DAY \u00B7 25.9B KM', 6, '#38BDF8', { anchor: 'middle', bold: true });
  }

  // ── Card header ─────────────────────────────────────────────────────────
  const headerY = cy + ILLUS_H;
  rect(cx, headerY, LEAD_COL_W, 16, card.color, 0, 0.1);
  text(cx + 7, headerY + 11, `${card.num} \u00B7 ${card.region} \u00B7 ${card.topic}`, 7, card.color, { bold: true, ls: 0.5 });
  const verifyColor = card.verify === 'CONFIRMED' ? '#059669' : '#D97706';
  text(cx + LEAD_COL_W - 6, headerY + 11, `${card.verify} \u00B7 ${card.sources}`, 6, verifyColor, { anchor: 'end' });

  // ── Headline (DYNAMIC — compute lines first, then position divider) ────
  const hlY = headerY + 24;
  const hlMaxW = LEAD_COL_W - 18;
  const hlLines = wrapText(card.headline, hlMaxW, 13, true, true);
  const hlLineHeight = 15;
  hlLines.slice(0, 3).forEach((l, li) => {
    text(cx + 7, hlY + li * hlLineHeight, l, 13, DARK, { bold: true, serif: true });
  });

  // FIX #1: DYNAMIC DIVIDER — ruleY computed from actual headline line count
  const actualHlLines = Math.min(hlLines.length, 3);
  const ruleY = hlY + actualHlLines * hlLineHeight + 5;
  line(cx + 7, ruleY, cx + LEAD_COL_W - 7, ruleY, '#C8C0B0', 0.5);

  // ── Summary ────────────────────────────────────────────────────────────
  const sumY = ruleY + 10;
  const sumMaxW = LEAD_COL_W - 18;
  const sumLines = wrapText(card.summary, sumMaxW, 8.5, false, false);
  sumLines.slice(0, 4).forEach((l, li) => {
    text(cx + 7, sumY + li * 11, l, 8.5, MUTED);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. TIER 2 — 10 COMPACT CARDS
//    Row A: y=343..487  (height=144)
//    Row B: y=494..638  (height=144)
// ═══════════════════════════════════════════════════════════════════════════
interface CompactCard {
  num: number; region: string; topic: string;
  headline: string; summary: string;
  badge?: string;
}

const compactCards: CompactCard[] = [
  { num: 4,  region: 'EUROPE',      topic: 'UKRAINE WAR',
    headline: 'Russia fires 141 drones at Ukraine; 126 downed',
    summary: 'Overnight bombardment targeted power grids. Air Force said 126 of 141 Shaheds were destroyed.' },
  { num: 5,  region: 'AMERICAS',    topic: 'MARKETS',
    headline: 'Fed minutes: officials lean toward further hikes',
    summary: 'FOMC minutes show inflation concern. Dow slid 561 points on the release.',
    badge: '\u2212561 pts' },
  { num: 6,  region: 'ASIA',        topic: 'WEATHER',
    headline: 'Cyclone Akvan veers north toward Odisha coast',
    summary: 'Red alerts were raised as the Category 2 storm tracked NNE at 12 knots.' },
  { num: 7,  region: 'AFRICA',      topic: 'SUDAN WAR',
    headline: "Amnesty: RSF drone strikes killed 37 in El Obeid",
    summary: 'At least 37 civilians died in RSF attacks on a market and hospital on Tuesday.' },
  { num: 8,  region: 'EUROPE',      topic: 'UKRAINE AID',
    headline: 'EU proposes \u20AC45bn bridge loan to Kyiv for 2027',
    summary: 'The draft would front-load loan guarantees backed by frozen Russian assets.',
    badge: '\u20AC45bn' },
  { num: 9,  region: 'EUROPE',      topic: 'ECONOMY',
    headline: "UK inflation climbs to 3.6%, highest in a year",
    summary: 'ONS said CPI rose to 3.6% in October. Services inflation hit 5.9% year-on-year.',
    badge: '3.6%' },
  { num: 10, region: 'MIDDLE EAST', topic: 'GAZA',
    headline: 'Israeli tanks push into central Gaza near Nuseirat',
    summary: 'IDF units advanced along Salah ad-Din Road. Hospitals reported severe fuel shortages.' },
  { num: 11, region: 'AMERICAS',    topic: 'US POLITICS',
    headline: "Jeffries wins Democrats' nod for House Speaker",
    summary: 'House Democrats voted 251\u201311 to nominate Hakeem Jeffries as Speaker for the new Congress.',
    badge: '251\u201311' },
  { num: 12, region: 'WORLD',       topic: 'CULTURE',
    headline: 'GTA VI goes on sale after a 13-year wait',
    summary: 'Rockstar launched on PS5 and Xbox globally. It broke Steam records within two hours.' },
  { num: 13, region: 'ASIA',        topic: 'LABOUR',
    headline: 'Bangladesh protests shut 55 garment factories',
    summary: 'Workers walked off the job in Dhaka and Chittagong over unpaid October wages.',
    badge: '55' },
];

const COMP_COLS = 5;
const COMP_W = 192;
const COMP_GAP = 7;
const COMP_MINI_H = 36;
const COMP_ROW_H = 144;
const COMP_ROW_A_Y = 343;
const COMP_ROW_B_Y = 494;

compactCards.forEach((card, i) => {
  const row = Math.floor(i / COMP_COLS);
  const col = i % COMP_COLS;
  const cx = 16 + col * (COMP_W + COMP_GAP);
  const cy = row === 0 ? COMP_ROW_A_Y : COMP_ROW_B_Y;
  const cColor = REGION_COLORS[card.region] || DARK;

  // Card bg + border
  rect(cx, cy, COMP_W, COMP_ROW_H, CARD_BG, 3);
  R(`<rect x="${cx}" y="${cy}" width="${COMP_W}" height="${COMP_ROW_H}" rx="3" fill="none" stroke="${BORDER}" stroke-width="0.7"/>`);

  // ── Full-bleed editorial vector banner (192×36) ────────────────────────
  const mx = cx, my = cy, mw = COMP_W, mh = COMP_MINI_H;

  if (card.num === 4) {
    // UKRAINE 141 DRONES — dark night sky, Kyiv skyline, V-drones, flak
    rect(mx, my, mw, mh, '#0B0F19', 3);
    // Kyiv skyline silhouette
    R(`<path d="M${mx},${my+mh} L${mx},${my+mh-8} L${mx+10},${my+mh-12} L${mx+18},${my+mh-8} L${mx+28},${my+mh-15} L${mx+32},${my+mh-20} L${mx+36},${my+mh-15} L${mx+50},${my+mh-10} L${mx+60},${my+mh-14} L${mx+68},${my+mh-8} L${mx+80},${my+mh-12} L${mx+95},${my+mh-8} L${mx+110},${my+mh-16} L${mx+120},${my+mh-10} L${mx+135},${my+mh-13} L${mx+150},${my+mh-8} L${mx+165},${my+mh-11} L${mx+180},${my+mh-7} L${mx+mw},${my+mh-9} L${mx+mw},${my+mh} Z" fill="#1E293B"/>`);
    // V-shaped drones
    for (let d = 0; d < 6; d++) {
      const dx = mx + 20 + d * 28, dy = my + 5 + (d % 3) * 6;
      R(`<path d="M${dx-4},${dy+3} L${dx},${dy} L${dx+4},${dy+3}" fill="none" stroke="#94A3B8" stroke-width="0.8"/>`);
    }
    // Anti-aircraft flak bursts
    circle(mx + 45, my + 10, 3, '#FBBF24', 0.4);
    circle(mx + 110, my + 8, 2.5, '#F97316', 0.5);
    circle(mx + 155, my + 12, 2, '#EF4444', 0.4);
    text(mx + mw - 4, my + mh - 3, '141 DRONES', 5, '#94A3B8', { anchor: 'end', bold: true });

  } else if (card.num === 5) {
    // FED MINUTES — Financial chart with gridlines, crimson callout
    rect(mx, my, mw, mh, '#F8FAFC', 3);
    // Gridlines
    for (let g = 0; g < 4; g++) line(mx + 8, my + 8 + g * 8, mx + mw - 8, my + 8 + g * 8, '#E2E8F0', 0.4);
    // Line chart (declining)
    const pts = [22, 18, 20, 16, 19, 14, 17, 12, 15, 10];
    let chartPath = '';
    pts.forEach((v, pi) => {
      const px = mx + 12 + pi * 17;
      const py = my + mh - 4 - v;
      chartPath += (pi === 0 ? `M${px},${py}` : ` L${px},${py}`);
    });
    R(`<path d="${chartPath}" fill="none" stroke="${CRIMSON}" stroke-width="1.5" stroke-linecap="round"/>`);
    // Bar chart overlay
    pts.forEach((v, pi) => {
      if (pi % 2 === 0) {
        const px = mx + 10 + pi * 17;
        rect(px, my + mh - 4 - v * 0.6, 6, v * 0.6, '#2563EB', 0, 0.25);
      }
    });
    text(mx + mw - 6, my + 12, '\u2212561 pts', 8, CRIMSON, { bold: true, anchor: 'end' });

  } else if (card.num === 6) {
    // CYCLONE AKVAN — Satellite spiral approaching eastern India
    rect(mx, my, mw, mh, '#0F2847', 3);
    // India coastline (right side — simplified)
    R(`<path d="M${mx+mw-30},${my} L${mx+mw-25},${my+8} L${mx+mw-20},${my+15} L${mx+mw-28},${my+22} L${mx+mw-22},${my+mh} L${mx+mw},${my+mh} L${mx+mw},${my} Z" fill="#2D5016" opacity="0.5"/>`);
    // Storm vortex spiral
    const scx = mx + mw / 2 - 10, scy = my + mh / 2;
    for (let r = 4; r <= 18; r += 3) {
      circle(scx, scy, r, 'none', 0.5 - r * 0.015, '#38BDF8', 0.7);
    }
    circle(scx, scy, 3, '#FFFFFF', 0.9);
    // Directional arrow to coast
    R(`<path d="M${scx + 14},${scy - 5} L${mx + mw - 35},${my + 14}" fill="none" stroke="#F97316" stroke-width="1.2" stroke-dasharray="3,2"/>`);
    R(`<polygon points="${mx+mw-35},${my+14} ${mx+mw-39},${my+10} ${mx+mw-39},${my+18}" fill="#F97316"/>`);
    text(mx + 4, my + mh - 3, 'TRACK \u2192 ODISHA', 5, '#94A3B8', { bold: true });

  } else if (card.num === 7) {
    // SUDAN RSF / AMNESTY — Deep slate, red cross emblem, fractured shield
    rect(mx, my, mw, mh, '#1E293B', 3);
    // Fractured shield motif (left)
    const shx = mx + 25, shy = my + mh / 2;
    R(`<path d="M${shx},${shy-12} L${shx+10},${shy-14} L${shx+12},${shy} L${shx+10},${shy+14} L${shx},${shy+12} L${shx-2},${shy} Z" fill="#334155" stroke="#475569" stroke-width="0.6"/>`);
    // Crack through shield
    R(`<path d="M${shx+2},${shy-10} L${shx+5},${shy-2} L${shx+3},${shy+4} L${shx+6},${shy+10}" fill="none" stroke="#94A3B8" stroke-width="0.6"/>`);
    // Red cross emblem (right)
    const rcx = mx + mw - 40, rcy = my + mh / 2;
    rect(rcx - 3, rcy - 10, 6, 20, '#DC2626', 1);
    rect(rcx - 10, rcy - 3, 20, 6, '#DC2626', 1);
    // Circle behind cross
    circle(rcx, rcy, 13, 'none', 0.3, '#DC2626', 0.6);
    text(mx + mw / 2, my + mh - 3, 'AMNESTY \u00B7 HUMANITARIAN CRISIS', 4.5, '#94A3B8', { anchor: 'middle' });

  } else if (card.num === 8) {
    // EU €45bn LOAN — Deep EU blue, 12 gold stars, bold €45bn
    rect(mx, my, mw, mh, '#1E3A8A', 3);
    // Circle of 12 gold stars (left side)
    const ecx = mx + 30, ecy = my + mh / 2;
    for (let s = 0; s < 12; s++) {
      const angle = (s * Math.PI * 2) / 12 - Math.PI / 2;
      const sx = ecx + 11 * Math.cos(angle);
      const sy = ecy + 11 * Math.sin(angle);
      // 5-pointed star
      let starP = '';
      for (let p = 0; p < 10; p++) {
        const a = (p * Math.PI / 5) - Math.PI / 2;
        const r = p % 2 === 0 ? 2.5 : 1.0;
        starP += (p === 0 ? 'M' : 'L') + `${sx + r * Math.cos(a)},${sy + r * Math.sin(a)}`;
      }
      starP += 'Z';
      R(`<path d="${starP}" fill="#FBBF24"/>`);
    }
    // Bold €45bn text
    text(mx + mw - 10, my + mh / 2 + 7, '\u20AC45bn', 18, '#FBBF24', { bold: true, serif: true, anchor: 'end' });

  } else if (card.num === 9) {
    // UK INFLATION 3.6% — Clean gridline, upward trendline, crimson peak
    rect(mx, my, mw, mh, '#F8FAFC', 3);
    // Grid
    for (let g = 0; g < 4; g++) line(mx + 6, my + 7 + g * 8, mx + mw - 6, my + 7 + g * 8, '#E2E8F0', 0.4);
    for (let g = 0; g < 7; g++) line(mx + 6 + g * 30, my + 4, mx + 6 + g * 30, my + mh - 4, '#E2E8F0', 0.3);
    // Trendline going up
    const tpts = [24, 22, 23, 20, 18, 16, 10, 6];
    let tp = '';
    tpts.forEach((v, pi) => {
      const px = mx + 10 + pi * 23;
      const py = my + 4 + v;
      tp += (pi === 0 ? `M${px},${py}` : ` L${px},${py}`);
    });
    R(`<path d="${tp}" fill="none" stroke="${CRIMSON}" stroke-width="1.8" stroke-linecap="round"/>`);
    // Peak dot
    circle(mx + 10 + 7 * 23, my + 4 + 6, 3, CRIMSON);
    text(mx + mw - 8, my + 13, '3.6%', 11, CRIMSON, { bold: true, anchor: 'end' });

  } else if (card.num === 10) {
    // GAZA / NUSEIRAT — Desert terrain, tank, concrete blocks, demarcation line
    rect(mx, my, mw, mh, '#D2B48C', 3);
    // Sky strip
    rect(mx, my, mw, 12, '#87CEEB', 3);
    // Terrain texture (subtle darker patches)
    rect(mx + 20, my + 18, 50, 8, '#C2A87C', 0, 0.5);
    rect(mx + 100, my + 20, 40, 6, '#C2A87C', 0, 0.5);
    // Tank silhouette
    const tx = mx + 40;
    // Hull
    rect(tx, my + mh - 14, 40, 8, '#1E293B', 1);
    // Turret
    rect(tx + 10, my + mh - 20, 20, 8, '#1E293B', 1);
    // Gun barrel
    line(tx + 30, my + mh - 16, tx + 50, my + mh - 18, '#1E293B', 2);
    // Tracks
    rect(tx - 2, my + mh - 8, 44, 4, '#374151', 1);
    // Concrete blocks
    for (let b = 0; b < 4; b++) {
      rect(mx + 110 + b * 16, my + mh - 12, 12, 10, '#6B7280', 1, 0.7);
    }
    // Dashed yellow demarcation line
    line(mx, my + mh - 3, mx + mw, my + mh - 3, '#FBBF24', 1.5, '6,3');

  } else if (card.num === 11) {
    // JEFFRIES 251–11 — Capitol dome, green check, vote bar
    rect(mx, my, mw, mh, '#F0F4FF', 3);
    // Capitol dome silhouette (left)
    const cdx = mx + 35, cdy = my + mh - 6;
    R(`<path d="M${cdx-25},${cdy} L${cdx-20},${cdy-10} L${cdx-10},${cdy-16} L${cdx-5},${cdy-22} L${cdx},${cdy-26} L${cdx+5},${cdy-22} L${cdx+10},${cdy-16} L${cdx+20},${cdy-10} L${cdx+25},${cdy} Z" fill="#334155" opacity="0.7"/>`);
    // Dome cupola
    R(`<path d="M${cdx-4},${cdy-26} Q${cdx},${cdy-32} ${cdx+4},${cdy-26}" fill="#334155" opacity="0.7"/>`);
    // Green checkmark (right area)
    circle(mx + mw - 70, my + mh / 2, 8, '#059669', 0.15);
    R(`<path d="M${mx+mw-75},${my+mh/2} L${mx+mw-71},${my+mh/2+4} L${mx+mw-64},${my+mh/2-5}" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round"/>`);
    // Vote bar
    const vBarX = mx + mw - 55, vBarW = 44;
    const yesW = Math.round((251 / 262) * vBarW);
    rect(vBarX, my + mh / 2 - 4, yesW, 8, '#2563EB', 2);
    rect(vBarX + yesW + 1, my + mh / 2 - 4, vBarW - yesW - 1, 8, CRIMSON, 2, 0.5);
    text(mx + mw - 8, my + 10, '251\u201311', 9, '#1E293B', { bold: true, anchor: 'end' });

  } else if (card.num === 12) {
    // GTA VI — Vice City purple-to-orange sunset, sun disc, palm silhouettes
    R(`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="3" fill="url(#gVice)"/>`);
    // Glowing sun disc on horizon
    circle(mx + mw / 2, my + mh - 8, 10, '#FBBF24', 0.8);
    circle(mx + mw / 2, my + mh - 8, 14, '#FBBF24', 0.2);
    // Horizon line
    line(mx, my + mh - 6, mx + mw, my + mh - 6, '#1E1E1E', 1);
    // Water below horizon
    rect(mx, my + mh - 6, mw, 6, '#1E1E1E', 0, 0.4);
    // Palm tree silhouettes
    const palmPositions = [mx + 15, mx + mw - 20, mx + mw - 50];
    for (const psx of palmPositions) {
      // Trunk
      R(`<path d="M${psx},${my+mh-6} Q${psx+2},${my+mh-18} ${psx+1},${my+8}" fill="none" stroke="#000000" stroke-width="1.5"/>`);
      // Fronds
      R(`<path d="M${psx+1},${my+8} Q${psx-10},${my+4} ${psx-14},${my+10}" fill="none" stroke="#000000" stroke-width="1"/>`);
      R(`<path d="M${psx+1},${my+8} Q${psx+12},${my+4} ${psx+16},${my+10}" fill="none" stroke="#000000" stroke-width="1"/>`);
      R(`<path d="M${psx+1},${my+8} Q${psx-6},${my+2} ${psx-10},${my+6}" fill="none" stroke="#000000" stroke-width="0.8"/>`);
    }

  } else if (card.num === 13) {
    // BANGLADESH 55 FACTORIES — Sawtooth factory roof, gate bars, "55" badge
    rect(mx, my, mw, mh, '#374151', 3);
    // Sawtooth factory roof silhouette
    let sawPath = `M${mx},${my + mh}`;
    const peaks = 8;
    const sawW = mw / peaks;
    for (let p = 0; p < peaks; p++) {
      sawPath += ` L${mx + p * sawW + sawW * 0.3},${my + 6} L${mx + (p + 1) * sawW},${my + mh * 0.5}`;
    }
    sawPath += ` L${mx + mw},${my + mh} Z`;
    R(`<path d="${sawPath}" fill="#1E293B" opacity="0.8"/>`);
    // Chimney stacks
    rect(mx + 30, my + 2, 5, 14, '#475569');
    rect(mx + mw - 40, my + 4, 4, 12, '#475569');
    // Closed gate bars
    for (let g = 0; g < 7; g++) {
      line(mx + 70 + g * 8, my + mh - 14, mx + 70 + g * 8, my + mh - 2, '#6B7280', 1.5);
    }
    // Horizontal bar across gate
    line(mx + 68, my + mh - 10, mx + 122, my + mh - 10, '#6B7280', 1);
    // "55" badge (right)
    circle(mx + mw - 24, my + mh / 2, 12, CRIMSON, 0.9);
    text(mx + mw - 24, my + mh / 2 + 5, '55', 11, WHITE, { bold: true, anchor: 'middle' });
  }

  // ── Category tag ─────────────────────────────────────────────────────
  const tagY = my + mh + 11;
  text(cx + 6, tagY, `${card.num} \u00B7 ${card.region}`, 6.5, cColor, { bold: true });
  text(cx + COMP_W - 6, tagY, card.topic, 6, MUTED, { anchor: 'end' });
  line(cx + 6, tagY + 2, cx + COMP_W - 6, tagY + 2, cColor, 0.5);

  // ── Headline ────────────────────────────────────────────────────────
  const hlY2 = tagY + 10;
  const hlLineH2 = 12;
  const hl2 = wrapText(card.headline, COMP_W - 12, 10, true, true);
  hl2.slice(0, 3).forEach((l, li) => text(cx + 6, hlY2 + li * hlLineH2, l, 10, DARK, { bold: true, serif: true }));

  // FIX #1 (Tier 2): DYNAMIC DIVIDER
  const actualHl2Lines = Math.min(hl2.length, 3);
  const ruleY2 = hlY2 + actualHl2Lines * hlLineH2 + 5;
  line(cx + 6, ruleY2, cx + COMP_W - 6, ruleY2, '#C8C0B0', 0.4);

  // ── Summary ──────────────────────────────────────────────────────────
  const sumY2 = ruleY2 + 8;
  const sum2 = wrapText(card.summary, COMP_W - 12, 7.2, false, false);
  sum2.slice(0, 3).forEach((l, li) => text(cx + 6, sumY2 + li * 9, l, 7.2, MUTED));
});

// Tier dividers
line(0, COMP_ROW_A_Y - 4, W, COMP_ROW_A_Y - 4, GOLD, 0.8);
line(0, COMP_ROW_B_Y + COMP_ROW_H + 4, W, COMP_ROW_B_Y + COMP_ROW_H + 4, '#C8C0B0', 0.5);

// ═══════════════════════════════════════════════════════════════════════════
// 5. TIER 3 — SPLIT SECTION (y=646..956)
// ═══════════════════════════════════════════════════════════════════════════
const T3_Y = 646;
const T3_H = 956 - T3_Y; // 310
const MAP_W = 324;
const FEED_X = 350;
const FEED_W = W - FEED_X - 8;

// Section header
rect(0, T3_Y, W, 14, DARK);
text(16, T3_Y + 10, 'WHERE IT HAPPENED', 7.5, WHITE, { bold: true, ls: 2 });
text(FEED_X, T3_Y + 10, 'ALSO ON WEDNESDAY 18 NOVEMBER \u2014 27 MORE STORIES', 7.5, GOLD, { bold: true, ls: 1 });

// ── Left: World Map Panel (x=16..340, y=660..956) ─────────────────────────
const mapY = T3_Y + 16;
const mapH = T3_H - 16;
rect(16, mapY, MAP_W, mapH, '#EFECE4', 2);
R(`<rect x="16" y="${mapY}" width="${MAP_W}" height="${mapH}" rx="2" fill="none" stroke="${BORDER}" stroke-width="0.7"/>`);

// Subtle lat/long grid lines
for (let lat = 0; lat < 8; lat++) {
  const ly = mapY + 10 + lat * (mapH / 8);
  line(20, ly, 16 + MAP_W - 4, ly, '#D4CFC5', 0.3, '2,6');
}
for (let lon = 0; lon < 10; lon++) {
  const lx = 20 + lon * (MAP_W / 10);
  line(lx, mapY + 4, lx, mapY + mapH - 30, '#D4CFC5', 0.3, '2,6');
}

// DOT-MATRIX continents (stippled grid pattern)
// We'll place dots at appropriate positions for each continent
const dotR = 1.2;
const dotColor = '#C7C0B0';
const dotSpacing = 5;

// Helper: render dot-grid for a continental region
function dotContinent(cx0: number, cy0: number, cw: number, ch: number, shape: number[][]) {
  for (const [fx, fy] of shape) {
    const dx = cx0 + fx * cw;
    const dy = cy0 + fy * ch;
    circle(dx, dy, dotR, dotColor, 0.7);
  }
}

// North America dots
const naX = 28, naY = mapY + 25, naW = 55, naH = 55;
const naDots: number[][] = [];
for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
  const fx = c / 10, fy = r / 10;
  // Shape mask: rough North America
  if (fx < 0.1 && fy > 0.5) continue;
  if (fx > 0.8 && fy > 0.7) continue;
  if (fy < 0.1 && fx > 0.6) continue;
  if (fy > 0.8 && fx < 0.3) continue;
  naDots.push([fx, fy]);
}
dotContinent(naX, naY, naW, naH, naDots);

// South America dots
const saX = 50, saY = mapY + 90, saW = 30, saH = 60;
const saDots: number[][] = [];
for (let r = 0; r < 10; r++) for (let c = 0; c < 7; c++) {
  const fx = c / 7, fy = r / 10;
  if (fx > 0.8 && fy > 0.7) continue;
  if (fx < 0.15 && fy > 0.8) continue;
  if (fy > 0.9 && fx > 0.4) continue;
  saDots.push([fx, fy]);
}
dotContinent(saX, saY, saW, saH, saDots);

// Europe dots
const euX = 108, euY = mapY + 18, euW = 50, euH = 42;
const euDots: number[][] = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) {
  const fx = c / 9, fy = r / 8;
  if (fx > 0.9 && fy > 0.5) continue;
  if (fy > 0.8 && fx < 0.2) continue;
  euDots.push([fx, fy]);
}
dotContinent(euX, euY, euW, euH, euDots);

// Africa dots
const afX = 115, afY = mapY + 65, afW = 48, afH = 65;
const afDots: number[][] = [];
for (let r = 0; r < 11; r++) for (let c = 0; c < 9; c++) {
  const fx = c / 9, fy = r / 11;
  if (fx < 0.15 && fy < 0.3) continue;
  if (fx > 0.85 && fy < 0.3) continue;
  if (fy > 0.85 && fx < 0.3) continue;
  if (fy > 0.85 && fx > 0.7) continue;
  if (fy > 0.9) continue;
  afDots.push([fx, fy]);
}
dotContinent(afX, afY, afW, afH, afDots);

// Asia dots
const asX = 160, asY = mapY + 15, asW = 130, asH = 72;
const asDots: number[][] = [];
for (let r = 0; r < 12; r++) for (let c = 0; c < 22; c++) {
  const fx = c / 22, fy = r / 12;
  if (fx < 0.1 && fy > 0.6) continue;
  if (fx > 0.9 && fy > 0.5) continue;
  if (fy > 0.8 && fx < 0.3) continue;
  if (fy > 0.7 && fx > 0.85) continue;
  asDots.push([fx, fy]);
}
dotContinent(asX, asY, asW, asH, asDots);

// Oceania / Australia dots
const ocX = 240, ocY = mapY + 100, ocW = 48, ocH = 32;
const ocDots: number[][] = [];
for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) {
  const fx = c / 9, fy = r / 6;
  if (fx > 0.8 && fy > 0.7) continue;
  if (fx < 0.15 && fy < 0.3) continue;
  ocDots.push([fx, fy]);
}
dotContinent(ocX, ocY, ocW, ocH, ocDots);

// Middle East dots (between Africa and Asia)
const meX = 155, meY = mapY + 55, meW = 30, meH = 25;
const meDots: number[][] = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
  meDots.push([c / 6, r / 5]);
}
dotContinent(meX, meY, meW, meH, meDots);

// ── Map pins — ZERO city text labels, numbered circles only ──────────────
interface MapPin { n: number; x: number; y: number; }
const mapPins: MapPin[] = [
  { n: 1,  x: 254, y: mapY + 52 },  // Shenzhen
  { n: 2,  x: 180, y: mapY + 62 },  // Gulf
  { n: 4,  x: 143, y: mapY + 32 },  // Kyiv
  { n: 5,  x: 50,  y: mapY + 44 },  // Washington
  { n: 6,  x: 225, y: mapY + 60 },  // Odisha
  { n: 7,  x: 142, y: mapY + 85 },  // El Obeid
  { n: 8,  x: 126, y: mapY + 36 },  // Brussels
  { n: 9,  x: 116, y: mapY + 28 },  // London
  { n: 10, x: 162, y: mapY + 58 },  // Gaza
  { n: 11, x: 54,  y: mapY + 42 },  // D.C.
  { n: 12, x: 24,  y: mapY + 100 }, // Global
  { n: 13, x: 222, y: mapY + 55 },  // Dhaka
];
for (const pin of mapPins) {
  const isLead = pin.n <= 2;
  const pinColor = isLead ? CRIMSON : NAVY;
  const r = isLead ? 6 : 4.5;
  // White border circle
  circle(16 + pin.x, pin.y, r + 1.2, WHITE, 0.9);
  // Pin circle
  circle(16 + pin.x, pin.y, r, pinColor, 0.95);
  // Number
  text(16 + pin.x, pin.y + (isLead ? 3.5 : 2.5), String(pin.n), isLead ? 6 : 5, WHITE, { bold: true, anchor: 'middle' });
}

// Dashed arrow to Voyager (top-right)
R(`<path d="M${16 + MAP_W - 20},${mapY + 12} L${16 + MAP_W - 6},${mapY + 5}" fill="none" stroke="${REGION_COLORS['WORLD']}" stroke-width="1.2" stroke-dasharray="2,2"/>`);
text(16 + MAP_W - 22, mapY + 24, '3 \u00B7 TO VOYAGER 1', 5.5, REGION_COLORS['WORLD'], { anchor: 'end', bold: true });

// Map legend at bottom
rect(16, mapY + mapH - 18, MAP_W, 18, PAPER, 0, 0.95);
line(16, mapY + mapH - 18, 16 + MAP_W, mapY + mapH - 18, '#C8C0B0', 0.5);
text(24, mapY + mapH - 7, 'Red pins: stories 1\u20132 \u00B7 Dark pins: 4\u201313 \u00B7 positions approximate', 5.5, MUTED);

// ── Right: 27 More Stories feed (x=350..1008, y=660..956) ─────────────────
const feedY = T3_Y + 16;
const feedH = T3_H - 16;
const feedColW = Math.floor(FEED_W / 2) - 4;

interface FeedStory { n: number; city: string; text: string; }
const feedStories: FeedStory[] = [
  { n: 14, city: 'Manila',      text: "Trump hails 'biggest' Philippine trade deal signed at APEC" },
  { n: 15, city: 'Tokyo',       text: "Takaichi makes first China visit by Japanese minister since 2019" },
  { n: 16, city: 'Ottawa',      text: "Carney and Xi agree APEC tariff relief package at summit" },
  { n: 17, city: 'Seoul',       text: "South Korean President Lee seeks Xi's help on North Korea peace" },
  { n: 18, city: 'Riyadh',      text: "Saudi-led coalition downs Houthi cruise missile over Red Sea" },
  { n: 19, city: 'Beirut',      text: "World Bank warns Lebanon's rebuilding lags far behind schedule" },
  { n: 20, city: 'Berlin',      text: "Germany pledges Patriot air defences and F-16 ammunition to Kyiv" },
  { n: 21, city: 'The Hague',   text: "Court sentences ex-president Thaci to 17 months for contempt" },
  { n: 22, city: 'Kemerovo',    text: "19 killed in An-12 cargo-plane crash, Russian media report" },
  { n: 23, city: 'London',      text: "Britain extradites suspected US Army spy to Washington" },
  { n: 24, city: 'Kinshasa',    text: "Ebola passes 11,300 cases in DR Congo; WHO keeps emergency" },
  { n: 25, city: 'Washington',  text: "US loses measles-elimination status after 26 years" },
  { n: 26, city: 'Badme',       text: "Ethiopia and Eritrea exchange artillery fire in border buildup" },
  { n: 27, city: 'Guinea',      text: "224 jailed over illegal gold mining" },
  { n: 28, city: 'Maputo',      text: "Opposition leader Mondlane goes on trial in Mozambique" },
  { n: 29, city: 'Pretoria',    text: "South Africa formally reprimands Nigeria's incoming ambassador" },
  { n: 30, city: 'San Fran.',   text: "Anthropic prices $81bn IPO at $83; trading starts Thursday" },
  { n: 31, city: 'Caracas',     text: "Hegseth visits Venezuela; US and VZ sign a defence pact" },
  { n: 32, city: 'Bogota',      text: "Colombia's economy contracts 0.8% in the third quarter" },
  { n: 33, city: 'Brasilia',    text: "Senate passes Lula's $10bn fiscal package after marathon session" },
  { n: 34, city: 'Peru',        text: "Tumbes River exceeds red-alert level; evacuations ordered" },
  { n: 35, city: 'Antalya',     text: "COP31 ministers weigh divided draft on fossil-fuel phase-out" },
  { n: 36, city: 'Turin',       text: "Alcaraz beats Medvedev 6\u20132, 6\u20134 to reach ATP Finals semis" },
  { n: 37, city: 'Paris',       text: "FIFA \u2014 France's Diallo to challenge Infantino for presidency" },
  { n: 38, city: 'Sydney',      text: "Tame Impala sweeps seven awards at the ARIA Music Awards" },
  { n: 39, city: 'Pacific',     text: "Cat-5 Cyclone Xavier veers east; 6.0 quake strikes near PNG" },
  { n: 40, city: 'Canberra',    text: "Australia sanctions settler leader Daniella Weiss" },
];

const leftStories = feedStories.slice(0, 14);
const rightStories = feedStories.slice(14, 27);
const lineH = 19.5;

// Left column of feed
leftStories.forEach((s, i) => {
  const sy = feedY + 2 + i * lineH;
  // Number badge
  circle(FEED_X + 7, sy + 5.5, 5.5, DARK, 0.9);
  text(FEED_X + 7, sy + 8.5, String(s.n), 5, WHITE, { bold: true, anchor: 'middle' });
  // City label
  text(FEED_X + 17, sy + 6.5, truncate(s.city, 48, 7, true, false), 7, CRIMSON, { bold: true });
  // Story text
  text(FEED_X + 17, sy + 15, truncate(s.text, feedColW - 22, 7.5, false, false), 7.5, DARK);
  // Thin rule
  if (i < leftStories.length - 1) line(FEED_X + 4, sy + lineH - 0.5, FEED_X + feedColW, sy + lineH - 0.5, '#C8C0B0', 0.3);
});

// Right column of feed
const rightFeedX = FEED_X + feedColW + 8;
rightStories.forEach((s, i) => {
  const sy = feedY + 2 + i * lineH;
  circle(rightFeedX + 7, sy + 5.5, 5.5, DARK, 0.9);
  text(rightFeedX + 7, sy + 8.5, String(s.n), 5, WHITE, { bold: true, anchor: 'middle' });
  text(rightFeedX + 17, sy + 6.5, truncate(s.city, 48, 7, true, false), 7, CRIMSON, { bold: true });
  text(rightFeedX + 17, sy + 15, truncate(s.text, feedColW - 22, 7.5, false, false), 7.5, DARK);
  if (i < rightStories.length - 1) line(rightFeedX + 4, sy + lineH - 0.5, rightFeedX + feedColW, sy + lineH - 0.5, '#C8C0B0', 0.3);
});

// Vertical hairline divider between feed columns
line(FEED_X + feedColW + 4, feedY, FEED_X + feedColW + 4, feedY + feedH - 12, '#C8C0B0', 1);

// ═══════════════════════════════════════════════════════════════════════════
// 6. FOOTER — DATE CHECK BOX (y=962..998) + wire credits (y=1011)
// ═══════════════════════════════════════════════════════════════════════════
const footY = 962;
rect(0, footY, W, H - footY, '#E8E4DB');
rect(0, footY, W, 1.5, '#C8C0B0');

// Date check box
rect(12, footY + 4, W - 24, 24, CARD_BG, 2);
R(`<rect x="12" y="${footY + 4}" width="${W - 24}" height="24" rx="2" fill="none" stroke="${BORDER}" stroke-width="0.6"/>`);
rect(12, footY + 4, 76, 24, CRIMSON, 2);
text(50, footY + 19, 'DATE CHECK', 6.5, WHITE, { bold: true, anchor: 'middle', ls: 1 });
const dateCheckText = "Left out on purpose \u2014 first reported Tue 17 Nov: US Qeshm strike \u00B7 Alaska Senate call \u00B7 Kerch Bridge collapse \u00B7 Knesset speaker vote \u00B7 Nvidia results. Not yet: Trump\u2013Xi\u2013Putin 3-way talks (Thu 19) \u00B7 Cyclone Akvan landfall (Fri 20) \u00B7 COP31 close (Fri 20).";
text(96, footY + 19, truncate(dateCheckText, W - 110, 7.2, false, false), 7.2, MUTED);

// Credits line
text(16, footY + 46, 'SOURCES: AP \u00B7 Reuters \u00B7 BBC \u00B7 CNN \u00B7 CNBC \u00B7 NPR \u00B7 Fed \u00B7 ONS \u00B7 IMD \u00B7 NASA-JPL \u00B7 WHO \u00B7 Amnesty International', 6.5, MUTED, { ls: 0.3 });
text(W - 16, footY + 46, '18 NOV 2026', 6.5, MUTED, { anchor: 'end' });

// Bottom crimson rule
rect(0, footY + 50, W, 2, CRIMSON);

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
writeFileSync(join(ROOT, 'entry.png'), pngBuffer);
writeFileSync(join(ROOT, 'entry.svg'), svg);

console.log(`Generated 40-story broadsheet PNG: ${pngBuffer.length} bytes (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
console.log(`Dimensions: ${W}x${H}`);
console.log(`Output: ${join(outDir, 'entry.png')}`);
