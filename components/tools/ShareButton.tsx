"use client";

import { Button } from "@/components/ui/Button";
import { Share2, Check } from "lucide-react";
import { encodeInputs } from "@/lib/share/encoder";
import { useState } from "react";
import type { ToolInputs } from "@/lib/tools/types";

interface ShareButtonProps {
  toolSlug: string;
  inputs?: ToolInputs;
}

export function ShareButton({ toolSlug, inputs }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!inputs) return;

    try {
      const encoded = encodeInputs(inputs);
      const url = `${window.location.origin}/share/${toolSlug}?d=${encoded}`;

      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // silently fail
    }
  };

  return (
    <Button
      variant="ghost"
      size="md"
      leftIcon={copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
      onClick={handleShare}
      disabled={!inputs}
    >
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
