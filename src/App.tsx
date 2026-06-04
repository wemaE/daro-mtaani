/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  MOCK_TUTORS,
  MOCK_HUBS,
  CBC_DICTIONARY,
  MOCK_IMPACT,
  PARTNERS
} from './data/mockData';
import { Tutor, Hub, HelpRequest, CbcTerm, Badge } from './types';
import { darasaStorage } from './utils/indexedDb';

// Import our rich subcomponents
import UbuntuEngine from './components/UbuntuEngine';
import HarambeeRouting from './components/HarambeeRouting';
import AIAssistants from './components/AIAssistants';
import Volunteers from './components/Volunteers';
import CreateHelpRequest from './components/CreateHelpRequest';

// Icons
import {
  Home,
  LayoutDashboard,
  Search,
  BookOpen,
  MapPin,
  HeartHandshake,
  Award,
  Wifi,
  WifiOff,
  Sparkles,
  Phone,
  UserCheck,
  Languages,
  RotateCw,
  Clock,
  Menu,
  X,
  Plus,
  Compass,
  Volume2,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'tutors' | 'request-help' | 'hubs' | 'parent-corner' | 'credentials'>('landing');
  
  // Custom states
  const [requests, setRequests] = useState<HelpRequest[]>(darasaStorage.getRequests());
  const [syncQueue, setSyncQueue] = useState<HelpRequest[]>(darasaStorage.getSyncQueue());
  const [isOffline, setIsOffline] = useState<boolean>(darasaStorage.isOffline());
  const [syncLogs, setSyncLogs] = useState<string[]>(darasaStorage.getSyncLogs());
  const [isSyncing, setIsSyncing] = useState<boolean>(darasaStorage.isCurrentlySyncing());

  // Accessibility State
  const [largeText, setLargeText] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceAssistant, setVoiceAssistant] = useState<boolean>(false);

  // Search/Filters in Tutor Discovery
  const [tutorSearch, setTutorSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Interactive computed UPS Score linking directly to support forms
  const [currentCalculatedUPS, setCurrentCalculatedUPS] = useState<number>(6.5);

  // High Density Footer Interactions
  const [wifiRequestStatus, setWifiRequestStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [hubCheckInStatus, setHubCheckInStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  // Update storage notifications
  useEffect(() => {
    const unsub = darasaStorage.subscribe(() => {
      setRequests(darasaStorage.getRequests());
      setSyncQueue(darasaStorage.getSyncQueue());
      setIsOffline(darasaStorage.isOffline());
    });

    const unsubSync = darasaStorage.subscribeSync((logs) => {
      setSyncLogs([...logs]);
      setIsSyncing(darasaStorage.isCurrentlySyncing());
    });

    // Seed mock index if storage is completely empty on initial landing
    if (darasaStorage.getRequests().length === 0) {
      const initialSeed: HelpRequest[] = [
        {
          id: "req-cbd-1",
          studentName: "Mwangi Kamau",
          requestType: "Science",
          description: "Struggling to build a simple water filtration model for grade 4 CBC environmental studies.",
          location: "Mathare Sector 3",
          settlement: "Mathare",
          parentName: "Wanjiku Kamau",
          parentContact: "+254 711 223344",
          ubuntuScore: 8.2,
          status: "assigned",
          createdAt: new Date().toISOString(),
          assignedTutorId: "tut-1",
          assignedHubId: "hub-3"
        },
        {
          id: "req-cbd-2",
          studentName: "Ashiundu Junior",
          requestType: "WiFi Access",
          description: "Needs access to high-speed wifi and tablet devices to submit CBC mathematics homework portal queries.",
          location: "Kibera Soweto East",
          settlement: "Kibera",
          parentName: "Joseph Ashiundu",
          parentContact: "+254 722 334455",
          ubuntuScore: 5.4,
          status: "pending",
          createdAt: new Date().toISOString()
        }
      ];
      darasaStorage.setRequests(initialSeed);
    }

    return () => {
      unsub();
      unsubSync();
    };
  }, []);

  const handleOfflineToggle = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    darasaStorage.setOfflineMode(nextState);
  };

  // Filtered tutors computed on search inputs
  const filteredTutors = useMemo(() => {
    return MOCK_TUTORS.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(tutorSearch.toLowerCase()) || 
                            t.bio.toLowerCase().includes(tutorSearch.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || t.subjects.includes(selectedSubject);
      const matchesLocation = selectedLocation === 'All' || t.location === selectedLocation;
      return matchesSearch && matchesSubject && matchesLocation;
    });
  }, [tutorSearch, selectedSubject, selectedLocation]);

  // Voice player simulated Swahili alert announcements for low-literacy users
  const playSautiGuide = (concept: string) => {
    let utteranceText = "";
    if (concept === 'welcome') {
      utteranceText = "Karibu kwenye Darasa Mtaani. Mtandao wa masomoni unaokuunganisha na walimu wa kujitolea hapa mtaani. Bonyeza vitufe vikubwa kuuliza usaidizi hivi sasa.";
    } else if (concept === 'homework') {
      utteranceText = "Ili uweze kusaidiwa na ticha, tafadhali andika jina la mwanafunzi na upigie ticha wetu simu kwa kubonyeza kitufe cha kijani.";
    } else {
      utteranceText = "Darasa mtaani inakuwezesha kupata masomo bila malipo karibu na nyumbani kwako.";
    }
    const message = new SpeechSynthesisUtterance(utteranceText);
    message.lang = 'sw-KE';
    window.speechSynthesis.speak(message);
  };

  const handleRequestWifi = () => {
    if (wifiRequestStatus !== 'idle') return;
    setWifiRequestStatus('pending');
    setTimeout(() => {
      setWifiRequestStatus('success');
    }, 1200);
  };

  const handleCheckInHub = () => {
    if (hubCheckInStatus !== 'idle') return;
    setHubCheckInStatus('pending');
    setTimeout(() => {
      setHubCheckInStatus('success');
    }, 1000);
  };

  return (
    <div className={`min-h-screen font-sans antialiased text-slate-900 transition-all ${
      highContrast ? 'bg-black text-white selection:bg-yellow-400 selection:text-black' : 'bg-[#F8FAFC]'
    } ${largeText ? 'text-lg' : 'text-sm'}`}>
      
      {/* 1. TOP STATS / EMERGENCY OFFLINE GRID ALERT RECON */}
      <div className={`py-1 px-4 text-center text-xs font-mono font-bold flex flex-wrap justify-between items-center gap-2 border-b transition ${
        isOffline 
          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs' 
          : 'bg-teal-900 text-teal-100 border-teal-950'
      }`}>
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="flex items-center gap-1.5 animate-pulse text-[10px] uppercase">
              <WifiOff className="w-4 h-4 text-slate-950" />
              <span>OFFLINE GRID ON 3G SIMULATION ({syncQueue.length} Queue Lines Pending)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] uppercase">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>ONLINE MTAANI GRID LIVE</span>
            </span>
          )}
        </div>

        {/* Sync logs feedback widget directly visible if syncing to provide realistic 3G status */}
        {isSyncing && (
          <div className="bg-teal-950 text-teal-300 border border-teal-800 rounded px-2 py-0.5 text-[9px] max-w-xs truncate animate-pulse">
            🔄 {syncLogs[syncLogs.length - 1] || 'Syncing records...'}
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px]">
          {/* SIMULATION CONTROLLER FOR NGO AUDIT */}
          <button
            onClick={handleOfflineToggle}
            className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest border transition cursor-pointer ${
              isOffline
                ? 'bg-slate-950 text-amber-400 border-slate-900'
                : 'bg-teal-800 text-teal-200 border-teal-700 hover:bg-teal-700'
            }`}
          >
            {isOffline ? "Connect Grid (Online)" : "Disconnect (Go Offline)"}
          </button>
        </div>
      </div>

      {/* 2. ACCESSIBILITY OVERLAY DRAWER SHORTCUT BAR */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap gap-3 items-center justify-between text-xs z-30 select-none">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-slate-600" />
          <span className="font-bold text-slate-700">Accessibility Controls:</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setLargeText(!largeText)}
            className={`px-3 py-1 rounded-md font-bold border transition ${
              largeText ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            A⁺ Large Text
          </button>
          
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1 rounded-md font-bold border transition ${
              highContrast ? 'bg-yellow-400 text-slate-950 border-yellow-500' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ◐ High Contrast
          </button>

          <button
            onClick={() => {
              setVoiceAssistant(!voiceAssistant);
              if (!voiceAssistant) {
                playSautiGuide('welcome');
              }
            }}
            className={`px-3 py-1 rounded-md font-bold border transition flex items-center gap-1.5 ${
              voiceAssistant ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Sauti Helper (Swahili)</span>
          </button>
        </div>
      </div>

      {/* 3. APP HEADER SHELL */}
      <header className={`sticky top-0 z-20 border-b transition-all ${
        highContrast ? 'bg-black border-yellow-400 border-b-2 text-white' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 px-1">
            <div className="w-10 h-10 bg-[#0F766E] rounded-lg flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F766E] leading-none">DarasaMtaani</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Learning Lives Next Door</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden lg:flex gap-1.5">
              {[
                { id: 'landing', label: 'Home', icon: Home },
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'tutors', label: 'Discovery', icon: Search },
                { id: 'request-help', label: 'Submit Request', icon: Plus },
                { id: 'hubs', label: 'Hubs', icon: MapPin },
                { id: 'parent-corner', label: 'Parent Corner', icon: BookOpen },
                { id: 'credentials', label: 'Credentials', icon: Award }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-50 text-[#0F766E] font-semibold border-teal-100 rounded-full'
                        : 'text-slate-600 border-transparent hover:bg-slate-100 rounded-full'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">Kamau Otieno</p>
                <p className="text-[10px] text-teal-600 font-bold uppercase">Student • Grade 8</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow-sm flex items-center justify-center font-bold text-[10px] text-amber-950 select-none">
                KO
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 4. MAIN SPA WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24" id="main-content-canvas">
        
        {/* TAB 1: LANDING PAGE */}
        {activeTab === 'landing' && (
          <div className="space-y-12 animate-fade-in">
            {/* HERO SECTION */}
            <div className="text-center py-10 max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-black tracking-widest text-teal-700 uppercase bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 shadow-2xs">
                🇰🇪 Decentralized Education For Informal Settlements
              </span>
              
              <h1 className="text-4xl md:text-5xl font-extrabold font-sans text-slate-900 tracking-tight leading-none">
                Connecting vulnerable learners with community learning hubs
              </h1>
              
              <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
                DarasaMtaani (Street Classroom) links Nairobi's kids with volunteer university mentors, shared internet tablets, and resource hubs in Kibera, Mathare, Mukuru, and Kawangware. Fully offline first!
              </p>

              <div className="pt-3 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setActiveTab('request-help')}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm cursor-pointer"
                >
                  Find a Free Local Tutor Now
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 font-semibold px-6 py-3 rounded-xl text-sm transition cursor-pointer"
                >
                  Enter Student Dashboard
                </button>
              </div>
            </div>

            {/* COMMUNITY IMPACT METRICS MOCK */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-2xs">
                <span className="block text-3xl font-extrabold text-teal-700 font-mono">{MOCK_IMPACT.studentsServed}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">Students Served</span>
              </div>
              <div className="bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-2xs">
                <span className="block text-3xl font-extrabold text-teal-700 font-mono">{MOCK_IMPACT.tutorsActive}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">Active Tutors</span>
              </div>
              <div className="bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-2xs">
                <span className="block text-3xl font-extrabold text-teal-700 font-mono">{MOCK_IMPACT.volunteerHours} hrs</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">Volunteer Hours</span>
              </div>
              <div className="bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-2xs">
                <span className="block text-3xl font-extrabold text-teal-700 font-mono">{MOCK_IMPACT.learningHubsActive}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">Learning Hubs</span>
              </div>
              <div className="bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-2xs col-span-2 md:col-span-1">
                <span className="block text-3xl font-extrabold text-teal-700 font-mono">{MOCK_IMPACT.sessionsCompleted}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">Sessions Done</span>
              </div>
            </div>

            {/* INTEGRATED DYNAMIC UBUNTU CALCULATOR PREVIEW */}
            <div className="space-y-4">
              <span className="block text-xs font-black tracking-widest text-teal-700 uppercase">
                ⚙️ Direct Interactive Priority Tool
              </span>
              <UbuntuEngine onScoreChange={(score) => setCurrentCalculatedUPS(score)} />
            </div>

            {/* HOW IT WORKS */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 space-y-8">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <h3 className="text-xl font-bold text-slate-900 font-sans tracking-tight">How DarasaMtaani Works</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Our system relies on grass-root community collaboration to bridge learning divides efficiently.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 font-extrabold flex items-center justify-center font-mono">1</span>
                  <h4 className="text-sm font-bold text-slate-900">Define Equity UPS Needs</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Parents or tutors calculate the Ubuntu Priority Score (UPS) mapping socio-economic and material variables, sorting high vulnerability students first.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 font-extrabold flex items-center justify-center font-mono">2</span>
                  <h4 className="text-sm font-bold text-slate-900">Harambee Spatial Routing</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Our GIS engine finds closest partner centers like SHOFCO while routing traffic away from hub capacity jams to keep study schedules smooth.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 font-extrabold flex items-center justify-center font-mono">3</span>
                  <h4 className="text-sm font-bold text-slate-900">Offline-First Delivery</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tutors schedule homework runs offline. When connected, details sync up, generating certifications and academic records on the shared database grid.
                  </p>
                </div>
              </div>
            </div>

            {/* PARTNER LOGOS BAR */}
            <div className="text-center space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Supported by Community Organizations</span>
              <div className="flex flex-wrap justify-center items-center gap-6">
                {PARTNERS.map(p => (
                  <div key={p.name} className="flex items-center gap-2 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition">
                    <div className="w-8 h-8 rounded bg-teal-700 flex items-center justify-center font-black text-white text-xs">
                      {p.logoText}
                    </div>
                    <div className="text-left leading-none">
                      <span className="block text-xs font-bold text-slate-900">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PWA CUSTOM PROMPT */}
            <div className="bg-gradient-to-r from-teal-900 to-teal-950 p-6 rounded-2xl text-white border border-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-base font-extrabold">Save DarasaMtaani to your Android Home Screen</h3>
                <p className="text-xs text-teal-200 mt-0.5">
                  Continues to function completely offline without internet or continuous 3G data. Uses only 4MB storage.
                </p>
              </div>
              <button
                type="button"
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer"
                onClick={() => alert("To save on Android: Tap the three dots on your Chrome menu bar, and click 'Install App' or 'Add to Home Screen'.")}
              >
                Get PWA Applet
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Student Study Dashboard</h2>
                <p className="text-xs text-slate-500">Welcome back, Ephraim. Check your active lessons and community study points.</p>
              </div>

              {/* MOCK UBUNTU SCORE CARD */}
              <div className="bg-teal-50 border border-teal-100 px-4 py-2 rounded-xl flex items-center gap-3">
                <span className="text-[10px] tracking-wider uppercase font-black text-teal-800">Your Study UPS:</span>
                <span className="text-base font-extrabold text-teal-700 font-mono">6.5 (High Priority)</span>
              </div>
            </div>

            {/* ACTIVE APP ASSIGNMENT PROGRESS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Assigned Tutors</span>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 font-extrabold text-white flex items-center justify-center text-sm">
                    AO
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Amina Omondi</h4>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Mathematics Speciality</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Cell: +254 712 345678</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between gap-1 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-700" /> Next: Saturday 10:00 AM</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assigned Resource Center</span>
                
                <div>
                  <h4 className="text-base font-bold text-slate-900">SHOFCO Kibera Hub</h4>
                  <span className="text-xs text-slate-500 block">Kibera Settlement sector 3</span>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 rounded inline-block mt-1">72% Capacity status (Available)</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-1 items-center">
                  <span className="text-[10px] text-slate-500">Resources reserved: WiFi Access, study tablets</span>
                </div>
              </div>

              <div className="bg-white border border-slate-150 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">My Grade 4 CBC Goals</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">Math patterns booklet</span>
                      <span className="text-teal-700 font-bold">80% Done</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('parent-corner')}
                  className="w-full text-center text-xs font-bold text-teal-700 hover:text-teal-900 pt-3 border-t border-slate-100 mt-2 cursor-pointer"
                >
                  Manage My Curricular Materials →
                </button>
              </div>
            </div>

            {/* SMART RECOMMENDATIONS LISTS */}
            <div className="space-y-4">
              <span className="block text-xs font-black tracking-widest text-slate-600 uppercase">
                🧠 Dynamic Learning Pathways
              </span>
              <AIAssistants />
            </div>
          </div>
        )}

        {/* TAB 3: TUTOR DISCOVERY */}
        {activeTab === 'tutors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Discover Mtaani Volunteer Tutors</h2>
                <p className="text-xs text-slate-500">Search and filters specialized science, algebra, and competency tutors near your sector.</p>
              </div>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Search by keyword</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tutorSearch}
                    onChange={(e) => setTutorSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500"
                    placeholder="Search name, bio..."
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Subject Specialization</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500"
                >
                  <option value="All">All Subject Specialties</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science (Environmental/Foundational)</option>
                  <option value="CBC Project">CBC Craft Projects</option>
                  <option value="Mentorship">Mentorship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Settlement/Grid</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500"
                >
                  <option value="All">All Settlements</option>
                  <option value="Kibera">Kibera</option>
                  <option value="Mathare">Mathare</option>
                  <option value="Mukuru">Mukuru</option>
                  <option value="Kawangware">Kawangware</option>
                </select>
              </div>
            </div>

            {/* CARD GRID LAYOUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutors.map(tutor => (
                <div key={tutor.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-sm transition">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-teal-800 text-white font-extrabold flex items-center justify-center text-sm shadow-xs select-none">
                          {tutor.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-950">{tutor.name}</h3>
                          <span className="text-[10px] text-slate-500 block font-mono">Distance: {tutor.distanceKm} km ({tutor.location})</span>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded-full">
                        ★ {tutor.rating}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{tutor.bio}</p>

                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Teaching Specialities:</span>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map(sub => (
                          <span key={sub} className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
                      <span>Available: {tutor.availability.join(', ')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    <a
                      href={`tel:${tutor.phone}`}
                      onClick={() => playSautiGuide('call')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 rounded-lg transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Tutor On Grid</span>
                    </a>
                  </div>
                </div>
              ))}

              {filteredTutors.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white border border-dashed rounded-xl p-8 flex flex-col items-center justify-center">
                  <BookOpen className="w-10 h-10 text-slate-350 mb-2 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-800">No active tutors matched your search mtaani</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Try removing some subject or locality filters to display more grid volunteers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REQUEST HELP FORM AND LEDGER */}
        {activeTab === 'request-help' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form panel */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">Request Local Homework Help</h2>
                  <p className="text-xs text-slate-500">Enter student details. If you are offline, details are stored securely on the phone and auto-synced upon reaching school WiFi zones.</p>
                </div>
                <CreateHelpRequest defaultUbuntuScore={currentCalculatedUPS} />
              </div>

              {/* Grid ledger results panel */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Active Settlement Request Ledger</span>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded font-bold">
                    {requests.length + syncQueue.length} Active Records
                  </span>
                </div>

                {/* Offline synchronized warning */}
                {syncQueue.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-extrabold text-amber-800 tracking-wider uppercase">OFFLINE TRANSMISSION QUEUE ({syncQueue.length} items)</h4>
                      <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
                        These help requests are safely locked inside the local browser storage due to weak cellular signals. They will be shared on the physical community learning networks immediately upon toggling "Connect Grid (Online)" above or visiting community hubs.
                      </p>
                      
                      <div className="mt-2 space-y-1.5">
                        {syncQueue.map((item, id) => (
                          <div key={id} className="bg-white/80 p-2 rounded border border-amber-200/50 flex justify-between text-[11px] font-mono">
                            <span className="font-bold text-slate-800">{item.studentName} ({item.requestType})</span>
                            <span className="text-amber-700 uppercase font-black">Waiting Sync</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3.5">
                  {requests.map(req => {
                    const matchedTutor = MOCK_TUTORS.find(t => t.id === req.assignedTutorId);
                    const matchedHub = MOCK_HUBS.find(h => h.id === req.assignedHubId);
                    
                    return (
                      <div key={req.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 space-y-3 hover:shadow-2xs transition">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[9px] font-bold tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase mr-1.5">
                              {req.requestType}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-950 mt-1">{req.studentName}</h4>
                            <span className="text-[10px] text-slate-500 font-medium">{req.location} ({req.settlement})</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-mono">Ubuntu Score</span>
                            <span className="text-xs font-extrabold text-amber-600 font-mono">
                              UPS {req.ubuntuScore}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">"{req.description}"</p>

                        {/* Assignment Details */}
                        {req.status === 'assigned' && matchedTutor && matchedHub ? (
                          <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-150/70 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            <div>
                              <span className="block text-[9px] text-teal-800 font-mono font-bold uppercase tracking-wider">Assigned Grid Tutor</span>
                              <span className="text-xs font-bold text-slate-900 block mt-0.5">{matchedTutor.name}</span>
                              <span className="text-[10px] text-slate-500 block">Cell: {matchedTutor.phone}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-teal-800 font-mono font-bold uppercase tracking-wider font-sans">Scheduled Study Hub</span>
                              <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">{matchedHub.name}</span>
                              <span className="text-[10px] text-slate-500 block">{matchedHub.walkingDistanceMins} mins walking distance</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-2">
                            <RotateCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                            <span>Awaiting grid triage matching algorithm run...</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMMUNITY LEARNING HUBS */}
        {activeTab === 'hubs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Community Learning Hubs Grid</h2>
                <p className="text-xs text-slate-500">Discover vetted physical centers containing computers, power, water and study mentors across the sectors.</p>
              </div>
            </div>

            {/* HARAMBEE SPATIAL ROUTING MAP PREVIEW INTEGRATED */}
            <HarambeeRouting />

            {/* HUBS LIST TABLE CARD */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 space-y-4">
              <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Available Learning Centers Registry</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_HUBS.map(hub => {
                  const isOverloaded = hub.capacityStatus > 80;
                  return (
                    <div
                      key={hub.id}
                      className={`p-4 rounded-xl border transition ${
                        isOverloaded
                          ? 'border-rose-100 bg-rose-50/20'
                          : 'border-slate-150 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-950">{hub.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono font-bold inline-block mt-0.5">{hub.settlement} Sector</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-slate-400 font-mono font-bold uppercase">CAPACITY</span>
                          <span className={`text-xs font-bold font-mono ${isOverloaded ? 'text-rose-600' : 'text-teal-700'}`}>
                            {hub.capacityStatus}% Status
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {hub.availableAssets.map(asset => (
                          <span key={asset} className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                            {asset}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-150/60 flex justify-between text-[11px] font-mono text-slate-500">
                        <span>Walking Prox: {hub.walkingDistanceMins} Mins</span>
                        <span>Holds: {hub.currentCapacity} / {hub.maxCapacity} Kids</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PARENT SUPPORT CENTER CORNER */}
        {activeTab === 'parent-corner' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Mtaani Parent Corner</h2>
                <p className="text-xs text-slate-500">Simplifying CBC complexity, translating school curriculum jargon with friendly audio explanations in Swahili and Sheng.</p>
              </div>
              <button
                type="button"
                onClick={() => playSautiGuide('welcome')}
                className="bg-teal-50 text-teal-700 text-xs font-bold border border-teal-150 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Simulate Swahili Voice Assistant Guide</span>
              </button>
            </div>

            {/* INTEGRATING THE EXHAUSTIVE CBC DICTIONARY AND TRANSLATOR TOOL HERE */}
            <AIAssistants />
          </div>
        )}

        {/* TAB 7: CREDENTIAL CREDENTIALS */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">Volunteer Portfolio & Digital Achievements</h2>
              <p className="text-xs text-slate-500">Verify badge metrics, and download standard print-to-PDF community learning certificates.</p>
            </div>
            <Volunteers />
          </div>
        )}

      </main>

      {/* 4.5 MASTER TOAST SUCCESS NOTIFIERS */}
      {(wifiRequestStatus !== 'idle' || hubCheckInStatus !== 'idle') && (
        <div className="fixed bottom-20 right-6 z-50 max-w-sm animate-fade-in space-y-2 select-none">
          {wifiRequestStatus === 'pending' && (
            <div className="bg-[#0F172A] text-white text-xs font-mono font-bold p-3.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>TRANSMITTING 3G PACKET: REQUESTING COGNITIVE BROADBAND...</span>
            </div>
          )}
          {wifiRequestStatus === 'success' && (
            <div className="bg-white text-slate-900 text-xs font-sans font-bold p-4 rounded-xl shadow-2xl border-l-4 border-amber-500 flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-start gap-3">
                <span className="text-amber-800 uppercase tracking-wide text-[10px] font-black">📶 Emergency Voucher Issued</span>
                <button onClick={() => setWifiRequestStatus('idle')} className="text-slate-400 hover:text-slate-600 font-bold text-[10px]">✕</button>
              </div>
              <p className="text-slate-600 text-[11px] font-normal leading-relaxed">
                Ruben Centre access ticket generated: <code className="bg-slate-100 text-slate-800 px-1 py-0.2 rounded font-mono font-bold">DM-WIFI-MTAANI-77</code>.
                Use to bypass cap filters on local hotspot lines. Valid status: Active for 4 hours.
              </p>
            </div>
          )}

          {hubCheckInStatus === 'pending' && (
            <div className="bg-[#0F172A] text-white text-xs font-mono font-bold p-3.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>ROUTING GIS CHECK-IN CREDENTIALS TO HUB REPOSITORY...</span>
            </div>
          )}
          {hubCheckInStatus === 'success' && (
            <div className="bg-white text-slate-900 text-xs font-sans font-bold p-4 rounded-xl shadow-2xl border-l-4 border-teal-600 flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-start gap-3">
                <span className="text-teal-800 uppercase tracking-wide text-[10px] font-black">✓ Successfully Verified</span>
                <button onClick={() => setHubCheckInStatus('idle')} className="text-slate-400 hover:text-slate-600 font-bold text-[10px]">✕</button>
              </div>
              <p className="text-slate-600 text-[11px] font-normal leading-relaxed">
                Welcome back to DarasaMtaani! Geolocation validated at settlement sector. Your offline activity points synchronizer token has been allocated.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. DESKTOP-FRIENDLY COMPACT FOOTER */}
      <footer className="hidden lg:flex fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-6 items-center justify-between z-20 select-none">
        <div className="flex space-x-4 items-center">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-700/80 flex items-center justify-center text-white text-[9px] font-black">KO</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-400/85 flex items-center justify-center text-amber-950 text-[9px] font-black">AM</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-500/80 flex items-center justify-center text-white text-[9px] font-black">JC</div>
          </div>
          <p className="text-xs font-semibold text-slate-600">+14 students currently studying at Ruben Centre</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRequestWifi}
            disabled={wifiRequestStatus === 'pending'}
            className="px-6 py-2.5 bg-[#F59E0B] text-white font-bold rounded-xl shadow-amber-200 hover:bg-[#D97706] transition duration-200 uppercase text-xs tracking-wider cursor-pointer font-sans select-none"
            style={{ boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)' }}
          >
            {wifiRequestStatus === 'pending' ? 'Sending Request...' : 'Request Emergency WiFi'}
          </button>
          <button
            onClick={handleCheckInHub}
            disabled={hubCheckInStatus === 'pending'}
            className="px-6 py-2.5 bg-[#0F766E] text-white font-bold rounded-xl shadow-teal-200 hover:bg-[#0D5C56] transition duration-200 uppercase text-xs tracking-wider cursor-pointer font-sans select-none"
            style={{ boxShadow: '0 4px 14px 0 rgba(15, 118, 110, 0.25)' }}
          >
            {hubCheckInStatus === 'pending' ? 'Verifying...' : 'Check-in to Hub'}
          </button>
        </div>
      </footer>

      {/* 5. MOBILE-FIRST FLUID BOTTOM NAVIGATION BAR BAR */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2.5 px-4 shadow-lg z-20 block lg:hidden select-none">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {[
            { id: 'landing', label: 'Home', icon: Home },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'tutors', label: 'Tutors', icon: Search },
            { id: 'request-help', label: 'Request', icon: Plus },
            { id: 'hubs', label: 'Hubs', icon: MapPin },
            { id: 'parent-corner', label: 'Parents', icon: BookOpen },
            { id: 'credentials', label: 'CV', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (voiceAssistant) {
                    playSautiGuide(tab.id);
                  }
                }}
                className="flex flex-col items-center gap-0.5 focus:outline-none cursor-pointer"
              >
                <div className={`p-1.5 rounded-full transition-all ${
                  isSelected ? 'bg-teal-700 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-bold ${
                  isSelected ? 'text-teal-800 font-extrabold' : 'text-slate-500'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
