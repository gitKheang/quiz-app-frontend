"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";

/** Types */
export type OptionRow = { id: string; text: string };

export type QuestionForm = {
  text: string;
  type: "single" | "multi";
  imageUrl?: string;
  options: OptionRow[];
  correctOptionIds: string[];
  /** Per-question difficulty. 'mixed' is session-level, not allowed here. */
  difficulty: "easy" | "medium" | "hard";
};

/**  Helpers  **/
function genTempId(idx?: number) {
  return `tmp-${Date.now()}-${idx ?? Math.floor(Math.random() * 1e6)}`;
}

function validateForm(form: QuestionForm): boolean {
  if (!form.text.trim()) {
    alert("Question text cannot be empty.");
    return false;
  }

  if (form.options.length < 2) {
    alert("At least two options are required.");
    return false;
  }

  if (form.type === "single" && form.correctOptionIds.length !== 1) {
    alert("Select exactly one correct answer for single-choice questions.");
    return false;
  }

  if (form.correctOptionIds.length === 0) {
    alert("At least one correct answer must be selected.");
    return false;
  }

  return true;
}

/** Component **/
export function EditQuestionDialog({
  open,
  setOpen,
  form,
  setForm,
  onSubmit,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  form: QuestionForm;
  setForm: React.Dispatch<React.SetStateAction<QuestionForm>>;
  onSubmit: (e: React.FormEvent) => void;
}) {
  /** add/remove option */
  function addOption() {
    setForm((f) => ({
      ...f,
      options: [...f.options, { id: genTempId(f.options.length), text: "" }],
    }));
  }

  function removeOption(idx: number) {
    setForm((f) => {
      const removed = f.options[idx]?.id;
      const nextOpts = f.options.filter((_, i) => i !== idx);
      const nextCorrect = removed
        ? f.correctOptionIds.filter((id) => id !== removed)
        : f.correctOptionIds;
      return { ...f, options: nextOpts, correctOptionIds: nextCorrect };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm(form)) return;
    onSubmit(e);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Question text */}
          <div className="grid gap-2">
            <Label htmlFor="q-text">Question</Label>
            <Input
              id="q-text"
              placeholder="Enter question text"
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            />
          </div>

          {/* Type & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v: "single" | "multi") =>
                  setForm((f) => {
                    const nextCorrect =
                      v === "single" && f.correctOptionIds.length > 1
                        ? [f.correctOptionIds[0]]
                        : f.correctOptionIds;
                    return { ...f, type: v, correctOptionIds: nextCorrect };
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">single (one correct)</SelectItem>
                  <SelectItem value="multi">
                    multi (multiple correct)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v: "easy" | "medium" | "hard") =>
                  setForm((f) => ({ ...f, difficulty: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="q-image">Image URL (optional)</Label>
            <Input
              id="q-image"
              placeholder="https://..."
              value={form.imageUrl ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
            />
          </div>

          {/* Options */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add option
              </Button>
            </div>

            {form.type === "single" ? (
              // SINGLE — styled radios
              <RadioGroup
                value={form.correctOptionIds[0] ?? ""}
                onValueChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    correctOptionIds: val ? [val] : [],
                  }))
                }
                className="grid gap-3"
              >
                {form.options.map((opt, idx) => {
                  const id = opt.id || `opt-${idx + 1}`;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <RadioGroupItem id={`single-${id}`} value={id} />
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...f.options];
                            next[idx] = {
                              ...next[idx],
                              text: e.target.value,
                              id:
                                next[idx].id && !next[idx].id.startsWith("tmp-")
                                  ? next[idx].id
                                  : id,
                            };
                            return { ...f, options: next };
                          })
                        }
                        placeholder={`Option ${idx + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeOption(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              // MULTI — checkboxes
              <div className="grid gap-3">
                {form.options.map((opt, idx) => {
                  const id = opt.id || `opt-${idx + 1}`;
                  const checked = form.correctOptionIds.includes(id);
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <Checkbox
                        id={`multi-${id}`}
                        checked={checked}
                        onCheckedChange={(isChecked) =>
                          setForm((f) => {
                            const set = new Set(f.correctOptionIds);
                            if (isChecked) set.add(id);
                            else set.delete(id);
                            return { ...f, correctOptionIds: Array.from(set) };
                          })
                        }
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...f.options];
                            next[idx] = {
                              ...next[idx],
                              text: e.target.value,
                              id:
                                next[idx].id && !next[idx].id.startsWith("tmp-")
                                  ? next[idx].id
                                  : id,
                            };
                            return { ...f, options: next };
                          })
                        }
                        placeholder={`Option ${idx + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeOption(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="quiz-button-primary">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditQuestionDialog;
