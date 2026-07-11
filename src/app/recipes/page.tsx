"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipes/recipe-card";
import type { Recipe } from "@/types/recipe";

/**
 * Recipes matched to the user's ingredients.
 *
 * /ingredients puts the results in sessionStorage and navigates here. They come
 * from Spoonacular (real recipes) and are personalised by Gemini where possible.
 */
export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // sessionStorage doesn't exist during SSR, so this can't be a lazy state
    // initialiser without a hydration mismatch. Read it just after mount,
    // deferred so we don't setState synchronously inside the effect body.
    const timer = window.setTimeout(() => {
      try {
        const stored = sessionStorage.getItem("generatedRecipes");
        if (stored) setRecipes(JSON.parse(stored) as Recipe[]);

        const storedNotice = sessionStorage.getItem("recipesNotice");
        if (storedNotice) setNotice(storedNotice);
      } catch {
        // Nothing usable stored — fall through to the empty state.
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <Sparkles className="size-5" />
        </span>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Recipes for you
          </h1>

          <p className="mt-1 text-muted-foreground">
            Matched to the ingredients you already have.
          </p>
        </div>
      </div>

      {notice && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="mt-0.5 size-4 shrink-0" />
          {notice}
        </div>
      )}

      {loaded && recipes.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed p-10 text-center">
          <p className="font-semibold">No recipes yet.</p>

          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what ingredients you have and we will find recipes you can
            actually cook.
          </p>

          <Button
            nativeButton={false}
            className="mt-6"
            render={<Link href="/scan?mode=chat">Add ingredients</Link>}
          />
        </div>
      )}

      {recipes.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              bestMatch={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
