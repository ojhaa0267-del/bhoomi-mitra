/**
 * ParcelInfoCard.jsx – Land Parcel Owner & Soil Details Card
 *
 * Displays:
 *  - Owner name, email, mobile
 *  - Land area, type, soil type, soil pH, crop suitability
 *  - Survey status with coloured badge
 *  - Market price vs circle rate with gap percentage indicator
 */
import React from 'react';

function Stat({ label, value, accent = false }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
      <p className={`text-sm font-semibold ${accent ? 'text-accent-blue' : 'text-slate-100'}`}>{value}</p>
    </div>
  );
}

function PriceBar({ askingPrice, circleRate, gapPct }) {
  const isOverValued = gapPct > 0;
  const barPct = Math.min(Math.abs(gapPct), 50); // cap visual at 50%
  return (
    <div className="p-3.5 rounded-xl bg-background-subtle border border-blue-900/30 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Price Gap Analysis</span>
        <span className={`font-bold ${gapPct > 30 ? 'text-red-400' : gapPct > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {gapPct > 0 ? '+' : ''}{gapPct.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${gapPct > 30 ? 'bg-red-500' : gapPct > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${barPct * 2}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
        <div>
          <p className="text-slate-500">Asking Price</p>
          <p className="text-white font-semibold">₹{(askingPrice / 100000).toFixed(1)}L</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500">Circle Rate</p>
          <p className="text-white font-semibold">₹{(circleRate / 100000).toFixed(1)}L</p>
        </div>
      </div>
    </div>
  );
}

export default function ParcelInfoCard({ parcel = null }) {
  if (!parcel) {
    return (
      <div className="bm-card p-6 flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center space-y-2">
          <p className="text-3xl">📋</p>
          <p className="text-slate-400 text-sm">Parcel Details</p>
          <p className="text-xs text-slate-600">Search a Bhu-Aadhar ID to load details</p>
        </div>
      </div>
    );
  }

  const { owner_details, land_profile, market_details, bhu_aadhar_id, coordinates } = parcel;
  const surveyDone = land_profile?.survey_status?.toLowerCase().includes('completed');

  return (
    <div className="bm-card p-6 space-y-5 animate-slide-up">
      {/* Owner header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-xl flex-shrink-0">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-white truncate">
            {owner_details?.name ?? '—'}
          </h3>
          <p className="text-xs text-slate-400 truncate">{owner_details?.email ?? ''}</p>
          {owner_details?.mobile && (
            <p className="text-xs text-slate-500 mt-0.5">{owner_details.mobile}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            surveyDone
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            {surveyDone ? '✓ Survey Done' : '⚠ Survey Pending'}
          </span>
        </div>
      </div>

      {/* Bhu-Aadhar ID */}
      <div className="flex items-center gap-2 bg-background-subtle rounded-xl px-4 py-2.5 border border-blue-900/30">
        <span className="text-accent-blue text-sm">🔷</span>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Bhu-Aadhar ID (ULPIN)</p>
          <p className="text-sm font-mono font-bold text-white tracking-widest">{bhu_aadhar_id}</p>
        </div>
      </div>

      {/* Land details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
        <Stat label="Area" value={`${land_profile?.area_acres ?? '—'} acres`} />
        <Stat label="Land Type" value={land_profile?.land_type ?? '—'} />
        <Stat label="Soil Type" value={land_profile?.soil_health?.soil_type ?? '—'} />
        <Stat label="Soil pH" value={land_profile?.soil_health?.soil_ph ?? '—'} />
      </div>

      {/* Crop suitability */}
      {land_profile?.soil_health?.suitability_crops?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">
            Suitable Crops
          </p>
          <div className="flex flex-wrap gap-1.5">
            {land_profile.soil_health.suitability_crops.map((crop, i) => (
              <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                🌾 {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Price analysis */}
      {market_details && (
        <PriceBar
          askingPrice={market_details.seller_asking_price_inr}
          circleRate={market_details.local_government_circle_rate_inr}
          gapPct={market_details.price_gap_percentage}
        />
      )}
    </div>
  );
}
