import React, { useRef } from 'react';

export const useQuranToolbarStyle = (toolbarColors: any, currentTheme: any, isTransparentMode: boolean) => {
    const getToolbarStyle = (type: string, defaultBg: string, defaultText: string, defaultBorder: string) => {
        const config = toolbarColors[type];
        let bg = config?.bg || defaultBg || "#ffffff";
        let border = config?.border || defaultBorder || "#e5e7eb";

        if (!bg || bg.includes('rgba') || bg === 'transparent') {
            bg = currentTheme.barBg || "#ffffff";
        }
        if (!border || border.includes('rgba') || border === 'transparent') {
            const themeBorder = currentTheme.barBorder || "#e5e7eb";
            border = themeBorder.includes(' ') ? themeBorder.split(' ')[2] : themeBorder;
        }

        let finalBg = bg;
        let backdrop = 'none';
        let finalShadow: string | undefined = undefined;
        if (isTransparentMode && (type === 'top-toolbar' || type === 'bottom-toolbar')) {
            finalBg = 'transparent';
            border = 'transparent';
            finalShadow = 'none';
        }

        return { 
            backgroundColor: finalBg, 
            color: config?.text || defaultText, 
            borderColor: border, 
            fontFamily: config?.font || 'inherit',
            opacity: 1,
            backdropFilter: backdrop,
            WebkitBackdropFilter: backdrop,
            ...(finalShadow && { boxShadow: finalShadow })
        };
    };

    return { getToolbarStyle };
};
