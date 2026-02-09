import { FilterPeriod, FilterCategory, DashboardFilters } from '@/types/dashboard';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  categories: string[];
}

export function DashboardFiltersComponent({ filters, onFiltersChange, categories }: DashboardFiltersProps) {
  const selectedDate = filters.selectedDate ? parseISO(filters.selectedDate) : undefined;

  return (
    <div className="flex items-center gap-3">
      <Select
        value={filters.period}
        onValueChange={(value: FilterPeriod) => {
          const updated: DashboardFilters = { ...filters, period: value };
          if (value === 'day' && !filters.selectedDate) {
            updated.selectedDate = format(new Date(), 'yyyy-MM-dd');
          }
          onFiltersChange(updated);
        }}
      >
        <SelectTrigger className="w-32 bg-secondary/50 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="day">Day</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>

      {filters.period === 'day' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal bg-secondary/50 border-border",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Pick date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onFiltersChange({ ...filters, selectedDate: format(date, 'yyyy-MM-dd') });
                }
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}

      <Select
        value={filters.category}
        onValueChange={(value: FilterCategory) => onFiltersChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-40 bg-secondary/50 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
