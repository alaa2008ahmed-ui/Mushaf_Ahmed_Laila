import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Mic, MicOff, CheckCircle2, XCircle, RefreshCw, Trophy, 
  ArrowRight, ArrowLeft, Volume2, Sparkles, Brain, Check, 
  HelpCircle, AlertTriangle, RotateCcw, Award, CheckCircle
} from 'lucide-react';
<<<<<<< HEAD
import { getAyahsInRange, normalizeForSpeechMatch } from '../../utils/quranMemorizationUtils';
import {
  QuranVoiceAudioMonitor,
  evaluateVoiceRecitationCandidates,
  stripQuranTajweedTags
} from '../../utils/quranVoiceEngine';
=======
import { getAyahsInRange, normalizeForSpeechMatch, calculateAyahMatchScore } from '../../utils/quranMemorizationUtils';
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
<<<<<<< HEAD
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
=======
  const [voiceMatchResult, setVoiceMatchResult] = useState<{ score: number; matchedWords: boolean[]; ayahWords: string[] } | null>(null);

  // Refs for speech recognition lifecycle and silence detection
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const maxTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

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

<<<<<<< HEAD
  // Stop recognition & audio filter monitor cleanly without evaluation
  const stopVoiceRecognition = useCallback(async () => {
    isListeningRef.current = false;
    setIsListening(false);
    setAudioLevel(0);
=======
  // Stop recognition helper without evaluation
  const stopVoiceRecognition = useCallback(async () => {
    isListeningRef.current = false;
    setIsListening(false);
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
    releaseListenInterruption('mem-quiz-mic');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
<<<<<<< HEAD
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (audioMonitorRef.current) {
      audioMonitorRef.current.stop();
      audioMonitorRef.current = null;
    }
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

    try {
      if (Capacitor.isNativePlatform()) {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        await SpeechRecognition.stop().catch(() => {});
        await SpeechRecognition.removeAllListeners().catch(() => {});
      } else if (recognitionRef.current) {
<<<<<<< HEAD
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch {}
=======
        recognitionRef.current.stop();
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
        recognitionRef.current = null;
      }
    } catch (e) {}
  }, []);

<<<<<<< HEAD
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
=======
  // Stop voice recording and perform evaluation (Correct vs Wrong)
  const stopAndEvaluateVoice = useCallback(async (textToEvaluate?: string) => {
    await stopVoiceRecognition();

    const rawTranscript = (textToEvaluate !== undefined ? textToEvaluate : latestTranscriptRef.current).trim();
    const currentAyah = ayahs[currentStep];
    if (!currentAyah) return;

    if (!rawTranscript) {
      setVoiceStatus('wrong');
      setVoiceMatchResult({ score: 0, matchedWords: [], ayahWords: [] });
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
      playSound('wrong');
      return;
    }

    setVoiceStatus('evaluating');
<<<<<<< HEAD
    const res = evaluateVoiceRecitationCandidates(cleanAyahText, candidatesSnapshot);
    setSpokenText(res.bestTranscript);
    setVoiceMatchResult({
      score: res.score,
      matchedWords: res.matchedWords,
      ayahWords: res.ayahWords
    });

    if (res.passed) {
=======
    const cleanAyahText = stripTajweed(currentAyah.text);
    const res = calculateAyahMatchScore(cleanAyahText, rawTranscript);
    setVoiceMatchResult(res);

    // 70% threshold for Quranic speech recognition match
    const isCorrect = res.score >= 70;

    if (isCorrect) {
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
<<<<<<< HEAD
    setAudioLevel(0);
    setVoiceMatchResult(null);
    latestTranscriptRef.current = '';
    candidateTranscriptsRef.current = [];
    accumulatedPrefixRef.current = '';
=======
    setVoiceMatchResult(null);
    latestTranscriptRef.current = '';
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

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

<<<<<<< HEAD
  // Start Dedicated Audio-Filtered Voice Recognition with VAD & multi-hypothesis matching
=======
  // Start Voice Recognition with silence detection
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
  const startVoiceRecognition = async () => {
    if (isListeningRef.current) {
      // Manual tap while recording -> stop and evaluate immediately
      await stopAndEvaluateVoice();
      return;
    }

    try {
      setSpokenText('');
<<<<<<< HEAD
      setAudioLevel(0);
      setVoiceMatchResult(null);
      latestTranscriptRef.current = '';
      candidateTranscriptsRef.current = [];
      accumulatedPrefixRef.current = '';
=======
      setVoiceMatchResult(null);
      latestTranscriptRef.current = '';
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
      setVoiceStatus('listening');
      isListeningRef.current = true;
      setIsListening(true);
      acquireListenInterruption('mem-quiz-mic');

<<<<<<< HEAD
      // Max recording safety timer (25 seconds for longer ayahs)
=======
      // Max recording safety timer (15 seconds)
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
      maxTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) {
          stopAndEvaluateVoice();
        }
<<<<<<< HEAD
      }, 25000);
=======
      }, 15000);
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

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
<<<<<<< HEAD
            candidateTranscriptsRef.current = data.matches.filter(Boolean);

            // Real-time silence debounce timer: 1650ms after last recognized speech
=======

            // Real-time silence debounce timer: 1800ms of silence stops and evaluates automatically
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (isListeningRef.current) {
                stopAndEvaluateVoice(heard);
              }
<<<<<<< HEAD
            }, 1650);
=======
            }, 1800);
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
          }
        });

        await SpeechRecognition.start({
          language: 'ar-SA',
<<<<<<< HEAD
          maxResults: 5,
=======
          maxResults: 3,
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
          prompt: isEn ? 'Recite the verse clearly' : 'اتلُ الآية الكريمة بصوت واضح',
          partialResults: true
        });
      } else {
<<<<<<< HEAD
=======
        // Web Speech API fallback
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
          setIsListening(false);
          isListeningRef.current = false;
          setVoiceStatus('idle');
          releaseListenInterruption('mem-quiz-mic');
          alert(isEn ? 'Speech recognition is not supported in this browser' : 'التعرف الصوتي غير مدعوم في هذا المتصفح، يمكنك استخدام ترتيب الكلمات أو الاختيار.');
          return;
        }

<<<<<<< HEAD
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
=======
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          if (!isListeningRef.current) return;
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
          }
          const cleaned = transcript.trim();
          setSpokenText(cleaned);
          latestTranscriptRef.current = cleaned;

          // Automatic stop after 1.8 seconds of pause / silence
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              stopAndEvaluateVoice(cleaned);
            }
          }, 1800);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition event error:', e);
          if (isListeningRef.current && latestTranscriptRef.current.trim().length > 0) {
            stopAndEvaluateVoice();
          } else {
            stopVoiceRecognition();
            setVoiceStatus('idle');
          }
        };

        recognition.onend = () => {
          if (isListeningRef.current) {
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
            if (latestTranscriptRef.current.trim().length > 0) {
              stopAndEvaluateVoice();
            } else {
              stopVoiceRecognition();
              setVoiceStatus('idle');
            }
<<<<<<< HEAD
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
=======
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
<<<<<<< HEAD
    setAudioLevel(0);
    setVoiceMatchResult(null);
    latestTranscriptRef.current = '';
    candidateTranscriptsRef.current = [];
    accumulatedPrefixRef.current = '';
=======
    setVoiceMatchResult(null);
    latestTranscriptRef.current = '';
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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

<<<<<<< HEAD
  const isBlackTheme = btnTextColor === '#000000';
  const primary3DStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: btnTextColor,
    boxShadow: isBlackTheme
      ? '0 5px 0 #52525b, 0 10px 18px -2px rgba(0, 0, 0, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.65)'
      : '0 5px 0 rgba(0, 0, 0, 0.22), 0 10px 18px -2px rgba(0, 0, 0, 0.16), inset 0 2px 2px rgba(255, 255, 255, 0.35)'
  };

=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
  return (
    <div 
      className="fixed inset-0 z-[1500] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fadeIn" 
      onClick={onClose}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div 
<<<<<<< HEAD
        className="app-page-card border-0 w-full max-w-lg max-h-[92dvh] rounded-[2rem] flex flex-col overflow-hidden bg-white dark:bg-[#1E293B] text-slate-800 dark:text-zinc-100" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
=======
        className="w-full max-w-lg max-h-[92dvh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 text-slate-800 dark:text-zinc-100" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-sm"
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
<<<<<<< HEAD
            type="button"
            onClick={onClose}
            className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#0F172A] text-slate-500 dark:text-zinc-300 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
=======
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer border-0"
            aria-label="Close"
          >
            <X size={18} />
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
          </button>
        </div>

        {!isFinished && (
          <>
            {/* Mode Selector Tabs - Multiple Choice default on Right, Voice Recitation on Left in RTL */}
            <div className="px-5 pt-3">
<<<<<<< HEAD
              <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
                <button
                  type="button"
=======
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 gap-1 text-[11px] font-bold">
                <button
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                  onClick={() => {
                    stopVoiceRecognition();
                    setQuizType('next_ayah');
                  }}
<<<<<<< HEAD
                  className={`py-2.5 px-2 rounded-2xl transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'next_ayah'
                      ? 'active:translate-y-[2px]'
                      : 'app-page-card bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
                  }`}
                  style={quizType === 'next_ayah' ? primary3DStyle : undefined}
=======
                  className={`flex-1 py-1.5 rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'next_ayah' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'opacity-60'
                  }`}
                  style={{ color: quizType === 'next_ayah' ? primaryColor : undefined }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                >
                  <span>{isEn ? 'Multiple Choice' : 'اختيار الآية'}</span>
                </button>
                <button
<<<<<<< HEAD
                  type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                  onClick={() => {
                    stopVoiceRecognition();
                    setQuizType('scramble');
                  }}
<<<<<<< HEAD
                  className={`py-2.5 px-2 rounded-2xl transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'scramble'
                      ? 'active:translate-y-[2px]'
                      : 'app-page-card bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
                  }`}
                  style={quizType === 'scramble' ? primary3DStyle : undefined}
=======
                  className={`flex-1 py-1.5 rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'scramble' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'opacity-60'
                  }`}
                  style={{ color: quizType === 'scramble' ? primaryColor : undefined }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                >
                  <span>{isEn ? 'Word Order' : 'ترتيب الكلمات'}</span>
                </button>
                <button
<<<<<<< HEAD
                  type="button"
=======
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                  onClick={() => {
                    stopVoiceRecognition();
                    setQuizType('voice');
                  }}
<<<<<<< HEAD
                  className={`py-2.5 px-2 rounded-2xl transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'voice'
                      ? 'active:translate-y-[2px]'
                      : 'app-page-card bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
                  }`}
                  style={quizType === 'voice' ? primary3DStyle : undefined}
=======
                  className={`flex-1 py-1.5 rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center ${
                    quizType === 'voice' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'opacity-60'
                  }`}
                  style={{ color: quizType === 'voice' ? primaryColor : undefined }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
                <span className="text-[11px] opacity-60 font-sans bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
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

<<<<<<< HEAD
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
=======
                  {/* Mic Button & States */}
                  <div className="flex flex-col items-center justify-center py-3">
                    <button
                      onClick={startVoiceRecognition}
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer border-0 ${
                        isListening 
                          ? 'animate-pulse ring-8 ring-red-400/40 bg-red-500 text-white' 
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: isListening ? '#EF4444' : primaryColor,
                        color: '#FFFFFF'
                      }}
                      aria-label="Toggle Mic"
                    >
                      {isListening ? (
                        <MicOff size={38} className="animate-bounce" />
                      ) : (
                        <Mic size={38} />
                      )}
                    </button>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

                    <div className="mt-3.5 space-y-1">
                      <span className="text-xs font-bold block" style={{ color: isListening ? '#EF4444' : primaryColor }}>
                        {isListening 
<<<<<<< HEAD
                          ? (isEn ? 'Listening with noise filtering... Recite clearly' : 'جارٍ الاستماع وتنقية الصوت... اتلُ الآية الآن') 
                          : voiceStatus === 'evaluating'
                          ? (isEn ? 'Matching recitation with Quranic text...' : 'جارٍ فحص التلاوة ومطابقتها مع الآية...')
                          : (isEn ? 'Tap the mic to start reciting' : 'اضغط على المايكروفون للبدء بالتسميع')}
                      </span>
                      {isListening && (
                        <button
                          type="button"
                          onClick={() => stopAndEvaluateVoice()}
                          className="text-[11px] text-red-500 hover:text-red-600 underline font-semibold cursor-pointer border-0 bg-transparent block mx-auto"
                        >
                          {isEn ? 'Tap here to stop & evaluate now' : 'انقر هنا للإنهاء والمطابقة فوراً'}
=======
                          ? (isEn ? 'Listening... Speak clearly (will stop on pause)' : 'جارٍ الاستماع... اتلُ الآن (يتوقف تلقائياً)') 
                          : voiceStatus === 'evaluating'
                          ? (isEn ? 'Checking recitation...' : 'جارٍ فحص التلاوة ومطابقتها...')
                          : (isEn ? 'Tap to start reciting' : 'اضغط على المايكروفون للبدء بالتسميع')}
                      </span>
                      {isListening && (
                        <button
                          onClick={() => stopAndEvaluateVoice()}
                          className="text-[11px] text-red-500 hover:text-red-600 underline font-semibold cursor-pointer border-0 bg-transparent block mx-auto"
                        >
                          {isEn ? 'Tap here to stop & check immediately' : 'أو انقر هنا للإيقاف والتحقق الفوري'}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Spoken Text Feedback */}
                  {spokenText && (
<<<<<<< HEAD
                    <div className="wird-inner-raised p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] text-xs leading-relaxed opacity-95" dir="rtl">
                      <span className="font-bold opacity-60 ml-1 text-slate-500 dark:text-zinc-400">
                        {isEn ? 'Heard:' : 'النص المسموع:'}
=======
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 text-xs leading-relaxed opacity-95 border border-slate-200/80 dark:border-zinc-700 shadow-sm" dir="rtl">
                      <span className="font-bold opacity-60 ml-1 text-slate-500 dark:text-zinc-400">
                        {isEn ? 'Heard:' : 'ما تم سماعه في التسجيل:'}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                      </span>
                      <span className="font-serif text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        {spokenText}
                      </span>
                    </div>
                  )}

<<<<<<< HEAD
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
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black shrink-0">
=======
                  {/* Feedback State 1: Recitation is CORRECT */}
                  {voiceStatus === 'correct' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 dark:border-emerald-700 space-y-3 animate-fadeIn text-right" dir={isEn ? 'ltr' : 'rtl'}>
                      <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                        <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
                        <span className="flex-1">
                          {isEn ? 'Excellent! Recitation is correct' : 'ما شاء الله! قراءة صحيحة ومتقنة'}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 font-black">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                          {voiceMatchResult?.score}%
                        </span>
                      </div>

<<<<<<< HEAD
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
=======
                      <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 leading-relaxed font-medium">
                        {isEn 
                          ? 'Well done! The verse was recited accurately. Proceed to the next verse.' 
                          : 'أحسنت حفظ هذه الآية! تم التثبت من صحة تلاوتك، اضغط أدناه للانتقال إلى الآية التالية:'}
                      </p>

                      {/* Prominent Next Ayah Button as requested */}
                      <button
                        onClick={handleProceedVoiceCorrect}
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md border-0 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <span>{isEn ? 'Move to Next Verse' : 'الانتقال إلى الآية التالية'}</span>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        {isEn ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                      </button>
                    </div>
                  )}

<<<<<<< HEAD
                  {/* Feedback State 2: Recitation does NOT match — Word check + Retry Reading Again Button */}
                  {voiceStatus === 'wrong' && (
                    <div className="app-page-card border-0 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 ring-2 ring-red-400/80 space-y-3 animate-fadeIn text-right" dir={isEn ? 'ltr' : 'rtl'}>
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm">
                        <AlertTriangle size={19} className="text-red-500 shrink-0" />
                        <span className="flex-1">
                          {isEn ? 'Recitation did not match the verse' : 'القراءة غير مطابقة للآية المطلوبة'}
=======
                  {/* Feedback State 2: Recitation is WRONG (Alert + 2 Options: Retry or Next Ayah) */}
                  {voiceStatus === 'wrong' && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border-2 border-red-400 dark:border-red-800 space-y-3 animate-fadeIn text-right" dir={isEn ? 'ltr' : 'rtl'}>
                      <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300 font-bold text-sm">
                        <AlertTriangle size={22} className="text-red-500 shrink-0" />
                        <span className="flex-1">
                          {isEn ? 'Attention: Mistakes in recitation' : 'تنبيه: توجد أخطاء في التلاوة أو لم تكتمل الآية'}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-200/70 dark:bg-red-800/60 text-red-800 dark:text-red-200 font-black">
                          {voiceMatchResult?.score || 0}%
                        </span>
                      </div>

<<<<<<< HEAD
                      {/* Word-by-word clarity when ayah words are available */}
                      {voiceMatchResult && voiceMatchResult.ayahWords.length > 0 && (
                        <div
                          className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0F172A]/80 text-sm font-serif leading-loose flex flex-wrap gap-1.5"
                          style={{ fontFamily: "'Amiri', serif" }}
                          dir="rtl"
                        >
                          {voiceMatchResult.ayahWords.map((word, wIdx) => {
                            const matched = Boolean(voiceMatchResult.matchedWords[wIdx]);
                            return (
                              <span
                                key={wIdx}
                                className={`px-1.5 py-0.5 rounded-lg text-xs sm:text-sm font-bold ${
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
=======
                      <p className="text-xs text-red-800/90 dark:text-red-200/90 leading-relaxed font-medium">
                        {isEn 
                          ? 'Recitation was not completely matched. Choose to retry reciting now, or continue to the next verse:' 
                          : 'لم تتطابق التلاوة بالشكل المطلوب. يمكنك إعادة التسميع الآن لتصحيح الخطأ، أو الانتقال للآية التالية:'}
                      </p>

                      {/* The Two Choices Required by User */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          onClick={handleRetryVoice}
                          className="py-3 px-3 rounded-xl font-bold text-xs shadow-sm border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={15} />
                          <span>{isEn ? 'Retry Recitation' : 'إعادة التسميع'}</span>
                        </button>

                        <button
                          onClick={handleProceedVoiceWithMistake}
                          className="py-3 px-3 rounded-xl font-bold text-xs shadow-md border-0 bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>{isEn ? 'Next Verse' : 'الانتقال للآية التالية'}</span>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                          {isEn ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Target verse display when idle (for preview/reference) */}
                  {voiceStatus === 'idle' && (
<<<<<<< HEAD
                    <div className="wird-inner-raised p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 text-[11px] opacity-80">
                      {isEn 
                        ? 'Recite the full verse clearly; background noise is filtered automatically.' 
                        : 'اتلُ الآية كاملة بوضوح، يقوم المحرك بتنقية الصوت ومقارنته مع الآية تلقائياً.'}
=======
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60 text-[11px] opacity-75">
                      {isEn 
                        ? 'Recite the full verse clearly without rushing.' 
                        : 'اتلُ الآية كاملة بخشوع وتأنٍ، وسيتعرف النظام على صوتك تلقائياً.'}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
<<<<<<< HEAD
                    className={`wird-inner-raised min-h-[90px] p-4 rounded-2xl transition-all flex flex-wrap gap-2 items-center justify-center text-right font-serif text-lg leading-relaxed ${
                      scrambleStatus === 'correct' 
                        ? 'ring-2 ring-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30' 
                        : scrambleStatus === 'wrong'
                        ? 'ring-2 ring-red-500 bg-red-50/70 dark:bg-red-950/30'
                        : 'bg-slate-50 dark:bg-[#0F172A]/80'
=======
                    className={`min-h-[90px] p-4 rounded-2xl border-2 transition-all flex flex-wrap gap-2 items-center justify-center text-right font-serif text-lg leading-relaxed ${
                      scrambleStatus === 'correct' 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                        : scrambleStatus === 'wrong'
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40'
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
<<<<<<< HEAD
                          type="button"
                          key={w.id}
                          onClick={() => handleWordDeselect(idx)}
                          className="app-page-card border-0 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all cursor-pointer"
=======
                          key={w.id}
                          onClick={() => handleWordDeselect(idx)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 shadow-sm border border-slate-200/60 dark:border-zinc-600 text-sm font-bold active:scale-95 transition-all cursor-pointer"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        >
                          {w.text}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scrambled Chips */}
<<<<<<< HEAD
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
=======
                  <div className="flex flex-wrap gap-2 justify-center pt-2" dir="rtl">
                    {scrambledWords.map(w => (
                      <button
                        key={w.id}
                        disabled={w.used || scrambleStatus !== 'idle'}
                        onClick={() => handleWordSelect(w)}
                        className={`px-3 py-2 rounded-xl text-sm font-serif font-bold transition-all border-0 cursor-pointer ${
                          w.used 
                            ? 'opacity-20 scale-90 pointer-events-none' 
                            : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 shadow-sm active:scale-95'
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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

<<<<<<< HEAD
                  <div className="space-y-3">
=======
                  <div className="space-y-2.5">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    {choices.map((text, idx) => {
                      const isSelected = selectedChoice === idx;
                      const currentAyahClean = stripTajweed(currentAyah.text);
                      const isTarget = normalizeForSpeechMatch(text) === normalizeForSpeechMatch(currentAyahClean);
<<<<<<< HEAD
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
=======
                      let styleClass = 'bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700';

                      if (selectedChoice !== null) {
                        if (isTarget) {
                          styleClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md';
                        } else if (isSelected) {
                          styleClass = 'bg-red-500 text-white border-red-600 shadow-md';
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        }
                      }

                      return (
                        <button
<<<<<<< HEAD
                          type="button"
                          key={idx}
                          disabled={selectedChoice !== null}
                          onClick={() => handleChoiceClick(text, idx)}
                          className={`w-full p-4 rounded-2xl text-right font-serif text-base leading-relaxed transition-all cursor-pointer ${styleClass}`}
                          style={customStyle}
=======
                          key={idx}
                          disabled={selectedChoice !== null}
                          onClick={() => handleChoiceClick(text, idx)}
                          className={`w-full p-4 rounded-2xl text-right font-serif text-base leading-relaxed transition-all active:scale-[0.99] cursor-pointer ${styleClass}`}
                          style={{ fontFamily: "'Amiri', serif" }}
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                          dir="rtl"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-sans font-bold flex items-center justify-center shrink-0 mt-0.5">
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
<<<<<<< HEAD
                className={`app-page-card border-0 p-5 rounded-3xl text-center space-y-3 relative overflow-hidden ${
                  isAllCorrect 
                    ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-[#0F172A] dark:to-[#0F172A] ring-2 ring-emerald-400/70' 
                    : 'bg-gradient-to-br from-amber-50 via-orange-50 to-slate-50 dark:from-amber-950/30 dark:via-[#0F172A] dark:to-[#0F172A] ring-2 ring-amber-300/70'
=======
                className={`p-5 rounded-3xl border text-center space-y-3 shadow-lg relative overflow-hidden ${
                  isAllCorrect 
                    ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900 border-emerald-400 dark:border-emerald-700' 
                    : 'bg-gradient-to-br from-amber-50 via-orange-50 to-slate-50 dark:from-amber-950/30 dark:via-zinc-900 dark:to-zinc-900 border-amber-300 dark:border-amber-800'
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                }`}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md"
                  style={{ 
                    backgroundColor: isAllCorrect ? '#10B98120' : '#F59E0B20', 
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
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${overallPercentage}%`,
                      backgroundColor: isAllCorrect ? '#10B981' : overallPercentage >= 60 ? '#F59E0B' : '#EF4444'
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

<<<<<<< HEAD
                <div className="space-y-2.5 max-h-56 overflow-y-auto px-0.5 py-1">
                  {allResults.map((res, idx) => (
                    <div 
                      key={idx}
                      className={`wird-inner-raised p-3.5 rounded-2xl text-right transition-all ${
                        res.passed 
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/25' 
                          : 'bg-red-50/70 dark:bg-red-950/25'
=======
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {allResults.map((res, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-2xl border text-right transition-all ${
                        res.passed 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
                          : 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                      }`}
                      dir="rtl"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-700 dark:text-zinc-200">
                          {SURAH_NAMES_AR[res.surahNumber - 1]} - الآية {res.ayahNumber}
                        </span>
                        {res.passed ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>صحيحة ومتقنة</span>
                            {res.score ? <span className="opacity-75">({res.score}%)</span> : null}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 px-2.5 py-0.5 rounded-full">
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
                        <div className="mt-2 p-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-red-200 dark:border-red-900/40 text-[11px] text-red-800 dark:text-red-300">
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
<<<<<<< HEAD
                  type="button"
                  onClick={handleRestartFullQuiz}
                  className="app-page-card border-0 w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#0F172A] text-slate-800 dark:text-zinc-200 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
=======
                  onClick={handleRestartFullQuiz}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                >
                  <RotateCcw size={15} />
                  <span>{isEn ? 'Retest All Verses from Start' : 'إعادة الاختبار كاملاً من البداية'}</span>
                </button>
              </div>

              {/* Action 2: SM-2 Mastery Grade Buttons */}
<<<<<<< HEAD
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
=======
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 text-center">
                  {isEn ? 'Record Rating for Spaced Review:' : 'اعتماد التقييم لجدول المراجعة الذكي:'}
                </div>

<<<<<<< HEAD
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleGradeMastery('perfect')}
                    className={`app-page-card border-0 w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 transition-all flex items-center justify-between text-right cursor-pointer ${
                      isAllCorrect ? 'ring-2 ring-emerald-500' : ''
=======
                <div className="space-y-2">
                  <button
                    onClick={() => handleGradeMastery('perfect')}
                    className={`w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border transition-all flex items-center justify-between text-right active:scale-[0.98] cursor-pointer ${
                      isAllCorrect ? 'border-2 border-emerald-500 shadow-sm ring-2 ring-emerald-400/20' : 'border-emerald-300 dark:border-emerald-800'
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                          <span>{isEn ? 'Mastered (Excellent)' : 'متقن جداً (كالفاتحة)'}</span>
                          {isAllCorrect && (
                            <span className="text-[10px] px-2 py-0.2 bg-emerald-600 text-white rounded-full font-sans">
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
<<<<<<< HEAD
                    type="button"
                    onClick={() => handleGradeMastery('good')}
                    className={`app-page-card border-0 w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 transition-all flex items-center justify-between text-right cursor-pointer ${
                      !isAllCorrect && errorCount === 1 ? 'ring-2 ring-amber-500' : ''
=======
                    onClick={() => handleGradeMastery('good')}
                    className={`w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border transition-all flex items-center justify-between text-right active:scale-[0.98] cursor-pointer ${
                      !isAllCorrect && errorCount === 1 ? 'border-2 border-amber-500 shadow-sm ring-2 ring-amber-400/20' : 'border-amber-300 dark:border-amber-800'
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Brain size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                          <span>{isEn ? 'Good (Minor hesitation)' : 'جيد (مع قليل من التردد أو خطأ واحد)'}</span>
                          {!isAllCorrect && errorCount === 1 && (
                            <span className="text-[10px] px-2 py-0.2 bg-amber-600 text-white rounded-full font-sans">
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
<<<<<<< HEAD
                    type="button"
                    onClick={() => handleGradeMastery('needs_work')}
                    className={`app-page-card border-0 w-full p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 transition-all flex items-center justify-between text-right cursor-pointer ${
                      errorCount >= 2 ? 'ring-2 ring-red-500' : ''
=======
                    onClick={() => handleGradeMastery('needs_work')}
                    className={`w-full p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border transition-all flex items-center justify-between text-right active:scale-[0.98] cursor-pointer ${
                      errorCount >= 2 ? 'border-2 border-red-500 shadow-sm ring-2 ring-red-400/20' : 'border-red-300 dark:border-red-800'
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold">
                        <RefreshCw size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-red-800 dark:text-red-200 flex items-center gap-1.5">
                          <span>{isEn ? 'Needs Practice (Repeat)' : 'يحتاج تثبيت ومراجعة (إعادة غداً)'}</span>
                          {errorCount >= 2 && (
                            <span className="text-[10px] px-2 py-0.2 bg-red-600 text-white rounded-full font-sans">
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
