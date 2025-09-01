"use client";

import type React from "react";

// Full file – normalizes difficulties and removes legacy 'max'
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { adminQuestions } from "@/lib/api-client";
import type { QuestionDTO } from "@/types/quiz";
import type { QuestionForm } from "@/pages/admin-parts/EditQuestionDialog";

// tiny csv helpers
function csvEscape(s: string) {
  if (s == null) return "";
  const needs = /[",\n]/.test(s);
  return needs ? `"${s.replace(/"/g, '""')}"` : s;
}
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeDiff(v: any): "easy" | "medium" | "hard" {
  const s = String(v || "")
    .toLowerCase()
    .trim();
  if (s === "med") return "medium";
  if (s === "max") return "hard";
  if (s === "easy" || s === "medium" || s === "hard") return s;
  return "medium";
}

export function useAdminQuestions(selectedCategory: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [questions, setQuestions] = useState<QuestionDTO[]>([]);

  // question edit dialog
  const [qEditOpen, setQEditOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<QuestionDTO | null>(null);
  const [qForm, setQForm] = useState<QuestionForm>({
    text: "",
    type: "single",
    difficulty: "medium",
    imageUrl: "",
    options: [
      { id: "", text: "" },
      { id: "", text: "" },
      { id: "", text: "" },
      { id: "", text: "" },
    ],
    correctOptionIds: [],
  });

  // load question list when category changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedCategory) {
        setQuestions([]);
        return;
      }
      const list = await adminQuestions.list(selectedCategory);
      // normalize difficulties for UI
      const norm = list.map((q) => ({
        ...q,
        difficulty: normalizeDiff((q as any).difficulty),
      }));
      if (!cancelled) setQuestions(norm);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  // create question
  async function createQuestion() {
    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "Please select a category first",
      });
      return;
    }
    const q = await adminQuestions.create(selectedCategory, {
      text: "Sample question (MSW)",
      type: "single",
      options: [
        { id: "opt-1", text: "A" },
        { id: "opt-2", text: "B" },
        { id: "opt-3", text: "C" },
        { id: "opt-4", text: "D" },
      ],
      correctOptionIds: ["opt-1"],
      difficulty: "medium" as any,
    });
    setQForm({
      text: q.text || "",
      type: q.type || "single",
      imageUrl: q.imageUrl || "",
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correctOptionIds: q.correctOptionIds || [],
      difficulty: normalizeDiff((q as any).difficulty),
    });
    setQuestions((prev) => [q, ...prev]);
    toast({ title: "Question created", description: q.text });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  function openEditQuestion(q: QuestionDTO) {
    setEditingQ(q);
    setQForm({
      text: q.text || "",
      type: q.type || "single",
      imageUrl: q.imageUrl || "",
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correctOptionIds: q.correctOptionIds || [],
      difficulty: normalizeDiff((q as any).difficulty),
    });
    setQEditOpen(true);
  }

  async function submitEditQuestion(e?: React.FormEvent) {
    e?.preventDefault();
    if (!editingQ) return;
    const updated = await adminQuestions.update(editingQ.id, {
      text: qForm.text,
      type: qForm.type,
      imageUrl: qForm.imageUrl,
      options: qForm.options.map((o) => ({ id: o.id, text: o.text })),
      correctOptionIds: qForm.correctOptionIds,
      difficulty: normalizeDiff(qForm.difficulty),
    } as any);
    setQuestions((prev) =>
      prev.map((x) =>
        x.id === updated.id
          ? {
              ...updated,
              difficulty: normalizeDiff((updated as any).difficulty),
            }
          : x
      )
    );
    toast({ title: "Question updated", description: updated.text });
    setQEditOpen(false);
    setEditingQ(null);
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  async function deleteQuestion(questionId: string) {
    await adminQuestions.delete(questionId);
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    toast({ title: "Question deleted", description: questionId });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  // Export CSV (includes difficulty)
  async function exportQuestionsCSV() {
    const header = ["text", "type", "difficulty", "options", "correct"];
    const rows = [header.join(",")];
    for (const q of questions) {
      const opts = q.options.map((o) => csvEscape(o.text)).join("|");
      const correctPositions = (q.correctOptionIds || [])
        .map((id) => q.options.findIndex((o) => o.id === id) + 1)
        .filter((n) => n > 0)
        .join("|");
      rows.push(
        [
          csvEscape(q.text),
          q.type,
          normalizeDiff((q as any).difficulty),
          csvEscape(opts),
          correctPositions,
        ].join(",")
      );
    }
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questions-${selectedCategory || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import CSV/XLSX
  async function importQuestionsCSV(file: File) {
    const isXlsx = file.name.endsWith(".xlsx");

    let rows: string[][] = [];

    if (isXlsx) {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = (XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][]) || [];
    } else {
      const text = await file.text();
      rows = parseCSV(text);
    }

    if (!rows.length) {
      toast({ variant: "destructive", title: "Empty or invalid file" });
      return;
    }

    // optional header detection: text,type,difficulty,options,correct
    const header = rows[0].map((c) => c.trim().toLowerCase());
    const hasHeader = [
      "text",
      "type",
      "difficulty",
      "options",
      "correct",
    ].every((k) => header.includes(k));
    const startRow = hasHeader ? 1 : 0;

    const I = {
      text: header.indexOf("text"),
      type: header.indexOf("type"),
      difficulty: header.indexOf("difficulty"),
      options: header.indexOf("options"),
      correct: header.indexOf("correct"),
    };

    let created = 0;
    let failed = 0;

    for (let r = startRow; r < rows.length; r++) {
      const row = rows[r] || [];
      const textCell = (row[I.text] ?? "").toString().trim();
      const typeCell = (row[I.type] ?? "single")
        .toString()
        .trim()
        .toLowerCase();
      const diffCell = (row[I.difficulty] ?? "medium")
        .toString()
        .trim()
        .toLowerCase();
      const optionsCell = (row[I.options] ?? "").toString();
      const correctCell = (row[I.correct] ?? "").toString();

      const type = (
        typeCell === "multi" ? "multi" : "single"
      ) as QuestionDTO["type"];
      const difficulty = normalizeDiff(diffCell);

      const optTexts = optionsCell
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (optTexts.length < 2) {
        failed++;
        continue;
      }

      const correctPositions = correctCell
        .split("|")
        .map((s) => Number.parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= optTexts.length);

      try {
        await adminQuestions.create(selectedCategory, {
          text: textCell,
          type,
          options: optTexts.map((t, idx) => ({
            id: "",
            text: t || `Option ${idx + 1}`,
          })),
          difficulty: difficulty as any,
          correctOptionIds: correctPositions.map((pos) => `pos-${pos}`),
        } as any);
        created++;
      } catch {
        failed++;
      }
    }

    toast({
      title: "Import finished",
      description: `Created: ${created}${failed ? ", failed: " + failed : ""}`,
    });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    // refresh list
    const list = await adminQuestions.list(selectedCategory);
    setQuestions(
      list.map((q) => ({
        ...q,
        difficulty: normalizeDiff((q as any).difficulty),
      }))
    );
  }

  return {
    // state
    questions,
    setQuestions,
    qEditOpen,
    setQEditOpen,
    editingQ,
    setEditingQ,
    qForm,
    setQForm,
    openEditQuestion,
    submitEditQuestion,

    // actions
    createQuestion,
    deleteQuestion,

    // import/export
    importQuestionsCSV,
    exportQuestionsCSV,
  };
}
