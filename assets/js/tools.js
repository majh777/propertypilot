/* ============================================================
   PropertyPilot Tools JS — tools.js
   Mortgage Calculator, Investment ROI, AI Property Analysis
   ============================================================ */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function val(id, fallback) {
    var el = $(id);
    return el ? (parseFloat(el.value) || fallback) : fallback;
  }
  function fmt(n) { return n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
  function fmtCurrency(n) { return '$' + fmt(n); }
  function fmtPercent(n) { return n.toFixed(2) + '%'; }

  /* ==========================
     Mortgage Calculator
     ========================== */
  window.calculateMortgage = function () {
    var principal = val('mortPrincipal', 300000);
    var rate = val('mortRate', 6.5);
    var years = val('mortTerm', 30);
    var taxes = val('mortTaxes', 3600);
    var insurance = val('mortInsurance', 1200);
    var pmi = val('mortPMI', 0);
    var downPayment = val('mortDown', 20);

    var loanAmount = principal * (1 - downPayment / 100);
    var monthlyRate = (rate / 100) / 12;
    var numPayments = years * 12;

    // Monthly P&I
    var monthlyPI;
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / numPayments;
    } else {
      monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    var monthlyTax = taxes / 12;
    var monthlyIns = insurance / 12;
    var monthlyPMI = (downPayment < 20) ? (pmi > 0 ? pmi / 12 : loanAmount * 0.005 / 12) : 0;

    var totalMonthly = monthlyPI + monthlyTax + monthlyIns + monthlyPMI;
    var totalInterest = (monthlyPI * numPayments) - loanAmount;
    var totalCost = monthlyPI * numPayments + taxes * years + insurance * years + monthlyPMI * numPayments;

    // Update display
    setResult('mortResultMonthly', fmtCurrency(totalMonthly));
    setResult('mortResultPI', fmtCurrency(monthlyPI));
    setResult('mortResultTax', fmtCurrency(monthlyTax));
    setResult('mortResultIns', fmtCurrency(monthlyIns));
    setResult('mortResultPMI', fmtCurrency(monthlyPMI));
    setResult('mortResultLoan', fmtCurrency(loanAmount));
    setResult('mortResultInterest', fmtCurrency(totalInterest));
    setResult('mortResultTotal', fmtCurrency(totalCost));

    // Amortization schedule (first 12 months + summary years)
    var scheduleEl = $('mortSchedule');
    if (scheduleEl) {
      var balance = loanAmount;
      var html = '<table style="width:100%;border-collapse:collapse;font-size:.85em;margin-top:16px">' +
        '<thead><tr style="border-bottom:2px solid var(--border-color)">' +
        '<th style="text-align:left;padding:8px">Year</th>' +
        '<th style="text-align:right;padding:8px">Payment</th>' +
        '<th style="text-align:right;padding:8px">Principal</th>' +
        '<th style="text-align:right;padding:8px">Interest</th>' +
        '<th style="text-align:right;padding:8px">Balance</th>' +
        '</tr></thead><tbody>';

      for (var y = 1; y <= Math.min(years, 30); y++) {
        var yearPrincipal = 0;
        var yearInterest = 0;
        for (var m = 0; m < 12; m++) {
          var intPayment = balance * monthlyRate;
          var prinPayment = monthlyPI - intPayment;
          yearPrincipal += prinPayment;
          yearInterest += intPayment;
          balance -= prinPayment;
          if (balance < 0) balance = 0;
        }
        html += '<tr style="border-bottom:1px solid var(--border-color)">' +
          '<td style="padding:8px">' + y + '</td>' +
          '<td style="text-align:right;padding:8px">' + fmtCurrency(monthlyPI * 12) + '</td>' +
          '<td style="text-align:right;padding:8px;color:var(--green)">' + fmtCurrency(yearPrincipal) + '</td>' +
          '<td style="text-align:right;padding:8px;color:var(--red,#ef4444)">' + fmtCurrency(yearInterest) + '</td>' +
          '<td style="text-align:right;padding:8px">' + fmtCurrency(Math.max(0, balance)) + '</td>' +
          '</tr>';
      }
      html += '</tbody></table>';
      scheduleEl.innerHTML = html;
    }

    showResults('mortResults');
  };

  /* ==========================
     Investment / ROI Calculator
     ========================== */
  window.calculateInvestmentROI = function () {
    var purchasePrice = val('roiPurchase', 300000);
    var downPct = val('roiDown', 25);
    var closingCosts = val('roiClosing', 8000);
    var monthlyRent = val('roiRent', 2500);
    var vacancyPct = val('roiVacancy', 5);
    var monthlyExpenses = val('roiExpenses', 800);
    var mortgagePayment = val('roiMortgage', 1200);
    var appreciation = val('roiAppreciation', 3);

    var downPayment = purchasePrice * (downPct / 100);
    var totalInvested = downPayment + closingCosts;

    // Annual income
    var grossRent = monthlyRent * 12;
    var vacancyLoss = grossRent * (vacancyPct / 100);
    var effectiveRent = grossRent - vacancyLoss;
    var annualExpenses = monthlyExpenses * 12;
    var noi = effectiveRent - annualExpenses;
    var annualMortgage = mortgagePayment * 12;
    var annualCashFlow = noi - annualMortgage;
    var monthlyCashFlow = annualCashFlow / 12;

    // Returns
    var capRate = (noi / purchasePrice) * 100;
    var cashOnCash = (annualCashFlow / totalInvested) * 100;
    var grossYield = (grossRent / purchasePrice) * 100;

    // 5-year projection
    var fiveYearValue = purchasePrice * Math.pow(1 + appreciation / 100, 5);
    var fiveYearEquityGain = fiveYearValue - purchasePrice;
    var fiveYearCashFlow = annualCashFlow * 5;
    var fiveYearTotal = fiveYearEquityGain + fiveYearCashFlow;

    setResult('roiResultCashFlow', fmtCurrency(annualCashFlow));
    setResult('roiResultMonthlyCF', fmtCurrency(monthlyCashFlow));
    setResult('roiResultCapRate', fmtPercent(capRate));
    setResult('roiResultCoC', fmtPercent(cashOnCash));
    setResult('roiResultNOI', fmtCurrency(noi));
    setResult('roiResultGrossYield', fmtPercent(grossYield));
    setResult('roiResult5yr', fmtCurrency(fiveYearTotal));
    setResult('roiResultEquity', fmtCurrency(fiveYearEquityGain));

    showResults('investResults');
  };

  /* ==========================
     AI Property Analysis
     ========================== */
  window.analyzeProperty = function () {
    var propType = ($('aiPropType') || {}).value || 'single-family';
    var propAddress = ($('aiAddress') || {}).value || 'Not specified';
    var propPrice = val('aiPrice', 350000);
    var propSqft = val('aiSqft', 1800);
    var propBed = val('aiBed', 3);
    var propBath = val('aiBath', 2);
    var propYear = val('aiYear', 1995);
    var propRent = val('aiRent', 2200);
    var propCondition = ($('aiCondition') || {}).value || 'good';

    var age = 2026 - propYear;
    var pricePerSqft = propPrice / propSqft;
    var grossYield = (propRent * 12 / propPrice) * 100;
    var estimatedExpenses = propRent * 0.4;
    var estimatedNOI = (propRent - estimatedExpenses) * 12;
    var estimatedCapRate = (estimatedNOI / propPrice) * 100;

    // Scoring factors
    var scores = {};

    // Price per sqft analysis
    var avgPriceSqft = propType === 'condo' ? 250 : propType === 'multi-family' ? 180 : 200;
    scores.value = pricePerSqft < avgPriceSqft * 0.9 ? 9 : pricePerSqft < avgPriceSqft * 1.1 ? 7 : pricePerSqft < avgPriceSqft * 1.3 ? 5 : 3;

    // Cap rate
    scores.cashflow = estimatedCapRate > 8 ? 9 : estimatedCapRate > 6 ? 7 : estimatedCapRate > 4 ? 5 : 3;

    // Condition
    var condMap = { 'excellent': 9, 'good': 7, 'fair': 5, 'needs-work': 3 };
    scores.condition = condMap[propCondition] || 5;

    // Age
    scores.age = age < 10 ? 9 : age < 20 ? 7 : age < 40 ? 5 : 3;

    // Overall
    var overall = Math.round((scores.value + scores.cashflow + scores.condition + scores.age) / 4 * 10) / 10;

    // Risk factors
    var risks = [];
    if (age > 30) risks.push('Property age may lead to higher maintenance costs. Budget for major system replacements (roof, HVAC, plumbing).');
    if (estimatedCapRate < 4) risks.push('Below-average cap rate suggests thin cash flow margins. Consider if appreciation potential justifies the price.');
    if (propCondition === 'needs-work') risks.push('Property needs work - factor in renovation costs. Get detailed inspection and contractor estimates before purchasing.');
    if (pricePerSqft > avgPriceSqft * 1.3) risks.push('Price per square foot is above market average. Verify comparable sales support this valuation.');
    if (risks.length === 0) risks.push('No major red flags identified based on provided data. Standard due diligence recommended.');

    // Opportunities
    var opps = [];
    if (grossYield > 8) opps.push('Strong gross rental yield indicates good income potential relative to purchase price.');
    if (pricePerSqft < avgPriceSqft * 0.85) opps.push('Below-market price per sqft suggests potential value-add opportunity or undervalued asset.');
    if (propCondition === 'needs-work') opps.push('Renovation potential could significantly increase property value through forced appreciation.');
    if (propType === 'multi-family') opps.push('Multi-family properties offer diversified rental income and economies of scale in management.');
    if (propBed >= 3) opps.push('3+ bedroom layout appeals to family renters who tend to have longer lease terms.');
    if (opps.length === 0) opps.push('Solid fundamentals. Consider long-term hold strategy for appreciation and steady cash flow.');

    // Generate analysis report
    var ratingLabel = overall >= 8 ? 'Excellent' : overall >= 6 ? 'Good' : overall >= 4 ? 'Fair' : 'Below Average';
    var ratingColor = overall >= 8 ? 'var(--green, #10b981)' : overall >= 6 ? 'var(--accent, #7c3aed)' : overall >= 4 ? 'var(--amber, #f59e0b)' : 'var(--red, #ef4444)';

    var reportEl = $('aiReport');
    if (!reportEl) return;

    reportEl.innerHTML =
      '<div style="text-align:center;margin-bottom:24px">' +
        '<div style="font-size:3em;font-weight:800;color:' + ratingColor + '">' + overall + '/10</div>' +
        '<div style="font-size:1.2em;color:' + ratingColor + ';font-weight:600">' + ratingLabel + ' Investment</div>' +
      '</div>' +

      '<div class="pp-grid-2" style="gap:16px;margin-bottom:24px">' +
        metricCard('Price/sqft', fmtCurrency(pricePerSqft), scores.value) +
        metricCard('Est. Cap Rate', fmtPercent(estimatedCapRate), scores.cashflow) +
        metricCard('Condition', capitalize(propCondition), scores.condition) +
        metricCard('Property Age', age + ' years', scores.age) +
      '</div>' +

      '<div style="margin-bottom:24px">' +
        '<h4 style="color:var(--text-heading);margin-bottom:12px">Key Metrics</h4>' +
        '<div class="pp-grid-2" style="gap:12px">' +
          statLine('Purchase Price', fmtCurrency(propPrice)) +
          statLine('Gross Rental Yield', fmtPercent(grossYield)) +
          statLine('Est. Monthly NOI', fmtCurrency(estimatedNOI / 12)) +
          statLine('Est. Annual NOI', fmtCurrency(estimatedNOI)) +
          statLine('Price per Sqft', fmtCurrency(pricePerSqft)) +
          statLine('Monthly Rent', fmtCurrency(propRent)) +
        '</div>' +
      '</div>' +

      '<div style="margin-bottom:24px">' +
        '<h4 style="color:var(--red, #ef4444);margin-bottom:12px">Risk Factors</h4>' +
        listItems(risks, 'var(--red, #ef4444)') +
      '</div>' +

      '<div style="margin-bottom:24px">' +
        '<h4 style="color:var(--green, #10b981);margin-bottom:12px">Opportunities</h4>' +
        listItems(opps, 'var(--green, #10b981)') +
      '</div>' +

      '<div style="padding:16px;background:var(--bg-primary, #0f0f1a);border-radius:var(--radius-sm, 8px);font-size:.85em;color:var(--text-muted, #888)">' +
        'This analysis is generated using algorithms based on the data you provided. It is for informational purposes only and should not be considered financial advice. Always conduct thorough due diligence and consult with qualified professionals before making investment decisions.' +
      '</div>';

    showResults('aiResults');
  };

  function metricCard(label, value, score) {
    var color = score >= 7 ? 'var(--green, #10b981)' : score >= 5 ? 'var(--amber, #f59e0b)' : 'var(--red, #ef4444)';
    return '<div style="background:var(--bg-primary, #0f0f1a);padding:16px;border-radius:var(--radius-sm, 8px);text-align:center">' +
      '<div style="font-size:.8em;color:var(--text-muted, #888)">' + label + '</div>' +
      '<div style="font-size:1.3em;font-weight:700;color:var(--text-heading, #fff);margin:4px 0">' + value + '</div>' +
      '<div style="font-size:.75em;color:' + color + ';font-weight:600">Score: ' + score + '/10</div>' +
    '</div>';
  }

  function statLine(label, value) {
    return '<div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--bg-primary, #0f0f1a);border-radius:4px">' +
      '<span style="color:var(--text-secondary, #a0a0b0);font-size:.9em">' + label + '</span>' +
      '<span style="font-weight:600;color:var(--text-heading, #fff)">' + value + '</span>' +
    '</div>';
  }

  function listItems(items, color) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '<div style="padding:10px 14px;background:var(--bg-primary, #0f0f1a);border-left:3px solid ' + color + ';border-radius:4px;margin-bottom:8px;font-size:.9em;color:var(--text-secondary, #a0a0b0)">' + items[i] + '</div>';
    }
    return html;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }

  /* ---------- Helpers ---------- */
  function setResult(id, value) {
    var el = $(id);
    if (el) el.textContent = value;
  }

  function showResults(containerId) {
    var el = $(containerId);
    if (el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  }

})();
