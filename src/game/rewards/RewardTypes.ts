export type RewardId =
  | "tip_jar"
  | "golden_register"
  | "latte_art"
  | "perfect_pour"
  | "combo_foam"
  | "rush_bell"
  | "stamp_card"
  | "closing_bell";

export type RewardCategory = "money" | "combo" | "spawn" | "box" | "last_call" | "skill";

export type RewardDefinition = {
  id: RewardId;
  name: string;
  category: RewardCategory;
  maxLevel: number;
  shortDescription: (level: number) => string;
};

export type OwnedReward = {
  id: RewardId;
  name: string;
  level: number;
};

export type CheckoutContext = {
  baseValue: number;
  isLastCall: boolean;
  combo: number;
  promptWasPerfect: boolean;
  longestPromptLengthForCustomer: number;
};

export type CheckoutResult = {
  moneyEarned: number;
  stampsEarned: number;
  bonusLabels: string[];
};
