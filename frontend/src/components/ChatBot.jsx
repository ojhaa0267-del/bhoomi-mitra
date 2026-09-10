/**
 * ChatBot.jsx – Bhoomi Mitra Multilingual Voice Agent Widget
 *
 * Features:
 *  - Floating Action Button (FAB) with sonar glow pulse – always visible
 *  - Slide-up glassmorphic chat panel (400px wide, 520px tall)
 *  - Web Speech API – `webkitSpeechRecognition` for voice-to-text (STT)
 *  - Browser SpeechSynthesis API for text-to-speech (TTS) playback
 *  - [MAP_ACTION] / [CALCULATE_ACTION] / [DOC_ACTION] tag interceptor
 *    → fires `onMapAction`, `onDocAction` callbacks to parent Dashboard
 *  - Quick-reply Hinglish suggestion chips
 *  - Typing indicator (animated dots)
 *  - Auto-scroll to latest message
 *  - Audio waveform bars during listening state
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatWithAgent } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

// ── Quick suggestion chips ────────────────────────────────────────────────
const SUGGESTIONS = [
  'Is plot ka status kya hai?',
  'Mutation mein kitna time lagega?',
  'Koi court case toh nahi hai?',
  'Map mein dikhao',
  'RTI draft banao',
];

// ── Tiered Voice Helper (ElevenLabs -> Backend TTS -> Browser TTS) ──────────────
let currentAudio = null;

async function speak(text, lang = 'hi-IN') {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // 1. TIER ONE: Try ElevenLabs First
  const ELEVENLABS_KEY = 'f41366d671cb8e25ea2999eb82507e5484e689dd7ad1cc76afca9b38cd806681';
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

  try {
    const elResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?optimize_streaming_latency=3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    });

    if (elResponse.ok) {
      const audioBlob = await elResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      currentAudio.play();
      return; // Success! No need to fallback.
    } else {
      console.warn('ElevenLabs API rejected or out of credits. Falling back...');
    }
  } catch (err) {
    console.warn('ElevenLabs network error. Falling back...', err);
  }

  // 2. TIER TWO: Try Backend TTS (Edge-TTS / Google fallback)
  try {
    const backendResponse = await fetch(`${API_BASE_URL}/api/tts/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        voice: lang.startsWith('bn') ? 'bn-IN-TanishaaNeural' : 
               lang.startsWith('ta') ? 'ta-IN-PallaviNeural' : 
               lang.startsWith('mr') ? 'mr-IN-AarohiNeural' : 
               lang.startsWith('te') ? 'te-IN-ShrutiNeural' : 
               'hi-IN-SwaraNeural' 
      }),
    });

    if (backendResponse.ok) {
      const audioBlob = await backendResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      currentAudio.play();
      return; // Success! No need to fallback to browser.
    } else {
      console.warn('Backend TTS failed. Ensure backend is running.');
    }
  } catch (err) {
    console.warn('Backend TTS error. Falling back to browser voice...', err);
  }

  // 3. TIER THREE: Fallback to Browser Voice (Robotic)
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const premiumVoice =
    voices.find(v => v.name.includes('Google') && v.lang.startsWith(lang.split('-')[0])) ||
    voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
    voices.find(v => v.lang === 'en-IN');
  if (premiumVoice) utter.voice = premiumVoice;
  window.speechSynthesis.speak(utter);
}

// ── Action tag parser ─────────────────────────────────────────────────────
function parseActionTags(text, onMapAction, onDocAction) {
  let clean = text;

  // MAP_ACTION
  const mapMatch = clean.match(/\[MAP_ACTION:\s*(\{.*?\})\]/s);
  if (mapMatch) {
    try {
      const params = JSON.parse(mapMatch[1]);
      onMapAction?.(params);
    } catch (_) {}
    clean = clean.replace(/\[MAP_ACTION:\s*\{.*?\}\]/s, '').trim();
  }

  // CALCULATE_ACTION (future use)
  clean = clean.replace(/\[CALCULATE_ACTION:\s*\{.*?\}\]/gs, '').trim();

  // DOC_ACTION
  const docMatch = clean.match(/\[DOC_ACTION:\s*(\{.*?\})\]/s);
  if (docMatch) {
    try {
      const params = JSON.parse(docMatch[1]);
      onDocAction?.(params);
    } catch (_) {}
    clean = clean.replace(/\[DOC_ACTION:\s*\{.*?\}\]/s, '').trim();
  }

  return clean;
}

// ── Waveform bars (listening indicator) ──────────────────────────────────
function WaveformBars() {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[0.6, 1, 0.7, 1, 0.5, 0.9, 0.6].map((h, i) => (
        <div
          key={i}
          className="w-0.5 bg-accent-blue rounded-full"
          style={{
            height: `${h * 100}%`,
            animation: `waveBounce 0.7s ease-in-out ${i * 0.08}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ── Typing dots ───────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5 bg-background-subtle border border-blue-900/30 rounded-2xl rounded-bl-sm w-fit">
      {[0, 0.2, 0.4].map((delay, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400"
          style={{ animation: `typingDot 1.2s ease-in-out ${delay}s infinite` }}
        />
      ))}
    </div>
  );
}

export default function ChatBot({ onMapAction, onDocAction, activePlotCode, userLang = 'hi' }) {
  const { token } = useAuth();
  const [isOpen,      setIsOpen]      = useState(false);
  const [messages,    setMessages]    = useState([
    {
      sender: 'bot',
      text: 'Namaste! 🙏 Main aapka Bhoomi Mitra AI hoon. Aapki zameen ki jankari lene mein madad kar sakta hoon — plot status, court cases, mutation time, ya map dikhana. Kaise madad karun?',
    },
  ]);
  const [inputQuery,  setInputQuery]  = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking,  setIsThinking]  = useState(false);
  const [ttsEnabled,  setTtsEnabled]  = useState(true);

  const chatEndRef    = useRef(null);
  const recogRef      = useRef(null);
  const inputRef      = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText ?? inputQuery).trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const data = await chatWithAgent(text, activePlotCode, token);
      let botReply = data.response_text || '';

      // Parse and fire action tags
      botReply = parseActionTags(botReply, onMapAction, onDocAction);

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      if (ttsEnabled && botReply) speak(botReply, `${userLang}-IN`);
    } catch (err) {
      const errMsg = 'Kshama karein, abhi server se connect nahi ho pa raha. Kripya thodi der baad dobara try karein.';
      setMessages(prev => [...prev, { sender: 'bot', text: errMsg }]);
    } finally {
      setIsThinking(false);
    }
  }, [inputQuery, activePlotCode, token, onMapAction, onDocAction, ttsEnabled]);

  // ── Voice recognition (STT) ─────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Aapka browser voice input support nahi karta. Kripya Chrome ya Edge use karein.');
      return;
    }

    if (isListening) {
      recogRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = `${userLang}-IN`;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart  = () => setIsListening(true);
    recog.onend    = () => setIsListening(false);
    recog.onerror  = () => setIsListening(false);
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputQuery(transcript);
      // Auto-send after voice input
      setTimeout(() => handleSend(transcript), 200);
    };

    recogRef.current = recog;
    recog.start();
  }, [isListening, handleSend]);

  return (
    <>
      {/* ── Keyframe styles (injected inline since no build step yet) ─── */}
      <style>{`
        @keyframes waveBounce {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

        {/* ── Chat Panel ─────────────────────────────────────────────────── */}
        {isOpen && (
          <div
            className="w-[360px] sm:w-[400px] h-[520px] bg-background-card/95 border border-blue-900/50 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden backdrop-blur-xl"
            style={{ animation: 'chatSlideUp 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="bg-background-subtle px-4 py-3 border-b border-blue-900/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-sm">🌾</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background-subtle" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">Bhoomi Mitra AI</h4>
                  <p className="text-[10px] text-emerald-400 leading-none mt-0.5">
                    {isListening ? '🎙️ Listening...' : isThinking ? '💭 Thinking...' : '● Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* TTS toggle */}
                <button
                  onClick={() => { setTtsEnabled(t => !t); window.speechSynthesis?.cancel(); }}
                  title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
                  className={`text-sm px-1.5 py-1 rounded-lg transition-colors ${ttsEnabled ? 'text-accent-blue hover:bg-accent-blue/10' : 'text-slate-600 hover:bg-background-subtle'}`}
                >
                  {ttsEnabled ? '🔊' : '🔇'}
                </button>
                <button
                  onClick={() => { setIsOpen(false); window.speechSynthesis?.cancel(); recogRef.current?.stop(); }}
                  className="text-slate-400 hover:text-white transition-colors text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background-subtle"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick suggestion chips */}
            <div className="flex gap-1.5 px-3 py-2 flex-wrap border-b border-blue-900/20 flex-shrink-0 bg-background-subtle/50">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  disabled={isThinking}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-blue-900/50 text-slate-300 hover:border-accent-blue/60 hover:text-white hover:bg-accent-blue/10 transition-all duration-150 disabled:opacity-40 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                      🌾
                    </div>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl max-w-[82%] text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-accent-blue text-white rounded-br-sm'
                      : 'bg-background-subtle text-slate-200 border border-blue-900/30 rounded-bl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                    🌾
                  </div>
                  <TypingDots />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="px-3 py-3 border-t border-blue-900/30 flex items-center gap-2 bg-background-subtle/60 flex-shrink-0">
              {/* Mic button */}
              <button
                onClick={toggleListening}
                disabled={isThinking}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : 'bg-background-deep border border-blue-900/50 text-slate-400 hover:border-accent-blue/50 hover:text-accent-blue'
                } disabled:opacity-40`}
                title={isListening ? 'Stop listening' : 'Speak in Hindi/Hinglish'}
              >
                {isListening ? <WaveformBars /> : '🎙️'}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isListening ? 'Bol raha hun...' : 'Poochiye kuch bhi...'}
                disabled={isThinking || isListening}
                className="flex-1 bg-background-deep text-white text-xs px-3 py-2.5 rounded-xl border border-blue-900/50 focus:outline-none focus:border-accent-blue/70 placeholder-slate-600 disabled:opacity-60"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputQuery.trim() || isThinking}
                className="w-9 h-9 rounded-xl bg-accent-blue flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Floating Action Button ──────────────────────────────────────── */}
        <div className="relative group">
          {/* Sonar rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-sonar" />
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-sonar" style={{ animationDelay: '0.5s' }} />

          <button
            onClick={() => setIsOpen(o => !o)}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-200 ${
              isOpen ? 'bg-slate-700 border border-slate-600' : 'bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
            }`}
            title="Bhoomi Mitra se Baat Karein"
            aria-label="Open Bhoomi Mitra AI chat"
          >
            <span className="text-xl">
              {isOpen ? '✕' : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </span>
          </button>

          {/* Unread badge when closed and has messages > 1 */}
          {!isOpen && messages.length > 1 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background-deep text-[9px] text-white flex items-center justify-center font-bold">
              {Math.min(messages.length - 1, 9)}
            </span>
          )}

          {/* Hover tooltip */}
          {!isOpen && (
            <div className="absolute bottom-full right-0 mb-2 pointer-events-none">
              <div className="bg-background-card border border-blue-900/50 text-xs text-white px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 transition-all">
                Bhoomi Mitra se Baat Karein 🌾
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
