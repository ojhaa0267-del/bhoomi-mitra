---
title: "Citizen UX Guidelines: Accessibility & Rural Demographics"
tags:
  - bhoomi-mitra
  - ux
  - accessibility
  - citizen-centric
  - hinglish
date: 2026-09-07
---

# 🌾 Citizen UX Guidelines: Accessibility & Rural Demographics

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Context & Demographics
Unlike enterprise SaaS apps built for tech-savvy office workers, **Bhoomi Mitra** must cater to:
- Smallholder farmers with basic Android smartphones.
- Rural property inheritors checking family land records.
- First-time land buyers fearful of legal dispute fraud.
- Elder citizens who prefer voice listening over dense document reading.

---

## 2. Core Heuristics & Interface Rules

### Rule 1: Legal Jargon Translation Dictionary
Never output raw legal or administrative terms without providing plain conversational synonyms immediately alongside:

| Bureaucratic Term | Citizen-Friendly Hinglish | Plain English Meaning |
| :--- | :--- | :--- |
| **Dakhil-Kharij** | *Namantaran / Sarkari Record mein Naam Badlaav* | Land Mutation / Title Transfer |
| **Khasra / Khatian** | *Plot Number aur Record File* | Land Survey Plot Number |
| **Litigation** | *Court ka Vivaad / Case* | Active Judicial Lawsuit |
| **Circle Rate** | *Sarkari Tay Shuda Rate* | Government Minimum Valuation |
| **NOC** | *Sarkari Manzoori Patra* | No-Objection Certificate |
| **Encroachment** | *Ghair-Kanooni Kabza ya Buffer Chhetra* | Unauthorized Occupation / Buffer Overlap |

---

### Rule 2: Audio & Voice As A First-Class Citizen
- Every critical metric card (Trust Score, SRO Delay, Dispute Warning) must feature a small **"Listen" (Speaker 🔊)** button.
- Clicking the speaker button triggers a Text-to-Speech (TTS) audio summary in warm Hinglish (*e.g., "Is zameen par koi court case nahi hai, trust score 82% hai."*).

---

### Rule 3: High-Contrast Visual Affordance
- Avoid subtle gray-on-gray UI patterns.
- High-risk warnings must use high-contrast crimson banners with clear warning icons (`⚠️`).
- Touch targets on mobile screens must be a minimum of **48px x 48px** to ensure easy tapping on entry-level touchscreens.

---

### Rule 4: One-Click Quick Verification (Zero Form Fatigue)
- Instead of forcing the user through 10-field dropdowns (State $\rightarrow$ District $\rightarrow$ Tehsil $\rightarrow$ Village $\rightarrow$ Khasra), provide a **Single 14-Digit Bhu-Aadhar Search Bar** with sample plot chips for instant one-click testing.

---

## 3. Related Notes
- [[Design-Tokens-and-Theme|Color Palette & Theme Tokens]]
- [[Component-VoiceChatBot|Voice ChatBot Widget Specs]]
- [[Voice-Agent-Prompts|Hinglish LLM Prompt Guidelines]]
