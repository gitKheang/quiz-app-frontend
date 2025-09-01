import { http, HttpResponse } from "msw";
import type {
  CreateSessionReq,
  CreateSessionResp,
  SaveProgressReq,
  SaveProgressResp,
  SubmitQuizResp,
  QuizSession,
  QuestionDTO,
} from "@/types/quiz";
import { store } from "../data";
import {
  generateAttemptId,
  getQuestionsWithAnswersForCategory,
  deterministicShuffle,
  ensureNotIdentity,
} from "./helpers";

// In-memory storage for quiz sessions
const sessions = new Map<string, QuizSession>();
const sessionAnswers = new Map<string, Record<string, string[]>>();
const sessionOriginalQuestions = new Map<string, QuestionDTO[]>();
const sessionQuestionOrder = new Map<string, string[]>();

// Cold start simulation variables
let isFirstRequest = true;
let lastRestartTime = Date.now();

async function simulateColdStart() {
  if (isFirstRequest) {
    console.log("[v0] Simulating cold start delay for first request...");
    await new Promise((resolve) => setTimeout(resolve, 180000)); // 3 minutes
    isFirstRequest = false;
    console.log("[v0] Cold start simulation complete");
  }
}

export function resetColdStart() {
  isFirstRequest = true;
  lastRestartTime = Date.now();
  console.log("[v0] Cold start flag reset");
}

// helpers
function normalizeIncomingAnswers(payload: any): Record<string, string[]> {
  const a = payload?.answers;
  if (!a) return {};
  if (Array.isArray(a)) {
    // [{ questionId, chosenOptionIds }]
    return Object.fromEntries(
      a.map((it: any) => [
        String(it?.questionId ?? ""),
        Array.isArray(it?.chosenOptionIds)
          ? it.chosenOptionIds.map(String)
          : [],
      ])
    );
  }
  if (a && typeof a === "object") {
    // { [questionId]: string[] }
    return Object.fromEntries(
      Object.entries(a).map(([k, v]) => [
        String(k),
        Array.isArray(v) ? (v as any[]).map(String) : [],
      ])
    );
  }
  return {};
}

// handlers
export const sessionHandlers = [
  // Start a new session
  http.post("/api/quiz-sessions", async ({ request }) => {
    await simulateColdStart();

    const req = (await request.json()) as CreateSessionReq;

    const category = store.categories.find((c) => c.id === req.categoryId);
    if (!category) {
      return HttpResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const requested = Math.max(1, Math.min(req.numQuestions ?? 10, 50));
    const timeLimitMin = Math.max(
      5,
      Math.min(
        (req as any).timeLimitMin ?? (req as any).timeLimitMinutes ?? 15,
        60
      )
    );
    const timeLimitSec = timeLimitMin * 60;

    const now = new Date();
    const endAt = new Date(now.getTime() + timeLimitSec * 1000);
    const attemptId = generateAttemptId();

    const originalQuestions = getQuestionsWithAnswersForCategory(
      req.categoryId,
      requested,
      (req as any).difficulty && (req as any).difficulty !== "mixed"
        ? ((req as any).difficulty as any)
        : undefined
    );

    const questionOrder = originalQuestions.map((q) => q.id);
    sessionQuestionOrder.set(attemptId, questionOrder);

    const clientQuestions = originalQuestions.map((q) => {
      const baseOptions = q.options;
      const seededOptions = deterministicShuffle(
        baseOptions,
        `${attemptId}:${q.id}`
      );
      const finalOptions = ensureNotIdentity(baseOptions, seededOptions);

      return {
        ...q,
        options: finalOptions.map((o) => ({ id: o.id, text: o.text })),
        correctOptionIds: undefined,
        explanation: undefined,
      };
    });

    const session: QuizSession = {
      id: attemptId,
      categoryId: req.categoryId,
      category,
      numQuestions: requested,
      difficulty: (req as any).difficulty as any,
      timeLimitSec,
      startAt: now.toISOString(),
      endAt: endAt.toISOString(),
      serverNow: now.toISOString(),
      questions: clientQuestions,
      currentAnswers: {},
      isCompleted: false,
    };

    sessions.set(attemptId, session);
    sessionAnswers.set(attemptId, {});
    sessionOriginalQuestions.set(attemptId, originalQuestions);

    const resp: CreateSessionResp = {
      attemptId,
      category: session.category,
      startAt: session.startAt,
      endAt: session.endAt,
      timeLimitSec: session.timeLimitSec,
      serverNow: session.serverNow!,
      questions: clientQuestions,
    };

    return HttpResponse.json(resp);
  }),

  // Get session (refresh-safe)
  http.get("/api/quiz-sessions/:id", async ({ params }) => {
    await simulateColdStart();

    const { id } = params as { id: string };
    const sess = sessions.get(id);
    if (!sess)
      return HttpResponse.json({ error: "Session not found" }, { status: 404 });

    const originalQuestions = sessionOriginalQuestions.get(id) || [];
    const questionOrder = sessionQuestionOrder.get(id) || [];

    if (originalQuestions.length > 0 && questionOrder.length > 0) {
      // Restore the saved question order
      const orderedQuestions = questionOrder
        .map((qId) => originalQuestions.find((q) => q.id === qId))
        .filter(Boolean) as QuestionDTO[];

      // Regenerate client questions with same deterministic option shuffle
      const clientQuestions = orderedQuestions.map((q) => {
        const baseOptions = q.options;
        const seededOptions = deterministicShuffle(
          baseOptions,
          `${id}:${q.id}`
        );
        const finalOptions = ensureNotIdentity(baseOptions, seededOptions);

        return {
          ...q,
          options: finalOptions.map((o) => ({ id: o.id, text: o.text })),
          correctOptionIds: undefined,
          explanation: undefined,
        };
      });

      // Update session with consistent questions
      const updatedSession = {
        ...sess,
        questions: clientQuestions,
        serverNow: new Date().toISOString(),
      };

      sessions.set(id, updatedSession);
      return HttpResponse.json(updatedSession);
    }

    return HttpResponse.json(sess);
  }),

  // Save / progress
  http.patch("/api/quiz-sessions/:id/progress", async ({ params, request }) => {
    await simulateColdStart();

    const { id } = params as { id: string };
    const sess = sessions.get(id);
    if (!sess) {
      return HttpResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = (await request.json()) as SaveProgressReq | any;

    // Merge new answers into the stored map
    const prev: Record<string, string[]> = sessionAnswers.get(id) || {};
    const incoming = normalizeIncomingAnswers(body);
    const merged: Record<string, string[]> = { ...prev, ...incoming };
    sessionAnswers.set(id, merged);

    // also mirror into the session object
    sessions.set(id, { ...sess, currentAnswers: merged });

    const resp: SaveProgressResp = {
      saved: true,
      serverNow: new Date().toISOString(),
    };
    return HttpResponse.json(resp);
  }),

  // Submit quiz (accept optional answers in body as a last-chance sync)
  http.post("/api/quiz-sessions/:id/submit", async ({ params, request }) => {
    await simulateColdStart();

    console.log(`[v0] Processing quiz submission for session: ${params.id}`);

    const { id } = params as { id: string };
    const session = sessions.get(id);
    const originalQuestions = sessionOriginalQuestions.get(id) || [];

    // Merge any answers sent with submit (final sync)
    try {
      const body = await request.json().catch(() => null as any);
      if (body) {
        const prev: Record<string, string[]> = sessionAnswers.get(id) || {};
        const incoming = normalizeIncomingAnswers(body);
        sessionAnswers.set(id, { ...prev, ...incoming });
      }
    } catch {
      /* ignore body errors */
    }

    // Prefer: body-merged answers -> sessionAnswers -> session.currentAnswers
    let answers = sessionAnswers.get(id) || {};
    if (
      (!answers || Object.keys(answers).length === 0) &&
      session?.currentAnswers
    ) {
      answers = session.currentAnswers;
    }

    if (!session) {
      return HttpResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (originalQuestions.length === 0) {
      return HttpResponse.json(
        { error: "Scoring data not found" },
        { status: 500 }
      );
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unselectedCount = 0;

    const breakdown = session.questions.map((clientQ) => {
      const originalQ = originalQuestions.find((oq) => oq.id === clientQ.id);
      if (!originalQ) {
        unselectedCount++;
        return {
          questionId: clientQ.id,
          isCorrect: false,
          userAnswerIds: [],
          correctAnswerIds: [],
          // include readable fields (empty)
          userAnswerTexts: [],
          correctAnswerTexts: [],
          explanation: undefined,
        };
      }

      const userAnswerIds = answers[clientQ.id] || [];

      // Because options were shuffled client-side, map chosen option IDs
      // back to the original question IDs via option TEXT.
      const mappedUserAnswers = userAnswerIds.map((selectedId) => {
        const selectedOption = clientQ.options.find(
          (opt) => opt.id === selectedId
        );
        if (!selectedOption) return selectedId;
        const originalOption = originalQ.options.find(
          (opt) => opt.text === selectedOption.text
        );
        return originalOption ? originalOption.id : selectedId;
      });

      const correctAnswerIds = originalQ.correctOptionIds || [];

      // Human-readable texts for results UI
      const userAnswerTexts = mappedUserAnswers.map(
        (id) => originalQ.options.find((o) => o.id === id)?.text ?? id
      );
      const correctAnswerTexts = correctAnswerIds.map(
        (id) => originalQ.options.find((o) => o.id === id)?.text ?? id
      );

      const isCorrect =
        mappedUserAnswers.length > 0 &&
        mappedUserAnswers.slice().sort().join("|") ===
          correctAnswerIds.slice().sort().join("|");

      if (userAnswerIds.length === 0) {
        unselectedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        questionId: clientQ.id,
        isCorrect,
        userAnswerIds: mappedUserAnswers,
        correctAnswerIds,
        // include texts
        userAnswerTexts,
        correctAnswerTexts,
        explanation: originalQ.explanation,
      };
    });

    const total = session.questions.length;
    const start = new Date(session.startAt).getTime();
    const end = Date.now();
    const timeTakenSec = Math.max(0, Math.floor((end - start) / 1000));
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const response: SubmitQuizResp = {
      score,
      correctCount,
      incorrectCount,
      unselectedCount,
      total,
      timeTakenSec,
      breakdown,
      rank: 50,
      percentile: 0,
    };

    sessions.set(id, { ...session, isCompleted: true });
    console.log(
      `[v0] Quiz submission completed for session: ${id}, score: ${score}`
    );
    return HttpResponse.json(response);
  }),
];
