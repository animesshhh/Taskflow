import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, List, Grid, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskHeaderProps {
  title: string;
  description: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function TaskHeader({
  title,
  description,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: TaskHeaderProps) {
  const sortOptions = [
    { value: "created", label: "Date Created" },
    { value: "title", label: "Title" },
    { value: "priority", label: "Priority" },
    { value: "dueDate", label: "Due Date" },
    { value: "completed", label: "Status" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-900" data-testid="title-current-view">
            {title}
          </h2>
          <span className="text-sm text-slate-500" data-testid="text-view-description">
            {description}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 text-sm"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          </div>

          {/* View Toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={viewMode === "list" ? "bg-blue-50 text-blue-600" : ""}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={viewMode === "grid" ? "bg-blue-50 text-blue-600" : ""}
              data-testid="button-view-grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-sort">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={sortBy === option.value ? "bg-blue-50 text-blue-600" : ""}
                  data-testid={`sort-${option.value}`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
