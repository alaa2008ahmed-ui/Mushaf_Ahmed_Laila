import React, { FC } from 'react';
import { toArabic } from './constants';

const ReadingTimer: FC<{isVisible: boolean, elapsedTime: number}> = ({isVisible, elapsedTime}) => {
    if (!isVisible) return null;
    const minutes = Math.floor(Number(elapsedTime) / 60).toString().padStart(2, '0');
    const seconds = (Number(elapsedTime) % 60).toString().padStart(2, '0');
    return (<div className={`reading-timer modal-skinned toast-element ${isVisible ? 'show' : ''}`}>{toArabic(`${minutes}:${seconds}`)}</div>);
};

export default ReadingTimer;
