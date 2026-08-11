import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { BuilderStudio } from "@/components/BuilderStudio";
import { Toaster } from "@/components/ui/sonner";
import { ThemeIntensity } from "@/components/ThemeIntensity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HH Goa 2026 Builder Studio — Generate Your Builder ID" },
      {
        name: "description",
        content:
          "Upload your photo and generate an exclusive Hacker House Goa 2026 Builder ID or profile frame. Customize, export at high resolution, share with #FrameInGoa.",
      },
      { property: "og:title", content: "HH Goa 2026 Builder Studio" },
      {
        property: "og:description",
        content:
          "Generate your exclusive HH Goa 2026 Builder Identity. Premium badge and profile frame generator — export and share with #FrameInGoa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const scrollToStudio = () =>
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <AuroraBackground />
      <Toaster position="top-center" />
      <ThemeIntensity />
      <main className="relative z-10">
        <Hero onStart={scrollToStudio} />
        <FeatureGrid />
        <BuilderStudio />
      </main>
      <footer className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-12 text-muted-foreground">
        <span className="label-caps text-[9px]">Hacker House · Goa 2026</span>
        <span className="label-caps text-[9px] text-cyan">#FrameInGoa</span>
      </footer>
    </>
  );
}
