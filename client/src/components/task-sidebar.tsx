import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Check, 
  Inbox, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Plus, 
  MoreHorizontal, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import type { TaskWithCategory } from "@shared/schema";
import { isToday, isTomorrow, isPast } from "date-fns";

interface TaskSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  activeCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

export function TaskSidebar({ 
  activeFilter, 
  onFilterChange, 
  activeCategory, 
  onCategoryChange 
}: TaskSidebarProps) {
  const { data: tasks = [] } = useTasks();
  const { data: categories = [] } = useCategories();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter counts
  const getFilterCount = (filterType: string): number => {
    switch (filterType) {
      case "all":
        return totalTasks;
      case "today":
        return tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          isToday(new Date(task.dueDate))
        ).length;
      case "upcoming":
        return tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          (isTomorrow(new Date(task.dueDate)) || 
           (new Date(task.dueDate) > new Date() && !isToday(new Date(task.dueDate))))
        ).length;
      case "completed":
        return completedTasks;
      default:
        return 0;
    }
  };

  const getCategoryCount = (categoryId: string): number => {
    return tasks.filter(task => task.categoryId === categoryId).length;
  };

  const navigationItems = [
    { id: "all", label: "All Tasks", icon: Inbox, count: getFilterCount("all") },
    { id: "today", label: "Today", icon: Calendar, count: getFilterCount("today") },
    { id: "upcoming", label: "Upcoming", icon: Clock, count: getFilterCount("upcoming") },
    { id: "completed", label: "Completed", icon: CheckCircle, count: getFilterCount("completed") },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Check className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900" data-testid="title-app">
              TaskFlow
            </h1>
            <p className="text-xs text-slate-500">Stay organized, stay productive</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-slate-900" data-testid="stat-total">
              {totalTasks}
            </div>
            <div className="text-xs text-slate-500">Total Tasks</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600" data-testid="stat-completed">
              {completedTasks}
            </div>
            <div className="text-xs text-slate-500">Completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-medium text-slate-700" data-testid="stat-percentage">
              {progressPercentage}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
            data-testid="progress-tasks"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onFilterChange(item.id)}
                className={cn(
                  "w-full justify-start text-left font-medium",
                  isActive 
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1">{item.label}</span>
                <Badge 
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    "text-xs",
                    isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                  )}
                  data-testid={`count-${item.id}`}
                >
                  {item.count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Categories */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Categories
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
              data-testid="button-add-category"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-1">
            {categories.map((category) => {
              const count = getCategoryCount(category.id);
              const isActive = activeCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  onClick={() => onCategoryChange(category.id)}
                  className={cn(
                    "w-full justify-start text-left",
                    isActive 
                      ? "bg-slate-50 text-slate-900" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                  data-testid={`category-${category.id}`}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1">{category.name}</span>
                  <span 
                    className="text-xs text-slate-400"
                    data-testid={`count-category-${category.id}`}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-slate-300 to-slate-400 text-slate-600">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div 
              className="text-sm font-medium text-slate-900 truncate"
              data-testid="text-user-name"
            >
              TaskFlow User
            </div>
            <div 
              className="text-xs text-slate-500 truncate"
              data-testid="text-user-email"
            >
              user@taskflow.app
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            data-testid="button-user-menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
