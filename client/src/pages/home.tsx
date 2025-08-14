import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";
import { TaskSidebar } from "@/components/task-sidebar";
import { TaskHeader } from "@/components/task-header";
import { TaskFilters } from "@/components/task-filters";
import { QuickAddTask } from "@/components/quick-add-task";
import { TaskItem } from "@/components/task-item";
import { TaskModal } from "@/components/task-modal";
import { useTasks, useDeleteTask, useToggleTask, useReorderTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { TaskWithCategory } from "@shared/schema";
import { isToday, isTomorrow, isPast } from "date-fns";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState("created");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithCategory | null>(null);
  const [taskFilter, setTaskFilter] = useState("all");

  const { data: tasks = [], isLoading } = useTasks();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();
  const reorderTasks = useReorderTasks();
  const { toast } = useToast();

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeCategory) {
      filtered = filtered.filter(task => task.categoryId === activeCategory);
    }

    // Apply main navigation filter
    switch (activeFilter) {
      case "today":
        filtered = filtered.filter(task => 
          !task.completed && 
          task.dueDate && 
          isToday(new Date(task.dueDate))
        );
        break;
      case "upcoming":
        filtered = filtered.filter(task => 
          !task.completed && 
          task.dueDate && 
          (isTomorrow(new Date(task.dueDate)) || 
           (new Date(task.dueDate) > new Date() && !isToday(new Date(task.dueDate))))
        );
        break;
      case "completed":
        filtered = filtered.filter(task => task.completed);
        break;
    }

    // Apply task-level filters
    switch (taskFilter) {
      case "pending":
        filtered = filtered.filter(task => !task.completed);
        break;
      case "overdue":
        filtered = filtered.filter(task => 
          !task.completed && 
          task.dueDate && 
          isPast(new Date(task.dueDate))
        );
        break;
      case "high-priority":
        filtered = filtered.filter(task => task.priority === "high");
        break;
    }

    // Sort tasks
    switch (sortBy) {
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]);
        break;
      case "dueDate":
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case "completed":
        filtered.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
        break;
      default: // created
        filtered.sort((a, b) => a.position - b.position);
    }

    return filtered;
  }, [tasks, searchQuery, activeCategory, activeFilter, taskFilter, sortBy]);

  const getViewTitle = () => {
    if (activeCategory) {
      const category = tasks.find(t => t.categoryId === activeCategory)?.category;
      return `${category?.name || 'Category'} Tasks`;
    }
    
    switch (activeFilter) {
      case "today": return "Today's Tasks";
      case "upcoming": return "Upcoming Tasks";
      case "completed": return "Completed Tasks";
      default: return "All Tasks";
    }
  };

  const getViewDescription = () => {
    if (activeCategory) {
      return "Tasks in this category";
    }
    
    switch (activeFilter) {
      case "today": return "Tasks due today";
      case "upcoming": return "Tasks coming up";
      case "completed": return "Tasks you've completed";
      default: return "Manage all your tasks in one place";
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleBulkComplete = async () => {
    try {
      await Promise.all(
        Array.from(selectedTasks).map(taskId => toggleTask.mutateAsync(taskId))
      );
      setSelectedTasks(new Set());
      toast({
        title: `${selectedTasks.size} tasks completed`,
        description: "Great job staying productive!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedTasks).map(taskId => deleteTask.mutateAsync(taskId))
      );
      setSelectedTasks(new Set());
      toast({
        title: `${selectedTasks.size} tasks deleted`,
        description: "Tasks have been permanently removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: TaskWithCategory) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleReorder = async (reorderedTasks: TaskWithCategory[]) => {
    try {
      const taskIds = reorderedTasks.map(task => task.id);
      await reorderTasks.mutateAsync(taskIds);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTaskDragStart = (e: React.DragEvent, task: TaskWithCategory, index: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { taskId, index: sourceIndex } = dragData;
      
      if (sourceIndex === targetIndex) return;
      
      const newTasks = [...filteredTasks];
      const [draggedTask] = newTasks.splice(sourceIndex, 1);
      newTasks.splice(targetIndex, 0, draggedTask);
      
      await handleReorder(newTasks);
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-72 bg-white border-r border-slate-200 animate-pulse">
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <TaskSidebar
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter);
          setActiveCategory(undefined);
        }}
        activeCategory={activeCategory}
        onCategoryChange={(categoryId) => {
          setActiveCategory(categoryId);
          setActiveFilter("all");
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TaskHeader
          title={getViewTitle()}
          description={getViewDescription()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <QuickAddTask />

            <div className="mb-6">
              <TaskFilters
                activeFilter={taskFilter}
                onFilterChange={setTaskFilter}
                selectedCount={selectedTasks.size}
                onBulkComplete={handleBulkComplete}
                onBulkDelete={handleBulkDelete}
              />
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-state">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {searchQuery ? "No tasks found" : "No tasks yet"}
                </h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  {searchQuery 
                    ? `No tasks match your search for "${searchQuery}"`
                    : "Start by creating your first task above. You can add due dates, priorities, and categories to stay organized."
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setShowTaskModal(true)}
                    data-testid="button-create-first-task"
                  >
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3" data-testid="task-list">
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    onDragOver={handleTaskDragOver}
                    onDrop={(e) => handleTaskDrop(e, index)}
                  >
                    <TaskItem
                      task={task}
                      isSelected={selectedTasks.has(task.id)}
                      onSelect={handleTaskSelect}
                      onEdit={handleEditTask}
                      onDragStart={(e) => handleTaskDragStart(e, task, index)}
                      onDragEnd={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => {
          setEditingTask(null);
          setShowTaskModal(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-500 hover:bg-blue-600"
        size="lg"
        data-testid="button-floating-add"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Task Modal */}
      <TaskModal
        open={showTaskModal}
        onOpenChange={(open) => {
          setShowTaskModal(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
      />
    </div>
  );
}
