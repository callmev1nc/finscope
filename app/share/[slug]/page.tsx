import { getTool } from "@/lib/tools/registry";
import { notFound } from "next/navigation";
import { ToolRunner } from "@/components/tools/ToolRunner";

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { slug } = await params;
  const { d } = await searchParams;

  const tool = getTool(slug);
  if (!tool) notFound();

  if (!d) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Invalid or Expired Share Link</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          The shared data could not be loaded. Please ask the sender to generate a new link.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        Viewing shared results for {tool.name}
      </div>
      <ToolRunner tool={tool} encodedData={d} />
    </div>
  );
}
