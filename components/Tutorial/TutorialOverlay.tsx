import React from "react";

export interface TutorialStep {
  id: string;
  title?: string;
  text: string;
  icon?: React.ReactNode;
  position?: { top?: string; bottom?: string; left?: string; right?: string };
  arrow?: "up" | "down" | "left" | "right";
  selector?: string;
}

interface TutorialOverlayProps {
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onStepChange?: (stepId: string) => void;
}

/**
 * TutorialOverlay has been completely deactivated.
 * All first-time onboarding tutorials across the entire app are disabled.
 */
const TutorialOverlay: React.FC<TutorialOverlayProps> = () => {
  return null;
};

export default TutorialOverlay;
