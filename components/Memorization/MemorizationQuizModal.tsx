import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Brain,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { getAyahsInRange, normalizeForSpeechMatch } from '../../utils/quranMemorizationUtils';
import {
  QuranVoiceAudioMonitor,
  evaluateVoiceRecitationCandidates,
  stripQuranTajweedTags
} from '../../utils/quranVoiceEngine';
import { memorizationService, MasteryLevel } from '../../services/memorizationService';
import { SURAH_NAMES_AR } from '../QuranReader/constants';
import { SURAH_NAMES_EN } from '../../pages/Memorization';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { Capacitor } from '@capacitor/core';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { acquireListenInterruption, releaseListenInterruption } from '../../utils/listenAudioCoordinator';

interface MemorizationQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
  rangeId?: string;
  primaryColor: string;
  btnTextColor: string;
  isEn: boolean;
  onComplete?: (mastery: MasteryLevel) => void;
}

type QuizType = 'voice' | 'scramble' | 'next_ayah';
type VoiceStatus = 'idle' | 'listening' | 'evaluating' | 'correct' | 'wrong';

export interface AyahTestResult {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  passed: boolean;
  score?: number;
  heardText?: string;
  attempts: number;
  quizType: QuizType;
}

const stripTajweed = (text: string) => {
  if (!text) return '';
  return text.replace(/\[([a-z])(?::\d+)?\[/g, '').replace(/\]/g, '').trim();
};

const MemorizationQuizModal: React.FC<MemorizationQuizModalProps> = ({
  isOpen,
  onClose,
  fromSurah,
  fromAyah,
  toSurah,
  toAyah,
  rangeId,
  primaryColor,
  btnTextColor,
  isEn,
  onComplete
}) => {
  // Default to Multiple Choice (اختيار الآية) as requested
  const [quizType, setQuizType] = useState<QuizType>('next_ayah');
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Results tracker per ayah index
  const [resultsMap, setResultsMap] = useState<Record<number, AyahTestResult>>({});

  // Scramble mode state
  const [scrambledWords, setScrambledWords] = useState<Array<{ id: number; text: string; used: boolean }>>([]);
  const [selectedWords, setSelectedWords] = useState<Array<{ id: number; text: string }>>([]);
  const [scrambleStatus, setScrambleStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Next ayah choice mode state
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [choiceStatus, setChoiceStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Voice mode state
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [spokenText, setSpokenText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceMatchResult, setVoiceMatchResult] = useState<{ score: number; matchedWords: boolean[]; ayahWords: string[] } | null>(null);

  // Refs for dedicated audio filtering monitor, speech recognition lifecycle & multi-hypothesis buffer
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const audioMonitorRef = useRef<QuranVoiceAudioMonitor | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const maxTimerRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');
  const candidateTranscriptsRef = useRef<string[]>([]);
  const accumulatedPrefixRef = useRef<string>('');

  const ayahs = React.useMemo(() => {
    if (!isOpen) return [];
    return getAyahsInRange(fromSurah, fromAyah, toSurah, toAyah);
  }, [isOpen, fromSurah, fromAyah, toSurah, toAyah]);

  // Back button interceptor
  useEffect(() => {
    if (!isOpen) return;
    const interceptor = () => {
      onClose();
      return true;
    };
    return registerBackInterceptor(interceptor);
  }, [isOpen, onClose]);

  // Safe sound feedback helper
  const playSound = (type: 'correct' | 'wrong') => {
    try {
      if (type === 'correct') {
        acquireListenInterruption('mem-quiz-chime');
        const audio = new Audio('/assets/audio/chime.mp3');
        audio.volume = 0.5;
        audio.onended = () => releaseListenInterruption('mem-quiz-chime');
        audio.onerror = () => releaseListenInterruption('mem-quiz-chime');
        audio.play().catch(() => releaseListenInterruption('mem-quiz-chime'));
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      } else {
        Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
      }
    } catch (e) {
      releaseListenInterruption('mem-quiz-chime');
    }
  };

  // Stop recognition & audio filter monitor cleanly without evaluation
  const stopVoiceRecognition = useCallback(async () => {
    isListeningRef.current = false;
    setIsListening(false);
    setAudioLevel(0);
    releaseListenInterruption('mem-quiz-mic');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (audioMonitorRef.current) {
      audioMonitorRef.current.stop();
      audioMonitorRef.current = null;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        await SpeechRecognition.stop().catch(() => {});
        await SpeechRecognition.removeAllListeners().catch(() => {});
      } else if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    } catch (e) {}
  }, []);

  // Stop voice recording and perform Uthmani-aware multi-hypothesis evaluation
  const stopAndEvaluateVoice = useCallback(async (textToEvaluate?: string) => {
    const candidatesSnapshot = [...candidateTranscriptsRef.current];
    const fallbackText = (textToEvaluate !== undefined ? textToEvaluate : latestTranscriptRef.current).trim();
    if (fallbackText) candidatesSnapshot.unshift(fallbackText);

    await stopVoiceRecognition();

    const currentAyah = ayahs[currentStep];
    if (!currentAyah) return;

    const cleanAyahText = stripQuranTajweedTags(currentAyah.text);
    const ayahWords = cleanAyahText.split(/\s+/).filter(Boolean);

    if (candidatesSnapshot.filter(Boolean).length === 0) {
      setVoiceStatus('wrong');
      setVoiceMatchResult({ score: 0, matchedWords: ayahWords.map(() => false), ayahWords });
      playSound('wrong');
      return;
    }

    setVoiceStatus('evaluating');
    const res = evaluateVoiceRecitationCandidates(cleanAyahText, candidatesSnapshot);
    setSpokenText(res.bestTranscript);
    setVoiceMatchResult({
      score: res.score,
      matchedWords: res.matchedWords,
      ayahWords: res.ayahWords
    });

    if (res.passed) {
      setVoiceStatus('correct');
      playSound('correct');
    } else {
      setVoiceStatus('wrong');
      playSound('wrong');
    }
  }, [ayahs, currentStep, stopVoiceRecognition]);

  // Clean-up when question changes or modal closes
  useEffect(() => {
    return () => {
      stopVoiceRecognition();
    };
  }, [stopVoiceRecognition]);

  // Reset question state whenever currentStep changes
  useEffect(() => {
    if (!isOpen || ayahs.length === 0 || currentStep >= ayahs.length) return;
    const currentAyah = ayahs[currentStep];
    const cleanText = stripTajweed(currentAyah.text);

    // Stop previous voice instance if active
    stopVoiceRecognition();
    setVoiceStatus('idle');
    setSpokenText('');
    setAudioLevel(0);
    setVoiceMatchResult(null);
    latestTranscriptRef.current = '';
    candidateTranscriptsRef.current = [];
    accumulatedPrefixRef.current = '';

    // Setup scramble words
    const words = cleanText.split(' ').filter(Boolean).map((w, idx) => ({
      id: idx,
      text: w,
      used: false
    }));
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setSelectedWords([]);
    setScrambleStatus('idle');

    // Setup choices for next_ayah mode
    const distractorList: string[] = [];
    const pool = ayahs.filter((_, idx) => idx !== currentStep);
    while (distractorList.length < 3 && pool.length > 0) {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      if (!distractorList.includes(rand.text)) {
        distractorList.push(stripTajweed(rand.text));
      }
      if (pool.length <= distractorList.length) break;
    }
    while (distractorList.length < 3) {
      distractorList.push(cleanText.split(' ').slice(0, 3).join(' ') + ' ...');
    }
    const allChoices = [...distractorList, cleanText].sort(() => Math.random() - 0.5);
    setChoices(allChoices);
    setSelectedChoice(null);
    setChoiceStatus('idle');
  }, [isOpen, currentStep, ayahs, stopVoiceRecognition]);

  // Start Dedicated Audio-Filtered Voice Recognition with VAD & multi-hypothesis matching
  const startVoiceRecognition = async () => {
    if (isListeningRef.current) {
      // Manual tap while recording -> stop and evaluate immediately
      await stopAndEvaluateVoice();
      return;
    }

    try {
      setSpokenText('');
      setAudioLevel(0);
      setVoiceMatchResult(null);
      latestTranscriptRef.current = '';
      candidateTranscriptsRef.current = [];
      accumulatedPrefixRef.current = '';
      setVoiceStatus('listening');
      isListeningRef.current = true;
      setIsListening(true);
      acquireListenInterruption('mem-quiz-mic');

      // Max recording safety timer (25 seconds for longer ayahs)
      maxTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) {
          stopAndEvaluateVoice();
        }
      }, 25000);

      if (Capacitor.isNativePlatform()) {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        const perm = await SpeechRecognition.checkPermissions();
        if (perm.speechRecognition !== 'granted') {
          const req = await SpeechRecognition.requestPermissions();
          if (req.speechRecognition !== 'granted') {
            setIsListening(false);
            isListeningRef.current = false;
            setVoiceStatus('idle');
            releaseListenInterruption('mem-quiz-mic');
            alert(isEn ? 'Microphone permission is required to recite' : 'يرجى إعطاء إذن المايكروفون للتمكن من التسميع الصوتي');
            return;
          }
        }
        await SpeechRecognition.removeAllListeners();

        SpeechRecognition.addListener('partialResults', (data: any) => {
          if (!isListeningRef.current) return;
          if (data?.matches?.length) {
            const heard = data.matches[0];
            setSpokenText(heard);
            latestTranscriptRef.current = heard;
            candidateTranscriptsRef.current = data.matches.filter(Boolean);

            // Real-time silence debounce timer: 1650ms after last recognized speech
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (isListeningRef.current) {
                stopAndEvaluateVoice(heard);
              }
            }, 1650);
          }
        });

        await SpeechRecognition.start({
          language: 'ar-SA',
          maxResults: 5,
          prompt: isEn ? 'Recite the verse clearly' : 'اتلُ الآية الكريمة بصوت واضح',
          partialResults: true
        });
      } else {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
          setIsListening(false);
          isListeningRef.current = false;
          setVoiceStatus('idle');
          releaseListenInterruption('mem-quiz-mic');
          alert(isEn ? 'Speech recognition is not supported in this browser' : 'التعرف الصوتي غير مدعوم في هذا المتصفح، يمكنك استخدام ترتيب الكلمات أو الاختيار.');
          return;
        }

        // 1. Start Dedicated Web Audio DSP Filtering & VAD Monitor (High-Pass + Low-Pass + Presence EQ + Compressor)
        const monitor = new QuranVoiceAudioMonitor();
        audioMonitorRef.current = monitor;
        await monitor.start({
          silenceTimeoutMs: 1700,
          onLevel: (lvl) => {
            if (isListeningRef.current) {
              setAudioLevel(lvl);
            }
          },
          onSilenceAfterSpeech: () => {
            if (!isListeningRef.current) return;
            // Allow 350ms grace window for final ASR result packet to arrive
            if (latestTranscriptRef.current.trim().length > 0) {
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (isListeningRef.current) {
                  stopAndEvaluateVoice();
                }
              }, 350);
            }
          }
        });

        // 2. Start Multi-Alternative Speech Recognition with continuous accumulation
        const spawnWebRecognizer = () => {
          if (!isListeningRef.current) return;
          const recognition = new SpeechRecognitionAPI();
          recognition.lang = 'ar-SA';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 5;

          let currentSessionFinal = '';

          recognition.onresult = (event: any) => {
            if (!isListeningRef.current) return;

            let sessionFinal = '';
            let sessionInterim = '';
            const altCount = 5;
            const altSegments: string[][] = Array.from({ length: altCount }, () => []);

            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i];
              const primary = res[0]?.transcript || '';
              if (res.isFinal) {
                sessionFinal += primary + ' ';
              } else {
                sessionInterim += primary + ' ';
              }

              for (let k = 0; k < altCount; k++) {
                const altText = res[k]?.transcript || primary;
                if (altText) altSegments[k].push(altText.trim());
              }
            }

            currentSessionFinal = sessionFinal.trim();
            const prefix = accumulatedPrefixRef.current ? accumulatedPrefixRef.current + ' ' : '';
            const fullPrimary = (prefix + sessionFinal + sessionInterim).replace(/\s+/g, ' ').trim();

            const hypotheses = altSegments
              .map(parts => (prefix + parts.join(' ')).replace(/\s+/g, ' ').trim())
              .filter(Boolean);

            if (fullPrimary) {
              setSpokenText(fullPrimary);
              latestTranscriptRef.current = fullPrimary;
              candidateTranscriptsRef.current = Array.from(new Set([fullPrimary, ...hypotheses]));

              // Auto-evaluate after 1.65s of silence following recognized words
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (isListeningRef.current) {
                  stopAndEvaluateVoice();
                }
              }, 1650);
            }
          };

          recognition.onerror = (e: any) => {
            if (!isListeningRef.current) return;
            if (e?.error === 'no-speech') {
              // Keep waiting gently while mic is active
              return;
            }
            if (latestTranscriptRef.current.trim().length > 0) {
              stopAndEvaluateVoice();
            } else {
              stopVoiceRecognition();
              setVoiceStatus('idle');
            }
          };

          recognition.onend = () => {
            if (!isListeningRef.current) return;
            if (currentSessionFinal) {
              accumulatedPrefixRef.current = (accumulatedPrefixRef.current + ' ' + currentSessionFinal).trim();
            }
            // If user already spoke and engine naturally ended -> evaluate
            if (latestTranscriptRef.current.trim().length > 0) {
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (isListeningRef.current) {
                  stopAndEvaluateVoice();
                }
              }, 250);
            } else {
              // Browser ended early before user started speaking -> smoothly re-arm recognizer
              restartTimerRef.current = setTimeout(() => {
                if (isListeningRef.current) {
                  try {
                    spawnWebRecognizer();
                  } catch {
                    stopVoiceRecognition();
                    setVoiceStatus('idle');
                  }
                }
              }, 120);
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        };

        spawnWebRecognizer();
      }
    } catch (e) {
      console.warn('Speech recognition error:', e);
      stopVoiceRecognition();
      setVoiceStatus('idle');
    }
  };

  // User explicitly chooses to retry reciting current ayah
  const handleRetryVoice = () => {
    stopVoiceRecognition();
    setVoiceStatus('idle');
    setSpokenText('');
    setAudioLevel(0);
    setVoiceMatchResult(null);
    latestTranscriptRef.current = '';
    candidateTranscriptsRef.current = [];
    accumulatedPrefixRef.current = '';
    // Automatically trigger mic on retry for seamless UX
    setTimeout(() => {
      startVoiceRecognition();
    }, 150);
  };

  // User confirms correct recitation and proceeds to next ayah
  const handleProceedVoiceCorrect = () => {
    const currentAyah = ayahs[currentStep];
    if (currentAyah) {
      setResultsMap(prev => ({
        ...prev,
        [currentStep]: {
          surahNumber: currentAyah.surahNumber,
          ayahNumber: currentAyah.ayahNumber,
          text: currentAyah.text,
          passed: true,
          score: voiceMatchResult?.score ?? 100,
          heardText: spokenText,
          attempts: (prev[currentStep]?.attempts || 0) + 1,
          quizType: 'voice'
        }
      }));
      setScore(s => s + 1);
    }
    advanceNextQuestion();
  };

  // User chooses to skip / move to next ayah with the mistake recorded
  const handleProceedVoiceWithMistake = () => {
    const currentAyah = ayahs[currentStep];
    if (currentAyah) {
      setResultsMap(prev => ({
        ...prev,
        [currentStep]: {
          surahNumber: currentAyah.surahNumber,
          ayahNumber: currentAyah.ayahNumber,
          text: currentAyah.text,
          passed: false,
          score: voiceMatchResult?.score ?? 0,
          heardText: spokenText,
          attempts: (prev[currentStep]?.attempts || 0) + 1,
          quizType: 'voice'
        }
      }));
    }
    advanceNextQuestion();
  };

  // Scramble mode selection
  const handleWordSelect = (wordObj: { id: number; text: string; used: boolean }) => {
    if (wordObj.used || scrambleStatus !== 'idle') return;

    setScrambledWords(prev => prev.map(w => w.id === wordObj.id ? { ...w, used: true } : w));
    const nextSelected = [...selectedWords, { id: wordObj.id, text: wordObj.text }];
    setSelectedWords(nextSelected);

    if (nextSelected.length === scrambledWords.length) {
      const userConstruct = nextSelected.map(w => w.text).join(' ');
      const currentAyah = ayahs[currentStep];
      const targetClean = stripTajweed(currentAyah.text);

      const isCorrect = normalizeForSpeechMatch(userConstruct) === normalizeForSpeechMatch(targetClean);
      if (isCorrect) {
        setScrambleStatus('correct');
        playSound('correct');
        setScore(s => s + 1);
        setResultsMap(prev => ({
          ...prev,
          [currentStep]: {
            surahNumber: currentAyah.surahNumber,
            ayahNumber: currentAyah.ayahNumber,
            text: currentAyah.text,
            passed: true,
            score: 100,
            attempts: 1,
            quizType: 'scramble'
          }
        }));
        setTimeout(() => advanceNextQuestion(), 1200);
      } else {
        setScrambleStatus('wrong');
        playSound('wrong');
        setTimeout(() => {
          setScrambledWords(prev => prev.map(w => ({ ...w, used: false })));
          setSelectedWords([]);
          setScrambleStatus('idle');
        }, 1200);
      }
    }
  };

  const handleWordDeselect = (index: number) => {
    if (scrambleStatus !== 'idle') return;
    const removed = selectedWords[index];
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setScrambledWords(prev => prev.map(w => w.id === removed.id ? { ...w, used: false } : w));
  };

  // Multiple Choice handler
  const handleChoiceClick = (choiceText: string, index: number) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(index);
    const currentAyah = ayahs[currentStep];
    const targetClean = stripTajweed(currentAyah.text);
    const isCorrect = normalizeForSpeechMatch(choiceText) === normalizeForSpeechMatch(targetClean);

    if (isCorrect) {
      setChoiceStatus('correct');
      playSound('correct');
      setScore(s => s + 1);
      setResultsMap(prev => ({
        ...prev,
        [currentStep]: {
          surahNumber: currentAyah.surahNumber,
          ayahNumber: currentAyah.ayahNumber,
          text: currentAyah.text,
          passed: true,
          score: 100,
          attempts: 1,
          quizType: 'next_ayah'
        }
      }));
    } else {
      setChoiceStatus('wrong');
      playSound('wrong');
      setResultsMap(prev => ({
        ...prev,
        [currentStep]: {
          surahNumber: currentAyah.surahNumber,
          ayahNumber: currentAyah.ayahNumber,
          text: currentAyah.text,
          passed: false,
          score: 0,
          attempts: 1,
          quizType: 'next_ayah'
        }
      }));
    }

    setTimeout(() => advanceNextQuestion(), 1400);
  };

  // General advancement logic
  const advanceNextQuestion = () => {
    stopVoiceRecognition();
    if (currentStep < ayahs.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Reset & retry full test from step 0
  const handleRestartFullQuiz = () => {
    stopVoiceRecognition();
    setCurrentStep(0);
    setScore(0);
    setResultsMap({});
    setIsFinished(false);
    setVoiceStatus('idle');
    setSpokenText('');
    setVoiceMatchResult(null);
  };

  // Save review grade in Spaced Repetition (SM-2)
  const handleGradeMastery = (grade: MasteryLevel) => {
    if (rangeId) {
      memorizationService.updateReviewMastery(rangeId, grade);
    } else {
      memorizationService.saveRange({
        fromSurah,
        fromAyah,
        toSurah,
        toAyah,
        readerId: 'Abdul_Basit_Murattal_192kbps',
        masteryLevel: grade
      });
    }
    if (onComplete) onComplete(grade);
    onClose();
  };

  if (!isOpen) return null;

  const currentAyah = ayahs[currentStep];

  // Overall results computation for the summary report
  const allResults: AyahTestResult[] = ayahs.map((ayah, idx) => {
    return resultsMap[idx] || {
      surahNumber: ayah.surahNumber,
      ayahNumber: ayah.ayahNumber,
      text: ayah.text,
      passed: false,
      score: 0,
      attempts: 0,
      quizType
    };
  });
  const totalCount = allResults.length;
  const correctCount = allResults.filter(r => r.passed).length;
  const errorCount = totalCount - correctCount;
  const overallPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isAllCorrect = errorCount === 0;

  const isBlackTheme = btnTextColor === '#000000';
  const primary3DStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: btnTextColor,
    boxShadow: isBlackTheme
      ? '0 5px 0 #52525b, 0 10px 18px -2px rgba(0, 0, 0, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.65)'
      : '0 5px 0 rgba(0, 0, 0, 0.22), 0 10px 18px -2px rgba(0, 0, 0, 0.16), inset 0 2px 2px rgba(255, 255, 255, 0.35)'
  };

  return (
    <div 
      className="fixed inset-0 z-[1500] flex items-center justify-center p-3 sm:p-5 bg-black/75" 
      onClick={onClose}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div 
        className={`settings-3d-adia-scope ${isBlackTheme ? 'settings-3d-dark' : ''} app-page-card border-0 w-full max-w-lg max-h-[92dvh] rounded-[2rem] flex flex-col overflow-hidden bg-white dark:bg-[#1E293B] text-slate-800 dark:text-zinc-100`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="app-3d-badge border-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              <Brain size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {isEn ? 'Quran Memorization Testing' : 'مركز اختبار الحفظ والتثبيت'}
              </h3>
              <p className="text-[11px] opacity-65 font-medium">
                {isFinished 
                  ? (isEn ? 'Test Completed • Final Summary' : 'اكتمل الاختبار • تقرير النتيجة الإجمالية') 
                  : (isEn ? `Question ${currentStep + 1} of ${ayahs.length}` : `السؤال ${currentStep + 1} من ${ayahs.length}`)}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#0F172A] text-slate-500 dark:text-zinc-300 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {!isFinished && (
          <>
            {/* Mode Selector Tabs - Multiple Choice default on Right, Voice Recitation on Left in RTL */}
            <div className="px-5 pt-3">
              <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceRecognition();
                    setQuizType('next_ayah');
                  }}
                  className={`py-2.5 px-2 rounded-2xl transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'next_ayah'
                      ? 'active:translate-y-[2px]'
                      : 'app-page-card bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
                  }`}
                  style={quizType === 'next_ayah' ? primary3DStyle : undefined}
                >
                  <span>{isEn ? 'Multiple Choice' : 'اختيار الآية'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceRecognition();
                    setQuizType('scramble');
                  }}
                  className={`py-2.5 px-2 rounded-2xl transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'scramble'
                      ? 'active:translate-y-[2px]'
                      : 'app-page-card bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
                  }`}
                  style={quizType === 'scramble' ? primary3DStyle : undefined}
                >
                  <span>{isEn ? 'Word Order' : 'ترتيب الكلمات'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceRecognition();
                    setQuizType('voice');
                  }}
                  className={`py-2.5 px-2 rounded-2xl transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'voice'
                      ? 'active:translate-y-[2px]'
                      : 'app-page-card bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
                  }`}
                  style={quizType === 'voice' ? primary3DStyle : undefined}
                >
                  <span>{isEn ? 'Voice Recitation' : 'التسميع الصوتي'}</span>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 mt-3 overflow-hidden">
              <div 
                className="h-full transition-all duration-300 rounded-full"
                style={{ 
                  backgroundColor: primaryColor, 
                  width: `${((currentStep + 1) / ayahs.length) * 100}%` 
                }}
              ></div>
            </div>
          </>
        )}

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {!isFinished ? (
            <>
              {/* Question Context Badge */}
              <div className="flex items-center justify-between text-xs font-bold px-1" style={{ color: primaryColor }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  {isEn ? SURAH_NAMES_EN[currentAyah.surahNumber - 1] : SURAH_NAMES_AR[currentAyah.surahNumber - 1]} - {isEn ? `Ayah ${currentAyah.ayahNumber}` : `الآية ${currentAyah.ayahNumber}`}
                </span>
                <span className="app-3d-badge text-[11px] opacity-80 font-sans bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md">
                  {isEn ? `Page ${currentAyah.page}` : `صفحة ${currentAyah.page}`}
                </span>
              </div>

              {/* Mode 1: Voice Recitation */}
              {quizType === 'voice' && (
                <div className="space-y-4 text-center">
                  <div className="text-xs opacity-75 font-medium leading-relaxed">
                    {isEn 
                      ? 'Press the microphone and recite the verse from memory. Recording stops automatically when you finish speaking.' 
                      : 'اضغط على المايكروفون ثم اتلُ الآية غيباً من حفظك. يتوقف التسجيل تلقائياً بعد الاستماع:'}
                  </div>

                  {/* Mic Button & Filtered Acoustic Ring */}
                  <div className="flex flex-col items-center justify-center py-3">
                    <div className="relative flex items-center justify-center">
                      {isListening && (
                        <span
                          className="absolute inset-0 rounded-full bg-red-500/25 pointer-events-none transition-transform duration-100"
                          style={{
                            transform: `scale(${1.12 + audioLevel * 0.45})`
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={startVoiceRecognition}
                        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all active:translate-y-[3px] cursor-pointer border-0 ${
                          isListening 
                            ? 'ring-4 ring-red-400/50 bg-red-500 text-white' 
                            : 'hover:scale-105'
                        }`}
                        style={isListening ? {
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          boxShadow: '0 6px 0 #b91c1c, 0 12px 20px rgba(239,68,68,0.35), inset 0 2px 3px rgba(255,255,255,0.4)'
                        } : {
                          ...primary3DStyle,
                          boxShadow: isBlackTheme
                            ? '0 6px 0 #52525b, 0 12px 22px rgba(0, 0, 0, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.65)'
                            : '0 6px 0 rgba(0, 0, 0, 0.24), 0 12px 22px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.4)'
                        }}
                        aria-label="Toggle Mic"
                      >
                        {isListening ? (
                          <MicOff size={38} className="animate-pulse" />
                        ) : (
                          <Mic size={38} />
                        )}
                      </button>
                    </div>

                    <div className="mt-3.5 space-y-1">
                      <span className="text-xs font-bold block" style={{ color: isListening ? '#EF4444' : primaryColor }}>
                        {isListening 
                          ? (isEn ? 'Listening with noise filtering... Recite clearly' : 'جارٍ الاستماع وتنقية الصوت... اتلُ الآية الآن') 
                          : voiceStatus === 'evaluating'
                          ? (isEn ? 'Matching recitation with Quranic text...' : 'جارٍ فحص التلاوة ومطابقتها مع الآية...')
                          : (isEn ? 'Tap the mic to start reciting' : 'اضغط على المايكروفون للبدء بالتسميع')}
                      </span>
                      {isListening && (
                        <button
                          type="button"
                          onClick={() => stopAndEvaluateVoice()}
                          className="app-inner-3d-box unified-3d-btn border-0 mt-1.5 px-3.5 py-1.5 rounded-full text-[11px] text-red-600 dark:text-red-400 bg-red-500/12 hover:bg-red-500/18 font-bold cursor-pointer inline-flex items-center justify-center mx-auto"
                        >
                          {isEn ? 'Tap here to stop & evaluate now' : 'انقر هنا للإنهاء والمطابقة فوراً'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Spoken Text Feedback */}
                  {spokenText && (
                    <div className="wird-inner-raised p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] text-xs leading-relaxed opacity-95" dir="rtl">
                      <span className="font-bold opacity-60 ml-1 text-slate-500 dark:text-zinc-400">
                        {isEn ? 'Heard:' : 'النص المسموع:'}
                      </span>
                      <span className="font-serif text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        {spokenText}
                      </span>
                    </div>
                  )}

                  {/* Feedback State 1: Recitation MATCHES the Ayah — Compact Notice + Continue Button */}
                  {voiceStatus === 'correct' && (
                    <div className="space-y-3 animate-fadeIn text-right" dir={isEn ? 'ltr' : 'rtl'}>
                      {/* Small Correct Notice */}
                      <div className="wird-inner-raised px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 ring-1 ring-emerald-500/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
                          <span>
                            {isEn ? 'Recitation matches the verse correctly' : 'تمت مطابقة القراءة مع الآية بشكل صحيح'}
                          </span>
                        </div>
                        <span className="app-3d-badge border-0 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black shrink-0">
                          {voiceMatchResult?.score}%
                        </span>
                      </div>

                      {/* Continue Button to proceed through all selected verses */}
                      <button
                        type="button"
                        onClick={handleProceedVoiceCorrect}
                        className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm border-0 cursor-pointer active:translate-y-[2px] transition-all flex items-center justify-center gap-2 bg-emerald-600 text-white"
                        style={{
                          boxShadow: '0 4px 0 #047857, inset 0 1.5px 2px rgba(255,255,255,0.4)'
                        }}
                      >
                        <span>
                          {currentStep < ayahs.length - 1
                            ? (isEn ? 'Continue to Next Verse' : 'تكملة للآية التالية')
                            : (isEn ? 'Continue & Finish Test' : 'تكملة وإنهاء الاختبار')}
                        </span>
                        {isEn ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                      </button>
                    </div>
                  )}

                  {/* Feedback State 2: Recitation does NOT match — Word check + Retry Reading Again Button */}
                  {voiceStatus === 'wrong' && (
                    <div className="app-page-card border-0 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 ring-2 ring-red-400/80 space-y-3 animate-fadeIn text-right" dir={isEn ? 'ltr' : 'rtl'}>
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm">
                        <AlertTriangle size={19} className="text-red-500 shrink-0" />
                        <span className="flex-1">
                          {isEn ? 'Recitation did not match the verse' : 'القراءة غير مطابقة للآية المطلوبة'}
                        </span>
                        <span className="app-3d-badge border-0 text-xs px-2.5 py-0.5 rounded-full bg-red-200/70 dark:bg-red-800/60 text-red-800 dark:text-red-200 font-black">
                          {voiceMatchResult?.score || 0}%
                        </span>
                      </div>

                      {/* Word-by-word clarity when ayah words are available */}
                      {voiceMatchResult && voiceMatchResult.ayahWords.length > 0 && (
                        <div
                          className="app-inner-3d-box border-0 p-2.5 rounded-xl bg-white/85 dark:bg-[#0F172A]/85 text-sm font-serif leading-loose flex flex-wrap gap-1.5"
                          style={{ fontFamily: "'Amiri', serif" }}
                          dir="rtl"
                        >
                          {voiceMatchResult.ayahWords.map((word, wIdx) => {
                            const matched = Boolean(voiceMatchResult.matchedWords[wIdx]);
                            return (
                              <span
                                key={wIdx}
                                className={`app-3d-badge border-0 px-2 py-0.5 rounded-lg text-xs sm:text-sm font-bold ${
                                  matched
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-red-500/15 text-red-700 dark:text-red-300 underline decoration-red-500/70'
                                }`}
                              >
                                {word}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Primary Retry Reading Again + Secondary Next Verse */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={handleRetryVoice}
                          className="app-page-card border-0 py-3 px-3 rounded-xl font-bold text-xs bg-white dark:bg-[#0F172A] text-slate-800 dark:text-white cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={15} />
                          <span>{isEn ? 'Read Again' : 'إعادة القراءة مرة أخرى'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleProceedVoiceWithMistake}
                          className="py-3 px-3 rounded-xl font-bold text-xs border-0 bg-red-600 text-white cursor-pointer active:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
                          style={{
                            boxShadow: '0 4px 0 #b91c1c, inset 0 1.5px 2px rgba(255,255,255,0.35)'
                          }}
                        >
                          <span>
                            {currentStep < ayahs.length - 1
                              ? (isEn ? 'Next Verse' : 'الآية التالية')
                              : (isEn ? 'Finish Test' : 'إنهاء الاختبار')}
                          </span>
                          {isEn ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Target verse display when idle (for preview/reference) */}
                  {voiceStatus === 'idle' && (
                    <div className="wird-inner-raised p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 text-[11px] opacity-80">
                      {isEn 
                        ? 'Recite the full verse clearly; background noise is filtered automatically.' 
                        : 'اتلُ الآية كاملة بوضوح، يقوم المحرك بتنقية الصوت ومقارنته مع الآية تلقائياً.'}
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Word Scramble */}
              {quizType === 'scramble' && (
                <div className="space-y-4">
                  <div className="text-xs opacity-70 text-center font-medium">
                    {isEn ? 'Tap words in correct sequence to form the ayah:' : 'انقر على الكلمات بالترتيب الصحيح لتكوين الآية الكريمة:'}
                  </div>

                  {/* Construct Box */}
                  <div 
                    className={`wird-inner-raised min-h-[90px] p-4 rounded-2xl transition-all flex flex-wrap gap-2 items-center justify-center text-right font-serif text-lg leading-relaxed ${
                      scrambleStatus === 'correct' 
                        ? 'ring-2 ring-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30' 
                        : scrambleStatus === 'wrong'
                        ? 'ring-2 ring-red-500 bg-red-50/70 dark:bg-red-950/30'
                        : 'bg-slate-50 dark:bg-[#0F172A]/80'
                    }`}
                    style={{ fontFamily: "'Amiri', serif" }}
                    dir="rtl"
                  >
                    {selectedWords.length === 0 ? (
                      <span className="text-xs opacity-40 font-sans">
                        {isEn ? 'Selected words will appear here' : 'ستظهر الكلمات المختارة هنا بالترتيب...'}
                      </span>
                    ) : (
                      selectedWords.map((w, idx) => (
                        <button
                          type="button"
                          key={w.id}
                          onClick={() => handleWordDeselect(idx)}
                          className="app-page-card border-0 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all cursor-pointer"
                        >
                          {w.text}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scrambled Chips */}
                  <div className="flex flex-wrap gap-2.5 justify-center pt-2" dir="rtl">
                    {scrambledWords.map(w => (
                      <button
                        type="button"
                        key={w.id}
                        disabled={w.used || scrambleStatus !== 'idle'}
                        onClick={() => handleWordSelect(w)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-serif font-bold transition-all border-0 cursor-pointer ${
                          w.used 
                            ? 'opacity-20 scale-90 pointer-events-none bg-slate-200 dark:bg-zinc-800' 
                            : 'app-page-card bg-white dark:bg-[#0F172A]'
                        }`}
                        style={{ fontFamily: "'Amiri', serif" }}
                      >
                        {w.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 3: Multiple Choice / Next Ayah */}
              {quizType === 'next_ayah' && (
                <div className="space-y-3">
                  <div className="text-xs opacity-70 text-center font-medium">
                    {isEn ? 'Choose the correct verse:' : 'اختر الآية الكريمة المطابقة للموضع المطلوب:'}
                  </div>

                  <div className="space-y-3">
                    {choices.map((text, idx) => {
                      const isSelected = selectedChoice === idx;
                      const currentAyahClean = stripTajweed(currentAyah.text);
                      const isTarget = normalizeForSpeechMatch(text) === normalizeForSpeechMatch(currentAyahClean);
                      let styleClass = 'app-page-card border-0 bg-white dark:bg-[#0F172A]';
                      let customStyle: React.CSSProperties = { fontFamily: "'Amiri', serif" };

                      if (selectedChoice !== null) {
                        if (isTarget) {
                          styleClass = 'border-0 bg-emerald-500 text-white';
                          customStyle = {
                            ...customStyle,
                            boxShadow: '0 5px 0 #047857, inset 0 1.5px 2px rgba(255,255,255,0.4)'
                          };
                        } else if (isSelected) {
                          styleClass = 'border-0 bg-red-500 text-white';
                          customStyle = {
                            ...customStyle,
                            boxShadow: '0 5px 0 #b91c1c, inset 0 1.5px 2px rgba(255,255,255,0.35)'
                          };
                        }
                      }

                      return (
                        <button
                          type="button"
                          key={idx}
                          disabled={selectedChoice !== null}
                          onClick={() => handleChoiceClick(text, idx)}
                          className={`w-full p-4 rounded-2xl text-right font-serif text-base leading-relaxed transition-all cursor-pointer ${styleClass}`}
                          style={customStyle}
                          dir="rtl"
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`app-3d-badge border-0 w-6 h-6 rounded-full text-xs font-sans font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                selectedChoice !== null && (isTarget || isSelected)
                                  ? 'bg-white/25 text-white'
                                  : 'bg-slate-100 dark:bg-white/15 text-slate-700 dark:text-zinc-200'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="flex-1">{text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results & Spaced Repetition Grading (SM-2) */
            <div className="py-2 px-1 space-y-5">
              {/* Overall Score Card as requested */}
              <div 
                className={`app-page-card border-0 p-5 rounded-3xl text-center space-y-3 relative overflow-hidden ${
                  isAllCorrect 
                    ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-[#0F172A] dark:to-[#0F172A]' 
                    : 'bg-gradient-to-br from-amber-50 via-orange-50 to-slate-50 dark:from-amber-950/30 dark:via-[#0F172A] dark:to-[#0F172A]'
                }`}
                style={{
                  boxShadow: isBlackTheme
                    ? '0 7px 0 #09090b, 0 16px 30px rgba(0, 0, 0, 0.78), inset 0 2px 2px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.5)'
                    : (isAllCorrect
                        ? '0 6.5px 0 rgba(16, 185, 129, 0.28), 0 14px 28px rgba(16, 185, 129, 0.16), inset 0 2px 2px rgba(255, 255, 255, 0.96)'
                        : '0 6.5px 0 rgba(245, 158, 11, 0.28), 0 14px 28px rgba(245, 158, 11, 0.16), inset 0 2px 2px rgba(255, 255, 255, 0.96)')
                }}
              >
                <div 
                  className="app-3d-badge border-0 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ 
                    backgroundColor: isAllCorrect ? '#10B98124' : '#F59E0B24', 
                    color: isAllCorrect ? '#10B981' : '#F59E0B' 
                  }}
                >
                  {isAllCorrect ? <Trophy size={36} /> : <AlertTriangle size={36} />}
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {isAllCorrect 
                      ? (isEn ? 'All Verses Correct! (100%)' : 'صحيحة بالكامل! ما شاء الله (100%) 🎉') 
                      : (isEn 
                          ? `Result: ${correctCount} of ${totalCount} Correct (${overallPercentage}%)` 
                          : `إجمالي النتيجة: ${correctCount} من ${totalCount} صحيحة (${overallPercentage}%)`)}
                  </h4>
                  <p className="text-xs opacity-75 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                    {isAllCorrect 
                      ? (isEn 
                          ? `You mastered all ${totalCount} verses without any errors. Excellent memorization!` 
                          : `أتممت تسميع جميع الآيات (${totalCount} من ${totalCount}) بنجاح وبدون أي أخطاء. حفظ متقن وراسخ!`) 
                      : (isEn 
                          ? `There are mistakes in ${errorCount} verse(s). You can review details below and strengthen your review schedule.` 
                          : `يوجد أخطاء في ${errorCount} ${errorCount === 1 ? 'آية' : 'آيات'} تحتاج إلى تثبيت ومراجعة. يمكنك مراجعة التفاصيل أدناه:`)}
                  </p>
                </div>

                {/* Score bar */}
                <div 
                  className="w-full bg-slate-200/80 dark:bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5"
                  style={{
                    boxShadow: 'inset 0 2.5px 5px rgba(0, 0, 0, 0.22), inset 0 -1px 1px rgba(255, 255, 255, 0.65)'
                  }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${overallPercentage}%`,
                      backgroundColor: isAllCorrect ? '#10B981' : overallPercentage >= 60 ? '#F59E0B' : '#EF4444',
                      boxShadow: 'inset 0 1.5px 1px rgba(255, 255, 255, 0.45)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Detailed Verses Report */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} style={{ color: primaryColor }} />
                    {isEn ? 'Verses Detailed Report:' : 'تقرير فحص الآيات بالتفصيل:'}
                  </span>
                  <span className="text-[11px] opacity-70 font-sans">
                    {correctCount} {isEn ? 'passed' : 'صحيحة'} • {errorCount} {isEn ? 'errors' : 'أخطاء'}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto px-0.5 py-1">
                  {allResults.map((res, idx) => (
                    <div 
                      key={idx}
                      className={`wird-inner-raised p-3.5 rounded-2xl text-right transition-all ${
                        res.passed 
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/25' 
                          : 'bg-red-50/70 dark:bg-red-950/25'
                      }`}
                      dir="rtl"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-700 dark:text-zinc-200">
                          {SURAH_NAMES_AR[res.surahNumber - 1]} - الآية {res.ayahNumber}
                        </span>
                        {res.passed ? (
                          <span className="app-3d-badge border-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>صحيحة ومتقنة</span>
                            {res.score ? <span className="opacity-75">({res.score}%)</span> : null}
                          </span>
                        ) : (
                          <span className="app-3d-badge border-0 flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 px-2.5 py-0.5 rounded-full">
                            <XCircle size={13} className="text-red-600" />
                            <span>توجد أخطاء</span>
                            {res.score !== undefined ? <span className="opacity-75">({res.score}%)</span> : null}
                          </span>
                        )}
                      </div>

                      <p className="font-serif text-sm leading-relaxed text-slate-800 dark:text-zinc-200" style={{ fontFamily: "'Amiri', serif" }}>
                        {stripTajweed(res.text)}
                      </p>

                      {!res.passed && res.heardText && (
                        <div className="app-inner-3d-box border-0 mt-2 p-2.5 rounded-xl bg-white/85 dark:bg-zinc-800/80 text-[11px] text-red-800 dark:text-red-300">
                          <span className="font-bold">ما تم قراءته في التسجيل: </span>
                          <span className="italic">"{res.heardText}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action 1: Retry Full Quiz */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRestartFullQuiz}
                  className="app-page-card border-0 w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#0F172A] text-slate-800 dark:text-zinc-200 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} />
                  <span>{isEn ? 'Retest All Verses from Start' : 'إعادة الاختبار كاملاً من البداية'}</span>
                </button>
              </div>

              {/* Action 2: SM-2 Mastery Grade Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 text-center">
                  {isEn ? 'Record Rating for Spaced Review:' : 'اعتماد التقييم لجدول المراجعة الذكي:'}
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleGradeMastery('perfect')}
                    className={`app-page-card border-0 w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 transition-all flex items-center justify-between text-right cursor-pointer ${
                      isAllCorrect ? 'ring-2 ring-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="app-3d-badge border-0 w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5 flex-wrap">
                          <span>{isEn ? 'Mastered (Excellent)' : 'متقن جداً (كالفاتحة)'}</span>
                          {isAllCorrect && (
                            <span className="app-3d-badge border-0 text-[10px] px-2 py-0.5 bg-emerald-600 text-white rounded-full font-sans">
                              {isEn ? 'Recommended' : 'موصى به لنتيجتك'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {isEn ? 'Postpone review for 7 - 14 days' : 'جدولة المراجعة بعد أسبوع إلى أسبوعين'}
                        </div>
                      </div>
                    </div>
                    <Check size={18} className="text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGradeMastery('good')}
                    className={`app-page-card border-0 w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 transition-all flex items-center justify-between text-right cursor-pointer ${
                      !isAllCorrect && errorCount === 1 ? 'ring-2 ring-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="app-3d-badge border-0 w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Brain size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-center gap-1.5 flex-wrap">
                          <span>{isEn ? 'Good (Minor hesitation)' : 'جيد (مع قليل من التردد أو خطأ واحد)'}</span>
                          {!isAllCorrect && errorCount === 1 && (
                            <span className="app-3d-badge border-0 text-[10px] px-2 py-0.5 bg-amber-600 text-white rounded-full font-sans">
                              {isEn ? 'Recommended' : 'موصى به لنتيجتك'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400">
                          {isEn ? 'Schedule review in 3 days' : 'مراجعة وتثبيت بعد 3 أيام'}
                        </div>
                      </div>
                    </div>
                    <Check size={18} className="text-amber-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGradeMastery('needs_work')}
                    className={`app-page-card border-0 w-full p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 transition-all flex items-center justify-between text-right cursor-pointer ${
                      errorCount >= 2 ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="app-3d-badge border-0 w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold">
                        <RefreshCw size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-red-800 dark:text-red-200 flex items-center gap-1.5 flex-wrap">
                          <span>{isEn ? 'Needs Practice (Repeat)' : 'يحتاج تثبيت ومراجعة (إعادة غداً)'}</span>
                          {errorCount >= 2 && (
                            <span className="app-3d-badge border-0 text-[10px] px-2 py-0.5 bg-red-600 text-white rounded-full font-sans">
                              {isEn ? 'Recommended' : 'موصى به لنتيجتك'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-red-600 dark:text-red-400">
                          {isEn ? 'Will be placed in tomorrow\'s schedule' : 'إدراجه فوراً في جدول المراجعة لليوم التالي'}
                        </div>
                      </div>
                    </div>
                    <Check size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemorizationQuizModal;
