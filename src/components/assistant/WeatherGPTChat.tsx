import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Info, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  X,
  HelpCircle,
  Database,
  Volume2,
  VolumeX,
  RotateCcw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { AIService } from '../../services/aiService';
import { ChatMessage, LanguageCode, LanguageOption } from '../../types/ai.types';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { formatTime } from '../../lib/utils';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া' },
];

const LOCALES: Record<LanguageCode, string> = {
  en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN', mr: 'mr-IN', ta: 'ta-IN',
  bn: 'bn-IN', te: 'te-IN', pa: 'pa-IN', kn: 'kn-IN', ml: 'ml-IN',
  ur: 'ur-IN', or: 'or-IN', as: 'as-IN',
};

// Prefer an Indian-language browser voice. Browser availability varies by OS/browser.
const VOICE_FALLBACKS: Record<LanguageCode, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB'], hi: ['hi-IN', 'en-IN'], gu: ['gu-IN', 'hi-IN', 'en-IN'],
  mr: ['mr-IN', 'hi-IN', 'en-IN'], ta: ['ta-IN', 'en-IN'], bn: ['bn-IN', 'hi-IN', 'en-IN'],
  te: ['te-IN', 'en-IN'], pa: ['pa-IN', 'hi-IN', 'en-IN'], kn: ['kn-IN', 'en-IN'],
  ml: ['ml-IN', 'en-IN'], ur: ['ur-IN', 'hi-IN', 'en-IN'], or: ['or-IN', 'hi-IN', 'en-IN'],
  as: ['as-IN', 'bn-IN', 'hi-IN', 'en-IN'],
};

function detectLanguage(text: string): LanguageCode {
  if (/[਀-੿]/.test(text)) return 'pa';
  if (/[ऀ-ॿ]/.test(text)) return 'hi';
  if (/[઀-૿]/.test(text)) return 'gu';
  if (/[஀-௿]/.test(text)) return 'ta';
  if (/[ঀ-৿]/.test(text)) return 'bn';
  if (/[ఀ-౿]/.test(text)) return 'te';
  if (/[ಀ-೿]/.test(text)) return 'kn';
  if (/[ഀ-ൿ]/.test(text)) return 'ml';
  if (/[؀-ۿ]/.test(text)) return 'ur';
  if (/[଀-୿]/.test(text)) return 'or';

  // Roman-script Hindi/Punjabi commonly comes from English-keyboard typing or STT.
  const lower = text.toLowerCase();
  const hindiHits = (lower.match(/\b(ka|ke|ki|hai|hain|ho|hoga|kal|aaj|baarish|barish|mausam|kab|kya|mujhe|chahiye|hogi|hoga|panipat|mein|me|se|par|jaana|jana|rahe|raha|rhe|batao|accha|achha)\b/g) || []).length;
  const punjabiHits = (lower.match(/\b(ajj|aj|kal|mausam|kivein|kiven|hai|aa|haan|ji|baarish|barish|paindi|paini|hove|hona|tusi|mainu|chahida|kithe|ethe|othe|da|di|de|nu|vich|te|naal)\b/g) || []).length;
  if (punjabiHits >= 2 && punjabiHits > hindiHits) return 'pa';
  if (hindiHits >= 2) return 'hi';
  return 'en';
}

const SIH_DEMO_SCENARIOS = [
  { label: 'Rain at 8 AM', query: 'Will it rain tomorrow at 8 AM?' },
  { label: 'Bike to College', query: 'Should I take my bike to college tomorrow?' },
  { label: 'Evening Cricket', query: 'Is tomorrow evening good for cricket?' },
  { label: 'Highway Travel', query: 'Is it safe to travel tomorrow morning?' },
  { label: 'Kisan Weather Risks', query: 'What weather risks should farmers expect tomorrow?' },
  { label: 'Rainfall Trend', query: 'Show me the rainfall trend.' },
];

export const WeatherGPTChat: React.FC = () => {
  const { currentWeather, selectedDistrict } = useWeather();
  const [inputQuery, setInputQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [languageLocked, setLanguageLocked] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeWhyModal, setActiveWhyModal] = useState<ChatMessage | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Initialize messages with LocalStorage persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('weathergpt_chat_history_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Hello! 👋 I’m WeatherGPT.

I can chat with you normally, help with weather questions, travel plans, rain, farming, outdoor activities, alerts, and more.

How can I help you today?`,
        timestamp: new Date().toISOString(),
        source: 'India Meteorological Department (IMD) / Station Network Integration',
        verified_at: new Date().toISOString(),
        risk_level: 'Low',
        actionable_recommendations: [
          'Ask about rain probabilities or umbrella needs for tomorrow morning.',
          'Check two-wheeler or highway travel risks along your transit route.',
          'Evaluate crop spraying, irrigation, or harvesting advisories for farmers.',
        ],
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('weathergpt_chat_history_v2', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Speech-to-text. Voice mode sends the final transcript automatically.
  const sendVoiceRef = useRef<(text: string) => void>(() => {});
  const { isListening, isSupported, toggleListening, error: voiceError } = useVoiceRecognition({
    language: LOCALES[selectedLanguage],
    onTranscript: (t, isFinal) => {
      setInputQuery(t);
      if (isFinal && voiceMode) sendVoiceRef.current(t);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Text-to-speech with a matching browser voice for the active language.
  const handleToggleSpeak = useCallback((msgId: string, text: string, lang: LanguageCode = selectedLanguage) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const locale = LOCALES[lang] || 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const preferredLocales = VOICE_FALLBACKS[lang] || [locale, 'en-IN'];
    const voice = preferredLocales.reduce<SpeechSynthesisVoice | undefined>((found, preferred) => {
      if (found) return found;
      const exact = voices.find(v => v.lang.toLowerCase() === preferred.toLowerCase());
      return exact || voices.find(v => v.lang.toLowerCase().startsWith(preferred.split('-')[0].toLowerCase()));
    }, undefined);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || locale;
    // Slightly slower, warm delivery for a conversational assistant.
    utterance.rate = 0.92;
    utterance.pitch = 1.03;
    utterance.volume = 1;
    utterance.onstart = () => { setSpeakingMsgId(msgId); setIsSpeaking(true); };
    utterance.onend = () => { setSpeakingMsgId(null); setIsSpeaking(false); };
    utterance.onerror = () => { setSpeakingMsgId(null); setIsSpeaking(false); };
    setSpeakingMsgId(msgId);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [selectedLanguage, speakingMsgId]);

  const handleClearChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingMsgId(null);
    const initialWelcome: ChatMessage = {
      id: 'welcome',
      sender: 'assistant',
      text: `Chat cleared! How may I assist you with weather intelligence today?`,
      timestamp: new Date().toISOString(),
      source: 'India Meteorological Department (IMD) / Station Network Integration',
      verified_at: new Date().toISOString(),
      risk_level: 'Low',
    };
    setMessages([initialWelcome]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || !currentWeather) return;

    // Text input automatically selects the response language from the user's script.
    // Manual language selection can still be locked for Romanized text or mixed-language prompts.
    const detected = detectLanguage(query);
    const responseLanguage = languageLocked ? selectedLanguage : detected;
    if (!languageLocked && detected !== selectedLanguage) setSelectedLanguage(detected);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await AIService.queryAssistant(query, currentWeather, responseLanguage);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toISOString(),
        risk_level: response.risk_level,
        evidence: response.evidence,
        actionable_recommendations: response.actionable_recommendations,
        why_explanation: response.why_explanation,
        source: response.source,
        verified_at: response.verified_at,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (autoSpeak || voiceMode) {
        handleToggleSpeak(assistantMsg.id, assistantMsg.text, responseLanguage);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Apologies, I encountered an issue retrieving verified meteorological telemetry: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  sendVoiceRef.current = (text: string) => { void handleSend(text); };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case 'Severe':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Low':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col h-[calc(100vh-4.5rem)] pb-20 md:pb-6">
      {/* 0. Futuristic Voice Assistant Hero */}
      <div className="voice-hero flex-shrink-0 mb-3">
        <div className="voice-hero-orbit orbit-one" />
        <div className="voice-hero-orbit orbit-two" />
        <div className={`voice-hero-orb ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}>
          <div className="voice-hero-core"><Bot className="w-7 h-7" /></div>
          <span className="voice-ring ring-a" /><span className="voice-ring ring-b" />
        </div>
        <div className="voice-hero-copy">
          <div className="flex items-center gap-2">
            <span className="voice-live-dot" />
            <span className="voice-kicker">WEATHERGPT VOICE AI</span>
          </div>
          <h1>Talk naturally. <span>Plan smarter.</span></h1>
          <p>Ask anything about weather, travel, farming or your day. I’ll understand you and reply naturally.</p>
        </div>
      </div>

      {/* 1. Top Header: Title, Controls & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 gap-3 flex-shrink-0 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="ai-orb w-11 h-11 rounded-2xl border border-cyan-300/30 flex items-center justify-center text-cyan-200 flex-shrink-0">
            <div className="ai-orb-core"><Bot className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-100">
                WeatherGPT <span className="text-cyan-300">AI</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                Grounded Met-LLM
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Active Focus: <span className="font-semibold text-slate-700">{currentWeather?.location || selectedDistrict.name}</span> ({currentWeather?.state || selectedDistrict.state}) • Verified IMD Observation Stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* New Chat Button */}
          <button
            onClick={handleClearChat}
            className="p-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Language selector */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              aria-label="Select language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setLanguageLocked(v => !v)}
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${languageLocked ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-slate-700 bg-slate-900/60 text-slate-400'}`}
            title="Auto-detect response language from typed text"
          >
            {languageLocked ? 'LANG LOCK' : 'AUTO LANG'}
          </button>
          <button
            type="button"
            onClick={() => setVoiceMode(v => !v)}
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${voiceMode ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-slate-700 bg-slate-900/60 text-slate-400'}`}
          >
            {voiceMode ? 'VOICE CHAT ON' : 'VOICE CHAT OFF'}
          </button>
        </div>
      </div>

      {/* 2. SIH 2026 Core Scenarios Ribbon */}
      <div className="py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase flex-shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" /> SIH Scenarios:
        </span>
        {SIH_DEMO_SCENARIOS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.query)}
            className="flex-shrink-0 px-3 py-1 rounded-full bg-slate-900/70 hover:bg-cyan-400/10 border border-slate-700 hover:border-cyan-400/30 text-slate-300 hover:text-cyan-200 text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Quick conversational starters */}
      <div className="quick-prompts flex-shrink-0 pb-2">
        {['Hello 👋', 'What can you do?', 'Should I go out tomorrow?', 'Will it rain?'].map((q) => (
          <button key={q} onClick={() => handleSend(q)}>{q}</button>
        ))}
      </div>

      {/* 3. Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`weather-enter flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-xs leading-relaxed space-y-3.5 ${
                  isUser
                    ? 'bg-cyan-500/90 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,.16)]'
                    : 'glass-card chat-futuristic text-slate-200'
                }`}
              >
                {/* Header for assistant message */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs tracking-wide">WeatherGPT Assistant</span>
                      {msg.risk_level && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRiskBadge(msg.risk_level)}`}>
                          {msg.risk_level.toUpperCase()} RISK
                        </span>
                      )}
                    </div>

                    {/* Audio Speech Button */}
                    <button
                      onClick={() => handleToggleSpeak(msg.id, msg.text)}
                      className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                        speakingMsgId === msg.id
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-blue-600'
                      }`}
                      title={speakingMsgId === msg.id ? 'Stop listening' : 'Listen to answer'}
                    >
                      {speakingMsgId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Main answer text */}
                <p className={`whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed ${isUser ? 'text-white' : 'text-slate-800 font-normal'}`}>
                  {msg.text}
                </p>

                {/* Grounded Evidence Citations */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      <Database className="w-3 h-3" />
                      <span>Verified Meteorological Observations Used:</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {msg.evidence.map((ev, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable Recommendations */}
                {msg.actionable_recommendations && msg.actionable_recommendations.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      Recommended Action Steps:
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-700">
                      {msg.actionable_recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-normal">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer: Citations, Timestamp & "Why" Modal trigger */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      {msg.source && <span className="truncate max-w-[180px]">{msg.source}</span>}
                      {msg.verified_at && (
                        <span>• {formatTime(msg.verified_at)}</span>
                      )}
                    </div>

                    {msg.why_explanation && (
                      <button
                        onClick={() => setActiveWhyModal(msg)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Why am I seeing this?</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs text-slate-600">
                Thinking about that…
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Natural Language Input Bar with Voice Button */}
      <div className="pt-3 border-t border-slate-800 flex-shrink-0">
        <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className={`voice-dot ${isListening ? 'is-listening' : ''}`} />
            <span>{isListening ? `Listening in ${LANGUAGES.find(l => l.code === selectedLanguage)?.nativeLabel}…` : voiceMode ? 'Voice-to-voice enabled • speak and WeatherGPT replies aloud' : 'Text mode • microphone fills the text box'}</span>
          </div>
          <button type="button" onClick={() => setAutoSpeak(v => !v)} className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300">
            {autoSpeak ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            Auto voice {autoSpeak ? 'ON' : 'OFF'}
          </button>
        </div>
        {voiceError && <div className="mb-2 text-[10px] text-amber-300">{voiceError}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Ask in natural language (e.g. "Should I take my bike to college tomorrow at 8 AM?")...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs transition-all"
            />

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={!isSupported}
              className={`absolute right-3 p-1.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white shadow-sm animate-pulse'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
              }`}
              title={isListening ? 'Stop listening' : 'Ask by voice'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white shadow-xs transition-all flex-shrink-0 cursor-pointer"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 5. "Why am I seeing this?" Grounding Modal */}
      {activeWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Scientific Reasoning & Atmospheric Factors
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    WeatherGPT Explainable Decision Model
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveWhyModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <p className="font-semibold text-blue-900 mb-1">Reasoning Analysis:</p>
                <p>{activeWhyModal.why_explanation}</p>
              </div>

              {activeWhyModal.evidence && (
                <div>
                  <p className="font-bold text-slate-800 mb-1.5 uppercase text-[10px] tracking-wider">
                    Verified Weather Telemetry Inputs:
                  </p>
                  <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px]">
                    {activeWhyModal.evidence.map((ev, i) => (
                      <li key={i} className="text-slate-600">• {ev}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p>
                  WeatherGPT adheres to official disaster management guidelines (IMD, NDMA, SDMA). Recommendations are deterministic decision-support suggestions grounded strictly in verified observations.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveWhyModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Close Reasoning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherGPTChat;
