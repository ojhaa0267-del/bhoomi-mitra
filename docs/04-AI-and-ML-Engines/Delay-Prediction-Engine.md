---
title: "AI Engine: Random Forest Administrative Delay Predictor"
tags:
  - bhoomi-mitra
  - ml
  - scikit-learn
  - random-forest
  - sro-delays
date: 2026-09-07
---

# ⏱️ AI Engine: Random Forest Administrative Delay Predictor

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Problem Framing & Objectives
In conventional government workflows, citizens submit mutation or registry applications into a complete black hole. Delays vary widely depending on:
- SRO zone workload congestion.
- Number of active legal cases in the Tehsil.
- Seasonality (e.g., fiscal year-end March rushes vs monsoon lull).
- Discrepancy between declared price and circle rate.

The **Delay Prediction Engine** frames this as a regression/multi-target classification problem to predict the turnaround duration for each stage.

---

## 2. Feature Engineering & Dataset Variables

| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `sro_zone_id` | Categorical | Unique ID of Sub-Registrar Office |
| `pending_queue_count` | Integer | Number of active applications currently queued |
| `dispute_flag` | Binary (0/1) | Whether parcel has historical litigation |
| `price_gap_ratio` | Float | Ratio of `asking_price / circle_rate` |
| `month_of_year` | Integer (1-12)| Captures fiscal year spikes (March/September) |
| `land_area_acres` | Float | Larger tracts require deeper physical inspection |

---

## 3. Training Script Blueprint (`ml_engine/train_delay_model.py`)

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

def generate_synthetic_telemetry(n_samples=5000):
    np.random.seed(42)
    sro_load = np.random.randint(50, 600, n_samples)
    dispute = np.random.binomial(1, 0.2, n_samples)
    price_gap = np.random.uniform(0.8, 2.5, n_samples)
    area = np.random.uniform(0.5, 20.0, n_samples)
    month = np.random.randint(1, 13, n_samples)

    # Base turnaround = 7 days
    # Delays scale with queue load, disputes (+8 days), and price discrepancy
    total_days = (
        6 + 
        (sro_load / 50.0) + 
        (dispute * 8.5) + 
        (np.maximum(0, price_gap - 1.2) * 5.0) + 
        np.random.normal(0, 1.5, n_samples)
    )
    total_days = np.clip(np.round(total_days), 3, 60)

    df = pd.DataFrame({
        'sro_load': sro_load,
        'dispute': dispute,
        'price_gap': price_gap,
        'area': area,
        'month': month,
        'total_delay_days': total_days
    })
    return df

def train():
    df = generate_synthetic_telemetry()
    X = df[['sro_load', 'dispute', 'price_gap', 'area', 'month']]
    y = df['total_delay_days']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"Delay Model Trained Successfully! Test MAE: {mae:.2f} days")

    # Persist model
    joblib.dump(model, "ml_engine/delay_predictor_model.pkl")

if __name__ == "__main__":
    train()
```

---

## 4. Milestone Duration Allocator
When the model forecasts total days, the backend breaks it into the 4 standard milestones:
- Documents Verification: $\sim 20\%$ of total days.
- NOC Approvals: $\sim 25\%$ of total days.
- Sale Deed Registration: $\sim 25\%$ of total days.
- Land Mutation (*Dakhil-Kharij*): $\sim 30\%$ of total days.

---

## 5. Related Notes
- [[Component-TimelineBar|TimelineBar Frontend Component]]
- [[API-Contracts|API Endpoint for /api/v1/predict-delay]]
