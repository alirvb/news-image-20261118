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
    else if ('ilIJ1!|.,;:'.includes(ch)) w += fontSize * base * bf * 0.52;
    else if ('frtj'.includes(ch)) w += fontSize * base * bf * 0.68;
    else if (ch >= 'A' && ch <= 'Z') w += fontSize * base * bf * 1.08;
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

// ── Truncate text to fit in maxW, adding ellipsis if needed ───────────────
function truncate(text: string, maxW: number, fs: number, bold: boolean, serif: boolean): string {
  if (measureText(text, fs, bold, serif) <= maxW) return text;
  let t = text;
  while (t.length > 1 && measureText(t + '…', fs, bold, serif) > maxW) t = t.slice(0, -1);
  return t + '…';
}

// ── Colors & dimensions ────────────────────────────────────────────────────
const W = 1024, H = 1024;
const PAPER   = '#F5F1E8';
const NAVY    = '#0F172A';
const CRIMSON = '#B91C1C';
const GOLD    = '#D4A843';
const MUTED   = '#5A6474';
const BORDER  = '#C8C0B0';
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

function tspan(x: number, dy: number, s: string, fill?: string): string {
  return `<tspan x="${x}" dy="${dy}"${fill ? ` fill="${fill}"` : ''}>${esc(s)}</tspan>`;
}

// ── Background ────────────────────────────────────────────────────────────
svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

rect(0, 0, W, H, PAPER);

// ═══════════════════════════════════════════════════════════════════════════
// 1. MASTHEAD (y=0..84)
// ═══════════════════════════════════════════════════════════════════════════
rect(0, 0, W, 84, NAVY);
// Gold top rule
rect(0, 0, W, 2, GOLD);
// Crimson date box
rect(14, 10, 66, 64, CRIMSON, 2);
text(47, 26, 'NOV', 7.5, WHITE, { bold: true, anchor: 'middle', ls: 1.5 });
text(47, 46, '18', 22, WHITE, { bold: true, serif: true, anchor: 'middle' });
text(47, 60, 'WED · 2026', 6, WHITE, { anchor: 'middle', ls: 0.5, opacity: 0.85 });
// Kicker above title
text(90, 20, 'THE DAY IN WORLD NEWS', 7.5, GOLD, { bold: true, ls: 2.0 });
// Main title
text(90, 48, 'Wednesday 18 November 2026', 28, WHITE, { bold: true, serif: true });
// Subtitle below
text(90, 68, 'Everything on this page happened, or was first reported, on Wednesday 18 November 2026.', 7.5, '#94A3B8');
// Right-aligned stats
text(1010, 24, '40 STORIES', 8.5, GOLD, { bold: true, anchor: 'end', ls: 1 });
text(1010, 40, '7 REGIONS', 7.5, '#94A3B8', { anchor: 'end', ls: 0.5 });
text(1010, 54, 'ONE PAGE', 7.5, '#94A3B8', { anchor: 'end', ls: 0.5 });
// Crimson rule at bottom of masthead
rect(0, 82, W, 2, CRIMSON);

// ═══════════════════════════════════════════════════════════════════════════
// 2a. REGION DISTRIBUTION BAR (y=86..106)
// ═══════════════════════════════════════════════════════════════════════════
const regions = [
  { name: 'EUROPE',      count: 8 },
  { name: 'AMERICAS',    count: 9 },
  { name: 'ASIA',        count: 6 },
  { name: 'AFRICA',      count: 6 },
  { name: 'MIDDLE EAST', count: 4 },
  { name: 'OCEANIA',     count: 3 },
  { name: 'WORLD',       count: 4 },
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
// Region legend strip
rect(0, 100, W, 5, PAPER);
barX = 0;
for (const r of regions) {
  const bw = Math.round((r.count / totalStories) * W);
  line(barX, 100, barX + bw, 100, REGION_COLORS[r.name], 1.5);
  barX += bw;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2b. KEY NUMBERS STRIP (y=106..160)
// ═══════════════════════════════════════════════════════════════════════════
rect(0, 106, W, 54, DARK);
rect(0, 106, W, 1, GOLD);
// Label
text(16, 120, 'THE DAY IN NUMBERS', 7.5, GOLD, { bold: true, ls: 2 });
// 6 stat cells
const stats = [
  { n: '141',     label: 'Russian drones\nfired overnight' },
  { n: '126',     label: 'of them shot\ndown, Kyiv says' },
  { n: '25.9bn km', label: 'Voyager 1 now —\none light-day out' },
  { n: '55',      label: 'factories shut\nby Bangladesh strikes' },
  { n: '251–11',  label: 'caucus vote backs\nJeffries for Speaker' },
  { n: '11,300+', label: 'Ebola cases in\nDR Congo (WHO)' },
];
const statW = Math.floor(W / 6);
stats.forEach((s, i) => {
  const sx = i * statW;
  if (i > 0) line(sx, 108, sx, 158, '#2D3748', 0.5);
  text(sx + statW / 2, 137, s.n, 16, WHITE, { bold: true, serif: true, anchor: 'middle' });
  const parts = s.label.split('\n');
  const lineSpacing = parts.length > 2 ? 6.8 : 7.5;
  const startY = parts.length > 2 ? 144 : 147;
  parts.forEach((p, pi) => {
    text(sx + statW / 2, startY + pi * lineSpacing, p, 6.8, '#94A3B8', { anchor: 'middle' });
  });
});
rect(0, 162, W, 1, GOLD);

// ═══════════════════════════════════════════════════════════════════════════
// 3. TIER 1 — 3 ILLUSTRATED LEAD CARDS (y=164..378)
// ═══════════════════════════════════════════════════════════════════════════
interface LeadCard {
  num: string; region: string; topic: string;
  verify: string; sources: string;
  headline: string;
  summary: string;
  color: string;
  illustration: string;
}

const leadCards: LeadCard[] = [
  {
    num: '1', region: 'ASIA', topic: 'APEC SUMMIT',
    verify: 'CONFIRMED', sources: 'AP · CNBC',
    headline: 'Xi welcomes Trump on the tarmac in Shenzhen',
    summary: 'The APEC summit opened as Air Force One landed at Shenzhen Baoan. Xi Jinping greeted President Trump personally on the tarmac — the first US president to visit the city. A state banquet followed, with Putin seated between the two leaders. Three-way talks on trade, Ukraine and arms control are set for Thursday.',
    color: REGION_COLORS['ASIA'],
    illustration: 'summit',
  },
  {
    num: '2', region: 'MIDDLE EAST', topic: 'IRAN WAR',
    verify: 'CLAIM', sources: 'AP · REUTERS',
    headline: 'Bahrain and Kuwait intercept Iran drone salvo',
    summary: 'Iran launched waves of Shahed drones and Fateh ballistic missiles at US Patriot radar sites in Bahrain and at an air-defence base near Kuwait City. Both countries said their interceptors knocked down the bulk of the attack. Iran\'s Revolutionary Guard called it retaliation for Tuesday\'s US airstrike on Qeshm Island.',
    color: REGION_COLORS['MIDDLE EAST'],
    illustration: 'gulf',
  },
  {
    num: '3', region: 'WORLD', topic: 'SPACE',
    verify: 'CONFIRMED', sources: 'NASA-JPL',
    headline: 'Voyager 1 reaches one light-day from Earth',
    summary: 'NASA\'s Jet Propulsion Laboratory confirmed that Voyager 1, launched in 1977, crossed the milestone of 25.9 billion kilometres — exactly one light-day — from Earth at 03:14 UTC. The probe remains operational, returning plasma-wave and cosmic-ray data via its 22.4-watt transmitter.',
    color: REGION_COLORS['WORLD'],
    illustration: 'voyager',
  },
];

const LEAD_COL_W = 320, LEAD_GAP = 8;
const LEAD_Y = 164, LEAD_H = 212;
const ILLUS_H = 72;

leadCards.forEach((card, i) => {
  const cx = 16 + i * (LEAD_COL_W + LEAD_GAP);
  const cy = LEAD_Y;
  // Card background
  rect(cx, cy, LEAD_COL_W, LEAD_H, WHITE, 2);
  R(`<rect x="${cx}" y="${cy}" width="${LEAD_COL_W}" height="${LEAD_H}" rx="2" fill="none" stroke="${BORDER}" stroke-width="0.8"/>`);

  // ── Illustration banner ────────────────────────────────────────────────
  const ix = cx, iy = cy, iw = LEAD_COL_W;
  if (card.illustration === 'summit') {
    // Tarmac scene
    rect(ix, iy, iw, ILLUS_H, '#1E293B', 0);
    // Sky gradient via rect layers
    rect(ix, iy, iw, ILLUS_H, '#0D2137');
    rect(ix, iy + ILLUS_H - 14, iw, 14, '#374151'); // tarmac
    // Runway lines
    for (let r = 0; r < 5; r++) line(ix + 60 + r * 50, iy + ILLUS_H - 10, ix + 60 + r * 50, iy + ILLUS_H - 2, '#6B7280', 1.5, '3,2');
    // Plane silhouette
    R(`<path d="M${ix+iw-70},${iy+ILLUS_H-26} L${ix+iw-20},${iy+ILLUS_H-26} L${ix+iw-18},${iy+ILLUS_H-24} L${ix+iw-18},${iy+ILLUS_H-20} L${ix+iw-20},${iy+ILLUS_H-20} L${ix+iw-70},${iy+ILLUS_H-20} Z" fill="#94A3B8"/>`);
    // Tail fin
    R(`<path d="M${ix+iw-62},${iy+ILLUS_H-26} L${ix+iw-58},${iy+ILLUS_H-32} L${ix+iw-54},${iy+ILLUS_H-26}" fill="#CBD5E1"/>`);
    // Wing
    R(`<path d="M${ix+iw-50},${iy+ILLUS_H-23} L${ix+iw-35},${iy+ILLUS_H-16} L${ix+iw-45},${iy+ILLUS_H-23}" fill="#94A3B8"/>`);
    // Flags: China, US, Russia
    const flagData = [
      { x: ix+22, fill: '#DE2910', stripe: '#FBBF24' },
      { x: ix+54, fill: '#3C3B6E', stripe: '#B22234' },
      { x: ix+86, fill: '#0039A6', stripe: '#FFFFFF' },
    ];
    for (const f of flagData) {
      rect(f.x, iy + 8, 20, 13, f.fill);
      rect(f.x, iy + 11, 20, 4, f.stripe, 0, 0.6);
      line(f.x, iy + 6, f.x, iy + 25, '#888', 0.8);
    }
    // Label
    text(ix + iw/2, iy + ILLUS_H - 4, 'SHENZHEN · BAOAN INTERNATIONAL', 6, '#94A3B8', { anchor: 'middle' });
  } else if (card.illustration === 'gulf') {
    // Gulf tactical
    rect(ix, iy, iw, ILLUS_H, '#0F1E2D');
    // Gulf water shape
    R(`<path d="M${ix+10},${iy+20} L${ix+100},${iy+8} L${ix+180},${iy+20} L${ix+220},${iy+40} L${ix+200},${iy+60} L${ix+140},${iy+68} L${ix+80},${iy+65} L${ix+30},${iy+55} Z" fill="#0F4C75" stroke="#38BDF8" stroke-width="0.6" opacity="0.7"/>`);
    // Alert rings at Bahrain (left of center)
    const bx = ix + 80, by = iy + 42;
    for (let r = 10; r <= 30; r += 10) {
      R(`<circle cx="${bx}" cy="${by}" r="${r}" fill="none" stroke="#EF4444" stroke-width="0.6" stroke-dasharray="2,2" opacity="${0.6 - r * 0.012}"/>`);
    }
    R(`<circle cx="${bx}" cy="${by}" r="3" fill="#EF4444"/>`);
    text(bx, by - 32, 'Bahrain', 6, '#FCA5A5', { anchor: 'middle', bold: true });
    // Alert rings at Kuwait (right of center)
    const kx = ix + 160, ky = iy + 28;
    for (let r = 10; r <= 25; r += 10) {
      R(`<circle cx="${kx}" cy="${ky}" r="${r}" fill="none" stroke="#F97316" stroke-width="0.6" stroke-dasharray="2,2" opacity="${0.6 - r * 0.012}"/>`);
    }
    R(`<circle cx="${kx}" cy="${ky}" r="3" fill="#F97316"/>`);
    text(kx, ky - 22, 'Kuwait', 6, '#FDBA74', { anchor: 'middle', bold: true });
    // Drone arcs from right side (Iran)
    for (let arc = 0; arc < 3; arc++) {
      const aOff = arc * 8 - 8;
      R(`<path d="M${ix+iw-10},${iy+30+aOff} Q${ix+200},${iy+5} ${bx},${by}" fill="none" stroke="#F87171" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.5"/>`);
    }
    text(ix + iw - 8, iy + ILLUS_H - 4, 'PERSIAN GULF · HIGH ALERT', 6, '#94A3B8', { anchor: 'end' });
  } else {
    // Voyager / space
    rect(ix, iy, iw, ILLUS_H, '#050C18');
    // Stars
    const seeds = [[0.08,0.2],[0.2,0.6],[0.35,0.1],[0.5,0.7],[0.65,0.3],[0.8,0.8],[0.9,0.15],[0.15,0.85],[0.45,0.5],[0.72,0.5],[0.28,0.4],[0.55,0.9],[0.88,0.5],[0.03,0.5],[0.95,0.7]];
    for (const [sx, sy] of seeds) R(`<circle cx="${ix + sx * iw}" cy="${iy + sy * ILLUS_H}" r="${0.5 + (sx * 7 % 1)}" fill="white" opacity="${0.3 + sy * 0.5}"/>`);
    // Sun
    R(`<circle cx="${ix+16}" cy="${iy+ILLUS_H/2}" r="8" fill="#FBBF24"/>`);
    R(`<circle cx="${ix+16}" cy="${iy+ILLUS_H/2}" r="12" fill="none" stroke="#FBBF24" stroke-width="0.5" opacity="0.3"/>`);
    // Trajectory
    let arc = `M${ix+30},${iy+ILLUS_H/2}`;
    for (let t = 1; t <= 20; t++) { const f = t/20; arc += ` L${ix+30+f*(iw-50)},${iy+ILLUS_H/2 - Math.sin(f*Math.PI*0.5)*(ILLUS_H*0.3)}`; }
    R(`<path d="${arc}" fill="none" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="4,3"/>`);
    // Probe at end
    const px = ix + iw - 22, py = iy + ILLUS_H / 2 - 14;
    R(`<rect x="${px-4}" y="${py-2}" width="8" height="4" fill="#A5F3FC"/>`);
    R(`<line x1="${px-12}" y1="${py}" x2="${px-4}" y2="${py}" stroke="#A5F3FC" stroke-width="1"/>`);
    R(`<line x1="${px+4}" y1="${py}" x2="${px+12}" y2="${py}" stroke="#A5F3FC" stroke-width="1"/>`);
    R(`<path d="M${px-2},${py-2} L${px},${py-9} L${px+2},${py-2}" fill="none" stroke="#A5F3FC" stroke-width="0.8"/>`);
    // Label
    rect(ix + iw/2 - 44, iy + ILLUS_H - 16, 88, 12, '#0F172A', 2);
    text(ix + iw/2, iy + ILLUS_H - 7, '1 LIGHT-DAY · 25.9 BILLION KM', 6, '#38BDF8', { anchor: 'middle', bold: true });
  }

  // ── Card header ─────────────────────────────────────────────────────────
  const headerY = cy + ILLUS_H;
  rect(cx, headerY, LEAD_COL_W, 18, card.color, 0, 0.12);
  // Num · region · topic tag
  text(cx + 8, headerY + 12, `${card.num} · ${card.region} · ${card.topic}`, 7.5, card.color, { bold: true, ls: 0.5 });
  // Verify + sources (right-aligned)
  const verifyColor = card.verify === 'CONFIRMED' ? '#059669' : '#D97706';
  text(cx + LEAD_COL_W - 6, headerY + 12, `${card.verify} · ${card.sources}`, 6.5, verifyColor, { anchor: 'end' });

  // ── Headline ─────────────────────────────────────────────────────────────
  const hlY = headerY + 24;
  const hlMaxW = (i < 2) ? LEAD_COL_W - 28 : LEAD_COL_W - 14;
  const hlLines = wrapText(card.headline, hlMaxW, 13, true, true);
  hlLines.slice(0, 3).forEach((l, li) => {
    text(cx + 7, hlY + li * 15, l, 13, DARK, { bold: true, serif: true });
  });
  // ── Divider ───────────────────────────────────────────────────────────────
  const divY = hlY + Math.min(hlLines.length, 3) * 15 + 2;
  line(cx + 7, divY, cx + LEAD_COL_W - 7, divY, BORDER, 0.5);
  // ── Summary ───────────────────────────────────────────────────────────────
  const sumY = divY + 10;
  const sumMaxW = (i < 2) ? LEAD_COL_W - 28 : LEAD_COL_W - 14;
  const sumLines = wrapText(card.summary, sumMaxW, 8.5, false, false);
  sumLines.slice(0, 4).forEach((l, li) => {
    text(cx + 7, sumY + li * 11, l, 8.5, MUTED);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. TIER 2 — 10 COMPACT CARDS (Row A: y=382..530, Row B: y=536..684)
// ═══════════════════════════════════════════════════════════════════════════
interface CompactCard {
  num: number; region: string; topic: string;
  headline: string; summary: string;
  miniIllustration: string; badge?: string;
}

const compactCards: CompactCard[] = [
  { num: 4,  region: 'EUROPE',      topic: 'UKRAINE WAR', headline: 'Russia fires 141 drones at Ukraine; 126 downed', summary: 'Overnight bombardment targeted power and logistics. Air Force Command said 126 of 141 Shahed drones were destroyed; 15 passed through.', miniIllustration: 'drone' },
  { num: 5,  region: 'AMERICAS',    topic: 'MARKETS', headline: 'Fed minutes: almost all officials lean toward further hikes', summary: 'October FOMC minutes show broad concern over inflation re-acceleration. Dow slipped 0.4% on release. Rate futures price 72% chance of a December rise.', miniIllustration: 'chart', badge: '+0.4%' },
  { num: 6,  region: 'ASIA',        topic: 'WEATHER', headline: 'Cyclone Akvan veers north toward Odisha coast', summary: 'The India Met Department raised red alerts for Odisha as Cyclone Akvan, a Category 2 storm, was tracking NNE at 12 knots. Landfall expected Friday.', miniIllustration: 'cyclone' },
  { num: 7,  region: 'AFRICA',      topic: 'SUDAN WAR', headline: "Amnesty: RSF drone strikes killed 37 in El Obeid", summary: "Amnesty International said at least 37 civilians were killed in Rapid Support Forces drone attacks on the city's market and hospital on Tuesday.", miniIllustration: 'alert' },
  { num: 8,  region: 'EUROPE',      topic: 'UKRAINE AID', headline: 'EU proposes €45bn bridge loan to Kyiv for 2027', summary: "The European Commission's draft would front-load €45bn in loan guarantees, backed by frozen Russian sovereign assets, before longer-term decisions.", miniIllustration: 'bar', badge: '€45bn' },
  { num: 9,  region: 'EUROPE',      topic: 'ECONOMY', headline: "UK inflation climbs to 3.6%, highest in a year", summary: 'ONS said CPI rose to 3.6% in October, up from 2.6% in September. Services inflation hit 5.9%. The Bank of England now seen on hold through February.', miniIllustration: 'trend', badge: '3.6%' },
  { num: 10, region: 'MIDDLE EAST', topic: 'GAZA', headline: 'Israeli tanks push into central Gaza near Nuseirat', summary: 'IDF armoured units advanced along the main Salah ad-Din Road toward the Nuseirat camp. Hospitals in central Gaza reported severe fuel shortages.', miniIllustration: 'alert' },
  { num: 11, region: 'AMERICAS',    topic: 'US POLITICS', headline: "Jeffries wins Democrats' nod for House Speaker", summary: 'House Democrats voted 251–11 to nominate Hakeem Jeffries as Speaker for the new Congress. Republicans, who lost their majority, will select a new leader next week.', miniIllustration: 'vote', badge: '251–11' },
  { num: 12, region: 'WORLD',       topic: 'CULTURE', headline: 'GTA VI goes on sale after a 13-year wait', summary: "Rockstar's most anticipated game launched on PS5 and Xbox Series X globally. It broke Steam's concurrent-player record within two hours of going live.", miniIllustration: 'star' },
  { num: 13, region: 'ASIA',        topic: 'LABOUR', headline: 'Bangladesh wage protests shut 55 garment factories', summary: 'Tens of thousands of workers walked off the job in Dhaka and Chittagong over unpaid October wages. Factory owners confirmed at least 55 plants closed.', miniIllustration: 'bar', badge: '55' },
];

const COMP_COLS = 5;
const COMP_W = 192;
const COMP_GAP = 8;
const COMP_MINI_H = 36;
const COMP_ROW_H = 148;
const COMP_ROW_A_Y = 382;

compactCards.forEach((card, i) => {
  const row = Math.floor(i / COMP_COLS);
  const col = i % COMP_COLS;
  const cx = 16 + col * (COMP_W + COMP_GAP);
  const cy = (row === 0 ? COMP_ROW_A_Y : COMP_ROW_A_Y + COMP_ROW_H + 6);
  const cColor = REGION_COLORS[card.region] || DARK;

  // Card bg + border
  rect(cx, cy, COMP_W, COMP_ROW_H, WHITE, 2);
  R(`<rect x="${cx}" y="${cy}" width="${COMP_W}" height="${COMP_ROW_H}" rx="2" fill="none" stroke="${BORDER}" stroke-width="0.7"/>`);

  // ── Mini illustration strip ───────────────────────────────────────────
  const mx = cx + 1, my = cy + 1, mw = COMP_W - 2, mh = COMP_MINI_H;
  rect(mx, my, mw, mh, '#F8FAFC', 2);
  if (card.miniIllustration === 'drone') {
    // Bar chart of drone count
    const barData = [30, 50, 80, 100, 141, 126];
    barData.forEach((v, bi) => {
      const bh2 = (v / 141) * (mh - 6);
      const bColor = bi === 5 ? '#059669' : (bi === 4 ? CRIMSON : REGION_COLORS['EUROPE']);
      rect(mx + 10 + bi * 27, my + mh - 3 - bh2, 18, bh2, bColor, 1, 0.8);
    });
  } else if (card.miniIllustration === 'chart') {
    // Rate chart
    const pts = [60, 48, 52, 44, 50, 42, 46, 40];
    let path = '';
    pts.forEach((v, pi) => { const px = mx + 10 + pi * 20; const py = my + 2 + (v / 65) * (mh - 6); path += (pi === 0 ? `M${px},${py}` : ` L${px},${py}`); });
    R(`<path d="${path}" fill="none" stroke="${CRIMSON}" stroke-width="1.5" stroke-linecap="round"/>`);
    text(mx + mw - 4, my + mh - 4, 'FED FUNDS', 5.5, MUTED, { anchor: 'end' });
  } else if (card.miniIllustration === 'cyclone') {
    // Spiral cyclone
    const scx = mx + mw / 2, scy = my + mh / 2;
    for (let r = 4; r <= 16; r += 4) R(`<circle cx="${scx}" cy="${scy}" r="${r}" fill="none" stroke="#0891B2" stroke-width="0.7" stroke-dasharray="2,2"/>`);
    R(`<circle cx="${scx}" cy="${scy}" r="3" fill="#0891B2"/>`);
    // Track arrow
    R(`<path d="M${scx},${scy-14} L${scx+8},${scy-22}" fill="none" stroke="#374151" stroke-width="1.2" marker-end="url(#arr)"/>`);
    text(mx + 4, my + mh - 3, 'TRACK → ODISHA', 5.5, '#374151');
  } else if (card.miniIllustration === 'alert') {
    // Red alert badge
    R(`<circle cx="${mx+mw/2}" cy="${my+mh/2}" r="${mh/2-3}" fill="${CRIMSON}" opacity="0.1"/>`);
    text(mx + mw / 2, my + mh / 2 + 4, '!', 20, CRIMSON, { bold: true, anchor: 'middle' });
  } else if (card.miniIllustration === 'bar') {
    // Single big bar
    const bh2 = mh - 10;
    rect(mx + 10, my + 5, 24, bh2, cColor, 1, 0.75);
    if (card.badge) text(mx + 22, my + 5 + bh2 / 2 + 4, card.badge, 7.5, cColor, { bold: true, anchor: 'middle' });
  } else if (card.miniIllustration === 'trend') {
    // Rising trend line
    const tpts = [70, 65, 68, 60, 64, 58, 36];
    let tp = '';
    tpts.forEach((v, pi) => { const px = mx + 8 + pi * 25; const py = my + 2 + (v / 75) * (mh - 6); tp += (pi === 0 ? `M${px},${py}` : ` L${px},${py}`); });
    R(`<path d="${tp}" fill="none" stroke="${CRIMSON}" stroke-width="1.5"/>`);
    if (card.badge) text(mx + mw - 4, my + 10, card.badge, 10, CRIMSON, { bold: true, anchor: 'end' });
  } else if (card.miniIllustration === 'vote') {
    // Voting tally bars
    rect(mx + 10, my + 8, Math.round((251 / 262) * (mw - 25)), mh - 14, '#2563EB', 1, 0.8);
    rect(mx + 10 + Math.round((251 / 262) * (mw - 25)) + 2, my + 8, Math.round((11 / 262) * (mw - 25)), mh - 14, CRIMSON, 1, 0.5);
    if (card.badge) text(mx + mw / 2, my + mh / 2 + 4, card.badge, 9, WHITE, { bold: true, anchor: 'middle' });
  } else if (card.miniIllustration === 'star') {
    // Star icon
    const sc = mx + mw / 2, sy2 = my + mh / 2;
    const sr = 11, ir = 5;
    let starPath = '';
    for (let p = 0; p < 10; p++) {
      const a = (p * Math.PI / 5) - Math.PI / 2;
      const r2 = p % 2 === 0 ? sr : ir;
      starPath += (p === 0 ? 'M' : 'L') + `${sc + r2 * Math.cos(a)},${sy2 + r2 * Math.sin(a)}`;
    }
    starPath += 'Z';
    R(`<path d="${starPath}" fill="${GOLD}" opacity="0.85"/>`);
  }

  // ── Category tag ─────────────────────────────────────────────────────
  const tagY = my + mh + 12;
  text(cx + 6, tagY, `${card.num} · ${card.region}`, 7, cColor, { bold: true });
  text(cx + COMP_W - 6, tagY, card.topic, 6.5, MUTED, { anchor: 'end' });
  line(cx + 6, tagY + 2, cx + COMP_W - 6, tagY + 2, cColor, 0.6);

  // ── Headline ────────────────────────────────────────────────────────
  const hlY2 = tagY + 10;
  const hl2 = wrapText(card.headline, COMP_W - 12, 10.5, true, true);
  hl2.slice(0, 3).forEach((l, li) => text(cx + 6, hlY2 + li * 13, l, 10.5, DARK, { bold: true, serif: true }));

  // ── Summary ──────────────────────────────────────────────────────────
  const sumY2 = hlY2 + Math.min(hl2.length, 3) * 13 + 4;
  const sum2 = wrapText(card.summary, COMP_W - 12, 7.5, false, false);
  sum2.slice(0, 3).forEach((l, li) => text(cx + 6, sumY2 + li * 9.5, l, 7.5, MUTED));
});

// Tier dividers
const TIER2_END = COMP_ROW_A_Y + COMP_ROW_H + 6 + COMP_ROW_H;
rect(0, TIER2_END + 4, W, 1, BORDER, 0, 0.5);
line(0, COMP_ROW_A_Y - 4, W, COMP_ROW_A_Y - 4, GOLD, 0.8);

// ═══════════════════════════════════════════════════════════════════════════
// 5. TIER 3 — SPLIT SECTION (y=694..962)
// ═══════════════════════════════════════════════════════════════════════════
const T3_Y = 694;
const T3_H = 968 - T3_Y;
const MAP_W = 324;
const FEED_X = 350;
const FEED_W = W - FEED_X - 8;

// Section header
rect(0, T3_Y, W, 14, DARK);
text(16, T3_Y + 10, 'WHERE IT HAPPENED', 7.5, WHITE, { bold: true, ls: 2 });
text(FEED_X, T3_Y + 10, 'ALSO ON WEDNESDAY 18 NOVEMBER — 27 MORE STORIES', 7.5, GOLD, { bold: true, ls: 1 });

// ── Left: World Map Panel ──────────────────────────────────────────────────
const mapY = T3_Y + 16;
const mapH = T3_H - 16;
rect(16, mapY, MAP_W, mapH, '#E8F4F9', 2);
R(`<rect x="16" y="${mapY}" width="${MAP_W}" height="${mapH}" rx="2" fill="none" stroke="${BORDER}" stroke-width="0.7"/>`);

// Stylized continent blobs (simplified outlines)
// Europe
R(`<path d="M110,${mapY+28} L130,${mapY+22} L150,${mapY+26} L155,${mapY+40} L145,${mapY+55} L130,${mapY+58} L115,${mapY+52} L105,${mapY+40} Z" fill="#B8D4E8" stroke="${BORDER}" stroke-width="0.5"/>`);
// Africa
R(`<path d="M120,${mapY+62} L145,${mapY+60} L160,${mapY+72} L162,${mapY+100} L150,${mapY+118} L128,${mapY+120} L115,${mapY+108} L112,${mapY+80} Z" fill="#B8D4A0" stroke="${BORDER}" stroke-width="0.5"/>`);
// Asia
R(`<path d="M165,${mapY+20} L240,${mapY+15} L275,${mapY+22} L285,${mapY+40} L270,${mapY+65} L240,${mapY+72} L200,${mapY+68} L175,${mapY+55} L160,${mapY+40} Z" fill="#D4C8A8" stroke="${BORDER}" stroke-width="0.5"/>`);
// Americas
R(`<path d="M28,${mapY+30} L65,${mapY+25} L78,${mapY+45} L70,${mapY+70} L60,${mapY+80} L45,${mapY+78} L30,${mapY+55} Z" fill="#D4C0A8" stroke="${BORDER}" stroke-width="0.5"/>`);
// South America
R(`<path d="M48,${mapY+85} L70,${mapY+82} L78,${mapY+105} L72,${mapY+130} L55,${mapY+135} L40,${mapY+120} L38,${mapY+100} Z" fill="#D4C0A8" stroke="${BORDER}" stroke-width="0.5"/>`);
// Oceania
R(`<path d="M240,${mapY+108} L270,${mapY+105} L282,${mapY+120} L268,${mapY+132} L242,${mapY+128} L232,${mapY+118} Z" fill="#E8D4B0" stroke="${BORDER}" stroke-width="0.5"/>`);
// Middle East blob
R(`<path d="M168,${mapY+58} L195,${mapY+55} L200,${mapY+72} L185,${mapY+80} L165,${mapY+76} Z" fill="#D4C0A8" stroke="${BORDER}" stroke-width="0.5"/>`);

// Geographic pin placements
interface MapPin { n: number; label: string; x: number; y: number; color: string; }
const mapPins: MapPin[] = [
  { n: 1, label: 'Shenzhen', x: 258, y: mapY + 55, color: REGION_COLORS['ASIA'] },
  { n: 2, label: 'Gulf', x: 185, y: mapY + 65, color: REGION_COLORS['MIDDLE EAST'] },
  { n: 4, label: 'Kyiv', x: 148, y: mapY + 36, color: REGION_COLORS['EUROPE'] },
  { n: 5, label: 'Washington', x: 50, y: mapY + 44, color: REGION_COLORS['AMERICAS'] },
  { n: 6, label: 'Odisha', x: 232, y: mapY + 65, color: REGION_COLORS['ASIA'] },
  { n: 7, label: 'El Obeid', x: 148, y: mapY + 86, color: REGION_COLORS['AFRICA'] },
  { n: 8, label: 'Brussels', x: 128, y: mapY + 36, color: REGION_COLORS['EUROPE'] },
  { n: 9, label: 'London', x: 118, y: mapY + 32, color: REGION_COLORS['EUROPE'] },
  { n: 10, label: 'Gaza', x: 160, y: mapY + 58, color: REGION_COLORS['MIDDLE EAST'] },
  { n: 11, label: 'D.C.', x: 55, y: mapY + 42, color: REGION_COLORS['AMERICAS'] },
  { n: 12, label: 'Global', x: 24, y: mapY + 94, color: REGION_COLORS['WORLD'] },
  { n: 13, label: 'Dhaka', x: 230, y: mapY + 60, color: REGION_COLORS['ASIA'] },
];
for (const pin of mapPins) {
  const isLead = pin.n <= 2;
  const pColor = pin.color;
  // Pin circle
  R(`<circle cx="${16 + pin.x}" cy="${pin.y}" r="${isLead ? 5 : 3.5}" fill="${pColor}" opacity="0.9"/>`);
  R(`<circle cx="${16 + pin.x}" cy="${pin.y}" r="${isLead ? 7 : 5}" fill="${pColor}" opacity="0.15"/>`);
  // Pin number
  text(16 + pin.x, pin.y + (isLead ? 3.5 : 2.5), String(pin.n), isLead ? 5.5 : 4.5, WHITE, { bold: true, anchor: 'middle' });
  // Label (truncate to fit)
  text(16 + pin.x, pin.y - (isLead ? 9 : 7), pin.label, 5.5, pColor, { bold: true, anchor: 'middle' });
}
// Voyager arrow
R(`<path d="M${16+MAP_W-15},${mapY+10} L${16+MAP_W-5},${mapY+5}" fill="none" stroke="${REGION_COLORS['WORLD']}" stroke-width="1.2" stroke-dasharray="2,2"/>`);
text(16 + MAP_W - 16, mapY + 22, '3 · TO VOYAGER 1', 5.5, REGION_COLORS['WORLD'], { anchor: 'end', bold: true });
// Map legend
rect(16, mapY + mapH - 28, MAP_W, 28, WHITE, 0, 0.9);
line(16, mapY + mapH - 28, 16 + MAP_W, mapY + mapH - 28, BORDER, 0.5);
const legItems = [
  { c: REGION_COLORS['ASIA'], l: 'ASIA' },
  { c: REGION_COLORS['EUROPE'], l: 'EUR' },
  { c: REGION_COLORS['AMERICAS'], l: 'AME' },
  { c: REGION_COLORS['MIDDLE EAST'], l: 'M.E.' },
  { c: REGION_COLORS['AFRICA'], l: 'AFR' },
  { c: REGION_COLORS['WORLD'], l: 'WLD' },
];
legItems.forEach((li, idx) => {
  const lx = 24 + idx * 50;
  rect(lx, mapY + mapH - 20, 8, 8, li.c, 1);
  text(lx + 11, mapY + mapH - 13, li.l, 6, MUTED);
});

// ── Right: 27 More Stories feed ───────────────────────────────────────────
const feedY = T3_Y + 16;
const feedH = T3_H - 16;
// Two columns inside the right panel
const feedColW = Math.floor(FEED_W / 2) - 4;

interface FeedStory { n: number; city: string; text: string; }
const feedStories: FeedStory[] = [
  { n: 14, city: 'Manila', text: "Trump hails 'biggest' Philippine trade deal signed at APEC" },
  { n: 15, city: 'Tokyo', text: "Takaichi makes first China visit by Japanese minister since 2019" },
  { n: 16, city: 'Ottawa', text: "Carney and Xi agree APEC tariff relief package at summit" },
  { n: 17, city: 'Seoul', text: "South Korean President Lee seeks Xi's help on North Korea peace" },
  { n: 18, city: 'Riyadh', text: "Saudi-led coalition downs Houthi cruise missile over Red Sea" },
  { n: 19, city: 'Beirut', text: "World Bank warns Lebanon's rebuilding lags far behind schedule" },
  { n: 20, city: 'Berlin', text: "Germany pledges Patriot air defences and F-16 ammunition to Kyiv" },
  { n: 21, city: 'The Hague', text: "Court sentences ex-president Thaçi to 17 months for contempt" },
  { n: 22, city: 'Kemerovo', text: "19 killed in An-12 cargo-plane crash, Russian media report" },
  { n: 23, city: 'London', text: "Britain extradites suspected US Army spy to Washington" },
  { n: 24, city: 'Kinshasa', text: "Ebola passes 11,300 cases in DR Congo; WHO keeps global emergency" },
  { n: 25, city: 'Washington', text: "US loses measles-elimination status after 26 years" },
  { n: 26, city: 'Badme', text: "Ethiopia and Eritrea exchange artillery fire in border buildup" },
  { n: 27, city: 'Guinea', text: "224 jailed in crackdown on illegal gold mining operations" },
  { n: 28, city: 'Maputo', text: "Opposition leader Mondlane goes on trial in Mozambique" },
  { n: 29, city: 'Pretoria', text: "South Africa formally reprimands Nigeria's incoming ambassador" },
  { n: 30, city: 'San Francisco', text: "Anthropic prices $81bn IPO at $83; trading starts Thursday" },
  { n: 31, city: 'Caracas', text: "Hegseth visits Venezuela; US and VZ sign a defence pact" },
  { n: 32, city: 'Bogotá', text: "Colombia's economy contracts 0.8% in the third quarter" },
  { n: 33, city: 'Brasília', text: "Senate passes Lula's \$10bn fiscal package after marathon session" },
  { n: 34, city: 'Peru', text: "Tumbes River exceeds red-alert level; evacuations ordered" },
  { n: 35, city: 'Antalya', text: "COP31 ministers weigh divided draft on fossil-fuel phase-out" },
  { n: 36, city: 'Turin', text: "Alcaraz beats Medvedev 6–2, 6–4 to reach ATP Finals semis" },
  { n: 37, city: 'Paris', text: "FIFA — France's Diallo to challenge Infantino for presidency" },
  { n: 38, city: 'Sydney', text: "Tame Impala sweeps seven awards at the ARIA Music Awards" },
  { n: 39, city: 'Pacific', text: "Cat-5 Cyclone Xavier veers east; 6.0 quake strikes near PNG" },
  { n: 40, city: 'Canberra', text: "Australia sanctions settler leader Daniella Weiss" },
];

const leftStories = feedStories.slice(0, 14);
const rightStories = feedStories.slice(14, 27);
const lineH = 17.6;

// Left column of feed
leftStories.forEach((s, i) => {
  const sy = feedY + 2 + i * lineH;
  // Number badge
  R(`<circle cx="${FEED_X + 7}" cy="${sy + 5.5}" r="5.5" fill="${DARK}" opacity="0.9"/>`);
  text(FEED_X + 7, sy + 8.5, String(s.n), 5, WHITE, { bold: true, anchor: 'middle' });
  // City label
  text(FEED_X + 17, sy + 6.5, truncate(s.city, 48, 7, true, false), 7, CRIMSON, { bold: true });
  // Story text
  const storyTrunc = truncate(s.text, feedColW - 22, 7.5, false, false);
  text(FEED_X + 17, sy + 15, storyTrunc, 7.5, DARK);
  // Thin rule between items
  if (i < leftStories.length - 1) line(FEED_X + 4, sy + lineH - 0.5, FEED_X + feedColW, sy + lineH - 0.5, BORDER, 0.3);
});

// Right column of feed
const rightFeedX = FEED_X + feedColW + 8;
rightStories.forEach((s, i) => {
  const sy = feedY + 2 + i * lineH;
  R(`<circle cx="${rightFeedX + 7}" cy="${sy + 5.5}" r="5.5" fill="${DARK}" opacity="0.9"/>`);
  text(rightFeedX + 7, sy + 8.5, String(s.n), 5, WHITE, { bold: true, anchor: 'middle' });
  text(rightFeedX + 17, sy + 6.5, truncate(s.city, 48, 7, true, false), 7, CRIMSON, { bold: true });
  const storyTrunc = truncate(s.text, feedColW - 22, 7.5, false, false);
  text(rightFeedX + 17, sy + 15, storyTrunc, 7.5, DARK);
  if (i < rightStories.length - 1) line(rightFeedX + 4, sy + lineH - 0.5, rightFeedX + feedColW, sy + lineH - 0.5, BORDER, 0.3);
});

// Vertical divider between feed columns
line(FEED_X + feedColW + 4, feedY, FEED_X + feedColW + 4, feedY + feedH - 12, BORDER, 0.5);

// ═══════════════════════════════════════════════════════════════════════════
// 6. FOOTER (y=970..1020)
// ═══════════════════════════════════════════════════════════════════════════
const footY = 968;
rect(0, footY, W, H - footY, '#E8E4DB');
rect(0, footY, W, 1.5, BORDER);

// Date check box
rect(12, footY + 6, W - 24, 24, WHITE, 2);
R(`<rect x="12" y="${footY + 6}" width="${W - 24}" height="24" rx="2" fill="none" stroke="${BORDER}" stroke-width="0.6"/>`);
rect(12, footY + 6, 76, 24, CRIMSON, 2);
text(50, footY + 21, 'DATE CHECK', 6.5, WHITE, { bold: true, anchor: 'middle', ls: 1 });
const dateCheckText = "Left out on purpose — first reported Tue 17 Nov: US Qeshm strike · Alaska Senate call · Kerch Bridge collapse · Knesset speaker vote · Nvidia results. Not yet: Trump–Xi–Putin 3-way talks (Thu 19) · Cyclone Akvan landfall (Fri 20) · COP31 close (Fri 20).";
text(96, footY + 21, truncate(dateCheckText, W - 110, 7.5, false, false), 7.5, MUTED);

// Credits line
text(16, footY + 46, 'SOURCES: AP · Reuters · BBC · CNN · CNBC · NPR · Fed · ONS · IMD · NASA-JPL · WHO · Amnesty International', 6.5, MUTED, { ls: 0.3 });
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
