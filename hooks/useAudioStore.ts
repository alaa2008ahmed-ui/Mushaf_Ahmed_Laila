import { create } from 'zustand';
import { quranData } from '../utils/quranData';

interface AudioState {
    isPlaying: boolean;
    isAudioLoading: boolean;
    playingAyah: { s: number; a: number } | null;
    audioCache: Record<string, HTMLAudioElement>;
    currentAudio: HTMLAudioElement | null;
    reader: string;
    repeatCount: number;

    // Actions
    setIsPlaying: (playing: boolean) => void;
    setIsAudioLoading: (loading: boolean) => void;
    setPlayingAyah: (ayah: { s: number; a: number } | null) => void;
    playAudio: (s: number, a: number, reader: string, repeatCount: number) => Promise<void>;
    stopAudio: () => void;
    setReader: (reader: string) => void;
    setRepeatCount: (count: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    isPlaying: false,
    isAudioLoading: false,
    playingAyah: null,
    audioCache: {},
    currentAudio: null,
    reader: 'Abu_Bakr_Ash-Shaatree_128kbps',
    repeatCount: 1,

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setIsAudioLoading: (isAudioLoading) => set({ isAudioLoading }),
    setPlayingAyah: (playingAyah) => set({ playingAyah }),
    setReader: (reader) => set({ reader }),
    setRepeatCount: (repeatCount) => set({ repeatCount }),

    stopAudio: () => {
        const { currentAudio } = get();
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.onended = null;
        }
        set({ isPlaying: false, isAudioLoading: false, playingAyah: null, currentAudio: null });
    },

    playAudio: async (s: number, a: number, reader: string, repeatCount: number) => {
        const { stopAudio, audioCache } = get();
        stopAudio();
        set({ isAudioLoading: true, playingAyah: { s, a }, reader, repeatCount });

        const cacheKey = `${s}:${a}:${reader}`;
        let audio: HTMLAudioElement;

        if (audioCache[cacheKey]) {
            audio = audioCache[cacheKey];
            audio.currentTime = 0;
        } else {
            const surahStr = String(s).padStart(3, '0');
            const ayahStr = String(a).padStart(3, '0');
            const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;
            audio = new Audio(audioUrl);
            audio.preload = 'auto';
            set((state) => ({ audioCache: { ...state.audioCache, [cacheKey]: audio } }));
        }

        set({ currentAudio: audio });

        audio.onplaying = () => {
            set({ isPlaying: true, isAudioLoading: false });
        };
        audio.onpause = () => {
            set({ isPlaying: false });
        };
        audio.onwaiting = () => {
            set({ isAudioLoading: true });
        };
        audio.onended = () => {
            const { reader, repeatCount } = get();
            // Simple next ayah logic for now
            const surahData = quranData.surahs[s - 1];
            if (!surahData) return get().stopAudio();

            let nextS = s;
            let nextA = a + 1;
            if (a >= surahData.ayahs.length) {
                if (s < 114) {
                    nextS = s + 1;
                    nextA = 1;
                } else {
                    return get().stopAudio();
                }
            }
            get().playAudio(nextS, nextA, reader, repeatCount);
        };
        audio.onerror = () => {
            set({ isPlaying: false, isAudioLoading: false });
            console.error("Audio playback error");
        };

        try {
            await audio.play();
        } catch (e) {
            console.error("Failed to play audio", e);
            set({ isAudioLoading: false, isPlaying: false });
        }
    }
}));
