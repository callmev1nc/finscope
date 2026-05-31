"use client";

import type { CalculationResult } from "@/lib/tools/types";
import { Button } from "@/components/ui/Button";
import { FileDown } from "lucide-react";
import { generatePdf } from "@/lib/pdf/pdf-generator";

interface PdfExportButtonProps {
  result: CalculationResult;
  toolName: string;
}

export function PdfExportButton({ result, toolName }: PdfExportButtonProps) {
  const handleExport = () => {
    try {
      const doc = generatePdf(result, toolName);
      doc.save(`${toolName.replace(/\s+/g, "-").toLowerCase()}-report.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <Button
      variant="outline"
      size="md"
      leftIcon={<FileDown className="h-4 w-4" />}
      onClick={handleExport}
    >
      Download PDF
    </Button>
  );
}
