// Mock data for quiz app

import type { CategoryDTO, QuestionDTO, LeaderboardEntry } from "@/types/quiz";

/**
 * Categories start with 0 questions.
 * Admin CRUD will populate questions at runtime and recountCategory() keeps counts in sync.
 */
export const mockCategories: CategoryDTO[] = [
  {
    id: "history",
    name: "World History",
    slug: "history",
    description:
      "Test your knowledge of world history from ancient civilizations to modern times",
    color: "#8B5CF6",
    icon: "🏛️",
    questionCount: 0,
  },
  {
    id: "science",
    name: "Science & Nature",
    slug: "science",
    description:
      "Explore the wonders of physics, chemistry, biology, and the natural world",
    color: "#10B981",
    icon: "🔬",
    questionCount: 0,
  },
  {
    id: "technology",
    name: "Technology",
    slug: "technology",
    description: "Modern tech, programming, AI, and digital innovation",
    color: "#3B82F6",
    icon: "💻",
    questionCount: 0,
  },
  {
    id: "geography",
    name: "Geography",
    slug: "geography",
    description: "Countries, capitals, landmarks, and physical geography",
    color: "#F59E0B",
    icon: "🌍",
    questionCount: 0,
  },
  {
    id: "literature",
    name: "Literature",
    slug: "literature",
    description:
      "Classic and modern literature, authors, and literary movements",
    color: "#EF4444",
    icon: "📚",
    questionCount: 0,
  },
  {
    id: "sports",
    name: "Sports",
    slug: "sports",
    description: "Sports trivia, records, athletes, and major competitions",
    color: "#06B6D4",
    icon: "⚽",
    questionCount: 0,
  },
];

/**
 * IMPORTANT: Start with NO seeded questions.
 * This ensures Admin & Student UIs both show "0 questions" until the admin adds some.
 */
export const mockQuestions: Record<string, QuestionDTO[]> = {
  history: [],
  science: [],
  technology: [],
  geography: [],
  literature: [],
  sports: [],
};

/* =================== Leaderboard data generator (unchanged) =================== */

const names = [
  "Alex Chen",
  "Sarah Johnson",
  "Mike Rodriguez",
  "Emma Thompson",
  "David Park",
  "Lisa Wang",
  "James Miller",
  "Maya Patel",
  "Ryan O'Connor",
  "Zoe Adams",
  "Kevin Lee",
  "Anna Garcia",
  "Tom Wilson",
  "Sophie Martin",
  "Jake Brown",
  "Aria Singh",
];

export const generateLeaderboardData = (
  categoryId?: string,
  range: "daily" | "weekly" | "monthly" | "all" = "all",
  limit = 50
): LeaderboardEntry[] => {
  const now = new Date();
  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < limit; i++) {
    const baseScore = Math.max(0, 100 - i * 2 - Math.floor(Math.random() * 10));
    const timeBonus = Math.floor(Math.random() * 20);
    const score = Math.min(100, baseScore + timeBonus);

    // Completion time between ~3–18 minutes
    const timeSec = 180 + Math.floor(Math.random() * 900);

    // Date based on requested range
    const submittedAt = new Date(now);
    if (range === "daily") {
      submittedAt.setHours(
        submittedAt.getHours() - Math.floor(Math.random() * 24)
      );
    } else if (range === "weekly") {
      submittedAt.setDate(
        submittedAt.getDate() - Math.floor(Math.random() * 7)
      );
    } else if (range === "monthly") {
      submittedAt.setDate(
        submittedAt.getDate() - Math.floor(Math.random() * 30)
      );
    } else {
      submittedAt.setDate(
        submittedAt.getDate() - Math.floor(Math.random() * 365)
      );
    }

    entries.push({
      id: `entry-${i}`,
      userName:
        names[i % names.length] +
        (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ""),
      score,
      timeSec,
      submittedAt: submittedAt.toISOString(),
      rank: i + 1,
      categoryId:
        categoryId ||
        mockCategories[Math.floor(Math.random() * mockCategories.length)].id,
    });
  }

  // Sort by score desc, then time asc (faster wins ties)
  return entries
    .sort((a, b) =>
      a.score !== b.score ? b.score - a.score : a.timeSec - b.timeSec
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
};

/* In-memory mutable store & helpers */

/**
 * Store is a deep copy of mocks so Admin CRUD can mutate at runtime.
 */
export const store: {
  categories: CategoryDTO[];
  questions: Record<string, QuestionDTO[]>;
} = {
  categories: mockCategories.map((c) => ({ ...c })),
  questions: Object.fromEntries(
    Object.entries(mockQuestions).map(([catId, arr]) => [
      catId,
      arr.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ ...o })), // defensive copy
      })),
    ])
  ),
};

/** Simple id generator for mock creates */
export const genId = (prefix = "id") =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(
    36
  )}`;

/**
 * Keep category.questionCount in sync with its questions.
 * Call this after create/update/delete questions in a category.
 */
export function recountCategory(categoryId: string) {
  const qs = store.questions[categoryId] || [];
  const cat = store.categories.find((c) => c.id === categoryId);
  if (cat) cat.questionCount = qs.length;
}
