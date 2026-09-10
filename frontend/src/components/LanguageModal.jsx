import React, { useState } from 'react';
import { Search, Globe, Check } from 'lucide-react';

const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'North/Central India' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'West Bengal & Tripura' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra Pradesh & Telangana' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'Assam' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', region: 'Bihar' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand & West Bengal' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشر / कॉशुर', region: 'Jammu & Kashmir' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'Sikkim & West Bengal' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', region: 'Goa' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', region: 'Jammu & Kashmir' },
  { code: 'brx', name: 'Bodo', native: 'बोडो', region: 'Assam' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন', region: 'Manipur' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'Pan-India' },
  { code: 'en', name: 'English / Hinglish', native: 'English', region: 'Universal' },
];

export default function LanguageModal({ isOpen, onClose, onSelectLanguage, detectedRegion = "West Bengal" }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCode, setSelectedCode] = useState(() => {
    const saved = localStorage.getItem('bhoomi_mitra_lang_code');
    return saved || (detectedRegion === "West Bengal" ? 'bn' : 'hi');
  });

  if (!isOpen) return null;

  const filteredLanguages = INDIAN_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (lang) => {
    setSelectedCode(lang.code);
    onSelectLanguage(lang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111E36] border border-blue-900/60 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden animate-slide-up-fade">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0B132B]">
          <div className="flex items-center space-x-3">
            <Globe className="w-7 h-7 text-emerald-400 animate-pulse" />
            <div>
              <h2 className="text-xl font-bold font-display">Apni Bhasha Chunein / अपनी भाषा चुनें</h2>
              <p className="text-xs text-slate-400 mt-1">
                Detected Region: <span className="text-emerald-400 font-semibold">{detectedRegion}</span> (Auto-suggested native languages below)
              </p>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative mt-5">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Indian Language (e.g. Marathi, Tamil, Bangla, हिन्दी)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 min-h-[48px]"
            />
          </div>
        </div>

        {/* Language Grid List */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredLanguages.map((lang) => {
            const isSelected = selectedCode === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition text-left min-h-[48px] ${
                  isSelected 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                    : 'bg-[#1E293B]/60 border-slate-800 hover:border-slate-600 hover:bg-[#1E293B]'
                }`}
              >
                <div>
                  <div className="font-bold text-base">{lang.native}</div>
                  <div className="text-xs text-slate-400">{lang.name}</div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-emerald-400" />}
              </button>
            );
          })}
          {filteredLanguages.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              No languages found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
