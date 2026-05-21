export type ScoreState = {
  score: number;
  income: number;
  combo: number;
  maxCombo: number;
  typoCount: number;
  happyCustomers: number;
  unhappyCustomers: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  completedPromptChars: number;
};

export type ResultsStats = ScoreState & {
  elapsedSeconds: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  rating: "C" | "B" | "A" | "S";
};

export function createScoreState(): ScoreState {
  return {
    score: 0,
    income: 0,
    combo: 0,
    maxCombo: 0,
    typoCount: 0,
    happyCustomers: 0,
    unhappyCustomers: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    completedPromptChars: 0,
  };
}

export function applyPromptScore(state: ScoreState, promptLength: number): void {
  state.combo += 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.completedPromptChars += promptLength;
  state.score += 20 + promptLength * 4 + state.combo * 3;
}

export function applyCheckoutScore(state: ScoreState, multiplier = 1): number {
  state.happyCustomers += 1;
  const tip = Math.round((30 + Math.min(state.combo * 2, 40)) * multiplier);
  state.income += tip;
  state.score += tip;
  return tip;
}

export function applyTypo(state: ScoreState): void {
  state.typoCount += 1;
  state.combo = Math.max(0, state.combo - 1);
  state.score = Math.max(0, state.score - 5);
}

export function applyUnhappyCustomer(state: ScoreState, penalty: number): void {
  state.unhappyCustomers += 1;
  state.combo = 0;
  state.score = Math.max(0, state.score - penalty);
}

export function calculateResults(state: ScoreState, elapsedSeconds: number): ResultsStats {
  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);
  const wpm = state.completedPromptChars / 5 / minutes;
  const rawWpm = state.totalKeystrokes / 5 / minutes;
  const accuracy =
    state.totalKeystrokes === 0 ? 100 : (state.correctKeystrokes / state.totalKeystrokes) * 100;
  const rating = state.score >= 1300 ? "S" : state.score >= 900 ? "A" : state.score >= 520 ? "B" : "C";

  return {
    ...state,
    elapsedSeconds,
    wpm: Math.round(wpm),
    rawWpm: Math.round(rawWpm),
    accuracy: Math.round(accuracy),
    rating,
  };
}
