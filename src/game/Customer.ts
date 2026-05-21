import type { PromptCategory } from "./WordLists";

export type CustomerStage = PromptCategory;

export type Customer = {
  id: number;
  stage: CustomerStage;
  prompt: string;
  patience: number;
  maxPatience: number;
  x: number;
  y: number;
  mood: "waiting" | "happy" | "upset";
};

const STAGES: CustomerStage[] = ["prepare", "serve", "checkout"];

export function nextStage(stage: CustomerStage): CustomerStage | null {
  const index = STAGES.indexOf(stage);
  return STAGES[index + 1] ?? null;
}

export function stageLabel(stage: CustomerStage): string {
  if (stage === "prepare") return "Prep";
  if (stage === "serve") return "Serve";
  return "Pay";
}
