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
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-neutral-200 active:scale-[0.99] w-full shadow-sm cursor-pointer"
    >
      <Download className="h-4 w-4" />
      <span>Descargar archivo .docx</span>
    </a>
  );
}
