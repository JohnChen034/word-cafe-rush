export type RunEconomyStats = {
  rushBoxesOpened: number;
  biggestCheckout: number;
  lastCallCheckouts: number;
  overtimeSecondsEarned: number;
};

export function createRunEconomyStats(): RunEconomyStats {
  return {
    rushBoxesOpened: 0,
    biggestCheckout: 0,
    lastCallCheckouts: 0,
    overtimeSecondsEarned: 0,
  };
}
