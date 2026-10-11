/**
 * FINCALCOLATORE PRO - MOTORE DI CALCOLO 100% CLIENT-SIDE
 * Calcoli matematici precisi: Interesse Composto, PAC, Simulatore FIRE e Tassazione
 * Zero dipendenze esterne obbligatorie - Alta reattività e velocità
 */

(function () {
  'use strict';

  // Stato dell'applicazione
  const state = {
    activeTab: 'pac', // 'pac' | 'fire' | 'comparison'
    initialCapital: 5000,
    monthlyContribution: 300,
    annualReturn: 7.0, // %
    years: 25,
    inflationRate: 2.0, // %
    capitalGainsTax: 26, // % (Aliquota capital gain standard Italia)
    
    // Parametri FIRE
    monthlyExpenses: 1500,
    safeWithdrawalRate: 4.0, // % (Regola del 4%)
    currentAge: 30,
    targetFireAge: 55
  };

  // Riferimenti DOM
  const dom = {
    // Input PAC
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
    
    // Breakdown Bar
    barPrincipal: document.getElementById('barPrincipal'),
    barInterest: document.getElementById('barInterest'),
    pctPrincipal: document.getElementById('pctPrincipal'),
    pctInterest: document.getElementById('pctInterest'),

    // Canvas Chart
    chartCanvas: document.getElementById('wealthChart'),
    
    // Tabella Ammortamento
    amortTableBody: document.getElementById('amortTableBody'),
    
    // Sezione Affiliazioni
    affiliatesGrid: document.getElementById('affiliatesGrid'),
    
    // Tabs & Presets
    tabButtons: document.querySelectorAll('.tab-btn'),
    presetChips: document.querySelectorAll('.preset-chip'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnPrintPdf: document.getElementById('btnPrintPdf'),

    // Contenitori sezioni
    sectionPac: document.getElementById('sectionPac'),
    sectionFire: document.getElementById('sectionFire'),
    
    // FIRE DOM elements
    fireExpensesInput: document.getElementById('fireExpenses'),
    fireSwrInput: document.getElementById('fireSwr'),
    fireNumberKpi: document.getElementById('fireNumberKpi'),
    fireYearsKpi: document.getElementById('fireYearsKpi'),
    fireMonthlyPassiveKpi: document.getElementById('fireMonthlyPassiveKpi')
  };

  /**
   * FORMATTAZIONE VALUTA E NUMERI
   */
  function formatCurrency(amount) {
    const symbol = (window.APP_CONFIG && window.APP_CONFIG.defaultCurrency) || '€';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatPct(val) {
    return Number(val).toFixed(1) + '%';
  }

  /**
   * MATEMATICA: INTERESSE COMPOSTO & PAC
   * Calcolo mensile con capitalizzazione degli interessi
   */
  function calculatePacGrowth(initial, monthly, annualRate, numYears, inflation) {
    const r = annualRate / 100 / 12; // Tasso mensile
    const infMonthly = inflation / 100 / 12;
    const totalMonths = numYears * 12;
    
    let balance = initial;
    let totalContributed = initial;
    const yearlyBreakdown = [];

    let currentYearContributed = initial;
    let currentYearInterest = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const interestEarnedMonth = balance * r;
      balance += interestEarnedMonth + monthly;
      totalContributed += monthly;
      currentYearInterest += interestEarnedMonth;

      // Fine anno o fine periodo
      if (m % 12 === 0) {
        const yearIndex = m / 12;
        // Valore reale aggiustato per inflazione: PV = FV / (1 + i)^n
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
   * Calcolo target capitale per indipendenza finanziaria
   */
  function calculateFireMetrics(monthlyExpenses, swrRate, currentCapital, monthlySave, annualReturnRate) {
    const annualExpenses = monthlyExpenses * 12;
    const swr = (swrRate || 4.0) / 100;
    
    // FIRE Number standard = Spese Annuali / SWR (es. 25x a SWR 4%)
    const fireNumber = Math.round(annualExpenses / swr);
    const leanFire = Math.round(fireNumber * 0.75); // 75% spese
    const fatFire = Math.round(fireNumber * 1.35);  // 135% spese

    // Stima mesi necessari per raggiungere il Fire Number
    let balance = currentCapital;
    const r = (annualReturnRate || 7.0) / 100 / 12;
    let monthsToFire = 0;
    const maxMonths = 1200; // 100 anni limite di salvaguardia

    while (balance < fireNumber && monthsToFire < maxMonths) {
      balance = balance * (1 + r) + monthlySave;
      monthsToFire++;
    }

    const yearsToFire = (monthsToFire / 12).toFixed(1);
    const monthlyPassiveCashflow = Math.round((fireNumber * swr) / 12);

    return {
      fireNumber,
      leanFire,
      fatFire,
      yearsToFire: monthsToFire >= maxMonths ? '> 50' : yearsToFire,
      monthlyPassiveCashflow
    };
  }

  /**
   * RENDERING GRAFICO HTML5 CANVAS
   * Render ultra-leggero, responsivo, zero dipendenze esterne
   */
  function renderChart(breakdown) {
    if (!dom.chartCanvas) return;
    const canvas = dom.chartCanvas;
    const ctx = canvas.getContext('2d');
    
    // Adatta canvas al pixel ratio retina per massima nitidezza
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    if (!breakdown || breakdown.length === 0) return;

    const padLeft = 65;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const maxVal = breakdown[breakdown.length - 1].nominalBalance * 1.05;

    // Linee guida orizzontali
    const gridLines = 4;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, sans-serif';
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

    // Coordinate punti
    const pointsNominal = [];
    const pointsContributed = [];

    breakdown.forEach((pt, idx) => {
      const x = padLeft + (plotW * (idx / (breakdown.length - 1)));
      const yNom = padTop + plotH - (plotH * (pt.nominalBalance / maxVal));
      const yCon = padTop + plotH - (plotH * (pt.totalContributed / maxVal));
      pointsNominal.push({ x, y: yNom, val: pt.nominalBalance, year: pt.year });
      pointsContributed.push({ x, y: yCon, val: pt.totalContributed, year: pt.year });
    });

    // 1. Area Sottostante Interesse (Gradiente Emerald/Cyan)
    const gradInterest = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    gradInterest.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradInterest.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

    ctx.beginPath();
    ctx.moveTo(pointsNominal[0].x, pointsNominal[0].y);
    for (let i = 1; i < pointsNominal.length; i++) {
      ctx.lineTo(pointsNominal[i].x, pointsNominal[i].y);
    }
    ctx.lineTo(pointsNominal[pointsNominal.length - 1].x, padTop + plotH);
    ctx.lineTo(pointsNominal[0].x, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = gradInterest;
    ctx.fill();

    // 2. Area Sottostante Capitale Versato (Gradiente Blu)
    const gradContrib = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    gradContrib.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
    gradContrib.addColorStop(1, 'rgba(59, 130, 246, 0.08)');

    ctx.beginPath();
    ctx.moveTo(pointsContributed[0].x, pointsContributed[0].y);
    for (let i = 1; i < pointsContributed.length; i++) {
      ctx.lineTo(pointsContributed[i].x, pointsContributed[i].y);
    }
    ctx.lineTo(pointsContributed[pointsContributed.length - 1].x, padTop + plotH);
    ctx.lineTo(pointsContributed[0].x, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = gradContrib;
    ctx.fill();

    // Linea Capitale Versato
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pointsContributed[0].x, pointsContributed[0].y);
    for (let i = 1; i < pointsContributed.length; i++) {
      ctx.lineTo(pointsContributed[i].x, pointsContributed[i].y);
    }
    ctx.stroke();

    // Linea Capitale Totale (Interesse Composto)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pointsNominal[0].x, pointsNominal[0].y);
    for (let i = 1; i < pointsNominal.length; i++) {
      ctx.lineTo(pointsNominal[i].x, pointsNominal[i].y);
    }
    ctx.stroke();

    // Etichette Anni Asse X
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(breakdown.length / 5));
    for (let i = 0; i < breakdown.length; i += step) {
      const pt = pointsNominal[i];
      ctx.fillText('Anno ' + pt.year, pt.x, padTop + plotH + 20);
    }
  }

  /**
   * AGGIORNAMENTO UI E TABELLA
   */
  function updateUI() {
    // 1. Calcoli PAC
    const result = calculatePacGrowth(
      state.initialCapital,
      state.monthlyContribution,
      state.annualReturn,
      state.years,
      state.inflationRate
    );

    // Aggiornamento KPI
    if (dom.kpiFinalTotal) dom.kpiFinalTotal.textContent = formatCurrency(result.finalBalance);
    if (dom.kpiTotalContributed) dom.kpiTotalContributed.textContent = formatCurrency(result.totalContributed);
    if (dom.kpiInterestEarned) dom.kpiInterestEarned.textContent = formatCurrency(result.totalInterest);
    if (dom.kpiRealValue) dom.kpiRealValue.textContent = formatCurrency(result.realBalance);

    // Aggiornamento Breakdown Bar
    const total = result.finalBalance || 1;
    const pctPrincipalVal = Math.round((result.totalContributed / total) * 100);
    const pctInterestVal = 100 - pctPrincipalVal;

    if (dom.barPrincipal) dom.barPrincipal.style.width = pctPrincipalVal + '%';
    if (dom.barInterest) dom.barInterest.style.width = pctInterestVal + '%';
    if (dom.pctPrincipal) dom.pctPrincipal.textContent = `${pctPrincipalVal}% (${formatCurrency(result.totalContributed)})`;
    if (dom.pctInterest) dom.pctInterest.textContent = `${pctInterestVal}% (${formatCurrency(result.totalInterest)})`;

    // Render Canvas Grafico
    renderChart(result.breakdown);

    // Popola Tabella Ammortamento
    if (dom.amortTableBody) {
      dom.amortTableBody.innerHTML = '';
      result.breakdown.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>Anno ${row.year}</strong></td>
          <td>${formatCurrency(row.totalContributed)}</td>
          <td style="color: var(--accent-emerald); font-weight: 600;">+${formatCurrency(row.interestEarned)}</td>
          <td><strong>${formatCurrency(row.nominalBalance)}</strong></td>
          <td style="color: var(--text-muted);">${formatCurrency(row.realBalance)}</td>
        `;
        dom.amortTableBody.appendChild(tr);
      });
    }

    // 2. Calcoli FIRE
    const fireMetrics = calculateFireMetrics(
      state.monthlyExpenses,
      state.safeWithdrawalRate,
      state.initialCapital,
      state.monthlyContribution,
      state.annualReturn
    );

    if (dom.fireNumberKpi) dom.fireNumberKpi.textContent = formatCurrency(fireMetrics.fireNumber);
    if (dom.fireYearsKpi) dom.fireYearsKpi.textContent = `${fireMetrics.yearsToFire} Anni`;
    if (dom.fireMonthlyPassiveKpi) dom.fireMonthlyPassiveKpi.textContent = `${formatCurrency(fireMetrics.monthlyPassiveCashflow)}/mese`;
  }

  /**
   * INIZIALIZZAZIONE SEZIONE AFFILIAZIONI DINAMICA
   * Legge config.js e crea i box broker ad alto tasso di conversione
   */
  function initAffiliates() {
    if (!dom.affiliatesGrid || !window.APP_CONFIG) return;
    const config = window.APP_CONFIG.affiliates;
    if (!config || !config.enabled) return;

    dom.affiliatesGrid.innerHTML = '';

    config.partners.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'affiliate-card';
      card.innerHTML = `
        ${p.badge ? `<span class="card-badge-top">${p.badge}</span>` : ''}
        <div class="affiliate-header">
          <div class="affiliate-name">${p.name}</div>
          <div class="affiliate-rating">${p.rating} &bull; ${p.category}</div>
        </div>
        <p class="affiliate-tagline">${p.tagline}</p>
        <div class="bonus-box">
          <span class="bonus-icon">🎁</span>
          <span class="bonus-text">${p.bonusText}</span>
        </div>
        <a href="${p.url}" target="_blank" rel="noopener sponsored" class="btn-affiliate-cta">
          ${p.ctaText} &rarr;
        </a>
      `;
      dom.affiliatesGrid.appendChild(card);
    });
  }

  /**
   * ESPORTAZIONE CSV DATI
   */
  function exportToCsv() {
    const result = calculatePacGrowth(
      state.initialCapital,
      state.monthlyContribution,
      state.annualReturn,
      state.years,
      state.inflationRate
    );

    let csvContent = 'Anno,Capitale Versato,Interessi Maturati,Totale Nominale,Valore Reale (Inflazionato)\n';
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
   * SINCRONIZZAZIONE INPUT & RANGE SLIDER
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
   * BIND EVENT LISTENERS
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

    if (dom.fireSwrInput) {
      dom.fireSwrInput.addEventListener('input', (e) => {
        state.safeWithdrawalRate = parseFloat(e.target.value) || 4.0;
        updateUI();
      });
    }

    // Presets
    dom.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const init = Number(chip.dataset.init);
        const monthly = Number(chip.dataset.monthly);
        const rate = parseFloat(chip.dataset.rate);
        const years = Number(chip.dataset.years);

        if (!isNaN(init)) {
          state.initialCapital = init;
          if (dom.initialCapitalInput) dom.initialCapitalInput.value = init;
          if (dom.initialCapitalRange) dom.initialCapitalRange.value = init;
        }
        if (!isNaN(monthly)) {
          state.monthlyContribution = monthly;
          if (dom.monthlyInput) dom.monthlyInput.value = monthly;
          if (dom.monthlyRange) dom.monthlyRange.value = monthly;
        }
        if (!isNaN(rate)) {
          state.annualReturn = rate;
          if (dom.returnInput) dom.returnInput.value = rate;
          if (dom.returnRange) dom.returnRange.value = rate;
        }
        if (!isNaN(years)) {
          state.years = years;
          if (dom.yearsInput) dom.yearsInput.value = years;
          if (dom.yearsRange) dom.yearsRange.value = years;
        }
        updateUI();
      });
    });

    // Export CSV & PDF
    if (dom.btnExportCsv) dom.btnExportCsv.addEventListener('click', exportToCsv);
    if (dom.btnPrintPdf) dom.btnPrintPdf.addEventListener('click', () => window.print());

    // Window Resize per Canvas Chart
    window.addEventListener('resize', () => {
      const result = calculatePacGrowth(
        state.initialCapital,
        state.monthlyContribution,
        state.annualReturn,
        state.years,
        state.inflationRate
      );
      renderChart(result.breakdown);
    });

    // Tabs toggle
    dom.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        state.activeTab = tab;

        if (tab === 'pac') {
          if (dom.sectionPac) dom.sectionPac.style.display = 'block';
          if (dom.sectionFire) dom.sectionFire.style.display = 'none';
        } else if (tab === 'fire') {
          if (dom.sectionPac) dom.sectionPac.style.display = 'none';
          if (dom.sectionFire) dom.sectionFire.style.display = 'block';
        }
      });
    });
  }

  // Avvio al caricamento del DOM
  document.addEventListener('DOMContentLoaded', () => {
    initAffiliates();
    bindEvents();
    updateUI();
  });

})();
