"use client"

import type React from "react"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useCategories } from "@/hooks/useQueries"
import { useToast } from "@/hooks/use-toast"
import { adminCategories } from "@/lib/api-client"
import type { CategoryDTO } from "@/types/quiz"

export function useAdminCategories() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // categories list
  const { data: categories = [], isLoading } = useCategories()

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryDTO | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#6366F1",
    icon: "📚",
  })

  function openEdit(cat: CategoryDTO) {
    setEditing(cat)
    setEditForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      color: cat.color || "#6366F1",
      icon: cat.icon || "📚",
    })
    setEditOpen(true)
  }

  async function createCategory() {
    const created = await adminCategories.create({
      name: "New Category",
      slug: `cat-${Date.now()}`,
      description: "Category created by admin",
      icon: "🆕",
      color: "#22C55E",
    })
    toast({ title: "Created", description: created.name })
    await queryClient.invalidateQueries({ queryKey: ["categories"] })
    if (!selectedCategory) setSelectedCategory(created.id)
  }

  async function submitEdit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!editing) return
    const updated = await adminCategories.update(editing.id, {
      name: editForm.name,
      slug: editForm.slug,
      description: editForm.description,
      color: editForm.color,
      icon: editForm.icon,
    })
    toast({ title: "Updated", description: updated.name })
    setEditOpen(false)
    setEditing(null)
    await queryClient.invalidateQueries({ queryKey: ["categories"] })
  }

  async function deleteCategory(categoryId: string) {
    const categoryToDelete = categories.find((cat) => cat.id === categoryId)
    const categoryName = categoryToDelete?.name || "Unknown Category"

    await adminCategories.delete(categoryId)
    toast({ title: "Deleted", description: categoryName })
    await queryClient.invalidateQueries({ queryKey: ["categories"] })
    if (selectedCategory === categoryId) {
      setSelectedCategory("")
    }
  }

  return {
    // data
    categories,
    isLoading,
    selectedCategory,
    setSelectedCategory,

    // category edit dialog
    editOpen,
    setEditOpen,
    editing,
    setEditing,
    editForm,
    setEditForm,
    openEdit,
    submitEdit,

    // actions
    createCategory,
    deleteCategory,
  }
}
