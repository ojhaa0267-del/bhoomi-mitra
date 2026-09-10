---
title: "Execution Roadmap: Phase 3 - Voice LLM Agent & Hackathon Polish"
tags:
  - bhoomi-mitra
  - roadmap
  - phase3
  - voice-agent
  - demo
date: 2026-09-07
---

# 🚀 Execution Roadmap: Phase 3 — Voice LLM Agent & Hackathon Polish

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Phase Objective
Deliver the final layer of user delight and accessibility:
- Multilingual Hinglish Voice Assistant with speech-to-text and text-to-speech.
- LLM prompt engineering with frontend function calling (`[MAP_ACTION]`, `[CALCULATE_ACTION]`).
- Pre-populated realistic demonstration datasets for pitch day.
- End-to-end user walkthrough recording and presentation collateral.

---

## 2. Work Breakdown Structure (WBS)

### Voice & LLM Tasks
- [ ] Implement `backend/app/services/chatbot_llm.py` configuring the Bhoomi Mitra prompt and Groq / Ollama / OpenAI API adapter.
- [ ] Implement `backend/app/routes/chat.py` handling conversational query endpoints.
- [ ] Implement `frontend/src/components/ChatBot.jsx` with Web Speech recognition, floating glowing mic FAB, and action tag parser.
- [ ] Connect `[MAP_ACTION]` callback from `ChatBot.jsx` directly to `LandMap.jsx`'s `MapController`.

### Demo Scenarios & Polish
- [ ] Pre-populate 3 distinct demonstration plots:
  1. **Plot A (Safe / Verified)**: Clear title, 0 disputes, 92% Trust Score, green polygon.
  2. **Plot B (Highway Caution)**: 15% overlap with NH widening zone, 74% Trust Score, amber polygon.
  3. **Plot C (Disputed / High Risk)**: Active Sub-Divisional Court stay order, 38% Trust Score, crimson pulsing polygon.
- [ ] Add one-click "Demo Presets" chips on the Dashboard for instant judging walkthrough.

---

## 3. Verification Criteria
1. Speaking into microphone: *"Bhaiya, plot code 14029857364102 ka map dikhaiye"* receives an audible Hinglish audio response and triggers an automatic map flyTo transition.
2. Demo presets load instantly with zero latency.
3. Portal demonstrates complete responsiveness across desktop and mobile screens.

---

## 4. Related Notes
- [[Voice-Agent-Prompts|Voice Agent Prompt Blueprint]]
- [[Component-VoiceChatBot|Voice ChatBot Component Specs]]
- [[Citizen-UX-Guidelines|Citizen UX Accessibility Guidelines]]
