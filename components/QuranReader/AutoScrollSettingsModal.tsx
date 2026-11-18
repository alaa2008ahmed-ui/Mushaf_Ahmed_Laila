import React, { FC } from 'react';
import ScrollSpeedModal from './ScrollSpeedModal';

interface AutoScrollSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTime: (minutes: number) => void;
    currentMinutes: number;
    isLandscape?: boolean;
    isEn?: boolean;
    currentTheme?: any;
}

const AutoScrollSettingsModal: FC<AutoScrollSettingsModalProps> = ({
    isOpen,
    onClose,
    onSelectTime,
    currentMinutes,
    isLandscape,
    isEn,
    currentTheme,
}) => {
    return (
        <ScrollSpeedModal
            isOpen={isOpen}
            onClose={onClose}
            onSelect={onSelectTime}
            currentMinutes={currentMinutes}
            isLandscape={isLandscape}
            currentTheme={currentTheme}
            zIndexClass="z-[1200]"
            isEnOverride={isEn}
        />
    );
};

export default AutoScrollSettingsModal;
