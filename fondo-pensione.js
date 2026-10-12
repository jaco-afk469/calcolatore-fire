/**
 * CALCOLATORE FONDO PENSIONE VS PAC ETF - MOTORE DI CALCOLO CLIENT-SIDE
 * Modello Fiscale Italiano 2026:
 * - Scaglioni IRPEF e Addizionali (23%, 35%, 43% + addizionali regionali/comunali)
 * - Deduzione fiscale fino a 5.164,15 € (art. 10 TUIR)
 * - Toggle avanzato per reinvestimento del credito d'imposta 730 in ETF
 * - Tassazione finale agevolata della previdenza complementare (dal 15% al 9%)
 * - Tassazione capital gain ETF differita (26%)
 * - Confronto TER / costi annui di gestione
 */

(function () {
  'use strict';

  // Stato del calcolatore
  const state = {
    ral: 35000,
    annualContribution: 5164.15,
    years: 25,
    annualReturn: 6.5, // % lordo
    terPension: 1.4,   // % TER Fondo Pensione
    terEtf: 0.2,       // % TER ETF
    reinvestRefund: true
  };

  // Riferimenti DOM
  const dom = {
    ralInput: document.getElementById('ralInput'),
    ralRange: document.getElementById('ralRange'),
    contribInput: document.getElementById('contribInput'),
    contribRange: document.getElementById('contribRange'),
    yearsInput: document.getElementById('yearsInput'),
    yearsRange: document.getElementById('yearsRange'),
    returnInput: document.getElementById('returnInput'),
    returnRange: document.getElementById('returnRange'),
    terPensionInput: document.getElementById('terPensionInput'),
    terPensionRange: document.getElementById('terPensionRange'),
    terEtfInput: document.getElementById('terEtfInput'),
    terEtfRange: document.getElementById('terEtfRange'),
    toggleReinvest: document.getElementById('toggleReinvest'),

    // KPI
    kpiAnnualRefund: document.getElementById('kpiAnnualRefund'),
    kpiTotalRefund: document.getElementById('kpiTotalRefund'),
    kpiPensionNet: document.getElementById('kpiPensionNet'),
    kpiEtfNet: document.getElementById('kpiEtfNet'),
    kpiPensionTaxRate: document.getElementById('kpiPensionTaxRate'),
    kpiMarginalRate: document.getElementById('kpiMarginalRate'),
    kpiPensionSub: document.getElementById('kpiPensionSub'),
    kpiEtfSub: document.getElementById('kpiEtfSub'),

    // Winner Card
    winnerCard: document.getElementById('winnerCard'),
    winnerIcon: document.getElementById('winnerIcon'),
    winnerTitle: document.getElementById('winnerTitle'),
    winnerDesc: document.getElementById('winnerDesc'),

    // Canvas
    chartCanvas: document.getElementById('pensionChart'),

    // Table
    tableBody: document.getElementById('pensionTableBody')
  };

  // Calcolo IRPEF con scaglioni 2025/2026 (comprensivi di addizionali medie ~2%)
  function calculateIrpef(taxableIncome) {
    if (taxableIncome <= 0) return 0;
    let tax = 0;

    // Scaglione 1: fino a 28.000 € (23% + 2% = 25%)
    const bracket1 = Math.min(taxableIncome, 28000);
    tax += bracket1 * 0.25;

    // Scaglione 2: da 28.000 € a 50.000 € (35% + 2% = 37%)
    if (taxableIncome > 28000) {
      const bracket2 = Math.min(taxableIncome - 28000, 22000);
      tax += bracket2 * 0.37;
    }

    // Scaglione 3: oltre 50.000 € (43% + 2% = 45%)
    if (taxableIncome > 50000) {
      const bracket3 = taxableIncome - 50000;
      tax += bracket3 * 0.45;
    }

    return tax;
  }

  // Risparmio fiscale annuo generato dalla deduzione
  function getAnnualTaxRefund(ral, contribution) {
    const deductible = Math.min(contribution, 5164.15);
    const taxBefore = calculateIrpef(ral);
    const taxAfter = calculateIrpef(Math.max(0, ral - deductible));
    return Math.max(0, taxBefore - taxAfter);
  }

  // Aliquota marginale effettiva per visualizzazione
  function getMarginalTaxRate(ral) {
    if (ral > 50000) return 45;
    if (ral > 28000) return 37;
    return 25;
  }

  // Aliquota finale agevolata alla prestazione pensionistica (dal 15% al 9%)
  function getFinalPensionTaxRate(years) {
    if (years <= 15) return 15.0;
    const extraYears = years - 15;
    const reduction = extraYears * 0.30;
    return Math.max(9.0, +(15.0 - reduction).toFixed(2));
  }

  // Simulazione Anno per Anno
  function simulate() {
    const ral = state.ral;
    const contrib = state.annualContribution;
    const years = state.years;
    const grossReturn = state.annualReturn / 100;
    const terP = state.terPension / 100;
    const terE = state.terEtf / 100;
    const reinvest = state.reinvestRefund;

    const annualRefund = getAnnualTaxRefund(ral, contrib);
    const finalPensionTaxRate = getFinalPensionTaxRate(years);

    // Rendimento netto Fondo Pensione:
    // (Gross - TER) tassato annualmente al 20% sui rendimenti maturi
    const pensionNetReturn = Math.max(0, (grossReturn - terP) * 0.80);

    // Rendimento lordo ETF (la tassazione 26% è differita alla vendita)
    const etfNetReturn = Math.max(0, grossReturn - terE);

    // Tracciamento annuale
    const trajectory = [];
    let fundBalance = 0;
    let satelliteEtfBalance = 0;
    let satelliteEtfPrincipal = 0;

    // Per la strategia solo ETF:
    // Se reinvest=true: versi l'intera cifra lorda (contrib)
    // Se reinvest=false: versi l'esborso netto reale (contrib - annualRefund)
    const pureEtfAnnualContrib = reinvest ? contrib : Math.max(0, contrib - annualRefund);
    let pureEtfBalance = 0;
    let pureEtfPrincipal = 0;

    for (let y = 1; y <= years; y++) {
      // 1. Fondo Pensione: rendimento + nuovo versamento
      fundBalance = (fundBalance * (1 + pensionNetReturn)) + contrib;

      // 2. Satellite ETF (dal rimborso 730, se attivo)
      if (reinvest && annualRefund > 0) {
        satelliteEtfBalance = (satelliteEtfBalance * (1 + etfNetReturn)) + annualRefund;
        satelliteEtfPrincipal += annualRefund;
      }

      // 3. Strategia Pure ETF
      pureEtfBalance = (pureEtfBalance * (1 + etfNetReturn)) + pureEtfAnnualContrib;
      pureEtfPrincipal += pureEtfAnnualContrib;

      // Calcolo netto anno corrente
      // Fondo Pensione: tassazione finale (15% -> 9%)
      const currentPensionNet = fundBalance * (1 - (finalPensionTaxRate / 100));

      // Satellite ETF netto (26% su plusvalenza)
      let currentSatelliteNet = 0;
      if (reinvest && satelliteEtfBalance > 0) {
        const satGain = Math.max(0, satelliteEtfBalance - satelliteEtfPrincipal);
        currentSatelliteNet = satelliteEtfBalance - (satGain * 0.26);
      }

      const totalPensionStrategyNet = currentPensionNet + currentSatelliteNet;

      // Pure ETF netto (26% su plusvalenza)
      const pureGain = Math.max(0, pureEtfBalance - pureEtfPrincipal);
      const pureEtfNet = pureEtfBalance - (pureGain * 0.26);

      trajectory.push({
        year: y,
        fundBalance,
        currentPensionNet,
        satelliteEtfBalance,
        currentSatelliteNet,
        totalPensionStrategyNet,
        pureEtfBalance,
        pureEtfNet,
        annualRefundTotal: annualRefund * y
      });
    }

    const last = trajectory[trajectory.length - 1];

    return {
      annualRefund,
      totalRefund: annualRefund * years,
      finalPensionTaxRate,
      marginalTaxRate: getMarginalTaxRate(ral),
      pensionStrategyNet: last.totalPensionStrategyNet,
      pureEtfNet: last.pureEtfNet,
      fundNetOnly: last.currentPensionNet,
      satelliteNetOnly: last.currentSatelliteNet,
      trajectory
    };
  }

  // Formattazione Valuta
  function fmtEur(val) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  }

  // Aggiornamento UI
  function updateUI() {
    const res = simulate();

    // 1. KPI Cards
    if (dom.kpiAnnualRefund) dom.kpiAnnualRefund.textContent = fmtEur(res.annualRefund);
    if (dom.kpiTotalRefund) dom.kpiTotalRefund.textContent = fmtEur(res.totalRefund);
    if (dom.kpiPensionNet) dom.kpiPensionNet.textContent = fmtEur(res.pensionStrategyNet);
    if (dom.kpiEtfNet) dom.kpiEtfNet.textContent = fmtEur(res.pureEtfNet);

    if (dom.kpiMarginalRate) dom.kpiMarginalRate.textContent = `${res.marginalTaxRate}%`;
    if (dom.kpiPensionTaxRate) dom.kpiPensionTaxRate.textContent = `${res.finalPensionTaxRate}%`;

    if (dom.kpiPensionSub) {
      dom.kpiPensionSub.textContent = state.reinvestRefund
        ? `Fondo (${fmtEur(res.fundNetOnly)}) + ETF da rimborso (${fmtEur(res.satelliteNetOnly)})`
        : `Montante Fondo al netto dell'imposta finale al ${res.finalPensionTaxRate}%`;
    }

    if (dom.kpiEtfSub) {
      dom.kpiEtfSub.textContent = state.reinvestRefund
        ? `Versando ${fmtEur(state.annualContribution)}/anno al netto capital gain 26%`
        : `Versando l'esborso netto reale (${fmtEur(Math.max(0, state.annualContribution - res.annualRefund))}/anno)`;
    }

    // 2. Winner Card
    const diff = res.pensionStrategyNet - res.pureEtfNet;
    const diffAbs = Math.abs(diff);

    if (dom.winnerCard) {
      if (diff > 500) {
        dom.winnerIcon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path></svg>';
        dom.winnerTitle.textContent = state.reinvestRefund
          ? `Vince la Strategia Fondo Pensione + Reinvestimento ETF (+${fmtEur(diffAbs)})`
          : `Vince il Fondo Pensione (+${fmtEur(diffAbs)})`;
        dom.winnerDesc.textContent = state.reinvestRefund
          ? `Grazie alla deduzione IRPEF di ${fmtEur(res.annualRefund)}/anno reinvestita in un PAC ETF, accumuli ${fmtEur(res.pensionStrategyNet)} netti, battendo il PAC puro di ${fmtEur(diffAbs)}.`
          : `La deduzione IRPEF e la tassazione agevolata al ${res.finalPensionTaxRate}% compensano il maggior costo di gestione (TER), garantendo un vantaggio netto di ${fmtEur(diffAbs)}.`;
        dom.winnerCard.style.borderColor = 'var(--accent-primary)';
      } else if (diff < -500) {
        dom.winnerIcon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>';
        dom.winnerTitle.textContent = `Vince il PAC in ETF Indipendente (+${fmtEur(diffAbs)})`;
        dom.winnerDesc.textContent = `Su un orizzonte di ${state.years} anni, il costo di gestione ridotto dell'ETF (${state.terEtf}% vs ${state.terPension}% del fondo) e la tassazione differita superano il vantaggio della deduzione fiscale iniziale.`;
        dom.winnerCard.style.borderColor = 'var(--accent-emerald)';
      } else {
        dom.winnerIcon.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        dom.winnerTitle.textContent = `Pareggio Sostanziale tra le due Strategie`;
        dom.winnerDesc.textContent = `Il capitale finale netto si equivale. Scegli il fondo pensione se cerchi disciplina fiscale e tutela dal pignoramento, oppure l'ETF per la massima flessibilità di liquidazione in qualsiasi momento.`;
        dom.winnerCard.style.borderColor = 'var(--border-medium)';
      }
    }

    // 3. Render Chart
    renderChart(res.trajectory);

    // 4. Render Table
    renderTable(res.trajectory);
  }

  // Rendering Grafico su Canvas (Retina 2x, responsive, no dipendenze)
  function renderChart(trajectory) {
    const canvas = dom.chartCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (!trajectory || trajectory.length === 0) return;

    // Rilevamento Dark Mode
    const isDark = (document.documentElement.getAttribute('data-theme') === 'dark') ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Padding per assi reattivo
    const isMobile = width < 420;
    const padLeft = isMobile ? 48 : 65;
    const padRight = isMobile ? 16 : 24;
    const padTop = 22;
    const padBottom = 34;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    if (plotW <= 0 || plotH <= 0) return;

    // Valore massimo per scala Y
    const maxVal = Math.max(
      ...trajectory.map(p => Math.max(p.totalPensionStrategyNet, p.pureEtfNet))
    ) * 1.1;

    // Griglia orizzontale
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 1;
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = isMobile ? '500 10px Poppins, sans-serif' : '500 11px Poppins, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxVal / yTicks) * i;
      const y = padTop + plotH - (val / maxVal) * plotH;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      const label = val >= 1000000
        ? `${(val / 1000000).toFixed(1)}M €`
        : val >= 1000
        ? `${Math.round(val / 1000)}k €`
        : `${Math.round(val)} €`;

      ctx.fillText(label, padLeft - 8, y);
    }

    // Funzione coordinate X e Y
    const getX = (idx) => padLeft + (idx / (trajectory.length - 1)) * plotW;
    const getY = (val) => padTop + plotH - (val / maxVal) * plotH;

    // Curva 1: Strategia Fondo Pensione (Blu Trust o Electric Blue in Dark)
    const colorPension = isDark ? '#4A90E2' : '#1E56A0';
    const colorEtf = '#10B981';

    ctx.strokeStyle = colorPension;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    trajectory.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.totalPensionStrategyNet);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Area sfumata Fondo Pensione
    const gradP = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    gradP.addColorStop(0, isDark ? 'rgba(74, 144, 226, 0.22)' : 'rgba(30, 86, 160, 0.18)');
    gradP.addColorStop(1, 'rgba(0, 0, 0, 0.00)');
    ctx.fillStyle = gradP;
    ctx.beginPath();
    ctx.moveTo(getX(0), padTop + plotH);
    trajectory.forEach((p, idx) => {
      ctx.lineTo(getX(idx), getY(p.totalPensionStrategyNet));
    });
    ctx.lineTo(getX(trajectory.length - 1), padTop + plotH);
    ctx.closePath();
    ctx.fill();

    // Curva 2: Strategia Solo ETF (Verde Emerald #10B981)
    ctx.strokeStyle = colorEtf;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    trajectory.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.pureEtfNet);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Etichette asse X (Anni) con algoritmo dinamico anti-sovrapposizione
    const totalYears = trajectory[trajectory.length - 1].year || trajectory.length;
    const minLabelGap = isMobile ? 54 : 75;
    const maxLabels = Math.max(2, Math.floor(plotW / minLabelGap));

    // Passo arrotondato standard: 1, 2, 5, 10, 15, 20
    let idealStep = Math.max(1, Math.ceil(totalYears / maxLabels));
    if (totalYears <= 5) {
      idealStep = idealStep <= 2 ? 1 : 2;
    } else if (idealStep <= 3) {
      idealStep = (totalYears <= 12) ? 2 : 5;
    } else if (idealStep <= 5) {
      idealStep = 5;
    } else if (idealStep <= 10) {
      idealStep = 10;
    } else if (idealStep <= 15) {
      idealStep = 15;
    } else {
      idealStep = 20;
    }

    const indicesToLabel = [];
    indicesToLabel.push(0);

    for (let y = idealStep; y < totalYears; y += idealStep) {
      const idx = trajectory.findIndex(p => p.year === y);
      if (idx !== -1 && !indicesToLabel.includes(idx)) {
        indicesToLabel.push(idx);
      }
    }

    const lastIdx = trajectory.length - 1;
    if (!indicesToLabel.includes(lastIdx)) {
      indicesToLabel.push(lastIdx);
    }

    // Se l'ultimo e il penultimo sono troppo vicini (< 75% del gap minimo), elimina il penultimo
    if (indicesToLabel.length >= 2) {
      const lastX = getX(indicesToLabel[indicesToLabel.length - 1]);
      const prevX = getX(indicesToLabel[indicesToLabel.length - 2]);
      if (lastX - prevX < minLabelGap * 0.75) {
        indicesToLabel.splice(indicesToLabel.length - 2, 1);
      }
    }

    // Se il primo (Anno 1) e il secondo sono troppo vicini, elimina il secondo
    if (indicesToLabel.length >= 3) {
      const firstX = getX(indicesToLabel[0]);
      const secondX = getX(indicesToLabel[1]);
      if (secondX - firstX < minLabelGap * 0.75) {
        indicesToLabel.splice(1, 1);
      }
    }

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = isMobile ? '500 10px Poppins, sans-serif' : '500 11px Poppins, sans-serif';
    ctx.textBaseline = 'top';

    indicesToLabel.forEach((idx) => {
      const p = trajectory[idx];
      if (!p) return;
      const x = getX(idx);

      if (idx === 0) {
        ctx.textAlign = 'left';
      } else if (idx === trajectory.length - 1) {
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'center';
      }

      const yr = p.year;
      const label = isMobile ? `${yr}a` : `Anno ${yr}`;
      ctx.fillText(label, x, padTop + plotH + 10);
    });
  }

  // Rendering Tabella Ammortamento
  function renderTable(trajectory) {
    const tbody = dom.tableBody;
    if (!tbody) return;

    tbody.innerHTML = '';
    const yearsToShow = [1, 5, 10, 15, 20, 25, 30, 35, 40].filter(y => y <= trajectory.length);
    if (!yearsToShow.includes(trajectory.length)) {
      yearsToShow.push(trajectory.length);
      yearsToShow.sort((a, b) => a - b);
    }

    yearsToShow.forEach(y => {
      const data = trajectory[y - 1];
      const diff = data.totalPensionStrategyNet - data.pureEtfNet;
      const diffClass = diff >= 0 ? 'color: var(--accent-primary);' : 'color: var(--accent-emerald);';
      const diffSign = diff >= 0 ? '+' : '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">Anno ${data.year}</td>
        <td>${fmtEur(data.annualRefundTotal)}</td>
        <td style="font-weight: 700;">${fmtEur(data.totalPensionStrategyNet)}</td>
        <td style="font-weight: 700;">${fmtEur(data.pureEtfNet)}</td>
        <td style="font-weight: 700; ${diffClass}">${diffSign}${fmtEur(diff)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Sincronizzazione Input e Slider
  function bindPair(input, range, stateKey, isFloat = false) {
    if (!input || !range) return;

    input.addEventListener('input', () => {
      const val = isFloat ? parseFloat(input.value) : parseInt(input.value, 10);
      if (!isNaN(val)) {
        state[stateKey] = val;
        range.value = val;
        updateUI();
      }
    });

    range.addEventListener('input', () => {
      const val = isFloat ? parseFloat(range.value) : parseInt(range.value, 10);
      state[stateKey] = val;
      input.value = val;
      updateUI();
    });
  }

  // Inizializzazione
  function init() {
    bindPair(dom.ralInput, dom.ralRange, 'ral');
    bindPair(dom.contribInput, dom.contribRange, 'annualContribution');
    bindPair(dom.yearsInput, dom.yearsRange, 'years');
    bindPair(dom.returnInput, dom.returnRange, 'annualReturn', true);
    bindPair(dom.terPensionInput, dom.terPensionRange, 'terPension', true);
    bindPair(dom.terEtfInput, dom.terEtfRange, 'terEtf', true);

    // Toggle reinvestimento
    if (dom.toggleReinvest) {
      dom.toggleReinvest.addEventListener('change', (e) => {
        state.reinvestRefund = e.target.checked;
        updateUI();
      });
    }

    // Preset buttons per versamento
    document.querySelectorAll('.preset-contrib').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseFloat(e.currentTarget.dataset.val);
        state.annualContribution = val;
        if (dom.contribInput) dom.contribInput.value = val;
        if (dom.contribRange) dom.contribRange.value = val;

        document.querySelectorAll('.preset-contrib').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        updateUI();
      });
    });

    // Resize listener per ridisegnare il grafico al resize della finestra
    window.addEventListener('resize', () => {
      const res = simulate();
      renderChart(res.trajectory);
    });

    // Theme change listener per ridisegnare il grafico al cambio dark/light mode
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const res = simulate();
        renderChart(res.trajectory);
      });
    }

    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
