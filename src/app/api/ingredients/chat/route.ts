import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type IngredientChatRequest = {
  messages: ChatMessage[];
};

const chatResponseSchema = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description:
        "A short conversational reply or one follow-up question.",
    },

    stage: {
      type: "string",
      enum: [
        "ingredients",
        "confirm-ingredients",
        "dietary-preferences",
        "servings",
        "cooking-time",
        "final-confirmation",
        "ready",
      ],
    },

    ingredients: {
      type: "array",
      items: {
        type: "string",
      },
    },

    dietaryPreferences: {
      type: "array",
      items: {
        type: "string",
      },
    },

    servings: {
      type: "integer",
      description:
        "The requested servings, or 0 if the user has not provided it yet.",
    },

    maximumCookingTime: {
      type: "integer",
      description:
        "Maximum cooking time in minutes, or 0 if not provided yet.",
    },

    readyToGenerate: {
      type: "boolean",
    },
  },

  required: [
    "reply",
    "stage",
    "ingredients",
    "dietaryPreferences",
    "servings",
    "maximumCookingTime",
    "readyToGenerate",
  ],
};

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: "Gemini API key is missing." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as IngredientChatRequest;

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { message: "At least one conversation message is required." },
        { status: 400 },
      );
    }

    const conversation = body.messages
      .map(
        (message) =>
          `${message.role === "user" ? "User" : "KitchenAid"}: ${
            message.content
          }`,
      )
      .join("\n");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are KitchenAid, a friendly conversational sous-chef.

You must gather all information needed to generate personalized recipes.

CURRENT CONVERSATION:
${conversation}

Follow this sequence:

1. INGREDIENTS
Ask the user what ingredients they currently have.
Extract every ingredient they clearly mention.

2. CONFIRM INGREDIENTS
Ask whether the ingredient list is complete.
Do not move to dietary preferences until the user confirms they are done
or clearly says there are no more ingredients.

3. DIETARY PREFERENCES
Ask about dietary restrictions, allergies, or preferences.
Examples include vegetarian, vegan, halal, gluten-free, dairy-free,
peanut allergy, or no restrictions.

If the user says none, return an empty dietaryPreferences array.

4. SERVINGS
Ask how many people the meal should serve.
Servings must be a positive whole number.

5. COOKING TIME
Ask for the maximum cooking time in minutes.

6. FINAL CONFIRMATION
Summarize:
- ingredients
- dietary preferences or restrictions
- servings
- maximum cooking time

Ask the user to confirm that the summary is correct.

7. READY
Only after the user clearly confirms the final summary:
- set stage to "ready"
- set readyToGenerate to true
- tell the user you are creating three meal options

Important rules:

- Ask only one clear question at a time.
- Keep replies short and natural because ElevenLabs reads them aloud.
- Preserve all previously collected information.
- Never invent ingredients or preferences.
- Let the user correct information at any point.
- Do not generate recipes inside this route.
- Do not move to the next stage before the current answer is collected.
- Return servings as 0 until supplied.
- Return maximumCookingTime as 0 until supplied.
- readyToGenerate must remain false until the final summary is confirmed.
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,

      generation_config: {
        thinking_level: "minimal",
      },

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: chatResponseSchema,
      },
    });

    if (!interaction.output_text) {
      throw new Error("Gemini returned an empty response.");
    }

    return NextResponse.json(
      JSON.parse(interaction.output_text),
    );
  } catch (error) {
    console.error("Ingredient conversation failed:", error);

    const detail = error instanceof Error ? error.message : "";

    const isRateLimited =
      detail.includes("429") ||
      detail.includes("RESOURCE_EXHAUSTED") ||
      detail.toLowerCase().includes("quota");

    if (isRateLimited) {
      return NextResponse.json(
        {
          message:
            "The AI is temporarily rate-limited. Please wait about one minute and try again.",
        },
        { status: 429 },
      );
    }

    if (detail.includes("API key") || detail.includes("API_KEY")) {
      return NextResponse.json(
        {
          message: "The Gemini API key is missing or invalid.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message:
          "We could not continue the cooking conversation right now.",
      },
      { status: 500 },
    );
  }
}