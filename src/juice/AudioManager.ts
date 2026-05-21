export class AudioManager {
  private context: AudioContext | null = null;
  private unlocked = false;

  unlock(): void {
    if (this.unlocked) return;

    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.context = this.context ?? new AudioContextClass();
    void this.context.resume();
    this.unlocked = true;
  }

  keyTick(): void {
    this.play(720, 0.025, "square", 0.025);
  }

  typo(): void {
    this.play(110, 0.08, "sawtooth", 0.08);
  }

  promptComplete(): void {
    this.play(540, 0.06, "triangle", 0.045);
    window.setTimeout(() => this.play(780, 0.055, "triangle", 0.04), 45);
  }

  register(): void {
    this.play(920, 0.08, "sine", 0.055);
    window.setTimeout(() => this.play(1240, 0.07, "sine", 0.04), 70);
  }

  stamp(): void {
    this.play(180, 0.07, "square", 0.06);
  }

  rushBox(): void {
    this.play(420, 0.09, "triangle", 0.05);
    window.setTimeout(() => this.play(640, 0.08, "triangle", 0.05), 90);
    window.setTimeout(() => this.play(900, 0.1, "triangle", 0.045), 180);
  }

  reward(): void {
    this.play(980, 0.09, "sine", 0.055);
  }

  lastCall(): void {
    this.play(300, 0.12, "triangle", 0.07);
    window.setTimeout(() => this.play(230, 0.16, "triangle", 0.065), 130);
  }

  private play(frequency: number, duration: number, type: OscillatorType, gainValue: number): void {
    if (!this.context || !this.unlocked) return;

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}
