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
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 w-full"
    >
      <Download className="h-4 w-4" />
      Download .docx
    </a>
  );
}
