import { StampMeter } from "./StampMeter";

const THRESHOLDS = [2, 6, 9, 12, 15];

export class RushBoxManager {
  readonly stampMeter = new StampMeter();
  private boxesOpened = 0;
  private pendingBoxes = 0;

  addStamps(amount: number): void {
    this.stampMeter.add(amount);
    while (this.stampMeter.value() >= this.currentThreshold()) {
      this.stampMeter.spend(this.currentThreshold());
      this.pendingBoxes += 1;
    }
  }

  hasPendingBox(): boolean {
    return this.pendingBoxes > 0;
  }

  pendingCount(): number {
    return this.pendingBoxes;
  }

  consumeBox(startingStamps = 0): void {
    if (this.pendingBoxes <= 0) return;
    this.pendingBoxes -= 1;
    this.boxesOpened += 1;
    if (startingStamps > 0) this.addStamps(startingStamps);
  }

  currentStampCount(): number {
    return this.stampMeter.value();
  }

  currentThreshold(): number {
    return THRESHOLDS[this.boxesOpened] ?? 12;
  }

  openedCount(): number {
    return this.boxesOpened;
  }

  reset(): void {
    this.stampMeter.reset();
    this.boxesOpened = 0;
    this.pendingBoxes = 0;
  }
}
