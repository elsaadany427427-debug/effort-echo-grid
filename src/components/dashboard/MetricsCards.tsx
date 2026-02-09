import { useState } from 'react';
import { Clock, Zap, BookOpen, Target, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MetricsCardsProps {
  totalHoursFiltered: number;
  aiTimeSavedFiltered: number;
  activeStories: number;
  daysUntilTarget: number;
  periodLabel: string;
  targetDate: string;
  onTargetDateChange: (date: string) => void;
}

export function MetricsCards({ 
  totalHoursFiltered, 
  aiTimeSavedFiltered, 
  activeStories, 
  daysUntilTarget,
  periodLabel,
  targetDate,
  onTargetDateChange,
}: MetricsCardsProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const targetDateObj = parseISO(targetDate);

  const metrics = [
    {
      title: `${periodLabel} Hours`,
      value: totalHoursFiltered.toFixed(1),
      suffix: 'h',
      icon: Clock,
      color: 'text-chart-teal',
      bgColor: 'bg-chart-teal/10',
      description: `Total logged (${periodLabel.toLowerCase()})`
    },
    {
      title: 'AI Time Saved',
      value: aiTimeSavedFiltered.toFixed(1),
      suffix: 'h',
      icon: Zap,
      color: 'text-chart-amber',
      bgColor: 'bg-chart-amber/10',
      description: `30% efficiency (${periodLabel.toLowerCase()})`
    },
    {
      title: 'Active Stories',
      value: activeStories.toString(),
      suffix: '',
      icon: BookOpen,
      color: 'text-chart-violet',
      bgColor: 'bg-chart-violet/10',
      description: 'Ownership tasks'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.title} className="metric-card animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
              <p className={cn("text-3xl font-bold mt-1", metric.color)}>
                {metric.value}
                <span className="text-lg ml-0.5">{metric.suffix}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
            </div>
            <div className={cn("p-3 rounded-lg", metric.bgColor)}>
              <metric.icon className={cn("h-5 w-5", metric.color)} />
            </div>
          </div>
        </div>
      ))}

      {/* Days to Goal - editable */}
      <div className="metric-card animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-muted-foreground">Days to Goal</p>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDateObj}
                    onSelect={(date) => {
                      if (date) {
                        onTargetDateChange(format(date, 'yyyy-MM-dd'));
                        setDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className={cn("text-3xl font-bold mt-1 text-chart-rose")}>
              {daysUntilTarget}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Until {format(targetDateObj, 'MMM yyyy')}
            </p>
          </div>
          <div className={cn("p-3 rounded-lg bg-chart-rose/10")}>
            <Target className={cn("h-5 w-5 text-chart-rose")} />
          </div>
        </div>
      </div>
    </div>
  );
}
