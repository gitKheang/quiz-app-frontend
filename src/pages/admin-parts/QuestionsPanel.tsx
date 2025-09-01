import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Download, Edit, Trash2 } from "lucide-react";
import type { CategoryDTO, QuestionDTO } from "@/types/quiz";
import CsvDropzone from "@/pages/admin-parts/CsvDropzone";

type Props = {
  categories?: CategoryDTO[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;

  questions: QuestionDTO[];
  onCreateQuestion: () => Promise<void> | void;
  onOpenEditQuestion: (q: QuestionDTO) => void;
  onDeleteQuestion: (id: string) => Promise<void> | void;

  onImportCSV: (file: File) => Promise<void>;
  onExportCSV: () => Promise<void> | void;
};

export default function QuestionsPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  questions,
  onCreateQuestion,
  onOpenEditQuestion,
  onDeleteQuestion,
  onImportCSV,
  onExportCSV,
}: Props) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button onClick={onCreateQuestion} className="quiz-button-primary">
            <Plus size={16} />
            New Question
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload size={16} />
                Import CSV
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Bulk Import Questions</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* lighter intro line */}
                <p className="text-sm font-light text-muted-foreground/80">
                  Upload a CSV/Excel file to create questions in the{" "}
                  <b className="font-medium">selected category</b>.
                </p>

                {/* Drag & drop */}
                <CsvDropzone onFile={onImportCSV} />

                {/* Help & templates with difficulty */}
                <div className="rounded-lg bg-muted/20 p-4 text-[13px] leading-6 text-muted-foreground/80 font-light">
                  <div className="mb-1">
                    <span className="font-medium text-foreground/90">
                      Format:
                    </span>{" "}
                    <code className="px-1 py-0.5 rounded bg-muted/50">
                      text,type,difficulty,options,correct
                    </code>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <b className="font-medium text-foreground/90">
                        difficulty
                      </b>
                      : <code>easy</code> | <code>medium</code> |{" "}
                      <code>hard</code>{" "}
                      <span className="text-muted-foreground/70">
                        (optional; defaults to{" "}
                      </span>
                      <code>medium</code>
                      <span className="text-muted-foreground/70">)</span>
                    </li>
                    <li>
                      <b className="font-medium text-foreground/90">options</b>:
                      pipe-separated, e.g.{" "}
                      <code className="px-1 rounded bg-muted/40">
                        2 | 3 | 5 | 8
                      </code>
                    </li>
                    <li>
                      <b className="font-medium text-foreground/90">correct</b>:
                      1-based positions, pipe-separated for multi, e.g.{" "}
                      <code className="px-1 rounded bg-muted/40">2|3</code>
                    </li>
                    <li>
                      Example:{" "}
                      <code className="px-1 rounded bg-muted/40">
                        What is 2+2?,single,medium,"1 | 2 | 3 | 4",4
                      </code>
                    </li>
                  </ul>

                  <div className="mt-3 flex flex-wrap gap-3">
                    {/* Excel template (wide columns) */}
                    <button
                      type="button"
                      onClick={async () => {
                        const XLSX = await import("xlsx");
                        const data = [
                          ["text", "type", "difficulty", "options", "correct"],
                          [
                            "What is 2+2?",
                            "single",
                            "easy",
                            "1 | 2 | 3 | 4",
                            "4",
                          ],
                          [
                            "Pick primes",
                            "multi",
                            "medium",
                            "2 | 3 | 4 | 5",
                            "1|2|4",
                          ],
                        ];
                        const ws = XLSX.utils.aoa_to_sheet(data);
                        (ws as any)["!cols"] = [
                          { wch: 60 },
                          { wch: 12 },
                          { wch: 14 },
                          { wch: 48 },
                          { wch: 14 },
                        ];
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Template");
                        const wbout = XLSX.write(wb, {
                          bookType: "xlsx",
                          type: "array",
                        });
                        const blob = new Blob([wbout], {
                          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "questions-template.xlsx";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-primary underline underline-offset-4 hover:opacity-90"
                    >
                      Download Excel template (.xlsx)
                    </button>

                    {/* CSV template */}
                    <button
                      type="button"
                      onClick={() => {
                        const header = "text,type,difficulty,options,correct\n";
                        const example =
                          'What is 2+2?,single,easy,"1 | 2 | 3 | 4",4\n' +
                          'Pick primes,multi,medium,"2 | 3 | 4 | 5","1|2|4"\n';
                        const blob = new Blob([header + example], {
                          type: "text/csv;charset=utf-8",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "questions-template.csv";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-muted-foreground underline underline-offset-4 hover:opacity-90"
                    >
                      Download CSV template
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Button variant="outline" onClick={onExportCSV}>
          <Download size={16} />
          Export Questions
        </Button>
      </div>

      {/* Filter */}
      <Card className="quiz-card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-border rounded-md bg-background text-sm"
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="quiz-card">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{question.type}</Badge>
                    {(question as any).difficulty && (
                      <Badge variant="secondary">
                        {(question as any).difficulty}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {question.options.length} options
                    </Badge>
                  </div>
                  <h3 className="font-medium mb-2">{question.text}</h3>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Options:</span>{" "}
                    {question.options.map((o) => o.text).join(", ")}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenEditQuestion(question)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteQuestion(question.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {selectedCategory && questions.length === 0 && (
          <Card className="quiz-card p-6 text-center text-muted-foreground">
            No questions in this category yet. Click <b>New Question</b> to add
            one.
          </Card>
        )}
      </div>
    </>
  );
}
