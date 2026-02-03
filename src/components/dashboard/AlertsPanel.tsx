import { AlertTriangle, Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: string[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-4 border-status-warning/30 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-status-warning" />
        <h3 className="font-semibold text-sm">Notifications</h3>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div 
            key={index}
            className="flex items-start gap-2 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20"
          >
            <AlertTriangle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{alert}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
