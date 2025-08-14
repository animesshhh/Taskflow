import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { insertTaskSchema } from "@shared/schema";
import type { TaskWithCategory, InsertTask, Priority } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithCategory | null;
}

export function TaskModal({ open, onOpenChange, task }: TaskModalProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: (task?.priority as Priority) || "medium",
      categoryId: task?.categoryId || "",
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    },
  });

  const isEditing = !!task;

  const handleSubmit = async (data: FormData) => {
    try {
      const taskData: InsertTask = {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        categoryId: data.categoryId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      };

      if (isEditing) {
        await updateTask.mutateAsync({ id: task.id, task: taskData });
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        await createTask.mutateAsync(taskData);
        toast({
          title: "Task created",
          description: "Your task has been added successfully.",
        });
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-task">
        <DialogHeader>
          <DialogTitle data-testid="title-modal">
            {isEditing ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="What needs to be done?" 
                      {...field} 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details..."
                      rows={3}
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-due-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }} 
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTask.isPending || updateTask.isPending}
                data-testid="button-save"
              >
                {isEditing ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
