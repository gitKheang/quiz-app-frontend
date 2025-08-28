import { http, HttpResponse } from "msw";
import type { CategoryDTO } from "@/types/quiz";
import { store, genId } from "../data";

export const categoryHandlers = [
  // READ
  http.get("/api/categories", () => {
    return HttpResponse.json(store.categories);
  }),

  // CREATE
  http.post("/api/categories", async ({ request }) => {
    const body = (await request.json()) as Partial<CategoryDTO>;
    if (!body.name || !body.slug) {
      return HttpResponse.json(
        { message: "name & slug required" },
        { status: 400 }
      );
    }
    const created: CategoryDTO = {
      id: body.id || body.slug || genId("cat"),
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      color: body.color || "#6366F1",
      icon: body.icon || "📚",
      questionCount: 0,
    };
    if (!store.questions[created.id]) store.questions[created.id] = [];
    store.categories.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  // UPDATE
  http.put("/api/categories/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const updates = (await request.json()) as Partial<CategoryDTO>;
    const i = store.categories.findIndex((c) => c.id === id);
    if (i === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });

    store.categories[i] = {
      ...store.categories[i],
      ...updates,
      id: store.categories[i].id, // prevent id changes
    };
    return HttpResponse.json(store.categories[i]);
  }),

  // DELETE (+ cascade questions)
  http.delete("/api/categories/:id", ({ params }) => {
    const { id } = params as { id: string };
    const i = store.categories.findIndex((c) => c.id === id);
    if (i === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });

    store.categories.splice(i, 1);
    delete store.questions[id];
    return HttpResponse.json({ ok: true });
  }),
];
