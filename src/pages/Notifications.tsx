import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, Clock, Target, Zap, BookOpen } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays } from 'date-fns';

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  icon: React.ElementType;
}

const Notifications = () => {
  const { tasks, computeGoalProgress, isLoaded } = useDashboardData();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const now = new Date();
  
  // Weekly tasks
  const weeklyTasks = tasks.filter(task => {
    const taskDate = parseISO(task.date);
    return isWithinInterval(taskDate, {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 })
    });
  });

  // Monthly tasks
  const monthlyTasks = tasks.filter(task => {
    const taskDate = parseISO(task.date);
    return isWithinInterval(taskDate, {
      start: startOfMonth(now),
      end: endOfMonth(now)
    });
  });

  const totalWeeklyHours = weeklyTasks.reduce((sum, t) => sum + t.hours, 0);
  const totalMonthlyHours = monthlyTasks.reduce((sum, t) => sum + t.hours, 0);
  const ownershipTasksThisWeek = weeklyTasks.filter(t => t.ownership);
  const aiTasksThisWeek = weeklyTasks.filter(t => t.aiUsed);
  const completedTasksThisWeek = weeklyTasks.filter(t => t.completed);
  
  // Goal progress
  const goalsWithProgress = computeGoalProgress();
  const behindGoals = goalsWithProgress.filter(g => {
    const percentage = (g.currentProgress / g.targetValue) * 100;
    return percentage < 50;
  });
  const atRiskGoals = goalsWithProgress.filter(g => {
    const percentage = (g.currentProgress / g.targetValue) * 100;
    return percentage >= 50 && percentage < 80;
  });

  // Days until target
  const targetDate = new Date('2026-06-01');
  const daysUntilTarget = differenceInDays(targetDate, now);

  // Generate all alerts
  const alerts: Alert[] = [];

  // Weekly hours alerts
  if (totalWeeklyHours < 25) {
    alerts.push({
      id: 'weekly-hours-low',
      type: 'danger',
      title: 'Weekly Hours Below Target',
      message: `You've logged ${totalWeeklyHours.toFixed(1)}h this week. Target minimum is 25h.`,
      icon: Clock
    });
  } else if (totalWeeklyHours > 40) {
    alerts.push({
      id: 'weekly-hours-high',
      type: 'warning',
      title: 'Weekly Hours Exceeding Target',
      message: `You've logged ${totalWeeklyHours.toFixed(1)}h this week. Consider maintaining work-life balance (target: 25-40h).`,
      icon: Clock
    });
  } else {
    alerts.push({
      id: 'weekly-hours-ok',
      type: 'success',
      title: 'Weekly Hours On Track',
      message: `You've logged ${totalWeeklyHours.toFixed(1)}h this week. You're within the target range (25-40h).`,
      icon: Clock
    });
  }

  // Ownership tasks alert
  if (ownershipTasksThisWeek.length === 0) {
    alerts.push({
      id: 'no-ownership',
      type: 'warning',
      title: 'No Ownership Tasks This Week',
      message: 'You haven\'t logged any ownership tasks this week. Consider taking ownership of a story.',
      icon: Target
    });
  } else {
    alerts.push({
      id: 'ownership-ok',
      type: 'success',
      title: 'Ownership Tasks Logged',
      message: `You've logged ${ownershipTasksThisWeek.length} ownership task(s) this week.`,
      icon: Target
    });
  }

  // AI usage alert
  if (aiTasksThisWeek.length === 0 && weeklyTasks.length > 0) {
    alerts.push({
      id: 'no-ai',
      type: 'info',
      title: 'Consider Using AI Assistance',
      message: 'No AI-assisted tasks logged this week. AI tools can boost your productivity by 30%.',
      icon: Zap
    });
  } else if (aiTasksThisWeek.length > 0) {
    const aiPercentage = (aiTasksThisWeek.length / weeklyTasks.length) * 100;
    alerts.push({
      id: 'ai-usage',
      type: 'success',
      title: 'AI Assistance Active',
      message: `${aiPercentage.toFixed(0)}% of your tasks this week used AI assistance.`,
      icon: Zap
    });
  }

  // Completion rate alert
  if (weeklyTasks.length > 0) {
    const completionRate = (completedTasksThisWeek.length / weeklyTasks.length) * 100;
    if (completionRate < 50) {
      alerts.push({
        id: 'completion-low',
        type: 'warning',
        title: 'Low Completion Rate',
        message: `Only ${completionRate.toFixed(0)}% of tasks completed this week. Mark tasks as done when finished.`,
        icon: CheckCircle
      });
    }
  }

  // Goals behind schedule
  behindGoals.forEach(goal => {
    alerts.push({
      id: `goal-behind-${goal.id}`,
      type: 'danger',
      title: `Goal Behind: ${goal.title}`,
      message: `Progress: ${goal.currentProgress}/${goal.targetValue} ${goal.unit} (${((goal.currentProgress / goal.targetValue) * 100).toFixed(0)}%)`,
      icon: AlertTriangle
    });
  });

  // Goals at risk
  atRiskGoals.forEach(goal => {
    alerts.push({
      id: `goal-risk-${goal.id}`,
      type: 'warning',
      title: `Goal At Risk: ${goal.title}`,
      message: `Progress: ${goal.currentProgress}/${goal.targetValue} ${goal.unit} (${((goal.currentProgress / goal.targetValue) * 100).toFixed(0)}%)`,
      icon: AlertTriangle
    });
  });

  // Days until target
  if (daysUntilTarget <= 90) {
    alerts.push({
      id: 'deadline-near',
      type: 'warning',
      title: 'Deadline Approaching',
      message: `Only ${daysUntilTarget} days until your June 2026 target date.`,
      icon: Clock
    });
  }

  // Monthly summary
  alerts.push({
    id: 'monthly-summary',
    type: 'info',
    title: 'Monthly Progress',
    message: `This month: ${totalMonthlyHours.toFixed(1)}h logged across ${monthlyTasks.length} tasks.`,
    icon: BookOpen
  });

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'border-l-4 border-l-destructive bg-destructive/10';
      case 'warning':
        return 'border-l-4 border-l-status-warning bg-status-warning/10';
      case 'success':
        return 'border-l-4 border-l-status-success bg-status-success/10';
      case 'info':
      default:
        return 'border-l-4 border-l-primary bg-primary/10';
    }
  };

  const getIconColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'text-destructive';
      case 'warning':
        return 'text-status-warning';
      case 'success':
        return 'text-status-success';
      case 'info':
      default:
        return 'text-primary';
    }
  };

  const dangerAlerts = alerts.filter(a => a.type === 'danger');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const successAlerts = alerts.filter(a => a.type === 'success');
  const infoAlerts = alerts.filter(a => a.type === 'info');

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 glow-primary">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications & Alerts</h1>
              <p className="text-sm text-muted-foreground">
                {alerts.length} alerts • {dangerAlerts.length} critical • {warningAlerts.length} warnings
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{dangerAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-status-warning">{warningAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-status-success">{successAlerts.length}</p>
            <p className="text-xs text-muted-foreground">On Track</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{infoAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Info</p>
          </div>
        </div>

        {/* Critical Alerts */}
        {dangerAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              Requires Immediate Attention
            </h2>
            {dangerAlerts.map(alert => (
              <div key={alert.id} className={`glass-card rounded-xl p-4 ${getAlertStyles(alert.type)}`}>
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning Alerts */}
        {warningAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Badge className="bg-status-warning/20 text-status-warning border-0">Warning</Badge>
              Needs Attention
            </h2>
            {warningAlerts.map(alert => (
              <div key={alert.id} className={`glass-card rounded-xl p-4 ${getAlertStyles(alert.type)}`}>
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success Alerts */}
        {successAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Badge className="bg-status-success/20 text-status-success border-0">On Track</Badge>
              Looking Good
            </h2>
            {successAlerts.map(alert => (
              <div key={alert.id} className={`glass-card rounded-xl p-4 ${getAlertStyles(alert.type)}`}>
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Alerts */}
        {infoAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-0">Info</Badge>
              Summary & Insights
            </h2>
            {infoAlerts.map(alert => (
              <div key={alert.id} className={`glass-card rounded-xl p-4 ${getAlertStyles(alert.type)}`}>
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
