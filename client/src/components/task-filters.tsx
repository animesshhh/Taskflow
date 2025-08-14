import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2 } from "lucide-react";

interface TaskFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedCount: number;
  onBulkComplete: () => void;
  onBulkDelete: () => void;
}

export function TaskFilters({ 
  activeFilter, 
  onFilterChange, 
  selectedCount, 
  onBulkComplete, 
  onBulkDelete 
}: TaskFiltersProps) {
  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "overdue", label: "Overdue" },
    { id: "high-priority", label: "High Priority" },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={
              activeFilter === filter.id
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                : "text-slate-600 hover:bg-slate-100"
            }
            data-testid={`filter-${filter.id}`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      
      {selectedCount > 0 && (
        <div 
          className="flex items-center space-x-2 animate-fade-in"
          data-testid="bulk-actions"
        >
          <Badge variant="secondary" data-testid="text-selected-count">
            {selectedCount} selected
          </Badge>
          <Button
            size="sm"
            onClick={onBulkComplete}
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            data-testid="button-bulk-complete"
          >
            <Check className="h-3 w-3 mr-1" />
            Complete
          </Button>
          <Button
            size="sm"
            onClick={onBulkDelete}
            className="bg-red-50 text-red-600 hover:bg-red-100"
            data-testid="button-bulk-delete"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
