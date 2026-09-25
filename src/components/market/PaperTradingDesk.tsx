/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PaperPortfolio, PaperOrder, PaperPosition } from '../../types/market.ts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';

interface PaperTradingDeskProps {
  portfolio: PaperPortfolio;
  selectedSymbol: string;
  currentPrice: number;
  onPlaceOrder: (order: {
    symbol: string;
    side: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  onResetPortfolio: () => Promise<void>;
}

export const PaperTradingDesk: React.FC<PaperTradingDeskProps> = ({
  portfolio,
  selectedSymbol,
  currentPrice,
  onPlaceOrder,
  onResetPortfolio,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const execPrice = orderType === 'MARKET' ? currentPrice : limitPrice || currentPrice;
  const estimatedTotal = Number((execPrice * quantity).toFixed(2));

  // Pre-flight check warnings
  const isCashInsufficient = side === 'BUY' && estimatedTotal > portfolio.cashINR;
  const existingPosition = portfolio.positions.find((p) => p.symbol === selectedSymbol);
  const isShortSelling = side === 'SELL' && (!existingPosition || existingPosition.quantity < quantity);
  const concentrationAfterBuy = side === 'BUY'
    ? (((existingPosition ? existingPosition.quantity * execPrice : 0) + estimatedTotal) / portfolio.totalPortfolioValueINR) * 100
    : 0;
  const isConcentrationRisky = concentrationAfterBuy > 40;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setIsSubmitting(true);
    setOrderFeedback(null);

    const res = await onPlaceOrder({
      symbol: selectedSymbol,
      side,
      orderType,
      quantity,
      price: orderType === 'LIMIT' ? limitPrice : undefined,
      stopLoss: stopLoss ? Number(stopLoss) : undefined,
      takeProfit: takeProfit ? Number(takeProfit) : undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setOrderFeedback({
        success: true,
        message: `Order successfully filled: ${side} ${quantity} ${selectedSymbol} @ ₹${execPrice.toFixed(2)}`,
      });
    } else {
      setOrderFeedback({
        success: false,
        message: res.error || 'Order execution failed by Risk Engine.',
      });
    }

    // Clear feedback after 6 seconds
    setTimeout(() => {
      setOrderFeedback(null);
    }, 6000);
  };

  return (
    <div className="space-y-4">
      {/* Portfolio Balance Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Portfolio Value */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Total Portfolio Value
          </span>
          <div className="text-base font-black font-mono text-slate-100">
            ₹{portfolio.totalPortfolioValueINR.toLocaleString()}
          </div>
          <div
            className={`text-[10px] font-bold font-mono flex items-center gap-0.5 ${
              portfolio.totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {portfolio.totalPnlPercent >= 0 ? '+' : ''}
            {portfolio.totalPnlPercent}% Total P&L
          </div>
        </div>

        {/* Available Cash */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Available Capital (INR)
          </span>
          <div className="text-base font-black font-mono text-cyan-400">
            ₹{portfolio.cashINR.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Instant Settled Liquidity</div>
        </div>

        {/* Active Invested Capital */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Invested Value
          </span>
          <div className="text-base font-black font-mono text-slate-200">
            ₹{portfolio.investedINR.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">{portfolio.positions.length} Positions Active</div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Unrealized P&L
          </span>
          <div
            className={`text-base font-black font-mono ${
              portfolio.unrealizedPnlINR >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {portfolio.unrealizedPnlINR >= 0 ? '+' : ''}₹{portfolio.unrealizedPnlINR.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Realized: ₹{portfolio.realizedPnlINR.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Independent Risk Engine HUD */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase text-[11px]">
            INDEPENDENT RISK ENGINE STATUS:
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              portfolio.riskStatus.concentrationExceeded
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            {portfolio.riskStatus.concentrationExceeded ? 'CONCENTRATION RISK EXCEEDED' : 'NOMINAL SAFE LIMITS'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span>
            Top Sector: <span className="text-slate-200 font-bold">{portfolio.riskStatus.largestSector}</span> ({portfolio.riskStatus.largestSectorPercent}%)
          </span>
          <span>
            Single Max: <span className="text-slate-200 font-bold">{portfolio.riskStatus.maxSinglePositionPercent}%</span> (Cap: 40%)
          </span>
          <button
            onClick={onResetPortfolio}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-2.5 w-2.5" /> Reset Portfolio
          </button>
        </div>
      </div>

      {/* Main Execution Split: Order Form & Active Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Order Entry Terminal (Left 5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black uppercase text-slate-200">
              PAPER TRADING CONSOLE: {selectedSymbol}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              LTP: ₹{currentPrice.toFixed(2)}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
            {/* BUY / SELL Tab Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  side === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                BUY (LONG)
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  side === 'SELL'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                SELL (EXIT)
              </button>
            </div>

            {/* Order Type: Market vs Limit */}
            <div className="flex items-center justify-between bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`flex-1 py-1 rounded transition-colors ${
                  orderType === 'MARKET' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderType('LIMIT');
                  setLimitPrice(currentPrice);
                }}
                className={`flex-1 py-1 rounded transition-colors ${
                  orderType === 'LIMIT' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Quantity (Shares):</span>
                <span>Holding: {existingPosition ? existingPosition.quantity : 0}</span>
              </div>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-bold text-sm focus:outline-none focus:border-cyan-500"
              />

              {/* Quick Preset Buttons */}
              <div className="flex gap-1 pt-1">
                {[5, 10, 25, 50, 100].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className="flex-1 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Price Input if Limit Order */}
            {orderType === 'LIMIT' && (
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Limit Price (INR):</span>
                <input
                  type="number"
                  step="0.05"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentPrice)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Optional Risk Triggers: Stop-Loss & Take-Profit */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Stop-Loss Target:</span>
                <input
                  type="number"
                  placeholder="Optional"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Take-Profit Target:</span>
                <input
                  type="number"
                  placeholder="Optional"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Total Calculation & Pre-Flight Feedback */}
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Capital Required:</span>
                <span className="text-slate-100 font-bold">₹{estimatedTotal.toLocaleString()}</span>
              </div>
              {side === 'BUY' && (
                <div className="flex justify-between text-slate-400">
                  <span>Available Cash Balance:</span>
                  <span className={isCashInsufficient ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    ₹{portfolio.cashINR.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Real-time Warnings */}
            {isCashInsufficient && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/80 text-rose-400 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Insufficient capital available to execute order.</span>
              </div>
            )}

            {isShortSelling && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/80 text-rose-400 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Cannot sell more shares than currently held in portfolio.</span>
              </div>
            )}

            {isConcentrationRisky && (
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/80 text-amber-400 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Risk Engine Warning: Exceeds 40% concentration limit ({concentrationAfterBuy.toFixed(1)}%).</span>
              </div>
            )}

            {/* Order Feedback Alert */}
            {orderFeedback && (
              <div
                className={`p-2 rounded border text-[11px] flex items-center gap-1.5 ${
                  orderFeedback.success
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-800 text-rose-300'
                }`}
              >
                {orderFeedback.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                )}
                <span>{orderFeedback.message}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || isCashInsufficient || isShortSelling}
              className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                side === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-800 disabled:text-slate-500'
                  : 'bg-rose-600 hover:bg-rose-500 text-white disabled:bg-slate-800 disabled:text-slate-500'
              }`}
            >
              {isSubmitting ? 'Validating Risk Model...' : `SUBMIT ${side} ORDER`}
            </button>
          </form>
        </div>

        {/* Active Holdings & Audit Log (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Holdings Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-200">
                ACTIVE PORTFOLIO HOLDINGS ({portfolio.positions.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Marked to Market</span>
            </div>

            {portfolio.positions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No active equity positions in paper portfolio. Enter a trade on the console.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Symbol</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Avg Buy</th>
                      <th className="py-2.5 px-3">LTP</th>
                      <th className="py-2.5 px-3">P&L (INR)</th>
                      <th className="py-2.5 px-3 text-right">Quick Exit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {portfolio.positions.map((pos) => {
                      const isPos = pos.unrealizedPnl >= 0;
                      return (
                        <tr key={pos.symbol} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-bold text-cyan-400">{pos.symbol}</td>
                          <td className="py-2 px-3">{pos.quantity}</td>
                          <td className="py-2 px-3">₹{pos.avgBuyPrice.toFixed(2)}</td>
                          <td className="py-2 px-3">₹{pos.currentPrice.toFixed(2)}</td>
                          <td className={`py-2 px-3 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPos ? '+' : ''}₹{pos.unrealizedPnl.toFixed(2)} ({isPos ? '+' : ''}
                            {pos.pnlPercent}%)
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => {
                                onPlaceOrder({
                                  symbol: pos.symbol,
                                  side: 'SELL',
                                  orderType: 'MARKET',
                                  quantity: pos.quantity,
                                });
                              }}
                              className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-400 hover:bg-rose-900 text-[10px] font-bold cursor-pointer"
                            >
                              Exit All
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Orders Audit Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-200">
                AUDIT LOG: RECENT ORDER TRANSMISSIONS
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {portfolio.orderHistory.length} Logged
              </span>
            </div>

            {portfolio.orderHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                Order audit history is currently empty.
              </div>
            ) : (
              <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-800">
                {portfolio.orderHistory.slice(0, 10).map((ord) => (
                  <div key={ord.id} className="p-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}
                        >
                          {ord.side} {ord.quantity} {ord.symbol}
                        </span>
                        <span className="text-slate-400">@ ₹{ord.price.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(ord.timestamp).toLocaleTimeString()} • {ord.orderType}
                      </div>
                      {ord.rejectReason && (
                        <div className="text-[10px] text-rose-400 italic max-w-sm">
                          {ord.rejectReason}
                        </div>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ord.status === 'EXECUTED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
