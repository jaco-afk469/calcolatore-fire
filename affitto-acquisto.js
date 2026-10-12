/**
 * CALCOLATORE AFFITTO VS ACQUISTO CASA - MOTORE DI CALCOLO CLIENT-SIDE
 * Modello Finanziario Indipendente (Net Worth Comparison):
 * - Confronta il patrimonio netto accumulato tra Acquisto Casa con Mutuo vs Affitto + PAC ETF
 * - Ammortamento francese del mutuo (rata fissa, quota capitale e interessi)
 * - Costi di transazione iniziali (notaio, agenzia, imposta di registro, perizia)
 * - Manutenzione ordinaria/straordinaria proprietario e rivalutazione immobile
 * - Costo opportunità: anticipo e costi iniziali investiti in ETF azionario globale
 * - Investimento mensile della differenza di cash flow (chi spende meno investe il surplus)
 * - Tassazione capital gain 26% sul disinvestimento del portafoglio ETF
 * - Calcolo automatico del punto di pareggio (Break-Even Year)
 */

(function () {
  'use strict';

  // Stato dell'applicazione
  const state = {
    propertyPrice: 200000,
    monthlyRent: 800,
    downPaymentPct: 20,
    mortgageYears: 25,
    mortgageRate: 3.0,
    yearsHorizon: 20,
    etfReturn: 7.0,
    propertyAppreciation: 1.5,
    purchaseCostsPct: 8.0,
    maintenancePct: 1.0,
    rentInflation: 1.5
  };

  // Cache elementi DOM
  const dom = {
    // Inputs e Sliders
    propertyPriceInput: document.getElementById('propertyPriceInput'),
    propertyPriceRange: document.getElementById('propertyPriceRange'),
    monthlyRentInput: document.getElementById('monthlyRentInput'),
    monthlyRentRange: document.getElementById('monthlyRentRange'),
    downPaymentInput: document.getElementById('downPaymentInput'),
    downPaymentRange: document.getElementById('downPaymentRange'),
    mortgageYearsInput: document.getElementById('mortgageYearsInput'),
    mortgageYearsRange: document.getElementById('mortgageYearsRange'),
    mortgageRateInput: document.getElementById('mortgageRateInput'),
    mortgageRateRange: document.getElementById('mortgageRateRange'),
    yearsHorizonInput: document.getElementById('yearsHorizonInput'),
    yearsHorizonRange: document.getElementById('yearsHorizonRange'),
    etfReturnInput: document.getElementById('etfReturnInput'),
    etfReturnRange: document.getElementById('etfReturnRange'),

    // Parametri Avanzati
    propertyApprInput: document.getElementById('propertyApprInput'),
    purchaseCostsInput: document.getElementById('purchaseCostsInput'),
    maintenanceInput: document.getElementById('maintenanceInput'),
    rentInflationInput: document.getElementById('rentInflationInput'),

    // Preset chips
    presetPriceBtns: document.querySelectorAll('.preset-price'),
    presetRentBtns: document.querySelectorAll('.preset-rent'),
    presetMortgageYearsBtns: document.querySelectorAll('.preset-mortgage-years'),

    // KPI Summary
    kpiHouseNetWorth: document.getElementById('kpiHouseNetWorth'),
    kpiRentNetWorth: document.getElementById('kpiRentNetWorth'),
    kpiMonthlyMortgage: document.getElementById('kpiMonthlyMortgage'),
    kpiInitialInvested: document.getElementById('kpiInitialInvested'),
    kpiBreakEven: document.getElementById('kpiBreakEven'),
    kpiHouseEquitySub: document.getElementById('kpiHouseEquitySub'),
    kpiRentSub: document.getElementById('kpiRentSub'),

    // Winner Card
    winnerCard: document.getElementById('winnerCard'),
    winnerIcon: document.getElementById('winnerIcon'),
    winnerTitle: document.getElementById('winnerTitle'),
    winnerDesc: document.getElementById('winnerDesc'),

    // Canvas Chart
    chartCanvas: document.getElementById('comparisonChart'),

    // Table Body
    tableBody: document.getElementById('comparisonTableBody')
  };

  // Formattazione valuta euro
  function formatEuro(val) {
    if (isNaN(val) || val === null) return '0 €';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  }

  // Calcolo Rata Mutuo (Ammortamento Francese)
  function calculateMonthlyMortgage(loanAmount, annualRatePct, years) {
    if (loanAmount <= 0) return 0;
    if (annualRatePct <= 0) return loanAmount / (years * 12);

    const r = (annualRatePct / 100) / 12;
    const n = years * 12;
    return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  // Calcolo Debito Residuo dopo m mesi
  function calculateRemainingLoan(loanAmount, annualRatePct, totalYears, monthsElapsed) {
    if (loanAmount <= 0) return 0;
    const totalMonths = totalYears * 12;
    if (monthsElapsed >= totalMonths) return 0;

    const r = (annualRatePct / 100) / 12;
    if (r <= 0) {
      return Math.max(0, loanAmount - (loanAmount / totalMonths) * monthsElapsed);
    }

    const n = totalMonths;
    const numerator = Math.pow(1 + r, n) - Math.pow(1 + r, monthsElapsed);
    const denominator = Math.pow(1 + r, n) - 1;
    return Math.max(0, loanAmount * (numerator / denominator));
  }

  // Motore di Simulazione Principale
  function runSimulation() {
    const p = state.propertyPrice;
    const rent0 = state.monthlyRent;
    const downPayment = p * (state.downPaymentPct / 100);
    const purchaseCosts = p * (state.purchaseCostsPct / 100);
    const loanAmount = Math.max(0, p - downPayment);
    const monthlyMortgage = calculateMonthlyMortgage(loanAmount, state.mortgageRate, state.mortgageYears);

    // Capitale iniziale investito subito da chi sceglie l'affitto
    const initialEtfPortfolio = downPayment + purchaseCosts;

    // Rendimento mensile ETF
    const monthlyEtfRate = Math.pow(1 + state.etfReturn / 100, 1 / 12) - 1;

    // Tracker per la simulazione mese per mese fino a 35 anni (420 mesi)
    const maxMonths = 35 * 12;

    let etfPortfolio = initialEtfPortfolio;
    let etfInvestedCapital = initialEtfPortfolio;

    // Surplus investito dal proprietario (se in certi mesi l'affitto supera la spesa casa)
    let ownerSurplusPortfolio = 0;
    let ownerSurplusInvested = 0;

    const yearlyData = [];
    let breakEvenYear = null;

    // Simulazione mese per mese
    for (let m = 1; m <= maxMonths; m++) {
      const currentYear = Math.floor((m - 1) / 12) + 1;

      // Affitto di questo mese (aggiornato annualmente con inflazione)
      const currentRent = rent0 * Math.pow(1 + state.rentInflation / 100, (m - 1) / 12);

      // Costo mensile proprietario
      const isMortgageActive = m <= (state.mortgageYears * 12);
      const currentMortgagePayment = isMortgageActive ? monthlyMortgage : 0;

      // Manutenzione mensile rivalutata col valore immobile
      const houseApprFactor = Math.pow(1 + state.propertyAppreciation / 100, (m - 1) / 12);
      const currentHouseVal = p * houseApprFactor;
      const currentMaintenance = (currentHouseVal * (state.maintenancePct / 100)) / 12;

      const currentOwnerExpense = currentMortgagePayment + currentMaintenance;

      // Differenza di cash flow
      const diff = currentOwnerExpense - currentRent;

      // Rendimento ETF sul portafoglio esistente
      etfPortfolio *= (1 + monthlyEtfRate);
      ownerSurplusPortfolio *= (1 + monthlyEtfRate);

      if (diff > 0) {
        // L'inquilino spende meno del proprietario -> investe la differenza nell'ETF
        etfPortfolio += diff;
        etfInvestedCapital += diff;
      } else if (diff < 0) {
        // Il proprietario spende meno dell'inquilino -> investe l'eccedenza nell'ETF
        const surplus = Math.abs(diff);
        ownerSurplusPortfolio += surplus;
        ownerSurplusInvested += surplus;
      }

      // Alla fine di ogni anno (m % 12 === 0), registriamo il patrimonio netto
      if (m % 12 === 0) {
        const y = m / 12;
        const endYearHouseValue = p * Math.pow(1 + state.propertyAppreciation / 100, y);
        const remainingLoan = calculateRemainingLoan(loanAmount, state.mortgageRate, state.mortgageYears, m);

        // Calcolo Net Worth Casa
        const ownerGain = Math.max(0, ownerSurplusPortfolio - ownerSurplusInvested);
        const ownerSurplusNet = ownerSurplusInvested + (ownerGain * (1 - 0.26));
        const houseNetWorth = Math.max(0, endYearHouseValue - remainingLoan) + ownerSurplusNet;

        // Calcolo Net Worth Affitto (al netto del 26% sulle plusvalenze ETF)
        const etfGain = Math.max(0, etfPortfolio - etfInvestedCapital);
        const rentNetWorth = etfInvestedCapital + (etfGain * (1 - 0.26));

        yearlyData.push({
          year: y,
          houseValue: endYearHouseValue,
          remainingLoan: remainingLoan,
          houseNetWorth: Math.round(houseNetWorth),
          rentNetWorth: Math.round(rentNetWorth),
          etfPortfolioGross: Math.round(etfPortfolio),
          etfInvestedCapital: Math.round(etfInvestedCapital)
        });

        // Verifichiamo il break even
        if (breakEvenYear === null && houseNetWorth > rentNetWorth) {
          breakEvenYear = y;
        }
      }
    }

    return {
      monthlyMortgage,
      initialEtfPortfolio,
      yearlyData,
      breakEvenYear,
      horizonData: yearlyData[state.yearsHorizon - 1]
    };
  }

  // Aggiornamento KPI e Testi
  function updateUI(sim) {
    const horizon = sim.horizonData;
    const houseNW = horizon.houseNetWorth;
    const rentNW = horizon.rentNetWorth;
    const diff = Math.abs(houseNW - rentNW);

    // KPI
    dom.kpiHouseNetWorth.textContent = formatEuro(houseNW);
    dom.kpiRentNetWorth.textContent = formatEuro(rentNW);
    dom.kpiMonthlyMortgage.textContent = formatEuro(sim.monthlyMortgage) + '/m';
    dom.kpiInitialInvested.textContent = formatEuro(sim.initialEtfPortfolio);

    dom.kpiHouseEquitySub.textContent = `Valore immobile ${formatEuro(horizon.houseValue)} - debito ${formatEuro(horizon.remainingLoan)}`;
    dom.kpiRentSub.textContent = `Portafoglio ETF netto (imposta 26% detratta)`;

    // Break Even Text
    if (sim.breakEvenYear) {
      dom.kpiBreakEven.textContent = `Anno ${sim.breakEvenYear}`;
    } else {
      dom.kpiBreakEven.textContent = `Nessuno (< 35 anni)`;
    }

    // Winner Card
    if (rentNW > houseNW) {
      dom.winnerCard.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%)';
      dom.winnerCard.style.borderColor = 'var(--accent-emerald)';
      dom.winnerIcon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>';
      dom.winnerTitle.innerHTML = `Vince l'<strong>Affitto + Investimento PAC</strong> con <span style="color: var(--accent-emerald);">+${formatEuro(diff)}</span>`;
      dom.winnerDesc.innerHTML = `Dopo <strong>${state.yearsHorizon} anni</strong>, investire l'anticipo (${formatEuro(sim.initialEtfPortfolio)}) e il risparmio mensile in un PAC in ETF al ${state.etfReturn}% annuo supera l'acquisto della casa di <strong>${formatEuro(diff)}</strong> netti.`;
    } else if (houseNW > rentNW) {
      dom.winnerCard.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)';
      dom.winnerCard.style.borderColor = 'var(--accent-primary)';
      dom.winnerIcon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
      dom.winnerTitle.innerHTML = `Vince l'<strong>Acquisto Casa</strong> con <span style="color: var(--accent-primary);">+${formatEuro(diff)}</span>`;
      dom.winnerDesc.innerHTML = `Dopo <strong>${state.yearsHorizon} anni</strong>, l'immobile rivalutato (${formatEuro(horizon.houseValue)}) e l'estinzione progressiva del mutuo garantiscono un patrimonio superiore di <strong>${formatEuro(diff)}</strong> rispetto all'affitto.`;
    } else {
      dom.winnerCard.style.background = 'var(--bg-surface)';
      dom.winnerCard.style.borderColor = 'var(--border-medium)';
      dom.winnerIcon.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
      dom.winnerTitle.textContent = 'Perfetto Pareggio Finanziario';
      dom.winnerDesc.textContent = `Entrambe le strategie producono un patrimonio netto comparabile dopo ${state.yearsHorizon} anni.`;
    }

    // Disegna Grafico Canvas
    renderChart(sim.yearlyData, state.yearsHorizon);

    // Popola Tabella
    renderTable(sim.yearlyData);
  }

  // Rendering del Grafico Canvas Retina 2x
  function renderChart(yearlyData, currentHorizon) {
    const canvas = dom.chartCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Dimensioni fisiche
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height || 320;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 25, right: 35, bottom: 40, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    if (chartW <= 0 || chartH <= 0) return;

    // Trova massimo Y per la scala
    let maxY = 0;
    yearlyData.forEach(d => {
      if (d.houseNetWorth > maxY) maxY = d.houseNetWorth;
      if (d.rentNetWorth > maxY) maxY = d.rentNetWorth;
    });
    maxY = Math.ceil((maxY * 1.1) / 50000) * 50000;
    if (maxY <= 0) maxY = 100000;

    // Linee griglia orizzontali
    const steps = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Poppins, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= steps; i++) {
      const yVal = (maxY / steps) * i;
      const yPos = padding.top + chartH - (yVal / maxY) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + chartW, yPos);
      ctx.stroke();

      const label = yVal >= 1000000 ? (yVal / 1000000).toFixed(1) + 'M €' : Math.round(yVal / 1000) + 'k €';
      ctx.fillText(label, padding.left - 8, yPos);
    }

    // Coordinata X per ciascun anno
    const count = yearlyData.length;
    function getX(index) {
      return padding.left + (index / (count - 1)) * chartW;
    }
    function getY(val) {
      return padding.top + chartH - (val / maxY) * chartH;
    }

    // Etichette asse X (ogni 5 anni)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < count; i++) {
      const year = yearlyData[i].year;
      if (year === 1 || year % 5 === 0 || year === 35) {
        const xPos = getX(i);
        ctx.fillText(year + 'a', xPos, padding.top + chartH + 10);
      }
    }

    // Curva 1: Acquisto Casa (Blu)
    ctx.beginPath();
    yearlyData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.houseNetWorth);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Curva 2: Affitto + PAC ETF (Smeraldo)
    ctx.beginPath();
    yearlyData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.rentNetWorth);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Linea verticale per l'orizzonte selezionato (anno corrente)
    const horizonIdx = Math.min(Math.max(0, currentHorizon - 1), count - 1);
    const horizonX = getX(horizonIdx);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(horizonX, padding.top);
    ctx.lineTo(horizonX, padding.top + chartH);
    ctx.stroke();
    ctx.restore();

    // Punti evidenziati all'orizzonte temporale
    const houseY = getY(yearlyData[horizonIdx].houseNetWorth);
    const rentY = getY(yearlyData[horizonIdx].rentNetWorth);

    // Punto Casa
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(horizonX, houseY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Punto Affitto
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(horizonX, rentY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Popolamento Tabella Scaglioni
  function renderTable(yearlyData) {
    const tbody = dom.tableBody;
    if (!tbody) return;

    const milestones = [1, 5, 10, 15, 20, 25, 30, 35];
    let html = '';

    milestones.forEach(year => {
      const d = yearlyData.find(item => item.year === year);
      if (!d) return;

      const diff = d.houseNetWorth - d.rentNetWorth;
      const isHouseLeading = diff > 0;
      const diffFormatted = (diff >= 0 ? '+' : '') + formatEuro(diff);
      const diffColor = isHouseLeading ? 'var(--accent-primary)' : 'var(--accent-emerald)';

      const isCurrent = (year === state.yearsHorizon);
      const rowClass = isCurrent ? 'style="background: rgba(59, 130, 246, 0.08); font-weight: 600;"' : '';

      html += `
        <tr ${rowClass}>
          <td style="text-align: left; font-weight: 600;">Anno ${d.year} ${isCurrent ? '📍' : ''}</td>
          <td style="text-align: right; color: var(--accent-primary); font-weight: 600;">${formatEuro(d.houseNetWorth)}</td>
          <td style="text-align: right; color: var(--accent-emerald); font-weight: 600;">${formatEuro(d.rentNetWorth)}</td>
          <td style="text-align: right; color: ${diffColor}; font-weight: 700;">${diffFormatted}</td>
          <td style="text-align: right; color: var(--text-muted); font-size: 0.85rem;">${formatEuro(d.remainingLoan)}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  // Sincronizzazione Input e Slider
  function syncInputRange(inputEl, rangeEl, stateKey, isFloat) {
    if (!inputEl || !rangeEl) return;

    inputEl.addEventListener('input', function () {
      let val = isFloat ? parseFloat(this.value) : parseInt(this.value, 10);
      if (isNaN(val)) return;
      rangeEl.value = val;
      state[stateKey] = val;
      recalculate();
    });

    rangeEl.addEventListener('input', function () {
      let val = isFloat ? parseFloat(this.value) : parseInt(this.value, 10);
      inputEl.value = val;
      state[stateKey] = val;
      recalculate();
    });
  }

  function recalculate() {
    const sim = runSimulation();
    updateUI(sim);
  }

  // Setup Event Listeners
  function initListeners() {
    // Sincronizzazioni base
    syncInputRange(dom.propertyPriceInput, dom.propertyPriceRange, 'propertyPrice', false);
    syncInputRange(dom.monthlyRentInput, dom.monthlyRentRange, 'monthlyRent', false);
    syncInputRange(dom.downPaymentInput, dom.downPaymentRange, 'downPaymentPct', false);
    syncInputRange(dom.mortgageYearsInput, dom.mortgageYearsRange, 'mortgageYears', false);
    syncInputRange(dom.mortgageRateInput, dom.mortgageRateRange, 'mortgageRate', true);
    syncInputRange(dom.yearsHorizonInput, dom.yearsHorizonRange, 'yearsHorizon', false);
    syncInputRange(dom.etfReturnInput, dom.etfReturnRange, 'etfReturn', true);

    // Parametri Avanzati
    if (dom.propertyApprInput) {
      dom.propertyApprInput.addEventListener('input', function () {
        const val = parseFloat(this.value);
        if (!isNaN(val)) { state.propertyAppreciation = val; recalculate(); }
      });
    }
    if (dom.purchaseCostsInput) {
      dom.purchaseCostsInput.addEventListener('input', function () {
        const val = parseFloat(this.value);
        if (!isNaN(val)) { state.purchaseCostsPct = val; recalculate(); }
      });
    }
    if (dom.maintenanceInput) {
      dom.maintenanceInput.addEventListener('input', function () {
        const val = parseFloat(this.value);
        if (!isNaN(val)) { state.maintenancePct = val; recalculate(); }
      });
    }
    if (dom.rentInflationInput) {
      dom.rentInflationInput.addEventListener('input', function () {
        const val = parseFloat(this.value);
        if (!isNaN(val)) { state.rentInflation = val; recalculate(); }
      });
    }

    // Preset Chips - Prezzo Casa
    dom.presetPriceBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        dom.presetPriceBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const val = parseInt(this.getAttribute('data-val'), 10);
        state.propertyPrice = val;
        dom.propertyPriceInput.value = val;
        dom.propertyPriceRange.value = val;
        recalculate();
      });
    });

    // Preset Chips - Affitto Mensile
    dom.presetRentBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        dom.presetRentBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const val = parseInt(this.getAttribute('data-val'), 10);
        state.monthlyRent = val;
        dom.monthlyRentInput.value = val;
        dom.monthlyRentRange.value = val;
        recalculate();
      });
    });

    // Preset Chips - Durata Mutuo
    dom.presetMortgageYearsBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        dom.presetMortgageYearsBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const val = parseInt(this.getAttribute('data-val'), 10);
        state.mortgageYears = val;
        dom.mortgageYearsInput.value = val;
        dom.mortgageYearsRange.value = val;
        recalculate();
      });
    });

    // Resize del canvas
    window.addEventListener('resize', () => {
      const sim = runSimulation();
      renderChart(sim.yearlyData, state.yearsHorizon);
    });
  }

  // Inizializzazione al caricamento
  document.addEventListener('DOMContentLoaded', () => {
    initListeners();
    recalculate();
  });

})();
