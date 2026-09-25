/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketTick {
  instrumentId: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'MCX' | 'GLOBAL';
  timestamp: number;
  ltp: number;
  change: number;
  changePercent: number;
  bid?: number;
  ask?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  vwap?: number;
  openInterest?: number;
  source: 'UPSTOX_LIVE' | 'SIMULATED_FEED';
}

export interface MarketInstrument {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'GLOBAL';
  sector: string;
  currentPrice: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  vwap: number;
  marketCapCr: number;
  peRatio?: number;
  volatilityRating: 'LOW' | 'MEDIUM' | 'HIGH';
  isPopular?: boolean;
}

export interface HistoricalBar {
  timestamp: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  ema20?: number;
  rsi?: number;
  upperBB?: number;
  lowerBB?: number;
  macd?: number;
  macdSignal?: number;
}

export type TechnicalRegime = 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';

export interface TechnicalAnalysis {
  regime: TechnicalRegime;
  score: number; // -100 to +100
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    trend: 'bullish' | 'bearish';
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    ema20: number;
    aboveSma20: boolean;
    aboveSma50: boolean;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandWidthPercent: number;
    isSqueezed: boolean;
  };
  supportResistance: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
  };
  summaryText: string;
}

export interface ProbabilisticForecast {
  symbol: string;
  horizon: '15m' | '1h' | '1D' | '5D';
  probabilities: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
  expectedReturnPercent: {
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
  };
  modelConfidence: 'Low' | 'Moderate' | 'High';
  riskScore: number; // 0 to 100
  primaryDrivers: string[];
  riskFactors: string[];
  invalidationConditions: string[];
  historicalAnalogue: {
    eventTitle: string;
    date: string;
    correlationScore: number;
    historicalOutcome: string;
  };
  modelVersion: string;
  disclaimer: string;
}

export interface EventMarketTransmission {
  id: string;
  eventCategory: 'environmental' | 'geopolitical' | 'energy' | 'macroeconomic';
  headline: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  transmissionChain: string[];
  affectedCommodities: {
    name: string;
    expectedImpact: 'bullish' | 'bearish' | 'volatile';
    confidencePercent: number;
  }[];
  affectedSectors: {
    sector: string;
    impactDirection: 'positive' | 'negative' | 'mixed';
    exposureDegree: 'high' | 'moderate' | 'low';
    rationale: string;
  }[];
  exposedCompanies: {
    symbol: string;
    name: string;
    direction: 'positive' | 'negative' | 'mixed';
    sensitivity: string;
  }[];
  historicalAnalogues: {
    name: string;
    year: number;
    marketReaction: string;
    recoveryHorizonDays: number;
  }[];
  riskOffProbabilityPercent: number;
}

export interface MarketRegimeData {
  regime: 'Strong Bull' | 'Bull' | 'Range-bound' | 'High Volatility' | 'Risk-Off' | 'Crash-like' | 'Recovery';
  regimeConfidencePercent: number;
  vixValue: number;
  vixChangePercent: number;
  breadthAdvanceRatio: number; // e.g. 0.62 (62% advancing)
  dominantSector: string;
  driverSummary: string;
}

export interface PaperOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: number;
  price: number;
  status: 'EXECUTED' | 'REJECTED' | 'PENDING' | 'CANCELLED';
  stopLoss?: number;
  takeProfit?: number;
  rejectReason?: string;
  timestamp: number;
  totalAmount: number;
}

export interface PaperPosition {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  pnlPercent: number;
  sector: string;
}

export interface PaperPortfolio {
  cashINR: number;
  investedINR: number;
  totalPortfolioValueINR: number;
  unrealizedPnlINR: number;
  realizedPnlINR: number;
  totalPnlPercent: number;
  positions: PaperPosition[];
  orderHistory: PaperOrder[];
  riskStatus: {
    concentrationExceeded: boolean;
    largestSector: string;
    largestSectorPercent: number;
    maxSinglePositionPercent: number;
  };
}

export interface UpstoxConfigStatus {
  isConfigured: boolean;
  apiKeyMasked: string | null;
  hasSecret: boolean;
  hasAccessToken: boolean;
  mode: 'LIVE_UPSTOX' | 'HIGH_FIDELITY_SIMULATED' | 'UPSTOX_LIVE_ANALYTICS';
  lastHeartbeat?: number;
  feedLatencyMs: number;
  isAnalyticsOnly?: boolean;
  clientId?: string;
  tokenExpiresAt?: string;
}
