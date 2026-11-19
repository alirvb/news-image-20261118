// main.ts — Publication-Grade Editorial Front-Page (1024×1024 PNG)
// Uses @resvg/resvg-js with local TrueType fonts. Pure SVG primitives only.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ── Paths ──────────────────────────────────────────────────────────────
const ROOT = import.meta.dirname ?? resolve('.');
const fontsDir = join(ROOT, 'fonts');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });

// ── XML escape ─────────────────────────────────────────────────────────
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Pixel-width word-wrap using font metrics ───────────────────────────
// Approximate character widths per font-size unit for each font family
// Georgia (serif): average ~0.55 em; Arial (sans): ~0.52 em
// Bold variants are ~5% wider
function measureText(text: string, fontSize: number, isBold: boolean, isSerif: boolean): number {
  const baseRatio = isSerif ? 0.56 : 0.53;
  const boldFactor = isBold ? 1.05 : 1.0;
  let width = 0;
  for (const ch of text) {
    if (ch === ' ') width += fontSize * 0.28;
    else if (ch === 'W' || ch === 'M') width += fontSize * baseRatio * boldFactor * 1.35;
    else if (ch === 'w' || ch === 'm') width += fontSize * baseRatio * boldFactor * 1.25;
    else if (ch === 'i' || ch === 'l' || ch === '!' || ch === '|' || ch === '.' || ch === ',') width += fontSize * baseRatio * boldFactor * 0.5;
    else if (ch === 'I' || ch === 'J' || ch === '1') width += fontSize * baseRatio * boldFactor * 0.6;
    else if (ch === 'f' || ch === 't' || ch === 'r' || ch === 'j') width += fontSize * baseRatio * boldFactor * 0.65;
    else if (ch >= 'A' && ch <= 'Z') width += fontSize * baseRatio * boldFactor * 1.1;
    else width += fontSize * baseRatio * boldFactor;
  }
  return width;
}

function wrapText(text: string, maxWidth: number, fontSize: number, isBold: boolean, isSerif: boolean): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (measureText(test, fontSize, isBold, isSerif) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ── SVG Building Blocks ────────────────────────────────────────────────
const W = 1024, H = 1024;

// Colors
const NAVY     = '#0F172A';
const GOLD     = '#D4A843';
const CRIMSON  = '#B91C1C';
const PAPER    = '#FAF6EE';
const CARD_BG  = '#FFFFFF';
const CARD_BD  = '#D1D5DB';
const TEXT_INK = '#1E293B';
const TEXT_MUT = '#64748B';

// Category colors
const CAT_COLORS: Record<string, string> = {
  DIPLOMACY:  '#1E40AF',
  MARKETS:    '#065F46',
  SPACE:      '#4C1D95',
  CLIMATE:    '#92400E',
  SECURITY:   '#991B1B',
  AMERICAS:   '#0E7490',
};

// ── Card data ──────────────────────────────────────────────────────────
interface CardData {
  cat: string;
  catLabel: string;
  headline: string;
  summary: string;
  illustration: string; // function name
  source: string;
  tag: string;
}

const cards: CardData[] = [
  {
    cat: 'DIPLOMACY',
    catLabel: 'DIPLOMACY',
    headline: 'Trump in Shenzhen for APEC: Historic Trilateral Talks with Xi and Putin',
    summary: 'President Trump meets with Chinese President Xi Jinping and Russian President Putin in Shenzhen for trilateral negotiations on nuclear arms control, the Ukraine conflict, and trade realignment at the 2026 APEC summit.',
    illustration: 'summit',
    source: 'REUTERS / SHENZHEN',
    tag: 'PAGE 02 • SUMMIT',
  },
  {
    cat: 'MARKETS',
    catLabel: 'MARKETS / AI',
    headline: 'Anthropic IPO Debuts on Wall Street at Record Valuation',
    summary: 'AI safety pioneer Anthropic prices its landmark IPO at $83 per share, debuting at a $1.5 trillion valuation. The offering is the largest technology IPO in history, surpassing prior records.',
    illustration: 'ipo',
    source: 'BLOOMBERG / NYSE',
    tag: 'PAGE 04 • MARKETS',
  },
  {
    cat: 'SPACE',
    catLabel: 'SPACE / SCIENCE',
    headline: 'NASA Voyager 1 Reaches One Light-Day From Earth',
    summary: 'NASA confirms Voyager 1 has crossed the milestone distance of 25.9 billion km from Earth, equal to one light-day. The probe continues active telemetry from deep interstellar space.',
    illustration: 'voyager',
    source: 'NASA-JPL / PASADENA',
    tag: 'PAGE 07 • SCIENCE',
  },
  {
    cat: 'CLIMATE',
    catLabel: 'CLIMATE',
    headline: 'COP31 Antalya Talks Heat Up Over Loss-and-Damage Fund',
    summary: 'Heated negotiations at COP31 in Antalya, Turkey focus on loss-and-damage financing for vulnerable nations and a 65% global electrification pledge by 2035.',
    illustration: 'cop31',
    source: 'UNFCCC / ANTALYA',
    tag: 'PAGE 09 • CLIMATE',
  },
  {
    cat: 'SECURITY',
    catLabel: 'SECURITY',
    headline: 'Gulf Conflict Widens as Strikes Target Kuwait and Bahrain Bases',
    summary: 'Drone and missile strikes target US military installations in Kuwait and Bahrain, escalating tensions across the Persian Gulf and the Strait of Hormuz shipping corridor.',
    illustration: 'gulf',
    source: 'AP / PERSIAN GULF',
    tag: 'PAGE 11 • DEFENSE',
  },
  {
    cat: 'AMERICAS',
    catLabel: 'AMERICAS',
    headline: 'Hegseth Visits Caracas While El Nino Floods South Florida',
    summary: 'Defense Secretary Hegseth visits Venezuela to reset US-Venezuela military ties. Meanwhile, severe El Nino storms trigger catastrophic flooding across South Florida.',
    illustration: 'americas',
    source: 'MIAMI HERALD / CARACAS',
    tag: 'PAGE 13 • AMERICAS',
  },
];

// ── Illustration SVG generators ────────────────────────────────────────
function illSummit(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2, cy = y + h / 2;
  // Stage platform
  let s = `<rect x="${x+10}" y="${cy+15}" width="${w-20}" height="${h/2-20}" rx="3" fill="#E2E8F0"/>`;
  // Podium
  s += `<rect x="${cx-25}" y="${cy-5}" width="50" height="25" rx="2" fill="${NAVY}"/>`;
  s += `<text x="${cx}" y="${cy+12}" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="bold">APEC</text>`;
  // Three figures (US red, China red-gold, Russia blue-white-red)
  // Left figure (Xi)
  s += `<circle cx="${cx-50}" cy="${cy-15}" r="10" fill="#DE2910"/>`;
  s += `<rect x="${cx-57}" y="${cy-5}" width="14" height="20" rx="2" fill="#DE2910"/>`;
  s += `<text x="${cx-50}" y="${cy+28}" font-family="Arial" font-size="7" fill="${TEXT_INK}" text-anchor="middle">Xi</text>`;
  // Center figure (Trump)
  s += `<circle cx="${cx}" cy="${cy-25}" r="11" fill="#3C3B6E"/>`;
  s += `<rect x="${cx-8}" y="${cy-14}" width="16" height="22" rx="2" fill="#3C3B6E"/>`;
  s += `<text x="${cx}" y="${cy+28}" font-family="Arial" font-size="7" fill="${TEXT_INK}" text-anchor="middle">Trump</text>`;
  // Right figure (Putin)
  s += `<circle cx="${cx+50}" cy="${cy-15}" r="10" fill="#0039A6"/>`;
  s += `<rect x="${cx+43}" y="${cy-5}" width="14" height="20" rx="2" fill="#FFFFFF" stroke="#0039A6" stroke-width="1"/>`;
  s += `<text x="${cx+50}" y="${cy+28}" font-family="Arial" font-size="7" fill="${TEXT_INK}" text-anchor="middle">Putin</text>`;
  // Topic pills
  const pills = ['Nuclear', 'Ukraine', 'Trade'];
  const pillColors = ['#DC2626', '#F59E0B', '#2563EB'];
  pills.forEach((p, i) => {
    const px = x + 15 + i * (w/3 - 5);
    s += `<rect x="${px}" y="${y+h-22}" width="${w/3-12}" height="16" rx="8" fill="${pillColors[i]}"/>`;
    s += `<text x="${px + (w/3-12)/2}" y="${y+h-11}" font-family="Arial" font-size="7.5" fill="white" text-anchor="middle">${esc(p)}</text>`;
  });
  return s;
}

function illIpo(x: number, y: number, w: number, h: number): string {
  let s = '';
  // Grid background
  for (let gx = 0; gx < 7; gx++) {
    s += `<line x1="${x+15+gx*((w-30)/6)}" y1="${y+5}" x2="${x+15+gx*((w-30)/6)}" y2="${y+h-25}" stroke="#E5E7EB" stroke-width="0.5"/>`;
  }
  for (let gy = 0; gy < 5; gy++) {
    s += `<line x1="${x+15}" y1="${y+5+gy*((h-30)/4)}" x2="${x+w-15}" y2="${y+5+gy*((h-30)/4)}" stroke="#E5E7EB" stroke-width="0.5"/>`;
  }
  // Bar chart data - Anthropic valuation rise over rounds
  const vals = [1.5, 4.1, 15, 18, 61, 100, 150]; // billions approx
  const maxVal = 150;
  const barW = (w - 50) / vals.length - 4;
  vals.forEach((v, i) => {
    const bh = (v / maxVal) * (h - 45);
    const bx = x + 20 + i * (barW + 4);
    const by = y + h - 25 - bh;
    const color = i === vals.length - 1 ? '#059669' : '#2563EB';
    s += `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" rx="1" fill="${color}" opacity="0.85"/>`;
  });
  // Trendline
  let pathD = '';
  vals.forEach((v, i) => {
    const px = x + 20 + i * (barW + 4) + barW / 2;
    const py = y + h - 25 - (v / maxVal) * (h - 45);
    pathD += (i === 0 ? 'M' : 'L') + `${px},${py}`;
  });
  s += `<path d="${pathD}" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>`;
  // Axis ticks
  s += `<text x="${x+12}" y="${y+h-22}" font-family="Arial" font-size="6" fill="${TEXT_MUT}">$0</text>`;
  s += `<text x="${x+5}" y="${y+12}" font-family="Arial" font-size="6" fill="${TEXT_MUT}">$150B</text>`;
  // Valuation badge
  s += `<rect x="${x+w-75}" y="${y+5}" width="68" height="20" rx="10" fill="#059669"/>`;
  s += `<text x="${x+w-41}" y="${y+18}" font-family="Arial" font-size="8" fill="white" text-anchor="middle" font-weight="bold">$1.5T IPO</text>`;
  return s;
}

function illVoyager(x: number, y: number, w: number, h: number): string {
  let s = '';
  // Deep space dark background
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#0F172A"/>`;
  // Starfield
  const starSeeds = [
    [0.12,0.15],[0.85,0.1],[0.45,0.08],[0.7,0.35],[0.2,0.55],
    [0.9,0.65],[0.35,0.75],[0.6,0.9],[0.1,0.85],[0.75,0.5],
    [0.55,0.3],[0.3,0.42],[0.8,0.82],[0.15,0.7],[0.65,0.15],
    [0.42,0.58],[0.92,0.28],[0.08,0.38],[0.58,0.72],[0.28,0.92],
  ];
  for (const [sx, sy] of starSeeds) {
    const sr = 0.5 + (sx * 3 % 1) * 1.2;
    s += `<circle cx="${x + sx * w}" cy="${y + sy * h}" r="${sr}" fill="white" opacity="${0.4 + (sy * 7 % 1) * 0.5}"/>`;
  }
  // Sun
  s += `<circle cx="${x+18}" cy="${y+h/2}" r="8" fill="#FBBF24"/>`;
  s += `<circle cx="${x+18}" cy="${y+h/2}" r="12" fill="none" stroke="#FBBF24" stroke-width="0.5" opacity="0.4"/>`;
  s += `<text x="${x+18}" y="${y+h/2+22}" font-family="Arial" font-size="6" fill="#FBBF24" text-anchor="middle">Sun</text>`;
  // Heliosphere boundary arc
  s += `<path d="M${x+60},${y+10} Q${x+65},${y+h/2} ${x+60},${y+h-10}" fill="none" stroke="#60A5FA" stroke-width="1" stroke-dasharray="3,2" opacity="0.6"/>`;
  s += `<text x="${x+58}" y="${y+h-5}" font-family="Arial" font-size="5" fill="#60A5FA" text-anchor="middle" transform="rotate(-90,${x+54},${y+h/2})">Heliosphere</text>`;
  // Trajectory arc from Sun to probe
  let arcPath = `M${x+28},${y+h/2}`;
  for (let t = 0; t <= 20; t++) {
    const frac = t / 20;
    const px = x + 28 + frac * (w - 60);
    const py = y + h / 2 - Math.sin(frac * Math.PI * 0.6) * (h * 0.25);
    arcPath += ` L${px.toFixed(1)},${py.toFixed(1)}`;
  }
  s += `<path d="${arcPath}" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4,2"/>`;
  // Probe icon
  const probeX = x + w - 32, probeY = y + h / 2 - 15;
  s += `<rect x="${probeX-4}" y="${probeY-2}" width="8" height="4" fill="#A5F3FC"/>`;
  s += `<line x1="${probeX-12}" y1="${probeY}" x2="${probeX-4}" y2="${probeY}" stroke="#A5F3FC" stroke-width="1"/>`;
  s += `<line x1="${probeX+4}" y1="${probeY}" x2="${probeX+12}" y2="${probeY}" stroke="#A5F3FC" stroke-width="1"/>`;
  // Dish
  s += `<path d="M${probeX-2},${probeY-2} L${probeX},${probeY-9} L${probeX+2},${probeY-2}" fill="none" stroke="#A5F3FC" stroke-width="1"/>`;
  s += `<circle cx="${probeX}" cy="${probeY-10}" r="3" fill="none" stroke="#A5F3FC" stroke-width="0.8"/>`;
  // Scale bar
  s += `<line x1="${x+15}" y1="${y+h-15}" x2="${x+w-15}" y2="${y+h-15}" stroke="#94A3B8" stroke-width="0.5"/>`;
  s += `<text x="${x+w/2}" y="${y+h-8}" font-family="Arial" font-size="6.5" fill="#94A3B8" text-anchor="middle">25.9 billion km / 1 Light-Day</text>`;
  return s;
}

function illCop31(x: number, y: number, w: number, h: number): string {
  let s = '';
  const gcx = x + w * 0.3, gcy = y + h * 0.45, gr = Math.min(w, h) * 0.28;
  // Globe circle
  s += `<circle cx="${gcx}" cy="${gcy}" r="${gr}" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>`;
  // Latitude lines
  for (let lat = -2; lat <= 2; lat++) {
    const ly = gcy + lat * (gr / 3);
    const lw = Math.sqrt(gr * gr - (lat * gr / 3) * (lat * gr / 3));
    s += `<ellipse cx="${gcx}" cy="${ly}" rx="${lw}" ry="${Math.abs(lat) === 2 ? 2 : 4}" fill="none" stroke="#3B82F6" stroke-width="0.5" opacity="0.5"/>`;
  }
  // Meridian
  s += `<ellipse cx="${gcx}" cy="${gcy}" rx="${gr * 0.3}" ry="${gr}" fill="none" stroke="#3B82F6" stroke-width="0.5" opacity="0.5"/>`;
  // COP31 label on globe
  s += `<text x="${gcx}" y="${gcy+3}" font-family="Georgia" font-size="10" fill="#1E40AF" text-anchor="middle" font-weight="bold">COP31</text>`;
  // Dual progress gauge on the right
  const gaugeX = x + w * 0.6, gaugeW = w * 0.33;
  // Electrification gauge
  s += `<text x="${gaugeX}" y="${y+20}" font-family="Arial" font-size="7" fill="${TEXT_INK}" font-weight="bold">Electrification Target</text>`;
  s += `<rect x="${gaugeX}" y="${y+25}" width="${gaugeW}" height="12" rx="6" fill="#E5E7EB"/>`;
  s += `<rect x="${gaugeX}" y="${y+25}" width="${gaugeW * 0.65}" height="12" rx="6" fill="#059669"/>`;
  s += `<text x="${gaugeX + gaugeW * 0.65 + 4}" y="${y+34}" font-family="Arial" font-size="7" fill="#059669" font-weight="bold">65%</text>`;
  // Loss-and-Damage funding gauge
  s += `<text x="${gaugeX}" y="${y+55}" font-family="Arial" font-size="7" fill="${TEXT_INK}" font-weight="bold">Loss-and-Damage Fund</text>`;
  s += `<rect x="${gaugeX}" y="${y+60}" width="${gaugeW}" height="12" rx="6" fill="#E5E7EB"/>`;
  s += `<rect x="${gaugeX}" y="${y+60}" width="${gaugeW * 0.38}" height="12" rx="6" fill="#D97706"/>`;
  s += `<text x="${gaugeX + gaugeW * 0.38 + 4}" y="${y+69}" font-family="Arial" font-size="7" fill="#D97706" font-weight="bold">38%</text>`;
  // 2035 target label
  s += `<text x="${gaugeX + gaugeW/2}" y="${y+h-8}" font-family="Arial" font-size="7" fill="${TEXT_MUT}" text-anchor="middle">2035 Pledge Targets</text>`;
  return s;
}

function illGulf(x: number, y: number, w: number, h: number): string {
  let s = '';
  // Dark tactical background
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#1E293B"/>`;
  // Gulf coastline outline (simplified Persian Gulf)
  const gulfPath = `M${x+20},${y+15} L${x+w*0.4},${y+10} L${x+w*0.55},${y+h*0.3} L${x+w*0.7},${y+h*0.5} L${x+w*0.6},${y+h*0.7} L${x+w*0.4},${y+h*0.8} L${x+w*0.25},${y+h*0.65} L${x+15},${y+h*0.4} Z`;
  s += `<path d="${gulfPath}" fill="#0F4C75" stroke="#38BDF8" stroke-width="1" opacity="0.6"/>`;
  // Strait of Hormuz label
  s += `<text x="${x+w*0.63}" y="${y+h*0.55}" font-family="Arial" font-size="6" fill="#38BDF8" transform="rotate(-30,${x+w*0.63},${y+h*0.55})">Strait of Hormuz</text>`;
  // Concentric alert rings at Kuwait
  const kwX = x + w * 0.35, kwY = y + h * 0.3;
  for (let r = 8; r <= 24; r += 8) {
    s += `<circle cx="${kwX}" cy="${kwY}" r="${r}" fill="none" stroke="#EF4444" stroke-width="0.8" opacity="${0.7 - r * 0.015}" stroke-dasharray="2,1"/>`;
  }
  s += `<circle cx="${kwX}" cy="${kwY}" r="3" fill="#EF4444"/>`;
  s += `<text x="${kwX}" y="${kwY-28}" font-family="Arial" font-size="7" fill="#FCA5A5" text-anchor="middle" font-weight="bold">Kuwait</text>`;
  // Concentric alert rings at Bahrain
  const bhX = x + w * 0.42, bhY = y + h * 0.55;
  for (let r = 8; r <= 24; r += 8) {
    s += `<circle cx="${bhX}" cy="${bhY}" r="${r}" fill="none" stroke="#F97316" stroke-width="0.8" opacity="${0.7 - r * 0.015}" stroke-dasharray="2,1"/>`;
  }
  s += `<circle cx="${bhX}" cy="${bhY}" r="3" fill="#F97316"/>`;
  s += `<text x="${bhX+5}" y="${bhY+30}" font-family="Arial" font-size="7" fill="#FDBA74" text-anchor="middle" font-weight="bold">Bahrain</text>`;
  // Alert badge
  s += `<rect x="${x+w-65}" y="${y+8}" width="58" height="16" rx="8" fill="#EF4444"/>`;
  s += `<text x="${x+w-36}" y="${y+19}" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="bold">HIGH ALERT</text>`;
  // Legend
  s += `<text x="${x+15}" y="${y+h-8}" font-family="Arial" font-size="6" fill="#94A3B8">Persian Gulf Theater</text>`;
  return s;
}

function illAmericas(x: number, y: number, w: number, h: number): string {
  let s = '';
  const halfW = w / 2 - 3;
  // LEFT PANEL: Diplomatic
  s += `<rect x="${x}" y="${y}" width="${halfW}" height="${h}" rx="4" fill="#F0FDF4"/>`;
  // Shield/emblem
  const shX = x + halfW / 2, shY = y + h * 0.35;
  s += `<path d="M${shX},${shY-18} L${shX+16},${shY-8} L${shX+14},${shY+10} L${shX},${shY+18} L${shX-14},${shY+10} L${shX-16},${shY-8} Z" fill="#1E40AF" stroke="#1E3A5F" stroke-width="1"/>`;
  // US-VZ flags simplified
  s += `<rect x="${shX-8}" y="${shY-10}" width="7" height="5" fill="#B91C1C"/>`;
  s += `<rect x="${shX-8}" y="${shY-5}" width="7" height="5" fill="white"/>`;
  s += `<rect x="${shX-8}" y="${shY}" width="7" height="5" fill="#1E40AF"/>`;
  // VZ
  s += `<rect x="${shX+1}" y="${shY-10}" width="7" height="5" fill="#FBBF24"/>`;
  s += `<rect x="${shX+1}" y="${shY-5}" width="7" height="5" fill="#2563EB"/>`;
  s += `<rect x="${shX+1}" y="${shY}" width="7" height="5" fill="#DC2626"/>`;
  // Handshake lines
  s += `<line x1="${shX-10}" y1="${shY+22}" x2="${shX}" y2="${shY+28}" stroke="#1E40AF" stroke-width="1.5"/>`;
  s += `<line x1="${shX+10}" y1="${shY+22}" x2="${shX}" y2="${shY+28}" stroke="#1E40AF" stroke-width="1.5"/>`;
  s += `<text x="${shX}" y="${y+h-8}" font-family="Arial" font-size="6.5" fill="${TEXT_INK}" text-anchor="middle">Caracas Reset</text>`;

  // RIGHT PANEL: Storm/Flooding
  const rx = x + halfW + 6;
  s += `<rect x="${rx}" y="${y}" width="${halfW}" height="${h}" rx="4" fill="#FEF3C7"/>`;
  // Storm cloud
  const cloudX = rx + halfW / 2, cloudY = y + h * 0.25;
  s += `<circle cx="${cloudX-10}" cy="${cloudY}" r="10" fill="#6B7280"/>`;
  s += `<circle cx="${cloudX+5}" cy="${cloudY-3}" r="12" fill="#4B5563"/>`;
  s += `<circle cx="${cloudX+18}" cy="${cloudY}" r="9" fill="#6B7280"/>`;
  // Rain drops
  for (let d = 0; d < 5; d++) {
    const dx = cloudX - 15 + d * 8;
    s += `<line x1="${dx}" y1="${cloudY+14}" x2="${dx-2}" y2="${cloudY+22}" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/>`;
  }
  // Rainfall gauge
  const gaugeX2 = rx + 10, gaugeH = h * 0.35;
  s += `<rect x="${gaugeX2}" y="${y+h*0.5}" width="12" height="${gaugeH}" rx="2" fill="#DBEAFE" stroke="#3B82F6" stroke-width="0.8"/>`;
  s += `<rect x="${gaugeX2}" y="${y+h*0.5 + gaugeH*0.3}" width="12" height="${gaugeH*0.7}" rx="2" fill="#3B82F6" opacity="0.7"/>`;
  // Gauge ticks
  for (let t = 0; t < 4; t++) {
    const ty = y + h * 0.5 + t * (gaugeH / 3);
    s += `<line x1="${gaugeX2+13}" y1="${ty}" x2="${gaugeX2+18}" y2="${ty}" stroke="#64748B" stroke-width="0.5"/>`;
  }
  s += `<text x="${gaugeX2+6}" y="${y+h-8}" font-family="Arial" font-size="6" fill="${TEXT_INK}" text-anchor="middle">Rain</text>`;
  // S. Florida label
  s += `<text x="${rx + halfW/2 + 8}" y="${y+h-8}" font-family="Arial" font-size="6.5" fill="${TEXT_INK}" text-anchor="middle">S. Florida Floods</text>`;
  return s;
}

const illustrationFns: Record<string, (x: number, y: number, w: number, h: number) => string> = {
  summit: illSummit,
  ipo: illIpo,
  voyager: illVoyager,
  cop31: illCop31,
  gulf: illGulf,
  americas: illAmericas,
};

// ── Build SVG ──────────────────────────────────────────────────────────
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="mastheadGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1E293B"/>
    <stop offset="100%" stop-color="${NAVY}"/>
  </linearGradient>
  <linearGradient id="goldRule" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${GOLD}"/>
    <stop offset="50%" stop-color="#F5D982"/>
    <stop offset="100%" stop-color="${GOLD}"/>
  </linearGradient>
</defs>
`;

// ── Background ─────────────────────────────────────────────────────────
svg += `<rect x="0" y="0" width="${W}" height="${H}" fill="${PAPER}"/>`;

// ── Masthead (y=0..118) ────────────────────────────────────────────────
svg += `<rect x="0" y="0" width="${W}" height="112" fill="url(#mastheadGrad)"/>`;
// Gold rule top
svg += `<rect x="0" y="0" width="${W}" height="3" fill="url(#goldRule)"/>`;
// Title
svg += `<text x="36" y="52" font-family="Georgia" font-size="36" fill="white" font-weight="bold" letter-spacing="3">WORLD NEWS DIGEST</text>`;
// Dateline
svg += `<text x="36" y="78" font-family="Georgia" font-size="14" fill="${GOLD}" letter-spacing="1.5">WEDNESDAY, 18 NOVEMBER 2026</text>`;
// Right-aligned metadata
svg += `<text x="988" y="45" font-family="Arial" font-size="9.5" fill="#94A3B8" text-anchor="end">GLOBAL EDITION</text>`;
svg += `<text x="988" y="60" font-family="Arial" font-size="9" fill="#94A3B8" text-anchor="end">Vol. XXIV No. 322</text>`;
svg += `<text x="988" y="75" font-family="Arial" font-size="9" fill="#94A3B8" text-anchor="end">Evening Final</text>`;
// Crimson rule bottom
svg += `<rect x="0" y="109" width="${W}" height="3" fill="${CRIMSON}"/>`;
// Gold accent line
svg += `<rect x="0" y="112" width="${W}" height="2" fill="url(#goldRule)" opacity="0.6"/>`;

// ── Edition dateline bar ───────────────────────────────────────────────
svg += `<rect x="0" y="114" width="${W}" height="18" fill="#F1F5F9"/>`;
svg += `<text x="36" y="127" font-family="Arial" font-size="8.5" fill="${TEXT_MUT}">TOP STORIES FROM AROUND THE WORLD</text>`;
svg += `<text x="988" y="127" font-family="Arial" font-size="8.5" fill="${TEXT_MUT}" text-anchor="end">6 LEADING STORIES</text>`;
svg += `<line x1="0" y1="132" x2="${W}" y2="132" stroke="#D1D5DB" stroke-width="0.5"/>`;

// ── 3×2 Card Grid (y=134..998) ─────────────────────────────────────────
const GRID_PAD = 14;
const GRID_TOP = 136;
const CARD_COLS = 3;
const CARD_ROWS = 2;
const CARD_GAP = 10;
const totalW = W - 2 * GRID_PAD;
const totalH = H - GRID_TOP - GRID_PAD - 12;
const cardW = (totalW - (CARD_COLS - 1) * CARD_GAP) / CARD_COLS;
const cardH = (totalH - (CARD_ROWS - 1) * CARD_GAP) / CARD_ROWS;

cards.forEach((card, idx) => {
  const col = idx % CARD_COLS;
  const row = Math.floor(idx / CARD_COLS);
  const cx = GRID_PAD + col * (cardW + CARD_GAP);
  const cy = GRID_TOP + row * (cardH + CARD_GAP);
  const catColor = CAT_COLORS[card.cat] || TEXT_INK;

  // Card background with subtle shadow
  svg += `<rect x="${cx+2}" y="${cy+2}" width="${cardW}" height="${cardH}" rx="6" fill="#00000010"/>`;
  svg += `<rect x="${cx}" y="${cy}" width="${cardW}" height="${cardH}" rx="6" fill="${CARD_BG}" stroke="${CARD_BD}" stroke-width="1"/>`;

  // Category header bar
  svg += `<rect x="${cx}" y="${cy}" width="${cardW}" height="24" rx="6" fill="${catColor}"/>`;
  // Fix bottom corners of header (they should be square where they meet the card body)
  svg += `<rect x="${cx}" y="${cy+12}" width="${cardW}" height="12" fill="${catColor}"/>`;
  svg += `<text x="${cx+10}" y="${cy+16}" font-family="Arial" font-size="9" fill="white" font-weight="bold" letter-spacing="1.2">${esc(card.catLabel)}</text>`;

  // Headline with word wrap (reduced width by ~18px for comfortable right padding)
  const headlineMaxW = cardW - 38;
  const headlineLines = wrapText(card.headline, headlineMaxW, 13.5, true, true);
  headlineLines.forEach((line, li) => {
    if (li < 3) { // Max 3 headline lines
      svg += `<text x="${cx+10}" y="${cy+42+li*16}" font-family="Georgia" font-size="13.5" fill="${TEXT_INK}" font-weight="bold">${esc(line)}</text>`;
    }
  });

  // Thin divider
  const divY = cy + 42 + Math.min(headlineLines.length, 3) * 16 + 4;
  svg += `<line x1="${cx+10}" y1="${divY}" x2="${cx+cardW-10}" y2="${divY}" stroke="${CARD_BD}" stroke-width="0.8"/>`;

  // Illustration area
  const illY = divY + 5;
  const illH = cardH * 0.38;
  const illContent = illustrationFns[card.illustration]?.(cx + 8, illY, cardW - 16, illH) ?? '';
  svg += illContent;

  // Summary text with word wrap (increased font-size with 1.45 line-height)
  const summaryFontSize = 11.5;
  const summaryLineHeight = Math.round(summaryFontSize * 1.45 * 10) / 10;
  const summaryY = illY + illH + 18;
  const summaryMaxW = cardW - 24;
  const summaryLines = wrapText(card.summary, summaryMaxW, summaryFontSize, false, false);
  summaryLines.forEach((line, li) => {
    if (li < 4) { // Max 4 summary lines
      svg += `<text x="${cx+12}" y="${summaryY+li*summaryLineHeight}" font-family="Arial" font-size="${summaryFontSize}" fill="${TEXT_MUT}">${esc(line)}</text>`;
    }
  });

  // Bottom metadata/source footer strip (y = cardBottom - 26)
  const cardBottom = cy + cardH;
  const footerY = cardBottom - 26;
  svg += `<line x1="${cx+10}" y1="${footerY}" x2="${cx+cardW-10}" y2="${footerY}" stroke="${CARD_BD}" stroke-width="0.7"/>`;
  svg += `<text x="${cx+12}" y="${footerY+16}" font-family="Arial" font-size="8" fill="${TEXT_MUT}" font-weight="bold" letter-spacing="0.5">${esc(card.source)}</text>`;
  svg += `<text x="${cx+cardW-12}" y="${footerY+16}" font-family="Arial" font-size="8" fill="${TEXT_MUT}" text-anchor="end">${esc(card.tag)}</text>`;
});

// ── Footer ─────────────────────────────────────────────────────────────
svg += `<line x1="14" y1="${H-14}" x2="${W-14}" y2="${H-14}" stroke="${CARD_BD}" stroke-width="0.5"/>`;
svg += `<text x="36" y="${H-4}" font-family="Arial" font-size="7" fill="${TEXT_MUT}">WORLD NEWS DIGEST</text>`;
svg += `<text x="${W/2}" y="${H-4}" font-family="Arial" font-size="7" fill="${TEXT_MUT}" text-anchor="middle">Wednesday, 18 November 2026 - Evening Edition</text>`;
svg += `<text x="988" y="${H-4}" font-family="Arial" font-size="7" fill="${TEXT_MUT}" text-anchor="end">All Rights Reserved</text>`;

svg += `</svg>`;

// ── Render to PNG ──────────────────────────────────────────────────────
// Load local font files
const georgiaData   = readFileSync(join(fontsDir, 'georgia.ttf'));
const georgiaBData  = readFileSync(join(fontsDir, 'georgiab.ttf'));
const arialData     = readFileSync(join(fontsDir, 'arial.ttf'));
const arialBData    = readFileSync(join(fontsDir, 'arialbd.ttf'));

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
    defaultFontFamily: 'Georgia',
  },
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

writeFileSync(join(outDir, 'entry.png'), pngBuffer);

// Also write to repo root for inspection
writeFileSync(join(ROOT, 'entry.png'), pngBuffer);
writeFileSync(join(ROOT, 'entry.svg'), svg);

console.log(`Generated editorial front-page PNG: ${pngBuffer.length} bytes (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
console.log(`Dimensions: ${W}x${H}`);
console.log(`Output: ${join(outDir, 'entry.png')}`);
