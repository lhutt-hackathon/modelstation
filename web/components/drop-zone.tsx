"use client";

import * as React from "react";
import { UploadCloudIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DropZoneProps {
  label: string;
  description?: string;
  accept?: string;
  onFilesChange?: (files: FileList | null) => void;
  file?: File | null;
}

export function DropZone({ label, description, accept, onFilesChange, file }: DropZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      onFilesChange?.(files);
    },
    [onFilesChange]
  );

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[160px] cursor-pointer flex-col justify-between gap-6 rounded-lg border border-border/60 bg-background/40 p-5 transition-colors",
        isDragging ? "border-primary/80 bg-primary/10" : "hover:border-border/80 hover:bg-background/60"
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10">
            <UploadCloudIcon className="h-5 w-5 text-primary" />
          </span>
          <div>
            <p className="text-base font-semibold">{label}</p>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-xs text-muted-foreground">
          {file ? (
            <p className="truncate font-medium text-foreground">{file.name}</p>
          ) : (
            <p>Drop or click to upload</p>
          )}
          <p>Max 4 GB</p>
        </div>
      </div>
    </div>
  );
}
