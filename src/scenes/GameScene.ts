import Phaser from "phaser";
import { type Customer, nextStage, stageLabel } from "../game/Customer";
import { DIFFICULTIES, type DifficultyConfig, type DifficultyId } from "../game/Difficulty";
import { createRunEconomyStats, type RunEconomyStats } from "../game/economy/RunEconomy";
import { LastCallManager } from "../game/lastcall/LastCallManager";
import { PromptSpawner } from "../game/PromptSpawner";
import { getRewardDefinition } from "../game/rewards/RewardCatalog";
import { RewardManager } from "../game/rewards/RewardManager";
import { RushBoxManager } from "../game/rewards/RushBoxManager";
import type { RewardId } from "../game/rewards/RewardTypes";
import { JuiceManager } from "../juice/JuiceManager";
import {
  applyPromptScore,
  applyTypo,
  applyUnhappyCustomer,
  calculateResults,
  createScoreState,
  type ScoreState,
} from "../game/Scoring";
import { TypingEngine } from "../game/TypingEngine";
import { floatingMoneyText } from "../ui/FloatingMoneyText";
import { ComboDisplay } from "../ui/ComboDisplay";
import { ItemShelfView } from "../ui/ItemShelfView";
import { LastCallView } from "../ui/LastCallView";
import { LAYERS } from "../ui/Layers";
import { MoneyDisplay } from "../ui/MoneyDisplay";
import { ReceiptLane } from "../ui/ReceiptLane";
import { RushBoxOverlay } from "../ui/RushBoxOverlay";
import { StampCardView } from "../ui/StampCardView";
import { COLORS, FONT } from "../ui/Theme";

type GameData = {
  difficulty?: DifficultyId;
};

type CustomerView = {
  body: Phaser.GameObjects.Rectangle;
  face: Phaser.GameObjects.Text;
  promptBubble: Phaser.GameObjects.Rectangle;
  promptProgressBack: Phaser.GameObjects.Rectangle;
  promptProgressFill: Phaser.GameObjects.Rectangle;
  promptText: Phaser.GameObjects.Text;
  typedText: Phaser.GameObjects.Text;
  remainingText: Phaser.GameObjects.Text;
  stageText: Phaser.GameObjects.Text;
  patienceBack: Phaser.GameObjects.Rectangle;
  patienceFill: Phaser.GameObjects.Rectangle;
};

export class GameScene extends Phaser.Scene {
  private difficulty!: DifficultyConfig;
  private readonly customers: Customer[] = [];
  private readonly views = new Map<number, CustomerView>();
  private readonly typing = new TypingEngine();
  private readonly spawner = new PromptSpawner();
  private readonly score: ScoreState = createScoreState();
  private readonly rewards = new RewardManager();
  private readonly rushBoxes = new RushBoxManager();
  private economy: RunEconomyStats = createRunEconomyStats();
  private lastCall!: LastCallManager;
  private nextCustomerId = 1;
  private elapsedMs = 0;
  private spawnElapsedMs = 0;
  private lastFeedbackMs = 0;
  private isOpeningBox = false;
  private rushBoxOverlay: RushBoxOverlay | null = null;
  private activePromptHadTypo = false;
  private currentCustomerPerfect = new Map<number, boolean>();
  private juice!: JuiceManager;
  private typoGhost = false;
  private lastComboMilestone = 0;
  private inputCooldownUntil = 0;

  private timerText!: Phaser.GameObjects.Text;
  private moneyDisplay!: MoneyDisplay;
  private comboDisplay!: ComboDisplay;
  private stampCardView!: StampCardView;
  private itemShelfView!: ItemShelfView;
  private lastCallView!: LastCallView;
  private receiptLane!: ReceiptLane;
  private inputText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private rewardToast: Phaser.GameObjects.Container | null = null;

  constructor() {
    super("GameScene");
  }

  init(data: GameData): void {
    this.difficulty = DIFFICULTIES[data.difficulty ?? "normal"];
    this.customers.length = 0;
    this.views.clear();
    this.typing.resetInput();
    this.spawner.reset();
    Object.assign(this.score, createScoreState());
    this.rewards.reset();
    this.rushBoxes.reset();
    this.economy = createRunEconomyStats();
    this.lastCall = new LastCallManager(this.difficulty.lastCallSeconds, this.difficulty.overtimeCapSeconds);
    this.nextCustomerId = 1;
    this.elapsedMs = 0;
    this.spawnElapsedMs = 0;
    this.lastFeedbackMs = 0;
    this.isOpeningBox = false;
    this.rushBoxOverlay = null;
    this.activePromptHadTypo = false;
    this.typoGhost = false;
    this.lastComboMilestone = 0;
    this.inputCooldownUntil = 0;
    this.currentCustomerPerfect.clear();
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.cream);
    this.juice = new JuiceManager(this);
    this.drawCafe();
    this.createHud();
    this.spawnCustomer();

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      this.handleTyping(event);
    });
  }

  update(_time: number, delta: number): void {
    if (this.isOpeningBox) return;

    this.elapsedMs += delta;
    this.spawnElapsedMs += delta;

    if (this.elapsedMs >= this.difficulty.sessionSeconds * 1000) {
      this.finishShift();
      return;
    }

    const remaining = this.remainingSeconds();
    if (this.lastCall.update(remaining)) {
      this.juice.lastCall();
      this.lastCallView.start();
      this.showPayoff("LAST CALL!", 126, 166, COLORS.berry);
    }

    if (
      this.customers.length < this.currentMaxCustomers() &&
      this.spawnElapsedMs >= this.difficulty.spawnEveryMs * this.lastCall.getSpawnRateMultiplier()
    ) {
      this.spawnCustomer();
      this.spawnElapsedMs = 0;
    }

    this.customers.forEach((customer) => {
      customer.patience -= (delta / 1000) * this.lastCall.getPatienceDecayMultiplier();
      if (customer.patience <= 0) {
        this.removeCustomer(customer.id, false);
      }
    });

    this.updateViews();
    this.updateHud();
  }

  private drawCafe(): void {
    this.add.rectangle(480, 320, 900, 590, 0xfffaf1, 1).setStrokeStyle(4, 0x8a5a3d);
    this.add.rectangle(480, 124, 760, 70, 0xf1dfc2, 0.58).setStrokeStyle(2, 0xd8c4a5, 0.5);
    this.add.rectangle(480, 522, 760, 92, 0xd8a35d, 1).setStrokeStyle(4, 0x8a5a3d);
    this.add.rectangle(480, 550, 690, 36, 0x8a5a3d, 1);
    this.add.text(480, 518, "counter", {
      fontFamily: FONT,
      fontSize: "18px",
      color: "#fffaf1",
    }).setOrigin(0.5);

    this.add.circle(180, 136, 34, 0xe5a940, 0.36);
    this.add.circle(810, 142, 22, 0x5ea787, 0.28);
  }

  private createHud(): void {
    this.add.rectangle(480, 54, 860, 64, 0xf1dfc2, 1).setStrokeStyle(2, 0x8a5a3d);

    this.timerText = this.hudText(78, 54, "90s", 30).setDepth(LAYERS.hud) as Phaser.GameObjects.Text;
    this.moneyDisplay = new MoneyDisplay(this, 238, 54);
    this.comboDisplay = new ComboDisplay(this, 420, 54);
    this.stampCardView = new StampCardView(this, 690, 54);
    this.itemShelfView = new ItemShelfView(this, 830, 428);
    this.itemShelfView.update([]);
    this.lastCallView = new LastCallView(this);
    this.receiptLane = new ReceiptLane(this, 798, 302);

    this.add.rectangle(480, 604, 370, 34, 0xf1dfc2, 0.84).setStrokeStyle(2, 0x8a5a3d);
    this.inputText = this.add.text(480, 604, "Input: ", {
      fontFamily: FONT,
      fontSize: "18px",
      fontStyle: "700",
      color: COLORS.ink,
    }).setOrigin(0.5);
    this.inputText.setDepth(LAYERS.hud);

    this.feedbackText = this.add.text(480, 458, "", {
      fontFamily: FONT,
      fontSize: "22px",
      fontStyle: "700",
      color: COLORS.berry,
    }).setOrigin(0.5).setDepth(LAYERS.hudJuice);
  }

  private hudText(x: number, y: number, text: string, size: number): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: "700",
      color: COLORS.ink,
    }).setOrigin(0, 0.5);
  }

  private handleTyping(event: KeyboardEvent): void {
    const key = event.key;
    const isTypingKey = key === "Escape" || key === "Backspace" || /^[a-zA-Z]$/.test(key);
    const isRushBoxKey = /^[123]$/.test(key);

    if (this.isOpeningBox) {
      if (isRushBoxKey) event.preventDefault();
      return;
    }

    if (!isTypingKey) return;

    event.preventDefault();
    this.juice.unlockAudio();

    if (/^[a-zA-Z]$/.test(key) && this.time.now < this.inputCooldownUntil) return;

    if (key === "Backspace" && this.typoGhost) {
      this.typoGhost = false;
      this.showFeedback("");
      this.updateHud();
      this.updateViews();
      return;
    }

    const result = this.typing.handleKey(key, this.customers);

    if (result.type === "ignored") return;

    if (result.type === "typed") {
      if (this.isOpeningBox) return;
      this.score.totalKeystrokes += 1;

      if (!result.correct) {
        const forgivingMiss =
          this.typing.activeTargetId === null &&
          this.typing.currentInput === "";
        if (forgivingMiss) {
          this.typoGhost = true;
          this.showFeedback(`no order starts with ${key.toLowerCase()}`);
          this.juice.typo(this.inputText, 480, 604);
          this.updateHud();
          return;
        }
        if (this.rewards.canBlockTypo(this.elapsedMs)) {
          this.showPayoff("foam shield!", 480, 454, COLORS.blue);
          this.juice.flash(this.inputText);
          this.updateHud();
          return;
        }
        applyTypo(this.score);
        this.typoGhost = true;
        this.activePromptHadTypo = true;
        this.nudgeTargetPatience();
        this.showFeedback("typo");
        const targetView =
          this.typing.activeTargetId === null ? null : this.views.get(this.typing.activeTargetId);
        this.juice.typo(targetView?.body ?? this.inputText, targetView?.body.x ?? 480, targetView?.body.y ?? 604);
      } else {
        this.typoGhost = false;
        this.score.correctKeystrokes += 1;
        this.showFeedback("");
        this.juice.correctKey(this.inputText);
      }

      if (result.completed && result.targetId !== null) {
        this.completePrompt(result.targetId);
      }
    }

    this.updateHud();
    this.updateViews();
  }

  private completePrompt(customerId: number): void {
    const customer = this.customers.find((item) => item.id === customerId);
    if (!customer) return;

    const wasCheckout = customer.stage === "checkout";
    const promptLength = customer.prompt.length;
    const promptWasPerfect = !this.activePromptHadTypo;
    const view = this.views.get(customer.id);
    if (view) this.juice.promptComplete(customer.x, customer.y + 34, [view.body, view.face]);
    this.inputCooldownUntil = this.time.now + 35;

    applyPromptScore(this.score, promptLength);
    this.maybeCelebrateCombo();
    this.applyPromptRewards(customer, promptLength, promptWasPerfect);
    if (!this.currentCustomerPerfect.has(customer.id)) this.currentCustomerPerfect.set(customer.id, true);
    if (!promptWasPerfect) this.currentCustomerPerfect.set(customer.id, false);

    const next = nextStage(customer.stage);
    if (!next) {
      this.checkoutCustomer(customer, promptWasPerfect);
      this.removeCustomer(customer.id, true);
      this.typing.resetInput();
      this.activePromptHadTypo = false;
      this.time.delayedCall(440, () => this.maybeOpenRushBox());
      this.ensureCustomerAvailable();
      return;
    }

    const prompt = this.spawner.advancePrompt(next, this.customers, customer.id);
    if (!prompt) {
      this.showFeedback("busy first letters");
      this.typing.resetInput();
      return;
    }

    customer.stage = next;
    customer.prompt = prompt;
    customer.mood = "happy";
    customer.patience = Math.min(customer.maxPatience, customer.patience + 2.2);

    this.time.delayedCall(300, () => {
      customer.mood = "waiting";
      this.updateViews();
    });

    this.typing.resetInput();
    this.activePromptHadTypo = false;
    this.maybeOpenRushBox();
  }

  private spawnCustomer(options: { bonus?: boolean } = {}): boolean {
    const maxCustomers = options.bonus ? this.difficulty.maxCustomers + 1 : this.currentMaxCustomers();
    if (this.customers.length >= maxCustomers) return false;

    const slots = [
      { x: 220, y: 278 },
      { x: 480, y: 262 },
      { x: 740, y: 278 },
      { x: 350, y: 292 },
      { x: 610, y: 292 },
    ];
    const used = new Set(this.customers.map((customer) => customer.x));
    const slot = slots.find((item) => !used.has(item.x)) ?? slots[this.customers.length % slots.length];
    const customer = this.spawner.createCustomer(
      this.nextCustomerId++,
      this.difficulty,
      this.customers,
      slot.x,
      slot.y,
    );

    if (!customer) return false;

    this.customers.push(customer);
    this.currentCustomerPerfect.set(customer.id, true);
    this.createCustomerView(customer);
    if (options.bonus) this.showPayoff("rush bell!", customer.x, customer.y - 112, COLORS.gold);
    return true;
  }

  private createCustomerView(customer: Customer): void {
    const body = this.add
      .rectangle(customer.x, customer.y + 52, 96, 104, this.customerColor(customer.id), 16)
      .setStrokeStyle(3, 0x5d3927)
      .setDepth(LAYERS.customers);
    const face = this.add.text(customer.x, customer.y + 36, "☕", {
      fontFamily: FONT,
      fontSize: "38px",
    }).setOrigin(0.5).setDepth(LAYERS.customers + 1);
    const promptBubble = this.add
      .rectangle(customer.x, customer.y - 52, 178, 54, 0xffffff, 1)
      .setStrokeStyle(3, 0x8a5a3d)
      .setDepth(LAYERS.promptBubble);
    const promptProgressBack = this.add.rectangle(customer.x, customer.y - 27, 142, 6, 0xf1dfc2, 1).setDepth(LAYERS.promptBubble + 1);
    const promptProgressFill = this.add
      .rectangle(customer.x - 71, customer.y - 27, 0, 6, 0xe5a940, 1)
      .setOrigin(0, 0.5)
      .setDepth(LAYERS.promptBubble + 2);
    const stageText = this.add.text(customer.x - 78, customer.y - 72, "", {
      fontFamily: FONT,
      fontSize: "13px",
      fontStyle: "700",
      color: COLORS.muted,
    }).setDepth(LAYERS.promptText);
    const promptText = this.add.text(customer.x, customer.y - 52, "", {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: COLORS.ink,
    }).setOrigin(0.5).setDepth(LAYERS.promptText);
    const typedText = this.add.text(customer.x, customer.y - 52, "", {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: COLORS.gold,
    }).setOrigin(0, 0.5).setDepth(LAYERS.promptText);
    const remainingText = this.add.text(customer.x, customer.y - 52, "", {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: COLORS.ink,
    }).setOrigin(0, 0.5).setDepth(LAYERS.promptText);
    const patienceBack = this.add.rectangle(customer.x, customer.y + 128, 118, 12, 0xd8c4a5, 1).setDepth(LAYERS.customers);
    const patienceFill = this.add.rectangle(customer.x - 59, customer.y + 128, 118, 12, 0x5ea787, 1).setOrigin(0, 0.5).setDepth(LAYERS.customers + 1);

    this.views.set(customer.id, {
      body,
      face,
      promptBubble,
      promptProgressBack,
      promptProgressFill,
      promptText,
      typedText,
      remainingText,
      stageText,
      patienceBack,
      patienceFill,
    });
  }

  private updateViews(): void {
    this.customers.forEach((customer) => {
      const view = this.views.get(customer.id);
      if (!view) return;

      const isTarget = this.typing.activeTargetId === customer.id;
      const input = isTarget ? this.typing.currentInput : "";
      const remaining = customer.prompt.slice(input.length);
      const progress = Phaser.Math.Clamp(customer.patience / customer.maxPatience, 0, 1);
      const typedProgress = customer.prompt.length === 0 ? 0 : input.length / customer.prompt.length;

      view.promptText.setText(input ? `${input}${remaining}` : customer.prompt);
      view.promptText.setVisible(!isTarget);
      view.promptText.setColor(COLORS.ink);
      view.typedText.setVisible(isTarget);
      view.remainingText.setVisible(isTarget);
      view.typedText.setText(input);
      view.remainingText.setText(remaining);
      view.typedText.setColor(COLORS.gold);
      view.remainingText.setColor(input ? COLORS.muted : COLORS.ink);
      const totalPromptWidth = view.typedText.width + view.remainingText.width;
      view.typedText.setPosition(customer.x - totalPromptWidth / 2, customer.y - 52);
      view.remainingText.setPosition(view.typedText.x + view.typedText.width, customer.y - 52);
      view.promptBubble.setStrokeStyle(isTarget ? 5 : 3, isTarget ? 0xe5a940 : 0x8a5a3d);
      view.promptBubble.setFillStyle(isTarget ? 0xfff4cf : 0xffffff, 1);
      view.promptProgressFill.width = 142 * typedProgress;
      view.promptProgressFill.setFillStyle(isTarget ? 0xe5a940 : 0xd8c4a5, isTarget ? 1 : 0.7);
      view.promptProgressBack.setAlpha(isTarget ? 1 : 0.7);
      view.stageText.setText(stageLabel(customer.stage).toUpperCase());
      view.patienceFill.width = 118 * progress;
      view.patienceFill.setFillStyle(progress < 0.32 ? 0xc8666f : progress < 0.62 ? 0xe5a940 : 0x5ea787);
      view.face.setText(customer.mood === "happy" ? "✨" : customer.mood === "upset" || progress < 0.22 ? "!" : "☕");
      view.body.setScale(isTarget ? 1.04 : 1);
    });
  }

  private updateHud(): void {
    const remaining = Math.max(0, Math.ceil(this.remainingSeconds()));
    this.timerText.setColor(this.lastCall.isActive() ? COLORS.berry : COLORS.ink);
    this.timerText.setScale(this.lastCall.isActive() ? 1.16 : 1);
    this.timerText.setText(`${remaining}s`);
    this.moneyDisplay.setValue(this.score.income);
    this.comboDisplay.setCombo(this.score.combo);
    this.stampCardView.update(this.rushBoxes.currentStampCount(), this.rushBoxes.currentThreshold());
    this.lastCallView.setOvertime(this.economy.overtimeSecondsEarned);
    this.inputText.setText(`Input: ${this.typing.currentInput}${this.typing.currentInput ? "_" : ""}`);

    if (this.feedbackText.text && this.elapsedMs - this.lastFeedbackMs > 420) {
      this.feedbackText.setText("");
    }
  }

  private nudgeTargetPatience(): void {
    const target =
      this.typing.activeTargetId === null
        ? null
        : this.customers.find((customer) => customer.id === this.typing.activeTargetId);

    if (target) {
      target.patience = Math.max(0, target.patience - this.difficulty.typoPatiencePenalty);
      return;
    }

    this.customers.forEach((customer) => {
      customer.patience = Math.max(0, customer.patience - this.difficulty.typoPatiencePenalty * 0.25);
    });
  }

  private removeCustomer(customerId: number, happy: boolean): void {
    const index = this.customers.findIndex((customer) => customer.id === customerId);
    if (index === -1) return;

    if (!happy) applyUnhappyCustomer(this.score, this.difficulty.unhappyPenalty);

    const view = this.views.get(customerId);
    if (view) {
      Object.values(view).forEach((item) => item.destroy());
      this.views.delete(customerId);
    }

    this.customers.splice(index, 1);
    this.currentCustomerPerfect.delete(customerId);
    if (this.typing.activeTargetId === customerId) this.typing.resetInput();
  }

  private finishShift(): void {
    const results = calculateResults(this.score, this.difficulty.sessionSeconds);
    this.input.keyboard?.removeAllListeners();
    this.scene.start("ResultsScene", {
      difficulty: this.difficulty.id,
      results,
      ownedRewards: this.rewards.getOwnedRewards(),
      economy: {
        ...this.economy,
        rushBoxesOpened: this.rushBoxes.openedCount(),
      },
    });
  }

  private showFeedback(text: string): void {
    this.feedbackText.setText(text);
    this.lastFeedbackMs = this.elapsedMs;
  }

  private customerColor(id: number): number {
    const colors = [0x9cc8b6, 0xe7b2a5, 0xf1d486, 0xaac1e8, 0xd9c3e6];
    return colors[id % colors.length];
  }

  private maybeOpenRushBox(): void {
    if (this.isOpeningBox || !this.rushBoxes.hasPendingBox()) return;
    if (this.elapsedMs >= this.difficulty.sessionSeconds * 1000) return;

    const options = this.rewards.getChoiceOptions(3);
    if (options.length === 0) return;

    this.isOpeningBox = true;
    this.typing.resetInput();
    this.juice.rushBoxOpen();
    this.rushBoxOverlay = new RushBoxOverlay(this, options, {
      levelFor: (id) => this.rewards.getLevel(id),
      onChoose: (id) => this.chooseRushBoxReward(id),
      quick: this.rushBoxes.openedCount() >= 2 || this.rushBoxes.pendingCount() > 1,
    });
    this.updateHud();
  }

  private chooseRushBoxReward(id: RewardId): void {
    const nextLevel = this.rewards.addReward(id);
    const reward = getRewardDefinition(id);
    const reachedMax = nextLevel >= reward.maxLevel;
    this.rushBoxOverlay?.destroy();
    this.rushBoxOverlay = null;
    this.isOpeningBox = false;
    this.typing.resetInput();
    this.rushBoxes.consumeBox(this.rewards.stampCardStartingBonus());
    this.rewards.refreshComboFoamOnBox(this.elapsedMs);
    this.itemShelfView.update(this.rewards.getOwnedRewards());
    this.itemShelfView.pulse();
    if (reachedMax) this.juice.rewardMaxed(this.itemShelfView.container);
    else this.juice.rewardSelected(this.itemShelfView.container);
    this.showRewardLevelUpToast(id, nextLevel, reachedMax);
    this.economy.rushBoxesOpened = this.rushBoxes.openedCount();
    this.ensureCustomerAvailable();
    this.updateHud();
    this.updateViews();
    if (this.elapsedMs >= this.difficulty.sessionSeconds * 1000) {
      this.finishShift();
      return;
    }
    if (this.rushBoxes.hasPendingBox()) {
      this.time.delayedCall(this.rushBoxes.openedCount() >= 2 ? 120 : 320, () => this.maybeOpenRushBox());
    }
  }

  private applyPromptRewards(customer: Customer, promptLength: number, promptWasPerfect: boolean): void {
    const prompt = this.rewards.applyPromptBonuses(promptLength, promptWasPerfect);
    if (prompt.money > 0) this.addCashBonus(prompt.money, customer.x, customer.y - 118, prompt.labels[0] ?? "bonus");
    if (prompt.stamps > 0) {
      this.addStamps(prompt.stamps, customer.x, customer.y - 144, `+${prompt.stamps} stamp`);
    }

    const combo = this.rewards.applyComboBonuses(this.score.combo);
    if (combo.money > 0) this.addCashBonus(combo.money, customer.x, customer.y - 142, combo.labels[0] ?? "combo");
  }

  private checkoutCustomer(customer: Customer, promptWasPerfect: boolean): void {
    const customerPerfect = this.currentCustomerPerfect.get(customer.id) ?? promptWasPerfect;
    const baseValue = 30 + Math.min(this.score.combo * 2, 40);
    const checkout = this.rewards.applyCheckoutBonuses(
      {
        baseValue,
        isLastCall: this.lastCall.isActive(),
        combo: this.score.combo,
        promptWasPerfect: customerPerfect,
        longestPromptLengthForCustomer: customer.prompt.length,
      },
      this.lastCall.getTipMultiplier(),
    );
    const previousBiggest = this.economy.biggestCheckout;

    this.score.happyCustomers += 1;
    this.score.income += checkout.moneyEarned;
    this.score.score += checkout.moneyEarned;
    this.economy.biggestCheckout = Math.max(this.economy.biggestCheckout, checkout.moneyEarned);
    const isBiggest = checkout.moneyEarned > previousBiggest && previousBiggest > 0;
    const view = this.views.get(customer.id);
    this.juice.checkoutAtCustomer(
      customer.x,
      customer.y + 44,
      checkout.moneyEarned,
      isBiggest,
      this.lastCall.isActive(),
      view ? [view.body, view.face] : undefined,
    );
    this.time.delayedCall(190, () => {
      this.moneyDisplay.pulse();
      this.comboDisplay.pulse();
    });
    this.time.delayedCall(240, () => {
      this.receiptLane.show({
        amount: checkout.moneyEarned,
        baseValue,
        labels: checkout.bonusLabels,
        biggest: isBiggest,
        lastCall: this.lastCall.isActive(),
      });
      if (checkout.bonusLabels.length > 0) this.itemShelfView.pulse();
    });

    if (this.lastCall.isActive()) {
      this.economy.lastCallCheckouts += 1;
      const overtime = this.lastCall.onCheckout();
      this.elapsedMs -= overtime * 1000;
      this.economy.overtimeSecondsEarned += overtime;
      if (overtime > 0) {
        this.juice.overtime(126, 142);
        this.showPayoff(`+${overtime.toFixed(0)}s`, 126, 168, COLORS.berry, LAYERS.hudJuice);
      }
    }

    this.addStamps(checkout.stampsEarned, customer.x, customer.y - 168, `+${checkout.stampsEarned} stamps`);
    if (this.rewards.shouldAddStampCardBonus(this.score.happyCustomers)) {
      this.addStamps(1, customer.x, customer.y - 190, "+1 stamp card");
    }

    if (this.rewards.shouldSpawnBonusCustomer()) {
      this.spawnCustomer({ bonus: true });
    }
    if (isBiggest) {
      this.cameras.main.shake(110, 0.004);
    }
  }

  private addCashBonus(amount: number, x: number, y: number, label: string): void {
    this.score.income += amount;
    this.score.score += amount;
    this.moneyDisplay.setValue(this.score.income);
    this.moneyDisplay.pulse();
    this.showPayoff(`${label} +$${amount}`, x, y, COLORS.gold);
  }

  private addStamps(amount: number, x: number, y: number, label: string): void {
    if (amount <= 0) return;

    const hadPendingBox = this.rushBoxes.hasPendingBox();
    this.rushBoxes.addStamps(amount);
    this.stampCardView.update(this.rushBoxes.currentStampCount(), this.rushBoxes.currentThreshold());
    const stampPosition = this.stampCardView.playStampGain();
    const filledBox = !hadPendingBox && this.rushBoxes.hasPendingBox();
    this.juice.stamp(stampPosition.x, stampPosition.y, filledBox);
    if (filledBox) {
      this.stampCardView.playFull();
      this.showPayoff("BOX READY!", stampPosition.x, stampPosition.y - 30, COLORS.gold, LAYERS.hudJuice);
    }
    this.showPayoff(label, stampPosition.x, stampPosition.y + 30, COLORS.gold);
  }

  private showPayoff(text: string, x: number, y: number, color: string, depth: number = LAYERS.floatingPayoff): void {
    floatingMoneyText(this, x, y, text, color, depth);
  }

  private remainingSeconds(): number {
    return Math.max(0, this.difficulty.sessionSeconds - this.elapsedMs / 1000);
  }

  private currentMaxCustomers(): number {
    if (this.difficulty.id === "easy" && this.score.happyCustomers === 0) return 1;
    return this.difficulty.maxCustomers;
  }

  private maybeCelebrateCombo(): void {
    const milestone = this.score.combo >= 100 ? 100 : this.score.combo >= 50 ? 50 : this.score.combo >= 25 ? 25 : 0;
    if (milestone <= this.lastComboMilestone) return;

    this.lastComboMilestone = milestone;
    this.cameras.main.flash(120, 229, 169, 64, false);
    this.showPayoff(`COMBO x${milestone}!`, 480, 424, COLORS.gold, LAYERS.hudJuice);
    this.comboDisplay.pulse();
  }

  private showRewardLevelUpToast(id: RewardId, level: number, reachedMax: boolean): void {
    this.rewardToast?.destroy(true);

    const reward = getRewardDefinition(id);
    const panelColor = reachedMax ? 0xe5a940 : 0xfffaf1;
    const titleColor = reachedMax ? "#fffaf1" : COLORS.gold;
    const panel = this.add.rectangle(0, 0, 360, reachedMax ? 112 : 96, panelColor, 0.96).setStrokeStyle(4, 0x8a5a3d);
    const title = this.add.text(0, reachedMax ? -28 : -22, `${reward.name.toUpperCase()} LV.${level}!`, {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: titleColor,
      stroke: reachedMax ? COLORS.coffeeDark : "#fffaf1",
      strokeThickness: reachedMax ? 5 : 3,
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, reachedMax ? 12 : 18, reachedMax ? "MAXED - RUN EVOLVED" : reward.shortDescription(level), {
      fontFamily: FONT,
      fontSize: reachedMax ? "18px" : "16px",
      fontStyle: "700",
      color: reachedMax ? COLORS.coffeeDark : COLORS.ink,
      align: "center",
      wordWrap: { width: 304 },
    }).setOrigin(0.5);

    this.rewardToast = this.add.container(480, 404, [panel, title, subtitle]).setDepth(LAYERS.hudJuice).setScale(0.86).setAlpha(0);
    this.tweens.add({
      targets: this.rewardToast,
      alpha: 1,
      scale: 1,
      duration: 160,
      ease: "Back.easeOut",
    });
    this.tweens.add({
      targets: this.rewardToast,
      alpha: 0,
      y: 378,
      delay: reachedMax ? 1200 : 900,
      duration: 260,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.rewardToast?.destroy(true);
        this.rewardToast = null;
      },
    });
  }

  private ensureCustomerAvailable(): void {
    if (!this.isOpeningBox && this.customers.length === 0) {
      this.spawnCustomer();
      this.spawnElapsedMs = 0;
    }
  }
}
