import { Clock, Zap, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  totalHoursWeekly: number;
  aiTimeSaved: number;
  activeStories: number;
  daysUntilTarget: number;
}

export function MetricsCards({ 
  totalHoursWeekly, 
  aiTimeSaved, 
  activeStories, 
  daysUntilTarget 
}: MetricsCardsProps) {
  const isHoursOnTrack = totalHoursWeekly >= 25 && totalHoursWeekly <= 40;

  const metrics = [
    {
      title: 'Weekly Hours',
      value: totalHoursWeekly.toFixed(1),
      suffix: 'h',
      icon: Clock,
      color: isHoursOnTrack ? 'text-chart-teal' : 'text-status-warning',
      bgColor: isHoursOnTrack ? 'bg-chart-teal/10' : 'bg-status-warning/10',
      description: isHoursOnTrack ? 'On track (25-40h)' : 'Outside target range'
    },
    {
      title: 'AI Time Saved',
      value: aiTimeSaved.toFixed(1),
      suffix: 'h',
      icon: Zap,
      color: 'text-chart-amber',
      bgColor: 'bg-chart-amber/10',
      description: '30% efficiency boost'
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
    {
      title: 'Days to Goal',
      value: daysUntilTarget.toString(),
      suffix: '',
      icon: Target,
      color: 'text-chart-rose',
      bgColor: 'bg-chart-rose/10',
      description: 'Until June 2026'
    }
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
    </div>
  );
}
