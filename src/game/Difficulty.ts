export type DifficultyId = "easy" | "normal";

export type DifficultyConfig = {
  id: DifficultyId;
  label: string;
  sessionSeconds: number;
  lastCallSeconds: number;
  overtimeCapSeconds: number;
  maxCustomers: number;
  spawnEveryMs: number;
  patienceSeconds: number;
  typoPatiencePenalty: number;
  unhappyPenalty: number;
};

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Easy",
    sessionSeconds: 90,
    lastCallSeconds: 15,
    overtimeCapSeconds: 6,
    maxCustomers: 2,
    spawnEveryMs: 3600,
    patienceSeconds: 18,
    typoPatiencePenalty: 0.45,
    unhappyPenalty: 40,
  },
  normal: {
    id: "normal",
    label: "Normal",
    sessionSeconds: 90,
    lastCallSeconds: 15,
    overtimeCapSeconds: 6,
    maxCustomers: 3,
    spawnEveryMs: 2600,
    patienceSeconds: 13,
    typoPatiencePenalty: 0.75,
    unhappyPenalty: 60,
  },
};
