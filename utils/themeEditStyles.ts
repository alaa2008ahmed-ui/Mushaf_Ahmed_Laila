import React from 'react';

export interface EditModeStyles {
  saveBtn: React.CSSProperties;
  resetBtn: React.CSSProperties;
  dragBadge: React.CSSProperties;
  toast: React.CSSProperties;
}

export function getThemeEditModeStyles(
  isNightMode: boolean,
  homeThemeVariant: 'gold' | 'sky' | 'emerald' | 'burgundy' | string = 'gold',
  isBlackTheme: boolean = false
): EditModeStyles {
  // 1. الوضع الليلي (Night Mode / Deep Black)
  if (isNightMode || isBlackTheme) {
    return {
      saveBtn: {
        background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(251, 191, 36, 0.6)',
        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
      },
      resetBtn: {
        background: 'linear-gradient(135deg, #27272A 0%, #18181B 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(245, 158, 11, 0.45)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      },
      dragBadge: {
        background: 'linear-gradient(135deg, #18181B 0%, #09090B 100%)',
        color: '#FCD34D',
        border: '1px solid rgba(245, 158, 11, 0.55)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7)',
      },
      toast: {
        background: 'linear-gradient(180deg, #27272A 0%, #18181B 55%, #111114 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#050507',
        ['--toast-3d-ring' as any]: 'rgba(245, 158, 11, 0.42)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.28)',
      }
    };
  }

  // 2. الوضع السماوي (Sky Mode)
  if (homeThemeVariant === 'sky') {
    return {
      saveBtn: {
        background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(125, 211, 252, 0.6)',
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
      },
      resetBtn: {
        background: 'linear-gradient(135deg, #0369A1 0%, #0C4A6E 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(56, 189, 248, 0.45)',
        boxShadow: '0 4px 12px rgba(12, 74, 110, 0.35)',
      },
      dragBadge: {
        background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(125, 211, 252, 0.6)',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
      },
      toast: {
        background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 52%, #0369A1 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#075985',
        ['--toast-3d-ring' as any]: 'rgba(125, 211, 252, 0.45)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.58)',
      }
    };
  }

  // 3. الوضع الزمردي (Emerald Mode)
  if (homeThemeVariant === 'emerald') {
    return {
      saveBtn: {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(110, 231, 183, 0.6)',
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
      },
      resetBtn: {
        background: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(52, 211, 153, 0.45)',
        boxShadow: '0 4px 12px rgba(6, 78, 59, 0.35)',
      },
      dragBadge: {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(110, 231, 183, 0.6)',
        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
      },
      toast: {
        background: 'linear-gradient(180deg, #34D399 0%, #059669 52%, #047857 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#064E3B',
        ['--toast-3d-ring' as any]: 'rgba(110, 231, 183, 0.45)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.58)',
      }
    };
  }

  // 4. الوضع العنابي (Burgundy Mode)
  if (homeThemeVariant === 'burgundy') {
    return {
      saveBtn: {
        background: 'linear-gradient(135deg, #BE123C 0%, #881337 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(253, 164, 175, 0.6)',
        boxShadow: '0 4px 12px rgba(190, 18, 60, 0.35)',
      },
      resetBtn: {
        background: 'linear-gradient(135deg, #881337 0%, #4C0519 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(251, 113, 133, 0.45)',
        boxShadow: '0 4px 12px rgba(76, 5, 25, 0.35)',
      },
      dragBadge: {
        background: 'linear-gradient(135deg, #BE123C 0%, #881337 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(253, 164, 175, 0.6)',
        boxShadow: '0 4px 14px rgba(190, 18, 60, 0.3)',
      },
      toast: {
        background: 'linear-gradient(180deg, #E11D48 0%, #9F1239 52%, #881337 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#4C0519',
        ['--toast-3d-ring' as any]: 'rgba(253, 164, 175, 0.42)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.52)',
      }
    };
  }

  // 5. الذهبي الملكي (Gold / Default)
  return {
    saveBtn: {
      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(252, 211, 77, 0.6)',
      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
    },
    resetBtn: {
      background: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(245, 158, 11, 0.45)',
      boxShadow: '0 4px 12px rgba(120, 53, 15, 0.35)',
    },
    dragBadge: {
      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(252, 211, 77, 0.6)',
      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
    },
    toast: {
      background: 'linear-gradient(180deg, #FEF08A 0%, #FACC15 45%, #EAB308 100%)',
      color: '#000000',
      ['--toast-3d-lip' as any]: '#A16207',
      ['--toast-3d-ring' as any]: 'rgba(180, 83, 9, 0.36)',
      ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.88)',
    }
  };
}
