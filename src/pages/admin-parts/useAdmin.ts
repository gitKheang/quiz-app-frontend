import { useState } from "react";
import { useAdminCategories } from "@/features/admin/hooks/useAdminCategories";
import { useAdminQuestions } from "@/features/admin/hooks/useAdminQuestions";

// keep Mode type so UI doesn’t break
export type Mode = "categories" | "questions";

export function useAdmin() {
  // categories (includes selectedCategory state)
  const cat = useAdminCategories();
  // questions depend on selected category
  const q = useAdminQuestions(cat.selectedCategory);

  // local UI state that spans both views
  const [mode, setMode] = useState<Mode>("categories");

  return {
    // data (same shape as before)
    categories: cat.categories,
    isLoading: cat.isLoading,
    selectedCategory: cat.selectedCategory,
    setSelectedCategory: cat.setSelectedCategory,
    questions: q.questions,
    setQuestions: q.setQuestions,

    // ui
    mode,
    setMode,

    // category edit dialog 
    editOpen: cat.editOpen,
    setEditOpen: cat.setEditOpen,
    editing: cat.editing,
    setEditing: cat.setEditing,
    editForm: cat.editForm,
    setEditForm: cat.setEditForm,
    openEdit: cat.openEdit,
    submitEdit: cat.submitEdit,

    // question dialog
    qEditOpen: q.qEditOpen,
    setQEditOpen: q.setQEditOpen,
    editingQ: q.editingQ,
    qForm: q.qForm,
    setQForm: q.setQForm,
    openEditQuestion: q.openEditQuestion,
    submitEditQuestion: q.submitEditQuestion,

    // actions 
    createCategory: cat.createCategory,
    deleteCategory: cat.deleteCategory,
    createQuestion: q.createQuestion,
    deleteQuestion: q.deleteQuestion,

    // import/export
    importQuestionsCSV: q.importQuestionsCSV,
    exportQuestionsCSV: q.exportQuestionsCSV,
  };
}
