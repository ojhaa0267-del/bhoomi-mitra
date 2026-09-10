"""
Bhoomi Mitra – SRO Administrative Delay Prediction Model Training
ml_engine/train_delay_model.py

Trains a Random Forest Regressor on synthetic SRO telemetry data
and serialises the model to delay_predictor_model.pkl.

Run from the project root:
    python ml_engine/train_delay_model.py
"""
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib


# ── Synthetic Dataset Generation ────────────────────────────────────────────
def generate_sro_telemetry(n_samples: int = 10_000, seed: int = 42) -> pd.DataFrame:
    """
    Generates representative synthetic SRO processing records.
    Features are calibrated to reflect real patterns observed in DILRMP datasets.
    """
    rng = np.random.default_rng(seed)

    sro_load    = rng.integers(50, 600, n_samples)          # Active queue depth
    dispute     = rng.binomial(1, 0.18, n_samples)          # 18% parcels have disputes
    price_gap   = rng.uniform(0.85, 2.8, n_samples)         # Market/Circle rate ratio
    area        = rng.uniform(0.3, 25.0, n_samples)         # Acres
    month       = rng.integers(1, 13, n_samples)            # Calendar month

    # Synthetic delay formula (working days)
    # Base  = 7 days
    # Load  → adds 0–12 days (higher queue → longer wait)
    # Dispute → adds 8–12 days per active case
    # Price gap > 1.2 → possible fraud scrutiny → adds days
    # March, September → fiscal push months → slightly faster processing
    fiscal_push = np.where(np.isin(month, [3, 9]), -1.5, 0.0)

    total_days = (
        7.0
        + (sro_load / 60.0)
        + (dispute * rng.uniform(7.0, 12.0, n_samples))
        + np.maximum(0, (price_gap - 1.2) * 5.0)
        + (area / 20.0)              # Larger plots take slightly longer to inspect
        + fiscal_push
        + rng.normal(0, 1.5, n_samples)
    )
    total_days = np.clip(np.round(total_days), 3, 60).astype(int)

    return pd.DataFrame({
        'sro_load':    sro_load,
        'dispute':     dispute,
        'price_gap':   price_gap,
        'area':        area,
        'month':       month,
        'total_days':  total_days,
    })


# ── Training Pipeline ────────────────────────────────────────────────────────
def train():
    print("🌾 Bhoomi Mitra – Delay Prediction Model Training")
    print("=" * 55)

    df = generate_sro_telemetry()
    print(f"Dataset: {len(df):,} samples | Target range: {df.total_days.min()}–{df.total_days.max()} days")
    print(f"Mean delay: {df.total_days.mean():.1f} days | Dispute rate: {df.dispute.mean():.1%}")

    feature_cols = ['sro_load', 'dispute', 'price_gap', 'area', 'month']
    X = df[feature_cols].values
    y = df['total_days'].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=4,
        n_jobs=-1,
        random_state=42,
    )
    print("\nTraining Random Forest (200 trees)...")
    model.fit(X_train, y_train)

    # Evaluation
    preds = model.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    r2    = r2_score(y_test, preds)
    print(f"Test MAE: {mae:.2f} days | R²: {r2:.4f}")

    # Feature importances
    print("\nFeature Importances:")
    for col, imp in sorted(zip(feature_cols, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {col:<12}: {imp:.3f} ({imp*100:.1f}%)")

    # Save
    out_path = os.path.join(os.path.dirname(__file__), "delay_predictor_model.pkl")
    joblib.dump(model, out_path)
    print(f"\n✅ Model saved → {out_path}")


if __name__ == "__main__":
    train()
