/**
 * GENERATORE AUTOMATICO DI POST SOCIAL - FINCALCOLATORE
 * Seleziona il caso studio del giorno, calcola i dati e genera:
 * 1. La grafica vettoriale 1080x1080 (SVG/PNG)
 * 2. Il copy pronto per Instagram, Facebook, TikTok e Reddit
 */

const fs = require('fs');
const path = require('path');

const topicsPath = path.join(__dirname, 'topics.json');
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));

// Calcola indice basato sul giorno dell'anno e sull'ora (slot 0: pranzo, slot 1: sera)
const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 1);
const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
const hour = now.getUTCHours(); // es. 10 UTC (~12:30 ita) -> slot 0, 17 UTC (~19:30 ita) -> slot 1
const slot = hour < 14 ? 0 : 1;

const postIndex = ((dayOfYear * 2) + slot) % topics.length;
const post = topics[postIndex];

console.log(`[Autopilot] Selezionato post #${postIndex + 1}/${topics.length}: "${post.id}" (${post.category})`);

// Template Grafico SVG 1080x1080 con estetica FinCalcolatore
function generateSvgCard(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="postBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A192F"/>
      <stop offset="55%" stop-color="#071529"/>
      <stop offset="100%" stop-color="#040A14"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#112240"/>
      <stop offset="100%" stop-color="#0D1B33"/>
    </linearGradient>
    <linearGradient id="brandLogo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1E56A0"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#postBg)"/>
  <circle cx="850" cy="220" r="320" fill="#1E56A0" opacity="0.16"/>
  <circle cx="200" cy="880" r="280" fill="#4A90E2" opacity="0.12"/>

  <!-- Header -->
  <g transform="translate(80, 80)">
    <rect width="52" height="52" rx="14" fill="url(#brandLogo)" stroke="#4A90E2" stroke-width="1.5"/>
    <polyline points="38,15 24,31 16,23 8,32" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="29,15 38,15 38,24" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

    <text x="70" y="34" font-family="'Poppins', Arial, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">
      FinCalcolatore
    </text>
  </g>

  <!-- Hook Question -->
  <text x="80" y="210" font-family="'Poppins', Arial, sans-serif" font-size="38" font-weight="800" fill="#FFFFFF" letter-spacing="-0.01em">
    ${escapeXml(p.hook.length > 55 ? p.hook.substring(0, 52) + '...' : p.hook)}
  </text>
  <text x="80" y="260" font-family="'Poppins', Arial, sans-serif" font-size="18" font-weight="500" fill="#94A3B8">
    Simulazione matematica con dati ufficiali • Fonte: fincalcolatore.vercel.app
  </text>

  <!-- Main Card Container -->
  <g transform="translate(80, 310)">
    <rect width="920" height="520" rx="24" fill="url(#cardGrad)" stroke="#233554" stroke-width="2"/>

    <!-- Row 1 -->
    <g transform="translate(50, 45)">
      <text x="0" y="22" font-family="'Poppins', Arial, sans-serif" font-size="17" font-weight="600" fill="#94A3B8">
        ${escapeXml(p.stat1_label)}
      </text>
      <text x="0" y="68" font-family="'Poppins', Arial, sans-serif" font-size="38" font-weight="800" fill="#CBD5E1">
        ${escapeXml(p.stat1_val)}
      </text>
      <text x="820" y="68" font-family="'Poppins', Arial, sans-serif" font-size="16" font-weight="500" fill="#64748B" text-anchor="end">
        ${escapeXml(p.stat1_sub)}
      </text>
    </g>

    <line x1="50" y1="175" x2="870" y2="175" stroke="#1E293B" stroke-width="1.5"/>

    <!-- Row 2 -->
    <g transform="translate(50, 215)">
      <text x="0" y="22" font-family="'Poppins', Arial, sans-serif" font-size="17" font-weight="600" fill="#4A90E2">
        ${escapeXml(p.stat2_label)}
      </text>
      <text x="0" y="68" font-family="'Poppins', Arial, sans-serif" font-size="38" font-weight="800" fill="#4A90E2">
        ${escapeXml(p.stat2_val)}
      </text>
      <text x="820" y="68" font-family="'Poppins', Arial, sans-serif" font-size="16" font-weight="700" fill="#3B82F6" text-anchor="end">
        ${escapeXml(p.stat2_sub)}
      </text>
    </g>

    <line x1="50" y1="345" x2="870" y2="345" stroke="#1E293B" stroke-width="1.5"/>

    <!-- Row 3 -->
    <g transform="translate(50, 385)">
      <text x="0" y="22" font-family="'Poppins', Arial, sans-serif" font-size="17" font-weight="700" fill="#FFFFFF">
        ${escapeXml(p.stat3_label)}
      </text>
      <text x="0" y="80" font-family="'Poppins', Arial, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.02em">
        ${escapeXml(p.stat3_val)}
      </text>
      <rect x="650" y="32" width="170" height="44" rx="12" fill="#1E56A0"/>
      <text x="735" y="59" font-family="'Poppins', Arial, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">
        ${escapeXml(p.stat3_badge)}
      </text>
    </g>
  </g>

  <!-- Bottom CTA -->
  <g transform="translate(80, 890)">
    <rect width="920" height="90" rx="20" fill="#1E56A0"/>
    <text x="460" y="52" font-family="'Poppins', Arial, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">
      Calcola gratis la tua simulazione su fincalcolatore.vercel.app (Link in Bio)
    </text>
  </g>
</svg>`;
}

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Assicura cartella di output
const outDir = path.join(__dirname, 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Scrivi SVG
const svgContent = generateSvgCard(post);
const svgPath = path.join(outDir, 'current_post.svg');
fs.writeFileSync(svgPath, svgContent, 'utf8');
console.log(`[Autopilot] Grafica SVG generata in: ${svgPath}`);

// Scrivi Payload Metadati
const payload = {
  id: post.id,
  category: post.category,
  date: now.toISOString(),
  slot: slot === 0 ? 'pranzo' : 'sera',
  instagram: {
    caption: post.caption_ig,
    image_file: 'current_post.svg'
  },
  facebook: {
    caption: post.caption_ig,
    image_file: 'current_post.svg'
  },
  reddit: {
    title: post.reddit_title,
    body: post.reddit_body,
    subreddit: 'FinCalcolatore' // O subreddit di finanza se applicabile
  },
  tiktok: {
    hook: post.hook,
    description: post.caption_ig.split('\n\n')[0] + ' #finanzapersonale #investimenti #pacetf'
  }
};

const jsonPath = path.join(outDir, 'post_payload.json');
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
console.log(`[Autopilot] Payload pronto in: ${jsonPath}`);
