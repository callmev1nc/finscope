import { HeroSection } from "@/components/landing/HeroSection";
import { ToolGrid } from "@/components/landing/ToolGrid";
import { getAllToolMetas } from "@/lib/tools/registry";

export default function Home() {
  const tools = getAllToolMetas();

  return (
    <div className="flex flex-col">
      <HeroSection />
      <ToolGrid tools={tools} />
    </div>
  );
}
