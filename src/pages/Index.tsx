import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { GoalCards } from '@/components/dashboard/GoalCards';
import { TaskTable } from '@/components/dashboard/TaskTable';
import { TaskModal } from '@/components/dashboard/TaskModal';
import { GoalModal, GoalWithMeta } from '@/components/dashboard/GoalModal';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { DashboardFiltersComponent } from '@/components/dashboard/DashboardFilters';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/dashboard';

const Index = () => {
  const {
    tasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    saveGoal,
    deleteGoal,
    computeMetrics,
    computeGoalProgress,
    getAlerts,
    isLoaded
  } = useDashboardData();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalWithMeta | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const metrics = computeMetrics();
  const goalsWithProgress = computeGoalProgress();
  const alerts = getAlerts();

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> | Task) => {
    if ('id' in taskData) {
      updateTask(taskData.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateTask(id, { completed });
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setGoalModalOpen(true);
  };

  const handleEditGoal = (goal: GoalWithMeta) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 glow-primary">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Goal Tracker</h1>
              <p className="text-sm text-muted-foreground">Software Engineer Performance Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DashboardFiltersComponent filters={filters} onFiltersChange={setFilters} />
            <Button onClick={handleAddTask} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && <AlertsPanel alerts={alerts} />}

        {/* Metrics Row */}
        <MetricsCards
          totalHoursWeekly={metrics.totalHoursWeekly}
          aiTimeSaved={metrics.aiTimeSaved}
          activeStories={metrics.activeStories}
          daysUntilTarget={metrics.daysUntilTarget}
        />

        {/* Goal Cards */}
        <GoalCards 
          goals={goalsWithProgress} 
          onEditGoal={handleEditGoal}
          onAddGoal={handleAddGoal}
        />

        {/* Charts */}
        <DashboardCharts tasks={tasks} />

        {/* Task Table */}
        <TaskTable
          tasks={metrics.filteredTasks}
          onEdit={handleEditTask}
          onDelete={deleteTask}
          onToggleComplete={handleToggleComplete}
        />

        {/* Task Modal */}
        <TaskModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          onSave={handleSaveTask}
          task={editingTask}
        />

        {/* Goal Modal */}
        <GoalModal
          open={goalModalOpen}
          onClose={() => setGoalModalOpen(false)}
          onSave={saveGoal}
          onDelete={deleteGoal}
          goal={editingGoal}
        />
      </div>
    </div>
  );
};

export default Index;
