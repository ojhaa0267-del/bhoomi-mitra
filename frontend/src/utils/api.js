/**
 * api.js – Authenticated Bhoomi Mitra API Client
 *
 * All backend calls go through this module.
 * The Bearer token is read from AuthContext so it works with both
 * real Firebase JWTs and the demo token.
 */
import { API_BASE_URL } from '../config';

// ── Core Fetch Wrapper ────────────────────────────────────────────────────
async function apiFetch(path, token, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }

  return res.json();
}

// ── API Methods ───────────────────────────────────────────────────────────

/** Search a parcel by 14-digit Bhu-Aadhar ID */
export async function searchParcel(landCode, token) {
  return apiFetch(`/api/v1/search?land_code=${landCode}`, token);
}

/** Predict SRO administrative delay */
export async function predictDelay(landCode, token) {
  return apiFetch(`/api/v1/predict-delay?land_code=${landCode}`, token);
}

/** AI Risk Assessment & Explainable Trust Score */
export async function getRiskAssessment(landCode, token) {
  return apiFetch(`/api/v1/risk-assessment?land_code=${landCode}`, token);
}

/** Spatial distance between two parcels */
export async function computeDistance(originCode, destCode, token) {
  return apiFetch('/api/v1/distance', token, {
    method: 'POST',
    body: JSON.stringify({
      origin_land_code: originCode,
      destination_land_code: destCode,
    }),
  });
}

/** Chat with Bhoomi Mitra AI voice agent */
export async function chatWithAgent(query, landCode, token) {
  return apiFetch('/api/v1/chat', token, {
    method: 'POST',
    body: JSON.stringify({ query, land_code: landCode }),
  });
}

/**
 * Convenience: Load all three data endpoints in parallel for a given parcel.
 * Returns { parcel, delay, risk } or throws the first error.
 */
export async function loadParcelData(landCode, token) {
  const [parcel, delay, risk] = await Promise.all([
    searchParcel(landCode, token),
    predictDelay(landCode, token),
    getRiskAssessment(landCode, token),
  ]);
  return { parcel, delay, risk };
}
