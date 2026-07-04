import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { LANDMARKS, Landmark, getLandmarksBySettlement } from './lib/landmarks';
import {
  MOCK_TUTORS,
  MOCK_HUBS,
  CBC_DICTIONARY,
  MOCK_IMPACT,
  PARTNERS
} from './data/mockData';
import { Tutor, Hub, HelpRequest, CbcTerm, Badge } from './types';
import { darasaStorage } from './utils/indexedDb';
import { scoutAcademicMatch } from './lib/agents/scout';
import { guardianFilterAndRoute } from './lib/agents/guardian';
import { hunterFinalizeMatch } from './lib/agents/hunter';
import {
  PillButton,
  LanguageRow,
  BadgeCard,
  SessionCard,
  AvatarCircle,
  BottomNav,
  OnboardingSlide
} from './components/UI';

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
  Plus,
  Compass,
  Volume2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Download,
  Share2,
  ShoppingCart,
  CheckCircle,
  Settings,
  Heart,
  User as UserIcon,
  Trash2,
  Moon,
  Sun,
  Eye,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Helper to parse route from location hash
  const getRouteFromHash = (): string => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'landing';
  };

  // Navigation & Routing States
  // 'landing' | 'login-student' | 'login-parent' | 'login-tutor' | 'login-admin' | 'reset-password' | 'intake' | 'preferences' | 'dashboard' | 'agents' | 'hubs' | 'badges' | 'parent' | 'admin-council' | 'settings'
  const [currentRoute, _setCurrentRoute] = useState<string>(getRouteFromHash());
  const [routeHistory, setRouteHistory] = useState<string[]>([getRouteFromHash()]);

  // Onboarding States
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('daro_onboarded') === 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Swahili');

  // Synchronize browser history and hash navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const targetRoute = event.state?.route || getRouteFromHash();
      _setCurrentRoute(targetRoute);
      setRouteHistory(prev => {
        const idx = prev.indexOf(targetRoute);
        if (idx !== -1) {
          return prev.slice(0, idx + 1);
        }
        return [...prev, targetRoute];
      });
    };

    const handleHashChange = () => {
      const targetRoute = getRouteFromHash();
      _setCurrentRoute(targetRoute);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial hash if not set
    if (!window.location.hash) {
      window.history.replaceState({ route: 'landing' }, '', '#landing');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const setCurrentRoute = (route: string) => {
    setRouteHistory(prev => {
      if (prev[prev.length - 1] === route) return prev;
      return [...prev, route];
    });
    _setCurrentRoute(route);
    if (getRouteFromHash() !== route) {
      window.history.pushState({ route }, '', `#${route}`);
    }
  };

  const navigateBack = () => {
    window.history.back();
  };
  
  // Auth state
  const [userRole, setUserRole] = useState<'student' | 'parent' | 'tutor' | 'admin' | null>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('Mwanafunzi Mkuu');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [tutorVerified, setTutorVerified] = useState<boolean>(false);

  // Settings & Theme Simulation
  const [currentTheme, setCurrentTheme] = useState<'yellow' | 'blue' | 'forest'>('yellow');
  const [newPassword, setNewPassword] = useState<string>('');

  // Preferences state
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);

  // Wishlist & Off-canvas cart
  const [showOffCanvas, setShowOffCanvas] = useState<boolean>(false);
  const [wishlistTutors, setWishlistTutors] = useState<string[]>(['tut-1']); // holds tutor IDs
  const [offlineCart, setOfflineCart] = useState<string[]>(['cbc-math-g4']); // holds curriculum pack IDs
  const [cartDownloadState, setCartDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');

  // Intake Questionnaire States
  const [intakeStep, setIntakeStep] = useState<number>(1);
  const [intakeRole, setIntakeRole] = useState<string>('student');
  const [timePovertyScore, setTimePovertyScore] = useState<number>(5);
  const [materialDeficitScore, setMaterialDeficitScore] = useState<number>(5);
  const [selectedSettlement, setSelectedSettlement] = useState<'Kibera' | 'Mathare' | 'Mukuru' | 'Kawangware'>('Kibera');
  const [selectedLandmarkCode, setSelectedLandmarkCode] = useState<string>('KBR-SOWETO');

  // App data/states
  const [requests, setRequests] = useState<HelpRequest[]>(darasaStorage.getRequests());
  const [syncQueue, setSyncQueue] = useState<HelpRequest[]>(darasaStorage.getSyncQueue());
  const [isOffline, setIsOffline] = useState<boolean>(darasaStorage.isOffline());

  // Accessibility State
  const [largeText, setLargeText] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceAssistant, setVoiceAssistant] = useState<boolean>(false);

  // Hub Asset Filter State
  const [activeAssetFilter, setActiveAssetFilter] = useState<string>('All');
  // CBC Dictionary Search
  const [cbcSearch, setCbcSearch] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string>(CBC_DICTIONARY[0].term);
  const [translationLang, setTranslationLang] = useState<'English' | 'Swahili' | 'Sheng'>('Swahili');

  // Elder approval PIN entry
  const [selectedSessionToApprove, setSelectedSessionToApprove] = useState<string | null>(null);
  const [elderPinInput, setElderPinInput] = useState<string>('');

  // Simulated alerts
  const [wifiRequestStatus, setWifiRequestStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [hubCheckInStatus, setHubCheckInStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  const curriculumPacks = [
    { id: 'cbc-math-g4', name: 'Grade 4 CBC Mathematics Pack', size: '1.2MB' },
    { id: 'cbc-sci-g4', name: 'Grade 4 Science & Environment Pack', size: '1.8MB' },
    { id: 'cbc-lugha-g5', name: 'Grade 5 Kiswahili Lugha Kit', size: '950KB' }
  ];

  // Load initial requests
  useEffect(() => {
    const unsub = darasaStorage.subscribe(() => {
      setRequests(darasaStorage.getRequests());
      setSyncQueue(darasaStorage.getSyncQueue());
      setIsOffline(darasaStorage.isOffline());
    });
    return () => unsub();
  }, []);

  const playVoiceAnnounce = (text: string) => {
    if (!voiceAssistant) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sw-KE';
    window.speechSynthesis.speak(utterance);
  };

  const handleOfflineToggle = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    darasaStorage.setOfflineMode(nextState);
  };

  // Cart operations
  const handleToggleCartItem = (packId: string) => {
    if (offlineCart.includes(packId)) {
      setOfflineCart(offlineCart.filter(id => id !== packId));
    } else {
      setOfflineCart([...offlineCart, packId]);
    }
  };

  const handleToggleWishlist = (tutorId: string) => {
    if (wishlistTutors.includes(tutorId)) {
      setWishlistTutors(wishlistTutors.filter(id => id !== tutorId));
    } else {
      setWishlistTutors([...wishlistTutors, tutorId]);
    }
  };

  const handleDownloadOfflineCart = () => {
    if (offlineCart.length === 0) return;
    setCartDownloadState('downloading');
    setTimeout(() => {
      setCartDownloadState('completed');
      alert("Successfully downloaded select package nodes to local PWA IndexedDB cache! Available for offline grid use.");
      setOfflineCart([]);
      setCartDownloadState('idle');
    }, 1500);
  };

  // Auth Simulation Handlers
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPhone) return;
    setOtpSent(true);
    playVoiceAnnounce("Tumetuma nambari ya siri kwenye simu yako.");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    
    let role: 'student' | 'parent' | 'tutor' | 'admin' = 'student';
    if (currentRoute === 'login-parent') role = 'parent';
    if (currentRoute === 'login-tutor') role = 'tutor';
    
    setUserRole(role);
    setOtpSent(false);

    if (role === 'tutor') {
      setTutorVerified(false);
      setCurrentRoute('dashboard');
    } else {
      // Go to preferences selection onboarding first
      setCurrentRoute('preferences');
    }
    playVoiceAnnounce("Kuingia kumesababishwa kikamilifu.");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Simulated reset link sent via SMS OTP! Please check your mobile device.");
    setCurrentRoute('landing');
  };

  const handleSavePreferences = () => {
    setCurrentRoute('intake');
    setIntakeStep(1);
    playVoiceAnnounce("Tafadhali kamilisha maswali ya usajili.");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile configurations updated locally!");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail && adminPassword) {
      setUserRole('admin');
      setCurrentRoute('admin-council');
      playVoiceAnnounce("Karibu kwenye baraza la wazee.");
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserPhone('');
    setOtpSent(false);
    setOtpCode('');
    setCurrentRoute('landing');
  };

  // Calculate UPS Score
  const calculatedUPS = useMemo(() => {
    return (timePovertyScore * 0.5 + materialDeficitScore * 0.5) * 10;
  }, [timePovertyScore, materialDeficitScore]);

  const submitIntake = () => {
    const score = calculatedUPS;
    const landmarkObj = LANDMARKS.find(l => l.code === selectedLandmarkCode);
    const newRequest: HelpRequest = {
      id: `req-${Date.now()}`,
      studentName: profileName,
      requestType: 'Mathematics',
      description: "Registration session request via intake form.",
      location: landmarkObj ? landmarkObj.name : "Landmark",
      settlement: selectedSettlement,
      parentName: "Mzazi",
      parentContact: userPhone,
      ubuntuScore: score,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    darasaStorage.setRequests([newRequest, ...darasaStorage.getRequests()]);
    setCurrentRoute('dashboard');
  };

  const handleElderPinApproval = (sessionId: string) => {
    if (elderPinInput === "1234") {
      const updatedRequests = requests.map(req => {
        if (req.id === sessionId) {
          return { ...req, status: 'assigned' as const, assignedTutorId: 'tut-1', assignedHubId: 'hub-1' };
        }
        return req;
      });
      darasaStorage.setRequests(updatedRequests);
      setSelectedSessionToApprove(null);
      setElderPinInput('');
      alert("Session successfully approved by Elders Council PIN!");
    } else {
      alert("Invalid Elder PIN.");
    }
  };

  // Theme settings mapping
  const themeClasses = {
    yellow: {
      bg: highContrast ? 'bg-black text-white' : 'bg-[#E7E27C]',
      text: highContrast ? 'text-white' : 'text-[#35477B]',
      card: 'bg-[#FDFCE5] border-2 border-[#35477B]/20',
      btn: 'bg-[#35477B] text-white hover:bg-[#253258]'
    },
    blue: {
      bg: 'bg-[#35477B]',
      text: 'text-white',
      card: 'bg-[#253258] border border-blue-400/20',
      btn: 'bg-[#E7E27C] text-[#35477B] hover:bg-yellow-300'
    },
    forest: {
      bg: 'bg-[#0A4A3C]',
      text: 'text-white',
      card: 'bg-[#063028] border border-emerald-500/25',
      btn: 'bg-[#E8A020] text-forest-dark hover:bg-amber-400'
    }
  };

  const tc = themeClasses[currentTheme];

  const filteredHubs = useMemo(() => {
    return MOCK_HUBS.filter(hub => {
      if (activeAssetFilter === 'All') return true;
      return hub.availableAssets.includes(activeAssetFilter);
    });
  }, [activeAssetFilter]);

  const activeTermObject = CBC_DICTIONARY.find(term => term.term === selectedWord) || CBC_DICTIONARY[0];

  const navigationTabs = useMemo(() => {
    const tabs = [
      { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
      { id: 'hubs', label: 'Hubs', icon: MapPin }
    ];
    if (userRole === 'tutor') {
      tabs.push({ id: 'badges', label: 'Badges', icon: Award });
    }
    if (userRole === 'parent') {
      tabs.push({ id: 'parent', label: 'Parent', icon: BookOpen });
    }
    return tabs;
  }, [userRole]);

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0D0D0D] rounded-3xl overflow-hidden shadow-2xl relative border border-[#262626] aspect-[9/16] flex flex-col justify-between p-6">
          {onboardingStep === 1 && (
            <div className="flex-1 flex flex-col justify-between text-[#0D0D0D] bg-[#E1E8E6] -m-6 p-6 rounded-3xl animate-fade-in animate-duration-300">
              <div className="flex justify-end">
                <button onClick={() => { setIsOnboarded(true); localStorage.setItem('daro_onboarded', 'true'); }} className="text-sm font-bold opacity-60">Skip</button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-48 h-48">
                  {/* Student SVG Illustration */}
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="80" fill="#D4DDD9" />
                    <rect x="70" y="90" width="60" height="70" rx="8" fill="#35477B" />
                    <circle cx="100" cy="70" r="25" fill="#FAD2A6" />
                    <path d="M75 90 C75 75, 125 75, 125 90" fill="#35477B" />
                    <rect x="85" y="110" width="30" height="40" fill="#FFFFFF" rx="2" />
                    <line x1="90" y1="120" x2="110" y2="120" stroke="#35477B" strokeWidth="2" />
                    <line x1="90" y1="130" x2="110" y2="130" stroke="#35477B" strokeWidth="2" />
                  </svg>
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-extrabold tracking-tight">Speak with Confidence</h2>
                  <p className="text-xs opacity-80 leading-relaxed max-w-xs mx-auto">Express your thoughts clearly, trust your voice, and communicate your ideas with clarity, strength, and self-belief.</p>
                </div>
              </div>
              <PillButton onClick={() => setOnboardingStep(2)} variant="primary">Get Started</PillButton>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="flex-1 flex flex-col justify-between text-[#0D0D0D] bg-[#FAD2A6] -m-6 p-6 rounded-3xl animate-fade-in animate-duration-300">
              <div className="flex justify-between items-center">
                <button onClick={() => setOnboardingStep(1)} className="text-sm font-bold opacity-60">Back</button>
                <button onClick={() => { setIsOnboarded(true); localStorage.setItem('daro_onboarded', 'true'); }} className="text-sm font-bold opacity-60">Skip</button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-48 h-48">
                  {/* Star Mascot SVG Illustration */}
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <path d="M100 20 L120 70 L170 70 L130 100 L150 150 L100 120 L50 150 L70 100 L30 70 L80 70 Z" fill="#F59E0B" />
                    <circle cx="85" cy="80" r="4" fill="#000" />
                    <circle cx="115" cy="80" r="4" fill="#000" />
                    <path d="M90 95 Q100 105 110 95" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-extrabold tracking-tight">Lessons Made for You</h2>
                  <p className="text-xs opacity-80 leading-relaxed max-w-xs mx-auto">Personalized lessons adapt to your goals, level, and schedule to help you learn faster and confidently today.</p>
                </div>
              </div>
              <PillButton onClick={() => setOnboardingStep(3)} variant="primary">Choose a Language</PillButton>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="flex-1 flex flex-col justify-between text-white bg-[#0D0D0D] -m-6 p-6 rounded-3xl animate-fade-in animate-duration-300">
              <div className="flex items-center">
                <button onClick={() => setOnboardingStep(2)} className="text-sm font-bold opacity-60">Back</button>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-6 py-4">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-extrabold tracking-tight">What Language Do You Want to Learn?</h2>
                  <p className="text-xs text-gray-400">Select your preferred instruction language.</p>
                </div>
                <div className="space-y-2">
                  <LanguageRow flag="🇰🇪" name="Swahili" selected={selectedLanguage === 'Swahili'} onClick={() => setSelectedLanguage('Swahili')} />
                  <LanguageRow flag="🇬🇧" name="English" selected={selectedLanguage === 'English'} onClick={() => setSelectedLanguage('English')} />
                  <LanguageRow flag="🇰🇪" name="Sheng" selected={selectedLanguage === 'Sheng'} onClick={() => setSelectedLanguage('Sheng')} />
                  <LanguageRow flag="🇫🇷" name="French" selected={selectedLanguage === 'French'} onClick={() => setSelectedLanguage('French')} />
                </div>
              </div>
              <PillButton onClick={() => { setIsOnboarded(true); localStorage.setItem('daro_onboarded', 'true'); }} variant="primary">Continue</PillButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans bg-[#0D0D0D] text-gray-250 transition-all duration-300 ${largeText ? 'text-lg' : 'text-sm'}`}>
      
      {/* 1. TOP BRAND HEADER */}
      <header className="sticky top-0 z-30 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#262626] py-3.5 px-4 shadow-sm text-white">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {routeHistory.length > 1 && (
              <button
                onClick={navigateBack}
                className="p-1.5 rounded-full hover:bg-[#171717] text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => { setCurrentRoute('landing'); setUserRole(null); setRouteHistory(['landing']); }} title="Go to Home/Landing">
              {/* Coral Red Book Logo SVG based on attached brand concept */}
              <svg className="w-8 h-6 shrink-0 animate-pulse" viewBox="0 0 100 80" fill="none">
                <path d="M10 10 C30 10, 48 20, 48 70 C48 70, 30 50, 10 50 Z" fill="#E8462A" />
                <path d="M90 10 C70 10, 52 20, 52 70 C52 70, 70 50, 90 50 Z" fill="#E8462A" />
              </svg>
              <div>
                <h1 className="text-base font-black tracking-tight text-white leading-none">Darasa MTAANI</h1>
                <span className="text-[9px] text-[#E8462A] font-bold uppercase tracking-wider">Learning Lives Next Door</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {userRole && (
              <button
                onClick={() => setCurrentRoute('settings')}
                className="p-1.5 rounded-full hover:bg-[#171717] text-gray-400 hover:text-white cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Cart/Wishlist Off-canvas Toggle */}
            <button
              onClick={() => setShowOffCanvas(true)}
              className="relative p-1.5 rounded-full hover:bg-[#171717] text-gray-400 hover:text-white cursor-pointer"
              title="Cart & Wishlist"
            >
              <ShoppingCart className="w-4 h-4" />
              {(offlineCart.length + wishlistTutors.length) > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E8462A] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {offlineCart.length + wishlistTutors.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. OFFLINE STATUS HEADER */}
      <div className="bg-[#171717] text-[#F59E0B] border-b border-[#262626] text-[10px] text-center py-1.5 font-bold">
        {isOffline ? "🚨 Simulation Mode: Offline Grid Active" : "📶 Connected to Nairobi Harambee Grid"}
        <button onClick={handleOfflineToggle} className="underline ml-2 text-white hover:text-[#E8462A] cursor-pointer">
          {isOffline ? "Go Online" : "Go Offline"}
        </button>
      </div>

      {/* 3. MAIN CONTAINER */}
      <main className="max-w-md mx-auto px-4 py-6 pb-28">
        
        {/* ROUTE 1: LANDING PAGE */}
        {currentRoute === 'landing' && (
          <div className="space-y-6 animate-fade-in">
            {/* Banner image with Fredoka font styled */}
            <div className="rounded-2xl overflow-hidden border-2 border-[#35477B] bg-white">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800"
                alt="Community Hub Study"
                className="w-full h-44 object-cover"
              />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Harambee Educational Grid</h2>
              <p className="text-xs opacity-90 leading-relaxed max-w-sm mx-auto">
                Decentralized learning connecting Mathare, Kibera, Mukuru, and Kawangware volunteers with local students.
              </p>
            </div>

            {/* ABOUT DARASAMTAANI SECTION */}
            <div className={`${tc.card} p-5 rounded-xl space-y-4 bg-white/40`}>
              <h3 className="text-sm font-black text-[#35477B] border-b pb-2">
                Kuhusu DarasaMtaani — Darasa la Mtaani kwa Kila Mtoto
              </h3>
              <p className="text-[11px] opacity-90 leading-relaxed">
                <strong>DarasaMtaani</strong> (&quot;Street Classroom&quot;) is a mobile-first community learning network connecting underserved primary school students in Nairobi&apos;s informal settlements — Mathare, Kibera, Mukuru, and Kawangware — with vetted local volunteer tutors and nearby community resource hubs.
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Built for Kenya&apos;s Competency-Based Curriculum (CBC) era, DarasaMtaani works without expensive devices, fast internet, or constant adult supervision. Instead, it runs as a local matching grid powered by three core systems:
              </p>
              <div className="space-y-3 pt-1">
                <div className="text-[11px] leading-relaxed">
                  <strong>🎓 Volunteer Tutor Matching</strong> — Teacher-training students and education graduates earn verified field-hour certificates (exportable to LinkedIn) by tutoring children and helping parents understand CBC concepts.
                </div>
                <div className="text-[11px] leading-relaxed">
                  <strong>⚖️ Ubuntu Priority Score (UPS)</strong> — A fairness algorithm that prioritizes children from households facing the greatest time and resource pressure — not just whoever asks first.
                </div>
                <div className="text-[11px] leading-relaxed">
                  <strong>🗺️ Harambee Hub Routing</strong> — Automatically directs students to the nearest community center, library, or NGO lab with the WiFi, tablets, or solar power they need — with built-in capacity limits to prevent overcrowding.
                </div>
              </div>
              <p className="text-[10px] opacity-80 italic border-t pt-2">
                Every match is reviewed by a local Elder before it&apos;s confirmed, keeping the community in control of the technology.
              </p>
            </div>

            {/* CHOOSE YOUR ROLE SECTION */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-center">Chagua Jukumu Lako (Select Role)</span>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'login-student', icon: "👦", label: "Mtoto", desc: "Student Login" },
                  { id: 'login-parent', icon: "👩", label: "Mzazi", desc: "Parent Login" },
                  { id: 'login-tutor', icon: "🎓", label: "Mshauri", desc: "Tutor Login" },
                  { id: 'login-admin', icon: "🛡️", label: "Msimamizi", desc: "Elders board" }
                ].map(tile => (
                  <button
                    key={tile.id}
                    onClick={() => setCurrentRoute(tile.id)}
                    className={`${tc.card} hover:scale-[1.02] p-4.5 rounded-xl flex flex-col items-center justify-center text-center transition-all`}
                  >
                    <span className="text-xl">{tile.icon}</span>
                    <span className="text-xs font-bold block mt-1">{tile.label}</span>
                    <span className="text-[9px] opacity-65">{tile.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROUTE: LOGIN STUDENT */}
        {currentRoute === 'login-student' && (
          <div className={`${tc.card} p-6 rounded-2xl space-y-4 animate-fade-in`}>
            <h3 className="text-base font-bold">Mtoto Login (Student)</h3>
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <input
                type="tel"
                placeholder="Phone Number e.g. +254..."
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:outline-none bg-white text-slate-800"
                required
              />
              <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>
                {otpSent ? "Resend OTP" : "Request OTP"}
              </button>
            </form>

            {otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:outline-none text-center bg-white text-slate-800 tracking-wider font-mono"
                  required
                />
                <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>
                  Verify & Log In
                </button>
              </form>
            )}

            <div className="flex justify-between items-center text-[11px] pt-1">
              <button onClick={() => setCurrentRoute('reset-password')} className="underline">Forgot Password?</button>
              <button onClick={() => setCurrentRoute('landing')} className="underline font-bold">Cancel</button>
            </div>
          </div>
        )}

        {/* ROUTE: LOGIN PARENT */}
        {currentRoute === 'login-parent' && (
          <div className={`${tc.card} p-6 rounded-2xl space-y-4 animate-fade-in`}>
            <h3 className="text-base font-bold">Mzazi Login (Parent)</h3>
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <input
                type="tel"
                placeholder="Phone Number"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-slate-800 focus:outline-none font-semibold"
                required
              />
              <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Request OTP</button>
            </form>

            {otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  placeholder="OTP Code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs text-center bg-white text-slate-800 focus:outline-none font-mono"
                  required
                />
                <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Verify OTP</button>
              </form>
            )}
            <div className="flex justify-between text-[11px] pt-1">
              <button onClick={() => setCurrentRoute('reset-password')} className="underline">Forgot Password?</button>
              <button onClick={() => setCurrentRoute('landing')} className="underline">Cancel</button>
            </div>
          </div>
        )}

        {/* ROUTE: LOGIN TUTOR */}
        {currentRoute === 'login-tutor' && (
          <div className={`${tc.card} p-6 rounded-2xl space-y-4 animate-fade-in`}>
            <h3 className="text-base font-bold">Mshauri Login (Tutor)</h3>
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <input
                type="tel"
                placeholder="Phone Number"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
                required
              />
              <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Request OTP</button>
            </form>
            {otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  placeholder="OTP Code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs text-center bg-white text-slate-800 focus:outline-none"
                  required
                />
                <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Verify</button>
              </form>
            )}
            <div className="flex justify-between text-[11px]">
              <button onClick={() => setCurrentRoute('reset-password')} className="underline">Reset PIN</button>
              <button onClick={() => setCurrentRoute('landing')} className="underline">Cancel</button>
            </div>
          </div>
        )}

        {/* ROUTE: LOGIN ADMIN */}
        {currentRoute === 'login-admin' && (
          <div className={`${tc.card} p-6 rounded-2xl space-y-4 animate-fade-in`}>
            <h3 className="text-base font-bold">Elders Council Login</h3>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Elder Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
                required
              />
              <input
                type="password"
                placeholder="Council Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
                required
              />
              <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Authenticate</button>
            </form>
            <button onClick={() => setCurrentRoute('landing')} className="text-xs underline block mx-auto">Cancel</button>
          </div>
        )}

        {/* ROUTE: RESET PASSWORD */}
        {currentRoute === 'reset-password' && (
          <div className={`${tc.card} p-6 rounded-2xl space-y-4 animate-fade-in`}>
            <h3 className="text-base font-bold">Reset Password</h3>
            <p className="text-[11px] opacity-80">Enter your registered mobile phone number to receive a verification reset PIN.</p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="tel"
                placeholder="Phone Number e.g. +254..."
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
                required
              />
              <button className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Send Recovery Code</button>
            </form>
            <button onClick={() => setCurrentRoute('landing')} className="text-xs underline block mx-auto">Back to Login</button>
          </div>
        )}

        {/* ROUTE: PREFERENCES SELECTION */}
        {currentRoute === 'preferences' && (
          <div className={`${tc.card} p-6 rounded-2xl space-y-4 animate-fade-in`}>
            <h3 className="text-base font-bold">Onboarding: Select Preferences</h3>
            <p className="text-[11px] opacity-80">Choose your subject areas and study times so Scout can tailor local matching.</p>
            
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-bold mb-1">Subjects of Interest</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Mathematics', 'Science', 'Kiswahili', 'Creative Arts'].map(sub => {
                    const isFav = preferredSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        onClick={() => {
                          if (isFav) setPreferredSubjects(preferredSubjects.filter(s => s !== sub));
                          else setPreferredSubjects([...preferredSubjects, sub]);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          isFav ? 'bg-[#35477B] text-white' : 'bg-white text-slate-700'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold mb-1">Preferred Time Blocks</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Morning (Sat)', 'Afternoon (Sat)', 'Evening (Weekdays)'].map(t => {
                    const isPref = preferredTimes.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          if (isPref) setPreferredTimes(preferredTimes.filter(pt => pt !== t));
                          else setPreferredTimes([...preferredTimes, t]);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          isPref ? 'bg-[#35477B] text-white' : 'bg-white text-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button onClick={handleSavePreferences} className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>
              Save Preferences & Continue
            </button>
          </div>
        )}

        {/* ROUTE: INTAKE */}
        {currentRoute === 'intake' && (
          <div className={`${tc.card} p-5 rounded-2xl space-y-4 animate-fade-in`}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold text-slate-750">Ubuntu Usajili Questionnaire</h3>
              <span className="text-[10px] font-mono font-bold bg-[#35477B] text-[#E7E27C] px-2 py-0.5 rounded">
                Step {intakeStep} / 4
              </span>
            </div>

            {intakeStep === 1 && (
              <div className="space-y-4">
                <span className="block text-xs font-semibold text-slate-650">Confirm your network role:</span>
                <div className="grid grid-cols-1 gap-2">
                  {['student', 'parent'].map(r => (
                    <button
                      key={r}
                      onClick={() => setIntakeRole(r)}
                      className={`p-3 border text-left rounded-xl text-xs font-bold capitalize ${
                        intakeRole === r ? 'border-[#35477B] bg-[#35477B]/10' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {r === 'student' ? 'Mwanafunzi (Student)' : 'Mzazi (Parent)'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIntakeStep(2)} className={`w-full ${tc.btn} py-2.5 rounded-lg text-xs font-bold`}>
                  Continue
                </button>
              </div>
            )}

            {intakeStep === 2 && (
              <div className="space-y-4">
                <span className="block text-xs font-bold">Ni saa ngapi kwa siku mzazi anaweza kukusaidia kusoma?</span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { score: 2, label: 'Zaidi ya masaa 2 kwa siku' },
                    { score: 5, label: 'Masaa 1 - 2 kwa siku' },
                    { score: 8, label: 'Chini ya saa 1 kwa siku' },
                    { score: 10, label: 'Hakuna nafasi kabisa' }
                  ].map(opt => (
                    <button
                      key={opt.score}
                      onClick={() => setTimePovertyScore(opt.score)}
                      className={`p-2.5 border text-left rounded-lg text-xs ${
                        timePovertyScore === opt.score ? 'border-[#35477B] bg-[#35477B]/10' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIntakeStep(3)} className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Next</button>
              </div>
            )}

            {intakeStep === 3 && (
              <div className="space-y-4">
                <span className="block text-xs font-bold">Kuhusu vitabu na tablet nyumbani:</span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { score: 2, label: 'Tuna kila kitu na tablet ya kusoma' },
                    { score: 5, label: 'Tuna vitabu lakini hatuna tablet' },
                    { score: 8, label: 'Hatuna vitabu wala tablet lakini tuna umeme' },
                    { score: 10, label: 'Hatuna umeme, vitabu wala tablet' }
                  ].map(opt => (
                    <button
                      key={opt.score}
                      onClick={() => setMaterialDeficitScore(opt.score)}
                      className={`p-2.5 border text-left rounded-lg text-xs ${
                        materialDeficitScore === opt.score ? 'border-[#35477B] bg-[#35477B]/10' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIntakeStep(4)} className={`w-full ${tc.btn} py-2 rounded-lg text-xs font-bold`}>Next</button>
              </div>
            )}

            {intakeStep === 4 && (
              <div className="space-y-4">
                <span className="block text-xs font-bold">Chagua mtaa wenu wa karibu:</span>
                
                <div className="space-y-2">
                  <select
                    value={selectedSettlement}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setSelectedSettlement(val);
                      const lms = getLandmarksBySettlement(val);
                      if (lms.length > 0) setSelectedLandmarkCode(lms[0].code);
                    }}
                    className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-800"
                  >
                    <option value="Kibera">Kibera</option>
                    <option value="Mathare">Mathare</option>
                    <option value="Mukuru">Mukuru</option>
                    <option value="Kawangware">Kawangware</option>
                  </select>

                  <select
                    value={selectedLandmarkCode}
                    onChange={(e) => setSelectedLandmarkCode(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-800"
                  >
                    {getLandmarksBySettlement(selectedSettlement).map(lm => (
                      <option key={lm.code} value={lm.code}>
                        {lm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white/20 p-3 rounded-lg text-xs flex justify-between font-bold">
                  <span>Computed UPS Score:</span>
                  <span>UPS {calculatedUPS}</span>
                </div>

                <button onClick={submitIntake} className={`w-full ${tc.btn} py-2.5 rounded-lg text-xs font-bold`}>
                  Complete Registration
                </button>
              </div>
            )}
          </div>
        )}

        {/* ROUTE: SETTINGS */}
        {currentRoute === 'settings' && (
          <div className={`${tc.card} p-5 rounded-2xl space-y-4 animate-fade-in`}>
            <h3 className="text-base font-bold">Settings & Configuration</h3>
            
            {/* Update Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-2.5 pb-3 border-b">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Profile Details</span>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-2.5 py-1.5 border rounded text-xs bg-white text-slate-800"
              />
              <button className="px-3 py-1 bg-[#35477B] text-white text-[10px] font-bold rounded">Update Profile</button>
            </form>

            {/* Change Password Form */}
            <form onSubmit={(e) => { e.preventDefault(); alert("Password successfully updated!"); }} className="space-y-2.5 pb-3 border-b">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Change Password</span>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded text-xs bg-white text-slate-800"
              />
              <button className="px-3 py-1 bg-[#35477B] text-white text-[10px] font-bold rounded">Save Password</button>
            </form>

            {/* Change Theme */}
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Application Theme</span>
              <div className="flex gap-2">
                {[
                  { id: 'yellow', label: 'Yellow' },
                  { id: 'blue', label: 'Midnight' },
                  { id: 'forest', label: 'Forest' }
                ].map(themeOpt => (
                  <button
                    key={themeOpt.id}
                    onClick={() => setCurrentTheme(themeOpt.id as any)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-bold border ${
                      currentTheme === themeOpt.id ? 'bg-[#35477B] text-white' : 'bg-white text-slate-800'
                    }`}
                  >
                    {themeOpt.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setCurrentRoute('dashboard')} className="text-xs underline block mx-auto">Return to Dashboard</button>
          </div>
        )}

        {/* ROUTE: DASHBOARD */}
        {currentRoute === 'dashboard' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-2 flex items-center gap-4">
              <AvatarCircle name={profileName} size="lg" />
              <div>
                <h3 className="text-lg font-bold text-white">Habari, {profileName}</h3>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 bg-[#E8462A] text-white rounded-full inline-block">
                  Role: {userRole}
                </span>
              </div>
            </div>

            {userRole === 'tutor' ? (
              // TUTOR DASHBOARD
              <div className="space-y-4">
                {/* DISPATCH STUDENT QUEUE */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Student Priority Requests Queue</span>
                  <div className="space-y-2">
                    {requests
                      .filter(r => r.status === 'pending')
                      .sort((a, b) => b.ubuntuScore - a.ubuntuScore)
                      .map(req => (
                        <div key={req.id} className="p-4 rounded-2xl bg-[#171717] border border-[#262626] space-y-3 text-left">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-sm text-white font-bold">{req.studentName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">UPS {req.ubuntuScore}</span>
                          </div>
                          <p className="text-xs text-gray-400">"{req.description}"</p>
                          <PillButton
                            onClick={() => setSelectedSessionToApprove(req.id)}
                            variant="primary"
                            showArrow={false}
                            className="py-2.5 text-xs rounded-xl"
                          >
                            Accept with Elder PIN
                          </PillButton>
                        </div>
                      ))}
                  </div>
                </div>

                {/* TUTOR BADGES READY FOR DOWNLOAD/SHARE */}
                <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">My Volunteer Achievements</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-medium">🏆 Kibera Pioneer Badge</span>
                    <div className="flex gap-2">
                      <button onClick={() => alert("Downloading PDF Certificate...")} className="px-3 py-1 bg-[#171717] text-white rounded-full border border-[#262626] hover:bg-[#262626] text-[10px] font-bold cursor-pointer">PDF</button>
                      <button onClick={() => alert("Pushed to LinkedIn API.")} className="px-3 py-1 bg-[#E8462A] text-white rounded-full hover:bg-[#D0361C] text-[10px] font-bold cursor-pointer">Share</button>
                    </div>
                  </div>
                </div>

                {/* SUGGEST GUIDELINES TO PARENTS */}
                <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Suggest Guidelines to Parents</span>
                  <input
                    type="text"
                    placeholder="e.g. Focus on grade 4 math sequences..."
                    className="w-full p-3 rounded-xl bg-[#0D0D0D] text-white border border-[#262626] text-xs focus:outline-none focus:border-[#E8462A]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        alert("Guidelines shared with parent feed!");
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <p className="text-[9px] text-gray-500">Press Enter to dispatch guidelines.</p>
                </div>

                {/* ELDER PIN VERIFICATION */}
                {selectedSessionToApprove && (
                  <div className="bg-[#171717] border border-[#E8462A] p-5 rounded-2xl space-y-3">
                    <span className="font-bold text-xs block text-white">Elders Pin Verification (1234):</span>
                    <input
                      type="password"
                      value={elderPinInput}
                      onChange={(e) => setElderPinInput(e.target.value)}
                      className="w-full p-2.5 border border-[#262626] rounded-xl text-xs text-center bg-[#0D0D0D] text-white font-mono tracking-widest focus:outline-none focus:border-[#E8462A]"
                    />
                    <PillButton
                      onClick={() => handleElderPinApproval(selectedSessionToApprove)}
                      variant="primary"
                      showArrow={false}
                      className="py-2.5 text-xs rounded-xl"
                    >
                      Confirm Session
                    </PillButton>
                  </div>
                )}
              </div>
            ) : userRole === 'parent' ? (
              // PARENT DASHBOARD
              <div className="space-y-4">
                {/* SCHEDULE TUTOR SESSION */}
                <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Schedule Tutor Session</span>
                  <select className="w-full p-3 rounded-xl bg-[#0D0D0D] text-white border border-[#262626] text-xs focus:outline-none focus:border-[#E8462A]">
                    {MOCK_TUTORS.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#171717]">{t.name} ({t.subjects[0]})</option>
                    ))}
                  </select>
                  <PillButton
                    onClick={() => alert("Session booked! Awaiting Elder Approval PIN.")}
                    variant="primary"
                    showArrow={true}
                  >
                    Confirm Date & Book
                  </PillButton>
                </div>

                {/* APPROVE ASSIGNMENTS */}
                <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Approve Homework Assignments</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center bg-[#0D0D0D] p-3 rounded-xl border border-[#262626]">
                      <span className="text-white font-medium">Math Homework (Ephraim)</span>
                      <button onClick={(e) => { alert("Approved Math homework."); e.currentTarget.disabled = true; e.currentTarget.innerText = "Approved ✓"; }} className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold cursor-pointer hover:bg-emerald-500">Approve</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // STUDENT DASHBOARD
              <div className="space-y-4">
                {/* SEARCH HUBS BY RESOURCES */}
                <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Search Nearest Hub by Resources</span>
                  <select
                    value={activeAssetFilter}
                    onChange={(e) => setActiveAssetFilter(e.target.value)}
                    className="w-full p-3 border border-[#262626] rounded-xl text-xs bg-[#0D0D0D] text-white focus:outline-none focus:border-[#E8462A]"
                  >
                    <option value="All" className="bg-[#171717]">All Resources</option>
                    <option value="WiFi" className="bg-[#171717]">WiFi Connection</option>
                    <option value="Tablets" className="bg-[#171717]">Study Tablets</option>
                    <option value="Solar" className="bg-[#171717]">Solar Power</option>
                    <option value="Girl-safe" className="bg-[#171717]">Girl-Safe Space</option>
                  </select>

                  <div className="space-y-2">
                    {filteredHubs.map(hub => (
                      <div key={hub.id} className="flex justify-between items-center bg-[#0D0D0D] p-3 rounded-xl border border-[#262626] text-xs">
                        <span className="text-white font-medium">{hub.name} ({hub.settlement})</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { handleToggleWishlist(hub.id); alert(`${hub.name} added to Wishlist!`); }}
                            className="p-2 bg-[#171717] rounded-full border border-[#262626] hover:bg-[#262626] cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 text-[#E8462A]" />
                          </button>
                          <button
                            onClick={() => { handleToggleCartItem(hub.id); alert(`${hub.name} added to Cart!`); }}
                            className="p-2 bg-[#E8462A] text-white rounded-full hover:bg-[#D0361C] cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SCHEDULE SESSION WITH NEXT TUTOR */}
                <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Tutoring Handshake</span>
                  <p className="text-xs text-gray-400">Match instantly with local mentor {MOCK_TUTORS[0].name} ({MOCK_TUTORS[0].subjects[0]}).</p>
                  <PillButton
                    onClick={() => alert(`Session scheduled with ${MOCK_TUTORS[0].name}! Requires elder PIN to verify.`)}
                    variant="primary"
                    showArrow={true}
                  >
                    Schedule Tutor Session
                  </PillButton>
                </div>
              </div>
            )}
            
            {/* DASHBOARD BOTTOM ACTIONS: BACK TO HOME & LOG OUT */}
            <div className="flex gap-3 pt-4 border-t border-[#262626]">
              <button
                onClick={() => {
                  setCurrentRoute('landing');
                  setRouteHistory(['landing']);
                }}
                className="flex-1 py-3.5 bg-transparent text-gray-300 border border-[#262626] text-xs font-bold rounded-full active:scale-95 transition-transform hover:bg-[#171717] cursor-pointer"
              >
                🏠 Safiri Nyumbani (Home)
              </button>
              <button
                onClick={() => {
                  setCurrentRoute('landing');
                  setUserRole(null);
                  setRouteHistory(['landing']);
                }}
                className="flex-1 py-3.5 bg-rose-950 text-rose-400 border border-rose-900 text-xs font-bold rounded-full active:scale-95 transition-transform hover:bg-rose-900 cursor-pointer"
              >
                🚪 Toka (Log Out)
              </button>
            </div>
          </div>
        )}

        {/* ROUTE: AGENTS */}
        {currentRoute === 'agents' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">Matching Verification Agents</h3>
            
            <div className="space-y-2">
              <div className="bg-[#171717] border border-[#262626] p-4.5 rounded-2xl">
                <span className="font-bold block text-sm text-white">Scout (Matching Engine)</span>
                <p className="text-xs text-gray-400 mt-1">Finds curriculum specializations, caching requests for quick offline retrieval.</p>
              </div>

              <div className="bg-[#171717] border border-[#262626] p-4.5 rounded-2xl">
                <span className="font-bold block text-sm text-white">Guardian (Capacity Buffer)</span>
                <p className="text-xs text-gray-400 mt-1">Filters out study centers with capacity status above 80% limit constraint.</p>
              </div>

              <div className="bg-[#171717] border border-[#262626] p-4.5 rounded-2xl">
                <span className="font-bold block text-sm text-white">Hunter (Proximity Gate)</span>
                <p className="text-xs text-gray-400 mt-1">Enforces 1km limits and restricts confirmed tags without Elder PIN codes.</p>
              </div>
            </div>
          </div>
        )}

        {/* ROUTE: HUBS */}
        {currentRoute === 'hubs' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">Harambee Study Centers</h3>
            
            <div className="space-y-3">
              {MOCK_HUBS.map(hub => (
                <div key={hub.id} className="bg-[#171717] border border-[#262626] p-5 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <span className="font-bold block text-sm text-white">{hub.name}</span>
                    <span className="text-xs font-bold text-[#E8462A]">{hub.capacityStatus}% Full</span>
                  </div>
                  <div className="w-full bg-[#0D0D0D] h-2 rounded-full overflow-hidden mt-3 border border-[#262626]">
                    <div className="h-full bg-gradient-to-r from-[#E8462A] to-[#F59E0B]" style={{ width: `${hub.capacityStatus}%` }} />
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {hub.availableAssets.map(asset => (
                      <span key={asset} className="text-[10px] font-bold px-2 py-0.5 bg-[#0D0D0D] text-gray-400 rounded-full border border-[#262626]">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROUTE: BADGES */}
        {currentRoute === 'badges' && userRole === 'tutor' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">Tutor Badges Portfolio</h3>
            <div className="grid grid-cols-2 gap-3">
              <BadgeCard
                name="Kibera Pioneer"
                description="Awarded for matching with 5 or more students in the Kibera settlement grid."
                earned={true}
                earnedAt="2026-06-22T08:00:00Z"
              />
              <BadgeCard
                name="Mathare Guardian"
                description="Help resources matched effectively within Mathare sector."
                earned={false}
                criteria="Complete 10 volunteer hours"
              />
            </div>
          </div>
        )}

        {/* ROUTE: PARENT */}
        {currentRoute === 'parent' && userRole === 'parent' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">CBC Glossary Translator</h3>
            
            <div className="space-y-3">
              <select
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#171717] text-white border border-[#262626] text-xs focus:outline-none focus:border-[#E8462A]"
              >
                {CBC_DICTIONARY.map(d => (
                  <option key={d.term} value={d.term} className="bg-[#171717]">{d.term}</option>
                ))}
              </select>

              <div className="bg-[#171717] border border-[#262626] p-5 rounded-2xl space-y-2">
                <span className="font-bold text-sm text-[#E8462A] block">{activeTermObject.swahiliTranslation}</span>
                <p className="text-xs text-gray-300 leading-relaxed">{activeTermObject.definitionSw}</p>
                {activeTermObject.definitionSheng && (
                  <div className="pt-2 border-t border-[#262626] mt-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Sheng Translation</span>
                    <p className="text-xs text-gray-400 mt-0.5">{activeTermObject.definitionSheng}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ROUTE: ELDERS COUNCIL / ADMIN DASHBOARD */}
        {currentRoute === 'admin-council' && (
          <div className="space-y-4 animate-fade-in bg-[#171717] border border-[#262626] p-5 rounded-2xl text-gray-250">
            <h3 className="text-base font-bold text-white">Elders Council Admin Board</h3>
            <p className="text-xs text-gray-400">Monitor constraints, view capacity overloads, and override spatial matching routes.</p>
            
            {/* Active capacity status monitors */}
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">Hub capacity warning list</span>
              <div className="p-4 bg-rose-950/40 border border-rose-900 rounded-xl text-xs space-y-2">
                <div className="flex justify-between font-bold text-rose-400">
                  <span>SHOFCO Kibera Hub</span>
                  <span>95% Overload (Blocked)</span>
                </div>
                <p className="text-[11px] text-rose-500/80 leading-relaxed">Constraint Trigger: Guardian agent bypassed matching requests due to capacity status &gt;= 80%.</p>
                
                <PillButton
                  onClick={() => {
                    alert("Elders override active: Rerouting pending Kibera queue to next available hub (Ruben Center, 42% capacity).");
                  }}
                  variant="primary"
                  showArrow={false}
                  className="py-2.5 text-xs rounded-xl mt-1"
                >
                  Suggest Next Available Center (Reroute)
                </PillButton>
              </div>
            </div>

            <div className="bg-[#0D0D0D] p-4 rounded-xl border border-[#262626] text-xs">
              <span className="font-bold block text-white mb-2">Queue & Constraint Logs</span>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-400">
                <li>Mathare Stage 10 Hub: 72% capacity (Normal status).</li>
                <li>Tutor proximity verification: All active handshakes within 1km limit.</li>
                <li>Data Charter Retention: 2 households marked for deletion after 180 days.</li>
              </ul>
            </div>
            
            <button onClick={handleLogout} className="text-xs underline block mx-auto mt-2 text-gray-500 hover:text-white cursor-pointer">Log Out</button>
          </div>
        )}

      </main>

      {/* 4. MASTER MOBILE BOTTOM NAVIGATION */}
      {userRole && (
        <BottomNav
          currentTab={currentRoute}
          onChange={setCurrentRoute}
          tabs={navigationTabs}
        />
      )}

      {/* 5. OFF-CANVAS SLIDE-IN FOR WISHLIST & CART ITEMS */}
      {showOffCanvas && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-80 h-full bg-white border-l-2 border-[#35477B] p-5 shadow-2xl flex flex-col justify-between animate-slide-in-right text-slate-900">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#35477B]">Your Wishlist & Cart</span>
                <button onClick={() => setShowOffCanvas(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Curriculum Cart list */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Cart Downloads</span>
                {offlineCart.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No packages selected in cart.</p>
                ) : (
                  <div className="space-y-1.5">
                    {curriculumPacks.filter(p => offlineCart.includes(p.id)).map(pack => (
                      <div key={pack.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border text-xs">
                        <span>{pack.name}</span>
                        <button onClick={() => handleToggleCartItem(pack.id)} className="text-coral">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist Tutors list */}
              <div className="space-y-2 pt-2 border-t">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Favorite Tutors (Wishlist)</span>
                {wishlistTutors.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No tutors added to wishlist.</p>
                ) : (
                  <div className="space-y-1.5">
                    {MOCK_TUTORS.filter(t => wishlistTutors.includes(t.id)).map(tutor => (
                      <div key={tutor.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border text-xs">
                        <span>{tutor.name}</span>
                        <button onClick={() => handleToggleWishlist(tutor.id)} className="text-coral">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {offlineCart.length > 0 && (
              <button
                onClick={handleDownloadOfflineCart}
                disabled={cartDownloadState === 'downloading'}
                className="w-full bg-[#35477B] text-white py-2 rounded-lg text-xs font-bold"
              >
                {cartDownloadState === 'downloading' ? 'Downloading...' : 'Download Cart Packages'}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
