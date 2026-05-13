export type SingularityRingProps = {
  /** Ist-Sparrate des angezeigten Monats. null = Onboarding offen / kein Income */
  currentSparrate: number | null;
  /** Plan-Sparrate desselben Monats. null analog */
  plannedSparrate: number | null;
};

export type RingCenterColor = "red" | "white" | "teal";
export type RingSubtextColor = "red" | "teal" | "muted";

export type RingState = {
  posOffset: number;
  negOffset: number;
  centerColor: RingCenterColor;
  subtext: string | null;
  subtextColor: RingSubtextColor;
};
