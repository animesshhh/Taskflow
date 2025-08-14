import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MoreHorizontal, GripVertical, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToggleTask, useDeleteTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { TaskWithCategory } from "@shared/schema";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface TaskItemProps {
  task: TaskWithCategory;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  onEdit?: (task: TaskWithCategory) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function TaskItem({ 
  task, 
  isSelected = false, 
  onSelect, 
  onEdit, 
  onDragStart, 
  onDragEnd 
}: TaskItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();
  const dragRef = useRef<HTMLDivElement>(null);

  const priorityColors = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-slate-400",
  };

  const priorityBadgeColors = {
    high: "bg-red-50 text-red-600",
    medium: "bg-amber-50 text-amber-600",
    low: "bg-slate-50 text-slate-600",
  };

  const handleToggle = async () => {
    try {
      await toggleTask.mutateAsync(task.id);
      toast({
        title: task.completed ? "Task reopened" : "Task completed!",
        description: task.completed ? "Task marked as pending" : "Great job staying productive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({
        title: "Task deleted",
        description: "Task has been permanently removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDueDate = (dueDate: Date | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    if (isToday(date)) return "Due Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return `Overdue (${format(date, "MMM d")})`;
    return format(date, "MMM d");
  };

  const getDueDateStyle = (dueDate: Date | null) => {
    if (!dueDate) return "bg-slate-100 text-slate-600";
    
    const date = new Date(dueDate);
    if (isPast(date) && !task.completed) return "bg-red-50 text-red-600";
    if (isToday(date)) return "bg-orange-50 text-orange-600";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up cursor-pointer",
        task.completed && "opacity-60",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      data-testid={`task-${task.id}`}
      onClick={() => onSelect?.(task.id)}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className={cn(
            "mt-1 w-5 h-5 rounded-full border-2 transition-all flex-shrink-0 flex items-center justify-center",
            task.completed
              ? "bg-emerald-500 border-emerald-500 animate-check"
              : "border-slate-300 hover:border-blue-500"
          )}
          data-testid={`button-toggle-${task.id}`}
          disabled={toggleTask.isPending}
        >
          {task.completed && <Check className="h-3 w-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(task);
                }}
                className={cn(
                  "text-base font-medium cursor-pointer transition-colors",
                  task.completed
                    ? "text-slate-500 line-through"
                    : "text-slate-900 group-hover:text-blue-600"
                )}
                data-testid={`text-task-title-${task.id}`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={cn(
                    "text-sm mt-1",
                    task.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-500"
                  )}
                  data-testid={`text-task-description-${task.id}`}
                >
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-3">
              <div
                className={cn("w-2 h-2 rounded-full", priorityColors[task.priority as keyof typeof priorityColors])}
                title={`${task.priority} priority`}
                data-testid={`indicator-priority-${task.id}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-all"
                data-testid={`button-menu-${task.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              {task.category && (
                <Badge
                  className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-600"
                  data-testid={`badge-category-${task.id}`}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: task.category.color }}
                  />
                  <span>{task.category.name}</span>
                </Badge>
              )}

              {task.dueDate && (
                <Badge
                  className={cn("inline-flex items-center space-x-1.5", getDueDateStyle(task.dueDate))}
                  data-testid={`badge-due-date-${task.id}`}
                >
                  <Clock className="h-3 w-3" />
                  <span>{formatDueDate(task.dueDate)}</span>
                </Badge>
              )}

              {task.completed && (
                <Badge className="bg-emerald-50 text-emerald-600" data-testid={`badge-completed-${task.id}`}>
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <div
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 transition-all cursor-move"
              data-testid={`handle-drag-${task.id}`}
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick menu */}
      {showMenu && (
        <div className="absolute top-full right-4 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            data-testid={`menu-edit-${task.id}`}
          >
            Edit task
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            data-testid={`menu-delete-${task.id}`}
          >
            Delete task
          </button>
        </div>
      )}
    </div>
  );
}
