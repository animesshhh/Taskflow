import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TaskWithCategory, InsertTask, UpdateTask } from "@shared/schema";

export function useTasks() {
  return useQuery<TaskWithCategory[]>({
    queryKey: ["/api/tasks"],
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: InsertTask): Promise<TaskWithCategory> => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, task }: { id: string; task: UpdateTask }): Promise<TaskWithCategory> => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<TaskWithCategory> => {
      const response = await apiRequest("POST", `/api/tasks/${id}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskIds: string[]): Promise<void> => {
      await apiRequest("POST", "/api/tasks/reorder", { taskIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}
