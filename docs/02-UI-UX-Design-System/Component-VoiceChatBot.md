---
title: "Component Spec: Multilingual Voice ChatBot & Floating Mic UI"
tags:
  - bhoomi-mitra
  - ui-ux
  - voice-agent
  - audio
  - components
date: 2026-09-07
---

# 🎙️ Component Spec: ChatBot.jsx (Multilingual Voice Agent)

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Component Role & Citizen Experience
The Voice Agent Widget bridges the accessibility gap for citizens who prefer speaking in **Hinglish** (or Hindi) rather than navigating complex multi-step forms. 
It supports:
1. **Always-Accessible Floating Action Button (FAB)**: Located at the bottom right with a neon pulse glow (`shadow-[0_0_15px_rgba(59,130,246,0.5)]`).
2. **Real-Time Voice Dictation & Audio Waveform**: Uses the browser's Web Speech API (`webkitSpeechRecognition`) with audio visualizer feedback.
3. **Conversational Hinglish Streaming Output**: Returns friendly, plain-spoken guidance.
4. **Action Tag Interceptor (Function Calling)**: Listens for `[MAP_ACTION: {...}]` or `[CALCULATE_ACTION: {...}]` tags in the AI response and triggers frontend map pan/zoom or comparison actions automatically.

---

## 2. Widget States & UI Flow
- **Collapsed State**: Glowing floating microphone button with tooltips (*"Bhoomi Mitra se Baat Karein"*).
- **Expanded State**: Slide-up glassmorphic chat modal with message history, active mic button, quick suggestion chips (*"Mera plot safe hai?", "Mutation mein kitna time lagega?"*).
- **Listening State**: Animated pulsing concentric circles (sonar wave) indicating active microphone capture.
- **Thinking State**: Typing indicator with subtle gradient shift.

---

## 3. Reference Implementation Architecture

```javascript
import React, { useState, useEffect, useRef } from 'react';

export default function ChatBot({ onMapAction, activePlotCode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! Main aapka Bhoomi Mitra AI hoon. Aapki zameen ki query check karne mein madad karun?' }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (userText) => {
    const textToSend = userText || inputQuery;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInputQuery('');

    try {
      // Post to backend chatbot LLM route
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, land_code: activePlotCode })
      });
      const data = await response.json();
      
      // Parse bot response & check for MAP_ACTION tags
      let botReply = data.response_text;
      const mapMatch = botReply.match(/\[MAP_ACTION:\s*({.*?})\]/);
      if (mapMatch) {
        const actionParams = JSON.parse(mapMatch[1]);
        if (onMapAction) onMapAction(actionParams);
        // Clean tag from message displayed to user
        botReply = botReply.replace(/\[MAP_ACTION:\s*{.*?}\]/, '');
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Kshama karein, connect karne mein error aaya. Kripya punah prayas karein.' }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Microphone Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-accent-blue text-white flex items-center justify-center shadow-glow-blue hover:scale-105 transition-all duration-300 relative group"
        >
          <span className="text-2xl">🎙️</span>
          <span className="absolute -top-10 right-0 bg-background-card border border-blue-900 text-xs px-3 py-1 rounded-full text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-lg">
            Talk to Bhoomi Mitra
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-background-card border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-background-subtle p-4 border-b border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-bold text-white text-sm">Bhoomi Mitra AI</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
          </div>

          {/* Transcript History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.sender === 'user' ? 'bg-accent-blue text-white' : 'bg-background-subtle text-gray-200 border border-blue-900/30'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-background-subtle border-t border-blue-900/30 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Poochiye (e.g. Is plot ka status?)..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-background-deep text-white text-xs p-2.5 rounded-xl border border-blue-900 focus:outline-none focus:border-accent-blue"
            />
            <button
              onClick={() => handleSend()}
              className="bg-accent-blue hover:bg-blue-600 text-white p-2.5 rounded-xl text-xs font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Related Notes
- [[Voice-Agent-Prompts|Voice Agent LLM Prompts & Action Tags]]
- [[Citizen-UX-Guidelines|Citizen Accessibility & Hinglish UX]]
- [[Component-LandMap|LandMap Controller Function Calling]]
