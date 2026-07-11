import Link from "next/link";
import { Camera, ChefHat, Mic, Sparkles } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const features = [
  {
    title: "Scan your ingredients",
    description:
      "Take a picture of the food you already have in your fridge or pantry.",
    icon: Camera,
  },
  {
    title: "Receive recipe ideas",
    description:
      "Get practical recipes based on your ingredients, time, and preferences.",
    icon: Sparkles,
  },
  {
    title: "Cook hands-free",
    description:
      "Use the voice assistant to hear steps, ask questions, and find substitutions.",
    icon: Mic,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
            <ChefHat className="size-4 text-green-600" />
            Reduce food waste one meal at a time
          </div>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Turn what you already have into something delicious.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Upload a photo of your ingredients and receive recipe ideas you can
            cook with them.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={
                <Link href="/scan">
                  <Camera className="size-5" />
                  Scan ingredients
                </Link>
              }
            />

            <Button
              size="lg"
              variant="outline"
              render={<Link href="/recipes">View sample recipes</Link>}
            />
          </div>
        </div>

        <div className="rounded-3xl border bg-muted/40 p-4 shadow-sm">
          <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed bg-background">
            <div className="max-w-xs text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Camera className="size-8" />
              </span>

              <p className="mt-5 text-lg font-semibold">
                Your ingredients become your next meal
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Rice, tomatoes, spinach and eggs can become several affordable
                meals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-xl">
            <p className="font-medium text-green-700">How it works</p>
            <h2 className="mt-2 text-3xl font-bold">
              From ingredients to dinner in three steps
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <Icon className="size-5" />
                    </span>

                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
