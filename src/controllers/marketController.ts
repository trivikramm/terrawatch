/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import {
  simulatedMarketService,
  upstoxService,
  getUpstoxStatus,
  updateUpstoxCredentials,
} from '../services/marketProvider.ts';

export async function handleGetMarketPulse(req: Request, res: Response) {
  try {
    const pulse = simulatedMarketService.getMarketPulse();
    return res.json({ success: true, data: pulse });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve market pulse telemetry', details: err.message });
  }
}

export async function handleGetInstruments(req: Request, res: Response) {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : undefined;
    const instruments = simulatedMarketService.getInstruments(query);
    return res.json({ success: true, data: instruments });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to search market instruments', details: err.message });
  }
}

export async function handleGetQuote(req: Request, res: Response) {
  try {
    const symbol = (req.params.symbol || 'RELIANCE').toUpperCase();

    // Check if Upstox live feed is configured
    if (upstoxService.isReady()) {
      const liveQuote = await upstoxService.fetchLiveQuote(symbol);
      if (liveQuote) {
        return res.json({ success: true, data: liveQuote });
      }
    }

    // Default to high-fidelity simulated provider
    const quote = simulatedMarketService.getQuote(symbol);
    return res.json({ success: true, data: quote });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch quote', details: err.message });
  }
}

export async function handleGetHistory(req: Request, res: Response) {
  try {
    const symbol = (req.params.symbol || 'RELIANCE').toUpperCase();
    const timeframe = typeof req.query.timeframe === 'string' ? req.query.timeframe : '1D';

    // Check if Upstox live historical candles are available
    if (upstoxService.isReady()) {
      const liveBars = await upstoxService.fetchHistoricalBars(symbol, timeframe);
      if (liveBars && liveBars.length > 0) {
        return res.json({ success: true, data: liveBars });
      }
    }

    const bars = simulatedMarketService.getHistoricalBars(symbol, timeframe);
    return res.json({ success: true, data: bars });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch historical series', details: err.message });
  }
}

export async function handleGetTechnicalAnalysis(req: Request, res: Response) {
  try {
    const symbol = (req.params.symbol || 'RELIANCE').toUpperCase();
    const tech = simulatedMarketService.getTechnicalAnalysis(symbol);
    return res.json({ success: true, data: tech });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to calculate technical layer', details: err.message });
  }
}

export async function handleGetForecast(req: Request, res: Response) {
  try {
    const symbol = (req.params.symbol || 'RELIANCE').toUpperCase();
    const horizon = (req.query.horizon as any) || '1D';
    const forecast = simulatedMarketService.getProbabilisticForecast(symbol, horizon);
    return res.json({ success: true, data: forecast });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to generate probabilistic scenario forecast', details: err.message });
  }
}

export async function handleGetTransmissions(req: Request, res: Response) {
  try {
    const transmissions = simulatedMarketService.getEventTransmissions();
    return res.json({ success: true, data: transmissions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve event transmission records', details: err.message });
  }
}

export async function handleGetRegime(req: Request, res: Response) {
  try {
    const regime = simulatedMarketService.getMarketRegime();
    return res.json({ success: true, data: regime });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to detect market regime', details: err.message });
  }
}

export async function handleGetScanner(req: Request, res: Response) {
  try {
    const ranked = simulatedMarketService.getScannerRankings();
    return res.json({ success: true, data: ranked });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to run market scanner', details: err.message });
  }
}

export async function handleGetPortfolio(req: Request, res: Response) {
  try {
    const portfolio = simulatedMarketService.getPaperPortfolio();
    return res.json({ success: true, data: portfolio });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve paper portfolio', details: err.message });
  }
}

export async function handlePaperOrder(req: Request, res: Response) {
  try {
    const { symbol, side, orderType, quantity, price, stopLoss, takeProfit } = req.body;
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ success: false, error: 'Symbol, side (BUY/SELL), and quantity are required.' });
    }

    const result = simulatedMarketService.executePaperOrder({
      symbol: symbol.toUpperCase(),
      side,
      orderType: orderType || 'MARKET',
      quantity: Number(quantity),
      price: price ? Number(price) : undefined,
      stopLoss: stopLoss ? Number(stopLoss) : undefined,
      takeProfit: takeProfit ? Number(takeProfit) : undefined,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, order: result.order });
    }

    const currentPortfolio = simulatedMarketService.getPaperPortfolio();
    return res.json({ success: true, data: { order: result.order, portfolio: currentPortfolio } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to execute paper trade', details: err.message });
  }
}

export async function handleResetPortfolio(req: Request, res: Response) {
  try {
    const resetState = simulatedMarketService.resetPortfolio();
    return res.json({ success: true, data: resetState });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to reset portfolio', details: err.message });
  }
}

export async function handleGetUpstoxStatus(req: Request, res: Response) {
  try {
    const status = getUpstoxStatus();
    return res.json({ success: true, data: status });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to check Upstox configuration status', details: err.message });
  }
}

export async function handleSetUpstoxConfig(req: Request, res: Response) {
  try {
    const { apiKey, apiSecret, redirectUri, accessToken } = req.body;
    const updated = updateUpstoxCredentials({
      apiKey,
      apiSecret,
      redirectUri,
      accessToken,
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update Upstox credentials', details: err.message });
  }
}
