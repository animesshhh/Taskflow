import { type Task, type InsertTask, type UpdateTask, type Category, type InsertCategory, type TaskWithCategory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Task operations
  getTasks(): Promise<TaskWithCategory[]>;
  getTask(id: string): Promise<TaskWithCategory | undefined>;
  createTask(task: InsertTask): Promise<TaskWithCategory>;
  updateTask(id: string, task: UpdateTask): Promise<TaskWithCategory | undefined>;
  deleteTask(id: string): Promise<boolean>;
  toggleTaskComplete(id: string): Promise<TaskWithCategory | undefined>;
  reorderTasks(taskIds: string[]): Promise<void>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private categories: Map<string, Category>;

  constructor() {
    this.tasks = new Map();
    this.categories = new Map();
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories = [
      { id: "work", name: "Work", color: "#3b82f6" }, // blue-500
      { id: "personal", name: "Personal", color: "#10b981" }, // emerald-500
      { id: "shopping", name: "Shopping", color: "#f59e0b" }, // amber-500
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        ...cat,
        createdAt: new Date(),
      };
      this.categories.set(cat.id, category);
    });
  }

  async getTasks(): Promise<TaskWithCategory[]> {
    const tasksArray = Array.from(this.tasks.values());
    return tasksArray
      .sort((a, b) => a.position - b.position)
      .map(task => ({
        ...task,
        category: task.categoryId ? this.categories.get(task.categoryId) : undefined,
      }));
  }

  async getTask(id: string): Promise<TaskWithCategory | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    return {
      ...task,
      category: task.categoryId ? this.categories.get(task.categoryId) : undefined,
    };
  }

  async createTask(insertTask: InsertTask): Promise<TaskWithCategory> {
    const id = randomUUID();
    const now = new Date();
    
    // Get the highest position and increment
    const allTasks = Array.from(this.tasks.values());
    const maxPosition = allTasks.reduce((max, task) => Math.max(max, task.position), 0);
    
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description || null,
      completed: insertTask.completed || false,
      priority: insertTask.priority || "medium",
      categoryId: insertTask.categoryId || null,
      dueDate: insertTask.dueDate || null,
      position: insertTask.position !== undefined ? insertTask.position : maxPosition + 1,
      createdAt: now,
      updatedAt: now,
    };
    
    this.tasks.set(id, task);
    
    return {
      ...task,
      category: task.categoryId ? this.categories.get(task.categoryId) : undefined,
    };
  }

  async updateTask(id: string, updateTask: UpdateTask): Promise<TaskWithCategory | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask: Task = {
      ...existingTask,
      ...updateTask,
      id, // Ensure id doesn't change
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    
    return {
      ...updatedTask,
      category: updatedTask.categoryId ? this.categories.get(updatedTask.categoryId) : undefined,
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async toggleTaskComplete(id: string): Promise<TaskWithCategory | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    
    return {
      ...updatedTask,
      category: updatedTask.categoryId ? this.categories.get(updatedTask.categoryId) : undefined,
    };
  }

  async reorderTasks(taskIds: string[]): Promise<void> {
    taskIds.forEach((taskId, index) => {
      const task = this.tasks.get(taskId);
      if (task) {
        this.tasks.set(taskId, {
          ...task,
          position: index,
          updatedAt: new Date(),
        });
      }
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      name: insertCategory.name,
      color: insertCategory.color,
      createdAt: new Date(),
    };

    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated: Category = {
      ...existing,
      ...updateCategory,
    };

    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    // First, remove category from all tasks that use it
    const tasks = Array.from(this.tasks.values());
    for (const task of tasks) {
      if (task.categoryId === id) {
        this.tasks.set(task.id, { ...task, categoryId: null });
      }
    }
    
    return this.categories.delete(id);
  }
}

export const storage = new MemStorage();
