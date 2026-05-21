import type { RewardDefinition, RewardId } from "./RewardTypes";

export const REWARD_CATALOG: RewardDefinition[] = [
  {
    id: "tip_jar",
    name: "Tip Jar",
    category: "money",
    maxLevel: 5,
    shortDescription: (level) => `Every 3 combo gives +$${tipJarBonus(level)}.`,
  },
  {
    id: "golden_register",
    name: "Golden Register",
    category: "money",
    maxLevel: 5,
    shortDescription: (level) => `Checkout money x${goldenRegisterMultiplier(level)}.`,
  },
  {
    id: "latte_art",
    name: "Latte Art",
    category: "skill",
    maxLevel: 5,
    shortDescription: (level) =>
      level >= 5 ? "Long words x4 and +1 stamp." : `6+ letter words x${latteArtMultiplier(level)}.`,
  },
  {
    id: "perfect_pour",
    name: "Perfect Pour",
    category: "skill",
    maxLevel: 5,
    shortDescription: (level) => `Typo-free prompts give +$${perfectPourBonus(level)}.`,
  },
  {
    id: "combo_foam",
    name: "Combo Foam",
    category: "combo",
    maxLevel: 5,
    shortDescription: (level) => `Blocks typo every ${comboFoamCooldown(level)}s.`,
  },
  {
    id: "rush_bell",
    name: "Rush Bell",
    category: "spawn",
    maxLevel: 5,
    shortDescription: (level) => `${Math.round(rushBellChance(level) * 100)}% bonus customer chance.`,
  },
  {
    id: "stamp_card",
    name: "Stamp Card",
    category: "box",
    maxLevel: 5,
    shortDescription: (level) => `Every ${stampCardEvery(level)} checkouts gives +1 stamp.`,
  },
  {
    id: "closing_bell",
    name: "Closing Bell",
    category: "last_call",
    maxLevel: 5,
    shortDescription: (level) => `Last Call checkouts x${closingBellMultiplier(level)}.`,
  },
];

export function getRewardDefinition(id: RewardId): RewardDefinition {
  const reward = REWARD_CATALOG.find((item) => item.id === id);
  if (!reward) throw new Error(`Unknown reward: ${id}`);
  return reward;
}

export function tipJarBonus(level: number): number {
  return [0, 10, 20, 30, 45, 60][level] ?? 60;
}

export function goldenRegisterMultiplier(level: number): number {
  return [1, 1.2, 1.4, 1.6, 1.9, 2.3][level] ?? 2.3;
}

export function latteArtMultiplier(level: number): number {
  return [1, 1.5, 2, 2.5, 3, 4][level] ?? 4;
}

export function perfectPourBonus(level: number): number {
  return [0, 5, 10, 15, 25, 40][level] ?? 40;
}

export function comboFoamCooldown(level: number): number {
  return [Infinity, 30, 25, 20, 15, 15][level] ?? 15;
}

export function rushBellChance(level: number): number {
  return [0, 0.05, 0.08, 0.12, 0.16, 0.25][level] ?? 0.25;
}

export function stampCardEvery(level: number): number {
  return [Infinity, 6, 5, 4, 3, 3][level] ?? 3;
}

export function closingBellMultiplier(level: number): number {
  return [1, 2, 2.5, 3, 4, 5][level] ?? 5;
}
