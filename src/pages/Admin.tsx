"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"
import AdminHeader from "@/pages/admin-parts/AdminHeader"
import StatsCards from "@/pages/admin-parts/StatsCards"
import CategoryGrid from "@/pages/admin-parts/CategoryGrid"
import QuestionsPanel from "@/pages/admin-parts/QuestionsPanel"
import EditCategoryDialog from "@/pages/admin-parts/EditCategoryDialog"
import { EditQuestionDialog } from "@/pages/admin-parts/EditQuestionDialog"
import { useAdmin } from "@/pages/admin-parts/useAdmin"

export default function Admin() {
  const navigate = useNavigate()
  const {
    categories,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    questions,

    // category dialog
    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    openEdit,
    submitEdit,

    // question dialog
    qEditOpen,
    setQEditOpen,
    qForm,
    setQForm,
    openEditQuestion,
    submitEditQuestion,

    // actions
    createCategory,
    deleteCategory,
    createQuestion,
    deleteQuestion,

    // CSV/XLSX import/export
    importQuestionsCSV,
    exportQuestionsCSV,
  } = useAdmin()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onBack={() => navigate("/")} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-3xl font-bold">Quiz Administration</h1>
            <p className="text-muted-foreground">Manage categories, questions, and quiz content.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <StatsCards categoriesCount={categories?.length || 0} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-6">
                <CategoryGrid
                  categories={categories}
                  isLoading={!!isLoading}
                  onCreate={createCategory}
                  onEdit={openEdit}
                  onDelete={deleteCategory}
                />
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <QuestionsPanel
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  questions={questions}
                  onCreateQuestion={createQuestion}
                  onOpenEditQuestion={openEditQuestion}
                  onDeleteQuestion={deleteQuestion}
                  onImportCSV={importQuestionsCSV}
                  onExportCSV={exportQuestionsCSV}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Dialogs */}
      <EditCategoryDialog
        open={editOpen}
        setOpen={setEditOpen}
        form={editForm}
        setForm={setEditForm}
        onSubmit={submitEdit}
      />

      <EditQuestionDialog
        open={qEditOpen}
        setOpen={setQEditOpen}
        form={qForm}
        setForm={setQForm}
        onSubmit={submitEditQuestion}
      />
    </div>
  )
}
