import {
  closingBellMultiplier,
  comboFoamCooldown,
  getRewardDefinition,
  goldenRegisterMultiplier,
  latteArtMultiplier,
  perfectPourBonus,
  REWARD_CATALOG,
  rushBellChance,
  stampCardEvery,
  tipJarBonus,
} from "./RewardCatalog";
import type { CheckoutContext, CheckoutResult, OwnedReward, RewardId } from "./RewardTypes";

export class RewardManager {
  private readonly levels = new Map<RewardId, number>();
  private lastFoamRefreshMs = -Infinity;

  reset(): void {
    this.levels.clear();
    this.lastFoamRefreshMs = -Infinity;
  }

  getLevel(id: RewardId): number {
    return this.levels.get(id) ?? 0;
  }

  addReward(id: RewardId): number {
    const definition = getRewardDefinition(id);
    const next = Math.min(this.getLevel(id) + 1, definition.maxLevel);
    this.levels.set(id, next);
    return next;
  }

  getOwnedRewards(): OwnedReward[] {
    return [...this.levels.entries()]
      .map(([id, level]) => ({ id, level, name: getRewardDefinition(id).name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getChoiceOptions(count: number): RewardId[] {
    const available = REWARD_CATALOG.filter((reward) => this.getLevel(reward.id) < reward.maxLevel);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((reward) => reward.id);
  }

  applyPromptBonuses(promptLength: number, promptWasPerfect: boolean): { money: number; stamps: number; labels: string[] } {
    let money = 0;
    let stamps = 0;
    const labels: string[] = [];

    const latteArtLevel = this.getLevel("latte_art");
    if (latteArtLevel > 0 && promptLength >= 6) {
      const bonus = Math.round(8 * promptLength * (latteArtMultiplier(latteArtLevel) - 1));
      money += bonus;
      labels.push(`Latte Art +$${bonus}`);
      if (latteArtLevel >= 5) {
        stamps += 1;
        labels.push("Latte Stamp +1");
      }
    }

    const perfectPourLevel = this.getLevel("perfect_pour");
    if (perfectPourLevel > 0 && promptWasPerfect) {
      const bonus = perfectPourBonus(perfectPourLevel);
      money += bonus;
      labels.push(`Perfect Pour +$${bonus}`);
    }

    return { money, stamps, labels };
  }

  applyComboBonuses(combo: number): { money: number; labels: string[] } {
    const tipJarLevel = this.getLevel("tip_jar");
    if (tipJarLevel > 0 && combo > 0 && combo % 3 === 0) {
      const bonus = tipJarBonus(tipJarLevel);
      return { money: bonus, labels: [`Tip Jar +$${bonus}`] };
    }

    return { money: 0, labels: [] };
  }

  applyCheckoutBonuses(ctx: CheckoutContext, baseLastCallMultiplier: number): CheckoutResult {
    let money = ctx.baseValue;
    const bonusLabels: string[] = [];

    const goldenRegisterLevel = this.getLevel("golden_register");
    if (goldenRegisterLevel > 0) {
      const multiplier = goldenRegisterMultiplier(goldenRegisterLevel);
      money *= multiplier;
      bonusLabels.push(`Golden Register x${multiplier}`);
    }

    if (ctx.isLastCall) {
      money *= baseLastCallMultiplier;
      bonusLabels.push(`Last Call x${baseLastCallMultiplier}`);

      const closingBellLevel = this.getLevel("closing_bell");
      if (closingBellLevel > 0) {
        const multiplier = closingBellMultiplier(closingBellLevel);
        money *= multiplier;
        bonusLabels.push(`Closing Bell x${multiplier}`);
      }
    }

    let stampsEarned = 1;
    if (ctx.promptWasPerfect) stampsEarned += 1;
    if (ctx.combo > 0 && ctx.combo % 10 === 0) {
      stampsEarned += 2;
      bonusLabels.push("Combo Stamps +2");
    }
    if (ctx.isLastCall) stampsEarned += 1;
    if (ctx.isLastCall && this.getLevel("closing_bell") >= 5) stampsEarned += 3;

    return {
      moneyEarned: Math.round(money),
      stampsEarned,
      bonusLabels,
    };
  }

  shouldSpawnBonusCustomer(): boolean {
    const level = this.getLevel("rush_bell");
    return level > 0 && Math.random() < rushBellChance(level);
  }

  shouldAddStampCardBonus(checkouts: number): boolean {
    const level = this.getLevel("stamp_card");
    const every = stampCardEvery(level);
    return level > 0 && Number.isFinite(every) && checkouts > 0 && checkouts % every === 0;
  }

  stampCardStartingBonus(): number {
    return this.getLevel("stamp_card") >= 5 ? 1 : 0;
  }

  canBlockTypo(nowMs: number): boolean {
    const level = this.getLevel("combo_foam");
    if (level <= 0) return false;

    const cooldownMs = comboFoamCooldown(level) * 1000;
    if (nowMs - this.lastFoamRefreshMs < cooldownMs) return false;

    this.lastFoamRefreshMs = nowMs;
    return true;
  }

  refreshComboFoamOnBox(nowMs: number): void {
    if (this.getLevel("combo_foam") >= 5) {
      this.lastFoamRefreshMs = -Infinity;
    }
  }
}
