import React from 'react';
import SettingsModal from './SettingsModal';
import BookmarksModal from './BookmarksModal';
import ThemesModal from './ThemesModal';
import TafseerModal from './TafseerModal';
import TafseerSelectionModal from './TafseerSelectionModal';
import AyahOptionsMenu from './AyahOptionsMenu';
import SajdahCardModal from './SajdahCardModal';
import FontSelectModal from './FontSelectModal';
import ReciterSelectModal from './ReciterSelectModal';
import ScrollSpeedModal from './ScrollSpeedModal';
import ToolbarColorPickerModal from './ToolbarColorPickerModal';
import { QuranDownloadModal, TafsirDownloadModal } from './DownloadModals';
import AutoScrollSettingsModal from './AutoScrollSettingsModal';
import ListenSurahSelectModal from './ListenSurahSelectModal';
import MushafSelectionModal from './MushafSelectionModal';
import ShareAyahModal from './ShareAyahModal';

export const QuranReaderModals = ({
    activeModals,
    closeModal,
    openModal,
    settings,
    setSettings,
    updateSetting,
    toolbarColors,
    setToolbarColors,
    currentTheme,
    setCurrentTheme,
    isTransparentMode,
    setIsTransparentMode,
    isHideToolbarsEnabled,
    setIsHideToolbarsEnabled,
    showSajdahCard,
    setShowSajdahCard,
    modeSuffix,
    isLandscapeRef,
    bookmarks,
    deleteBookmark,
    jumpToAyah,
    tafseerInfo,
    setTafseerInfo,
    isTafseerLoading,
    tafseerSelectionInfo,
    setTafseerSelectionInfo,
    handleTafseerSelect,
    ayahContextMenu,
    setAyahContextMenu,
    playAudio,
    saveBookmark,
    handleCloseSajdahCard,
    sajdahCardInfo,
    showToast,
    quranData,
    audioState,
    setAudioState,
    playSurah,
    currentAyah,
    readingMode
}: any) => {

    return (
        <>
            {activeModals.includes('settings') && (
                <SettingsModal
                    onClose={() => closeModal('settings')}
                    onOpenModal={(modalName) => {
                        closeModal('settings');
                        openModal(modalName);
                    }}
                    showToast={showToast}
                    isLandscape={isLandscapeRef.current}
                    readingMode={readingMode}
                    modeSuffix={modeSuffix}
                />
            )}

            {activeModals.includes('share-ayah') && (
                <ShareAyahModal
                    isOpen={true}
                    onClose={() => closeModal('share-ayah')}
                    currentAyah={currentAyah}
                    quranData={quranData}
                    currentTheme={currentTheme}
                    readingMode={readingMode}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('bookmarks') && (
                <BookmarksModal
                    onClose={() => closeModal('bookmarks')}
                    bookmarks={bookmarks}
                    quranData={quranData}
                    onSelect={(s: number, a: number, isLandscape: boolean) => {
                        jumpToAyah(s, a, true);
                        closeModal('bookmarks');
                    }}
                    onDelete={deleteBookmark}
                    currentTheme={currentTheme}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('themes') && (
                <ThemesModal
                    onClose={() => closeModal('themes')}
                    showToast={showToast}
                    isLandscape={isLandscapeRef.current}
                    readingMode={readingMode}
                    modeSuffix={modeSuffix}
                />
            )}

            {activeModals.includes('font-modal') && (
                <FontSelectModal
                    isOpen={true}
                    onClose={() => closeModal('font-modal')}
                    onSelect={(fontId: string) => updateSetting('fontFamily', fontId, isLandscapeRef)}
                    currentFontId={settings.fontFamily}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('reciter-modal') && (
                <ReciterSelectModal
                    onClose={() => closeModal('reciter-modal')}
                    currentReader={settings.reader}
                    onSelect={(readerId: string) => updateSetting('reader', readerId, isLandscapeRef)}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('scroll-speed-modal') && (
                <ScrollSpeedModal
                    isOpen={true}
                    onClose={() => closeModal('scroll-speed-modal')}
                    onSelect={(speed: number) => updateSetting('scrollSpeed', speed, isLandscapeRef)}
                    currentMinutes={settings.scrollSpeed || 5}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('toolbar-color-picker-modal') && (
                <ToolbarColorPickerModal
                    onClose={() => closeModal('toolbar-color-picker-modal')}
                    onOpenModal={(modalName) => {
                        closeModal('toolbar-color-picker-modal');
                        openModal(modalName);
                    }}
                    showToast={showToast}
                    currentTheme={currentTheme}
                    toolbarColors={toolbarColors}
                    isLandscape={isLandscapeRef.current}
                    modeSuffix={modeSuffix}
                />
            )}

            {activeModals.includes('quran-download-modal') && (
                <QuranDownloadModal
                    onClose={() => closeModal('quran-download-modal')}
                    quranData={quranData}
                    showToast={showToast}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('tafsir-download-modal') && (
                <TafsirDownloadModal
                    onClose={() => closeModal('tafsir-download-modal')}
                    quranData={quranData}
                    showToast={showToast}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('autoscroll-settings') && (
                <AutoScrollSettingsModal
                    isOpen={true}
                    onClose={() => closeModal('autoscroll-settings')}
                    onSelectTime={(minutes: number) => updateSetting('autoScrollDuration', minutes, isLandscapeRef)}
                    currentMinutes={settings.autoScrollDuration || 30}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {activeModals.includes('listen-surah-modal') && (
                <ListenSurahSelectModal
                    onClose={() => closeModal('listen-surah-modal')}
                    currentSurah={currentAyah.s}
                    onSelect={(s: number) => {
                        playSurah(s);
                        closeModal('listen-surah-modal');
                    }}
                    isLandscape={isLandscapeRef.current}
                    surahsList={quranData.surahs}
                />
            )}


            {tafseerInfo.isOpen && (
                <TafseerModal
                    isOpen={true}
                    onClose={() => {
                        setTafseerInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                    }}
                    text={tafseerInfo.text}
                    title={`${tafseerInfo.surahName} - آية ${tafseerInfo.a}`}
                    isLoading={isTafseerLoading}
                    currentTheme={currentTheme}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {tafseerSelectionInfo.isOpen && (
                <TafseerSelectionModal
                    isOpen={true}
                    onClose={() => {
                        setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                    }}
                    onSelect={handleTafseerSelect}
                    currentTafseerId={settings.tafseer}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {ayahContextMenu.isOpen && !ayahContextMenu.isCustomizing && (
                <AyahOptionsMenu
                    x={ayahContextMenu.x}
                    y={ayahContextMenu.y}
                    onClose={() => setAyahContextMenu({ isOpen: false, x: 0, y: 0, s: 0, a: 0, tempSettings: null })}
                    onPlay={() => {
                        playAudio(ayahContextMenu.s, ayahContextMenu.a);
                        setAyahContextMenu({ isOpen: false, x: 0, y: 0, s: 0, a: 0, tempSettings: null });
                    }}
                    onTafseer={() => {
                        setTafseerSelectionInfo({ isOpen: true, s: ayahContextMenu.s, a: ayahContextMenu.a, wasAutoscrolling: false });
                        setAyahContextMenu({ isOpen: false, x: 0, y: 0, s: 0, a: 0, tempSettings: null });
                    }}
                    onBookmark={() => {
                        saveBookmark();
                        setAyahContextMenu({ isOpen: false, x: 0, y: 0, s: 0, a: 0, tempSettings: null });
                    }}
                    onCustomize={() => {
                        setAyahContextMenu((prev: any) => ({ ...prev, isCustomizing: true }));
                    }}
                    currentTheme={currentTheme}
                    isLandscape={isLandscapeRef.current}
                />
            )}

            {sajdahCardInfo.show && (
                <SajdahCardModal
                    info={sajdahCardInfo.info}
                    onClose={handleCloseSajdahCard}
                    currentTheme={currentTheme}
                    isLandscape={isLandscapeRef.current}
                />
            )}
        </>
    );
};
