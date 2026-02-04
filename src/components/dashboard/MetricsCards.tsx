import { Clock, Zap, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  totalHoursFiltered: number;
  aiTimeSavedFiltered: number;
  activeStories: number;
  daysUntilTarget: number;
  periodLabel: string;
}

export function MetricsCards({ 
  totalHoursFiltered, 
  aiTimeSavedFiltered, 
  activeStories, 
  daysUntilTarget,
  periodLabel
}: MetricsCardsProps) {
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
