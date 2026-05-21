export class LastCallManager {
  private active = false;
  private overtimeMs = 0;

  constructor(
    private readonly startsAtRemainingSec: number,
    private readonly baseOvertimeCapSec: number,
  ) {}

  update(timeRemainingSec: number): boolean {
    const wasActive = this.active;
    if (timeRemainingSec <= this.startsAtRemainingSec) this.active = true;
    return !wasActive && this.active;
  }

  isActive(): boolean {
    return this.active;
  }

  getTipMultiplier(): number {
    return this.active ? 2 : 1;
  }

  getPatienceDecayMultiplier(): number {
    return this.active ? 0.7 : 1;
  }

  getSpawnRateMultiplier(): number {
    return this.active ? 0.8 : 1;
  }

  onCheckout(): number {
    if (!this.active) return 0;
    const capMs = this.baseOvertimeCapSec * 1000;
    if (this.overtimeMs >= capMs) return 0;
    const addedMs = Math.min(1000, capMs - this.overtimeMs);
    this.overtimeMs += addedMs;
    return addedMs / 1000;
  }

  overtimeSeconds(): number {
    return this.overtimeMs / 1000;
  }

  reset(): void {
    this.active = false;
    this.overtimeMs = 0;
  }
}
