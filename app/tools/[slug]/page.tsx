import { getTool } from "@/lib/tools/registry";
import { notFound } from "next/navigation";
import { ToolRunner } from "@/components/tools/ToolRunner";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) return { title: "Tool Not Found" };

  return {
    title: `${tool.name} — FinScope`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} — FinScope`,
      description: tool.description,
      type: "website",
      siteName: "FinScope",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} — FinScope`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <ToolRunner tool={tool} />
    </div>
  );
}
