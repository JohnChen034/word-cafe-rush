export class StampMeter {
  private stamps = 0;

  add(amount: number): void {
    this.stamps += amount;
  }

  spend(amount: number): void {
    this.stamps = Math.max(0, this.stamps - amount);
  }

  value(): number {
    return this.stamps;
  }

  reset(): void {
    this.stamps = 0;
  }
}
