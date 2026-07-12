export type ChatStage =
  | "ingredients"
  | "confirm-ingredients"
  | "dietary-preferences"
  | "servings"
  | "cooking-time"
  | "final-confirmation"
  | "ready";

export type IngredientChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type IngredientChatResponse = {
  reply: string;
  stage: ChatStage;
  ingredients: string[];
  dietaryPreferences: string[];
  servings: number;
  maximumCookingTime: number;
  readyToGenerate: boolean;
};

export class IngredientChatError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "IngredientChatError";
    this.status = status;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

export async function sendIngredientMessage(
  messages: IngredientChatMessage[],
): Promise<IngredientChatResponse> {
  const response = await fetch("/api/ingredients/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new IngredientChatError(
      result.message ??
        "We could not continue the cooking conversation.",
      response.status,
    );
  }

  return result;
}