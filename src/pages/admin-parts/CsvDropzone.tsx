import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

export default function CsvDropzone({
  onFile,
  className,
  // accept CSV and Excel .xlsx by default
  accept = ".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}: {
  onFile: (file: File) => void | Promise<void>;
  className?: string;
  accept?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    await onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
      }
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDragOver(false);
        await handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-xl border-2 border-dashed p-8 text-center cursor-pointer select-none",
        "border-border/70 hover:border-primary/60 transition-colors",
        dragOver && "border-primary/80 bg-primary/5",
        className
      )}
    >
      <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">Drag and drop</span> your{" "}
        <b>CSV or Excel (.xlsx)</b> file here, or{" "}
        <span className="underline">click to browse</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          await handleFiles(e.target.files);
          if (e.currentTarget) e.currentTarget.value = ""; // allow reselecting same file
        }}
      />
    </div>
  );
}
