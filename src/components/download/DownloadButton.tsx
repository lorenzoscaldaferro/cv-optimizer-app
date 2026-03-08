"use client";

import { Download } from "lucide-react";

interface DownloadButtonProps {
  url: string;
  filename?: string;
}

export function DownloadButton({ url, filename }: DownloadButtonProps) {
  return (
    <a
      href={url}
      download={filename}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 w-full"
    >
      <Download className="h-4 w-4" />
      Download .docx
    </a>
  );
}
