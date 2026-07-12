import type { Recipe } from "@/types/recipe";

export type GeneratedRecipe = {
  id?: string;
  name: string;
  description?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  difficulty?: "easy" | "medium" | "hard";
  servings?: number;

  ingredients?: {
    name: string;
    quantity: string;
    userAlreadyHas: boolean;
  }[];

  missingIngredients?: string[];

  steps?: {
    stepNumber: number;
    instruction: string;
    estimatedMinutes?: number;
  }[];

  substitutions?: string[];
  wasteReductionNote?: string;
};

type ConversionOptions = {
  servings: number;
  dietaryPreferences: string[];
};

export async function convertGeneratedRecipes(
  generatedRecipes: GeneratedRecipe[],
  options: ConversionOptions,
): Promise<Recipe[]> {
  return Promise.all(
    generatedRecipes.map(async (recipe, index) => {
      const recipeIngredients = recipe.ingredients ?? [];

      let imageResult = {
        imageUrl: "/images/food.webp",
        imageAlt: `Photo representing ${recipe.name}`,
        photographer: null as string | null,
        photographerUrl: null as string | null,
        photoUrl: null as string | null,
      };

      try {
        const imageResponse = await fetch("/api/recipe-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeName: recipe.name,
            description: recipe.description,
            ingredients: recipeIngredients.map(
              (ingredient) => ingredient.name,
            ),
          }),
        });

        if (imageResponse.ok) {
          imageResult = await imageResponse.json();
        }
      } catch (error) {
        console.error(
          `Could not find an image for ${recipe.name}:`,
          error,
        );
      }

      return {
        id: recipe.id || `generated-recipe-${index + 1}`,
        title: recipe.name,
        description: recipe.description ?? "",

        image: imageResult.imageUrl ?? "/images/food.webp",

        imageAlt:
          imageResult.imageAlt ??
          `Photo representing ${recipe.name}`,

        photographer: imageResult.photographer,
        photographerUrl: imageResult.photographerUrl,
        photoUrl: imageResult.photoUrl,

        cookingTimeMinutes:
          (recipe.prepTimeMinutes ?? 0) +
          (recipe.cookTimeMinutes ?? 0),

        difficulty:
          recipe.difficulty === "hard"
            ? "Hard"
            : recipe.difficulty === "medium"
              ? "Medium"
              : "Easy",

        servings: recipe.servings ?? options.servings,

        matchPercentage: Math.max(85, 96 - index * 5),

        tags: [
          index === 0 ? "Best match" : "AI generated",
          ...options.dietaryPreferences,
        ],

        ingredients: recipeIngredients.map((ingredient) => ({
          name: ingredient.name,
          amount: ingredient.quantity,
          available: ingredient.userAlreadyHas,
        })),

        missingIngredients: recipe.missingIngredients ?? [],

        instructions: (recipe.steps ?? []).map((step) => ({
          step: step.stepNumber,
          instruction: step.instruction,
        })),

        substitutions: recipe.substitutions ?? [],
        wasteReductionNote: recipe.wasteReductionNote ?? "",
      };
    }),
  );
}