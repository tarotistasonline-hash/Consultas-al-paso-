import React, { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Download,
  Activity,
  FileText,
  Heart,
  Calculator,
  Stethoscope,
  Scale,
  Upload,
  Paperclip,
  Trash2,
  Sliders,
  Send,
  RefreshCw,
  Clock,
  User,
  Plus,
  Search,
  X,
  Lock,
  Info,
  Maximize2,
  Minimize2,
  Share2,
  Settings,
  Globe,
  Languages,
  LogIn,
  LogOut,
  Megaphone,
  Volume2
} from "lucide-react";
import { CATEGORIES, PRESETS, DEFAULT_STATS, NEWS_ARTICLES } from "./data";
import { CategoryId, FilterLevel, Message, UserStats, DailyStat, NewsArticle, BmiRecord } from "./types";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  writeBatch,
  getDocs,
  increment,
  deleteDoc,
  limit
} from "firebase/firestore";
import { 
  auth, 
  db, 
  googleProvider, 
  OperationType, 
  handleFirestoreError
} from "./firebase";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import { jsPDF } from "jspdf";
import { initMixpanel, trackEvent, identifyUser, resetMixpanel, registerMixpanelLogListener, MixpanelLogEntry, getIsMixpanelInitialized, localMixpanelLogs } from "./mixpanel";

// Beautiful, responsive typewriter effects for Spanish medical orientation reports.
function TruthTextRenderer({ 
  text, 
  theme, 
  animate = false,
  onType
}: { 
  text: string; 
  theme: 'cruda' | 'sober'; 
  animate?: boolean;
  onType?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(animate ? 0 : text.length);
  const isCruda = theme === 'cruda';

  useEffect(() => {
    if (!animate) {
      setCurrentIndex(text.length);
      return;
    }
    if (currentIndex >= text.length) return;

    const charactersPerStep = Math.max(1, Math.ceil(text.length / 380));
    const intervalTime = 8; // ms

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + charactersPerStep;
        if (next >= text.length) {
          clearInterval(timer);
          onType?.();
          return text.length;
        }
        onType?.();
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [animate, text, onType]);

  const slicedText = text.slice(0, currentIndex);
  const paragraphs = slicedText.split("\n");

  let lastRenderedIdx = -1;
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    if (paragraphs[i].trim()) {
      lastRenderedIdx = i;
      break;
    }
  }

  return (
    <div 
      onClick={() => {
        if (currentIndex < text.length) {
          setCurrentIndex(text.length);
          onType?.();
        }
      }}
      className={`space-y-4 font-sans leading-relaxed text-sm md:text-base cursor-default transition-all duration-300 ${
        isCruda ? "text-slate-100" : "text-slate-800"
      } ${currentIndex < text.length ? "hover:opacity-90 active:scale-[0.99] cursor-pointer" : ""}`}
      title={currentIndex < text.length ? "Haz clic para revelar todo el texto al instante" : undefined}
    >
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed);
        const cleanText = isBullet ? trimmed.replace(/^[-*]\s|^\d+\.\s/, "") : trimmed;

        const parts = cleanText.split(/(\*\*.*?\*\*)/g);
        const jsxContent = parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className={`font-bold px-1 rounded ${
                isCruda 
                  ? "text-cyan-400 bg-cyan-950/30" 
                  : "text-slate-900 bg-cyan-50 border border-slate-200"
              }`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        const isLastPara = pIdx === lastRenderedIdx;
        const showCursor = isLastPara && currentIndex < text.length;

        if (isBullet) {
          return (
            <div key={pIdx} className="flex items-start gap-2.5 pl-2 md:pl-4 py-0.5">
              <span className={`font-black mt-1 shrink-0 select-none ${
                isCruda ? "text-cyan-500" : "text-cyan-600"
              }`}>•</span>
              <p className={isCruda ? "text-slate-200 font-sans" : "text-slate-700 font-sans"}>
                {jsxContent}
                {showCursor && (
                  <span className={`inline-block ml-1 animate-pulse font-mono font-black ${
                    isCruda ? "text-cyan-500" : "text-cyan-600"
                  }`}>
                    ▮
                  </span>
                )}
              </p>
            </div>
          );
        }

        return (
          <p key={pIdx} className="whitespace-pre-line">
            {jsxContent}
            {showCursor && (
              <span className={`inline-block ml-1 animate-pulse font-mono font-black ${
                isCruda ? "text-cyan-500" : "text-cyan-600"
                  }`}>
                ▮
              </span>
            )}
          </p>
        );
      })}

      {currentIndex < text.length && (
        <div className={`flex items-center gap-1.5 opacity-60 text-[10px] uppercase tracking-wider font-mono select-none mt-2 ${
          isCruda ? "text-cyan-400" : "text-cyan-600"
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
          <span>⚡ Clic para revelar de inmediato</span>
        </div>
      )}
    </div>
  );
}

// Custom tooltip renderer for Recharts logs
const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const isCruda = theme === 'cruda';
    return (
      <div className={`p-3 shadow-lg font-mono text-[11px] rounded border-2 ${
        isCruda 
          ? "bg-slate-900 border-slate-700 text-white" 
          : "bg-white border-slate-200 text-slate-900 shadow-md"
      }`}>
        <p className={`font-extrabold uppercase mb-1 ${
          isCruda ? "text-slate-400" : "text-slate-500"
        }`}>{label}</p>
        <p className={`font-black uppercase ${
          isCruda ? "text-cyan-400" : "text-cyan-600"
        }`}>
          {payload[0].name}: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [theme, setTheme] = useState<'cruda' | 'sober'>("cruda");
  const [firestoreUnavailable, setFirestoreUnavailable] = useState(false);
  const [dismissedFirestoreWarning, setDismissedFirestoreWarning] = useState(false);
  const [dismissedMedicalWarning, setDismissedMedicalWarning] = useState<boolean>(() => {
    try {
      return localStorage.getItem("dismissed_medical_warning") === "true";
    } catch {
      return false;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("rutina");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("directo");
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSiteConfirm, setShowResetSiteConfirm] = useState(false);
  const [showStatsConfirm, setShowStatsConfirm] = useState(false);
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isEditingDonation, setIsEditingDonation] = useState(false);
  const [donationConfig, setDonationConfig] = useState<{ 
    url: string; 
    platform: string; 
    description: string;
    adsenseId?: string;
    adsenseEnabled?: boolean;
    mixpanelToken?: string;
    mixpanelEnabled?: boolean;
    sponsorEnabled?: boolean;
    sponsorText?: string;
    sponsorLink?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem("consultorio_donation_config");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      url: "https://mpago.la/1LHyBwV",
      platform: "MercadoPago",
      description: "Soporte voluntario para solventar costos de hosting, base de datos y consultas de Inteligencia Artificial.",
      adsenseId: "",
      adsenseEnabled: false,
      mixpanelToken: "",
      mixpanelEnabled: true,
      sponsorEnabled: true,
      sponsorText: "Anúnciate aquí: Da visibilidad a tu marca o servicio en este espacio de alta visibilidad para miles de usuarios. Contacto: azulbaires@gmail.com",
      sponsorLink: "mailto:azulbaires@gmail.com"
    };
  });
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // New Auth Modal State Variables
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Live Mixpanel logs state for diagnostics
  const [liveEvents, setLiveEvents] = useState<MixpanelLogEntry[]>(() => [...localMixpanelLogs]);

  useEffect(() => {
    const unsubscribe = registerMixpanelLogListener((log) => {
      setLiveEvents(prev => [log, ...prev].slice(0, 20));
    });
    return unsubscribe;
  }, []);

  // Stats Tracker
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem("sin_filtro_stats_v2");
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Clinical Calculator States
  const [pesoPediatrico, setPesoPediatrico] = useState<number>(14);
  const [medPediatrico, setMedPediatrico] = useState<'paracetamol' | 'ibu2' | 'ibu4'>('paracetamol');
  const [edadPediatrica, setEdadPediatrica] = useState<number>(3);
  const [pesoIMC, setPesoIMC] = useState<number>(72);
  const [alturaIMC, setAlturaIMC] = useState<number>(175);
  const [medAdulto, setMedAdulto] = useState<'paracetamol' | 'ibuprofeno' | 'aspirina'>('paracetamol');

  // Cardiovascular Risk Calculator States
  const [cvPresionSistolica, setCvPresionSistolica] = useState<number>(120);
  const [cvFumador, setCvFumador] = useState<boolean>(false);
  const [cvDiabetes, setCvDiabetes] = useState<boolean>(false);
  const [cvColesterol, setCvColesterol] = useState<number>(190);

  // BMI Historical Tracking States
  const [bmiHistory, setBmiHistory] = useState<BmiRecord[]>([]);
  const [isSavingBmi, setIsSavingBmi] = useState(false);
  const [pastWeight, setPastWeight] = useState<string>("72");
  const [pastHeight, setPastHeight] = useState<string>("175");
  const [pastDate, setPastDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    mimeType: string;
    base64Data: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clinical Report Summary state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryReport, setSummaryReport] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedJournalPub, setSelectedJournalPub] = useState<any | null>(null);
  const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(NEWS_ARTICLES);
  const [newsType, setNewsType] = useState<"tips" | "avances">("avances");
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);

  // Helper detect if article published in standard/relaxed last 24h
  const isNewArticle = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const cleanStr = dateStr.trim().toLowerCase();
    
    // Check for explicit last 24h descriptions in Spanish/English
    if (
      cleanStr.includes("hoy") || 
      cleanStr.includes("ahora") || 
      cleanStr.includes("minuto") ||
      cleanStr.includes("segundo") ||
      cleanStr.includes("reciente") ||
      cleanStr.includes("recent") ||
      cleanStr.includes("pocas horas") ||
      cleanStr.includes("encontrado recién") ||
      cleanStr.includes("últimas 24 horas") ||
      cleanStr.includes("ultimas 24 horas") ||
      cleanStr.includes("última hora") ||
      cleanStr.includes("ultima hora")
    ) {
      return true;
    }

    // Match "Hace X horas" or "hace X horas" (X <= 24)
    const hourMatch = cleanStr.match(/(?:hace|hace unas|hace pocas)\s+(\d+)\s+hora/i);
    if (hourMatch) {
      const hrs = parseInt(hourMatch[1], 10);
      return hrs <= 24;
    }

    // Try standard JS Date parsing
    try {
      const parsedTime = Date.parse(dateStr);
      if (!isNaN(parsedTime)) {
        const diffMs = Date.now() - parsedTime;
        // within 24 hours (and not in the far future)
        return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
      }
    } catch {
      // Ignore
    }

    return false;
  };

  const newArticlesCount = newsArticles.filter((article) => isNewArticle(article.date)).length;
  const [visitCount, setVisitCount] = useState<number | null>(null);

  const [isScanningFile, setIsScanningFile] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [selectedAnatomicalZone, setSelectedAnatomicalZone] = useState<string | null>(null);
  const [copiedDoseOpt, setCopiedDoseOpt] = useState<string | null>(null);

  // Health Profile configurations (persists securely across sessions in local storage)
  const [profileAge, setProfileAge] = useState<string>(() => localStorage.getItem("profile_age") ?? "");
  const [profileSex, setProfileSex] = useState<string>(() => localStorage.getItem("profile_sex") ?? "No especificado");
  const [profileConditions, setProfileConditions] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("profile_conditions");
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });
  const [customCondition, setCustomCondition] = useState<string>(() => localStorage.getItem("profile_custom_condition") ?? "");

  // Personal Visit Counter to distinguish individual visits
  const [myIndividualVisits, setMyIndividualVisits] = useState<number>(() => {
    return Number(localStorage.getItem("my_individual_visits") ?? "1");
  });

  // Auto-save changes to health profile
  useEffect(() => {
    localStorage.setItem("profile_age", profileAge);
  }, [profileAge]);

  useEffect(() => {
    localStorage.setItem("profile_sex", profileSex);
  }, [profileSex]);

  useEffect(() => {
    localStorage.setItem("profile_conditions", JSON.stringify(profileConditions));
  }, [profileConditions]);

  useEffect(() => {
    localStorage.setItem("profile_custom_condition", customCondition);
  }, [customCondition]);

  // Voice Specch Recognition setup
  const [isWideLayout, setIsWideLayout] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(false);
  const handsFreeModeRef = useRef<boolean>(false);
  const silenceTimeoutRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    handsFreeModeRef.current = handsFreeMode;
  }, [handsFreeMode]);

  // Resume listening in Hands-Free mode when generation is done
  useEffect(() => {
    if (!isGenerating && handsFreeMode && speechSupported) {
      const timer = setTimeout(() => {
        if (!isGenerating && handsFreeModeRef.current && !isListening) {
          startListening();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, handsFreeMode, speechSupported, isListening]);

  const [isListeningNews, setIsListeningNews] = useState(false);
  const recognitionNewsRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Google Translate widget loader
  useEffect(() => {
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "es",
              autoDisplay: false
            },
            "google_translate_element"
          );
        }
      };
    }
  }, []);

  // Fetch dynamic clinical breakthroughs from the backend
  const fetchMedicalNews = (query: string = "", typeOverride?: "tips" | "avances") => {
    setIsRefreshingNews(true);
    const activeType = typeOverride || newsType;
    let url = `/api/medical-news?type=${activeType}`;
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Fallo al obtener noticias clínicas");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNewsArticles(data);
        }
      })
      .catch((err) => {
        console.log("[Info Client] Cargando avances médicos de respaldo local.");
        const pool = NEWS_ARTICLES.filter((item) => {
          const isAvance = item.id.startsWith("news-d");
          return activeType === "avances" ? isAvance : !isAvance;
        });
        let filtered = pool;
        if (query) {
          const q = query.toLowerCase();
          filtered = pool.filter((item) => 
            item.title.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q)
          );
        }
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setNewsArticles(shuffled.slice(0, 4));
      })
      .finally(() => {
        setIsRefreshingNews(false);
      });
  };

  useEffect(() => {
    fetchMedicalNews(newsSearchQuery);

    // Actualización permanente: cada 45 segundos se renuevan las noticias de forma automática
    const interval = setInterval(() => {
      fetchMedicalNews(newsSearchQuery);
    }, 45000);

    return () => clearInterval(interval);
  }, [newsType]);

  const startListeningNews = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = true;

    let latestText = "";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const textSoFar = finalTranscript + interimTranscript;
      if (textSoFar.trim()) {
        latestText = textSoFar;
        setNewsSearchQuery(textSoFar);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("News speech recognition error", event);
      stopListeningNews();
    };

    recognition.onend = () => {
      setIsListeningNews(false);
      if (latestText.trim()) {
        fetchMedicalNews(latestText);
      }
    };

    try {
      recognitionNewsRef.current = recognition;
      recognition.start();
      setIsListeningNews(true);
    } catch (e) {
      console.error("Error starting news speech recognition", e);
      setIsListeningNews(false);
    }
  };

  const stopListeningNews = () => {
    if (recognitionNewsRef.current) {
      try {
        recognitionNewsRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsListeningNews(false);
  };

  const toggleListeningNews = () => {
    if (isListeningNews) {
      stopListeningNews();
    } else {
      startListeningNews();
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = true;

    const startText = inputText;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const textSoFar = startText + (startText.trim() ? " " : "") + finalTranscript + interimTranscript;
      setInputText(textSoFar);

      if (handsFreeModeRef.current && textSoFar.trim()) {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          handleRequestRealityCheck(undefined, textSoFar);
        }, 1800);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      if (event.error === 'not-allowed') {
        setErrorMsg("Acceso al micrófono denegado. Permite el acceso del micrófono en los permisos de tu navegador.");
        setTimeout(() => setErrorMsg(null), 5000);
      }
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error("Error starting speech recognition", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Sync session and auth State change
  useEffect(() => {
    let unsubscribeBmi: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthLoading(false);

        identifyUser(user.uid, {
          $email: user.email || "",
          $name: user.displayName || "",
          theme: theme
        });
        trackEvent("User Signed In", {
          email: user.email || ""
        });
        try {
          setErrorMsg(null);
          // Check/create user document
          const userDocRef = doc(db, "users", user.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email || "",
              theme: theme,
              resolvedDilemas: stats.resolvedDilemas,
              charactersOfTruth: stats.charactersOfTruth,
              categories: stats.categories,
              trend: stats.trend,
              monthlyTrend: stats.monthlyTrend || [],
              helpfulCount: stats.helpfulCount ?? 0,
              unhelpfulCount: stats.unhelpfulCount ?? 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } else {
            const data = snap.data();
            setStats({
              resolvedDilemas: data.resolvedDilemas ?? stats.resolvedDilemas,
              charactersOfTruth: data.charactersOfTruth ?? stats.charactersOfTruth,
              categories: data.categories ?? stats.categories,
              trend: data.trend ?? stats.trend,
              monthlyTrend: data.monthlyTrend ?? stats.monthlyTrend,
              helpfulCount: data.helpfulCount ?? 0,
              unhelpfulCount: data.unhelpfulCount ?? 0
            });
            if (data.theme === 'cruda' || data.theme === 'sober') {
              setTheme(data.theme);
            }
          }

          setIsProfileLoaded(true);

          // Real-time BMI history loaded from Firestore subcollection for logged-in user
          const bmiColRef = collection(db, "users", user.uid, "bmi_history");
          const q = query(bmiColRef, orderBy("date", "asc"));
          unsubscribeBmi = onSnapshot(q, (snapshot) => {
            const records: BmiRecord[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              records.push({
                id: docSnap.id,
                userId: data.userId,
                weight: Number(data.weight) || 0,
                height: Number(data.height) || 0,
                bmi: Number(data.bmi) || 0,
                date: data.date || "",
                createdAt: data.createdAt
              });
            });
            setBmiHistory(records);
          }, (error) => {
            console.error("Historical records stream fail:", error);
            setFirestoreUnavailable(true);
            try {
              handleFirestoreError(error, OperationType.GET, `users/${user.uid}/bmi_history`);
            } catch (formattedErr) {
              console.error("BMI history stream error details:", formattedErr);
            }
          });

        } catch (error) {
          console.error("Profile sync failed:", error);
        }
      } else {
        // Fallback: check if we have a simulated local bypass user in localStorage
        try {
          const savedLocal = localStorage.getItem("consultorio_local_user");
          if (savedLocal) {
            const parsedLocal = JSON.parse(savedLocal);
            setCurrentUser(parsedLocal);
            setIsProfileLoaded(true);
            setAuthLoading(false);
            return;
          }
        } catch (_) {}

        setCurrentUser(null);
        setAuthLoading(false);
        setIsProfileLoaded(false);
        setBmiHistory([]);
        if (unsubscribeBmi) {
          unsubscribeBmi();
          unsubscribeBmi = null;
        }
        resetMixpanel();
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeBmi) unsubscribeBmi();
    };
  }, []);

  // Consultas efímeras y privadas: no sincronizamos ni guardamos historial en la base de datos
  useEffect(() => {
    // Mantener el chat limpio en cada sesión para máxima confidencialidad
    setMessages([]);
  }, [currentUser]);

  // Sync statistics with local storage and update Firestore profile
  useEffect(() => {
    try {
      localStorage.setItem("sin_filtro_stats_v2", JSON.stringify(stats));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    const syncStatsToFirestore = async () => {
      if (currentUser && isProfileLoaded) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, {
            resolvedDilemas: stats.resolvedDilemas,
            charactersOfTruth: stats.charactersOfTruth,
            categories: stats.categories,
            trend: stats.trend,
            monthlyTrend: stats.monthlyTrend || [],
            helpfulCount: stats.helpfulCount ?? 0,
            unhelpfulCount: stats.unhelpfulCount ?? 0,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Stats sync failed:", error);
        }
      }
    };
    syncStatsToFirestore();
  }, [stats, currentUser, isProfileLoaded]);

  // Sync themes to database
  useEffect(() => {
    try {
      localStorage.setItem("sin_filtro_theme", theme);
    } catch {}

    const syncThemeToFirestore = async () => {
      if (currentUser && isProfileLoaded) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, {
            theme: theme,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          // ignore silent
        }
      }
    };
    syncThemeToFirestore();
  }, [theme, currentUser, isProfileLoaded]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isGenerating]);

  // Real-time visits counter tracking
  useEffect(() => {
    let activeListener = true;
    const docRef = doc(db, "global_stats", "visits_counter");
    
    // Increment personal and global visits counter once per session
    const recordedKey = "individual_visit_recorded";
    const alreadyRecorded = sessionStorage.getItem(recordedKey);
    
    const registerVisit = async () => {
      try {
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          try {
            await setDoc(docRef, { count: 1 });
          } catch (createErr) {
            handleFirestoreError(createErr, OperationType.CREATE, "global_stats/visits_counter");
          }
        } else {
          try {
            await updateDoc(docRef, { count: increment(1) });
          } catch (updateErr) {
            handleFirestoreError(updateErr, OperationType.UPDATE, "global_stats/visits_counter");
          }
        }
      } catch (err) {
        console.warn("Failed registration lookup:", err);
      }
    };

    if (!alreadyRecorded) {
      sessionStorage.setItem(recordedKey, "true");
      const currentLocal = Number(localStorage.getItem("my_individual_visits") ?? "0");
      const updatedLocal = currentLocal + 1;
      localStorage.setItem("my_individual_visits", String(updatedLocal));
      setMyIndividualVisits(updatedLocal);
      registerVisit();
    }

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists() && activeListener) {
        const data = snap.data();
        setVisitCount(data.count ?? 0);
      }
    }, (error) => {
      setFirestoreUnavailable(true);
      try {
        handleFirestoreError(error, OperationType.GET, "global_stats/visits_counter");
      } catch (formattedErr) {
        console.error("Firestore sync detail:", formattedErr);
      }
    });

    return () => {
      activeListener = false;
      unsubscribe();
    };
  }, []);

  // Listen to donation configuration in real-time
  useEffect(() => {
    let activeListener = true;
    const docRef = doc(db, "global_stats", "donation_config");
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (activeListener) {
        if (snap.exists()) {
          const data = snap.data();
          const mergedConfig = {
            url: data.url || "https://mpago.la/1LHyBwV",
            platform: data.platform || "MercadoPago",
            description: data.description || "Soporte voluntario para solventar costos de hosting, base de datos y consultas de Inteligencia Artificial.",
            adsenseId: data.adsenseId || "",
            adsenseEnabled: data.adsenseEnabled ?? false,
            mixpanelToken: data.mixpanelToken || "",
            mixpanelEnabled: data.mixpanelEnabled ?? !!data.mixpanelToken,
            sponsorEnabled: data.sponsorEnabled ?? true,
            sponsorText: data.sponsorText || "Anúnciate aquí: Da visibilidad a tu marca o servicio en este espacio de alta visibilidad para miles de usuarios. Contacto: azulbaires@gmail.com",
            sponsorLink: data.sponsorLink || "mailto:azulbaires@gmail.com"
          };
          setDonationConfig(mergedConfig);
          try {
            localStorage.setItem("consultorio_donation_config", JSON.stringify(mergedConfig));
          } catch (_) {}
        } else {
          // Document does not exist yet, use hardcoded defaults or localStorage
          try {
            const saved = localStorage.getItem("consultorio_donation_config");
            if (saved) {
              setDonationConfig(JSON.parse(saved));
              return;
            }
          } catch (_) {}
          setDonationConfig({
            url: "https://mpago.la/1LHyBwV",
            platform: "MercadoPago",
            description: "Soporte voluntario para solventar costos de hosting, base de datos y consultas de Inteligencia Artificial.",
            adsenseId: "",
            adsenseEnabled: false,
            mixpanelToken: "",
            mixpanelEnabled: true,
            sponsorEnabled: true,
            sponsorText: "Anúnciate aquí: Da visibilidad a tu marca o servicio en este espacio de alta visibilidad para miles de usuarios. Contacto: azulbaires@gmail.com",
            sponsorLink: "mailto:azulbaires@gmail.com"
          });
        }
      }
    }, (error) => {
      console.warn("Firestore donation configuration loading failed, using default:", error);
    });

    return () => {
      activeListener = false;
      unsubscribe();
    };
  }, []);

  // Dynamically load Google AdSense script when enabled
  useEffect(() => {
    const rawId = donationConfig.adsenseId?.trim() || "";
    const isValidId = rawId.startsWith("ca-pub-") || rawId.startsWith("pub-");
    
    if (donationConfig.adsenseEnabled && rawId && isValidId) {
      const cleanId = rawId.startsWith("pub-") ? `ca-${rawId}` : rawId;
      const existingScript = document.getElementById("google-adsense-script");
      
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-adsense-script";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanId}`;
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
        console.log("Google AdSense script successfully injected into head:", cleanId);
      } else {
        // If the ID changed, replace the script
        const currentSrc = existingScript.getAttribute("src");
        if (currentSrc && !currentSrc.includes(cleanId)) {
          existingScript.remove();
          const script = document.createElement("script");
          script.id = "google-adsense-script";
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanId}`;
          script.async = true;
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
          console.log("Google AdSense script updated in head with new ID:", cleanId);
        }
      }
    } else {
      // Remove script if disabled
      const existingScript = document.getElementById("google-adsense-script");
      if (existingScript) {
        existingScript.remove();
        console.log("Google AdSense script removed (disabled)");
      }
    }
  }, [donationConfig.adsenseId, donationConfig.adsenseEnabled]);

  const handleSaveDonationConfig = async (
    url: string, 
    platform: string, 
    description: string,
    adsenseId: string,
    adsenseEnabled: boolean,
    mixpanelToken: string,
    mixpanelEnabled: boolean,
    sponsorEnabled: boolean,
    sponsorText: string,
    sponsorLink: string
  ) => {
    const newConfig = {
      url,
      platform,
      description,
      adsenseId,
      adsenseEnabled,
      mixpanelToken,
      mixpanelEnabled,
      sponsorEnabled,
      sponsorText,
      sponsorLink
    };

    // Always mirror in localStorage immediately
    try {
      localStorage.setItem("consultorio_donation_config", JSON.stringify(newConfig));
    } catch (_) {}

    // Update state instantly for real-time responsiveness
    setDonationConfig(newConfig);

    // If logged in as real Firebase user, try writing to Firestore.
    // If it's a local bypass user (like local_admin_bypass) or not logged in, we only save to localStorage.
    if (currentUser && currentUser.uid !== "local_admin_bypass") {
      try {
        const docRef = doc(db, "global_stats", "donation_config");
        await setDoc(docRef, {
          ...newConfig,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setIsEditingDonation(false);
      } catch (err) {
        console.warn("Failed to save donation config to Firestore (saving locally instead):", err);
        setIsEditingDonation(false);
      }
    } else {
      setIsEditingDonation(false);
    }
  };

  // Dynamically initialize and configure Mixpanel when enabled
  useEffect(() => {
    const rawToken = donationConfig.mixpanelToken?.trim() || 
                     (import.meta as any).env?.VITE_MIXPANEL_TOKEN || "";
    const isEnabled = !!rawToken && donationConfig.mixpanelEnabled !== false;

    if (isEnabled && rawToken) {
      initMixpanel(rawToken);
      if (currentUser) {
        identifyUser(currentUser.uid, {
          $email: currentUser.email || "",
          $name: currentUser.displayName || "",
          theme: theme
        }, rawToken);
      }
      trackEvent("App Loaded", {
        authenticated: !!currentUser,
        user_email: currentUser?.email || "anonymous",
        theme: theme
      }, rawToken);
    }
  }, [donationConfig.mixpanelToken, donationConfig.mixpanelEnabled, currentUser]);

  // Synchronize past weight/height selectors with current active sliders by default
  useEffect(() => {
    setPastWeight(pesoIMC.toString());
    setPastHeight(alturaIMC.toString());
  }, [pesoIMC, alturaIMC]);

  // Load local storage fallback BMI history if logged out
  useEffect(() => {
    if (!currentUser) {
      try {
        const saved = localStorage.getItem("sin_filtro_bmi_history");
        if (saved) {
          setBmiHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load local BMI history:", e);
      }
    }
  }, [currentUser]);

  // Save or log a new BMI Record
  const handleAddBmiRecord = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const w = parseFloat(pastWeight);
    const h = parseFloat(pastHeight);
    
    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setErrorMsg("Por favor, introduce un peso y una altura válidos.");
      return;
    }

    const calculatedBmi = Number((w / ((h / 100) * (h / 100))).toFixed(1));
    const recordId = "bmi_" + Date.now();

    const newRecord: BmiRecord = {
      id: recordId,
      userId: currentUser ? currentUser.uid : "local_user",
      weight: w,
      height: h,
      bmi: calculatedBmi,
      date: pastDate
    };

    if (currentUser) {
      try {
        setIsSavingBmi(true);
        const ref = doc(db, "users", currentUser.uid, "bmi_history", recordId);
        await setDoc(ref, {
          ...newRecord,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("No se pudo agregar el registro de IMC:", err);
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/bmi_history/${recordId}`);
      } finally {
        setIsSavingBmi(false);
      }
    } else {
      // Fallback offline tracking
      const fallbackRecords = [...bmiHistory, { ...newRecord, createdAt: new Date().toISOString() }];
      fallbackRecords.sort((a, b) => a.date.localeCompare(b.date));
      setBmiHistory(fallbackRecords);
      try {
        localStorage.setItem("sin_filtro_bmi_history", JSON.stringify(fallbackRecords));
      } catch (err) {
         console.error("Local storage error:", err);
      }
    }
  };

  const handleDeleteBmiRecord = async (recordId: string) => {
    setErrorMsg(null);
    if (currentUser) {
      try {
        const ref = doc(db, "users", currentUser.uid, "bmi_history", recordId);
        await deleteDoc(ref);
      } catch (err) {
        console.error("Error deleting record:", err);
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/bmi_history/${recordId}`);
      }
    } else {
      const updated = bmiHistory.filter(r => r.id !== recordId);
      setBmiHistory(updated);
      try {
        localStorage.setItem("sin_filtro_bmi_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage error:", e);
      }
    }
  };

  // Authentication Helpers
  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg(null);
      setAuthError(null);
      setAuthSuccess(null);
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error("Sign in error:", err);
      const explanation = "Si estás usando la vista previa (iframe) de AI Studio, el navegador bloquea las ventanas emergentes. Para iniciar sesión con Google de manera exitosa, por favor haz clic en 'Abrir en pestaña nueva' arriba a la derecha, o utiliza el método de inicio con Correo o Bypass Local de Iframe.";
      setAuthError(`Error con Google: ${err.message}. ${explanation}`);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Por favor, ingresa tu correo y contraseña.");
      return;
    }
    try {
      setErrorMsg(null);
      setAuthError(null);
      setAuthSuccess(null);
      await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      setAuthSuccess("¡Inicio de sesión exitoso!");
      setTimeout(() => {
        setShowAuthModal(false);
      }, 800);
    } catch (err: any) {
      console.error("Email sign in error:", err);
      let localizedError = err.message;
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        localizedError = "Credenciales incorrectas o usuario no encontrado. Si no tienes cuenta, cámbiate a la pestaña 'Registrarse'.";
      } else if (err.code === "auth/invalid-email") {
        localizedError = "El correo electrónico no es válido.";
      }
      setAuthError(localizedError);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Por favor, ingresa correo y contraseña.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    try {
      setErrorMsg(null);
      setAuthError(null);
      setAuthSuccess(null);
      await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      setAuthSuccess("¡Registro exitoso! Ya has iniciado sesión.");
      setTimeout(() => {
        setShowAuthModal(false);
      }, 800);
    } catch (err: any) {
      console.error("Email registration error:", err);
      let localizedError = err.message;
      if (err.code === "auth/email-already-in-use") {
        localizedError = "Este correo ya está registrado. Cambia a la pestaña de 'Iniciar Sesión'.";
      } else if (err.code === "auth/weak-password") {
        localizedError = "La contraseña es muy débil (mínimo 6 caracteres).";
      } else if (err.code === "auth/invalid-email") {
        localizedError = "El correo electrónico no es válido.";
      }
      setAuthError(localizedError);
    }
  };

  const handleLocalBypassSignIn = (emailToUse: string = "tarotistasonline@gmail.com") => {
    try {
      setErrorMsg(null);
      setAuthError(null);
      setAuthSuccess(null);
      
      const localUser = {
        uid: "local_admin_bypass",
        email: emailToUse,
        displayName: "Administrador Local (Bypass)",
        emailVerified: true,
        isAnonymous: false,
        phoneNumber: null,
        photoURL: null,
        providerId: "local_bypass"
      };

      localStorage.setItem("consultorio_local_user", JSON.stringify(localUser));
      setCurrentUser(localUser as any as FirebaseUser);
      setIsProfileLoaded(true);
      
      setAuthSuccess("¡Modo local bypass activado!");
      trackEvent("Iframe Bypass Login", { email: emailToUse });
      
      setTimeout(() => {
        setShowAuthModal(false);
      }, 800);
    } catch (err: any) {
      console.error("Bypass login error:", err);
      setAuthError("Error en Bypass: " + err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      setErrorMsg(null);
      // Remove local bypass
      try {
        localStorage.removeItem("consultorio_local_user");
      } catch (_) {}
      
      await signOut(auth);
      setCurrentUser(null);
      setMessages([]);
      setStats(DEFAULT_STATS);
    } catch (err: any) {
      console.error("Sign out error:", err);
      setErrorMsg("Error al cerrar sesión: " + err.message);
    }
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("El archivo clinical report supera el límite permitido de 8MB.");
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      const commaIdx = resultString.indexOf(",");
      const base64Data = commaIdx !== -1 ? resultString.substring(commaIdx + 1) : resultString;
      
      setUploadedFile({
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        base64Data: base64Data
      });
      
      // Auto-switch to studies category if file loaded to assist user
      setSelectedCategory("sales_copy");

      // Trigger high-tech scan animation simulation 
      setIsScanningFile(true);
      setScanStep(1);
      setTimeout(() => setScanStep(2), 850);
      setTimeout(() => setScanStep(3), 1650);
      setTimeout(() => {
        setIsScanningFile(false);
        setScanStep(0);
      }, 2450);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("El reporte clínico supera el límite de 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      const commaIdx = resultString.indexOf(",");
      const base64Data = commaIdx !== -1 ? resultString.substring(commaIdx + 1) : resultString;

      setUploadedFile({
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        base64Data: base64Data
      });

      setSelectedCategory("sales_copy");

      // Trigger high-tech scan animation simulation
      setIsScanningFile(true);
      setScanStep(1);
      setTimeout(() => setScanStep(2), 850);
      setTimeout(() => setScanStep(3), 1650);
      setTimeout(() => {
        setIsScanningFile(false);
        setScanStep(0);
      }, 2450);
    };
    reader.readAsDataURL(file);
  };

  // Preset Symptoms trigger
  const handleApplyPreset = (promptText: string, catId: CategoryId) => {
    setSelectedCategory(catId);
    setInputText(promptText);
    setTimeout(() => {
      const containerEl = document.getElementById("input-form-section") || document.getElementById("lobby-input-container");
      containerEl?.scrollIntoView({ behavior: "smooth" });
      focusChatInput();
    }, 100);
  };

  // Click handler to redirect user directly to the section or focus the wide chat board/input
  const handleCategoryClick = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setErrorMsg(null);
    setIsWideLayout(true); // Always expand the message/chat workspace to wide mode when clicking categories!
    setTimeout(() => {
      if (catId === "calculadora") {
        setNewsType("avances");
        fetchMedicalNews("", "avances");
        const calcEl = document.getElementById("calculadora-section");
        if (calcEl) {
          calcEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (catId === "negocio") {
        setNewsType("tips");
        fetchMedicalNews("", "tips");
        const consejosEl = document.getElementById("consejos-salud-section-main-container") || document.getElementById("consejos-salud-section");
        if (consejosEl) {
          consejosEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setNewsType("avances");
        fetchMedicalNews("", "avances");
        const chatEl = document.getElementById("input-form-section") || document.getElementById("lobby-input-container");
        if (chatEl) {
          chatEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        focusChatInput();
      }
    }, 120);
  };

  // Submit actual medical consultation
  const handleRequestRealityCheck = async (e?: FormEvent, customUserText?: string) => {
    e?.preventDefault();
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    stopListening();
    const textToSubmit = customUserText || inputText;
    if (!textToSubmit.trim() && !uploadedFile) return;

    setErrorMsg(null);
    setIsGenerating(true);

    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Assemble text content with file notation if relevant
    let displayContent = textToSubmit;
    if (uploadedFile && !customUserText) {
      displayContent = `[Estudio Clínico Adjunto: ${uploadedFile.name}]\n\n${textToSubmit || "Analizar el reporte clínico adjunto."}`;
    }

    const userMessage: Message = {
      role: "user",
      content: displayContent,
      timestamp: timeLabel
    };

    setMessages(prev => [...prev, userMessage]);

    const updatedMessages = [...messages, userMessage];

    // Clear input & uploads
    setInputText("");
    const prevFile = uploadedFile;
    setUploadedFile(null);

    trackEvent("Chat Query Sent", {
      category: selectedCategory,
      filterLevel: filterLevel,
      hasAttachment: !!prevFile,
      attachmentType: prevFile ? prevFile.name.split('.').pop() : null
    });

    try {
      const response = await fetch("/api/reality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          category: selectedCategory,
          filterLevel: filterLevel,
          file: prevFile,
          healthProfile: {
            age: profileAge,
            sex: profileSex,
            conditions: [...profileConditions, customCondition].filter(Boolean).join(", ")
          }
        })
      });

      if (!response.ok) {
        let serverErrorMsg = "";
        try {
          const errData = await response.json();
          serverErrorMsg = errData?.error;
        } catch (_) {}
        throw new Error(serverErrorMsg || `Error en el servidor de consultas (${response.status})`);
      }

      const data = await response.json();
      const aiResponseText = data.text;

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      trackEvent("Chat Response Received", {
        category: selectedCategory,
        filterLevel: filterLevel,
        responseLength: aiResponseText ? aiResponseText.length : 0
      });

      // Update statistics live
      setStats(prev => {
        const charCount = aiResponseText ? aiResponseText.length : 0;
        const currentCategory = selectedCategory;

        const updatedCategories = { ...prev.categories };
        updatedCategories[currentCategory] = (updatedCategories[currentCategory] || 0) + 1;

        const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const todayName = days[new Date().getDay()];

        let trendUpdated = false;
        let updatedTrend = (prev.trend || []).map(item => {
          if (item.date === todayName) {
            trendUpdated = true;
            return {
              ...item,
              dilemmas: item.dilemmas + 1,
              characters: item.characters + charCount
            };
          }
          return item;
        });

        if (!trendUpdated) {
          const newDayNode: DailyStat = {
            date: todayName,
            dilemmas: 1,
            characters: charCount
          };
          updatedTrend = [...updatedTrend];
          if (updatedTrend.length >= 7) updatedTrend.shift();
          updatedTrend.push(newDayNode);
        }

        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const currentMonthName = months[new Date().getMonth()];

        return {
          resolvedDilemas: prev.resolvedDilemas + 1,
          charactersOfTruth: prev.charactersOfTruth + charCount,
          categories: updatedCategories,
          trend: updatedTrend,
          monthlyTrend: prev.monthlyTrend || []
        };
      });

    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "No se pudo contactar con el consultor médico. Verifica tu conexión.";
      setErrorMsg(errMsg);
      trackEvent("Chat Query Failed", {
        category: selectedCategory,
        filterLevel: filterLevel,
        error: errMsg
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Compile full clean report for the physical clinic doctor
  const handleGenerateClinicalSummaryReport = async () => {
    if (messages.length === 0) {
      alert("Debes realizar consultas primero para poder generar un informe médico.");
      return;
    }
    setIsSummarizing(true);
    setSummaryReport(null);

    try {
      const response = await fetch("/api/generate-sales-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      if (!response.ok) throw new Error("No se pudo compendiar el informe.");
      const data = await response.json();
      setSummaryReport(data.script);
      trackEvent("Clinical Report Compiled", { messageCount: messages.length });
    } catch (err: any) {
      console.error(err);
      alert("Error compilando reporte: " + err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleResetConversation = () => {
    stopListening();
    setInputText("");
    setErrorMsg(null);
    setSummaryReport(null);
    setMessages([]);
    setShowResetConfirm(false);
    trackEvent("Conversation Reset");
  };

  const handleResetSite = () => {
    stopListening();
    
    // Clear local storage and session storage
    localStorage.removeItem("sin_filtro_stats_v2");
    localStorage.removeItem("sin_filtro_theme");
    localStorage.removeItem("profile_age");
    localStorage.removeItem("profile_sex");
    localStorage.removeItem("profile_conditions");
    localStorage.removeItem("profile_custom_condition");
    localStorage.removeItem("my_individual_visits");
    localStorage.removeItem("sin_filtro_bmi_history");
    localStorage.removeItem("dismissed_medical_warning");
    sessionStorage.clear();

    // Reset all React state to initial defaults
    setStats(DEFAULT_STATS);
    setTheme("cruda");
    setSelectedCategory("rutina");
    setFilterLevel("directo");
    setInputText("");
    setIsGenerating(false);
    setMessages([]);
    setErrorMsg(null);
    setSummaryReport(null);
    setPesoPediatrico(14);
    setMedPediatrico('paracetamol');
    setEdadPediatrica(3);
    setPesoIMC(72);
    setAlturaIMC(175);
    setMedAdulto('paracetamol');
    setBmiHistory([]);
    setUploadedFile(null);
    setProfileAge("");
    setProfileSex("No especificado");
    setProfileConditions([]);
    setCustomCondition("");

    setShowResetSiteConfirm(false);

    // Clean page reload to boot up freshly
    window.location.reload();
  };

  const handleExportPDF = () => {
    if (messages.length === 0) return;

    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2); // 180mm

      let y = 20;

      // Header Helper function
      const addHeader = (isFirstPage: boolean) => {
        // Top border/accent bar
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(margin, y - 5, contentWidth, 2, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("Consultorio al paso", margin, y + 5);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // slate-500
        const todayStr = new Date().toLocaleString("es-AR") || new Date().toLocaleString();
        doc.text(`Fecha: ${todayStr}`, pageWidth - margin, y + 4, { align: "right" });

        doc.setFontSize(10);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(5, 150, 105); // emerald-600
        doc.text("Canal 100% Privado | Historial de Consultas", margin, y + 12);
        
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(margin, y + 16, pageWidth - margin, y + 16);
        
        y += 24;
      };

      // Safe page-break checker
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          doc.addPage();
          y = 20;
          addHeader(false);
        }
      };

      addHeader(true);

      // Iterate messages
      messages.forEach((msg) => {
        const isUser = msg.role === "user";
        
        // Header for current message
        const msgSender = isUser ? "PACIENTE" : "MEDICO ORIENTADOR";
        const msgTime = msg.timestamp || "";
        const headerText = `${isUser ? "👤" : "🩺"} ${msgSender} (${msgTime})`;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        
        if (isUser) {
          doc.setTextColor(51, 65, 85); // slate-700
        } else {
          doc.setTextColor(5, 150, 105); // emerald-600
        }

        const headerLines = doc.splitTextToSize(headerText, contentWidth);
        const headerHeight = headerLines.length * 5;
        checkPageBreak(headerHeight + 10);

        // Render message sender header
        doc.text(headerLines, margin, y);
        y += headerHeight + 2;

        // Body text wrapping
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59); // slate-800
        
        // Prepare lines
        const textLines = doc.splitTextToSize(msg.content, contentWidth);
        const textHeight = textLines.length * 4.8;
        
        checkPageBreak(textHeight + 12);

        // Draw message background box for nice formatting (light bg)
        doc.setFillColor(isUser ? 248 : 240, isUser ? 250 : 253, isUser ? 252 : 250); // slight teal/blue bg
        doc.rect(margin - 2, y - 4, contentWidth + 4, textHeight + 6, "F");

        // Optional border left
        doc.setDrawColor(isUser ? 148 : 5, isUser ? 163 : 150, isUser ? 184 : 105); // slate or emerald
        doc.setLineWidth(1);
        doc.line(margin - 2, y - 4, margin - 2, y + textHeight + 2);

        // Draw text inside box
        doc.text(textLines, margin + 2, y + 1);
        y += textHeight + 12; // Spacing after message
      });

      // Footer: Add page numbers to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
          `Pagina ${i} de ${totalPages} | Consultorio al paso - Canal Privado Encriptado`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      doc.save(`Historial_Consulta_Medica_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err: any) {
      console.error("Error al exportar PDF:", err);
      alert("Hubo un error al generar el PDF: " + err.message);
    }
  };

  const handleRateMessage = (index: number, vote: 'up' | 'down') => {
    const targetMsg = messages[index];
    if (!targetMsg || targetMsg.role !== "assistant") return;

    const currentRating = targetMsg.rating;
    const updatedMessages = [...messages];
    
    let deltaHelpful = 0;
    let deltaUnhelpful = 0;

    if (currentRating === vote) {
      updatedMessages[index] = { ...targetMsg, rating: null };
      if (vote === 'up') deltaHelpful = -1;
      else deltaUnhelpful = -1;
    } else {
      updatedMessages[index] = { ...targetMsg, rating: vote };
      if (vote === 'up') {
        deltaHelpful = 1;
        if (currentRating === 'down') deltaUnhelpful = -1;
      } else {
        deltaUnhelpful = 1;
        if (currentRating === 'up') deltaHelpful = -1;
      }
    }

    setMessages(updatedMessages);

    setStats(prev => {
      const oldHelpful = prev.helpfulCount ?? 0;
      const oldUnhelpful = prev.unhelpfulCount ?? 0;
      return {
        ...prev,
        helpfulCount: Math.max(0, oldHelpful + deltaHelpful),
        unhelpfulCount: Math.max(0, oldUnhelpful + deltaUnhelpful)
      };
    });
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetStats = () => {
    if (showStatsConfirm) {
      setStats({
        resolvedDilemas: 0,
        charactersOfTruth: 0,
        helpfulCount: 0,
        unhelpfulCount: 0,
        categories: {
          rutina: 0,
          sales_copy: 0,
          negocio: 0,
          calculadora: 0
        },
        trend: [],
        monthlyTrend: []
      });
      setShowStatsConfirm(false);
    } else {
      setShowStatsConfirm(true);
      setTimeout(() => setShowStatsConfirm(false), 4000);
    }
  };

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
  const isCruda = theme === 'cruda';

  // Calculator logic results on weight sliders
  const calculateAdultDose = () => {
    if (medAdulto === 'paracetamol') {
      const isLowWeight = pesoIMC < 50;
      return {
        text: `Paracetamol Adultos (Comprimidos de 500 mg / 1 g)`,
        uso: "Analgésico (alivia dolor leve o moderado) y Antipirético (baja la fiebre corporal). No es desinflamatorio gástrico.",
        formula: isLowWeight ? "500 mg por toma por peso corporal (<50 kg)" : "500 mg a 1000 mg (1 g) por toma",
        suggested: isLowWeight ? "500 mg por toma" : "500 mg a 1 g por toma",
        detail: `Dosis recomendada para su peso de ${pesoIMC} kg: tomar 1 comprimido de 500 mg cada 6 u 8 horas. Dosis máxima diaria recomendada: ${isLowWeight ? "3000 mg (3 g)" : "4000 mg (4 g)"} para prevenir sobrecarga hepática.`,
        precaucions: "Evitar el consumo de alcohol durante el tratamiento."
      };
    } else if (medAdulto === 'ibuprofeno') {
      const suggestedDose = pesoIMC < 60 ? "400 mg" : "400 mg a 600 mg";
      return {
        text: `Ibuprofeno Adultos (Comprimidos de 400 mg / 600 mg)`,
        uso: "Analgésico (alivia dolores moderados), Antipirético (baja la fiebre) y Antiinflamatorio (reduce inflamaciones corporales y musculares).",
        formula: "400 mg a 600 mg por toma cada 8 horas",
        suggested: suggestedDose,
        detail: `Dosis recomendada para su peso de ${pesoIMC} kg: tomar 1 comprimido de ${suggestedDose} cada 8 horas. Se aconseja tomarlo junto con alimentos para protección gástrica.`,
        precaucions: "Consultar si padece úlceras o hipertensión."
      };
    } else {
      return {
        text: `Aspirina / Ácido Acetilsalicílico (Comprimidos de 500 mg)`,
        uso: "Analgésico (calma dolores), Antipirético (reduce estados febriles), Antiinflamatorio y antiagregante plaquetario (evita coágulos en sangre).",
        formula: "500 mg a 1000 mg por toma cada 6 a 8 horas",
        suggested: "500 mg a 1 g por toma",
        detail: `Dosis de referencia: tomar 1 o 2 comprimidos de 500 mg cada 6 u 8 horas con agua o alimento. Dosis máxima diaria: 4000 mg (4 g).`,
        precaucions: "CONTRAINDICADO ante sospecha de dengue por riesgo hemorrágico."
      };
    }
  };

  const calculatePediatricDose = () => {
    if (medPediatrico === 'paracetamol') {
      const minDose = (pesoPediatrico * 10).toFixed(0); 
      const maxDose = (pesoPediatrico * 15).toFixed(0);
      const dropsMin = (pesoPediatrico * 2).toFixed(0); 
      const dropsMax = (pesoPediatrico * 3).toFixed(0); 
      return {
        text: `Paracetamol Infantil (100 mg/ml)`,
        uso: "Analgésico y Antipirético pediátrico (ideal para calmar fiebre y dolor leve en niños de manera segura sin irritar el estómago).",
        formula: "10 mg a 15 mg por cada kg por dosis",
        suggested: `${dropsMin} a ${dropsMax} gotas`,
        detail: `Dosis de referencia recomendada: de ${minDose} mg a ${maxDose} mg vía oral. Admite repetirse cada 6-8 horas según necesidad febril (máximo 4-5 veces al día).`
      };
    } else if (medPediatrico === 'ibu2') {
      const mlRecomendado = (pesoPediatrico / 2).toFixed(1);
      return {
        text: `Ibuprofeno Infantil 2% (20 mg/ml)`,
        uso: "Analgésico, Antipirético y Antiinflamatorio para niños (ideal para dolores agudos y fiebre alta sostenida). Administrar siempre con el estómago con alimentos.",
        formula: "10 mg por cada kg por dosis (Peso dividido 2)",
        suggested: `${mlRecomendado} ml`,
        detail: `Fórmula habitual: de ${mlRecomendado} ml vía oral cada 6 u 8 horas según criterio médico. Preferentemente suministrar acompañado de alimentos.`
      };
    } else {
      const mlRecomendado = (pesoPediatrico / 4).toFixed(1);
      return {
        text: `Ibuprofeno Infantil 4% (40 mg/ml)`,
        uso: "Analgésico, Antipirético y Antiinflamatorio pediátrico concentrado (para suministrar menor volumen de líquido). Suministrar siempre con alimento.",
        formula: "10 mg por cada kg por dosis (Peso dividido 4)",
        suggested: `${mlRecomendado} ml`,
        detail: `Dosis concentrada: ${mlRecomendado} ml vía oral cada 8 horas. No exceder los límites diarios indicados por su profesional.`
      };
    }
  };

  const calculateIMC = () => {
    if (alturaIMC <= 0 || pesoIMC <= 0) {
      return {
        imc: 0,
        cat: "Ingresa datos",
        color: "text-slate-400",
        bg: "bg-slate-500/5 border-slate-500/10",
        desc: "Ingresa valores válidos de peso y estatura para calcular tu Índice de Masa Corporal de forma instantánea."
      };
    }
    const alturaM = alturaIMC / 100;
    const imc = Number((pesoIMC / (alturaM * alturaM)).toFixed(1));
    let cat = "Normal";
    let color = "text-emerald-500";
    let bg = "bg-emerald-500/10 border-emerald-500/20";
    let desc = "Tu peso físico corporal se encuentra dentro de los parámetros estables y saludables de referencia clínica. Procura mantener una alimentación balanceada y actividad física regular.";

    if (imc < 18.5) {
      cat = "Bajo peso";
      color = "text-amber-500";
      bg = "bg-amber-500/10 border-amber-500/20";
      desc = "Rango por debajo del ideal establecido. Es recomendable consultar con un nutricionista para evaluar pautas de alimentación hipercalórica saludable.";
    } else if (imc >= 25 && imc < 30) {
      cat = "Sobrepeso";
      color = "text-orange-500";
      bg = "bg-orange-500/10 border-orange-500/20";
      desc = "Rango de sobrepeso leve a moderado. Reducir la ingesta de azúcares y grasas ultraprocesadas, sumado a ejercicio aeróbico regular, ayuda a normalizar los rangos.";
    } else if (imc >= 30) {
      cat = "Obesidad";
      color = "text-red-500";
      bg = "bg-red-500/10 border-red-500/20";
      desc = "Índice correspondiente a obesidad. Se aconseja una consulta con un profesional cardiólogo o nutricionista para estructurar un plan de bienestar supervisado.";
    }

    return { imc, cat, color, bg, desc };
  };

  const calculateCardioRisk = () => {
    const age = parseInt(profileAge) || 45;
    const isMale = profileSex === "Masculino";
    
    let baseRisk = 2; // 2% minimum baseline for anyone over age 30 or standardized
    
    // Age factor
    if (age >= 30 && age < 40) baseRisk += 1;
    else if (age >= 40 && age < 50) baseRisk += 2;
    else if (age >= 50 && age < 60) baseRisk += 5;
    else if (age >= 60 && age < 70) baseRisk += 10;
    else if (age >= 70) baseRisk += 16;
    
    // Sex factor
    if (isMale) {
      baseRisk += age < 60 ? 3 : 1;
    } else {
      baseRisk += age >= 60 ? 2 : 0;
    }
    
    // Systolic Blood Pressure factor
    if (cvPresionSistolica >= 120 && cvPresionSistolica < 140) baseRisk += 2;
    else if (cvPresionSistolica >= 140 && cvPresionSistolica < 160) baseRisk += 5;
    else if (cvPresionSistolica >= 160 && cvPresionSistolica < 180) baseRisk += 9;
    else if (cvPresionSistolica >= 180) baseRisk += 15;
    
    // Smoking factor
    if (cvFumador) {
      baseRisk += age >= 60 ? 5 : 8;
    }
    
    // Diabetes factor
    if (cvDiabetes || profileConditions.includes("Diabetes")) {
      baseRisk += 8;
    }
    
    // Cholesterol factor (mg/dL)
    if (cvColesterol >= 200 && cvColesterol < 240) baseRisk += 2;
    else if (cvColesterol >= 240) baseRisk += 5;
    
    const riskVal = Math.min(100, Math.max(1, baseRisk));
    
    let label = "Bajo";
    let color = "text-emerald-500";
    let bg = "bg-emerald-500/10 border-emerald-500/20";
    let desc = "Riesgo de evento cardiovascular de bajo nivel (<10% en 10 años). Recomendaciones: Conserve hábitos de vida sanos, una alimentación reducida en grasas saturadas, evite el tabaco y continúe realizando al menos 150 minutos semanales de actividad física aeróbica moderada.";
    
    if (riskVal >= 10 && riskVal < 20) {
      label = "Moderado";
      color = "text-yellow-500";
      bg = "bg-yellow-500/10 border-yellow-500/20";
      desc = "Riesgo moderado (10% a 19% en 10 años). Recomendaciones: Monitoreo clínico anual de presión arterial y lípidos, optimizar patrón alimentario (dieta cardioprotectora como la mediterránea) y control estricto de peso.";
    } else if (riskVal >= 20 && riskVal < 30) {
      label = "Alto";
      color = "text-orange-500";
      bg = "bg-orange-500/10 border-orange-500/20";
      desc = "Riesgo alto (20% a 29% en 10 años). Recomendaciones: Requiere una consulta formal con un médico de cabecera o cardiólogo para evaluar el inicio de medidas farmacológicas protectoras (ej. estatinas o antihipertensivos) y un seguimiento riguroso.";
    } else if (riskVal >= 30) {
      label = "Muy Alto";
      color = "text-red-500";
      bg = "bg-red-550/10 border-red-500/20";
      desc = "Riesgo crítico o muy alto (≥30% en 10 años). Recomendaciones: Requiere derivación y consulta cardiológica prioritaria presencial para un plan preventivo médico de especialidad inmediato.";
    }
    
    return { risk: riskVal, label, color, bg, desc };
  };

  const renderConsejosDeSalud = (isMainArea: boolean = false) => {
    const isTips = isMainArea ? (newsType === "tips") : false;
    const accentColor = isTips ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-cyan-500";
    const accentBg = isTips ? "bg-emerald-500/10" : "bg-cyan-500/10";
    const accentBorder = isTips ? "border-emerald-500/20" : "border-cyan-500/20";

    return (
      <div id={isMainArea ? "consejos-salud-section-main" : "consejos-salud-section"}>
        <div className="flex flex-col gap-2.5 border-b pb-3 mb-4 border-slate-200/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-left flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                {isRefreshingNews ? (
                  <>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTips ? "bg-emerald-400" : "bg-cyan-400"}`}></span>
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isTips ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-cyan-500 shadow-[0_0_8px_#06b6d4]"}`}></span>
                  </>
                ) : (
                  <>
                    <span className={`animate-pulse absolute inline-flex h-full w-full rounded-full opacity-45 ${isTips ? "bg-emerald-400" : "bg-cyan-400"}`}></span>
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isTips ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-cyan-500 shadow-[0_0_8px_#06b6d4]"}`}></span>
                  </>
                )}
              </span>
              <span className={`${accentColor} font-extrabold text-[12.5px] tracking-tight`}>
                {isTips ? "Tips y Consejos de Bienestar" : "Últimos Avances Científicos y Médicos"}
              </span>
            </span>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchMedicalNews(newsSearchQuery)}
                title={isTips ? "Hacé clic en la ruedita para actualizar los tips de bienestar" : "Hacé clic en la ruedita para actualizar las noticias científicas de último minuto"}
                disabled={isRefreshingNews}
                className={`p-1 ${accentColor} hover:scale-110 active:scale-95 transition-all cursor-pointer bg-transparent border-0 disabled:opacity-50`}
              >
                <Settings className={`w-4.5 h-4.5 ${isRefreshingNews ? "animate-spin" : "animate-[spin_6s_linear_infinite]"}`} />
              </button>
              
              <span className={`text-[10px] font-mono uppercase font-black tracking-widest ${accentColor} select-none animate-pulse flex items-center gap-1`}>
                <span className="relative inline-flex items-center justify-center mr-0.5">
                  {isTips ? "🍏" : "🔬"}
                  {newArticlesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-650 bg-red-600 text-[8px] font-black text-white ring-1 ring-white select-none animate-pulse">
                      {newArticlesCount}
                    </span>
                  )}
                </span>
                <span>{isTips ? "CONSEJOS DE SALUD" : "AVANCES MÉDICOS"}</span>
              </span>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          {isMainArea && (
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-500/5 border border-slate-500/10">
              <button
                type="button"
                onClick={() => {
                  setNewsType("avances");
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isTips
                    ? "bg-cyan-500 text-white shadow-sm"
                    : isCruda
                      ? "text-slate-400 hover:text-white hover:bg-slate-850"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                🔬 Avances Médicos
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewsType("tips");
                }}
                className={`py-2 px-3 text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isTips
                    ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                    : isCruda
                      ? "text-emerald-400 font-extrabold hover:text-emerald-300 hover:bg-slate-850"
                      : "text-emerald-600 font-extrabold hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                🍏 Tips de Bienestar
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2.5 text-left mt-0.5">
            <p className="text-[10.5px] leading-relaxed text-emerald-500 font-extrabold animate-pulse">
              {isTips 
                ? "👉 Hacé clic en la ruedita verde (⚙️) para forzar la actualización de los tips de bienestar."
                : "👉 Hacé clic en la ruedita celeste (⚙️) para forzar la actualización de los últimos avances científicos."}
            </p>
            <div className="flex items-center">
              <span className="text-[9.5px] leading-relaxed font-mono font-black text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-[pulse_1s_infinite]">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-ping shrink-0" />
                <span>
                  {isTips 
                    ? "⚡ CONEXIÓN ACTIVA: AUTO-RENOVANDO LOS TIPS AUTOMÁTICAMENTE CADA 45S" 
                    : "⚡ RECEPTOR ACTIVO: SINTONIZANDO HITOS CIENTÍFICOS CADA 45S"}
                </span>
              </span>
            </div>
          </div>

          {isRefreshingNews && (
            <div className={`p-2.5 py-3 border rounded-xl text-[10px] font-mono font-black flex items-center justify-center gap-2 animate-pulse leading-snug ${isTips ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" : "bg-cyan-500/10 text-cyan-500 border-cyan-500/25"}`}>
              <Settings className="w-4 h-4 animate-spin shrink-0" />
              <span className="tracking-wider text-center uppercase font-black">
                {isTips ? "⏳ BUSCANDO Y ACTUALIZANDO TIPS DE BIENESTAR EN TIEMPO REAL..." : "⏳ BUSCANDO Y ACTUALIZANDO ÚLTIMAS NOTICIAS CIENTÍFICAS EN TIEMPO REAL..."}
              </span>
            </div>
          )}
        </div>

        <div className="mb-4.5 flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={isTips ? "Escribí acá para buscar consejos o tips saludables..." : "Escribí acá para buscar avances médicos..."}
              value={newsSearchQuery}
              onChange={(e) => setNewsSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchMedicalNews(newsSearchQuery);
                }
              }}
              className={`w-full text-sm pl-11 pr-32 py-3.5 rounded-xl border-2 outline-none transition-all font-medium leading-relaxed ${
                isCruda
                  ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              }`}
            />
            <button
              type="button"
              onClick={() => fetchMedicalNews(newsSearchQuery)}
              title="Buscar avances médicos con IA"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-600 transition-colors cursor-pointer"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {newsSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setNewsSearchQuery("");
                    fetchMedicalNews("");
                  }}
                  title="Limpiar búsqueda"
                  className="text-slate-400 hover:text-red-500 transition-colors text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchMedicalNews(newsSearchQuery)}
                title="Buscar con IA"
                translate="no"
                className="text-[10px] font-black font-mono bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs uppercase notranslate"
              >
                BUSCAR
              </button>
            </div>
          </div>

          {speechSupported && (
            <button
              type="button"
              onClick={toggleListeningNews}
              className={`p-3.5 rounded-xl border transition cursor-pointer relative shrink-0 duration-200 flex items-center justify-center ${
                isListeningNews 
                  ? "bg-emerald-600 border-emerald-700 text-white animate-pulse ring-4 ring-emerald-500/30" 
                  : isCruda
                    ? "bg-slate-950 border-emerald-950 text-emerald-500 hover:bg-emerald-950/20"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 shadow-xs"
              }`}
              title={isListeningNews ? "Escuchando... Haz clic para detener" : "Buscar noticias por voz (micrófono)"}
            >
              {isListeningNews ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-emerald-500" />}
            </button>
          )}
        </div>

        <div className="space-y-3 mb-5 select-none">
          {(() => {
            const filteredArticles = newsArticles;

            if (filteredArticles.length === 0) {
              return (
                <div className="text-center py-6 col-span-full">
                  <p className="text-[10px] opacity-50 font-sans italic">
                    No se encontraron noticias para: "{newsSearchQuery}"
                  </p>
                </div>
              );
            }

            return (
              <div className={isMainArea ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
                {filteredArticles.map((article, index) => {
                  let badgeColors = isTips 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
                  if (article.category === "Pediatría") badgeColors = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  if (article.category === "Vacunas") badgeColors = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                  if (article.category === "Farmacología") badgeColors = "bg-purple-500/10 text-purple-500 border-purple-500/20";

                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.215, 0.61, 0.355, 1] }}
                      onClick={() => setSelectedArticle(article)}
                      id={`${isMainArea ? "main-" : ""}article-${article.id}`}
                      className={`p-3.5 rounded-lg border-2 text-left cursor-pointer transition-all duration-300 ease-out group hover:-translate-y-1 hover:shadow-md hover:border-cyan-505 active:scale-[0.99] subtle-white-border ${
                        isCruda 
                          ? "bg-slate-950/65 border-slate-800 hover:bg-slate-950 hover:shadow-cyan-500/5" 
                          : "bg-slate-50 border-white hover:bg-slate-100 hover:shadow-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${badgeColors}`}>
                            {article.category}
                          </span>
                          {isNewArticle(article.date) && (
                            <span className="text-[7.5px] font-extrabold uppercase bg-red-500/10 text-red-500 border border-red-500/25 px-1 py-0.2 rounded animate-pulse">
                              ¡NUEVO!
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-mono opacity-45">{article.date}</span>
                      </div>
                      <h4 className="text-[11px] font-bold leading-snug hover:text-emerald-500 transition-colors flex items-center justify-between gap-1.5">
                        <span>{article.title}</span>
                        <span 
                          className="relative group/tooltip inline-block shrink-0 p-0.5" 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Info className="w-3.5 h-3.5 text-emerald-500/70 hover:text-emerald-600 transition-colors cursor-help" />
                          <span className="absolute bottom-full right-0 mb-1.5 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900 text-white text-[9px] font-medium font-sans px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50">
                            Publicado: {article.date}
                          </span>
                        </span>
                      </h4>
                      <p className="text-[9.5px] opacity-60 leading-relaxed mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-500/10">
                        <div className="flex items-center gap-0.5 text-[8.5px] text-emerald-500 font-bold uppercase tracking-wider font-mono">
                          <span>Leer más</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const textToCopy = `🔬 *${article.title}*\n\n📰 ${article.summary}\n\n📌 Fuente: ${article.source}`;
                            navigator.clipboard.writeText(textToCopy);
                            setCopiedArticleId(article.id);
                            setTimeout(() => setCopiedArticleId(null), 2500);
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono transition-all border cursor-pointer ${
                            copiedArticleId === article.id
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 scale-95"
                              : isCruda
                                ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800 hover:border-slate-700"
                                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                          }`}
                          title="Copiar información al portapapeles para compartir"
                        >
                          <Share2 className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{copiedArticleId === article.id ? "¡Copiado!" : "Compartir"}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {messages.length > 0 && (
          <div className="pt-3 border-t border-slate-200/15">
            <button
              onClick={handleGenerateClinicalSummaryReport}
              disabled={isSummarizing}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase rounded-lg shadow-sm cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compilando Informe...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resumir en Ficha Médica</span>
                </>
              )}
            </button>
            <span className="text-[7.5px] font-mono block text-center mt-1.5 opacity-55">
              ORDENA TU HISTORAL EN UN RESUMEN PARA LLEVAR AL CONSULTORIO
            </span>
          </div>
        )}
      </div>
    );
  };

  const focusChatInput = () => {
    const inputEl = document.getElementById("chat-input-large") || document.getElementById("chat-input");
    if (inputEl) {
      inputEl.focus();
    }
  };

  const renderChatForm = (isLargeCentered: boolean = false) => {
    const isReadySubmit = (inputText.trim() || uploadedFile) && !isGenerating;
    const currentPlaceholder = uploadedFile 
      ? "Escribe qué quieres consultar sobre este estudio clínico..." 
      : (activeCategoryObj.placeholder || "Escribe tu consulta médica o de bienestar general aquí...");

    return (
      <div className={`${isLargeCentered ? "max-w-xl mx-auto w-full space-y-4" : "w-full"} ${isCruda ? "text-slate-100" : "text-slate-800"}`}>
        {/* Banner de Patrocinio Personalizado "Anúnciate Aquí" */}
        {donationConfig.sponsorEnabled && (
          <div className={`p-4 rounded-xl border mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left transition-all ${
            isCruda 
              ? "bg-slate-900/80 border-purple-500/20 text-purple-200" 
              : "bg-purple-50/70 border-purple-350 border-purple-200 text-slate-900 shadow-sm"
          }`}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 inline-block">
                  Espacio Patrocinado
                </span>
                <p className="text-[12px] font-sans font-bold leading-relaxed">
                  {(() => {
                    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                    const text = donationConfig.sponsorText || "";
                    const parts = text.split(emailRegex);
                    if (parts.length <= 1) return text;
                    return parts.map((part, index) => {
                      if (part.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/)) {
                        return (
                          <a 
                            key={index} 
                            href={`mailto:${part}`} 
                            className="text-purple-600 dark:text-purple-400 hover:underline font-bold px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 transition-all inline-block"
                          >
                            {part}
                          </a>
                        );
                      }
                      return part;
                    });
                  })()}
                </p>
              </div>
            </div>
            {(() => {
              const rawLink = donationConfig.sponsorLink || "mailto:azulbaires@gmail.com";
              const isMail = rawLink.includes("@") || rawLink.startsWith("mailto:");
              const href = rawLink.startsWith("mailto:") 
                ? rawLink 
                : isMail 
                  ? `mailto:${rawLink}` 
                  : (rawLink.startsWith("http") ? rawLink : `https://${rawLink}`);
              
              return (
                <a
                  href={href}
                  target={isMail ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="px-4.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap shrink-0 border border-purple-400/20 cursor-pointer flex items-center gap-1.5"
                >
                  {isMail ? "Contactar ✉" : "Ver Más ↗"}
                </a>
              );
            })()}
          </div>
        )}

        {/* Active uploaded Clinical Study Badge / High Tech Scanner UI */}
        {uploadedFile && (
          <div className={`p-4 rounded-xl border-2 flex flex-col gap-3 animate-fade-in text-xs text-left relative overflow-hidden transition-all duration-300 ${
            isScanningFile
              ? (isCruda ? "bg-slate-905 border-cyan-805 text-cyan-400" : "bg-cyan-50/70 border-cyan-400 text-cyan-950 shadow-md")
              : (isCruda ? "bg-slate-950/25 border-emerald-800/40 text-emerald-300" : "bg-emerald-50/50 border-emerald-200 text-emerald-950 shadow-sm")
          }`}>
            {/* Green glowing laser scanning animation lines */}
            {isScanningFile && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-bounce" style={{ top: "10%", animationDuration: "2s" }} />
            )}

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5 truncate">
                <div className={`p-2 rounded-lg shrink-0 ${isScanningFile ? "bg-cyan-500/10 animate-pulse" : "bg-emerald-500/10"}`}>
                  <FileText className={`w-5 h-5 ${isScanningFile ? "text-cyan-500" : "text-emerald-500"}`} />
                </div>
                <div className="truncate text-left leading-tight">
                  <p className="font-bold truncate text-[11px] font-sans flex items-center gap-1.5">
                    <span>{uploadedFile.name}</span>
                    <span className="text-[9px] font-normal opacity-50 font-mono">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                  </p>
                  
                  {isScanningFile ? (
                    <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-cyan-555">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span className="font-black">
                        {scanStep === 1 && "🔬 LEYENDO Y EXTRAYENDO TEXTO CLÍNICO..."}
                        {scanStep === 2 && "📡 BUSCANDO VALORES DE REFERENCIA Y LÍMITES..."}
                        {scanStep === 3 && "🧠 ASOCIANDO BIOMARCADORES DE ALARMA..."}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[9.5px] text-emerald-600 font-mono mt-1 font-medium flex items-center gap-1.5">
                      <span>🟢 Escaneo completo. Listo para consultarle al Dr. Link.</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isScanningFile && (
                  <span className="text-[8px] font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 rounded px-2 py-0.5 uppercase">
                    ESCANER OK
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="p-1.5 rounded hover:bg-red-500/15 text-red-500 hover:text-red-650 transition cursor-pointer shrink-0"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated progress steps during active scans */}
            {isScanningFile && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyan-500/10 font-mono text-[8px] tracking-tight text-center relative z-10 transition-all">
                <div className={`p-1 rounded flex items-center justify-center gap-1 border ${scanStep >= 1 ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-slate-900/5 border-transparent text-slate-400"}`}>
                  <span>{scanStep > 1 ? "✓" : "⚡"} OCR</span>
                </div>
                <div className={`p-1 rounded flex items-center justify-center gap-1 border ${scanStep >= 2 ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-slate-900/5 border-transparent text-slate-400"}`}>
                  <span>{scanStep > 2 ? "✓" : "⚡"} BIO-MAPS</span>
                </div>
                <div className={`p-1 rounded flex items-center justify-center gap-1 border ${scanStep >= 3 ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-slate-900/5 border-transparent text-slate-400"}`}>
                  <span>{scanStep > 3 ? "✓" : "⚡"} GEMINI IA</span>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleRequestRealityCheck} className={`relative flex items-center justify-between border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500 transition-colors ${
          isCruda ? "border-slate-800 bg-slate-950/60 text-white" : "border-slate-300 bg-white"
        }`}>
          
          {/* File Upload trigger clip icon */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 ml-2.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 bg-amber-500 border-amber-600 text-slate-950 hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-md shadow-amber-500/30"
            title="Subir estudio médico o análisis (.pdf, .png, .jpg, .txt)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.png,.jpg,.jpeg"
            className="hidden"
          />

          <input
            id={isLargeCentered ? "chat-input-large" : "chat-input"}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={currentPlaceholder}
            disabled={isGenerating}
            className={`w-full bg-transparent text-xs font-sans focus:outline-none placeholder-slate-400 font-medium ${isLargeCentered ? "p-4.5 text-sm text-white" : "p-4 text-slate-900"} ${isCruda ? "text-white" : "text-slate-900"}`}
          />
          
          <div className="flex items-center gap-1.5 px-3">
            {/* Microphone Dictator */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-lg border transition cursor-pointer relative shrink-0 duration-200 ${
                  isListening 
                    ? "bg-red-700 border-red-800 text-white animate-pulse ring-4 ring-red-500/30" 
                    : "bg-red-600 border-red-500 text-white hover:bg-red-500 hover:scale-105 active:scale-95 shadow-md shadow-red-600/20"
                }`}
                title={isListening ? "Escuchando... Haz clic para detener" : "Consulta por voz (micrófono)"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Hands-Free Mode Toggle */}
            {speechSupported && (
              <button
                type="button"
                onClick={() => {
                  const nextVal = !handsFreeMode;
                  setHandsFreeMode(nextVal);
                  trackEvent("Hands-Free Mode Toggled", { enabled: nextVal });
                  if (nextVal && !isListening && !isGenerating) {
                    startListening();
                  }
                }}
                className={`p-2 py-2.5 sm:px-3 rounded-lg border transition-all cursor-pointer relative shrink-0 duration-200 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase font-mono ${
                  handsFreeMode 
                    ? "bg-purple-600 border-purple-500 text-white shadow-md ring-4 ring-purple-500/30" 
                    : isCruda 
                      ? "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white" 
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
                title={handsFreeMode ? "Modo Manos Libres Activo: enviará el mensaje tras un silencio corto" : "Activar Modo Manos Libres (envío automático tras silencio)"}
              >
                <Volume2 className={`w-3.5 h-3.5 ${handsFreeMode ? "text-green-300 animate-bounce" : "text-slate-400"}`} />
                <span className="hidden sm:inline">Manos Libres</span>
              </button>
            )}

            {/* Submit message */}
            <button
              type="submit"
              disabled={isGenerating}
              className="p-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              title="Presiona este botón verde con la flecha para enviar tu consulta"
            >
              <Send className="w-4 h-4 text-emerald-500 hover:text-white" />
            </button>
          </div>
        </form>

        {/* Clear instruction note to submit clinical queries */}
        <p className={`text-[10px] text-center font-sans font-bold select-none leading-tight mt-1.5 ${isCruda ? "text-slate-400" : "text-slate-600"}`}>
          💡 <span className="text-emerald-500 font-extrabold uppercase tracking-wide">Para enviar tu consulta:</span> escribe arriba y luego <span className="text-emerald-500 font-extrabold underline decoration-2">presiona la flecha verde</span> a la derecha.
        </p>
      </div>
    );
  };

  const adultDetails = calculateAdultDose();
  const pediatricDetails = calculatePediatricDose();
  const imcDetails = calculateIMC();

  return (
    <div className={`min-h-screen transition-all duration-300 ${isCruda ? "bg-slate-950 text-white" : "bg-bgWarm bg-[#f8fafc] text-slate-900"}`}>

      <div className={`transition-all duration-355 px-4 md:px-6 py-6 md:py-10 ${isWideLayout ? "max-w-[100%] xl:px-10 mx-auto" : "max-w-7xl mx-auto"}`}>
        {/* Medical Clinic Branded Header */}
        <header className={`mb-6 pb-5 border-b flex flex-col gap-3.5 ${isCruda ? "border-white/20" : "border-slate-300"}`}>
          {/* Top Line: Translate and Screen Width in the exact same line, positioned right before the title */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs w-full pb-2 border-b border-dashed border-slate-500/10 mb-1">
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Traductor Compacto: globe icon, google translate container (default select is a dropdown with native arrow) */}
              <div className="flex items-center gap-1">
                <Globe className={`w-3.5 h-3.5 ${isCruda ? "text-cyan-400" : "text-cyan-600"}`} />
                <div id="google_translate_element" className="inline-block scale-95 origin-left"></div>
              </div>

              {/* Selector de Ancho de Pantalla Ultra Compacto */}
              <div className={`p-0.5 rounded-lg border flex items-center gap-1 ${
                isCruda ? "bg-slate-900 border-white/20" : "bg-slate-100 border-slate-300"
              }`}>
                <button
                  type="button"
                  onClick={() => setIsWideLayout(false)}
                  className={`py-1 px-2 text-[9px] font-mono font-black uppercase rounded-md cursor-pointer transition-all duration-150 ${
                    !isWideLayout
                      ? "bg-cyan-600 text-white shadow-xs"
                      : isCruda
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-600 hover:bg-white/60"
                  }`}
                >
                  Estándar
                </button>
                <button
                  type="button"
                  onClick={() => setIsWideLayout(true)}
                  className={`py-1 px-2 text-[9px] font-mono font-black uppercase rounded-md cursor-pointer transition-all duration-150 ${
                    isWideLayout
                      ? "bg-cyan-600 text-white shadow-xs"
                      : isCruda
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-600 hover:bg-white/60"
                  }`}
                >
                  Ancho
                </button>
              </div>
            </div>

            {/* Botón de Ayuda/Guía & Badge Orientador alineados a la derecha del panel */}
            <div className="flex flex-wrap items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-500/5 border border-slate-500/15 p-1 px-2.5 rounded-lg text-xs">
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] font-mono opacity-50 uppercase leading-none">Conectado</span>
                    <span className="text-[9.5px] font-black font-mono text-cyan-400 truncate max-w-[140px]" title={currentUser.email || ""}>
                      {currentUser.email}
                    </span>
                  </div>
                  {(currentUser.email === "tarotistasonline@gmail.com" || currentUser.email === "azulbaires@gmail.com") && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDonationModal(true);
                        setIsEditingDonation(true);
                      }}
                      className="p-1 px-2 border rounded border-purple-500 bg-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-500/30 text-[9px] font-black font-mono uppercase cursor-pointer flex items-center gap-1.5 transition animate-pulse"
                      title="Configurar Mixpanel / Google AdSense / Donaciones"
                    >
                      <Settings className="w-3 h-3 text-purple-400" />
                      <span>Configurar Mixpanel / AdSense</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="p-1 px-2 border rounded border-red-500/35 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 text-[9px] font-black font-mono uppercase cursor-pointer flex items-center gap-1 transition"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthError(null);
                    setAuthSuccess(null);
                    setShowAuthModal(true);
                  }}
                  className="py-1.5 px-3 text-[9px] font-black font-mono uppercase bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 shrink-0 border border-cyan-400/20"
                  title="Iniciar sesión para sincronizar historial y configurar donaciones"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowStartGuide(true)}
                className="py-1.5 px-3 text-[9px] font-black font-mono uppercase bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 animate-pulse shrink-0 border border-emerald-400/20"
                title="Abrir la Guía de inicio rápido para aprender a usar el consultorio"
              >
                <HelpCircle className="w-3.5 h-3.5 text-white" />
                <span>Ayuda / Guía</span>
              </button>

              <div className="flex items-center gap-2">
                <span className={`p-0.5 px-2.5 border rounded-full text-[8.5px] font-mono tracking-widest uppercase font-black bg-cyan-500/15 text-cyan-500 ${isCruda ? "border-white/20" : "border-slate-300"}`}>
                  ● Orientador Clínico Virtual
                </span>
                <span className="text-[9px] font-mono opacity-50 uppercase">v3.1</span>
              </div>
            </div>
          </div>

          <div className="cursor-pointer" onClick={() => document.getElementById("chat-input")?.focus()}>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight flex items-center gap-2 font-display">
              <Stethoscope className={`w-8 h-8 ${isCruda ? "text-white" : "text-slate-800"} animate-pulse`} />
              Consultorio al paso
            </h1>
            <p className="text-xs font-mono opacity-60 uppercase mt-1">
              Orientación de salud familiar, pautas de alarma e interpretación ágil de laboratorios
            </p>
          </div>
        </header>
        
        {/* Banner de Aviso de Orientación Médica Oficial (Opción 2) */}
        {!dismissedMedicalWarning && (
          <div className="mb-6 p-4 rounded-xl border transition-all animate-fade-in bg-slate-900/60 border-cyan-500/20 text-slate-100 shadow-md shadow-cyan-950/15">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg shrink-0 mt-0.5 bg-cyan-500/10 text-cyan-400">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider font-mono block text-cyan-400">
                    📢 AVISO DE ORIENTACIÓN INFORMATIVA Y FAMILIAR
                  </span>
                  <p className="text-[12px] font-sans leading-relaxed font-semibold">
                    Este consultorio es un recurso complementario de orientación basado en <strong className="font-bold text-cyan-500">Inteligencia Artificial</strong>. No es un servicio de atención médica profesional ni prescribe recetas de medicamentos regulados.
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90 font-sans">
                    • <strong className="font-bold">Creado para la comunidad:</strong> Diseñado para simplificar la consulta de pautas de alarma e interpretación ágil de laboratorios de referencia.<br />
                    • <strong className="font-bold">No reemplaza al médico:</strong> Ante cualquier síntoma grave o duda sobre dosificación e indicaciones, consulte siempre de forma presencial a su centro de salud o médico de confianza.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDismissedMedicalWarning(true);
                  localStorage.setItem("dismissed_medical_warning", "true");
                }}
                className="p-1.5 rounded-lg transition-all cursor-pointer shrink-0 hover:bg-cyan-500/15 text-slate-400 hover:text-cyan-300"
                title="Entendido, no mostrar este aviso de nuevo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Warning Banner for Firestore / AdBlock Blockers */}
        {firestoreUnavailable && !dismissedFirestoreWarning && (
          <div className={`mb-5 p-4 md:p-5 rounded-xl border-2 transition-all shadow-md animate-fade-in ${
            isCruda 
              ? "bg-amber-950/20 border-amber-500/40 text-amber-200" 
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isCruda ? "text-amber-400" : "text-amber-600 animate-pulse"}`} />
                <div className="text-xs space-y-1 md:space-y-1.5 text-left">
                  <span className="font-extrabold uppercase tracking-wide block text-sm">
                    ⚠️ Conectividad de Servidor / Aviso de Bloqueador de Anuncios o Protección de Brave
                  </span>
                  <p className="leading-relaxed font-sans font-bold">
                    No se ha podido conectar de manera directa con la base de datos de consulta en tiempo real (firestore.googleapis.com).
                  </p>
                  <p className="leading-relaxed font-sans text-[11px] opacity-90 pl-2 border-l border-amber-500/30">
                    • Si utilizas <strong className="font-semibold text-cyan-400">Brave Browser</strong>, desactiva temporalmente el de <strong className="font-semibold text-cyan-400">Escudo de Brave (Brave Shield)</strong> para este sitio para habilitar el historial en tiempo real.<br />
                    • Si tienes activado algún bloqueador de anuncios tipo <strong className="font-semibold text-cyan-400">uBlock Origin, AdBlock o similar</strong>, desactívalo o añade esta URL como excepción.<br />
                    • Asegúrate de contar con una conexión a internet estable.
                  </p>
                  <p className="pt-1 text-[10.5px] font-semibold font-sans italic opacity-85">
                    * El consultorio clínico seguirá funcionando perfectamente en modo seguro fuera de línea (offline) con total confidencialidad, usando almacenamiento local.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDismissedFirestoreWarning(true)}
                className="p-1.5 rounded-lg hover:bg-amber-500/10 transition cursor-pointer shrink-0"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-lg bg-red-500/10 border-2 border-red-500/30 text-red-500 flex items-start justify-between gap-2.5 shadow animate-fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-subtle-spin" />
              <div className="text-xs font-mono">
                <span className="font-bold uppercase block mb-0.5">Alerta de conexión / servicio</span>
                <p className="leading-relaxed whitespace-pre-wrap">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="p-1.5 rounded-md hover:bg-red-500/20 text-red-500 transition cursor-pointer shrink-0"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Categories Tab navigation */}
        <div className="mb-6">
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2 opacity-50">Especialidad de Consulta</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const IconComp = cat.id === "rutina" ? Activity 
                : cat.id === "sales_copy" ? FileText 
                : cat.id === "negocio" ? Heart 
                : cat.id === "calculadora" ? Scale 
                : Scale;
              
              const isTipsSelection = cat.id === "negocio";
              
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-lg border transition flex items-center gap-2 cursor-pointer active:scale-95 ${
                    isSelected
                      ? isTipsSelection
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm font-extrabold"
                        : (isCruda ? "bg-cyan-600 border-cyan-600 text-white shadow-lg" : "bg-cyan-600 border-cyan-600 text-white shadow-sm")
                      : isTipsSelection
                        ? (isCruda ? "bg-slate-900 border-emerald-800 text-emerald-400 font-extrabold hover:bg-emerald-950/20" : "bg-emerald-50/50 border-emerald-250 text-emerald-600 font-extrabold hover:bg-emerald-100 shadow-xs")
                        : (isCruda ? "bg-slate-900 border-white/20 text-slate-400 hover:text-white hover:bg-slate-850" : "bg-white border-slate-300 text-slate-655 hover:text-slate-950 hover:bg-slate-50 shadow-xs")
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isTipsSelection && !isSelected ? "text-emerald-500" : ""}`} />
                  <span className={isTipsSelection && !isSelected ? "text-emerald-600 dark:text-emerald-400" : ""}>{cat.name}</span>
                </button>
              );
            })}
          </div>
          {/* Active category instruction subtitle */}
          <p className={`text-xs mt-3.5 max-w-4xl leading-relaxed text-left opacity-75 font-sans flex items-start gap-1.5 ${isCruda ? "text-slate-300" : "text-slate-600"}`}>
            <span className="text-cyan-500 font-extrabold text-[13px] shrink-0 leading-none">ℹ️</span>
            <span><strong className="font-bold tracking-tight text-cyan-550 mr-1">{activeCategoryObj.name}:</strong>{activeCategoryObj.description}</span>
          </p>
        </div>

        {/* Tone Modulator (Especialista de Guardia) - Clean horizontal banner */}
        <div className={`p-4 rounded-xl transition-all border mb-6 ${
          isCruda ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-300 shadow-xs text-slate-850"
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 text-left max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-500">🧑‍⚕️ Especialista de Guardia activo:</span>
                <span className="text-xs font-black px-2 py-0.5 bg-cyan-500/10 text-cyan-600 rounded">
                  {filterLevel === "honesto" ? "🏠 Médico de Familia" : filterLevel === "directo" ? "🔬 Especialista Clínico" : "🚨 Pediatra de Guardia"}
                </span>
              </div>
              <p className="text-[11.5px] opacity-75 sm:leading-relaxed">
                {filterLevel === "honesto" 
                  ? "Orientación médica general, empática, contenedor y con explicaciones de alcance universal." 
                  : filterLevel === "directo" 
                  ? "Orientación científica sólida, terminología precisa, idóneo para debatir de análisis y estudios." 
                  : "Atención ágil enfocada con total firmeza en pautas de cuidado rápido para lactantes."
                }
              </p>
            </div>
            
            {/* Horizontal Radio buttons */}
            <div className="flex bg-slate-500/10 p-1 rounded-lg gap-1 shrink-0 w-full md:w-auto">
              {[
                { id: "honesto", label: "🏠 Familia" },
                { id: "directo", label: "🔬 Clínico" },
                { id: "sin-piedad", label: "🚨 Guardia" }
              ].map((level) => {
                const isActive = filterLevel === level.id;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setFilterLevel(level.id as FilterLevel)}
                    className={`flex-1 md:flex-none px-3 py-1.5 text-[10.5px] font-mono font-black uppercase rounded-md transition cursor-pointer active:scale-95 ${
                      isActive
                        ? "bg-cyan-600 text-white shadow-xs"
                        : isCruda
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-650 hover:text-slate-950"
                    }`}
                  >
                    {level.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Master Column Flow - Wider and Generous for Readable Content */}
        <div className="space-y-6">
          {/* Main Workspace (Full Width) */}
          <main className="w-full space-y-6">

            {selectedCategory === "negocio" && (
              <section id="consejos-salud-section-main-container" className={`p-4 md:p-8 rounded-xl border transition-all w-full max-w-full ${
                isCruda ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-300 text-slate-900 shadow-sm"
              }`}>
                {renderConsejosDeSalud(true)}
              </section>
            )}

            {selectedCategory !== "negocio" && (
              <>
                {/* Chat conversation area */}
                <div className={messages.length === 0 ? "w-full space-y-6" : `p-4 md:p-8 rounded-xl border transition-all duration-300 ${
              isCruda ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-300 text-slate-900 shadow-sm"
            }`}>
              
              {messages.length > 0 && (
                <div className="flex flex-col items-center justify-center border-b pt-8 md:pt-12 pb-4 mb-4 border-slate-200/25 text-center">
                  {isGenerating ? (
                    <div className="text-xs md:text-sm font-sans font-black px-4 py-1.5 rounded-lg border-2 flex items-center justify-center gap-2 leading-none shadow-md tracking-wider bg-yellow-500/10 border-yellow-500/20 text-yellow-500 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
                      <span>ASISTENTE ANALIZANDO...</span>
                    </div>
                  ) : (
                    /* Conexión Activa Badge in Celeste/Cyan Background and Green Bold Text */
                    <div className="p-2.5 px-6 rounded-full text-xs font-sans uppercase bg-cyan-500 hover:bg-cyan-600 text-emerald-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/35 font-black tracking-wider select-none max-w-max mx-auto animate-pulse transition-all">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 inline-block shrink-0"></span>
                      <span>Conexión Activa</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center text-center mt-3 space-y-1.5 select-none animate-fade-in">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <div className={`flex items-center gap-1.5 text-sm md:text-base font-extrabold ${isCruda ? "text-emerald-400" : "text-emerald-650"}`}>
                        <span>🔐 Canal 100% Privado</span>
                      </div>
                    </div>
                    <p className={`text-xs md:text-sm font-semibold ${isCruda ? "text-emerald-400/80" : "text-emerald-650/80"}`}>
                      No se guardan las consultas!
                    </p>
                    {(profileAge || profileSex !== "No especificado" || profileConditions.length > 0 || customCondition) && (
                      <div className={`mt-3 p-2 px-3.5 rounded-lg border text-[11px] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs max-w-lg w-full animate-pulse ${
                        isCruda
                          ? "bg-cyan-950/20 border-cyan-500/25 text-cyan-400"
                          : "bg-cyan-50/55 border-cyan-200 text-cyan-705 text-cyan-700"
                      }`}>
                        <div className="flex items-center gap-1.5 text-center sm:text-left">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                          <span>
                            👤 <strong>Perfil de Salud Activo:</strong> {profileAge ? `${profileAge} años` : "Edad s/n"}{profileSex !== "No especificado" ? `, ${profileSex}` : ""}{profileConditions.length > 0 ? `, Crónicas: ${profileConditions.join("-")}` : ""} {customCondition ? `(${customCondition.slice(0,25)}...)` : ""}
                          </span>
                        </div>
                        <span className="text-[8px] font-black bg-cyan-500/10 border border-cyan-500/30 rounded px-1.5 uppercase shrink-0">Personalizando Respuestas</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message display core */}
              <div className="min-h-[220px]">
                {messages.length === 0 ? (
                  // EMPTY HERO LAYOUT WITH SYMPTOMS
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 py-4 text-center max-w-full mx-auto"
                  >
                    <div className="select-none text-center">
                      <div className={`inline-flex items-center justify-center p-3.5 rounded-full border mb-3 shadow-xs transition duration-200 ${
                        isCruda ? "bg-slate-900 text-white border-slate-800" : "bg-slate-100 text-slate-800 border-slate-200"
                      }`}>
                        <Stethoscope className={`w-8 h-8 ${isCruda ? "text-white" : "text-slate-700"} hover:animate-pulse`} />
                      </div>
                      <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tight mb-1.5 font-display ${
                        isCruda ? "text-white" : "text-slate-900"
                      }`}>
                        Consulta y Orientación Médica
                      </h3>
                      <p className={`text-xs leading-relaxed max-w-lg mx-auto font-sans mb-4 ${isCruda ? "text-slate-400" : "text-slate-600"}`}>
                        Por favor, escribe tus dudas, sube tus estudios o habla por el micrófono clínico para iniciar tu orientación virtual.
                      </p>
                    </div>

                    {/* Integrated Active Chat Input Console right in the center of the large panel */}
                    <div id="lobby-input-container" className={`p-4 rounded-xl border bg-slate-500/5 shadow-none transition duration-350 ${
                      isCruda ? "border-white/20" : "border-slate-300"
                    }`}>
                      <span className={`text-[9.5px] font-mono font-black tracking-widest uppercase block text-left mb-2 ${isCruda ? "text-slate-300" : "text-slate-700"}`}>Escribe tu consulta o adjunta estudios</span>
                      {renderChatForm(true)}
                    </div>

                    {/* Integrated Study Upload drag-and-drop container inside empty state */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-5 rounded-lg border border-dashed text-center transition-all cursor-pointer ${
                        isCruda
                          ? "bg-slate-900/10 border-white/20 hover:bg-cyan-950/5 hover:border-cyan-500/35"
                          : "bg-cyan-50/15 border-slate-300 hover:bg-cyan-50/30 hover:border-cyan-500"
                      }`}
                      title="Haz clic o arrastra un archivo de estudio/laboratorio aquí"
                    >
                      <Upload className="w-6 h-6 mx-auto mb-2 text-cyan-500 hover:scale-110 transition duration-200" />
                      <p className={`text-[11.5px] font-bold ${isCruda ? "text-white" : "text-slate-800"}`}>¿Tiene estudios clínicos o análisis en PDF o imagen?</p>
                      <p className={`text-[10px] font-mono mt-0.5 font-bold ${isCruda ? "text-slate-200" : "text-slate-700"}`}>Arrástrelos y suéltelos aquí o haga clic para subirlos (Soporta PDFs, imágenes y texto de hasta 8MB)</p>
                    </div>

                    {/* Perfil de Salud Personal con Aviso de Completar - Ubicado antes de Síntomas Corporales */}
                    <div className={`p-4 md:p-5 rounded-xl border transition-all ${
                      isCruda ? "bg-slate-900 border-white/20 text-white" : "bg-stone-50/15 border-slate-300 text-slate-900 shadow-xs"
                    }`}>
                      <h3 className="text-xs md:text-sm font-extrabold uppercase mb-2 flex flex-wrap items-center justify-between tracking-wide gap-2">
                        <span className="flex items-center gap-1.5 text-cyan-600">
                          <User className="w-4 h-4 text-cyan-600" />
                          Perfil de Salud Personal
                          <span className="text-xs text-emerald-500 font-black animate-pulse uppercase ml-1.5 shrink-0">
                            🟢 ¡Nuevo!
                          </span>
                        </span>
                        <span className={`text-[8.5px] font-mono border rounded p-0.5 px-2 font-black uppercase shrink-0 ${
                          profileAge || profileSex !== "No especificado" || profileConditions.length > 0 || customCondition
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse"
                        }`}>
                          {profileAge || profileSex !== "No especificado" || profileConditions.length > 0 || customCondition ? "ACTIVO" : "VACÍO / RECOMENDADO"}
                        </span>
                      </h3>

                      <p className={`text-xs leading-relaxed mb-4 font-sans font-bold bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20 ${
                        isCruda ? "text-slate-100" : "text-slate-850"
                      }`}>
                        <strong className="text-emerald-500 font-black animate-pulse">Recomendación profesional: </strong>
                        Se aconseja que <strong className="text-emerald-500 font-black uppercase">antes de hacer la consulta</strong> complete su perfil de salud. Esto nos permite brindarle una respuesta mucho más completa, segura y adaptada a sus antecedentes clínicos, cuidando posibles interacciones lógicas o dosificaciones específicas.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {/* Edad y Sexo */}
                        <div className="space-y-3">
                          <div>
                            <label className={`text-[10px] font-black uppercase block tracking-wider mb-1 ${
                              isCruda ? "text-slate-200" : "text-slate-800"
                            }`}>
                              Edad (Años):
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              placeholder="Ej. 35"
                              value={profileAge}
                              onChange={(e) => setProfileAge(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-lg border outline-none transition ${
                                isCruda
                                  ? "bg-slate-950 border-slate-800 text-white focus:border-cyan-500"
                                  : "bg-white border-slate-250 text-slate-900 focus:border-cyan-400 focus:bg-white shadow-2xs"
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`text-[10px] font-black uppercase block tracking-wider mb-1 ${
                              isCruda ? "text-slate-200" : "text-slate-800"
                            }`}>
                              Sexo Biológico:
                            </label>
                            <select
                              value={profileSex}
                              onChange={(e) => setProfileSex(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-lg border outline-none transition cursor-pointer ${
                                isCruda
                                  ? "bg-slate-950 border-slate-800 text-white focus:border-cyan-500"
                                  : "bg-white border-slate-250 text-slate-900 focus:border-cyan-400 focus:bg-white shadow-2xs"
                              }`}
                            >
                              <option value="No especificado">No especificado</option>
                              <option value="Femenino">Femenino</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                        </div>

                        {/* Condiciones Crónicas y Otras afecciones */}
                        <div className="space-y-3">
                          <div>
                            <label className={`text-[10px] font-black uppercase block tracking-wider mb-1.5 ${
                              isCruda ? "text-slate-200" : "text-slate-800"
                            }`}>
                              Condiciones Crónicas:
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {[
                                { id: "Diabetes", label: "Diabetes" },
                                { id: "Hipertensión", label: "Hipertensión" },
                                { id: "Asma / Respiratorio", label: "Asma" },
                                { id: "Alergias Conocidas", label: "Alergias" },
                                { id: "Hipotiroidismo", label: "Hipotiroidismo" },
                                { id: "Problemas Cardíacos", label: "Cardiopatía" }
                              ].map((cond) => {
                                  const isChecked = profileConditions.includes(cond.id);
                                  return (
                                    <button
                                      key={cond.id}
                                      type="button"
                                      onClick={() => {
                                        if (isChecked) {
                                          setProfileConditions(profileConditions.filter((c) => c !== cond.id));
                                        } else {
                                          setProfileConditions([...profileConditions, cond.id]);
                                        }
                                      }}
                                      className={`p-1 px-2 text-[9.5px] font-mono font-black uppercase border rounded-md transition cursor-pointer active:scale-95 ${
                                        isChecked
                                          ? "bg-cyan-600 border-cyan-600 text-white shadow-xs"
                                          : isCruda
                                            ? "bg-slate-950 border-slate-900 text-slate-250 hover:text-white"
                                            : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
                                      }`}
                                    >
                                      {isChecked ? "✓ " : ""}{cond.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                            <label className={`text-[10px] font-black uppercase block tracking-wider mb-1 ${
                              isCruda ? "text-slate-200" : "text-slate-800"
                            }`}>
                              Detalles adicionales de salud / Alergias:
                            </label>
                            <textarea
                              rows={1}
                              placeholder="Escribe alergias a medicamentos o si cursa embarazo..."
                              value={customCondition}
                              onChange={(e) => setCustomCondition(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-lg border outline-none resize-none transition-all ${
                                isCruda
                                  ? "bg-slate-950 border-slate-800 text-white focus:border-cyan-500"
                                  : "bg-white border-slate-250 text-slate-900 focus:border-cyan-400 focus:bg-white shadow-2xs"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Visual indicación de guardado */}
                      <div className="pt-2 mt-3 flex items-center justify-between border-t border-dashed border-slate-200/50">
                        <span className="text-[10px] text-emerald-600 flex items-center gap-1.5 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Datos guardados localmente de forma segura
                        </span>
                        {(profileAge || profileSex !== "No especificado" || profileConditions.length > 0 || customCondition) && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileAge("");
                              setProfileSex("No especificado");
                              setProfileConditions([]);
                              setCustomCondition("");
                            }}
                            className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer bg-transparent border-0 p-0"
                          >
                            Limpiar Perfil
                          </button>
                        )}
                      </div>
                    </div>

                    {/* SECCIÓN PREVENTIVA DE AUTOGESTIÓN */}
                    <div className="space-y-3 text-left">
                      <div className={`flex items-center justify-between border-b pb-1.5 ${isCruda ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${isCruda ? "text-slate-400" : "text-slate-500"}`}>MÓDULOS ACTIVOS DE EVALUACIÓN CLÍNICA</span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          <span className="text-[9px] text-emerald-500 font-extrabold font-mono uppercase tracking-wide">AUTO-CHECK PREVENTIVO</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* PANEL 1: PESO Y CÁLCULO DE IMC */}
                        <div className={`p-4 md:p-6 rounded-xl border transition-all flex flex-col justify-between ${
                          isCruda ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-300 text-slate-900 shadow-sm"
                        }`}>
                          <div>
                            <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-200/10">
                              <div className="p-1.5 bg-cyan-500/15 rounded-lg border border-cyan-500/30 text-cyan-500">
                                <Scale className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-xs md:text-sm font-black uppercase tracking-wide">Peso y Cálculo de IMC</h3>
                                <p className="text-[10px] opacity-70">Monitorea tu Índice de Masa Corporal instantáneamente</p>
                              </div>
                            </div>

                            {/* Sliders */}
                            <div className="space-y-4">
                              {/* Peso */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider opacity-75">⚖️ Peso Corporal:</span>
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <button
                                      type="button"
                                      onClick={() => setPesoIMC(prev => Math.max(30, prev - 1))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-cyan-500/15 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Restar 1 kg"
                                    >
                                      -
                                    </button>
                                    <div className="relative flex items-center justify-center bg-cyan-500/10 border border-cyan-500/25 rounded px-1.5 h-6 text-center select-none">
                                      <input
                                        type="number"
                                        id="peso-imc-number-input"
                                        min="30"
                                        max="220"
                                        value={pesoIMC || ""}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (!isNaN(val)) {
                                            setPesoIMC(Math.min(220, Math.max(0, val)));
                                          } else if (e.target.value === "") {
                                            setPesoIMC(0);
                                          }
                                        }}
                                        className="w-10 bg-transparent text-cyan-500 font-extrabold text-xs text-center border-0 outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                                        title="Haz clic para escribir tu peso directamente"
                                      />
                                      <span className="text-[9px] font-bold text-cyan-600/80 ml-0.5 pointer-events-none">kg</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPesoIMC(prev => Math.min(220, prev + 1))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-cyan-500/15 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Sumar 1 kg"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="30"
                                  max="200"
                                  step="1"
                                  value={pesoIMC}
                                  onChange={(e) => setPesoIMC(Number(e.target.value))}
                                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-500/25 rounded-lg transition animate-none"
                                />
                              </div>

                              {/* Altura */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider opacity-75">📏 Estatura/Altura:</span>
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <button
                                      type="button"
                                      onClick={() => setAlturaIMC(prev => Math.max(100, prev - 1))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-cyan-500/15 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Restar 1 cm"
                                    >
                                      -
                                    </button>
                                    <div className="relative flex items-center justify-center bg-cyan-500/10 border border-cyan-500/25 rounded px-1.5 h-6 text-center select-none">
                                      <input
                                        type="number"
                                        id="altura-imc-number-input"
                                        min="100"
                                        max="240"
                                        value={alturaIMC || ""}
                                        onChange={(e) => {
                                          let val = parseFloat(e.target.value);
                                          if (!isNaN(val)) {
                                            if (val > 0 && val < 3) {
                                              // Auto-convert from decimal meters (e.g. 1.75 -> 175)
                                              val = Math.round(val * 100);
                                            }
                                            setAlturaIMC(Math.min(240, Math.max(0, Math.round(val))));
                                          } else if (e.target.value === "") {
                                            setAlturaIMC(0);
                                          }
                                        }}
                                        className="w-10 bg-transparent text-cyan-500 font-extrabold text-xs text-center border-0 outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                                        title="Haz clic para escribir tu estatura en centímetros (ej. 175)"
                                      />
                                      <span className="text-[9px] font-bold text-cyan-600/80 ml-0.5 pointer-events-none">cm</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setAlturaIMC(prev => Math.min(240, prev + 1))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-cyan-500/15 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Sumar 1 cm"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="100"
                                  max="220"
                                  step="1"
                                  value={alturaIMC}
                                  onChange={(e) => setAlturaIMC(Number(e.target.value))}
                                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-500/25 rounded-lg transition animate-none"
                                />
                              </div>

                              {/* Result */}
                              {(() => {
                                const imcData = calculateIMC();
                                return (
                                  <div className={`p-3.5 rounded-lg border text-left mt-2 relative overflow-hidden transition-all duration-300 ${imcData.bg}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono uppercase font-black opacity-70">Resultado Estructural:</span>
                                      <span className={`text-[10px] font-mono tracking-wider border rounded-full px-2.5 py-0.5 font-black uppercase bg-black/5 ${imcData.color}`}>
                                        ● {imcData.cat}
                                      </span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                      <span className={`text-2xl md:text-3xl font-black tracking-tight ${imcData.color}`}>
                                        {imcData.imc}
                                      </span>
                                      <span className="text-[10px] font-black opacity-65 font-sans">kg/m²</span>
                                    </div>
                                    <p className="text-[11px] mt-1.5 leading-relaxed font-bold opacity-90 font-sans">
                                      {imcData.desc}
                                    </p>
                                    
                                    {/* Gauge reference */}
                                    <div className="mt-3.5 space-y-1.5">
                                      <div className="w-full h-2 rounded-full overflow-hidden flex border border-slate-500/10">
                                        <div className="w-[18%] bg-amber-500" title="Bajo peso (&lt;18.5)" />
                                        <div className="w-[32%] bg-emerald-500" title="Saludable (18.5 - 24.9)" />
                                        <div className="w-[25%] bg-orange-500" title="Sobrepeso (25 - 29.9)" />
                                        <div className="w-[25%] bg-red-500" title="Obesidad (&ge;30)" />
                                      </div>
                                      <div className="flex justify-between text-[8px] font-mono opacity-50 px-0.5">
                                        <span>&lt; 18.5</span>
                                        <span>18.5 - 24.9</span>
                                        <span>25.0 - 29.9</span>
                                        <span>&ge; 30.0</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Ephemeral Indicator */}
                          <div className="pt-3 mt-3 border-t border-dashed border-slate-550/10 text-center">
                            <span className="text-[9.5px] font-mono uppercase bg-slate-500/5 text-slate-500 p-1 px-2.5 rounded border border-slate-500/10 inline-block font-bold">
                              🔒 Privacidad Total: Datos Temporales y No Almacenados
                            </span>
                          </div>
                        </div>

                        {/* PANEL 2: CÁLCULO DE RIESGO CARDIOVASCULAR */}
                        <div className={`p-4 md:p-6 rounded-xl border transition-all flex flex-col justify-between ${
                          isCruda ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-300 text-slate-900 shadow-sm"
                        }`}>
                          <div>
                            <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-200/10">
                              <div className="p-1.5 bg-emerald-500/15 rounded-lg border border-emerald-500/30 text-emerald-500">
                                <Activity className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-xs md:text-sm font-black uppercase tracking-wide">Riesgo Cardiovascular</h3>
                                <p className="text-[10px] opacity-70">Parámetros integrados de la OMS y Framingham de 10 años para todas las edades</p>
                              </div>
                            </div>

                            {/* Sliders & toggles */}
                            <div className="space-y-4">
                              {/* Edad Selector Directo */}
                              <div className="space-y-1.5 border-b pb-3.5 border-dashed border-slate-500/10">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider opacity-75">🎂 Edad del Paciente:</span>
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentAge = parseInt(profileAge) || 45;
                                        setProfileAge(String(Math.max(1, currentAge - 1)));
                                      }}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-emerald-500/10 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Restar 1 año"
                                    >
                                      -
                                    </button>
                                    <div className="relative flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25 rounded px-1.5 h-6 text-center select-none">
                                      <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={profileAge}
                                        placeholder="45"
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (!isNaN(val)) {
                                            setProfileAge(String(Math.min(120, Math.max(1, val))));
                                          } else {
                                            setProfileAge("");
                                          }
                                        }}
                                        className="w-8 bg-transparent text-emerald-500 font-extrabold text-xs text-center border-0 outline-none p-0 focus:ring-0"
                                        title="Haz clic para escribir tu edad directamente"
                                      />
                                      <span className="text-[8.5px] font-bold text-emerald-600/80 ml-0.5 pointer-events-none">años</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentAge = parseInt(profileAge) || 45;
                                        setProfileAge(String(Math.min(120, currentAge + 1)));
                                      }}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-emerald-500/10 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Sumar 1 año"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="100"
                                  step="1"
                                  value={parseInt(profileAge) || 45}
                                  onChange={(e) => setProfileAge(e.target.value)}
                                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-550/15 rounded-lg transition"
                                />
                                <span className="text-[8.5px] text-slate-500 font-semibold block text-center leading-normal">
                                  El riesgo cardiovascular aplica y varía en todas las etapas de la vida (escala extendida).
                                </span>
                              </div>

                              {/* Sexo Biológico Direct Selector */}
                              <div className="space-y-1.5 border-b pb-3.5 border-dashed border-slate-500/10">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider opacity-75">👤 Sexo Biológico:</span>
                                  <div className="flex gap-1.5">
                                    {["Masculino", "Femenino", "No especificado"].map((sexOpt) => {
                                      const isOptSelected = profileSex === sexOpt;
                                      return (
                                        <button
                                          key={sexOpt}
                                          type="button"
                                          onClick={() => setProfileSex(sexOpt)}
                                          className={`p-1 px-2 rounded text-[9.5px] font-mono font-black uppercase border transition cursor-pointer active:scale-95 ${
                                            isOptSelected
                                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                              : isCruda
                                                ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                                : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                                          }`}
                                        >
                                          {sexOpt === "No especificado" ? "S/N" : sexOpt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* SBP - Presión arterial sistólica */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider opacity-75">💓 Presión Sistólica:</span>
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <button
                                      type="button"
                                      onClick={() => setCvPresionSistolica(prev => Math.max(90, prev - 5))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-emerald-500/10 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Restar 5 mmHg"
                                    >
                                      -
                                    </button>
                                    <div className="relative flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25 rounded px-1.5 h-6 text-center select-none">
                                      <input
                                        type="number"
                                        id="cv-presion-sistolica-number-input"
                                        min="90"
                                        max="220"
                                        value={cvPresionSistolica || ""}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (!isNaN(val)) {
                                            setCvPresionSistolica(Math.min(220, Math.max(0, val)));
                                          } else if (e.target.value === "") {
                                            setCvPresionSistolica(0);
                                          }
                                        }}
                                        className="w-10 bg-transparent text-emerald-500 font-extrabold text-xs text-center border-0 outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                                        title="Haz clic para escribir tu presión sistólica directamente"
                                      />
                                      <span className="text-[8.5px] font-bold text-emerald-600/80 ml-0.5 pointer-events-none">mmHg</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setCvPresionSistolica(prev => Math.min(220, prev + 5))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-emerald-500/10 bg-transparent border-slate-500/30 active:scale-95 cursor-pointer"
                                      title="Sumar 5 mmHg"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="90"
                                  max="200"
                                  step="5"
                                  value={cvPresionSistolica}
                                  onChange={(e) => setCvPresionSistolica(Number(e.target.value))}
                                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-550/15 rounded-lg transition"
                                />
                              </div>

                              {/* Colesterol Total */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider opacity-75">🧪 Colesterol Total:</span>
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <button
                                      type="button"
                                      onClick={() => setCvColesterol(prev => Math.max(120, prev - 10))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-emerald-550/10 bg-transparent border-slate-500/20 active:scale-95 cursor-pointer"
                                      title="Restar 10 mg/dL"
                                    >
                                      -
                                    </button>
                                    <div className="relative flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25 rounded px-1.5 h-6 text-center select-none">
                                      <input
                                        type="number"
                                        id="cv-colesterol-number-input"
                                        min="120"
                                        max="320"
                                        value={cvColesterol || ""}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (!isNaN(val)) {
                                            setCvColesterol(Math.min(320, Math.max(0, val)));
                                          } else if (e.target.value === "") {
                                            setCvColesterol(0);
                                          }
                                        }}
                                        className="w-10 bg-transparent text-emerald-500 font-extrabold text-xs text-center border-0 outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                                        title="Haz clic para escribir tu colesterol directamente"
                                      />
                                      <span className="text-[8.5px] font-bold text-emerald-600/80 ml-0.5 pointer-events-none">mg/dL</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setCvColesterol(prev => Math.min(320, prev + 10))}
                                      className="p-0.5 px-2 rounded border text-[11px] font-black transition hover:bg-emerald-555/10 bg-transparent border-slate-500/20 active:scale-95 cursor-pointer"
                                      title="Sumar 10 mg/dL"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="120"
                                  max="320"
                                  step="10"
                                  value={cvColesterol}
                                  onChange={(e) => setCvColesterol(Number(e.target.value))}
                                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-550/15 rounded-lg transition"
                                />
                              </div>

                              {/* Switches for smoking and diabetes */}
                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-65">🍭 Diabetes:</span>
                                  <button
                                    type="button"
                                    onClick={() => setCvDiabetes(prev => !prev)}
                                    className={`w-full py-2.5 text-xs font-mono font-black uppercase border rounded-lg transition-all cursor-pointer active:scale-95 ${
                                      cvDiabetes || profileConditions.includes("Diabetes")
                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                        : isCruda
                                          ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                          : "bg-white border-slate-300 text-slate-705 hover:bg-slate-50"
                                    }`}
                                  >
                                    {cvDiabetes || profileConditions.includes("Diabetes") ? "Sí (Diabético)" : "No Diabético"}
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-65">🚬 Cigarro / Fuma:</span>
                                  <button
                                    type="button"
                                    onClick={() => setCvFumador(prev => !prev)}
                                    className={`w-full py-2.5 text-xs font-mono font-black uppercase border rounded-lg transition-all cursor-pointer active:scale-95 ${
                                      cvFumador
                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                        : isCruda
                                          ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                          : "bg-white border-slate-300 text-slate-705 hover:bg-slate-50"
                                    }`}
                                  >
                                    {cvFumador ? "Sí (Fumador)" : "No Fumador"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cardio Risk Display */}
                          <div className="pt-4 mt-4 border-t border-dashed border-slate-500/15">
                            {(() => {
                              const riskDoc = calculateCardioRisk();
                              const formattedAge = parseInt(profileAge) || 45;
                              const isUsingRealAge = !isNaN(parseInt(profileAge));

                              return (
                                <div className={`p-3.5 rounded-lg border text-left relative overflow-hidden transition-all duration-300 ${riskDoc.bg}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono uppercase font-black opacity-70">Riesgo en 10 años:</span>
                                    <span className={`text-[10px] font-mono tracking-wider border rounded-full px-2.5 py-0.5 font-black uppercase bg-black/5 ${riskDoc.color}`}>
                                      ● {riskDoc.label}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1 mt-1 justify-between flex-wrap text-left">
                                    <div className="flex items-baseline gap-1">
                                      <span className={`text-2xl md:text-3xl font-black tracking-tight ${riskDoc.color}`}>
                                        {riskDoc.risk}%
                                      </span>
                                      <span className="text-[9.5px] font-black opacity-65 font-sans">probabilidad</span>
                                    </div>
                                    <span className="text-[8.5px] font-mono bg-black/5 border p-0.5 px-2 rounded opacity-75">
                                      {formattedAge} años, {profileSex !== "No especificado" ? profileSex : "Sexo s/n"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] mt-1.5 leading-relaxed font-bold opacity-90 font-sans text-left">
                                    {riskDoc.desc}
                                  </p>
                                  
                                  {/* Pointer indicator */}
                                  <div className="mt-4 space-y-1.5">
                                    <div className="relative w-full h-3">
                                      <div 
                                        className="absolute -bottom-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300 animate-none"
                                        style={{ left: `${Math.min(97, Math.max(3, riskDoc.risk))}%` }}
                                      >
                                        <span className={`text-[9.5px] font-black leading-none ${riskDoc.color}`}>▼</span>
                                      </div>
                                    </div>
                                    {/* Color ranges bar */}
                                    <div className="w-full h-2 rounded-full overflow-hidden flex border border-slate-500/10">
                                      <div className="w-[10%] bg-emerald-500" title="Bajo (<10%)" />
                                      <div className="w-[10%] bg-yellow-500" title="Moderado (10% - 19%)" />
                                      <div className="w-[10%] bg-orange-500" title="Alto (20% - 29%)" />
                                      <div className="w-[70%] bg-red-500" title="Muy Alto (>=30%)" />
                                    </div>
                                    <div className="flex justify-between text-[7px] font-mono opacity-50 px-0.5">
                                      <span>Bajo (&lt;10%)</span>
                                      <span>Med (10-19%)</span>
                                      <span>Alto (20-29%)</span>
                                      <span>&ge;30%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Presets Symptoms Pills Section (REPLACING OLD MARKETING PRESETS) */}
                    <div className="space-y-3 text-left">
                      <div className={`flex items-center justify-between border-b pb-1.5 ${isCruda ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${isCruda ? "text-slate-400" : "text-slate-500"}`}>GUÍAS Y CASOS PARTICULARES RESUELTOS</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PRESETS.map((preset, idx) => (
                          <button
                            key={preset.id}
                            onClick={() => handleApplyPreset(preset.prompt, preset.categoryId)}
                            className={`p-3.5 rounded-lg text-left border-2 transition active:scale-[0.99] flex flex-col justify-between h-32 text-xs relative overflow-hidden group subtle-white-border ${
                              isCruda 
                                ? "bg-slate-950 hover:bg-slate-900/60 border-slate-850 hover:border-cyan-500/40" 
                                : "bg-slate-50 hover:bg-white border-white hover:border-cyan-500/50 shadow-xs"
                            }`}
                          >
                            <div className="w-full">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 border rounded uppercase tracking-wider font-semibold ${
                                  isCruda ? "bg-slate-900 border-slate-850 text-cyan-400" : "bg-white border-white text-slate-705 shadow-xs"
                                }`}>
                                  {preset.badge}
                                </span>
                                <ChevronRight className="w-3 h-3 text-slate-405 group-hover:text-cyan-500 transition-colors" />
                              </div>
                              <h4 className={`text-xs font-bold transition-colors font-display tracking-tight uppercase line-clamp-1 ${
                                  isCruda ? "text-slate-200 group-hover:text-cyan-400" : "text-slate-800 group-hover:text-cyan-600"
                              }`}>
                                {preset.title}
                              </h4>
                              <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed font-sans ${
                                isCruda ? "text-slate-400" : "text-slate-600"
                              }`}>
                                {preset.prompt}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Últimos Avances Médicos y Tips de Bienestar (Espacio Ampliado y Totalmente Dinámico) */}
                    <div id="consejos-salud-section-main-container-dashboard" className={`p-4 md:p-6 rounded-xl border transition-all space-y-4 md:space-y-5 ${
                      isCruda ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-300 text-slate-900 shadow-xs"
                    }`}>
                      {renderConsejosDeSalud(true)}
                    </div>
                  </motion.div>
                ) : (
                  // Scroll message Thread
                  <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 border-b border-slate-100/10 pr-1 py-1">
                    {messages.map((msg, index) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={index}
                          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                        >
                          <div className={`max-w-[85%] rounded border p-4 md:p-5 shadow-xs transition-colors ${
                            isUser
                              ? (isCruda ? "bg-slate-950/45 border-slate-750 text-white rounded-br-none" : "bg-cyan-50/50 border-slate-300 text-slate-900 rounded-br-none")
                              : (isCruda ? "bg-slate-950 border-slate-700/60 rounded-bl-none text-slate-200" : "bg-white border-slate-300 text-slate-800 rounded-bl-none")
                          }`}>
                            
                            {/* Role message Header */}
                            <div className={`flex items-center justify-between gap-6 mb-2.5 border-b pb-2 ${
                              isCruda ? "border-slate-800/10" : "border-slate-200/45"
                            }`}>
                              <span className={`text-[9px] font-mono font-bold tracking-widest uppercase flex items-center gap-1 ${
                                isUser 
                                  ? (isCruda ? "text-cyan-400" : "text-cyan-700") 
                                  : (isCruda ? "text-white" : "text-slate-600")
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isUser ? "bg-cyan-500" : "bg-emerald-500"}`}></span>
                                  {isUser ? "Tus Síntomas / Consulta" : "Sugerencia Orientadora IA"}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-mono opacity-50`}>{msg.timestamp}</span>
                                  {!isUser && (
                                    <button
                                      onClick={() => handleCopyText(msg.content, index)}
                                      className={`p-1 rounded transition hover:bg-slate-100 dark:hover:bg-slate-900 shrink-0 ${
                                        isCruda ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
                                      }`}
                                      title="Copiar informe"
                                    >
                                      {copiedIndex === index ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
    
                              {/* Clinical Response evaluation */}
                              {isUser ? (
                                <p className={`text-xs md:text-sm font-sans leading-relaxed whitespace-pre-wrap ${
                                  isCruda ? "text-slate-200" : "text-slate-800"
                                }`}>
                                  {msg.content}
                                </p>
                              ) : (
                                <>
                                  <TruthTextRenderer 
                                    text={msg.content} 
                                    theme={theme} 
                                    animate={index === messages.length - 1}
                                    onType={() => {
                                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                                    }}
                                  />
                                  
                                  {/* Utility Ratings feedback with explicit copy button */}
                                  <div className="mt-3.5 pt-2.5 flex flex-wrap items-center justify-between gap-3 border-t text-[10px] font-mono border-slate-200/10 w-full">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 p-0.5 px-2 border border-emerald-500/20 rounded font-bold uppercase block select-none">
                                        Consejos Sanitarios Estables
                                      </span>

                                      {/* Interactive Thumbs feedback controls */}
                                      <div className={`p-0.5 rounded-md border flex items-center gap-1 ${
                                        isCruda ? "bg-slate-900 border-slate-800/80" : "bg-slate-100 border-slate-200"
                                      }`}>
                                        <button
                                          type="button"
                                          onClick={() => handleRateMessage(index, 'up')}
                                          className={`py-0.5 px-1.5 rounded-md cursor-pointer transition flex items-center gap-1.5 text-[8.5px] font-black ${
                                            msg.rating === 'up'
                                              ? "bg-emerald-600 text-white shadow-2xs scale-102"
                                              : isCruda
                                                ? "text-slate-400 hover:text-emerald-400 hover:bg-slate-850"
                                                : "text-slate-600 hover:text-emerald-700 hover:bg-white"
                                          }`}
                                          title="Esta sugerencia es útil / me ayudó"
                                        >
                                          <ThumbsUp className="w-3 h-3" />
                                          <span>{msg.rating === 'up' ? "¡Útil!" : "Útil"}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRateMessage(index, 'down')}
                                          className={`py-0.5 px-1.5 rounded-md cursor-pointer transition flex items-center gap-1.5 text-[8.5px] font-black ${
                                            msg.rating === 'down'
                                              ? "bg-red-600 text-white shadow-2xs scale-102"
                                              : isCruda
                                                ? "text-slate-400 hover:text-red-400 hover:bg-slate-850"
                                                : "text-slate-600 hover:text-red-700 hover:bg-white"
                                          }`}
                                          title="Esta sugerencia es poco clara o no aplica"
                                        >
                                          <ThumbsDown className="w-3.5 h-3.5" />
                                          <span>{msg.rating === 'down' ? "¡No útil!" : "No útil"}</span>
                                        </button>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleCopyText(msg.content, index)}
                                      className={`px-2.5 py-1 rounded border text-[9.5px] font-bold uppercase flex items-center gap-1 cursor-pointer transition ${
                                        copiedIndex === index
                                          ? "bg-emerald-600 border-emerald-600 text-white"
                                          : isCruda
                                            ? "bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-850 hover:text-cyan-300"
                                            : "bg-slate-50 border-slate-200 text-cyan-600 hover:bg-cyan-50"
                                      }`}
                                      title="Copiar resultado de consulta"
                                    >
                                      {copiedIndex === index ? (
                                        <>
                                          <Check className="w-3 h-3 animate-pulse" />
                                          <span>¡Copiado!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copiar Resultado</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Interactive Bottom Control Inputs & Upload clip */}
              {messages.length > 0 && (
                <div id="input-form-section" className="mt-4 pt-4 border-t border-slate-200/25">
                  {renderChatForm(false)}

                  {/* Subtitle helper links */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3.5 text-[10px] font-mono px-1">
                    <span>Presiona la flechita para enviar consulta clínica</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleExportPDF}
                        className="text-emerald-500 hover:underline font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Descargar Chat como PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetConversation}
                        className="text-red-500 hover:text-red-400 hover:underline font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                        title="Reiniciar chat de consulta"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>Reiniciar Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Medical study dropzone indicator */}
            {messages.length > 0 && (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-lg border border-dashed text-center transition-colors cursor-pointer ${
                  isCruda
                    ? "bg-slate-900/10 border-slate-800 hover:bg-cyan-950/5 hover:border-cyan-500/50"
                    : "bg-cyan-50/20 border-slate-300 hover:bg-cyan-50/50 hover:border-cyan-500"
                }`}
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-cyan-550 text-cyan-500" />
                <p className="text-[11px] font-semibold">Arrastra y suelta tu informe acá o haz click para subirlo</p>
                <p className="text-[9px] opacity-50 font-mono mt-0.5">Soporta PDFs, Imágenes de laboratorio y reportes de laboratorio en texto (.txt) de hasta 8MB</p>
              </div>
            )}

            {/* Compiled formal medical report section */}
            {summaryReport && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-lg border-2 text-left relative overflow-hidden text-xs space-y-4 subtle-white-border ${
                  isCruda ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 shadow-lg text-slate-900"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-slate-200/20">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    <span className="font-extrabold uppercase font-mono tracking-tight text-[11px]">Resumen de la Consulta (Para llevar al Médico de Cabecera)</span>
                  </div>
                  <button 
                    onClick={() => handleCopyText(summaryReport, 9999)}
                    className="text-[9px] font-bold p-1 px-2.5 rounded bg-cyan-600 text-white hover:opacity-90 transition inline-block uppercase"
                  >
                    {copiedIndex === 9999 ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <p className="text-xs font-serif leading-relaxed whitespace-pre-wrap italic opacity-85">{summaryReport}</p>
                <div className="text-[8px] opacity-40 font-mono text-center">
                  * Documento resumido mediante Inteligencia Artificial para uso de orientación en la consulta física posterior.
                </div>
              </motion.div>
            )}
              </>
            )}

          </main>
        </div>

        {/* Global medical footer disclaimer */}
        <footer className={`mt-12 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-5 text-center text-[10px] font-sans font-medium ${
          isCruda ? "border-slate-900" : "border-slate-200"
        }`}>
          <div className="flex flex-wrap gap-4 justify-center opacity-60">
            <span>AVISO LEGAL SENSOCLÍNICO: ESTA IA BRINDA ORIENTACIÓN PRECLÍNICA</span>
            <span>ANTE SÍNTOMAS COMPLEJOS CONSULTE AL MÉDICO DE CABECERA</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2.5">
            <p className="font-mono text-[9px] opacity-60">
              Consultorio al paso Dr. Link v3.1.5 — Evaluación Científica Informativa
            </p>
            {/* Real-time visits indicator badge at the absolute bottom with Reiniciar Chat / Sitio options */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 select-none text-[10px]">
              <span className="p-1.5 px-3 border rounded font-mono uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/25 flex items-center gap-2 shadow-xs font-black select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0"></span>
                <span className="font-extrabold">Tus visitas: <strong className="text-emerald-300 text-[11px] font-black">{myIndividualVisits}</strong> de <strong className="text-emerald-400 text-[11px] font-black">{visitCount !== null ? visitCount.toLocaleString() : "..."}</strong> totales</span>
              </span>

              <button
                type="button"
                onClick={() => setShowDonationModal(true)}
                className="p-1.5 px-3 border rounded border-amber-500/35 text-amber-400 hover:text-amber-350 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-2 shadow-xs uppercase cursor-pointer active:scale-95 transition-all duration-150 font-black"
                title="Apoyar el mantenimiento del servidor, base de datos y desarrollo"
              >
                <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 animate-pulse" />
                <span className="font-black">Apoyar Servidor</span>
              </button>

              <button
                type="button"
                onClick={handleResetConversation}
                className="p-1.5 px-3 border rounded border-cyan-500/35 text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center gap-2 shadow-xs uppercase cursor-pointer active:scale-95 transition-all duration-150 font-black"
                title="Reiniciar la conversación del chat actual"
              >
                <RotateCcw className="w-3.5 h-3.5 hover:rotate-180 transition duration-300 text-cyan-400" />
                <span className="font-black">Reiniciar Chat</span>
              </button>

              {dismissedMedicalWarning && (
                <button
                  type="button"
                  onClick={() => {
                    setDismissedMedicalWarning(false);
                    try {
                      localStorage.removeItem("dismissed_medical_warning");
                    } catch {}
                  }}
                  className="p-1.5 px-3 border rounded border-amber-500/25 text-amber-500 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/15 flex items-center gap-2 shadow-xs uppercase cursor-pointer active:scale-95 transition-all duration-150 font-bold"
                  title="Ver de nuevo el aviso de deslinde de responsabilidad médica"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="font-bold">Ver Aviso Legal</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={() => setShowResetSiteConfirm(true)}
                className="p-1.5 px-3 border rounded border-red-500/25 text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/15 flex items-center gap-2 shadow-xs uppercase cursor-pointer active:scale-95 transition-all duration-150 font-bold"
                title="Reiniciar todo el sitio por completo y borrar todos los datos locales"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold">Reiniciar Sitio</span>
              </button>
            </div>
          </div>
        </footer>

        {/* News Article Modal Detail View */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedArticle(null)}
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative w-full max-w-3xl rounded-xl border-2 p-6 shadow-2xl z-10 overflow-hidden text-left ${
                  isCruda 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-white border-white text-slate-900 shadow-xl"
                }`}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className={`absolute top-4 right-4 p-1 rounded-lg border transition duration-150 cursor-pointer ${
                    isCruda 
                      ? "border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900" 
                      : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                  title="Cerrar artículo"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Tag Category */}
                <div className="mb-3">
                  <span className={`text-[8.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                    selectedArticle.category === "Pediatría" ? "bg-amber-500/10 text-amber-500 border-amber-500/25" :
                    selectedArticle.category === "Vacunas" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" :
                    selectedArticle.category === "Farmacología" ? "bg-purple-500/10 text-purple-500 border-purple-500/25" :
                    "bg-cyan-500/10 text-cyan-500 border-cyan-500/25"
                  }`}>
                    {selectedArticle.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-extrabold tracking-tight leading-tight mb-2 pr-6">
                  {selectedArticle.title}
                </h3>

                {/* Author and Date */}
                <div className="flex items-center gap-1.5 text-[9px] font-mono opacity-50 mb-4 border-b pb-2.5 border-slate-200/10">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.source}</span>
                </div>

                {/* Content paragraphs */}
                <div className="space-y-3.5 text-xs font-sans font-medium opacity-90 leading-relaxed max-h-96 overflow-y-auto pr-1">
                  {selectedArticle.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-slate-200/10 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      const textToCopy = `🔬 *${selectedArticle.title}*\n\n📰 ${selectedArticle.summary}\n\n📖 _${selectedArticle.content.join("\n\n")}_\n\n📌 Fuente: ${selectedArticle.source}`;
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedArticleId(selectedArticle.id);
                      setTimeout(() => setCopiedArticleId(null), 2500);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border cursor-pointer active:scale-95 transition-all text-center ${
                      isCruda
                        ? "border-slate-800 text-slate-300 hover:bg-slate-900"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {copiedArticleId === selectedArticle.id ? "¡Copiado con éxito!" : "Copiar y Compartir"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all"
                  >
                    Entendido
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Medical Research Journal Publication Modal */}
        <AnimatePresence>
          {selectedJournalPub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Overlay backdrop */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedJournalPub(null)}
                 className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
               />

               {/* Modal Card */}
               <motion.div
                 initial={{ scale: 0.95, opacity: 0, y: 15 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.95, opacity: 0, y: 15 }}
                 transition={{ duration: 0.2, ease: "easeOut" }}
                 className={`relative w-full max-w-3xl rounded-xl border-2 p-6 shadow-2xl z-10 overflow-hidden text-left ${
                   isCruda 
                     ? "bg-slate-950 border-slate-800 text-white" 
                     : "bg-white border-white text-slate-900 shadow-xl"
                 }`}
               >
                 {/* Top Style Ribbon corresponding to Journal Cover */}
                 <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
                   selectedJournalPub.id === "pub-nejm" ? "from-red-600 to-red-500" :
                   selectedJournalPub.id === "pub-lancet" ? "from-emerald-800 to-emerald-600" :
                   selectedJournalPub.id === "pub-nature" ? "from-indigo-700 to-indigo-600" :
                   "from-amber-700 to-amber-500"
                 }`} />

                 {/* Close Button */}
                 <button
                   type="button"
                   onClick={() => setSelectedJournalPub(null)}
                   className={`absolute top-4 right-4 p-1 rounded-lg border transition duration-150 cursor-pointer ${
                     isCruda 
                       ? "border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900" 
                       : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                   }`}
                   title="Cerrar abstract"
                 >
                   <X className="w-4 h-4" />
                 </button>

                 {/* Tag Category */}
                 <div className="mb-3 pt-1">
                   <span className="text-[8.5px] font-mono bg-cyan-500/10 text-cyan-500 border border-cyan-500/25 px-2 py-0.5 rounded uppercase font-black tracking-widest">
                     Revisión Clínica Literaria
                   </span>
                 </div>

                 {/* Header & Title */}
                 <div className="mb-4">
                   <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                     {selectedJournalPub.journal}
                   </p>
                   <h3 className="text-sm md:text-base font-extrabold tracking-tight leading-tight mt-1 pr-6">
                     {selectedJournalPub.title}
                   </h3>
                   <div className="flex items-center gap-1.5 text-[8.5px] font-mono opacity-50 mt-2">
                     <Clock className="w-3 h-3 shrink-0" />
                     <span>Publicado: 2026</span>
                     <span>•</span>
                     <span>Edición: {selectedJournalPub.volume}</span>
                   </div>
                 </div>

                 {/* Content Modules representing a scientific summary */}
                 <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-xs leading-relaxed font-sans font-medium">
                   <div>
                     <p className="text-[9px] font-mono tracking-widest uppercase font-black text-cyan-600 dark:text-cyan-400 mb-0.5">RESUMEN / ABSTRACT:</p>
                     <p className="opacity-90">{selectedJournalPub.abstract}</p>
                   </div>
                   
                   <div>
                     <p className="text-[9px] font-mono tracking-widest uppercase font-black text-purple-600 dark:text-purple-400 mb-0.5">METODOLOGÍA / OBSERVACIONES CLÍNICAS:</p>
                     <p className="opacity-90">{selectedJournalPub.methodology}</p>
                   </div>

                   <div>
                     <p className="text-[9px] font-mono tracking-widest uppercase font-black text-emerald-600 dark:text-emerald-400 mb-0.5">RESULTADOS EVALUADOS:</p>
                     <p className="opacity-90 font-semibold">{selectedJournalPub.results}</p>
                   </div>

                   <div className={`p-3 rounded-lg border-l-4 ${
                     isCruda ? "bg-slate-900/60 border-l-cyan-600 border-slate-800" : "bg-cyan-50/20 border-l-cyan-600 border-slate-200"
                   }`}>
                     <p className="text-[9px] font-mono tracking-widest uppercase font-black text-cyan-600 dark:text-cyan-400 mb-1">RECOMENDACIÓN SENSOCLÍNICA PARA PACIENTES:</p>
                     <p className="opacity-95 leading-relaxed text-[11px] font-sans antialiased text-slate-800 dark:text-slate-200 mt-0.5">
                       {selectedJournalPub.takeaway}
                     </p>
                   </div>
                 </div>

                 {/* Footer controls */}
                 <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-slate-200/10 select-none">
                   <a
                     href={selectedJournalPub.link}
                     target="_blank"
                     rel="noopener noreferrer"
                     referrerPolicy="no-referrer"
                     className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border cursor-pointer active:scale-95 transition-all text-center ${
                       isCruda
                         ? "border-slate-800 text-slate-300 hover:bg-slate-900"
                         : "border-slate-200 text-slate-700 hover:bg-slate-50"
                     }`}
                   >
                     Sitio del Journal Original ➔
                   </a>
                   <button
                     type="button"
                     onClick={() => setSelectedJournalPub(null)}
                     className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all"
                   >
                     Aceptar Lección Médica
                   </button>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Guía de Inicio Modal */}
        <AnimatePresence>
          {showStartGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowStartGuide(false)}
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative w-full max-w-2xl rounded-2xl border-2 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-left ${
                  isCruda 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-white border-white text-slate-900 shadow-xl"
                }`}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowStartGuide(false)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg border transition duration-155 cursor-pointer ${
                    isCruda 
                      ? "border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900" 
                      : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                  title="Cerrar guía"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header of Modal */}
                <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-slate-200/10">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight uppercase leading-tight text-emerald-500">
                      🚀 Guía de Inicio Rápido
                    </h3>
                    <p className="text-[10px] font-mono opacity-60">
                      Cómo aprovechar al máximo el Consultorio Dr. Link
                    </p>
                  </div>
                </div>

                {/* Steps container */}
                <div className="space-y-4 pr-1">
                  
                  {/* Step 1: Consultas */}
                  <div className={`p-4 rounded-xl border-2 ${
                    isCruda ? "bg-slate-900/45 border-slate-800/80" : "bg-slate-50 border-white"
                  }`}>
                    <h4 className="text-xs font-black uppercase text-emerald-500 flex items-center gap-1.5 mb-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">1</span>
                      <span>¿Cómo interactuar con el Consultorio?</span>
                    </h4>
                    <ul className="space-y-2 text-xs font-sans leading-relaxed opacity-90 pl-6 list-disc text-left">
                      <li>
                        <strong>Define tu Perfil de Salud:</strong> Rellena tu 👤 <em>Perfil de Salud Personal</em> con tu edad, sexo y condiciones de base. Esto permite a la IA modular las advertencias con máxima precisión clínica y adaptativa.
                      </li>
                      <li>
                        <strong>Elige tu Nivel de Atención:</strong> Utiliza la barra deslizante para alternar entre differentes enfoques de contención: <strong className="uppercase">Familia</strong> (cálido e instructivo), <strong className="uppercase">Clínico</strong> (analítico y de consulta habitual) o <strong className="uppercase">Guardia</strong> (emergencias y alertas críticas).
                      </li>
                      <li>
                        <strong>Envía tus dudas:</strong> Redacta tu síntoma o duda en el cuadro inferior o toca el botón del micrófono para ingresar texto por voz. Luego, haz clic en el botón verde con el icono de la flecha para enviarla.
                      </li>
                    </ul>
                  </div>

                  {/* Step 2: Cálculos */}
                  <div className={`p-4 rounded-xl border-2 ${
                    isCruda ? "bg-slate-900/45 border-slate-800/80" : "bg-slate-50 border-white"
                  }`}>
                    <h4 className="text-xs font-black uppercase text-cyan-500 flex items-center gap-1.5 mb-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">2</span>
                      <span>Cálculo de Dosis Clínicas y Métricas</span>
                    </h4>
                    <ul className="space-y-2 text-xs font-sans leading-relaxed opacity-90 pl-6 list-disc text-left">
                      <li>
                        <strong>Módulo Pediátrico:</strong> Selecciona en el menú de categorías la opción de <strong>Calculadora</strong>. Ingresa el peso (kg) del niño y escoge la concentración (Paracetamol, Ibuprofeno 2% o Ibuprofeno 4%) para ver la estimación de dosis orientativa en mililitros según prospectos regulados.
                      </li>
                      <li>
                        <strong>Índice de Masa Corporal (IMC):</strong> Indica tu peso y altura reales para obtener tu estado nutricional automático y las recomendaciones correspondientes asociadas con la categoría preclínica obtenida del IMC.
                      </li>
                    </ul>
                  </div>

                  {/* Step 3: Escáner */}
                  <div className={`p-4 rounded-xl border-2 ${
                    isCruda ? "bg-slate-900/45 border-slate-800/80" : "bg-slate-50 border-white"
                  }`}>
                    <h4 className="text-xs font-black uppercase text-purple-500 flex items-center gap-1.5 mb-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold">3</span>
                      <span>Escáner e Interpretación de Archivos</span>
                    </h4>
                    <ul className="space-y-2 text-xs font-sans leading-relaxed opacity-90 pl-6 list-disc text-left">
                      <li>
                        <strong>Carga de Estudios:</strong> Puedes arrastrar o subir archivos (imágenes de laboratorios, recetas en PDF o informes clínicos) de hasta 8MB directamente en el cuadro de carga.
                      </li>
                      <li>
                        <strong>Detección Rápida:</strong> Presiona el botón de escaneo estructurado para que el orientador lea e interprete términos complejos en cuestión de segundos, buscando anomalías preclínicas preliminares.
                      </li>
                      <li>
                        <strong>Ficha Médica Descargable:</strong> En la barra lateral presiona el botón <em>"Resumir en Ficha Médica"</em> para compilar un práctico reporte impreso portátil en PDF y llevarlo a tu consulta real presencial.
                      </li>
                    </ul>
                  </div>

                </div>

                {/* Footer Controls of Modal */}
                <div className="flex flex-col gap-4 mt-5 pt-3.5 border-t border-slate-200/10 select-none">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[9px] font-mono opacity-50 uppercase text-center sm:text-left">
                      ⚠️ AVISO: El consultorio no emite recetas ni reemplaza la consulta con su médico presencial.
                    </p>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setShowStartGuide(false);
                          setShowResetSiteConfirm(true);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2.5 border border-red-500/20 text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 text-[10px] font-mono font-bold uppercase rounded-xl cursor-pointer active:scale-95 transition-all text-center"
                        title="Reiniciar todo el sitio por completo y borrar todos los datos"
                      >
                        🔄 Reiniciar Sitio
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowStartGuide(false)}
                        className="flex-2 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Entendido, ¡Comenzar!
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Reinicio de Sitio */}
        <AnimatePresence>
          {showResetSiteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowResetSiteConfirm(false)}
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-left ${
                  isCruda 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-white border-white text-slate-900 shadow-xl"
                }`}
              >
                {/* Header inside reset site modal */}
                <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-slate-200/10">
                  <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                    <RotateCcw className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight uppercase leading-tight text-red-500">
                      ⚠️ Reiniciar Sitio Completo
                    </h3>
                    <p className="text-[10px] font-mono opacity-60">
                      Esta acción restablecerá toda la aplicación
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed opacity-90">
                  <p>
                    ¿Estás seguro de que deseas reiniciar el sitio por completo? Esto eliminará todos los datos guardados en este dispositivo de forma de permanente:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-mono text-[10.5px]">
                    <li>Tu perfil de salud personal 👤</li>
                    <li>Todo el historial de la conversación actual 💬</li>
                    <li>Las métricas de utilidad y respuestas guardadas 📊</li>
                    <li>Todas las configuraciones y vistas localmente activas ⚙️</li>
                  </ul>
                  <p className="font-bold text-red-500 mt-2">
                    Esta acción es irreversible y devolverá la aplicación a su estado de fábrica.
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 mt-5 pt-3.5 border-t border-slate-200/10 select-none">
                  <button
                    type="button"
                    onClick={() => setShowResetSiteConfirm(false)}
                    className={`px-4 py-2 text-[10px] font-mono font-bold uppercase rounded-lg border cursor-pointer hover:bg-slate-500/5 transition-all text-center ${
                      isCruda ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSite}
                    className="px-5 py-2 bg-red-650 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold uppercase rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all text-center"
                  >
                    Sí, reiniciar todo
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Apoyo y Patrocinio / Donación */}
        <AnimatePresence>
          {showDonationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowDonationModal(false);
                  setIsEditingDonation(false);
                }}
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative w-full max-w-lg rounded-2xl border-2 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-left ${
                  isCruda 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-white border-slate-200 text-slate-900 shadow-xl"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                      <Heart className="w-5 h-5 fill-amber-400/20 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold tracking-tight uppercase leading-tight text-amber-400">
                        Soporte Técnico de Servidores
                      </h3>
                      <p className="text-[10px] font-mono opacity-60">
                        Ayudá a mantener activa la infraestructura de la app
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDonationModal(false);
                      setIsEditingDonation(false);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isEditingDonation && currentUser && (currentUser.email === "tarotistasonline@gmail.com" || currentUser.email === "azulbaires@gmail.com") ? (
                  /* Admin Editing View */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const url = formData.get("url") as string;
                      const platform = formData.get("platform") as string;
                      const description = formData.get("description") as string;
                      const adsenseId = formData.get("adsenseId") as string;
                      const adsenseEnabled = formData.get("adsenseEnabled") === "on";
                      const mixpanelToken = formData.get("mixpanelToken") as string;
                      const mixpanelEnabled = formData.get("mixpanelEnabled") === "on";
                      const sponsorEnabled = formData.get("sponsorEnabled") === "on";
                      const sponsorText = formData.get("sponsorText") as string;
                      const sponsorLink = formData.get("sponsorLink") as string;
                      handleSaveDonationConfig(
                        url, 
                        platform, 
                        description, 
                        adsenseId, 
                        adsenseEnabled, 
                        mixpanelToken, 
                        mixpanelEnabled,
                        sponsorEnabled,
                        sponsorText,
                        sponsorLink
                      );
                    }}
                    className="space-y-4 text-xs"
                  >
                    <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider font-mono">
                      ⚙️ CONFIGURACIÓN DEL SITIO (ADMINISTRADOR)
                    </p>
                    
                    {/* Seccion de Donaciones */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <span className="text-[10px] font-black uppercase text-amber-500 block">Soporte y Donaciones</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase opacity-75">Plataforma</label>
                        <select
                          name="platform"
                          defaultValue={donationConfig.platform}
                          className="w-full text-xs p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                        >
                          <option value="Cafecito">☕ Cafecito (Argentina)</option>
                          <option value="MercadoPago">💳 Mercado Pago (Alias / CBU)</option>
                          <option value="PayPal">💳 PayPal</option>
                          <option value="Patreon">🎁 Patreon</option>
                          <option value="Donación Directa">🎁 Donación Directa</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase opacity-75">Enlace de donación o Alias de Pago</label>
                        <input
                          type="text"
                          name="url"
                          defaultValue={donationConfig.url}
                          placeholder="https://cafecito.app/tu_usuario o tu alias de Mercado Pago"
                          className="w-full text-xs p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase opacity-75">Descripción personalizada</label>
                        <textarea
                          name="description"
                          defaultValue={donationConfig.description}
                          rows={2}
                          className="w-full text-xs p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                          required
                        />
                      </div>
                    </div>

                    {/* Seccion de Google AdSense */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <span className="text-[10px] font-black uppercase text-cyan-400 block">Monetización con Google AdSense</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase opacity-75 block">ID de Editor (Publisher ID)</label>
                        <input
                          type="text"
                          name="adsenseId"
                          defaultValue={donationConfig.adsenseId || ""}
                          placeholder="pub-XXXXXXXXXXXXXXXX o ca-pub-..."
                          className="w-full text-xs p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-cyan-300"
                        />
                        <p className="text-[9px] text-slate-500 italic">
                          Ingresá tu ID de editor de AdSense. Puede comenzar con "pub-" o "ca-pub-".
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="adsenseEnabled"
                          name="adsenseEnabled"
                          defaultChecked={donationConfig.adsenseEnabled}
                          className="w-4 h-4 rounded border-slate-850 bg-slate-950 text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
                        />
                        <label htmlFor="adsenseEnabled" className="text-[10px] font-bold font-mono uppercase cursor-pointer select-none">
                          Habilitar anuncios automáticos (Auto Ads)
                        </label>
                      </div>
                      <p className="text-[9px] text-slate-500 italic leading-snug">
                        Al activar los Anuncios Automáticos, la IA de Google AdSense colocará de forma automática y óptima los anuncios en tu sitio web.
                      </p>
                    </div>

                    {/* Seccion de Mixpanel */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <span className="text-[10px] font-black uppercase text-purple-400 block">Métricas y Analítica con Mixpanel</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase opacity-75 block">Token del Proyecto (Project Token)</label>
                        <input
                          type="text"
                          name="mixpanelToken"
                          defaultValue={donationConfig.mixpanelToken || ""}
                          placeholder="Tu Mixpanel Project Token..."
                          className="w-full text-xs p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-purple-300"
                        />
                        <p className="text-[9px] text-slate-500 italic">
                          Ingresá el Project Token de tu proyecto gratuito de Mixpanel para trackear eventos de usuario, consultas y uso.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="mixpanelEnabled"
                          name="mixpanelEnabled"
                          defaultChecked={donationConfig.mixpanelEnabled}
                          className="w-4 h-4 rounded border-slate-850 bg-slate-950 text-purple-500 focus:ring-purple-500 accent-purple-500 cursor-pointer"
                        />
                        <label htmlFor="mixpanelEnabled" className="text-[10px] font-bold font-mono uppercase cursor-pointer select-none">
                          Habilitar Trackeo con Mixpanel
                        </label>
                      </div>
                      <p className="text-[9px] text-slate-500 italic leading-snug">
                        Al activar Mixpanel, registrarás de forma segura eventos como consultas de chat, informes médicos descargados, inicio de sesión y donaciones.
                      </p>
                    </div>

                    {/* Sección de Banner de Patrocinio Personalizado "Anúnciate Aquí" */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <span className="text-[10px] font-black uppercase text-pink-400 block">📢 Patrocinio Propio ("Anúnciate Aquí")</span>
                      
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="sponsorEnabled"
                          name="sponsorEnabled"
                          defaultChecked={donationConfig.sponsorEnabled}
                          className="w-4 h-4 rounded border-slate-850 bg-slate-950 text-pink-500 focus:ring-pink-500 accent-pink-500 cursor-pointer"
                        />
                        <label htmlFor="sponsorEnabled" className="text-[10px] font-bold font-mono uppercase cursor-pointer select-none">
                          Habilitar Banner "Anúnciate Aquí"
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase opacity-75 block">Texto del Banner</label>
                        <textarea
                          name="sponsorText"
                          defaultValue={donationConfig.sponsorText}
                          rows={2}
                          placeholder="Escribe el mensaje publicitario o invitador..."
                          className="w-full text-xs p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500 font-sans leading-relaxed text-pink-300"
                        />
                        <p className="text-[9px] text-slate-500 italic">
                          El texto o lema que se mostrará en el banner llamativo encima del chat.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase opacity-75 block">Enlace de Destino (Web, WhatsApp, etc.)</label>
                        <input
                          type="text"
                          name="sponsorLink"
                          defaultValue={donationConfig.sponsorLink}
                          placeholder="https://wa.me/tunumero o tu sitio de contacto"
                          className="w-full text-xs p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono text-pink-300"
                        />
                        <p className="text-[9px] text-slate-500 italic">
                          Dirección a donde se redirigirá al usuario cuando haga clic en el botón "Ver Más".
                        </p>
                      </div>
                    </div>

                    {/* Consola de Diagnóstico de Eventos en Tiempo Real (Mixpanel) */}
                    <div className="p-3 bg-slate-900/50 border border-slate-800/60 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-purple-400">
                          🖥️ CONSOLA DE DIAGNÓSTICO EN VIVO (MIXPANEL)
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                          getIsMixpanelInitialized() 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {getIsMixpanelInitialized() ? "🟢 Inicializado" : "⚪ Sin Inicializar"}
                        </span>
                      </div>
                      
                      <p className="text-[9px] text-slate-400 leading-relaxed">
                        Los eventos que realices se registrarán en tu panel de Mixpanel y se verán reflejados en vivo aquí abajo:
                      </p>

                      <div className="bg-slate-950 border border-slate-900 rounded-lg p-2 max-h-[140px] overflow-y-auto font-mono text-[9px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-850">
                        {liveEvents.length === 0 ? (
                          <div className="text-slate-500 italic text-center py-4">
                            No se han registrado eventos aún en esta sesión.<br/>
                            Probá enviar una consulta al chat o descargar un reporte clínico.
                          </div>
                        ) : (
                          liveEvents.map((evt, idx) => (
                            <div key={idx} className="border-b border-slate-900 pb-1.5 last:border-b-0 last:pb-0">
                              <div className="flex justify-between items-start text-purple-300">
                                <span className="font-bold">⚡ {evt.eventName}</span>
                                <span className="text-slate-500 text-[8px]">{evt.timestamp}</span>
                              </div>
                              <pre className="text-slate-400 overflow-x-auto select-all max-w-full leading-tight mt-0.5 text-[8px] whitespace-pre-wrap">
                                {JSON.stringify(evt.properties, null, 2)}
                              </pre>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-1 flex justify-between items-center text-[9px]">
                        <a 
                          href="https://mixpanel.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 font-bold hover:underline"
                        >
                          Ir a Mixpanel Oficial ↗
                        </a>
                        <span className="text-slate-500 italic font-mono">Gratis hasta 100k eventos/mes</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/10">
                      <button
                        type="button"
                        onClick={() => setIsEditingDonation(false)}
                        className="px-4 py-2 text-[10px] font-mono font-bold uppercase rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-500/5 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[10px] font-mono uppercase rounded-lg shadow-sm cursor-pointer"
                      >
                        Guardar Configuración
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Standard User View */
                  <div className="space-y-4">
                    <div className="text-xs leading-relaxed opacity-90 space-y-3">
                      <p className="font-medium text-slate-300">
                        {donationConfig.description || "Soporte voluntario para el mantenimiento tecnológico de la aplicación."}
                      </p>
                      
                      <p className="opacity-80">
                        Este espacio es <strong>100% independiente y libre de publicidad</strong>. Tu aporte voluntario nos ayuda a mantener encendido el servidor, almacenar la base de datos de manera segura y solventar los costos de procesamiento inteligente por cada consulta médica que procesamos.
                      </p>

                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-[11px] leading-relaxed italic text-cyan-300">
                        <strong>⚠️ TRANSPARENCIA E INTEGRIDAD:</strong> Al no ser este sitio administrado por profesionales médicos, este canal de donación se destina <strong>exclusivamente</strong> a solventar los costos de infraestructura en la nube (Cloud Run, base de datos Firestore y Tokens de API de Inteligencia Artificial). No representa ningún cobro, tarifa ni honorario por diagnósticos o asesoramiento de salud profesional.
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/10">
                      <div>
                        {currentUser && (currentUser.email === "tarotistasonline@gmail.com" || currentUser.email === "azulbaires@gmail.com") ? (
                          <button
                            type="button"
                            onClick={() => setIsEditingDonation(true)}
                            className="text-[10px] text-amber-500 hover:text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1 bg-amber-500/5 hover:bg-amber-500/10 p-1.5 px-3 rounded-lg border border-amber-500/25 cursor-pointer animate-pulse"
                          >
                            ⚙️ Editar Enlace
                          </button>
                        ) : (
                          <div className={`text-[9px] font-mono leading-normal border border-dashed p-2 rounded-lg max-w-[220px] ${
                            isCruda ? "border-slate-800 text-slate-400 bg-slate-900/40" : "border-slate-200 text-slate-650 bg-slate-50"
                          }`}>
                            🔑 <strong>Sección Admin:</strong> Iniciá sesión con <strong>azulbaires@gmail.com</strong> arriba a la derecha para pegar tu ID de AdSense y link de Mercado Pago.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDonationModal(false);
                            setIsEditingDonation(false);
                          }}
                          className={`px-4 py-2 text-[10px] font-mono font-bold uppercase rounded-lg border cursor-pointer hover:bg-slate-500/5 transition-all text-center w-full sm:w-auto ${
                            isCruda ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"
                          }`}
                        >
                          Cerrar
                        </button>
                        
                        {donationConfig.url ? (
                          <a
                            href={donationConfig.url.startsWith("http") ? donationConfig.url : `https://${donationConfig.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              trackEvent("Donation Clicked", {
                                platform: donationConfig.platform,
                                url: donationConfig.url
                              });
                              setShowDonationModal(false);
                              setIsEditingDonation(false);
                            }}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-sans font-black uppercase rounded-lg shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto cursor-pointer"
                          >
                            <span>Aportar</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-950 font-bold" />
                          </a>
                        ) : (
                          <div className="text-[10.5px] font-mono opacity-50 italic">
                            ¡Donaciones próximamente!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Inicio de Sesión y Registro (Auth Modal) */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAuthModal(false)}
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-left ${
                  isCruda 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-white border-slate-200 text-slate-900 shadow-xl"
                }`}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg border transition duration-155 cursor-pointer ${
                    isCruda 
                      ? "border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900" 
                      : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-slate-200/10">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                    <Lock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight uppercase leading-tight text-cyan-400">
                      Acceso al Consultorio
                    </h3>
                    <p className="text-[10px] font-mono opacity-60">
                      Sincroniza tu historial y configura el sitio
                    </p>
                  </div>
                </div>

                {/* Messages */}
                {authError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10.5px] leading-relaxed font-sans text-left">
                    <strong>⚠️ Error:</strong> {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] leading-relaxed font-sans text-left">
                    <strong>✓ Éxito:</strong> {authSuccess}
                  </div>
                )}

                {/* Main Content split into choices */}
                <div className="space-y-4">
                  {/* Option 1: Google Sign-In */}
                  <div className={`p-3 rounded-xl border ${isCruda ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-250"}`}>
                    <span className="text-[9px] font-black uppercase text-cyan-400 font-mono block mb-1.5">Opción Recomendada (Fuera de Iframe)</span>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black font-mono uppercase rounded-lg shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4 text-white" />
                      <span>Iniciar con Google</span>
                    </button>
                    <p className="text-[8.5px] text-slate-400 italic mt-1.5 leading-normal text-left">
                      * Si usas la vista previa integrada de AI Studio y la ventana se bloquea, por favor haz clic en <strong>"Abrir en pestaña nueva"</strong> arriba a la derecha.
                    </p>
                  </div>

                  {/* Option 2: Email and Password Form */}
                  <div className={`p-3 rounded-xl border ${isCruda ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-250"}`}>
                    <div className="flex justify-between items-center mb-2 border-b border-slate-250/10 pb-1.5">
                      <span className="text-[9px] font-black uppercase text-purple-400 font-mono">Opción 2: Correo y Contraseña</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegistering(!isRegistering);
                          setAuthError(null);
                        }}
                        className="text-[9px] font-bold font-mono uppercase text-cyan-400 hover:underline cursor-pointer"
                      >
                        {isRegistering ? "Ir a Ingresar ➔" : "Ir a Registrarse ➔"}
                      </button>
                    </div>

                    <form onSubmit={isRegistering ? handleEmailRegister : handleEmailSignIn} className="space-y-2.5 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold font-mono uppercase opacity-75">Correo Electrónico</label>
                        <input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="ejemplo@correo.com"
                          className="w-full text-[11px] p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold font-mono uppercase opacity-75">Contraseña</label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full text-[11px] p-2 rounded-lg border bg-slate-950 border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black font-mono uppercase rounded-lg shadow-xs cursor-pointer transition-all"
                      >
                        {isRegistering ? "Crear Cuenta e Ingresar" : "Iniciar Sesión con Correo"}
                      </button>
                    </form>
                  </div>

                  {/* Option 3: Local Bypass for Iframe previews */}
                  <div className={`p-3 rounded-xl border border-dashed ${isCruda ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[9px] font-black uppercase text-amber-500 font-mono block mb-1 text-left">🛠️ Modo Iframe Preview (Desarrollo / Admin)</span>
                    <p className="text-[9px] text-slate-400 leading-normal mb-2 text-left">
                      ¿La seguridad de tu navegador bloquea el login en el iframe? Hacé clic abajo para simular el rol de Administrador de forma local y poder configurar todo de inmediato en este navegador.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleLocalBypassSignIn("tarotistasonline@gmail.com")}
                        className="py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black font-mono uppercase rounded-lg shadow-sm cursor-pointer transition-all text-center"
                      >
                        Ingresar como Admin (Modo Local)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLocalBypassSignIn("paciente_demo@correo.com")}
                        className="py-1.5 border border-slate-700 hover:bg-slate-500/10 text-slate-300 text-[9px] font-bold font-mono uppercase rounded-lg cursor-pointer transition-all text-center"
                      >
                        Ingresar como Paciente (Modo Local)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-200/10 select-none">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border cursor-pointer hover:bg-slate-500/5 transition-all text-center ${
                      isCruda ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-650"
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
