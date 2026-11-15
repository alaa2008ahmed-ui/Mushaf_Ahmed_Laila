import { normalizeForSpeechMatch } from './quranMemorizationUtils';

/**
 * Strip Tajweed inline tags so we evaluate pure Quranic text.
 */
export const stripQuranTajweedTags = (text: string): string => {
  if (!text) return '';
  return text.replace(/\[([a-z])(?::\d+)?\[/g, '').replace(/\]/g, '').trim();
};

/**
 * Canonical Uthmani-to-Modern-Arabic word map so ASR transcripts (standard Arabic)
 * match Uthmani Quran orthography accurately.
 */
const UTHMANI_CANONICAL_MAP: Record<string, string> = {
  // Common Uthmani dagger-alif / omitted-alif / waw-alif words
  'الرحمن': 'الرحمان',
  'رحمن': 'رحمان',
  'صلوة': 'صلاه',
  'الصلوة': 'الصلاه',
  'صلوتهم': 'صلاتهم',
  'صلوات': 'صلوات',
  'زكوة': 'زكاه',
  'الزكوة': 'الزكاه',
  'حيوة': 'حياه',
  'الحيوة': 'الحياه',
  'مشكوة': 'مشكاه',
  'نجوة': 'نجاه',
  'منوة': 'مناه',
  'غدوة': 'غداه',
  'ملك': 'مالك',
  'ذلك': 'ذالك',
  'ذلكم': 'ذالكم',
  'كذلك': 'كذالك',
  'هذا': 'هاذا',
  'هذه': 'هاذه',
  'هؤلاء': 'هاولاء',
  'اولئك': 'اولائك',
  'اوليك': 'اولائك',
  'اله': 'الاه',
  'الاله': 'الالاه',
  'سموت': 'سماوات',
  'السموت': 'السماوات',
  'سموات': 'سماوات',
  'السموات': 'السماوات',
  'ثلاث': 'ثلاث',
  'ثلث': 'ثلاث',
  'اليل': 'الليل',
  'ليل': 'الليل',
  'الذي': 'الذي',
  'الذين': 'الذين',
  'التي': 'التي',
  'لكن': 'لاكن',
  'لكنا': 'لاكنا',
  'طه': 'طاها',
  'يس': 'ياسين',
  'يايها': 'يا ايها',
  'يايهاالذين': 'يا ايها الذين',
  'يادم': 'يا ادم',
  'ينوح': 'يا نوح',
  'يموسى': 'يا موسي',
  'يعيسى': 'يا عيسي',
  'يمريم': 'يا مريم',
  'يخت': 'يا اخت',
  'يبني': 'يا بني',
  'يقوم': 'يا قوم',
  'يرب': 'يا رب',
  'مما': 'من ما',
  'عما': 'عن ما',
  'فيما': 'في ما',
  'الا': 'ان لا',
  'كيلا': 'كي لا',
  'لئلا': 'لان لا',
  'الرحيم': 'الرحيم',
  'العالمين': 'العالمين',
  'العلمين': 'العالمين',
  'الشياطين': 'الشياطين',
  'الشيطين': 'الشياطين',
  'الشيطان': 'الشيطان',
  'الشيطن': 'الشيطان',
  'انسان': 'انسان',
  'الانس': 'الانس',
  'الانسان': 'الانسان',
  'الانسن': 'الانسان',
  'قران': 'قران',
  'القران': 'القران',
  'كتاب': 'كتاب',
  'الكتب': 'الكتاب',
  'كتب': 'كتاب',
  'اصحاب': 'اصحاب',
  'اصحب': 'اصحاب',
  'ابراهيم': 'ابراهيم',
  'ابرهيم': 'ابراهيم',
  'اسماعيل': 'اسماعيل',
  'اسمعيل': 'اسماعيل',
  'اسحاق': 'اسحاق',
  'اسحق': 'اسحاق',
  'سليمان': 'سليمان',
  'سليمن': 'سليمان',
  'هارون': 'هارون',
  'هرون': 'هارون',
  'داوود': 'داود',
  'داود': 'داود',
  'فرعون': 'فرعون',
  'سبحان': 'سبحان',
  'سبحن': 'سبحان',
  'سلطان': 'سلطان',
  'سلطن': 'سلطان',
  'غفران': 'غفران',
  'احسان': 'احسان',
  'احسن': 'احسان',
  'برهان': 'برهان',
  'برهن': 'برهان',
  'خالدون': 'خالدون',
  'خلدون': 'خالدون',
  'خالدين': 'خالدين',
  'خلدين': 'خالدين',
  'صادقين': 'صادقين',
  'صدقين': 'صادقين',
  'ظالمين': 'ظالمين',
  'ظلمين': 'ظالمين',
  'كافرين': 'كافرين',
  'كفرين': 'كافرين',
  'مساكين': 'مساكين',
  'مسكين': 'مسكين',
  'يتامى': 'يتامي',
  'يتمي': 'يتامي',
  'صراط': 'صراط',
  'سراط': 'صراط',
  'الصرط': 'الصراط',
  'صرط': 'صراط',
  'توبو': 'توبوا',
  'امنو': 'امنوا',
  'علمو': 'علموا',
  'عملو': 'عملوا',
  'قالو': 'قالوا',
  'كانو': 'كانوا'
};

/**
 * Deep Quranic normalization tailored for spoken Arabic ASR comparison:
 * Removes silent Uthmani marks, kashida, small high letters, hamza variants,
 * and converts Uthmani word forms to canonical spoken Arabic.
 */
export function normalizeQuranForVoice(text: string): string {
  if (!text) return '';
  let cleaned = stripQuranTajweedTags(text)
    // Remove all diacritics, Quranic annotation marks, small high letters, dagger alif, maddah, sukun
    .replace(/[\u0610-\u061A\u0640\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Remove ornamental Quranic markers and digits/punctuation
    .replace(/[\u06DD\u06DE\u06E9\uFD3E\uFD3F۞۩۝0-9٠-٩\(\)\[\]«».,;:؟!،\-_'"]/g, ' ')
    // Normalize Alef & Hamza forms
    .replace(/[إأآٱء]/g, 'ا')
    // Normalize Waw-hamza -> Waw
    .replace(/ؤ/g, 'و')
    // Normalize Yaa-hamza & Alif maqsura -> Yaa
    .replace(/[ىيئ]/g, 'ي')
    // Normalize Taa marbuta -> Haa
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();

  // Apply base normalization too for consistency
  cleaned = normalizeForSpeechMatch(cleaned);

  // Expand/map each token through canonical Uthmani dictionary
  const mappedTokens = cleaned
    .split(' ')
    .filter(Boolean)
    .map(tok => {
      // Strip trailing silent Uthmani plural alif variations ONLY for exact dict lookup first
      if (UTHMANI_CANONICAL_MAP[tok]) {
        return UTHMANI_CANONICAL_MAP[tok];
      }
      // Handle leading conjunction 'و' or 'ف' + mapped word (e.g. والصلوة -> والصلاه)
      if (tok.length > 3 && (tok[0] === 'و' || tok[0] === 'ف' || tok[0] === 'ب' || tok[0] === 'ل')) {
        const rest = tok.slice(1);
        if (UTHMANI_CANONICAL_MAP[rest]) {
          return tok[0] + UTHMANI_CANONICAL_MAP[rest];
        }
      }
      return tok;
    });

  return mappedTokens.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Computes normalized Levenshtein similarity between two Arabic tokens (0..1).
 */
function tokenSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  // Handle common Arabic phonetic equivalences in ASR (ص/س، ض/ظ، ذ/ز، ث/س، ه/ت at end)
  const phoneticFold = (s: string) =>
    s
      .replace(/[ةهت]$/g, 'ه')
      .replace(/ث/g, 'س')
      .replace(/ذ/g, 'ز')
      .replace(/ظ/g, 'ض')
      .replace(/وا$/g, 'و');

  const fa = phoneticFold(a);
  const fb = phoneticFold(b);
  if (fa === fb) return 0.95;

  const la = fa.length;
  const lb = fb.length;
  const maxLen = Math.max(la, lb);
  if (maxLen === 0) return 1;

  // Substring containment check for mild ASR prefix/suffix drift on longer words
  if (Math.min(la, lb) >= 4 && (fa.includes(fb) || fb.includes(fa))) {
    return 0.88;
  }

  const dp: number[] = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= lb; j++) {
      const temp = dp[j];
      const cost = fa[i - 1] === fb[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }

  const dist = dp[lb];
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Strips accidental Isti'adha or Basmala prefix if the target verse is NOT Basmala.
 */
function stripRecitationPreamble(normSpoken: string, normAyah: string): string {
  let result = normSpoken;
  const istiadha = 'اعوذ بالله من الشيطان الرجيم';
  const basmala = 'بسم الله الرحمان الرحيم';

  if (!normAyah.includes('اعوذ بالله') && result.startsWith(istiadha)) {
    result = result.slice(istiadha.length).trim();
  }
  if (!normAyah.includes('بسم الله') && result.startsWith(basmala)) {
    result = result.slice(basmala.length).trim();
  }
  return result || normSpoken;
}

export interface VoiceEvaluationResult {
  score: number;
  passed: boolean;
  matchedWords: boolean[];
  ayahWords: string[];
  bestTranscript: string;
}

/**
 * Evaluates a single ASR transcript against the target Quranic ayah using
 * Uthmani-aware canonicalization, two-word join/split resolution, and fuzzy Levenshtein sequence alignment.
 */
export function evaluateSingleTranscript(ayahText: string, spokenText: string): VoiceEvaluationResult {
  const cleanDisplay = stripQuranTajweedTags(ayahText);
  const displayWords = cleanDisplay.split(/\s+/).filter(Boolean);

  const normAyah = normalizeQuranForVoice(cleanDisplay);
  const ayahTokens = normAyah.split(' ').filter(Boolean);

  if (ayahTokens.length === 0) {
    return { score: 100, passed: true, matchedWords: [], ayahWords: displayWords, bestTranscript: spokenText };
  }

  const rawNormSpoken = normalizeQuranForVoice(spokenText);
  const normSpoken = stripRecitationPreamble(rawNormSpoken, normAyah);
  const spokenTokens = normSpoken.split(' ').filter(Boolean);

  if (spokenTokens.length === 0) {
    return {
      score: 0,
      passed: false,
      matchedWords: displayWords.map(() => false),
      ayahWords: displayWords,
      bestTranscript: spokenText
    };
  }

  // Also build merged consecutive spoken pairs so split ASR words ("يا ايها") match single Uthmani token ("يايها")
  const spokenCandidates: Array<{ text: string; startIdx: number; endIdx: number }> = [];
  for (let i = 0; i < spokenTokens.length; i++) {
    spokenCandidates.push({ text: spokenTokens[i], startIdx: i, endIdx: i });
    if (i + 1 < spokenTokens.length) {
      spokenCandidates.push({ text: spokenTokens[i] + spokenTokens[i + 1], startIdx: i, endIdx: i + 1 });
    }
  }

  // Forward-biased sequence matching across ayah tokens
  let searchFromIdx = 0;
  let totalWeight = 0;
  const matchedFlags: boolean[] = [];

  for (let ai = 0; ai < ayahTokens.length; ai++) {
    const targetWord = ayahTokens[ai];
    let bestSim = 0;
    let bestEndIdx = searchFromIdx;

    for (const cand of spokenCandidates) {
      // Allow slight look-back (-2) for self-corrections or repeated breaths, prefer sequential order
      if (cand.endIdx < Math.max(0, searchFromIdx - 2)) continue;
      const sim = tokenSimilarity(targetWord, cand.text);
      // Small order bonus if ahead in sequence
      const effectiveSim = cand.startIdx >= searchFromIdx ? sim : sim * 0.94;
      if (effectiveSim > bestSim) {
        bestSim = effectiveSim;
        bestEndIdx = cand.endIdx + 1;
      }
      if (sim >= 0.98 && cand.startIdx >= searchFromIdx) break;
    }

    // Check also if two consecutive ayah tokens merged into one spoken token (e.g. "من ما" -> "مما")
    if (bestSim < 0.72 && ai + 1 < ayahTokens.length) {
      const mergedAyah = ayahTokens[ai] + ayahTokens[ai + 1];
      for (const cand of spokenCandidates) {
        if (cand.endIdx < Math.max(0, searchFromIdx - 2)) continue;
        const sim = tokenSimilarity(mergedAyah, cand.text);
        if (sim > bestSim) {
          bestSim = sim;
          bestEndIdx = cand.endIdx + 1;
        }
      }
    }

    const isWordPassed = bestSim >= 0.68;
    matchedFlags.push(isWordPassed);
    if (bestSim >= 0.82) {
      totalWeight += 1;
      searchFromIdx = Math.max(searchFromIdx, bestEndIdx);
    } else if (bestSim >= 0.68) {
      totalWeight += 0.85;
      searchFromIdx = Math.max(searchFromIdx, bestEndIdx);
    } else if (bestSim >= 0.5) {
      totalWeight += 0.3;
    }
  }

  // Map ayahTokens back cleanly to displayWords length if tokenization differs slightly
  const mappedDisplayFlags = displayWords.map((_, idx) => {
    const mappedIdx = Math.min(matchedFlags.length - 1, Math.round((idx / Math.max(1, displayWords.length - 1)) * Math.max(0, matchedFlags.length - 1)));
    return matchedFlags[idx] !== undefined ? matchedFlags[idx] : Boolean(matchedFlags[mappedIdx]);
  });

  const score = Math.min(100, Math.round((totalWeight / ayahTokens.length) * 100));
  const passThreshold = ayahTokens.length <= 2 ? 75 : 68;
  const passed = score >= passThreshold;

  return {
    score,
    passed,
    matchedWords: mappedDisplayFlags,
    ayahWords: displayWords,
    bestTranscript: spokenText
  };
}

/**
 * Evaluates multiple ASR alternative hypotheses and picks the highest-confidence Quranic match.
 */
export function evaluateVoiceRecitationCandidates(ayahText: string, candidates: string[]): VoiceEvaluationResult {
  const unique = Array.from(new Set(candidates.map(c => c.trim()).filter(Boolean)));
  if (unique.length === 0) {
    return evaluateSingleTranscript(ayahText, '');
  }

  let best: VoiceEvaluationResult | null = null;
  for (const cand of unique) {
    const res = evaluateSingleTranscript(ayahText, cand);
    if (!best || res.score > best.score) {
      best = res;
    }
    if (best.score === 100) break;
  }

  return best!;
}

/**
 * Dedicated Web Audio DSP & Voice-Activity Filtering Engine:
 * - Captures microphone with echoCancellation + noiseSuppression + autoGainControl
 * - Applies High-Pass (85Hz) + Low-Pass (4500Hz) + Vocal Presence EQ (1900Hz) + Dynamics Compressor
 * - Measures real-time vocal energy above adaptive background noise floor
 * - Signals speech onset and post-speech silence cleanly for accurate automatic stopping
 */
export class QuranVoiceAudioMonitor {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private rafId: number | null = null;
  private stopped = false;

  private noiseFloor = 0.018;
  private calibrationFrames = 0;
  private speechDetected = false;
  private lastSpeechTime = 0;
  private silenceTriggered = false;

  async start(options: {
    onLevel?: (level: number) => void;
    onSpeechDetected?: () => void;
    onSilenceAfterSpeech?: () => void;
    silenceTimeoutMs?: number;
  }): Promise<boolean> {
    this.stop();
    this.stopped = false;
    this.noiseFloor = 0.018;
    this.calibrationFrames = 0;
    this.speechDetected = false;
    this.lastSpeechTime = performance.now();
    this.silenceTriggered = false;

    const silenceTimeout = options.silenceTimeoutMs ?? 1750;

    try {
      if (!navigator.mediaDevices?.getUserMedia) return false;

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });

      if (this.stopped) {
        this.cleanupStream();
        return false;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return true;

      const ctx: AudioContext = new AudioCtx();
      this.audioCtx = ctx;
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaStreamSource(this.stream);

      // 1. High-pass filter (85Hz) to strip AC/fan/handling rumble
      const highPass = ctx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 85;
      highPass.Q.value = 0.7;

      // 2. Low-shelf gentle mud reduction (200Hz)
      const mudCut = ctx.createBiquadFilter();
      mudCut.type = 'peaking';
      mudCut.frequency.value = 210;
      mudCut.Q.value = 1.0;
      mudCut.gain.value = -2.5;

      // 3. Vocal consonant articulation boost (1900Hz)
      const presenceBoost = ctx.createBiquadFilter();
      presenceBoost.type = 'peaking';
      presenceBoost.frequency.value = 1900;
      presenceBoost.Q.value = 0.9;
      presenceBoost.gain.value = 4.0;

      // 4. Low-pass filter (4500Hz) to attenuate background hiss
      const lowPass = ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 4500;
      lowPass.Q.value = 0.7;

      // 5. Compressor to level quiet and loud recitation smoothly
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -30;
      compressor.knee.value = 18;
      compressor.ratio.value = 4.5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.14;

      // 6. Analyser on filtered speech signal
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.35;
      this.analyser = analyser;

      // Chain DSP nodes (NOT connected to speakers to avoid acoustic feedback!)
      source.connect(highPass);
      highPass.connect(mudCut);
      mudCut.connect(presenceBoost);
      presenceBoost.connect(lowPass);
      lowPass.connect(compressor);
      compressor.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      const tick = () => {
        if (this.stopped || !this.analyser) return;
        this.analyser.getByteTimeDomainData(dataArray);

        let sumSq = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / dataArray.length);

        // Adaptive noise floor calibration over first ~15 frames
        if (this.calibrationFrames < 15) {
          this.noiseFloor = this.calibrationFrames === 0 ? Math.max(0.012, rms) : this.noiseFloor * 0.75 + rms * 0.25;
          this.calibrationFrames++;
        }

        const speechThreshold = Math.max(0.026, this.noiseFloor * 1.85);
        const now = performance.now();

        if (rms > speechThreshold) {
          if (!this.speechDetected) {
            this.speechDetected = true;
            options.onSpeechDetected?.();
          }
          this.lastSpeechTime = now;
        } else if (this.speechDetected && !this.silenceTriggered && now - this.lastSpeechTime >= silenceTimeout) {
          this.silenceTriggered = true;
          options.onSilenceAfterSpeech?.();
        }

        const normalizedLevel = Math.min(1, Math.max(0, (rms - this.noiseFloor * 0.6) / 0.16));
        options.onLevel?.(normalizedLevel);

        this.rafId = requestAnimationFrame(tick);
      };

      this.rafId = requestAnimationFrame(tick);
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  hasDetectedSpeech(): boolean {
    return this.speechDetected;
  }

  private cleanupStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      this.stream = null;
    }
  }

  stop() {
    this.stopped = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.analyser = null;
    if (this.audioCtx) {
      try {
        this.audioCtx.close().catch(() => {});
      } catch {}
      this.audioCtx = null;
    }
    this.cleanupStream();
  }
}
