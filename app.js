/**
 * FINCALCOLATORE PRO — MOTORE FINTECH REATTIVO (100% CLIENT-SIDE)
 * Design System: Stripe Clean Fintech
 * Calcoli Matematici Precisi, Grafico Canvas Interattivo con Tooltip e Micro-Interazioni
 */

(function () {
  'use strict';

  // Stato dell'applicazione
  const state = {
    activeTab: 'pac', // 'pac' | 'fire'
    initialCapital: 5000,
    monthlyContribution: 300,
    annualReturn: 7.0, // %
    years: 25,
    inflationRate: 2.0, // %
    
    // Parametri FIRE
    monthlyExpenses: 1500,
    safeWithdrawalRate: 4.0, // %
    
    // Dati calcolati memorizzati per il tooltip del grafico
    lastBreakdown: []
  };

  // Elementi DOM
  const dom = {
    // PAC Inputs & Sliders
    initialCapitalInput: document.getElementById('initialCapital'),
    initialCapitalRange: document.getElementById('initialCapitalRange'),
    monthlyInput: document.getElementById('monthlyContribution'),
    monthlyRange: document.getElementById('monthlyRange'),
    returnInput: document.getElementById('annualReturn'),
    returnRange: document.getElementById('returnRange'),
    yearsInput: document.getElementById('years'),
    yearsRange: document.getElementById('yearsRange'),
    inflationInput: document.getElementById('inflationRate'),
    
    // KPI Display
    kpiFinalTotal: document.getElementById('kpiFinalTotal'),
    kpiTotalContributed: document.getElementById('kpiTotalContributed'),
    kpiInterestEarned: document.getElementById('kpiInterestEarned'),
    kpiRealValue: document.getElementById('kpiRealValue'),
    
    // Progress Bar
    barPrincipal: document.getElementById('barPrincipal'),
    barInterest: document.getElementById('barInterest'),
    pctPrincipal: document.getElementById('pctPrincipal'),
    pctInterest: document.getElementById('pctInterest'),

    // Canvas & Tooltip
    chartCanvas: document.getElementById('wealthChart'),
    chartTooltip: document.getElementById('chartTooltip'),
    
    // Tabella
    amortTableBody: document.getElementById('amortTableBody'),
    
    // Controlli Sezioni & Tabs
    sectionPac: document.getElementById('sectionPac'),
    sectionFire: document.getElementById('sectionFire'),
    segmentedButtons: document.querySelectorAll('.segmented-btn'),
    presetChips: document.querySelectorAll('.preset-chip'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnPrintPdf: document.getElementById('btnPrintPdf'),
    btnShareSimulation: document.getElementById('btnShareSimulation'),
    btnShareFire: document.getElementById('btnShareFire'),
    btnPrintFire: document.getElementById('btnPrintFire'),

    // FIRE Elements
    fireExpensesInput: document.getElementById('fireExpenses'),
    fireSwrInput: document.getElementById('fireSwr'),
    fireNumberKpi: document.getElementById('fireNumberKpi'),
    fireMultiplierSub: document.getElementById('fireMultiplierSub'),
    fireYearsKpi: document.getElementById('fireYearsKpi'),
    fireMonthlyPassiveKpi: document.getElementById('fireMonthlyPassiveKpi'),
    horizonPills: document.getElementById('horizonPills'),
    horizonLabelTag: document.getElementById('horizonLabelTag'),

    // Codici Promo
    codeSatispayVal: document.getElementById('codeSatispayVal'),
    codeHypeVal: document.getElementById('codeHypeVal'),
    affiliatesGrid: document.getElementById('affiliatesGrid')
  };

  /**
   * FORMATTAZIONE VALUTA
   */
  function formatCurrency(amount) {
    const symbol = (window.APP_CONFIG && window.APP_CONFIG.defaultCurrency) || '€';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * MATEMATICA: CALCOLO CRESCITA PAC & INTERESSE COMPOSTO
   */
  function calculatePacGrowth(initial, monthly, annualRate, numYears, inflation) {
    const r = annualRate / 100 / 12;
    const totalMonths = numYears * 12;
    
    let balance = initial;
    let totalContributed = initial;
    const yearlyBreakdown = [];

    for (let m = 1; m <= totalMonths; m++) {
      const interestEarnedMonth = balance * r;
      balance += interestEarnedMonth + monthly;
      totalContributed += monthly;

      if (m % 12 === 0) {
        const yearIndex = m / 12;
        const inflationFactor = Math.pow(1 + (inflation / 100), yearIndex);
        const realBalance = balance / inflationFactor;

        yearlyBreakdown.push({
          year: yearIndex,
          totalContributed: Math.round(totalContributed),
          interestEarned: Math.round(balance - totalContributed),
          nominalBalance: Math.round(balance),
          realBalance: Math.round(realBalance)
        });
      }
    }

    return {
      finalBalance: Math.round(balance),
      totalContributed: Math.round(totalContributed),
      totalInterest: Math.round(balance - totalContributed),
      realBalance: Math.round(balance / Math.pow(1 + (inflation / 100), numYears)),
      breakdown: yearlyBreakdown
    };
  }

  /**
   * MATEMATICA: SIMULATORE FIRE
   */
  function calculateFireMetrics(monthlyExpenses, swrRate, currentCapital, monthlySave, annualReturnRate) {
    const annualExpenses = monthlyExpenses * 12;
    const swr = (swrRate || 4.0) / 100;
    const fireNumber = Math.round(annualExpenses / swr);

    let balance = currentCapital;
    const r = (annualReturnRate || 7.0) / 100 / 12;
    let monthsToFire = 0;
    const maxMonths = 1200;

    while (balance < fireNumber && monthsToFire < maxMonths) {
      balance = balance * (1 + r) + monthlySave;
      monthsToFire++;
    }

    const yearsToFire = (monthsToFire / 12).toFixed(1);
    const monthlyPassiveCashflow = Math.round((fireNumber * swr) / 12);

    return {
      fireNumber,
      yearsToFire: monthsToFire >= maxMonths ? '> 50' : yearsToFire,
      monthlyPassiveCashflow
    };
  }

  /**
   * RENDERING GRAFICO CANVAS INTERATTIVO CON CURVE PULITE
   */
  function renderChart(breakdown, highlightIndex) {
    if (!dom.chartCanvas) return;
    const canvas = dom.chartCanvas;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    if (!breakdown || breakdown.length === 0) return;

    const padLeft = 60;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const maxVal = breakdown[breakdown.length - 1].nominalBalance * 1.08;

    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Linee guida orizzontali e etichette asse Y
    const gridLines = 4;
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = isDark ? '#9ca3af' : '#64748b';
    ctx.font = '500 11px Poppins, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const val = (maxVal / gridLines) * i;
      const y = padTop + plotH - (plotH * (i / gridLines));
      
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      let labelText = val >= 1000000 ? (val / 1000000).toFixed(1) + 'M €' :
                      val >= 1000 ? Math.round(val / 1000) + 'k €' : Math.round(val) + ' €';
      ctx.fillText(labelText, padLeft - 8, y + 4);
    }

    // Coordinate dei punti
    const ptsNominal = [];
    const ptsContrib = [];

    breakdown.forEach((pt, idx) => {
      const x = padLeft + (plotW * (idx / (breakdown.length - 1)));
      const yNom = padTop + plotH - (plotH * (pt.nominalBalance / maxVal));
      const yCon = padTop + plotH - (plotH * (pt.totalContributed / maxVal));
      ptsNominal.push({ x, y: yNom, data: pt });
      ptsContrib.push({ x, y: yCon, data: pt });
    });

    const colorPrincipal = isDark ? '#94A3B8' : '#64748B';
    const colorInterest = isDark ? '#4A90E2' : '#1E56A0';

    // Area Gradiente Trust Blue (Interessi Composti / Capitale Totale)
    const gradInterest = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    gradInterest.addColorStop(0, isDark ? 'rgba(74, 144, 226, 0.28)' : 'rgba(30, 86, 160, 0.20)');
    gradInterest.addColorStop(1, 'rgba(30, 86, 160, 0.01)');

    ctx.beginPath();
    ctx.moveTo(ptsNominal[0].x, ptsNominal[0].y);
    for (let i = 1; i < ptsNominal.length; i++) {
      ctx.lineTo(ptsNominal[i].x, ptsNominal[i].y);
    }
    ctx.lineTo(ptsNominal[ptsNominal.length - 1].x, padTop + plotH);
    ctx.lineTo(ptsNominal[0].x, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = gradInterest;
    ctx.fill();

    // Area Gradiente Slate Grey (Capitale Versato)
    const gradContrib = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    gradContrib.addColorStop(0, isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(100, 116, 139, 0.10)');
    gradContrib.addColorStop(1, 'rgba(100, 116, 139, 0.01)');

    ctx.beginPath();
    ctx.moveTo(ptsContrib[0].x, ptsContrib[0].y);
    for (let i = 1; i < ptsContrib.length; i++) {
      ctx.lineTo(ptsContrib[i].x, ptsContrib[i].y);
    }
    ctx.lineTo(ptsContrib[ptsContrib.length - 1].x, padTop + plotH);
    ctx.lineTo(ptsContrib[0].x, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = gradContrib;
    ctx.fill();

    // Linea Capitale Versato (Slate Grey tratteggiata per distinguere immediatamente i versamenti)
    ctx.strokeStyle = colorPrincipal;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(ptsContrib[0].x, ptsContrib[0].y);
    for (let i = 1; i < ptsContrib.length; i++) {
      ctx.lineTo(ptsContrib[i].x, ptsContrib[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset tratteggio

    // Linea Capitale Totale (Trust Blue continua e marcata)
    ctx.strokeStyle = colorInterest;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ptsNominal[0].x, ptsNominal[0].y);
    for (let i = 1; i < ptsNominal.length; i++) {
      ctx.lineTo(ptsNominal[i].x, ptsNominal[i].y);
    }
    ctx.stroke();

    // Etichette Anni Asse X (con spaziatura dinamica anti-sovrapposizione)
    const totalYears = breakdown[breakdown.length - 1].year || (breakdown.length - 1);
    const minLabelGap = plotW < 400 ? 52 : 72;
    const maxLabels = Math.max(2, Math.floor(plotW / minLabelGap));

    // Determina un passo pulito (1, 2, 5, 10, 15, 20)
    let idealStep = Math.max(1, Math.ceil(totalYears / maxLabels));
    if (idealStep > 2 && idealStep <= 5) idealStep = 5;
    else if (idealStep > 5 && idealStep <= 10) idealStep = 10;
    else if (idealStep > 10 && idealStep <= 15) idealStep = 15;
    else if (idealStep > 15) idealStep = 20;

    const indicesToLabel = [];
    for (let i = 0; i < breakdown.length - 1; i += idealStep) {
      indicesToLabel.push(i);
    }
    // Aggiungi sempre l'ultimo anno (traguardo finale)
    indicesToLabel.push(breakdown.length - 1);

    // Se l'ultimo anno e il penultimo sono troppo vicini, elimina il penultimo
    if (indicesToLabel.length >= 2) {
      const lastIdx = indicesToLabel[indicesToLabel.length - 1];
      const prevIdx = indicesToLabel[indicesToLabel.length - 2];
      if (ptsNominal[lastIdx].x - ptsNominal[prevIdx].x < minLabelGap * 0.75) {
        indicesToLabel.splice(indicesToLabel.length - 2, 1);
      }
    }

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '500 11px Poppins, sans-serif';

    indicesToLabel.forEach((idx) => {
      const pt = ptsNominal[idx];
      if (!pt) return;

      if (idx === 0) {
        ctx.textAlign = 'left';
      } else if (idx === breakdown.length - 1) {
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'center';
      }

      const yr = pt.data.year;
      const label = (plotW < 380)
        ? (yr === 0 ? '0' : yr + 'a')
        : (yr === 0 ? 'Anno 0' : 'Anno ' + yr);

      ctx.fillText(label, pt.x, padTop + plotH + 18);
    });

    // Evidenziazione punto selezionato da hover
    if (highlightIndex !== undefined && ptsNominal[highlightIndex]) {
      const pNom = ptsNominal[highlightIndex];
      const pCon = ptsContrib[highlightIndex];

      // Linea verticale guida
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : '#cbd5e1';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pNom.x, padTop);
      ctx.lineTo(pNom.x, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Punto Capitale Totale (Trust Blue)
      ctx.fillStyle = colorInterest;
      ctx.beginPath();
      ctx.arc(pNom.x, pNom.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(pNom.x, pNom.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Punto Capitale Versato (Slate Grey)
      ctx.fillStyle = colorPrincipal;
      ctx.beginPath();
      ctx.arc(pCon.x, pCon.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(pCon.x, pCon.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * AGGIORNAMENTO COMPLETO UI
   */
  function updateUI() {
    const result = calculatePacGrowth(
      state.initialCapital,
      state.monthlyContribution,
      state.annualReturn,
      state.years,
      state.inflationRate
    );

    state.lastBreakdown = result.breakdown;

    // Aggiornamento KPI
    if (dom.kpiFinalTotal) dom.kpiFinalTotal.textContent = formatCurrency(result.finalBalance);
    if (dom.kpiTotalContributed) dom.kpiTotalContributed.textContent = formatCurrency(result.totalContributed);
    if (dom.kpiInterestEarned) dom.kpiInterestEarned.textContent = formatCurrency(result.totalInterest);
    if (dom.kpiRealValue) dom.kpiRealValue.textContent = formatCurrency(result.realBalance);

    // Aggiornamento Progress Bar
    const total = result.finalBalance || 1;
    const pctPrincipalVal = Math.round((result.totalContributed / total) * 100);
    const pctInterestVal = 100 - pctPrincipalVal;

    if (dom.barPrincipal) dom.barPrincipal.style.width = pctPrincipalVal + '%';
    if (dom.barInterest) dom.barInterest.style.width = pctInterestVal + '%';
    if (dom.pctPrincipal) dom.pctPrincipal.textContent = `${pctPrincipalVal}% (${formatCurrency(result.totalContributed)})`;
    if (dom.pctInterest) dom.pctInterest.textContent = `${pctInterestVal}% (${formatCurrency(result.totalInterest)})`;

    // Render Canvas
    renderChart(result.breakdown);

    // Tabella Ammortamento
    if (dom.amortTableBody) {
      dom.amortTableBody.innerHTML = '';
      result.breakdown.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>Anno ${row.year}</strong></td>
          <td class="tabular-nums">${formatCurrency(row.totalContributed)}</td>
          <td class="tabular-nums" style="color: var(--accent-primary); font-weight: 600;">+${formatCurrency(row.interestEarned)}</td>
          <td class="tabular-nums"><strong>${formatCurrency(row.nominalBalance)}</strong></td>
          <td class="tabular-nums" style="color: var(--text-muted);">${formatCurrency(row.realBalance)}</td>
        `;
        dom.amortTableBody.appendChild(tr);
      });
    }

    // Calcoli FIRE
    const fireMetrics = calculateFireMetrics(
      state.monthlyExpenses,
      state.safeWithdrawalRate,
      state.initialCapital,
      state.monthlyContribution,
      state.annualReturn
    );

    if (dom.fireNumberKpi) dom.fireNumberKpi.textContent = formatCurrency(fireMetrics.fireNumber);
    if (dom.fireMultiplierSub) {
      const mult = (100 / (state.safeWithdrawalRate || 4.0)).toFixed(1);
      dom.fireMultiplierSub.textContent = `${mult}x le tue spese annuali`;
    }
    if (dom.fireYearsKpi) dom.fireYearsKpi.textContent = `${fireMetrics.yearsToFire} Anni`;
    if (dom.fireMonthlyPassiveKpi) dom.fireMonthlyPassiveKpi.textContent = `${formatCurrency(fireMetrics.monthlyPassiveCashflow)} / m`;
  }

  /**
   * GESTIONE TOOLTIP INTERATTIVO SUL GRAFICO
   */
  function setupChartTooltip() {
    if (!dom.chartCanvas || !dom.chartTooltip) return;

    dom.chartCanvas.addEventListener('mousemove', (e) => {
      const rect = dom.chartCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padLeft = 60;
      const padRight = 20;
      const plotW = rect.width - padLeft - padRight;

      if (x < padLeft || x > rect.width - padRight || !state.lastBreakdown.length) {
        dom.chartTooltip.style.display = 'none';
        renderChart(state.lastBreakdown);
        return;
      }

      const ratio = (x - padLeft) / plotW;
      const index = Math.min(
        state.lastBreakdown.length - 1,
        Math.max(0, Math.round(ratio * (state.lastBreakdown.length - 1)))
      );

      const data = state.lastBreakdown[index];
      if (!data) return;

      renderChart(state.lastBreakdown, index);

      // Posiziona il tooltip
      const plotX = padLeft + (plotW * (index / (state.lastBreakdown.length - 1)));
      dom.chartTooltip.style.left = `${plotX}px`;
      dom.chartTooltip.style.top = `60px`;
      dom.chartTooltip.style.display = 'block';

      dom.chartTooltip.innerHTML = `
        <div class="chart-tooltip-title">Anno ${data.year}</div>
        <div class="chart-tooltip-row">
          <span>Capitale Totale:</span>
          <strong style="color: var(--color-interest);">${formatCurrency(data.nominalBalance)}</strong>
        </div>
        <div class="chart-tooltip-row">
          <span>Versamenti:</span>
          <span style="color: var(--color-principal); font-weight: 600;">${formatCurrency(data.totalContributed)}</span>
        </div>
        <div class="chart-tooltip-row">
          <span>Interessi:</span>
          <span style="color: var(--color-interest); font-weight: 600;">+${formatCurrency(data.interestEarned)}</span>
        </div>
      `;
    });

    dom.chartCanvas.addEventListener('mouseleave', () => {
      dom.chartTooltip.style.display = 'none';
      renderChart(state.lastBreakdown);
    });
  }

  /**
   * TASTI "COPIA CODICE" CON FEEDBACK
   */
  function setupCopyButtons() {
    document.querySelectorAll('.btn-copy-code').forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.copyTarget;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const codeText = targetEl.textContent.trim();
        navigator.clipboard.writeText(codeText).then(() => {
          const originalText = button.innerHTML;
          button.classList.add('copied');
          button.innerHTML = `✓ Copiato!`;

          setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalText;
          }, 2000);
        });
      });
    });
  }

  /**
   * FAQ ACCORDION INTERACTION
   */
  function setupFaqAccordion() {
    document.querySelectorAll('.faq-accordion-item').forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (trigger) {
        trigger.addEventListener('click', () => {
          item.classList.toggle('open');
        });
      }
    });
  }

  /**
   * RENDERING DINAMICO BROKER IN ORDINE DI CONVENIENZA (PRIORITY) & GESTIONE CODICI PROMO
   */
  function renderAffiliatePartners() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.affiliates) return;
    const config = window.APP_CONFIG.affiliates;
    if (!config.enabled) return;
    const partners = [...(config.partners || [])];
    if (partners.length === 0) return;

    // Ordina i broker: i più convenienti (priority più bassa: 1, 2, 3...) vengono messi IN ALTO
    partners.sort((a, b) => {
      const pA = typeof a.priority === 'number' ? a.priority : 999;
      const pB = typeof b.priority === 'number' ? b.priority : 999;
      return pA - pB;
    });

    const grid = dom.affiliatesGrid || document.getElementById('affiliatesGrid');
    if (!grid) return;

    grid.innerHTML = partners.map(p => {
      const isHype = p.id === 'hype';
      const logoPadding = isHype ? ' style="padding: 3px;"' : '';

      const specsHtml = (p.specs || []).map(s => `
        <div class="spec-item">
          <span class="spec-label">${s.label}</span>
          <span class="spec-value${s.highlight ? ' highlight-green' : ''}">${s.value}</span>
        </div>
      `).join('');

      const prosHtml = (p.pros || []).map(item => `
        <li class="partner-pro-item">
          <span class="pro-check-icon">✓</span>
          <span>${item}</span>
        </li>
      `).join('');

      const perkHtml = p.promoCode ? `
        <div class="promo-code-container">
          <div class="promo-code-info">
            <span class="promo-code-label">Codice Invito</span>
            <span class="promo-code-val" id="code_${p.id}Val">${p.promoCode}</span>
          </div>
          <button class="btn-copy-code" data-copy-target="code_${p.id}Val" title="Copia codice">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copia
          </button>
        </div>
      ` : `
        <div class="promo-feature-container">
          <span class="promo-feature-tag">${p.perkTag || 'PROMO ATTIVA'}</span>
          <span class="promo-feature-text">${p.perkText || p.bonusText}</span>
        </div>
      `;

      return `
        <div class="partner-card" data-partner-id="${p.id}">
          <div class="partner-topline-header">
            <div class="partner-brand-group">
              <div class="partner-logo-square">
                <img src="${p.logo}" alt="Logo ${p.name}" class="partner-logo-img"${logoPadding}>
              </div>
              <div class="partner-title-group">
                <h3 class="partner-name">${p.name}</h3>
                <span class="partner-category-sub">${p.category}</span>
              </div>
            </div>
            <div class="justetf-rating-box">
              <span class="rating-score-badge">${p.ratingScore || '4.8'}</span>
              <div class="rating-text-group">
                <span class="rating-stars">${p.ratingStars || '★★★★★'}</span>
                <span class="rating-label">${p.ratingLabel || 'Consigliato'}</span>
              </div>
            </div>
          </div>

          <div class="partner-specs-grid">
            ${specsHtml}
          </div>

          <ul class="partner-pros-list">
            ${prosHtml}
          </ul>

          <div class="partner-perk-container">
            ${perkHtml}
          </div>

          <a href="${p.url}" target="_blank" rel="noopener sponsored" class="btn-partner-action">
            ${p.ctaText || 'Scopri Offerta'}
          </a>
        </div>
      `;
    }).join('');

    // Riattacca i listener sui pulsanti di copia appena generati
    setupCopyButtons();
  }

  /**
   * ESPORTAZIONE CSV
   */
  function exportToCsv() {
    const result = calculatePacGrowth(
      state.initialCapital,
      state.monthlyContribution,
      state.annualReturn,
      state.years,
      state.inflationRate
    );

    let csvContent = 'Anno,Capitale Versato,Interessi Maturati,Totale Nominale,Valore Reale\n';
    result.breakdown.forEach(row => {
      csvContent += `${row.year},${row.totalContributed},${row.interestEarned},${row.nominalBalance},${row.realBalance}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `piano-accumulo-pac-${state.years}anni.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * GENERAZIONE REPORT DI STAMPA ISOLATO (GRAFICO + TABELLA)
   */
  function generateAndPrintReport() {
    const printArea = document.getElementById('printReportArea');
    if (!printArea) {
      window.print();
      return;
    }

    const dateStr = new Date().toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Esporta il canvas in PNG ad alta risoluzione
    let chartImgSrc = '';
    if (dom.chartCanvas) {
      try {
        chartImgSrc = dom.chartCanvas.toDataURL('image/png');
      } catch (e) {
        console.warn('Canvas export failed:', e);
      }
    }

    // Clona le righe della tabella
    const tableRows = dom.amortTableBody ? dom.amortTableBody.innerHTML : '';
    const isFire = state.activeTab === 'fire';

    let headerSubtitle = 'Report di Proiezione del Patrimonio • Piano di Accumulo (PAC)';
    let paramsHtml = '';
    let kpiHtml = '';

    if (isFire) {
      headerSubtitle = 'Report Obiettivo Libertà Finanziaria • Simulazione FIRE';
      paramsHtml = `
        <div class="print-param-box">
          <span class="print-param-label">Spese Mensili</span>
          <span class="print-param-val">${formatCurrency(state.monthlyExpenses)}/m</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Tasso SWR</span>
          <span class="print-param-val">${state.safeWithdrawalRate.toFixed(1)}%</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Risparmio PAC</span>
          <span class="print-param-val">${formatCurrency(state.monthlyContribution)}/m</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Rendimento Atteso</span>
          <span class="print-param-val">${state.annualReturn.toFixed(1)}%</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Capitale Attuale</span>
          <span class="print-param-val">${formatCurrency(state.initialCapital)}</span>
        </div>
      `;

      kpiHtml = `
        <div class="print-kpi-box print-kpi-featured">
          <span class="print-kpi-label">FIRE Number Necessario</span>
          <span class="print-kpi-val">${dom.fireNumberKpi ? dom.fireNumberKpi.textContent : ''}</span>
          <span class="print-kpi-sub">Patrimonio target totale</span>
        </div>
        <div class="print-kpi-box">
          <span class="print-kpi-label">Tempo Stimato al Target</span>
          <span class="print-kpi-val">${dom.fireYearsKpi ? dom.fireYearsKpi.textContent : ''}</span>
          <span class="print-kpi-sub">Al ritmo di risparmio attuale</span>
        </div>
        <div class="print-kpi-box">
          <span class="print-kpi-label">Rendita Mensile Passiva</span>
          <span class="print-kpi-val" style="color: #0d9488;">${dom.fireMonthlyPassiveKpi ? dom.fireMonthlyPassiveKpi.textContent : ''}</span>
          <span class="print-kpi-sub">Prelievo mensile continuo</span>
        </div>
        <div class="print-kpi-box">
          <span class="print-kpi-label">Capitale Versato</span>
          <span class="print-kpi-val">${dom.kpiTotalContributed ? dom.kpiTotalContributed.textContent : ''}</span>
          <span class="print-kpi-sub">Totale versamenti</span>
        </div>
      `;
    } else {
      paramsHtml = `
        <div class="print-param-box">
          <span class="print-param-label">Capitale Iniziale</span>
          <span class="print-param-val">${formatCurrency(state.initialCapital)}</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Versamento PAC</span>
          <span class="print-param-val">${formatCurrency(state.monthlyContribution)}/m</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Orizzonte Temporale</span>
          <span class="print-param-val">${state.years} Anni</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Rendimento Stimato</span>
          <span class="print-param-val">${state.annualReturn.toFixed(1)}%</span>
        </div>
        <div class="print-param-box">
          <span class="print-param-label">Inflazione Media</span>
          <span class="print-param-val">${state.inflationRate.toFixed(1)}%</span>
        </div>
      `;

      kpiHtml = `
        <div class="print-kpi-box print-kpi-featured">
          <span class="print-kpi-label">Capitale Finale Stimato</span>
          <span class="print-kpi-val">${dom.kpiFinalTotal ? dom.kpiFinalTotal.textContent : ''}</span>
          <span class="print-kpi-sub">Valore nominale lordo</span>
        </div>
        <div class="print-kpi-box">
          <span class="print-kpi-label">Capitale Versato</span>
          <span class="print-kpi-val">${dom.kpiTotalContributed ? dom.kpiTotalContributed.textContent : ''}</span>
          <span class="print-kpi-sub">Totale versamenti</span>
        </div>
        <div class="print-kpi-box">
          <span class="print-kpi-label">Interessi Maturati</span>
          <span class="print-kpi-val" style="color: #0d9488;">${dom.kpiInterestEarned ? dom.kpiInterestEarned.textContent : ''}</span>
          <span class="print-kpi-sub">Da capitalizzazione composta</span>
        </div>
        <div class="print-kpi-box">
          <span class="print-kpi-label">Valore Reale Stimato</span>
          <span class="print-kpi-val">${dom.kpiRealValue ? dom.kpiRealValue.textContent : ''}</span>
          <span class="print-kpi-sub">Potere d'acquisto post-inflazione</span>
        </div>
      `;
    }

    printArea.innerHTML = `
      <div class="print-doc">
        <div class="print-header">
          <div class="print-brand">
            <img src="assets/logos/fincalcolatore.svg" alt="Logo FinCalcolatore" class="print-logo" width="36" height="36">
            <div>
              <h1 class="print-title">FinCalcolatore</h1>
              <p class="print-subtitle">${headerSubtitle}</p>
            </div>
          </div>
          <div class="print-meta">
            <div><strong>Data:</strong> ${dateStr}</div>
          </div>
        </div>

        <div class="print-section-title">1. Parametri della Simulazione</div>
        <div class="print-params-grid">
          ${paramsHtml}
        </div>

        <div class="print-section-title">2. Risultati della Proiezione</div>
        <div class="print-kpi-grid">
          ${kpiHtml}
        </div>

        ${chartImgSrc ? `
        <div class="print-section-title print-chart-title">3. Grafico di Proiezione del Capitale</div>
        <div class="print-chart-wrap">
          <img src="${chartImgSrc}" alt="Grafico Evoluzione Patrimonio" class="print-chart-img">
        </div>
        ` : ''}

        <div class="print-section-title print-page-break">4. Tabella Dettagliata Anno per Anno</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Capitale Versato</th>
              <th>Interessi Maturati</th>
              <th>Totale Nominale</th>
              <th>Valore Reale (Inflazionato)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="print-footer">
          <p>Documento generato da <strong>FinCalcolatore</strong></p>
          <p class="print-disclaimer">Disclaimer: I valori presentati in questo report sono stime matematiche a scopo illustrativo ed educativo. Non costituiscono in alcun modo consulenza finanziaria né sollecitazione all'investimento ai sensi del TUF.</p>
        </div>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  }

  /**
   * SINCRONIZZAZIONE INPUT E RANGE
   */
  function syncInputs(numberEl, rangeEl, stateKey, parser) {
    if (!numberEl || !rangeEl) return;

    const handler = (val) => {
      const parsed = parser ? parser(val) : Number(val);
      state[stateKey] = parsed;
      numberEl.value = parsed;
      rangeEl.value = parsed;
      updateUI();
    };

    numberEl.addEventListener('input', (e) => handler(e.target.value));
    rangeEl.addEventListener('input', (e) => handler(e.target.value));
  }

  /**
   * BIND EVENTI
   */
  function bindEvents() {
    syncInputs(dom.initialCapitalInput, dom.initialCapitalRange, 'initialCapital', Number);
    syncInputs(dom.monthlyInput, dom.monthlyRange, 'monthlyContribution', Number);
    syncInputs(dom.returnInput, dom.returnRange, 'annualReturn', parseFloat);
    syncInputs(dom.yearsInput, dom.yearsRange, 'years', parseInt);

    if (dom.inflationInput) {
      dom.inflationInput.addEventListener('input', (e) => {
        state.inflationRate = parseFloat(e.target.value) || 0;
        updateUI();
      });
    }

    if (dom.fireExpensesInput) {
      dom.fireExpensesInput.addEventListener('input', (e) => {
        state.monthlyExpenses = Number(e.target.value) || 1500;
        updateUI();
      });
    }

    if (dom.horizonPills) {
      dom.horizonPills.querySelectorAll('.horizon-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          dom.horizonPills.querySelectorAll('.horizon-pill-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const swr = parseFloat(btn.dataset.swr);
          const years = btn.dataset.years;
          if (dom.horizonLabelTag) dom.horizonLabelTag.textContent = `${years} Anni`;
          if (dom.fireSwrInput) dom.fireSwrInput.value = swr.toFixed(1);
          state.safeWithdrawalRate = swr;
          updateUI();
        });
      });
    }

    if (dom.fireSwrInput) {
      dom.fireSwrInput.addEventListener('input', (e) => {
        const swr = parseFloat(e.target.value) || 4.0;
        state.safeWithdrawalRate = swr;
        if (dom.horizonPills) {
          let matched = false;
          dom.horizonPills.querySelectorAll('.horizon-pill-btn').forEach(b => {
            if (Math.abs(parseFloat(b.dataset.swr) - swr) < 0.05) {
              b.classList.add('active');
              matched = true;
              if (dom.horizonLabelTag) dom.horizonLabelTag.textContent = `${b.dataset.years} Anni`;
            } else {
              b.classList.remove('active');
            }
          });
          if (!matched && dom.horizonLabelTag) {
            dom.horizonLabelTag.textContent = 'Personalizzato';
          }
        }
        updateUI();
      });
    }

    // Segmented Buttons (Tabs)
    dom.segmentedButtons.forEach(btn => {
      btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });

    if (dom.btnExportCsv) dom.btnExportCsv.addEventListener('click', exportToCsv);
    if (dom.btnPrintPdf) dom.btnPrintPdf.addEventListener('click', generateAndPrintReport);
    if (dom.btnShareSimulation) {
      dom.btnShareSimulation.addEventListener('click', () => shareSimulation(dom.btnShareSimulation));
    }
    if (dom.btnShareFire) {
      dom.btnShareFire.addEventListener('click', () => shareSimulation(dom.btnShareFire));
    }
    if (dom.btnPrintFire) {
      dom.btnPrintFire.addEventListener('click', generateAndPrintReport);
    }

    window.addEventListener('resize', () => {
      renderChart(state.lastBreakdown);
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        renderChart(state.lastBreakdown);
      });
    }
  }

  /**
   * CAMBIO SCHEDA ATTIVA (PAC / FIRE)
   */
  function setActiveTab(tab) {
    state.activeTab = tab;
    dom.segmentedButtons.forEach(b => {
      if (b.dataset.tab === tab) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    if (tab === 'pac') {
      if (dom.sectionPac) dom.sectionPac.style.display = 'block';
      if (dom.sectionFire) dom.sectionFire.style.display = 'none';
    } else if (tab === 'fire') {
      if (dom.sectionPac) dom.sectionPac.style.display = 'none';
      if (dom.sectionFire) dom.sectionFire.style.display = 'block';
    }
  }

  /**
   * CONDIVISIONE SIMULAZIONE CON URL QUERY PARAMETERS
   */
  function shareSimulation(buttonEl) {
    const isFire = state.activeTab === 'fire';
    const params = new URLSearchParams();

    if (isFire) {
      params.set('tab', 'fire');
      params.set('spese', Math.round(state.monthlyExpenses || 1500));
      params.set('swr', (state.safeWithdrawalRate || 4.0).toFixed(1));
      params.set('cap', Math.round(state.initialCapital || 0));
      params.set('pac', Math.round(state.monthlyContribution || 0));
      params.set('rend', (state.annualReturn || 7.0).toFixed(1));
    } else {
      params.set('tab', 'pac');
      params.set('cap', Math.round(state.initialCapital || 0));
      params.set('pac', Math.round(state.monthlyContribution || 0));
      params.set('anni', Math.round(state.years || 25));
      params.set('rend', (state.annualReturn || 7.0).toFixed(1));
      params.set('inf', (state.inflationRate || 2.0).toFixed(1));
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Aggiorna l'URL nella barra degli indirizzi senza ricaricare la pagina
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '?' + params.toString());
    }

    const showCopiedFeedback = () => {
      if (!buttonEl) return;
      const originalHtml = buttonEl.innerHTML;
      buttonEl.classList.add('copied');
      buttonEl.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Link Copiato!</span>
      `;

      setTimeout(() => {
        buttonEl.classList.remove('copied');
        buttonEl.innerHTML = originalHtml;
      }, 2500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(showCopiedFeedback)
        .catch(() => {
          prompt('Copia il link della tua simulazione:', shareUrl);
        });
    } else {
      prompt('Copia il link della tua simulazione:', shareUrl);
    }
  }

  /**
   * LETTURA PARAMETRI DALL'URL AL CARICAMENTO DELLA PAGINA
   */
  function loadStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    if (params.has('tab')) {
      const tab = params.get('tab').toLowerCase();
      if (tab === 'fire' || tab === 'pac') {
        setActiveTab(tab);
      }
    }

    if (params.has('cap')) {
      const val = parseFloat(params.get('cap'));
      if (!isNaN(val) && val >= 0) {
        state.initialCapital = val;
        if (dom.initialCapitalInput) dom.initialCapitalInput.value = val;
        if (dom.initialCapitalRange) dom.initialCapitalRange.value = Math.min(val, 500000);
      }
    }

    if (params.has('pac')) {
      const val = parseFloat(params.get('pac'));
      if (!isNaN(val) && val >= 0) {
        state.monthlyContribution = val;
        if (dom.monthlyInput) dom.monthlyInput.value = val;
        if (dom.monthlyRange) dom.monthlyRange.value = Math.min(val, 5000);
      }
    }

    if (params.has('anni')) {
      const val = parseInt(params.get('anni'), 10);
      if (!isNaN(val) && val >= 1 && val <= 50) {
        state.years = val;
        if (dom.yearsInput) dom.yearsInput.value = val;
        if (dom.yearsRange) dom.yearsRange.value = Math.min(val, 45);
      }
    }

    if (params.has('rend')) {
      const val = parseFloat(params.get('rend'));
      if (!isNaN(val) && val >= 0.1 && val <= 25) {
        state.annualReturn = val;
        if (dom.returnInput) dom.returnInput.value = val;
        if (dom.returnRange) dom.returnRange.value = Math.min(val, 15);
      }
    }

    if (params.has('inf')) {
      const val = parseFloat(params.get('inf'));
      if (!isNaN(val) && val >= 0 && val <= 10) {
        state.inflationRate = val;
        if (dom.inflationInput) dom.inflationInput.value = val;
      }
    }

    if (params.has('spese')) {
      const val = parseFloat(params.get('spese'));
      if (!isNaN(val) && val >= 100) {
        state.monthlyExpenses = val;
        if (dom.fireExpensesInput) dom.fireExpensesInput.value = val;
      }
    }

    if (params.has('swr')) {
      const val = parseFloat(params.get('swr'));
      if (!isNaN(val) && val >= 1 && val <= 10) {
        state.safeWithdrawalRate = val;
        if (dom.fireSwrInput) dom.fireSwrInput.value = val;
      }
    }
  }

  // Inizializzazione
  document.addEventListener('DOMContentLoaded', () => {
    renderAffiliatePartners();
    bindEvents();
    setupChartTooltip();
    setupCopyButtons();
    setupFaqAccordion();
    loadStateFromUrl();
    updateUI();
  });

})();
