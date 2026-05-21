import type { Customer } from "./Customer";

export type TypingEvent =
  | { type: "ignored" }
  | { type: "typed"; input: string; targetId: number | null; correct: boolean; completed: boolean }
  | { type: "backspace"; input: string; targetId: number | null }
  | { type: "reset"; input: string; targetId: null };

export class TypingEngine {
  currentInput = "";
  activeTargetId: number | null = null;

  handleKey(key: string, customers: Customer[]): TypingEvent {
    if (key === "Escape") {
      this.resetInput();
      return { type: "reset", input: this.currentInput, targetId: null };
    }

    if (key === "Backspace") {
      this.currentInput = this.currentInput.slice(0, -1);
      if (!this.currentInput) this.activeTargetId = null;
      return { type: "backspace", input: this.currentInput, targetId: this.activeTargetId };
    }

    if (key.length !== 1 || !/^[a-zA-Z]$/.test(key)) {
      return { type: "ignored" };
    }

    const nextInput = `${this.currentInput}${key.toLowerCase()}`;
    const target = this.resolveTarget(nextInput, customers);

    if (!target || !target.prompt.startsWith(nextInput)) {
      return {
        type: "typed",
        input: this.currentInput,
        targetId: this.activeTargetId,
        correct: false,
        completed: false,
      };
    }

    this.currentInput = nextInput;
    this.activeTargetId = target.id;

    return {
      type: "typed",
      input: this.currentInput,
      targetId: target.id,
      correct: true,
      completed: target.prompt === this.currentInput,
    };
  }

  resetInput(): void {
    this.currentInput = "";
    this.activeTargetId = null;
  }

  private resolveTarget(input: string, customers: Customer[]): Customer | null {
    if (this.activeTargetId !== null) {
      return customers.find((customer) => customer.id === this.activeTargetId) ?? null;
    }

    return customers.find((customer) => customer.prompt.startsWith(input)) ?? null;
  }
}
