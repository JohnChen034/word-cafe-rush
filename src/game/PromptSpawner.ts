import type { Customer } from "./Customer";
import type { DifficultyConfig } from "./Difficulty";
import { WORD_LISTS, type PromptCategory } from "./WordLists";

export class PromptSpawner {
  private readonly recentPrompts: string[] = [];
  private readonly recentLimit = 15;

  createCustomer(
    id: number,
    difficulty: DifficultyConfig,
    activeCustomers: Customer[],
    x: number,
    y: number,
  ): Customer | null {
    const prompt = this.pickPrompt("prepare", activeCustomers);
    if (!prompt) return null;

    return {
      id,
      stage: "prepare",
      prompt,
      patience: difficulty.patienceSeconds,
      maxPatience: difficulty.patienceSeconds,
      x,
      y,
      mood: "waiting",
    };
  }

  advancePrompt(stage: PromptCategory, activeCustomers: Customer[], currentCustomerId: number): string | null {
    const otherCustomers = activeCustomers.filter((customer) => customer.id !== currentCustomerId);
    return this.pickPrompt(stage, otherCustomers);
  }

  reset(): void {
    this.recentPrompts.length = 0;
  }

  private pickPrompt(category: PromptCategory, activeCustomers: Customer[]): string | null {
    const activeFirstLetters = new Set(
      activeCustomers.map((customer) => customer.prompt[0]?.toLowerCase()).filter(Boolean),
    );

    const candidates = WORD_LISTS[category].filter((word) => {
      const first = word[0]?.toLowerCase();
      return first && !activeFirstLetters.has(first) && !this.recentPrompts.includes(word);
    });

    const fallback = WORD_LISTS[category].filter((word) => {
      const first = word[0]?.toLowerCase();
      return first && !activeFirstLetters.has(first);
    });

    const pool = candidates.length > 0 ? candidates : fallback;
    if (pool.length === 0) return null;

    const word = pool[Math.floor(Math.random() * pool.length)];
    this.remember(word);
    return word;
  }

  private remember(word: string): void {
    this.recentPrompts.push(word);
    while (this.recentPrompts.length > this.recentLimit) {
      this.recentPrompts.shift();
    }
  }
}
