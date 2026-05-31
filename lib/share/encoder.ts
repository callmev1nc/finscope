import LZString from "lz-string";
import type { ToolInputs } from "@/lib/tools/types";

export function encodeInputs(inputs: ToolInputs): string {
  const json = JSON.stringify(inputs);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeInputs(encoded: string): ToolInputs | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as ToolInputs;
  } catch {
    return null;
  }
}
