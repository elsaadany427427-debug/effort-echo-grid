import { FilterPeriod, FilterCategory, TASK_CATEGORIES, DashboardFilters } from '@/types/dashboard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function DashboardFiltersComponent({ filters, onFiltersChange }: DashboardFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={filters.period}
        onValueChange={(value: FilterPeriod) => onFiltersChange({ ...filters, period: value })}
      >
        <SelectTrigger className="w-32 bg-secondary/50 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(value: FilterCategory) => onFiltersChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-40 bg-secondary/50 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All Categories</SelectItem>
          {TASK_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
