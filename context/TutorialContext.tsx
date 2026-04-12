import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

interface TutorialContextType {
  shouldShowTutorial: (tutorialId: string) => boolean;
  markTutorialAsSeen: (tutorialId: string) => void;
  resetTutorials: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seenTutorials, setSeenTutorials] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSeenTutorials = async () => {
      const { value } = await Preferences.get({ key: 'seen_tutorials' });
      if (value) {
        try {
          setSeenTutorials(new Set(JSON.parse(value)));
        } catch (e) {
          console.error('Failed to parse seen tutorials', e);
        }
      }
      setIsLoaded(true);
    };
    loadSeenTutorials();
  }, []);

  const shouldShowTutorial = (tutorialId: string) => {
    if (!isLoaded) return false; // Don't show until we know what's been seen
    return !seenTutorials.has(tutorialId);
  };

  const markTutorialAsSeen = async (tutorialId: string) => {
    const newSeen = new Set(seenTutorials);
    newSeen.add(tutorialId);
    setSeenTutorials(newSeen);
    await Preferences.set({
      key: 'seen_tutorials',
      value: JSON.stringify(Array.from(newSeen))
    });
  };

  const resetTutorials = async () => {
    setSeenTutorials(new Set());
    await Preferences.remove({ key: 'seen_tutorials' });
  };

  return (
    <TutorialContext.Provider value={{ shouldShowTutorial, markTutorialAsSeen, resetTutorials }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
