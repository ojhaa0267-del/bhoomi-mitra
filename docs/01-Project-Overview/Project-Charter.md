---
title: "Project Charter: Bhoomi Mitra / Pratyaksh AI"
tags:
  - bhoomi-mitra
  - overview
  - charter
date: 2026-09-07
---

# 📋 Project Charter: Bhoomi Mitra (Pratyaksh AI)

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Executive Summary
**Bhoomi Mitra** (also known as **Pratyaksh AI**) is an AI-powered Citizen Land Portal engineered to democratize access to complex land records, land registry statuses, GIS boundary overlays, and legal dispute analytics across India.

By bridging data silos between **DILRMP** (Digital India Land Records Modernization Programme), **Bhoomi Rashi**, **e-Courts**, and **Forest/Infrastructure Spatial GIS buffers**, Bhoomi Mitra converts intimidating legal land procedures into an accessible, intuitive, and reassuring citizen experience.

---

## 2. Core Problem Statements
1. **Opaque Land Records & Fraud Risk**: Common citizens, farmers, and urban buyers struggle to verify if a parcel has active court disputes or overlaps with national highway/forest conservation buffers.
2. **Unpredictable Bureaucratic Delays**: SRO (Sub-Registrar Office) procedures (verification, NOCs, sale deed registration, mutation / *Dakhil-Kharij*) suffer from zero transparency and unpredictable timelines.
3. **Digital Divide & Linguistic Exclusion**: Standard government portals are text-heavy, desktop-centric, and utilize dense legal English/bureaucratic terminology that alienates non-English speakers and rural populations.

---

## 3. Key Value Propositions
- **Bhu-Aadhar (ULPIN) Instant Verification**: 14-digit Unique Land Parcel Identification Number lookup with ownership, soil type, and circle rate price gaps.
- **Explainable AI (XAI) Trust Score**: Transparent safety score backed by SHAP-weighted positive/negative risk contributors.
- **Dynamic SRO Delay Predictor**: Machine learning model forecasting days required for each administrative mutation step.
- **Spatial Red-Alert GIS Mapping**: Leaflet-based interactive parcel viewer with real-time buffer warnings for forest or infrastructure encroachments.
- **Multilingual Hinglish Voice Assistant**: Warm, conversational voice agent simplifying legal terms (*"Dakhil-Kharij"*, *"Litigation"*, *"Circle Rate"*) with zero typing friction.

---

## 4. Key Personas
- **The Rural Farmer / Seller**: Needs to check mutation status and verify soil health without traveling repeatedly to Tehsil/SRO offices.
- **The Urban Land Buyer**: Needs to perform due diligence before purchasing a plot to avoid litigation traps and highway acquisition zones.
- **The Land Revenue Officer**: Seeks automated flags for disputed boundaries and queue load tracking across SRO zones.

---

## 5. Related Notes
- [[System-Architecture|System Architecture & Tech Stack]]
- [[Citizen-UX-Guidelines|Citizen UX Guidelines for Accessibility]]
- [[API-Contracts|API Endpoint Specifications]]
