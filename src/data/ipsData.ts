/**
 * John Simpson Odette Student Investment Fund (JSOSIF)
 * Investment Policy Statement (IPS) & Governance Terms of Reference
 * 
 * Formal policy approved by the OSB Dean and Board of Trustees.
 * Document Date: November 2016 | Formally Approved: June 9, 2017
 */

import { PortfolioHolding } from "./fallbackHoldings";

export interface AssetClassBand {
  name: string;
  key: "equity" | "fixedIncome" | "cash";
  min: number;
  target: number;
  max: number;
  description: string;
}

export interface InvestmentConstraint {
  id: string;
  category: string;
  name: string;
  rule: string;
  limit: string;
  status: "Strict" | "Flexible" | "Prohibited";
  details: string;
  exceptionNote?: string;
}

export interface ReturnGoal {
  title: string;
  target: string;
  description: string;
  formula?: string;
}

export interface ExpenditureGuideline {
  type: string;
  maxPercent: number;
  description: string;
}

export interface GovernanceEntity {
  role: string;
  termOrAppointment: string;
  compositionOrScope: string;
  responsibilities: string[];
}

export interface TradeWorkflowStep {
  step: number;
  actor: string;
  action: string;
  recipient: string;
  channel: string;
  description: string;
}

export const IPS_METADATA = {
  title: "The John Simpson Odette Student Investment Fund (JSOSIF)",
  subtitle: "Governance and Terms of Reference",
  shortTitle: "JSOSIF Investment Policy Statement (IPS)",
  governingBody: "Odette School of Business (OSB), University of Windsor",
  trustType: "Expendable Trust within the University of Windsor",
  initialInvestmentAmount: 125000,
  initialInvestmentFormatted: "$125,000 CAD (Fall 2016 Initial Principal)",
  documentDate: "November 2016",
  approvalDate: "June 9, 2017",
  reviewCadence: "Annual review of investment principles by the Board of Trustees",
  signatories: [
    {
      name: "John Mihalo",
      title: "Assistant Dean, Financial Administration",
      institution: "Odette School of Business at The University of Windsor",
    },
    {
      name: "Dr. Mitch Fields",
      title: "Acting Dean",
      institution: "Odette School of Business at The University of Windsor",
    },
  ],
};

export const IPS_OBJECTIVES = [
  {
    id: "student-experience",
    title: "Experiential Student Learning",
    summary:
      "Create a student experience focused on the fundamentals of investing, portfolio governance, and professional money management with the support of industry professionals, alumni, faculty, and OSB senior administration.",
  },
  {
    id: "growth-and-risk",
    title: "Capital Growth at Prudent Risk",
    summary:
      "Focus investment management on capital growth at a reasonable cost and tolerable risk as determined by the Board of Trustees.",
  },
  {
    id: "industry-expertise",
    title: "Integration of Professional Expertise",
    summary:
      "Draw on and integrate the expertise of money management professionals to support ongoing strategic and tactical initiatives of the Fund.",
  },
  {
    id: "sustainable-governance",
    title: "Sustainable Long-Term Governance",
    summary:
      "Build a sustainable long-term governance model to support the Fund with ethical, efficient, and prudent operational practices.",
  },
  {
    id: "donor-transparency",
    title: "Donor Transparency & Trust",
    summary:
      "Respect the wishes of donors with transparent reporting of performance through annual performance reports provided to donors.",
  },
  {
    id: "talent-recruitment",
    title: "Recruiting High-Calibre Finance Talent",
    summary:
      "Create an exciting, competitive environment to recruit and retain high quality finance students and faculty mentors.",
  },
];

export const IPS_RETURN_TARGETS: ReturnGoal[] = [
  {
    title: "Real Growth Target",
    target: "3.0% per annum",
    description: "Net growth of principal after deducting all operational and management fees.",
  },
  {
    title: "Inflation Allowance",
    target: "2.0% per annum (Estimate)",
    description: "Expected long-term Canadian consumer price inflation rate.",
  },
  {
    title: "Nominal Target Net Return",
    target: "5.0% per annum",
    description:
      "Total nominal portfolio return net of all costs, fees, and expenditures (3.0% real growth + 2.0% inflation).",
    formula: "3.0% Real Growth + 2.0% Inflation = 5.0% Nominal Target",
  },
];

export const IPS_EXPENDITURES: ExpenditureGuideline[] = [
  {
    type: "Operating Costs",
    maxPercent: 0.5,
    description: "Maximum 0.5% of Fund assets annually for general operating expenditures.",
  },
  {
    type: "Investment Management & Audit",
    maxPercent: 1.0,
    description:
      "Maximum 1.0% of Fund assets annually for brokerage fees, custody, audit costs, and investment-related fees.",
  },
  {
    type: "Total Allowable Annual Fees",
    maxPercent: 1.5,
    description:
      "Combined maximum expenditure cap of 1.5% of fund assets annually, approved annually in the Budget by Trustees.",
  },
];

export const IPS_ASSET_ALLOCATION: AssetClassBand[] = [
  {
    name: "Equities",
    key: "equity",
    min: 56,
    target: 63,
    max: 70,
    description:
      "Expected to generate the majority of growth in the portfolio. Invested across Canadian and U.S. exchange-listed common and preferred shares and ETFs.",
  },
  {
    name: "Fixed Income",
    key: "fixedIncome",
    min: 30,
    target: 37,
    max: 44,
    description:
      "Expected to protect the portfolio in times of market stress and provide steady income. Comprises investment-grade Canadian & U.S. bonds (A rating or higher), ETFs, and GICs.",
  },
  {
    name: "Cash & Equivalents",
    key: "cash",
    min: 0,
    target: 0,
    max: 10,
    description:
      "Held strictly for operational liquidity and trade settlement. Expected to yield lowest long-term returns in a growth fund; maximum limit is 10%.",
  },
];

export const IPS_CONSTRAINTS: InvestmentConstraint[] = [
  {
    id: "c-market-cap",
    category: "Company Size (Market Cap)",
    name: "Minimum Market Capitalization",
    rule: ">= $300 Million CAD for Canadian stocks | >= $500 Million USD for U.S. stocks",
    limit: "CAD >= $300M | USD >= $500M",
    status: "Flexible",
    details:
      "Ensures adequate liquidity, proven track record, and institutional stability. High quality large- and mid-cap companies.",
    exceptionNote:
      "Flexibility is allowed for the Fund Manager to recommend investments below these thresholds if a compelling, documented case is made.",
  },
  {
    id: "c-exchanges",
    category: "Eligible Exchanges",
    name: "Recognized North American Exchanges",
    rule: "Securities must be listed on Canadian or U.S. Exchanges",
    limit: "Canada & U.S. Exchanges",
    status: "Strict",
    details:
      "Permitted markets include TSX, TSXV, NYSE, NASDAQ, and CBOE. Unlisted foreign stocks or unregulated over-the-counter (OTC) listings are prohibited.",
  },
  {
    id: "c-stock-weight",
    category: "Concentration Limit",
    name: "Maximum Single Stock Weight",
    rule: "Maximum 10% of total portfolio market value",
    limit: "<= 10.0% of Market Value",
    status: "Strict",
    details:
      "No individual company or single holding may exceed 10% of total fund value, preventing idiosyncratic company concentration risk.",
  },
  {
    id: "c-industry-weight",
    category: "Concentration Limit",
    name: "Maximum Industry / Sector Weight",
    rule: "Maximum 25% of total portfolio market value",
    limit: "<= 25.0% of Market Value",
    status: "Strict",
    details:
      "No single industry or sector allocation may exceed 25% of the total fund portfolio market value.",
  },
  {
    id: "c-shorting",
    category: "Trading Strategies",
    name: "Short Sales",
    rule: "Securities will NOT be traded by way of shorting",
    limit: "PROHIBITED (0%)",
    status: "Prohibited",
    details: "Short positions, borrowing shares, and naked shorting are strictly disallowed.",
  },
  {
    id: "c-leverage",
    category: "Trading Strategies",
    name: "Margin & Financial Leverage",
    rule: "Trading on margin or using leverage is strictly prohibited",
    limit: "PROHIBITED (0%)",
    status: "Prohibited",
    details: "The fund operates as 100% unleveraged long-only equity and fixed income holdings.",
  },
  {
    id: "c-derivatives",
    category: "Financial Instruments",
    name: "Derivatives Usage",
    rule: "Derivatives may not be used for any purpose, including currency hedging",
    limit: "PROHIBITED (0%)",
    status: "Prohibited",
    details:
      "Options, futures, swaps, forwards, or synthetic derivative products may not be purchased or written under any circumstances.",
  },
  {
    id: "c-alternatives",
    category: "Asset Classes",
    name: "Alternative Asset Classes",
    rule: "Alternative asset classes are not allowed",
    limit: "PROHIBITED (0%)",
    status: "Prohibited",
    details:
      "Direct real estate, infrastructure assets, commodities, crypto-assets, and hedge funds are excluded from eligible portfolio investments.",
  },
];

export const IPS_PERMITTED_INVESTMENTS = {
  cash: {
    category: "Cash and Short Term Investments",
    description:
      "Held strictly for operational and liquidity purposes. Initial target asset class mix excludes cash, but operational requirements allow holding temporary cash.",
    eligibleItems: [
      "Cash and cash equivalents placed in financial institutions covered by a depositor insurance plan (e.g. CDIC).",
      "Canadian and U.S. short-term investments with a term of less than one year to maturity.",
      "All short-term debt instruments must be rated at least R-1 (low) or equivalent by a recognized rating agency.",
    ],
  },
  fixedIncome: {
    category: "Fixed Income Securities",
    description:
      "For the first year of the Fund, fixed income was limited to ETFs on Canadian exchanges. In subsequent years, permitted fixed income includes high-grade bonds and term deposits.",
    eligibleItems: [
      "Canadian bonds, debentures, notes or other debt instruments of governments (federal, provincial, municipal) and corporations rated at a minimum Investment Grade of A quality.",
      "U.S. bonds, debentures, notes or other debt instruments of governments (federal, state, municipal) and corporations rated at a minimum Investment Grade of A quality.",
      "Guaranteed Investment Certificates (GICs) and term deposits of banks, trust companies, insurance companies, or credit unions.",
      "Fixed Income Exchange Traded Funds (ETFs) on Canadian and U.S. exchanges.",
    ],
  },
  equities: {
    category: "Equity Securities",
    description:
      "Subject to investment constraints (market cap, exchange, max 10% single stock, max 25% sector).",
    eligibleItems: [
      "Common shares of high-quality Canadian and U.S. corporations.",
      "Preferred shares of high-quality Canadian and U.S. corporations.",
      "Exchange Traded Funds (ETFs) covering broad Canadian and U.S. equity markets.",
    ],
  },
  currencyAndEsg: {
    category: "Currency Risk & ESG Principles",
    description: "Guidelines regarding foreign exchange exposure and ethical governance.",
    eligibleItems: [
      "Currency Risk: U.S. dollar denominated assets carry FX risk. The Fund may NOT actively mitigate currency risk through derivatives.",
      "ESG & Ethics: Portfolio recommendations that contradict University of Windsor ethics and sustainability values will not be considered.",
      "Rebalancing: Periodic rebalancing is required to maintain equity and fixed income within specified target ranges.",
    ],
  },
};

export const IPS_GOVERNANCE = {
  boardOfTrustees: {
    totalSeats: 7,
    termLimit: "No more than three (3) years",
    appointingAuthority: "Odette School of Business Dean",
    composition: [
      { seat: "Dean of OSB", requirement: "Dean of the Odette School of Business (ex-officio)" },
      { seat: "Legal Background", requirement: "One Trustee with a legal background" },
      {
        seat: "Accounting / Finance",
        requirement: "One Trustee with a professional accounting or finance background",
      },
      {
        seat: "University Administration",
        requirement: "One Trustee with a University administrative background",
      },
      { seat: "Faculty Supervisor", requirement: "Faculty Supervisor for the Fund" },
      {
        seat: "External Member 1",
        requirement: "Chosen from sources external to OSB faculty, staff, or students",
      },
      {
        seat: "External Member 2",
        requirement: "Chosen from sources external to OSB faculty, staff, or students",
      },
    ],
    meetings: "Minimum of four (4) times annually, chaired by a Trustee elected annually.",
  },
  managementHierarchy: [
    {
      role: "Board of Trustees",
      level: 1,
      description: "Ultimate responsibility for operation and prudent investment of the Fund.",
    },
    {
      role: "Faculty Supervisor",
      level: 2,
      description: "Appointed annually by OSB Dean. Responsible for day-to-day monitoring and faculty oversight.",
    },
    {
      role: "Managing Director",
      level: 3,
      description:
        "Student leader responsible for day-to-day student involvement, recruitment, deliverables, and trade routing.",
    },
    {
      role: "Fund Manager(s) & Senior Analysts",
      level: 4,
      description:
        "OSB finance students conducting equity research, valuation pitches, and trade recommendations.",
    },
    {
      role: "Delegated OSB Staff & Investment Agent",
      level: 5,
      description:
        "Two staff members appointed by OSB Dean with sole trading authority to execute approved orders on the discount brokerage account.",
    },
  ],
  tradeWorkflow: [
    {
      step: 1,
      actor: "Fund Manager",
      action: "Order Recommendation",
      recipient: "Senior Analyst",
      channel: "Email Recommendation",
      description: "Fund Manager pitches thesis and emails trade recommendation to the Senior Analyst.",
    },
    {
      step: 2,
      actor: "Senior Analyst",
      action: "Review & Verification",
      recipient: "Managing Director",
      channel: "Email Submission",
      description: "Senior Analyst validates the thesis, valuation, and IPS compliance, then forwards to the MD.",
    },
    {
      step: 3,
      actor: "Managing Director",
      action: "Student Leadership Approval",
      recipient: "Faculty Advisor",
      channel: "Email Approval",
      description: "Managing Director signs off and emails approval recommendation to the Faculty Advisor.",
    },
    {
      step: 4,
      actor: "Faculty Advisor",
      action: "Faculty Authorization",
      recipient: "OSB Dean's Delegated Staff",
      channel: "Official Authorization Email",
      description: "Faculty Advisor reviews risk and compliance, authorising designated OSB staff to place trade.",
    },
    {
      step: 5,
      actor: "OSB Delegated Staff",
      action: "Order Execution",
      recipient: "Discount Brokerage Account",
      channel: "Brokerage Platform",
      description: "Designated OSB Dean's staff member executes the approved trade on the brokerage platform.",
    },
  ] as TradeWorkflowStep[],
  reportingSchedule: [
    {
      type: "Semi-Annual Operational Reports",
      cadence: "Within 60 days following the end of Fall and Winter academic terms",
      approval: "Approved by simple majority of Trustees",
    },
    {
      type: "Annual Fund Manager Report",
      cadence: "Within 60 days of fiscal year end (April 30)",
      approval: "Approved by simple majority of Trustees and distributed to donors and OSB",
    },
    {
      type: "Monthly Transaction & Custody Statements",
      cadence: "Monthly",
      approval: "Distributed to Trustees and Fund Managing Director for trade review",
    },
    {
      type: "University Financial Review",
      cadence: "Annually",
      approval: "Reviewed by the Financial Accounting and Reporting department of the University",
    },
  ],
};

export const IPS_APPENDICES = [
  {
    title: "Disbursements Policy",
    summary:
      "Disbursements strictly limited to investment-related fees, audit costs, and extraordinary operational items approved by Trustees. Requires dual signature control and delegated authority.",
  },
  {
    title: "Contributions Policy",
    summary:
      "All contributions treated as donations to the University. Donations of corporate shares follow University policy: shares are liquidated upon receipt to avoid holding unsolicited positions.",
  },
  {
    title: "Operational Performance Policy",
    summary:
      "Defines calculation timing, benchmark metrics, annual budget reviews, tactical asset class mix adjustments, and rebalancing procedures.",
  },
  {
    title: "Student Recruitment & Selection",
    summary:
      "Formal merit-based application procedure, academic requirements, competitive evaluations, and annual appointments for Analysts and Managers.",
  },
  {
    title: "Nomination and Term Limits Policy",
    summary:
      "Criteria for recruiting external and internal Trustees, skill requirements, term limits (max 3 years), and governance renewal.",
  },
  {
    title: "Ethics, Conflicts of Interest & Contracts",
    summary:
      "Mandatory adherence to University policies regarding conflicts of interest, code of conduct, procurement, and triennial strategic reviews.",
  },
];

// ---------------------------------------------------------------------------
// HELPER COMPLIANCE EVALUATION FUNCTIONS
// (Exported for both the IPS page and the Trade Simulator)
// ---------------------------------------------------------------------------

export interface IpsComplianceResult {
  isCompliant: boolean;
  score: number; // 0 - 100
  totalMarketValue: number;
  cashBalance: number;
  assetMix: {
    equity: { value: number; percent: number; min: number; target: number; max: number; status: "optimal" | "warning" | "violation" };
    fixedIncome: { value: number; percent: number; min: number; target: number; max: number; status: "optimal" | "warning" | "violation" };
    cash: { value: number; percent: number; min: number; target: number; max: number; status: "optimal" | "warning" | "violation" };
  };
  singleStockLimit: {
    maxAllowedPercent: number;
    highestStock: { ticker: string; name: string; percent: number; value: number } | null;
    violations: Array<{ ticker: string; name: string; percent: number; value: number }>;
  };
  sectorLimit: {
    maxAllowedPercent: number;
    highestSector: { sector: string; percent: number; value: number } | null;
    violations: Array<{ sector: string; percent: number; value: number }>;
  };
  alerts: Array<{
    type: "violation" | "warning" | "info";
    title: string;
    message: string;
    rule: string;
  }>;
}

/**
 * Validates a portfolio against the official JSOSIF Investment Policy Statement
 */
export function evaluatePortfolioIpsCompliance(
  holdings: PortfolioHolding[],
  cashBalance: number = 0
): IpsComplianceResult {
  // 1. Calculate total portfolio market value
  const holdingsValue = holdings.reduce((sum, h) => {
    if (h.ticker === "CASH" || h.ticker === "CAD.CASH" || h.assetType === "Cash") return sum;
    const val = Number(h.marketValue ?? (h.shares * (h.currentPrice || h.averageCost || 0)));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // If cashBalance was not explicitly passed, inspect holdings for a CASH entry
  let resolvedCash = Number(cashBalance) || 0;
  if (resolvedCash <= 0) {
    const cashHolding = holdings.find(
      (h) => h.ticker === "CASH" || h.ticker === "CAD.CASH" || h.assetType === "Cash"
    );
    if (cashHolding) {
      resolvedCash = Number(cashHolding.marketValue || cashHolding.costCad || 0);
    }
  }

  const cashVal = Math.max(0, resolvedCash);
  const totalPortfolioValue = holdingsValue + cashVal;

  if (totalPortfolioValue <= 0) {
    return {
      isCompliant: true,
      score: 100,
      totalMarketValue: 0,
      cashBalance: cashVal,
      assetMix: {
        equity: { value: 0, percent: 0, min: 56, target: 63, max: 70, status: "optimal" },
        fixedIncome: { value: 0, percent: 0, min: 30, target: 37, max: 44, status: "optimal" },
        cash: { value: 0, percent: 0, min: 0, target: 0, max: 10, status: "optimal" },
      },
      singleStockLimit: { maxAllowedPercent: 10, highestStock: null, violations: [] },
      sectorLimit: { maxAllowedPercent: 25, highestSector: null, violations: [] },
      alerts: [],
    };
  }

  // 2. Classify asset mix
  let equityVal = 0;
  let fixedIncomeVal = 0;

  holdings.forEach((h) => {
    if (h.ticker === "CASH" || h.ticker === "CAD.CASH" || h.assetType === "Cash") {
      return; // Handled under cashVal
    }

    const val = Number(h.marketValue ?? (h.shares * (h.currentPrice || h.averageCost || 0))) || 0;
    const isBond =
      h.assetType === "Bond" ||
      (h.name && h.name.includes("%")) ||
      h.ticker.startsWith("CUSIP") ||
      (h.sector && h.sector.toLowerCase().includes("fixed"));

    if (isBond) {
      fixedIncomeVal += val;
    } else {
      equityVal += val;
    }
  });

  const equityPct = (equityVal / totalPortfolioValue) * 100;
  const fixedIncomePct = (fixedIncomeVal / totalPortfolioValue) * 100;
  const cashPct = (cashVal / totalPortfolioValue) * 100;

  const alerts: IpsComplianceResult["alerts"] = [];

  // 3. Asset class status check
  const getAssetStatus = (pct: number, min: number, max: number): "optimal" | "warning" | "violation" => {
    if (pct < min || pct > max) return "violation";
    if (pct < min + 2 || pct > max - 2) return "warning";
    return "optimal";
  };

  const equityStatus = getAssetStatus(equityPct, 56, 70);
  const fixedIncomeStatus = getAssetStatus(fixedIncomePct, 30, 44);
  const cashStatus = getAssetStatus(cashPct, 0, 10);

  if (equityStatus === "violation") {
    alerts.push({
      type: "violation",
      title: "Equity Allocation Band Breach",
      message: `Equities allocation is ${equityPct.toFixed(1)}%, outside the IPS mandated range of 56% - 70% (target 63%). Rebalancing required.`,
      rule: "Section 14: Asset Mix Strategy (Equities 56% - 70%)",
    });
  } else if (equityStatus === "warning") {
    alerts.push({
      type: "warning",
      title: "Equity Allocation Near Boundary",
      message: `Equities allocation is ${equityPct.toFixed(1)}%, approaching the allowable threshold [56% - 70%].`,
      rule: "Section 14: Asset Mix Strategy",
    });
  }

  if (fixedIncomeStatus === "violation") {
    alerts.push({
      type: "violation",
      title: "Fixed Income Allocation Band Breach",
      message: `Fixed income allocation is ${fixedIncomePct.toFixed(1)}%, outside the mandated range of 30% - 44% (target 37%).`,
      rule: "Section 14: Asset Mix Strategy (Fixed Income 30% - 44%)",
    });
  }

  if (cashStatus === "violation") {
    alerts.push({
      type: "violation",
      title: "Cash Reserve Exceeds Limit",
      message: `Cash is ${cashPct.toFixed(1)}%, exceeding the maximum 10% cash limit permitted for operational liquidity.`,
      rule: "Section 14: Asset Mix Strategy (Cash 0% - 10%)",
    });
  }

  // 4. Single Stock Concentration (Max 10% per equity stock under Section 15)
  // Evaluates common and preferred equity stocks. Fixed Income bonds follow bond quality/issuer rules, not stock caps.
  const stockViolations: IpsComplianceResult["singleStockLimit"]["violations"] = [];
  let highestStock: IpsComplianceResult["singleStockLimit"]["highestStock"] = null;

  holdings.forEach((h) => {
    const isBond =
      h.assetType === "Bond" ||
      (h.name && h.name.includes("%")) ||
      h.ticker?.startsWith("CUSIP") ||
      (h.sector && h.sector.toLowerCase().includes("fixed"));

    // Skip cash and fixed income bonds
    if (h.ticker === "CASH" || h.ticker === "CAD.CASH" || h.assetType === "Cash" || isBond) {
      return;
    }

    const val = Number(h.marketValue ?? (h.shares * (h.currentPrice || h.averageCost || 0))) || 0;
    const pct = (val / totalPortfolioValue) * 100;
    const ticker = h.ticker || h.symbol || "UNKNOWN";
    const name = h.name || ticker;

    if (!highestStock || pct > highestStock.percent) {
      highestStock = { ticker, name, percent: pct, value: val };
    }

    if (pct > 10.0) {
      stockViolations.push({ ticker, name, percent: pct, value: val });
      alerts.push({
        type: "violation",
        title: `Single Stock Limit Exceeded: ${ticker}`,
        message: `${ticker} (${name}) represents ${pct.toFixed(2)}% of the total fund, exceeding the maximum 10.0% equity stock constraint.`,
        rule: "Section 15: Maximum allocation to each stock (10%)",
      });
    } else if (pct > 8.5) {
      alerts.push({
        type: "warning",
        title: `Single Stock Concentration Warning: ${ticker}`,
        message: `${ticker} represents ${pct.toFixed(2)}% of the total fund, approaching the 10.0% IPS limit.`,
        rule: "Section 15: Maximum allocation to each stock (10%)",
      });
    }
  });

  // 5. Equity Industry / Sector Concentration (Max 25% under Section 15)
  // Section 15 limits apply strictly to Equity industry sectors (e.g. FIG, TMT, CR, EI, HC).
  // Fixed Income (Bonds) is a separate asset class governed by Section 14 (mandating 30% - 44%) and is not treated as an equity sector!
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    const isBond =
      h.assetType === "Bond" ||
      (h.name && h.name.includes("%")) ||
      h.ticker?.startsWith("CUSIP") ||
      (h.sector && h.sector.toLowerCase().includes("fixed"));

    if (
      h.ticker === "CASH" ||
      h.ticker === "CAD.CASH" ||
      h.assetType === "Cash" ||
      isBond ||
      h.sector === "Fixed Income" ||
      h.sector === "Cash & Liquidity"
    ) {
      return;
    }

    const val = Number(h.marketValue ?? (h.shares * (h.currentPrice || h.averageCost || 0))) || 0;
    const sectorName = h.sector || h.industry || "Unassigned";
    sectorMap[sectorName] = (sectorMap[sectorName] || 0) + val;
  });

  const sectorViolations: IpsComplianceResult["sectorLimit"]["violations"] = [];
  let highestSector: IpsComplianceResult["sectorLimit"]["highestSector"] = null;

  Object.entries(sectorMap).forEach(([sector, val]) => {
    const pct = (val / totalPortfolioValue) * 100;

    if (!highestSector || pct > highestSector.percent) {
      highestSector = { sector, percent: pct, value: val };
    }

    if (pct > 25.0) {
      sectorViolations.push({ sector, percent: pct, value: val });
      alerts.push({
        type: "violation",
        title: `Equity Sector Limit Exceeded: ${sector}`,
        message: `The ${sector} equity sector represents ${pct.toFixed(2)}% of fund value, exceeding the maximum 25.0% industry constraint.`,
        rule: "Section 15: Maximum industry weight (25%)",
      });
    } else if (pct > 22.0) {
      alerts.push({
        type: "warning",
        title: `Equity Sector Weight Approaching Limit: ${sector}`,
        message: `The ${sector} equity sector represents ${pct.toFixed(2)}% of the fund, approaching the 25.0% limit.`,
        rule: "Section 15: Maximum industry weight (25%)",
      });
    }
  });

  // 6. Calculate Overall Compliance Score (0 to 100)
  const violationCount = alerts.filter((a) => a.type === "violation").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const score = Math.max(0, Math.round(100 - violationCount * 25 - warningCount * 8));

  return {
    isCompliant: violationCount === 0,
    score,
    totalMarketValue: totalPortfolioValue,
    cashBalance: cashVal,
    assetMix: {
      equity: { value: equityVal, percent: equityPct, min: 56, target: 63, max: 70, status: equityStatus },
      fixedIncome: { value: fixedIncomeVal, percent: fixedIncomePct, min: 30, target: 37, max: 44, status: fixedIncomeStatus },
      cash: { value: cashVal, percent: cashPct, min: 0, target: 0, max: 10, status: cashStatus },
    },
    singleStockLimit: {
      maxAllowedPercent: 10,
      highestStock,
      violations: stockViolations,
    },
    sectorLimit: {
      maxAllowedPercent: 25,
      highestSector,
      violations: sectorViolations,
    },
    alerts,
  };
}
