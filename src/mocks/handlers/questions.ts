import { http, HttpResponse } from "msw";
import type { QuestionDTO } from "@/types/quiz";
import { store, genId, recountCategory } from "../data";
import { normalizeQuestionDifficulty } from "./helpers";

export const questionHandlers = [
  // LIST by category
  http.get("/api/categories/:categoryId/questions", ({ params }) => {
    const { categoryId } = params as { categoryId: string };
    const list = (store.questions[categoryId] ?? []).map((q) => ({
      ...q,
      difficulty: normalizeQuestionDifficulty((q as any).difficulty),
    }));
    return HttpResponse.json(list);
  }),

  // CREATE
  http.post(
    "/api/categories/:categoryId/questions",
    async ({ params, request }) => {
      const { categoryId } = params as { categoryId: string };
      const body = (await request.json()) as Omit<QuestionDTO, "id"> & {
        correctOptionIds?: string[];
        difficulty?: any;
      };

      const options = (body.options || []).map((o, idx) => ({
        id: `opt-${idx + 1}`, // Always use opt-1, opt-2, etc.
        text: o.text ?? `Option ${idx + 1}`,
      }));

      // Map correctOptionIds from form (which might use tmp-* or position-based) to actual option IDs
      let correctOptionIds: string[] = [];
      if (body.correctOptionIds && body.correctOptionIds.length > 0) {
        correctOptionIds = body.correctOptionIds.map((id) => {
          // If it's already in the correct format, use it
          if (id.startsWith("opt-")) return id;

          // If it's a temporary ID like tmp-0, tmp-1, convert to opt-1, opt-2
          if (id.startsWith("tmp-")) {
            const index = Number.parseInt(id.split("-")[1]);
            return `opt-${index + 1}`;
          }

          // If it's a position like pos-1, pos-2, use directly as opt-1, opt-2
          if (id.startsWith("pos-")) {
            return id.replace("pos-", "opt-");
          }

          // Fallback: assume it's an index and convert
          const index = Number.parseInt(id);
          if (!isNaN(index)) {
            return `opt-${index + 1}`;
          }

          return id;
        });
      }

      console.log("[v0] Creating question with options:", options);
      console.log("[v0] Correct option IDs:", correctOptionIds);

      const created: QuestionDTO = {
        id: genId("q"),
        text: body.text,
        type: body.type,
        imageUrl: body.imageUrl,
        options,
        difficulty: normalizeQuestionDifficulty(body.difficulty),
        correctOptionIds,
      };

      if (!store.questions[categoryId]) store.questions[categoryId] = [];
      store.questions[categoryId].push(created);
      recountCategory(categoryId);

      return HttpResponse.json(created);
    }
  ),

  // UPDATE
  http.put("/api/questions/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as Partial<QuestionDTO> & {
      correctOptionIds?: string[];
      difficulty?: any;
    };

    for (const [catId, arr] of Object.entries(store.questions)) {
      const idx = arr.findIndex((q) => q.id === id);
      if (idx !== -1) {
        const prev = arr[idx];
        const updated: QuestionDTO = {
          ...prev,
          ...body,
          options: (body.options ?? prev.options).map((o, i) => ({
            id: o.id || prev.options[i]?.id || `opt-${i + 1}`,
            text: o.text ?? prev.options[i]?.text ?? `Option ${i + 1}`,
          })),
          difficulty: normalizeQuestionDifficulty(
            (body as any).difficulty ?? (prev as any).difficulty
          ),
          correctOptionIds: body.correctOptionIds ?? prev.correctOptionIds,
        };
        arr[idx] = updated;
        recountCategory(catId);
        return HttpResponse.json(updated);
      }
    }
    return HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),

  // DELETE
  http.delete("/api/questions/:id", ({ params }) => {
    const { id } = params as { id: string };
    for (const [catId, arr] of Object.entries(store.questions)) {
      const idx = arr.findIndex((q) => q.id === id);
      if (idx !== -1) {
        arr.splice(idx, 1);
        recountCategory(catId);
        return HttpResponse.json({ ok: true });
      }
    }
    return HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),
];
