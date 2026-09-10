/**
 * RTIModal.jsx – RTI Application Viewer & Downloader
 *
 * Features:
 *  - Slide-in modal overlay triggered by DOC_ACTION from voice agent
 *  - Pre-filled RTI draft rendered in a styled document preview
 *  - Copy to clipboard button (with success flash)
 *  - Download as .txt file
 *  - Collects applicant name & address with inline form if missing
 */
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function RTIModal({ landCode, isOpen, onClose }) {
  const { token } = useAuth();
  const [step,          setStep]          = useState('form'); // 'form' | 'loading' | 'result'
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddr, setApplicantAddr] = useState('');
  const [rtiDoc,        setRtiDoc]        = useState(null);
  const [copied,        setCopied]        = useState(false);
  const textRef = useRef(null);

  if (!isOpen) return null;

  const reset = () => { setStep('form'); setRtiDoc(null); };
  const handleClose = () => { reset(); onClose(); };

  // ── Generate RTI ─────────────────────────────────────────────────────────
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantAddr.trim()) return;
    setStep('loading');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/documents/rti-draft`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          land_code:         landCode,
          applicant_name:    applicantName,
          applicant_address: applicantAddr,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRtiDoc(data);
      setStep('result');
    } catch {
      setStep('form');
      alert('RTI draft generate karne mein error aaya. Kripya dobara try karein.');
    }
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(rtiDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ── Download as .txt ─────────────────────────────────────────────────────
  const handleDownload = () => {
    const blob = new Blob([rtiDoc.content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `RTI_Application_${landCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[2010] flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full max-w-2xl bg-background-card border border-blue-900/40 rounded-2xl shadow-2xl shadow-black/70 flex flex-col overflow-hidden animate-slide-up max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-background-subtle border-b border-blue-900/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">📜</span>
              <div>
                <h2 className="font-bold text-white text-base leading-none">RTI Application Generator</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Right to Information Act, 2005</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-deep">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* STEP 1: Form */}
            {step === 'form' && (
              <form onSubmit={handleGenerate} className="p-6 space-y-5">
                <div className="flex items-start gap-3 p-4 bg-accent-blue/8 border border-accent-blue/20 rounded-xl">
                  <span className="text-base mt-0.5">ℹ️</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Aapke liye ek RTI application draft tayar ki jayegi jo aap Sub-Registrar Office mein submit kar sakte hain, 
                    plot <span className="font-mono font-bold text-accent-blue">{landCode}</span> ke baare mein jankari mangne ke liye.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Full Name (Aapka Pura Naam) *
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className="bm-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Full Address (Pata) *
                  </label>
                  <textarea
                    value={applicantAddr}
                    onChange={e => setApplicantAddr(e.target.value)}
                    placeholder="e.g. 142, Sector 12, Rohini, New Delhi – 110085"
                    className="bm-input resize-none h-20"
                    required
                  />
                </div>

                <button type="submit" className="bm-btn-primary w-full flex items-center justify-center gap-2">
                  📄 Generate RTI Application
                </button>
              </form>
            )}

            {/* STEP 2: Loading */}
            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">RTI draft tayar ho raha hai...</p>
              </div>
            )}

            {/* STEP 3: Result */}
            {step === 'result' && rtiDoc && (
              <div className="p-6 space-y-4">
                {/* Stats row */}
                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400">
                  <span>📅 {rtiDoc.generated_on}</span>
                  <span>📝 {rtiDoc.word_count} words</span>
                  <span>🌐 {rtiDoc.language}</span>
                  <span className="text-emerald-400 font-semibold">✅ Ready to submit</span>
                </div>

                {/* Instructions banner */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
                  <strong>📌 Instructions:</strong> {rtiDoc.instructions}
                </div>

                {/* Document preview */}
                <div className="relative">
                  <pre
                    ref={textRef}
                    className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-background-subtle border border-blue-900/30 rounded-xl p-5 max-h-64 overflow-y-auto"
                  >
                    {rtiDoc.content}
                  </pre>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      copied
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-background-subtle border-blue-900/40 text-white hover:border-accent-blue/50'
                    }`}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 bm-btn-primary flex items-center justify-center gap-2"
                  >
                    ⬇️ Download .txt
                  </button>
                </div>

                <button onClick={reset} className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-2">
                  ← Generate another RTI application
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
