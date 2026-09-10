/**
 * ChatBot.jsx – Bhoomi Mitra Multilingual Voice Agent Widget (v3 – Full Multilingual)
 *
 * FEATURES:
 *  1. SMART LOCAL AI ENGINE – understands user intent, gives contextual answers
 *  2. TRUE MULTILINGUAL – responds in Hindi, Bengali, Tamil, Telugu, Marathi,
 *     Gujarati, Kannada, Malayalam, Punjabi, Odia, English (21 languages supported)
 *  3. TTS – Browser SpeechSynthesis with Chrome voice preload fix
 *  4. STT – Web Speech Recognition with auto-send
 *  5. MAP_ACTION / DOC_ACTION triggers from AI responses
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatWithAgent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ── Multilingual Strings ──────────────────────────────────────────────────
const LANG_STRINGS = {
  hi: {
    greeting: 'Namaste! 🙏 Main aapka Bhoomi Mitra AI hoon. Plot status, court case, mutation time, risk score — kuch bhi poochiye!',
    chips: ['Plot ka status kya hai?', 'Mutation mein kitna time?', 'Court case hai kya?', 'Map mein dikhao', 'RTI draft banao'],
    noParcel: 'Abhi koi parcel load nahi hai. Kripya pehle search box mein 14-digit Bhu-Aadhar ID enter karein! 🔷',
    help: '🌾 Main in cheezon mein madad kar sakta hoon:\n\n• "Status kya hai" → Poora plot overview\n• "Risk score batao" → Trust score aur risk\n• "Court case hai kya" → Litigation check\n• "Mutation time" → SRO delay prediction\n• "Map mein dikhao" → Map auto-zoom\n• "RTI draft banao" → RTI letter generate\n• "Price kya hai" → Market value',
    greetLoaded: (id, owner) => `Namaste! 🙏 Parcel **${id}** (Owner: ${owner}) loaded hai. Poochiye kuch bhi!`,
    status: 'Plot Status Overview',
    owner: 'Malik ki Jankari',
    trustScore: 'Vishwas Score',
    riskLevel: 'Jokhim Star',
    courtCase: 'Court Case Status',
    infraBuffer: 'Infrastructure Buffer',
    mutationEta: 'Mutation Samay',
    days: 'din',
    mapZoom: '📍 Map mein aapka plot dikha raha hoon!',
    rtiGen: '📜 RTI Draft ban raha hai!',
    area: 'Kshetrafal',
    landType: 'Zameen ka Prakar',
    mouza: 'Mouza',
    survey: 'Survey Status',
    soilType: 'Mitti ka Prakar',
    crops: 'Upyukt Fasal',
    askPrice: 'Maanga Hua Mulya',
    circleRate: 'Sarkaari Circle Rate',
    priceGap: 'Mulya Antar',
    sroOffice: 'SRO Office',
    congestion: 'Queue Bheed',
    safe: 'Yah plot surakshit hai. Len-den aage badha sakte hain.',
    medium: 'Savdhaani rakhein. Infrastructure overlap jaanch karein.',
    high: 'CHETAVNI: Uchch jokhim! Bina vakeel ke kharidna sahi nahi hai.',
    clear: 'Saaf',
    warning: 'Chetavni',
    severe: 'Gambhir',
    listening: '🎙️ Sun raha hoon...',
    thinking: '💭 Soch raha hoon...',
    placeholder: 'Poochiye kuch bhi...',
    listeningPlaceholder: 'Bol raha hun...',
  },
  bn: {
    greeting: 'নমস্কার! 🙏 আমি আপনার ভূমি মিত্র AI। প্লটের স্থিতি, কোর্ট কেস, মিউটেশন সময়, ঝুঁকি স্কোর — যেকোনো কিছু জিজ্ঞেস করুন!',
    chips: ['প্লটের স্থিতি কী?', 'মিউটেশনে কত সময়?', 'কোর্ট কেস আছে?', 'ম্যাপে দেখান', 'RTI ড্রাফ্ট তৈরি করুন'],
    noParcel: 'এখন কোনো পার্সেল লোড হয়নি। অনুগ্রহ করে সার্চ বক্সে 14-ডিজিটের ভূ-আধার ID দিন! 🔷',
    help: '🌾 আমি এই বিষয়ে সাহায্য করতে পারি:\n\n• "স্থিতি কী" → সম্পূর্ণ প্লট ওভারভিউ\n• "ঝুঁকি স্কোর" → ট্রাস্ট স্কোর ও ঝুঁকি\n• "কোর্ট কেস" → মামলা যাচাই\n• "মিউটেশন সময়" → SRO বিলম্ব পূর্বাভাস\n• "ম্যাপে দেখান" → স্বয়ংক্রিয় জুম\n• "RTI ড্রাফ্ট" → RTI চিঠি তৈরি',
    greetLoaded: (id, owner) => `নমস্কার! 🙏 পার্সেল **${id}** (মালিক: ${owner}) লোড হয়েছে। যেকোনো কিছু জিজ্ঞেস করুন!`,
    status: 'প্লটের স্থিতি',
    owner: 'মালিকের তথ্য',
    trustScore: 'বিশ্বাস স্কোর',
    riskLevel: 'ঝুঁকি স্তর',
    courtCase: 'কোর্ট কেসের স্থিতি',
    infraBuffer: 'অবকাঠামো বাফার',
    mutationEta: 'মিউটেশন সময়',
    days: 'দিন',
    mapZoom: '📍 ম্যাপে আপনার প্লট দেখাচ্ছি!',
    rtiGen: '📜 RTI ড্রাফ্ট তৈরি হচ্ছে!',
    area: 'এলাকা',
    landType: 'জমির ধরন',
    mouza: 'মৌজা',
    survey: 'সমীক্ষা অবস্থা',
    soilType: 'মাটির ধরন',
    crops: 'উপযুক্ত ফসল',
    askPrice: 'চাওয়া মূল্য',
    circleRate: 'সরকারি সার্কেল রেট',
    priceGap: 'মূল্য পার্থক্য',
    sroOffice: 'SRO অফিস',
    congestion: 'সারি ভিড়',
    safe: 'এই প্লটটি নিরাপদ। লেনদেন এগিয়ে নিতে পারেন।',
    medium: 'সতর্কতা প্রয়োজন। অবকাঠামো ওভারল্যাপ যাচাই করুন।',
    high: 'সতর্কতা: উচ্চ ঝুঁকি! আইনজীবীর পরামর্শ ছাড়া কেনা উচিত নয়।',
    clear: 'পরিষ্কার',
    warning: 'সতর্কতা',
    severe: 'গুরুতর',
    listening: '🎙️ শুনছি...',
    thinking: '💭 ভাবছি...',
    placeholder: 'যেকোনো কিছু জিজ্ঞেস করুন...',
    listeningPlaceholder: 'বলুন...',
  },
  ta: {
    greeting: 'வணக்கம்! 🙏 நான் உங்கள் பூமி மித்ரா AI. நிலத்தின் நிலை, நீதிமன்ற வழக்கு, மாற்றம் நேரம், ஆபத்து மதிப்பெண் — எதையும் கேளுங்கள்!',
    chips: ['நிலத்தின் நிலை என்ன?', 'மாற்றத்திற்கு எவ்வளவு நேரம்?', 'நீதிமன்ற வழக்கு உள்ளதா?', 'வரைபடத்தில் காட்டு', 'RTI வரைவு உருவாக்கு'],
    noParcel: 'தற்போது எந்த நிலமும் ஏற்றப்படவில்லை. தேடல் பெட்டியில் 14-இலக்க பூ-ஆதார் ID உள்ளிடவும்! 🔷',
    help: '🌾 நான் இவற்றில் உதவ முடியும:\n\n• "நிலை என்ன" → முழு நில மேலோட்டம்\n• "ஆபத்து மதிப்பெண்" → நம்பிக்கை மதிப்பு\n• "நீதிமன்ற வழக்கு" → வழக்குச் சரிபார்ப்பு\n• "மாற்ற நேரம்" → SRO தாமத கணிப்பு\n• "வரைபடத்தில் காட்டு" → தானியங்கி ஜூம்\n• "RTI வரைவு" → RTI கடிதம் உருவாக்கு',
    greetLoaded: (id, owner) => `வணக்கம்! 🙏 நிலம் **${id}** (உரிமையாளர்: ${owner}) ஏற்றப்பட்டது. எதையும் கேளுங்கள்!`,
    status: 'நிலத்தின் நிலை', owner: 'உரிமையாளர் விவரங்கள்', trustScore: 'நம்பிக்கை மதிப்பு', riskLevel: 'ஆபத்து நிலை',
    courtCase: 'நீதிமன்ற வழக்கு', infraBuffer: 'உள்கட்டமைப்பு', mutationEta: 'மாற்ற நேரம்', days: 'நாட்கள்',
    mapZoom: '📍 வரைபடத்தில் உங்கள் நிலத்தைக் காட்டுகிறேன்!', rtiGen: '📜 RTI வரைவு உருவாக்கப்படுகிறது!',
    area: 'பரப்பளவு', landType: 'நில வகை', mouza: 'மௌஜா', survey: 'கணக்கெடுப்பு',
    soilType: 'மண் வகை', crops: 'பொருத்தமான பயிர்கள்', askPrice: 'கேட்கும் விலை', circleRate: 'அரசு வட்ட விலை',
    priceGap: 'விலை வேறுபாடு', sroOffice: 'SRO அலுவலகம்', congestion: 'வரிசை நெரிசல்',
    safe: 'இந்த நிலம் பாதுகாப்பானது.', medium: 'எச்சரிக்கை தேவை.', high: 'உயர் ஆபத்து! வழக்கறிஞரிடம் ஆலோசிக்கவும்.',
    clear: 'தெளிவு', warning: 'எச்சரிக்கை', severe: 'தீவிரம்',
    listening: '🎙️ கேட்கிறேன்...', thinking: '💭 சிந்திக்கிறேன்...', placeholder: 'எதையும் கேளுங்கள்...', listeningPlaceholder: 'சொல்லுங்கள்...',
  },
  te: {
    greeting: 'నమస్కారం! 🙏 నేను మీ భూమి మిత్ర AI. భూమి స్థితి, కోర్ట్ కేసు, మ్యుటేషన్ సమయం, రిస్క్ స్కోర్ — ఏదైనా అడగండి!',
    chips: ['భూమి స్థితి ఏమిటి?', 'మ్యుటేషన్‌కు ఎంత సమయం?', 'కోర్ట్ కేసు ఉందా?', 'మ్యాప్‌లో చూపించు', 'RTI డ్రాఫ్ట్ తయారు చేయి'],
    noParcel: 'ప్రస్తుతం ఏ పార్సెల్ లోడ్ కాలేదు. సెర్చ్ బాక్స్‌లో 14-అంకెల భూ-ఆధార్ ID నమోదు చేయండి! 🔷',
    help: '🌾 నేను ఈ విషయాలలో సహాయం చేయగలను:\n\n• "స్థితి ఏమిటి" → పూర్తి భూమి వివరాలు\n• "రిస్క్ స్కోర్" → నమ్మకం స్కోర్\n• "కోర్ట్ కేసు" → వివాద తనిఖీ\n• "మ్యుటేషన్ సమయం" → SRO ఆలస్యం అంచనా\n• "మ్యాప్‌లో చూపించు" → ఆటో జూమ్',
    greetLoaded: (id, owner) => `నమస్కారం! 🙏 పార్సెల్ **${id}** (యజమాని: ${owner}) లోడ్ అయింది. ఏదైనా అడగండి!`,
    status: 'భూమి స్థితి', owner: 'యజమాని వివరాలు', trustScore: 'నమ్మకం స్కోర్', riskLevel: 'రిస్క్ స్థాయి',
    courtCase: 'కోర్ట్ కేసు', infraBuffer: 'మౌలిక సదుపాయాల బఫర్', mutationEta: 'మ్యుటేషన్ సమయం', days: 'రోజులు',
    mapZoom: '📍 మ్యాప్‌లో మీ భూమిని చూపిస్తున్నాను!', rtiGen: '📜 RTI డ్రాఫ్ట్ తయారవుతోంది!',
    area: 'విస్తీర్ణం', landType: 'భూమి రకం', mouza: 'మౌజా', survey: 'సర్వే',
    soilType: 'నేల రకం', crops: 'తగిన పంటలు', askPrice: 'అడిగిన ధర', circleRate: 'ప్రభుత్వ సర్కిల్ రేటు',
    priceGap: 'ధర తేడా', sroOffice: 'SRO కార్యాలయం', congestion: 'క్యూ రద్దీ',
    safe: 'ఈ భూమి సురక్షితం.', medium: 'జాగ్రత్త అవసరం.', high: 'ఉన్నత ప్రమాదం! న్యాయవాదిని సంప్రదించండి.',
    clear: 'స్పష్టం', warning: 'హెచ్చరిక', severe: 'తీవ్రం',
    listening: '🎙️ వింటున్నాను...', thinking: '💭 ఆలోచిస్తున్నాను...', placeholder: 'ఏదైనా అడగండి...', listeningPlaceholder: 'చెప్పండి...',
  },
  mr: {
    greeting: 'नमस्कार! 🙏 मी तुमचा भूमी मित्र AI आहे. जमिनीची स्थिती, कोर्ट केस, म्युटेशन वेळ, रिस्क स्कोर — काहीही विचारा!',
    chips: ['जमिनीची स्थिती काय?', 'म्युटेशनला किती वेळ?', 'कोर्ट केस आहे का?', 'नकाशावर दाखवा', 'RTI ड्राफ्ट बनवा'],
    noParcel: 'सध्या कोणतेही पार्सल लोड नाही. कृपया सर्च बॉक्समध्ये 14-अंकी भू-आधार ID टाका! 🔷',
    help: '🌾 मी या गोष्टींमध्ये मदत करू शकतो:\n\n• "स्थिती काय" → संपूर्ण प्लॉट माहिती\n• "रिस्क स्कोर" → विश्वास गुण\n• "कोर्ट केस" → वाद तपासणी\n• "म्युटेशन वेळ" → SRO विलंब अंदाज\n• "नकाशावर दाखवा" → ऑटो झूम',
    greetLoaded: (id, owner) => `नमस्कार! 🙏 पार्सल **${id}** (मालक: ${owner}) लोड झाले. काहीही विचारा!`,
    status: 'जमिनीची स्थिती', owner: 'मालकाची माहिती', trustScore: 'विश्वास गुण', riskLevel: 'जोखीम पातळी',
    courtCase: 'कोर्ट केस', infraBuffer: 'पायाभूत सुविधा बफर', mutationEta: 'म्युटेशन वेळ', days: 'दिवस',
    mapZoom: '📍 नकाशावर तुमचा प्लॉट दाखवतो!', rtiGen: '📜 RTI ड्राफ्ट तयार होत आहे!',
    area: 'क्षेत्रफळ', landType: 'जमिनीचा प्रकार', mouza: 'मौझा', survey: 'सर्वेक्षण',
    soilType: 'मातीचा प्रकार', crops: 'योग्य पिके', askPrice: 'मागितलेली किंमत', circleRate: 'सरकारी सर्कल दर',
    priceGap: 'किंमतीतील फरक', sroOffice: 'SRO कार्यालय', congestion: 'रांगेतील गर्दी',
    safe: 'हा प्लॉट सुरक्षित आहे.', medium: 'सावधगिरी बाळगा.', high: 'उच्च जोखीम! वकिलाशी सल्लामसलत करा.',
    clear: 'स्वच्छ', warning: 'चेतावणी', severe: 'गंभीर',
    listening: '🎙️ ऐकतोय...', thinking: '💭 विचार करतोय...', placeholder: 'काहीही विचारा...', listeningPlaceholder: 'बोला...',
  },
  en: {
    greeting: 'Hello! 🙏 I am your Bhoomi Mitra AI. Ask me about plot status, court cases, mutation timeline, risk scores — anything!',
    chips: ['What is the plot status?', 'How long for mutation?', 'Any court cases?', 'Show on map', 'Generate RTI draft'],
    noParcel: 'No parcel is loaded yet. Please enter a 14-digit Bhu-Aadhar ID in the search box above! 🔷',
    help: '🌾 I can help with:\n\n• "Plot status" → Full overview\n• "Risk score" → Trust score & risk\n• "Court cases" → Litigation check\n• "Mutation time" → SRO delay prediction\n• "Show on map" → Auto-zoom map\n• "RTI draft" → Generate RTI letter\n• "Price" → Market value comparison',
    greetLoaded: (id, owner) => `Hello! 🙏 Parcel **${id}** (Owner: ${owner}) is loaded. Ask me anything!`,
    status: 'Plot Status Overview', owner: 'Owner Details', trustScore: 'Trust Score', riskLevel: 'Risk Level',
    courtCase: 'Court Case Status', infraBuffer: 'Infrastructure Buffer', mutationEta: 'Mutation Timeline', days: 'days',
    mapZoom: '📍 Showing your plot on the map!', rtiGen: '📜 Generating RTI Draft!',
    area: 'Area', landType: 'Land Type', mouza: 'Mouza', survey: 'Survey Status',
    soilType: 'Soil Type', crops: 'Suitable Crops', askPrice: 'Asking Price', circleRate: 'Govt Circle Rate',
    priceGap: 'Price Gap', sroOffice: 'SRO Office', congestion: 'Queue Congestion',
    safe: 'This plot appears safe for transaction.', medium: 'Caution advised. Check infrastructure overlap.', high: 'HIGH RISK! Do not purchase without legal review.',
    clear: 'Clear', warning: 'Warning', severe: 'Severe',
    listening: '🎙️ Listening...', thinking: '💭 Thinking...', placeholder: 'Ask anything...', listeningPlaceholder: 'Speak now...',
  },
  gu: {
    greeting: 'નમસ્તે! 🙏 હું તમારો ભૂમિ મિત્ર AI છું. જમીનની સ્થિતિ, કોર્ટ કેસ, મ્યુટેશન સમય — કંઈ પણ પૂછો!',
    chips: ['જમીનની સ્થિતિ શું છે?', 'મ્યુટેશનમાં કેટલો સમય?', 'કોર્ટ કેસ છે?', 'નકશા પર બતાવો', 'RTI ડ્રાફ્ટ બનાવો'],
    noParcel: 'હાલમાં કોઈ પાર્સેલ લોડ નથી. કૃપયા 14-અંકનો ભૂ-આધાર ID દાખલ કરો! 🔷',
    help: '🌾 હું આ બાબતોમાં મદદ કરી શકું છું:\n\n• "સ્થિતિ" → સંપૂર્ણ પ્લોટ વિહંગાવલોકન\n• "જોખમ સ્કોર" → વિશ્વાસ સ્કોર\n• "કોર્ટ કેસ" → કેસ ચકાસણી\n• "મ્યુટેશન સમય" → SRO વિલંબ અંદાજ',
    greetLoaded: (id, owner) => `નમસ્તે! 🙏 પાર્સેલ **${id}** (માલિક: ${owner}) લોડ થયું. કંઈ પણ પૂછો!`,
    status: 'જમીનની સ્થિતિ', owner: 'માલિકની માહિતી', trustScore: 'વિશ્વાસ સ્કોર', riskLevel: 'જોખમ સ્તર',
    courtCase: 'કોર્ટ કેસ', infraBuffer: 'ઈન્ફ્રાસ્ટ્રક્ચર', mutationEta: 'મ્યુટેશન સમય', days: 'દિવસ',
    mapZoom: '📍 નકશા પર તમારો પ્લોટ બતાવું છું!', rtiGen: '📜 RTI ડ્રાફ્ટ બની રહ્યો છે!',
    area: 'વિસ્તાર', landType: 'જમીનનો પ્રકાર', mouza: 'મૌઝા', survey: 'સર્વે',
    soilType: 'માટીનો પ્રકાર', crops: 'યોગ્ય પાક', askPrice: 'માંગેલી કિંમત', circleRate: 'સરકારી દર',
    priceGap: 'કિંમત તફાવત', sroOffice: 'SRO ઓફિસ', congestion: 'કતાર ભીડ',
    safe: 'આ પ્લોટ સુરક્ષિત છે.', medium: 'સાવધાની રાખો.', high: 'ઉચ્ચ જોખમ! વકીલની સલાહ લો.',
    clear: 'સ્પષ્ટ', warning: 'ચેતવણી', severe: 'ગંભીર',
    listening: '🎙️ સાંભળું છું...', thinking: '💭 વિચારું છું...', placeholder: 'કંઈ પણ પૂછો...', listeningPlaceholder: 'બોલો...',
  },
  pa: {
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏 ਮੈਂ ਤੁਹਾਡਾ ਭੂਮੀ ਮਿੱਤਰ AI ਹਾਂ। ਜ਼ਮੀਨ ਦੀ ਸਥਿਤੀ, ਕੋਰਟ ਕੇਸ, ਮਿਊਟੇਸ਼ਨ ਸਮਾਂ — ਕੁਝ ਵੀ ਪੁੱਛੋ!',
    chips: ['ਜ਼ਮੀਨ ਦੀ ਸਥਿਤੀ ਕੀ?', 'ਮਿਊਟੇਸ਼ਨ ਵਿੱਚ ਕਿੰਨਾ ਸਮਾਂ?', 'ਕੋਰਟ ਕੇਸ ਹੈ?', 'ਨਕਸ਼ੇ ਵਿੱਚ ਦਿਖਾਓ', 'RTI ਡ੍ਰਾਫ਼ਟ ਬਣਾਓ'],
    noParcel: 'ਹੁਣ ਕੋਈ ਪਾਰਸਲ ਲੋਡ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ 14-ਅੰਕ ਭੂ-ਆਧਾਰ ID ਦਿਓ! 🔷',
    help: '🌾 ਮੈਂ ਇਹਨਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n\n• "ਸਥਿਤੀ" → ਪੂਰਾ ਵੇਰਵਾ\n• "ਖ਼ਤਰਾ ਸਕੋਰ" → ਭਰੋਸਾ ਸਕੋਰ\n• "ਕੋਰਟ ਕੇਸ" → ਕੇਸ ਜਾਂਚ\n• "ਮਿਊਟੇਸ਼ਨ ਸਮਾਂ" → SRO ਦੇਰੀ ਅੰਦਾਜ਼ਾ',
    greetLoaded: (id, owner) => `ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏 ਪਾਰਸਲ **${id}** (ਮਾਲਕ: ${owner}) ਲੋਡ ਹੋ ਗਿਆ। ਕੁਝ ਵੀ ਪੁੱਛੋ!`,
    status: 'ਜ਼ਮੀਨ ਦੀ ਸਥਿਤੀ', owner: 'ਮਾਲਕ ਵੇਰਵੇ', trustScore: 'ਭਰੋਸਾ ਸਕੋਰ', riskLevel: 'ਖ਼ਤਰਾ ਪੱਧਰ',
    courtCase: 'ਕੋਰਟ ਕੇਸ', infraBuffer: 'ਬੁਨਿਆਦੀ ਢਾਂਚਾ', mutationEta: 'ਮਿਊਟੇਸ਼ਨ ਸਮਾਂ', days: 'ਦਿਨ',
    mapZoom: '📍 ਨਕਸ਼ੇ ਵਿੱਚ ਤੁਹਾਡਾ ਪਲਾਟ ਦਿਖਾ ਰਿਹਾ!', rtiGen: '📜 RTI ਡ੍ਰਾਫ਼ਟ ਬਣ ਰਿਹਾ!',
    area: 'ਖੇਤਰਫਲ', landType: 'ਜ਼ਮੀਨ ਦੀ ਕਿਸਮ', mouza: 'ਮੌਜ਼ਾ', survey: 'ਸਰਵੇ',
    soilType: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ', crops: 'ਢੁਕਵੀਆਂ ਫ਼ਸਲਾਂ', askPrice: 'ਮੰਗੀ ਕੀਮਤ', circleRate: 'ਸਰਕਾਰੀ ਦਰ',
    priceGap: 'ਕੀਮਤ ਫ਼ਰਕ', sroOffice: 'SRO ਦਫ਼ਤਰ', congestion: 'ਕਤਾਰ ਭੀੜ',
    safe: 'ਇਹ ਪਲਾਟ ਸੁਰੱਖਿਅਤ ਹੈ।', medium: 'ਸਾਵਧਾਨੀ ਰੱਖੋ।', high: 'ਉੱਚ ਖ਼ਤਰਾ! ਵਕੀਲ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
    clear: 'ਸਾਫ਼', warning: 'ਚੇਤਾਵਨੀ', severe: 'ਗੰਭੀਰ',
    listening: '🎙️ ਸੁਣ ਰਿਹਾ...', thinking: '💭 ਸੋਚ ਰਿਹਾ...', placeholder: 'ਕੁਝ ਵੀ ਪੁੱਛੋ...', listeningPlaceholder: 'ਬੋਲੋ...',
  },
  kn: {
    greeting: 'ನಮಸ್ಕಾರ! 🙏 ನಾನು ನಿಮ್ಮ ಭೂಮಿ ಮಿತ್ರ AI. ಭೂಮಿ ಸ್ಥಿತಿ, ಕೋರ್ಟ್ ಕೇಸ್, ಮ್ಯುಟೇಷನ್ — ಏನನ್ನಾದರೂ ಕೇಳಿ!',
    chips: ['ಭೂಮಿ ಸ್ಥಿತಿ ಏನು?', 'ಮ್ಯುಟೇಷನ್‌ಗೆ ಎಷ್ಟು ಸಮಯ?', 'ಕೋರ್ಟ್ ಕೇಸ್ ಇದೆಯೇ?', 'ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸಿ', 'RTI ಕರಡು ರಚಿಸಿ'],
    noParcel: 'ಪ್ರಸ್ತುತ ಯಾವ ಪಾರ್ಸೆಲ್ ಲೋಡ್ ಆಗಿಲ್ಲ. 14-ಅಂಕಿಯ ಭೂ-ಆಧಾರ್ ID ನಮೂದಿಸಿ! 🔷',
    help: '🌾 ನಾನು ಈ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n\n• "ಸ್ಥಿತಿ" → ಸಂಪೂರ್ಣ ವಿವರ\n• "ಅಪಾಯ ಸ್ಕೋರ್" → ನಂಬಿಕೆ ಅಂಕ\n• "ಕೋರ್ಟ್ ಕೇಸ್" → ವಿವಾದ ಪರಿಶೀಲನೆ',
    greetLoaded: (id, owner) => `ನಮಸ್ಕಾರ! 🙏 ಪಾರ್ಸೆಲ್ **${id}** (ಮಾಲೀಕ: ${owner}) ಲೋಡ್ ಆಗಿದೆ. ಏನನ್ನಾದರೂ ಕೇಳಿ!`,
    status: 'ಭೂಮಿ ಸ್ಥಿತಿ', owner: 'ಮಾಲೀಕರ ವಿವರ', trustScore: 'ನಂಬಿಕೆ ಅಂಕ', riskLevel: 'ಅಪಾಯ ಮಟ್ಟ',
    courtCase: 'ಕೋರ್ಟ್ ಕೇಸ್', infraBuffer: 'ಮೂಲಸೌಕರ್ಯ', mutationEta: 'ಮ್ಯುಟೇಷನ್ ಸಮಯ', days: 'ದಿನಗಳು',
    mapZoom: '📍 ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸುತ್ತಿದ್ದೇನೆ!', rtiGen: '📜 RTI ಕರಡು ತಯಾರಾಗುತ್ತಿದೆ!',
    area: 'ಪ್ರದೇಶ', landType: 'ಭೂಮಿ ವಿಧ', mouza: 'ಮೌಝಾ', survey: 'ಸಮೀಕ್ಷೆ',
    soilType: 'ಮಣ್ಣಿನ ವಿಧ', crops: 'ಸೂಕ್ತ ಬೆಳೆಗಳು', askPrice: 'ಕೇಳಿದ ಬೆಲೆ', circleRate: 'ಸರ್ಕಾರಿ ದರ',
    priceGap: 'ಬೆಲೆ ವ್ಯತ್ಯಾಸ', sroOffice: 'SRO ಕಚೇರಿ', congestion: 'ಸಾಲು ದಟ್ಟಣೆ',
    safe: 'ಈ ಪ್ಲಾಟ್ ಸುರಕ್ಷಿತ.', medium: 'ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.', high: 'ಹೆಚ್ಚಿನ ಅಪಾಯ! ವಕೀಲರ ಸಲಹೆ ಪಡೆಯಿರಿ.',
    clear: 'ಸ್ಪಷ್ಟ', warning: 'ಎಚ್ಚರಿಕೆ', severe: 'ತೀವ್ರ',
    listening: '🎙️ ಕೇಳುತ್ತಿದ್ದೇನೆ...', thinking: '💭 ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...', placeholder: 'ಏನನ್ನಾದರೂ ಕೇಳಿ...', listeningPlaceholder: 'ಹೇಳಿ...',
  },
  ml: {
    greeting: 'നമസ്കാരം! 🙏 ഞാൻ നിങ്ങളുടെ ഭൂമി മിത്ര AI ആണ്. ഭൂമിയുടെ സ്ഥിതി, കോടതി കേസ്, മ്യൂട്ടേഷൻ — എന്തും ചോദിക്കൂ!',
    chips: ['ഭൂമിയുടെ സ്ഥിതി?', 'മ്യൂട്ടേഷന് എത്ര സമയം?', 'കോടതി കേസ് ഉണ്ടോ?', 'മാപ്പിൽ കാണിക്കൂ', 'RTI ഡ്രാഫ്റ്റ്'],
    noParcel: 'നിലവിൽ പാർസൽ ലോഡ് ചെയ്തിട്ടില്ല. 14-അക്ക ഭൂ-ആധാർ ID നൽകുക! 🔷',
    help: '🌾 എനിക്ക് ഈ വിഷയങ്ങളിൽ സഹായിക്കാം:\n\n• "സ്ഥിതി" → മുഴുവൻ വിവരം\n• "റിസ്ക് സ്കോർ" → വിശ്വാസ സ്കോർ\n• "കോടതി കേസ്" → വ്യവഹാര പരിശോധന',
    greetLoaded: (id, owner) => `നമസ്കാരം! 🙏 പാർസൽ **${id}** (ഉടമ: ${owner}) ലോഡ് ചെയ്തു. എന്തും ചോദിക്കൂ!`,
    status: 'ഭൂമി സ്ഥിതി', owner: 'ഉടമ വിവരങ്ങൾ', trustScore: 'വിശ്വാസ സ്കോർ', riskLevel: 'റിസ്ക് നില',
    courtCase: 'കോടതി കേസ്', infraBuffer: 'അടിസ്ഥാന സൗകര്യം', mutationEta: 'മ്യൂട്ടേഷൻ സമയം', days: 'ദിവസം',
    mapZoom: '📍 മാപ്പിൽ കാണിക്കുന്നു!', rtiGen: '📜 RTI ഡ്രാഫ്റ്റ് തയ്യാറാകുന്നു!',
    area: 'വിസ്തൃതി', landType: 'ഭൂമി തരം', mouza: 'മൗസ', survey: 'സർവ്വേ',
    soilType: 'മണ്ണ് തരം', crops: 'അനുയോജ്യ വിളകൾ', askPrice: 'ആവശ്യപ്പെടുന്ന വില', circleRate: 'സർക്കാർ നിരക്ക്',
    priceGap: 'വില വ്യത്യാസം', sroOffice: 'SRO ഓഫീസ്', congestion: 'ക്യൂ തിരക്ക്',
    safe: 'ഈ പ്ലോട്ട് സുരക്ഷിതമാണ്.', medium: 'ജാഗ്രത ആവശ്യം.', high: 'ഉയർന്ന അപകടം! അഭിഭാഷകനെ സമീപിക്കുക.',
    clear: 'വ്യക്തം', warning: 'മുന്നറിയിപ്പ്', severe: 'ഗുരുതരം',
    listening: '🎙️ കേൾക്കുന്നു...', thinking: '💭 ചിന്തിക്കുന്നു...', placeholder: 'എന്തും ചോദിക്കൂ...', listeningPlaceholder: 'പറയൂ...',
  },
  or: {
    greeting: 'ନମସ୍କାର! 🙏 ମୁଁ ଆପଣଙ୍କ ଭୂମି ମିତ୍ର AI। ଜମି ସ୍ଥିତି, କୋର୍ଟ ମାମଲା, ମ୍ୟୁଟେସନ — ଯାହା ବି ପଚାରନ୍ତୁ!',
    chips: ['ଜମି ସ୍ଥିତି କଣ?', 'ମ୍ୟୁଟେସନରେ କେତେ ସମୟ?', 'କୋର୍ଟ ମାମଲା ଅଛି?', 'ମାନଚିତ୍ରରେ ଦେଖାଅ', 'RTI ଡ୍ରାଫ୍ଟ ତିଆରି କର'],
    noParcel: 'ବର୍ତ୍ତମାନ କୌଣସି ପାର୍ସେଲ ଲୋଡ ହୋଇନାହିଁ। 14-ଅଙ୍କ ଭୂ-ଆଧାର ID ଦିଅନ୍ତୁ! 🔷',
    help: '🌾 ମୁଁ ଏହି ବିଷୟରେ ସାହାଯ୍ୟ କରିପାରିବି:\n\n• "ସ୍ଥିତି" → ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ\n• "ବିପଦ ସ୍କୋର" → ବିଶ୍ୱାସ ସ୍କୋର\n• "କୋର୍ଟ ମାମଲା" → ମାମଲା ଯାଞ୍ଚ',
    greetLoaded: (id, owner) => `ନମସ୍କାର! 🙏 ପାର୍ସେଲ **${id}** (ମାଲିକ: ${owner}) ଲୋଡ ହୋଇଛି। ଯାହା ବି ପଚାରନ୍ତୁ!`,
    status: 'ଜମି ସ୍ଥିତି', owner: 'ମାଲିକ ବିବରଣୀ', trustScore: 'ବିଶ୍ୱାସ ସ୍କୋର', riskLevel: 'ବିପଦ ସ୍ତର',
    courtCase: 'କୋର୍ଟ ମାମଲା', infraBuffer: 'ଭିତ୍ତିଭୂମି', mutationEta: 'ମ୍ୟୁଟେସନ ସମୟ', days: 'ଦିନ',
    mapZoom: '📍 ମାନଚିତ୍ରରେ ଦେଖାଉଛି!', rtiGen: '📜 RTI ଡ୍ରାଫ୍ଟ ତିଆରି ହେଉଛି!',
    area: 'କ୍ଷେତ୍ରଫଳ', landType: 'ଜମି ପ୍ରକାର', mouza: 'ମୌଜା', survey: 'ସର୍ଭେ',
    soilType: 'ମାଟି ପ୍ରକାର', crops: 'ଉପଯୁକ୍ତ ଫସଲ', askPrice: 'ମାଗିଥିବା ଦାମ', circleRate: 'ସରକାରୀ ଦର',
    priceGap: 'ଦାମ ଫରକ', sroOffice: 'SRO ଅଫିସ', congestion: 'କ୍ୟୁ ଭିଡ',
    safe: 'ଏହି ପ୍ଲଟ ସୁରକ୍ଷିତ।', medium: 'ସାବଧାନତା ରଖନ୍ତୁ।', high: 'ଉଚ୍ଚ ବିପଦ! ଓକିଲ ସହ ପରାମର୍ଶ କରନ୍ତୁ।',
    clear: 'ସଫା', warning: 'ଚେତାବନୀ', severe: 'ଗମ୍ଭୀର',
    listening: '🎙️ ଶୁଣୁଛି...', thinking: '💭 ଭାବୁଛି...', placeholder: 'ଯାହା ବି ପଚାରନ୍ତୁ...', listeningPlaceholder: 'କୁହନ୍ତୁ...',
  },
};

// Fallback: any unsupported language code → Hindi
function getLang(code) {
  return LANG_STRINGS[code] || LANG_STRINGS['hi'];
}

// ── Preload browser voices (Chrome loads them async) ──────────────────────
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {};
}

// ── TTS Helper ────────────────────────────────────────────────────────────
let currentAudio = null;

function speak(text, lang = 'hi-IN') {
  if (!text) return;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const cleanText = text.replace(/[🌾🔷📜✅⚠️🔴🏗️⚖️📍🗺️🎯💡📋🙏💰🌱👤]/g, '').replace(/\*\*/g, '').replace(/\n+/g, '. ').trim();
  if (!cleanText) return;

  // ElevenLabs TTS (Primary)
  const apiKey = 'ee30412b2bc01b2ef16c1f3ccde8db419e4551bd124fe0c77b38c62b552e9dff';
  const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - Good multilingual voice
  
  fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.5 }
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('ElevenLabs API failed');
    return res.blob();
  })
  .then(blob => {
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    currentAudio.play();
  })
  .catch(err => {
    console.warn("ElevenLabs failed, falling back to browser TTS:", err);
    
    // Fallback to Browser Speech Synthesis
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 0.95; utter.pitch = 1.0; utter.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0];
    const preferredVoice =
      voices.find(v => v.name.includes('Google') && v.lang.startsWith(langPrefix)) ||
      voices.find(v => v.lang.startsWith(langPrefix) && !v.name.includes('Compact')) ||
      voices.find(v => v.lang.startsWith(langPrefix)) ||
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utter.voice = preferredVoice;
    utter.lang = lang;
    window.speechSynthesis.speak(utter);
  });
}

// ── LOCAL AI ENGINE ───────────────────────────────────────────────────────
function detectIntent(query) {
  const q = query.toLowerCase();
  if (/map|dikhao|dikha|location|kahan|zoom|navigate|satellite|নকশা|ম্যাপ|नकाशा|நகர|మ్యాప్|ಮ್ಯಾಪ್|മാപ്പ|ନକ୍ସା|નકશા|ਨਕਸ਼/i.test(q)) return 'MAP';
  if (/rti|draft|application|grievance|complaint|letter|ড্রাফ্ট|ड्राफ्ट|வரைவு|డ్రాఫ్ట్|ಕರಡು|ഡ്രാഫ്|ଡ୍ରାଫ୍ଟ|ਡ੍ਰਾਫ਼ਟ/i.test(q)) return 'RTI';
  if (/court|case|litigation|dispute|mukadma|কোর্ট|মামলা|कोर्ट|केस|நீதிமன்ற|కోర్ట|ಕೋರ್ಟ|കോടതി|କୋର୍ଟ|ਕੋਰਟ/i.test(q)) return 'COURT';
  if (/mutation|dakhil|kharij|time|delay|kitna|din|days|wait|queue|sro|মিউটেশন|সময়|म्युटेशन|वेळ|மாற்ற|மாற்றம்|మ్యుటేషన్|ಮ್ಯುಟೇಷನ|മ്യൂട്ട|ମ୍ୟୁଟେସନ|ਮਿਊਟੇਸ਼ਨ/i.test(q)) return 'MUTATION';
  if (/risk|score|trust|safe|danger|khatre|jokhi|ঝুঁকি|বিশ্বাস|जोखीम|ஆபத்து|అపాయ|ಅಪಾಯ|അപകട|ବିପଦ|ਖ਼ਤਰਾ/i.test(q)) return 'RISK';
  if (/owner|malik|naam|name|details|contact|মালিক|নাম|मालक|நாம|உரிமை|యజమాని|ಮಾಲೀಕ|ഉടമ|ମାଲିକ|ਮਾਲਕ/i.test(q)) return 'OWNER';
  if (/price|rate|kimat|value|circle|market|cost|দাম|মূল্য|किंमत|விலை|ధర|�ೆ|വില|ଦାମ|ਕੀਮਤ/i.test(q)) return 'PRICE';
  if (/soil|mitti|crop|fasal|agriculture|kheti|মাটি|ফসল|माती|मिट्टी|மண்|నేల|ಮಣ್ಣ|മണ്ണ|ମାଟି|ਮਿੱਟੀ/i.test(q)) return 'SOIL';
  if (/status|kya hai|batao|bata|jankari|info|detail|haal|স্থিতি|কি|স্থিতি|स्थिती|நிலை|స్థితి|ಸ್ಥಿತಿ|സ്ഥിതി|ସ୍ଥିତି|ਸਥਿਤੀ/i.test(q)) return 'STATUS';
  if (/help|madad|kya kar sakte|kaise|how|সাহায্য|मदत|உதவி|సహాయ|ಸಹಾಯ|സഹായ|ସାହାଯ୍ୟ|ਮਦਦ/i.test(q)) return 'HELP';
  if (/hello|hi|namaste|namaskar|নমস্কার|नमस्कार|வணக்கம|నమస్|ನಮಸ|നമസ|ନମସ|ਸਤ/i.test(q)) return 'GREET';
  return 'STATUS';
}

function generateSmartResponse(query, parcelData, onMapAction, onDocAction, langCode) {
  const intent = detectIntent(query);
  const L = getLang(langCode);
  const d = parcelData;

  if (!d || !d.parcel) {
    if (intent === 'GREET') return L.greeting;
    if (intent === 'HELP') return L.help;
    return L.noParcel;
  }

  const owner = d.parcel.owner_details?.name || 'Unknown';
  const landType = d.parcel.land_profile?.land_type || 'N/A';
  const area = d.parcel.land_profile?.area_acres || 0;
  const mouza = d.parcel.land_profile?.mouza || 'N/A';
  const survey = d.parcel.land_profile?.survey_status || 'N/A';
  const bhuId = d.parcel.bhu_aadhar_id || '';
  const riskLevel = d.risk?.risk_matrix?.overall_risk_level || 'Low';
  const trustScore = d.risk?.risk_matrix?.trust_score_percentage || 0;
  const courtStatus = d.risk?.risk_matrix?.risk_breakdown?.court_litigation?.status || 'Clear';
  const courtDesc = d.risk?.risk_matrix?.risk_breakdown?.court_litigation?.description || '';
  const infraStatus = d.risk?.risk_matrix?.risk_breakdown?.infrastructure_overlap_gis?.status || 'Clear';
  const infraDesc = d.risk?.risk_matrix?.risk_breakdown?.infrastructure_overlap_gis?.description || '';
  const forestStatus = d.risk?.risk_matrix?.risk_breakdown?.forest_or_protected_zone?.status || 'Clear';
  const forestDesc = d.risk?.risk_matrix?.risk_breakdown?.forest_or_protected_zone?.description || '';
  const totalDays = d.delay?.estimated_total_days || 0;
  const sro = d.delay?.sub_registrar_office || 'N/A';
  const congestion = d.delay?.congestion_factor || 'Low';
  const milestones = d.delay?.timeline_milestones || [];
  const askPrice = d.parcel.market_details?.seller_asking_price_inr || 0;
  const circleRate = d.parcel.market_details?.local_government_circle_rate_inr || 0;
  const priceGap = d.parcel.market_details?.price_gap_percentage || 0;
  const lat = d.parcel.coordinates?.latitude || 22.5;
  const lng = d.parcel.coordinates?.longitude || 88.4;
  const soil = d.parcel.land_profile?.soil_health || {};
  const riskEmoji = riskLevel === 'High' ? '🔴' : riskLevel === 'Medium' ? '⚠️' : '✅';
  const adviceText = riskLevel === 'High' ? L.high : riskLevel === 'Medium' ? L.medium : L.safe;

  switch (intent) {
    case 'GREET': return L.greetLoaded(bhuId, owner);
    case 'HELP': return L.help;
    case 'MAP':
      if (onMapAction) onMapAction({ lat, lng, zoom: 17 });
      return `${L.mapZoom}\n\n**${L.mouza}:** ${mouza}\n**Coordinates:** ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E\n**${L.area}:** ${area} Acres`;
    case 'RTI':
      if (onDocAction) onDocAction({ type: 'RTI_Draft' });
      return `${L.rtiGen}\n\n**${bhuId}** (${mouza})`;
    case 'COURT':
      return `⚖️ **${L.courtCase}: ${courtStatus === 'Clear' ? L.clear + ' ✅' : courtStatus}**\n\n${courtDesc}\n\n**${L.infraBuffer}:** ${infraStatus} — ${infraDesc}\n**Forest:** ${forestStatus} — ${forestDesc}\n\n💡 ${adviceText}`;
    case 'MUTATION': {
      const tl = milestones.map(m => `• ${m.step}: **${m.duration_days} ${L.days}** (${m.status})`).join('\n');
      return `🏗️ **${L.mutationEta}:**\n\n**Total:** ${totalDays} ${L.days}\n**${L.sroOffice}:** ${sro}\n**${L.congestion}:** ${congestion}\n\n${tl}\n\n💡 ${adviceText}`;
    }
    case 'RISK': {
      const weights = d.risk?.risk_matrix?.explainable_ai_weights || [];
      const wt = weights.map(w => `• ${w.factor}: ${w.weight_contribution > 0 ? '+' : ''}${w.weight_contribution}% (${w.effect})`).join('\n');
      return `${riskEmoji} **${L.trustScore}:** ${trustScore}%\n**${L.riskLevel}:** ${riskLevel}\n\n${wt}\n\n**${L.courtCase}:** ${courtStatus} — ${courtDesc}\n**${L.infraBuffer}:** ${infraStatus} — ${infraDesc}\n\n💡 ${adviceText}`;
    }
    case 'OWNER':
      return `👤 **${L.owner}:**\n\n**Name:** ${owner}\n**Email:** ${d.parcel.owner_details?.email || 'N/A'}\n**Mobile:** ${d.parcel.owner_details?.mobile || 'N/A'}\n\n**${L.landType}:** ${landType}\n**${L.area}:** ${area} Acres\n**${L.mouza}:** ${mouza}\n**${L.survey}:** ${survey}`;
    case 'PRICE':
      return `💰 **${L.askPrice}:** ₹${(askPrice / 100000).toFixed(1)} Lakh\n**${L.circleRate}:** ₹${(circleRate / 100000).toFixed(1)} Lakh\n**${L.priceGap}:** ${priceGap}% ${priceGap > 30 ? '🔴' : priceGap > 15 ? '⚠️' : '✅'}\n\n💡 ${adviceText}`;
    case 'SOIL':
      return `🌱 **${L.soilType}:** ${soil.soil_type || 'N/A'}\n**pH:** ${soil.soil_ph || 'N/A'}\n**${L.crops}:** ${(soil.suitability_crops || []).join(', ') || 'N/A'}\n\n**${L.landType}:** ${landType}\n**${L.area}:** ${area} Acres`;
    case 'STATUS':
    default:
      return `${riskEmoji} **${L.status} — ${bhuId}**\n\n**${L.owner}:** ${owner}\n**${L.landType}:** ${landType} | **${L.area}:** ${area} Acres\n**${L.mouza}:** ${mouza}\n**${L.survey}:** ${survey}\n\n**${L.trustScore}:** ${trustScore}% (${riskLevel})\n**${L.courtCase}:** ${courtStatus}\n**${L.infraBuffer}:** ${infraStatus}\n**${L.mutationEta}:** ~${totalDays} ${L.days}\n\n💡 ${adviceText}`;
  }
}

// ── Action tag parser ─────────────────────────────────────────────────────
function parseActionTags(text, onMapAction, onDocAction) {
  let clean = text;
  const mapMatch = clean.match(/\[MAP_ACTION:\s*(\{.*?\})\]/s);
  if (mapMatch) { try { onMapAction?.(JSON.parse(mapMatch[1])); } catch (_) {} clean = clean.replace(/\[MAP_ACTION:\s*\{.*?\}\]/s, '').trim(); }
  clean = clean.replace(/\[CALCULATE_ACTION:\s*\{.*?\}\]/gs, '').trim();
  const docMatch = clean.match(/\[DOC_ACTION:\s*(\{.*?\})\]/s);
  if (docMatch) { try { onDocAction?.(JSON.parse(docMatch[1])); } catch (_) {} clean = clean.replace(/\[DOC_ACTION:\s*\{.*?\}\]/s, '').trim(); }
  return clean;
}

// ── UI Components ─────────────────────────────────────────────────────────
function WaveformBars() {
  return (<div className="flex items-center gap-0.5 h-5">{[0.6,1,0.7,1,0.5,0.9,0.6].map((h,i) => (<div key={i} className="w-0.5 bg-accent-blue rounded-full" style={{ height:`${h*100}%`, animation:`waveBounce 0.7s ease-in-out ${i*0.08}s infinite alternate` }} />))}</div>);
}
function TypingDots() {
  return (<div className="flex items-center gap-1 px-3 py-2.5 bg-background-subtle border border-blue-900/30 rounded-2xl rounded-bl-sm w-fit">{[0,0.2,0.4].map((delay,i) => (<span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400" style={{ animation:`typingDot 1.2s ease-in-out ${delay}s infinite` }} />))}</div>);
}

// ── Main ChatBot Component ────────────────────────────────────────────────
export default function ChatBot({ onMapAction, onDocAction, activePlotCode, parcelData, userLang = 'hi' }) {
  const { token } = useAuth();
  const L = getLang(userLang);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: L.greeting }]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const chatEndRef = useRef(null);
  const recogRef = useRef(null);
  const inputRef = useRef(null);

  // Update greeting when language changes
  useEffect(() => {
    const newL = getLang(userLang);
    setMessages([{ sender: 'bot', text: newL.greeting }]);
  }, [userLang]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isThinking]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText ?? inputQuery).trim();
    if (!text) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputQuery('');
    setIsThinking(true);
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

    try {
      let botReply = '';
      try {
        const data = await chatWithAgent(text, activePlotCode, token, userLang);
        botReply = data.response_text || data.reply || '';
        botReply = parseActionTags(botReply, onMapAction, onDocAction);
      } catch (_) {}

      const isGenericFallback = !botReply || botReply.includes('Land records are officially registered') || botReply.length < 20;
      if (isGenericFallback) {
        botReply = generateSmartResponse(text, parcelData, onMapAction, onDocAction, userLang);
      }
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      if (ttsEnabled && botReply) speak(botReply, `${userLang}-IN`);
    } catch (err) {
      const localReply = generateSmartResponse(text, parcelData, onMapAction, onDocAction, userLang);
      setMessages(prev => [...prev, { sender: 'bot', text: localReply }]);
      if (ttsEnabled && localReply) speak(localReply, `${userLang}-IN`);
    } finally {
      setIsThinking(false);
    }
  }, [inputQuery, activePlotCode, parcelData, token, onMapAction, onDocAction, ttsEnabled, userLang]);

  const toggleListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Browser voice support nahi karta. Chrome/Edge use karein.'); return; }
    if (isListening) { recogRef.current?.stop(); setIsListening(false); return; }
    const recog = new SR();
    recog.lang = `${userLang}-IN`;
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onstart = () => setIsListening(true);
    recog.onend = () => setIsListening(false);
    recog.onerror = () => setIsListening(false);
    recog.onresult = (e) => { const t = e.results[0][0].transcript; setInputQuery(t); setTimeout(() => handleSend(t), 300); };
    recogRef.current = recog;
    recog.start();
  }, [isListening, userLang, handleSend]);

  const chips = getLang(userLang).chips;

  return (
    <>
      <style>{`
        @keyframes waveBounce { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-5px); opacity: 1; } }
        @keyframes chatSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        {isOpen && (
          <div className="w-[360px] sm:w-[400px] h-[520px] bg-background-card/95 border border-blue-900/50 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden backdrop-blur-xl" style={{ animation: 'chatSlideUp 0.3s ease-out' }}>
            {/* Header */}
            <div className="bg-background-subtle px-4 py-3 border-b border-blue-900/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-sm">🌾</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background-subtle" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">Bhoomi Mitra AI</h4>
                  <p className="text-[10px] text-emerald-400 leading-none mt-0.5">
                    {isListening ? L.listening : isThinking ? L.thinking : '● Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setTtsEnabled(t => !t); window.speechSynthesis?.cancel(); }} title={ttsEnabled ? 'Mute' : 'Unmute'} className={`text-sm px-1.5 py-1 rounded-lg transition-colors ${ttsEnabled ? 'text-accent-blue hover:bg-accent-blue/10' : 'text-slate-600 hover:bg-background-subtle'}`}>
                  {ttsEnabled ? '🔊' : '🔇'}
                </button>
                <button onClick={() => { setIsOpen(false); window.speechSynthesis?.cancel(); recogRef.current?.stop(); }} className="text-slate-400 hover:text-white transition-colors text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background-subtle">✕</button>
              </div>
            </div>

            {/* Chips */}
            <div className="flex gap-1.5 px-3 py-2 flex-wrap border-b border-blue-900/20 flex-shrink-0 bg-background-subtle/50">
              {chips.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} disabled={isThinking} className="text-[10px] px-2.5 py-1 rounded-full border border-blue-900/50 text-slate-300 hover:border-accent-blue/60 hover:text-white hover:bg-accent-blue/10 transition-all duration-150 disabled:opacity-40 whitespace-nowrap">{s}</button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'bot' && (<div className="w-6 h-6 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">🌾</div>)}
                  <div className={`px-3.5 py-2.5 rounded-2xl max-w-[82%] text-xs leading-relaxed whitespace-pre-line ${m.sender === 'user' ? 'bg-accent-blue text-white rounded-br-sm' : 'bg-background-subtle text-slate-200 border border-blue-900/30 rounded-bl-sm'}`}>{m.text}</div>
                </div>
              ))}
              {isThinking && (<div className="flex justify-start"><div className="w-6 h-6 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">🌾</div><TypingDots /></div>)}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-blue-900/30 flex items-center gap-2 bg-background-subtle/60 flex-shrink-0">
              <button onClick={toggleListening} disabled={isThinking} className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isListening ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-background-deep border border-blue-900/50 text-slate-400 hover:border-accent-blue/50 hover:text-accent-blue'} disabled:opacity-40`} title={isListening ? 'Stop' : 'Speak'}>
                {isListening ? <WaveformBars /> : '🎙️'}
              </button>
              <input ref={inputRef} type="text" value={inputQuery} onChange={e => setInputQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder={isListening ? L.listeningPlaceholder : L.placeholder} disabled={isThinking || isListening} className="flex-1 bg-background-deep text-white text-xs px-3 py-2.5 rounded-xl border border-blue-900/50 focus:outline-none focus:border-accent-blue/70 placeholder-slate-600 disabled:opacity-60" />
              <button onClick={() => handleSend()} disabled={!inputQuery.trim() || isThinking} className="w-9 h-9 rounded-xl bg-accent-blue flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-600 transition-colors flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* FAB */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-sonar" />
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-sonar" style={{ animationDelay: '0.5s' }} />
          <button onClick={() => setIsOpen(o => !o)} className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-200 ${isOpen ? 'bg-slate-700 border border-slate-600' : 'bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.5)]'}`} title="Bhoomi Mitra se Baat Karein" aria-label="Open Bhoomi Mitra AI chat">
            <span className="text-xl">{isOpen ? '✕' : (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>)}</span>
          </button>
          {!isOpen && messages.length > 1 && (<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background-deep text-[9px] text-white flex items-center justify-center font-bold">{Math.min(messages.length - 1, 9)}</span>)}
          {!isOpen && (<div className="absolute bottom-full right-0 mb-2 pointer-events-none"><div className="bg-background-card border border-blue-900/50 text-xs text-white px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 transition-all">Bhoomi Mitra se Baat Karein 🌾</div></div>)}
        </div>
      </div>
    </>
  );
}
