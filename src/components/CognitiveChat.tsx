/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  Bot, 
  User, 
  HelpCircle, 
  Database,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Globe
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface CognitiveChatProps {
  token: string | null;
  userName?: string;
  focalCity?: string;
}

export default function CognitiveChat({ token, userName = 'Operator', focalCity = 'Trivandrum' }: CognitiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyPurging, setHistoryPurging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMapRef = useRef<HTMLDivElement>(null);
  const chatMapInstanceRef = useRef<L.Map | null>(null);
  const chatMarkerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    const cssId = 'leaflet-core-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const container = chatMapRef.current;
    if (!container) return;

    let lat = 8.5241;
    let lon = 76.9366;
    if (focalCity.toLowerCase().includes('reykjavik')) {
      lat = 64.1466; lon = -21.9426;
    } else if (focalCity.toLowerCase().includes('seattle')) {
      lat = 47.6062; lon = -122.3321;
    } else if (focalCity.toLowerCase().includes('kochi')) {
      lat = 9.9312; lon = 76.2673;
    } else if (focalCity.toLowerCase().includes('tokyo')) {
      lat = 35.6762; lon = 139.6503;
    }

    if (chatMapInstanceRef.current) {
      try {
        chatMapInstanceRef.current.remove();
      } catch (err) {
        console.error('Failed to remove chat map instance:', err);
      }
      chatMapInstanceRef.current = null;
    }

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }
    container.innerHTML = '';

    let marker: L.CircleMarker | null = null;
    let pulse: any = null;

    try {
      const map = L.map(container, {
        center: [lat, lon],
        zoom: 6,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      chatMapInstanceRef.current = map;

      marker = L.circleMarker([lat, lon], {
        radius: 12,
        fillColor: '#06b6d4',
        color: '#06b6d4',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.35
      }).addTo(map);

      let val = 1;
      pulse = setInterval(() => {
        if (!marker || !map.hasLayer(marker)) {
          clearInterval(pulse);
          return;
        }
        const radius = marker.getRadius();
        let nextR = radius + val * 0.5;
        if (nextR > 18) val = -1;
        if (nextR < 10) val = 1;
        marker.setRadius(nextR);
      }, 150);

      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:11px;color:#1e293b;padding:2px;">
          <b style="color:#06b6d4;text-transform:uppercase;">CHAT FOCUS: ${focalCity}</b>
          <p style="margin:4px 0 0;font-weight:600;margin-bottom:0;">Liaison Context Station Coords online.</p>
        </div>
      `, { closeButton: false }).openPopup();

      chatMarkerRef.current = marker;
    } catch (err) {
      console.error('Failed to initialize chat focus map:', err);
    }

    return () => {
      if (pulse) {
        clearInterval(pulse);
      }
      if (chatMapInstanceRef.current) {
        try {
          chatMapInstanceRef.current.remove();
        } catch (err) {
          console.error('Failed to clean up chat map:', err);
        }
        chatMapInstanceRef.current = null;
      }
    };
  }, [focalCity]);

  // Suggested quick prompts to guide operators
  const SUGGESTED_PROMPTS = [
    { text: 'Assess current structural seismic hazard', tag: 'Hazard' },
    { text: 'Which depots have emergency power units?', tag: 'Logistics' },
    { text: 'Suggest alternative routing for delayed cargo', tag: 'Supply' },
    { text: 'Check lightning alerts near coastal terminals', tag: 'Climatology' }
  ];

  // Fetch Message history from API
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat/history', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Scroll to bottom whenever messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (rawMessage: string) => {
    if (!rawMessage.trim() || isLoading) return;

    // Locally append immediate user message
    const tempUserMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      message: rawMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: rawMessage })
      });

      if (!response.ok) {
        throw new Error('Intelligence server timed out.');
      }
      const savedReply = await response.json();
      setMessages(prev => {
        // filter out the temporary user message, append the synced pairs
        const clean = prev.filter(m => m.id !== tempUserMsg.id);
        return [...clean, tempUserMsg, savedReply];
      });
    } catch {
      // Append local fallback error msg
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        message: '🚨 Connection to the central cognitive processor disrupted. Verify operations node and retry.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const purgeArchive = async () => {
    if (messages.length === 0 || historyPurging) return;
    setHistoryPurging(true);
    try {
      const response = await fetch('/api/chat/history', {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryPurging(false);
    }
  };

  // Custom regex-powered clean Markdown renderer to eliminate any NPM dependencies
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Bullet items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemContent = line.replace(/^[\s-*]+/, '');
        return (
          <li key={lIdx} className="ml-5 list-disc leading-relaxed text-xs my-0.5 select-text">
            {parseInlines(itemContent)}
          </li>
        );
      }
      // Headings
      if (line.trim().startsWith('### ')) {
        return (
          <h4 key={lIdx} className="text-xs font-bold text-cyan-400 mt-2 mb-1 select-text uppercase tracking-wider">
            {parseInlines(line.replace('### ', ''))}
          </h4>
        );
      }
      if (line.trim().startsWith('## ')) {
        return (
          <h3 key={lIdx} className="text-sm font-extrabold text-white mt-3 mb-1.5 select-text uppercase tracking-tight">
            {parseInlines(line.replace('## ', ''))}
          </h3>
        );
      }

      // Normal lines
      return (
        <p key={lIdx} className="leading-relaxed text-xs my-1 text-slate-200 select-text">
          {parseInlines(line)}
        </p>
      );
    });
  };

  // Inline styling parser
  const parseInlines = (str: string) => {
    let parts: ReactNode[] = [str];

    // Bold tags: **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    
    // Simplistic inline parser for bold and markers
    const boldMatches = str.match(boldRegex);
    if (boldMatches) {
      return str.split('**').map((chunk, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="text-amber-400 font-extrabold">{chunk}</strong>;
        }
        return chunk;
      });
    }

    return str;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[650px]" id="cognitive-chat-section-root">
      
      {/* LEFT CHAT AREA */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-2xl flex flex-col h-[650px] shadow-sm select-none">
      
      {/* COGNITIVE HEADER */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between bg-slate-50 dark:bg-slate-950/45 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/30">
            <Bot className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center gap-1">
              TerraWatch AI Operational Liaison 
              <span className="text-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-1 py-0 rounded font-mono">ONLINE</span>
            </h3>
            <p className="text-[10px] text-slate-450 flex items-center gap-1 mt-0.5">
              <Database className="h-3 w-3 text-cyan-400" /> Powered by Relational DB Archive & Local Expert Systems
            </p>
          </div>
        </div>

        {/* Purge history */}
        <button
          onClick={purgeArchive}
          disabled={messages.length === 0 || historyPurging}
          className="p-2 border border-slate-200 hover:border-red-200 dark:border-slate-800 text-slate-500 hover:text-red-500 rounded-lg active:scale-95 transition-all cursor-pointer disabled:opacity-40"
          title="Clear operational chat logs"
        >
          {historyPurging ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* CHAT MESSAGES TRAY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-450 max-w-md mx-auto space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-10 w-10 bg-indigo-505/20 animate-ping rounded-full filter blur-md" />
                <Bot className="h-10 w-10 text-indigo-500 relative z-10 animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Operations Control Liaison Activated.</p>
                <p className="text-[10px] leading-relaxed">
                  Welcome back, <span className="font-bold text-indigo-400">{userName}</span>! I am attached to your Relational Disaster Ledger. I have live awareness of your focal station <span className="font-bold text-cyan-400">({focalCity})</span>, stock reserves, and active high-hazard transportation coordinates. Ask me anything.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p.text)}
                    className="text-left p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 hover:border-indigo-400 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 cursor-pointer shadow-sm flex items-center justify-between group"
                  >
                    <span>{p.text}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-400 shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isAI = m.sender === 'assistant';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAI && (
                      <div className="h-8 w-8 rounded-lg bg-indigo-650 border border-indigo-500/20 shadow flex items-center justify-center shrink-0 text-white font-mono mt-0.5">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                    )}

                    <div className="max-w-[80%] space-y-1">
                      {/* Meta information */}
                      <div className={`flex items-center gap-1.5 text-[9px] font-mono text-slate-400 ${!isAI ? 'justify-end' : ''}`}>
                        <span>{isAI ? 'Intelligence Agent' : userName}</span>
                        <span>•</span>
                        <span>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!isAI && <ShieldCheck className="h-3 w-3 text-cyan-400" />}
                      </div>

                      {/* Bubble */}
                      <div className={`p-3.5 rounded-2xl border ${
                        isAI 
                          ? 'bg-slate-900 border-slate-800 text-slate-250 rounded-tl-none shadow-md' 
                          : 'bg-indigo-600 border-indigo-750 text-white rounded-tr-none shadow-sm font-semibold text-xs'
                      }`}>
                        {isAI ? (
                          <div className="prose prose-invert max-w-none space-y-1">
                            {renderMessageContent(m.message)}
                          </div>
                        ) : (
                          <p className="select-text leading-relaxed text-xs">{m.message}</p>
                        )}
                      </div>
                    </div>

                    {!isAI && (
                      <div className="h-8 w-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0 text-cyan-400 font-extrabold text-[10px] mt-0.5 uppercase">
                        {userName.slice(0, 2)}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="h-8 w-8 rounded-lg bg-indigo-650 border border-indigo-500/20 flex items-center justify-center text-white shrink-0 mt-0.5">
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400">Agent typing...</span>
              <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                <span className="text-[10px] font-mono pl-1.5 text-slate-500">Querying climate snapshots database...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* FOOTER MESSAGE WRAPPER INPUT */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-1"
        >
          <input
            id="cognitive-chat-user-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type operations liaison advice request (e.g. 'Reroute cargo-rat-003')"
            className="flex-1 bg-transparent text-xs py-3.5 text-slate-900 dark:text-white focus:outline-none placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            id="cognitive-chat-send-btn"
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-950 text-white disabled:text-slate-400 rounded-xl transition-all cursor-pointer shadow active:scale-95 shrink-0"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
      </div>

      {/* RIGHT GEOLOCATION COMPANION MAP */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-2xl flex flex-col h-[650px] p-2 animate-fade-in" id="cognitive-chat-right-col">
        <div className="flex items-center gap-1.5 p-3.5 border-b border-slate-100 dark:border-slate-850">
          <Globe className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Focal Geodetic Context</span>
        </div>
        
        <div className="flex-1 p-2 flex flex-col">
          <div 
            ref={chatMapRef} 
            className="flex-1 rounded-xl overflow-hidden shadow-inner border border-slate-150 dark:border-slate-850 z-10 animate-fade-in" 
          />
          
          <div className="mt-3.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1">
            <span className="text-[10px] font-mono text-cyan-500 font-extrabold block">FOCAL CITY SNAPSHOT:</span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-extrabold uppercase block">{focalCity}</span>
            <p className="text-[11px] text-slate-450 mt-1">
              AI uses this geolocation to retrieve historical and real-time seismic reports to craft responsive advice summaries.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
