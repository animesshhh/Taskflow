import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Flag, Tag } from "lucide-react";
import { useCreateTask } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import type { InsertTask } from "@shared/schema";

export function QuickAddTask() {
  const [title, setTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const createTask = useCreateTask();
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const task: InsertTask = {
        title: title.trim(),
        priority: "medium",
      };

      await createTask.mutateAsync(task);
      setTitle("");
      setIsExpanded(false);
      toast({
        title: "Task created",
        description: "Your task has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-500 transition-colors flex-shrink-0"
            data-testid="button-quick-add"
          />
          <Input
            type="text"
            placeholder="Add a new task... Press Enter to save"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 text-base border-none shadow-none p-0 focus-visible:ring-0"
            data-testid="input-quick-task"
          />
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50"
              title="Set due date"
              data-testid="button-due-date"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50"
              title="Set priority"
              data-testid="button-priority"
            >
              <Flag className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
              title="Choose category"
              data-testid="button-category"
            >
              <Tag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
