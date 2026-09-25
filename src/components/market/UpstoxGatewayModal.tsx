/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UpstoxConfigStatus } from '../../types/market.ts';
import { Shield, ShieldCheck, Key, RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface UpstoxGatewayModalProps {
  status: UpstoxConfigStatus;
  onUpdateConfig: (config: {
    apiKey?: string;
    apiSecret?: string;
    redirectUri?: string;
    accessToken?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const UpstoxGatewayModal: React.FC<UpstoxGatewayModalProps> = ({
  status,
  onUpdateConfig,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateConfig({
      apiKey: apiKey || undefined,
      apiSecret: apiSecret || undefined,
      redirectUri: redirectUri || undefined,
      accessToken: accessToken || undefined,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 shadow-2xl space-y-4 text-xs font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              UPSTOX API GATEWAY & SECURE BROKER CONFIGURATION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status HUD */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Gateway Mode:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                  status.isConfigured
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}
              >
                {status.mode === 'UPSTOX_LIVE_ANALYTICS' ? 'UPSTOX LIVE ANALYTICS (V2)' : status.mode}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>TOKEN CONFIGURED IN SECRETS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1 border-t border-slate-900">
            <div>
              <span className="text-slate-500 block">Client ID</span>
              <span className="text-slate-200 font-bold">{status.clientId || '53CLND'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Telemetry Latency</span>
              <span className="text-emerald-400 font-bold">{status.feedLatencyMs} ms</span>
            </div>
            <div>
              <span className="text-slate-500 block">Analysis Scope</span>
              <span className="text-cyan-400 font-bold">Quotes & Candles</span>
            </div>
            <div>
              <span className="text-slate-500 block">Trade Safeguard</span>
              <span className="text-amber-400 font-bold">Virtual Paper Risk</span>
            </div>
          </div>
        </div>

        {/* Documentation notice */}
        <div className="bg-cyan-950/20 border border-cyan-900/40 p-3 rounded-lg text-slate-300 space-y-1">
          <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            <span>Secure Server-Side Credential Storage</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Credentials configured here are transmitted strictly to the container backend server and never leaked to the client bundle. When unconfigured, the platform seamlessly runs on high-fidelity deterministic market telemetry for all Indian & global equities.
          </p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Upstox API Key:</label>
            <input
              type="text"
              placeholder={status.apiKeyMasked || 'Enter your Upstox API Key'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Upstox API Secret:</label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Upstox Access Token (Bearer):</label>
            <input
              type="password"
              placeholder="Paste active user session Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {savedSuccess && (
            <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Broker credentials updated successfully in backend memory.</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://developer.upstox.com"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Developer Portal</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {isSaving ? 'Updating...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
